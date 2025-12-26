
import { LOCAL_VOCABULARY } from '../data/vocabularyData';
import { WordCard, UnitDef, Announcement, GrammarTopic, Avatar, FrameDef, BackgroundDef, Badge } from '../types';
import { UNIT_ASSETS, AVATARS, FRAMES, BACKGROUNDS, BADGES } from '../data/assets';

// This service abstracts the data fetching logic.
// It now uses LOCAL_VOCABULARY for 100% offline support.

export const fetchAllWords = async (): Promise<Record<string, WordCard[]>> => {
    return LOCAL_VOCABULARY;
};

export const getVocabulary = async (): Promise<Record<string, WordCard[]>> => {
    return LOCAL_VOCABULARY;
};

export const getWordsForUnit = async (unitId: string): Promise<WordCard[]> => {
    // Check if it's an "All in One" unit (e.g., g12all or uAll)
    if (unitId.toLowerCase().endsWith('all')) {
        // Find which grade this unit belongs to
        const gradeEntry = Object.entries(UNIT_ASSETS).find(([_, units]) =>
            units.some(u => u.id === unitId)
        );

        if (gradeEntry) {
            const [grade, _] = gradeEntry;
            return getAllWordsForGrade(grade);
        }
    }

    const data = LOCAL_VOCABULARY[unitId];
    if (data) {
        return data.map(w => ({ ...w, unitId }));
    }
    return [];
};


export const getAllWordsForGrade = async (grade: string): Promise<WordCard[]> => {
    const vocabulary = await getVocabulary();
    const units = UNIT_ASSETS[grade];
    if (!units) return [];

    let allWords: WordCard[] = [];
    units.forEach(u => {
        if (vocabulary[u.id]) {
            allWords = [...allWords, ...vocabulary[u.id]];
        }
    });
    return allWords;
};


// Smart Distractor Logic - Moved here to decouple from data file
export const getSmartDistractors = (correctWord: WordCard, allWords: WordCard[], count: number = 3): WordCard[] => {
    // 1. Filter words with same context
    let sameContextWords = allWords.filter(w =>
        w.english !== correctWord.english &&
        w.turkish.trim().toLowerCase() !== correctWord.turkish.trim().toLowerCase() &&
        w.context === correctWord.context
    );

    // 2. Filter other words (if not enough same context)
    let otherWords = allWords.filter(w =>
        w.english !== correctWord.english &&
        w.turkish.trim().toLowerCase() !== correctWord.turkish.trim().toLowerCase() &&
        w.context !== correctWord.context
    );

    const selectedDistractors: WordCard[] = [];
    const seenMeanings = new Set<string>();
    seenMeanings.add(correctWord.turkish.trim().toLowerCase());

    // Helper to shuffle and pick
    const addFromPool = (pool: WordCard[]) => {
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        for (const d of shuffled) {
            if (selectedDistractors.length >= count) break;
            const meaning = d.turkish.trim().toLowerCase();
            if (!seenMeanings.has(meaning)) {
                selectedDistractors.push(d);
                seenMeanings.add(meaning);
            }
        }
    };

    addFromPool(sameContextWords);

    if (selectedDistractors.length < count) {
        addFromPool(otherWords);
    }

    return selectedDistractors;
};

// FIX: Added missing data access functions
export const getUnitAssets = (): Record<string, UnitDef[]> => {
    return UNIT_ASSETS;
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
    return [];
};

export const fetchDynamicContent = async () => {
    // Placeholder for future dynamic content fetching
    return Promise.resolve();
};

export const getGrammarForUnit = async (unitId: string): Promise<GrammarTopic[]> => {
    try {
        // If unitId follows grade pattern like 'g9u1' (g<grade>...), try to load only that grade file
        const gradeMatch = unitId.match(/^g(\d{1,2})/i);
        if (gradeMatch) {
            const grade = gradeMatch[1];
            try {
                const mod = await import(`../data/grammar_g${grade}.tsx`);
                const key = `GRAMMAR_G${grade}`;
                const content = (mod as any)[key];
                if (content && content[unitId]) return content[unitId];
            } catch (e) {
                // fallthrough to generic loader
            }
        }

        // General content (A1..C1) or fallback to generic grammar
        if (unitId.toLowerCase().startsWith('gen')) {
            const mod = await import('../data/grammar_gen');
            return (mod as any).GRAMMAR_GEN[unitId] || [];
        }

        // As a last resort, import the combined grammar content (smaller chance but safe)
        const all = await import('../data/grammarContent');
        return all.getGrammarForUnit(unitId);
    } catch (e) {
        console.warn('Failed to load grammar content dynamically', e);
        return [];
    }
};

export const getAvatars = (): Avatar[] => AVATARS;
export const getFrames = (): FrameDef[] => FRAMES;
export const getBackgrounds = (): BackgroundDef[] => BACKGROUNDS;
export const getBadges = (): Badge[] => BADGES;
