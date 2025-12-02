
import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_GEN: Record<string, GrammarTopic[]> = {
  'gen_a1': [
    {
      title: "Verb 'To Be' (Am/Is/Are)",
      content: (
        <div>
          <p>Olmak fiili durum, konum ve kimlik bildirmek için kullanılır.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li><strong>I am</strong> a student. (Ben bir öğrenciyim.)</li>
            <li><strong>She is</strong> happy. (O mutlu.)</li>
            <li><strong>They are</strong> at home. (Onlar evde.)</li>
            <li><strong>Are</strong> you Turkish? (Türk müsün?)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Present Simple Tense",
      content: (
        <div>
          <p>Genel doğrular ve rutinler için kullanılır.</p>
          <p><strong>Kural:</strong> He/She/It öznelerinde fiile <strong>-s</strong> takısı gelir.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>I <strong>play</strong> tennis every Sunday.</li>
            <li>She <strong>likes</strong> coffee.</li>
            <li>The sun <strong>rises</strong> in the east.</li>
          </ul>
        </div>
      )
    },
    {
      title: "There is / There are",
      content: (
        <div>
          <p>Bir şeyin varlığını belirtmek için kullanılır.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li><strong>There is</strong> a book on the table. (Tekil)</li>
            <li><strong>There are</strong> two cats in the garden. (Çoğul)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Can (Ability)",
      content: (
        <div>
          <p>Yetenek ve yapabilirlik bildirir.</p>
          <p>I <strong>can</strong> swim. (Yüzebilirim.)</p>
          <p>She <strong>can't</strong> speak French. (Fransızca konuşamaz.)</p>
        </div>
      )
    }
  ],
  'gen_a2': [
    {
      title: "Past Simple (Was/Were)",
      content: (
        <div>
          <p>'To be' fiilinin geçmiş zaman halidir.</p>
          <p>I <strong>was</strong> tired yesterday. (Dün yorgundum.)</p>
          <p>They <strong>were</strong> at the cinema.</p>
        </div>
      )
    },
    {
      title: "Past Simple (Verbs)",
      content: (
        <div>
          <p>Geçmişte tamamlanmış eylemler. Düzenli fiiller <strong>-ed</strong> alır.</p>
          <p>I <strong>watched</strong> TV last night.</p>
          <p>I <strong>went</strong> to London (Irregular: Go &rarr; Went).</p>
        </div>
      )
    },
    {
      title: "Present Continuous Tense",
      content: (
        <div>
          <p>Şu anda gerçekleşen eylemler (am/is/are + Ving).</p>
          <p>I <strong>am reading</strong> a book now.</p>
          <p>They <strong>are playing</strong> football.</p>
        </div>
      )
    },
    {
      title: "Comparatives & Superlatives",
      content: (
        <div>
          <p>Sıfatları karşılaştırma.</p>
          <p><strong>Comparative:</strong> A car is <strong>faster than</strong> a bike.</p>
          <p><strong>Superlative:</strong> The plane is <strong>the fastest</strong> transport.</p>
        </div>
      )
    }
  ],
  'gen_b1': [
    {
      title: "Present Perfect Tense",
      content: (
        <div>
          <p>Geçmişte başlayan ve etkisi devam eden veya zamanı belirsiz eylemler (Have/Has + V3).</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
             <li>I <strong>have lost</strong> my keys. (Anahtarlarımı kaybettim - hala kayıp)</li>
             <li>She <strong>has visited</strong> Paris twice. (Hayat tecrübesi)</li>
             <li><strong>For:</strong> Süreç (for 2 years) / <strong>Since:</strong> Başlangıç (since 2010)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Conditionals (Type 1 & 2)",
      content: (
        <div>
          <p><strong>Type 1 (Real):</strong> If it rains, I will stay at home.</p>
          <p><strong>Type 2 (Unreal):</strong> If I won the lottery, I would buy a boat.</p>
        </div>
      )
    },
    {
      title: "Passive Voice",
      content: (
        <div>
          <p>Yapılan işin önemli olduğu durumlar.</p>
          <p>This room <strong>is cleaned</strong> everyday.</p>
          <p>The phone <strong>was invented</strong> by Bell.</p>
        </div>
      )
    }
  ],
  'gen_b2': [
    {
      title: "Third Conditional",
      content: (
        <div>
          <p>Geçmişle ilgili pişmanlıklar.</p>
          <p>If I <strong>had studied</strong> harder, I <strong>would have passed</strong> the exam.</p>
        </div>
      )
    },
    {
      title: "Reported Speech",
      content: (
        <div>
          <p>Dolaylı anlatım.</p>
          <p>He said (that) he <strong>was</strong> happy.</p>
          <p>She asked if I <strong>would</strong> come.</p>
        </div>
      )
    },
    {
      title: "Future Perfect",
      content: (
        <div>
          <p>By next year, I <strong>will have graduated</strong>.</p>
        </div>
      )
    }
  ],
  'gen_c1': [
    {
      title: "Inversion",
      content: (
        <div>
          <p>Vurgu için devrik cümle.</p>
          <p><strong>Never have I seen</strong> such a beautiful view.</p>
        </div>
      )
    },
    {
      title: "Subjunctive",
      content: (
        <div>
          <p>Resmi dilde istek/öneri.</p>
          <p>It is essential that he <strong>be</strong> informed.</p>
        </div>
      )
    },
    {
      title: "Mixed Conditionals",
      content: (
        <div>
          <p>If I <strong>had gone</strong> to bed early (Past), I <strong>wouldn't be</strong> tired now (Present).</p>
        </div>
      )
    }
  ]
};
