import { VOCABULARY } from '../data/vocabulary';

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

export const getMemorizedSet = (): Set<string> => {
  try {
    const stored = localStorage.getItem(MEMORIZED_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

export const addToMemorized = (word: string) => {
  const set = getMemorizedSet();
  set.add(word);
  localStorage.setItem(MEMORIZED_KEY, JSON.stringify([...set]));
};

export const removeFromMemorized = (word: string) => {
  const set = getMemorizedSet();
  set.delete(word);
  localStorage.setItem(MEMORIZED_KEY, JSON.stringify([...set]));
};

export const getTheme = (): 'light' | 'dark' => {
  return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
};

export const saveTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem(THEME_KEY, theme);
};