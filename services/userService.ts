
import { VOCABULARY } from '../data/vocabulary';
import { WordCard } from '../types';

export interface UserProfile {
  name: string;
  age: string;
  grade: string;
  avatar: string;
}

export interface UserStats {
  flashcardsViewed: number;
  quizCorrect: number;
  quizWrong: number;
  date: string; // Tracks the specific calendar day
  dailyGoal: number; // Target number of interactions
  streak: number; // Consecutive days goal met
  lastGoalMetDate: string | null; // Date string of last success
}

export interface LastActivity {
  grade: string;
  unitId: string;
}

const PROFILE_KEY = 'lgs_user_profile';
const STATS_KEY = 'lgs_user_stats';
const THEME_KEY = 'lgs_theme';
const MEMORIZED_KEY = 'lgs_memorized';
const BOOKMARKS_KEY = 'lgs_bookmarks';
const SRS_KEY = 'lgs_srs_data';
const LAST_ACTIVITY_KEY = 'lgs_last_activity';

// SRS Configuration (Leitner System)
const SRS_INTERVALS = [0, 1, 3, 7, 14, 30];

// SRS Data uses a unique key: "unitId|englishWord"
interface SRSData {
  [uniqueKey: string]: {
    box: number;
    nextReview: number; // Timestamp
  }
}

// Goal progression steps
const GOAL_STEPS = [5, 10, 15, 20, 30];

export const getNextDailyGoal = (currentGoal: number): number => {
  const index = GOAL_STEPS.indexOf(currentGoal);
  if (index === -1) return 5;
  if (index >= GOAL_STEPS.length - 1) return GOAL_STEPS[GOAL_STEPS.length - 1];
  return GOAL_STEPS[index + 1];
};

export const getUserProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    const defaults = { name: '', age: '', grade: '', avatar: '🦊' };
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch (e) {
    return { name: '', age: '', grade: '', avatar: '🦊' };
  }
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getUserStats = (): UserStats => {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    const today = new Date();
    const todayStr = today.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    const defaultStats: UserStats = { 
      flashcardsViewed: 0, 
      quizCorrect: 0, 
      quizWrong: 0, 
      date: todayStr,
      dailyGoal: 5,
      streak: 0,
      lastGoalMetDate: null
    };

    if (!stored) {
      return defaultStats;
    }

    const parsedStats = JSON.parse(stored);
    
    if (typeof parsedStats.dailyGoal !== 'number') parsedStats.dailyGoal = 5;
    if (typeof parsedStats.streak !== 'number') parsedStats.streak = 0;
    if (parsedStats.lastGoalMetDate === undefined) parsedStats.lastGoalMetDate = null;

    if (parsedStats.lastGoalMetDate) {
        const lastMet = new Date(parsedStats.lastGoalMetDate);
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - 1);
        
        lastMet.setHours(0,0,0,0);
        checkDate.setHours(0,0,0,0);

        if (lastMet < checkDate) {
            parsedStats.streak = 0;
        }
    }

    if (parsedStats.date !== todayStr) {
        let newGoal = 5;
        if (parsedStats.lastGoalMetDate === yesterdayStr) {
            newGoal = getNextDailyGoal(parsedStats.dailyGoal);
        } else {
            newGoal = 5;
        }

        const newStats: UserStats = {
            flashcardsViewed: 0, 
            quizCorrect: 0, 
            quizWrong: 0, 
            date: todayStr,
            dailyGoal: newGoal, 
            streak: parsedStats.lastGoalMetDate === yesterdayStr ? parsedStats.streak : 0,
            lastGoalMetDate: parsedStats.lastGoalMetDate
        };

        localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
        return newStats;
    }

    return parsedStats;
  } catch (e) {
    const today = new Date();
    return { 
      flashcardsViewed: 0, 
      quizCorrect: 0, 
      quizWrong: 0, 
      date: today.toDateString(),
      dailyGoal: 5,
      streak: 0,
      lastGoalMetDate: null
    };
  }
};

export const updateStats = (type: 'card_view' | 'quiz_correct' | 'quiz_wrong') => {
  const stats = getUserStats();
  
  if (type === 'card_view') stats.flashcardsViewed++;
  if (type === 'quiz_correct') stats.quizCorrect++;
  if (type === 'quiz_wrong') stats.quizWrong++;

  const totalInteractions = stats.flashcardsViewed + stats.quizCorrect + stats.quizWrong;
  const todayStr = new Date().toDateString();

  if (totalInteractions >= stats.dailyGoal && stats.lastGoalMetDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (stats.lastGoalMetDate === yesterdayStr) {
          stats.streak += 1;
      } else if (stats.streak === 0) {
          stats.streak = 1;
      } else {
          stats.streak = 1;
      }
      stats.lastGoalMetDate = todayStr;
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const resetActivityStats = () => {
    const today = new Date();
    const todayStr = today.toDateString();
    const defaultStats: UserStats = { 
      flashcardsViewed: 0, 
      quizCorrect: 0, 
      quizWrong: 0, 
      date: todayStr,
      dailyGoal: 5, 
      streak: 0,
      lastGoalMetDate: null
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(defaultStats));
};

export const saveLastActivity = (grade: string, unitId: string) => {
  const activity: LastActivity = { grade, unitId };
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
};

export const handleQuizResult = (uniqueKey: string, isCorrect: boolean) => {
  const data = getSRSData();
  const now = Date.now();
  const entry = data[uniqueKey] || { box: 0, nextReview: 0 };

  if (isCorrect) {
    if (entry.box < 5) entry.box++;
    const daysToAdd = SRS_INTERVALS[entry.box];
    entry.nextReview = now + (daysToAdd * 24 * 60 * 60 * 1000);
    if (entry.box === 5) {
        internalAddToMemorized(uniqueKey);
    }
  } else {
    entry.box = 1;
    entry.nextReview = now + (1 * 24 * 60 * 60 * 1000);
    internalRemoveFromMemorized(uniqueKey);
  }

  data[uniqueKey] = entry;
  saveSRSData(data);
};

export const getDueWords = (): WordCard[] => {
    const data = getSRSData();
    const now = Date.now();
    // SRS keys are now "unitId|englishWord" (e.g., "g8u1|about")
    const dueKeys = Object.keys(data).filter(k => {
        const entry = data[k];
        return entry.box > 0 && entry.nextReview <= now;
    });

    if (dueKeys.length === 0) return [];

    const result: WordCard[] = [];

    dueKeys.forEach(key => {
        // Check for separator
        if (key.includes('|')) {
            const [unitId, english] = key.split('|');
            const unitWords = VOCABULARY[unitId];
            if (unitWords) {
                const word = unitWords.find(w => w.english === english);
                if (word) {
                    result.push({ ...word, unitId: unitId });
                }
            }
        } else {
            // Legacy support for old keys (word only) - scan all vocab
            // This might pick the first occurrence if duplicates exist, but acceptable for legacy
            const allWords = Object.values(VOCABULARY).flat();
            const word = allWords.find(w => w.english === key);
            if (word) result.push(word);
        }
    });

    return result;
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
    }
};

const internalRemoveFromMemorized = (uniqueKey: string) => {
    const set = getMemorizedSet();
    if (set.has(uniqueKey)) {
        set.delete(uniqueKey);
        localStorage.setItem(MEMORIZED_KEY, JSON.stringify([...set]));
    }
};

export const addToMemorized = (uniqueKey: string) => {
  internalAddToMemorized(uniqueKey);
  const data = getSRSData();
  data[uniqueKey] = { box: 5, nextReview: Date.now() + (30 * 24 * 60 * 60 * 1000) };
  saveSRSData(data);
};

export const removeFromMemorized = (uniqueKey: string) => {
  internalRemoveFromMemorized(uniqueKey);
  const data = getSRSData();
  data[uniqueKey] = { box: 1, nextReview: Date.now() };
  saveSRSData(data);
};

// --- Bulk Reset Function ---
export const resetProgressForWords = (uniqueKeysToReset: string[], type: 'memorized' | 'bookmarks') => {
    const key = type === 'memorized' ? MEMORIZED_KEY : BOOKMARKS_KEY;
    
    try {
        const stored = localStorage.getItem(key);
        let currentArray: string[] = [];
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    currentArray = parsed;
                }
            } catch (e) {
                console.warn("Storage corrupted, resetting");
                currentArray = [];
            }
        }
        
        const keysToRemoveSet = new Set(uniqueKeysToReset);
        const newArray = currentArray.filter(k => !keysToRemoveSet.has(k));

        if (newArray.length !== currentArray.length) {
            localStorage.setItem(key, JSON.stringify(newArray));
        }
    } catch (e) {
        console.error("Failed to reset progress", e);
    }

    // Reset SRS if memorized list is cleared
    if (type === 'memorized') {
        const srsData = getSRSData();
        let srsChanged = false;
        uniqueKeysToReset.forEach(k => {
            if (srsData[k]) {
                delete srsData[k];
                srsChanged = true;
            }
        });
        if (srsChanged) {
            saveSRSData(srsData);
        }
    }
};

export const getTheme = (): 'light' | 'dark' => {
  return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
};

export const saveTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem(THEME_KEY, theme);
};
