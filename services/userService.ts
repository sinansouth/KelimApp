import { Quest, Badge, GradeLevel, ThemeType, UserProfile, UserStats } from '../types';
export type { UserProfile, UserStats };
import { BADGES, UNIT_ASSETS, FRAMES, BACKGROUNDS } from '../data/assets';
import { getVocabulary } from './contentService';

export interface AppSettings {
    soundEnabled: boolean;
    theme: ThemeType;
}

export interface SRSData {
    box: number;
    nextReview: number;
}

export interface SRSData {
    box: number;
    nextReview: number;
}

// --- XP & Leveling Configuration (OPTIMIZED & BALANCED) ---
export const XP_GAINS = {
    flashcard_view: 5,         // Was 2
    flashcard_memorize: 25,    // Was 15

    // Quiz difficulties
    quiz_correct: {
        relaxed: 15,
        easy: 20,
        normal: 25,
        hard: 35,
        impossible: 50
    },

    perfect_quiz_bonus: 200,   // Was 100

    // Games
    matching_pair: 15,          // Was 8
    maze_level: 100,            // Was 50
    // Wordsearch (Bulmaca) XP by difficulty
    wordsearch_word: {
        easy: 8,
        medium: 12,
        hard: 18
    },


    // Quests
    daily_quest_easy: 250,
    daily_quest_medium: 500,
    daily_quest_hard: 750,
    daily_quest_completion_bonus: 500, // Was 150

    // Duel
    duel_win: 100,
    duel_tie: 50,
    duel_loss: 20
};

// Level Formula: Adjusted for faster early levels
// XP = 75 * (Level^2)
export const getXPForLevel = (level: number): number => Math.floor(Math.pow(level, 2) * 75);

export const getLevelForXP = (xp: number): number => Math.floor(Math.sqrt(Math.max(0, xp) / 75));


// --- TIME UTILITIES ---

// --- TIME UTILITIES ---

export const getTurkeyTime = (): Date => {
    // Returns a Date object representing the current time in Turkey
    const now = new Date();
    const turkeyTimeStr = now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' });
    return new Date(turkeyTimeStr);
};

// Returns YYYY-MM-DD based on Turkey time (For Streak)
export const getTodayDateString = (): string => {
    const d = new Date();
    // Use en-CA for YYYY-MM-DD format
    return d.toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
};

export const getTurkeyTimestamp = (): number => {
    return getTurkeyTime().getTime();
};

const generateFriendCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const DEFAULT_PROFILE: UserProfile = {
    name: '',
    grade: '',
    avatar: '🧑‍🎓',
    frame: 'frame_none',
    background: 'bg_default',
    theme: 'dark',
    purchasedThemes: ['light', 'dark'],
    purchasedFrames: ['frame_none'],
    purchasedBackgrounds: ['bg_default'],
    inventory: { streakFreezes: 0 },
    isGuest: true,
    friendCode: '',
    isAdmin: false
};

// Calculates Week ID based on Turkey Time (UTC+3) - ISO 8601 standard
// New week starts on Monday.
export const getWeekId = () => {
    const date = getTurkeyTime();
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    const week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return `${date.getFullYear()}-W${(1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)).toString().padStart(2, '0')}`;
};

const DEFAULT_WEEKLY_STATS = {
    weekId: getWeekId(),
    quizCorrect: 0,
    quizWrong: 0,
    cardsViewed: 0,
    matchingBestTime: 0,
    mazeHighScore: 0,
    wordSearchHighScore: 0,
    duelPoints: 0,
    duelWins: 0,
    duelLosses: 0,
    duelDraws: 0
};

const DEFAULT_STATS: UserStats = {
    xp: 0,
    level: 1,
    streak: 0,
    lastStudyDate: null,
    badges: [],
    flashcardsViewed: 0,
    quizCorrect: 0,
    quizWrong: 0,
    dailyGoal: 20,
    date: getTodayDateString(),
    xpBoostEndTime: 0,
    lastGoalMetDate: null,
    viewedWordsToday: [],
    perfectQuizzes: 0,
    questsCompleted: 0,
    totalTimeSpent: 0,
    duelWins: 0,
    duelLosses: 0,
    duelDraws: 0,
    duelPoints: 0,
    matchingAllTimeBest: 0,
    mazeAllTimeBest: 0,
    wordSearchAllTimeBest: 0,
    completedUnits: [],
    completedGrades: [],
    weekly: DEFAULT_WEEKLY_STATS
};

const DEFAULT_SETTINGS: AppSettings = {
    soundEnabled: true,
    theme: 'dark'
};

const KEYS = {
    PROFILE: 'lgs_user_profile',
    STATS: 'lgs_user_stats',
    SETTINGS: 'lgs_app_settings',
    MEMORIZED: 'lgs_memorized',
    BOOKMARKS: 'lgs_bookmarks',
    SRS: 'lgs_srs_data',
    SRS_LEGACY: 'lgs_srs',
    DAILY: 'lgs_daily_state',
    LAST_UPDATE: 'lgs_last_update_ts',
    VERSION: 'lgs_data_version',
    TUTORIAL_SEEN: 'lgs_tutorial_seen'
};

export const notifyDataChange = () => {
    const event = new CustomEvent('local-data-changed');
    window.dispatchEvent(event);
};

// --- Profile ---

export const getUserProfile = (): UserProfile => {
    try {
        const stored = localStorage.getItem(KEYS.PROFILE);
        if (!stored) return DEFAULT_PROFILE;
        try {
            const parsed = JSON.parse(stored);
            if (!parsed.friendCode) {
                parsed.friendCode = generateFriendCode();
                localStorage.setItem(KEYS.PROFILE, JSON.stringify(parsed));
            }
            return { ...DEFAULT_PROFILE, ...parsed };
        } catch (e) {
            console.error("Failed to parse user profile:", e);
            return DEFAULT_PROFILE;
        }
    } catch { return DEFAULT_PROFILE; }
};

export const saveUserProfile = (profile: UserProfile, sync: boolean = false) => {
    if (!profile.friendCode) profile.friendCode = generateFriendCode();
    // sync parameter is ignored in full offline mode
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    updateLastUpdatedTimestamp();
    notifyDataChange();
};

export const overwriteLocalWithCloud = async (cloudProfile: any, cloudStats: any) => {
    // No-op for offline mode
};

export const createGuestProfile = (grade?: string) => {
    // This function creates a fresh profile.
    // Even though "Guest" is removed, it's used to initialize new users after grade selection.
    const profile = { ...DEFAULT_PROFILE, grade: grade || '' }; // No default A1
    saveUserProfile(profile);

    const stats = { ...DEFAULT_STATS };
    saveUserStats(stats);

    // Clear other data
    localStorage.removeItem(KEYS.SRS);
    localStorage.removeItem(KEYS.SRS_LEGACY);
    localStorage.removeItem(KEYS.MEMORIZED);
    localStorage.removeItem(KEYS.BOOKMARKS);
};

// --- Stats ---

export const getUserStats = (): UserStats => {
    try {
        const stored = localStorage.getItem(KEYS.STATS);
        if (!stored) return DEFAULT_STATS;
        try {
            const stats = JSON.parse(stored);

            const today = getTodayDateString();
            if (stats.date !== today) {
                stats.date = today;
                stats.viewedWordsToday = [];
            }

            // Weekly Reset Logic based on Turkey Time
            const currentWeek = getWeekId();
            if (stats.weekly?.weekId !== currentWeek) {
                // New week, reset weekly stats
                stats.weekly = {
                    ...DEFAULT_WEEKLY_STATS,
                    weekId: currentWeek
                };
            } else {
                // Ensure any missing fields are present in existing week
                stats.weekly = { ...DEFAULT_WEEKLY_STATS, ...stats.weekly };
            }

            return { ...DEFAULT_STATS, ...stats };
        } catch (e) {
            console.error("Failed to parse user stats:", e);
            return DEFAULT_STATS;
        }
    } catch { return DEFAULT_STATS; }
};

export const saveUserStats = (stats: UserStats) => {
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    updateLastUpdatedTimestamp();
    notifyDataChange();
};

// --- Settings ---

export const getAppSettings = (): AppSettings => {
    try {
        const stored = localStorage.getItem(KEYS.SETTINGS);
        return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
};

export const saveAppSettings = (settings: AppSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const getTheme = (): ThemeType => {
    return getAppSettings().theme;
};

export const saveTheme = (theme: ThemeType) => {
    const settings = getAppSettings();
    settings.theme = theme;
    saveAppSettings(settings);
};

// --- Memorized & Bookmarks ---

export const getMemorizedSet = (): Set<string> => {
    try {
        const stored = localStorage.getItem(KEYS.MEMORIZED);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
};

export const getBookmarksSet = (): Set<string> => {
    try {
        const stored = localStorage.getItem(KEYS.BOOKMARKS);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
};

export const addToMemorized = (id: string) => {
    const set = getMemorizedSet();
    set.add(id);
    localStorage.setItem(KEYS.MEMORIZED, JSON.stringify([...set]));
    updateLastUpdatedTimestamp();
    notifyDataChange();
};

export const removeFromMemorized = (id: string) => {
    const set = getMemorizedSet();
    set.delete(id);
    localStorage.setItem(KEYS.MEMORIZED, JSON.stringify([...set]));
    updateLastUpdatedTimestamp();
    notifyDataChange();
};

export const addToBookmarks = (id: string) => {
    try {
        const stored = localStorage.getItem(KEYS.BOOKMARKS);
        const set = stored ? new Set(JSON.parse(stored)) : new Set();
        set.add(id);
        localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify([...set]));
        updateLastUpdatedTimestamp();
        notifyDataChange();
    } catch { }
};

export const removeFromBookmarks = (id: string) => {
    try {
        const stored = localStorage.getItem(KEYS.BOOKMARKS);
        const set = stored ? new Set(JSON.parse(stored)) : new Set();
        set.delete(id);
        localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify([...set]));
        updateLastUpdatedTimestamp();
        notifyDataChange();
    } catch { }
};

// --- SRS System ---

export const getSRSData = (): Record<string, SRSData> => {
    try {
        const stored = localStorage.getItem(KEYS.SRS);

        if (!stored) {
            const legacy = localStorage.getItem(KEYS.SRS_LEGACY);
            if (legacy) {
                try {
                    const legacyData = JSON.parse(legacy);
                    localStorage.setItem(KEYS.SRS, legacy);
                    return legacyData;
                } catch (e) {
                    console.error("Failed to parse legacy SRS data:", e);
                    return {};
                }
            }
            return {};
        }

        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse SRS data:", e);
            return {};
        }
    } catch { return {}; }
};

export const saveSRSData = (data: Record<string, SRSData>) => {
    localStorage.setItem(KEYS.SRS, JSON.stringify(data));
    updateLastUpdatedTimestamp();
    notifyDataChange();
};

export const registerSRSInteraction = (wordId: string) => {
    const data = getSRSData();
    const now = Date.now();
    if (!data[wordId]) {
        data[wordId] = { box: 1, nextReview: now + (24 * 60 * 60 * 1000) };
        saveSRSData(data);
    }
};

export const handleReviewResult = (wordId: string, success: boolean) => {
    const data = getSRSData();
    const now = Date.now();
    let entry = data[wordId];

    if (!entry) {
        entry = { box: 1, nextReview: now + (24 * 60 * 60 * 1000) };
    } else {
        if (success) {
            entry.box = Math.min(entry.box + 1, 5);
        } else {
            entry.box = 1;
        }

        const intervals = [0, 1, 3, 7, 14, 30];
        const daysToAdd = intervals[entry.box];
        entry.nextReview = now + (daysToAdd * 24 * 60 * 60 * 1000);
    }

    data[wordId] = entry;
    saveSRSData(data);
};

export const handleQuizResult = (wordId: string, success: boolean) => {
    // Add word to SRS when quiz answer is correct
    console.log(`[SRS DEBUG] handleQuizResult called - wordId: ${wordId}, success: ${success}`);
    if (success) {
        const data = getSRSData();
        const now = Date.now();
        if (!data[wordId]) {
            data[wordId] = { box: 1, nextReview: now + (24 * 60 * 60 * 1000) };
            saveSRSData(data);
            console.log(`[SRS DEBUG] Added word to SRS from quiz: ${wordId}`);
        } else {
            // If already in SRS, update it
            let entry = data[wordId];
            entry.box = Math.min(entry.box + 1, 5);
            const intervals = [0, 1, 3, 7, 14, 30];
            const daysToAdd = intervals[entry.box];
            entry.nextReview = now + (daysToAdd * 24 * 60 * 60 * 1000);
            data[wordId] = entry;
            saveSRSData(data);
            console.log(`[SRS DEBUG] Updated SRS entry from quiz: ${wordId}, box: ${entry.box}`);
        }
    }
};

// Add SRS functions for game modes
export const handleGameWordCompletion = (wordId: string) => {
    // Add word to SRS when completed in games (matching, maze, etc.)
    console.log(`[SRS DEBUG] handleGameWordCompletion called - wordId: ${wordId}`);
    const data = getSRSData();
    const now = Date.now();
    if (!data[wordId]) {
        data[wordId] = { box: 1, nextReview: now + (24 * 60 * 60 * 1000) };
        saveSRSData(data);
        console.log(`[SRS DEBUG] Added word to SRS from game: ${wordId}`);
    } else {
        // If already in SRS, update it
        let entry = data[wordId];
        entry.box = Math.min(entry.box + 1, 5);
        const intervals = [0, 1, 3, 7, 14, 30];
        const daysToAdd = intervals[entry.box];
        entry.nextReview = now + (daysToAdd * 24 * 60 * 60 * 1000);
        data[wordId] = entry;
        saveSRSData(data);
        console.log(`[SRS DEBUG] Updated SRS entry from game: ${wordId}, box: ${entry.box}`);
    }
};

export const getDueWords = async (filterUnitIds?: string[]): Promise<import('../types').WordCard[]> => {
    const data = getSRSData();
    const now = Date.now();
    const dueIds: string[] = [];

    Object.entries(data).forEach(([id, entry]) => {
        if (entry.nextReview <= now) {
            dueIds.push(id);
        }
    });

    if (dueIds.length === 0) return [];

    const vocabulary = await getVocabulary();
    if (Object.keys(vocabulary).length === 0) return [];

    const dueWords: import('../types').WordCard[] = [];
    for (const dueId of dueIds) {
        const [unitId, english] = dueId.split('|');
        if (!unitId || !english) continue;

        if (filterUnitIds && !filterUnitIds.includes(unitId)) {
            continue;
        }

        const word = vocabulary[unitId]?.find(w => w.english === english);
        if (word) {
            dueWords.push(word);
        }
    }
    return dueWords;
};

export const getDueGrades = () => {
    const data = getSRSData();
    const now = Date.now();
    const dueGrades = new Set<string>();

    Object.entries(data).forEach(([id, entry]) => {
        if (entry.nextReview <= now) {
            const parts = id.split('|');
            if (parts.length > 1) {
                const unitId = parts[0];
                Object.entries(UNIT_ASSETS).forEach(([grade, units]) => {
                    if (units.some(u => u.id === unitId)) {
                        dueGrades.add(grade);
                    }
                });
            }
        }
    });
    return Array.from(dueGrades);
};

export const getTotalDueCount = () => {
    const data = getSRSData();
    const now = Date.now();
    return Object.values(data).filter(e => e.nextReview <= now).length;
};

export const getDueCountForGrade = (grade: string) => {
    const data = getSRSData();
    const now = Date.now();
    const units = UNIT_ASSETS[grade]?.map(u => u.id) || [];
    let count = 0;
    Object.entries(data).forEach(([id, entry]) => {
        if (entry.nextReview <= now) {
            const parts = id.split('|');
            if (parts.length > 1 && units.includes(parts[0])) {
                count++;
            }
        }
    });
    return count;
};

export const getSRSStatus = () => {
    const data = getSRSData();
    const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    Object.values(data).forEach(e => {
        if (counts[e.box] !== undefined) counts[e.box]++;
    });
    return counts;
};

// --- Stats Updates ---

export const updateGameStats = (
    game: 'matching' | 'maze',
    score: number
) => {
    const stats = getUserStats();

    switch (game) {
        case 'matching':
            stats.weekly.matchingBestTime = Math.max(stats.weekly.matchingBestTime || 0, score);
            stats.matchingAllTimeBest = Math.max(stats.matchingAllTimeBest || 0, score);
            break;
        case 'maze':
            stats.weekly.mazeHighScore = Math.max(stats.weekly.mazeHighScore || 0, score);
            stats.mazeAllTimeBest = Math.max(stats.mazeAllTimeBest || 0, score);
            break;

    }

    saveUserStats(stats);
};


export const updateQuizStats = (correct: number, wrong: number) => {
    const stats = getUserStats();

    stats.quizCorrect += correct;
    stats.quizWrong += wrong;

    stats.weekly.quizCorrect += correct;
    stats.weekly.quizWrong += wrong;

    saveUserStats(stats);
};

export const updateDuelStats = (result: 'win' | 'loss' | 'tie', points: number) => {
    const stats = getUserStats();

    console.log(`Updating duel stats - result: ${result}, points: ${points}`);

    // Update lifetime stats
    if (result === 'win') {
        stats.duelWins += 1;
        stats.weekly.duelWins += 1;
        // Each win gives 3 points
        stats.duelPoints += 3;
        stats.weekly.duelPoints += 3;
    } else if (result === 'loss') {
        stats.duelLosses += 1;
        stats.weekly.duelLosses += 1;
    } else if (result === 'tie') {
        stats.duelDraws += 1;
        stats.weekly.duelDraws += 1;
        // Each tie gives 1 point
        stats.duelPoints += 1;
        stats.weekly.duelPoints += 1;
    }

    // If points are provided separately (e.g., from percentage), add them too
    if (points && points > 0) {
        stats.duelPoints += points;
        stats.weekly.duelPoints += points;
    }

    saveUserStats(stats);
};

const _handleStreakUpdate = (stats: UserStats, todayStr: string) => {
    const currentLastStudyDate = stats.lastStudyDate;

    if (currentLastStudyDate !== todayStr) {
        if (currentLastStudyDate) {
            const last = new Date(currentLastStudyDate);
            const now = new Date(todayStr);
            last.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);
            const diffTime = now.getTime() - last.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                stats.streak++;
            } else if (diffDays > 1) {
                const prof = getUserProfile();
                if (prof.inventory && prof.inventory.streakFreezes > 0) {
                    prof.inventory.streakFreezes--;
                    saveUserProfile(prof);
                } else {
                    stats.streak = 1;
                }
            }
        } else {
            stats.streak = 1;
        }
        stats.lastStudyDate = todayStr;
    }
};

const _calculateFinalXP = (stats: UserStats, xpToAdd: number) => {
    if (xpToAdd === 0) return;

    // Base Multiplier (XP Boost Item)
    let finalMultiplier = (stats.xpBoostEndTime > Date.now()) ? 2 : 1;

    // Streak Multiplier (Max 2.0x at 10 days)
    // Formula: 1.0 + (Streak * 0.1) -> Day 1: 1.1x, Day 10: 2.0x
    const streakMult = 1 + (Math.min(stats.streak, 10) * 0.1);
    finalMultiplier *= streakMult;

    stats.xp += Math.floor(xpToAdd * finalMultiplier);

    const newLevel = getLevelForXP(stats.xp);
    if (newLevel > stats.level) {
        stats.level = newLevel;
    }
};

const _checkForBadges = (stats: UserStats, context: any): Badge[] => {
    const unlockedBadges: Badge[] = [];
    BADGES.forEach(badge => {
        if (!stats.badges.includes(badge.id)) {
            if (badge.condition(stats, context)) {
                stats.badges.push(badge.id);
                unlockedBadges.push(badge);
            }
        }
    });
    return unlockedBadges;
};

export const updateStats = (
    xpToAdd: number,
    context?: { grade?: GradeLevel | null, unitId?: string, action?: string, quizSize?: number }
): Badge[] => {
    const stats = getUserStats();
    const todayStr = getTodayDateString();

    const currentLastStudyDate = stats.lastStudyDate;

    if (currentLastStudyDate !== todayStr) {
        if (currentLastStudyDate) {
            const last = new Date(currentLastStudyDate);
            const now = new Date(todayStr);
            last.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);
            const diffTime = now.getTime() - last.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                stats.streak++;
            } else if (diffDays > 1) {
                const prof = getUserProfile();
                if (prof.inventory && prof.inventory.streakFreezes > 0) {
                    prof.inventory.streakFreezes--;
                    saveUserProfile(prof);
                } else {
                    stats.streak = 1;
                }
            }
        } else {
            stats.streak = 1;
        }
        stats.lastStudyDate = todayStr;
    }


    if (context?.action === 'perfect_quiz') {
        stats.perfectQuizzes++;
    }



    // Increment Counters based on Action (or context)
    // We infer action from xpToAdd or context params
    if (xpToAdd === XP_GAINS.flashcard_view) {
        stats.flashcardsViewed++;
        stats.weekly.cardsViewed++;
    }
    else if (context?.action === 'quiz_result') {
        // Expect context to have correct/wrong counts if we update stats here
        // But updateStats is primarily for XP.
        // Better to have separate explicit calls or params.
        // See below for new function updateQuizStats
    }

    // Base Multiplier (XP Boost Item)
    let finalMultiplier = (stats.xpBoostEndTime > Date.now()) ? 2 : 1;

    // Streak Multiplier (Max 2.0x at 10 days)
    // Formula: 1.0 + (Streak * 0.1) -> Day 1: 1.1x, Day 10: 2.0x
    const streakMult = 1 + (Math.min(stats.streak, 10) * 0.1);
    finalMultiplier *= streakMult;

    stats.xp += Math.floor(xpToAdd * finalMultiplier);

    const newLevel = getLevelForXP(stats.xp);
    if (newLevel > stats.level) {
        stats.level = newLevel;
    }

    saveUserStats(stats);

    const unlockedBadges: Badge[] = [];
    BADGES.forEach(badge => {
        if (!stats.badges.includes(badge.id)) {
            if (badge.condition(stats, context)) {
                stats.badges.push(badge.id);
                unlockedBadges.push(badge);
            }
        }
    });

    if (unlockedBadges.length > 0) {
        saveUserStats(stats);
    }

    return unlockedBadges;
};

export const updateTimeSpent = (minutes: number): Badge[] => {
    const stats = getUserStats();
    stats.totalTimeSpent += minutes;
    saveUserStats(stats);

    // Update Daily Quest
    updateQuestProgress('study_time', minutes);

    const unlockedBadges: Badge[] = [];
    BADGES.forEach(badge => {
        if (!stats.badges.includes(badge.id) && badge.id.startsWith('time_')) {
            if (badge.condition(stats)) {
                stats.badges.push(badge.id);
                unlockedBadges.push(badge);
            }
        }
    });

    if (unlockedBadges.length > 0) saveUserStats(stats);
    return unlockedBadges;
};

export const getDailyState = () => {
    try {
        const stored = localStorage.getItem(KEYS.DAILY);
        const today = getTodayDateString();

        if (stored) {
            const data = JSON.parse(stored);
            if (data.date === today) return data;
        }

        const newQuests = generateDailyQuests();
        const newState = {
            date: today,
            quests: newQuests,
            wordOfTheDayIndex: 0
        };
        localStorage.setItem(KEYS.DAILY, JSON.stringify(newState));
        return newState;
    } catch {
        return { date: '', quests: [], wordOfTheDayIndex: 0 };
    }
};

const generateDailyQuests = (): Quest[] => {
    const easyQuests: { type: Quest['type'], target: number, reward: number, desc: string }[] = [
        { type: 'view_cards', target: 20, reward: XP_GAINS.daily_quest_easy, desc: '20 Kelime Kartı İncele' },
        { type: 'earn_xp', target: 200, reward: XP_GAINS.daily_quest_easy, desc: '200 XP Kazan' },
        { type: 'study_time', target: 10, reward: XP_GAINS.daily_quest_easy, desc: '10 Dakika Çalış' }
    ];

    const mediumQuests: { type: Quest['type'], target: number, reward: number, desc: string }[] = [
        { type: 'finish_quiz', target: 2, reward: XP_GAINS.daily_quest_medium, desc: '2 Test Bitir' },
        { type: 'correct_answers', target: 30, reward: XP_GAINS.daily_quest_medium, desc: '30 Doğru Cevap Ver' },
        { type: 'play_matching', target: 1, reward: XP_GAINS.daily_quest_medium, desc: 'Eşleştirme Oyunu Oyna' },
    ];

    const hardQuests: { type: Quest['type'], target: number, reward: number, desc: string }[] = [
        { type: 'perfect_quiz', target: 1, reward: XP_GAINS.daily_quest_hard, desc: '1 Testi Hatasız Bitir' },
        { type: 'win_duel', target: 1, reward: XP_GAINS.daily_quest_hard, desc: 'Bir Düello Kazan' },
        { type: 'play_maze', target: 1, reward: XP_GAINS.daily_quest_hard, desc: 'Labirent Oyunu Oyna' },
    ];

    const selectedQuests: Quest[] = [];

    // 1 Easy
    const easy = easyQuests[Math.floor(Math.random() * easyQuests.length)];
    selectedQuests.push({
        id: `q_easy_${Date.now()}`,
        description: easy.desc,
        target: easy.target,
        current: 0,
        rewardXP: easy.reward,
        isCompleted: false,
        type: easy.type
    });

    // 1 Medium
    const medium = mediumQuests[Math.floor(Math.random() * mediumQuests.length)];
    selectedQuests.push({
        id: `q_med_${Date.now()}`,
        description: medium.desc,
        target: medium.target,
        current: 0,
        rewardXP: medium.reward,
        isCompleted: false,
        type: medium.type
    });

    // 1 Hard
    const hard = hardQuests[Math.floor(Math.random() * hardQuests.length)];
    selectedQuests.push({
        id: `q_hard_${Date.now()}`,
        description: hard.desc,
        target: hard.target,
        current: 0,
        rewardXP: hard.reward,
        isCompleted: false,
        type: hard.type
    });

    return selectedQuests;
};

export const updateQuestProgress = (type: string, amount: number) => {
    const daily = getDailyState();
    let changed = false;
    let questsCompletedBefore = daily.quests.filter((q: Quest) => q.isCompleted).length;

    daily.quests.forEach((q: Quest) => {
        if (!q.isCompleted && q.type === type) {
            q.current += amount;
            if (q.current >= q.target) {
                q.current = q.target;
                q.isCompleted = true;
                updateStats(q.rewardXP);
            }
            changed = true;
        }
    });

    let questsCompletedAfter = daily.quests.filter((q: Quest) => q.isCompleted).length;

    // BONUS FOR COMPLETING ALL QUESTS (Updated logic)
    if (questsCompletedAfter === 3 && questsCompletedBefore < 3) {
        updateStats(XP_GAINS.daily_quest_completion_bonus);
    }

    if (changed) {
        localStorage.setItem(KEYS.DAILY, JSON.stringify(daily));
        updateLastUpdatedTimestamp();
    }
};

export const validateEquippedItems = (profile: UserProfile, level: number) => {
    let changed = false;

    // Validate Frame
    const frame = FRAMES.find(f => f.id === profile.frame);
    if (frame && frame.unlockLevel && level < frame.unlockLevel) {
        profile.frame = 'frame_none';
        changed = true;
    }

    // Validate Background
    const bg = BACKGROUNDS.find(b => b.id === profile.background);
    if (bg && bg.unlockLevel && level < bg.unlockLevel) {
        profile.background = 'bg_default';
        changed = true;
    }

    return changed;
};

export const buyTheme = (themeId: ThemeType, cost: number): boolean => {
    const stats = getUserStats();
    if (stats.xp >= cost) {
        stats.xp -= cost;

        // Check for level drop
        const newLevel = getLevelForXP(stats.xp);
        if (newLevel < stats.level) {
            stats.level = newLevel;
        }

        saveUserStats(stats);

        const profile = getUserProfile();
        profile.purchasedThemes.push(themeId);

        // Validate items in case level dropped
        if (validateEquippedItems(profile, stats.level)) {
            // If items were unequipped, we might want to notify user but UI updates will show it
        }

        saveUserProfile(profile);
        return true;
    }
    return false;
};

export const buyFrame = (frameId: string, cost: number): boolean => {
    const stats = getUserStats();
    if (stats.xp >= cost) {
        stats.xp -= cost;

        // Check for level drop
        const newLevel = getLevelForXP(stats.xp);
        if (newLevel < stats.level) {
            stats.level = newLevel;
        }

        saveUserStats(stats);

        const profile = getUserProfile();
        profile.purchasedFrames.push(frameId);

        // Validate items in case level dropped
        validateEquippedItems(profile, stats.level);

        saveUserProfile(profile);
        return true;
    }
    return false;
};

export const buyBackground = (bgId: string, cost: number): boolean => {
    const stats = getUserStats();
    if (stats.xp >= cost) {
        stats.xp -= cost;

        // Check for level drop
        const newLevel = getLevelForXP(stats.xp);
        if (newLevel < stats.level) {
            stats.level = newLevel;
        }

        saveUserStats(stats);

        const profile = getUserProfile();
        if (!profile.purchasedBackgrounds) profile.purchasedBackgrounds = ['bg_default'];
        profile.purchasedBackgrounds.push(bgId);

        // Validate items in case level dropped
        validateEquippedItems(profile, stats.level);

        saveUserProfile(profile);
        return true;
    }
    return false;
};

export const buyItem = (itemId: 'streak_freeze' | 'xp_boost', cost: number): boolean => {
    const stats = getUserStats();
    if (stats.xp >= cost) {
        stats.xp -= cost;

        // Check for level drop
        const newLevel = getLevelForXP(stats.xp);
        if (newLevel < stats.level) {
            stats.level = newLevel;
        }

        const profile = getUserProfile();
        if (itemId === 'streak_freeze') {
            if (!profile.inventory) profile.inventory = { streakFreezes: 0 };
            profile.inventory.streakFreezes = (profile.inventory.streakFreezes || 0) + 1;
        } else if (itemId === 'xp_boost') {
            // Set for 30 minutes from now (UPDATED)
            stats.xpBoostEndTime = Date.now() + (30 * 60 * 1000);
        }

        // Validate items in case level dropped
        validateEquippedItems(profile, stats.level);

        saveUserStats(stats);
        // Profile might be modified by validateEquippedItems or inventory update
        saveUserProfile(profile);
        return true;
    }
    return false;
};

export const equipFrame = (frameId: string) => {
    const profile = getUserProfile();
    profile.frame = frameId;
    saveUserProfile(profile);
};

export const equipBackground = (bgId: string) => {
    const profile = getUserProfile();
    profile.background = bgId;
    saveUserProfile(profile);
};

export const adminAddXP = (amount: number) => {
    const stats = getUserStats();
    stats.xp += amount;
    saveUserStats(stats);
};

export const adminSetLevel = (level: number) => {
    const stats = getUserStats();
    stats.level = level;
    stats.xp = getXPForLevel(level);
    saveUserStats(stats);
};

export const adminUnlockAllItems = () => {
    adminAddXP(100000);
};

export const adminUnlockAllBadges = () => {
    const stats = getUserStats();
    BADGES.forEach(b => {
        if (!stats.badges.includes(b.id)) stats.badges.push(b.id);
    });
    saveUserStats(stats);
};

export const adminUnlockAllAvatars = () => {
    adminSetLevel(500);
};

export const getRandomWordForGrade = async (grade: GradeLevel | string | null): Promise<import('../types').WordCard | null> => {
    if (!grade) return null;

    const vocabulary = await getVocabulary();
    if (Object.keys(vocabulary).length === 0) return null;

    const units = UNIT_ASSETS[grade as GradeLevel];
    if (!units || units.length === 0) return null;

    const validUnits = units.filter(u => vocabulary[u.id] && vocabulary[u.id].length > 0);
    if (validUnits.length === 0) return null;

    const randomUnit = validUnits[Math.floor(Math.random() * validUnits.length)];
    const words = vocabulary[randomUnit.id];
    if (!words || words.length === 0) return null;

    return words[Math.floor(Math.random() * words.length)];
};

export const saveLastActivity = (grade: string, unitId: string) => {
    const stats = getUserStats();
    stats.lastActivity = { grade, unitId };
    saveUserStats(stats);
};

export const getLastReadAnnouncementId = () => {
    return localStorage.getItem('last_announcement_id');
};

export const setLastReadAnnouncementId = (id: string) => {
    localStorage.setItem('last_announcement_id', id);
};

export const getLastUpdatedTimestamp = (): number => {
    return parseInt(localStorage.getItem(KEYS.LAST_UPDATE) || '0');
};

export const updateLastUpdatedTimestamp = () => {
    localStorage.setItem(KEYS.LAST_UPDATE, Date.now().toString());
};

export const checkDataVersion = () => {
    const currentVer = parseInt(localStorage.getItem(KEYS.VERSION) || '0');
    if (currentVer < 3) {
        localStorage.setItem(KEYS.VERSION, '3');
        return true;
    }
    return false;
};

export const hasSeenTutorial = () => {
    return localStorage.getItem(KEYS.TUTORIAL_SEEN) === 'true';
};

export const markTutorialAsSeen = (seen: boolean = true) => {
    localStorage.setItem(KEYS.TUTORIAL_SEEN, seen ? 'true' : 'false');
};

export const clearLocalUserData = () => {
    localStorage.removeItem(KEYS.PROFILE);
    localStorage.removeItem(KEYS.STATS);
    localStorage.removeItem(KEYS.MEMORIZED);
    localStorage.removeItem(KEYS.BOOKMARKS);
    localStorage.removeItem(KEYS.SRS);
    localStorage.removeItem(KEYS.SRS_LEGACY);

    const settings = getAppSettings();
    settings.theme = 'dark';
    saveAppSettings(settings);
};
