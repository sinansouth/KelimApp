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
    // If the last goal met date was BEFORE yesterday, the streak is broken.
    if (parsedStats.lastGoalMetDate) {
        const lastMet = new Date(parsedStats.lastGoalMetDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Reset time for accurate day comparison
        lastMet.setHours(0,0,0,0);
        yesterday.setHours(0,0,0,0);
        const todayDate = new Date();
        todayDate.setHours(0,0,0,0);

        // If last met was before yesterday (and not today), reset streak
        if (lastMet < yesterday) {
            parsedStats.streak = 0;
        }
    }

    // Check if date changed for daily progress reset
    if (parsedStats.date !== todayStr) {
        // Calculate new goal based on previous day performance
        const lastDate = new Date(parsedStats.date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        lastDate.setHours(0,0,0,0);
        yesterday.setHours(0,0,0,0);
        
        const isConsecutiveDay = lastDate.getTime() === yesterday.getTime();
        const totalInteractions = (parsedStats.flashcardsViewed || 0) + 
                                  (parsedStats.quizCorrect || 0) + 
                                  (parsedStats.quizWrong || 0);
        
        const previousGoal = parsedStats.dailyGoal;
        let newGoal = 5; // Default reset

        // Logic: If user played yesterday AND met the goal -> Increase goal
        if (isConsecutiveDay && totalInteractions >= previousGoal) {
             newGoal = Math.min(50, previousGoal + 5);
        } else {
             // Streak broken or goal not met -> Reset to 5
             newGoal = 5;
        }

        const newStats: UserStats = {
            flashcardsViewed: 0, 
            quizCorrect: 0, 
            quizWrong: 0, 
            date: todayStr,
            dailyGoal: newGoal,
            streak: parsedStats.streak, // Preserve calculated streak
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
          // Missed some days, but just met goal today. 
          // If lastGoalMetDate is older than yesterday, we reset to 1.
          // (Logic handled in getUserStats but let's be safe)
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