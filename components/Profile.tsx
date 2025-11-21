
import React, { useState, useEffect, useMemo } from 'react';
import { Save, BarChart3, Clock, Brain, BookOpen, CheckCircle, XCircle, Edit2, Award, Bookmark, Target, Flame, PieChart, Filter, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
import { getUserProfile, getUserStats, saveUserProfile, UserProfile as IUserProfile, UserStats, getMemorizedSet, getNextDailyGoal, resetProgressForWords, resetActivityStats } from '../services/userService';
import { VOCABULARY } from '../data/vocabulary';
import { UNIT_DATA, GradeLevel, UnitDef } from './TopicSelector';
import { WordCard } from '../types';

interface ProfileProps {
  onBack: () => void;
}

const getGradeVisuals = (grade: string) => {
  if (['2', '3', '4'].includes(grade)) {
    return { avatar: '🐼', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800', text: 'text-teal-600 dark:text-teal-400' };
  }
  if (['5', '6', '7', '8'].includes(grade)) {
    return { avatar: '🦊', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-600 dark:text-indigo-400' };
  }
  if (['9', '10', '11', '12'].includes(grade)) {
    return { avatar: '🦁', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-400' };
  }
  if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(grade)) {
    return { avatar: '🦉', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', border: 'border-fuchsia-200 dark:border-fuchsia-800', text: 'text-fuchsia-600 dark:text-fuchsia-400' };
  }
  return { avatar: '👤', bg: 'bg-slate-50 dark:bg-slate-900/50', border: 'border-slate-200 dark:border-slate-800', text: 'text-slate-600 dark:text-slate-400' };
};

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const [profile, setProfile] = useState<IUserProfile>({ name: '', age: '', grade: '', avatar: '👤' });
  const [stats, setStats] = useState<UserStats | null>(null);
  
  const [filterGrade, setFilterGrade] = useState<GradeLevel | 'ALL'>('ALL');
  const [filterUnit, setFilterUnit] = useState<string>('ALL');

  const [memorizedCount, setMemorizedCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  
  const [unitStats, setUnitStats] = useState<{unit: UnitDef, memorized: number, total: number, bookmarks: number}[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [resetGrade, setResetGrade] = useState<GradeLevel | ''>('');
  const [resetUnitId, setResetUnitId] = useState<string>('all');
  const [resetMessage, setResetMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const visuals = useMemo(() => getGradeVisuals(profile.grade), [profile.grade]);

  const calculateStats = () => {
    const rawMemorizedSet = getMemorizedSet();
    let rawBookmarksSet = new Set<string>();
    try {
      const storedBookmarks = localStorage.getItem('lgs_bookmarks');
      if (storedBookmarks) {
         rawBookmarksSet = new Set(JSON.parse(storedBookmarks));
      }
    } catch (e) {
      // ignore
    }

    let total = 0;
    let mem = 0;
    let book = 0;
    const newUnitStats: typeof unitStats = [];

    let unitsToProcess: { unit: UnitDef, grade: GradeLevel }[] = [];
    const allGradeLevels = ['A1','A2','B1','B2','C1','C2','12','11','10','9','8','7','6','5','4','3','2'] as GradeLevel[];

    if (filterGrade !== 'ALL') {
        const units = UNIT_DATA[filterGrade] || [];
        if (filterUnit !== 'ALL') {
            const specificUnit = units.find(u => u.id === filterUnit);
            if (specificUnit) unitsToProcess.push({ unit: specificUnit, grade: filterGrade });
        } else {
            units.forEach(u => unitsToProcess.push({ unit: u, grade: filterGrade }));
        }
    } else {
        allGradeLevels.forEach(g => {
            const units = UNIT_DATA[g] || [];
            units.forEach(u => unitsToProcess.push({ unit: u, grade: g }));
        });
    }

    unitsToProcess.forEach(({ unit }) => {
        if (VOCABULARY[unit.id] && !unit.id.endsWith('all') && unit.id !== 'uAll') {
            const list = VOCABULARY[unit.id];
            const unitTotal = list.length;
            // Check using unique keys: unitId|english
            const unitMem = list.filter(w => rawMemorizedSet.has(`${unit.id}|${w.english}`)).length;
            const unitBook = list.filter(w => rawBookmarksSet.has(`${unit.id}|${w.english}`)).length;

            total += unitTotal;
            mem += unitMem;
            book += unitBook;

            if (filterGrade !== 'ALL' || unitMem > 0 || unitBook > 0) {
                newUnitStats.push({
                    unit: unit,
                    memorized: unitMem,
                    total: unitTotal,
                    bookmarks: unitBook
                });
            }
        }
    });

    setMemorizedCount(mem);
    setBookmarksCount(book);
    setTotalWords(total);
    setUnitStats(newUnitStats);
  };

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);
    setStats(getUserStats());
    
    if (userProfile.grade) {
        const validGrades = ['A1','A2','B1','B2','C1','C2','12','11','10','9','8','7','6','5','4','3','2'];
        if (validGrades.includes(userProfile.grade)) {
            setFilterGrade(userProfile.grade as GradeLevel);
            setResetGrade(userProfile.grade as GradeLevel);
        }
    }
  }, []);

  useEffect(() => {
    calculateStats();
  }, [filterGrade, filterUnit, profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile = { ...profile, avatar: visuals.avatar };
    saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    setIsEditing(false);
    
    if (updatedProfile.grade && updatedProfile.grade !== filterGrade) {
       const validGrades = ['A1','A2','B1','B2','C1','C2','12','11','10','9','8','7','6','5','4','3','2'];
        if (validGrades.includes(updatedProfile.grade)) {
            setFilterGrade(updatedProfile.grade as GradeLevel);
            setFilterUnit('ALL');
            setResetGrade(updatedProfile.grade as GradeLevel);
        }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = (type: 'memorized' | 'bookmarks') => {
      if (!resetGrade) return;

      const confirmMsg = type === 'memorized' 
        ? "Seçilen alandaki kelimeler 'Ezberlendi' listesinden çıkarılacak. Emin misin?" 
        : "Seçilen alandaki kelimeler 'Favoriler' listesinden çıkarılacak. Emin misin?";

      if (!window.confirm(confirmMsg)) return;

      let keysToReset: string[] = [];

      if (resetUnitId === 'all') {
          const units = UNIT_DATA[resetGrade];
          if (units) {
            units.forEach(u => {
                if (VOCABULARY[u.id]) {
                    // Generate unique keys: unitId|english
                    keysToReset.push(...VOCABULARY[u.id].map(w => `${u.id}|${w.english}`));
                }
            });
          }
      } else {
          if (VOCABULARY[resetUnitId]) {
              // Generate unique keys: unitId|english
              keysToReset = VOCABULARY[resetUnitId].map(w => `${resetUnitId}|${w.english}`);
          }
      }

      if (keysToReset.length === 0) {
          setResetMessage({text: "Bu seçimde sıfırlanacak kelime bulunamadı.", type: 'error'});
          setTimeout(() => setResetMessage(null), 3000);
          return;
      }

      resetProgressForWords(keysToReset, type);
      
      // Force update visuals
      calculateStats();
      
      setResetMessage({
          text: `${type === 'memorized' ? 'Ezberlenenler' : 'Favoriler'} başarıyla sıfırlandı.`,
          type: 'success'
      });
      setTimeout(() => setResetMessage(null), 3000);
  };

  const handleResetActivityStats = () => {
      if (window.confirm("Tüm çalışma istatistiklerin (Quiz sayıları, Kart görüntülemeleri) sıfırlanacak. Emin misin?")) {
          resetActivityStats();
          setStats(getUserStats()); // Reload stats
          setResetMessage({text: "İstatistikler sıfırlandı.", type: 'success'});
          setTimeout(() => setResetMessage(null), 3000);
      }
  };

  const dailyProgress = {
     current: (stats?.flashcardsViewed || 0) + (stats?.quizCorrect || 0) + (stats?.quizWrong || 0),
     target: stats?.dailyGoal || 5,
     streak: stats?.streak || 0
  };
  const goalPercent = Math.min(100, Math.round((dailyProgress.current / dailyProgress.target) * 100));
  const displayCurrent = Math.min(dailyProgress.current, dailyProgress.target);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        
        <div className="pt-10 pb-8 px-6 sm:px-8 text-center">
          {/* Avatar Section */}
          <div className="mb-6 flex justify-center relative">
             <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-lg border-4 transition-colors ${visuals.bg} ${visuals.border} relative group`}>
                <span className="filter drop-shadow-sm transform hover:scale-110 transition-transform duration-300 cursor-default select-none">
                   {visuals.avatar}
                </span>
                {!isEditing && (
                   <div 
                      className="absolute inset-0 rounded-full bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" 
                      onClick={() => setIsEditing(true)}
                      title="Profili Düzenle"
                   >
                      <Edit2 className="text-slate-500 dark:text-slate-300 drop-shadow-sm" size={24} />
                   </div>
                )}
             </div>
          </div>

          {/* Profile Info Form */}
          <form onSubmit={handleSave} className="mb-6">
             {!isEditing ? (
               <div className="flex flex-col items-center animate-in fade-in">
                 <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">
                   {profile.name || 'İsimsiz Öğrenci'}
                 </h2>
                 <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-6 font-medium">
                   <span>{profile.age ? `${profile.age} Yaş` : '- Yaş'}</span>
                   <span>•</span>
                   <span>{profile.grade ? (['A1','A2','B1','B2','C1','C2'].includes(profile.grade) ? profile.grade : `${profile.grade}. Sınıf`) : '-. Sınıf'}</span>
                 </div>
                 <button 
                   type="button"
                   onClick={() => setIsEditing(true)}
                   className="px-6 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                 >
                   Profili Düzenle
                 </button>
               </div>
             ) : (
               <div className="max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
                 <div className="text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    Avatarınız ve tema renginiz seçtiğiniz sınıfa göre otomatik belirlenir.
                 </div>
                 <div className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase ml-1">İsim Soyisim</label>
                      <input 
                        type="text" 
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        placeholder="Adın Soyadın"
                        className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase ml-1">Yaş</label>
                        <input 
                          type="number" 
                          name="age"
                          value={profile.age}
                          onChange={handleChange}
                          placeholder="Yaş"
                          className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="flex-[1.5]">
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase ml-1">Seviye / Sınıf</label>
                        <select 
                          name="grade"
                          value={profile.grade}
                          onChange={handleChange}
                          className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                        >
                          <option value="">Seç</option>
                          <optgroup label="İlkokul">
                             <option value="2">2. Sınıf</option>
                             <option value="3">3. Sınıf</option>
                             <option value="4">4. Sınıf</option>
                          </optgroup>
                          <optgroup label="Ortaokul">
                             <option value="5">5. Sınıf</option>
                             <option value="6">6. Sınıf</option>
                             <option value="7">7. Sınıf</option>
                             <option value="8">8. Sınıf</option>
                          </optgroup>
                          <optgroup label="Lise">
                             <option value="9">9. Sınıf</option>
                             <option value="10">10. Sınıf</option>
                             <option value="11">11. Sınıf</option>
                             <option value="12">12. Sınıf</option>
                          </optgroup>
                          <optgroup label="Genel İngilizce">
                             <option value="A1">A1 - Beginner</option>
                             <option value="A2">A2 - Elementary</option>
                             <option value="B1">B1 - Intermediate</option>
                             <option value="B2">B2 - Upper Int.</option>
                             <option value="C1">C1 - Advanced</option>
                             <option value="C2">C2 - Proficient</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                 </div>
                 <div className="flex gap-3 pt-2">
                   <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      İptal
                    </button>
                   <button 
                    type="submit"
                    className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                  >
                    <Save size={18} /> Kaydet
                  </button>
                 </div>
               </div>
             )}
             {showSaved && (
               <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl text-sm font-bold animate-in zoom-in">
                 Profil güncellendi!
               </div>
             )}
          </form>

          {/* Daily Goal Widget */}
          <div className="mb-10">
             <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-2 px-4 flex items-center justify-between gap-4 shadow-sm">
               <div className="flex items-center gap-3 flex-grow">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Target size={16} />
                  </div>
                  <div className="flex flex-col w-full text-left">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        <span className="uppercase tracking-wider">Günlük Hedef</span>
                        <span>{displayCurrent}/{dailyProgress.target}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                          style={{ width: `${goalPercent}%` }}
                        ></div>
                      </div>
                  </div>
               </div>
               <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
               <div className="flex items-center gap-2 shrink-0">
                  <Flame size={18} className={`${dailyProgress.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300 dark:text-slate-600'}`} />
                  <div className="flex flex-col leading-none text-left">
                     <span className={`text-sm font-black ${dailyProgress.streak > 0 ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{dailyProgress.streak}</span>
                     <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Gün Seri</span>
                  </div>
               </div>
            </div>
             {dailyProgress.current >= dailyProgress.target && (
               <div className="text-center mt-2 animate-in fade-in slide-in-from-bottom-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                     <CheckCircle size={12} /> Hedef Tamamlandı! Yarınki hedef: {getNextDailyGoal(dailyProgress.target)}
                  </span>
               </div>
            )}
          </div>

          {/* --- STATISTICS SECTION --- */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <BarChart3 className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">İstatistikler</h3>
            </div>

            {/* Filters */}
            <div className="mb-8 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <Filter size={14} /> Filtrele
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select 
                    value={filterGrade}
                    onChange={(e) => { 
                        setFilterGrade(e.target.value as GradeLevel | 'ALL'); 
                        setFilterUnit('ALL'); 
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                  >
                    <option value="ALL">Tüm Sınıflar / Seviyeler</option>
                    <optgroup label="İlkokul">
                        <option value="2">2. Sınıf</option>
                        <option value="3">3. Sınıf</option>
                        <option value="4">4. Sınıf</option>
                    </optgroup>
                    <optgroup label="Ortaokul">
                        <option value="5">5. Sınıf</option>
                        <option value="6">6. Sınıf</option>
                        <option value="7">7. Sınıf</option>
                        <option value="8">8. Sınıf</option>
                    </optgroup>
                    <optgroup label="Lise">
                        <option value="9">9. Sınıf</option>
                        <option value="10">10. Sınıf</option>
                        <option value="11">11. Sınıf</option>
                        <option value="12">12. Sınıf</option>
                    </optgroup>
                    <optgroup label="Genel İngilizce">
                        <option value="A1">A1 - Beginner</option>
                        <option value="A2">A2 - Elementary</option>
                        <option value="B1">B1 - Intermediate</option>
                        <option value="B2">B2 - Upper Int.</option>
                        <option value="C1">C1 - Advanced</option>
                        <option value="C2">C2 - Proficient</option>
                    </optgroup>
                  </select>

                  <select 
                    value={filterUnit}
                    onChange={(e) => setFilterUnit(e.target.value)}
                    disabled={filterGrade === 'ALL'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="ALL">Tüm Üniteler</option>
                    {filterGrade !== 'ALL' && UNIT_DATA[filterGrade]?.map(u => (
                        !u.id.endsWith('all') && u.id !== 'uAll' && (
                            <option key={u.id} value={u.id}>{u.unitNo} - {u.title}</option>
                        )
                    ))}
                  </select>
               </div>
            </div>

            {/* Content Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
               <div className="relative overflow-hidden p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 transition-colors h-32 flex flex-col justify-between group">
                  <div className="flex justify-between items-start relative z-10">
                     <div className="text-left">
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">Ezberlediklerim</div>
                        <div className="text-3xl font-black text-slate-800 dark:text-slate-100">
                           {memorizedCount}
                           <span className="text-sm text-slate-400 dark:text-slate-500 font-bold ml-1">/ {totalWords}</span>
                        </div>
                     </div>
                     <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                        <Award size={20} />
                     </div>
                  </div>
                  <div className="relative z-10 w-full h-1.5 bg-indigo-200/50 dark:bg-indigo-800/50 rounded-full overflow-hidden mt-auto">
                     <div className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-1000 rounded-full" style={{ width: `${totalWords > 0 ? (memorizedCount / totalWords) * 100 : 0}%` }}></div>
                  </div>
               </div>

               <div className="relative overflow-hidden p-5 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800/50 transition-colors h-32 flex flex-col justify-between group">
                  <div className="flex justify-between items-start relative z-10">
                     <div className="text-left">
                        <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1">Favorilerim</div>
                        <div className="text-3xl font-black text-slate-800 dark:text-slate-100">
                           {bookmarksCount}
                           <span className="text-sm text-slate-400 dark:text-slate-500 font-bold ml-1">/ {totalWords}</span>
                        </div>
                     </div>
                     <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
                        <Bookmark size={20} />
                     </div>
                  </div>
                  <div className="relative z-10 w-full h-1.5 bg-orange-200/50 dark:bg-orange-800/50 rounded-full overflow-hidden mt-auto">
                     <div className="h-full bg-orange-500 dark:bg-orange-400 transition-all duration-1000 rounded-full" style={{ width: `${totalWords > 0 ? (bookmarksCount / totalWords) * 100 : 0}%` }}></div>
                  </div>
               </div>
            </div>

            {/* Global Activity Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
               <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 transition-colors relative overflow-hidden">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full mb-3 mx-auto relative z-10">
                    <BookOpen size={20} />
                  </div>
                  <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1 relative z-10">{stats?.flashcardsViewed || 0}</div>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide relative z-10">Kart Görüntüleme</div>
               </div>
               <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/50 transition-colors relative overflow-hidden">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full mb-3 mx-auto">
                    <Brain size={20} />
                  </div>
                  <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">
                    {totalWords > 0 ? Math.round((memorizedCount / totalWords) * 100) : 0}%
                  </div>
                  <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Bilgi Oranı</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">(Seçili Alan)</div>
               </div>
               <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/50 transition-colors">
                  <div className="flex flex-col gap-2 items-center justify-center h-full">
                     <div className="text-xs font-bold text-purple-400 dark:text-purple-300 uppercase tracking-wide mb-1">Genel Quiz</div>
                     <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold">
                        <CheckCircle size={16} /> 
                        <span>{stats?.quizCorrect || 0} D</span>
                     </div>
                     <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                        <XCircle size={16} /> 
                        <span>{stats?.quizWrong || 0} Y</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Detailed Stats */}
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex items-center justify-center gap-2 mb-6">
                    <PieChart className="text-teal-600 dark:text-teal-400" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Detaylı İlerleme</h3>
                 </div>
                 
                 {unitStats.length > 0 ? (
                   <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                      {unitStats.map((stat) => (
                        <div key={stat.unit.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                           <div className="flex justify-between items-center mb-3">
                              <div className="flex flex-col text-left">
                                <span className="font-bold text-slate-800 dark:text-white text-sm">{stat.unit.unitNo}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px]">{stat.unit.title}</span>
                              </div>
                              <div className="text-right">
                                 <span className="block text-lg font-black text-indigo-600 dark:text-indigo-400">{stat.memorized} <span className="text-xs text-slate-400 font-bold">/ {stat.total}</span></span>
                              </div>
                           </div>
                           
                           <div className="space-y-2">
                              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
                                 <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(stat.memorized / stat.total) * 100}%` }}></div>
                              </div>
                              {stat.bookmarks > 0 && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500">
                                   <Bookmark size={10} className="fill-current" /> 
                                   <span>{stat.bookmarks} favori kelime</span>
                                </div>
                              )}
                           </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
                      <p className="text-slate-400 dark:text-slate-500 text-sm">
                        {filterGrade === 'ALL' 
                            ? "Detaylı liste için yukarıdan bir sınıf seçiniz." 
                            : "Bu seçim için veri bulunamadı."}
                      </p>
                   </div>
                 )}
            </div>

            {/* --- Data Management / Reset --- */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 mb-8 animate-in fade-in slide-in-from-bottom-2">
               <div className="flex items-center justify-center gap-2 mb-6">
                  <RefreshCw className="text-rose-600 dark:text-rose-400" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Veri Yönetimi</h3>
               </div>
               
               <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400 shrink-0">
                        <AlertTriangle size={20} />
                     </div>
                     <p className="text-xs text-slate-600 dark:text-slate-400 text-left">
                        Seçilen sınıf ve ünitedeki ilerlemenizi (ezberlenenler veya favoriler) sıfırlayabilirsiniz. <span className="font-bold">Bu işlem geri alınamaz.</span>
                     </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                     <select 
                        value={resetGrade}
                        onChange={(e) => { setResetGrade(e.target.value as GradeLevel); setResetUnitId('all'); }}
                        className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                     >
                        <option value="" disabled>Sınıf Seçin</option>
                        <optgroup label="İlkokul">
                             <option value="2">2. Sınıf</option>
                             <option value="3">3. Sınıf</option>
                             <option value="4">4. Sınıf</option>
                          </optgroup>
                          <optgroup label="Ortaokul">
                             <option value="5">5. Sınıf</option>
                             <option value="6">6. Sınıf</option>
                             <option value="7">7. Sınıf</option>
                             <option value="8">8. Sınıf</option>
                          </optgroup>
                          <optgroup label="Lise">
                             <option value="9">9. Sınıf</option>
                             <option value="10">10. Sınıf</option>
                             <option value="11">11. Sınıf</option>
                             <option value="12">12. Sınıf</option>
                          </optgroup>
                          <optgroup label="Genel İngilizce">
                             <option value="A1">A1 - Beginner</option>
                             <option value="A2">A2 - Elementary</option>
                             <option value="B1">B1 - Intermediate</option>
                             <option value="B2">B2 - Upper Int.</option>
                             <option value="C1">C1 - Advanced</option>
                             <option value="C2">C2 - Proficient</option>
                          </optgroup>
                     </select>

                     <select 
                        value={resetUnitId}
                        onChange={(e) => setResetUnitId(e.target.value)}
                        disabled={!resetGrade}
                        className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 dark:text-white"
                     >
                        <option value="all">Tüm Üniteler</option>
                        {resetGrade && UNIT_DATA[resetGrade]?.map(u => (
                           !u.id.endsWith('all') && u.id !== 'uAll' && (
                              <option key={u.id} value={u.id}>{u.unitNo} - {u.title}</option>
                           )
                        ))}
                     </select>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                     <button 
                        onClick={() => handleReset('memorized')}
                        disabled={!resetGrade}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50 active:scale-95"
                     >
                        <CheckCircle size={14} /> Ezberlenenleri Sıfırla
                     </button>
                     <button 
                        onClick={() => handleReset('bookmarks')}
                        disabled={!resetGrade}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 font-bold rounded-xl text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50 active:scale-95"
                     >
                        <Bookmark size={14} /> Favorileri Sıfırla
                     </button>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-rose-200 dark:border-rose-800/50">
                      <button 
                        onClick={handleResetActivityStats}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs transition-colors active:scale-95"
                      >
                          <Trash2 size={14} /> Genel İstatistikleri Sıfırla (Quiz, Görüntüleme)
                      </button>
                  </div>

                  {resetMessage && (
                     <div className={`mt-3 text-center text-xs font-bold animate-in fade-in ${resetMessage.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {resetMessage.text}
                     </div>
                  )}
               </div>
            </div>
            
            <div className="mt-4 text-slate-400 dark:text-slate-500 text-xs flex items-center justify-center gap-1">
              <Clock size={12} /> Çalışma istatistikleri (Kart Görüntüleme, Quiz Sayısı) her gün (00:00) otomatik sıfırlanır.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
