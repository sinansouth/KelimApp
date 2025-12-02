
import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G4: Record<string, GrammarTopic[]> = {
  'g4u1': [
    {
      title: "Imperatives (Emir Kipleri)",
      content: (
        <div>
          <p>Sınıf kurallarını söylerken veya birinden bir şey yapmasını isterken fiili cümlenin başında kullanırız. Özne (You) kullanılmaz.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li><strong>Open</strong> the window. (Pencereyi aç.)</li>
            <li><strong>Close</strong> the door. (Kapıyı kapat.)</li>
            <li><strong>Clean</strong> the board. (Tahtayı temizle.)</li>
            <li><strong>Be</strong> quiet. (Sessiz ol.)</li>
            <li><strong>Turn</strong> on the light. (Işığı aç.)</li>
          </ul>
          <p className="mt-2 text-sm text-slate-500">Kibar olmak için cümlenin sonuna "please" ekleyebiliriz: "Open the door, please."</p>
        </div>
      )
    },
    {
      title: "Numbers (Sayılar)",
      content: (
        <div>
          <p>1'den 50'ye kadar sayıları öğreniyoruz.</p>
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
             <div>
                 10 - Ten <br/> 20 - Twenty <br/> 30 - Thirty <br/> 40 - Forty <br/> 50 - Fifty
             </div>
             <div>
                 11 - Eleven <br/> 12 - Twelve <br/> 13 - Thirteen <br/> 21 - Twenty-one <br/> 35 - Thirty-five
             </div>
          </div>
        </div>
      )
    }
  ],
  'g4u2': [
    {
      title: "Where are you from?",
      content: (
        <div>
          <p>Birinin hangi ülkeden olduğunu sormak için:</p>
          <p className="font-bold text-indigo-600">Where are you from?</p>
          <p>I am from <strong>Turkey</strong>. (Ben Türkiye'denim.)</p>
          <p>He is from <strong>Japan</strong>. (O Japonya'dan.)</p>
          <p>She is from <strong>Italy</strong>. (O İtalya'dan.)</p>
        </div>
      )
    },
    {
      title: "Nationality (Milliyet)",
      content: (
        <div>
          <p>Milliyetimizi söylerken:</p>
          <p className="font-bold text-indigo-600">What is your nationality?</p>
          <p>I am <strong>Turkish</strong>. (Ben Türküm.)</p>
          <p>She is <strong>German</strong>. (O Alman.)</p>
          <p>They are <strong>English</strong>. (Onlar İngiliz.)</p>
        </div>
      )
    }
  ],
  'g4u3': [
    {
      title: "Can / Can't (Yetenek)",
      content: (
        <div>
          <p>Yapabildiklerimiz için 'Can', yapamadıklarımız için 'Can't' kullanırız.</p>
          <p className="text-green-600 mt-2">I <strong>can</strong> swim. (Yüzebilirim.)</p>
          <p className="text-green-600">A bird <strong>can</strong> fly. (Bir kuş uçabilir.)</p>
          <p className="text-red-600 mt-2">I <strong>can't</strong> drive a car. (Araba süremem.)</p>
          <p className="text-red-600">A fish <strong>can't</strong> run. (Bir balık koşamaz.)</p>
          
          <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              <strong>Soru:</strong> Can you play football? <br/>
              <strong>Cevap:</strong> Yes, I can. / No, I can't.
          </div>
        </div>
      )
    },
    {
      title: "Possessive Adjectives (Sahiplik)",
      content: (
        <div>
          <ul className="space-y-1">
              <li><strong>My:</strong> Benim (My guitar)</li>
              <li><strong>Your:</strong> Senin (Your bike)</li>
              <li><strong>His:</strong> Onun - Erkek (His car)</li>
              <li><strong>Her:</strong> Onun - Kadın (Her doll)</li>
              <li><strong>Its:</strong> Onun - Hayvan/Cansız (Its tail)</li>
          </ul>
        </div>
      )
    }
  ],
  'g4u4': [
    {
      title: "Like / Don't Like",
      content: (
        <div>
          <p>Sevdiğimiz ve sevmediğimiz aktiviteleri anlatırken:</p>
          <div className="mt-2">
            <p className="font-bold text-green-600">Olumlu:</p>
            <p>I <strong>like</strong> reading comics. (Çizgi roman okumayı severim.)</p>
            <p>I <strong>like</strong> riding a bike.</p>
          </div>
          <div className="mt-2">
            <p className="font-bold text-red-600">Olumsuz:</p>
            <p>I <strong>don't like</strong> watching cartoons. (Çizgi film izlemeyi sevmem.)</p>
            <p>I <strong>don't like</strong> dancing.</p>
          </div>
          <div className="mt-3 p-2 border border-slate-200 dark:border-slate-700 rounded">
             <strong>Dikkat:</strong> Like/Don't like kelimesinden sonra gelen eyleme <strong>-ing</strong> takısı gelir. (read<strong>ing</strong>, danc<strong>ing</strong>)
          </div>
        </div>
      )
    }
  ],
  'g4u5': [
    {
      title: "Telling the Time (Saatler)",
      content: (
        <div>
          <p>Saati sormak için: <strong>What time is it?</strong></p>
          <ul className="list-disc pl-4 mt-2 space-y-2">
            <li>Tam saatler: It is seven <strong>o'clock</strong>. (Saat 7.)</li>
            <li>Buçuklu saatler: It is <strong>half past</strong> eight. (Saat 8 buçuk.)</li>
            <li>Sabah/Akşam: 7 AM (Sabah) / 7 PM (Akşam)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Daily Routines (Günlük Rutin)",
      content: (
        <div>
          <p>Geniş zamanda günlük işlerimizi anlatırız.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
             <li>I <strong>wake up</strong> at 7 o'clock.</li>
             <li>I <strong>wash</strong> my face.</li>
             <li>I <strong>get dressed</strong>.</li>
             <li>I <strong>go</strong> to school.</li>
             <li>I <strong>have</strong> breakfast.</li>
          </ul>
        </div>
      )
    }
  ],
  'g4u6': [
    {
      title: "Prepositions of Place (Yer Edatları)",
      content: (
        <div>
          <p>Nesnelerin yerini tarif etmek için:</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li><strong>In:</strong> İçinde</li>
            <li><strong>On:</strong> Üstünde</li>
            <li><strong>Under:</strong> Altında</li>
            <li><strong>Behind:</strong> Arkasında</li>
            <li><strong>In front of:</strong> Önünde</li>
            <li><strong>Near:</strong> Yanında/Yakınında</li>
          </ul>
        </div>
      )
    },
    {
      title: "Where is...? (Nerede?)",
      content: (
        <div>
          <p><strong>Soru:</strong> Where is the brush?</p>
          <p><strong>Cevap:</strong> It is <strong>in</strong> the glass.</p>
          <p><strong>Soru:</strong> Where is the cat?</p>
          <p><strong>Cevap:</strong> It is <strong>under</strong> the table.</p>
        </div>
      )
    }
  ],
  'g4u7': [
    {
      title: "Jobs (Meslekler)",
      content: (
        <div>
          <p>Birinin mesleğini sormak için:</p>
          <p className="font-bold text-indigo-600">What is your job?</p>
          <p>I am a <strong>teacher</strong>. (Ben bir öğretmenim.)</p>
          <p>He is a <strong>doctor</strong>. (O bir doktordur.)</p>
          <p>She is a <strong>chef</strong>. (O bir aşçıdır.)</p>
        </div>
      )
    },
    {
      title: "What does he/she do?",
      content: (
        <div>
          <p>Mesleklerin ne iş yaptığını anlatırken:</p>
          <p>A vet helps animals. (Veteriner hayvanlara yardım eder.)</p>
          <p>A chef cooks food. (Aşçı yemek pişirir.)</p>
          <p>A fireman puts out fires. (İtfaiyeci yangınları söndürür.)</p>
        </div>
      )
    }
  ],
  'g4u8': [
    {
      title: "Seasons (Mevsimler)",
      content: (
        <div>
          <p>Dört mevsimi öğreniyoruz:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Summer:</strong> Yaz (It is hot and sunny.)</li>
            <li><strong>Winter:</strong> Kış (It is cold and snowy.)</li>
            <li><strong>Spring:</strong> İlkbahar (It is warm.)</li>
            <li><strong>Autumn (Fall):</strong> Sonbahar (It is cool and windy.)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Clothes (Kıyafetler)",
      content: (
        <div>
          <p>Hava durumuna göre giydiklerimiz:</p>
          <p>In summer, I wear a <strong>t-shirt</strong> and <strong>shorts</strong>.</p>
          <p>In winter, I wear a <strong>coat</strong>, <strong>boots</strong> and a <strong>scarf</strong>.</p>
        </div>
      )
    }
  ],
  'g4u9': [
    {
      title: "Have got / Has got (Dış Görünüş)",
      content: (
        <div>
          <p>İnsanların fiziksel özelliklerini anlatırken:</p>
          <p>I <strong>have got</strong> blue eyes. (Mavi gözlerim var.)</p>
          <p>She <strong>has got</strong> long hair. (Onun uzun saçı var.)</p>
          <p>He <strong>has got</strong> a moustache. (Onun bıyığı var.)</p>
        </div>
      )
    },
    {
      title: "Adjectives (Sıfatlar)",
      content: (
        <div>
          <p>Kişileri tarif ederken kullandığımız sıfatlar:</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
             <div>Tall (uzun) - Short (kısa)</div>
             <div>Old (yaşlı) - Young (genç)</div>
             <div>Slim (zayıf) - Fat (şişman)</div>
             <div>Beautiful (güzel) - Ugly (çirkin)</div>
          </div>
        </div>
      )
    }
  ],
  'g4u10': [
    {
      title: "Offers (Teklifler)",
      content: (
        <div>
          <p>Bir şey istemek veya teklif etmek için <strong>Would you like...?</strong> kalıbı kullanılır.</p>
          <p className="font-bold text-indigo-600">Would you like some milk?</p>
          <p>Yes, please. (Evet, lütfen.)</p>
          <p>No, thanks. I am full. (Hayır, teşekkürler. Tokum.)</p>
          <p>Can I have some water? (Biraz su alabilir miyim?)</p>
        </div>
      )
    },
    {
      title: "Food & Drinks",
      content: (
        <div>
          <p><strong>Hungry:</strong> Aç (I am hungry. I want pizza.)</p>
          <p><strong>Thirsty:</strong> Susamış (I am thirsty. I want water.)</p>
          <p><strong>Yummy:</strong> Lezzetli</p>
        </div>
      )
    }
  ]
};
