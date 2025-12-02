
import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Crown, WifiOff, RefreshCw, CheckCircle, Zap, BookOpen, Target, Grid3X3, Keyboard, Star, WholeWord, Flame } from 'lucide-react';
import { getLeaderboard, LeaderboardEntry, syncLocalToCloud } from '../services/firebase';
import { AVATARS, FRAMES, BACKGROUNDS } from '../data/assets';

interface LeaderboardModalProps {
  onClose: () => void;
  currentUserXP: number;
  currentUserGrade: string;
}

type LeaderboardMode = 'xp' | 'quiz' | 'flashcard' | 'matching' | 'typing' | 'chain';

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose, currentUserXP, currentUserGrade }) => {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<LeaderboardMode>('xp');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    if (!navigator.onLine) {
        setIsOffline(true);
        setLoading(false);
        return;
    }

    setIsOffline(false);
    setLoading(true);
    
    // Ensure local data is synced before fetching
    await syncLocalToCloud();

    // Always fetch ALL for no grade distinction
    const data = await getLeaderboard('ALL', mode);
    setUsers(data);
    setLoading(false);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchData();
  }, [mode]);

  const getRankIcon = (index: number) => {
      switch(index) {
          case 0: return <Crown size={20} className="text-yellow-500 fill-yellow-500" />;
          case 1: return <Medal size={18} className="text-slate-400 fill-slate-300" />;
          case 2: return <Medal size={18} className="text-orange-500 fill-orange-400" />;
          default: return <span className="font-black text-xs w-6 text-center opacity-50">{index + 1}</span>;
      }
  };

  const getThemeStyles = (theme?: string) => {
    let bg = '#ffffff'; let text = '#1e293b'; let border = '#e2e8f0'; let font = "'Inter', sans-serif";
    switch (theme) {
        case 'light': bg = '#ffffff'; text = '#1e293b'; border = '#e2e8f0'; break;
        case 'dark': bg = '#1e293b'; text = '#f8fafc'; border = '#334155'; break;
        case 'neon': bg = '#000000'; text = '#33ff00'; border = '#33ff00'; break;
        case 'ocean': bg = '#0c4a6e'; text = '#e0f2fe'; border = '#0369a1'; break;
        case 'sunset': bg = '#431407'; text = '#ffedd5'; border = '#9a3412'; break;
        case 'forest': bg = '#052e16'; text = '#dcfce7'; border = '#15803d'; break;
        case 'royal': bg = '#312e81'; text = '#fef3c7'; border = '#fbbf24'; font = "'Playfair Display', serif"; break;
        case 'candy': bg = '#831843'; text = '#fce7f3'; border = '#be185d'; font = "'Fredoka', sans-serif"; break;
        case 'cyberpunk': bg = '#18181b'; text = '#facc15'; border = '#facc15'; font = "'Orbitron', sans-serif"; break;
        case 'coffee': bg = '#3e2723'; text = '#d7ccc8'; border = '#6d4c41'; break;
        case 'galaxy': bg = '#0f172a'; text = '#e9d5ff'; border = '#6b21a8'; break;
        case 'retro': bg = '#fdf6e3'; text = '#657b83'; border = '#b58900'; font = "'Courier Prime', monospace"; break;
        case 'matrix': bg = '#000000'; text = '#00ff41'; border = '#003b00'; font = "'Courier Prime', monospace"; break;
        case 'midnight': bg = '#020617'; text = '#e2e8f0'; border = '#334155'; break;
        case 'volcano': bg = '#1a0505'; text = '#fee2e2'; border = '#7f1d1d'; font = "'Rubik Burned', system-ui"; break;
        case 'ice': bg = '#083344'; text = '#cffafe'; border = '#155e75'; break;
        case 'lavender': bg = '#2e1065'; text = '#ede9fe'; border = '#6d28d9'; break;
        case 'gamer': bg = '#000000'; text = '#ffffff'; border = '#ef4444'; font = "'Russo One', sans-serif"; break;
        case 'luxury': bg = '#1a1a1a'; text = '#fcfcd4'; border = '#fbbf24'; font = "'Playfair Display', serif"; break;
        case 'comic': bg = '#ffffff'; text = '#000000'; border = '#000000'; font = "'Bangers', system-ui"; break;
        case 'nature_soft': bg = '#f0fdf4'; text = '#14532d'; border = '#84cc16'; font = "'Patrick Hand', cursive"; break;
    }
    return { backgroundColor: bg, color: text, borderColor: border, fontFamily: font };
  };

  const formatValue = (val: number) => {
      return val.toLocaleString();
  }

  const getModeLabel = () => {
      switch(mode) {
          case 'xp': return 'Toplam Puan & Seri';
          case 'quiz': return 'Test Çözme';
          case 'flashcard': return 'Kelime Çalışma';
          case 'matching': return 'Eşleştirme Oyunu';
          case 'typing': return 'Yazma Oyunu';
          case 'chain': return 'Kelime Türetmece';
      }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-200"
           style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 text-center relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={20} />
            </button>
            <h2 className="text-lg font-black text-white mb-3">Lider Tablosu</h2>
            
            {/* Mode Tabs */}
            <div className="flex justify-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                 <button onClick={() => setMode('xp')} className={`p-2 rounded-lg transition-all ${mode === 'xp' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><Trophy size={16} /></button>
                 <button onClick={() => setMode('quiz')} className={`p-2 rounded-lg transition-all ${mode === 'quiz' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><Target size={16} /></button>
                 <button onClick={() => setMode('flashcard')} className={`p-2 rounded-lg transition-all ${mode === 'flashcard' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><BookOpen size={16} /></button>
                 <button onClick={() => setMode('matching')} className={`p-2 rounded-lg transition-all ${mode === 'matching' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><Grid3X3 size={16} /></button>
                 <button onClick={() => setMode('typing')} className={`p-2 rounded-lg transition-all ${mode === 'typing' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><Keyboard size={16} /></button>
                 <button onClick={() => setMode('chain')} className={`p-2 rounded-lg transition-all ${mode === 'chain' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><WholeWord size={16} /></button>
            </div>

             <div className="text-[12px] text-white mt-2 font-bold bg-black/20 inline-block px-3 py-1 rounded-full border border-white/10">{getModeLabel()}</div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar" style={{backgroundColor: 'var(--color-bg-main)'}}>
            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div></div>
            ) : users.length === 0 ? (
                 <div className="text-center py-10 opacity-60 text-sm">Bu kategoride henüz veri yok.</div>
            ) : (
                <div className="space-y-2">
                    {users.map((user, index) => {
                         const avatarDef = AVATARS.find(a => a.icon === user.avatar) || AVATARS[0];
                         const frameDef = FRAMES.find(f => f.id === user.frame) || FRAMES[0];
                         const bgDef = BACKGROUNDS.find(b => b.id === user.background) || BACKGROUNDS[0];
                         const themeStyle = getThemeStyles(user.theme);
                         
                         return (
                            <div key={user.uid} style={themeStyle} className={`p-2.5 rounded-xl border transition-transform shadow-sm relative flex items-center gap-3`}>
                                <div className="shrink-0 w-6 flex justify-center">{getRankIcon(index)}</div>
                                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                                    <div className={`absolute inset-0 w-full h-full rounded-full z-30 pointer-events-none ${frameDef.style}`}></div>
                                    <div className={`absolute inset-0 w-full h-full rounded-full z-10 ${bgDef.style}`}></div>
                                    <div className="w-full h-full rounded-full overflow-hidden relative z-20 flex items-center justify-center text-lg bg-transparent">
                                         {avatarDef.image ? <img src={avatarDef.image} className="w-full h-full object-cover scale-[1.01]" /> : <span>{avatarDef.icon}</span>}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm truncate" style={{fontFamily: themeStyle.fontFamily}}>{user.name || 'İsimsiz'}</h4>
                                    <div className="flex items-center gap-2 text-[9px] opacity-80">
                                        <span className="flex items-center gap-0.5"><Star size={8} className="fill-current" /> Lvl {user.level}</span>
                                        <span>•</span>
                                        <span>{user.grade === 'GENERAL' ? 'Genel' : `${user.grade}. Sınıf`}</span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    {mode === 'quiz' ? (
                                        <div className="flex flex-col items-end">
                                            <div className="font-black text-xs" style={{color: themeStyle.color, opacity: 0.9}}>
                                                Toplam: {user.value + (user.quizWrong || 0)}
                                            </div>
                                            <div className="flex gap-1 text-[8px] font-bold mt-0.5">
                                                <span className="text-green-600 bg-green-100 px-1 rounded">{user.value} D</span>
                                                <span className="text-red-600 bg-red-100 px-1 rounded">{user.quizWrong || 0} Y</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="font-black text-sm leading-none" style={{color: themeStyle.color, opacity: 0.9}}>{formatValue(user.value)}</div>
                                            <div className="text-[8px] font-bold uppercase opacity-60">
                                                {mode === 'xp' ? 'XP' : 'Puan'}
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Show Streak only in XP mode if available */}
                                    {mode === 'xp' && (user as any).streak > 0 && (
                                        <div className="flex items-center gap-0.5 text-[9px] font-bold text-orange-500 mt-0.5">
                                            <Flame size={10} className="fill-current" /> {(user as any).streak}
                                        </div>
                                    )}
                                </div>
                            </div>
                         );
                    })}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t shrink-0 text-[10px] text-center text-slate-400 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
             Oyun skorları Pazar 23:59'da sıfırlanır. (Toplam Puan ve Seri hariç)
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
