
import React, { useState, useEffect } from 'react';
import { X, Layers, CheckCircle, Bookmark, Filter, PieChart, BarChart3, Trophy, Lock, Target, Eye, XCircle } from 'lucide-react';
import { getUserStats, getSRSStatus, getMemorizedSet, UserStats } from '../services/userService';
import { BADGES, UNIT_ASSETS } from '../data/assets';
import { VOCABULARY } from '../data/vocabulary';
import { GradeLevel } from '../types';
import { UnitDef } from '../types';

interface StatsModalProps {
  onClose: () => void;
  currentGrade: GradeLevel | 'ALL' | 'GENERAL';
}

const StatsModal: React.FC<StatsModalProps> = ({ onClose, currentGrade: initialGrade }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'badges'>('stats');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [srsStats, setSrsStats] = useState<{[key:number]: number}>({});
  
  const [filterGrade, setFilterGrade] = useState<GradeLevel | 'ALL' | 'GENERAL'>(initialGrade);
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  
  const [memorizedCount, setMemorizedCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [unitStats, setUnitStats] = useState<{unit: UnitDef, memorized: number, total: number, bookmarks: number}[]>([]);

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

  // Sort badges: Unlocked first, and among unlocked, newest first (assuming stats.badges grows by push)
  const sortedBadges = React.useMemo(() => {
      if (!stats) return BADGES;
      return [...BADGES].sort((a, b) => {
           const aUnlocked = stats.badges.includes(a.id);
           const bUnlocked = stats.badges.includes(b.id);
           
           if (aUnlocked && !bUnlocked) return -1; // a comes first
           if (!aUnlocked && bUnlocked) return 1;  // b comes first
           
           if (aUnlocked && bUnlocked) {
               // Both unlocked, sort by index in stats.badges (higher index = newer)
               // We want newer first, so B - A
               return stats.badges.indexOf(b.id) - stats.badges.indexOf(a.id);
           }
           // Both locked, keep original order
           return 0;
      });
  }, [stats]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl border overflow-hidden flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
           style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b z-10 sticky top-0" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)'}}>
            <h2 className="text-2xl font-black" style={{color: 'var(--color-text-main)'}}>İlerleme Durumu</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" style={{color: 'var(--color-text-muted)'}}>
                <X size={24} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6 gap-6" style={{borderColor: 'var(--color-border)'}}>
            <button 
                onClick={() => setActiveTab('stats')}
                className={`py-4 font-bold text-sm relative transition-colors`}
                style={{color: activeTab === 'stats' ? 'var(--color-primary)' : 'var(--color-text-muted)'}}
            >
                <div className="flex items-center gap-2">
                    <BarChart3 size={18} /> İstatistikler
                </div>
                {activeTab === 'stats' && <div className="absolute bottom-0 left-0 w-full h-1 rounded-t-full" style={{backgroundColor: 'var(--color-primary)'}}></div>}
            </button>
            <button 
                onClick={() => setActiveTab('badges')}
                className={`py-4 font-bold text-sm relative transition-colors`}
                style={{color: activeTab === 'badges' ? 'orange' : 'var(--color-text-muted)'}}
            >
                <div className="flex items-center gap-2">
                    <Trophy size={18} /> Rozetler
                </div>
                {activeTab === 'badges' && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-t-full"></div>}
            </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar" style={{backgroundColor: 'var(--color-bg-main)'}}>
            {activeTab === 'stats' ? (
                <div className="space-y-8">
                     {/* SRS Boxes Stats */}
                    <div className="p-5 rounded-3xl border" style={{backgroundColor: 'rgba(var(--color-bg-card-rgb), 0.5)', borderColor: 'var(--color-border)'}}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm font-bold" style={{color: 'var(--color-text-main)'}}>
                                <Layers size={18} className="text-indigo-500" /> Hafıza Kutuları
                            </div>
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg border" style={{color: 'var(--color-text-muted)', borderColor: 'var(--color-border)'}}>SRS Sistemi</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {[1,2,3,4,5].map(box => (
                                <div key={box} className="flex flex-col items-center p-2 rounded-2xl border shadow-sm" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 text-white
                                        ${box === 1 ? 'bg-red-400' : box === 2 ? 'bg-orange-400' : box === 3 ? 'bg-yellow-400' : box === 4 ? 'bg-lime-400' : 'bg-green-500'}
                                    `}>
                                        {box}
                                    </div>
                                    <span className="text-lg font-black" style={{color: 'var(--color-text-main)'}}>{srsStats[box] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="space-y-3">
                         <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>
                            <Filter size={14} /> Filtrele
                         </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                <option value="GENERAL">Genel İngilizce</option>
                            </select>

                            <select 
                                value={filterUnit}
                                onChange={(e) => setFilterUnit(e.target.value)}
                                disabled={filterGrade === 'ALL'}
                                className="w-full p-3 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    </div>

                    {/* Activity Stats (Grid) */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Views */}
                        <div className="p-5 rounded-3xl border flex flex-col justify-between h-32" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                             <div className="flex justify-between items-start">
                                <span className="text-xs font-bold uppercase text-blue-500">Bakılan Kart</span>
                                <Eye size={20} className="text-blue-500" />
                            </div>
                            <div>
                                <span className="text-3xl font-black" style={{color: 'var(--color-text-main)'}}>{stats?.flashcardsViewed || 0}</span>
                            </div>
                        </div>
                        
                        {/* Quiz Score */}
                        <div className="p-5 rounded-3xl border flex flex-col justify-between h-32" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                             <div className="flex justify-between items-start">
                                <span className="text-xs font-bold uppercase text-violet-500">Quiz Başarısı</span>
                                <Target size={20} className="text-violet-500" />
                            </div>
                            <div>
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-black" style={{color: 'var(--color-text-main)'}}>
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

                        {/* Memorized */}
                        <div className="p-5 rounded-3xl border flex flex-col justify-between h-32" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold uppercase text-green-500">Ezberlenen</span>
                                <CheckCircle size={20} className="text-green-500" />
                            </div>
                            <div>
                                <span className="text-3xl font-black" style={{color: 'var(--color-text-main)'}}>{memorizedCount}</span>
                                <span className="text-xs font-medium ml-1" style={{color: 'var(--color-text-muted)'}}>/ {totalWords}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${totalWords > 0 ? (memorizedCount / totalWords) * 100 : 0}%` }}></div>
                            </div>
                        </div>

                        {/* Bookmarks */}
                        <div className="p-5 rounded-3xl border flex flex-col justify-between h-32" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold uppercase text-orange-500">Favoriler</span>
                                <Bookmark size={20} className="text-orange-500" />
                            </div>
                            <div>
                                <span className="text-3xl font-black" style={{color: 'var(--color-text-main)'}}>{bookmarksCount}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${totalWords > 0 ? (bookmarksCount / totalWords) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-2 text-sm font-bold" style={{color: 'var(--color-text-main)'}}>
                                <PieChart size={18} className="text-teal-500" /> Ünite Detayları
                             </div>
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
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    {sortedBadges.map((badge) => {
                        const isUnlocked = stats?.badges.includes(badge.id);
                        // Fix: Check if icon is a URL (starts with http, /, or data:) to render img, otherwise render text
                        const isImage = badge.image || (badge.icon && (badge.icon.startsWith('http') || badge.icon.startsWith('/') || badge.icon.startsWith('data:')));

                        return (
                            <div 
                                key={badge.id} 
                                className={`relative p-4 rounded-3xl border-2 text-center flex flex-col items-center gap-2 transition-all
                                    ${isUnlocked 
                                        ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/50' 
                                        : 'opacity-60 grayscale'
                                    }`}
                                style={!isUnlocked ? {backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'} : {}}
                            >
                                <div className="text-4xl mb-1 filter drop-shadow-sm h-20 w-20 flex items-center justify-center">
                                    {isImage ? (
                                        <img src={badge.image || badge.icon} alt={badge.name} className="w-full h-full object-contain" />
                                    ) : (
                                         <span className="text-5xl">{badge.icon}</span>
                                    )}
                                </div>
                                <h4 className={`font-bold text-sm`} style={{color: isUnlocked ? 'var(--color-text-main)' : 'var(--color-text-muted)'}}>
                                    {badge.name}
                                </h4>
                                <p className="text-[10px] font-medium leading-tight" style={{color: 'var(--color-text-muted)'}}>
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
