import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G5: Record<string, GrammarTopic[]> = {
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
  }]
};