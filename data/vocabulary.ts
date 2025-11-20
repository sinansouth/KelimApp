import { WordCard } from '../types';
import { VOCABULARY_G2 } from './vocabulary_g2';
import { VOCABULARY_G3 } from './vocabulary_g3';
import { VOCABULARY_G4 } from './vocabulary_g4';
import { VOCABULARY_G5 } from './vocabulary_g5';
import { VOCABULARY_G6 } from './vocabulary_g6';
import { VOCABULARY_G7 } from './vocabulary_g7';
import { VOCABULARY_G8 } from './vocabulary_g8';
import { VOCABULARY_G9 } from './vocabulary_g9';
import { VOCABULARY_G10 } from './vocabulary_g10';
import { VOCABULARY_G11 } from './vocabulary_g11';
import { VOCABULARY_G12 } from './vocabulary_g12';
import { VOCABULARY_GEN } from './vocabulary_gen';

export const VOCABULARY: Record<string, WordCard[]> = {
  ...VOCABULARY_G2,
  ...VOCABULARY_G3,
  ...VOCABULARY_G4,
  ...VOCABULARY_G5,
  ...VOCABULARY_G6,
  ...VOCABULARY_G7,
  ...VOCABULARY_G8,
  ...VOCABULARY_G9,
  ...VOCABULARY_G10,
  ...VOCABULARY_G11,
  ...VOCABULARY_G12,
  ...VOCABULARY_GEN,
};

// Helper to get random words for quiz
export const getRandomWords = (unitId: string, count: number = 20): WordCard[] => {
  const allWords = VOCABULARY[unitId] || [];
  if (allWords.length <= count) return [...allWords];
  
  // Fisher-Yates Shuffle
  const shuffled = [...allWords];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
};
