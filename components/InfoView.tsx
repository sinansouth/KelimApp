import React, { useState } from 'react';
import { Lightbulb, BookOpen, Trophy, ShoppingBag, Target, ShieldCheck, Sparkles, Gamepad2, Grid3X3, Search, ArrowRight, User, Swords, Palette, Layout, Users, Calendar, Zap, Repeat, GraduationCap, Medal, Crown, Brain, ListChecks } from 'lucide-react';
import { XP_GAINS } from '../services/userService';

interface InfoViewProps {
    onBack: () => void;
}

const InfoView: React.FC<InfoViewProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'games' | 'system'>('general');

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">

            <div className="text-center mb-6 shrink-0">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl mb-2 shadow-lg shadow-indigo-500/30">
                    <Lightbulb size={28} />
                </div>
                <h1 className="text-xl font-black mb-1 text-slate-800 dark:text-white">Uygulama Rehberi</h1>
                <p className="max-w-xs mx-auto text-xs font-medium text-slate-500 dark:text-slate-400">
                    KelimApp'i en verimli şekilde kullanmak için ipuçları.
                </p>
            </div>

            {/* Compact Tabs for Mobile */}
            <div className="grid grid-cols-3 gap-1 mb-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl shrink-0">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${activeTab === 'general' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <BookOpen size={16} /> Genel
                </button>
                <button
                    onClick={() => setActiveTab('games')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${activeTab === 'games' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <Gamepad2 size={16} /> Oyunlar
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${activeTab === 'system' ? 'bg-white dark:bg-slate-700 text-orange-500 dark:text-orange-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <Trophy size={16} /> Sistem
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
                <div className="space-y-4">

                    {/* GENERAL TAB */}
                    {activeTab === 'general' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="text-base font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                    <Target className="text-indigo-500" size={18} /> Nasıl Çalışmalıyım?
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Flashcard (Kelime Kartları)</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                                Önce kelime kartlarını incele. Karta dokunarak anlamını ve örnek cümlesini gör. Her kartı görmek <strong>+{XP_GAINS.flashcard_view} XP</strong> kazandırır.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">İşaretle ve Kazan</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                                Öğrendiğin kelimeleri "Ezberledim" olarak işaretle ve <strong>+{XP_GAINS.flashcard_memorize} XP</strong> kazan! Zorlandıklarını "Favori" yap.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Test Çöz</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                                Test modunda bilgini pekiştir. Her doğru cevapla zorluğa göre <strong>10-30 XP</strong> arası kazan.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0 font-bold text-sm">4</div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Günlük Tekrar (SRS)</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                                Ana sayfadaki "Günlük Tekrar" butonu, unutmaya başladığın kelimeleri sana hatırlatır. Kalıcı öğrenme için her gün kontrol et!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-base font-black mb-1 flex items-center gap-2">
                                        <Sparkles size={18} /> Gün Serisi (Streak)
                                    </h3>
                                    <p className="text-xs opacity-90 leading-relaxed">
                                        Her gün uygulamaya girerek "Gün Seri"ni koru. Seri arttıkça XP çarpanın büyür ve daha hızlı seviye atlarsın! Eğer bir gün giremezsen, marketten alabileceğin "Seri Dondurucu" ile serini koruyabilirsin.
                                    </p>
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            </div>

                             <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="text-base font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                    <Users size={18} className="text-blue-500" /> Arkadaş Sistemi
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Profilinden 6 haneli "Arkadaş Kodu"nu arkadaşlarınla paylaş. Onlar seni eklediğinde, sen de onları otomatik olarak eklersin! Birlikte düello yapın ve liderlik tablosunda yarışın.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* GAMES TAB */}
                    {activeTab === 'games' && (
                        <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 items-start">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl shrink-0">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-1">Test (Quiz)</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                                        Klasik test modu. Kelimelerin anlamlarını seçeneklerden seç. 5 farklı zorluk seviyesi var.
                                    </p>
                                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/10 py-0.5 px-2 rounded">
                                        Doğru: {XP_GAINS.quiz_correct.normal} XP (Ortalama)
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 items-start">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl shrink-0">
                                    <Swords size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-1">Düello</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                                        Arkadaşlarına veya herkese açık rakiplere meydan oku! En yüksek puanı alan kazanır.
                                    </p>
                                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/10 py-0.5 px-2 rounded">
                                        Zafer: 50 XP +3 Puan
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 items-start">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl shrink-0">
                                    <Grid3X3 size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-1">Eşleştirme</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                                        İngilizce kelimeleri ve Türkçe karşılıklarını en kısa sürede eşleştir. Hafıza ve hızını test et!
                                    </p>
                                    <span className="text-[10px] font-bold text-green-500 bg-green-50 dark:bg-green-900/10 py-0.5 px-2 rounded">
                                        +{XP_GAINS.matching_pair} XP / Eşleşme
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 items-start">
                                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 rounded-xl shrink-0">
                                    <Search size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-1">Bulmaca</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                                        Harfler arasına gizlenmiş kelimeleri bul. Dikkat ve gözlem yeteneğini konuştur.
                                    </p>
                                    <span className="text-[10px] font-bold text-cyan-500 bg-cyan-50 dark:bg-cyan-900/10 py-0.5 px-2 rounded">
                                        +{XP_GAINS.wordsearch_word.medium} XP / Kelime (Ortalama)
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 items-start">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl shrink-0">
                                    <Gamepad2 size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-1">Labirent</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                                        Hayaletlerden kaç, doğru kelimenin olduğu kapıyı bul ve çıkışa ulaş. Heyecan dolu öğrenme!
                                    </p>
                                    <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/10 py-0.5 px-2 rounded">
                                        +{XP_GAINS.maze_level} XP / Seviye
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SYSTEM TAB */}
                    {activeTab === 'system' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg">
                                <h4 className="flex items-center gap-2 font-bold text-sm mb-2">
                                    <Zap size={16} /> XP Boost (2x)
                                </h4>
                                <p className="text-xs opacity-95 leading-relaxed">
                                    Marketten satın al veya özel etkinliklerle kazan. 30 dakika boyunca kazandığın tüm XP ikiye katlanır!
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h4 className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm mb-2">
                                    <ListChecks size={16} className="text-green-500" /> Günlük Görevler
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                                    Her gün 3 yeni görev! Tamamla ve büyük XP ödülleri kazan. 3 görevi de tamamlarsan <strong>ekstra +{XP_GAINS.daily_quest_completion_bonus} XP bonus</strong> kazanırsın!
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h4 className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm mb-2">
                                    <Medal size={16} className="text-blue-500" /> Liderlik Tablosu
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                                    Farklı kategorilerde yarış ve en iyiler arasına gir. Haftalık sıralamalar her Pazar gecesi sıfırlanır ve yeni bir yarış başlar!
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h4 className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm mb-2">
                                    <Crown size={16} className="text-purple-500" /> Turnuvalar
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Büyük yarışmalara katıl, eleme turlarını geç ve şampiyon ol! Şampiyonlar büyük XP ödülleri kazanır.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h4 className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm mb-2">
                                    <ShoppingBag size={16} className="text-pink-500" /> XP Market
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                                    Kazandığın XP'leri harcayarak yeni temalar, çerçeveler ve avatarlar satın al. Profilini özelleştir! Seviye atladıkça yeni ürünlerin kilidi açılır.
                                </p>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full px-4 flex justify-center">
                <button
                    onClick={onBack}
                    className="w-full max-w-xs px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                    Anlaşıldı <ArrowRight size={16} />
                </button>
            </div>

        </div>
    );
};

export default InfoView;