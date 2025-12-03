
import React, { useState } from 'react';
import { Lightbulb, BookOpen, RefreshCw, Trophy, ShoppingBag, Layout, GraduationCap, Grid3X3, WholeWord, Search, Gamepad2, Keyboard, Target, ShieldCheck, Sparkles } from 'lucide-react';

interface InfoViewProps {
  onBack: () => void;
}

const InfoView: React.FC<InfoViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'games' | 'system'>('general');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl mb-3 shadow-lg">
          <Lightbulb size={32} />
        </div>
        <h1 className="text-2xl font-black mb-1" style={{color: 'var(--color-text-main)'}}>Uygulama Rehberi</h1>
        <p className="max-w-lg mx-auto text-xs font-medium opacity-70" style={{color: 'var(--color-text-muted)'}}>
          KelimApp ile İngilizce öğrenmenin püf noktaları.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6 gap-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'general' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
              Genel Bakış
          </button>
          <button 
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'games' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
              Oyun Modları
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'system' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
              Sistem & Puanlar
          </button>
      </div>

      <div className="space-y-4">
        
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
            <>
                <div className="p-4 rounded-xl border shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <BookOpen size={18} /> Çalışma Yöntemleri
                    </h3>
                    <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0 font-bold">1</div>
                            <div>
                                <strong className="block text-slate-800 dark:text-white">Kelime Kartları</strong>
                                Kartları çevirerek kelimeleri öğren. Bildiklerini "Ezberledim" işaretle, zorlandıklarını "Favorilere" ekle.
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0 font-bold">2</div>
                            <div>
                                <strong className="block text-slate-800 dark:text-white">Akıllı Tekrar (SRS)</strong>
                                Ezberlediğin kelimeler belirli aralıklarla (1 gün, 3 gün, 1 hafta...) sana tekrar sorulur. Bu sayede bilgilerin taze kalır.
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0 font-bold">3</div>
                            <div>
                                <strong className="block text-slate-800 dark:text-white">Quiz Modu</strong>
                                Çoktan seçmeli testlerle kendini dene. Yanlış yaptığın kelimeler otomatik olarak çalışma listene eklenir.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl border shadow-sm bg-gradient-to-r from-indigo-600 to-purple-700 text-white border-transparent">
                    <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                        <Sparkles size={18} /> İpucu
                    </h3>
                    <p className="text-xs leading-relaxed opacity-90">
                        Her gün en az 15 dakika çalışarak serini bozma ve XP kazan. Günlük görevleri tamamlamak seviye atlamanı hızlandırır!
                    </p>
                </div>
            </>
        )}

        {/* GAMES TAB */}
        {activeTab === 'games' && (
            <div className="grid grid-cols-1 gap-3">
                <div className="p-4 rounded-xl border shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center shrink-0">
                        <WholeWord size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">Kelime Türetmece</h4>
                        <p className="text-xs text-slate-500 mt-1">
                            Son harfle başlayan yeni bir İngilizce kelime türet. Yapay zekaya karşı yarış!
                            <br/><span className="text-[10px] text-purple-500 font-bold">Ödül: Kelime başına 10 XP + Bonus</span>
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-xl border shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0">
                        <Grid3X3 size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">Eşleştirme</h4>
                        <p className="text-xs text-slate-500 mt-1">
                            İngilizce kelimeleri Türkçe karşılıklarıyla eşleştir. Hafızanı ve hızını test et.
                            <br/><span className="text-[10px] text-green-500 font-bold">Ödül: Çift başına 5 XP</span>
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-xl border shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                        <Search size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">Kelime Bulmaca</h4>
                        <p className="text-xs text-slate-500 mt-1">
                            Karışık harfler arasına gizlenmiş kelimeleri bul. Dikkatli bak!
                            <br/><span className="text-[10px] text-blue-500 font-bold">Ödül: Kelime başına 10 XP + Bonus</span>
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-xl border shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0">
                        <Gamepad2 size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">Labirent</h4>
                        <p className="text-xs text-slate-500 mt-1">
                            Hayaletlerden kaçarak doğru kelimenin olduğu çıkışı bul. Hızlı olmalısın!
                            <br/><span className="text-[10px] text-red-500 font-bold">Ödül: Kazanma başına 50 XP</span>
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-xl border shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0">
                        <Keyboard size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">Yazma</h4>
                        <p className="text-xs text-slate-500 mt-1">
                            Verilen Türkçe kelimenin İngilizcesini doğru yaz. Yazım hatalarını düzeltmek için harika.
                            <br/><span className="text-[10px] text-orange-500 font-bold">Ödül: Kelime başına 15 XP</span>
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* SYSTEM TAB */}
        {activeTab === 'system' && (
            <div className="space-y-4">
                
                <div className="grid grid-cols-2 gap-3">
                     <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800">
                        <div className="flex items-center gap-2 mb-2 text-yellow-700 dark:text-yellow-400 font-bold text-sm">
                            <Trophy size={16} /> XP Sistemi
                        </div>
                        <ul className="text-[10px] space-y-1 text-slate-600 dark:text-slate-300">
                            <li className="flex justify-between"><span>Kart İnceleme:</span> <strong>3 XP</strong></li>
                            <li className="flex justify-between"><span>Quiz Doğru:</span> <strong>20 XP</strong></li>
                            <li className="flex justify-between"><span>Ezberleme:</span> <strong>10 XP</strong></li>
                            <li className="flex justify-between"><span>Oyunlar:</span> <strong>5-50 XP</strong></li>
                        </ul>
                     </div>

                     <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                        <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                            <ShieldCheck size={16} /> Rozetler
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            Belirli başarıları tamamlayarak rozetler kazan. Profilinde sergile ve arkadaşlarına hava at! 
                            <br/><strong>Örn:</strong> 100 kelime ezberle, 7 gün seri yap...
                        </p>
                     </div>
                </div>

                <div className="p-4 rounded-xl border shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2 text-slate-800 dark:text-white">
                        <ShoppingBag size={16} /> Market & Seviye
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                        XP kazandıkça seviye atlarsın. Yeni seviyeler, markette yeni kozmetik eşyaların kilidini açar.
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] min-w-[80px] text-center">
                            <span className="block font-bold text-indigo-500">Lvl 1</span>
                            Temalar
                        </div>
                        <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] min-w-[80px] text-center">
                            <span className="block font-bold text-indigo-500">Lvl 2-10</span>
                            Avatarlar
                        </div>
                        <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] min-w-[80px] text-center">
                            <span className="block font-bold text-indigo-500">Lvl 5+</span>
                            Çerçeveler
                        </div>
                         <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] min-w-[80px] text-center">
                            <span className="block font-bold text-indigo-500">Lvl 10+</span>
                            Arka Planlar
                        </div>
                    </div>
                </div>
                
                <div className="p-4 rounded-xl border shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2 text-slate-800 dark:text-white">
                        <GraduationCap size={16} /> Lider Tablosu
                    </h3>
                    <p className="text-xs text-slate-500">
                        Her hafta puanlar sıfırlanır (Pazar 23:59). Haftanın şampiyonu olmak için yarış!
                        <br/>Hem toplam XP hem de oyunlara özel sıralamalar vardır.
                    </p>
                </div>

            </div>
        )}

      </div>

      <div className="mt-auto flex justify-center">
         <button
            onClick={onBack}
            className="w-full sm:w-auto px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
          >
            Tamam
          </button>
      </div>

    </div>
  );
};

export default InfoView;
