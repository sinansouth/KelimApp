
import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G8: Record<string, GrammarTopic[]> = {
  'u1': [
    {
      title: "Accepting and Refusing (Kabul ve Reddetme)",
      content: (
        <div className="space-y-4">
          <p>Bir daveti kabul ederken veya reddederken kullanılan kalıplar LGS'de sıkça çıkar.</p>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
            <h4 className="font-bold text-green-700 dark:text-green-400 mb-2">Accepting (Kabul Etme)</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Yes, I would love to. (Evet, çok isterim.)</li>
              <li>That sounds great/awesome. (Kulağa harika geliyor.)</li>
              <li>Sure, why not? (Tabii, neden olmasın?)</li>
              <li>I'll be there. (Orada olacağım.)</li>
              <li>Yeah, that would be great. (Evet, harika olur.)</li>
              <li>Of course. (Elbette.)</li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
            <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Refusing (Reddetme)</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>I'm sorry, but I can't. (Üzgünüm ama yapamam.)</li>
              <li>I'd love to, but I am busy. (Çok isterdim ama meşgulüm.)</li>
              <li>Sorry, I have another plan. (Üzgünüm, başka bir planım var.)</li>
              <li>No, thanks. (Hayır, teşekkürler.)</li>
              <li>Maybe another time. (Belki başka zaman.)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Making Simple Offers (Teklifte Bulunma)",
      content: (
        <div className="space-y-4">
          <p>Arkadaşlarımıza bir etkinlik teklif ederken şu kalıpları kullanırız:</p>

          <div className="space-y-3">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">Would you like to...?</span>
              <p className="text-sm italic text-slate-600 dark:text-slate-400">Would you like to drink coffee? (Kahve içmek ister misin?)</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">How about / What about...? (+ Ving)</span>
              <p className="text-sm italic text-slate-600 dark:text-slate-400">How about going to the cinema? (Sinemaya gitmeye ne dersin?)</p>
              <p className="text-xs text-red-500 mt-1">* Fiile -ing takısı geldiğine dikkat et!</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">Shall we...?</span>
              <p className="text-sm italic text-slate-600 dark:text-slate-400">Shall we meet at 5? (5'te buluşalım mı?)</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">Let's...</span>
              <p className="text-sm italic text-slate-600 dark:text-slate-400">Let's have a party! (Hadi parti verelim!)</p>
            </div>
          </div>
        </div>
      )
    }
  ],
  'u2': [
    {
      title: "Simple Present Tense (Geniş Zaman)",
      content: (
        <div>
          <p>Günlük rutinlerimizi, alışkanlıklarımızı ve sevdiklerimizi anlatırken kullanırız.</p>
          <ul className="list-disc pl-4 space-y-2 mt-2">
            <li>I <strong>get up</strong> early on weekdays.</li>
            <li>She <strong>listens</strong> to rock music. (He/She/It &rarr; -s takısı)</li>
            <li>We <strong>don't like</strong> camping.</li>
            <li><strong>Do</strong> you play an instrument?</li>
          </ul>
        </div>
      )
    },
    {
      title: "Expressing Preferences (Tercihler)",
      content: (
        <div>
          <p>Tercihlerimizi belirtirken <strong>prefer</strong> kullanırız.</p>
          <p className="mt-2 font-bold">Kalıp: I prefer [noun/Ving] TO [noun/Ving].</p>
          <ul className="list-disc pl-4 mt-2">
            <li>I prefer <strong>pop music</strong> to <strong>jazz music</strong>. (Pop müziği caza tercih ederim.)</li>
            <li>She prefers <strong>reading</strong> books to <strong>watching</strong> TV. (Kitap okumayı TV izlemeye tercih eder.)</li>
          </ul>
          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200">
              <strong>Not:</strong> "To" edatı "-e/-a" anlamı katar ve karşılaştırılan iki şey arasına gelir.
          </div>
        </div>
      )
    }
  ],
  'u3': [
    {
      title: "Process (Süreç Anlatımı)",
      content: (
        <div>
          <p>Yemek tarifi verirken sıralama kelimelerini kullanırız (Sequence Connectors).</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li><strong>First,</strong> peel the potatoes. (İlk önce...)</li>
            <li><strong>Second,</strong> chop them. (İkinci olarak...)</li>
            <li><strong>Then,</strong> fry them. (Sonra...)</li>
            <li><strong>Next,</strong> put them on a plate. (Sonra...)</li>
            <li><strong>After that,</strong> add some salt. (Ondan sonra...)</li>
            <li><strong>Finally,</strong> serve it hot. (Son olarak...)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Imperatives (Emir Kipleri)",
      content: (
        <div>
          <p>Tariflerde fiili başa alarak emir kipi kullanırız.</p>
          <ul className="list-disc pl-4 mt-2">
             <li><strong>Crack</strong> two eggs. (İki yumurta kır.)</li>
             <li><strong>Mix</strong> the flour and sugar. (Unu ve şekeri karıştır.)</li>
             <li><strong>Don't add</strong> too much salt. (Çok fazla tuz ekleme.)</li>
          </ul>
        </div>
      )
    }
  ],
  'u4': [
    {
      title: "Future Tense (Will)",
      content: (
        <div>
          <p>Gelecek zaman, tahminler ve konuşma anında verilen kararlar için kullanılır.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>I <strong>will</strong> call you later. (Seni sonra arayacağım - Karar)</li>
            <li>She <strong>will</strong> text me. (Bana mesaj atacak - Tahmin)</li>
            <li>Hold on, I <strong>will</strong> get him. (Bekle, onu çağıracağım - Anlık Karar)</li>
            <li>I <strong>won't</strong> (will not) forget. (Unutmayacağım.)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Phone Conversation Phrases",
      content: (
        <div>
          <p>Telefonda konuşurken kullanılan kalıplar:</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li><strong>Is Tom there?</strong> (Tom orada mı?)</li>
            <li><strong>Who is calling?</strong> (Kim arıyor?)</li>
            <li><strong>Hold on a moment, please.</strong> (Bir saniye bekleyin lütfen.)</li>
            <li><strong>I'll put you through.</strong> (Sizi bağlıyorum.)</li>
            <li><strong>Would you like to leave a message?</strong> (Mesaj bırakmak ister misiniz?)</li>
            <li><strong>Can you repeat that, please?</strong> (Tekrar eder misiniz?)</li>
          </ul>
        </div>
      )
    }
  ],
  'u5': [
    {
      title: "Connectors (Bağlaçlar)",
      content: (
        <div>
          <p>Cümleleri birbirine bağlarken:</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li><strong>And:</strong> Ve (I have a PC and a tablet.)</li>
            <li><strong>But:</strong> Ama (I like surfing the net, but I don't like chat rooms.)</li>
            <li><strong>Because:</strong> Çünkü (I am online because I have homework.)</li>
            <li><strong>So:</strong> Bu yüzden (My internet is broken, so I can't join.)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Accepting/Refusing (Tekrar)",
      content: (
        <div>
          <p>İnternet davetlerinde de 1. ünitedeki kalıplar geçerlidir.</p>
          <p>"Would you like to join our online game?"</p>
          <p>&rarr; "Sure, why not?" (Kabul)</p>
          <p>&rarr; "Sorry, my internet is bad." (Red)</p>
        </div>
      )
    }
  ],
  'u6': [
    {
      title: "Comparatives (Karşılaştırma)",
      content: (
        <div>
          <p>Macera sporlarını karşılaştırırken:</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>Skydiving is <strong>more dangerous than</strong> rafting.</li>
            <li>Caving is <strong>harder than</strong> trekking.</li>
            <li>Motor racing is <strong>faster than</strong> cycling.</li>
            <li>Adana is <strong>hotter than</strong> Erzurum.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Prefer / Would Rather",
      content: (
        <div>
          <p><strong>Prefer:</strong> I prefer <strong>staying</strong> home to <strong>going</strong> out.</p>
          <p><strong>Would Rather:</strong> I would rather <strong>stay</strong> home than <strong>go</strong> out. (Fiil yalın kullanılır!)</p>
          <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-sm">
             Prefer'den sonra fiile <strong>-ing</strong>, Would rather'dan sonra <strong>yalın</strong> fiil gelir.
          </div>
        </div>
      )
    }
  ],
  'u7': [
    {
      title: "Present Perfect Tense",
      content: (
        <div>
          <p>Geçmişte olmuş ama zamanı belirsiz veya etkisi devam eden olaylar.</p>
          <p><strong>Formül:</strong> Subject + have/has + V3 (Fiilin 3. hali)</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>I <strong>have been</strong> to Rome. (Roma'da bulundum.)</li>
            <li>She <strong>has visited</strong> the museum. (Müzeyi ziyaret etti.)</li>
            <li><strong>Have</strong> you ever <strong>eaten</strong> sushi? (Hiç suşi yedin mi?)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Experiences (Deneyimler)",
      content: (
        <div>
          <p>Deneyimlerimizi anlatırken "I have..." kalıbını kullanırız.</p>
          <p>I have tasted Turkish Kebab. It is delicious.</p>
          <p>I have never been to London.</p>
        </div>
      )
    }
  ],
  'u8': [
    {
      title: "Must / Have to (Zorunluluklar)",
      content: (
        <div>
          <p>Ev işleri ve sorumluluklarımızdan bahsederken:</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>I <strong>must</strong> tidy my room. (Odamı toplamalıyım - İçten gelen)</li>
            <li>We <strong>have to</strong> obey the rules. (Kurallara uymak zorundayız - Dıştan gelen)</li>
            <li>She <strong>has to</strong> wash the dishes.</li>
            <li>You <strong>don't have to</strong> cook. (Yapmana gerek yok.)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Obligations (Sorumluluklar)",
      content: (
        <div>
          <p>Sorumluluklarımızı farklı şekillerde de ifade edebiliriz:</p>
          <p><strong>It is necessary to...</strong> ( ... yapmak gereklidir.)</p>
          <p><strong>It is my responsibility to...</strong> (... yapmak benim sorumluluğumdadır.)</p>
          <p><strong>I am in charge of...</strong> (... yapmaktan ben sorumluyum.)</p>
        </div>
      )
    }
  ],
  'u9': [
    {
      title: "Simple Present (Bilimsel Gerçekler)",
      content: (
        <div>
          <p>Bilimsel gerçekleri anlatırken geniş zaman kullanırız.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
             <li>Water <strong>boils</strong> at 100 degrees.</li>
             <li>The Earth <strong>revolves</strong> around the Sun.</li>
             <li>Scientists <strong>do</strong> experiments in labs.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Present Continuous (Devam Eden Süreçler)",
      content: (
        <div>
          <p>Bilimsel süreçleri ve o an yapılan deneyleri anlatırken:</p>
          <p>The scientist <strong>is looking</strong> through the microscope.</p>
          <p>They <strong>are conducting</strong> an experiment.</p>
          <p>The cells <strong>are growing</strong> rapidly.</p>
        </div>
      )
    }
  ],
  'u10': [
    {
      title: "Future Tense (Will / Be going to)",
      content: (
        <div>
          <p>Doğal afetlerle ilgili tahminlerde ve önlemlerde:</p>
          <p>There <strong>will be</strong> a drought in the future. (Tahmin)</p>
          <p>We <strong>are going to</strong> plant more trees. (Plan/Niyet)</p>
          <p>It <strong>won't</strong> rain tomorrow.</p>
        </div>
      )
    },
    {
      title: "Cause and Effect (Sebep Sonuç)",
      content: (
        <div>
          <p>Olayların nedenlerini ve sonuçlarını bağlamak için:</p>
          <ul className="list-disc pl-4 mt-2 space-y-2">
             <li><strong>Because:</strong> Global warming happens <strong>because</strong> we pollute the air. (Sebep)</li>
             <li><strong>So:</strong> We pollute the air, <strong>so</strong> global warming happens. (Sonuç)</li>
             <li><strong>Therefore / As a result:</strong> Buzullar eriyor. <strong>Sonuç olarak</strong>, deniz seviyesi yükseliyor.</li>
          </ul>
        </div>
      )
    }
  ]
};
