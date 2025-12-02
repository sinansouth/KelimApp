
import { VOCABULARY } from '../data/vocabulary';
import { WordCard, Badge, Avatar, ThemeType, GradeLevel, Quest, DailyState, UnitDef } from '../types';
import { APP_CONFIG } from '../config/appConfig';
import { AVATARS, BADGES, UNIT_ASSETS, FRAMES, BACKGROUNDS } from '../data/assets'; 
import { syncLocalToCloud } from './firebase';

const DATA_VERSION = APP_CONFIG.dataVersion; 
const DATA_VERSION_KEY = 'kelimapp_data_version';
const LAST_UPDATED_KEY = 'lgs_last_data_update';
const LAST_UID_KEY = 'lgs_last_uid'; 

// --- ADMIN / DEV TOOLS ---

export const adminAddXP = (amount: number) => {
    const stats = getUserStats();
    stats.xp += amount;
    stats.level = calculateLevel(stats.xp);
    saveUserStats(stats);
};

export const adminSetLevel = (level: number) => {
    const stats = getUserStats();
    let requiredXP = 0;
    if (level <= 1) requiredXP = 0;
    else if (level <= 2) requiredXP = 100;
    else if (level <= 3) requiredXP = 250;
    else if (level <= 4) requiredXP = 500;
    else if (level <= 5) requiredXP = 800;
    else if (level <= 6) requiredXP = 1200;
    else if (level <= 7) requiredXP = 1700;
    else if (level <= 8) requiredXP = 2300;
    else if (level <= 9) requiredXP = 3000;
    else if (level <= 10) requiredXP = 4000;
    else requiredXP = 5500 + ((level - 10) * 1500);
    
    stats.xp = requiredXP;
    stats.level = level;
    saveUserStats(stats);
};

export const adminUnlockAllItems = () => {
    const profile = getUserProfile();
    
    const allThemes = ['light', 'dark', 'neon', 'ocean', 'sunset', 'forest', 'royal', 'candy', 'cyberpunk', 'coffee', 'galaxy', 'retro', 'matrix', 'midnight', 'volcano', 'ice', 'lavender', 'gamer', 'luxury', 'comic', 'nature_soft'];
    profile.purchasedThemes = allThemes;

    profile.purchasedFrames = FRAMES.map(f => f.id);

    profile.purchasedBackgrounds = BACKGROUNDS.map(b => b.id);

    saveUserProfile(profile);
};

export const adminResetDailyQuests = () => {
    localStorage.removeItem(DAILY_STATE_KEY);
    getDailyState();
};

export interface UserProfile {
  name: string;
  grade: string;
  avatar: string;
  frame: string; 
  background: string;
  purchasedThemes: string[]; 
  purchasedFrames: string[]; 
  purchasedBackgrounds: string[];
  inventory: {
    streakFreezes: number; // Kept for backward compatibility but not used
  };
  lastUsernameChange?: number; 
}

export interface LastActivity {
  grade: string;
  unitId: string;
  timestamp: number;
}

export interface UserStats {
  flashcardsViewed: number;
  quizCorrect: number;
  quizWrong: number;
  date: string;
  dailyGoal: number;
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: string | null;
  badges: string[];
  xpBoostEndTime: number; // Kept for backward compatibility but not used
  lastGoalMetDate: string | null; 
  viewedWordsToday: string[]; 
  breakdown?: Record<string, { 
    viewed: number;
    correct: number;
    wrong: number;
  }>;
  perfectQuizzes: number;
  questsCompleted: number;
  totalTimeSpent: number; 
  completedUnits: string[];
  completedGrades: string[];
  lastActivity?: LastActivity | null; // New persistent field
  
  weekly: {
      weekId: string; 
      quizCorrect: number;
      quizWrong?: number; // Added for leaderboard accuracy
      cardsViewed: number;
      matchingBestTime: number; 
      typingHighScore: number;
      chainHighScore: number; 
  }
}

export interface AppSettings {
  soundEnabled: boolean;
  theme: ThemeType;
}

export interface SRSData {
  [key: string]: {
    box: number;
    nextReview: number;
  };
}

const PROFILE_KEY = 'lgs_user_profile';
const STATS_KEY = 'lgs_user_stats';
const SETTINGS_KEY = 'lgs_app_settings';
const MEMORIZED_KEY = 'lgs_memorized';
const BOOKMARKS_KEY = 'lgs_bookmarks';
const SRS_KEY = 'lgs_srs_data';
const OLD_LAST_ACTIVITY_KEY = 'lgs_last_activity'; // Deprecated
const READ_ANNOUNCEMENT_KEY = 'lgs_read_announcement_id';
const DAILY_STATE_KEY = 'lgs_daily_state';
const SRS_INTERVALS = [0, 1, 3, 7, 14, 30]; 
const GOAL_STEPS = [5, 10, 15, 20, 30];

const USER_SPECIFIC_KEYS = [
    PROFILE_KEY, 
    STATS_KEY, 
    MEMORIZED_KEY, 
    BOOKMARKS_KEY, 
    SRS_KEY, 
    OLD_LAST_ACTIVITY_KEY, 
    READ_ANNOUNCEMENT_KEY, 
    DAILY_STATE_KEY, 
    LAST_UPDATED_KEY,
    SETTINGS_KEY 
];
const ALL_STORAGE_KEYS = [...USER_SPECIFIC_KEYS, DATA_VERSION_KEY, LAST_UID_KEY];

const getCurrentWeekId = (): string => {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
};


export const checkIfBrowser = (): boolean => {
  // @ts-ignore
  if (window.Capacitor) {
    return false;
  }
  
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (document.referrer.includes('android-app://')) return false;
  // @ts-ignore
  if ((navigator as any).standalone) return false;
  
  return !isStandalone;
};

export const checkDataVersion = (): boolean => {
    const storedVersionStr = localStorage.getItem(DATA_VERSION_KEY);
    const storedVersion = storedVersionStr ? parseInt(storedVersionStr, 10) : 0;

    if (storedVersion < DATA_VERSION) {
        console.log(`New version detected (${DATA_VERSION}). Wiping old data...`);
        ALL_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
        localStorage.setItem(DATA_VERSION_KEY, DATA_VERSION.toString());
        return true;
    }
    return false;
};

export const clearLocalUserData = () => {
    USER_SPECIFIC_KEYS.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem(LAST_UID_KEY);
};

export const isLocalDataExists = (): boolean => {
    const stats = getUserStats();
    const profile = getUserProfile();
    return (stats.xp > 0) || 
           (profile.name !== '') || 
           (profile.purchasedThemes.length > 2) || 
           (profile.frame !== 'frame_none');
};

export const updateLastUpdatedTimestamp = () => {
    localStorage.setItem(LAST_UPDATED_KEY, Date.now().toString());
};

export const getLastUpdatedTimestamp = (): number => {
    const val = localStorage.getItem(LAST_UPDATED_KEY);
    return val ? parseInt(val, 10) : 0;
};

export const getNextDailyGoal = (currentGoal: number): number => {
  const index = GOAL_STEPS.indexOf(currentGoal);
  if (index === -1) return 5;
  if (index >= GOAL_STEPS.length - 1) return GOAL_STEPS[GOAL_STEPS.length - 1];
  return GOAL_STEPS[index + 1];
};

export const getUserProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    const defaults: UserProfile = { 
        name: '', 
        grade: '', 
        avatar: '🧑‍🎓', 
        frame: 'frame_none',
        background: 'bg_default',
        purchasedThemes: ['light', 'dark'],
        purchasedFrames: ['frame_none'],
        purchasedBackgrounds: ['bg_default'],
        inventory: { streakFreezes: 0 },
        lastUsernameChange: 0
    };
    if (!stored) return defaults;
    
    const parsed = JSON.parse(stored);
    if (!parsed.avatar) parsed.avatar = '🧑‍🎓'; 
    if (!parsed.purchasedThemes) parsed.purchasedThemes = ['light', 'dark'];
    if (!parsed.purchasedFrames) parsed.purchasedFrames = ['frame_none'];
    if (!parsed.frame) parsed.frame = 'frame_none';
    if (!parsed.background) parsed.background = 'bg_default';
    if (!parsed.purchasedBackgrounds) parsed.purchasedBackgrounds = ['bg_default'];
    if (!parsed.inventory) parsed.inventory = { streakFreezes: 0 };
    if (!parsed.lastUsernameChange) parsed.lastUsernameChange = 0;

    return parsed;
  } catch (e) {
    return { 
        name: '', 
        grade: '', 
        avatar: '🧑‍🎓', 
        frame: 'frame_none',
        background: 'bg_default',
        purchasedThemes: ['light', 'dark'],
        purchasedFrames: ['frame_none'],
        purchasedBackgrounds: ['bg_default'],
        inventory: { streakFreezes: 0 },
        lastUsernameChange: 0
    };
  }
};

export const saveUserProfile = (profile: UserProfile, skipSync: boolean = false) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  updateLastUpdatedTimestamp();
  if (!skipSync) syncLocalToCloud();
};

export const getAppSettings = (): AppSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        return stored ? JSON.parse(stored) : { soundEnabled: true, theme: 'dark' };
    } catch {
        return { soundEnabled: true, theme: 'dark' };
    }
};

export const saveAppSettings = (settings: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    updateLastUpdatedTimestamp();
    syncLocalToCloud();
};

export const getTheme = (): ThemeType => {
    return getAppSettings().theme;
};

export const saveTheme = (theme: ThemeType) => {
    const current = getAppSettings();
    saveAppSettings({ ...current, theme });
};

export const getUserStats = (): UserStats => {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    const today = new Date();
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const currentWeekId = getCurrentWeekId();

    const defaultStats: UserStats = { 
      flashcardsViewed: 0, 
      quizCorrect: 0, 
      quizWrong: 0, 
      date: today.toDateString(),
      dailyGoal: 5,
      xp: 0, level: 1, streak: 0, lastStudyDate: null, badges: [],
      xpBoostEndTime: 0,
      lastGoalMetDate: null, viewedWordsToday: [], breakdown: {},
      perfectQuizzes: 0, questsCompleted: 0, totalTimeSpent: 0, completedUnits: [], completedGrades: [],
      lastActivity: null,
      weekly: {
          weekId: currentWeekId,
          quizCorrect: 0,
          quizWrong: 0,
          cardsViewed: 0,
          matchingBestTime: 0,
          typingHighScore: 0,
          chainHighScore: 0
      }
    };

    if (!stored) return defaultStats;

    const parsedStats = JSON.parse(stored);
    let needsUpdate = false;
    
    if (!parsedStats.weekly) {
        parsedStats.weekly = defaultStats.weekly;
        needsUpdate = true;
    }
    
    if (typeof parsedStats.weekly.chainHighScore === 'undefined') {
        parsedStats.weekly.chainHighScore = 0;
        needsUpdate = true;
    }

    if (typeof parsedStats.weekly.quizWrong === 'undefined') {
        parsedStats.weekly.quizWrong = 0;
        needsUpdate = true;
    }
    
    if (parsedStats.lastActivity === undefined) {
        parsedStats.lastActivity = null;
        // Try to migrate old activity if exists
        try {
            const oldActivity = localStorage.getItem(OLD_LAST_ACTIVITY_KEY);
            if (oldActivity) {
                parsedStats.lastActivity = JSON.parse(oldActivity);
            }
        } catch(e) {}
        needsUpdate = true;
    }

    if (parsedStats.weekly.weekId !== currentWeekId) {
        console.log("New week detected. Resetting weekly leaderboard stats.");
        parsedStats.weekly = {
            weekId: currentWeekId,
            quizCorrect: 0,
            quizWrong: 0,
            cardsViewed: 0,
            matchingBestTime: 0,
            typingHighScore: 0,
            chainHighScore: 0
        };
        needsUpdate = true;
    }

    const storedDate = new Date(parsedStats.date);
    const storedDateStr = storedDate.toDateString();
    const currentDateStr = today.toDateString();

    if (storedDateStr !== currentDateStr) {
        parsedStats.viewedWordsToday = [];
        parsedStats.flashcardsViewed = 0; 
        parsedStats.quizCorrect = 0; 
        parsedStats.quizWrong = 0; 
        
        parsedStats.date = currentDateStr;
        needsUpdate = true;
    }
    
    // Streak Logic Check
    if (parsedStats.lastStudyDate) {
        const lastDate = new Date(parsedStats.lastStudyDate);
        lastDate.setHours(0, 0, 0, 0);
        
        const yesterdayMidnight = new Date(todayMidnight);
        yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);

        // If last study date is strictly less than yesterday, streak is broken
        if (lastDate.getTime() < yesterdayMidnight.getTime() && parsedStats.streak > 0) {
             parsedStats.streak = 0;
             needsUpdate = true;
        }
    }

    if (needsUpdate) {
        localStorage.setItem(STATS_KEY, JSON.stringify(parsedStats));
    }

    return parsedStats;
  } catch (e) {
    return { 
        flashcardsViewed: 0, quizCorrect: 0, quizWrong: 0, 
        date: new Date().toDateString(), dailyGoal: 5,
        xp: 0, level: 1, streak: 0, lastStudyDate: null, badges: [],
        xpBoostEndTime: 0,
        lastGoalMetDate: null, viewedWordsToday: [], breakdown: {},
        perfectQuizzes: 0, questsCompleted: 0, totalTimeSpent: 0, completedUnits: [], completedGrades: [],
        lastActivity: null,
        weekly: { weekId: getCurrentWeekId(), quizCorrect: 0, quizWrong: 0, cardsViewed: 0, matchingBestTime: 0, typingHighScore: 0, chainHighScore: 0 }
    };
  }
};

export const saveUserStats = (stats: UserStats, skipSync: boolean = false) => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    updateLastUpdatedTimestamp();
    if (!skipSync) syncLocalToCloud();
};

const calculateLevel = (xp: number): number => {
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 500) return 3;
    if (xp < 800) return 4;
    if (xp < 1200) return 5;
    if (xp < 1700) return 6;
    if (xp < 2300) return 7;
    if (xp < 3000) return 8;
    if (xp < 4000) return 9;
    if (xp < 5500) return 10;
    return 10 + Math.floor((xp - 5500) / 1500);
};

export const spendXP = (amount: number): boolean => {
    const stats = getUserStats();
    if (stats.xp >= amount) {
        stats.xp -= amount;
        
        const newLevel = calculateLevel(stats.xp);
        stats.level = newLevel;

        const profile = getUserProfile();
        const currentAvatarObj = AVATARS.find(a => a.icon === profile.avatar);
        
        if (currentAvatarObj && currentAvatarObj.unlockLevel > newLevel) {
            const availableAvatars = AVATARS.filter(a => a.unlockLevel <= newLevel);
            availableAvatars.sort((a, b) => b.unlockLevel - a.unlockLevel);
            if (availableAvatars.length > 0) {
                profile.avatar = availableAvatars[0].icon;
            } else {
                profile.avatar = '🧑‍🎓'; 
            }
            saveUserProfile(profile);
        }
        
        saveUserStats(stats);
        return true;
    }
    return false;
};

const XP_REWARDS = {
    CARD_VIEW: 10,
    QUIZ_CORRECT: 15,
    QUIZ_WRONG: 5,
    REVIEW_REMEMBER: 25,
    REVIEW_FORGOT: 5
};

export const updateTimeSpent = (minutes: number) => {
    const stats = getUserStats();
    stats.totalTimeSpent += minutes;
    let newBadges: Badge[] = [];
    BADGES.forEach(badge => {
        if (!stats.badges.includes(badge.id)) {
             if (badge.condition(stats)) {
                 stats.badges.push(badge.id);
                 newBadges.push(badge);
             }
        }
    });
    saveUserStats(stats);
    return newBadges;
};

const checkCompletion = (stats: UserStats): string[] => {
    const newlyCompleted: string[] = [];
    const memorized = getMemorizedSet();

    for (const grade in UNIT_ASSETS) {
        const units = UNIT_ASSETS[grade];
        units.forEach(unit => {
            if (unit.id.endsWith('all') || unit.id === 'uAll') return;
            if (stats.completedUnits.includes(unit.id)) return;
            
            const words = VOCABULARY[unit.id] || [];
            if (words.length === 0) return;

            const allMemorized = words.every(w => memorized.has(`${unit.id}|${w.english}`));
            if (allMemorized) {
                stats.completedUnits.push(unit.id);
                newlyCompleted.push(unit.id);
            }
        });
        
        if (!stats.completedGrades.includes(grade)) {
            const gradeUnits = UNIT_ASSETS[grade].filter(u => !u.id.endsWith('all') && u.id !== 'uAll');
            const allGradeUnitsCompleted = gradeUnits.every(u => stats.completedUnits.includes(u.id));
            if (allGradeUnitsCompleted && gradeUnits.length > 0) {
                stats.completedGrades.push(grade);
            }
        }
    }
    return newlyCompleted;
}

export const updateGameStats = (game: 'matching' | 'typing' | 'chain', scoreOrTime: number) => {
    const stats = getUserStats();
    let updated = false;
    
    let xpGain = 0;

    if (game === 'matching') {
        xpGain = 20;
        if (scoreOrTime > 200) xpGain += 10;

        if (scoreOrTime > stats.weekly.matchingBestTime) {
            stats.weekly.matchingBestTime = scoreOrTime;
            updated = true;
        }
        updateQuestProgress('play_matching', 1);
    } else if (game === 'typing') {
        xpGain = Math.floor(scoreOrTime / 2);
        
        if (scoreOrTime > stats.weekly.typingHighScore) {
            stats.weekly.typingHighScore = scoreOrTime;
            updated = true;
        }
        updateQuestProgress('play_typing', 1);
    } else if (game === 'chain') {
        xpGain = Math.floor(scoreOrTime / 2);

        if (scoreOrTime > stats.weekly.chainHighScore) {
            stats.weekly.chainHighScore = scoreOrTime;
            updated = true;
        }
        updateQuestProgress('play_chain', 1);
    }
    
    if (xpGain > 0) {
        stats.xp += xpGain;
        stats.level = calculateLevel(stats.xp);
        updateQuestProgress('earn_xp', xpGain);
        updated = true;
    }

    if (updated) {
        saveUserStats(stats);
        syncLocalToCloud();
    }
};

export const updateStats = (type: 'card_view' | 'quiz_correct' | 'quiz_wrong' | 'perfect_quiz' | 'memorized' | 'review_remember' | 'review_forgot', grade?: string | null, wordId?: string, quizSize?: number): Badge[] => {
  const stats = getUserStats(); 
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const newBadges: Badge[] = [];

  if (stats.lastStudyDate !== todayStr) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (stats.lastStudyDate === yesterdayStr) {
          stats.streak += 1;
      } else {
          stats.streak = 1;
      }
      
      stats.lastStudyDate = todayStr;
  }

  let xpGained = 0;

  if (type === 'card_view') {
      if (wordId && !stats.viewedWordsToday.includes(wordId)) {
          stats.flashcardsViewed += 1; 
          stats.weekly.cardsViewed += 1; 
          stats.viewedWordsToday.push(wordId);
          xpGained = XP_REWARDS.CARD_VIEW;
          if (grade) {
              if (!stats.breakdown) stats.breakdown = {};
              if (!stats.breakdown[grade]) stats.breakdown[grade] = { viewed: 0, correct: 0, wrong: 0 };
              stats.breakdown[grade].viewed += 1;
          }
      } else if (!wordId) {
           stats.flashcardsViewed += 1;
           stats.weekly.cardsViewed += 1;
           xpGained = 2;
      }
  } else if (type === 'quiz_correct') {
      stats.quizCorrect += 1; 
      stats.weekly.quizCorrect += 1; 
      xpGained = XP_REWARDS.QUIZ_CORRECT;
      if (grade) {
          if (!stats.breakdown) stats.breakdown = {};
          if (!stats.breakdown[grade]) stats.breakdown[grade] = { viewed: 0, correct: 0, wrong: 0 };
          stats.breakdown[grade].correct += 1;
      }
  } else if (type === 'quiz_wrong') {
      stats.quizWrong += 1; 
      if (!stats.weekly.quizWrong) stats.weekly.quizWrong = 0;
      stats.weekly.quizWrong += 1; // Track weekly wrong answers
      
      xpGained = XP_REWARDS.QUIZ_WRONG;
      if (grade) {
          if (!stats.breakdown) stats.breakdown = {};
          if (!stats.breakdown[grade]) stats.breakdown[grade] = { viewed: 0, correct: 0, wrong: 0 };
          stats.breakdown[grade].wrong += 1;
      }
  } else if (type === 'memorized') {
      xpGained = 20; 
      checkCompletion(stats); 
  } else if (type === 'review_remember') {
      xpGained = XP_REWARDS.REVIEW_REMEMBER; 
  } else if (type === 'review_forgot') {
      xpGained = XP_REWARDS.REVIEW_FORGOT; 
  } else if (type === 'perfect_quiz') {
      stats.perfectQuizzes += 1;
      xpGained = 60; 
  }

  // Add XP
  if (xpGained > 0) {
      stats.xp += xpGained;
      updateQuestProgress('earn_xp', xpGained);
  }

  stats.level = calculateLevel(stats.xp);

  // Badge Checks
  BADGES.forEach(badge => {
      if (!stats.badges.includes(badge.id)) {
          if (badge.condition(stats, { quizSize })) { 
              stats.badges.push(badge.id);
              newBadges.push(badge);
          }
      }
  });

  const totalInteractions = stats.flashcardsViewed + stats.quizCorrect + stats.quizWrong;
  if (totalInteractions >= stats.dailyGoal) {
      stats.lastGoalMetDate = todayStr;
  }

  saveUserStats(stats);
  return newBadges;
};

export const resetAppProgress = (scope: { type: 'all' | 'grade' | 'unit', value?: string }) => {
    const stats = getUserStats();
    const srs = getSRSData();
    const bookmarks = getMemorizedSet('lgs_bookmarks');
    const memorized = getMemorizedSet('lgs_memorized');

    if (scope.type === 'all') {
        stats.flashcardsViewed = 0;
        stats.quizCorrect = 0;
        stats.quizWrong = 0;
        stats.xp = 0;
        stats.level = 1;
        stats.streak = 0;
        stats.badges = [];
        stats.completedUnits = [];
        stats.completedGrades = [];
        stats.viewedWordsToday = [];
        stats.perfectQuizzes = 0;
        stats.questsCompleted = 0;
        stats.totalTimeSpent = 0;
        stats.breakdown = {};
        stats.lastActivity = null;
        stats.weekly = {
            weekId: getCurrentWeekId(),
            quizCorrect: 0,
            quizWrong: 0,
            cardsViewed: 0,
            matchingBestTime: 0,
            typingHighScore: 0,
            chainHighScore: 0
        };

        localStorage.setItem(SRS_KEY, JSON.stringify({}));
        localStorage.setItem(MEMORIZED_KEY, JSON.stringify([]));
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]));
        localStorage.removeItem(OLD_LAST_ACTIVITY_KEY);
    } 
    else if (scope.type === 'grade' && scope.value) {
        const grade = scope.value;
        
        stats.completedGrades = stats.completedGrades.filter(g => g !== grade);
        stats.completedUnits = stats.completedUnits.filter(u => !u.startsWith(`g${grade}u`)); 
        
        const filterSet = (set: Set<string>) => {
            const newSet = new Set<string>();
            set.forEach(key => {
                if (key.includes('|')) {
                    const [uId] = key.split('|');
                    const prefix = `g${grade}`;
                    if (!uId.startsWith(prefix) && uId !== `u${grade}` && !uId.startsWith(grade)) {
                        newSet.add(key);
                    }
                } else {
                   newSet.add(key);
                }
            });
            return newSet;
        };

        const newMem = filterSet(memorized);
        const newBook = filterSet(bookmarks);
        
        localStorage.setItem(MEMORIZED_KEY, JSON.stringify([...newMem]));
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...newBook]));
        
        const newSrs: SRSData = {};
        Object.keys(srs).forEach(key => {
            if (key.includes('|')) {
                const [uId] = key.split('|');
                const prefix = `g${grade}`;
                 if (!uId.startsWith(prefix) && !uId.startsWith(grade)) {
                    newSrs[key] = srs[key];
                }
            } else {
                newSrs[key] = srs[key];
            }
        });
        localStorage.setItem(SRS_KEY, JSON.stringify(newSrs));
    } 
    else if (scope.type === 'unit' && scope.value) {
        const unitId = scope.value;
        stats.completedUnits = stats.completedUnits.filter(u => u !== unitId);
        
        const filterSet = (set: Set<string>) => {
             const newSet = new Set<string>();
             set.forEach(key => {
                 if (key.includes('|')) {
                     const [uId] = key.split('|');
                     if (uId !== unitId) newSet.add(key);
                 } else {
                     newSet.add(key);
                 }
             });
             return newSet;
        };

        const newMem = filterSet(memorized);
        const newBook = filterSet(bookmarks);
        
        localStorage.setItem(MEMORIZED_KEY, JSON.stringify([...newMem]));
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...newBook]));

        const newSrs: SRSData = {};
        Object.keys(srs).forEach(key => {
            if (key.includes('|')) {
                 const [uId] = key.split('|');
                 if (uId !== unitId) newSrs[key] = srs[key];
            } else {
                newSrs[key] = srs[key];
            }
        });
        localStorage.setItem(SRS_KEY, JSON.stringify(newSrs));
    }

    saveUserStats(stats);
    updateLastUpdatedTimestamp();
    syncLocalToCloud();
};

export const resetSRSData = () => { localStorage.setItem(SRS_KEY, JSON.stringify({})); updateLastUpdatedTimestamp(); syncLocalToCloud(); };
export const resetBookmarks = (scope: { type: 'all' | 'grade' | 'unit', value?: string }) => { resetAppProgress(scope); };
export const resetMemorized = (scope: { type: 'all' | 'grade' | 'unit', value?: string }) => { resetAppProgress(scope); };

export const saveLastActivity = (grade: string, unitId: string) => {
  const stats = getUserStats();
  stats.lastActivity = { grade, unitId, timestamp: Date.now() };
  saveUserStats(stats); // This syncs to cloud automatically
};

export const getLastActivity = (): LastActivity | null => {
  const stats = getUserStats();
  return stats.lastActivity || null;
};

const getSRSData = (): SRSData => {
  try {
    return JSON.parse(localStorage.getItem(SRS_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveSRSData = (data: SRSData, skipSync: boolean = false) => {
  localStorage.setItem(SRS_KEY, JSON.stringify(data));
  updateLastUpdatedTimestamp();
  if(!skipSync) syncLocalToCloud();
};

export const processOverdueSRS = () => {
    const data = getSRSData();
    const now = Date.now();
    let changed = false;
    Object.keys(data).forEach(key => {
        const entry = data[key];
        if (entry.box > 1 && entry.box < 5) {
            const intervalDays = SRS_INTERVALS[entry.box];
            const overdueThreshold = intervalDays * 2 * 24 * 60 * 60 * 1000; 
            if (entry.nextReview < now - overdueThreshold) {
                data[key] = { box: 1, nextReview: now };
                changed = true;
            }
        }
    });
    if (changed) { saveSRSData(data); }
};

export const getSRSStatus = (): { [key: number]: number } => {
    const data = getSRSData();
    const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    Object.keys(data).forEach(key => {
        const entry = data[key];
        if (entry && typeof entry.box === 'number' && entry.box >= 1 && entry.box <= 5) {
            counts[entry.box] = (counts[entry.box] || 0) + 1;
        }
    });
    return counts;
};

export const registerSRSInteraction = (uniqueKey: string) => {
    const data = getSRSData();
    if (!data[uniqueKey]) {
        data[uniqueKey] = { box: 0, nextReview: Date.now() };
        saveSRSData(data);
    }
};

export const handleQuizResult = (uniqueKey: string, isCorrect: boolean) => {
  const data = getSRSData();
  const now = Date.now();
  if (!data[uniqueKey]) { data[uniqueKey] = { box: 0, nextReview: 0 }; }
  const entry = data[uniqueKey];
  if (isCorrect) {
    if (entry.box === 0) {
        entry.box = 1;
        entry.nextReview = now + (1 * 24 * 60 * 60 * 1000); 
    } 
  } else {
    entry.box = 1; 
    entry.nextReview = now + (1 * 24 * 60 * 60 * 1000);
  }
  data[uniqueKey] = entry;
  saveSRSData(data);
};

export const handleReviewResult = (uniqueKey: string, isCorrect: boolean) => {
    const data = getSRSData();
    const now = Date.now();
    if (!data[uniqueKey]) { data[uniqueKey] = { box: 0, nextReview: 0 }; }
    const entry = data[uniqueKey];
    if (isCorrect) {
        if (entry.box < 5) {
            entry.box += 1;
            const daysToAdd = SRS_INTERVALS[entry.box];
            entry.nextReview = now + (daysToAdd * 24 * 60 * 60 * 1000);
        } else {
            entry.nextReview = now + (30 * 24 * 60 * 60 * 1000);
        }
    } else {
        entry.box = 1; 
        entry.nextReview = now + (1 * 24 * 60 * 60 * 1000);
    }
    data[uniqueKey] = entry;
    saveSRSData(data);
};

export const getDueWords = (allowedUnitIds?: string[]): WordCard[] => {
    processOverdueSRS();
    const data = getSRSData();
    const now = Date.now();
    const dueKeys = Object.keys(data).filter(k => {
        const entry = data[k];
        return entry.box >= 0 && entry.nextReview <= now;
    });
    if (dueKeys.length === 0) return [];
    const result: WordCard[] = [];
    const allowedSet = allowedUnitIds ? new Set(allowedUnitIds) : null;
    dueKeys.forEach(key => {
        let unitId = '';
        let english = key;
        if (key.includes('|')) { [unitId, english] = key.split('|'); }
        if (allowedSet && unitId && !allowedSet.has(unitId)) { return; }
        let found = false;
        if (unitId && VOCABULARY[unitId]) {
             const w = VOCABULARY[unitId].find(w => w.english === english);
             if (w) { result.push({ ...w, unitId: unitId }); found = true; }
        }
        if (!found) {
             const allWords = Object.values(VOCABULARY).flat();
             const w = allWords.find(w => w.english === key); 
             if (w) result.push(w);
        }
    });
    return result;
};

export const getTotalDueCount = (): number => {
    processOverdueSRS();
    const data = getSRSData();
    const now = Date.now();
    return Object.keys(data).filter(k => {
        const entry = data[k];
        return entry.box >= 0 && entry.nextReview <= now;
    }).length;
};

export const getDueCountForGrade = (grade: GradeLevel): number => {
    const gradeUnits = UNIT_ASSETS[grade];
    let allowedUnitIds: string[] = [];
    if (gradeUnits) { allowedUnitIds = gradeUnits.map(u => u.id); }
    return getDueWords(allowedUnitIds).length;
};

export const getDueGrades = (): string[] => {
    const dueWords = getDueWords();
    const grades = new Set<string>();
    dueWords.forEach(w => {
        if (w.unitId) {
            for (const [grade, units] of Object.entries(UNIT_ASSETS)) {
                if (units.some(u => u.id === w.unitId)) { grades.add(grade); break; }
            }
        }
    });
    return Array.from(grades);
};

export const getMemorizedSet = (key: string = MEMORIZED_KEY): Set<string> => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const internalAddToMemorized = (uniqueKey: string) => {
    const set = getMemorizedSet();
    if (!set.has(uniqueKey)) {
        set.add(uniqueKey);
        localStorage.setItem(MEMORIZED_KEY, JSON.stringify([...set]));
        updateLastUpdatedTimestamp();
        syncLocalToCloud();
        internalRemoveFromBookmarks(uniqueKey);
    }
};

const internalRemoveFromMemorized = (uniqueKey: string) => {
    const set = getMemorizedSet();
    if (set.has(uniqueKey)) {
        set.delete(uniqueKey);
        localStorage.setItem(MEMORIZED_KEY, JSON.stringify([...set]));
        updateLastUpdatedTimestamp();
        syncLocalToCloud();
    }
};

const internalAddToBookmarks = (uniqueKey: string) => {
    try {
        const stored = localStorage.getItem(BOOKMARKS_KEY);
        const set = stored ? new Set(JSON.parse(stored)) : new Set();
        if (!set.has(uniqueKey)) {
            set.add(uniqueKey);
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...set]));
            updateLastUpdatedTimestamp();
            syncLocalToCloud();
            internalRemoveFromMemorized(uniqueKey);
        }
    } catch (e) {}
};

const internalRemoveFromBookmarks = (uniqueKey: string) => {
    try {
        const stored = localStorage.getItem(BOOKMARKS_KEY);
        if (stored) {
            const set = new Set(JSON.parse(stored));
            if (set.has(uniqueKey)) {
                set.delete(uniqueKey);
                localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...set]));
                updateLastUpdatedTimestamp();
                syncLocalToCloud();
            }
        }
    } catch (e) {}
};

export const addToMemorized = (uniqueKey: string) => { internalAddToMemorized(uniqueKey); };
export const removeFromMemorized = (uniqueKey: string) => { internalRemoveFromMemorized(uniqueKey); };
export const addToBookmarks = (uniqueKey: string) => { internalAddToBookmarks(uniqueKey); };
export const removeFromBookmarks = (uniqueKey: string) => { internalRemoveFromBookmarks(uniqueKey); };

export const getLastReadAnnouncementId = (): string => { return localStorage.getItem(READ_ANNOUNCEMENT_KEY) || ''; };
export const setLastReadAnnouncementId = (id: string) => { localStorage.setItem(READ_ANNOUNCEMENT_KEY, id); };

export const buyTheme = (themeId: ThemeType, cost: number): boolean => {
    const profile = getUserProfile();
    if (profile.purchasedThemes.includes(themeId)) return true;
    
    if (spendXP(cost)) {
        profile.purchasedThemes.push(themeId);
        saveUserProfile(profile);
        return true;
    }
    return false;
};

export const buyFrame = (frameId: string, cost: number): boolean => {
    const profile = getUserProfile();
    if (profile.purchasedFrames.includes(frameId)) return true;
    if (spendXP(cost)) {
        profile.purchasedFrames.push(frameId);
        saveUserProfile(profile);
        return true;
    }
    return false;
};

export const equipFrame = (frameId: string) => {
    const profile = getUserProfile();
    if (profile.purchasedFrames.includes(frameId)) {
        profile.frame = frameId;
        saveUserProfile(profile);
    }
};

export const buyBackground = (bgId: string, cost: number): boolean => {
    const profile = getUserProfile();
    if (profile.purchasedBackgrounds?.includes(bgId)) return true;
    if (spendXP(cost)) {
        if (!profile.purchasedBackgrounds) profile.purchasedBackgrounds = ['bg_default'];
        profile.purchasedBackgrounds.push(bgId);
        saveUserProfile(profile);
        return true;
    }
    return false;
};

export const equipBackground = (bgId: string) => {
    const profile = getUserProfile();
    if (profile.purchasedBackgrounds?.includes(bgId)) {
        profile.background = bgId;
        saveUserProfile(profile);
    }
};

const QUEST_TYPES: { type: Quest['type'], desc: (target: number) => string, reward: number, range: number[] }[] = [
    { type: 'view_cards', desc: (t) => `Bugün ${t} kelime kartı çalış`, reward: 50, range: [10, 20, 30, 50] },
    { type: 'finish_quiz', desc: (t) => `Bugün ${t} test bitir`, reward: 100, range: [1, 2, 3] },
    { type: 'perfect_quiz', desc: (t) => `Bugün ${t} testi hatasız bitir`, reward: 200, range: [1, 2] },
    { type: 'earn_xp', desc: (t) => `Bugün ${t} XP kazan`, reward: 50, range: [100, 200, 300, 500] },
    { type: 'play_matching', desc: (t) => `Eşleştirme oyununda ${t} puan yap`, reward: 75, range: [200, 500, 1000] },
    { type: 'play_typing', desc: (t) => `Yazma oyununda ${t} puan yap`, reward: 75, range: [50, 100, 200] },
    { type: 'play_chain', desc: (t) => `Kelime türetmecede ${t} kelime bul`, reward: 100, range: [5, 10, 15] },
];

export const getDailyState = (): DailyState => {
    try {
        const stored = localStorage.getItem(DAILY_STATE_KEY);
        const today = new Date().toDateString();
        
        if (stored) {
            const parsed: DailyState = JSON.parse(stored);
            if (parsed.date === today) {
                return parsed;
            } else {
                
            }
        }

        const allWords = Object.values(VOCABULARY).flat();
        const dateHash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const wordIndex = dateHash % (allWords.length || 1);

        const newQuests: Quest[] = [];
        const availableTypes = [...QUEST_TYPES];
        for(let i=0; i<3; i++) {
            if (availableTypes.length === 0) break;
            const rIndex = Math.floor(Math.random() * availableTypes.length);
            const qType = availableTypes[rIndex];
            availableTypes.splice(rIndex, 1); 

            const target = qType.range[Math.floor(Math.random() * qType.range.length)];
            
            newQuests.push({
                id: `quest_${Date.now()}_${i}`,
                type: qType.type,
                description: qType.desc(target),
                target: target,
                current: 0,
                rewardXP: qType.reward,
                isCompleted: false
            });
        }

        const newState: DailyState = {
            date: today,
            quests: newQuests,
            wordOfTheDayIndex: wordIndex
        };
        
        localStorage.setItem(DAILY_STATE_KEY, JSON.stringify(newState));
        return newState;
    } catch (e) {
        return { date: '', quests: [], wordOfTheDayIndex: 0 };
    }
};

export const updateQuestProgress = (type: Quest['type'], amount: number = 1) => {
    const state = getDailyState();
    let updated = false;
    
    const today = new Date().toDateString();
    if (state.date !== today) {
        return; 
    }

    state.quests = state.quests.map(q => {
        if (q.type === type && !q.isCompleted) {
            q.current += amount;
            if (q.current >= q.target) {
                q.current = q.target;
                q.isCompleted = true;
                
                const stats = getUserStats();
                stats.xp += q.rewardXP;
                stats.questsCompleted += 1; 
                
                BADGES.forEach(badge => {
                     if (!stats.badges.includes(badge.id) && badge.condition(stats)) {
                         stats.badges.push(badge.id);
                     }
                });

                stats.level = calculateLevel(stats.xp);
                saveUserStats(stats);
                updated = true;
            }
            updated = true;
        }
        return q;
    });

    if (updated) {
        localStorage.setItem(DAILY_STATE_KEY, JSON.stringify(state));
    }
};

export const getWordOfTheDay = (): WordCard | null => {
    const state = getDailyState();
    const allWords = Object.values(VOCABULARY).flat();
    if (allWords.length === 0) return null;
    return allWords[state.wordOfTheDayIndex % allWords.length];
};
