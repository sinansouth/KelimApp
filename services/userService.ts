
// ... (imports remain same)
import { VOCABULARY } from '../data/vocabulary';
import { WordCard, Badge, Avatar, ThemeType, GradeLevel, Quest, DailyState, UnitDef } from '../types';
import { APP_CONFIG } from '../config/appConfig';
import { AVATARS, BADGES, UNIT_ASSETS } from '../data/assets';
import { syncLocalToCloud } from './firebase';

const DATA_VERSION = APP_CONFIG.dataVersion; 
const DATA_VERSION_KEY = 'kelimapp_data_version';

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
    streakFreezes: number;
  };
}

// ... (UserStats interface remains same)
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
  xpBoostEndTime: number;
  lastGoalMetDate: string | null; 
  viewedWordsToday: string[]; 
  breakdown?: Record<string, { 
    viewed: number;
    correct: number;
    wrong: number;
  }>;
  // New Stats
  perfectQuizzes: number;
  questsCompleted: number;
  totalTimeSpent: number; // in minutes
  completedUnits: string[]; // Unit IDs
  completedGrades: string[]; // Grade IDs
}

// ... (AppSettings interface and other types remain same)
export interface AppSettings {
  soundEnabled: boolean;
  theme: ThemeType;
}

export interface LastActivity {
  grade: string;
  unitId: string;
  timestamp: number;
}

const PROFILE_KEY = 'lgs_user_profile';
const STATS_KEY = 'lgs_user_stats';
const SETTINGS_KEY = 'lgs_app_settings';
const MEMORIZED_KEY = 'lgs_memorized';
const BOOKMARKS_KEY = 'lgs_bookmarks';
const SRS_KEY = 'lgs_srs_data';
const LAST_ACTIVITY_KEY = 'lgs_last_activity';
const READ_ANNOUNCEMENT_KEY = 'lgs_read_announcement_id';
const DAILY_STATE_KEY = 'lgs_daily_state';

const SRS_INTERVALS = [0, 1, 3, 7, 14, 30]; 

interface SRSData {
  [uniqueKey: string]: {
    box: number;
    nextReview: number; 
  }
}

const GOAL_STEPS = [5, 10, 15, 20, 30];
const ALL_STORAGE_KEYS = [PROFILE_KEY, STATS_KEY, SETTINGS_KEY, MEMORIZED_KEY, BOOKMARKS_KEY, SRS_KEY, LAST_ACTIVITY_KEY, READ_ANNOUNCEMENT_KEY, DAILY_STATE_KEY];


export const checkIfBrowser = (): boolean => {
  // Check if running in Capacitor environment
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

export const isLocalDataExists = (): boolean => {
    const stats = getUserStats();
    const profile = getUserProfile();
    // Eğer kullanıcının XP'si varsa veya profilinde satın alınmış öğeler/değişiklikler varsa yerel verisi var demektir.
    // Ayrıca isim girilmişse de yerel veri kabul edilir.
    return (stats.xp > 0) || 
           (profile.name !== '') || 
           (profile.purchasedThemes.length > 2) || 
           (profile.frame !== 'frame_none');
};

export const getNextDailyGoal = (currentGoal: number): number => {
  const index = GOAL_STEPS.indexOf(currentGoal);
  if (index === -1) return 5;
  if (index >= GOAL_STEPS.length - 1) return GOAL_STEPS[GOAL_STEPS.length - 1];
  return GOAL_STEPS[index + 1];
};

// ... (Rest of the file remains exactly the same, just inserting isLocalDataExists above getNextDailyGoal)
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
        inventory: { streakFreezes: 0 }
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
        inventory: { streakFreezes: 0 }
    };
  }
};

export const saveUserProfile = (profile: UserProfile) => {
  if (profile.name.trim() === "Mors Kain") {
     applyCheatCode();
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  syncLocalToCloud();
};

const applyCheatCode = () => {
    const stats = getUserStats();
    stats.level = 300;
    stats.xp = 999999;
    stats.flashcardsViewed = 5000; 
    stats.quizCorrect = 2000;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    syncLocalToCloud();
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
    const todayStr = today.toISOString().split('T')[0];
    
    const defaultStats: UserStats = { 
      flashcardsViewed: 0, 
      quizCorrect: 0, 
      quizWrong: 0, 
      date: today.toDateString(),
      dailyGoal: 5,
      xp: 0, level: 1, streak: 0, lastStudyDate: null, badges: [],
      xpBoostEndTime: 0,
      lastGoalMetDate: null, viewedWordsToday: [], breakdown: {},
      perfectQuizzes: 0, questsCompleted: 0, totalTimeSpent: 0, completedUnits: [], completedGrades: []
    };

    if (!stored) return defaultStats;

    const parsedStats = JSON.parse(stored);
    
    if (typeof parsedStats.dailyGoal !== 'number') parsedStats.dailyGoal = 5;
    if (!parsedStats.viewedWordsToday) parsedStats.viewedWordsToday = [];
    if (!parsedStats.breakdown) parsedStats.breakdown = {};
    if (parsedStats.xp === undefined) parsedStats.xp = 0;
    if (parsedStats.level === undefined) parsedStats.level = 1;
    if (parsedStats.badges === undefined) parsedStats.badges = [];
    if (parsedStats.lastStudyDate === undefined) parsedStats.lastStudyDate = null;
    if (parsedStats.xpBoostEndTime === undefined) parsedStats.xpBoostEndTime = 0;
    // New fields default checks
    if (parsedStats.perfectQuizzes === undefined) parsedStats.perfectQuizzes = 0;
    if (parsedStats.questsCompleted === undefined) parsedStats.questsCompleted = 0;
    if (parsedStats.totalTimeSpent === undefined) parsedStats.totalTimeSpent = 0;
    if (parsedStats.completedUnits === undefined) parsedStats.completedUnits = [];
    if (parsedStats.completedGrades === undefined) parsedStats.completedGrades = [];

    // Daily Reset
    const storedDate = new Date(parsedStats.date);
    const storedDateStr = storedDate.toDateString();
    const currentDateStr = today.toDateString();

    if (storedDateStr !== currentDateStr) {
        parsedStats.viewedWordsToday = [];
        parsedStats.date = currentDateStr;
    }
    
    // Streak Logic
    if (parsedStats.lastStudyDate) {
        const last = new Date(parsedStats.lastStudyDate);
        const diffTime = Math.abs(today.getTime() - last.getTime());
        const isYesterday = (d1: Date, d2: Date) => {
             const yester = new Date(d1);
             yester.setDate(yester.getDate() - 1);
             return yester.toISOString().split('T')[0] === d2.toISOString().split('T')[0];
        };
        const isToday = parsedStats.lastStudyDate === todayStr;

        if (!isToday && !isYesterday(today, last)) {
             const profile = getUserProfile();
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             if (diffDays > 1) {
                  if (profile.inventory.streakFreezes > 0) {
                       profile.inventory.streakFreezes--;
                       saveUserProfile(profile);
                  } else {
                      parsedStats.streak = 0;
                  }
             }
        }
    }

    return parsedStats;
  } catch (e) {
    return { 
      flashcardsViewed: 0, quizCorrect: 0, quizWrong: 0, 
      date: new Date().toDateString(), dailyGoal: 5,
      xp: 0, level: 1, streak: 0, lastStudyDate: null, badges: [],
      xpBoostEndTime: 0,
      lastGoalMetDate: null, viewedWordsToday: [], breakdown: {},
      perfectQuizzes: 0, questsCompleted: 0, totalTimeSpent: 0, completedUnits: [], completedGrades: []
    };
  }
};

// Helper to save stats (to avoid circular dependency or code repetition in updateStats)
export const saveUserStats = (stats: UserStats) => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    syncLocalToCloud();
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
        
        // Check for level drop and avatar validity
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

export const activateXPBoost = () => {
    const stats = getUserStats();
    stats.xpBoostEndTime = Date.now() + (30 * 60 * 1000);
    saveUserStats(stats);
};

export const buyXPBoost = (cost: number): boolean => {
    const stats = getUserStats();
    if (stats.xpBoostEndTime > Date.now()) return false; 
    
    if (spendXP(cost)) {
        activateXPBoost();
        return true;
    }
    return false;
};

export const updateTimeSpent = (minutes: number) => {
    const stats = getUserStats();
    stats.totalTimeSpent += minutes;
    // Check time badges
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

// Helper to check for unit/grade completion
const checkCompletion = (stats: UserStats): string[] => {
    const newlyCompleted: string[] = [];
    const memorized = getMemorizedSet();

    // Check Units
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
        
        // Check Grade
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
          stats.viewedWordsToday.push(wordId);
          xpGained = XP_REWARDS.CARD_VIEW;
          if (grade) {
              if (!stats.breakdown) stats.breakdown = {};
              if (!stats.breakdown[grade]) stats.breakdown[grade] = { viewed: 0, correct: 0, wrong: 0 };
              stats.breakdown[grade].viewed += 1;
          }
      } else if (!wordId) {
           stats.flashcardsViewed += 1;
           xpGained = 2;
      }
  } else if (type === 'quiz_correct') {
      stats.quizCorrect += 1;
      xpGained = XP_REWARDS.QUIZ_CORRECT;
      if (grade) {
          if (!stats.breakdown) stats.breakdown = {};
          if (!stats.breakdown[grade]) stats.breakdown[grade] = { viewed: 0, correct: 0, wrong: 0 };
          stats.breakdown[grade].correct += 1;
      }
  } else if (type === 'quiz_wrong') {
      stats.quizWrong += 1;
      xpGained = XP_REWARDS.QUIZ_WRONG;
      if (grade) {
          if (!stats.breakdown) stats.breakdown = {};
          if (!stats.breakdown[grade]) stats.breakdown[grade] = { viewed: 0, correct: 0, wrong: 0 };
          stats.breakdown[grade].wrong += 1;
      }
  } else if (type === 'memorized') {
      xpGained = 20; 
      checkCompletion(stats); // Check for unit completion on memorize
  } else if (type === 'review_remember') {
      xpGained = XP_REWARDS.REVIEW_REMEMBER; 
  } else if (type === 'review_forgot') {
      xpGained = XP_REWARDS.REVIEW_FORGOT; 
  } else if (type === 'perfect_quiz') {
      stats.perfectQuizzes += 1;
      xpGained = 60; 
  }

  if (stats.xpBoostEndTime > Date.now()) {
      xpGained *= 2;
  }

  if (xpGained > 0) {
      updateQuestProgress('earn_xp', xpGained);
  }

  stats.xp += xpGained;
  stats.level = calculateLevel(stats.xp);

  // Check all badges
  BADGES.forEach(badge => {
      if (!stats.badges.includes(badge.id)) {
          // Pass extra context (like quizSize) to condition
          if (badge.condition(stats, { quizSize })) { 
              stats.badges.push(badge.id);
              newBadges.push(badge);
          }
      }
  });

  const totalInteractions = stats.flashcardsViewed + stats.quizCorrect + stats.quizWrong;
  const todayDateStr = new Date().toDateString();
  if (totalInteractions >= stats.dailyGoal) {
      stats.lastGoalMetDate = todayDateStr;
  }

  saveUserStats(stats);
  return newBadges;
};

// ... (Rest of the file remains same)
export const resetActivityStats = (scope: { type: 'all' | 'grade' | 'unit', value?: string }) => {};
export const resetSRSData = () => { localStorage.setItem(SRS_KEY, JSON.stringify({})); syncLocalToCloud(); };
export const resetBookmarks = (scope: { type: 'all' | 'grade' | 'unit', value?: string }) => {};
export const resetMemorized = (scope: { type: 'all' | 'grade' | 'unit', value?: string }) => {};

export const saveLastActivity = (grade: string, unitId: string) => {
  const activity: LastActivity = { grade, unitId, timestamp: Date.now() };
  localStorage.setItem(LAST_ACTIVITY_KEY, JSON.stringify(activity));
};

export const getLastActivity = (): LastActivity | null => {
  try {
    const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getSRSData = (): SRSData => {
  try {
    return JSON.parse(localStorage.getItem(SRS_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveSRSData = (data: SRSData) => {
  localStorage.setItem(SRS_KEY, JSON.stringify(data));
  syncLocalToCloud();
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

export const getMemorizedSet = (): Set<string> => {
  try {
    const stored = localStorage.getItem(MEMORIZED_KEY);
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
        syncLocalToCloud();
        internalRemoveFromBookmarks(uniqueKey);
    }
};

const internalRemoveFromMemorized = (uniqueKey: string) => {
    const set = getMemorizedSet();
    if (set.has(uniqueKey)) {
        set.delete(uniqueKey);
        localStorage.setItem(MEMORIZED_KEY, JSON.stringify([...set]));
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

export const buyFreeze = (cost: number): boolean => {
    if (spendXP(cost)) {
        const profile = getUserProfile();
        profile.inventory.streakFreezes += 1;
        saveUserProfile(profile);
        return true;
    }
    return false;
};

// --- DAILY QUESTS & WOTD ---

const QUEST_TYPES: { type: Quest['type'], desc: (target: number) => string, reward: number, range: number[] }[] = [
    { type: 'view_cards', desc: (t) => `Bugün ${t} kelime kartı çalış`, reward: 50, range: [10, 20, 30, 50] },
    { type: 'finish_quiz', desc: (t) => `Bugün ${t} test bitir`, reward: 100, range: [1, 2, 3] },
    { type: 'perfect_quiz', desc: (t) => `Bugün ${t} testi hatasız bitir`, reward: 200, range: [1, 2] },
    { type: 'earn_xp', desc: (t) => `Bugün ${t} XP kazan`, reward: 50, range: [50, 100, 150, 200] },
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
                // Check if all quests were completed yesterday to award a streak or something?
                // For now, just reset.
                const stats = getUserStats();
                const completedCount = parsed.quests.filter(q => q.isCompleted).length;
                if (completedCount >= 3) {
                    // maybe bonus xp?
                }
            }
        }

        // Generate new daily state
        const allWords = Object.values(VOCABULARY).flat();
        // Use date hash to pick a word consistently for the day
        const dateHash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const wordIndex = dateHash % (allWords.length || 1);

        const newQuests: Quest[] = [];
        // Select 3 unique random quests
        const availableTypes = [...QUEST_TYPES];
        for(let i=0; i<3; i++) {
            if (availableTypes.length === 0) break;
            const rIndex = Math.floor(Math.random() * availableTypes.length);
            const qType = availableTypes[rIndex];
            availableTypes.splice(rIndex, 1); // remove to avoid duplicate types

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
    
    // Ensure the quest is for today
    const today = new Date().toDateString();
    if (state.date !== today) {
        return; // Don't update stale quests
    }

    state.quests = state.quests.map(q => {
        if (q.type === type && !q.isCompleted) {
            q.current += amount;
            if (q.current >= q.target) {
                q.current = q.target;
                q.isCompleted = true;
                
                const stats = getUserStats();
                stats.xp += q.rewardXP;
                stats.questsCompleted += 1; // Increment total quests completed
                
                // Check quest badges
                BADGES.forEach(badge => {
                     if (!stats.badges.includes(badge.id) && badge.condition(stats)) {
                         stats.badges.push(badge.id);
                         // We'd ideally notify user of badge here, but we are in a non-component function
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
