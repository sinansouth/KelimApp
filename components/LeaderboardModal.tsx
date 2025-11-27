
import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Crown, User, Filter, WifiOff, RefreshCw } from 'lucide-react';
import { getLeaderboard, LeaderboardEntry } from '../services/firebase';
import { AVATARS } from '../data/assets';

interface LeaderboardModalProps {
  onClose: () => void;
  currentUserXP: number;
  currentUserGrade: string;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose, currentUserXP, currentUserGrade }) => {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | string>('ALL'); // 'ALL' or grade
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    // If offline, don't try to fetch, just stop loading
    if (!navigator.onLine) {
        setIsOffline(true);
        setLoading(false);
        return;
    }

    setIsOffline(false);
    // Don't set loading to true on background refreshes to avoid flickering
    if (users.length === 0) setLoading(true);
    
    const data = await getLeaderboard(filter);
    setUsers(data);
    setLoading(false);
    setLastUpdated(new Date());
  };

  // Initial Fetch and Grade Filter Change
  useEffect(() => {
    setLoading(true); // Show spinner on filter change
    fetchData();
  }, [filter]);

  // Auto-Refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
        fetchData();
    }, 60000); // 60 seconds

    // Network Status Listeners
    const handleOnline = () => { setIsOffline(false); fetchData(); };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        clearInterval(interval);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [filter]); // Re-bind if filter changes to ensure refresh uses correct filter

  const getRankStyle = (index: number) => {
      switch(index) {
          case 0: return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700';
          case 1: return 'bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';
          case 2: return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-300 dark:border-orange-700';
          default: return 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800';
      }
  };

  const getRankIcon = (index: number) => {
      switch(index) {
          case 0: return <Crown size={24} className="text-yellow-500 fill-yellow-500" />;
          case 1: return <Medal size={22} className="text-slate-400 fill-slate-300" />;
          case 2: return <Medal size={22} className="text-orange-500 fill-orange-400" />;
          default: return <span className="font-bold text-sm w-6 text-center">{index + 1}</span>;
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-200"
           style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-center relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={24} />
            </button>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white mx-auto mb-3 backdrop-blur-md">
                <Trophy size={28} className="fill-yellow-300 text-yellow-300" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">Lider Tablosu</h2>
            
            {/* Filter Tabs */}
            <div className="flex justify-center gap-2 mt-4">
                <button 
                    onClick={() => setFilter('ALL')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors border-2 ${filter === 'ALL' ? 'bg-white text-indigo-600 border-white' : 'bg-indigo-700 text-white border-indigo-500 hover:bg-indigo-500'}`}
                >
                    Tümü
                </button>
                {currentUserGrade && (
                    <button 
                        onClick={() => setFilter(currentUserGrade)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors border-2 ${filter === currentUserGrade ? 'bg-white text-indigo-600 border-white' : 'bg-indigo-700 text-white border-indigo-500 hover:bg-indigo-500'}`}
                    >
                        {currentUserGrade}. Sınıf
                    </button>
                )}
            </div>
        </div>

        {/* Offline Warning */}
        {isOffline && (
            <div className="bg-red-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2">
                <WifiOff size={14} /> İnternet Bağlantısı Yok
            </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" style={{backgroundColor: 'var(--color-bg-main)'}}>
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            ) : users.length === 0 ? (
                 <div className="text-center py-10 opacity-60 text-sm flex flex-col items-center gap-2">
                     {isOffline ? (
                         <>
                            <WifiOff size={32} />
                            <span>Sıralamayı görmek için internete bağlanın.</span>
                         </>
                     ) : (
                         <span>Bu kategoride henüz veri yok.</span>
                     )}
                 </div>
            ) : (
                <div className="space-y-3">
                    {users.map((user, index) => {
                         const avatarDef = AVATARS.find(a => a.icon === user.avatar) || AVATARS[0];
                         return (
                            <div key={user.uid} className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${getRankStyle(index)} transition-transform active:scale-[0.99]`}>
                                <div className="shrink-0 w-8 flex justify-center">
                                    {getRankIcon(index)}
                                </div>
                                
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 overflow-hidden border border-white/20 shadow-sm shrink-0 flex items-center justify-center text-xl">
                                     {avatarDef.image ? (
                                         <img src={avatarDef.image} alt={user.name} className="w-full h-full object-cover" />
                                     ) : (
                                         <span>{avatarDef.icon}</span>
                                     )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm truncate">{user.name || 'İsimsiz'}</h4>
                                    <div className="flex items-center gap-2 text-[10px] opacity-80">
                                        <span className="px-1.5 py-0.5 rounded bg-black/10 font-bold">{user.grade}. Sınıf</span>
                                        <span>Lvl {user.level}</span>
                                        {user.streak > 0 && <span>🔥 {user.streak}</span>}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="font-black text-base">{user.xp.toLocaleString()}</div>
                                    <div className="text-[8px] font-bold uppercase opacity-60">XP</div>
                                </div>
                            </div>
                         );
                    })}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t shrink-0" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
            <div className="flex items-center justify-between text-sm mb-1">
                <span style={{color: 'var(--color-text-muted)'}}>Senin Puanın:</span>
                <span className="font-black text-lg text-indigo-500">{currentUserXP.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center justify-between text-[10px] opacity-50">
                 <div className="flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin-slow" /> 
                    <span>Her 60 saniyede bir güncellenir</span>
                 </div>
                 <span>Son: {lastUpdated.toLocaleTimeString()}</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default LeaderboardModal;
