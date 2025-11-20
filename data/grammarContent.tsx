import React from 'react';

export interface GrammarTopic {
  title: string;
  content: React.ReactNode;
}

export const GRAMMAR_CONTENT: Record<string, GrammarTopic[]> = {
  // --- GRADE 4 ---
  'g4u1': [{
    title: "Imperatives (Emir Kipleri)",
    content: <div><p>Sınıf kurallarını söylerken emir kipleri kullanılır.</p><ul className="list-disc pl-4 mt-2"><li>Sit down (Otur)</li><li>Stand up (Ayağa kalk)</li><li>Be quiet (Sessiz ol)</li></ul></div>
  }],
  'g4u2': [{
    title: "Where are you from?",
    content: <div><p>Birinin nereli olduğunu sormak için:</p><p className="font-bold">Where are you from?</p><p>I am from Turkey. (Ben Türkiye'denim.)</p></div>
  }],
  'g4u3': [{
    title: "Can / Can't (Yetenek)",
    content: <div><p>Yapabildiklerimiz için 'Can', yapamadıklarımız için 'Can't' kullanırız.</p><ul className="list-disc pl-4 mt-2"><li>I can swim. (Yüzebilirim.)</li><li>I can't fly. (Uçamam.)</li></ul></div>
  }],
  'g4u4': [{
    title: "Like / Dislike",
    content: <div><p>Sevdiğimiz şeyler için 'I like', sevmediklerimiz için 'I don't like' kullanırız.</p><p>I like reading books.</p><p>I don't like drawing.</p></div>
  }],
  'g4u5': [{
    title: "Telling the Time (Saatler)",
    content: <div><p>Saati sormak için: <strong>What time is it?</strong></p><p>It is seven o'clock. (Saat 7.)</p><p>It is half past eight. (Saat 8 buçuk.)</p></div>
  }],
  'g4u6': [{
    title: "Prepositions of Place (Yer Edatları)",
    content: <div><p>Nesnelerin yerini tarif etmek için:</p><ul className="list-disc pl-4 mt-2"><li><strong>In:</strong> İçinde</li><li><strong>On:</strong> Üstünde</li><li><strong>Under:</strong> Altında</li><li><strong>Behind:</strong> Arkasında</li></ul></div>
  }],
  'g4u7': [{
    title: "Jobs (Meslekler)",
    content: <div><p>Birinin mesleğini sormak için:</p><p className="font-bold">What is your job?</p><p>I am a teacher.</p><p>She is a doctor.</p></div>
  }],
  'g4u8': [{
    title: "Seasons and Clothes (Mevsimler)",
    content: <div><p>Mevsimlere göre giyiniriz.</p><ul className="list-disc pl-4 mt-2"><li>In winter, I wear a coat.</li><li>In summer, I wear a t-shirt.</li></ul></div>
  }],
  'g4u9': [{
    title: "Physical Appearance (Dış Görünüş)",
    content: <div><p>İnsanları tarif ederken 'Have/Has got' kullanırız.</p><p>She has got long hair.</p><p>He has got blue eyes.</p></div>
  }],
  'g4u10': [{
    title: "Offers (Teklifler)",
    content: <div><p>Bir şey istemek veya teklif etmek için:</p><p className="font-bold">Would you like some milk?</p><p>Yes, please. / No, thanks.</p></div>
  }],

  // --- GRADE 5 ---
  'g5u1': [{
    title: "School Subjects (Dersler)",
    content: <div><p>Dersler hakkında konuşurken:</p><p>My favorite class is Science.</p><p>I like Art and Music.</p></div>
  }],
  'g5u2': [{
    title: "Directions (Yön Tarifi)",
    content: <div><p>Yer yön tarif etmek için:</p><ul className="list-disc pl-4 mt-2"><li>Turn right (Sağa dön)</li><li>Go straight (Düz git)</li><li>It is on your left (Solunda)</li></ul></div>
  }],
  'g5u3': [{
    title: "Hobbies (Hobiler)",
    content: <div><p>Hobilerimizden bahsederken:</p><p>I enjoy playing chess.</p><p>Can you play football?</p><p>Yes, I can.</p></div>
  }],
  'g5u4': [{
    title: "Simple Present Tense (Geniş Zaman)",
    content: <div><p>Günlük rutinlerimizi anlatırız.</p><p>I get up early.</p><p>She <strong>brushes</strong> her teeth. (He/She/It -s takısı alır)</p></div>
  }],
  'g5u5': [{
    title: "Should / Shouldn't (Tavsiye)",
    content: <div><p>Hastalara tavsiye verirken:</p><p>You should see a doctor.</p><p>You shouldn't drink cold water.</p></div>
  }],
  'g5u6': [{
    title: "Expressing Preferences (Tercihler)",
    content: <div><p>Film türleri hakkında konuşurken:</p><p>I like comedies.</p><p>I think horror movies are scary.</p></div>
  }],
  'g5u7': [{
    title: "Days and Months",
    content: <div><p>Parti zamanını söylerken:</p><p>When is your birthday?</p><p>It is in May.</p><p>The party is on Sunday.</p></div>
  }],
  'g5u8': [{
    title: "Making Suggestions (Öneriler)",
    content: <div><p>Spor yapmayı önerirken:</p><ul className="list-disc pl-4 mt-2"><li>Let's go jogging.</li><li>How about swimming?</li></ul></div>
  }],
  'g5u9': [{
    title: "Present Continuous (Şimdiki Zaman)",
    content: <div><p>Şu an yapılan eylemler:</p><p>The dog is running.</p><p>I am feeding the cat.</p><p>We are watching the birds.</p></div>
  }],
  'g5u10': [{
    title: "Numbers (Sayılar)",
    content: <div><p>100'e kadar sayılar ve tarihler:</p><p>There are 30 students.</p><p>The festival is 100 years old.</p></div>
  }],

  // --- GRADE 6 ---
  'g6u1': [{
    title: "Telling the Time & Dates",
    content: <div><p>Saatleri ve tarihleri söylemek:</p><p>It is quarter past three. (3'ü çeyrek geçiyor)</p><p>My birthday is on the 5th of June.</p></div>
  }],
  'g6u2': [{
    title: "Yummy Breakfast",
    content: <div><p>Kahvaltı alışkanlıklarını anlatma (Like/Dislike):</p><p>I like bagels and tea.</p><p>She doesn't like cheese.</p><p>Do you want some honey?</p></div>
  }],
  'g6u3': [{
    title: "Present Continuous vs Simple Present",
    content: <div><p>Şimdiki zaman ile geniş zaman farkı:</p><p>I always drink coffee. (Genel)</p><p>I am drinking tea now. (Şu an)</p></div>
  }],
  'g6u4': [{
    title: "Weather Conditions",
    content: <div><p>Havayı sormak:</p><p><strong>What is the weather like?</strong></p><p>It is sunny and hot.</p><p>I feel happy in sunny weather.</p></div>
  }],
  'g6u5': [{
    title: "Comparatives (Karşılaştırma)",
    content: <div><p>Sıfatları karşılaştırma:</p><p>The roller coaster is <strong>faster</strong> than the carousel.</p><p>I think fairs are <strong>more exciting</strong> than parks.</p></div>
  }],
  'g6u6': [{
    title: "Occupations (Meslekler)",
    content: <div><p>Mesleklerin ne yaptığını anlatma:</p><p>A teacher teaches students.</p><p>A mechanic repairs cars.</p><p>Where do you work?</p></div>
  }],
  'g6u7': [{
    title: "Simple Past Tense (Geçmiş Zaman)",
    content: <div><p>Geçmiş tatili anlatma:</p><p>I <strong>went</strong> to Antalya last summer.</p><p>We <strong>swam</strong> in the sea.</p><p>It <strong>was</strong> great.</p></div>
  }],
  'g6u8': [{
    title: "Prepositions of Place",
    content: <div><p>Nesnelerin yerini detaylı tarif etme:</p><p>The cat is <strong>between</strong> the boxes.</p><p>The book is <strong>in front of</strong> the computer.</p></div>
  }],
  'g6u9': [{
    title: "Should / Shouldn't (Çevre)",
    content: <div><p>Çevreyi korumak için öneriler:</p><p>We should recycle.</p><p>We shouldn't pollute the water.</p><p>We should use public transport.</p></div>
  }],
  'g6u10': [{
    title: "Democracy Terms",
    content: <div><p>Seçim süreci:</p><p>Candidates give speeches.</p><p>We vote in the ballot box.</p><p>We should respect the results.</p></div>
  }],

  // --- GRADE 7 ---
  'g7u1': [{
    title: "Describing People",
    content: <div><p>Kişilik ve fiziksel özellikler:</p><p>She has curly hair (Fiziksel).</p><p>She is generous and kind (Kişilik).</p><p>He is taller than me.</p></div>
  }],
  'g7u2': [{
    title: "Simple Present (Frequency Adverbs)",
    content: <div><p>Spor alışkanlıkları ne sıklıkla yapılır:</p><p>I <strong>always</strong> go running.</p><p>I <strong>never</strong> play golf.</p><p>How often do you train?</p></div>
  }],
  'g7u3': [{
    title: "Simple Past (Biographies)",
    content: <div><p>Biyografi anlatımı (Was/Were/Did):</p><p>Einstein <strong>was</strong> born in Germany.</p><p>He <strong>won</strong> the Nobel Prize.</p><p>He <strong>died</strong> in 1955.</p></div>
  }],
  'g7u4': [{
    title: "Should (Obligations)",
    content: <div><p>Vahşi yaşamı koruma:</p><p>We should protect habitats.</p><p>We shouldn't hunt animals.</p><p>Tigers are becoming extinct.</p></div>
  }],
  'g7u5': [{
    title: "Preferences (Prefer)",
    content: <div><p>Tercih belirtme:</p><p>I <strong>prefer</strong> watching news <strong>to</strong> watching soap operas.</p><p>Why do you prefer it? Because it is educational.</p></div>
  }],
  'g7u6': [{
    title: "Quantifiers (Miktar)",
    content: <div><p>Parti hazırlığı (Some, Any, A few):</p><p>We need <strong>some</strong> balloons.</p><p>Do we have <strong>any</strong> candles?</p><p>There are <strong>a few</strong> guests.</p></div>
  }],
  'g7u7': [{
    title: "Future Tense (Will)",
    content: <div><p>Gelecek tahminleri:</p><p>I think I <strong>will</strong> be a doctor.</p><p>You <strong>will</strong> be very rich.</p><p>I hope the world <strong>will</strong> be peaceful.</p></div>
  }],
  'g7u8': [{
    title: "Reasons (To ...)",
    content: <div><p>Neden sonuç ilişkisi:</p><p>I went to the bakery <strong>to buy</strong> bread.</p><p>We go to the pharmacy <strong>to get</strong> medicine.</p></div>
  }],
  'g7u9': [{
    title: "Environment (Have to / Must)",
    content: <div><p>Zorunluluklar:</p><p>We <strong>must</strong> save energy.</p><p>We <strong>have to</strong> stop pollution.</p><p>We mustn't cut down trees.</p></div>
  }],
  'g7u10': [{
    title: "Comparatives & Superlatives",
    content: <div><p>Gezegenleri karşılaştırma:</p><p>Jupiter is <strong>bigger than</strong> Earth.</p><p>Mercury is the <strong>smallest</strong> planet.</p><p>Neptune is the <strong>farthest</strong> planet.</p></div>
  }],

  // Grade 8 Unit 1: Friendship
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
  // Generic placeholder for other units to avoid crashes
  'default': [
    {
      title: "Unit Grammar Summary",
      content: (
        <div>
          <p className="mb-4">Bu ünite için özel gramer notları hazırlanmaktadır. Lütfen kelime kartları ve test bölümünü kullanarak çalışmaya devam ediniz.</p>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-xl">
            <h4 className="font-bold text-yellow-700 dark:text-yellow-400 mb-2">Çalışma İpucu</h4>
            <p className="text-sm">Yeni kelimeleri öğrenirken, bu kelimelerin cümle içinde nasıl kullanıldığına (Context) dikkat etmek gramer yapısını anlamana yardımcı olacaktır.</p>
          </div>
        </div>
      )
    }
  ]
};

export const getGrammarForUnit = (unitId: string): GrammarTopic[] => {
  return GRAMMAR_CONTENT[unitId] || GRAMMAR_CONTENT['default'];
};