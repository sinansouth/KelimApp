
import React, { useState, useEffect, useMemo } from 'react';
import { Save, Edit2, BarChart2, Trophy, Flame, Star, User, ShoppingBag, Target, CheckCircle, ChevronDown, ChevronUp, LogOut, Trash2, ShieldCheck } from 'lucide-react';
import { getUserProfile, getUserStats, saveUserProfile, getDailyState, UserProfile as IUserProfile, UserStats } from '../services/userService';
import { GradeLevel, Badge, Quest } from '../types';
import StatsModal from './StatsModal';
import AvatarModal from './AvatarModal';
import LeaderboardModal from './LeaderboardModal';
import { AVATARS, BADGES, FRAMES, BACKGROUNDS } from '../data/assets';
import { getAuthInstance, logoutUser, checkUsernameExists, updateCloudUsername, syncLocalToCloud, deleteAccount } from '../services/firebase';

interface ProfileProps {
  onBack: () => void;
  onProfileUpdate?: () => void;
  onOpenMarket?: () => void;
  onLoginRequest?: () => void;
  externalStats?: UserStats; // Optional prop for receiving real-time stats from App
}

const getGradeVisuals = (grade: string) => {
  if (['2', '3', '4'].includes(grade)) {
    return { bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800', text: 'text-teal-600 dark:text-teal-400' };
  }
  if (['5', '6', '7', '8'].includes(grade)) {
    return { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-600 dark:text-indigo-400' };
  }
  if (['9', '10', '11', '12'].includes(grade)) {
    return { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-400' };
  }
  if (grade && grade.startsWith('A') || grade.startsWith('B') || grade.startsWith('C')) {
      return { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-600 dark:text-rose-400' };
  }
  return { bg: 'bg-slate-50 dark:bg-slate-900/50', border: 'border-slate-200 dark:border-slate-800', text: 'text-slate-600 dark:text-slate-400' };
};

const Profile: React.FC<ProfileProps> = ({ onBack, onProfileUpdate, onOpenMarket, onLoginRequest, externalStats }) => {
  const [profile, setProfile] = useState<IUserProfile>({ name: '', grade: '', avatar: '', frame: 'frame_none', background: 'bg_default', purchasedThemes: [], purchasedFrames: [], purchasedBackgrounds: [], inventory: { streakFreezes: 0 } });
  const [stats, setStats] = useState<UserStats | null>(externalStats || null);
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [saveError, setSaveError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Accordion states
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [tooltipBadgeId, setTooltipBadgeId] = useState<string | null>(null);
  
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const visuals = useMemo(() => getGradeVisuals(profile.grade), [profile.grade]);

  // Update local stats if external props change
  useEffect(() => {
      if (externalStats) {
          setStats(externalStats);
      }
  }, [externalStats]);

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);
    // Only fetch if not provided via props
    if (!externalStats) {
        setStats(getUserStats());
    }
    setDailyQuests(getDailyState().quests);
    setAvatarLoadError(false);

    const auth = getAuthInstance();
    if (auth) {
        setCurrentUser(auth.currentUser);
    }
  }, [showStatsModal, showAvatarModal, externalStats]); 

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setIsSaving(true);

    const oldProfile = getUserProfile();
    const isNameChanged = profile.name !== oldProfile.name;

    // Username Change Checks
    if (isNameChanged) {
        // 1. Online Check
        if (!navigator.onLine) {
            setSaveError('İsim değiştirmek için internet bağlantısı gereklidir.');
            setIsSaving(false);
            return;
        }

        // 2. Time Limit Check (7 days)
        const lastChange = oldProfile.lastUsernameChange || 0;
        const now = Date.now();
        const daysSinceLastChange = (now - lastChange) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastChange < 7) {
            const daysLeft = Math.ceil(7 - daysSinceLastChange);
            setSaveError(`İsmini haftada sadece 1 kez değiştirebilirsin. ${daysLeft} gün sonra tekrar dene.`);
            setIsSaving(false);
            return;
        }

        // 3. Unique Name Check
        try {
            const exists = await checkUsernameExists(profile.name);
            if (exists) {
                setSaveError('Bu isim zaten alınmış.');
                setIsSaving(false);
                return;
            }

            // Update Cloud Name first if logged in
            const auth = getAuthInstance();
            if (auth && auth.currentUser) {
                await updateCloudUsername(auth.currentUser.uid, profile.name);
            }
        } catch (err) {
            console.error("Username check error:", err);
            setSaveError('İsim kontrolü sırasında bir hata oluştu.');
            setIsSaving(false);
            return;
        }
    }

    // Proceed with Save
    const updatedProfile = { 
        ...profile,
        lastUsernameChange: isNameChanged ? Date.now() : profile.lastUsernameChange 
    }; 
    
    saveUserProfile(updatedProfile, true); // Save local, skip auto-sync for now
    
    // Force sync to ensure leaderboard gets updated
    const auth = getAuthInstance();
    if (auth && auth.currentUser) {
         await syncLocalToCloud(auth.currentUser.uid);
    }

    setProfile(updatedProfile);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    setIsEditing(false);
    setIsSaving(false);
    
    if (onProfileUpdate) {
        onProfileUpdate();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteAccount = async () => {
      if (confirmDelete) {
          setIsSaving(true);
          try {
              await deleteAccount();
          } catch (e) {
              setSaveError("Hesap silinirken bir hata oluştu.");
              setIsSaving(false);
          }
      } else {
          setConfirmDelete(true);
      }
  };

  const avatarData = AVATARS.find(a => a.icon === profile.avatar);
  const frameDef = FRAMES.find(f => f.id === profile.frame) || FRAMES[0];
  const frameStyle = frameDef.style;
  const hasFrame = profile.frame && profile.frame !== 'frame_none';
  const backgroundDef = BACKGROUNDS.find(b => b.id === profile.background) || BACKGROUNDS[0];
  const backgroundStyle = backgroundDef.style || '';

  const xpProgress = (stats?.xp || 0) % 1500; 
  const xpTarget = 1500; 
  
  // Memoize and reverse badges to show newest first
  const unlockedBadges = useMemo(() => {
      if (!stats?.badges) return [];
      // Create copy before reversing to avoid mutation
      const reversedIds = [...stats.badges].reverse();
      return reversedIds
        .map(id => BADGES.find(b => b.id === id))
        .filter((b): b is Badge => b !== undefined);
  }, [stats?.badges]);

  const completedQuestsCount = dailyQuests.filter(q => q.isCompleted).length;

  return (
    <>
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      <div className="rounded-[2rem] shadow-xl border overflow-hidden transition-colors relative" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
        
        {!isEditing && (
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                <button 
                    onClick={() => setIsEditing(true)} 
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
                >
                    Düzenle
                </button>
            </div>
        )}

        <div className="p-6 text-center">
          <div className="mb-4 flex justify-center relative z-0">
             
             <button onClick={() => setShowAvatarModal(true)} className={`relative w-32 h-32 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center z-10 ${!hasFrame ? 'shadow-lg' : ''}`}>
                 <div className={`absolute inset-0 w-full h-full rounded-full pointer-events-none z-30 ${frameStyle}`}></div>
                <div className={`absolute inset-0 w-full h-full rounded-full z-10 ${backgroundStyle}`}></div>
                <div className={`w-full h-full rounded-full flex items-center justify-center text-5xl overflow-hidden relative z-20 bg-transparent`}>
                    {avatarData?.image && !avatarLoadError ? (
                         <img src={avatarData.image} alt={avatarData.name} className="w-full h-full object-cover scale-[1.01]" onError={() => setAvatarLoadError(true)} />
                    ) : (
                        profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:') || profile.avatar.startsWith('/')) && !avatarLoadError ? (
                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover scale-[1.01]" onError={() => setAvatarLoadError(true)} />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center bg-transparent`}>
                                <span className="filter drop-shadow-md transform transition-transform group-hover:scale-110 leading-none flex items-center justify-center h-full w-full">
                                    {avatarData?.icon || profile.avatar || <User size={40} />}
                                </span>
                            </div>
                        )
                    )}
                </div>
             </button>
          </div>

          {!isEditing ? (
               <div className="flex flex-col items-center animate-in fade-in mt-2">
                 
                 <div className="mb-2 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm flex items-center gap-1">
                    <Star size={10} className="fill-current" />
                    <span>LVL {stats?.level || 1}</span>
                 </div>

                 <div className="relative flex items-center justify-center mb-1 w-full max-w-xs">
                     <h2 className="text-2xl font-black tracking-tight text-center truncate px-2" style={{color: 'var(--color-text-main)'}}>{profile.name || 'Öğrenci'}</h2>
                 </div>
                 
                 {currentUser ? (
                     <div className="mb-4 flex items-center gap-2">
                         <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">Online</span>
                         <button onClick={logoutUser} className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1">
                            <LogOut size={10} /> Çıkış
                         </button>
                     </div>
                 ) : (
                     <button onClick={onLoginRequest} className="mb-4 text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full hover:bg-indigo-500/20 transition-colors">
                        Giriş Yap / Kayıt Ol
                     </button>
                 )}

                 <div className={`font-bold text-xs mb-6 px-3 py-1 rounded-full border ${visuals.bg} ${visuals.border} ${visuals.text}`}>
                   {profile.grade ? (
                       ['A1','A2','B1','B2','C1'].includes(profile.grade) ? `${profile.grade} Seviye` : `${profile.grade}. Sınıf`
                   ) : 'Sınıf Seçilmedi'}
                 </div>
                 <div className="grid grid-cols-3 gap-2 w-full mb-6">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl border border-orange-100 dark:border-orange-800/50 flex flex-col items-center justify-center">
                        <Flame size={20} className="text-orange-500 mb-1 fill-orange-500" />
                        <div className="text-lg font-black" style={{color: 'var(--color-text-main)'}}>{stats?.streak || 0}</div>
                        <span className="text-[9px] font-bold uppercase text-orange-600/70 dark:text-orange-400/70 tracking-wider">Gün Seri</span>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex flex-col items-center justify-center">
                        <Trophy size={20} className="text-indigo-500 mb-1 fill-indigo-500" />
                        <div className="text-lg font-black" style={{color: 'var(--color-text-main)'}}>{stats?.xp || 0}</div>
                        <span className="text-[9px] font-bold uppercase text-indigo-600/70 dark:text-indigo-400/70 tracking-wider">Toplam XP</span>
                    </div>
                     <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-2xl border border-yellow-100 dark:border-yellow-800/50 flex flex-col items-center justify-center">
                        <Star size={20} className="text-yellow-500 mb-1 fill-yellow-500" />
                        <div className="text-lg font-black" style={{color: 'var(--color-text-main)'}}>{unlockedBadges.length}</div>
                        <span className="text-[9px] font-bold uppercase text-yellow-600/70 dark:text-yellow-400/70 tracking-wider">Rozet</span>
                    </div>
                 </div>

                 <button id="market-button"
                    onClick={onOpenMarket}
                    className="w-full mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-3 shadow-md relative overflow-hidden active:scale-[0.99] transition-transform group flex items-center justify-between"
                 >
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/20 transition-colors"></div>
                     <div className="text-left z-10">
                         <div className="flex items-center gap-2 text-yellow-100 font-bold text-[10px] uppercase tracking-wide mb-0.5">
                             <ShoppingBag size={12} /> Mağaza
                         </div>
                         <div className="text-lg font-black text-white">Kozmetikler</div>
                         <div className="text-yellow-100 text-[10px] font-medium">Temalar, çerçeveler ve arka planlar</div>
                     </div>
                     <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform z-10 shrink-0">
                         <Star size={16} className="fill-white ml-0.5 text-white" />
                     </div>
                 </button>
                
                {dailyQuests.length > 0 && (
                    <div className="w-full mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                         <button 
                            onClick={() => setIsQuestsOpen(!isQuestsOpen)}
                            className="w-full p-3 flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                    <Target size={16} />
                                </div>
                                <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Günlük Görevler</h3>
                                <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${completedQuestsCount === dailyQuests.length ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                    {completedQuestsCount}/{dailyQuests.length}
                                </span>
                            </div>
                            {isQuestsOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </button>
                        
                        {isQuestsOpen && (
                            <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 animate-in slide-in-from-top-2">
                                <div className="space-y-2 pt-3">
                                    {dailyQuests.map((quest) => (
                                        <div key={quest.id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`min-w-[2rem] px-1.5 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors
                                                    ${quest.isCompleted ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}
                                                `}>
                                                    {quest.isCompleted ? <CheckCircle size={12} /> : `${quest.current}/${quest.target}`}
                                                </div>
                                                <div className="truncate">
                                                    <div className={`text-[10px] font-medium truncate ${quest.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {quest.description}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`text-[10px] font-bold ml-2 whitespace-nowrap ${quest.isCompleted ? 'text-green-500' : 'text-orange-500'}`}>
                                                {quest.isCompleted ? 'Tamamlandı' : `+${quest.rewardXP} XP`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                 )}

                <div className="w-full mb-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <button 
                        onClick={() => setIsAchievementsOpen(!isAchievementsOpen)}
                        className="w-full p-3 flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                                <ShieldCheck size={16} />
                            </div>
                            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Başarımlarım</h3>
                            <span className="ml-2 text-[10px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{unlockedBadges.length}</span>
                        </div>
                        {isAchievementsOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </button>

                    {isAchievementsOpen && (
                        <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 animate-in slide-in-from-top-2">
                             {unlockedBadges.length > 0 ? (
                                <div className="grid grid-cols-5 gap-2 pt-3">
                                    {unlockedBadges.map((badge, index) => (
                                        <div 
                                            key={badge.id} 
                                            className="relative group flex justify-center"
                                            onClick={() => setTooltipBadgeId(tooltipBadgeId === badge.id ? null : badge.id)}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer hover:border-yellow-300 dark:hover:border-yellow-500 overflow-hidden">
                                                {badge.image ? (
                                                    <img src={badge.image} alt={badge.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    badge.icon.startsWith('http') || badge.icon.startsWith('data:') || badge.icon.startsWith('/') ? (
                                                        <img src={badge.icon} alt={badge.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="flex items-center justify-center w-full h-full leading-none">{badge.icon}</span>
                                                    )
                                                )}
                                            </div>
                                            {/* Tooltip */}
                                            {tooltipBadgeId === badge.id && (
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
                                                    {badge.name}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400 italic py-4 text-center">Henüz hiç rozet kazanılmadı.</div>
                            )}
                        </div>
                    )}
                </div>

                 <div className="w-full mb-8">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 px-1">
                        <span>Seviye {stats?.level || 1}</span>
                        <span>Seviye {(stats?.level || 1) + 1}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700/50">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (xpProgress / xpTarget) * 100)}%` }}></div>
                    </div>
                    <div className="text-center mt-1 text-[9px] font-medium text-slate-400">
                         Sonraki seviye için {Math.max(0, xpTarget - xpProgress)} XP kaldı
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 w-full">
                     <button onClick={() => setShowLeaderboard(true)} className="w-full py-3 border hover:border-yellow-500 text-slate-700 dark:text-white rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 group text-xs" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-main)'}}>
                        <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg group-hover:scale-110 transition-transform">
                            <Trophy size={16} />
                        </div>
                        <span>Lider Tablosu</span>
                     </button>

                     <button onClick={() => setShowStatsModal(true)} className="w-full py-3 border hover:border-indigo-500 text-slate-700 dark:text-white rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 group text-xs" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-main)'}}>
                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
                            <BarChart2 size={16} />
                        </div>
                        <span>İstatistikler</span>
                     </button>
                 </div>
               </div>
             ) : (
               <div className="animate-in fade-in zoom-in-95 mt-6">
                 <form onSubmit={handleSave}>
                    <div className="space-y-4 mb-6 text-left">
                        <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Görünen İsim</label>
                        <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" style={{color: 'var(--color-text-main)', backgroundColor: 'var(--color-bg-main)'}} />
                        <p className="text-[10px] text-slate-400 mt-1 ml-1">Lider tablosunda bu isim görünür. Haftada 1 kez değiştirebilirsin.</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Sınıf / Seviye</label>
                            <select name="grade" value={profile.grade} onChange={handleChange} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none" style={{color: 'var(--color-text-main)', backgroundColor: 'var(--color-bg-main)'}}>
                            <option value="">Seç</option>
                            <optgroup label="İlkokul"><option value="2">2. Sınıf</option><option value="3">3. Sınıf</option><option value="4">4. Sınıf</option></optgroup>
                            <optgroup label="Ortaokul"><option value="5">5. Sınıf</option><option value="6">6. Sınıf</option><option value="7">7. Sınıf</option><option value="8">8. Sınıf</option></optgroup>
                            <optgroup label="Lise"><option value="9">9. Sınıf</option><option value="10">10. Sınıf</option><option value="11">11. Sınıf</option><option value="12">12. Sınıf</option></optgroup>
                            <optgroup label="Genel İngilizce">
                                <option value="A1">A1 (Başlangıç)</option>
                                <option value="A2">A2 (Temel)</option>
                                <option value="B1">B1 (Orta)</option>
                                <option value="B2">B2 (Orta Üstü)</option>
                                <option value="C1">C1 (İleri)</option>
                            </optgroup>
                            </select>
                        </div>
                    </div>
                    
                    {saveError && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold">{saveError}</div>}

                    <div className="flex gap-3 mb-4">
                        <button type="button" onClick={() => { setIsEditing(false); setSaveError(''); setConfirmDelete(false); }} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold">İptal</button>
                        <button type="submit" disabled={isSaving} className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                            {isSaving ? 'Kaydediliyor...' : <><Save size={18} /> Kaydet</>}
                        </button>
                    </div>
                 </form>
                 
                 {/* Delete Account Button */}
                 <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                     {!confirmDelete ? (
                         <button 
                             type="button"
                             onClick={() => setConfirmDelete(true)}
                             className="w-full py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                         >
                             <Trash2 size={18} /> Hesabı Sil
                         </button>
                     ) : (
                         <div className="space-y-2">
                             <p className="text-center text-xs text-red-600 font-bold">Bu işlem geri alınamaz. Tüm verilerin silinecek.</p>
                             <div className="flex gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setConfirmDelete(false)}
                                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg text-xs font-bold"
                                >
                                    Vazgeç
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    disabled={isSaving}
                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold"
                                >
                                    {isSaving ? 'Siliniyor...' : 'Evet, Sil'}
                                </button>
                             </div>
                         </div>
                     )}
                 </div>
               </div>
             )}
             
             {showSaved && <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl text-sm font-bold animate-in zoom-in">Profil güncellendi!</div>}
        </div>
      </div>
      
      {showAvatarModal && <AvatarModal onClose={() => setShowAvatarModal(false)} userStats={stats || {
        flashcardsViewed: 0, 
        quizCorrect: 0, 
        quizWrong: 0, 
        date: '', 
        dailyGoal: 5, 
        xp: 0, 
        level: 1, 
        streak: 0, 
        lastStudyDate: null, 
        badges: [], 
        xpBoostEndTime: 0, 
        lastGoalMetDate: null, 
        viewedWordsToday: [], 
        perfectQuizzes: 0, 
        questsCompleted: 0, 
        totalTimeSpent: 0, 
        completedUnits: [], 
        completedGrades: [],
        weekly: { weekId: '', quizCorrect: 0, quizWrong: 0, cardsViewed: 0, matchingBestTime: 0, typingHighScore: 0, chainHighScore: 0, mazeHighScore: 0, wordSearchHighScore: 0 }
    }} onUpdate={() => { setProfile(getUserProfile()); if(onProfileUpdate) onProfileUpdate(); }} />}
      
      {showLeaderboard && (
        <LeaderboardModal 
            onClose={() => setShowLeaderboard(false)} 
            currentUserXP={stats?.xp || 0} 
            currentUserGrade={profile.grade}
        />
      )}
    </div>
    
    {showStatsModal && <StatsModal onClose={() => setShowStatsModal(false)} currentGrade={profile.grade as GradeLevel || 'ALL'} />}
    </>
  );
};

export default Profile;
