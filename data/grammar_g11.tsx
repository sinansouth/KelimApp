
import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G11: Record<string, GrammarTopic[]> = {
  'g11u1': [
    {
      title: "Future Tenses Review",
      content: (
        <div>
          <p>Gelecek zaman yapılarının detaylı kullanımı.</p>
          <ul className="list-disc pl-4 space-y-2">
            <li><strong>Will:</strong> Geleceğe dair tahmin, ani karar, söz verme.
                <br/><em className="text-sm text-slate-500">I think it will rain. / I will answer the phone.</em></li>
            <li><strong>Be going to:</strong> Planlanmış eylem, kanıta dayalı tahmin.
                <br/><em className="text-sm text-slate-500">I am going to study medicine. / Look at the clouds, it is going to rain.</em></li>
            <li><strong>Present Continuous:</strong> Yakın gelecek için kesinleşmiş düzenlemeler.
                <br/><em className="text-sm text-slate-500">We are meeting at 5.</em></li>
            <li><strong>Future Continuous:</strong> (will be doing) Gelecekte belli bir anda devam edecek eylemler.
                <br/><em className="text-sm text-slate-500">This time tomorrow, I will be flying to London.</em></li>
          </ul>
        </div>
      )
    }
  ],
  'g11u2': [
    {
      title: "Gerunds and Infinitives",
      content: (
        <div>
          <p>Fiilimsiler: Bir fiilin isimleşmesi veya başka bir fiile bağlanması.</p>
          <ul className="list-disc pl-4 space-y-2">
            <li><strong>Gerund (Ving):</strong> <em>enjoy, like, hate, suggest, mind, finish</em> gibi fiillerden sonra.
                <br/><em className="text-sm text-slate-500">I enjoy <strong>swimming</strong>.</em></li>
            <li><strong>Infinitive (to V):</strong> <em>want, hope, decide, plan, promise</em> gibi fiillerden sonra.
                <br/><em className="text-sm text-slate-500">I want <strong>to swim</strong>.</em></li>
            <li><strong>Prepositions:</strong> Edatlardan (in, on, at, of, about) sonra daima Ving gelir.
                <br/><em className="text-sm text-slate-500">She is good at <strong>drawing</strong>.</em></li>
          </ul>
        </div>
      )
    }
  ],
  'g11u3': [
    {
      title: "Simple Past vs Past Continuous",
      content: (
        <div>
          <p>Geçmişte kesişen olaylar (When / While).</p>
          <p><strong>Kural:</strong> Kısa eylem (Simple Past) uzun eylemi (Past Continuous) böler.</p>
          <p>When I <strong>arrived</strong> (kısa), they <strong>were sleeping</strong> (uzun).</p>
          <p>While I <strong>was studying</strong>, the phone <strong>rang</strong>.</p>
        </div>
      )
    },
    {
      title: "Past Perfect Tense",
      content: (
        <div>
          <p>Geçmişin geçmişi. İki geçmiş olaydan önce olanı vurgular.</p>
          <p><strong>Formül:</strong> had + V3</p>
          <p>When I got to the station, the train <strong>had left</strong>. (Ben varmadan önce tren gitmişti.)</p>
        </div>
      )
    }
  ],
  'g11u4': [
    {
      title: "Used to / Would",
      content: (
        <div>
          <p>Geçmiş alışkanlıklar.</p>
          <p><strong>Used to:</strong> Hem eylem hem durum bildirir. (I used to be shy. / I used to play.)</p>
          <p><strong>Would:</strong> Sadece tekrarlanan eylemler için kullanılır, durum bildirmez. (My dad would take us to the park.)</p>
        </div>
      )
    },
    {
      title: "Was/Were going to",
      content: (
        <div>
          <p>Geçmişte planlanan ama gerçekleşmemiş niyetler.</p>
          <p>I <strong>was going to</strong> call you, but I forgot. (Arayacaktım ama unuttum.)</p>
        </div>
      )
    }
  ],
  'g11u5': [
    {
      title: "Relative Clauses (Non-defining)",
      content: (
        <div>
          <p>Cümledeki isim hakkında <strong>ekstra</strong> bilgi verir. Cümleden çıkarılırsa anlam bozulmaz. Virgül kullanılır.</p>
          <p>My father, <strong>who is a doctor</strong>, works hard.</p>
          <p>Izmir, <strong>which is in the west</strong>, is beautiful.</p>
          <p>Atatürk, <strong>who founded Turkey</strong>, was a great leader.</p>
        </div>
      )
    }
  ],
  'g11u6': [
    {
      title: "Wishes and Regrets",
      content: (
        <div>
          <p><strong>Present Wish:</strong> I wish I <strong>were</strong> rich. (Keşke zengin olsam - şu an değilim)</p>
          <p><strong>Past Regret:</strong> I wish I <strong>had studied</strong> harder. (Keşke daha çok çalışsaydım - geçmişte)</p>
          <p><strong>If only:</strong> Keşke anlamında, daha güçlü. (If only I <strong>hadn't said</strong> that.)</p>
        </div>
      )
    },
    {
      title: "If Clause Type 3",
      content: (
        <div>
          <p>Geçmişle ilgili değiştirilemez, hayali durumlar ve sonuçları.</p>
          <p><strong>Formül:</strong> If + Past Perfect, ... would have + V3</p>
          <p>If I <strong>had known</strong> you were coming, I <strong>would have baked</strong> a cake. (Bilseydim yapardım - ama bilmedim ve yapmadım)</p>
        </div>
      )
    }
  ],
  'g11u7': [
    {
      title: "Passive Voice",
      content: (
        <div>
          <p>Farklı zamanlarda edilgen çatı.</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Present:</strong> It is made. (Yapılır)</li>
            <li><strong>Past:</strong> It was made. (Yapıldı)</li>
            <li><strong>Present Perfect:</strong> It has been made. (Yapıldı/Yapılmış)</li>
            <li><strong>Future:</strong> It will be made. (Yapılacak)</li>
            <li><strong>Modals:</strong> It can be made. (Yapılabilir)</li>
          </ul>
        </div>
      )
    }
  ],
  'g11u8': [
    {
      title: "Reported Speech (Commands & Questions)",
      content: (
        <div>
          <p><strong>Commands (Emirler):</strong> Tell/Ask + object + to V</p>
          <p>He told me <strong>to sit</strong> down.</p>
          <p>He told me <strong>not to</strong> speak.</p>
          <br/>
          <p><strong>Questions (Sorular):</strong> If veya WH- kelimesi kullanılır, cümle düz cümle sırasına döner.</p>
          <p>She asked <strong>if</strong> I was ready. (Hazır mısın? &rarr; Hazır olup olmadığımı sordu)</p>
          <p>He asked <strong>where</strong> I lived. (Nerede yaşıyorsun? &rarr; Nerede yaşadığımı sordu)</p>
        </div>
      )
    }
  ],
  'g11u9': [
    {
      title: "Adjective Clauses (Reduction)",
      content: (
        <div>
          <p>Sıfat cümleciklerini kısaltma.</p>
          <p><strong>Active:</strong> The boy <strong>who is sitting</strong> there &rarr; The boy <strong>sitting</strong> there.</p>
          <p><strong>Passive:</strong> The car <strong>which was sold</strong> yesterday &rarr; The car <strong>sold</strong> yesterday.</p>
        </div>
      )
    }
  ],
  'g11u10': [
    {
      title: "Connectors (Bağlaçlar)",
      content: (
        <div>
          <ul className="list-disc pl-4 space-y-2">
             <li><strong>Contrast (Zıtlık):</strong> Although, However, Despite, In spite of.
                 <br/><em className="text-sm">Although it rained, we went out.</em></li>
             <li><strong>Reason (Sebep):</strong> Because, Since, As, Due to.
                 <br/><em className="text-sm">Since it is late, let's go home.</em></li>
             <li><strong>Result (Sonuç):</strong> Therefore, As a result, So.
                 <br/><em className="text-sm">It was cold, so I wore a coat.</em></li>
          </ul>
        </div>
      )
    }
  ]
};
