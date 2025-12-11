
import { ReactNode } from 'react';

export interface WordCard {
  english: string;
  turkish: string;
  exampleEng: string;
  exampleTr: string;
  context: string;
  unitId?: string;
}

export enum AppMode {
  HOME = 'HOME',
  LOADING = 'LOADING',
  FLASHCARDS = 'FLASHCARDS',
  MATCHING = 'MATCHING',
  MAZE = 'MAZE',
  WORD_SEARCH = 'WORD_SEARCH',
  QUIZ = 'QUIZ',
  GRAMMAR = 'GRAMMAR',
  ERROR = 'ERROR',
  PROFILE = 'PROFILE',
  EMPTY_WARNING = 'EMPTY_WARNING',
  CUSTOM_PRACTICE = 'CUSTOM_PRACTICE',
  INFO = 'INFO',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  MARKET = 'MARKET'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface GrammarTopic {
  title: string;
  content: ReactNode;
}

export interface UnitDef {
  id: string;
  unitNo: string;
  title: string;
  icon: ReactNode;
  image?: string;
}

export interface GradeDef {
  id: string;
  label: string;
  subLabel?: string;
  icon: ReactNode;
  image?: string;
  color?: string;
}

export interface BadgeContext {
  grade?: GradeLevel | null;
  unitId?: string;
  action?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  image?: string;
  condition: (stats: import('./services/userService').UserStats, context?: BadgeContext) => boolean;
  unlocked: boolean;
}

export interface Avatar {
  id: string;
  icon: string;
  image?: string;
  name: string;
  unlockLevel: number;
  bgGradient: string;
  border: string;
}

export interface FrameDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  style: string;
  image?: string;
  unlockLevel?: number;
}

export interface BackgroundDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  style: string;
  image?: string;
  unlockLevel?: number;
}

export type ThemeType = 'light' | 'dark' | 'neon' | 'ocean' | 'sunset' | 'forest' | 'royal' | 'candy' | 'cyberpunk' | 'coffee' | 'galaxy' | 'retro' | 'matrix' | 'midnight' | 'volcano' | 'ice' | 'lavender' | 'gamer' | 'luxury' | 'comic' | 'nature_soft';

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'theme' | 'frame' | 'background';
  value: string;
  icon: ReactNode;
  image?: string;
  previewColor?: string;
  unlockLevel?: number;
}

export type GradeLevel =
  | '12' | '11' | '10' | '9'
  | '8' | '7' | '6' | '5'
  | '4' | '3' | '2'
  | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type StudyMode = 'vocabulary' | 'grammar';
export type CategoryType = 'HIGH_SCHOOL' | 'MIDDLE_SCHOOL' | 'PRIMARY_SCHOOL' | 'GENERAL_ENGLISH';

export type QuizDifficulty = 'relaxed' | 'easy' | 'normal' | 'hard' | 'impossible';

// Daily Quests
export interface Quest {
  id: string;
  description: string;
  target: number;
  current: number;
  rewardXP: number;
  isCompleted: boolean;
  type: 'view_cards' | 'finish_quiz' | 'perfect_quiz' | 'earn_xp' | 'play_matching' | 'play_maze' | 'play_word_search' | 'play_duel' | 'win_duel' | 'study_time' | 'correct_answers';
}

export interface DailyState {
  date: string;
  quests: Quest[];
  wordOfTheDayIndex: number;
}

export interface Challenge {
  id: string;
  type: 'public' | 'private' | 'friend';
  creatorId: string;
  creatorName: string;
  creatorScore: number;
  wordIndices: number[];
  unitId: string;
  unitName?: string; 
  grade?: string; 
  difficulty: QuizDifficulty;
  wordCount: number;
  targetFriendId?: string;
  opponentId?: string;
  opponentName?: string;
  opponentScore?: number;
  status: 'waiting' | 'completed';
  winnerId?: string;
  createdAt: number;
}

export interface TournamentRewards {
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
  participation: number;
}

export interface Tournament {
  id: string;
  title: string;
  grade: string;
  unitId: string;
  unitName: string;
  status: 'registration' | 'active' | 'completed';
  registrationStartDate: number; 
  registrationEndDate: number; 
  startDate: number; 
  endDate: number;
  roundDuration: number; 
  participants: string[];
  matches: TournamentMatch[];
  currentRound: number; 
  championId?: string;
  maxParticipants: number;
  minLevel: number;
  rewards: TournamentRewards;
  config: {
    difficulty: QuizDifficulty;
    wordCount: number;
  };
}

export interface TournamentMatch {
  id: string;
  round: number; 
  player1Id?: string;
  player1Name?: string;
  player2Id?: string;
  player2Name?: string;

  score1_leg1?: number;
  time1_leg1?: number; 
  score2_leg1?: number;
  time2_leg1?: number;

  score1_leg2?: number;
  time1_leg2?: number;
  score2_leg2?: number;
  time2_leg2?: number;

  winnerId?: string;
  status: 'waiting' | 'leg1_active' | 'leg2_active' | 'completed';
  updatedAt?: number; 
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
    
    // Lifetime Duel Stats
    duelWins: number;
    duelLosses: number;
    duelDraws: number;
    duelPoints: number; // Lifetime total points

    // Lifetime Game High Scores
    matchingAllTimeBest: number;
    mazeAllTimeBest: number;
    wordSearchAllTimeBest: number;

    completedUnits: string[];
    completedGrades: string[];
    
    // Weekly Competitive Stats (Resets every Sunday night)
    weekly: {
        weekId: string;
        quizCorrect: number;
        quizWrong: number;
        cardsViewed: number;
        matchingBestTime: number; // Represents Score now
        mazeHighScore: number;
        wordSearchHighScore: number;
        
        // Weekly Duel Stats
        duelPoints: number;
        duelWins: number;
        duelLosses: number;
        duelDraws: number;
    };
    lastActivity?: { grade: string; unitId: string };
    updatedAt?: number; // Cloud sync timestamp
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  isNew?: boolean;
}
