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
  date: string; // Tracks the specific calendar day (e.g. "Mon Oct 27 2025")
  dailyGoal: number; // Target number of interactions
  streak: number; // Consecutive days goal met
  lastGoalMetDate: string | null; // Date string of last success
}

const PROFILE_KEY = 'lgs_user_profile';
const STATS_KEY = 'lgs_user_stats';
const THEME_KEY = 'lgs_theme';
const MEMORIZED_KEY = 'lgs_memorized';
const SRS_KEY = 'lgs_srs_data';

// SRS Configuration (Leitner System)
// Box 0: New/Reset
// Box 1: 1 day
// Box 2: 3 days
// Box 3: 1 week
// Box 4: 2 weeks
// Box 5: 1 month (Mastered)
const SRS_INTERVALS = [0, 1, 3, 7, 14, 30];

interface SRSData {
  [word: string]: {
    box: number;
    nextReview: number; // Timestamp
  }
}

// Goal progression steps: 5 -> 10 -> 15 -> 20 -> 30
const GOAL_STEPS = [5, 10, 15, 20, 30];

export const getNextDailyGoal = (currentGoal: number): number => {
  const index = GOAL_STEPS.indexOf(currentGoal);
  // If current goal isn't in list (e.g. legacy data), default to 5
  if (index === -1) return 5;
  // If at max (30), stay at max
  if (index >= GOAL_STEPS.length - 1) return GOAL_STEPS[GOAL_STEPS.length - 1];
  // Otherwise go to next step
  return GOAL_STEPS[index + 1];
};

export const getUserProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    // Default avatar if none exists
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
    
    // Calculate yesterday for streak checking
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    const defaultStats: UserStats = { 
      flashcardsViewed: 0, 
      quizCorrect: 0, 
      quizWrong: 0, 
      date: todayStr,
      dailyGoal: 5, // Start goal
      streak: 0,
      lastGoalMetDate: null
    };

    if (!stored) {
      return defaultStats;
    }

    const parsedStats = JSON.parse(stored);
    
    // Migration: Ensure new fields exist
    if (typeof parsedStats.dailyGoal !== 'number') parsedStats.dailyGoal = 5;
    if (typeof parsedStats.streak !== 'number') parsedStats.streak = 0;
    if (parsedStats.lastGoalMetDate === undefined) parsedStats.lastGoalMetDate = null;

    // Check streak integrity on load
    if (parsedStats.lastGoalMetDate) {
        const lastMet = new Date(parsedStats.lastGoalMetDate);
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - 1); // Yesterday
        
        // Reset time for accurate day comparison
        lastMet.setHours(0,0,0,0);
        checkDate.setHours(0,0,0,0);

        // If last met was before yesterday, streak is broken
        if (lastMet < checkDate) {
            parsedStats.streak = 0;
        }
    }

    // Check if date changed for daily progress reset
    if (parsedStats.date !== todayStr) {
        
        // Logic for Goal Progression
        let newGoal = 5; // Default reset
        
        // If the user met the goal YESTERDAY, they progress to the next level
        if (parsedStats.lastGoalMetDate === yesterdayStr) {
            newGoal = getNextDailyGoal(parsedStats.dailyGoal);
        } else {
            // Streak broken or skipped a day, reset to 5
            newGoal = 5;
        }

        const newStats: UserStats = {
            flashcardsViewed: 0, 
            quizCorrect: 0, 
            quizWrong: 0, 
            date: todayStr,
            dailyGoal: newGoal, 
            // If missed yesterday, streak is effectively 0 for the new day until calculated again
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

  // Streak Logic
  const totalInteractions = stats.flashcardsViewed + stats.quizCorrect + stats.quizWrong;
  const todayStr = new Date().toDateString();

  // Only update streak if it hasn't been updated for today yet
  if (totalInteractions >= stats.dailyGoal && stats.lastGoalMetDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (stats.lastGoalMetDate === yesterdayStr) {
          // Consecutive day
          stats.streak += 1;
      } else if (stats.streak === 0) {
          // First time or broken streak
          stats.streak = 1;
      } else {
          // Missed some days, but just met goal today. Reset to 1.
          stats.streak = 1;
      }
      stats.lastGoalMetDate = todayStr;
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

// --- SRS / Leitner System Logic ---

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

export const handleQuizResult = (word: string, isCorrect: boolean) => {
  const data = getSRSData();
  const now = Date.now();
  const entry = data[word] || { box: 0, nextReview: 0 };

  if (isCorrect) {
    // Move to next box, max 5
    if (entry.box < 5) entry.box++;
    
    // Calculate next review time
    // Box 1: +1 day, Box 2: +3 days, etc.
    const daysToAdd = SRS_INTERVALS[entry.box];
    entry.nextReview = now + (daysToAdd * 24 * 60 * 60 * 1000);

    // If Mastered (Box 5), ensure it is in the memorized set
    if (entry.box === 5) {
        // We call internal helper to avoid infinite loop if we used public export
        internalAddToMemorized(word);
    }
  } else {
    // Wrong answer: Reset to Box 1
    entry.box = 1;
    entry.nextReview = now + (1 * 24 * 60 * 60 * 1000); // Review tomorrow
    
    // If it was memorized, it is no longer memorized
    internalRemoveFromMemorized(word);
  }

  data[word] = entry;
  saveSRSData(data);
};

export const getDueWords = (): WordCard[] => {
    const data = getSRSData();
    const now = Date.now();
    const dueWordKeys = Object.keys(data).filter(k => {
        const entry = data[k];
        // Return words that are in the system (Box > 0) AND due for review
        // We usually review Box 5 (Mastered) words very rarely (30 days), so they will appear eventually
        return entry.box > 0 && entry.nextReview <= now;
    });

    if (dueWordKeys.length === 0) return [];

    // Efficiently map keys back to full WordCard objects
    // This assumes VOCABULARY is loaded. Since this runs on client, it's fine.
    // Optimization: Flatten vocabulary once? 
    // For now, we iterate to find matches.
    const allWords = Object.values(VOCABULARY).flat();
    const wordMap = new Map(allWords.map(w => [w.english, w]));

    return dueWordKeys
      .map(k => wordMap.get(k))
      .filter(w => w !== undefined) as WordCard[];
};


// --- Memorized Set Logic (Synced with SRS) ---

export const getMemorizedSet = (): Set<string> => {
  try {
    const stored = localStorage.getItem(MEMORIZED_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

// Internal helpers to avoid circular SRS updates when called from SRS logic
const internalAddToMemorized = (word: string) => {
    const set = getMemorizedSet();
    if (!set.has(word)) {
        set.add(word);
        localStorage.setItem(MEMORIZED_KEY, JSON.stringify([...set]));
    }
};

const internalRemoveFromMemorized = (word: string) => {
    const set = getMemorizedSet();
    if (set.has(word)) {
        set.delete(word);
        localStorage.setItem(MEMORIZED_KEY, JSON.stringify([...set]));
    }
};

// Public exports update SRS state to reflect manual action
export const addToMemorized = (word: string) => {
  internalAddToMemorized(word);
  
  // Manual "Memorized" (e.g. from Flashcards) bumps SRS to Box 5 (Mastered)
  const data = getSRSData();
  data[word] = { box: 5, nextReview: Date.now() + (30 * 24 * 60 * 60 * 1000) };
  saveSRSData(data);
};

export const removeFromMemorized = (word: string) => {
  internalRemoveFromMemorized(word);

  // Manual removal resets SRS to Box 1
  const data = getSRSData();
  data[word] = { box: 1, nextReview: Date.now() };
  saveSRSData(data);
};

export const getTheme = (): 'light' | 'dark' => {
  return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
};

export const saveTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem(THEME_KEY, theme);
};
