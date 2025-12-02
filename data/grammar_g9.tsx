
import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G9: Record<string, GrammarTopic[]> = {
  'g9u1': [
    {
      title: "Verb 'to be' (Am/Is/Are)",
      content: (
        <div>
          <p>Olmak fiili: İsim cümlelerinde (durum, meslek, yer, sıfat) kullanılır.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>I <strong>am</strong> a student. (Ben bir öğrenciyim.)</li>
            <li>She <strong>is</strong> from Italy. (O İtalyalıdır.)</li>
            <li>They <strong>are</strong> happy. (Onlar mutludur.)</li>
            <li>We <strong>are not (aren't)</strong> at home. (Evde değiliz.)</li>
            <li><strong>Are</strong> you Turkish? (Türk müsün?)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Subject Pronouns & Possessive Adjectives",
      content: (
        <div>
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm border p-3 rounded bg-slate-50 dark:bg-slate-800">
             <div><strong>Subject (Özne)</strong><br/>I<br/>You<br/>He<br/>She<br/>It<br/>We<br/>They</div>
             <div><strong>Possessive (İyelik)</strong><br/>My (Benim)<br/>Your (Senin)<br/>His (Onun)<br/>Her (Onun)<br/>Its (Onun)<br/>Our (Bizim)<br/>Their (Onların)</div>
          </div>
          <p className="mt-2">This is <strong>my</strong> book. <strong>She</strong> is my sister.</p>
        </div>
      )
    },
    {
      title: "Have got / Has got",
      content: (
        <div>
          <p>Sahiplik bildirir.</p>
          <p>I/You/We/They &rarr; <strong>have got</strong></p>
          <p>He/She/It &rarr; <strong>has got</strong></p>
          <p className="mt-2">I <strong>have got</strong> a computer. She <strong>has got</strong> blue eyes.</p>
        </div>
      )
    }
  ],
  'g9u2': [
    {
      title: "Prepositions of Place",
      content: (
        <div>
          <p>Yer edatları:</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
              <li><strong>In:</strong> İçinde</li>
              <li><strong>On:</strong> Üstünde</li>
              <li><strong>At:</strong> -de/-da (Belirli nokta)</li>
              <li><strong>Between:</strong> Arasında</li>
              <li><strong>Opposite:</strong> Karşısında</li>
              <li><strong>Next to:</strong> Bitişiğinde</li>
          </ul>
          <p className="mt-2">The bank is <strong>opposite</strong> the park.</p>
        </div>
      )
    },
    {
      title: "Imperatives (Yön Tarifi)",
      content: (
        <div>
          <p>Yön tarif ederken emir cümleleri kullanılır:</p>
          <p><strong>Go</strong> straight ahead. (Düz git.)</p>
          <p><strong>Turn</strong> left. (Sola dön.)</p>
          <p><strong>Take</strong> the second right. (İkinci sağdan dön.)</p>
          <p><strong>Don't</strong> turn right. (Sağa dönme.)</p>
        </div>
      )
    },
    {
      title: "Comparatives",
      content: (
        <div>
          <p>Şehirleri ve yerleri karşılaştırma:</p>
          <p>Istanbul is <strong>more crowded than</strong> Ankara.</p>
          <p>A village is <strong>quieter than</strong> a city.</p>
          <p>Konya is <strong>larger than</strong> Rize.</p>
        </div>
      )
    }
  ],
  'g9u3': [
    {
      title: "Simple Present Tense",
      content: (
        <div>
          <p>Genel doğrular, alışkanlıklar ve film konuları anlatılırken kullanılır.</p>
          <p>I <strong>watch</strong> movies every Friday.</p>
          <p>She <strong>likes</strong> action films. (-s takısı)</p>
          <p>They <strong>don't go</strong> to the cinema often.</p>
          <p><strong>Do</strong> you like comedies?</p>
        </div>
      )
    },
    {
      title: "Adverbs of Frequency",
      content: (
        <div>
          <p>Ne sıklıkla yapıldığını belirtir (Özneden sonra gelir).</p>
          <p>Always (100%) - Usually - Often - Sometimes - Rarely - Never (0%)</p>
          <p>I <strong>never</strong> watch horror movies.</p>
          <p>She <strong>usually</strong> goes to the cinema on Sundays.</p>
        </div>
      )
    },
    {
      title: "Making Suggestions",
      content: (
        <div>
          <p>Öneri kalıpları:</p>
          <ul className="list-disc pl-4 space-y-1">
              <li><strong>Let's</strong> watch a comedy. (Hadi...)</li>
              <li><strong>Shall we</strong> go to the cinema? (...lim mi?)</li>
              <li><strong>Why don't we</strong> eat popcorn? (Neden ... yapmıyoruz?)</li>
              <li><strong>How about</strong> watching TV? (... ne dersin?)</li>
          </ul>
        </div>
      )
    }
  ],
  'g9u4': [
    {
      title: "Adverbs of Manner",
      content: (
        <div>
          <p>Eylemin nasıl yapıldığını anlatır. Genellikle sıfatın sonuna <strong>-ly</strong> eklenir.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>Slow &rarr; <strong>Slowly</strong> (Yavaşça)</li>
              <li>Careful &rarr; <strong>Carefully</strong> (Dikkatlice)</li>
              <li>Quick &rarr; <strong>Quickly</strong> (Hızlıca)</li>
              <li><strong>Düzensizler:</strong> Good &rarr; <strong>Well</strong>, Fast &rarr; Fast, Hard &rarr; Hard.</li>
          </ul>
          <p>She speaks English <strong>fluently</strong>.</p>
        </div>
      )
    },
    {
      title: "Present Continuous vs Simple Present",
      content: (
        <div>
          <p>Doğal yaşamı ve şu anki durumu anlatırken:</p>
          <p>People <strong>are destroying</strong> the forests (Şu anki süreç - Continuous).</p>
          <p>Trees <strong>give</strong> us oxygen (Genel gerçek - Simple Present).</p>
        </div>
      )
    }
  ],
  'g9u5': [
    {
      title: "Present Continuous Tense (Şimdiki Zaman)",
      content: (
        <div>
          <p>Şu an konuşma anında olan olaylar.</p>
          <p><strong>Formül:</strong> Subject + am/is/are + Ving</p>
          <p>I <strong>am studying</strong> now.</p>
          <p>He <strong>is sleeping</strong> at the moment.</p>
          <p>They <strong>are running</strong>.</p>
        </div>
      )
    },
    {
      title: "Describing People (Physical & Personality)",
      content: (
        <div>
          <p>Dış görünüş için <strong>be</strong> ve <strong>have got</strong>:</p>
          <p>She <strong>is</strong> tall and slim.</p>
          <p>He <strong>has got</strong> short dark hair.</p>
          <p>Kişilik için <strong>be</strong>:</p>
          <p>She <strong>is</strong> very generous.</p>
        </div>
      )
    }
  ],
  'g9u6': [
    {
      title: "Present Continuous for Future",
      content: (
        <div>
          <p>Şimdiki zaman yapısı, gelecekte kesinleşmiş planlar için de kullanılır.</p>
          <p>I <strong>am flying</strong> to London tomorrow. (Yarın uçuyorum - Biletim var, planlı)</p>
          <p>We <strong>are visiting</strong> the museum next week.</p>
          <p>She <strong>is meeting</strong> her friends at 5.</p>
        </div>
      )
    },
    {
      title: "Question Tags",
      content: (
        <div>
          <p>Cümle sonuna eklenen onay soruları (Değil mi?).</p>
          <p>Olumlu cümle &rarr; Olumsuz tag / Olumsuz cümle &rarr; Olumlu tag.</p>
          <p>You are Turkish, <strong>aren't you?</strong></p>
          <p>She isn't coming, <strong>is she?</strong></p>
          <p>They live here, <strong>don't they?</strong></p>
        </div>
      )
    }
  ],
  'g9u7': [
    {
      title: "Simple Past Tense (Was/Were)",
      content: (
        <div>
          <p>Geçmiş zamanın isim cümleleri (To Be).</p>
          <p>I <strong>was</strong> in Ephesus yesterday. (Dün Efes'teydim.)</p>
          <p>The pyramids <strong>were</strong> amazing. (Piramitler harikaydı.)</p>
          <p>She <strong>wasn't</strong> at school.</p>
        </div>
      )
    },
    {
      title: "Simple Past Tense (Verbs)",
      content: (
        <div>
          <p>Geçmişte tamamlanmış eylemler.</p>
          <p><strong>Regular (-ed):</strong> We <strong>visited</strong> the museum.</p>
          <p><strong>Irregular:</strong> I <strong>went</strong> to London. (Go &rarr; Went)</p>
          <p><strong>Negative:</strong> I <strong>didn't see</strong> him.</p>
          <p><strong>Question:</strong> <strong>Did</strong> you <strong>go</strong>?</p>
        </div>
      )
    }
  ],
  'g9u8': [
    {
      title: "Should / Shouldn't (Advice)",
      content: (
        <div>
          <p>Tavsiye verirken kullanılır.</p>
          <p>You <strong>should</strong> see a doctor.</p>
          <p>You <strong>shouldn't</strong> carry heavy things.</p>
        </div>
      )
    },
    {
      title: "Must / Mustn't (Obligation)",
      content: (
        <div>
          <p>Güçlü zorunluluk ve yasaklar.</p>
          <p>You <strong>must</strong> fasten your seatbelt. (Zorunluluk)</p>
          <p>You <strong>mustn't</strong> smoke here. (Yasak)</p>
        </div>
      )
    },
    {
      title: "Have to / Has to",
      content: (
        <div>
          <p>Dış kaynaklı (kural gereği) zorunluluklar.</p>
          <p>She <strong>has to</strong> wear a uniform.</p>
          <p>We <strong>don't have to</strong> get up early on Sundays. (Gerek yok)</p>
        </div>
      )
    }
  ],
  'g9u9': [
    {
      title: "Future Tense (Be going to)",
      content: (
        <div>
          <p>Planlanmış gelecek zaman veya kanıta dayalı tahmin.</p>
          <p>I <strong>am going to</strong> have a party. (Planladım)</p>
          <p>She <strong>is going to</strong> invite her friends.</p>
          <p>Look at the clouds! It <strong>is going to</strong> rain.</p>
        </div>
      )
    },
    {
      title: "Making Invitations",
      content: (
        <div>
          <p>Davet etme kalıpları:</p>
          <p><strong>Would you like to</strong> come?</p>
          <p><strong>Why don't you</strong> join us?</p>
          <p><strong>Are you busy</strong> on Sunday?</p>
        </div>
      )
    }
  ],
  'g9u10': [
    {
      title: "Superlatives (En Üstünlük)",
      content: (
        <div>
          <p>Bir grubun "en" iyisini/kötüsünü/büyüğünü belirtir.</p>
          <p>The <strong>best</strong> movie. (Good &rarr; Best)</p>
          <p>The <strong>most interesting</strong> show. (Uzun sıfatlar)</p>
          <p>The <strong>funniest</strong> clown. (Kısa sıfatlar -est)</p>
        </div>
      )
    },
    {
      title: "Quantifiers",
      content: (
        <div>
          <p>Miktar belirtme:</p>
          <p><strong>A lot of:</strong> Çok (Sayılabilen/Sayılamayan)</p>
          <p><strong>Some:</strong> Biraz/Birkaç</p>
          <p><strong>A little:</strong> Az (Sayılamayan)</p>
          <p><strong>A few:</strong> Az (Sayılabilen)</p>
        </div>
      )
    }
  ]
};
