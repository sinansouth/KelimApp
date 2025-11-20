import { ReactNode } from 'react';

export interface WordCard {
  english: string;
  turkish: string;
  exampleEng: string;
  exampleTr: string;
  context: string; // A brief explanation of usage nuance
}

export enum AppMode {
  HOME = 'HOME',
  LOADING = 'LOADING',
  FLASHCARDS = 'FLASHCARDS',
  QUIZ = 'QUIZ',
  GRAMMAR = 'GRAMMAR',
  ERROR = 'ERROR',
  PROFILE = 'PROFILE',
  EMPTY_WARNING = 'EMPTY_WARNING',
  CUSTOM_PRACTICE = 'CUSTOM_PRACTICE'
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