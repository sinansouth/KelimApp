import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G2: Record<string, GrammarTopic[]> = {
  'g2u1': [{ title: "Greetings", content: <div><p>Basit selamlaşmalar:</p><ul><li>Hello (Merhaba)</li><li>Hi (Selam)</li><li>Good morning (Günaydın)</li></ul></div> }],
  'g2u2': [{ title: "Imperatives", content: <div><p>Sınıf içinde kullanılan basit emirler:</p><ul><li>Stand up (Ayağa kalk)</li><li>Sit down (Otur)</li><li>Open (Aç) / Close (Kapat)</li></ul></div> }],
  'g2u3': [{ title: "Can (Yapabilmek)", content: <div><p>Yapabildiğimiz hareketleri anlatmak için 'Can' kullanırız.</p><p>I can run. (Koşabilirim.)</p><p>I can jump. (Zıplayabilirim.)</p></div> }],
  'g2u4': [{ title: "This is...", content: <div><p>Aile üyelerimizi tanıtırken:</p><p>This is my mother. (Bu benim annem.)</p><p>This is my father. (Bu benim babam.)</p></div> }],
  'g2u5': [{ title: "Rooms", content: <div><p>Evin bölümleri:</p><p>Where is mom? (Anne nerede?)</p><p>She is in the kitchen. (O mutfakta.)</p></div> }],
  'g2u6': [{ title: "Where", content: <div><p>Yer sorma:</p><p>Where is the park? (Park nerede?)</p><p>It is here. (Burada.)</p></div> }]
};
