
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Bookmark, Target, RefreshCw, ChevronRight, Clock as ClockIcon,
  Globe, GraduationCap, Play, Star, BookType, CheckCircle, ListChecks, X, Grid3X3, Search, Gamepad2, MapPin, School, Sparkles, Zap, Lightbulb, ArrowLeft
} from 'lucide-react';
import { getUserStats, getTotalDueCount, getMemorizedSet, getUserProfile } from '../services/userService';
import { UnitDef, GradeLevel, StudyMode, CategoryType } from '../types';
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
  onStartModule: (action: 'study' | 'matching' | 'maze' | 'wordSearch' | 'quiz' | 'quiz-bookmarks' | 'quiz-memorized' | 'grammar' | 'practice-select' | 'review' | 'review-flashcards', unit: UnitDef, count?: number) => void;
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
  const [lastActivity, setLastActivity] = React.useState<{grade: string, unit: UnitDef} | null>(null);
  const [memorizedSet, setMemorizedSet] = React.useState<Set<string>>(new Set());
  const [tip, setTip] = useState('');
  
  const [showStudyModes, setShowStudyModes] = useState(false);

  React.useEffect(() => {
    const init = async () => {
      setDailyDueCount(getTotalDueCount());
      setMemorizedSet(getMemorizedSet());
      
      const stats = getUserStats();
      const activity = stats.lastActivity;
      if (activity && activity.grade && activity.unitId) {
        if (UNIT_ASSETS[activity.grade as GradeLevel]) {
          const gradeUnits = UNIT_ASSETS[activity.grade as GradeLevel];
          if (gradeUnits) {
            const unit = gradeUnits.find(u => u.id === activity.unitId);
            if (unit) {
              setLastActivity({ grade: activity.grade, unit });
            }
          }
        }
      }
    };
    
    init();
    
    // Initial Tip
    setTip(APP_TIPS[Math.floor(Math.random() * APP_TIPS.length)]);
    
    // Rotate Tips
    const interval = setInterval(() => {
        setTip(APP_TIPS[Math.floor(Math.random() * APP_TIPS.length)]);
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedGrade, selectedCategory]);
  
  const getMemorizedCountForUnit = (unitId: string) => {
      let count = 0;
      memorizedSet.forEach(key => {
          if (key.startsWith(unitId + '|')) count++;
      });
      return count;
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

  const handleModeSelect = (mode: 'study' | 'matching' | 'maze' | 'wordSearch') => {
      if (selectedUnit) {
          setShowStudyModes(false);
          onStartModule(mode, selectedUnit);
      }
  };

  if (selectedUnit) {
     const memCount = getMemorizedCountForUnit(selectedUnit.id);
     const estimatedProgress = Math.min(100, Math.round((memCount / 20) * 100));

     return (
      <div className="w-full max-w-lg mx-auto p-4 flex flex-col min-h-full justify-start animate-in fade-in zoom-in duration-300 relative">
         <div className="text-center mb-6 pt-2 shrink-0">
            <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-sm ring-4 ring-opacity-20 overflow-hidden" 
                style={{backgroundColor: 'var(--color-bg-card)', color: 'var(--color-primary)', '--tw-ring-color': 'var(--color-primary)'} as React.CSSProperties}
            >
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
                    <span>Ezberlenen</span>
                    <span>{memCount}</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
                    <div className="h-full bg-green-500 transition-all duration-1000" style={{width: `${estimatedProgress}%`}}></div>
                </div>
            </div>
         </div>

         <div className="space-y-2 w-full pb-4 overflow-y-auto px-1">
            <button onClick={handleStudyModeClick} className="w-full p-3 border rounded-2xl flex items-center gap-4 transition-all group text-left shadow-sm hover:shadow-md active:scale-[0.98]" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
               <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0" style={{backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)'}}>
                  <BookOpen size={20} />
               </div>
               <div>
                  <h3 className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>Kelime Çalış & Oyna</h3>
                  <p className="text-[10px] font-medium opacity-70" style={{color: 'var(--color-text-muted)'}}>Kartlar, Bulmaca, Labirent...</p>
               </div>
               <ChevronRight className="ml-auto group-hover:translate-x-1 transition-transform opacity-50" size={16} style={{color: 'var(--color-text-muted)'}} />
            </button>
            <button onClick={() => onStartModule('quiz', selectedUnit)} className="w-full p-3 border rounded-2xl flex items-center gap-4 transition-all group text-left shadow-sm hover:shadow-md active:scale-[0.98]" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
               <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                  <Target size={20} />
               </div>
               <div>
                  <h3 className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>Test Çöz</h3>
                  <p className="text-[10px] font-medium opacity-70" style={{color: 'var(--color-text-muted)'}}>Kendini dene</p>
               </div>
               <ChevronRight className="ml-auto group-hover:translate-x-1 transition-transform opacity-50" size={16} style={{color: 'var(--color-text-muted)'}} />
            </button>
            <button onClick={() => onStartModule('grammar', selectedUnit)} className="w-full p-3 border rounded-2xl flex items-center gap-4 transition-all group text-left shadow-sm hover:shadow-md active:scale-[0.98]" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
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
                <button onClick={() => onStartModule('quiz-bookmarks', selectedUnit)} className="p-3 rounded-2xl border transition-all text-center hover:shadow-md group active:scale-95" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                   <div className="mx-auto w-8 h-8 mb-1 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                      <Bookmark size={16} />
                   </div>
                   <div className="text-[10px] font-bold" style={{color: 'var(--color-text-main)'}}>Favori Testi</div>
                </button>
                <button onClick={() => onStartModule('quiz-memorized', selectedUnit)} className="p-3 rounded-2xl border transition-all text-center hover:shadow-md group active:scale-95" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
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
         {showStudyModes && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="absolute inset-0" onClick={() => setShowStudyModes(false)} />
                <div className="relative w-full max-w-sm rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                    <div className="p-5 border-b flex justify-between items-center" style={{borderColor: 'var(--color-border)'}}>
                        <h3 className="font-black text-lg" style={{color: 'var(--color-text-main)'}}>Çalışma Modu Seç</h3>
                        <button onClick={() => setShowStudyModes(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" style={{color: 'var(--color-text-muted)'}}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3" style={{backgroundColor: 'var(--color-bg-main)'}}>
                        <button onClick={() => handleModeSelect('study')} className="p-4 rounded-2xl border-2 hover:border-indigo-500 transition-all group flex flex-col items-center gap-2" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                            <div className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--color-bg-main)'}}>
                                <BookOpen size={24} />
                            </div>
                            <span className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>Flashcard</span>
                        </button>
                        <button onClick={() => handleModeSelect('matching')} className="p-4 rounded-2xl border-2 hover:border-green-500 transition-all group flex flex-col items-center gap-2" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                            <div className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--color-bg-main)'}}>
                                <Grid3X3 size={24} />
                            </div>
                            <span className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>Eşleştirme</span>
                        </button>
                        <button onClick={() => handleModeSelect('wordSearch')} className="p-4 rounded-2xl border-2 hover:border-blue-500 transition-all group flex flex-col items-center gap-2" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                            <div className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--color-bg-main)'}}>
                                <Search size={24} />
                            </div>
                            <span className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>Bulmaca</span>
                        </button>
                        <button onClick={() => handleModeSelect('maze')} className="p-4 rounded-2xl border-2 hover:border-red-500 transition-all group flex flex-col items-center gap-2" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                            <div className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform" style={{backgroundColor: 'var(--color-bg-main)'}}>
                                <Gamepad2 size={24} />
                            </div>
                            <span className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>Labirent</span>
                        </button>
                    </div>
                </div>
            </div>
         )}
      </div>
     );
  }
  
  if (!selectedCategory) {
    return (
      <div className="flex flex-col items-center h-full p-4 pt-4 animate-in fade-in duration-500 relative overflow-y-auto custom-scrollbar pb-4" style={{ background: 'radial-gradient(ellipse at bottom, rgba(var(--color-primary-rgb), 0.1), transparent 70%)' }}>
        
        <div className="w-full max-w-md space-y-2">
          
          {/* MASCOT & TIPS SECTION */}
          <div className="flex items-end gap-3 w-full max-w-sm mx-auto mb-2 px-2">
              <div className="shrink-0 -mb-2">
                  <Mascot mood="neutral" size={100} />
              </div>
              <div className="flex-1 p-5 rounded-3xl rounded-bl-none shadow-md border relative animate-in fade-in slide-in-from-left-2 duration-500 mb-4 flex items-center min-h-[5.5rem]"
                   style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                  {/* Tip Content */}
                  <p className="text-sm font-semibold leading-relaxed" style={{color: 'var(--color-text-main)'}}>
                      {tip}
                  </p>
                  
                  {/* Bubble Tail */}
                  <div 
                    className="absolute -left-3 bottom-0 w-0 h-0 border-l-[16px] border-l-transparent border-t-[16px] border-r-[16px] border-r-transparent transform translate-y-[0px] rotate-0"
                    style={{borderTopColor: 'var(--color-bg-card)'}}
                  ></div>
              </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-24">
            {/* Daily Review & Last Activity */}
            <div className="grid grid-cols-1 gap-4">
                {/* Son Kaldığın Yer */}
                {lastActivity && (
                  <button 
                    onClick={() => { onSelectGrade(lastActivity.grade as GradeLevel); onSelectUnit(lastActivity.unit); }}
                    className="w-full h-auto min-h-[4.5rem] py-3 rounded-[1.5rem] px-4 relative overflow-hidden group shadow-lg border flex items-center justify-between active:scale-95 transition-transform"
                    style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-9 h-9 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 group-hover:text-orange-300 transition-colors shrink-0">
                            <ClockIcon size={18} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <div className="text-[9px] font-bold uppercase tracking-wide mb-0.5" style={{color: 'var(--color-text-muted)'}}>Son Kaldığın Yer</div>
                            <div className="font-bold text-sm leading-tight line-clamp-2" style={{color: 'var(--color-text-main)'}}>
                                {lastActivity.grade}. Sınıf - {lastActivity.unit.title}
                            </div>
                        </div>
                    </div>
                    <ChevronRight size={18} style={{color: 'var(--color-text-muted)'}} className="group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                  </button>
                )}

                {/* Daily Review */}
                <button 
                  onClick={() => onStartModule('review', { id: 'global_review', unitNo: 'Review', title: 'Günlük Tekrar', icon: <RefreshCw /> })}
                  className={`w-full h-auto min-h-[4.5rem] py-3 rounded-[1.5rem] px-4 relative overflow-hidden group shadow-lg border border-transparent flex items-center justify-between active:scale-95 transition-transform ${dailyDueCount > 0 ? 'bg-gradient-to-r from-emerald-600 to-green-500' : 'bg-green-600'}`}
                >
                  <div className="flex items-center gap-3 relative z-10 flex-1">
                      <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm shrink-0">
                          {dailyDueCount > 0 ? <RefreshCw size={18} className="animate-spin-slow" /> : <CheckCircle size={18} />}
                      </div>
                      <div className="text-left">
                          <div className="text-[9px] font-bold text-white/80 uppercase tracking-wide mb-0.5">{dailyDueCount > 0 ? 'GÜNLÜK TEKRAR' : 'TAMAMLANDI'}</div>
                          <div className="text-white font-black text-base leading-tight">
                              {dailyDueCount > 0 ? 'Tekrarını Yap' : 'Tüm Tekrarlar Bitti'}
                          </div>
                          {dailyDueCount === 0 && (
                              <div className="text-[9px] text-white/80 font-medium mt-0.5">Harika! Bugünlük bu kadar.</div>
                          )}
                      </div>
                  </div>
                  
                  {/* Simple Count Box (Fixed Overflow) */}
                  {dailyDueCount > 0 && (
                      <div className="relative z-10 bg-white/20 backdrop-blur-md rounded-xl px-3 py-1 border border-white/30 text-white font-black text-lg min-w-[2.5rem] text-center shadow-inner ml-2 shrink-0">
                          {dailyDueCount}
                      </div>
                  )}
                  {dailyDueCount === 0 && (
                      <div className="relative z-10 opacity-50 shrink-0 ml-2">
                          <CheckCircle size={28} className="text-white" />
                      </div>
                  )}
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 gap-4 pt-1">
                <button 
                  onClick={() => onSelectCategory('PRIMARY_SCHOOL')}
                  className="p-3 rounded-2xl border transition-all active:scale-95 shadow-sm group flex flex-col items-center justify-center text-center"
                  style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}
                >
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                    style={{backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)'}}
                  >
                      <Star size={18} />
                  </div>
                  <div>
                    <div className="font-black text-sm" style={{color: 'var(--color-text-main)'}}>İlkokul</div>
                    <div className="text-[10px] font-bold" style={{color: 'var(--color-text-muted)'}}>2-4. Sınıflar</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => onSelectCategory('MIDDLE_SCHOOL')}
                  className="p-3 rounded-2xl border transition-all active:scale-95 shadow-sm group flex flex-col items-center justify-center text-center"
                  style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}
                >
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                    style={{backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)'}}
                  >
                      <School size={18} />
                  </div>
                  <div>
                    <div className="font-black text-sm" style={{color: 'var(--color-text-main)'}}>Ortaokul</div>
                    <div className="text-[10px] font-bold" style={{color: 'var(--color-text-muted)'}}>5-8. Sınıflar</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => onSelectCategory('HIGH_SCHOOL')}
                  className="p-3 rounded-2xl border transition-all active:scale-95 shadow-sm group flex flex-col items-center justify-center text-center"
                  style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}
                >
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                    style={{backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)'}}
                  >
                      <GraduationCap size={18} />
                  </div>
                  <div>
                    <div className="font-black text-sm" style={{color: 'var(--color-text-main)'}}>Lise</div>
                    <div className="text-[10px] font-bold" style={{color: 'var(--color-text-muted)'}}>9-12. Sınıflar</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => onSelectCategory('GENERAL_ENGLISH')}
                  className="p-3 rounded-2xl border transition-all active:scale-95 shadow-sm group flex flex-col items-center justify-center text-center"
                  style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}
                >
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                    style={{backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)'}}
                  >
                      <Globe size={18} />
                  </div>
                  <div>
                    <div className="font-black text-sm" style={{color: 'var(--color-text-main)'}}>Genel İng.</div>
                    <div className="text-[10px] font-bold" style={{color: 'var(--color-text-muted)'}}>A1-C1 Seviye</div>
                  </div>
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedGrade) {
     let gradesToShow: GradeLevel[] = [];
    switch (selectedCategory) {
      case 'PRIMARY_SCHOOL': gradesToShow = ['2', '3', '4']; break;
      case 'MIDDLE_SCHOOL': gradesToShow = ['5', '6', '7', '8']; break;
      case 'HIGH_SCHOOL': gradesToShow = ['9', '10', '11', '12']; break;
      case 'GENERAL_ENGLISH': gradesToShow = ['A1', 'A2', 'B1', 'B2', 'C1']; break;
    }

    return (
      <div className="flex flex-col items-center h-full p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full relative">
        <h2 className="text-xl font-black mb-4 text-center mt-2" style={{color: 'var(--color-text-main)'}}>Seviye Seçin</h2>
        <div className="space-y-2 w-full max-w-lg pb-4">
          {gradesToShow.map((grade) => {
             const gradeVisual = GRADE_DATA[grade];
            return (
              <button 
                key={grade} 
                onClick={() => handleGradeSelect(grade)} 
                className="w-full p-4 rounded-2xl border transition-all active:scale-[0.98] text-left flex items-center gap-4 group shadow-sm hover:shadow-md relative overflow-hidden" 
                style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(255,255,255,0.1)'}}
              >
                 <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm relative z-10 shrink-0 group-hover:scale-110 transition-transform" 
                    style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-main)'}}
                 >
                    {gradeVisual?.image ? (
                        <img src={gradeVisual.image} alt={grade} className="w-full h-full object-cover rounded-xl" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                        React.isValidElement(gradeVisual?.icon) ? React.cloneElement(gradeVisual.icon as React.ReactElement<any>, { size: 24 }) : <GraduationCap size={24} />
                    )}
                 </div>
                 <div className="flex-1 relative z-10">
                    <div className="font-black text-xl tracking-tight" style={{color: 'var(--color-primary)'}}>{grade.length > 2 ? grade : `${grade}. Sınıf`}</div>
                    <div className="font-bold text-xs opacity-70" style={{color: 'var(--color-text-muted)'}}>
                        {selectedCategory === 'GENERAL_ENGLISH' ? 'Seviye' : 'İngilizce'}
                    </div>
                 </div>
                 <ChevronRight className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
    <div className="w-full max-w-6xl mx-auto p-4 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col min-h-full">
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-1 pb-4">
        {units.map((unit) => {
            const memCount = getMemorizedCountForUnit(unit.id);
            const isSpecialUnit = unit.id.endsWith('all');
            const approxProgress = Math.min(100, (memCount / 20) * 100);
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
                            <div className="h-full bg-green-500" style={{width: `${approxProgress}%`}}></div>
                        </div>
                        <div className="text-[9px] font-bold opacity-70" style={{color: 'var(--color-text-muted)'}}>{memCount} Ezber</div>
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
