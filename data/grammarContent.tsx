import React from 'react';
import { GrammarTopic } from '../types';
import { GRAMMAR_G2 } from './grammar_g2';
import { GRAMMAR_G3 } from './grammar_g3';
import { GRAMMAR_G4 } from './grammar_g4';
import { GRAMMAR_G5 } from './grammar_g5';
import { GRAMMAR_G6 } from './grammar_g6';
import { GRAMMAR_G7 } from './grammar_g7';
import { GRAMMAR_G8 } from './grammar_g8';
import { GRAMMAR_G9 } from './grammar_g9';
import { GRAMMAR_G10 } from './grammar_g10';
import { GRAMMAR_G11 } from './grammar_g11';
import { GRAMMAR_G12 } from './grammar_g12';
import { GRAMMAR_GEN } from './grammar_gen';

export const GRAMMAR_CONTENT: Record<string, GrammarTopic[]> = {
  ...GRAMMAR_G2,
  ...GRAMMAR_G3,
  ...GRAMMAR_G4,
  ...GRAMMAR_G5,
  ...GRAMMAR_G6,
  ...GRAMMAR_G7,
  ...GRAMMAR_G8,
  ...GRAMMAR_G9,
  ...GRAMMAR_G10,
  ...GRAMMAR_G11,
  ...GRAMMAR_G12,
  ...GRAMMAR_GEN,
  // Generic placeholder for other units to avoid crashes if data is missing
  'default': [
    {
      title: "Unit Grammar Summary",
      content: (
        <div>
          <p className="mb-4">Bu ünite için özel gramer notları hazırlanmaktadır. Lütfen kelime kartları ve test bölümünü kullanarak çalışmaya devam ediniz.</p>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-xl">
            <h4 className="font-bold text-yellow-700 dark:text-yellow-400 mb-2">Çalışma İpucu</h4>
            <p className="text-sm">Yeni kelimeleri öğrenirken, bu kelimelerin cümle içinde nasıl kullanıldığına (Context) dikkat etmek gramer yapısını anlamana yardımcı olacaktır.</p>
          </div>
        </div>
      )
    }
  ]
};

export const getGrammarForUnit = (unitId: string): GrammarTopic[] => {
  return GRAMMAR_CONTENT[unitId] || GRAMMAR_CONTENT['default'];
};
