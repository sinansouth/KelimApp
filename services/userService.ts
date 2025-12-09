
import { Quest, Badge, GradeLevel, ThemeType } from '../types';
import { BADGES, UNIT_ASSETS } from '../data/assets';
import { getVocabulary } from './contentService';

export interface UserProfile {
    name: string;
    grade: string;
    avatar: string;
    frame: string;
    background: string;
    theme?: ThemeType;
    purchasedThemes: string[];
    purchasedFrames: string[];
    purchasedBackgrounds: string[];
    inventory: { streakFreezes: number };
    lastUsernameChange?: number;
    isGuest?: boolean;
    friendCode?: string;
    isAdmin?: boolean;
    updatedAt?: number; // Cloud sync için
}

export interface UserStats {
    xp: number;
    level: number;
    streak: number;
    lastStudyDate: string | null;
    badges: string[];
    flashcardsViewed: number;
    quizCorrect: number;
    quizWrong: number;
    dailyGoal: number;
    date: string;
    xpBoostEndTime: number;
    lastGoalMetDate: string | null;
    viewedWordsToday: string[];
    perfectQuizzes: number;
    questsCompleted: number;
    totalTimeSpent: number;
    
    // Lifetime Stats
    duelWins: number;
    duelLosses: number;
    duelDraws: number;
    duelPoints: number;

    // Lifetime Game High Scores
    matchingAllTimeBest: number;
    mazeAllTimeBest: number;
    wordSearchAllTimeBest: number;

    completedUnits: string[];
    completedGrades: string[];
    
    // Weekly Stats
    weekly: {
        weekId: string;
        quizCorrect: number;
        quizWrong: number;
        cardsViewed: number;
        matchingBestTime: number; // Actually Score
        mazeHighScore: number;
        wordSearchHighScore: number;
        
        duelPoints: number;
        duelWins: number;
        duelLosses: number;
        duelDraws: number;
    };
    lastActivity?: { grade: string; unitId: string };
    updatedAt?: number;
}

export interface AppSettings {
    soundEnabled: boolean;
    theme: ThemeType;
}

export interface SRSData {
    box: number;
    nextReview: number;
}

// --- TIME UTILITIES ---

export const getTurkeyTime = (): Date => {
    // Current time in local
    const now = new Date();
    // Convert to UTC
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    // Add 3 hours for Turkey (UTC+3)
    return new Date(utc + (3600000 * 3));
};

// Returns YYYY-MM-DD based on local device time (For Streak)
export const getTodayDateString = (): string => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    isGuest: false,
    friendCode: '',
    isAdmin: false,
    updatedAt: 0
};

// Calculates Week ID based on Turkey Time (UTC+3)
// New week starts on Monday 00:00 (which is Sunday 23:59+1min)
const getWeekId = () => {
    const d = getTurkeyTime();
    d.setHours(0, 0, 0, 0);
    // Adjust to nearest Thursday: current date + 4 - current day number
    // Sunday is 0, Monday is 1...
    const dayNum = d.getDay() || 7; // Make Sunday 7
    d.setDate(d.getDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
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
    weekly: DEFAULT_WEEKLY_STATS,
    updatedAt: 0
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

// --- Profile ---

export const getUserProfile = (): UserProfile => {
    try {
        const stored = localStorage.getItem(KEYS.PROFILE);
        if (!stored) return DEFAULT_PROFILE;
        const parsed = JSON.parse(stored);
        if (!parsed.friendCode) {
            parsed.friendCode = generateFriendCode();
            localStorage.setItem(KEYS.PROFILE, JSON.stringify(parsed));
        }
        return { ...DEFAULT_PROFILE, ...parsed };
    } catch { return DEFAULT_PROFILE; }
};

export const saveUserProfile = (profile: UserProfile, sync: boolean = false) => {
    if (!profile.friendCode) profile.friendCode = generateFriendCode();
    // Otomatik timestamp güncelle
    profile.updatedAt = Date.now();
    
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    updateLastUpdatedTimestamp();
};

export const createGuestProfile = (grade: string) => {
    const guestName = `Misafir-${Math.floor(Math.random() * 10000)}`;
    const profile: UserProfile = {
        ...DEFAULT_PROFILE,
        name: guestName,
        grade: grade,
        isGuest: true,
        friendCode: generateFriendCode(),
        theme: 'dark',
        updatedAt: Date.now()
    };
    saveUserProfile(profile);

    const stats = { ...DEFAULT_STATS, date: getTodayDateString(), updatedAt: Date.now() };
    saveUserStats(stats);
    
    saveSRSData({});
    localStorage.setItem(KEYS.MEMORIZED, '[]');
    localStorage.setItem(KEYS.BOOKMARKS, '[]');
    saveAppSettings({ ...DEFAULT_SETTINGS, theme: 'dark' });

    return profile;
};

// --- Stats ---

export const getUserStats = (): UserStats => {
    try {
        const stored = localStorage.getItem(KEYS.STATS);
        if (!stored) return DEFAULT_STATS;
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
    } catch { return DEFAULT_STATS; }
};

export const saveUserStats = (stats: UserStats) => {
    // Otomatik timestamp güncelle
    stats.updatedAt = Date.now();
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    updateLastUpdatedTimestamp();
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

export const addToMemorized = (id: string) => {
    const set = getMemorizedSet();
    set.add(id);
    localStorage.setItem(KEYS.MEMORIZED, JSON.stringify([...set]));
    updateLastUpdatedTimestamp();
};

export const removeFromMemorized = (id: string) => {
    const set = getMemorizedSet();
    set.delete(id);
    localStorage.setItem(KEYS.MEMORIZED, JSON.stringify([...set]));
    updateLastUpdatedTimestamp();
};

export const addToBookmarks = (id: string) => {
    try {
        const stored = localStorage.getItem(KEYS.BOOKMARKS);
        const set = stored ? new Set(JSON.parse(stored)) : new Set();
        set.add(id);
        localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify([...set]));
        updateLastUpdatedTimestamp();
    } catch { }
};

export const removeFromBookmarks = (id: string) => {
    try {
        const stored = localStorage.getItem(KEYS.BOOKMARKS);
        const set = stored ? new Set(JSON.parse(stored)) : new Set();
        set.delete(id);
        localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify([...set]));
        updateLastUpdatedTimestamp();
    } catch { }
};

// --- SRS System ---

export const getSRSData = (): Record<string, SRSData> => {
    try {
        const stored = localStorage.getItem(KEYS.SRS);
        
        if (!stored) {
            const legacy = localStorage.getItem(KEYS.SRS_LEGACY);
            if (legacy) {
                const legacyData = JSON.parse(legacy);
                localStorage.setItem(KEYS.SRS, legacy);
                return legacyData;
            }
            return {};
        }

        return JSON.parse(stored);
    } catch { return {}; }
};

export const saveSRSData = (data: Record<string, SRSData>) => {
    localStorage.setItem(KEYS.SRS, JSON.stringify(data));
    updateLastUpdatedTimestamp();
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
    // Optional: hook to update SRS on quiz result if desired
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

export const updateStats = (
    action: 'card_view' | 'quiz_correct' | 'quiz_wrong' | 'memorized' | 'review_remember' | 'review_forgot' | 'perfect_quiz' | 'duel_result' | 'xp',
    grade?: GradeLevel | null,
    unitId?: string,
    amount: number = 1
): Badge[] => {
    const stats = getUserStats();
    const todayStr = getTodayDateString();

    const currentLastStudyDate = stats.lastStudyDate;
    const currentTodayDate = todayStr;

    if (currentLastStudyDate !== currentTodayDate) {
        if (currentLastStudyDate) {
            const last = new Date(currentLastStudyDate);
            const now = new Date(currentTodayDate);
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

    let xpGain = 0;
    const multiplier = (stats.xpBoostEndTime > Date.now()) ? 2 : 1;

    switch (action) {
        case 'card_view':
            stats.flashcardsViewed += amount;
            if (typeof unitId === 'string' && !stats.viewedWordsToday.includes(unitId)) {
                stats.viewedWordsToday.push(unitId);
            }
            stats.weekly.cardsViewed += amount;
            xpGain = 3 * amount;
            break;
        case 'quiz_correct':
            stats.quizCorrect += amount;
            stats.weekly.quizCorrect += amount;
            xpGain = 20 * amount;
            // Update quests
            updateQuestProgress('correct_answers', amount);
            break;
        case 'quiz_wrong':
            stats.quizWrong += amount;
            stats.weekly.quizWrong += amount;
            xpGain = 1 * amount;
            break;
        case 'memorized':
            xpGain = 10 * amount;
            break;
        case 'review_remember':
            xpGain = 10 * amount;
            break;
        case 'review_forgot':
            xpGain = 2 * amount;
            break;
        case 'perfect_quiz':
            stats.perfectQuizzes++;
            xpGain = 100;
            break;
        case 'duel_result':
            // amount here signifies the result type: 3=Win, 1=Tie, 0=Loss
            // Lifetime Stats
            if (amount === 3) { // Win
                stats.duelWins = (stats.duelWins || 0) + 1;
                stats.duelPoints = (stats.duelPoints || 0) + 3;
                
                // Weekly Stats
                stats.weekly.duelWins = (stats.weekly.duelWins || 0) + 1;
                stats.weekly.duelPoints = (stats.weekly.duelPoints || 0) + 3;
                
                xpGain = 100;
                updateQuestProgress('win_duel', 1);
            } else if (amount === 1) { // Tie
                stats.duelDraws = (stats.duelDraws || 0) + 1;
                stats.duelPoints = (stats.duelPoints || 0) + 1;
                
                // Weekly Stats
                stats.weekly.duelDraws = (stats.weekly.duelDraws || 0) + 1;
                stats.weekly.duelPoints = (stats.weekly.duelPoints || 0) + 1;
                
                xpGain = 30;
            } else { // Loss
                stats.duelLosses = (stats.duelLosses || 0) + 1;
                stats.weekly.duelLosses = (stats.weekly.duelLosses || 0) + 1;
                xpGain = 10;
            }
            updateQuestProgress('play_duel', 1);
            break;
        case 'xp':
            xpGain = amount;
            break;
    }

    stats.xp += xpGain * multiplier;

    const newLevel = Math.floor(Math.sqrt(stats.xp / 100)) + 1;
    if (newLevel > stats.level) {
        stats.level = newLevel;
    }

    saveUserStats(stats);

    const unlockedBadges: Badge[] = [];
    BADGES.forEach(badge => {
        if (!stats.badges.includes(badge.id)) {
            if (badge.condition(stats, { grade, unitId, action })) {
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

export const updateGameStats = (game: 'matching' | 'maze' | 'wordSearch', score: number) => {
    const stats = getUserStats();
    if (game === 'matching') {
        if (score > (stats.weekly.matchingBestTime || 0)) stats.weekly.matchingBestTime = score;
        if (score > (stats.matchingAllTimeBest || 0)) stats.matchingAllTimeBest = score;
    } else if (game === 'maze') {
        if (score > (stats.weekly.mazeHighScore || 0)) stats.weekly.mazeHighScore = score;
        if (score > (stats.mazeAllTimeBest || 0)) stats.mazeAllTimeBest = score;
    } else if (game === 'wordSearch') {
        if (score > (stats.weekly.wordSearchHighScore || 0)) stats.weekly.wordSearchHighScore = score;
        if (score > (stats.wordSearchAllTimeBest || 0)) stats.wordSearchAllTimeBest = score;
    }

    saveUserStats(stats);
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
        { type: 'view_cards', target: 10, reward: 100, desc: '10 Kelime Kartı İncele' },
        { type: 'earn_xp', target: 100, reward: 100, desc: '100 XP Kazan' },
        { type: 'study_time', target: 10, reward: 100, desc: '10 Dakika Çalış' }
    ];

    const mediumQuests: { type: Quest['type'], target: number, reward: number, desc: string }[] = [
        { type: 'finish_quiz', target: 2, reward: 150, desc: '2 Test Bitir' },
        { type: 'correct_answers', target: 20, reward: 150, desc: '20 Doğru Cevap Ver' },
        { type: 'play_matching', target: 1, reward: 120, desc: 'Eşleştirme Oyunu Oyna' },
        { type: 'play_word_search', target: 100, reward: 120, desc: 'Bulmacada 100 Puan Al' }
    ];

    const hardQuests: { type: Quest['type'], target: number, reward: number, desc: string }[] = [
        { type: 'perfect_quiz', target: 1, reward: 250, desc: '1 Testi Hatasız Bitir' },
        { type: 'win_duel', target: 1, reward: 300, desc: 'Bir Düello Kazan' },
        { type: 'play_maze', target: 1, reward: 200, desc: 'Labirent Oyunu Oyna' },
        { type: 'study_time', target: 30, reward: 300, desc: '30 Dakika Çalış' },
        { type: 'earn_xp', target: 500, reward: 300, desc: '500 XP Kazan' }
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

    daily.quests.forEach((q: Quest) => {
        if (!q.isCompleted && q.type === type) {
            q.current += amount;
            // Cap current at target for visual consistency
            if (q.current >= q.target) {
                q.current = q.target;
                q.isCompleted = true;
                const stats = getUserStats();
                stats.xp += q.rewardXP;
                stats.questsCompleted++;
                saveUserStats(stats);
            }
            changed = true;
        }
    });

    if (changed) {
        localStorage.setItem(KEYS.DAILY, JSON.stringify(daily));
        updateLastUpdatedTimestamp();
    }
};

export const buyTheme = (themeId: ThemeType, cost: number): boolean => {
    const stats = getUserStats();
    if (stats.xp >= cost) {
        stats.xp -= cost;
        saveUserStats(stats);

        const profile = getUserProfile();
        profile.purchasedThemes.push(themeId);
        saveUserProfile(profile);
        return true;
    }
    return false;
};

export const buyFrame = (frameId: string, cost: number): boolean => {
    const stats = getUserStats();
    if (stats.xp >= cost) {
        stats.xp -= cost;
        saveUserStats(stats);

        const profile = getUserProfile();
        profile.purchasedFrames.push(frameId);
        saveUserProfile(profile);
        return true;
    }
    return false;
};

export const buyBackground = (bgId: string, cost: number): boolean => {
    const stats = getUserStats();
    if (stats.xp >= cost) {
        stats.xp -= cost;
        saveUserStats(stats);

        const profile = getUserProfile();
        if (!profile.purchasedBackgrounds) profile.purchasedBackgrounds = ['bg_default'];
        profile.purchasedBackgrounds.push(bgId);
        saveUserProfile(profile);
        return true;
    }
    return false;
};

export const buyItem = (itemId: 'streak_freeze' | 'xp_boost', cost: number): boolean => {
    const stats = getUserStats();
    if (stats.xp >= cost) {
        stats.xp -= cost;

        const profile = getUserProfile();
        if (itemId === 'streak_freeze') {
            if (!profile.inventory) profile.inventory = { streakFreezes: 0 };
            profile.inventory.streakFreezes = (profile.inventory.streakFreezes || 0) + 1;
            saveUserProfile(profile);
        } else if (itemId === 'xp_boost') {
            stats.xpBoostEndTime = Date.now() + (60 * 60 * 1000);
        }

        saveUserStats(stats);
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
    stats.xp = level * level * 100;
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

export const adminResetDailyQuests = () => {
    localStorage.removeItem(KEYS.DAILY);
};

export const getRandomWordForGrade = async (grade: GradeLevel | string | null): Promise<import('../types').WordCard | null> => {
    if (!grade) return null;
    
    const vocabulary = await getVocabulary();
    if (Object.keys(vocabulary).length === 0) return null;

    const units = UNIT_ASSETS[grade];
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

export const markTutorialAsSeen = () => {
    localStorage.setItem(KEYS.TUTORIAL_SEEN, 'true');
};

export const resetAppProgress = (scope: { type: 'all' | 'grade' | 'unit', value?: string }) => {
    if (scope.type === 'all') {
        localStorage.clear();
        window.location.reload();
    } else if (scope.type === 'unit' && scope.value) {
        const mem = getMemorizedSet();
        const newMem = new Set<string>();
        mem.forEach(id => { if (!id.startsWith(scope.value!)) newMem.add(id); });
        localStorage.setItem(KEYS.MEMORIZED, JSON.stringify([...newMem]));

        const srs = getSRSData();
        Object.keys(srs).forEach(id => { if (id.startsWith(scope.value!)) delete srs[id]; });
        saveSRSData(srs);

        updateLastUpdatedTimestamp();
    }
};

export const clearLocalUserData = () => {
    localStorage.removeItem(KEYS.PROFILE);
    localStorage.removeItem(KEYS.STATS);
    // Keep settings so theme isn't lost on logout
    // localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.MEMORIZED);
    localStorage.removeItem(KEYS.BOOKMARKS);
    localStorage.removeItem(KEYS.SRS);
    localStorage.removeItem(KEYS.SRS_LEGACY);
    
    // Set default theme for guest
    const settings = getAppSettings();
    settings.theme = 'dark';
    saveAppSettings(settings);
};

interface CloudData {
    profile?: UserProfile;
    stats?: UserStats;
    srs_data?: Record<string, SRSData>;
}

export const overwriteLocalWithCloud = (cloudData: CloudData) => {
    if (cloudData.profile) {
        saveUserProfile(cloudData.profile);
        if (cloudData.profile.theme) {
            const settings = getAppSettings();
            settings.theme = cloudData.profile.theme;
            saveAppSettings(settings);
        }
    }
    if (cloudData.stats) saveUserStats(cloudData.stats);
    
    if (cloudData.srs_data && Object.keys(cloudData.srs_data).length > 0) {
        saveSRSData(cloudData.srs_data);
    }
    
    updateLastUpdatedTimestamp();
};
