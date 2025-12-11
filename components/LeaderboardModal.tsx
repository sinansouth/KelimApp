
import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Crown, Star, Target, BookOpen, Swords, Grid3X3, Gamepad2, Search, LogIn, Flame, WifiOff } from 'lucide-react';
import { getLeaderboard, LeaderboardEntry, syncLocalToCloud, getAuthInstance } from '../services/supabase';
import { getAvatars, getFrames, getBackgrounds } from '../services/contentService';
import { THEME_COLORS } from '../data/assets';
import UserProfileModal from './UserProfileModal';
import { getUserProfile, getTheme } from '../services/userService';
import AuthModal from './AuthModal';

interface LeaderboardModalProps {
  onClose: () => void;
  currentUserXP: number;
  currentUserGrade: string;
}

type LeaderboardMode = 'xp' | 'quiz' | 'flashcard' | 'matching' | 'maze' | 'wordSearch' | 'duel';

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose, currentUserXP, currentUserGrade }) => {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<LeaderboardMode>('xp');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [currentUserProfile, setCurrentUserProfile] = useState(getUserProfile());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const AVATARS = getAvatars();
  const FRAMES = getFrames();
  const BACKGROUNDS = getBackgrounds();
  
  const myTheme = getTheme(); 
  const modalThemeStyle = THEME_COLORS[myTheme as any] || THEME_COLORS['dark'];

  useEffect(() => {
    // Get current user ID
    getAuthInstance().currentUser.then(user => {
      if (user) {
        setCurrentUserId(user.id);
      }
    });
  }, []);

  const fetchData = async () => {
    if (!navigator.onLine) {
        setIsOffline(true);
        setLoading(false);
        return;
    }

    setIsOffline(false);
    setLoading(true);
    
    if (!currentUserProfile.isGuest) {
        await syncLocalToCloud();
    }

    const data = await getLeaderboard('ALL', mode);
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [mode]);

  const onAuthSuccess = () => {
      setCurrentUserProfile(getUserProfile());
      // Update ID after login
      getAuthInstance().currentUser.then(user => {
        if (user) setCurrentUserId(user.id);
        fetchData(); 
      });
  };

  const getRankIcon = (index: number) => {
      switch(index) {
          case 0: return <Crown size={20} className="text-yellow-500 fill-yellow-500" />;
          case 1: return <Medal size={18} className="text-slate-400 fill-slate-300" />;
          case 2: return <Medal size={18} className="text-orange-500 fill-orange-400" />;
          default: return <span className="font-black text-xs w-6 text-center opacity-50">{index + 1}</span>;
      }
  };

  const getUserRowStyle = (userTheme: string) => {
      const themeConfig = THEME_COLORS[userTheme as any] || THEME_COLORS['dark'];
      return {
          backgroundColor: themeConfig.bgCard,
          color: themeConfig.textMain,
          borderColor: themeConfig.border,
          fontFamily: themeConfig.fontFamily // Apply specific font
      };
  };

  const formatValue = (val: number) => {
      return val.toLocaleString();
  }

  const getModeLabel = () => {
      switch(mode) {
          case 'xp': return 'Toplam Puan & Seri (Genel)';
          case 'quiz': return 'Haftalık: Test Doğrusu';
          case 'flashcard': return 'Haftalık: Kelime Çalışma';
          case 'matching': return 'Haftalık: Eşleştirme Skoru';
          case 'maze': return 'Haftalık: Labirent Skoru';
          case 'wordSearch': return 'Haftalık: Bulmaca Skoru';
          case 'duel': return 'Haftalık: Düello Puanı';
      }
  }

  return (
    <>
    {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={onAuthSuccess} />}

    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-200"
           style={{
               backgroundColor: modalThemeStyle.bgCard, 
               borderColor: modalThemeStyle.border,
               fontFamily: modalThemeStyle.fontFamily
           }}>
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 text-center relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={20} />
            </button>
            <h2 className="text-lg font-black text-white mb-3">Lider Tablosu</h2>
            
            <div className="flex justify-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                 <button onClick={() => setMode('xp')} className={`p-2 rounded-lg transition-all ${mode === 'xp' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><Trophy size={16} /></button>
                 <button onClick={() => setMode('quiz')} className={`p-2 rounded-lg transition-all ${mode === 'quiz' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><Target size={16} /></button>
                 <button onClick={() => setMode('flashcard')} className={`p-2 rounded-lg transition-all ${mode === 'flashcard' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><BookOpen size={16} /></button>
                 <button onClick={() => setMode('duel')} className={`p-2 rounded-lg transition-all ${mode === 'duel' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><Swords size={16} /></button>
                 <button onClick={() => setMode('matching')} className={`p-2 rounded-lg transition-all ${mode === 'matching' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><Grid3X3 size={16} /></button>
                 <button onClick={() => setMode('maze')} className={`p-2 rounded-lg transition-all ${mode === 'maze' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><Gamepad2 size={16} /></button>
                 <button onClick={() => setMode('wordSearch')} className={`p-2 rounded-lg transition-all ${mode === 'wordSearch' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white opacity-70 hover:opacity-100'}`}><Search size={16} /></button>
            </div>

             <div className="text-[12px] text-white mt-2 font-bold bg-black/20 inline-block px-3 py-1 rounded-full border border-white/10">{getModeLabel()}</div>
        </div>

        {/* Guest Warning */}
        {currentUserProfile.isGuest && !isOffline && (
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 text-center shrink-0 border-b border-orange-200 dark:border-orange-800">
                <p className="text-xs text-orange-800 dark:text-orange-200 font-bold mb-2">Sıralamaya girmek için hesabını kaydetmelisin.</p>
                <button 
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 mx-auto"
                >
                    <LogIn size={12} /> Kayıt Ol
                </button>
            </div>
        )}

        {/* Offline Warning */}
        {isOffline && (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-70" style={{color: modalThemeStyle.textMuted}}>
                 <WifiOff size={48} className="mb-4" />
                 <h3 className="font-bold text-lg mb-2">İnternet Bağlantısı Yok</h3>
                 <p className="text-sm">Liderlik tablosunu görmek için internete bağlanmalısın.</p>
                 <button onClick={fetchData} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">Tekrar Dene</button>
             </div>
        )}

        {/* List */}
        {!isOffline && (
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar" style={{backgroundColor: modalThemeStyle.bgMain}}>
                {loading ? (
                    <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div></div>
                ) : users.length === 0 ? (
                    <div className="text-center py-10 opacity-60 text-sm" style={{color: modalThemeStyle.textMuted}}>Bu kategoride henüz veri yok.</div>
                ) : (
                    <div className="space-y-2">
                        {users.map((user, index) => {
                            const avatarDef = AVATARS.find(a => a.icon === user.avatar) || AVATARS[0];
                            const frameDef = FRAMES.find(f => f.id === user.frame) || FRAMES[0];
                            const bgDef = BACKGROUNDS.find(b => b.id === user.background) || BACKGROUNDS[0];
                            
                            const isCurrentUser = currentUserId ? user.uid === currentUserId : user.name === currentUserProfile.name;
                            
                            // Determine row style: use user's theme if available
                            const rowThemeKey = isCurrentUser ? myTheme : user.theme;
                            const rowStyle = getUserRowStyle(rowThemeKey);
                            
                            return (
                                <button 
                                    key={user.uid} 
                                    onClick={() => setSelectedUserId(user.uid)}
                                    style={rowStyle} 
                                    className={`w-full text-left p-2.5 rounded-xl border transition-all shadow-sm relative flex items-center gap-3 active:scale-95 hover:brightness-95 ${isCurrentUser ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent' : ''}`}
                                >
                                    <div className="shrink-0 w-6 flex justify-center">{getRankIcon(index)}</div>
                                    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                                        <div className={`absolute inset-0 w-full h-full rounded-full z-30 pointer-events-none ${frameDef.style}`}></div>
                                        <div className={`absolute inset-0 w-full h-full rounded-full z-10 ${bgDef.style}`}></div>
                                        <div className="w-full h-full rounded-full overflow-hidden relative z-20 flex items-center justify-center text-lg bg-transparent">
                                            {avatarDef.image ? <img src={avatarDef.image} className="w-full h-full object-cover scale-[1.01]" /> : <span>{avatarDef.icon}</span>}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate" style={{color: rowStyle.color}}>
                                            {user.name || 'İsimsiz'} {isCurrentUser && '(Sen)'}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[9px] opacity-80">
                                            <span className="flex items-center gap-0.5"><Star size={8} className="fill-current" /> Lvl {user.level}</span>
                                            <span>•</span>
                                            <span>{user.grade === 'GENERAL' ? 'Genel' : `${user.grade}. Sınıf`}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        {mode === 'quiz' ? (
                                            <div className="flex flex-col items-end">
                                                <div className="font-black text-xs flex flex-col items-end" style={{color: rowStyle.color, opacity: 0.9}}>
                                                    <span>{user.value} D</span>
                                                </div>
                                                <div className="text-[8px] opacity-60">Doğru</div>
                                            </div>
                                        ) : mode === 'duel' ? (
                                            <div className="flex flex-col items-end">
                                                <div className="font-black text-sm leading-none" style={{color: rowStyle.color, opacity: 0.9}}>{formatValue(user.value)} P</div>
                                                <div className="text-[8px] font-bold mt-0.5 flex gap-1">
                                                    <span className="text-green-500">{user.duelWins || 0}G</span>
                                                    <span className="text-yellow-500 opacity-80">{user.duelDraws || 0}B</span>
                                                    <span className="text-red-500 opacity-80">{user.duelLosses || 0}M</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="font-black text-sm leading-none" style={{color: rowStyle.color, opacity: 0.9}}>{formatValue(user.value)}</div>
                                                <div className="text-[8px] font-bold uppercase opacity-60">
                                                    {mode === 'xp' ? 'XP' : 'Puan'}
                                                </div>
                                            </>
                                        )}
                                        
                                        {mode === 'xp' && (user as any).streak > 0 && (
                                            <div className="flex items-center gap-0.5 text-[9px] font-bold text-orange-500 mt-0.5">
                                                <Flame size={10} className="fill-current" /> {(user as any).streak}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t shrink-0 text-[10px] text-center" style={{backgroundColor: modalThemeStyle.bgCard, borderColor: modalThemeStyle.border, color: modalThemeStyle.textMuted}}>
             Oyun ve Düello skorları her Pazar 23:59'da (TR Saati) sıfırlanır.
        </div>
      </div>
    </div>

    {selectedUserId && (
        <UserProfileModal 
            userId={selectedUserId} 
            onClose={() => setSelectedUserId(null)} 
        />
    )}
    </>
  );
};

export default LeaderboardModal;
