
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Bookmark, Target, RefreshCw, ChevronRight, Clock as ClockIcon,
  PartyPopper, Lightbulb, MessageCircle, Sparkles,
  Cpu, Crown, Download, ShoppingBag as ShoppingBagIcon, GraduationCap, Play, Star, CheckCircle, BookType, ListChecks,
  Calendar, Signal, Grid3X3, Type, WholeWord, X
} from 'lucide-react';
import { getUserStats, getTotalDueCount, getDueCountForGrade, getMemorizedSet, getUserProfile, getWordOfTheDay } from '../services/userService';
import { UnitDef, GradeDef, GradeLevel, StudyMode, CategoryType } from '../types';
import { VOCABULARY } from '../data/vocabulary';
import { UNIT_ASSETS, GRADE_DATA } from '../data/assets';
import Mascot from './Mascot';
import { APP_TIPS } from '../data/tips';

interface TopicSelectorProps {
  selectedCategory: CategoryType | null;
  selectedGrade: GradeLevel | null;
  selectedMode: StudyMode | null;
  selectedUnit: UnitDef | null;
  onSelectCategory: (cat: CategoryType | null) => void;
  onSelectGrade: (grade: GradeLevel | null) => void;
  onSelectMode: (mode: StudyMode | null) => void;
  onSelectUnit: (unit: UnitDef | null) => void;
  onStartModule: (action: 'study' | 'matching' | 'typing' | 'chain' | 'quiz' | 'quiz-bookmarks' | 'quiz-memorized' | 'grammar' | 'practice-select' | 'review' | 'review-flashcards', unit: UnitDef, count?: number) => void;
  onGoHome: () => void;
  onOpenMarket: () => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  selectedCategory,
  selectedGrade,
  selectedMode,
  selectedUnit,
  onSelectCategory,
  onSelectGrade,
  onSelectMode,
  onSelectUnit,
  onStartModule,
  onGoHome,
  onOpenMarket,
}) => {

  const [dailyDueCount, setDailyDueCount] = React.useState<number>(0);
  const [dailyDueCountForGrade, setDailyDueCountForGrade] = React.useState<number>(0);
  const [lastActivity, setLastActivity] = React.useState<{grade: string, unit: UnitDef} | null>(null);
  const [memorizedSet, setMemorizedSet] = React.useState<Set<string>>(new Set());
  const [isNewUser, setIsNewUser] = React.useState(false);
  const [wordOfTheDay, setWordOfTheDay] = React.useState<any>(null);
  const [tip, setTip] = useState('');
  
  // Study Mode Selection Modal State
  const [showStudyModes, setShowStudyModes] = useState(false);

  React.useEffect(() => {
    setDailyDueCount(getTotalDueCount());
    setMemorizedSet(getMemorizedSet());
    setWordOfTheDay(getWordOfTheDay());
    
    setTip(APP_TIPS[Math.floor(Math.random() * APP_TIPS.length)]);
    
    const interval = setInterval(() => {
        setTip(APP_TIPS[Math.floor(Math.random() * APP_TIPS.length)]);
    }, 10000);

    const profile = getUserProfile();
    setIsNewUser(profile.grade === '');

    if (selectedGrade) {
        setDailyDueCountForGrade(getDueCountForGrade(selectedGrade));
    }

    const stats = getUserStats();
    // Use persistent lastActivity from stats
    const activity = stats.lastActivity;
    
    if (activity && activity.grade && activity.unitId) {
        if (UNIT_ASSETS[activity.grade]) {
             const gradeUnits = UNIT_ASSETS[activity.grade];
             if (gradeUnits) {
                 const unit = gradeUnits.find(u => u.id === activity.unitId);
                 if (unit) {
                     setLastActivity({ grade: activity.grade, unit });
                 }
             }
        }
    }
    return () => clearInterval(interval);
  }, [selectedGrade, selectedCategory]);
  
  const calculateProgress = (unitIds: string[]) => {
      let totalWords = 0;
      let memorizedCount = 0;
      
      unitIds.forEach(uid => {
          const words = VOCABULARY[uid] || [];
          totalWords += words.length;
          words.forEach(w => {
              const key = `${uid}|${w.english}`;
              if (memorizedSet.has(key)) memorizedCount++;
          });
      });

      if (totalWords === 0) return 0;
      return Math.round((memorizedCount / totalWords) * 100);
  };

  const handleGradeSelect = (grade: GradeLevel) => {
      if (['A1', 'A2', 'B1', 'B2', 'C1'].includes(grade)) {
          const units = UNIT_ASSETS[grade];
          if (units && units.length > 0) {
              onSelectGrade(grade);
              onSelectUnit(units[0]);
          } else {
              onSelectGrade(grade);
          }
      } else {
          onSelectGrade(grade);
      }
  };

  const handleStudyModeClick = () => {
      setShowStudyModes(true);
  };

  const handleModeSelect = (mode: 'study' | 'matching' | 'typing' | 'chain') => {
      if (selectedUnit) {
          setShowStudyModes(false);
          onStartModule(mode, selectedUnit);
      }
  };

  if (selectedUnit) {
     let unitProgress = 0;
     if (selectedUnit.id.endsWith('all') || selectedUnit.id === 'uAll') {
         if (selectedGrade) {
            const gradeUnitIds = UNIT_ASSETS[selectedGrade].map(u => u.id).filter(id => !id.endsWith('all') && id !== 'uAll');
            unitProgress = calculateProgress(gradeUnitIds);
         }
     } else {
         unitProgress = calculateProgress([selectedUnit.id]);
     }

     return (
      <div className="w-full max-w-lg mx-auto p-4 flex flex-col min-h-full justify-start pt-safe pb-safe animate-in fade-in zoom-in duration-300 relative">
         <div className="text-center mb-6 pt-2 shrink-0">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-sm ring-4 ring-opacity-20 overflow-hidden" style={{backgroundColor: 'var(--color-bg-card)', color: 'var(--color-primary)', '--tw-ring-color': 'var(--color-primary)'} as React.CSSProperties}>
               {selectedUnit.image ? (
                  <img src={selectedUnit.image} alt={selectedUnit.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
               ) : (
                  React.isValidElement(selectedUnit.icon) ? React.cloneElement(selectedUnit.icon as React.ReactElement<any>, { size: 32 }) : selectedUnit.icon
               )}
            </div>
            <h2 className="text-xl font-black mb-1 tracking-tight px-2 leading-tight break-words" style={{color: 'var(--color-text-main)'}}>{selectedUnit.title}</h2>
            <p className="font-medium text-xs opacity-70" style={{color: 'var(--color-text-muted)'}}>{selectedUnit.unitNo}</p>
            
            <div className="mt-3 max-w-[150px] mx-auto">
                <div className="flex justify-between text-[10px] font-bold mb-1" style={{color: 'var(--color-text-muted)'}}>
                    <span>İlerleme</span>
                    <span>%{unitProgress}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-1000" style={{width: `${unitProgress}%`}}></div>
                </div>
            </div>
         </div>

         <div className="space-y-2 w-full pb-24 overflow-y-auto px-1">
            <button onClick={handleStudyModeClick} className="w-full p-3 border rounded-2xl flex items-center gap-4 transition-all group text-left shadow-sm hover:shadow-md active:scale-[0.98]" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(255,255,255,0.1)'}}>
               <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0" style={{backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)'}}>
                  <BookOpen size={20} />
               </div>
               <div>
                  <h3 className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>Kelime Çalış & Oyna</h3>
                  <p className="text-[10px] font-medium opacity-70" style={{color: 'var(--color-text-muted)'}}>Kartlar, Eşleştirme, Yazma...</p>
               </div>
               <ChevronRight className="ml-auto group-hover:translate-x-1 transition-transform opacity-50" size={16} style={{color: 'var(--color-text-muted)'}} />
            </button>

            <button onClick={() => onStartModule('quiz', selectedUnit)} className="w-full p-3 border rounded-2xl flex items-center gap-4 transition-all group text-left shadow-sm hover:shadow-md active:scale-[0.98]" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(255,255,255,0.1)'}}>
               <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                  <Target size={20} />
               </div>
               <div>
                  <h3 className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>Test Çöz</h3>
                  <p className="text-[10px] font-medium opacity-70" style={{color: 'var(--color-text-muted)'}}>Kendini dene</p>
               </div>
               <ChevronRight className="ml-auto group-hover:translate-x-1 transition-transform opacity-50" size={16} style={{color: 'var(--color-text-muted)'}} />
            </button>

            <button onClick={() => onStartModule('grammar', selectedUnit)} className="w-full p-3 border rounded-2xl flex items-center gap-4 transition-all group text-left shadow-sm hover:shadow-md active:scale-[0.98]" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(255,255,255,0.1)'}}>
               <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                  <BookType size={20} />
               </div>
               <div>
                  <h3 className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>Gramer Notları</h3>
                  <p className="text-[10px] font-medium opacity-70" style={{color: 'var(--color-text-muted)'}}>Konu anlatımı</p>
               </div>
               <ChevronRight className="ml-auto group-hover:translate-x-1 transition-transform opacity-50" size={16} style={{color: 'var(--color-text-muted)'}} />
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => onStartModule('quiz-bookmarks', selectedUnit)} className="p-3 rounded-2xl border transition-all text-center hover:shadow-md group active:scale-95" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(255,255,255,0.1)'}}>
                   <div className="mx-auto w-8 h-8 mb-1 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                      <Bookmark size={16} />
                   </div>
                   <div className="text-[10px] font-bold" style={{color: 'var(--color-text-main)'}}>Favori Testi</div>
                </button>

                <button onClick={() => onStartModule('quiz-memorized', selectedUnit)} className="p-3 rounded-2xl border transition-all text-center hover:shadow-md group active:scale-95" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(255,255,255,0.1)'}}>
                   <div className="mx-auto w-8 h-8 mb-1 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      <CheckCircle size={16} />
                   </div>
                   <div className="text-[10px] font-bold" style={{color: 'var(--color-text-main)'}}>Ezber Testi</div>
                </button>
            </div>

            <button onClick={() => onStartModule('practice-select', selectedUnit)} className="w-full mt-1 py-3 px-4 rounded-2xl border-2 border-dashed text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 opacity-70 hover:opacity-100" style={{borderColor: 'var(--color-text-muted)', color: 'var(--color-text-muted)'}}>
               <ListChecks size={16} />
               Kelimeleri Seçerek Çalış
            </button>
         </div>

         {/* Study Mode Selection Modal */}
         {showStudyModes && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-sm rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-black text-lg text-slate-800 dark:text-white">Çalışma Modu Seç</h3>
                        <button onClick={() => setShowStudyModes(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                        <button onClick={() => handleModeSelect('study')} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                <BookOpen size={24} />
                            </div>
                            <span className="font-bold text-sm text-slate-700 dark:text-white">Flashcard</span>
                        </button>
                        
                        <button onClick={() => handleModeSelect('matching')} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                <Grid3X3 size={24} />
                            </div>
                            <span className="font-bold text-sm text-slate-700 dark:text-white">Eşleştirme</span>
                        </button>

                        <button onClick={() => handleModeSelect('chain')} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                <WholeWord size={24} />
                            </div>
                            <span className="font-bold text-sm text-slate-700 dark:text-white">Kelime Türet</span>
                        </button>

                        <button onClick={() => handleModeSelect('typing')} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all group flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                <Type size={24} />
                            </div>
                            <span className="font-bold text-sm text-slate-700 dark:text-white">Yazma</span>
                        </button>
                    </div>
                </div>
            </div>
         )}

      </div>
     );
  }
  
  // ... (Rest of the component logic remains same)
  if (!selectedCategory) {
    return (
      <div className="flex flex-col items-center min-h-full p-4 pt-2 animate-in fade-in duration-500 relative">
        {/* ... (Home UI Code) ... */}
        <div className="text-center mb-6 mt-2 w-full max-w-md">
             <h1 className="text-3xl font-black tracking-tighter" style={{color: 'var(--color-text-main)'}}>
               Kelim<span className="text-indigo-500">App</span>
             </h1>
             <p className="text-xs font-medium opacity-70" style={{color: 'var(--color-text-muted)'}}>
               İngilizce öğrenmenin en eğlenceli yolu
             </p>
        </div>

        <div className="w-full max-w-md mb-4 flex justify-start pl-2">
             <Mascot mood="neutral" size={80} message={tip} />
        </div>

        {wordOfTheDay && (
           <div className="w-full max-w-md mb-4 shrink-0 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-4 shadow-md relative overflow-hidden text-white">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
               <div className="flex justify-between items-start mb-1">
                   <div className="flex items-center gap-1.5 text-pink-100 text-[10px] font-bold uppercase tracking-wider">
                       <Sparkles size={12} /> Günün Kelimesi
                   </div>
               </div>
               <div className="text-xl font-black">{wordOfTheDay.english}</div>
               <div className="text-sm font-medium text-pink-100 mb-2">{wordOfTheDay.turkish}</div>
               <div className="text-[10px] text-pink-200 italic opacity-90 bg-black/10 p-1.5 rounded-lg">
                  "{wordOfTheDay.exampleEng}"
               </div>
           </div>
        )}
        
        {lastActivity && (
             <button onClick={() => { onSelectGrade(lastActivity.grade as GradeLevel); onSelectUnit(lastActivity.unit); }} className="w-full max-w-md mb-3 flex items-center gap-3 p-3 border rounded-2xl shadow-sm hover:shadow-md transition-all group shrink-0" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(255,255,255,0.1)'}}>
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform shrink-0">
                    <ClockIcon size={16} />
                </div>
                <div className="text-left flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-70" style={{color: 'var(--color-text-muted)'}}>Son Kaldığın Yer</div>
                    <div className="font-bold truncate text-sm" style={{color: 'var(--color-text-main)'}}>
                         {lastActivity.grade.length > 2 ? `${lastActivity.grade} Seviye` : `${lastActivity.grade}. Sınıf`} - {lastActivity.unit.unitNo}
                    </div>
                </div>
                <ChevronRight size={16} style={{color: 'var(--color-text-muted)'}} className="group-hover:text-orange-500 transition-colors shrink-0" />
            </button>
        )}
        
        <div className="w-full max-w-md mb-6 shrink-0">
            <button onClick={() => onStartModule('review', { id: 'global_review', unitNo: 'Review', title: 'Günlük Tekrar', icon: <RefreshCw /> })} className="w-full rounded-2xl p-4 shadow-md relative overflow-hidden active:scale-[0.99] transition-transform group flex items-center justify-between" style={{background: 'linear-gradient(to right, var(--color-primary), #8b5cf6)'}}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/20 transition-colors"></div>
                <div className="text-left z-10">
                    <div className="flex items-center gap-2 text-white/90 font-bold text-[10px] uppercase tracking-wide mb-0.5">
                        <RefreshCw size={12} className={dailyDueCount > 0 ? "animate-spin-slow" : ""} /> Akıllı Tekrar
                    </div>
                    <div className="text-xl font-black text-white">Günlük Tekrar</div>
                    <div className="text-white/80 text-[10px] font-medium">
                        {dailyDueCount > 0 ? `${dailyDueCount} kelime tekrar bekliyor` : 'Tüm tekrarlar tamamlandı!'}
                    </div>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform z-10 shrink-0">
                    <Play size={16} className="fill-white ml-0.5 text-white" />
                </div>
            </button>
        </div>

        <div id="category-section" className="grid grid-cols-1 gap-3 w-full max-w-md pb-10">
          {[
              GRADE_DATA['PRIMARY_SCHOOL'], 
              GRADE_DATA['MIDDLE_SCHOOL'], 
              GRADE_DATA['HIGH_SCHOOL'],
              GRADE_DATA['GENERAL_ENGLISH']
           ].map((cat) => {
             return (
                <button key={cat.id} onClick={() => onSelectCategory(cat.id as CategoryType)} className="p-4 rounded-2xl shadow-sm hover:shadow-md border flex flex-row items-center gap-4 transition-all active:scale-98 group relative overflow-hidden text-left" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(255,255,255,0.1)'}}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`} style={{backgroundColor: `var(--color-bg-main)`, color: 'var(--color-text-main)'}}>
                        {cat.image ? (
                            <img src={cat.image} alt={cat.label} className="w-full h-full object-cover rounded-xl" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                            React.isValidElement(cat.icon) ? React.cloneElement(cat.icon as React.ReactElement<any>, { size: 24 }) : cat.icon
                        )}
                    </div>
                    <div className="relative z-10 w-full">
                        <h3 className="text-base font-bold leading-tight" style={{color: 'var(--color-text-main)'}}>{cat.label}</h3>
                        <p className="text-xs font-medium mt-0.5 opacity-70" style={{color: 'var(--color-text-muted)'}}>{cat.subLabel}</p>
                    </div>
                    <ChevronRight className="ml-auto group-hover:translate-x-1 transition-transform opacity-50" size={20} style={{color: 'var(--color-text-muted)'}} />
                </button>
             );
          })}
        </div>

      </div>
    );
  }

  if (!selectedGrade) {
     // ... (Existing Grade Selection Code)
     let gradesToShow: GradeLevel[] = [];
    switch (selectedCategory) {
      case 'PRIMARY_SCHOOL': gradesToShow = ['2', '3', '4']; break;
      case 'MIDDLE_SCHOOL': gradesToShow = ['5', '6', '7', '8']; break;
      case 'HIGH_SCHOOL': gradesToShow = ['9', '10', '11', '12']; break;
      case 'GENERAL_ENGLISH': gradesToShow = ['A1', 'A2', 'B1', 'B2', 'C1']; break;
    }

    return (
      <div className="flex flex-col items-center h-full p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-xl font-black mb-4 text-center mt-2" style={{color: 'var(--color-text-main)'}}>Seviye Seçin</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-4xl pb-8">
          {gradesToShow.map((grade) => {
             const gradeUnitIds = UNIT_ASSETS[grade]?.map(u => u.id).filter(id => !id.endsWith('all') && id !== 'uAll') || [];
             const gradeProgress = calculateProgress(gradeUnitIds);
             
             const gradeVisual = GRADE_DATA[grade];

            return (
              <button key={grade} onClick={() => handleGradeSelect(grade)} className="p-4 rounded-2xl border transition-all active:scale-95 text-left flex flex-col justify-between group shadow-sm hover:shadow-md relative overflow-hidden h-32" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(255,255,255,0.1)'}}>
                 <div className="flex items-start justify-between w-full relative z-10">
                    <div>
                        <div className="font-black text-2xl mb-0.5 tracking-tighter" style={{color: 'var(--color-primary)'}}>{grade.length > 2 ? grade : `${grade}.`}</div>
                        <div className="font-bold text-xs opacity-70" style={{color: 'var(--color-text-muted)'}}>
                            {selectedCategory === 'GENERAL_ENGLISH' ? 'Seviye' : 'Sınıf'}
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm relative z-10 opacity-80 group-hover:opacity-100 transition-opacity" style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-main)'}}>
                        {gradeVisual?.image ? (
                            <img src={gradeVisual.image} alt={grade} className="w-full h-full object-cover rounded-xl" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                            React.isValidElement(gradeVisual?.icon) ? React.cloneElement(gradeVisual.icon as React.ReactElement<any>, { size: 20 }) : <GraduationCap size={20} />
                        )}
                    </div>
                </div>
                
                <div className="mt-auto relative z-10 w-full">
                     <div className="flex justify-between text-[10px] font-bold mb-1" style={{color: 'var(--color-text-muted)'}}>
                        <span>İlerleme</span>
                        <span>%{gradeProgress}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-1000" style={{width: `${gradeProgress}%`}}></div>
                    </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const units = UNIT_ASSETS[selectedGrade] || [];
  const stats = getUserStats();
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col min-h-full">
       {/* ... (Unit List UI remains same) ... */}
       <div className="flex items-center justify-between mb-4 px-1 shrink-0">
         <div>
            <h2 className="text-2xl font-black tracking-tight" style={{color: 'var(--color-primary)'}}>{selectedCategory === 'GENERAL_ENGLISH' ? selectedGrade : `${selectedGrade}. Sınıf`}</h2>
            <p className="text-xs font-medium mt-0.5 opacity-70" style={{color: 'var(--color-text-muted)'}}>Ünite seçip çalışmaya başla.</p>
         </div>
         
         <div className="hidden sm:flex flex-col items-end px-3 py-2 rounded-xl border shadow-sm backdrop-blur-sm" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(255,255,255,0.1)'}}>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1" style={{color: 'var(--color-text-muted)'}}>
               <Target size={12} /> Günlük Hedef
            </div>
            <div className="flex items-center gap-2">
               <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{backgroundColor: 'var(--color-bg-main)'}}>
                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, ((stats.flashcardsViewed + stats.quizCorrect + stats.quizWrong) / stats.dailyGoal) * 100)}%`, backgroundColor: 'var(--color-primary)' }}></div>
               </div>
               <span className="text-[10px] font-bold min-w-[30px] text-right" style={{color: 'var(--color-text-main)'}}>
                  {Math.min(stats.dailyGoal, stats.flashcardsViewed + stats.quizCorrect + stats.quizWrong)}/{stats.dailyGoal}
               </span>
            </div>
         </div>
      </div>

      <div className="mb-6 px-1 flex justify-center sm:justify-start shrink-0">
           <button onClick={() => onStartModule('review', { id: 'review', unitNo: 'Review', title: 'Günlük Tekrar', icon: <RefreshCw /> })} className="w-full max-w-sm rounded-2xl p-3 shadow-md relative overflow-hidden active:scale-[0.99] transition-transform group flex items-center justify-between" style={{background: 'linear-gradient(to right, var(--color-primary), #8b5cf6)'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/20 transition-colors"></div>
              <div className="text-left z-10">
                  <div className="flex items-center gap-1.5 text-white/90 font-bold text-[10px] uppercase tracking-wide mb-0.5">
                      <RefreshCw size={12} className={dailyDueCountForGrade > 0 ? "animate-spin-slow" : ""} /> Akıllı Tekrar
                  </div>
                  <div className="text-lg font-black text-white">Günlük Tekrar</div>
                  <div className="text-white/80 text-[10px] font-medium">
                      {dailyDueCountForGrade > 0 ? `${dailyDueCountForGrade} kelime tekrar bekliyor` : 'Tekrarlar tamamlandı!'}
                  </div>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform z-10">
                  <Play size={16} className="fill-white ml-0.5 text-white" />
              </div>
          </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-1 pb-8">
        {units.map((unit) => {
            const unitProgress = calculateProgress([unit.id]);
            const isSpecialUnit = unit.id.endsWith('all');

            return (
              <div key={unit.id} onClick={() => onSelectUnit(unit)} className="rounded-2xl p-3 border hover:shadow-lg transition-all cursor-pointer group flex items-center gap-3 relative overflow-hidden min-h-[80px]" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(255,255,255,0.1)'}}>
                 <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 overflow-hidden" style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'}}>
                    {unit.image ? (
                       <img src={unit.image} alt={unit.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                       React.isValidElement(unit.icon) ? React.cloneElement(unit.icon as React.ReactElement<any>, { size: 20 }) : unit.icon
                    )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-0.5 truncate opacity-70" style={{color: 'var(--color-text-muted)'}}>{unit.unitNo}</h4>
                        {isSpecialUnit && <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wide border border-amber-200 dark:border-amber-800 ml-1">Özel</span>}
                    </div>
                    <h3 className="text-sm font-bold leading-tight transition-colors line-clamp-2 mb-1" style={{color: 'var(--color-text-main)'}}>{unit.title}</h3>
                    
                    {!isSpecialUnit && (
                      <div className="w-full flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{width: `${unitProgress}%`}}></div>
                        </div>
                        <div className="text-[9px] font-bold opacity-70" style={{color: 'var(--color-text-muted)'}}>%{unitProgress}</div>
                      </div>
                    )}
                 </div>
              </div>
            )
        })}
      </div>
    </div>
  );
};

export default TopicSelector;
