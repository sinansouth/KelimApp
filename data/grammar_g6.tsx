
import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G6: Record<string, GrammarTopic[]> = {
  'g6u1': [
    {
      title: "Simple Present Tense (Geniş Zaman)",
      content: (
        <div>
          <p>Günlük rutinlerimizi, alışkanlıklarımızı ve genel gerçekleri anlatırız.</p>
          <ul className="list-disc pl-4 space-y-2 mt-2">
            <li>I <strong>wake up</strong> at 7:00. (Saat 7'de uyanırım.)</li>
            <li>She <strong>goes</strong> to school by bus. (O okula otobüsle gider. -s takısına dikkat!)</li>
            <li>He <strong>brushes</strong> his teeth every morning.</li>
            <li>We <strong>don't</strong> have breakfast at 6. (Saat 6'da kahvaltı yapmayız.)</li>
            <li>He <strong>doesn't</strong> play football. (O futbol oynamaz.)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Telling the Time & Dates",
      content: (
        <div>
          <p>Saatleri detaylı söyleme:</p>
          <ul className="list-disc pl-4 space-y-1">
              <li>It is <strong>quarter past</strong> three. (3'ü çeyrek geçiyor.)</li>
              <li>It is <strong>twenty to</strong> five. (5'e 20 var.)</li>
              <li>It is <strong>half past</strong> one. (Saat bir buçuk.)</li>
          </ul>
          <p className="mt-2"><strong>Tarihler:</strong> My birthday is on the 1st of June (June the first).</p>
        </div>
      )
    }
  ],
  'g6u2': [
    {
      title: "Likes & Dislikes",
      content: (
        <div>
          <p>Yiyecek ve içecek tercihlerimizi anlatma:</p>
          <p>I <strong>like</strong> cheese and olives. (Peynir ve zeytini severim.)</p>
          <p>She <strong>loves</strong> pancakes. (Krebi çok sever.)</p>
          <p>He <strong>dislikes</strong> junk food. (Abur cuburu sevmez.)</p>
          <p>They <strong>hate</strong> coffee. (Kahveden nefret ederler.)</p>
          <p><strong>Do you like</strong> milk? Yes, I do. / No, I don't.</p>
        </div>
      )
    },
    {
      title: "Yummy / Yuck",
      content: (
        <div>
          <p><strong>Yummy:</strong> Lezzetli, nefis (I like it!)</p>
          <p><strong>Yuck:</strong> İğrenç, kötü (I don't like it!)</p>
          <p>Can I have some ...? (Biraz ... alabilir miyim?)</p>
        </div>
      )
    }
  ],
  'g6u3': [
    {
      title: "Present Continuous Tense (Şimdiki Zaman)",
      content: (
        <div>
          <p>Şu anda konuşma anında yapılan eylemleri anlatırız. Formül: <strong>am/is/are + Ving</strong></p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>I <strong>am feeding</strong> the dog now. (Şu an köpeği besliyorum.)</li>
              <li>They <strong>are playing</strong> football in the park. (Parkta futbol oynuyorlar.)</li>
              <li>She <strong>is waiting</strong> for the bus. (Otobüsü bekliyor.)</li>
              <li>We <strong>aren't sleeping</strong>. (Uyumuyoruz.)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Present Continuous vs Simple Present",
      content: (
        <div>
          <p>İki zaman arasındaki fark:</p>
          <div className="grid grid-cols-1 gap-2 mt-2">
             <div className="p-2 border rounded">
                 <strong>Simple Present (Genel):</strong> I always drink tea. (Her zaman çay içerim.)
             </div>
             <div className="p-2 border rounded">
                 <strong>Present Continuous (Şu an):</strong> I am drinking coffee now. (Şu an kahve içiyorum.)
             </div>
          </div>
        </div>
      )
    }
  ],
  'g6u4': [
    {
      title: "Weather Conditions",
      content: (
        <div>
          <p>Havayı sormak:</p>
          <p className="font-bold">What is the weather like?</p>
          <ul className="list-disc pl-4 mt-2">
             <li>It is <strong>sunny</strong> and <strong>hot</strong>.</li>
             <li>It is <strong>rainy</strong> and <strong>wet</strong>.</li>
             <li>It is <strong>snowy</strong> and <strong>freezing</strong>.</li>
             <li>It is <strong>windy</strong> and <strong>cool</strong>.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Emotions (Duygular)",
      content: (
        <div>
          <p>Havaya veya durumlara göre hislerimiz:</p>
          <p>I feel <strong>happy</strong> on sunny days. (Güneşli günlerde mutlu hissederim.)</p>
          <p>I feel <strong>scared</strong> in stormy weather. (Fırtınalı havada korkarım.)</p>
          <p>He feels <strong>sleepy</strong> on rainy days. (Yağmurlu günlerde uykulu hisseder.)</p>
          <p>She feels <strong>anxious</strong>. (Endişeli hissediyor.)</p>
        </div>
      )
    }
  ],
  'g6u5': [
    {
      title: "Comparatives (Karşılaştırma)",
      content: (
        <div>
          <p>İki şeyi karşılaştırırken sıfatlara <strong>-er</strong> takısı veya başına <strong>more</strong> getiririz.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>Fast &rarr; Fast<strong>er</strong> (Daha hızlı)</li>
            <li>Big &rarr; Bigg<strong>er</strong> (Daha büyük)</li>
            <li>Happy &rarr; Happi<strong>er</strong> (Daha mutlu)</li>
            <li>Exciting &rarr; <strong>More</strong> exciting (Daha heyecanlı - Uzun sıfatlar)</li>
            <li>Beautiful &rarr; <strong>More</strong> beautiful (Daha güzel)</li>
          </ul>
          <p className="mt-3 font-bold">Düzensiz Sıfatlar:</p>
          <p>Good &rarr; <strong>Better</strong> (Daha iyi)</p>
          <p>Bad &rarr; <strong>Worse</strong> (Daha kötü)</p>
          <br/>
          <p>Örnek: The roller coaster is <strong>faster than</strong> the carousel.</p>
        </div>
      )
    }
  ],
  'g6u6': [
    {
      title: "Occupations (Meslekler)",
      content: (
        <div>
          <p>Mesleklerin ne yaptığını anlatma:</p>
          <ul className="list-disc pl-4 mt-2">
              <li>A teacher <strong>teaches</strong> students. (Öğretmen öğrencilere öğretir.)</li>
              <li>A mechanic <strong>repairs</strong> cars. (Tamirci arabaları tamir eder.)</li>
              <li>A doctor <strong>examines</strong> patients. (Doktor hastaları muayene eder.)</li>
              <li>A waiter <strong>serves</strong> food. (Garson yemek servis eder.)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Can (Yetenek)",
      content: (
        <div>
          <p>Mesleklerin yapabildikleri:</p>
          <p>A cook <strong>can</strong> cook delicious meals.</p>
          <p>A driver <strong>can</strong> drive cars and buses.</p>
          <p>A tailor <strong>can</strong> sew fabrics.</p>
        </div>
      )
    }
  ],
  'g6u7': [
    {
      title: "Simple Past Tense (Geçmiş Zaman - Düzenli)",
      content: (
        <div>
          <p>Geçmişte yaşanan ve biten olayları anlatırız. Düzenli fiillerin sonuna <strong>-ed</strong> takısı gelir.</p>
          <p>I <strong>played</strong> football yesterday. (Dün futbol oynadım.)</p>
          <p>We <strong>visited</strong> the museum last week. (Geçen hafta müzeyi ziyaret ettik.)</p>
          <p>She <strong>watched</strong> TV last night.</p>
        </div>
      )
    },
    {
      title: "Simple Past Tense (Düzensiz)",
      content: (
        <div>
          <p>Bazı fiillerin geçmiş zaman halleri tamamen değişir.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>Go &rarr; <strong>Went</strong> (Gitti)</li>
            <li>Swim &rarr; <strong>Swam</strong> (Yüzdü)</li>
            <li>Eat &rarr; <strong>Ate</strong> (Yedi)</li>
            <li>See &rarr; <strong>Saw</strong> (Gördü)</li>
            <li>Have &rarr; <strong>Had</strong> (Sahip oldu/Yaptı)</li>
            <li>Buy &rarr; <strong>Bought</strong> (Satın aldı)</li>
          </ul>
          <p>Örnek: I <strong>went</strong> to Antalya last summer.</p>
        </div>
      )
    }
  ],
  'g6u8': [
    {
      title: "Prepositions of Place",
      content: (
        <div>
          <p>Nesnelerin yerini detaylı tarif etme:</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li><strong>Between:</strong> İki şeyin arasında (The bank is between the cafe and the market.)</li>
            <li><strong>In front of:</strong> Önünde</li>
            <li><strong>Behind:</strong> Arkasında</li>
            <li><strong>Next to:</strong> Bitişiğinde</li>
            <li><strong>Near:</strong> Yakınında</li>
            <li><strong>Under:</strong> Altında (The cat is under the table.)</li>
          </ul>
        </div>
      )
    }
  ],
  'g6u9': [
    {
      title: "Should / Shouldn't (Tavsiye/Gereklilik)",
      content: (
        <div>
          <p>Çevreyi korumak için yapmamız gerekenler (öneriler):</p>
          <div className="mt-2">
              <p className="text-green-600">We <strong>should</strong> recycle glass and paper. (Geri dönüştürmeliyiz.)</p>
              <p className="text-green-600">We <strong>should</strong> use public transport. (Toplu taşıma kullanmalıyız.)</p>
              <p className="text-green-600">We <strong>should</strong> plant trees.</p>
          </div>
          <div className="mt-2">
              <p className="text-red-600">We <strong>shouldn't</strong> pollute the water. (Suyu kirletmemeliyiz.)</p>
              <p className="text-red-600">We <strong>shouldn't</strong> cut down trees.</p>
              <p className="text-red-600">We <strong>shouldn't</strong> waste energy.</p>
          </div>
        </div>
      )
    }
  ],
  'g6u10': [
    {
      title: "Simple Past Tense (Revision)",
      content: (
        <div>
          <p>Seçim süreçlerini anlatırken geçmiş zaman kullanılır.</p>
          <p>He <strong>became</strong> a candidate. (Aday oldu.)</p>
          <p>We <strong>voted</strong> for him. (Ona oy verdik.)</p>
          <p>She <strong>won</strong> the election. (Seçimi kazandı.)</p>
          <p>They <strong>gave</strong> a speech. (Konuşma yaptılar.)</p>
        </div>
      )
    }
  ]
};
