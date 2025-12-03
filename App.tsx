
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WordCard, AppMode, Badge, ThemeType, UnitDef, GradeLevel, StudyMode, CategoryType, QuizDifficulty } from './types';
import { VOCABULARY } from './data/vocabulary';
import TopicSelector from './components/TopicSelector';
import { UNIT_ASSETS, UI_ICONS, AVATARS, FRAMES, BACKGROUNDS, BADGES } from './data/assets';
import FlashcardDeck from './components/FlashcardDeck';
import Quiz from './components/Quiz';
import Profile from './components/Profile';
import GrammarView from './components/GrammarView';
import WordSelector from './components/WordSelector';
import InfoView from './components/InfoView';
import AnnouncementsView from './components/AnnouncementsView';
import EmptyStateWarning from './components/EmptyStateWarning';
import Celebration from './components/Celebration';
import SettingsModal from './components/SettingsModal';
import QuizSetupModal from './components/QuizSetupModal';
import SRSInfoModal from './components/SRSInfoModal';
import GradeSelectionModal from './components/GradeSelectionModal';
import MarketModal from './components/MarketModal';
import AvatarModal from './components/AvatarModal';
import AuthModal from './components/AuthModal';
import OnboardingModal from './components/OnboardingModal';
import FeedbackModal from './components/FeedbackModal';
import AdminModal from './components/AdminModal'; 
import InstallPromptModal from './components/InstallPromptModal';
import OnboardingTutorial from './components/OnboardingTutorial';
import { ChevronLeft, Zap, Trophy, User } from 'lucide-react';
import { getUserProfile, getTheme, saveTheme, getAppSettings, getMemorizedSet, getDueWords, saveLastActivity, getLastReadAnnouncementId, setLastReadAnnouncementId, checkDataVersion, getDueGrades, getUserStats, updateTimeSpent, clearLocalUserData, UserStats } from './services/userService';
import { getAuthInstance, syncLocalToCloud, subscribeToUserChanges, syncData } from './services/firebase'; 
import { ANNOUNCEMENTS } from './data/announcements';
import { playSound } from './services/soundService';
import { APP_CONFIG } from './config/appConfig';
// Capacitor Imports
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { onAuthStateChanged } from 'firebase/auth';
import MatchingGame from './components/MatchingGame'; 
import TypingGame from './components/TypingGame'; 
import WordChainGame from './components/WordChainGame'; 
import MazeGame from './components/MazeGame'; 
import WordSearchGame from './components/WordSearchGame'; 

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark');
  
  const [userStats, setUserStats] = useState<UserStats>(getUserStats());

  const [showSettings, setShowSettings] = useState(false);
  const [showSRSInfo, setShowSRSInfo] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showGradeSelection, setShowGradeSelection] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); 
  const [showAdminModal, setShowAdminModal] = useState(false); 
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false); 

  const [availableGradesForReview, setAvailableGradesForReview] = useState<string[]>([]);
  const [topicTitle, setTopicTitle] = useState<string>('');
  const [words, setWords] = useState<WordCard[]>([]);
  const [allUnitWords, setAllUnitWords] = useState<WordCard[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [selectedStudyMode, setSelectedStudyMode] = useState<StudyMode | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnitDef | null>(null);

  const [activeQuizType, setActiveQuizType] = useState<'standard' | 'bookmarks' | 'memorized' | 'custom' | 'review'>('standard');
  const [activeQuizDifficulty, setActiveQuizDifficulty] = useState<QuizDifficulty>('normal');
  
  const [pendingQuizConfig, setPendingQuizConfig] = useState<{
    words: WordCard[]; 
    allDistractors: WordCard[]; 
    title: string; 
    type: 'standard' | 'bookmarks' | 'memorized' | 'custom' | 'review';
  } | null>(null);
  
  const lastQuizConfig = useRef<{count: number, difficulty: QuizDifficulty, originalWords: WordCard[], allDistractors: WordCard[]} | null>(null);
  
  const lastActiveTime = useRef<number>(Date.now());

  const [isSRSReview, setIsSRSReview] = useState(false);
  const [emptyWarningType, setEmptyWarningType] = useState<'bookmarks' | 'memorized' | null>(null);
  const [celebration, setCelebration] = useState<{ show: boolean; message: string; type: 'unit' | 'quiz' | 'goal' } | null>(null);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [hasUnreadAnnouncements, setHasUnreadAnnouncements] = useState(false);

  const [isBoostActive, setIsBoostActive] = useState(false);
  const [boostTimeLeft, setBoostTimeLeft] = useState('');
  
  const [headerProfile, setHeaderProfile] = useState(getUserProfile());

  const refreshGlobalState = () => {
      setUserStats(getUserStats());
      setHeaderProfile(getUserProfile());
  };

  useEffect(() => {
    const preloadImages = () => {
      const imagesToPreload: string[] = [
        'https://8upload.com/image/1641107f2693dc1d/WAIT.gif',
        'https://8upload.com/image/596771d7c98774d8/HAPPY.gif',
        'https://8upload.com/image/53ce9b7a4f38eefa/SAD.gif',
        'https://8upload.com/image/24fff6d1ca0ec801/Gemini_Generated_Image_1ri1941ri1941ri1.png'
      ];

      AVATARS.forEach(a => {
          if (a.image) imagesToPreload.push(a.image);
          else if (a.icon && a.icon.startsWith('http')) imagesToPreload.push(a.icon);
      });

      BADGES.forEach(b => {
          if (b.image) imagesToPreload.push(b.image);
          else if (b.icon && b.icon.startsWith('http')) imagesToPreload.push(b.icon);
      });

      FRAMES.forEach(f => {
          if (f.image) imagesToPreload.push(f.image);
      });

      BACKGROUNDS.forEach(b => {
          if (b.image) imagesToPreload.push(b.image);
      });
      
      Object.values(UNIT_ASSETS).flat().forEach(u => {
          if (u.image) imagesToPreload.push(u.image);
      });

      const uniqueImages = [...new Set(imagesToPreload)];

      uniqueImages.forEach(src => {
          const img = new Image();
          img.src = src;
      });
    };

    setTimeout(preloadImages, 2000);
  }, []);


  const applyUserProfileGrade = useCallback(() => {
    const userProfile = getUserProfile();
    const g = userProfile.grade;
    if (!g) return;
    if (['2', '3', '4'].includes(g)) setSelectedCategory('PRIMARY_SCHOOL');
    else if (['5', '6', '7', '8'].includes(g)) setSelectedCategory('MIDDLE_SCHOOL');
    else if (['9', '10', '11', '12'].includes(g)) setSelectedCategory('HIGH_SCHOOL');
    else if (['A1', 'A2', 'B1', 'B2', 'C1'].includes(g)) setSelectedCategory('GENERAL_ENGLISH');
  }, []);

  const applyTheme = (theme: ThemeType) => {
      document.documentElement.classList.remove('dark');
      if (theme === 'light' || theme === 'retro' || theme === 'comic' || theme === 'nature_soft') {
          document.documentElement.classList.remove('dark');
      } else {
          document.documentElement.classList.add('dark');
      }
      setCurrentTheme(theme);
  };

  useEffect(() => {
      const auth = getAuthInstance();
      let unsubscribeSnapshot: (() => void) | undefined;

      // Initialize theme
      const currentSettings = getAppSettings();
      applyTheme(currentSettings.theme);

      if (auth) {
          const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
              if (!user) {
                  // If no user logged in, trigger Auth Modal
                  const localProfile = getUserProfile();
                  if (!localProfile.name) {
                       setShowAuthModal(true);
                  }
                  if (unsubscribeSnapshot) {
                      unsubscribeSnapshot();
                      unsubscribeSnapshot = undefined;
                  }
              } else {
                  const lastUid = localStorage.getItem('lgs_last_uid');
                  if (lastUid && lastUid !== user.uid) {
                      // New user logged in, clear previous local data
                      clearLocalUserData();
                  }
                  localStorage.setItem('lgs_last_uid', user.uid);

                  if (navigator.onLine) {
                      await syncData(user.uid);
                  }

                  refreshGlobalState();
                  
                  // Re-apply theme in case user data has different theme
                  const updatedSettings = getAppSettings();
                  applyTheme(updatedSettings.theme);
                  
                  if (navigator.onLine) {
                           unsubscribeSnapshot = subscribeToUserChanges(user.uid, () => {
                               refreshGlobalState();
                               const newestSettings = getAppSettings();
                               applyTheme(newestSettings.theme);
                           });
                  }
              }
          });

          return () => {
              unsubscribeAuth();
              if (unsubscribeSnapshot) unsubscribeSnapshot();
          };
      }
      // Note: If auth is not available (e.g. initialization failed), we still allow app to run but AuthModal might pop up if local profile missing.
  }, []);

  useEffect(() => {
      const handleVisibilityChange = async () => {
          if (document.visibilityState === 'visible') {
              const now = Date.now();
              const hoursSinceLastActive = (now - lastActiveTime.current) / (1000 * 60 * 60);

              if (hoursSinceLastActive > 3) {
                  window.location.reload();
                  return;
              }

              const auth = getAuthInstance();
              const user = auth?.currentUser;
              if (user && navigator.onLine) {
                  await syncData(user.uid);
                  refreshGlobalState();
                  const currentSettings = getAppSettings();
                  applyTheme(currentSettings.theme);
              }
              
              lastActiveTime.current = now;
          } else {
              lastActiveTime.current = Date.now();
          }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
  }, []);


  useEffect(() => {
      window.history.pushState({ appState: 'root' }, '', window.location.href);
  }, []);

  useEffect(() => {
      if (Capacitor.isNativePlatform()) {
          const configureStatusBar = async () => {
              try {
                  await StatusBar.setStyle({ style: currentTheme === 'light' ? Style.Light : Style.Dark });
                  if (Capacitor.getPlatform() === 'android') {
                      await StatusBar.setBackgroundColor({ color: currentTheme === 'light' ? '#f8fafc' : '#0f172a' });
                  }
              } catch (e) {
                  console.log("Status bar not supported in this environment");
              }
          };
          configureStatusBar();
      }
  }, [currentTheme]);

  useEffect(() => {
      const timeInterval = setInterval(() => {
          const earnedBadges = updateTimeSpent(1);
          if (earnedBadges.length > 0) {
              earnedBadges.forEach(b => handleBadgeUnlock(b));
          }
      }, 60000);

      return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    body.className = body.className.replace(/theme-\S+/g, '');
    body.classList.add(`theme-${currentTheme}`);

    let primary = '#4f46e5'; 
    let bgMain = '#0f172a'; 
    let bgCard = '#1e293b'; 
    let textMain = '#f8fafc'; 
    let textMuted = '#94a3b8'; 
    let border = '#334155'; 

    switch (currentTheme) {
        case 'light': primary = '#4f46e5'; bgMain = '#f8fafc'; bgCard = '#ffffff'; textMain = '#0f172a'; textMuted = '#64748b'; border = '#e2e8f0'; break;
        case 'neon': primary = '#33ff00'; bgMain = '#000000'; bgCard = '#111111'; textMain = '#33ff00'; textMuted = '#00cc00'; border = '#33ff00'; break;
        case 'ocean': primary = '#0ea5e9'; bgMain = '#0c4a6e'; bgCard = '#075985'; textMain = '#e0f2fe'; textMuted = '#7dd3fc'; border = '#0369a1'; break;
        case 'sunset': primary = '#f97316'; bgMain = '#431407'; bgCard = '#7c2d12'; textMain = '#ffedd5'; textMuted = '#fdba74'; border = '#9a3412'; break;
        case 'forest': primary = '#22c55e'; bgMain = '#052e16'; bgCard = '#14532d'; textMain = '#dcfce7'; textMuted = '#86efac'; border = '#15803d'; break;
        case 'royal': primary = '#fbbf24'; bgMain = '#312e81'; bgCard = '#4338ca'; textMain = '#fef3c7'; textMuted = '#fde68a'; border = '#fbbf24'; break;
        case 'candy': primary = '#f472b6'; bgMain = '#831843'; bgCard = '#9d174d'; textMain = '#fce7f3'; textMuted = '#fbcfe8'; border = '#be185d'; break;
        case 'cyberpunk': primary = '#facc15'; bgMain = '#18181b'; bgCard = '#27272a'; textMain = '#facc15'; textMuted = '#06b6d4'; border = '#facc15'; break;
        case 'coffee': primary = '#d7ccc8'; bgMain = '#3e2723'; bgCard = '#4e342e'; textMain = '#d7ccc8'; textMuted = '#a1887f'; border = '#6d4c41'; break;
        case 'galaxy': primary = '#c084fc'; bgMain = '#0f172a'; bgCard = '#1e1b4b'; textMain = '#e9d5ff'; textMuted = '#a855f7'; border = '#6b21a8'; break;
        case 'retro': primary = '#d33682'; bgMain = '#fdf6e3'; bgCard = '#eee8d5'; textMain = '#657b83'; textMuted = '#93a1a1'; border = '#b58900'; break;
        case 'matrix': primary = '#00ff41'; bgMain = '#000000'; bgCard = '#001100'; textMain = '#00ff41'; textMuted = '#008f11'; border = '#003b00'; break;
        case 'midnight': primary = '#6366f1'; bgMain = '#020617'; bgCard = '#1e293b'; textMain = '#e2e8f0'; textMuted = '#94a3b8'; border = '#334155'; break;
        case 'volcano': primary = '#ef4444'; bgMain = '#1a0505'; bgCard = '#2b0b0b'; textMain = '#fee2e2'; textMuted = '#fca5a5'; border = '#7f1d1d'; break;
        case 'ice': primary = '#06b6d4'; bgMain = '#083344'; bgCard = '#164e63'; textMain = '#cffafe'; textMuted = '#67e8f9'; border = '#155e75'; break;
        case 'lavender': primary = '#a78bfa'; bgMain = '#2e1065'; bgCard = '#4c1d95'; textMain = '#ede9fe'; textMuted = '#c4b5fd'; border = '#6d28d9'; break;
        case 'gamer': primary = '#ef4444'; bgMain = '#000000'; bgCard = '#111111'; textMain = '#ffffff'; textMuted = '#6b7280'; border = '#ef4444'; break;
        case 'luxury': primary = '#fbbf24'; bgMain = '#1a1a1a'; bgCard = '#262626'; textMain = '#fcfcd4'; textMuted = '#a3a3a3'; border = '#fbbf24'; break;
        case 'comic': primary = '#3b82f6'; bgMain = '#ffffff'; bgCard = '#f3f4f6'; textMain = '#000000'; textMuted = '#4b5563'; border = '#000000'; break;
        case 'nature_soft': primary = '#84cc16'; bgMain = '#f0fdf4'; bgCard = '#dcfce7'; textMain = '#14532d'; textMuted = '#166534'; border = '#84cc16'; break;
    }
    
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-bg-main', bgMain);
    root.style.setProperty('--color-bg-card', bgCard);
    root.style.setProperty('--color-text-main', textMain);
    root.style.setProperty('--color-text-muted', textMuted);
    root.style.setProperty('--color-border', border);

  }, [currentTheme]);

  useEffect(() => {
      const checkBoost = () => {
          const currentStats = getUserStats();
          if (currentStats.xpBoostEndTime !== userStats.xpBoostEndTime) {
             refreshGlobalState();
          }
          
          const now = Date.now();
          if (currentStats.xpBoostEndTime > now) {
              setIsBoostActive(true);
              const diff = currentStats.xpBoostEndTime - now;
              const minutes = Math.floor(diff / 60000);
              setBoostTimeLeft(`${minutes}dk`);
          } else {
              setIsBoostActive(false);
              setBoostTimeLeft('');
          }
      };
      checkBoost();
      const interval = setInterval(checkBoost, 5000); 
      return () => clearInterval(interval);
  }, [userStats]);

  useEffect(() => {
    const dataWiped = checkDataVersion();
    if (dataWiped) {
        window.location.reload();
        return;
    }
    
    // Check for existing profile
    const localProfile = getUserProfile();
    if (!localProfile.name) {
        // If no local profile, show auth modal (which handles registration)
        setShowAuthModal(true);
    } else {
        // If profile exists, check tutorial
        const tutorialSeen = localStorage.getItem('tutorial_seen');
        if (!tutorialSeen) {
            setShowTutorial(true);
        }
    }

    if (ANNOUNCEMENTS.length > 0) {
        const lastReadId = getLastReadAnnouncementId();
        const latestId = ANNOUNCEMENTS[0].id;
        if (latestId !== lastReadId) { setHasUnreadAnnouncements(true); }
    }
    
    applyUserProfileGrade();
    refreshGlobalState();
  }, [applyUserProfileGrade]);

  const closeModalOrGoBack = useCallback(() => {
      if (showAuthModal) { 
          const userProfile = getUserProfile();
          if (!userProfile.name) {
               // Mandatory login/reg
               return false; 
          }
          setShowAuthModal(false); return true; 
      }
      if (showOnboardingModal) {
          const userProfile = getUserProfile();
          if (userProfile.name) {
             setShowOnboardingModal(false);
             return true;
          }
          return false; // Mandatory
      }
      if (showSettings) { setShowSettings(false); return true; }
      if (showAdminModal) { setShowAdminModal(false); return true; }
      if (showSRSInfo) { setShowSRSInfo(false); return true; }
      if (showMarket) { setShowMarket(false); return true; }
      if (showGradeSelection) { setShowGradeSelection(false); return true; }
      if (showFeedbackModal) { setShowFeedbackModal(false); return true; }
      if (pendingQuizConfig) { setPendingQuizConfig(null); return true; }
      if (showTutorial) { setShowTutorial(false); localStorage.setItem('tutorial_seen', 'true'); return true; }
      if (showAvatarModal) { setShowAvatarModal(false); return true; }
      
      if (mode !== AppMode.HOME) {
          setMode(AppMode.HOME);
          setIsSRSReview(false);
          refreshGlobalState();
          return true;
      }
      
      if (selectedUnit) { setSelectedUnit(null); return true; }
      if (selectedGrade) { setSelectedGrade(null); return true; }
      if (selectedCategory) { setSelectedCategory(null); return true; }
      
      return false; 
  }, [mode, selectedUnit, selectedGrade, selectedCategory, showSettings, showSRSInfo, showMarket, showGradeSelection, showFeedbackModal, showAdminModal, pendingQuizConfig, showAuthModal, showOnboardingModal, showTutorial, showAvatarModal]);

  useEffect(() => {
    const setupBackButton = async () => {
        if (Capacitor.isNativePlatform()) {
             await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                const handled = closeModalOrGoBack();
                if (!handled) {
                    CapacitorApp.exitApp();
                }
            });
        }
    };
    setupBackButton();

    return () => {
        if (Capacitor.isNativePlatform()) {
            CapacitorApp.removeAllListeners();
        }
    }
  }, [closeModalOrGoBack]);

  const handlePopState = useCallback((event: PopStateEvent) => {
      closeModalOrGoBack();
  }, [closeModalOrGoBack]);

  useEffect(() => {
      window.addEventListener('popstate', handlePopState);
      return () => { window.removeEventListener('popstate', handlePopState); };
  }, [handlePopState]);

  const addHistoryEntry = () => {
      window.history.pushState({ appState: 'navigated' }, '', '');
  };

  const handleThemeChange = () => {
      const newTheme = getTheme();
      applyTheme(newTheme);
  };

  const handleProfileUpdate = () => { 
      applyUserProfileGrade(); 
      refreshGlobalState();
  };
  
  const handleTriggerCelebration = (message: string, type: 'unit' | 'quiz' | 'goal') => { 
      playSound('success'); 
      setCelebration({ show: true, message, type });
      refreshGlobalState();
  };
  
  const handleBadgeUnlock = (badge: Badge) => { 
      playSound('success'); 
      setNewBadge(badge); 
      setTimeout(() => setNewBadge(null), 5000); 
      refreshGlobalState();
  };
  
  const handleGoHome = () => { 
      setMode(AppMode.HOME); setTopicTitle(''); setWords([]); setAllUnitWords([]); setSelectedUnit(null); setSelectedStudyMode(null); setSelectedGrade(null); setSelectedCategory(null); setIsSRSReview(false); setPendingQuizConfig(null); setShowGradeSelection(false); 
      refreshGlobalState();
  };
  
  const handleManualBack = () => { 
     closeModalOrGoBack();
  };
  
  const handleOpenProfile = () => { addHistoryEntry(); setMode(AppMode.PROFILE); setTopicTitle('Profilim'); refreshGlobalState(); };
  const handleOpenInfo = () => { addHistoryEntry(); setMode(AppMode.INFO); setTopicTitle('İpuçları'); };
  const handleOpenMarket = () => { addHistoryEntry(); setShowMarket(true); };
  const handleOpenAnnouncements = () => { addHistoryEntry(); setMode(AppMode.ANNOUNCEMENTS); setTopicTitle('Duyurular'); if (ANNOUNCEMENTS.length > 0) { setLastReadAnnouncementId(ANNOUNCEMENTS[0].id); setHasUnreadAnnouncements(false); } };
  const handleOpenSettings = () => { addHistoryEntry(); setShowSettings(true); };

  const shuffleArray = <T,>(array: T[]): T[] => { const newArray = [...array]; for (let i = newArray.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; } return newArray; };
  
  const startQuizWithCount = (count: number, difficulty: QuizDifficulty) => { 
      if (!pendingQuizConfig) return; 
      let quizWords = shuffleArray(pendingQuizConfig.words); 
      if (count !== -1 && quizWords.length > count) { quizWords = quizWords.slice(0, count); } 
      lastQuizConfig.current = { count: count, difficulty: difficulty, originalWords: pendingQuizConfig.words, allDistractors: pendingQuizConfig.allDistractors };
      setWords(quizWords); 
      setAllUnitWords(pendingQuizConfig.allDistractors); 
      setActiveQuizType(pendingQuizConfig.type); 
      setActiveQuizDifficulty(difficulty);
      setTopicTitle(pendingQuizConfig.title); 
      setMode(AppMode.QUIZ); 
      setPendingQuizConfig(null); 
  };

  const handleQuizRestart = () => {
      if (lastQuizConfig.current) {
          const { count, difficulty, originalWords, allDistractors } = lastQuizConfig.current;
          let quizWords = shuffleArray(originalWords);
          if (count !== -1 && quizWords.length > count) { quizWords = quizWords.slice(0, count); }
          setWords(quizWords);
          setAllUnitWords(allDistractors);
          setActiveQuizDifficulty(difficulty);
          setMode(AppMode.LOADING); 
          setTimeout(() => { setMode(AppMode.QUIZ); }, 50);
      } else {
          setMode(AppMode.HOME);
      }
  };

  const handleStartModule = (action: any, unit: UnitDef) => { 
      if (selectedGrade && unit.id !== 'review' && !unit.id.endsWith('all') && unit.id !== 'uAll') { 
          saveLastActivity(selectedGrade, unit.id); 
      } 
      let unitWords: WordCard[] = []; 
      let allDistractors: WordCard[] = []; 
      const isAllInOne = unit.id.endsWith('all') || unit.id === 'uAll'; 

      if (action === 'review' || action === 'review-flashcards') { 
          let allowedUnitIds: string[] | undefined = undefined; 
          if (selectedGrade) { 
              const gradeUnits = UNIT_ASSETS[selectedGrade]; 
              if (gradeUnits) { allowedUnitIds = gradeUnits.map(u => u.id); } 
              unitWords = getDueWords(allowedUnitIds); 
              if (unitWords.length === 0) { addHistoryEntry(); setShowSRSInfo(true); return; } 
              allDistractors = Object.entries(VOCABULARY).flatMap(([uid, words]) => words.map(w => ({...w, unitId: uid}))); 
          } else { 
              const dueGrades = getDueGrades(); 
              if (dueGrades.length > 1) { 
                  setAvailableGradesForReview(dueGrades); 
                  addHistoryEntry(); 
                  setShowGradeSelection(true); 
                  return; 
              } else if (dueGrades.length === 1) { 
                  const g = dueGrades[0] as GradeLevel; 
                  const gradeUnits = UNIT_ASSETS[g]; 
                  if (gradeUnits) { allowedUnitIds = gradeUnits.map(u => u.id); } 
                  unitWords = getDueWords(allowedUnitIds); 
                  allDistractors = Object.entries(VOCABULARY).flatMap(([uid, words]) => words.map(w => ({...w, unitId: uid}))); 
              } else { 
                  addHistoryEntry(); 
                  setShowSRSInfo(true); 
                  return; 
              } 
          } 
      } else { 
          if (isAllInOne && selectedGrade) { 
              const units = UNIT_ASSETS[selectedGrade]; 
              units.forEach(u => { 
                  if (u.id !== unit.id && VOCABULARY[u.id]) { 
                      const taggedWords = VOCABULARY[u.id].map(w => ({ ...w, unitId: u.id })); 
                      unitWords = [...unitWords, ...taggedWords]; 
                  } 
              }); 
          } else { 
              unitWords = (VOCABULARY[unit.id] || []).map(w => ({ ...w, unitId: unit.id })); 
          } 
          allDistractors = unitWords; 
      } 
      
      let newTitle = (action === 'review' || action === 'review-flashcards') ? 'Günlük Tekrar' : (isAllInOne ? unit.title : `${unit.unitNo} - ${unit.title}`); 
      
      if (action !== 'grammar' && unitWords.length === 0 && action !== 'quiz-bookmarks' && action !== 'quiz-memorized') { 
          alert("Bu ünite için içerik henüz hazırlanmaktadır veya tekrar edilecek kelime yok."); 
          return; 
      } 
      
      addHistoryEntry(); 
      
      if (action === 'study') { 
          setAllUnitWords(allDistractors); 
          setWords(shuffleArray(unitWords)); 
          setTopicTitle(newTitle); 
          setMode(AppMode.FLASHCARDS); 
       } else if (action === 'matching') {
          setAllUnitWords(allDistractors);
          setWords(shuffleArray(unitWords)); 
          setTopicTitle(newTitle + ' (Eşleştirme)');
          setMode(AppMode.MATCHING);
      } else if (action === 'typing') {
          setAllUnitWords(allDistractors);
          setWords(shuffleArray(unitWords)); 
          setTopicTitle(newTitle + ' (Yazma)');
          setMode(AppMode.TYPING);
      } else if (action === 'chain') {
          setAllUnitWords(allDistractors);
          setWords(shuffleArray(unitWords)); 
          setTopicTitle(newTitle + ' (Kelime Türet)');
          setMode(AppMode.WORD_CHAIN);
      } else if (action === 'maze') {
          setAllUnitWords(allDistractors);
          setWords(shuffleArray(unitWords));
          setTopicTitle(newTitle + ' (Labirent)');
          setMode(AppMode.MAZE);
      } else if (action === 'wordSearch') {
          setAllUnitWords(allDistractors);
          setWords(shuffleArray(unitWords));
          setTopicTitle(newTitle + ' (Bulmaca)');
          setMode(AppMode.WORD_SEARCH);
      } else if (action === 'grammar') { 
          setTopicTitle(newTitle + ' (Gramer)'); 
          setMode(AppMode.GRAMMAR); 
      } else if (action === 'practice-select') { 
          setAllUnitWords(allDistractors); 
          setTopicTitle(newTitle + ' (Özel Çalışma)'); 
          setMode(AppMode.CUSTOM_PRACTICE); 
      } else if (action === 'review') {
          // SWITCH TO QUIZ FOR DAILY REVIEW
          setAllUnitWords(allDistractors); 
          setWords(shuffleArray(unitWords)); 
          setTopicTitle(newTitle + ' (Test)'); 
          setIsSRSReview(true); 
          setActiveQuizType('review');
          // Default difficulty for review
          setActiveQuizDifficulty('normal');
          setMode(AppMode.QUIZ);
      } else if (action === 'review-flashcards') { 
          // Optional fallback if users really want flashcards (can be triggered differently)
          setAllUnitWords(allDistractors); 
          setWords(shuffleArray(unitWords)); 
          setTopicTitle(newTitle + ' (Kartlar)'); 
          setIsSRSReview(true); 
          setMode(AppMode.FLASHCARDS); 
      } else { 
          let targetWords = unitWords; 
          let type: 'standard' | 'bookmarks' | 'memorized' | 'review' = 'standard'; 
          if (action === 'quiz-bookmarks') { 
              try { 
                  const stored = localStorage.getItem('lgs_bookmarks'); 
                  const bookmarkSet = stored ? new Set(JSON.parse(stored)) : new Set(); 
                  targetWords = unitWords.filter(w => { 
                      const key = w.unitId ? `${w.unitId}|${w.english}` : w.english; 
                      return bookmarkSet.has(key); 
                  }); 
                  if (targetWords.length === 0) { 
                      setEmptyWarningType('bookmarks'); 
                      setMode(AppMode.EMPTY_WARNING); 
                      setTopicTitle(newTitle); 
                      return; 
                  } 
                  type = 'bookmarks'; 
                  newTitle += ' (Favori Test)'; 
              } catch (e) { return; } 
          } else if (action === 'quiz-memorized') { 
              const memorizedSet = getMemorizedSet(); 
              targetWords = unitWords.filter(w => { 
                  const key = w.unitId ? `${w.unitId}|${w.english}` : w.english; 
                  return memorizedSet.has(key); 
              }); 
              if (targetWords.length === 0) { 
                  setEmptyWarningType('memorized'); 
                  setMode(AppMode.EMPTY_WARNING); 
                  setTopicTitle(newTitle); 
                  return; 
              } 
              type = 'memorized'; 
              newTitle += ' (Ezber Testi)'; 
          } 
          setPendingQuizConfig({ words: targetWords, allDistractors: allDistractors, title: newTitle, type: type }); 
      } 
  };

  const handleGradeSelectForReview = (grade: GradeLevel) => { 
      setShowGradeSelection(false); 
      const gradeUnits = UNIT_ASSETS[grade]; 
      let allowedUnitIds: string[] = []; 
      if (gradeUnits) { allowedUnitIds = gradeUnits.map(u => u.id); } 
      const dueWords = getDueWords(allowedUnitIds); 
      const allDistractors = Object.entries(VOCABULARY).flatMap(([uid, words]) => words.map(w => ({...w, unitId: uid}))); 
      
      setWords(shuffleArray(dueWords)); 
      setAllUnitWords(allDistractors); 
      setTopicTitle(`Günlük Tekrar (${grade}. Sınıf)`); 
      setIsSRSReview(true); 
      setActiveQuizType('review');
      setActiveQuizDifficulty('normal'); // Review default
      setMode(AppMode.QUIZ); 
  };

  const handleCustomPracticeStart = (selectedWords: WordCard[], startMode: 'study' | 'quiz') => { 
      if (startMode === 'study') { 
          setWords(shuffleArray(selectedWords)); 
          setMode(AppMode.FLASHCARDS); 
      } else { 
          setPendingQuizConfig({ words: selectedWords, allDistractors: allUnitWords, title: topicTitle.replace(' (Özel Çalışma)', '') + ' (Seçmeli Test)', type: 'custom' }); 
      } 
  };

  const onSelectCategoryHandler = (cat: CategoryType | null) => { if (cat) addHistoryEntry(); setSelectedCategory(cat); };
  const onSelectGradeHandler = (grade: GradeLevel | null) => { if (grade) addHistoryEntry(); setSelectedGrade(grade); };
  const onSelectUnitHandler = (unit: UnitDef | null) => { if (unit) addHistoryEntry(); setSelectedUnit(unit); };
  const showBackButton = (mode !== AppMode.HOME) || (selectedCategory !== null);
  
  let content;
  switch (mode) {
    case AppMode.HOME: content = ( <TopicSelector selectedCategory={selectedCategory} selectedGrade={selectedGrade} selectedMode={selectedStudyMode} selectedUnit={selectedUnit} onSelectCategory={onSelectCategoryHandler} onSelectGrade={onSelectGradeHandler} onSelectMode={(mode) => setSelectedStudyMode(mode)} onSelectUnit={onSelectUnitHandler} onStartModule={handleStartModule} onGoHome={handleGoHome} onOpenMarket={handleOpenMarket} /> ); break;
    case AppMode.LOADING: content = <div className="text-center mt-20" style={{color: 'var(--color-text-muted)'}}>Yükleniyor...</div>; break;
    case AppMode.FLASHCARDS: content = ( <FlashcardDeck words={words} onFinish={handleManualBack} onBack={handleManualBack} onHome={handleGoHome} isReviewMode={isSRSReview} onCelebrate={handleTriggerCelebration} onBadgeUnlock={handleBadgeUnlock} grade={selectedGrade} /> ); break;
    case AppMode.QUIZ: content = ( 
        <Quiz 
            words={words} 
            allWords={allUnitWords} 
            onRestart={handleQuizRestart} 
            onBack={handleManualBack} 
            onHome={handleGoHome} 
            isBookmarkQuiz={activeQuizType === 'bookmarks'} 
            isReviewMode={isSRSReview}
            difficulty={activeQuizDifficulty}
            onCelebrate={handleTriggerCelebration} 
            onBadgeUnlock={handleBadgeUnlock} 
            grade={selectedGrade} 
        /> 
    ); break;
    case AppMode.CUSTOM_PRACTICE: content = ( <WordSelector words={allUnitWords} unitTitle={topicTitle.replace(' (Özel Çalışma)', '')} onStart={handleCustomPracticeStart} onBack={handleManualBack} /> ); break;
    case AppMode.GRAMMAR: if (selectedUnit) { content = <GrammarView unit={selectedUnit} onBack={handleManualBack} onHome={handleGoHome} />; } break;
    case AppMode.EMPTY_WARNING: content = <EmptyStateWarning type={emptyWarningType || 'bookmarks'} onStudy={() => { selectedUnit && handleStartModule('study', selectedUnit); }} onHome={handleGoHome} />; break;
    case AppMode.PROFILE: content = (
      <Profile 
        onBack={handleManualBack} 
        onProfileUpdate={handleProfileUpdate} 
        onOpenMarket={handleOpenMarket}
        onLoginRequest={() => setShowAuthModal(true)} 
        externalStats={userStats}
      />
    ); break;
    case AppMode.INFO: content = <InfoView onBack={handleManualBack} />; break;
    case AppMode.ANNOUNCEMENTS: content = <AnnouncementsView onBack={handleManualBack} />; break;
    case AppMode.MATCHING: content = (
         <MatchingGame 
            words={words} 
            onFinish={handleManualBack} 
            onBack={handleManualBack} 
            onHome={handleGoHome} 
            onCelebrate={handleTriggerCelebration} 
            onBadgeUnlock={handleBadgeUnlock} 
            grade={selectedGrade} 
         />
    ); break;
    case AppMode.TYPING: content = (
         <TypingGame 
            words={words} 
            onFinish={handleManualBack} 
            onBack={handleManualBack} 
            onHome={handleGoHome} 
            onCelebrate={handleTriggerCelebration} 
            grade={selectedGrade} 
         />
    ); break;
    case AppMode.WORD_CHAIN: content = (
         <WordChainGame 
            unitWords={words}
            allWords={Object.values(VOCABULARY).flat()}
            onFinish={handleManualBack} 
            onBack={handleManualBack} 
            onHome={handleGoHome} 
            onCelebrate={handleTriggerCelebration} 
            grade={selectedGrade} 
         />
    ); break;
    case AppMode.MAZE: content = (
        <MazeGame
            words={words}
            onFinish={handleManualBack} 
            onBack={handleManualBack} 
            onHome={handleGoHome} 
            onCelebrate={handleTriggerCelebration} 
            grade={selectedGrade} 
         />
    ); break;
    case AppMode.WORD_SEARCH: content = (
        <WordSearchGame
            words={words}
            onFinish={() => handleStartModule('wordSearch', selectedUnit!)} // Re-start logic
            onBack={handleManualBack} 
            onHome={handleGoHome} 
            onCelebrate={handleTriggerCelebration} 
            grade={selectedGrade} 
         />
    ); break;
    case AppMode.ERROR: content = <div className="text-center p-10 text-red-500">Bir hata oluştu.</div>; break;
  }

  return (
    <div className="flex flex-col h-[100dvh] font-sans pt-safe pb-safe overflow-hidden transition-colors duration-300" 
         style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-main)'}}>
      
      {newBadge && (
         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[110] w-full max-w-sm px-4 pointer-events-none">
            <div className="bg-yellow-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 border-2 border-yellow-300">
                <div className="text-4xl animate-bounce">
                     {newBadge.image ? (
                         <img src={newBadge.image} alt={newBadge.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                         <span className="flex items-center justify-center w-10 h-10 text-3xl">{newBadge.icon}</span>
                    )}
                </div>
                <div>
                    <div className="text-xs font-bold text-yellow-100 uppercase tracking-wide mb-0.5">Yeni Rozet Kazanıldı!</div>
                    <div className="font-black text-lg leading-tight">{newBadge.name}</div>
                </div>
                <Trophy className="ml-auto text-yellow-200" size={24} />
            </div>
         </div>
      )}

      {showTutorial && <OnboardingTutorial onComplete={() => { setShowTutorial(false); localStorage.setItem('tutorial_seen', 'true'); }} />}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => { handleProfileUpdate(); setShowAuthModal(false); }} />}
      {showOnboardingModal && <OnboardingModal onComplete={() => { handleProfileUpdate(); setShowOnboardingModal(false); }} />}
      
      {showSettings && (
        <SettingsModal 
            onClose={handleManualBack} 
            onOpenFeedback={() => setShowFeedbackModal(true)} 
            onOpenAdmin={() => setShowAdminModal(true)}
            onRestartTutorial={() => { setShowSettings(false); setShowTutorial(true); }}
        />
      )}
      {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}
      {showAdminModal && (
        <AdminModal 
            onClose={() => setShowAdminModal(false)} 
            onUpdate={() => { handleProfileUpdate(); }} 
        />
      )}
      <InstallPromptModal />
      
      {showSRSInfo && <SRSInfoModal onClose={handleManualBack} />}
      {showMarket && <MarketModal onClose={() => { setShowMarket(false); handleProfileUpdate(); }} onThemeChange={handleThemeChange} />}
      {showGradeSelection && <GradeSelectionModal onClose={handleManualBack} onSelect={handleGradeSelectForReview} grades={availableGradesForReview} />}
      {pendingQuizConfig && <QuizSetupModal onClose={handleManualBack} onStart={startQuizWithCount} totalWords={pendingQuizConfig.words.length} title={pendingQuizConfig.title} />}
      {celebration?.show && <Celebration message={celebration.message} type={celebration.type} onClose={() => setCelebration(null)} />}
      
      {showAvatarModal && <AvatarModal onClose={() => setShowAvatarModal(false)} userStats={userStats || {
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
    }} onUpdate={() => { setHeaderProfile(getUserProfile()); if(handleProfileUpdate) handleProfileUpdate(); }} />}
      
      <header className="backdrop-blur-xl border-b z-50 shrink-0 transition-colors h-16 header-theme"
              style={{backgroundColor: 'rgba(var(--color-bg-card-rgb), 0.8)', borderColor: 'rgba(255,255,255,0.1)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-fit">
            {showBackButton ? (
              <button onClick={handleManualBack} 
                className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold transition-all active:scale-95 group"
                style={{color: 'var(--color-text-muted)'}}>
                <ChevronLeft size={22} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" /> <span className="hidden sm:inline">Geri</span>
              </button>
            ) : (
               isBoostActive ? (
                 <div className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-1.5 rounded-xl animate-pulse shadow-lg shadow-yellow-500/30 border border-yellow-400">
                     <Zap size={16} fill="currentColor" />
                     <div className="flex flex-col items-start leading-none">
                         <span className="text-[10px] font-bold uppercase opacity-90">2x Boost</span>
                         <span className="text-xs font-black">{boostTimeLeft}</span>
                     </div>
                 </div>
               ) : (
                   <div className="w-2"></div> 
               )
            )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 justify-end min-w-fit">
             {mode !== AppMode.ANNOUNCEMENTS && (
                <button onClick={handleOpenAnnouncements} className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{color: 'var(--color-text-muted)'}}>
                  {UI_ICONS.notifications} {hasUnreadAnnouncements && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>}
                </button>
             )}
             {mode !== AppMode.INFO && <button onClick={handleOpenInfo} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{color: 'var(--color-text-muted)'}}>{UI_ICONS.info}</button>}
             
             {mode !== AppMode.PROFILE && (
                <button id="profile-button" onClick={handleOpenProfile} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{color: 'var(--color-text-muted)'}}>
                   {UI_ICONS.profile}
                </button>
             )}

             <button onClick={handleGoHome} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{color: 'var(--color-text-muted)'}}>{UI_ICONS.home}</button>
             <button onClick={handleOpenSettings} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{color: 'var(--color-text-muted)'}}>{UI_ICONS.settings}</button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-7xl mx-auto relative main-content">
        {content}
      </main>
      
      <style>{`
        :root {
            --color-primary: #4f46e5;
            --color-bg-main: #0f172a;
            --color-bg-card: #1e293b;
            --color-text-main: #f8fafc;
            --color-text-muted: #94a3b8;
            --color-border: #334155;
        }
      `}</style>
    </div>
  );
};

export default App;
