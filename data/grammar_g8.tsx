import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G8: Record<string, GrammarTopic[]> = {
  'u1': [
    {
      title: "Accepting and Refusing (Kabul ve Reddetme)",
      content: (
        <div className="space-y-4">
          <p>Bir daveti kabul ederken veya reddederken kullanılan kalıplar LGS'de sıkça çıkar.</p>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
            <h4 className="font-bold text-green-700 dark:text-green-400 mb-2">Accepting (Kabul Etme)</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Yes, I would love to. (Evet, çok isterim.)</li>
              <li>That sounds great/awesome. (Kulağa harika geliyor.)</li>
              <li>Sure, why not? (Tabii, neden olmasın?)</li>
              <li>I'll be there. (Orada olacağım.)</li>
              <li>Yeah, that would be great. (Evet, harika olur.)</li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
            <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Refusing (Reddetme)</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>I'm sorry, but I can't. (Üzgünüm ama yapamam.)</li>
              <li>I'd love to, but I am busy. (Çok isterdim ama meşgulüm.)</li>
              <li>Sorry, I have another plan. (Üzgünüm, başka bir planım var.)</li>
              <li>No, thanks. (Hayır, teşekkürler.)</li>
              <li>Maybe another time. (Belki başka zaman.)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Making Simple Offers (Teklifte Bulunma)",
      content: (
        <div className="space-y-4">
          <p>Arkadaşlarımıza bir etkinlik teklif ederken şu kalıpları kullanırız:</p>

          <div className="space-y-3">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">Would you like to...?</span>
              <p className="text-sm italic text-slate-600 dark:text-slate-400">Would you like to drink coffee? (Kahve içmek ister misin?)</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">How about / What about...? (+ Ving)</span>
              <p className="text-sm italic text-slate-600 dark:text-slate-400">How about going to the cinema? (Sinemaya gitmeye ne dersin?)</p>
              <p className="text-xs text-red-500 mt-1">* Fiile -ing takısı geldiğine dikkat et!</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">Shall we...?</span>
              <p className="text-sm italic text-slate-600 dark:text-slate-400">Shall we meet at 5? (5'te buluşalım mı?)</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">Let's...</span>
              <p className="text-sm italic text-slate-600 dark:text-slate-400">Let's have a party! (Hadi parti verelim!)</p>
            </div>
          </div>
        </div>
      )
    }
  ]
};