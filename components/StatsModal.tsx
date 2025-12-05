
import React, { useState, useEffect } from 'react';
import { X, Layers, CheckCircle, Bookmark, Filter, PieChart, BarChart3, Trophy, Lock, Target, Eye, Flame, Gamepad2, WholeWord, Search, Grid3X3, Keyboard, Brain, Swords, Clock, Activity } from 'lucide-react';
import { getUserStats, getSRSStatus, getMemorizedSet, UserStats } from '../services/userService';
import { BADGES, UNIT_ASSETS } from '../data/assets';
import { VOCABULARY } from '../data/vocabulary';
import { GradeLevel, UnitDef } from '../types';

interface StatsModalProps {
  onClose: () => void;
  currentGrade: GradeLevel | 'ALL' | 'GENERAL';
}

const StatsModal: React.FC<StatsModalProps> = ({ onClose, currentGrade: initialGrade }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'learning' | 'games' | 'badges'>('general');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [srsStats, setSrsStats] = useState<{[key:number]: number}>({});
  
  const [filterGrade, setFilterGrade] = useState<GradeLevel | 'ALL' | 'GENERAL'>(initialGrade);
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  
  const [memorizedCount, setMemorizedCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [unitStats, setUnitStats] = useState<{unit: UnitDef, memorized: number, total: number, bookmarks: number}[]>([]);
  const [tooltipBadgeId, setTooltipBadgeId] = useState<string | null>(null);

  useEffect(() => {
      setStats(getUserStats());
      setSrsStats(getSRSStatus());
  }, []);

  // Content Stats Calculation
  useEffect(() => {
    const rawMemorizedSet = getMemorizedSet();
    let rawBookmarksSet = new Set<string>();
    try {
      const storedBookmarks = localStorage.getItem('lgs_bookmarks');
      if (storedBookmarks) {
         rawBookmarksSet = new Set(JSON.parse(storedBookmarks));
      }
    } catch (e) {}

    let total = 0;
    let mem = 0;
    let book = 0;
    const newUnitStats: typeof unitStats = [];

    const getGeneralEnglishUnits = () => {
        const levels: GradeLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
        let allUnits: { unit: UnitDef, grade: GradeLevel }[] = [];
        levels.forEach(level => {
            const units = UNIT_ASSETS[level] || [];
            units.forEach(u => allUnits.push({ unit: u, grade: level }));
        });
        return allUnits;
    };

    let unitsToProcess: { unit: UnitDef, grade: GradeLevel }[] = [];
    const allGradeLevels = ['A1','A2','B1','B2','C1','12','11','10','9','8','7','6','5','4','3','2'] as GradeLevel[];

    if (filterGrade === 'GENERAL') {
        if (filterUnit !== 'ALL') {
             const genUnits = getGeneralEnglishUnits();
             const found = genUnits.find(x => x.unit.id === filterUnit);
             if (found) unitsToProcess.push(found);
        } else {
             unitsToProcess = getGeneralEnglishUnits();
        }
    } else if (filterGrade !== 'ALL') {
        const units = UNIT_ASSETS[filterGrade] || [];
        if (filterUnit !== 'ALL') {
            const specificUnit = units.find(u => u.id === filterUnit);
            if (specificUnit) unitsToProcess.push({ unit: specificUnit, grade: filterGrade });
        } else {
            units.forEach(u => unitsToProcess.push({ unit: u, grade: filterGrade }));
        }
    } else {
        allGradeLevels.forEach(g => {
            const units = UNIT_ASSETS[g] || [];
            units.forEach(u => unitsToProcess.push({ unit: u, grade: g }));
        });
    }

    unitsToProcess.forEach(({ unit }) => {
        if (VOCABULARY[unit.id] && !unit.id.endsWith('all') && unit.id !== 'uAll') {
            const list = VOCABULARY[unit.id];
            const unitTotal = list.length;
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
  }, [filterGrade, filterUnit]);

  const sortedBadges = React.useMemo(() => {
      if (!stats) return BADGES;
      return [...BADGES].sort((a, b) => {
           const aUnlocked = stats.badges.includes(a.id);
           const bUnlocked = stats.badges.includes(b.id);
           
           if (aUnlocked && !bUnlocked) return -1; 
           if (!aUnlocked && bUnlocked) return 1;  
           
           if (aUnlocked && bUnlocked) {
               return stats.badges.indexOf(b.id) - stats.badges.indexOf(a.id);
           }
           return 0;
      });
  }, [stats]);

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
      <div className="w-full max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl border overflow-hidden flex flex-col h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
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
                    <div className="p-5 rounded-3xl border" style={{backgroundColor: 'rgba(var(--color-bg-card-rgb), 0.5)', borderColor: 'var(--color-border)'}}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm font-bold" style={{color: 'var(--color-text-main)'}}>
                                <Layers size={18} className="text-indigo-500" /> Aralıklı Tekrar (SRS) Durumu
                            </div>
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Aktif Kelimeler</span>
                        </div>
                        <div className="flex items-end justify-between gap-2 h-32 pt-4">
                            {[1,2,3,4,5].map(box => {
                                const count = srsStats[box] || 0;
                                const max = Math.max(...(Object.values(srsStats) as number[]), 1);
                                const height = Math.max((count / max) * 100, 10);
                                
                                return (
                                <div key={box} className="flex-1 flex flex-col items-center justify-end gap-2 group">
                                    <div className="font-bold text-xs transition-all group-hover:-translate-y-1" style={{color: 'var(--color-text-main)'}}>{count}</div>
                                    <div 
                                        className={`w-full rounded-t-xl transition-all duration-500 ${box === 5 ? 'bg-green-500' : 'bg-indigo-400 opacity-70'}`} 
                                        style={{ height: `${height}%` }}
                                    ></div>
                                    <div className="text-[10px] font-bold text-slate-400">Kutu {box}</div>
                                </div>
                            )})}
                        </div>
                        <p className="text-[10px] text-center mt-4 opacity-60" style={{color: 'var(--color-text-muted)'}}>
                            Kutu 5'e ulaşan kelimeler kalıcı hafızaya alınmış sayılır.
                        </p>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                         <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                             <span className="text-[10px] uppercase font-bold text-slate-400">Ezberlenen</span>
                             <span className="text-lg font-black text-green-500">{memorizedCount}</span>
                         </div>
                         <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                             <span className="text-[10px] uppercase font-bold text-slate-400">Favoriler</span>
                             <span className="text-lg font-black text-orange-500">{bookmarksCount}</span>
                         </div>
                         <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                             <span className="text-[10px] uppercase font-bold text-slate-400">Toplam</span>
                             <span className="text-lg font-black text-blue-500">{totalWords}</span>
                         </div>
                    </div>

                </div>
            )}

            {/* LEARNING TAB */}
            {activeTab === 'learning' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                         {/* Views */}
                        <div className="p-4 sm:p-5 rounded-3xl border flex flex-col justify-between h-28 sm:h-32" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                             <div className="flex justify-between items-start">
                                <span className="text-[10px] sm:text-xs font-bold uppercase text-blue-500">Bakılan Kart</span>
                                <Eye size={18} className="text-blue-500" />
                            </div>
                            <div>
                                <span className="text-2xl sm:text-3xl font-black" style={{color: 'var(--color-text-main)'}}>{formatVal(Number(stats?.flashcardsViewed || 0))}</span>
                            </div>
                        </div>

                        {/* Quiz Score */}
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

                    {/* Detailed Breakdown List */}
                    <div className="pt-4 border-t" style={{borderColor: 'var(--color-border)'}}>
                         <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3" style={{color: 'var(--color-text-muted)'}}>
                            <Filter size={14} /> Filtrele
                         </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <select 
                                value={filterGrade}
                                onChange={(e) => { 
                                    setFilterGrade(e.target.value as GradeLevel | 'ALL' | 'GENERAL'); 
                                    setFilterUnit('ALL'); 
                                }}
                                className="w-full p-3 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-main)'}}
                            >
                                <option value="ALL">Tüm Sınıflar</option>
                                <optgroup label="İlkokul"><option value="2">2. Sınıf</option><option value="3">3. Sınıf</option><option value="4">4. Sınıf</option></optgroup>
                                <optgroup label="Ortaokul"><option value="5">5. Sınıf</option><option value="6">6. Sınıf</option><option value="7">7. Sınıf</option><option value="8">8. Sınıf</option></optgroup>
                                <optgroup label="Lise"><option value="9">9. Sınıf</option><option value="10">10. Sınıf</option><option value="11">11. Sınıf</option><option value="12">12. Sınıf</option></optgroup>
                                <option value="GENERAL">Genel İngilizce</option>
                            </select>
                            <select 
                                value={filterUnit}
                                onChange={(e) => setFilterUnit(e.target.value)}
                                disabled={filterGrade === 'ALL'}
                                className="w-full p-3 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                                style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-main)'}}
                            >
                                <option value="ALL">Tüm Üniteler</option>
                                {filterGrade !== 'ALL' && filterGrade !== 'GENERAL' && UNIT_ASSETS[filterGrade]?.map(u => (
                                    !u.id.endsWith('all') && u.id !== 'uAll' && (
                                        <option key={u.id} value={u.id}>{u.unitNo} - {u.title}</option>
                                    )
                                ))}
                            </select>
                        </div>
                        
                        {unitStats.length > 0 ? (
                            <div className="space-y-3">
                                {unitStats.map((stat) => (
                                    <div key={stat.unit.id} className="p-4 rounded-2xl border flex items-center gap-4" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between mb-1">
                                                <span className="font-bold text-sm truncate pr-2" style={{color: 'var(--color-text-main)'}}>{stat.unit.title}</span>
                                                <span className="text-xs font-bold text-indigo-500">{Math.round((stat.memorized / stat.total) * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(stat.memorized / stat.total) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 text-sm border-2 border-dashed rounded-2xl" style={{color: 'var(--color-text-muted)', borderColor: 'var(--color-border)'}}>
                                Veri bulunamadı.
                            </div>
                        )}
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
                         <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatVal(Number(stats?.weekly?.matchingBestTime || 0))}</span>
                     </div>

                     <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center"><Gamepad2 size={20} /></div>
                             <div className="flex flex-col">
                                 <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Labirent</span>
                                 <span className="text-[10px] text-slate-500">En yüksek puan</span>
                             </div>
                         </div>
                         <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatVal(Number(stats?.weekly?.mazeHighScore || 0))}</span>
                     </div>

                     <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center"><Search size={20} /></div>
                             <div className="flex flex-col">
                                 <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Bulmaca</span>
                                 <span className="text-[10px] text-slate-500">En yüksek puan</span>
                             </div>
                         </div>
                         <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatVal(Number(stats?.weekly?.wordSearchHighScore || 0))}</span>
                     </div>
                </div>
            )}

            {/* BADGES TAB */}
            {activeTab === 'badges' && (
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    {sortedBadges.map((badge) => {
                        const isUnlocked = stats?.badges.includes(badge.id);
                        const isImage = badge.image || (badge.icon && (badge.icon.startsWith('http') || badge.icon.startsWith('/') || badge.icon.startsWith('data:')));

                        return (
                            <div 
                                key={badge.id} 
                                onClick={() => setTooltipBadgeId(tooltipBadgeId === badge.id ? null : badge.id)}
                                className={`relative p-4 rounded-3xl border-2 text-center flex flex-col items-center gap-2 transition-all cursor-pointer
                                    ${isUnlocked 
                                        ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/50' 
                                        : 'opacity-60 grayscale'
                                    }`}
                                style={!isUnlocked ? {backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'} : {}}
                            >
                                {/* Tooltip */}
                                {tooltipBadgeId === badge.id && (
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in">
                                        {badge.name}
                                    </div>
                                )}

                                <div className="text-4xl mb-1 filter drop-shadow-sm h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center">
                                    {isImage ? (
                                        <img src={badge.image || badge.icon} alt={badge.name} className="w-full h-full object-contain" />
                                    ) : (
                                         <span className="text-4xl sm:text-5xl">{badge.icon}</span>
                                    )}
                                </div>
                                <h4 className={`font-bold text-xs sm:text-sm`} style={{color: isUnlocked ? 'var(--color-text-main)' : 'var(--color-text-muted)'}}>
                                    {badge.name}
                                </h4>
                                <p className="text-[9px] sm:text-[10px] font-medium leading-tight" style={{color: 'var(--color-text-muted)'}}>
                                    {badge.description}
                                </p>
                                {!isUnlocked && (
                                    <div className="absolute top-3 right-3" style={{color: 'var(--color-text-muted)'}}>
                                        <Lock size={14} />
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
