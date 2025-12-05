
import React, { useState, useEffect } from 'react';
import { X, Zap, Trophy, Unlock, Trash2, ShieldAlert, Search, User, Award, Megaphone, Users, Calendar, Save, Lock, Gift, Settings, Activity, Menu, Clock, CheckCircle, Eye, Target, Edit2, Info } from 'lucide-react';
import { adminAddXP, adminSetLevel, adminUnlockAllItems, adminResetDailyQuests, adminUnlockAllBadges, adminUnlockAllAvatars, getUserStats } from '../services/userService';
import { playSound } from '../services/soundService';
import { createTournament, updateTournament, searchUser, adminGiveXP, toggleAdminStatus, createGlobalAnnouncement, getTournaments, deleteTournament, updateTournamentStatus, checkTournamentTimeouts } from '../services/firebase';
import { UNIT_ASSETS } from '../data/assets';
import { GradeLevel, QuizDifficulty, Tournament } from '../types';

interface AdminModalProps {
  onClose: () => void;
  onUpdate: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tournaments' | 'users' | 'system'>('dashboard');
  const [currentStats, setCurrentStats] = useState(getUserStats());
  
  // Tournament State
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tId, setTId] = useState<string | null>(null); // For editing
  const [tName, setTName] = useState('');
  const [tGrade, setTGrade] = useState<GradeLevel>('5');
  const [tUnit, setTUnit] = useState<string>('');
  const [tRegStartDate, setTRegStartDate] = useState('');
  const [tRegEndDate, setTRegEndDate] = useState('');
  const [tStartDate, setTStartDate] = useState('');
  const [tEndDate, setTEndDate] = useState('');
  const [tMaxParticipants, setTMaxParticipants] = useState<number>(32);
  const [tQuestionCount, setTQuestionCount] = useState<number>(15);
  const [tDifficulty, setTDifficulty] = useState<QuizDifficulty>('normal');
  const [tMinLevel, setTMinLevel] = useState<number>(1);
  const [tRoundDuration, setTRoundDuration] = useState<number>(30); // Default 30 mins
  // Rewards
  const [tReward1, setTReward1] = useState<number>(1000);
  const [tReward2, setTReward2] = useState<number>(500);
  const [tReward3, setTReward3] = useState<number>(250);
  const [tRewardPart, setTRewardPart] = useState<number>(50);

  const [creatingT, setCreatingT] = useState(false);
  const [showTournamentList, setShowTournamentList] = useState(true);

  // User Management State
  const [searchQuery, setSearchQuery] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false); 

  // Announcement State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  
  // Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
      if (activeTab === 'tournaments') loadTournaments();
  }, [activeTab]);

  const refresh = () => {
    setCurrentStats(getUserStats());
    onUpdate();
  };

  const loadTournaments = async () => {
      const list = await getTournaments();
      setTournaments(list);
  };
  
  const resetTournamentForm = () => {
      setTId(null);
      setTName('');
      setTGrade('5');
      setTUnit('');
      setTRegStartDate('');
      setTRegEndDate('');
      setTStartDate('');
      setTEndDate('');
      setTMaxParticipants(32);
      setTQuestionCount(15);
      setTDifficulty('normal');
      setTMinLevel(1);
      setTRoundDuration(30);
      setTReward1(1000);
      setTReward2(500);
      setTReward3(250);
      setTRewardPart(50);
  };

  const handleEditTournament = (t: Tournament) => {
      setTId(t.id);
      setTName(t.title);
      setTGrade(t.grade as GradeLevel);
      setTUnit(t.unitId);
      
      // Helper to format date for input type="datetime-local"
      const toInputString = (ts: number) => {
          if (!ts) return '';
          const d = new Date(ts);
          // Adjust for timezone offset to show correct local time in input
          const localD = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
          return localD.toISOString().slice(0, 16);
      };

      setTRegStartDate(toInputString(t.registrationStartDate || Date.now()));
      setTRegEndDate(toInputString(t.registrationEndDate));
      setTStartDate(toInputString(t.startDate));
      setTEndDate(toInputString(t.endDate));
      
      setTMaxParticipants(t.maxParticipants);
      setTQuestionCount(t.config.wordCount);
      setTDifficulty(t.config.difficulty);
      setTMinLevel(t.minLevel || 1);
      setTRoundDuration(t.roundDuration || 30);
      setTReward1(t.rewards.firstPlace);
      setTReward2(t.rewards.secondPlace);
      setTReward3(t.rewards.thirdPlace);
      setTRewardPart(t.rewards.participation);
      
      setShowTournamentList(false);
  };

  const handleSaveTournament = async () => {
      if (!tName || !tUnit || !tStartDate || !tEndDate || !tRegEndDate || !tRegStartDate) {
          alert("Lütfen tüm alanları doldur.");
          return;
      }
      
      const regStart = new Date(tRegStartDate).getTime();
      const regEnd = new Date(tRegEndDate).getTime();
      const start = new Date(tStartDate).getTime();
      const end = new Date(tEndDate).getTime();
      
      if (regEnd <= regStart) {
          alert("Kayıt bitiş tarihi, başlangıç tarihinden sonra olmalıdır.");
          return;
      }

      if (start <= regEnd) {
           alert("Turnuva başlangıcı, kayıt bitişinden sonra olmalıdır.");
           return;
      }

      if (end <= start) {
          alert("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");
          return;
      }

      setCreatingT(true);
      try {
          const unitDef = UNIT_ASSETS[tGrade]?.find(u => u.id === tUnit);
          const data = {
              title: tName,
              grade: tGrade,
              unitId: tUnit,
              unitName: unitDef?.title || 'Bilinmeyen Ünite',
              registrationStartDate: regStart,
              registrationEndDate: regEnd,
              startDate: start,
              endDate: end,
              maxParticipants: tMaxParticipants,
              minLevel: tMinLevel,
              roundDuration: tRoundDuration,
              rewards: {
                  firstPlace: tReward1,
                  secondPlace: tReward2,
                  thirdPlace: tReward3,
                  participation: tRewardPart
              },
              config: { 
                  difficulty: tDifficulty, 
                  wordCount: tQuestionCount 
              }
          };

          if (tId) {
              await updateTournament(tId, data);
              alert("Turnuva Güncellendi!");
          } else {
              await createTournament(data);
              alert("Turnuva Oluşturuldu!");
          }
          
          resetTournamentForm();
          loadTournaments();
          setShowTournamentList(true);
      } catch (e) {
          console.error(e);
          alert("Hata oluştu.");
      } finally {
          setCreatingT(false);
      }
  };

  const handleDeleteTournament = async (id: string) => {
      if (confirm("Bu turnuvayı silmek istediğine emin misin?")) {
          // Optimistic update
          setTournaments(prev => prev.filter(t => t.id !== id));
          try {
              await deleteTournament(id);
              // No alert needed if successful, UI already updated
          } catch (e) {
              alert("Silinirken hata oluştu.");
              loadTournaments(); // Revert
          }
      }
  };

  const handleCheckTimeouts = async (id: string) => {
      try {
          const didUpdate = await checkTournamentTimeouts(id);
          if (didUpdate) {
              alert("Süresi dolan maçlar güncellendi ve tur atlatıldı.");
              loadTournaments();
          } else {
              alert("İşlem yapılacak maç bulunamadı veya süreleri henüz dolmamış.");
          }
      } catch (e) {
          console.error(e);
          alert("Kontrol sırasında hata oluştu.");
      }
  };
  
  const handleSearchUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery) return;
      
      setUserActionLoading(true);
      setShowUserDetails(false);
      try {
          const user = await searchUser(searchQuery);
          if (user) {
              setFoundUser(user);
          } else {
              alert("Kullanıcı bulunamadı.");
              setFoundUser(null);
          }
      } catch (e) {
          alert("Hata oluştu.");
      } finally {
          setUserActionLoading(false);
      }
  };

  const handleGiveUserXP = async (amount: number) => {
      if (!foundUser) return;
      try {
          await adminGiveXP(foundUser.uid, amount);
          alert(`${foundUser.leaderboardData.name} kullanıcısına ${amount} XP verildi.`);
          const updatedUser = await searchUser(foundUser.email); 
          if (updatedUser) setFoundUser(updatedUser);
      } catch (e) { alert("Hata"); }
  };

  const handleToggleAdmin = async () => {
      if (!foundUser) return;
      try {
          const newStatus = !foundUser.profile.isAdmin;
          await toggleAdminStatus(foundUser.uid, newStatus);
          setFoundUser({ ...foundUser, profile: { ...foundUser.profile, isAdmin: newStatus } });
          alert(`Yönetici yetkisi ${newStatus ? 'verildi' : 'alındı'}.`);
      } catch (e) { alert("Hata"); }
  };

  const handleSendAnnouncement = async () => {
      if (!annTitle || !annContent) return;
      try {
          await createGlobalAnnouncement(annTitle, annContent);
          alert("Duyuru gönderildi.");
          setAnnTitle('');
          setAnnContent('');
      } catch (e) { alert("Hata"); }
  };
  
  // --- Cheat Handlers ---
  const handleAddXP = (amount: number) => { adminAddXP(amount); playSound('success'); refresh(); };
  const handleSetLevel = (level: number) => { adminSetLevel(level); playSound('success'); refresh(); };
  const handleUnlockAll = () => { adminUnlockAllItems(); playSound('success'); alert("XP eklendi."); refresh(); };
  const handleUnlockBadges = () => { adminUnlockAllBadges(); playSound('success'); alert("Rozetler Açıldı!"); refresh(); };
  const handleUnlockAvatars = () => { adminUnlockAllAvatars(); playSound('success'); alert("Avatarlar Açıldı!"); refresh(); };
  const handleResetQuests = () => { adminResetDailyQuests(); playSound('click'); alert("Görevler sıfırlandı."); refresh(); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-200">
      <div className="w-full md:max-w-5xl h-full md:h-[90vh] bg-slate-900 text-white md:rounded-3xl shadow-2xl border-none md:border border-slate-700 flex flex-col md:flex-row overflow-hidden">
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-2 font-black text-red-500">
                 <ShieldAlert size={20} className="fill-current" /> ADMIN
             </div>
             <div className="flex items-center gap-3">
                 <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400">
                     <Menu size={24} />
                 </button>
                 <button onClick={onClose} className="p-2 text-slate-400">
                     <X size={24} />
                 </button>
             </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-800 z-50 p-2 flex flex-col gap-1 shadow-2xl">
                 <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`p-3 rounded-lg font-bold flex items-center gap-3 ${activeTab === 'dashboard' ? 'bg-red-600 text-white' : 'text-slate-400'}`}>
                     <Zap size={20} /> Dashboard
                 </button>
                 <button onClick={() => { setActiveTab('tournaments'); setIsMobileMenuOpen(false); }} className={`p-3 rounded-lg font-bold flex items-center gap-3 ${activeTab === 'tournaments' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                     <Trophy size={20} /> Turnuvalar
                 </button>
                 <button onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} className={`p-3 rounded-lg font-bold flex items-center gap-3 ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                     <Users size={20} /> Kullanıcılar
                 </button>
                 <button onClick={() => { setActiveTab('system'); setIsMobileMenuOpen(false); }} className={`p-3 rounded-lg font-bold flex items-center gap-3 ${activeTab === 'system' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>
                     <Settings size={20} /> Sistem
                 </button>
            </div>
        )}

        {/* Desktop Sidebar */}
        <div className="w-64 bg-slate-950 border-r border-slate-800 p-6 hidden md:flex flex-col shrink-0">
             <div className="flex items-center gap-2 font-black text-xl text-red-500 mb-8 tracking-tight">
                 <ShieldAlert className="fill-current" /> ADMIN PANEL
             </div>
             
             <nav className="space-y-2 flex-1">
                 <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-slate-400 hover:bg-slate-900'}`}>
                     <Zap size={20} /> Dashboard
                 </button>
                 <button onClick={() => setActiveTab('tournaments')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'tournaments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-900'}`}>
                     <Trophy size={20} /> Turnuvalar
                 </button>
                 <button onClick={() => setActiveTab('users')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-900'}`}>
                     <Users size={20} /> Kullanıcılar
                 </button>
                 <button onClick={() => setActiveTab('system')} className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'system' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'text-slate-400 hover:bg-slate-900'}`}>
                     <Settings size={20} /> Sistem
                 </button>
             </nav>
             
             <button onClick={onClose} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 flex items-center gap-2 justify-center transition-colors">
                 <X size={18} /> Paneli Kapat
             </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900 relative custom-scrollbar">
            
            {/* DASHBOARD (Cheats & My Stats) */}
            {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl md:text-3xl font-black mb-6 flex items-center gap-3">
                        <Activity className="text-red-500" /> Hızlı İşlemler
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                         <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
                             <div className="text-xs font-bold text-green-400 uppercase mb-4 tracking-wider flex items-center gap-2"><Gift size={14}/> Kendine XP Ekle</div>
                             <div className="flex gap-3">
                                 <button onClick={() => handleAddXP(1000)} className="flex-1 bg-slate-700 hover:bg-green-600 py-3 rounded-xl font-black text-sm transition-all active:scale-95 border border-slate-600 hover:border-green-500">+1K</button>
                                 <button onClick={() => handleAddXP(5000)} className="flex-1 bg-slate-700 hover:bg-green-600 py-3 rounded-xl font-black text-sm transition-all active:scale-95 border border-slate-600 hover:border-green-500">+5K</button>
                             </div>
                         </div>

                         <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
                             <div className="text-xs font-bold text-blue-400 uppercase mb-4 tracking-wider flex items-center gap-2"><Award size={14}/> Seviye Ata</div>
                             <div className="flex gap-3">
                                 <button onClick={() => handleSetLevel(10)} className="flex-1 bg-slate-700 hover:bg-blue-600 py-3 rounded-xl font-black text-sm transition-all active:scale-95 border border-slate-600 hover:border-blue-500">Lvl 10</button>
                                 <button onClick={() => handleSetLevel(50)} className="flex-1 bg-slate-700 hover:bg-blue-600 py-3 rounded-xl font-black text-sm transition-all active:scale-95 border border-slate-600 hover:border-blue-500">Lvl 50</button>
                             </div>
                         </div>

                         <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
                             <div className="text-xs font-bold text-yellow-400 uppercase mb-4 tracking-wider flex items-center gap-2"><Unlock size={14}/> Kilitleri Aç</div>
                             <div className="flex gap-3">
                                 <button onClick={handleUnlockBadges} className="flex-1 bg-slate-700 hover:bg-yellow-600 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 border border-slate-600 hover:border-yellow-500 flex flex-col items-center gap-1">
                                     <Award size={18} /> Rozetler
                                 </button>
                                 <button onClick={handleUnlockAvatars} className="flex-1 bg-slate-700 hover:bg-purple-600 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 border border-slate-600 hover:border-purple-500 flex flex-col items-center gap-1">
                                     <User size={18} /> Avatarlar
                                 </button>
                             </div>
                         </div>
                    </div>
                </div>
            )}

            {/* TOURNAMENTS TAB */}
            {activeTab === 'tournaments' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl md:text-3xl font-black">Turnuvalar</h2>
                        <button onClick={() => { resetTournamentForm(); setShowTournamentList(!showTournamentList); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors">
                            {showTournamentList ? 'Yeni Oluştur' : 'Listeye Dön'}
                        </button>
                    </div>
                    
                    {showTournamentList ? (
                        // LIST VIEW (Grid for Mobile Optimization)
                        <div className="grid grid-cols-1 gap-4">
                            {tournaments.map(t => {
                                const now = Date.now();
                                const regStart = t.registrationStartDate || 0;
                                // Check display status
                                let displayStatus = t.status.toUpperCase();
                                let statusColor = 'bg-slate-700 text-slate-400';

                                if (t.status === 'active') {
                                    displayStatus = 'DEVAM EDİYOR';
                                    statusColor = 'bg-blue-900 text-blue-400';
                                } else if (t.status === 'registration') {
                                    if (now < regStart) {
                                        displayStatus = 'KAYIT BEKLENİYOR';
                                        statusColor = 'bg-orange-900 text-orange-400';
                                    } else {
                                        displayStatus = 'KAYIT AÇIK';
                                        statusColor = 'bg-green-900 text-green-400';
                                    }
                                } else {
                                    displayStatus = 'TAMAMLANDI';
                                    statusColor = 'bg-slate-800 text-slate-500';
                                }

                                return (
                                <div key={t.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col gap-4 shadow-sm hover:border-slate-600 transition-colors">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-white">{t.title}</h3>
                                                <span className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold tracking-wide ${statusColor}`}>
                                                    {displayStatus}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                                                <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">{t.grade === 'GENERAL' ? 'Genel' : `${t.grade}. Sınıf`}</span>
                                                <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 truncate max-w-[150px]">{t.unitName}</span>
                                                <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center gap-1"><Users size={12}/> {t.participants.length}/{t.maxParticipants}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                            <div className="relative group flex-1 md:flex-none">
                                                <button onClick={() => handleCheckTimeouts(t.id)} className="w-full md:w-auto px-3 py-2 bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 rounded-lg text-xs font-bold border border-blue-800 flex items-center justify-center gap-1">
                                                    <Clock size={14}/> Süre Kontrol
                                                </button>
                                            </div>
                                            
                                            <button onClick={() => handleEditTournament(t)} className="flex-1 md:flex-none px-3 py-2 bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50 rounded-lg text-xs font-bold border border-yellow-800 flex items-center justify-center">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteTournament(t.id)} className="flex-1 md:flex-none px-3 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg text-xs font-bold border border-red-800 flex items-center justify-center">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded-lg">
                                        <div>
                                            <span className="block font-bold text-slate-400">Kayıt:</span>
                                            {new Date(t.registrationStartDate || Date.now()).toLocaleDateString()} - {new Date(t.registrationEndDate).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <span className="block font-bold text-slate-400">Maçlar:</span>
                                            {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            )})}
                            {tournaments.length === 0 && <div className="text-center text-slate-500 py-10">Hiç turnuva yok.</div>}
                        </div>
                    ) : (
                        // CREATE FORM
                        <div className="bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl">
                            <h3 className="font-bold text-indigo-400 mb-6 flex items-center gap-2 text-lg">
                                <Trophy size={24} className="fill-indigo-500/20" /> {tId ? 'Turnuvayı Düzenle' : 'Yeni Turnuva Oluştur'}
                            </h3>
                            
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Turnuva Adı</label>
                                        <input 
                                            type="text" 
                                            value={tName} 
                                            onChange={(e) => setTName(e.target.value)}
                                            className="w-full p-4 bg-slate-900 border border-slate-600 rounded-2xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-600 font-medium"
                                            placeholder="Örn: Bahar Şampiyonası"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Sınıf</label>
                                            <select 
                                                value={tGrade} 
                                                onChange={(e) => { setTGrade(e.target.value as GradeLevel); setTUnit(''); }}
                                                className="w-full p-4 bg-slate-900 border border-slate-600 rounded-2xl text-sm outline-none font-medium appearance-none"
                                            >
                                                {Object.keys(UNIT_ASSETS).map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-[2]">
                                            <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Ünite</label>
                                            <select 
                                                value={tUnit} 
                                                onChange={(e) => setTUnit(e.target.value)}
                                                className="w-full p-4 bg-slate-900 border border-slate-600 rounded-2xl text-sm outline-none font-medium appearance-none"
                                            >
                                                <option value="">Seçiniz</option>
                                                {UNIT_ASSETS[tGrade]?.map(u => (
                                                    <option key={u.id} value={u.id}>{u.unitNo} - {u.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Kayıt Başlangıç</label>
                                        <input 
                                            type="datetime-local" 
                                            value={tRegStartDate}
                                            onChange={(e) => setTRegStartDate(e.target.value)}
                                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-xs outline-none font-mono text-slate-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Kayıt Bitiş</label>
                                        <input 
                                            type="datetime-local" 
                                            value={tRegEndDate}
                                            onChange={(e) => setTRegEndDate(e.target.value)}
                                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-xs outline-none font-mono text-slate-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Maç Başlangıç</label>
                                        <input 
                                            type="datetime-local" 
                                            value={tStartDate}
                                            onChange={(e) => setTStartDate(e.target.value)}
                                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-xs outline-none font-mono text-slate-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Maç Bitiş</label>
                                        <input 
                                            type="datetime-local" 
                                            value={tEndDate}
                                            onChange={(e) => setTEndDate(e.target.value)}
                                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-xs outline-none font-mono text-slate-300"
                                        />
                                    </div>
                                </div>

                                {/* Config */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Katılımcı</label>
                                        <select 
                                            value={tMaxParticipants}
                                            onChange={(e) => setTMaxParticipants(Number(e.target.value))}
                                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-sm outline-none font-medium appearance-none"
                                        >
                                            <option value="4">4 Kişi</option>
                                            <option value="8">8 Kişi</option>
                                            <option value="16">16 Kişi</option>
                                            <option value="32">32 Kişi</option>
                                            <option value="64">64 Kişi</option>
                                            <option value="128">128 Kişi</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Min. Seviye</label>
                                        <input 
                                            type="number"
                                            min="1" max="100"
                                            value={tMinLevel}
                                            onChange={(e) => setTMinLevel(Number(e.target.value))}
                                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-sm outline-none font-medium"
                                        />
                                    </div>
                                     <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Tur Süresi (DK)</label>
                                        <input 
                                            type="number"
                                            min="5" max="1440"
                                            value={tRoundDuration}
                                            onChange={(e) => setTRoundDuration(Number(e.target.value))}
                                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-sm outline-none font-medium"
                                            title="Her bir turun oynanması için verilen süre (Dakika)"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Soru Sayısı</label>
                                        <input 
                                            type="number"
                                            min="5" max="50"
                                            value={tQuestionCount}
                                            onChange={(e) => setTQuestionCount(Number(e.target.value))}
                                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-sm outline-none font-medium"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Zorluk</label>
                                        <select 
                                            value={tDifficulty}
                                            onChange={(e) => setTDifficulty(e.target.value as QuizDifficulty)}
                                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-sm outline-none font-medium appearance-none"
                                        >
                                            <option value="relaxed">Rahat</option>
                                            <option value="easy">Kolay</option>
                                            <option value="normal">Normal</option>
                                            <option value="hard">Zor</option>
                                            <option value="impossible">İmkansız</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Rewards */}
                                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
                                     <h4 className="text-xs font-bold text-yellow-500 uppercase mb-4 tracking-wider flex items-center gap-2"><Gift size={14}/> Ödüller (XP)</h4>
                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                         <div>
                                             <label className="text-[10px] text-slate-500 block mb-1">1.lik</label>
                                             <input type="number" value={tReward1} onChange={(e) => setTReward1(Number(e.target.value))} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-yellow-400 font-bold" />
                                         </div>
                                         <div>
                                             <label className="text-[10px] text-slate-500 block mb-1">2.lik</label>
                                             <input type="number" value={tReward2} onChange={(e) => setTReward2(Number(e.target.value))} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300 font-bold" />
                                         </div>
                                         <div>
                                             <label className="text-[10px] text-slate-500 block mb-1">3.lük</label>
                                             <input type="number" value={tReward3} onChange={(e) => setTReward3(Number(e.target.value))} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-orange-400 font-bold" />
                                         </div>
                                         <div>
                                             <label className="text-[10px] text-slate-500 block mb-1">Katılım</label>
                                             <input type="number" value={tRewardPart} onChange={(e) => setTRewardPart(Number(e.target.value))} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-blue-400 font-bold" />
                                         </div>
                                     </div>
                                </div>
                                
                                <div className="pt-4 border-t border-slate-700">
                                    <button 
                                        onClick={handleSaveTournament}
                                        disabled={creatingT}
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/50 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                                    >
                                        {creatingT ? (
                                            <>İşleniyor...</>
                                        ) : (
                                            <><Save size={24} /> {tId ? 'Güncelle' : 'Turnuvayı Yayınla'}</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl md:text-3xl font-black mb-6">Kullanıcı Yönetimi</h2>
                    
                    <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl min-h-[400px]">
                        <form onSubmit={handleSearchUser} className="flex gap-3 mb-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="E-posta, Kullanıcı Adı veya UID ile Ara..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-600 rounded-2xl text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600"
                                />
                            </div>
                            <button type="submit" className="px-8 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-white transition-colors shadow-lg shadow-blue-900/30">
                                Ara
                            </button>
                        </form>

                        {userActionLoading && (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                                <p>Kullanıcı aranıyor...</p>
                            </div>
                        )}
                        
                        {foundUser && (
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-600 animate-in fade-in zoom-in duration-300">
                                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-4xl border-2 border-slate-700">
                                            {foundUser.profile.avatar}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-white">{foundUser.profile.name}</h3>
                                            <p className="text-sm text-slate-400 font-mono mt-0.5 break-all">{foundUser.email}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-yellow-500 font-bold">Lvl {foundUser.stats?.level || 1}</span>
                                                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-blue-400 font-bold">{foundUser.stats?.xp || 0} XP</span>
                                                {foundUser.profile.isAdmin && <span className="text-[10px] bg-red-900/50 text-red-400 px-2 py-0.5 rounded border border-red-900 font-bold flex items-center gap-1"><ShieldAlert size={10}/> ADMIN</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowUserDetails(!showUserDetails)}
                                        className="w-full md:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
                                    >
                                        {showUserDetails ? 'Detayları Gizle' : 'Tüm İstatistikler'}
                                    </button>
                                </div>
                                
                                {showUserDetails && (
                                    <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                                <div className="text-slate-500 mb-1">Quiz Doğru/Yanlış</div>
                                                <div className="text-green-400 font-bold">{foundUser.stats?.quizCorrect} / <span className="text-red-400">{foundUser.stats?.quizWrong}</span></div>
                                            </div>
                                             <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                                <div className="text-slate-500 mb-1">Kart Bakma</div>
                                                <div className="text-blue-400 font-bold">{foundUser.stats?.flashcardsViewed}</div>
                                            </div>
                                            <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                                <div className="text-slate-500 mb-1">Hatasız Quiz</div>
                                                <div className="text-yellow-400 font-bold">{foundUser.stats?.perfectQuizzes}</div>
                                            </div>
                                            <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                                <div className="text-slate-500 mb-1">Toplam Süre</div>
                                                <div className="text-purple-400 font-bold">{Math.floor((foundUser.stats?.totalTimeSpent || 0) / 60)} Saat</div>
                                            </div>
                                            <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                                <div className="text-slate-500 mb-1">Eşleştirme Rekor</div>
                                                <div className="text-white font-bold">{foundUser.stats?.weekly?.matchingBestTime}</div>
                                            </div>
                                            <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                                <div className="text-slate-500 mb-1">Rozet Sayısı</div>
                                                <div className="text-white font-bold">{foundUser.stats?.badges?.length}</div>
                                            </div>
                                            <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                                <div className="text-slate-500 mb-1">Seri (Streak)</div>
                                                <div className="text-orange-500 font-bold">{foundUser.stats?.streak} Gün</div>
                                            </div>
                                            <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                                <div className="text-slate-500 mb-1">Son Giriş</div>
                                                <div className="text-slate-300">{new Date(foundUser.lastUpdated || 0).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button onClick={() => handleGiveUserXP(1000)} className="p-4 bg-slate-800 hover:bg-yellow-900/20 border border-slate-700 hover:border-yellow-500/50 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all group text-yellow-500">
                                        <Gift size={18} className="group-hover:scale-110 transition-transform" /> +1000 XP Hediye Et
                                    </button>
                                    <button onClick={handleToggleAdmin} className={`p-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all border group ${foundUser.profile.isAdmin ? 'bg-red-900/10 border-red-800 text-red-500 hover:bg-red-900/30' : 'bg-green-900/10 border-green-800 text-green-500 hover:bg-green-900/30'}`}>
                                        <Lock size={18} className="group-hover:scale-110 transition-transform" /> {foundUser.profile.isAdmin ? 'Yöneticiliği Al' : 'Yönetici Yap'}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {!foundUser && !userActionLoading && (
                            <div className="text-center py-12 text-slate-600 flex flex-col items-center">
                                <Search size={48} className="mb-4 opacity-20" />
                                <p>Kullanıcı bulmak için arama yapın.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SYSTEM TAB */}
            {activeTab === 'system' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl md:text-3xl font-black mb-6">Sistem Ayarları</h2>
                    
                    <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl mb-6">
                        <h3 className="font-bold text-orange-400 mb-6 flex items-center gap-2 text-lg"><Megaphone size={24} /> Genel Duyuru Gönder</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Başlık</label>
                                <input 
                                    type="text" 
                                    value={annTitle}
                                    onChange={(e) => setAnnTitle(e.target.value)}
                                    placeholder="Duyuru Başlığı"
                                    className="w-full p-4 bg-slate-900 border border-slate-600 rounded-2xl text-sm outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">İçerik</label>
                                <textarea 
                                    value={annContent}
                                    onChange={(e) => setAnnContent(e.target.value)}
                                    placeholder="Duyuru metni buraya..."
                                    className="w-full p-4 bg-slate-900 border border-slate-600 rounded-2xl text-sm outline-none h-32 resize-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                            <div className="pt-2">
                                <button onClick={handleSendAnnouncement} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-900/50 transition-all active:scale-95">
                                    Herkese Gönder
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
                         <h3 className="font-bold text-slate-300 mb-6 text-lg">Sıfırlama İşlemleri</h3>
                         <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-2xl">
                             <p className="text-xs text-red-400 mb-4 font-medium leading-relaxed">
                                 Dikkat: Bu işlem tüm kullanıcıların günlük görev ilerlemelerini sıfırlar. Genellikle gün sonunda otomatik yapılır ancak buradan manuel tetiklenebilir.
                             </p>
                             <button 
                                onClick={handleResetQuests}
                                className="w-full py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 hover:border-red-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <Trash2 size={18} /> Günlük Görevleri Sıfırla
                            </button>
                         </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default AdminModal;
