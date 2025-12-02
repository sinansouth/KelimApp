
import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G12: Record<string, GrammarTopic[]> = {
  'g12u1': [
    {
      title: "Expressing Preferences",
      content: (
        <div>
          <p>Tercih bildirme yapıları.</p>
          <ul className="list-disc pl-4 space-y-2">
             <li><strong>Prefer:</strong> I prefer pop to rock. (Genel tercih)</li>
             <li><strong>Would rather:</strong> I would rather listen to jazz than classical. (Özel durum/Genel)</li>
             <li><strong>Would prefer:</strong> I would prefer to stay home rather than go out.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Expressing Opinions",
      content: (
        <div>
          <p>Fikir beyan ederken kullanılan kalıplar.</p>
          <p>I think... / I believe... / In my opinion... / To me...</p>
          <p>From my point of view... / As far as I am concerned...</p>
        </div>
      )
    }
  ],
  'g12u2': [
    {
      title: "Adjectives describing Personality",
      content: (
        <div>
          <p>İleri seviye kişilik sıfatları.</p>
          <p>Generous (Cömert), Stubborn (İnatçı), Reliable (Güvenilir), Sensible (Mantıklı), Sensitive (Hassas), Absent-minded (Unutkan), Modest (Mütevazı).</p>
        </div>
      )
    },
    {
      title: "Phrasal Verbs (Relationships)",
      content: (
        <div>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Get on well:</strong> İyi geçinmek</li>
            <li><strong>Back up:</strong> Desteklemek</li>
            <li><strong>Count on:</strong> Güvenmek</li>
            <li><strong>Break up:</strong> Ayrılmak</li>
            <li><strong>Fall out:</strong> Kavga etmek/Küsme</li>
            <li><strong>Look up to:</strong> Hayranlık duymak</li>
          </ul>
        </div>
      )
    }
  ],
  'g12u3': [
    {
      title: "Expressing Ability",
      content: (
        <div>
          <ul className="list-disc pl-4 space-y-1">
             <li><strong>Can / Could:</strong> Genel yetenek.</li>
             <li><strong>Be able to:</strong> Her zaman diliminde kullanılabilir (will be able to, have been able to).</li>
             <li><strong>Manage to:</strong> Zor bir işi başarmak (spesifik durum).
                 <br/><em className="text-sm">He managed to unlock the door.</em></li>
          </ul>
        </div>
      )
    },
    {
      title: "Modals of Prohibition/Necessity",
      content: (
        <div>
          <p><strong>Mustn't:</strong> Yasak. (You mustn't smoke.)</p>
          <p><strong>Don't have to:</strong> Gerek yok (Zorunlu değil). (You don't have to come.)</p>
          <p><strong>Needn't:</strong> Gerek yok. (You needn't worry.)</p>
        </div>
      )
    }
  ],
  'g12u4': [
    {
      title: "Causatives (Ettirgen Çatı)",
      content: (
        <div>
          <p>Bir işi başkasına yaptırma.</p>
          <ul className="list-disc pl-4 space-y-2">
             <li><strong>Have something done:</strong> (Hizmet almak)
                 <br/>I had my car repaired. (Arabamı tamir ettirdim.)</li>
             <li><strong>Get someone to do:</strong> (İkna etmek)
                 <br/>I got him to help me.</li>
             <li><strong>Make someone do:</strong> (Zorlamak)
                 <br/>He made me cry.</li>
             <li><strong>Let someone do:</strong> (İzin vermek)
                 <br/>Let him go.</li>
          </ul>
        </div>
      )
    }
  ],
  'g12u5': [
    {
      title: "Modals of Deduction (Present)",
      content: (
        <div>
          <p>Şimdiki zaman çıkarımları.</p>
          <p><strong>Must be:</strong> Kesin öyledir. (He is running, he must be in a hurry.)</p>
          <p><strong>Can't be:</strong> Olamaz. (She is eating, she can't be hungry.)</p>
          <p><strong>Might/May/Could be:</strong> Olabilir (ihtimal).</p>
        </div>
      )
    }
  ],
  'g12u6': [
    {
      title: "Mixed Conditionals",
      content: (
        <div>
          <p>Zamanları karışık koşul cümleleri.</p>
          <p><strong>Past Cause &rarr; Present Result:</strong></p>
          <p>If I <strong>had studied</strong> harder (Past), I <strong>would be</strong> a doctor now (Present).</p>
          <p><strong>Present State &rarr; Past Result:</strong></p>
          <p>If I <strong>were</strong> rich (General), I <strong>would have bought</strong> that car (Past).</p>
        </div>
      )
    }
  ],
  'g12u7': [
    {
      title: "Passive Voice (Advanced)",
      content: (
        <div>
          <p>Kişisel olmayan pasif yapılar.</p>
          <p>It is said that... / It is believed that...</p>
          <p>He is said to be rich. (Onun zengin olduğu söyleniyor.)</p>
          <p>She is believed to have left the country.</p>
        </div>
      )
    }
  ],
  'g12u8': [
    {
      title: "Inversion",
      content: (
        <div>
          <p>Vurgu için cümleyi devrik yapma (Yardımcı fiil başa gelir).</p>
          <p><strong>Never have I seen</strong> such a thing.</p>
          <p><strong>Rarely do we</strong> go out.</p>
          <p><strong>Not only</strong> is he smart, <strong>but also</strong> handsome.</p>
        </div>
      )
    }
  ],
  'g12u9': [
    {
      title: "Conjunctions & Transitions",
      content: (
        <div>
          <ul className="list-disc pl-4 space-y-1">
             <li><strong>Correlative:</strong> Not only... but also..., Either... or..., Neither... nor..., Both... and...</li>
             <li><strong>Concession:</strong> However, Nevertheless, Even though.</li>
             <li><strong>Condition:</strong> Unless, Provided that, As long as.</li>
          </ul>
        </div>
      )
    }
  ],
  'g12u10': [
    {
      title: "Emphasis (Cleft Sentences)",
      content: (
        <div>
          <p>Cümlede belirli bir öğeyi vurgulama.</p>
          <p><strong>It was</strong> John <strong>who</strong> broke the window. (Camı kıran John'du.)</p>
          <p><strong>What</strong> I need <strong>is</strong> some rest. (İhtiyacım olan şey biraz dinlenmek.)</p>
          <p><strong>All</strong> I want <strong>is</strong> you.</p>
        </div>
      )
    }
  ]
};
