
import React from 'react';
import { Lightbulb, BookOpen, Target, RefreshCw, Trophy, ShoppingBag, Zap, Shield, Star, Layout, MessageCircle, GraduationCap, Repeat } from 'lucide-react';

interface InfoViewProps {
  onBack: () => void;
}

const InfoView: React.FC<InfoViewProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-3 shadow-sm">
          <Lightbulb size={24} />
        </div>
        <h1 className="text-2xl font-black mb-1" style={{color: 'var(--color-text-main)'}}>Uygulama Rehberi</h1>
        <p className="max-w-lg mx-auto text-xs font-medium opacity-70" style={{color: 'var(--color-text-muted)'}}>
          KelimApp'i en verimli şekilde kullanmak için ipuçları.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-12">
        
        {/* Card: Gamification */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm"><Trophy size={16} /></div>
                <h3 className="font-bold text-base">XP & Seviye Sistemi</h3>
            </div>
            <p className="text-orange-100 text-[10px] leading-relaxed mb-3">
                Her etkinlik sana XP kazandırır. XP kazandıkça seviye atlarsın ve yeni <strong>Avatarlar</strong> açarsın.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-orange-50">
                <div className="bg-black/10 px-2 py-1 rounded flex justify-between"><span>Kart Bakma</span><span>+2 XP</span></div>
                <div className="bg-black/10 px-2 py-1 rounded flex justify-between"><span>Quiz Doğru</span><span>+15 XP</span></div>
                <div className="bg-black/10 px-2 py-1 rounded flex justify-between"><span>Ezberleme</span><span>+20 XP</span></div>
                <div className="bg-black/10 px-2 py-1 rounded flex justify-between"><span>Günlük Görev</span><span>+50-200 XP</span></div>
            </div>
        </div>

        {/* Card: Market */}
        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl p-4 text-white relative overflow-hidden shadow-md">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm"><ShoppingBag size={16} /></div>
                <h3 className="font-bold text-base">XP Market</h3>
            </div>
            <p className="text-yellow-100 text-[10px] leading-relaxed mb-3">
                Kazandığın XP'leri markette harcayarak profilini özelleştir ve güçlendirmeler al.
            </p>
            <div className="space-y-1.5">
                 <div className="px-2 py-1.5 bg-white/20 rounded text-[10px] flex items-center gap-2 font-medium">
                    <Layout size={12} /> 
                    <span><strong>Temalar & Arka Planlar:</strong> Uygulamanın görünümünü değiştir.</span>
                 </div>
                 <div className="px-2 py-1.5 bg-white/20 rounded text-[10px] flex items-center gap-2 font-medium">
                    <Shield size={12} /> 
                    <span><strong>Dondurma:</strong> Bir gün girmezsen serin bozulmaz.</span>
                 </div>
                 <div className="px-2 py-1.5 bg-white/20 rounded text-[10px] flex items-center gap-2 font-medium">
                    <Zap size={12} /> 
                    <span><strong>XP Boost:</strong> 30 dakika boyunca 2 kat XP kazan.</span>
                 </div>
            </div>
        </div>

        {/* Card: Study Modes */}
        <div className="md:col-span-2 rounded-xl p-4 border shadow-sm" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
            <div className="flex items-center gap-2 mb-3" style={{color: 'var(--color-text-main)'}}>
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><BookOpen size={16} /></div>
                <h3 className="font-bold text-base">Çalışma Modları</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <strong className="block mb-1 text-indigo-600 dark:text-indigo-400 text-xs">Kelime Kartları</strong>
                    <span style={{color: 'var(--color-text-muted)'}}>
                        Kartları çevirerek öğren. 
                        <br/>👆 <strong>Yukarı Kaydır:</strong> Ezberledim (Kutuya at)
                        <br/>👇 <strong>Aşağı Kaydır:</strong> Favorilere Ekle
                    </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <strong className="block mb-1 text-orange-600 dark:text-orange-400 text-xs">Quizler</strong>
                    <span style={{color: 'var(--color-text-muted)'}}>Çoktan seçmeli testler. Yanlış yaptığın kelimeler otomatik olarak favorilere eklenir, böylece sonra tekrar edebilirsin.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <strong className="block mb-1 text-teal-600 dark:text-teal-400 text-xs">Gramer & Diğerleri</strong>
                    <span style={{color: 'var(--color-text-muted)'}}>Her üniteye özel gramer notları, seçmeli kelime çalışmaları ve favori/ezber testleri.</span>
                </div>
            </div>
        </div>

        {/* Card: SRS */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-4 text-white relative overflow-hidden shadow-md">
             <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm"><RefreshCw size={16} /></div>
                <h3 className="font-bold text-base">Akıllı Tekrar Sistemi (SRS)</h3>
            </div>
            <p className="text-indigo-100 text-[10px] leading-relaxed mb-3">
                Bilimsel aralıklı tekrar sistemi ile kelimeleri unutmaya başladığın an sana hatırlatırız.
                Kelimeler 5 farklı kutuda saklanır. Her doğru bildiğinde bir sonraki kutuya geçer ve daha az sorulur.
            </p>
            <div className="flex items-center justify-between bg-black/20 rounded-lg p-2 text-[9px] font-medium text-indigo-100">
                 <div className="flex flex-col items-center"><span className="text-white font-bold">1. Gün</span><span>Kutu 1</span></div>
                 <div className="h-px w-4 bg-white/30"></div>
                 <div className="flex flex-col items-center"><span className="text-white font-bold">3. Gün</span><span>Kutu 2</span></div>
                 <div className="h-px w-4 bg-white/30"></div>
                 <div className="flex flex-col items-center"><span className="text-white font-bold">1 Hafta</span><span>Kutu 3</span></div>
                 <div className="h-px w-4 bg-white/30"></div>
                 <div className="flex flex-col items-center"><span className="text-white font-bold">2 Hafta</span><span>Kutu 4</span></div>
                 <div className="h-px w-4 bg-white/30"></div>
                 <div className="flex flex-col items-center"><span className="text-white font-bold">1 Ay</span><span>Kutu 5</span></div>
            </div>
             <div className="mt-2 text-[9px] text-indigo-200 text-center italic">
                Ana sayfadaki "Günlük Tekrar" butonunu her gün kontrol et!
            </div>
        </div>

        {/* Card: Leagues */}
        <div className="md:col-span-2 p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-center gap-4" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
             <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400 shrink-0">
                 <GraduationCap size={24} />
             </div>
             <div className="text-center sm:text-left">
                 <h3 className="font-bold text-sm mb-1" style={{color: 'var(--color-text-main)'}}>Ligler ve Sıralama</h3>
                 <p className="text-[10px] leading-relaxed" style={{color: 'var(--color-text-muted)'}}>
                     Her hafta kazandığın XP'ye göre lig atlayabilir veya düşebilirsin.
                     Lider tablosunda kendi sınıfındaki ve genel sıralamadaki yerini gör.
                     En iyiler arasına girerek <strong>Efsanevi Rozetler</strong> kazan!
                 </p>
             </div>
        </div>

      </div>

      <div className="mt-auto flex justify-center pb-8">
         <button
            onClick={onBack}
            className="w-full sm:w-auto px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] text-sm"
          >
            Anlaşıldı
          </button>
      </div>

    </div>
  );
};

export default InfoView;
