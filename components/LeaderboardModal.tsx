
import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Crown, WifiOff, RefreshCw, CheckCircle, XCircle, Brain, Layers, Star } from 'lucide-react';
import { getLeaderboard, LeaderboardEntry } from '../services/firebase';
import { AVATARS, FRAMES, BACKGROUNDS } from '../data/assets';

interface LeaderboardModalProps {
  onClose: () => void;
  currentUserXP: number;
  currentUserGrade: string;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose, currentUserXP, currentUserGrade }) => {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | string>('ALL'); 
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    if (!navigator.onLine) {
        setIsOffline(true);
        setLoading(false);
        return;
    }

    setIsOffline(false);
    if (users.length === 0) setLoading(true);
    
    const data = await getLeaderboard(filter);
    setUsers(data);
    setLoading(false);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    if (navigator.onLine) {
        setLoading(true);
        fetchData();
    } else {
        setIsOffline(true);
        setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const interval = setInterval(() => {
        if (navigator.onLine) fetchData();
    }, 60000);

    const handleOnline = () => { 
        setIsOffline(false); 
        setLoading(true);
        fetchData(); 
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        clearInterval(interval);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [filter]); 

  const getRankIcon = (index: number) => {
      switch(index) {
          case 0: return <Crown size={20} className="text-yellow-500 fill-yellow-500" />;
          case 1: return <Medal size={18} className="text-slate-400 fill-slate-300" />;
          case 2: return <Medal size={18} className="text-orange-500 fill-orange-400" />;
          default: return <span className="font-black text-xs w-6 text-center opacity-50">{index + 1}</span>;
      }
  };

  const getThemeStyles = (theme?: string) => {
    let bg = '#ffffff';
    let text = '#1e293b';
    let border = '#e2e8f0';
    let font = "'Inter', sans-serif";
    
    switch (theme) {
        case 'light': bg = '#ffffff'; text = '#0f172a'; border = '#e2e8f0'; font = "'Inter', sans-serif"; break;
        case 'neon': bg = '#000000'; text = '#33ff00'; border = '#33ff00'; font = "'Inter', sans-serif"; break;
        case 'ocean': bg = '#075985'; text = '#e0f2fe'; border = '#0369a1'; font = "'Inter', sans-serif"; break;
        case 'sunset': bg = '#7c2d12'; text = '#ffedd5'; border = '#9a3412'; font = "'Inter', sans-serif"; break;
        case 'forest': bg = '#14532d'; text = '#dcfce7'; border = '#15803d'; font = "'Inter', sans-serif"; break;
        case 'royal': bg = '#4338ca'; text = '#fef3c7'; border = '#fbbf24'; font = "'Playfair Display', serif"; break;
        case 'candy': bg = '#9d174d'; text = '#fce7f3'; border = '#be185d'; font = "'Fredoka', sans-serif"; break;
        case 'cyberpunk': bg = '#27272a'; text = '#facc15'; border = '#facc15'; font = "'Orbitron', sans-serif"; break;
        case 'coffee': bg = '#4e342e'; text = '#d7ccc8'; border = '#6d4c41'; font = "'Inter', sans-serif"; break;
        case 'galaxy': bg = '#1e1b4b'; text = '#e9d5ff'; border = '#6b21a8'; font = "'Inter', sans-serif"; break;
        case 'retro': bg = '#eee8d5'; text = '#657b83'; border = '#b58900'; font = "'Courier Prime', monospace"; break;
        case 'matrix': bg = '#001100'; text = '#00ff41'; border = '#003b00'; font = "'Courier Prime', monospace"; break;
        case 'midnight': bg = '#1e293b'; text = '#e2e8f0'; border = '#334155'; font = "'Inter', sans-serif"; break;
        case 'volcano': bg = '#2b0b0b'; text = '#fee2e2'; border = '#7f1d1d'; font = "'Rubik Burned', display"; break;
        case 'ice': bg = '#164e63'; text = '#cffafe'; border = '#155e75'; font = "'Inter', sans-serif"; break;
        case 'lavender': bg = '#4c1d95'; text = '#ede9fe'; border = '#6d28d9'; font = "'Inter', sans-serif"; break;
        case 'gamer': bg = '#111111'; text = '#ffffff'; border = '#ef4444'; font = "'Russo One', sans-serif"; break;
        case 'luxury': bg = '#262626'; text = '#fcfcd4'; border = '#fbbf24'; font = "'Playfair Display', serif"; break;
        case 'comic': bg = '#f3f4f6'; text = '#000000'; border = '#000000'; font = "'Bangers', display"; break;
        case 'nature_soft': bg = '#dcfce7'; text = '#14532d'; border = '#84cc16'; font = "'Patrick Hand', cursive"; break;
        default: 
             bg = '#1e293b'; text = '#f8fafc'; border = '#334155'; font = "'Inter', sans-serif";
    }

    return { backgroundColor: bg, color: text, borderColor: border, fontFamily: font };
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-200"
           style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 text-center relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={20} />
            </button>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white mx-auto mb-2 backdrop-blur-md">
                <Trophy size={24} className="fill-yellow-300 text-yellow-300" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">Lider Tablosu</h2>
            
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
                <button 
                    onClick={() => setFilter('ALL')}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors border ${filter === 'ALL' ? 'bg-white text-indigo-600 border-white' : 'bg-indigo-700 text-white border-indigo-500 hover:bg-indigo-500'}`}
                >
                    Tümü
                </button>
                {currentUserGrade && (
                    <button 
                        onClick={() => setFilter(currentUserGrade)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors border ${filter === currentUserGrade ? 'bg-white text-indigo-600 border-white' : 'bg-indigo-700 text-white border-indigo-500 hover:bg-indigo-500'}`}
                    >
                        {currentUserGrade === 'GENERAL' || currentUserGrade.startsWith('A') || currentUserGrade.startsWith('B') || currentUserGrade.startsWith('C') ? 'Genel' : `${currentUserGrade}. Sınıf`}
                    </button>
                )}
            </div>
        </div>

        {/* Offline Warning */}
        {isOffline && (
            <div className="bg-red-500 text-white px-4 py-2 text-xs font-bold flex flex-col items-center justify-center gap-1 text-center">
                <div className="flex items-center gap-2">
                    <WifiOff size={14} /> 
                    <span>İnternet Bağlantısı Yok</span>
                </div>
            </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar" style={{backgroundColor: 'var(--color-bg-main)'}}>
            {isOffline ? (
                 <div className="flex flex-col items-center justify-center h-full opacity-50 text-center p-6">
                     <WifiOff size={32} className="mb-2 text-slate-400" />
                     <p className="text-slate-500 font-bold text-sm">İnternet bağlantısı gerekli.</p>
                     <button onClick={fetchData} className="mt-3 px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold">Tekrar Dene</button>
                 </div>
            ) : loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                </div>
            ) : users.length === 0 ? (
                 <div className="text-center py-10 opacity-60 text-sm flex flex-col items-center gap-2" style={{color: 'var(--color-text-muted)'}}>
                     <span>Bu kategoride henüz veri yok.</span>
                 </div>
            ) : (
                <div className="space-y-2">
                    {users.map((user, index) => {
                         const avatarDef = AVATARS.find(a => a.icon === user.avatar) || AVATARS[0];
                         const frameDef = FRAMES.find(f => f.id === user.frame) || FRAMES[0];
                         const bgDef = BACKGROUNDS.find(b => b.id === user.background) || BACKGROUNDS[0];
                         const themeStyle = getThemeStyles(user.theme);

                         return (
                            <div key={user.uid} style={themeStyle} className={`p-2.5 rounded-xl border transition-transform active:scale-[0.99] shadow-sm relative overflow-hidden flex flex-col gap-2`}>
                                
                                {/* Top Row: Rank, Avatar, Name, XP */}
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="shrink-0 w-6 flex justify-center">
                                        {getRankIcon(index)}
                                    </div>
                                    
                                    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                                        <div className={`absolute inset-0 w-full h-full rounded-full z-30 pointer-events-none ${frameDef.style}`}></div>
                                        <div className={`absolute inset-0 w-full h-full rounded-full z-10 ${bgDef.style}`}></div>
                                        <div className="w-full h-full rounded-full overflow-hidden relative z-20 flex items-center justify-center text-lg bg-transparent">
                                             {avatarDef.image ? (
                                                 <img src={avatarDef.image} alt={user.name} className="w-full h-full object-cover scale-[1.01]" />
                                             ) : (
                                                 <span>{avatarDef.icon}</span>
                                             )}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate" style={{fontFamily: themeStyle.fontFamily}}>{user.name || 'İsimsiz'}</h4>
                                        <div className="flex items-center gap-2 text-[9px] opacity-80 font-medium">
                                            <span className="flex items-center gap-0.5"><Star size={8} className="fill-current" /> Lvl {user.level}</span>
                                            <span>•</span>
                                            <span className="truncate">{user.grade === 'GENERAL' ? 'Genel' : `${user.grade}. Sınıf`}</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-black text-sm leading-none">{user.xp.toLocaleString()}</div>
                                        <div className="text-[8px] font-bold uppercase opacity-60">XP</div>
                                    </div>
                                </div>

                                {/* Bottom Row: Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 relative z-10">
                                    <div className="flex items-center justify-center gap-1 bg-black/5 dark:bg-white/5 rounded py-1 px-1.5">
                                        <CheckCircle size={10} className="text-green-500" />
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[9px] font-black">{user.quiz || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-1 bg-black/5 dark:bg-white/5 rounded py-1 px-1.5">
                                        <XCircle size={10} className="text-red-500" />
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[9px] font-black">{user.quizWrong || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-1 bg-black/5 dark:bg-white/5 rounded py-1 px-1.5">
                                        <Brain size={10} className="text-indigo-500" />
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[9px] font-black">{user.memorized || 0}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                         );
                    })}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t shrink-0" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
            <div className="flex items-center justify-between text-xs mb-0.5">
                <span style={{color: 'var(--color-text-muted)'}}>Senin Puanın:</span>
                <span className="font-black text-base text-indigo-500">{currentUserXP.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center justify-between text-[9px] opacity-50" style={{color: 'var(--color-text-muted)'}}>
                 <div className="flex items-center gap-1">
                    {!isOffline && <RefreshCw size={8} className="animate-spin-slow" />}
                    <span>{isOffline ? 'Çevrimdışı' : 'Canlı'}</span>
                 </div>
                 <span>{lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default LeaderboardModal;
