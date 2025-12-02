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
  TYPING = 'TYPING',
  WORD_CHAIN = 'WORD_CHAIN',
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

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  image?: string;
  condition: (stats: any, context?: any) => boolean;
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

// Daily Quests
export interface Quest {
  id: string;
  description: string;
  target: number;
  current: number;
  rewardXP: number;
  isCompleted: boolean;
  type: 'view_cards' | 'finish_quiz' | 'perfect_quiz' | 'earn_xp' | 'play_matching' | 'play_typing' | 'play_chain';
}

export interface DailyState {
  date: string;
  quests: Quest[];
  wordOfTheDayIndex: number;
}