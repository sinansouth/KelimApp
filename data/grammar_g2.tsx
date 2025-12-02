
import React from 'react';
import { GrammarTopic } from '../types';

export const GRAMMAR_G2: Record<string, GrammarTopic[]> = {
  'g2u1': [
    {
      title: "A / An (Bir)",
      content: (
        <div>
          <p className="mb-3">İngilizcede tekil nesnelerden önce <strong>a</strong> veya <strong>an</strong> kullanılır.</p>
          <ul className="list-disc pl-4 space-y-3">
            <li>
              <strong className="text-indigo-600 dark:text-indigo-400">a</strong>: Sessiz harfle başlayan kelimelerden önce gelir.
              <br/>
              <span className="text-sm text-slate-500 dark:text-slate-400">Örnek: <strong>a</strong> doctor (bir doktor), <strong>a</strong> lemon (bir limon)</span>
            </li>
            <li>
              <strong className="text-indigo-600 dark:text-indigo-400">an</strong>: Sesli harfle (a, e, i, o, u) başlayan kelimelerden önce gelir.
              <br/>
              <span className="text-sm text-slate-500 dark:text-slate-400">Örnek: <strong>an</strong> ambulance (bir ambulans)</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "What is this?",
      content: (
        <div>
          <p className="mb-2">Bir nesnenin ne olduğunu sormak için:</p>
          <p className="mb-2"><strong>Soru:</strong> What is this? (Bu nedir?)</p>
          <p><strong>Cevap:</strong> It is a lemon. (O bir limondur.)</p>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
             <strong>İpucu:</strong> Cevap verirken kısaca "It's a lemon" da diyebiliriz.
          </div>
        </div>
      )
    }
  ],
  'g2u2': [
    {
      title: "Selamlaşma (Greetings)",
      content: (
        <div>
          <ul className="space-y-2 list-disc pl-4">
            <li><strong>Hello / Hi:</strong> Merhaba (Her zaman kullanılabilir)</li>
            <li><strong>Good morning:</strong> Günaydın (Sabahları)</li>
            <li><strong>Good afternoon:</strong> Tünaydın (Öğlenleri)</li>
            <li><strong>Good evening:</strong> İyi akşamlar</li>
            <li><strong>Good night:</strong> İyi geceler (Yatmadan önce)</li>
            <li><strong>Goodbye:</strong> Hoşça kal</li>
          </ul>
        </div>
      )
    },
    {
      title: "How are you?",
      content: (
        <div>
          <p className="mb-2">Birinin halini hatırını sormak için:</p>
          <p className="font-bold text-indigo-600">How are you? (Nasılsın?)</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
              <li><strong>I am fine.</strong> (İyiyim.)</li>
              <li><strong>I am great.</strong> (Harikayım.)</li>
              <li><strong>I am okay.</strong> (İdare eder.)</li>
              <li><strong>I am bad.</strong> (Kötüyüm.)</li>
          </ul>
          <p className="mt-4">Cevap verdikten sonra <strong>"Thank you"</strong> (Teşekkürler) demeyi unutma!</p>
        </div>
      )
    }
  ],
  'g2u3': [
    {
      title: "Emir Cümleleri (Imperatives)",
      content: (
        <div>
          <p className="mb-2">Sınıf içinde öğretmenimizin kullandığı veya bizim arkadaşlarımıza söylediğimiz komutlar:</p>
          <ul className="list-disc pl-4 space-y-2">
            <li><strong>Open</strong> the door. (Kapıyı aç.)</li>
            <li><strong>Close</strong> the window. (Pencereyi kapat.)</li>
            <li><strong>Stand up.</strong> (Ayağa kalk.)</li>
            <li><strong>Sit down.</strong> (Otur.)</li>
            <li><strong>Turn right.</strong> (Sağa dön.)</li>
            <li><strong>Turn left.</strong> (Sola dön.)</li>
          </ul>
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
             Daha kibar olmak için cümlenin sonuna <strong>"please"</strong> ekleyebilirsin.
             <br/>Örnek: <em>Open the door, please.</em>
          </div>
        </div>
      )
    }
  ],
  'g2u4': [
    {
      title: "How many? (Kaç tane?)",
      content: (
        <div>
          <p className="mb-2">Sayıları sormak için kullanılır.</p>
          <p><strong>Soru:</strong> How many lemons? (Kaç tane limon?)</p>
          <p><strong>Cevap:</strong> Three lemons. (Üç limon.)</p>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
             <strong>Dikkat:</strong> Birden fazla ise kelimenin sonuna <strong>-s</strong> takısı gelir.
             <br/>One lemon (Bir limon)
             <br/>Two lemon<strong>s</strong> (İki limon)
          </div>
        </div>
      )
    },
    {
      title: "How old are you?",
      content: (
        <div>
          <p>Yaş sormak için:</p>
          <p className="mb-1"><strong>Soru:</strong> How old are you? (Kaç yaşındasın?)</p>
          <p><strong>Cevap:</strong> I am seven. (Yediyim.)</p>
          <p className="mt-1">veya</p>
          <p><strong>Cevap:</strong> I am seven years old.</p>
        </div>
      )
    }
  ],
  'g2u5': [
    {
      title: "Renkler (Colors)",
      content: (
        <div>
          <p>Bir şeyin rengini sormak için:</p>
          <p className="mb-2"><strong>What color is it?</strong> (O ne renk?)</p>
          <ul className="list-disc pl-4 space-y-1">
              <li>It is <span className="text-red-500 font-bold">red</span>. (O kırmızıdır.)</li>
              <li>It is <span className="text-blue-500 font-bold">blue</span>. (O mavidir.)</li>
              <li>It is <span className="text-green-500 font-bold">green</span>. (O yeşildir.)</li>
              <li>It is <span className="text-yellow-500 font-bold">yellow</span>. (O sarıdır.)</li>
          </ul>
        </div>
      )
    },
    {
      title: "Like / Don't Like",
      content: (
        <div>
          <p>Sevdiğimiz ve sevmediğimiz renkleri söylerken:</p>
          <p className="mt-2 text-green-600">I <strong>like</strong> pink. (Pembeyi severim.)</p>
          <p className="text-red-600">I <strong>don't like</strong> black. (Siyahı sevmem.)</p>
        </div>
      )
    }
  ],
  'g2u6': [
    {
      title: "Let's ... (Haydi ...)",
      content: (
        <div>
          <p className="mb-2">Arkadaşımıza oyun oynamayı veya bir şey yapmayı teklif ederken kullanırız.</p>
          <ul className="list-disc pl-4 space-y-2">
            <li><strong>Let's</strong> run. (Haydi koşalım.)</li>
            <li><strong>Let's</strong> jump. (Haydi zıplayalım.)</li>
            <li><strong>Let's</strong> play football. (Haydi futbol oynayalım.)</li>
            <li><strong>Let's</strong> dance. (Haydi dans edelim.)</li>
          </ul>
        </div>
      )
    }
  ]
};
