
import React, { useState } from 'react';
import { X, Swords, Copy, ArrowRight, Hash, GraduationCap, BookOpen, Settings, Check } from 'lucide-react';
import { playSound } from '../services/soundService';
import { getChallenge } from '../services/firebase';
import { WordCard, GradeLevel, UnitDef, QuizDifficulty } from '../types';
import { VOCABULARY } from '../data/vocabulary';
import { UNIT_ASSETS } from '../data/assets';

interface ChallengeModalProps {
  onClose: () => void;
  onCreateChallenge: (config: { grade: GradeLevel, unit: UnitDef, difficulty: QuizDifficulty, count: number }) => void; 
  onJoinChallenge: (challengeData: any, words: WordCard[]) => void; 
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ onClose, onCreateChallenge, onJoinChallenge }) => {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Creation States
  const [step, setStep] = useState<number>(1);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnitDef | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>('normal');
  const [selectedCount, setSelectedCount] = useState<number>(10);

  const grades: GradeLevel[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'A1', 'A2', 'B1', 'B2', 'C1'];
  
  const difficultyOptions: { id: QuizDifficulty, label: string, color: string }[] = [
    { id: 'relaxed', label: 'Rahat (30s)', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: 'easy', label: 'Kolay (20s)', color: 'bg-green-100 text-green-700 border-green-300' },
    { id: 'normal', label: 'Normal (15s)', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { id: 'hard', label: 'Zor (10s)', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { id: 'impossible', label: 'İmkansız (5s)', color: 'bg-red-100 text-red-700 border-red-300' },
  ];

  const countOptions = [10, 20, 30];

  const handleJoin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!joinCode.trim()) return;

      setLoading(true);
      setError('');

      try {
          const challenge = await getChallenge(joinCode.trim());
          if (!challenge) {
              setError("Böyle bir düello bulunamadı.");
              playSound('wrong');
          } else if (challenge.status === 'completed') {
              setError("Bu düello zaten tamamlanmış.");
              playSound('wrong');
          } else {
              // Reconstruct Word List
              let challengeWords: WordCard[] = [];
              if (challenge.unitId && challenge.wordIndices) {
                   let pool: WordCard[] = [];
                   if (challenge.unitId === 'mixed') {
                       pool = Object.values(VOCABULARY).flat();
                   } else if (VOCABULARY[challenge.unitId]) {
                       pool = VOCABULARY[challenge.unitId];
                   } else {
                        // Fallback: Just use all words
                        pool = Object.values(VOCABULARY).flat();
                   }
                   
                   challengeWords = challenge.wordIndices.map(i => pool[i]).filter(Boolean);
              }
              
              if (challengeWords.length > 0) {
                  onJoinChallenge(challenge, challengeWords);
              } else {
                  setError("Düello verisi yüklenemedi.");
              }
          }
      } catch (err) {
          console.error(err);
          setError("Bir hata oluştu.");
      } finally {
          setLoading(false);
      }
  };

  const handleCreateSubmit = () => {
      if (selectedGrade && selectedUnit) {
          onCreateChallenge({
              grade: selectedGrade,
              unit: selectedUnit,
              difficulty: selectedDifficulty,
              count: selectedCount
          });
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        <div className="bg-orange-500 p-5 text-center relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={24} />
            </button>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-500 mx-auto mb-2 shadow-lg">
                <Swords size={24} />
            </div>
            <h2 className="text-xl font-black text-white mb-0.5">Meydan Oku</h2>
            <p className="text-orange-100 text-xs font-medium">Arkadaşınla kozlarını paylaş!</p>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {mode === 'menu' ? (
                <div className="space-y-4">
                    <button 
                        onClick={() => setMode('create')}
                        className="w-full py-5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-between group"
                    >
                        <div className="text-left">
                            <div className="text-lg font-black">Düello Oluştur</div>
                            <div className="text-xs opacity-80 font-medium mt-1">Kendi kurallarınla yarış</div>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    <button 
                        onClick={() => setMode('join')}
                        className="w-full py-5 px-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 text-slate-700 dark:text-white rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-between group"
                    >
                        <div className="text-left">
                            <div className="text-lg font-black">Koda Katıl</div>
                            <div className="text-xs text-slate-500 font-medium mt-1">Arkadaşının kodunu gir</div>
                        </div>
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
                             <Hash size={20} />
                        </div>
                    </button>
                </div>
            ) : mode === 'join' ? (
                <form onSubmit={handleJoin} className="space-y-6">
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Düello Kodunu Gir</h3>
                        <p className="text-xs text-slate-500">Arkadaşının paylaştığı kodu buraya yapıştır.</p>
                    </div>

                    <div>
                        <input 
                            type="text" 
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="Örn: A1B2C3"
                            className="w-full p-4 text-center text-3xl font-black tracking-widest uppercase bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-orange-500 rounded-2xl outline-none transition-all dark:text-white placeholder:text-slate-300"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => { setMode('menu'); setError(''); setJoinCode(''); }}
                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            Geri
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || !joinCode}
                            className="flex-[2] py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-95"
                        >
                            {loading ? 'Aranıyor...' : 'Katıl'}
                        </button>
                    </div>
                </form>
            ) : (
                // CREATE MODE STEPS
                <div className="space-y-4">
                    {step === 1 && (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <GraduationCap className="text-indigo-500" size={20} />
                                <h3 className="font-bold text-slate-800 dark:text-white">Sınıf Seç</h3>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {grades.map(g => (
                                    <button 
                                        key={g}
                                        onClick={() => { setSelectedGrade(g); setStep(2); }}
                                        className="p-3 rounded-xl border hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm font-bold transition-all"
                                        style={{borderColor: 'var(--color-border)', color: 'var(--color-text-main)'}}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setMode('menu')} className="w-full mt-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl">Geri</button>
                        </>
                    )}

                    {step === 2 && selectedGrade && (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="text-indigo-500" size={20} />
                                <h3 className="font-bold text-slate-800 dark:text-white">Ünite Seç ({selectedGrade}. Sınıf)</h3>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {UNIT_ASSETS[selectedGrade]?.map(u => (
                                    !u.id.endsWith('all') && u.id !== 'uAll' && (
                                        <button 
                                            key={u.id}
                                            onClick={() => { setSelectedUnit(u); setStep(3); }}
                                            className="w-full p-3 text-left rounded-xl border hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm font-medium transition-all truncate"
                                            style={{borderColor: 'var(--color-border)', color: 'var(--color-text-main)'}}
                                        >
                                            <span className="font-bold mr-2">{u.unitNo}:</span> {u.title}
                                        </button>
                                    )
                                ))}
                            </div>
                            <button onClick={() => { setStep(1); setSelectedGrade(null); }} className="w-full mt-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl">Geri</button>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <Settings className="text-indigo-500" size={20} />
                                <h3 className="font-bold text-slate-800 dark:text-white">Ayarlar</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Zorluk (Süre)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {difficultyOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSelectedDifficulty(opt.id)}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${selectedDifficulty === opt.id ? opt.color : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Soru Sayısı</label>
                                    <div className="flex gap-2">
                                        {countOptions.map(cnt => (
                                            <button
                                                key={cnt}
                                                onClick={() => setSelectedCount(cnt)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${selectedCount === cnt ? 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                            >
                                                {cnt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => { setStep(2); setSelectedUnit(null); }} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl">Geri</button>
                                <button onClick={handleCreateSubmit} className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <Check size={18} /> Oluştur
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default ChallengeModal;
