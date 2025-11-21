import React, { useState, useEffect } from 'react';
import { WordCard, AppMode } from './types';
import { VOCABULARY, getRandomWords } from './data/vocabulary';
import TopicSelector, { GradeLevel, UnitDef, StudyMode, UNIT_DATA, CategoryType } from './components/TopicSelector';
import FlashcardDeck from './components/FlashcardDeck';
import Quiz from './components/Quiz';
import Profile from './components/Profile';
import GrammarView from './components/GrammarView';
import WordSelector from './components/WordSelector';
import InfoView from './components/InfoView';
import EmptyStateWarning from './components/EmptyStateWarning';
import Celebration from './components/Celebration';
import { BookOpen, Sparkles, Home, ChevronLeft, UserCircle, Sun, Moon, CircleHelp } from 'lucide-react';
import { getUserProfile, getTheme, saveTheme, getMemorizedSet, getDueWords, saveLastActivity } from './services/userService';

const App: React.FC = () => {
  // --- Global State ---
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Data State
  const [topicTitle, setTopicTitle] = useState<string>('');
  const [words, setWords] = useState<WordCard[]>([]);
  const [allUnitWords, setAllUnitWords] = useState<WordCard[]>([]);

  // Navigation/Selection State
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [selectedStudyMode, setSelectedStudyMode] = useState<StudyMode | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnitDef | null>(null);

  // Quiz Type State
  const [activeQuizType, setActiveQuizType] = useState<'standard' | 'bookmarks' | 'memorized' | 'custom' | 'review'>('standard');
  
  // SRS Flashcard State
  const [isSRSReview, setIsSRSReview] = useState(false);

  // Empty Warning State
  const [emptyWarningType, setEmptyWarningType] = useState<'bookmarks' | 'memorized' | null>(null);

  // Celebration State
  const [celebration, setCelebration] = useState<{ show: boolean; message: string; type: 'unit' | 'quiz' | 'goal' } | null>(null);

  // Initialize Theme
  useEffect(() => {
    const savedTheme = getTheme();
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Scroll to top on navigation changes
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) root.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [mode, selectedGrade, selectedUnit, selectedStudyMode, selectedCategory]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      saveTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      saveTheme('light');
    }
  };

  // --- Logic ---

  const handleTriggerCelebration = (message: string, type: 'unit' | 'quiz' | 'goal') => {
    setCelebration({ show: true, message, type });
  };

  // Handle "Back" Click (Smart Navigation)
  const handleGlobalBack = () => {
    if (mode === AppMode.PROFILE || mode === AppMode.INFO) {
      setMode(AppMode.HOME);
      setTopicTitle('');
      return;
    }

    // Reset specific modes
    setIsSRSReview(false);

    if (mode !== AppMode.HOME) {
      // If in CUSTOM_PRACTICE (Word Selector), go back to unit view (HOME)
      setMode(AppMode.HOME);
      setWords([]);
      setAllUnitWords([]);
      // Keep topicTitle for transition or clear it
    } else {
      // If in TopicSelector menus, step back one level
      if (selectedUnit) {
        setSelectedUnit(null);
      } else if (selectedStudyMode) {
        setSelectedStudyMode(null);
      } else if (selectedGrade) {
        setSelectedGrade(null);
      } else if (selectedCategory) {
        setSelectedCategory(null);
      }
    }
  };

  // Handle "Home" Click
  const handleGoHome = () => {
    setMode(AppMode.HOME);
    setTopicTitle('');
    setWords([]);
    setAllUnitWords([]);
    setSelectedUnit(null);
    setSelectedStudyMode(null);
    setSelectedGrade(null);
    setSelectedCategory(null);
    setIsSRSReview(false);
  };

  const handleOpenProfile = () => {
    setMode(AppMode.PROFILE);
    setTopicTitle('Profilim');
  };

  const handleOpenInfo = () => {
    setMode(AppMode.INFO);
    setTopicTitle('İpuçları & Taktikler');
  };

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleStartModule = (
    action: 'study' | 'quiz' | 'quiz-bookmarks' | 'quiz-memorized' | 'grammar' | 'practice-select' | 'review' | 'review-flashcards',
    unit: UnitDef,
    quizCount?: number
  ) => {
    
    // SAVE ACTIVITY (If it's a regular unit study/quiz, not SRS review)
    if (selectedGrade && unit.id !== 'review' && !unit.id.endsWith('all') && unit.id !== 'uAll') {
       saveLastActivity(selectedGrade, unit.id);
    }

    let unitWords: WordCard[] = [];
    let allDistractors: WordCard[] = [];

    const isAllInOne = unit.id.endsWith('all') || unit.id === 'uAll';

    if (action === 'review' || action === 'review-flashcards') {
        // For Review mode, get words from SRS (Service returns words with unitId already attached)
        unitWords = getDueWords();
        // For review distractors, use everything in the app
        allDistractors = Object.entries(VOCABULARY).flatMap(([uid, words]) => 
            words.map(w => ({...w, unitId: uid}))
        );
    } else {
        // Standard Unit Logic
        if (isAllInOne && selectedGrade) {
            const units = UNIT_DATA[selectedGrade];
            units.forEach(u => {
                if (u.id !== unit.id && VOCABULARY[u.id]) {
                    // Inject unitId into each word
                    const taggedWords = VOCABULARY[u.id].map(w => ({ ...w, unitId: u.id }));
                    unitWords = [...unitWords, ...taggedWords];
                }
            });
        } else {
            // Inject unitId into each word
            unitWords = (VOCABULARY[unit.id] || []).map(w => ({ ...w, unitId: unit.id }));
        }
        allDistractors = unitWords; // Use unit words as default distractors
    }

    setAllUnitWords(allDistractors); // Store for distractors

    let activeWords: WordCard[] = [];
    let newMode = AppMode.HOME;
    let newTitle = (action === 'review' || action === 'review-flashcards') ? 'Günlük Tekrar' : (isAllInOne ? unit.title : `${unit.unitNo} - ${unit.title}`);

    // Check for empty unit content
    if (action !== 'grammar' && unitWords.length === 0 && action !== 'quiz-bookmarks' && action !== 'quiz-memorized') {
      alert("Bu ünite için içerik henüz hazırlanmaktadır veya tekrar edilecek kelime yok.");
      return;
    }

    if (action === 'study') {
      // Always shuffle for study mode
      activeWords = shuffleArray(unitWords);
      newMode = AppMode.FLASHCARDS;
    } else if (action === 'quiz') {
      // Pick requested number of words or default (20/30)
      const count = quizCount || (isAllInOne ? 30 : 20);
      
      const shuffled = shuffleArray(unitWords);
      if (shuffled.length > count) {
        activeWords = shuffled.slice(0, count);
      } else {
        activeWords = shuffled;
      }
      
      setActiveQuizType('standard');
      newMode = AppMode.QUIZ;
    } else if (action === 'grammar') {
      newMode = AppMode.GRAMMAR;
      newTitle += ' (Gramer)';
    } else if (action === 'practice-select') {
      // Go to custom word selection screen
      activeWords = unitWords; // Pass all words to selector
      newMode = AppMode.CUSTOM_PRACTICE;
      newTitle += ' (Özel Çalışma)';
    } else if (action === 'quiz-bookmarks') {
      try {
        const stored = localStorage.getItem('lgs_bookmarks');
        const bookmarkSet = stored ? new Set(JSON.parse(stored)) : new Set();
        // Check using unique key format: unitId|english
        const bookmarkedWords = unitWords.filter(w => {
            const key = w.unitId ? `${w.unitId}|${w.english}` : w.english;
            return bookmarkSet.has(key);
        });
        
        if (bookmarkedWords.length === 0) {
          setEmptyWarningType('bookmarks');
          setMode(AppMode.EMPTY_WARNING);
          setTopicTitle(newTitle);
          return;
        }

        activeWords = shuffleArray(bookmarkedWords);
        setActiveQuizType('bookmarks');
        newMode = AppMode.QUIZ;
        newTitle += ' (Favori Test)';

      } catch (e) {
        console.error("Error loading bookmarks", e);
        return;
      }
    } else if (action === 'quiz-memorized') {
        const memorizedSet = getMemorizedSet();
        // Check using unique key format: unitId|english
        const memorizedWords = unitWords.filter(w => {
            const key = w.unitId ? `${w.unitId}|${w.english}` : w.english;
            return memorizedSet.has(key);
        });

        if (memorizedWords.length === 0) {
             setEmptyWarningType('memorized');
             setMode(AppMode.EMPTY_WARNING);
             setTopicTitle(newTitle);
             return;
        }
        
        activeWords = shuffleArray(memorizedWords);
        setActiveQuizType('memorized');
        newMode = AppMode.QUIZ;
        newTitle += ' (Ezberlediklerimle Quiz)';
    } else if (action === 'review') {
        activeWords = shuffleArray(unitWords);
        setActiveQuizType('review');
        newMode = AppMode.QUIZ;
    } else if (action === 'review-flashcards') {
        activeWords = shuffleArray(unitWords);
        setIsSRSReview(true);
        newMode = AppMode.FLASHCARDS;
        newTitle += ' (Kartlar)';
    }

    setWords(activeWords);
    setTopicTitle(newTitle);
    setMode(newMode);
  };

  const handleCustomPracticeStart = (selectedWords: WordCard[], startMode: 'study' | 'quiz') => {
      if (startMode === 'study') {
        setWords(shuffleArray(selectedWords));
        setMode(AppMode.FLASHCARDS);
      } else {
        // For quiz, pass selected words. 
        // Distractors will come from 'allUnitWords' which is already set in handleStartModule
        setWords(shuffleArray(selectedWords));
        setActiveQuizType('custom');
        setMode(AppMode.QUIZ);
      }
  };

  const showBackButton = (mode !== AppMode.HOME) || (selectedCategory !== null);
  
  let content;
  switch (mode) {
    case AppMode.HOME:
      content = (
        <TopicSelector 
          selectedCategory={selectedCategory}
          selectedGrade={selectedGrade}
          selectedMode={selectedStudyMode}
          selectedUnit={selectedUnit}
          onSelectCategory={setSelectedCategory}
          onSelectGrade={setSelectedGrade}
          onSelectMode={setSelectedStudyMode}
          onSelectUnit={setSelectedUnit}
          onStartModule={handleStartModule}
          onGoHome={handleGoHome}
        />
      );
      break;
    case AppMode.LOADING:
      content = <div className="text-center mt-20 text-slate-500 dark:text-slate-400">Yükleniyor...</div>;
      break;
    case AppMode.FLASHCARDS:
      content = (
        <FlashcardDeck 
          words={words} 
          onFinish={handleGlobalBack} 
          onBack={handleGlobalBack} 
          onHome={handleGoHome}
          isReviewMode={isSRSReview}
          onCelebrate={handleTriggerCelebration}
        />
      );
      break;
    case AppMode.QUIZ:
      content = (
        <Quiz 
          words={words} 
          allWords={allUnitWords}
          onRestart={() => setMode(AppMode.QUIZ)} 
          onBack={handleGlobalBack}
          onHome={handleGoHome}
          isBookmarkQuiz={activeQuizType === 'bookmarks'}
          onCelebrate={handleTriggerCelebration}
        />
      );
      break;
    case AppMode.CUSTOM_PRACTICE:
      content = (
        <WordSelector
          words={allUnitWords} // Pass all words for selection
          unitTitle={topicTitle.replace(' (Özel Çalışma)', '')}
          onStart={handleCustomPracticeStart}
          onBack={handleGlobalBack}
        />
      );
      break;
    case AppMode.GRAMMAR:
      if (selectedUnit) {
        content = (
          <GrammarView 
            unit={selectedUnit} 
            onBack={handleGlobalBack}
            onHome={handleGoHome}
          />
        );
      }
      break;
    case AppMode.EMPTY_WARNING:
      content = (
        <EmptyStateWarning 
          type={emptyWarningType || 'bookmarks'} 
          onStudy={() => selectedUnit && handleStartModule('study', selectedUnit)}
          onHome={handleGoHome}
        />
      );
      break;
    case AppMode.PROFILE:
      content = <Profile onBack={handleGlobalBack} />;
      break;
    case AppMode.INFO:
      content = <InfoView onBack={handleGlobalBack} />;
      break;
    case AppMode.ERROR:
      content = <div className="text-center p-10 text-red-500">Bir hata oluştu.</div>;
      break;
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pt-safe pb-safe">
      
      {celebration?.show && (
        <Celebration 
          message={celebration.message} 
          type={celebration.type} 
          onClose={() => setCelebration(null)} 
        />
      )}

      {/* Global Sticky Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* Left: Back Button or Logo */}
          <div className="flex items-center gap-2 min-w-fit">
            {showBackButton ? (
              <button 
                onClick={handleGlobalBack}
                className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-xl font-bold transition-all active:scale-95"
              >
                <ChevronLeft size={20} />
                <span className="text-sm">Geri</span>
              </button>
            ) : (
              <div 
                className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-transform" 
                onClick={handleGoHome}
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <BookOpen size={18} strokeWidth={3} />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">Kelim<span className="text-indigo-600 dark:text-indigo-400">App</span></span>
              </div>
            )}
          </div>
          
          {/* Center: Title (Only when in a module) */}
          {mode !== AppMode.HOME && topicTitle && (
            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 max-w-[40%]">
              <Sparkles size={14} className="text-indigo-500 flex-shrink-0" />
              <span className="font-semibold truncate">{topicTitle}</span>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 justify-end min-w-fit">
             
             {mode !== AppMode.INFO && (
               <button
                 onClick={handleOpenInfo}
                 className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 transition-all"
                 title="Bilmen Gerekenler"
               >
                 <CircleHelp size={20} />
               </button>
             )}

             <button
               onClick={toggleTheme}
               className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 transition-all"
               title={darkMode ? "Aydınlık Mod" : "Karanlık Mod"}
             >
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             {mode !== AppMode.PROFILE && (
               <button
                 onClick={handleOpenProfile}
                 className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 transition-all"
                 title="Profilim"
               >
                 <UserCircle size={22} />
               </button>
             )}
             
             <button 
               onClick={handleGoHome}
               className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 transition-all"
               title="Ana Sayfa"
             >
               <Home size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-5xl mx-auto flex flex-col relative">
        {content}
      </main>

      {/* Footer - Hidden in certain modes for cleaner app look */}
      {mode === AppMode.HOME && (
        <footer className="py-6 text-center text-slate-400 dark:text-slate-600 text-xs border-t border-slate-100 dark:border-slate-800 mt-auto transition-colors">
          <p>© {new Date().getFullYear()} KelimApp • Offline Study</p>
        </footer>
      )}
    </div>
  );
};

export default App;