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
  lastUpdated: number;
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
    if (!stored) {
      return { flashcardsViewed: 0, quizCorrect: 0, quizWrong: 0, lastUpdated: Date.now() };
    }

    const stats: UserStats = JSON.parse(stored);
    
    // Check if 24 hours have passed since the last reset/start
    const oneDay = 24 * 60 * 60 * 1000;
    if (Date.now() - stats.lastUpdated > oneDay) {
       // Reset stats if older than 24h
       const newStats = { flashcardsViewed: 0, quizCorrect: 0, quizWrong: 0, lastUpdated: Date.now() };
       localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
       return newStats;
    }

    return stats;
  } catch (e) {
    return { flashcardsViewed: 0, quizCorrect: 0, quizWrong: 0, lastUpdated: Date.now() };
  }
};

export const updateStats = (type: 'card_view' | 'quiz_correct' | 'quiz_wrong') => {
  const stats = getUserStats();
  
  switch (type) {
    case 'card_view':
      stats.flashcardsViewed += 1;
      break;
    case 'quiz_correct':
      stats.quizCorrect += 1;
      break;
    case 'quiz_wrong':
      stats.quizWrong += 1;
      break;
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const getTheme = (): 'light' | 'dark' => {
  try {
    return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
  } catch {
    return 'light';
  }
};

export const saveTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem(THEME_KEY, theme);
};

// --- Memorized Words Logic ---

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

export const getTotalVocabularyCount = (): number => {
  return Object.values(VOCABULARY).reduce((acc, list) => acc + list.length, 0);
};