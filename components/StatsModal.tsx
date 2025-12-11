
import React, { useState, useEffect } from 'react';
import { X, Clock, Activity, Eye, Target, Swords, Grid3X3, Gamepad2, Search } from 'lucide-react';
import { getUserStats, getSRSStatus, getMemorizedSet } from '../services/userService';
import { GradeLevel, UserStats } from '../types';
import { getBadges } from '../services/contentService';

interface StatsModalProps {
  onClose: () => void;
  currentGrade: GradeLevel | 'ALL' | 'GENERAL';
}

export const StatsModal: React.FC<StatsModalProps> = ({ onClose, currentGrade: initialGrade }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'learning' | 'games' | 'badges'>('general');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [srsStats, setSrsStats] = useState<{[key:number]: number}>({});
  
  const [memorizedCount, setMemorizedCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [tooltipBadgeId, setTooltipBadgeId] = useState<string | null>(null);

  const BADGES = getBadges();

  useEffect(() => {
      // Fetch fresh stats every time modal opens
      setStats(getUserStats());
      setSrsStats(getSRSStatus());

      const rawMemorizedSet = getMemorizedSet();
      let rawBookmarksSet = new Set<string>();
      try {
        const storedBookmarks = localStorage.getItem('lgs_bookmarks');
        if (storedBookmarks) {
           rawBookmarksSet = new Set(JSON.parse(storedBookmarks));
        }
      } catch (e) {}

      setMemorizedCount(rawMemorizedSet.size);
      setBookmarksCount(rawBookmarksSet.size);
  }, []);

  const sortedBadges = React.useMemo(() => {
      if (!stats) return BADGES;
      return [...BADGES].sort((a, b) => {
           const aUnlocked = stats.badges.includes(a.id);
           const bUnlocked = stats.badges.includes(b.id);
           
           if (aUnlocked && !bUnlocked) return -1; 
           if (!aUnlocked && bUnlocked) return 1;  
           
           if (aUnlocked && bUnlocked) {
               return stats.badges.indexOf(b.id) - stats.badges.indexOf(a.id); // Newest first
           }
           return 0;
      });
  }, [stats, BADGES]);

  const formatVal = (n: number) => n.toLocaleString();
  
  const formatTime = (minutes: number) => {
      if (minutes < 60) return `${minutes}dk`;
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}s ${m}dk`;
  };
  
  const getAccuracy = () => {
      if (!stats) return 0;
      const total = stats.quizCorrect + stats.quizWrong;
      if (total === 0) return 0;
      return Math.round((stats.quizCorrect / total) * 100);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl border overflow-hidden flex flex-col h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
           style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b z-10 sticky top-0 shrink-0" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)'}}>
            <h2 className="text-xl sm:text-2xl font-black" style={{color: 'var(--color-text-main)'}}>İlerleme Durumu</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" style={{color: 'var(--color-text-muted)'}}>
                <X size={24} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-2 gap-2 shrink-0 overflow-x-auto no-scrollbar" style={{borderColor: 'var(--color-border)'}}>
            <button onClick={() => setActiveTab('general')} className={`py-4 px-3 font-bold text-sm relative transition-colors whitespace-nowrap ${activeTab === 'general' ? 'text-indigo-500' : 'text-slate-400'}`}>
                Genel
                {activeTab === 'general' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-t-full"></div>}
            </button>
            <button onClick={() => setActiveTab('learning')} className={`py-4 px-3 font-bold text-sm relative transition-colors whitespace-nowrap ${activeTab === 'learning' ? 'text-green-500' : 'text-slate-400'}`}>
                Çalışma
                {activeTab === 'learning' && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-full"></div>}
            </button>
             <button onClick={() => setActiveTab('games')} className={`py-4 px-3 font-bold text-sm relative transition-colors whitespace-nowrap ${activeTab === 'games' ? 'text-purple-500' : 'text-slate-400'}`}>
                Oyunlar
                {activeTab === 'games' && <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500 rounded-t-full"></div>}
            </button>
            <button onClick={() => setActiveTab('badges')} className={`py-4 px-3 font-bold text-sm relative transition-colors whitespace-nowrap ${activeTab === 'badges' ? 'text-orange-500' : 'text-slate-400'}`}>
                Rozetler
                {activeTab === 'badges' && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-t-full"></div>}
            </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar flex-1" style={{backgroundColor: 'var(--color-bg-main)'}}>
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
                <div className="space-y-6">
                    
                    {/* Time & Accuracy Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-3xl border relative overflow-hidden group" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                 <Clock size={64} />
                             </div>
                             <div className="relative z-10">
                                 <span className="text-xs font-bold uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>Toplam Süre</span>
                                 <div className="text-2xl font-black mt-1" style={{color: 'var(--color-text-main)'}}>
                                     {formatTime(stats?.totalTimeSpent || 0)}
                                 </div>
                                 <div className="text-[10px] mt-1 text-green-500 font-bold">Verimli Çalışma</div>
                             </div>
                        </div>

                        <div className="p-5 rounded-3xl border relative overflow-hidden group" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                 <Activity size={64} />
                             </div>
                             <div className="relative z-10">
                                 <span className="text-xs font-bold uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>Quiz Doğruluğu</span>
                                 <div className="text-2xl font-black mt-1" style={{color: 'var(--color-text-main)'}}>
                                     %{getAccuracy()}
                                 </div>
                                 <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                     <div className="h-full bg-indigo-500" style={{ width: `${getAccuracy()}%` }}></div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* SRS Status */}
                    <div className="p-6 rounded-3xl border" style={{backgroundColor: 'rgba(var(--color-bg-card-rgb), 0.5)', borderColor: 'var(--color-border)'}}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-center w-full" style={{color: 'var(--color-text-main)'}}>
                                SRS KUTULARI
                            </h3>
                        </div>
                        
                        <div className="flex items-end justify-center gap-3 h-48 pb-2">
                            {[
                                { id: 1, color: 'bg-green-500', borderColor: 'border-green-600', shadow: 'shadow-green-500/20' },
                                { id: 2, color: 'bg-yellow-400', borderColor: 'border-yellow-500', shadow: 'shadow-yellow-500/20' },
                                { id: 3, color: 'bg-orange-500', borderColor: 'border-orange-600', shadow: 'shadow-orange-500/20' },
                                { id: 4, color: 'bg-red-500', borderColor: 'border-red-600', shadow: 'shadow-red-500/20' },
                                { id: 5, color: 'bg-red-900', borderColor: 'border-red-950', shadow: 'shadow-red-900/20' }
                            ].map(box => {
                                const count = srsStats[box.id] || 0;
                                const total = Object.values(srsStats).reduce((a,b)=>a+b, 0);
                                
                                // Daha dinamik bir hesaplama:
                                // Eğer hiç kelime yoksa %15 (taban)
                                // Maksimum yükseklik %100
                                // Kutu içindeki kelime sayısının toplama oranı yerine
                                // Kutu içindeki sayının "maksimum dolu olan kutuya" oranını alıp görselleştirelim.
                                const maxInAnyBox = Math.max(...Object.values(srsStats), 1); 
                                const percent = Math.max(15, Math.min(100, (count / maxInAnyBox) * 100));
                                
                                return (
                                <div key={box.id} className="flex flex-col items-center gap-2 flex-1 max-w-[60px] group">
                                    <div className="relative w-full flex flex-col justify-end items-center h-full">
                                        <div 
                                            className={`w-full rounded-t-xl rounded-b-md border-x-2 border-t-2 border-b-4 ${box.borderColor} ${box.color} flex items-end justify-center shadow-lg ${box.shadow} transition-all duration-1000 ease-out group-hover:scale-105`}
                                            style={{ height: `${percent}%`, minHeight: '30px' }}
                                        >
                                            <span className="font-black text-xs sm:text-sm text-white/90 drop-shadow-md mb-1.5">{count}</span>
                                        </div>
                                    </div>
                                    <span className="font-bold text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md" style={{color: 'var(--color-text-main)'}}>{box.id}</span>
                                </div>
                            )})}
                        </div>
                        <div className="h-1.5 w-full bg-slate-300 dark:bg-slate-700 rounded-full mt-1"></div>
                        <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">Kutu numarası arttıkça kelime hafızanda daha kalıcı hale gelir.</p>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                         <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                             <span className="text-[10px] uppercase font-bold text-slate-400">Ezberlenen</span>
                             <span className="text-lg font-black text-green-500">{memorizedCount}</span>
                         </div>
                         <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                             <span className="text-[10px] uppercase font-bold text-slate-400">Favoriler</span>
                             <span className="text-lg font-black text-orange-500">{bookmarksCount}</span>
                         </div>
                    </div>

                </div>
            )}
            
            {/* ... Other tabs preserved ... */}
             {activeTab === 'learning' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 sm:p-5 rounded-3xl border flex flex-col justify-between h-28 sm:h-32" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                             <div className="flex justify-between items-start">
                                <span className="text-[10px] sm:text-xs font-bold uppercase text-blue-500">Bakılan Kart</span>
                                <Eye size={18} className="text-blue-500" />
                            </div>
                            <div>
                                <span className="text-2xl sm:text-3xl font-black" style={{color: 'var(--color-text-main)'}}>{formatVal(Number(stats?.flashcardsViewed || 0))}</span>
                            </div>
                        </div>

                        <div className="p-4 sm:p-5 rounded-3xl border flex flex-col justify-between h-28 sm:h-32" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                             <div className="flex justify-between items-start">
                                <span className="text-[10px] sm:text-xs font-bold uppercase text-violet-500">Quiz Başarısı</span>
                                <Target size={18} className="text-violet-500" />
                            </div>
                            <div>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl sm:text-3xl font-black" style={{color: 'var(--color-text-main)'}}>
                                        {stats && (stats.quizCorrect + stats.quizWrong) > 0 
                                            ? Math.round((stats.quizCorrect / (stats.quizCorrect + stats.quizWrong)) * 100) 
                                            : 0}%
                                    </span>
                                </div>
                                <div className="text-[10px] font-medium mt-1 flex gap-2" style={{color: 'var(--color-text-muted)'}}>
                                    <span className="text-green-500">{stats?.quizCorrect} D</span>
                                    <span className="text-red-500">{stats?.quizWrong} Y</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* GAMES TAB */}
            {activeTab === 'games' && (
                <div className="space-y-4">
                     <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center"><Swords size={20} /></div>
                             <div className="flex flex-col">
                                 <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Düello</span>
                                 <span className="text-[10px] text-slate-500">Toplam Puan / Zafer</span>
                             </div>
                         </div>
                         <div className="text-right">
                             <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatVal(Number(stats?.duelPoints || 0))} P</div>
                             <div className="text-xs font-bold text-green-500">{stats?.duelWins || 0} Win</div>
                         </div>
                     </div>

                     <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center"><Grid3X3 size={20} /></div>
                             <div className="flex flex-col">
                                 <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Eşleştirme</span>
                                 <span className="text-[10px] text-slate-500">En yüksek puan</span>
                             </div>
                         </div>
                         <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatVal(Number(stats?.matchingAllTimeBest || stats?.weekly?.matchingBestTime || 0))}</span>
                     </div>

                     <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center"><Gamepad2 size={20} /></div>
                             <div className="flex flex-col">
                                 <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Labirent</span>
                                 <span className="text-[10px] text-slate-500">En yüksek puan</span>
                             </div>
                         </div>
                         <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatVal(Number(stats?.mazeAllTimeBest || stats?.weekly?.mazeHighScore || 0))}</span>
                     </div>

                     <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center"><Search size={20} /></div>
                             <div className="flex flex-col">
                                 <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Bulmaca</span>
                                 <span className="text-[10px] text-slate-500">En yüksek puan</span>
                             </div>
                         </div>
                         <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatVal(Number(stats?.wordSearchAllTimeBest || stats?.weekly?.wordSearchHighScore || 0))}</span>
                     </div>
                </div>
            )}

            {/* BADGES TAB */}
            {activeTab === 'badges' && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {sortedBadges.map(badge => {
                        const isUnlocked = stats?.badges.includes(badge.id);
                        return (
                            <div 
                                key={badge.id}
                                onClick={() => setTooltipBadgeId(tooltipBadgeId === badge.id ? null : badge.id)}
                                className={`relative aspect-square rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all active:scale-95 group ${isUnlocked ? 'bg-white dark:bg-slate-800 border-yellow-200 dark:border-yellow-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60 grayscale'}`}
                            >
                                <div className="text-3xl filter drop-shadow-sm">{badge.icon}</div>
                                {isUnlocked && <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>}
                                
                                {tooltipBadgeId === badge.id && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black/90 text-white text-[10px] p-2 rounded-lg z-50 pointer-events-none text-center">
                                        <div className="font-bold text-yellow-400 mb-0.5">{badge.name}</div>
                                        <div>{badge.description}</div>
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-black/90 border-r-[6px] border-r-transparent"></div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default StatsModal;
