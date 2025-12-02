
import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G5: Record<string, GrammarTopic[]> = {
  'g5u1': [
    {
      title: "School Subjects (Dersler)",
      content: (
        <div>
          <p>Sevdiğimiz dersleri anlatırken <strong>like</strong>, sevmediklerimiz için <strong>dislike</strong> kullanırız.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
             <li>I <strong>like</strong> Science. (Feni severim.)</li>
             <li>I <strong>dislike</strong> Art. (Resim dersini sevmem.)</li>
             <li>My favorite class is <strong>Maths</strong>. (En sevdiğim ders Matematiktir.)</li>
             <li>She is <strong>good at</strong> English. (O İngilizcede iyidir.)</li>
          </ul>
        </div>
      )
    },
    {
      title: "What classes do you have?",
      content: (
        <div>
          <p>Ders programını sorarken:</p>
          <p className="mb-1"><strong>Soru:</strong> What classes do you have on Monday?</p>
          <p><strong>Cevap:</strong> I have Turkish, English and Music.</p>
          <p className="mt-2"><strong>Soru:</strong> When is your P.E. class?</p>
          <p><strong>Cevap:</strong> It is on Friday.</p>
        </div>
      )
    }
  ],
  'g5u2': [
    {
      title: "Prepositions of Place (Yer Edatları)",
      content: (
        <div>
          <p>Yer yön tarif ederken kullanılan önemli edatlar:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Next to:</strong> Bitişiğinde (The bank is next to the cafe.)</li>
            <li><strong>Opposite:</strong> Karşısında (The school is opposite the park.)</li>
            <li><strong>Between:</strong> Arasında (The pharmacy is between the bakery and the cinema.)</li>
            <li><strong>In front of:</strong> Önünde</li>
            <li><strong>Behind:</strong> Arkasında</li>
          </ul>
        </div>
      )
    },
    {
      title: "Giving Directions (Yön Tarifi)",
      content: (
        <div>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Go straight ahead:</strong> Düz git.</li>
            <li><strong>Turn right:</strong> Sağa dön.</li>
            <li><strong>Turn left:</strong> Sola dön.</li>
            <li><strong>Take the second right:</strong> İkinci sağdan dön.</li>
            <li><strong>It is on your right:</strong> Sağında kalacak.</li>
          </ul>
        </div>
      )
    }
  ],
  'g5u3': [
    {
      title: "Hobbies & Abilities",
      content: (
        <div>
          <p>Hobilerimizden bahsederken <strong>like, enjoy, love</strong> kullanırız.</p>
          <p>I <strong>enjoy</strong> playing chess. (Satranç oynamaktan zevk alırım.)</p>
          <p>I <strong>love</strong> swimming. (Yüzmeyi çok severim.)</p>
          <p>I <strong>hate</strong> fishing. (Balık tutmaktan nefret ederim.)</p>
          <p className="mt-3">Yeteneklerimiz için <strong>can</strong>:</p>
          <p><strong>Can</strong> you play football? (Futbol oynayabilir misin?)</p>
          <p>Yes, I can. / No, I can't.</p>
        </div>
      )
    }
  ],
  'g5u4': [
    {
      title: "Simple Present Tense (Geniş Zaman)",
      content: (
        <div>
          <p>Günlük rutinlerimizi anlatırız. He, She, It öznelerinde fiil <strong>-s</strong> takısı alır.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>I <strong>get up</strong> at 7 o'clock.</li>
            <li>She <strong>gets up</strong> at 8 o'clock. (-s takısına dikkat!)</li>
            <li>He <strong>brushes</strong> his teeth.</li>
            <li>They <strong>go</strong> to school by bus.</li>
            <li>We <strong>don't</strong> sleep late.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Time (Saatler)",
      content: (
        <div>
          <p><strong>Quarter past:</strong> Çeyrek geçiyor. (It is quarter past five.)</p>
          <p><strong>Quarter to:</strong> Çeyrek var. (It is quarter to six.)</p>
          <p><strong>Half past:</strong> Buçuk. (It is half past two.)</p>
          <p><strong>O'clock:</strong> Tam saat. (It is three o'clock.)</p>
        </div>
      )
    }
  ],
  'g5u5': [
    {
      title: "Illnesses (Hastalıklar)",
      content: (
        <div>
          <p>Hastalığımızı söylerken <strong>have / has</strong> kullanırız.</p>
          <p>I <strong>have</strong> a headache. (Başım ağrıyor.)</p>
          <p>She <strong>has</strong> the flu. (O grip.)</p>
          <p>He <strong>has</strong> a broken leg. (Onun bacağı kırık.)</p>
          <p><strong>What is the matter with you?</strong> (Neyin var?)</p>
        </div>
      )
    },
    {
      title: "Should / Shouldn't (Tavsiye)",
      content: (
        <div>
          <p>Hasta birine tavsiye verirken:</p>
          <p className="text-green-600">You <strong>should</strong> take medicine. (İlaç almalısın.)</p>
          <p className="text-green-600">You <strong>should</strong> see a doctor. (Doktora görünmelisin.)</p>
          <p className="text-red-600">You <strong>shouldn't</strong> drink cold water. (Soğuk su içmemelisin.)</p>
          <p className="text-red-600">You <strong>shouldn't</strong> go to school. (Okula gitmemelisin.)</p>
        </div>
      )
    }
  ],
  'g5u6': [
    {
      title: "Expressing Opinions (Fikir Beyan Etme)",
      content: (
        <div>
          <p>Filmler hakkında ne düşündüğümüzü söylerken:</p>
          <p>I <strong>think</strong> comedies are funny. (Bence komediler komik.)</p>
          <p>I <strong>think</strong> horror movies are scary. (Bence korku filmleri korkunç.)</p>
          <p>In my opinion, cartoons are boring. (Benim fikrimce çizgi filmler sıkıcı.)</p>
          <p>My favorite movie is "Cars".</p>
        </div>
      )
    },
    {
      title: "Movie Types (Film Türleri)",
      content: (
        <div>
          <p>Comedy, Drama, Horror, Action, Cartoon, Science Fiction, Animation, Documentary.</p>
          <p><strong>Soru:</strong> What time is the movie? (Film saat kaçta?)</p>
        </div>
      )
    }
  ],
  'g5u7': [
    {
      title: "Ordinal Numbers (Sıra Sayıları)",
      content: (
        <div>
          <p>Tarihleri söylerken sıra sayılarını kullanırız. Genelde sonuna -th gelir.</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>1st - First (Birinci)</li>
            <li>2nd - Second (İkinci)</li>
            <li>3rd - Third (Üçüncü)</li>
            <li>4th - Fourth (Dördüncü)</li>
            <li>12th - Twelfth</li>
          </ul>
        </div>
      )
    },
    {
      title: "Months & Dates",
      content: (
        <div>
          <p><strong>When is your birthday?</strong></p>
          <p>It is in <strong>May</strong>. (Mayıs'ta - Sadece ay)</p>
          <p>It is on the <strong>5th of May</strong>. (Mayıs'ın 5'inde - Tam tarih)</p>
        </div>
      )
    },
    {
      title: "Permission (İzin İsteme)",
      content: (
        <div>
          <p><strong>Can I</strong> throw a party? (Parti verebilir miyim?)</p>
          <p><strong>Must</strong> we buy a gift? (Hediye almalı mıyız?)</p>
          <p>Sure / Of course. (Elbette.)</p>
        </div>
      )
    }
  ],
  'g5u8': [
    {
      title: "Making Suggestions (Öneriler)",
      content: (
        <div>
          <p>Arkadaşımıza spor yapmayı veya bir aktiviteyi önerirken:</p>
          <ul className="list-disc pl-4 mt-2 space-y-2">
            <li><strong>Let's</strong> go swimming. (Hadi yüzmeye gidelim.)</li>
            <li><strong>How about</strong> cycling? (Bisiklet sürmeye ne dersin?)</li>
            <li><strong>What about</strong> running? (Koşmaya ne dersin?)</li>
            <li><strong>Would you like to</strong> play tennis? (Tenis oynamak ister misin?)</li>
          </ul>
          <p className="mt-2"><strong>Kabul:</strong> That sounds great! / Good idea.</p>
          <p><strong>Red:</strong> I'm sorry, I can't. / I am tired.</p>
        </div>
      )
    }
  ],
  'g5u9': [
    {
      title: "Present Continuous Tense (Şimdiki Zaman)",
      content: (
        <div>
          <p>Şu an yapmakta olduğumuz eylemleri anlatırız. Fiile <strong>-ing</strong> takısı gelir.</p>
          <p>I am <strong>feeding</strong> the dog. (Köpeği besliyorum.)</p>
          <p>The birds are <strong>flying</strong>. (Kuşlar uçuyor.)</p>
          <p>She is <strong>watering</strong> the flowers. (Çiçekleri suluyor.)</p>
          <p>They are <strong>sleeping</strong>. (Onlar uyuyor.)</p>
        </div>
      )
    },
    {
      title: "Asking What Someone is Doing",
      content: (
        <div>
          <p><strong>Soru:</strong> What is the monkey doing?</p>
          <p><strong>Cevap:</strong> It is climbing the tree.</p>
          <p><strong>Soru:</strong> What are the ducks doing?</p>
          <p><strong>Cevap:</strong> They are swimming.</p>
        </div>
      )
    }
  ],
  'g5u10': [
    {
      title: "Numbers up to 1000",
      content: (
        <div>
          <p>100 - one hundred</p>
          <p>250 - two hundred and fifty</p>
          <p>500 - five hundred</p>
          <p>1000 - one thousand</p>
        </div>
      )
    },
    {
      title: "Simple Future (Will - Gelecek Zaman)",
      content: (
        <div>
          <p>Festivallerde ne yapacağımızı veya gelecekteki planlarımızı anlatırken:</p>
          <p>We <strong>will</strong> decorate the school. (Okulu süsleyeceğiz.)</p>
          <p>We <strong>will</strong> sing songs. (Şarkılar söyleyeceğiz.)</p>
          <p>I <strong>will</strong> wear a costume. (Kostüm giyeceğim.)</p>
        </div>
      )
    }
  ]
};
