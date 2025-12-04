
import { Quest, Badge, GradeLevel, ThemeType } from '../types';
import { BADGES, UNIT_ASSETS } from '../data/assets';
import { VOCABULARY } from '../data/vocabulary';

export interface UserProfile {
  name: string;
  grade: string;
  avatar: string;
  frame: string;
  background: string;
  purchasedThemes: string[];
  purchasedFrames: string[];
  purchasedBackgrounds: string[];
  inventory: { streakFreezes: number };
  lastUsernameChange?: number;
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
  completedUnits: string[];
  completedGrades: string[];
  weekly: {
    weekId: string;
    quizCorrect: number;
    quizWrong: number;
    cardsViewed: number;
    matchingBestTime: number;
    typingHighScore: number;
    chainHighScore: number;
    mazeHighScore: number;
    wordSearchHighScore: number;
  };
  lastActivity?: { grade: string, unitId: string };
}

export interface AppSettings {
  soundEnabled: boolean;
  theme: ThemeType;
}

// --- TIME UTILITIES (Turkey Time Zone Enforcement) ---

// Returns the current time as a Date object, adjusted to Turkey Time (Europe/Istanbul)
export const getTurkeyTime = (): Date => {
    const now = new Date();
    // 'tr-TR' locale with 'Europe/Istanbul' timeZone automatically handles DST and offsets
    const turkeyTimeStr = now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" });
    return new Date(turkeyTimeStr);
};

// Returns YYYY-MM-DD string based on Turkey Time
export const getTodayDateString = (): string => {
    const trDate = getTurkeyTime();
    const year = trDate.getFullYear();
    const month = String(trDate.getMonth() + 1).padStart(2, '0');
    const day = String(trDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Get current timestamp in Turkey Time (milliseconds)
export const getTurkeyTimestamp = (): number => {
    return getTurkeyTime().getTime();
};

// Default Values
const DEFAULT_PROFILE: UserProfile = {
    name: '',
    grade: '',
    avatar: '🧑‍🎓',
    frame: 'frame_none',
    background: 'bg_default',
    purchasedThemes: ['light', 'dark'],
    purchasedFrames: ['frame_none'],
    purchasedBackgrounds: ['bg_default'],
    inventory: { streakFreezes: 0 }
};

const getWeekId = () => {
    const d = getTurkeyTime(); // Use Turkey Time
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(),0,1);
    const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
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
    date: getTodayDateString(), // Use Turkey Date
    xpBoostEndTime: 0,
    lastGoalMetDate: null,
    viewedWordsToday: [],
    perfectQuizzes: 0,
    questsCompleted: 0,
    totalTimeSpent: 0,
    completedUnits: [],
    completedGrades: [],
    weekly: {
        weekId: getWeekId(), // Use Turkey Week
        quizCorrect: 0,
        quizWrong: 0,
        cardsViewed: 0,
        matchingBestTime: 0,
        typingHighScore: 0,
        chainHighScore: 0,
        mazeHighScore: 0,
        wordSearchHighScore: 0
    }
};

const DEFAULT_SETTINGS: AppSettings = {
    soundEnabled: true,
    theme: 'dark'
};

// Storage Keys
const KEYS = {
    PROFILE: 'lgs_user_profile',
    STATS: 'lgs_user_stats',
    SETTINGS: 'lgs_app_settings',
    MEMORIZED: 'lgs_memorized',
    BOOKMARKS: 'lgs_bookmarks',
    SRS: 'lgs_srs_data',
    DAILY: 'lgs_daily_state',
    LAST_UPDATE: 'lgs_last_update_ts',
    VERSION: 'lgs_data_version'
};

// --- Profile ---

export const getUserProfile = (): UserProfile => {
    try {
        const stored = localStorage.getItem(KEYS.PROFILE);
        return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
};

export const saveUserProfile = (profile: UserProfile, sync: boolean = false) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    updateLastUpdatedTimestamp();
};

// --- Stats ---

export const getUserStats = (): UserStats => {
    try {
        const stored = localStorage.getItem(KEYS.STATS);
        if (!stored) return DEFAULT_STATS;
        const stats = JSON.parse(stored);
        
        // Daily Reset Logic (Based on Turkey Time)
        const today = getTodayDateString();
        
        if (stats.date !== today) {
            stats.date = today;
            stats.flashcardsViewed = 0;
            stats.quizCorrect = 0;
            stats.quizWrong = 0;
            stats.viewedWordsToday = [];
            
            // Streak Logic: Check if streak is broken
            const lastDateStr = stats.lastStudyDate;
            if (lastDateStr) {
                // We parse strings to dates, assuming they are YYYY-MM-DD
                const d1 = new Date(lastDateStr); 
                const d2 = new Date(today);
                // Calculate difference in days
                const diffTime = Math.abs(d2.getTime() - d1.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays > 1) {
                    const prof = getUserProfile();
                    if (prof.inventory && prof.inventory.streakFreezes > 0) {
                         prof.inventory.streakFreezes--;
                         saveUserProfile(prof);
                         // Freeze used: Pretend last study date was yesterday
                         const yesterday = new Date(getTurkeyTime());
                         yesterday.setDate(yesterday.getDate() - 1);
                         stats.lastStudyDate = yesterday.toISOString().split('T')[0];
                    } else {
                        stats.streak = 0;
                    }
                }
            }
        }

        // Weekly Reset (Turkey Time)
        const currentWeek = getWeekId();
        if (stats.weekly?.weekId !== currentWeek) {
            stats.weekly = {
                weekId: currentWeek,
                quizCorrect: 0,
                quizWrong: 0,
                cardsViewed: 0,
                matchingBestTime: 0,
                typingHighScore: 0,
                chainHighScore: 0,
                mazeHighScore: 0,
                wordSearchHighScore: 0
            };
        }

        return { ...DEFAULT_STATS, ...stats };
    } catch { return DEFAULT_STATS; }
};

export const saveUserStats = (stats: UserStats) => {
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
    } catch {}
};

export const removeFromBookmarks = (id: string) => {
    try {
        const stored = localStorage.getItem(KEYS.BOOKMARKS);
        const set = stored ? new Set(JSON.parse(stored)) : new Set();
        set.delete(id);
        localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify([...set]));
        updateLastUpdatedTimestamp();
    } catch {}
};

// --- SRS System (Using Turkey Time) ---

interface SRSData {
    box: number; // 1-5
    nextReview: number; // Timestamp
}

export const getSRSData = (): Record<string, SRSData> => {
    try {
        const stored = localStorage.getItem(KEYS.SRS);
        return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
};

export const saveSRSData = (data: Record<string, SRSData>) => {
    localStorage.setItem(KEYS.SRS, JSON.stringify(data));
    updateLastUpdatedTimestamp();
};

export const registerSRSInteraction = (wordId: string) => {
    const data = getSRSData();
    const now = getTurkeyTimestamp();
    if (!data[wordId]) {
        // Initial interaction places it in box 1, but scheduled for TOMORROW
        data[wordId] = { box: 1, nextReview: now + (24 * 60 * 60 * 1000) };
        saveSRSData(data);
    }
};

export const handleReviewResult = (wordId: string, success: boolean) => {
    const data = getSRSData();
    const now = getTurkeyTimestamp();
    // Default to box 1 if not found (shouldn't happen in review mode but safety check)
    let entry = data[wordId] || { box: 1, nextReview: now };

    if (success) {
        entry.box = Math.min(entry.box + 1, 5);
    } else {
        entry.box = 1;
    }

    // Intervals: 1d, 3d, 7d, 14d, 30d
    const intervals = [0, 1, 3, 7, 14, 30];
    const daysToAdd = intervals[entry.box];
    entry.nextReview = now + (daysToAdd * 24 * 60 * 60 * 1000);

    data[wordId] = entry;
    saveSRSData(data);
};

export const handleQuizResult = (wordId: string, success: boolean) => {
    handleReviewResult(wordId, success);
};

export const getDueWords = (filterUnitIds?: string[]) => {
    const data = getSRSData();
    const now = getTurkeyTimestamp();
    const dueIds: string[] = [];

    Object.entries(data).forEach(([id, entry]) => {
        if (entry.nextReview <= now) {
            if (filterUnitIds) {
                const parts = id.split('|');
                const unitId = parts.length > 1 ? parts[0] : null;
                if (unitId) {
                     if (filterUnitIds.includes(unitId)) {
                        dueIds.push(id);
                     }
                } else {
                    dueIds.push(id);
                }
            } else {
                dueIds.push(id);
            }
        }
    });

    let candidateWords: any[] = [];
    if (filterUnitIds) {
        filterUnitIds.forEach(uid => {
             if (VOCABULARY[uid]) {
                 candidateWords = [...candidateWords, ...VOCABULARY[uid].map(w => ({...w, unitId: uid}))];
             }
        });
    } else {
        candidateWords = Object.entries(VOCABULARY).flatMap(([uid, words]) => words.map(w => ({...w, unitId: uid})));
    }

    return candidateWords.filter(w => {
        const id = w.unitId ? `${w.unitId}|${w.english}` : w.english;
        return dueIds.includes(id);
    });
};

export const getDueGrades = () => {
    const data = getSRSData();
    const now = getTurkeyTimestamp();
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
    const now = getTurkeyTimestamp();
    return Object.values(data).filter(e => e.nextReview <= now).length;
};

export const getDueCountForGrade = (grade: string) => {
    const data = getSRSData();
    const now = getTurkeyTimestamp();
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
    const counts: {[key:number]: number} = {1:0, 2:0, 3:0, 4:0, 5:0};
    Object.values(data).forEach(e => {
        if (counts[e.box] !== undefined) counts[e.box]++;
    });
    return counts;
};

// --- Stats Updates ---

export const updateStats = (
    action: 'card_view' | 'quiz_correct' | 'quiz_wrong' | 'memorized' | 'review_remember' | 'review_forgot' | 'perfect_quiz',
    grade?: GradeLevel | null,
    unitId?: string,
    amount: number = 1
): Badge[] => {
    const stats = getUserStats();
    const today = getTodayDateString(); // Turkey Time Date
    
    if (stats.date !== today) {
        // New day!
        const lastDateStr = stats.lastStudyDate;
        
        if (lastDateStr) {
            const d1 = new Date(lastDateStr);
            const d2 = new Date(today);
            const diffTime = Math.abs(d2.getTime() - d1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                stats.streak++;
            } else if (diffDays > 1) {
                 // Freeze logic should have handled this in getUserStats, 
                 // but if not, reset to 1 (starting fresh today)
                 stats.streak = 1;
            }
        } else {
            stats.streak = 1;
        }
        stats.lastStudyDate = today;
    } else {
        if (!stats.lastStudyDate) stats.lastStudyDate = today;
    }

    // XP Calculation
    let xpGain = 0;
    const multiplier = (stats.xpBoostEndTime > Date.now()) ? 2 : 1; // Boost uses local device time for duration, acceptable

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

export const updateGameStats = (game: 'matching' | 'typing' | 'chain' | 'maze' | 'wordSearch', score: number) => {
    const stats = getUserStats();
    
    if (game === 'matching') {
        if (score > stats.weekly.matchingBestTime) stats.weekly.matchingBestTime = score;
    } else if (game === 'typing') {
        if (score > stats.weekly.typingHighScore) stats.weekly.typingHighScore = score;
    } else if (game === 'chain') {
        if (score > stats.weekly.chainHighScore) stats.weekly.chainHighScore = score;
    } else if (game === 'maze') {
        if (score > stats.weekly.mazeHighScore) stats.weekly.mazeHighScore = score;
    } else if (game === 'wordSearch') {
        if (score > stats.weekly.wordSearchHighScore) stats.weekly.wordSearchHighScore = score;
    }
    
    saveUserStats(stats);
};

export const updateTimeSpent = (minutes: number): Badge[] => {
    const stats = getUserStats();
    stats.totalTimeSpent += minutes;
    saveUserStats(stats);

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

// --- Daily Quests (Turkey Time) ---

export const getDailyState = () => {
    try {
        const stored = localStorage.getItem(KEYS.DAILY);
        const today = getTodayDateString(); // Turkey Date
        
        if (stored) {
            const data = JSON.parse(stored);
            if (data.date === today) return data;
        }

        // Generate New Quests
        const newQuests = generateDailyQuests();
        const newState = {
            date: today,
            quests: newQuests,
            // wordOfTheDayIndex no longer needed for random word, but keeping structure for compatibility
            wordOfTheDayIndex: 0 
        };
        localStorage.setItem(KEYS.DAILY, JSON.stringify(newState));
        return newState;
    } catch { 
        return { date: '', quests: [], wordOfTheDayIndex: 0 };
    }
};

const generateDailyQuests = (): Quest[] => {
    const allTypes: Quest['type'][] = [
        'view_cards', 
        'finish_quiz', 
        'perfect_quiz', 
        'earn_xp', 
        'play_matching', 
        'play_typing', 
        'play_chain', 
        'play_maze', 
        'play_word_search'
    ];
    const pickedTypes = allTypes.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    return pickedTypes.map((type, i) => {
        let target = 0;
        let reward = 0;
        let desc = '';
        
        switch(type) {
            case 'view_cards': target = 20; reward = 100; desc = '20 Kelime Kartı İncele'; break;
            case 'finish_quiz': target = 2; reward = 150; desc = '2 Test Bitir'; break;
            case 'perfect_quiz': target = 1; reward = 250; desc = '1 Testi Hatasız Bitir'; break;
            case 'earn_xp': target = 500; reward = 150; desc = '500 XP Kazan'; break;
            case 'play_matching': target = 1; reward = 100; desc = 'Eşleştirme Oyunu Oyna'; break;
            case 'play_typing': target = 100; reward = 150; desc = 'Yazma Oyununda 100 Puan Al'; break;
            case 'play_chain': target = 50; reward = 150; desc = 'Kelime Türetmece 50 Puan Al'; break;
            case 'play_maze': target = 1; reward = 100; desc = 'Labirent Oyununu Kazan'; break;
            case 'play_word_search': target = 100; reward = 120; desc = 'Bulmacada 100 Puan Al'; break;
        }
        
        return {
            id: `q_${Date.now()}_${i}`,
            description: desc,
            target,
            current: 0,
            rewardXP: reward,
            isCompleted: false,
            type
        };
    });
};

export const updateQuestProgress = (type: string, amount: number) => {
    const daily = getDailyState();
    let changed = false;
    
    daily.quests.forEach((q: Quest) => {
        if (!q.isCompleted && q.type === type) {
            q.current += amount;
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

// --- Market & Inventory ---

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

// --- Admin ---

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

// --- Random Word (Revised Logic) ---

export const getRandomWordForGrade = (grade: GradeLevel | string | null) => {
    if (!grade) return null;

    // Get units for this grade
    const units = UNIT_ASSETS[grade];
    if (!units || units.length === 0) return null;

    // Pick a random unit (ignoring 'all' units if preferred, but keeping it simple for variety)
    // Filter out empty units first
    const validUnits = units.filter(u => VOCABULARY[u.id] && VOCABULARY[u.id].length > 0);
    
    if (validUnits.length === 0) return null;

    const randomUnit = validUnits[Math.floor(Math.random() * validUnits.length)];
    const words = VOCABULARY[randomUnit.id];
    
    if (!words || words.length === 0) return null;

    const randomWord = words[Math.floor(Math.random() * words.length)];
    return randomWord;
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
    localStorage.removeItem(KEYS.MEMORIZED);
    localStorage.removeItem(KEYS.BOOKMARKS);
    localStorage.removeItem(KEYS.SRS);
};
