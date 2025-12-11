
import React, { useState, useEffect, useMemo } from 'react';
import { Save, Edit2, BarChart2, Trophy, Flame, Star, User, ShoppingBag, Target, CheckCircle, ChevronDown, ChevronUp, LogOut, Trash2, ShieldCheck, Ghost, LogIn, KeyRound, GraduationCap, Users, Copy, UserPlus, Swords, ChevronRight, X } from 'lucide-react';
import { getUserProfile, getUserStats, saveUserProfile, getDailyState, UserProfile as IUserProfile, UserStats } from '../services/userService';
import { GradeLevel, Badge, Quest } from '../types';
import { StatsModal } from './StatsModal';
import AvatarModal from './AvatarModal';
import LeaderboardModal from './LeaderboardModal';
import { getAvatars, getBadges, getFrames, getBackgrounds } from '../services/contentService';
import { THEME_COLORS } from '../data/assets';
import { getAuthInstance, logoutUser, checkUsernameExists, updateCloudUsername, syncLocalToCloud, deleteAccount, resetUserPassword, addFriend, getFriends, LeaderboardEntry } from '../services/supabase';
import AuthModal from './AuthModal';
import { AlertType } from './CustomAlert';
import CustomSelect from './CustomSelect';

interface ProfileProps {
  onBack: () => void;
  onProfileUpdate?: () => void;
  onOpenMarket?: () => void;
  onLoginRequest?: (initialView?: 'login' | 'register') => void;
  externalStats?: UserStats;
  showAlert: (title: string, message: string, type: AlertType, onConfirm?: () => void) => void;
  onViewProfile: (userId: string) => void;
}

const gradeOptions = [
    { value: "2", label: "2. Sınıf", group: "İlkokul" },
    { value: "3", label: "3. Sınıf", group: "İlkokul" },
    { value: "4", label: "4. Sınıf", group: "İlkokul" },
    { value: "5", label: "5. Sınıf", group: "Ortaokul" },
    { value: "6", label: "6. Sınıf", group: "Ortaokul" },
    { value: "7", label: "7. Sınıf", group: "Ortaokul" },
    { value: "8", label: "8. Sınıf", group: "Ortaokul" },
    { value: "9", label: "9. Sınıf", group: "Lise" },
    { value: "10", label: "10. Sınıf", group: "Lise" },
    { value: "11", label: "11. Sınıf", group: "Lise" },
    { value: "12", label: "12. Sınıf", group: "Lise" },
    { value: "A1", label: "A1 (Başlangıç)", group: "Genel İngilizce" },
    { value: "A2", label: "A2 (Temel)", group: "Genel İngilizce" },
    { value: "B1", label: "B1 (Orta)", group: "Genel İngilizce" },
    { value: "B2", label: "B2 (Orta Üstü)", group: "Genel İngilizce" },
    { value: "C1", label: "C1 (İleri)", group: "Genel İngilizce" },
];

const Profile: React.FC<ProfileProps> = ({ onBack, onProfileUpdate, onOpenMarket, onLoginRequest, externalStats, showAlert, onViewProfile }) => {
  const [profile, setProfile] = useState<IUserProfile>({ name: '', grade: '', avatar: '', frame: 'frame_none', background: 'bg_default', purchasedThemes: [], purchasedFrames: [], purchasedBackgrounds: [], inventory: { streakFreezes: 0 } });
  const [stats, setStats] = useState<UserStats | null>(externalStats || null);
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Accordion states
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [tooltipBadgeId, setTooltipBadgeId] = useState<string | null>(null);
  
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  
  // Friends State
  const [friendCode, setFriendCode] = useState('');
  const [friendsList, setFriendsList] = useState<LeaderboardEntry[]>([]);
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);

  const AVATARS = getAvatars();
  const BADGES = getBadges();
  const FRAMES = getFrames();
  const BACKGROUNDS = getBackgrounds();

  useEffect(() => {
      if (externalStats) {
          setStats(externalStats);
      }
  }, [externalStats]);

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);
    if (!externalStats) {
        setStats(getUserStats());
    }
    setDailyQuests(getDailyState().quests);
    setAvatarLoadError(false);

    const auth = getAuthInstance();
    auth.currentUser.then(user => {
        setCurrentUser(user);
        if (user && !userProfile.isGuest) {
            fetchFriends(user.id);
        }
    });
  }, [showStatsModal, showAvatarModal, externalStats]);

  const fetchFriends = async (uid: string) => {
      setFriendsLoading(true);
      try {
          const friends = await getFriends(uid);
          setFriendsList(friends);
      } catch (e) {
          console.error("Failed to fetch friends", e);
      } finally {
          setFriendsLoading(false);
      }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const oldProfile = getUserProfile();
    const isNameChanged = profile.name !== oldProfile.name;

    if (isNameChanged && !profile.isGuest) {
        if (!navigator.onLine) {
            showAlert("Hata", "İsim değiştirmek için internet bağlantısı gereklidir.", "error");
            setIsSaving(false);
            return;
        }

        const lastChange = oldProfile.lastUsernameChange || 0;
        const now = Date.now();
        const daysSinceLastChange = (now - lastChange) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastChange < 7) {
            const daysLeft = Math.ceil(7 - daysSinceLastChange);
            showAlert("Hata", `İsmini haftada sadece 1 kez değiştirebilirsin. ${daysLeft} gün sonra tekrar dene.`, "warning");
            setIsSaving(false);
            return;
        }

        try {
            const exists = await checkUsernameExists(profile.name);
            if (exists) {
                showAlert("Hata", "Bu isim zaten alınmış.", "error");
                setIsSaving(false);
                return;
            }

            const auth = getAuthInstance();
            const user = await auth.currentUser;
            if (user) {
                await updateCloudUsername(user.id, profile.name);
            }
        } catch (err) {
            showAlert("Hata", "İsim kontrolü sırasında bir hata oluştu.", "error");
            setIsSaving(false);
            return;
        }
    }

    const updatedProfile = { 
        ...profile,
        lastUsernameChange: isNameChanged ? Date.now() : profile.lastUsernameChange 
    }; 
    
    saveUserProfile(updatedProfile, true); 
    
    if (!profile.isGuest) {
         await syncLocalToCloud();
    }

    setProfile(updatedProfile);
    showAlert("Başarılı", "Profilin güncellendi!", "success");
    setIsEditing(false);
    setIsSaving(false);
    
    if (onProfileUpdate) {
        onProfileUpdate();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleGradeChange = (value: string) => {
      setProfile(prev => ({ ...prev, grade: value }));
  };

  const handleDeleteAccount = () => {
      showAlert("Hesap Silinecek", "Hesabını kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz.", "warning", async () => {
          setIsSaving(true);
          try {
              await deleteAccount();
          } catch (e) {
              showAlert("Hata", "Hesap silinirken bir hata oluştu.", "error");
              setIsSaving(false);
          }
      });
  };
  
  const handleResetPassword = async () => {
      if (currentUser?.email) {
          try {
              await resetUserPassword(currentUser.email);
              showAlert("Başarılı", `Şifre sıfırlama bağlantısı ${currentUser.email} adresine gönderildi.`, "success");
          } catch (e) {
              showAlert("Hata", "E-posta gönderilemedi.", "error");
          }
      }
  };

  const handleGuestSignup = () => {
      if (onLoginRequest) onLoginRequest('register');
  };

  const handleAddFriend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;
      if (!friendCode.trim()) return;
      if (friendCode.trim().length !== 6) {
           showAlert("Hata", "Arkadaş kodu 6 haneli olmalıdır.", "error");
           return;
      }

      setAddingFriend(true);
      try {
          const friendName = await addFriend(currentUser.id, friendCode.trim().toUpperCase());
          showAlert("Başarılı", `${friendName} arkadaş olarak eklendi!`, "success");
          setFriendCode('');
          fetchFriends(currentUser.id);
      } catch (err: any) {
          showAlert("Hata", err.message || "Arkadaş eklenemedi.", "error");
      } finally {
          setAddingFriend(false);
      }
  };
  
  const copyFriendCode = () => {
      if (profile.friendCode) {
          navigator.clipboard.writeText(profile.friendCode);
          showAlert("Kopyalandı", "Arkadaş kodun kopyalandı.", "success");
      }
  };
  
  const avatarData = AVATARS.find(a => a.icon === profile.avatar);
  const frameDef = FRAMES.find(f => f.id === profile.frame) || FRAMES[0];
  const backgroundDef = BACKGROUNDS.find(b => b.id === profile.background) || BACKGROUNDS[0];
  
  const unlockedBadges = useMemo(() => {
      if (!stats?.badges) return [];
      const reversedIds = [...stats.badges].reverse();
      return reversedIds
        .map(id => BADGES.find(b => b.id === id))
        .filter((b): b is Badge => b !== undefined);
  }, [stats?.badges, BADGES]);

  const completedQuestsCount = dailyQuests.filter(q => q.isCompleted).length;

  const onAuthSuccess = () => {
      const userProfile = getUserProfile();
      setProfile(userProfile);
      if (onProfileUpdate) onProfileUpdate();
      setShowAuthModal(false);
      getAuthInstance().currentUser.then(user => {
          if (!userProfile.isGuest && user) {
              fetchFriends(user.id);
          }
      });
  };

  return (
    <>
    {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={onAuthSuccess} />}
    
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      
      {/* HEADER SECTION */}
      <div 
        className="mb-6 rounded-[2rem] p-5 shadow-xl border relative overflow-hidden"
        style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}
      >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)'}}></div>

          <button 
                onClick={() => setIsEditing(true)} 
                className="absolute top-4 right-4 z-20 p-2 rounded-xl transition-colors"
                style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'}}
            >
                <Edit2 size={16} />
            </button>

          <div className="flex items-center gap-5 relative z-10">
              {/* Avatar */}
              <button onClick={() => setShowAvatarModal(true)} className="relative shrink-0 group">
                 <div className="w-24 h-24 rounded-full relative z-10 flex items-center justify-center">
                    {/* Frame & Background Layers */}
                    <div className={`absolute inset-0 w-full h-full rounded-full z-30 pointer-events-none ${frameDef.style}`}></div>
                    <div className={`absolute inset-0 w-full h-full rounded-full z-10 ${backgroundDef.style} border-4`} style={{borderColor: 'var(--color-bg-card)'}}></div>
                    
                    {/* Avatar Image/Icon */}
                    <div className="w-full h-full rounded-full flex items-center justify-center text-5xl overflow-hidden relative z-20 bg-transparent">
                        {avatarData?.image && !avatarLoadError ? (
                             <img src={avatarData.image} alt={avatarData.name} className="w-full h-full object-cover scale-[1.01]" onError={() => setAvatarLoadError(true)} />
                        ) : (
                            profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:') || profile.avatar.startsWith('/')) && !avatarLoadError ? (
                                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover scale-[1.01]" onError={() => setAvatarLoadError(true)} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-transparent">
                                    <span className="filter drop-shadow-md transform transition-transform group-hover:scale-110 leading-none">
                                        {avatarData?.icon || profile.avatar || <User size={40} />}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                 </div>
              </button>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-black truncate mb-1" style={{color: 'var(--color-text-main)'}}>{profile.name || 'Öğrenci'}</h2>
                  
                  <div className="flex items-center gap-2 mb-2">
                       <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1" style={{backgroundColor: 'var(--color-primary)'}}>
                           <Star size={10} className="fill-current" /> LVL {stats?.level || 1}
                       </span>
                       <span className="text-xs font-medium" style={{color: 'var(--color-text-muted)'}}>
                           {profile.grade ? (['A1','A2','B1','B2','C1'].includes(profile.grade) ? `${profile.grade} Seviye` : `${profile.grade}. Sınıf`) : 'Sınıf Yok'}
                       </span>
                  </div>

                  {profile.isGuest ? (
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1">
                               <Ghost size={12} /> Misafir
                           </span>
                           <button onClick={handleGuestSignup} className="text-[10px] font-bold hover:underline flex items-center gap-1" style={{color: 'var(--color-primary)'}}>
                              • Giriş Yap
                           </button>
                       </div>
                   ) : (
                       <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                               <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                           </span>
                           <button onClick={logoutUser} className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline ml-1">
                              Çıkış
                           </button>
                       </div>
                   )}
              </div>
          </div>
      </div>

      {/* STATS ROW (3 Cards) */}
      <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-2xl border flex flex-col items-center justify-center text-center shadow-lg" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
              <Flame size={24} className="text-orange-500 mb-1 fill-orange-500" />
              <div className="text-lg font-black leading-none" style={{color: 'var(--color-text-main)'}}>{stats?.streak || 0}</div>
              <div className="text-[10px] font-bold uppercase mt-1" style={{color: 'var(--color-text-muted)'}}>GÜN SERİ</div>
          </div>
          <div className="p-3 rounded-2xl border flex flex-col items-center justify-center text-center shadow-lg" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
              <Trophy size={24} className="mb-1 fill-current" style={{color: 'var(--color-primary)'}} />
              <div className="text-lg font-black leading-none" style={{color: 'var(--color-text-main)'}}>{stats?.xp || 0}</div>
              <div className="text-[10px] font-bold uppercase mt-1" style={{color: 'var(--color-text-muted)'}}>TOPLAM XP</div>
          </div>
          <div className="p-3 rounded-2xl border flex flex-col items-center justify-center text-center shadow-lg" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
              <Star size={24} className="text-yellow-500 mb-1 fill-yellow-500" />
              <div className="text-lg font-black leading-none" style={{color: 'var(--color-text-main)'}}>{unlockedBadges.length}</div>
              <div className="text-[10px] font-bold uppercase mt-1" style={{color: 'var(--color-text-muted)'}}>ROZET</div>
          </div>
      </div>

      {/* Detailed Stats Button */}
      <button 
        onClick={() => setShowStatsModal(true)} 
        className="w-full mb-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border"
        style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)'}}
      >
        <BarChart2 size={16} /> Detaylı İstatistikler
      </button>

      {/* LARGE FEATURE CARDS */}
      <div className="space-y-4 mb-8">
          {/* Market Card */}
          <button 
            id="market-button"
            onClick={onOpenMarket}
            className="w-full h-24 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-5 shadow-lg relative overflow-hidden active:scale-[0.98] transition-transform group text-left flex items-center justify-between"
          >
              <div className="z-10">
                  <div className="text-[10px] font-bold text-amber-100 uppercase tracking-wider mb-0.5 flex items-center gap-1"><ShoppingBag size={10}/> MAĞAZA</div>
                  <div className="text-2xl font-black text-white mb-0.5">Kozmetikler</div>
                  <div className="text-xs text-amber-100/90 font-medium">Temalar, çerçeveler ve arka planlar</div>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <Star size={20} className="text-white fill-white" />
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          </button>

          {/* Leaderboard Card */}
          <button 
            onClick={() => setShowLeaderboard(true)}
            className="w-full h-20 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-5 shadow-lg relative overflow-hidden active:scale-[0.98] transition-transform group text-left flex items-center justify-between border-t border-white/10"
          >
               <div className="z-10 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                       <Trophy size={20} />
                   </div>
                   <div>
                       <div className="text-lg font-black text-white">Lider Tablosu</div>
                       <div className="text-xs text-indigo-100 font-medium">Sıralamanı gör</div>
                   </div>
               </div>
               <ChevronRight className="text-white/70 group-hover:translate-x-1 transition-transform" />
          </button>
      </div>

      {/* ACCORDION SECTIONS */}
      <div className="space-y-3">
          {/* Daily Quests */}
          {dailyQuests.length > 0 && (
            <div className="rounded-2xl border overflow-hidden" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                <button 
                    onClick={() => setIsQuestsOpen(!isQuestsOpen)}
                    className="w-full p-4 flex items-center justify-between group hover:opacity-80 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)'}}><Target size={18} /></div>
                        <div className="text-left">
                            <h3 className="text-sm font-bold uppercase tracking-wide" style={{color: 'var(--color-text-main)'}}>GÜNLÜK GÖREVLER</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'}}>{completedQuestsCount}/{dailyQuests.length}</span>
                        {isQuestsOpen ? <ChevronUp size={16} style={{color: 'var(--color-text-muted)'}} /> : <ChevronDown size={16} style={{color: 'var(--color-text-muted)'}} />}
                    </div>
                </button>
                
                {isQuestsOpen && (
                    <div className="p-4 pt-0 border-t animate-in slide-in-from-top-2" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-main)'}}>
                        <div className="space-y-2 pt-3">
                            {dailyQuests.map((quest) => (
                                <div key={quest.id} className="flex items-center justify-between p-3 rounded-xl border" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${quest.isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                            {quest.isCompleted ? <CheckCircle size={14} /> : quest.current}
                                        </div>
                                        <div className={`text-xs font-medium truncate ${quest.isCompleted ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                                            {quest.description}
                                        </div>
                                    </div>
                                    <div className={`text-[10px] font-bold ml-2 ${quest.isCompleted ? 'text-green-500' : 'text-orange-500'}`}>
                                        {quest.isCompleted ? 'Tamamlandı' : `+${quest.rewardXP} XP`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* Achievements */}
          <div className="rounded-2xl border overflow-hidden" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                <button 
                    onClick={() => setIsAchievementsOpen(!isAchievementsOpen)}
                    className="w-full p-4 flex items-center justify-between group hover:opacity-80 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg"><ShieldCheck size={18} /></div>
                        <h3 className="text-sm font-bold uppercase tracking-wide" style={{color: 'var(--color-text-main)'}}>BAŞARIMLARIM</h3>
                    </div>
                    <div className="flex items-center gap-3">
                         <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'}}>{unlockedBadges.length}</span>
                        {isAchievementsOpen ? <ChevronUp size={16} style={{color: 'var(--color-text-muted)'}} /> : <ChevronDown size={16} style={{color: 'var(--color-text-muted)'}} />}
                    </div>
                </button>

                {isAchievementsOpen && (
                    <div className="p-4 pt-0 border-t animate-in slide-in-from-top-2" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-main)'}}>
                            {unlockedBadges.length > 0 ? (
                            <div className="grid grid-cols-5 gap-2 pt-3">
                                {unlockedBadges.map((badge, index) => (
                                    <div 
                                        key={badge.id} 
                                        className="relative group flex justify-center"
                                        onClick={() => setTooltipBadgeId(tooltipBadgeId === badge.id ? null : badge.id)}
                                    >
                                        <div className="w-10 h-10 rounded-xl border flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer hover:border-yellow-500 overflow-hidden" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                                            {badge.image ? (
                                                <img src={badge.image} alt={badge.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="flex items-center justify-center w-full h-full leading-none">{badge.icon}</span>
                                            )}
                                        </div>
                                        {/* Tooltip */}
                                        {tooltipBadgeId === badge.id && (
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
                                                {badge.name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs italic py-4 text-center" style={{color: 'var(--color-text-muted)'}}>Henüz hiç rozet kazanılmadı.</div>
                        )}
                    </div>
                )}
          </div>

          {/* Friends */}
          {!profile.isGuest && (
             <div className="rounded-2xl border overflow-hidden" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                <button 
                    onClick={() => setIsFriendsOpen(!isFriendsOpen)}
                    className="w-full p-4 flex items-center justify-between group hover:opacity-80 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Users size={18} /></div>
                        <h3 className="text-sm font-bold uppercase tracking-wide" style={{color: 'var(--color-text-main)'}}>ARKADAŞLARIM</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'}}>{friendsList.length}</span>
                        {isFriendsOpen ? <ChevronUp size={16} style={{color: 'var(--color-text-muted)'}} /> : <ChevronDown size={16} style={{color: 'var(--color-text-muted)'}} />}
                    </div>
                </button>

                {isFriendsOpen && (
                    <div className="p-4 pt-0 border-t animate-in slide-in-from-top-2" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-main)'}}>
                        {/* Add Friend Form */}
                        <form onSubmit={handleAddFriend} className="flex gap-2 mt-4 mb-4">
                            <input 
                                type="text" 
                                value={friendCode}
                                onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                                placeholder="Arkadaş Kodu (Örn: A1B2C3)"
                                className="flex-1 p-2.5 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-bold"
                                style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-main)'}}
                                maxLength={6}
                            />
                            <button 
                                type="submit"
                                disabled={addingFriend || !friendCode}
                                className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center min-w-[40px]"
                            >
                                {addingFriend ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <UserPlus size={16} />}
                            </button>
                        </form>
                        
                        {/* My Friend Code */}
                        <div className="flex items-center justify-between p-3 rounded-xl border mb-4 shadow-sm" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold uppercase tracking-wide" style={{color: 'var(--color-text-muted)'}}>Senin Kodun</span>
                                <span className="text-sm font-mono font-black tracking-widest text-indigo-400 select-all">{profile.friendCode || '------'}</span>
                            </div>
                            <button onClick={copyFriendCode} className="p-2 rounded-lg transition-colors" style={{color: 'var(--color-text-muted)'}} title="Kodu Kopyala">
                                <Copy size={16} />
                            </button>
                        </div>

                        {/* Friends List */}
                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                            {friendsLoading ? (
                                <div className="text-center py-4 text-xs" style={{color: 'var(--color-text-muted)'}}>Yükleniyor...</div>
                            ) : friendsList.length > 0 ? (
                                friendsList.map((friend) => {
                                    const fAvatar = AVATARS.find(a => a.icon === friend.avatar) || AVATARS[0];
                                    const fFrame = FRAMES.find(f => f.id === friend.frame) || FRAMES[0];
                                    const fBg = BACKGROUNDS.find(b => b.id === friend.background) || BACKGROUNDS[0];
                                    
                                    return (
                                        <div key={friend.uid} className="flex items-center justify-between p-2 rounded-xl border shadow-sm transition-all" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="relative w-10 h-10 shrink-0">
                                                    <div className={`absolute inset-0 w-full h-full rounded-full z-30 pointer-events-none ${fFrame.style} scale-90`}></div>
                                                    <div className={`absolute inset-0 w-full h-full rounded-full z-10 ${fBg.style} scale-90`}></div>
                                                    <div className="w-full h-full rounded-full overflow-hidden relative z-20 flex items-center justify-center text-lg bg-transparent scale-90">
                                                        {fAvatar.image ? <img src={fAvatar.image} className="w-full h-full object-cover" /> : <span>{fAvatar.icon}</span>}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold truncate" style={{color: 'var(--color-text-main)'}}>{friend.name}</div>
                                                    <div className="text-[9px] truncate" style={{color: 'var(--color-text-muted)'}}>Lvl {friend.level}</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => onViewProfile(friend.uid)}
                                                className="text-[10px] font-bold text-indigo-400 hover:underline px-2 shrink-0"
                                            >
                                                Profil
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-4 text-xs" style={{color: 'var(--color-text-muted)'}}>Henüz arkadaş eklemedin.</div>
                            )}
                        </div>
                    </div>
                )}
             </div>
          )}

      </div>

      {/* Edit Mode Form (Overlay Modal) */}
      {isEditing && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div 
                className="w-full max-w-sm p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95"
                style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}
             >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black" style={{color: 'var(--color-text-main)'}}>Profili Düzenle</h3>
                    <button onClick={() => setIsEditing(false)} className="p-1 rounded-full hover:bg-black/10 transition-colors" style={{color: 'var(--color-text-muted)'}}>
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase ml-1 mb-1 block" style={{color: 'var(--color-text-muted)'}}>İsim</label>
                        <input 
                            type="text" 
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            style={{backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-border)', color: 'var(--color-text-main)'}}
                        />
                    </div>
                    
                    <div>
                        <CustomSelect 
                            options={gradeOptions}
                            value={profile.grade}
                            onChange={handleGradeChange}
                            label="Sınıf / Seviye"
                            icon={<GraduationCap size={18} />}
                        />
                    </div>
                </div>
                
                <div className="w-full mt-6 pt-4 border-t space-y-3 pb-2" style={{borderColor: 'var(--color-border)'}}>
                        <h4 className="text-xs font-bold uppercase mb-2 text-center" style={{color: 'var(--color-text-muted)'}}>Hesap İşlemleri</h4>
                        {currentUser && (
                            <button onClick={handleResetPassword} className="w-full py-3 border rounded-xl font-bold text-xs hover:opacity-80 transition-colors flex items-center justify-center gap-2" style={{backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)'}}>
                                <KeyRound size={14} /> Şifre Sıfırla
                            </button>
                        )}
                        <button onClick={handleDeleteAccount} className="w-full py-3 bg-red-900/10 border border-red-900/30 text-red-500 rounded-xl font-bold text-xs hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
                            <Trash2 size={14} /> Hesabı Sil
                        </button>
                </div>
                
                <div className="flex gap-3 w-full pt-4">
                        <button 
                            onClick={() => setIsEditing(false)}
                            disabled={isSaving}
                            className="flex-1 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98]"
                            style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'}}
                        >
                            İptal
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-900/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isSaving ? '...' : <><Save size={18} /> Kaydet</>}
                        </button>
                </div>
             </div>
         </div>
      )}

      {showStatsModal && <StatsModal onClose={() => setShowStatsModal(false)} currentGrade={profile.grade as any} />}
      {showAvatarModal && <AvatarModal onClose={() => setShowAvatarModal(false)} userStats={stats!} onUpdate={() => { setProfile(getUserProfile()); if(onProfileUpdate) onProfileUpdate(); }} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} currentUserXP={stats?.xp || 0} currentUserGrade={profile.grade} />}
    </div>
    </>
  );
};

export default Profile;
