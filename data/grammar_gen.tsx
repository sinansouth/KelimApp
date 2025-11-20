import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_GEN: Record<string, GrammarTopic[]> = {
  'gen_a1': [{ title: "To Be (Am/Is/Are)", content: <div><p>Temel olmak fiili kullanımı.</p></div> }],
  'gen_a2': [{ title: "Past Simple", content: <div><p>Geçmiş zaman (did/didn't).</p></div> }],
  'gen_b1': [{ title: "Present Perfect", content: <div><p>Deneyimlerden bahsetme (have/has + V3).</p></div> }],
  'gen_b2': [{ title: "Conditionals", content: <div><p>Koşul cümleleri (0, 1, 2, 3).</p></div> }],
  'gen_c1': [{ title: "Advanced Inversion", content: <div><p>İleri seviye devrik cümleler.</p></div> }],
  'gen_c2': [{ title: "Subjunctive Mood", content: <div><p>İstek kipi ve resmi kullanımlar.</p></div> }]
};
