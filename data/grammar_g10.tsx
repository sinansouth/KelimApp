
import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G10: Record<string, GrammarTopic[]> = {
  'g10u1': [
    {
      title: "Simple Present vs. Present Continuous",
      content: (
        <div>
          <p>Genel alışkanlıklar ile şu an yapılan eylemlerin karşılaştırılması.</p>
          <div className="grid grid-cols-1 gap-2 mt-2">
             <div className="p-2 border rounded">
                 <strong>Simple Present:</strong> I <em>usually</em> <strong>wake up</strong> at 7. (Rutin)
             </div>
             <div className="p-2 border rounded">
                 <strong>Present Continuous:</strong> I <strong>am studying</strong> <em>now</em>. (Şu an)
             </div>
          </div>
        </div>
      )
    },
    {
      title: "Stative Verbs (Durum Fiilleri)",
      content: (
        <div>
          <p>Durum bildiren ve genellikle -ing (şimdiki zaman) almayan fiiller.</p>
          <p><strong>Fiiller:</strong> like, love, hate, want, need, know, understand, believe, remember.</p>
          <p><strong>Doğru:</strong> I <strong>know</strong> the answer.</p>
          <p><strong>Yanlış:</strong> I am knowing the answer.</p>
          <p><strong>Doğru:</strong> She <strong>wants</strong> ice cream.</p>
        </div>
      )
    }
  ],
  'g10u2': [
    {
      title: "Future Plans (Be going to)",
      content: (
        <div>
          <p>Önceden planlanmış eylemler ve güçlü kanıtı olan tahminler için kullanılır.</p>
          <p>I <strong>am going to</strong> visit my grandparents this weekend. (Plan)</p>
          <p>Look at the black clouds! It <strong>is going to</strong> rain. (Kanıt)</p>
        </div>
      )
    },
    {
      title: "Future (Will)",
      content: (
        <div>
          <p>Konuşma anında verilen kararlar, tahminler, sözler ve teklifler için kullanılır.</p>
          <p>I think it <strong>will</strong> rain tomorrow. (Tahmin)</p>
          <p>I <strong>will</strong> help you with your homework. (Teklif/Söz)</p>
          <p>Wait! I <strong>will</strong> open the door. (Anlık karar)</p>
        </div>
      )
    }
  ],
  'g10u3': [
    {
      title: "Simple Past Tense",
      content: (
        <div>
          <p>Geçmişte tamamlanmış eylemler.</p>
          <p>Atatürk <strong>founded</strong> the Turkish Republic in 1923.</p>
          <p>He <strong>was</strong> a great leader.</p>
          <p>I <strong>didn't go</strong> to school yesterday.</p>
        </div>
      )
    },
    {
      title: "Past Continuous Tense",
      content: (
        <div>
          <p>Geçmişte belli bir süre devam etmiş eylemler.</p>
          <p><strong>Formül:</strong> was/were + Ving</p>
          <p>I <strong>was reading</strong> a book at 8 pm yesterday.</p>
          <p>They <strong>were fighting</strong> in the war.</p>
          <p>While I <strong>was walking</strong>, I saw Ali.</p>
        </div>
      )
    }
  ],
  'g10u4': [
    {
      title: "Used to",
      content: (
        <div>
          <p>Geçmişte yapılan ama artık yapılmayan alışkanlıklar veya durumlar.</p>
          <p>People <strong>used to</strong> travel on horses. (Eskiden atla seyahat ederlerdi.)</p>
          <p>I <strong>used to</strong> play with dolls when I was a child.</p>
          <p>She <strong>didn't use to</strong> eat spinach.</p>
        </div>
      )
    },
    {
      title: "Simple Past vs Used to",
      content: (
        <div>
          <p>Tek seferlik olaylar için Simple Past, geçmişteki sürekli alışkanlıklar için Used to kullanılır.</p>
          <p>I <strong>went</strong> to the cinema yesterday. (Tek seferlik)</p>
          <p>I <strong>used to</strong> go to the cinema every weekend. (Eski alışkanlık)</p>
        </div>
      )
    }
  ],
  'g10u5': [
    {
      title: "Present Perfect Tense",
      content: (
        <div>
          <p>Geçmişte başlamış, etkisi devam eden veya zamanı belirsiz eylemler.</p>
          <p><strong>Formül:</strong> have/has + V3</p>
          <p>I <strong>have visited</strong> London. (Hayat tecrübesi)</p>
          <p>She <strong>has bought</strong> a ticket. (Bilet hala onda)</p>
        </div>
      )
    },
    {
      title: "Ever / Never / Just / Already / Yet",
      content: (
        <div>
          <ul className="list-disc pl-4 space-y-1">
              <li><strong>Ever:</strong> Hiç (Have you ever eaten sushi?)</li>
              <li><strong>Never:</strong> Asla (I have never been to USA.)</li>
              <li><strong>Just:</strong> Henüz/Az önce (I have just finished.)</li>
              <li><strong>Already:</strong> Çoktan (I have already done it.)</li>
              <li><strong>Yet:</strong> Henüz (I haven't finished yet. - Olumsuz/Soru)</li>
          </ul>
        </div>
      )
    }
  ],
  'g10u6': [
    {
      title: "Modals of Advice",
      content: (
        <div>
          <p>Tavsiye verirken kullanılır.</p>
          <p><strong>Should:</strong> You <strong>should</strong> study hard.</p>
          <p><strong>Ought to:</strong> You <strong>ought to</strong> be careful. (Should ile aynı)</p>
          <p><strong>Had better:</strong> Yaparsan iyi olur (yoksa kötü olur). You <strong>had better</strong> see a doctor.</p>
        </div>
      )
    },
    {
      title: "If Clause Type 1",
      content: (
        <div>
          <p>Gerçekleşmesi muhtemel gelecek durumlar.</p>
          <p><strong>If + Present Simple, ... Will + V1</strong></p>
          <p>If you <strong>study</strong>, you <strong>will pass</strong> the exam.</p>
          <p>If it <strong>rains</strong>, we <strong>won't go</strong> out.</p>
        </div>
      )
    }
  ],
  'g10u7': [
    {
      title: "Passive Voice (Present)",
      content: (
        <div>
          <p>Eylemi yapanın değil, yapılan işin önemli olduğu durumlar.</p>
          <p><strong>Formül:</strong> am/is/are + V3</p>
          <p>Turkish delight <strong>is served</strong> with coffee.</p>
          <p>Festivals <strong>are celebrated</strong> every year.</p>
        </div>
      )
    },
    {
      title: "Passive Voice (Past)",
      content: (
        <div>
          <p>Geçmiş zaman edilgen yapı.</p>
          <p><strong>Formül:</strong> was/were + V3</p>
          <p>The telephone <strong>was invented</strong> by Graham Bell.</p>
          <p>The pyramids <strong>were built</strong> long ago.</p>
        </div>
      )
    }
  ],
  'g10u8': [
    {
      title: "Relative Clauses (Defining)",
      content: (
        <div>
          <p>Bir ismi tanımlayan ve niteleyen cümlecikler.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li><strong>Who:</strong> İnsanlar için (The man <strong>who</strong> is talking is my teacher.)</li>
            <li><strong>Which:</strong> Nesneler/Hayvanlar için (The car <strong>which</strong> is red is mine.)</li>
            <li><strong>Where:</strong> Yerler için (This is the city <strong>where</strong> I was born.)</li>
            <li><strong>That:</strong> Who ve Which yerine kullanılabilir.</li>
          </ul>
        </div>
      )
    }
  ],
  'g10u9': [
    {
      title: "Wish Clauses (Present)",
      content: (
        <div>
          <p>Şu anki durumdan memnuniyetsizlik ve dilek bildirme.</p>
          <p><strong>Formül:</strong> I wish + Past Simple (Anlam şimdiki zamandır)</p>
          <p>I wish I <strong>were</strong> taller. (Keşke daha uzun olsaydım - ama değilim.)</p>
          <p>I wish I <strong>had</strong> a car. (Keşke arabam olsaydı.)</p>
        </div>
      )
    },
    {
      title: "If Clause Type 2",
      content: (
        <div>
          <p>Şu an için hayali veya gerçekleşmesi imkansız durumlar.</p>
          <p><strong>If + Past Simple, ... Would + V1</strong></p>
          <p>If I <strong>were</strong> you, I <strong>would</strong> study harder. (Senin yerinde olsam...)</p>
          <p>If I <strong>had</strong> money, I <strong>would buy</strong> a plane.</p>
        </div>
      )
    }
  ],
  'g10u10': [
    {
      title: "Reported Speech (Statements)",
      content: (
        <div>
          <p>Dolaylı anlatım. Birinin söylediği sözü aktarma.</p>
          <p>Kural: Tense bir derece geçmişe alınır.</p>
          <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded">
              <p><strong>Direct:</strong> "I like shopping," she said.</p>
              <p><strong>Reported:</strong> She said (that) she <strong>liked</strong> shopping.</p>
          </div>
          <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded">
              <p><strong>Direct:</strong> "I am going home," he said.</p>
              <p><strong>Reported:</strong> He said he <strong>was going</strong> home.</p>
          </div>
        </div>
      )
    }
  ]
};
