
import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G7: Record<string, GrammarTopic[]> = {
  'g7u1': [
    {
      title: "Describing People (Physical Appearance)",
      content: (
        <div>
          <p>Dış görünüşü anlatırken <strong>have/has got</strong> (sahip olmak) veya <strong>is/are</strong> (olmak) kullanılır.</p>
          <div className="grid grid-cols-1 gap-2 mt-2">
              <div className="p-2 border rounded">
                  <strong>To Be (Am/Is/Are):</strong> Boy, kilo, yaş, genel görünüm.
                  <br/>- She <strong>is</strong> tall and slim. (O uzun ve zayıftır.)
                  <br/>- He <strong>is</strong> handsome. (O yakışıklıdır.)
              </div>
              <div className="p-2 border rounded">
                  <strong>Have/Has Got:</strong> Saç, göz, bıyık, sakal.
                  <br/>- He <strong>has got</strong> curly hair. (Onun kıvırcık saçı var.)
                  <br/>- They <strong>have got</strong> hazel eyes. (Onların ela gözleri var.)
              </div>
          </div>
        </div>
      )
    },
    {
      title: "Describing Personality (Kişilik)",
      content: (
        <div>
          <p>Kişilik özelliklerini anlatırken sıfatlar kullanılır (to be).</p>
          <ul className="list-disc pl-4 mt-2">
            <li>She is <strong>generous</strong> because she likes sharing. (O cömerttir çünkü paylaşmayı sever.)</li>
            <li>He is <strong>stubborn</strong>; he never changes his mind. (O inatçıdır; fikrini asla değiştirmez.)</li>
            <li>They are <strong>outgoing</strong>. (Onlar dışa dönüktür.)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Comparatives (Kişiler Arası)",
      content: (
        <div>
          <p>İnsanları karşılaştırırken:</p>
          <p>Ali is <strong>taller than</strong> Ahmet.</p>
          <p>Ayşe is <strong>more outgoing than</strong> Fatma.</p>
          <p>My hair is <strong>longer than</strong> yours.</p>
        </div>
      )
    }
  ],
  'g7u2': [
    {
      title: "Simple Present Tense",
      content: (
        <div>
          <p>Spor alışkanlıklarını ve rutinleri anlatırken kullanılır.</p>
          <p>I <strong>play</strong> tennis every weekend.</p>
          <p>He <strong>goes</strong> swimming on Fridays.</p>
          <p>They <strong>train</strong> three times a week.</p>
        </div>
      )
    },
    {
      title: "Frequency Adverbs (Sıklık Zarfları)",
      content: (
        <div>
          <p>Bir eylemi ne sıklıkla yaptığımızı belirtir. Özneden sonra gelir.</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Always:</strong> Her zaman (%100)</li>
            <li><strong>Usually:</strong> Genellikle (%80)</li>
            <li><strong>Often:</strong> Sık sık (%60)</li>
            <li><strong>Sometimes:</strong> Bazen (%40)</li>
            <li><strong>Seldom / Rarely:</strong> Nadiren (%10)</li>
            <li><strong>Never:</strong> Asla (%0)</li>
          </ul>
          <p className="mt-2">Örnek: I <strong>never</strong> eat junk food. She <strong>always</strong> runs.</p>
        </div>
      )
    }
  ],
  'g7u3': [
    {
      title: "Simple Past Tense (To Be - Was/Were)",
      content: (
        <div>
          <p>Geçmişteki durumlardan bahsederken 'am/is' &rarr; <strong>was</strong>, 'are' &rarr; <strong>were</strong> olur.</p>
          <p>I <strong>was</strong> born in 2010.</p>
          <p>She <strong>was</strong> a famous scientist.</p>
          <p>They <strong>were</strong> happy.</p>
          <p>We <strong>weren't</strong> at home yesterday.</p>
        </div>
      )
    },
    {
      title: "Simple Past Tense (Regular/Irregular Verbs)",
      content: (
        <div>
          <p>Biyografi anlatırken geçmiş zaman fiilleri kullanılır.</p>
          <p>He <strong>graduated</strong> from university. (Düzenli: -ed)</p>
          <p>She <strong>won</strong> the Nobel Prize. (Düzensiz: Win - Won)</p>
          <p>They <strong>moved</strong> to London.</p>
          <p>Einstein <strong>discovered</strong> the theory of relativity.</p>
        </div>
      )
    }
  ],
  'g7u4': [
    {
      title: "Should / Shouldn't (Obligations)",
      content: (
        <div>
          <p>Vahşi yaşamı korumak için yapılması gerekenler:</p>
          <p>We <strong>should</strong> protect wildlife. (Vahşi yaşamı korumalıyız.)</p>
          <p>We <strong>should</strong> stop hunting. (Avlanmayı durdurmalıyız.)</p>
          <p>We <strong>shouldn't</strong> destroy habitats. (Yaşam alanlarını yok etmemeliyiz.)</p>
          <p>We <strong>shouldn't</strong> wear fur. (Kürk giymemeliyiz.)</p>
        </div>
      )
    },
    {
      title: "Simple Present (Facts)",
      content: (
        <div>
          <p>Hayvanlar hakkındaki bilimsel gerçekleri anlatırken:</p>
          <p>Tigers <strong>live</strong> in jungles.</p>
          <p>Elephants <strong>have</strong> big ears.</p>
          <p>Giraffes <strong>eat</strong> leaves.</p>
        </div>
      )
    }
  ],
  'g7u5': [
    {
      title: "Preferences (Prefer)",
      content: (
        <div>
          <p>Tercihlerimizi belirtirken <strong>prefer</strong> kullanırız.</p>
          <p className="font-bold">Kalıp: prefer + (noun / Ving) + TO + (noun / Ving)</p>
          <ul className="list-disc pl-4 mt-2">
            <li>I prefer <strong>comedies</strong> to <strong>horror movies</strong>. (Komediyi korku filmine tercih ederim.)</li>
            <li>She prefers <strong>watching</strong> TV to <strong>going</strong> out. (TV izlemeyi dışarı çıkmaya tercih eder.)</li>
            <li>He prefers <strong>football</strong>. (Sadece tek bir şey de söylenebilir.)</li>
          </ul>
        </div>
      )
    },
    {
      title: "WH- Questions",
      content: (
        <div>
          <p>TV programları hakkında sorular:</p>
          <p><strong>What</strong> kind of movies do you like? (Ne tür filmleri seversin?)</p>
          <p><strong>Who</strong> is your favorite actor? (Favori aktörün kim?)</p>
          <p><strong>When</strong> is the movie? (Film ne zaman?)</p>
          <p><strong>Why</strong> do you like cartoons? (Neden çizgi film seversin?)</p>
        </div>
      )
    }
  ],
  'g7u6': [
    {
      title: "Quantifiers (Miktar Belirleyiciler)",
      content: (
        <div>
          <p>Parti hazırlığı için miktar sorma ve söyleme:</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li><strong>Some:</strong> Biraz/Birkaç (Olumlu cümle) - <em>I need some water.</em></li>
            <li><strong>Any:</strong> Hiç (Olumsuz ve soru) - <em>Do you have any juice?</em></li>
            <li><strong>A lot of:</strong> Çok - <em>There are a lot of balloons.</em></li>
            <li><strong>A few:</strong> Az (Sayılabilen - few apples)</li>
            <li><strong>A little:</strong> Az (Sayılamayan - a little milk)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Making Arrangements (Plan Yapma)",
      content: (
        <div>
          <p>Why don't we give a party?</p>
          <p>Let's decorate the room.</p>
          <p>Should we order a cake?</p>
          <p>How about preparing invitation cards?</p>
        </div>
      )
    }
  ],
  'g7u7': [
    {
      title: "Future Tense (Will)",
      content: (
        <div>
          <p>Gelecekle ilgili tahminlerde bulunurken <strong>will</strong> kullanırız. Genellikle "I think, I guess, I hope" ile başlar.</p>
          <p>I think I <strong>will</strong> be a doctor. (Bence doktor olacağım.)</p>
          <p>You <strong>will</strong> be very rich in the future.</p>
          <p>The world <strong>will</strong> be a better place.</p>
          <p>I hope she <strong>will</strong> come.</p>
          <p><strong>Won't</strong> (Will not): Olmayacak.</p>
        </div>
      )
    }
  ],
  'g7u8': [
    {
      title: "Public Buildings & Purposes",
      content: (
        <div>
          <p>Nereye, niçin gittiğimizi anlatmak için <strong>to</strong> (için/mek üzere) kullanırız.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
             <li>I went to the bakery <strong>to buy</strong> bread. (Ekmek almak için fırına gittim.)</li>
             <li>She went to the police station <strong>to report</strong> a crime.</li>
             <li>We go to the library <strong>to read</strong> books.</li>
             <li>They went to the cafe <strong>to drink</strong> coffee.</li>
          </ul>
        </div>
      )
    }
  ],
  'g7u9': [
    {
      title: "Must / Mustn't (Strong Obligation)",
      content: (
        <div>
          <p>Güçlü zorunluluklar ve yasaklar (Kendi içimizden gelen veya genel kurallar):</p>
          <p>We <strong>must</strong> protect the environment. (Korumalıyız - Şart)</p>
          <p>We <strong>must</strong> stop global warming.</p>
          <p>We <strong>mustn't</strong> pollute the air. (Kirletmemeliyiz - Yasak)</p>
          <p>We <strong>mustn't</strong> throw rubbish on the street.</p>
        </div>
      )
    },
    {
      title: "Have to / Has to",
      content: (
        <div>
          <p>Dışarıdan gelen zorunluluklar:</p>
          <p>We <strong>have to</strong> use public transport to reduce traffic.</p>
          <p>She <strong>has to</strong> recycle paper.</p>
        </div>
      )
    }
  ],
  'g7u10': [
    {
      title: "Comparatives (Karşılaştırma)",
      content: (
        <div>
          <p>Gezegenleri karşılaştırırken:</p>
          <p>Jupiter is <strong>larger than</strong> Mars.</p>
          <p>Venus is <strong>hotter than</strong> Earth.</p>
          <p>Saturn is <strong>colder than</strong> Mercury.</p>
        </div>
      )
    },
    {
      title: "Superlatives (En Üstünlük)",
      content: (
        <div>
          <p>Bir gruptaki "en" özelliği belirtir. Sıfatın önüne <strong>the</strong> gelir, sonuna <strong>-est</strong> eklenir (veya uzunsa <strong>most</strong>).</p>
          <p>Jupiter is <strong>the largest</strong> planet.</p>
          <p>Mercury is <strong>the closest</strong> planet to the Sun.</p>
          <p>Neptune is <strong>the farthest</strong> planet.</p>
          <p>It is <strong>the most interesting</strong> planet.</p>
        </div>
      )
    }
  ]
};
