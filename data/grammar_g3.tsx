
import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G3: Record<string, GrammarTopic[]> = {
  'g3u1': [
    { 
      title: "Greeting & Meeting (Selamlaşma)", 
      content: (
        <div>
          <p className="mb-2">İngilizce'de farklı zamanlarda farklı selamlaşma kelimeleri kullanırız.</p>
          <ul className="list-disc pl-4 space-y-2">
            <li><strong>Hello / Hi:</strong> Merhaba</li>
            <li><strong>Good morning:</strong> Günaydın</li>
            <li><strong>Good afternoon:</strong> Tünaydın</li>
            <li><strong>Good evening:</strong> İyi akşamlar</li>
            <li><strong>Good night:</strong> İyi geceler</li>
            <li><strong>Have a nice day:</strong> İyi günler</li>
          </ul>
        </div>
      )
    },
    {
      title: "Tanışma Soruları",
      content: (
        <div>
          <p className="font-bold">1. Adın ne?</p>
          <p><strong>Soru:</strong> What is your name?</p>
          <p><strong>Cevap:</strong> My name is Ali. / I am Ali.</p>
          <hr className="my-3 border-slate-200 dark:border-slate-700"/>
          <p className="font-bold">2. Nasılsın?</p>
          <p><strong>Soru:</strong> How are you?</p>
          <p><strong>Cevap:</strong> I am fine, thanks. (İyiyim, teşekkürler.)</p>
          <p><strong>Cevap:</strong> I am great. (Harikayım.)</p>
          <p><strong>Cevap:</strong> I am okay. (İyiyim / İdare eder.)</p>
        </div>
      ) 
    }
  ],
  'g3u2': [
    {
      title: "This is... (Bu...)",
      content: (
        <div>
          <p>Aile bireylerini veya nesneleri yakındayken tanıtırken kullanırız.</p>
          <ul className="list-disc pl-4 space-y-2">
             <li><strong>This is</strong> my mother. (Bu benim annem.)</li>
             <li><strong>This is</strong> my brother. (Bu benim erkek kardeşim.)</li>
             <li><strong>This is</strong> my family. (Bu benim ailem.)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Who is he/she? (O kim?)",
      content: (
        <div>
          <p>Birinin kim olduğunu sorarken cinsiyete dikkat etmeliyiz.</p>
          <div className="mt-3">
              <p className="font-bold text-blue-500">Erkekler için (He):</p>
              <p><strong>Soru:</strong> Who is he?</p>
              <p><strong>Cevap:</strong> He is my father. (O benim babam.)</p>
          </div>
          <div className="mt-3">
              <p className="font-bold text-pink-500">Kadınlar için (She):</p>
              <p><strong>Soru:</strong> Who is she?</p>
              <p><strong>Cevap:</strong> She is my sister. (O benim kız kardeşim.)</p>
          </div>
        </div>
      )
    }
  ],
  'g3u3': [
    { 
      title: "Can / Can't (Yetenekler)", 
      content: (
        <div>
          <p>Yapabildiğimiz şeyler için <strong>can</strong>, yapamadıklarımız için <strong>can't</strong> (cannot) kullanırız.</p>
          <div className="grid grid-cols-1 gap-3 mt-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <p className="text-green-700 dark:text-green-400 font-bold">Pozitif (+)</p>
                  <p>I <strong>can</strong> swim. (Yüzebilirim.)</p>
                  <p>She <strong>can</strong> run fast. (O hızlı koşabilir.)</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-400 font-bold">Negatif (-)</p>
                  <p>I <strong>can't</strong> fly. (Uçamam.)</p>
                  <p>He <strong>can't</strong> play the guitar. (O gitar çalamaz.)</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="text-blue-700 dark:text-blue-400 font-bold">Soru (?)</p>
                  <p><strong>Can</strong> you jump? (Zıplayabilir misin?)</p>
                  <p>Yes, I can. / No, I can't.</p>
              </div>
          </div>
        </div>
      ) 
    }
  ],
  'g3u4': [
    { 
      title: "Feelings (Hisler)", 
      content: (
        <div>
          <p>Nasıl hissettiğimizi anlatırken "I am" kalıbını kullanırız.</p>
          <ul className="list-disc pl-4 space-y-1">
              <li><strong>I am</strong> happy. (Mutluyum.)</li>
              <li><strong>I am</strong> sad. (Üzgünüm.)</li>
              <li><strong>I am</strong> tired. (Yorgunum.)</li>
              <li><strong>I am</strong> hungry. (Açım.)</li>
          </ul>
          <p className="mt-4 font-bold">Soru Sorarken:</p>
          <p><strong>Soru:</strong> Are you okay? (İyi misin?)</p>
          <p><strong>Cevap:</strong> Yes, I am. / No, I am not.</p>
          <p className="mt-2"><strong>Soru:</strong> How do you feel? (Nasıl hissediyorsun?)</p>
          <p><strong>Cevap:</strong> I feel good. (İyi hissediyorum.)</p>
        </div>
      ) 
    }
  ],
  'g3u5': [
    { 
      title: "Have got / Has got (Sahiplik)", 
      content: (
        <div>
          <p>Sahip olduğumuz oyuncakları veya nesneleri anlatırken kullanırız.</p>
          <ul className="list-disc pl-4 mt-2">
            <li><strong>I have got</strong> a ball. (Bir topum var.)</li>
            <li><strong>You have got</strong> a kite. (Uçurtman var.)</li>
            <li><strong>He/She has got</strong> a doll. (Onun bir bebeği var.)</li>
          </ul>
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
             <strong>Soru Sorarken:</strong>
             <br/>Have you got a red car?
             <br/>Yes, I have. / No, I haven't.
          </div>
        </div>
      ) 
    },
    {
      title: "Adjectives (Sıfatlar)",
      content: (
        <div>
          <p>Nesneleri tarif ederken renkleri ve şekilleri kullanırız.</p>
          <p>It is a <strong>red</strong> ball. (O kırmızı bir toptur.)</p>
          <p>It is a <strong>round</strong> box. (O yuvarlak bir kutudur.)</p>
          <p>It is a <strong>small</strong> car. (O küçük bir arabadır.)</p>
        </div>
      )
    }
  ],
  'g3u6': [
    { 
      title: "Prepositions (Yer Edatları)", 
      content: (
        <div>
          <p>Nesnelerin nerede olduğunu anlatırken:</p>
          <ul className="list-disc pl-4 space-y-2 mt-2">
            <li><strong>In:</strong> İçinde 
                <br/><span className="text-sm text-slate-500">The ball is <strong>in</strong> the box.</span>
            </li>
            <li><strong>On:</strong> Üstünde 
                <br/><span className="text-sm text-slate-500">The cat is <strong>on</strong> the chair.</span>
            </li>
            <li><strong>Under:</strong> Altında 
                <br/><span className="text-sm text-slate-500">The bag is <strong>under</strong> the table.</span>
            </li>
          </ul>
        </div>
      ) 
    },
    {
      title: "Where is...? (Nerede?)",
      content: (
        <div>
          <p>Tekil nesneler için:</p>
          <p><strong>Soru:</strong> Where is the book? (Kitap nerede?)</p>
          <p><strong>Cevap:</strong> It is on the desk. (Sıranın üzerinde.)</p>
        </div>
      )
    }
  ],
  'g3u7': [
    { 
      title: "Locations (Konumlar)", 
      content: (
        <div>
          <p>Bulunduğumuz yeri söylerken genellikle <strong>at</strong> veya <strong>in</strong> kullanırız.</p>
          <ul className="list-disc pl-4 space-y-1">
             <li>I am <strong>at school</strong>. (Okuldayım.)</li>
             <li>She is <strong>at home</strong>. (O evde.)</li>
             <li>We are <strong>in the classroom</strong>. (Sınıftayız.)</li>
             <li>He is <strong>at the hospital</strong>. (O hastanede.)</li>
             <li>They are <strong>at the zoo</strong>. (Onlar hayvanat bahçesinde.)</li>
          </ul>
        </div>
      ) 
    }
  ],
  'g3u8': [
    { 
      title: "Transportation (Ulaşım)", 
      content: (
        <div>
          <p>Araçlardan bahsederken:</p>
          <p>It is a <strong>car</strong>. (O bir arabadır.)</p>
          <p>The <strong>bus</strong> is big. (Otobüs büyüktür.)</p>
          <p>The <strong>plane</strong> is fast. (Uçak hızlıdır.)</p>
          <p>The <strong>train</strong> is long. (Tren uzundur.)</p>
        </div>
      ) 
    },
    {
      title: "Where is the...? (Konum)",
      content: (
        <div>
          <p><strong>Soru:</strong> Where is the car? (Araba nerede?)</p>
          <p><strong>Cevap:</strong> It is <strong>here</strong>. (Burada.)</p>
          <p><strong>Cevap:</strong> It is <strong>there</strong>. (Orada.)</p>
        </div>
      )
    }
  ],
  'g3u9': [
    { 
      title: "Weather (Hava Durumu)", 
      content: (
        <div>
          <p>Havayı sormak için: <strong>How is the weather?</strong></p>
          <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded text-center">Sunny (Güneşli) ☀️</div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-center">Rainy (Yağmurlu) 🌧️</div>
              <div className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded text-center">Cloudy (Bulutlu) ☁️</div>
              <div className="bg-white dark:bg-slate-800 border p-2 rounded text-center">Snowy (Karlı) ❄️</div>
          </div>
          <p className="mt-3">Ayrıca sıcaklık durumunu da söyleyebiliriz:</p>
          <p>It is <strong>hot</strong>. (Sıcak.)</p>
          <p>It is <strong>cold</strong>. (Soğuk.)</p>
        </div>
      ) 
    }
  ],
  'g3u10': [
    { 
      title: "Colors & Nature (Doğa ve Renkler)", 
      content: (
        <div>
          <p>Hayvanları ve renklerini tarif etme:</p>
          <p>The frog is <strong>green</strong>. (Kurbağa yeşildir.)</p>
          <p>The elephant is <strong>grey</strong> and <strong>big</strong>. (Fil gri ve büyüktür.)</p>
          <p>The ladybird is <strong>red</strong>. (Uğur böceği kırmızıdır.)</p>
        </div>
      ) 
    },
    {
      title: "Like / Don't Like (Hayvanlar)",
      content: (
        <div>
          <p>Sevdiğimiz ve sevmediğimiz hayvanları anlatırken:</p>
          <p className="text-green-600">I <strong>like</strong> dogs. (Köpekleri severim.)</p>
          <p className="text-red-600">I <strong>don't like</strong> snakes. (Yılanları sevmem.)</p>
          <p className="text-green-600">She <strong>likes</strong> cats. (O kedileri sever.)</p>
        </div>
      )
    }
  ]
};
