
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WordCard, AppMode, Badge, ThemeType, UnitDef, GradeLevel, StudyMode, CategoryType, QuizDifficulty, Challenge, Tournament, TournamentMatch } from '../types';
import { VOCABULARY } from '../data/vocabulary';
import TopicSelector from './TopicSelector';
import { UNIT_ASSETS, UI_ICONS, AVATARS, FRAMES, BACKGROUNDS, BADGES, THEME_COLORS } from '../data/assets';
import FlashcardDeck from './FlashcardDeck';
import Quiz from './Quiz';
import Profile from './Profile';
import GrammarView from './GrammarView';
import WordSelector from './WordSelector';
import InfoView from './InfoView';
import AnnouncementsView from './AnnouncementsView';
import EmptyStateWarning from './EmptyStateWarning';
import Celebration from './Celebration';
import SettingsModal from './SettingsModal';
import QuizSetupModal from './QuizSetupModal';
import SRSInfoModal from './SRSInfoModal';
import GradeSelectionModal from './GradeSelectionModal';
import MarketModal from './MarketModal';
import AvatarModal from './AvatarModal';
import AuthModal from './AuthModal';
import OnboardingModal from './OnboardingModal';
import FeedbackModal from './FeedbackModal';
import AdminModal from './AdminModal'; 
import InstallPromptModal from './InstallPromptModal';
import ChallengeModal from './ChallengeModal';
import UserProfileModal from './UserProfileModal';
import WelcomeScreen from './WelcomeScreen';
import CustomAlert, { AlertType } from './CustomAlert'; 
import { ChevronLeft, Zap, Trophy, User, Swords } from 'lucide-react';
import { getUserProfile, getTheme, saveTheme, getAppSettings, getMemorizedSet, getDueWords, saveLastActivity, getLastReadAnnouncementId, setLastReadAnnouncementId, checkDataVersion, getDueGrades, getUserStats, updateTimeSpent, clearLocalUserData, createGuestProfile, hasSeenTutorial, markTutorialAsSeen, UserStats } from '../services/userService';
import { getAuthInstance, syncLocalToCloud, subscribeToUserChanges, syncData, getOpenChallenges } from '../services/firebase'; 
import { requestNotificationPermission } from '../services/notificationService';
import { ANNOUNCEMENTS } from '../data/announcements';
import { playSound } from '../services/soundService';
import { APP_CONFIG } from '../config/appConfig';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { onAuthStateChanged } from 'firebase/auth';
import MatchingGame from './MatchingGame'; 
import MazeGame from './MazeGame'; 
import WordSearchGame from './WordSearchGame'; 

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [history, setHistory] = useState<AppMode[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark');
  const [userStats, setUserStats] = useState<UserStats>(getUserStats());

  const [activeModal, setActiveModal] = useState<'settings' | 'srs' | 'market' | 'auth' | 'grade' | 'feedback' | 'admin' | 'avatar' | 'challenge' | null>(null);
  const [authInitialView, setAuthInitialView] = useState<'login' | 'register'>('login');
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  
  const [isOnboardingGuest, setIsOnboardingGuest] = useState(false);

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
  
  const [challengeState, setChallengeState] = useState<{ 
      mode: 'create' | 'join' | 'tournament', 
      data?: Challenge, 
      unitId?: string, 
      challengeType?: 'public'|'private'|'friend', 
      targetFriendId?: string,
      tournamentMatchId?: string,
      tournamentName?: string
  } | null>(null);

  const lastQuizConfig = useRef<{count: number, difficulty: QuizDifficulty, originalWords: WordCard[], allDistractors: WordCard[]} | null>(null);
  const lastActiveTime = useRef<number>(Date.now());

  const [isSRSReview, setIsSRSReview] = useState(false);
  const [emptyWarningType, setEmptyWarningType] = useState<'bookmarks' | 'memorized' | null>(null);
  const [celebration, setCelebration] = useState<{ show: boolean; message: string; type: 'unit' | 'quiz' | 'goal' } | null>(null);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [hasUnreadAnnouncements, setHasUnreadAnnouncements] = useState(false);
  const [hasPendingDuel, setHasPendingDuel] = useState(false);

  const [isBoostActive, setIsBoostActive] = useState(false);
  const [boostTimeLeft, setBoostTimeLeft] = useState('');
  
  const [headerProfile, setHeaderProfile] = useState(getUserProfile());

  const [alertState, setAlertState] = useState<{ visible: boolean; title: string; message: string; type: AlertType; onConfirm?: () => void }>({
    visible: false, title: '', message: '', type: 'info'
  });
  
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);

  const showAlert = (title: string, message: string, type: AlertType = 'info', onConfirm?: () => void) => {
      setAlertState({ visible: true, title, message, type, onConfirm });
  };

  const refreshGlobalState = () => {
      setUserStats(getUserStats());
      setHeaderProfile(getUserProfile());
  };
  
  const checkForDuels = async () => {
      const auth = getAuthInstance();
      if (auth?.currentUser) {
          try {
              const challenges = await getOpenChallenges(auth.currentUser.uid);
              setHasPendingDuel(challenges.length > 0);
          } catch (e) { console.error("Duel check error", e); }
      }
  };

  // Time Tracking Logic - Increments totalTimeSpent every minute if app is active
  useEffect(() => {
      const interval = setInterval(() => {
          if (document.visibilityState === 'visible') {
              updateTimeSpent(1); // Add 1 minute
          }
      }, 60000); // 1 minute

      return () => clearInterval(interval);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
      requestNotificationPermission();
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
      const lightThemes = ['light', 'retro', 'comic', 'nature_soft'];
      if (lightThemes.includes(theme)) {
          document.documentElement.classList.remove('dark');
      } else {
          document.documentElement.classList.add('dark');
      }
      setCurrentTheme(theme);
  };

  useEffect(() => {
      const currentThemeColors = THEME_COLORS[currentTheme] || THEME_COLORS.dark;
      const root = document.documentElement;
      
      const hexToRgb = (hex: string) => {
          const r = parseInt(hex.slice(1,3), 16);
          const g = parseInt(hex.slice(3,5), 16);
          const b = parseInt(hex.slice(5,7), 16);
          return `${r}, ${g}, ${b}`;
      };

      root.style.setProperty('--color-primary', currentThemeColors.primary);
      root.style.setProperty('--color-bg-main', currentThemeColors.bgMain);
      root.style.setProperty('--color-bg-card', currentThemeColors.bgCard);
      root.style.setProperty('--color-text-main', currentThemeColors.textMain);
      root.style.setProperty('--color-text-muted', currentThemeColors.textMuted);
      root.style.setProperty('--color-border', currentThemeColors.border);
      
      root.style.setProperty('--color-bg-card-rgb', hexToRgb(currentThemeColors.bgCard));
      root.style.setProperty('--color-primary-rgb', hexToRgb(currentThemeColors.primary));
  }, [currentTheme]);

  useEffect(() => {
      const auth = getAuthInstance();
      const currentSettings = getAppSettings();
      applyTheme(currentSettings.theme);

      const localProfile = getUserProfile();

      if (auth) {
          const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
              if (!user) {
                  if (!localProfile.name) {
                      setShowWelcomeScreen(true);
                  }
              } else {
                  checkForDuels();
                  localStorage.setItem('lgs_last_uid', user.uid);
                  
                  // Ensure local state matches cloud preferences upon login
                  // This covers the case where user logs in on a new device
                  const updatedSettings = getAppSettings();
                  if (updatedSettings.theme && updatedSettings.theme !== currentTheme) {
                      applyTheme(updatedSettings.theme);
                  }
                  
                  refreshGlobalState();
              }
          });
          return () => unsubscribeAuth();
      }
  }, []);

  useEffect(() => {
    const dataWiped = checkDataVersion();
    if (dataWiped) { window.location.reload(); return; }
    
    const localProfile = getUserProfile();
    if (!localProfile.name) {
         setShowWelcomeScreen(true);
    } else {
        if (!hasSeenTutorial()) {
            changeMode(AppMode.INFO);
            markTutorialAsSeen();
        }
    }
    // Announcements are dynamic now, check will be handled in AnnouncementsView if needed or a separate hook
    // For now, rely on user opening it
    applyUserProfileGrade();
    refreshGlobalState();
  }, [applyUserProfileGrade]);

  const changeMode = (newMode: AppMode) => {
      setHistory(prev => [...prev, mode]);
      setMode(newMode);
  };

  const goBack = useCallback(() => {
      if (viewProfileId) { setViewProfileId(null); return true; }
      if (activeModal) { 
          setActiveModal(null); 
          setIsOnboardingGuest(false); 
          return true; 
      }
      if (pendingQuizConfig) { setPendingQuizConfig(null); return true; }
      
      if (mode === AppMode.HOME) {
          if (selectedUnit) { setSelectedUnit(null); return true; }
          if (selectedStudyMode) { setSelectedStudyMode(null); return true; }
          if (selectedGrade) { setSelectedGrade(null); return true; }
          if (selectedCategory) { setSelectedCategory(null); return true; }
          return false; 
      }
      if (mode !== AppMode.HOME) {
          setMode(AppMode.HOME);
          setIsSRSReview(false);
          setChallengeState(null);
          return true;
      }
      return true;
  }, [activeModal, mode, pendingQuizConfig, selectedUnit, selectedGrade, selectedCategory, selectedStudyMode, viewProfileId]);

  const handleManualBack = () => { goBack(); };

  useEffect(() => {
    const setupBackButton = async () => {
        if (Capacitor.isNativePlatform()) {
             await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                const handled = goBack();
                if (!handled) CapacitorApp.exitApp();
            });
        }
    };
    setupBackButton();
    return () => { if (Capacitor.isNativePlatform()) CapacitorApp.removeAllListeners(); }
  }, [goBack]);

  const handleThemeChange = () => { applyTheme(getTheme()); };

  const handleProfileUpdate = async () => { 
      applyUserProfileGrade(); 
      const auth = getAuthInstance();
      if (auth?.currentUser && !getUserProfile().isGuest) {
          await syncLocalToCloud(auth.currentUser.uid);
          checkForDuels();
      }
      
      // Explicitly re-read settings to ensure theme changes are picked up across devices
      const latestSettings = getAppSettings();
      if (latestSettings.theme && latestSettings.theme !== currentTheme) {
          applyTheme(latestSettings.theme);
      }
      
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
      setHistory([]); setMode(AppMode.HOME); setTopicTitle(''); setWords([]); setAllUnitWords([]); setSelectedUnit(null); setSelectedStudyMode(null); setSelectedGrade(null); setSelectedCategory(null); setIsSRSReview(false); setPendingQuizConfig(null); setActiveModal(null); setChallengeState(null); refreshGlobalState();
  };
  
  const handleOpenProfile = () => { changeMode(AppMode.PROFILE); setTopicTitle('Profilim'); refreshGlobalState(); };
  const handleOpenInfo = () => { changeMode(AppMode.INFO); setTopicTitle('İpuçları'); };
  const handleOpenMarket = () => { setActiveModal('market'); };
  const handleOpenAnnouncements = () => { changeMode(AppMode.ANNOUNCEMENTS); setTopicTitle('Duyurular'); if (ANNOUNCEMENTS.length > 0) { setLastReadAnnouncementId(ANNOUNCEMENTS[0].id); setHasUnreadAnnouncements(false); } };
  const handleOpenSettings = () => { setActiveModal('settings'); };
  
  const handleOpenChallenge = () => { 
      const profile = getUserProfile();
      if (profile.isGuest) {
          showAlert("Misafir Modu", "Düello modunu kullanmak için lütfen giriş yapın veya kayıt olun.", "warning", () => { setAuthInitialView('register'); setActiveModal('auth'); });
          return;
      }
      setActiveModal('challenge'); 
  };

  const shuffleArray = <T,>(array: T[]): T[] => { const newArray = [...array]; for (let i = newArray.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; } return newArray; };
  
  const startQuizWithCount = (count: number, difficulty: QuizDifficulty) => { 
      if (!pendingQuizConfig) return; 
      let quizWords = shuffleArray(pendingQuizConfig.words); 
      if (count !== -1 && quizWords.length > count) { quizWords = quizWords.slice(0, count); } 
      lastQuizConfig.current = { count, difficulty, originalWords: pendingQuizConfig.words, allDistractors: pendingQuizConfig.allDistractors };
      setWords(quizWords); setAllUnitWords(pendingQuizConfig.allDistractors); setActiveQuizType(pendingQuizConfig.type); setActiveQuizDifficulty(difficulty); setTopicTitle(pendingQuizConfig.title); changeMode(AppMode.QUIZ); setPendingQuizConfig(null); 
  };

  const handleQuizRestart = () => {
      if (lastQuizConfig.current) {
          const { count, difficulty, originalWords, allDistractors } = lastQuizConfig.current;
          let quizWords = shuffleArray(originalWords);
          if (count !== -1 && quizWords.length > count) { quizWords = quizWords.slice(0, count); }
          setWords(quizWords); setAllUnitWords(allDistractors); setActiveQuizDifficulty(difficulty); setMode(AppMode.LOADING); setTimeout(() => { setMode(AppMode.QUIZ); }, 50);
      } else { handleGoHome(); }
  };

  const handleStartModule = (action: any, unit: UnitDef) => { 
      if (selectedGrade && unit.id !== 'review' && !unit.id.endsWith('all') && unit.id !== 'uAll') { saveLastActivity(selectedGrade, unit.id); } 
      let unitWords: WordCard[] = []; 
      let allDistractors: WordCard[] = []; 
      const isAllInOne = unit.id.endsWith('all') || unit.id === 'uAll'; 

      if (action === 'review' || action === 'review-flashcards') { 
          let allowedUnitIds: string[] | undefined = undefined; 
          if (selectedGrade) { 
              const gradeUnits = UNIT_ASSETS[selectedGrade]; 
              if (gradeUnits) { allowedUnitIds = gradeUnits.map(u => u.id); } 
              unitWords = getDueWords(allowedUnitIds); 
              if (unitWords.length === 0) { handleTriggerCelebration("Tebrikler! Şu an tekrar edilecek kelime yok.", 'goal'); return; } 
              allDistractors = Object.entries(VOCABULARY).flatMap(([uid, words]) => (words as WordCard[]).map(w => ({...w, unitId: uid}))); 
          } else { 
              const dueGrades = getDueGrades(); 
              if (dueGrades.length > 1) { setAvailableGradesForReview(dueGrades); setActiveModal('grade'); return; } 
              else if (dueGrades.length === 1) { 
                  const g = dueGrades[0] as GradeLevel; 
                  const gradeUnits = UNIT_ASSETS[g]; 
                  if (gradeUnits) { allowedUnitIds = gradeUnits.map(u => u.id); } 
                  unitWords = getDueWords(allowedUnitIds); 
                  allDistractors = Object.entries(VOCABULARY).flatMap(([uid, words]) => (words as WordCard[]).map(w => ({...w, unitId: uid}))); 
              } else { handleTriggerCelebration("Tebrikler! Şu an tekrar edilecek kelime yok.", 'goal'); return; } 
          } 
      } else { 
          if (isAllInOne && selectedGrade) { 
              const units = UNIT_ASSETS[selectedGrade]; 
              units.forEach(u => { if (u.id !== unit.id && VOCABULARY[u.id]) { const taggedWords = (VOCABULARY[u.id] as WordCard[]).map(w => ({ ...w, unitId: u.id })); unitWords = [...unitWords, ...taggedWords]; } }); 
          } else { unitWords = (VOCABULARY[unit.id] || []).map(w => ({ ...w, unitId: unit.id })); } 
          allDistractors = unitWords; 
      } 
      
      let newTitle = (action === 'review' || action === 'review-flashcards') ? 'Günlük Tekrar' : (isAllInOne ? unit.title : `${unit.unitNo} - ${unit.title}`); 
      
      if (action !== 'grammar' && unitWords.length === 0 && action !== 'quiz-bookmarks' && action !== 'quiz-memorized') { showAlert("Uyarı", "Bu ünite için içerik henüz hazırlanmamış veya boş.", "warning"); return; } 
      
      if (action === 'study') { setAllUnitWords(allDistractors); setWords(shuffleArray(unitWords)); setTopicTitle(newTitle); changeMode(AppMode.FLASHCARDS); }
      else if (action === 'matching') { setAllUnitWords(allDistractors); setWords(shuffleArray(unitWords)); setTopicTitle(newTitle + ' (Eşleştirme)'); changeMode(AppMode.MATCHING); }
      else if (action === 'maze') { setAllUnitWords(allDistractors); setWords(shuffleArray(unitWords)); setTopicTitle(newTitle + ' (Labirent)'); changeMode(AppMode.MAZE); }
      else if (action === 'wordSearch') { setAllUnitWords(allDistractors); setWords(shuffleArray(unitWords)); setTopicTitle(newTitle + ' (Bulmaca)'); changeMode(AppMode.WORD_SEARCH); }
      else if (action === 'grammar') { setTopicTitle(newTitle + ' (Gramer)'); changeMode(AppMode.GRAMMAR); }
      else if (action === 'practice-select') { setAllUnitWords(allDistractors); setTopicTitle(newTitle + ' (Özel Çalışma)'); changeMode(AppMode.CUSTOM_PRACTICE); }
      else if (action === 'review') { setAllUnitWords(allDistractors); setWords(shuffleArray(unitWords)); setTopicTitle(newTitle + ' (Test)'); setIsSRSReview(true); setActiveQuizType('review'); setActiveQuizDifficulty('normal'); changeMode(AppMode.QUIZ); }
      else if (action === 'review-flashcards') { setAllUnitWords(allDistractors); setWords(shuffleArray(unitWords)); setTopicTitle(newTitle + ' (Kartlar)'); setIsSRSReview(true); changeMode(AppMode.FLASHCARDS); }
      else { 
          let targetWords = unitWords; 
          let type: 'standard' | 'bookmarks' | 'memorized' | 'review' = 'standard'; 
          if (action === 'quiz-bookmarks') { 
              try { const stored = localStorage.getItem('lgs_bookmarks'); const bookmarkSet = stored ? new Set(JSON.parse(stored)) : new Set(); targetWords = unitWords.filter(w => { const key = w.unitId ? `${w.unitId}|${w.english}` : w.english; return bookmarkSet.has(key); }); if (targetWords.length === 0) { setEmptyWarningType('bookmarks'); changeMode(AppMode.EMPTY_WARNING); setTopicTitle(newTitle); return; } type = 'bookmarks'; newTitle += ' (Favori Test)'; } catch (e) { return; } 
          } else if (action === 'quiz-memorized') { 
              const memorizedSet = getMemorizedSet(); targetWords = unitWords.filter(w => { const key = w.unitId ? `${w.unitId}|${w.english}` : w.english; return memorizedSet.has(key); }); if (targetWords.length === 0) { setEmptyWarningType('memorized'); changeMode(AppMode.EMPTY_WARNING); setTopicTitle(newTitle); return; } type = 'memorized'; newTitle += ' (Ezber Testi)'; 
          } 
          setPendingQuizConfig({ words: targetWords, allDistractors: allDistractors, title: newTitle, type: type }); 
      } 
  };

  const handleGradeSelect = (grade: GradeLevel) => { 
      if (isOnboardingGuest) {
          createGuestProfile(grade);
          setIsOnboardingGuest(false);
          setActiveModal(null);
          handleProfileUpdate();
          return;
      }
      setActiveModal(null);
      const gradeUnits = UNIT_ASSETS[grade]; 
      let allowedUnitIds: string[] = []; 
      if (gradeUnits) { allowedUnitIds = gradeUnits.map(u => u.id); } 
      const dueWords = getDueWords(allowedUnitIds); 
      const allDistractors = Object.entries(VOCABULARY).flatMap(([uid, words]) => (words as WordCard[]).map(w => ({...w, unitId: uid}))); 
      setWords(shuffleArray(dueWords)); setAllUnitWords(allDistractors); setTopicTitle(`Günlük Tekrar (${grade}. Sınıf)`); setIsSRSReview(true); setActiveQuizType('review'); setActiveQuizDifficulty('normal'); changeMode(AppMode.QUIZ); 
  };

  const handleCustomPracticeStart = (selectedWords: WordCard[], startMode: 'study' | 'quiz') => { 
      if (startMode === 'study') { setWords(shuffleArray(selectedWords)); changeMode(AppMode.FLASHCARDS); } 
      else { setPendingQuizConfig({ words: selectedWords, allDistractors: allUnitWords, title: topicTitle.replace(' (Özel Çalışma)', '') + ' (Seçmeli Test)', type: 'custom' }); } 
  };

  const handleCreateChallenge = (config: any) => {
      setActiveModal(null);
      if (VOCABULARY[config.unit.id]) {
          const unitWords = VOCABULARY[config.unit.id].map(w => ({...w, unitId: config.unit.id}));
          const challengeWords = shuffleArray(unitWords).slice(0, config.count);
          setWords(challengeWords); setAllUnitWords(unitWords); setTopicTitle(`Düello Oluştur: ${config.unit.title}`); setActiveQuizDifficulty(config.difficulty);
          setChallengeState({ mode: 'create', unitId: config.unit.id, challengeType: config.type, targetFriendId: config.targetFriendId });
          changeMode(AppMode.QUIZ);
      } else { showAlert("Hata", "Bu ünitede kelime bulunamadı.", "error"); }
  };

  const handleJoinChallenge = (challengeData: any, challengeWords: WordCard[]) => {
       setActiveModal(null);
       if (challengeData.matchId) {
           setWords(challengeWords); setAllUnitWords(challengeWords); setTopicTitle(`Turnuva Maçı: ${challengeData.tournamentName}`); setActiveQuizDifficulty(challengeData.difficulty || 'normal'); 
           setChallengeState({ mode: 'tournament', tournamentMatchId: challengeData.matchId, data: challengeData, tournamentName: challengeData.tournamentName });
           changeMode(AppMode.QUIZ);
           return;
       }
       setWords(challengeWords); setAllUnitWords(challengeWords); setTopicTitle(`Düello: ${challengeData.creatorName}`); setActiveQuizDifficulty(challengeData.difficulty);
       setChallengeState({ mode: 'join', data: challengeData });
       changeMode(AppMode.QUIZ);
  };

  const handleWelcomeLogin = () => { setShowWelcomeScreen(false); setAuthInitialView('login'); setActiveModal('auth'); };
  const handleWelcomeRegister = () => { setShowWelcomeScreen(false); setAuthInitialView('register'); setActiveModal('auth'); };
  const handleWelcomeGuest = () => { setShowWelcomeScreen(false); setIsOnboardingGuest(true); setAvailableGradesForReview(['2','3','4','5','6','7','8','9','10','11','12','A1','A2','B1','B2','C1']); setActiveModal('grade'); };

  const onSelectCategoryHandler = (cat: CategoryType | null) => { setSelectedCategory(cat); };
  const onSelectGradeHandler = (grade: GradeLevel | null) => { setSelectedGrade(grade); };
  const onSelectUnitHandler = (unit: UnitDef | null) => { setSelectedUnit(unit); };
  const showBackButton = (mode !== AppMode.HOME) || (selectedCategory !== null);
  
  let content;
  switch (mode) {
    case AppMode.HOME: content = ( <TopicSelector selectedCategory={selectedCategory} selectedGrade={selectedGrade} selectedMode={selectedStudyMode} selectedUnit={selectedUnit} onSelectCategory={onSelectCategoryHandler} onSelectGrade={onSelectGradeHandler} onSelectMode={(mode) => setSelectedStudyMode(mode)} onSelectUnit={onSelectUnitHandler} onStartModule={handleStartModule} onGoHome={handleGoHome} onOpenMarket={handleOpenMarket} /> ); break;
    case AppMode.LOADING: content = ( <div className="flex flex-col items-center justify-center h-full animate-pulse"> <img src="https://8upload.com/image/4864223e0a7b82f8/AppLogo.png" alt="Loading..." className="w-24 h-24 rounded-2xl mb-4 shadow-lg"/> <div className="text-center font-bold" style={{color: 'var(--color-text-muted)'}}>Yükleniyor...</div> </div> ); break;
    case AppMode.FLASHCARDS: content = ( <FlashcardDeck words={words} onFinish={handleManualBack} onBack={handleManualBack} onHome={handleGoHome} isReviewMode={isSRSReview} onCelebrate={handleTriggerCelebration} onBadgeUnlock={handleBadgeUnlock} grade={selectedGrade} /> ); break;
    case AppMode.QUIZ: content = ( <Quiz words={words} allWords={allUnitWords} onRestart={handleQuizRestart} onBack={handleManualBack} onHome={handleGoHome} isBookmarkQuiz={activeQuizType === 'bookmarks'} isReviewMode={isSRSReview} difficulty={activeQuizDifficulty} onCelebrate={handleTriggerCelebration} onBadgeUnlock={handleBadgeUnlock} grade={selectedGrade} challengeMode={challengeState?.mode} challengeData={challengeState?.data} unitIdForChallenge={challengeState?.unitId} challengeType={challengeState?.challengeType} targetFriendId={challengeState?.targetFriendId} tournamentMatchId={challengeState?.tournamentMatchId} tournamentName={challengeState?.tournamentName} /> ); break;
    case AppMode.CUSTOM_PRACTICE: content = ( <WordSelector words={allUnitWords} unitTitle={topicTitle.replace(' (Özel Çalışma)', '')} onStart={handleCustomPracticeStart} onBack={handleManualBack} /> ); break;
    case AppMode.GRAMMAR: if (selectedUnit) { content = <GrammarView unit={selectedUnit} onBack={handleManualBack} onHome={handleGoHome} />; } break;
    case AppMode.EMPTY_WARNING: content = <EmptyStateWarning type={emptyWarningType || 'bookmarks'} onStudy={() => { selectedUnit && handleStartModule('study', selectedUnit); }} onHome={handleGoHome} />; break;
    case AppMode.PROFILE: content = ( <Profile onBack={handleManualBack} onProfileUpdate={handleProfileUpdate} onOpenMarket={handleOpenMarket} onLoginRequest={(initialView) => { setAuthInitialView(initialView || 'login'); setActiveModal('auth'); }} externalStats={userStats} showAlert={showAlert} onViewProfile={(id) => setViewProfileId(id)} /> ); break;
    case AppMode.INFO: content = <InfoView onBack={handleManualBack} />; break;
    case AppMode.ANNOUNCEMENTS: content = <AnnouncementsView onBack={handleManualBack} />; break;
    case AppMode.MATCHING: content = ( <MatchingGame words={words} onFinish={handleManualBack} onBack={handleManualBack} onHome={handleGoHome} onCelebrate={handleTriggerCelebration} onBadgeUnlock={handleBadgeUnlock} grade={selectedGrade} /> ); break;
    case AppMode.MAZE: content = ( <MazeGame words={words} onFinish={handleManualBack} onBack={handleManualBack} onHome={handleGoHome} onCelebrate={handleTriggerCelebration} grade={selectedGrade} /> ); break;
    case AppMode.WORD_SEARCH: content = ( <WordSearchGame words={words} onFinish={() => handleStartModule('wordSearch', selectedUnit!)} onBack={handleManualBack} onHome={handleGoHome} onCelebrate={handleTriggerCelebration} grade={selectedGrade} /> ); break;
    case AppMode.ERROR: content = <div className="text-center p-10 text-red-500">Bir hata oluştu.</div>; break;
  }

  return (
    <div className="flex flex-col h-[100dvh] font-sans pt-safe pb-safe overflow-hidden transition-colors duration-300" style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-main)'}}>
      {showWelcomeScreen && ( <WelcomeScreen onLogin={handleWelcomeLogin} onRegister={handleWelcomeRegister} onGuest={handleWelcomeGuest} /> )}
      {newBadge && ( <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[110] w-full max-w-sm px-4 pointer-events-none"> <div className="bg-yellow-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 border-2 border-yellow-300"> <div className="text-4xl animate-bounce"> {newBadge.image ? ( <img src={newBadge.image} alt={newBadge.name} className="w-10 h-10 rounded-full object-cover" /> ) : ( <span className="flex items-center justify-center w-10 h-10 text-3xl">{newBadge.icon}</span> )} </div> <div> <div className="text-xs font-bold text-yellow-100 uppercase tracking-wide mb-0.5">Yeni Rozet Kazanıldı!</div> <div className="font-black text-lg leading-tight">{newBadge.name}</div> </div> <Trophy className="ml-auto text-yellow-200" size={24} /> </div> </div> )}
      {activeModal === 'auth' && <AuthModal onClose={() => setActiveModal(null)} onSuccess={() => { handleProfileUpdate(); setActiveModal(null); }} initialView={authInitialView} />}
      {activeModal === 'settings' && ( <SettingsModal onClose={() => setActiveModal(null)} onOpenFeedback={() => setActiveModal('feedback')} onOpenAdmin={() => setActiveModal('admin')} onRestartTutorial={() => {}} /> )}
      {activeModal === 'feedback' && <FeedbackModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'admin' && ( <AdminModal onClose={() => setActiveModal(null)} onUpdate={() => { handleProfileUpdate(); }} /> )}
      {activeModal === 'challenge' && ( <ChallengeModal onClose={() => setActiveModal(null)} onCreateChallenge={handleCreateChallenge} onJoinChallenge={handleJoinChallenge} /> )}
      <InstallPromptModal />
      {activeModal === 'srs' && <SRSInfoModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'market' && <MarketModal onClose={() => { setActiveModal(null); handleProfileUpdate(); }} onThemeChange={handleThemeChange} />}
      {activeModal === 'grade' && ( <GradeSelectionModal onClose={() => { setActiveModal(null); setIsOnboardingGuest(false); }} onSelect={handleGradeSelect} grades={availableGradesForReview} title={isOnboardingGuest ? 'Sınıfını Seç' : undefined} description={isOnboardingGuest ? 'Hangi seviyede İngilizce çalışmak istiyorsun?' : undefined} /> )}
      {pendingQuizConfig && <QuizSetupModal onClose={handleManualBack} onStart={startQuizWithCount} totalWords={pendingQuizConfig.words.length} title={pendingQuizConfig.title} />}
      {celebration?.show && <Celebration message={celebration.message} type={celebration.type} onClose={() => setCelebration(null)} />}
      {activeModal === 'avatar' && <AvatarModal onClose={() => setActiveModal(null)} userStats={userStats || { flashcardsViewed: 0, quizCorrect: 0, quizWrong: 0, date: '', dailyGoal: 5, xp: 0, level: 1, streak: 0, lastStudyDate: null, badges: [], xpBoostEndTime: 0, lastGoalMetDate: null, viewedWordsToday: [], perfectQuizzes: 0, questsCompleted: 0, totalTimeSpent: 0, duelWins: 0, duelPoints: 0, completedUnits: [], completedGrades: [], weekly: { weekId: '', quizCorrect: 0, quizWrong: 0, cardsViewed: 0, matchingBestTime: 0, mazeHighScore: 0, wordSearchHighScore: 0, typingHighScore: 0, chainHighScore: 0 } }} onUpdate={() => { setHeaderProfile(getUserProfile()); if(handleProfileUpdate) handleProfileUpdate(); }} />}
      {viewProfileId && ( <UserProfileModal userId={viewProfileId} onClose={() => setViewProfileId(null)} /> )}
      <CustomAlert visible={alertState.visible} title={alertState.title} message={alertState.message} type={alertState.type} onClose={() => setAlertState(prev => ({ ...prev, visible: false }))} onConfirm={alertState.onConfirm} />
      <header className="backdrop-blur-xl border-b z-50 shrink-0 transition-colors h-16 header-theme" style={{backgroundColor: 'rgba(var(--color-bg-card-rgb), 0.8)', borderColor: 'rgba(255,255,255,0.1)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-fit">
            {showBackButton ? ( <button onClick={handleManualBack} className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold transition-all active:scale-95 group" style={{color: 'var(--color-text-muted)'}}> <ChevronLeft size={22} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" /> <span className="hidden sm:inline">Geri</span> </button> ) : ( isBoostActive ? ( <div className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-1.5 rounded-xl animate-pulse shadow-lg shadow-yellow-500/30 border border-yellow-400"> <Zap size={16} fill="currentColor" /> <div className="flex flex-col items-start leading-none"> <span className="text-[10px] font-bold uppercase opacity-90">2x Boost</span> <span className="text-xs font-black">{boostTimeLeft}</span> </div> </div> ) : ( <div className="w-2"></div> ) )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 justify-end min-w-fit">
             {mode !== AppMode.ANNOUNCEMENTS && ( <button onClick={handleOpenAnnouncements} className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{color: 'var(--color-text-muted)'}}> {UI_ICONS.notifications} {hasUnreadAnnouncements && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-50 rounded-full ring-2 ring-white"></span>} </button> )}
             <button onClick={handleOpenChallenge} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95 text-orange-500 bg-orange-100 dark:bg-orange-900/30 relative"> <Swords size={20} /> {hasPendingDuel && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-50 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>} </button>
             {mode !== AppMode.INFO && <button onClick={handleOpenInfo} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{color: 'var(--color-text-muted)'}}>{UI_ICONS.info}</button>}
             {mode !== AppMode.PROFILE && ( <button id="profile-button" onClick={handleOpenProfile} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{color: 'var(--color-text-muted)'}}> {UI_ICONS.profile} </button> )}
             <button onClick={handleGoHome} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{color: 'var(--color-text-muted)'}}>{UI_ICONS.home}</button>
             <button onClick={handleOpenSettings} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{color: 'var(--color-text-muted)'}}>{UI_ICONS.settings}</button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-7xl mx-auto relative main-content">
        {content}
      </main>
    </div>
  );
};

export default App;
