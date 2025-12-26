
import React from 'react';
import { BookOpen, Sparkles, Brain, Clock, CheckCircle2, X } from 'lucide-react';

interface SRSIntroProps {
    onClose: () => void;
}

const SRSIntro: React.FC<SRSIntroProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}
            >
                <div className="relative p-8">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>

                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-indigo-500/20">
                        <Sparkles size={40} className="text-indigo-600 dark:text-indigo-400" />
                    </div>

                    <h2 className="text-2xl font-black text-center mb-2" style={{ color: 'var(--color-text-main)' }}>
                        Henüz Tekrar Yok!
                    </h2>
                    <p className="text-center text-slate-500 dark:text-slate-400 font-medium mb-8">
                        Günlük tekrar listen şu an boş. Peki bu ne anlama geliyor?
                    </p>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                                <Brain size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>Akıllı Tekrar Sistemi (SRS)</h3>
                                <p className="text-sm opacity-70" style={{ color: 'var(--color-text-muted)' }}>
                                    KelimApp, sen kelimeleri öğrendikçe onları ne zaman unutacağını tahmin eder ve tam o anda sana hatırlatır.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 shrink-0 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                                <Clock size={24} className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>Neden Şimdi Boş?</h3>
                                <p className="text-sm opacity-70" style={{ color: 'var(--color-text-muted)' }}>
                                    Ya henüz hiç kelime çalışmadın ya da öğrendiğin kelimelerin tekrar zamanı henüz gelmedi. Merak etme, yakında burada olacaklar!
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 shrink-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                                <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>Ne Yapmalısın?</h3>
                                <p className="text-sm opacity-70" style={{ color: 'var(--color-text-muted)' }}>
                                    Yeni üniteler çalışarak kelime hazneni genişletmeye devam et. Öğrendiğin her kelime otomatik olarak SRS sistemine dahil edilir.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-10 p-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        Anladım, Kelime Çalışmaya Devam!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SRSIntro;
