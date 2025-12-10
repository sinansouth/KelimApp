import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WordCard, AppMode, Badge, ThemeType, UnitDef, GradeLevel, StudyMode, CategoryType, QuizDifficulty, Challenge, UserStats } from './types';
import TopicSelector from './components/TopicSelector';
import { THEME_COLORS, UI_ICONS, UNIT_ASSETS } from './data/assets';
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
import FeedbackModal from './components/FeedbackModal';
import AdminModal from './components/AdminModal';
import InstallPromptModal from './components/InstallPromptModal';
import ChallengeModal from './components/ChallengeModal';
import UserProfileModal from './components/UserProfileModal';
import WelcomeScreen from './components/WelcomeScreen';
import CustomAlert, { AlertType } from './components/CustomAlert';
import { ChevronLeft, Zap, Swords, Trophy, AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { getUserProfile, getTheme, getAppSettings, getMemorizedSet, getDueWords, saveLastActivity, getLastReadAnnouncementId, setLastReadAnnouncementId, checkDataVersion, getDueGrades, getUserStats, updateTimeSpent, createGuestProfile, hasSeenTutorial, markTutorialAsSeen, saveSRSData, saveUserStats, overwriteLocalWithCloud } from './services/userService';
import { supabase, syncLocalToCloud, getOpenChallenges, getGlobalSettings, getUserData } from './services/supabase';
import { getWordsForUnit, fetchAllWords, getVocabulary, fetchDynamicContent, getAnnouncements, getUnitAssets } from './services/contentService';
import { requestNotificationPermission } from './services/notificationService';
import { playSound } from './services/soundService';
import { APP_CONFIG } from './config/appConfig';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import MatchingGame from './components/MatchingGame';
import MazeGame from './components/MazeGame';
import WordSearchGame from './components/WordSearchGame';

const App: React.FC = () => {
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(false);
    const [mode, setMode] = useState<AppMode>(AppMode.HOME);
    const [history, setHistory] = useState<AppMode[]>([]);
    const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark');
    const [userStats, setUserStats] = useState<UserStats>(getUserStats());

    const [activeModal, setActiveModal] = useState<'settings' | 'srs' | 'market' | 'auth' | 'grade' | 'feedback' | 'admin' | 'avatar' | 'challenge' | null>(null);
    const [authInitialView, setAuthInitialView] = useState<'login' | 'register'>('login');
    const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

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
        challengeType?: 'public' | 'private' | 'friend',
        targetFriendId?: string,
        tournamentMatchId?: string,
        tournamentName?: string
    } | null>(null);

    const lastQuizConfig = useRef<{ count: number, difficulty: QuizDifficulty, originalWords: WordCard[], allDistractors: WordCard[] } | null>(null);
    
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
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            try {
                const challenges = await getOpenChallenges(user.id);
                setHasPendingDuel(challenges.length > 0);
            } catch (e) { /* Silently handle duel check error */ }
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                updateTimeSpent(1); 
            }
        }, 60000); 

        return () => clearInterval(interval);
    }, []);

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
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        };

        root.style.setProperty('--color-primary', currentThemeColors.primary);
        root.style.setProperty('--color-bg-main', currentThemeColors.bgMain);
        root.style.setProperty('--color-bg-card', currentThemeColors.bgCard);
        root.style.setProperty('--color-text-main', currentThemeColors.textMain);
        root.style.setProperty('--color-text-muted', currentThemeColors.textMuted);
        root.style.setProperty('--color-border', currentThemeColors.border);
        
        // Apply font family
        if (currentThemeColors.fontFamily) {
            root.style.setProperty('--font-theme', currentThemeColors.fontFamily);
        }

        root.style.setProperty('--color-bg-card-rgb', hexToRgb(currentThemeColors.bgCard));
        root.style.setProperty('--color-primary-rgb', hexToRgb(currentThemeColors.primary));
    }, [currentTheme]);

    const initializeApp = async () => {
        setIsAppLoading(true);
        setLoadingError(false);
        
        try {
            // REMOVED THE TIMEOUT RACE CONDITION.
            // We now wait for promises, but if they fail internally, they return safe defaults.
            // This prevents the "Application data could not be loaded" error on slow connections or timeouts.
            await Promise.all([
                fetchAllWords().catch(e => console.warn("Failed to fetch all words, continuing with local/cache", e)),
                fetchDynamicContent().catch(e => console.warn("Failed to fetch dynamic content", e))
            ]);

            const currentSettings = getAppSettings();
            applyTheme(currentSettings.theme);
            
            const settings = await getGlobalSettings().catch(() => ({}));
            if (settings.maintenance_mode?.isActive) {
                const profile = getUserProfile();
                if (!profile.isAdmin) {
                    setMaintenanceMode(true);
                }
            }
            
            const announcements = await getAnnouncements();
            const lastReadId = getLastReadAnnouncementId();
            if (announcements.length > 0 && announcements[0].id !== lastReadId) {
                setHasUnreadAnnouncements(true);
            }

            setIsAppLoading(false);
        } catch (error) {
            console.error("Initialization error (critical):", error);
            // Only set loading error if something truly catastrophic happens that prevents app structure from loading
            // With the try-catch blocks above, this should rarely be reached.
            setLoadingError(true);
            setIsAppLoading(false);
        }
    };

    useEffect(() => {
        initializeApp();

        const localProfile = getUserProfile();
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
             const user = session?.user;
             if (!user) {
                 if (!localProfile.name) {
                     setShowWelcomeScreen(true);
                 }
             } else {
                 const userData = await getUserData(user.id);
                 if (userData && userData.profile.isAdmin) {
                     setMaintenanceMode(false);
                 }
                 
                 if (userData) {
                     overwriteLocalWithCloud(userData);
                 }

                 checkForDuels();
                 localStorage.setItem('lgs_last_uid', user.id);
                 refreshGlobalState();
                 const updatedSettings = getAppSettings();
                 applyTheme(updatedSettings.theme);
             }
        });
        
        const handleOnline = () => {
            console.log("App is online, retrying initialization...");
            if (loadingError) initializeApp();
        };
        window.addEventListener('online', handleOnline);
        
        return () => {
            authListener.subscription.unsubscribe();
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    useEffect(() => {
        if (isAppLoading || loadingError) return;

        const dataWiped = checkDataVersion();
        if (dataWiped) { window.location.reload(); return; }

        const checkWelcomeScreen = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const localProfile = getUserProfile();

            if (!user && (!localProfile.name || localProfile.isGuest)) {
                setShowWelcomeScreen(true);
            } else if (!hasSeenTutorial()) {
                changeMode(AppMode.INFO);
                markTutorialAsSeen();
            }
        };

        checkWelcomeScreen();
        applyUserProfileGrade();
        refreshGlobalState();
    }, [isAppLoading, loadingError, applyUserProfileGrade]);

    const changeMode = (newMode: AppMode) => {
        setHistory(prev => [...prev, mode]);
        setMode(newMode);
    };
    
    const handleModalClose = () => {
        const previousModal = activeModal;
        setActiveModal(null);
        setIsOnboardingGuest(false);

        // After a brief moment to allow state to update
        setTimeout(() => {
            const profile = getUserProfile();
            // If user canceled login/register or guest grade selection, and still no profile exists,
            // send them back to the main choice screen.
            if ((previousModal === 'auth' || previousModal === 'grade') && !profile.name) {
                setShowWelcomeScreen(true);
            }
        }, 100);
    };

    const goBack = useCallback(() => {
        if (viewProfileId) { setViewProfileId(null); return true; }
        if (activeModal) {
            handleModalClose();
            return true;
        }
        if (pendingQuizConfig) { setPendingQuizConfig(null); return true; }

        if (mode !== AppMode.HOME) {
            setMode(AppMode.HOME);
            setIsSRSReview(false);
            setChallengeState(null);
            return true;
        }

        if (selectedUnit) { setSelectedUnit(null); return true; }
        if (selectedStudyMode) { setSelectedStudyMode(null); return true; }
        if (selectedGrade) { setSelectedGrade(null); return true; }
        if (selectedCategory) { setSelectedCategory(null); return true; }

        return false;
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
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !getUserProfile().isGuest) {
            await syncLocalToCloud(user.id);
            checkForDuels();
        }
        refreshGlobalState();
        const savedTheme = getTheme();
        if (savedTheme !== currentTheme) {
            applyTheme(savedTheme);
        }
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

    const handleCreateChallenge = (config: {
        grade: GradeLevel,
        unit: UnitDef,
        difficulty: QuizDifficulty,
        count: number,
        type: 'public' | 'private' | 'friend',
        targetFriendId?: string
    }) => {
        setActiveModal(null);
        setMode(AppMode.LOADING);

        const setupChallengeQuiz = async () => {
            try {
                const unitWords = await getWordsForUnit(config.unit.id);
                if (unitWords.length < 4) {
                    showAlert("Hata", "Bu ünite düello için yeterli kelime içermiyor (en az 4).", "error");
                    setMode(AppMode.HOME);
                    return;
                }
                
                const finalCount = Math.min(config.count, unitWords.length);
                const challengeWords = shuffleArray(unitWords).slice(0, finalCount);
                
                setWords(challengeWords);
                setAllUnitWords(unitWords);
                setTopicTitle(`Düello Oluştur: ${config.unit.title}`);
                setActiveQuizDifficulty(config.difficulty);
                setChallengeState({
                    mode: 'create',
                    unitId: config.unit.id,
                    challengeType: config.type,
                    targetFriendId: config.targetFriendId
                });
                changeMode(AppMode.QUIZ);
            } catch (e) {
                setMode(AppMode.HOME);
                showAlert("Hata", "Düello kelimeleri yüklenirken bir hata oluştu.", "error");
            }
        };

        setupChallengeQuiz();
    };

    const handleJoinChallenge = (challengeData: any, challengeWords: WordCard[]) => {
        setActiveModal(null);
        if (challengeData.matchId) {
            setWords(challengeWords); 
            setAllUnitWords(challengeWords); 
            setTopicTitle(`Turnuva Maçı: ${challengeData.tournamentName}`); 
            setActiveQuizDifficulty(challengeData.difficulty || 'normal');
            setChallengeState({ 
                mode: 'tournament', 
                tournamentMatchId: challengeData.matchId, 
                data: challengeData, 
                tournamentName: challengeData.tournamentName 
            });
            changeMode(AppMode.QUIZ);
            return;
        }
        setWords(challengeWords); 
        setAllUnitWords(challengeWords); 
        setTopicTitle(`Düello: ${challengeData.creatorName}`); 
        setActiveQuizDifficulty(challengeData.difficulty);
        setChallengeState({ mode: 'join', data: challengeData });
        changeMode(AppMode.QUIZ);
    };

    const handleOpenProfile = () => { changeMode(AppMode.PROFILE); setTopicTitle('Profilim'); refreshGlobalState(); };
    const handleOpenInfo = () => { changeMode(AppMode.INFO); setTopicTitle('İpuçları'); };
    const handleOpenMarket = () => { setActiveModal('market'); };
    // FIX: getAnnouncements is async, so we need to await it.
    const handleOpenAnnouncements = async () => {
        changeMode(AppMode.ANNOUNCEMENTS);
        setTopicTitle('Duyurular');
        const announcements = await getAnnouncements();
        if (announcements.length > 0) {
            setLastReadAnnouncementId(announcements[0].id);
            setHasUnreadAnnouncements(false);
        }
    };
    const handleOpenSettings = () => { setActiveModal('settings'); };

    const handleOpenChallenge = () => {
        const profile = getUserProfile();
        if (profile.isGuest) {
            showAlert("Misafir Modu", "Düello modunu kullanmak için lütfen giriş yapın veya kayıt olun.", "warning", () => { setAuthInitialView('register'); setActiveModal('auth'); });
            return;
        }
        setActiveModal('challenge');
    };

    const shuffleArray = <T,>(array: T[]): T[] => { const newArray = [...array]; for (let i = newArray.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[newArray[i], newArray[j]] = [newArray[j], newArray[i]]; } return newArray; };

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

    const handleStartModule = async (action: string, unit: UnitDef) => {
        setMode(AppMode.LOADING);

        if (selectedGrade && unit.id !== 'review' && !unit.id.endsWith('all') && unit.id !== 'uAll') {
            saveLastActivity(selectedGrade, unit.id);
        }

        let unitWords: WordCard[] = [];
        let allDistractors: WordCard[] = [];
        const isAllInOne = unit.id.endsWith('all') || unit.id === 'uAll';

        try {
            const vocabulary = await getVocabulary();

            if (action === 'review' || action === 'review-flashcards') {
                let allowedUnitIds: string[] | undefined = undefined;
                if (selectedGrade) {
                    const gradeUnits = getUnitAssets()[selectedGrade];
                    if (gradeUnits) { allowedUnitIds = gradeUnits.map(u => u.id); }
                    unitWords = await getDueWords(allowedUnitIds);
                    if (unitWords.length === 0) {
                        setMode(AppMode.HOME);
                        handleTriggerCelebration("Tebrikler! Şu an tekrar edilecek kelime yok.", 'goal');
                        return;
                    }
                    allDistractors = Object.values(vocabulary).flat();
                } else {
                    const dueGrades = getDueGrades();
                    if (dueGrades.length > 1) {
                        setMode(AppMode.HOME);
                        setAvailableGradesForReview(dueGrades);
                        setActiveModal('grade');
                        return;
                    }
                    else if (dueGrades.length === 1) {
                        const g = dueGrades[0] as GradeLevel;
                        const gradeUnits = getUnitAssets()[g];
                        if (gradeUnits) { allowedUnitIds = gradeUnits.map(u => u.id); }
                        unitWords = await getDueWords(allowedUnitIds);
                        allDistractors = Object.values(vocabulary).flat();
                    } else {
                        setMode(AppMode.HOME);
                        handleTriggerCelebration("Tebrikler! Şu an tekrar edilecek kelime yok.", 'goal');
                        return;
                    }
                }
            } else {
                if (isAllInOne && selectedGrade) {
                    const allGradeUnits = getUnitAssets()[selectedGrade];
                    // Filter units first to ensure index alignment with results
                    const targetUnits = allGradeUnits.filter(u => u.id !== unit.id);
                    const promises = targetUnits.map(u => getWordsForUnit(u.id));
                    
                    const results = await Promise.all(promises);
                    results.forEach((list, index) => {
                        if(list) {
                            const uId = targetUnits[index].id;
                            // Explicitly cast list to WordCard[] to satisfy TS
                            const typedList = list as WordCard[];
                            const taggedWords = typedList.map(w => ({ ...w, unitId: uId }));
                            unitWords = [...unitWords, ...taggedWords];
                        }
                    });
                } else { 
                    // Explicit cast here as well to satisfy TS
                    unitWords = (await getWordsForUnit(unit.id)) as WordCard[];
                }
                allDistractors = unitWords;
            }

            let newTitle = (action === 'review' || action === 'review-flashcards') ? 'Günlük Tekrar' : (isAllInOne ? unit.title : `${unit.unitNo} - ${unit.title}`);

            if (action !== 'grammar' && unitWords.length === 0 && action !== 'quiz-bookmarks' && action !== 'quiz-memorized') { 
                setMode(AppMode.HOME);
                showAlert("Uyarı", "Bu ünite için içerik yüklenemedi. İnternet bağlantınızı kontrol edin veya daha sonra deneyin.", "warning"); 
                return; 
            }

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
                setMode(AppMode.HOME); 
            }
        } catch (e: any) {
            console.error('❌ handleStartModule ERROR:', e);
            setMode(AppMode.HOME);
            showAlert("Hata", "İçerik yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.", "error");
        }
    };

    const handleCustomPracticeStart = (selectedWords: WordCard[], startMode: 'study' | 'quiz') => {
        if (startMode === 'study') { setWords(shuffleArray(selectedWords)); changeMode(AppMode.FLASHCARDS); }
        else { setPendingQuizConfig({ words: selectedWords, allDistractors: allUnitWords, title: topicTitle.replace(' (Özel Çalışma)', '') + ' (Seçmeli Test)', type: 'custom' }); }
    };

    const handleGradeSelect = async (grade: GradeLevel) => {
        if (isOnboardingGuest) {
            createGuestProfile(grade);
            setIsOnboardingGuest(false);
            setActiveModal(null);
            handleProfileUpdate();
            return;
        }
        setActiveModal(null);
        setMode(AppMode.LOADING);
        try {
            const gradeUnits = getUnitAssets()[grade];
            let allowedUnitIds: string[] = [];
            if (gradeUnits) { allowedUnitIds = gradeUnits.map(u => u.id); }
            const dueWords = await getDueWords(allowedUnitIds);

            if (dueWords.length === 0) {
                setMode(AppMode.HOME);
                handleTriggerCelebration("Tebrikler! Bu seviyede tekrar edilecek kelime yok.", 'goal');
                return;
            }

            const vocabulary = await getVocabulary();
            const allDistractors = Object.values(vocabulary).flat();
            
            setWords(shuffleArray(dueWords));
            setAllUnitWords(allDistractors);
            setTopicTitle(`Günlük Tekrar (${grade}. Sınıf)`);
            setIsSRSReview(true);
            setActiveQuizType('review');
            setActiveQuizDifficulty('normal');
            changeMode(AppMode.QUIZ);
        } catch (e) {
            setMode(AppMode.HOME);
            showAlert("Hata", "Tekrar kelimeleri yüklenemedi.", "error");
        }
    };

    const handleWelcomeLogin = () => { setShowWelcomeScreen(false); setAuthInitialView('login'); setActiveModal('auth'); };
    const handleWelcomeRegister = () => { setShowWelcomeScreen(false); setAuthInitialView('register'); setActiveModal('auth'); };
    const handleWelcomeGuest = () => { setShowWelcomeScreen(false); setIsOnboardingGuest(true); setAvailableGradesForReview(['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'A1', 'A2', 'B1', 'B2', 'C1']); setActiveModal('grade'); };
    
    const onSelectCategoryHandler = (cat: CategoryType | null) => { setSelectedCategory(cat); };
    const onSelectGradeHandler = (grade: GradeLevel | null) => { setSelectedGrade(grade); };
    const onSelectUnitHandler = (unit: UnitDef | null) => { setSelectedUnit(unit); };
    const showBackButton = (mode !== AppMode.HOME) || (selectedCategory !== null);
    
    // ERROR/LOADING SCREEN
    if (loadingError) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900 text-white">
                 <WifiOff size={64} className="text-red-500 mb-6" />
                 <h1 className="text-2xl font-black mb-4">Bağlantı Sorunu</h1>
                 <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                     Uygulama verileri yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.
                 </p>
                 <button 
                    onClick={() => initializeApp()} 
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95"
                 >
                     <RefreshCw size={20} /> Yeniden Dene
                 </button>
            </div>
        );
    }

    if (isAppLoading || maintenanceMode) {
        const message = maintenanceMode ? "Sistem Bakımda" : "Yükleniyor...";
        const subMessage = maintenanceMode ? "KelimApp şu anda daha iyi hizmet verebilmek için güncelleniyor. Lütfen kısa bir süre sonra tekrar deneyiniz." : "Uygulama verileri hazırlanıyor...";
        const icon = maintenanceMode ? <AlertTriangle size={64} className="text-yellow-500 mb-6 animate-pulse" /> : <img src="https://8upload.com/image/4864223e0a7b82f8/AppLogo.png" alt="Loading..." className="w-24 h-24 rounded-2xl mb-4 shadow-lg animate-pulse" />;
        
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900 text-white relative">
                 {icon}
                 <h1 className="text-3xl font-black mb-4">{message}</h1>
                 <p className="text-slate-400 mb-8">{subMessage}</p>
                 
                 {!maintenanceMode && (
                     <button 
                        onClick={() => initializeApp()}
                        className="absolute bottom-12 opacity-50 hover:opacity-100 text-xs font-bold text-slate-500 hover:text-white transition-all flex items-center gap-2"
                     >
                         <RefreshCw size={12} /> Yükleme uzun sürdüyse tıkla
                     </button>
                 )}
            </div>
        );
    }

    let content;
    switch (mode) {
        case AppMode.HOME: content = (<TopicSelector selectedCategory={selectedCategory} selectedGrade={selectedGrade} selectedMode={selectedStudyMode} selectedUnit={selectedUnit} onSelectCategory={onSelectCategoryHandler} onSelectGrade={onSelectGradeHandler} onSelectMode={(mode) => setSelectedStudyMode(mode)} onSelectUnit={onSelectUnitHandler} onStartModule={handleStartModule} onGoHome={handleGoHome} onOpenMarket={handleOpenMarket} />); break;
        case AppMode.LOADING: content = (<div className="flex flex-col items-center justify-center h-full animate-pulse"> <img src="https://8upload.com/image/4864223e0a7b82f8/AppLogo.png" alt="Loading..." className="w-24 h-24 rounded-2xl mb-4 shadow-lg" /> <div className="text-center font-bold" style={{ color: 'var(--color-text-muted)' }}>Yükleniyor...</div> </div>); break;
        case AppMode.FLASHCARDS: content = (<FlashcardDeck words={words} onFinish={handleManualBack} onBack={handleManualBack} onHome={handleGoHome} isReviewMode={isSRSReview} onCelebrate={handleTriggerCelebration} onBadgeUnlock={handleBadgeUnlock} grade={selectedGrade} />); break;
        case AppMode.QUIZ: content = (<Quiz words={words} allWords={allUnitWords} onRestart={handleQuizRestart} onBack={handleManualBack} onHome={handleGoHome} isBookmarkQuiz={activeQuizType === 'bookmarks'} isReviewMode={isSRSReview} difficulty={activeQuizDifficulty} onCelebrate={handleTriggerCelebration} onBadgeUnlock={handleBadgeUnlock} grade={selectedGrade} challengeMode={challengeState?.mode} challengeData={challengeState?.data} unitIdForChallenge={challengeState?.unitId} challengeType={challengeState?.challengeType} targetFriendId={challengeState?.targetFriendId} tournamentMatchId={challengeState?.tournamentMatchId} tournamentName={challengeState?.tournamentName} />); break;
        case AppMode.CUSTOM_PRACTICE: content = (<WordSelector words={allUnitWords} unitTitle={topicTitle.replace(' (Özel Çalışma)', '')} onStart={handleCustomPracticeStart} onBack={handleManualBack} />); break;
        case AppMode.GRAMMAR: if (selectedUnit) { content = <GrammarView unit={selectedUnit} onBack={handleManualBack} onHome={handleGoHome} />; } break;
        case AppMode.EMPTY_WARNING: content = <EmptyStateWarning type={emptyWarningType || 'bookmarks'} onStudy={() => { selectedUnit && handleStartModule('study', selectedUnit); }} onHome={handleGoHome} />; break;
        case AppMode.PROFILE: content = (<Profile onBack={handleManualBack} onProfileUpdate={handleProfileUpdate} onOpenMarket={handleOpenMarket} onLoginRequest={(initialView) => { setAuthInitialView(initialView || 'login'); setActiveModal('auth'); }} externalStats={userStats} showAlert={showAlert} onViewProfile={(id) => setViewProfileId(id)} />); break;
        case AppMode.INFO: content = <InfoView onBack={handleManualBack} />; break;
        case AppMode.ANNOUNCEMENTS: content = <AnnouncementsView onBack={handleManualBack} />; break;
        case AppMode.MATCHING: content = (<MatchingGame words={words} onFinish={handleManualBack} onBack={handleManualBack} onHome={handleGoHome} onCelebrate={handleTriggerCelebration} onBadgeUnlock={handleBadgeUnlock} grade={selectedGrade} />); break;
        case AppMode.MAZE: content = (<MazeGame words={words} onFinish={handleManualBack} onBack={handleManualBack} onHome={handleGoHome} onCelebrate={handleTriggerCelebration} grade={selectedGrade} />); break;
        case AppMode.WORD_SEARCH: content = (<WordSearchGame words={words} onFinish={() => handleStartModule('wordSearch', selectedUnit!)} onBack={handleManualBack} onHome={handleGoHome} onCelebrate={handleTriggerCelebration} grade={selectedGrade} />); break;
        case AppMode.ERROR: content = <div className="text-center p-10 text-red-500">Bir hata oluştu.</div>; break;
    }

    return (
        <div className="flex flex-col h-[100dvh] font-sans pt-safe pb-safe overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-main)' }}>
            {showWelcomeScreen && (<WelcomeScreen onLogin={handleWelcomeLogin} onRegister={handleWelcomeRegister} onGuest={handleWelcomeGuest} />)}
            {newBadge && (<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[110] w-full max-w-sm px-4 pointer-events-none"> <div className="bg-yellow-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 border-2 border-yellow-300"> <div className="text-4xl animate-bounce"> {newBadge.image ? (<img src={newBadge.image} alt={newBadge.name} className="w-10 h-10 rounded-full object-cover" />) : (<span className="flex items-center justify-center w-10 h-10 text-3xl">{newBadge.icon}</span>)} </div> <div> <div className="text-xs font-bold text-yellow-100 uppercase tracking-wide mb-0.5">Yeni Rozet Kazanıldı!</div> <div className="font-black text-lg leading-tight">{newBadge.name}</div> </div> <Trophy className="ml-auto text-yellow-200" size={24} /> </div> </div>)}
            {activeModal === 'auth' && <AuthModal onClose={handleModalClose} onSuccess={() => { handleProfileUpdate(); setActiveModal(null); }} initialView={authInitialView} />}
            {activeModal === 'settings' && (<SettingsModal onClose={() => setActiveModal(null)} onOpenFeedback={() => setActiveModal('feedback')} onOpenAdmin={() => setActiveModal('admin')} onRestartTutorial={() => { }} />)}
            {activeModal === 'feedback' && <FeedbackModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'admin' && (<AdminModal onClose={() => setActiveModal(null)} onUpdate={() => { handleProfileUpdate(); }} />)}
            {activeModal === 'challenge' && (<ChallengeModal onClose={() => setActiveModal(null)} onCreateChallenge={handleCreateChallenge} onJoinChallenge={handleJoinChallenge} />)}
            <InstallPromptModal />
            {activeModal === 'srs' && <SRSInfoModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'market' && <MarketModal onClose={() => { setActiveModal(null); handleProfileUpdate(); }} onThemeChange={handleThemeChange} />}
            {activeModal === 'grade' && (<GradeSelectionModal onClose={handleModalClose} onSelect={handleGradeSelect} grades={availableGradesForReview} title={isOnboardingGuest ? 'Sınıfını Seç' : undefined} description={isOnboardingGuest ? 'Hangi seviyede İngilizce çalışmak istorsun?' : undefined} />)}
            {pendingQuizConfig && <QuizSetupModal onClose={handleManualBack} onStart={startQuizWithCount} totalWords={pendingQuizConfig.words.length} title={pendingQuizConfig.title} />}
            {celebration?.show && <Celebration message={celebration.message} type={celebration.type} onClose={() => setCelebration(null)} />}
            {activeModal === 'avatar' && <AvatarModal onClose={() => setActiveModal(null)} userStats={userStats || { flashcardsViewed: 0, quizCorrect: 0, quizWrong: 0, date: '', dailyGoal: 5, xp: 0, level: 1, streak: 0, lastStudyDate: null, badges: [], xpBoostEndTime: 0, lastGoalMetDate: null, viewedWordsToday: [], perfectQuizzes: 0, questsCompleted: 0, totalTimeSpent: 0, duelWins: 0, duelPoints: 0, completedUnits: [], completedGrades: [], weekly: { weekId: '', quizCorrect: 0, quizWrong: 0, cardsViewed: 0, matchingBestTime: 0, mazeHighScore: 0, wordSearchHighScore: 0 } }} onUpdate={() => { setHeaderProfile(getUserProfile()); if (handleProfileUpdate) handleProfileUpdate(); }} />}
            {viewProfileId && (<UserProfileModal userId={viewProfileId} onClose={() => setViewProfileId(null)} />)}
            <CustomAlert visible={alertState.visible} title={alertState.title} message={alertState.message} type={alertState.type} onClose={() => setAlertState(prev => ({ ...prev, visible: false }))} onConfirm={alertState.onConfirm} />
            <header className="backdrop-blur-xl border-b z-50 shrink-0 transition-colors h-16 header-theme" style={{ backgroundColor: 'rgba(var(--color-bg-card-rgb), 0.8)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-fit">
                        {showBackButton ? (<button onClick={handleManualBack} className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold transition-all active:scale-95 group" style={{ color: 'var(--color-text-muted)' }}> <ChevronLeft size={22} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" /> <span className="hidden sm:inline">Geri</span> </button>) : (isBoostActive ? (<div className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-1.5 rounded-xl animate-pulse shadow-lg shadow-yellow-500/30 border border-yellow-400"> <Zap size={16} fill="currentColor" /> <div className="flex flex-col items-start leading-none"> <span className="text-[10px] font-bold uppercase opacity-90">2x Boost</span> <span className="text-xs font-black">{boostTimeLeft}</span> </div> </div>) : (<div className="w-2"></div>))}
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 justify-end min-w-fit">
                        {mode !== AppMode.ANNOUNCEMENTS && (<button onClick={handleOpenAnnouncements} className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{ color: 'var(--color-text-muted)' }}> {UI_ICONS.notifications} {hasUnreadAnnouncements && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>} </button>)}
                        <button onClick={handleOpenChallenge} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95 text-orange-500 bg-orange-100 dark:bg-orange-900/30 relative"> <Swords size={20} /> {hasPendingDuel && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>} </button>
                        {mode !== AppMode.INFO && <button onClick={handleOpenInfo} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{ color: 'var(--color-text-muted)' }}>{UI_ICONS.info}</button>}
                        {mode !== AppMode.PROFILE && (<button id="profile-button" onClick={handleOpenProfile} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{ color: 'var(--color-text-muted)' }}> {UI_ICONS.profile} </button>)}
                        <button onClick={handleGoHome} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{ color: 'var(--color-text-muted)' }}>{UI_ICONS.home}</button>
                        <button onClick={handleOpenSettings} className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95" style={{ color: 'var(--color-text-muted)' }}>{UI_ICONS.settings}</button>
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