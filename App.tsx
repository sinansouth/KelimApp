
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
import MenuModal from './components/MenuModal';
import { ChevronLeft, Zap, Swords, Trophy, AlertTriangle, RefreshCw, WifiOff, Menu as MenuIcon } from 'lucide-react';
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
    // History as stack of modes
    const [history, setHistory] = useState<AppMode[]>([]);
    
    const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark');
    const [userStats, setUserStats] = useState<UserStats>(getUserStats());

    const [activeModal, setActiveModal] = useState<'settings' | 'srs' | 'market' | 'auth' | 'grade' | 'feedback' | 'admin' | 'avatar' | 'challenge' | 'menu' | null>(null);
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

    const startReviewForGrade = async (grade: GradeLevel) => {
        const units = UNIT_ASSETS[grade] || [];
        const unitIds = units.map(u => u.id);
        const dueWords = await getDueWords(unitIds);
        
        if (dueWords.length > 0) {
            setWords(shuffleArray(dueWords));
            setAllUnitWords([]);
            setTopicTitle(`${grade}. Sınıf Tekrarı`);
            setIsSRSReview(true);
            changeMode(AppMode.FLASHCARDS);
        } else {
            showAlert("Bilgi", "Bu sınıf için tekrar edilecek kelime yok.", "info");
            setMode(AppMode.HOME);
        }
    };

    const handleGradeSelect = async (grade: GradeLevel) => {
        setSelectedGrade(grade);
        setActiveModal(null);

        // Set category based on grade
        if (['2', '3', '4'].includes(grade)) setSelectedCategory('PRIMARY_SCHOOL');
        else if (['5', '6', '7', '8'].includes(grade)) setSelectedCategory('MIDDLE_SCHOOL');
        else if (['9', '10', '11', '12'].includes(grade)) setSelectedCategory('HIGH_SCHOOL');
        else if (['A1', 'A2', 'B1', 'B2', 'C1'].includes(grade)) setSelectedCategory('GENERAL_ENGLISH');

        if (isOnboardingGuest) {
            setIsOnboardingGuest(false);
            createGuestProfile(grade);
            refreshGlobalState();
            setMode(AppMode.HOME);
            return;
        }

        if (availableGradesForReview.length > 0) {
             setAvailableGradesForReview([]);
             await startReviewForGrade(grade);
        }
    };

    const handleStartModule = async (
        action: 'study' | 'matching' | 'maze' | 'wordSearch' | 'quiz' | 'quiz-bookmarks' | 'quiz-memorized' | 'grammar' | 'practice-select' | 'review' | 'review-flashcards',
        unit: UnitDef,
        count?: number
    ) => {
        if (!selectedGrade && action !== 'review' && action !== 'review-flashcards') {
            showAlert("Hata", "Lütfen önce bir sınıf seçin.", "error");
            return;
        }

        if (selectedGrade && unit.id !== 'global_review' && unit.id !== 'review') {
            saveLastActivity(selectedGrade, unit.id);
        }

        setMode(AppMode.LOADING);

        try {
            if (action === 'review') {
                const dueGrades = getDueGrades();
                if (dueGrades.length > 1) {
                    setAvailableGradesForReview(dueGrades);
                    setActiveModal('grade');
                    setMode(AppMode.HOME);
                } else if (dueGrades.length === 1) {
                    await startReviewForGrade(dueGrades[0] as GradeLevel);
                } else {
                    setActiveModal('srs');
                    setMode(AppMode.HOME);
                }
                return;
            }

            if (action === 'review-flashcards') {
                const allDueWords = await getDueWords();
                if (allDueWords.length === 0) {
                    setActiveModal('srs');
                    setMode(AppMode.HOME);
                    return;
                }
                setWords(shuffleArray(allDueWords));
                setAllUnitWords([]); 
                setTopicTitle('Günlük Tekrar (Kartlar)');
                setIsSRSReview(true);
                changeMode(AppMode.FLASHCARDS);
                return;
            }

            const unitWords = await getWordsForUnit(unit.id);
            const vocabulary = await getVocabulary();
            const allDistractors = Object.values(vocabulary).flat();

            if (unitWords.length === 0 && action !== 'grammar') {
                showAlert("Kelime Yok", "Bu ünite için henüz kelime eklenmemiş.", "warning");
                setMode(AppMode.HOME);
                return;
            }

            setAllUnitWords(allDistractors);
            setTopicTitle(unit.title);

            switch (action) {
                case 'study':
                    setWords(unitWords);
                    changeMode(AppMode.FLASHCARDS);
                    break;
                case 'matching':
                    setWords(unitWords);
                    changeMode(AppMode.MATCHING);
                    break;
                case 'maze':
                     if (unitWords.length < 4) {
                        showAlert("Yetersiz Kelime", "Labirent oyunu için en az 4 kelime gereklidir.", "warning");
                        setMode(AppMode.HOME);
                        return;
                    }
                    setWords(unitWords);
                    changeMode(AppMode.MAZE);
                    break;
                case 'wordSearch':
                     if (unitWords.length < 5) {
                        showAlert("Yetersiz Kelime", "Kelime bulmaca için en az 5 kelime gereklidir.", "warning");
                        setMode(AppMode.HOME);
                        return;
                    }
                    setWords(unitWords);
                    changeMode(AppMode.WORD_SEARCH);
                    break;
                case 'grammar':
                    changeMode(AppMode.GRAMMAR);
                    break;
                case 'quiz':
                    if (unitWords.length < 4) {
                        showAlert("Yetersiz Kelime", "Test oluşturmak için en az 4 kelime gereklidir.", "warning");
                        setMode(AppMode.HOME);
                        return;
                    }
                    setPendingQuizConfig({ words: unitWords, allDistractors, title: unit.title, type: 'standard' });
                    setMode(AppMode.HOME); 
                    break;
                case 'quiz-bookmarks':
                    const bookmarks = JSON.parse(localStorage.getItem('lgs_bookmarks') || '[]');
                    const bookmarkedWords = unitWords.filter(w => bookmarks.includes(`${unit.id}|${w.english}`));
                    if (bookmarkedWords.length < 4) {
                        setEmptyWarningType('bookmarks');
                        changeMode(AppMode.EMPTY_WARNING);
                        return;
                    }
                    setPendingQuizConfig({ words: bookmarkedWords, allDistractors, title: `${unit.title} (Favoriler)`, type: 'bookmarks' });
                    setMode(AppMode.HOME);
                    break;
                case 'quiz-memorized':
                    const memorizedSet = getMemorizedSet();
                    const memorizedWords = unitWords.filter(w => memorizedSet.has(`${unit.id}|${w.english}`));
                    if (memorizedWords.length < 4) {
                        setEmptyWarningType('memorized');
                        changeMode(AppMode.EMPTY_WARNING);
                        return;
                    }
                    setPendingQuizConfig({ words: memorizedWords, allDistractors, title: `${unit.title} (Ezberlenmiş)`, type: 'memorized' });
                    setMode(AppMode.HOME);
                    break;
                case 'practice-select':
                    setAllUnitWords(unitWords);
                    setTopicTitle(`${unit.title} (Özel Çalışma)`);
                    changeMode(AppMode.CUSTOM_PRACTICE);
                    break;
            }
        } catch (error) {
            console.error("Error starting module:", error);
            showAlert("Hata", "Modül yüklenirken bir hata oluştu.", "error");
            setMode(AppMode.HOME);
        }
    };
    
    const handleCustomPracticeStart = (selectedWords: WordCard[], mode: 'study' | 'quiz') => {
        if (mode === 'study') {
            setWords(selectedWords);
            changeMode(AppMode.FLASHCARDS);
        } else {
            if (selectedWords.length < 4) {
                showAlert("Yetersiz Kelime", "Test için en az 4 kelime seçmelisiniz.", "warning");
                return;
            }
            setPendingQuizConfig({
                words: selectedWords,
                allDistractors: allUnitWords,
                title: `${topicTitle} (Özel Test)`,
                type: 'custom',
            });
            setMode(AppMode.HOME);
        }
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
            } catch (e) { }
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
        
        if (currentThemeColors.fontFamily) {
            root.style.setProperty('--font-theme', currentThemeColors.fontFamily);
            document.body.style.fontFamily = `var(--font-theme), 'Inter', sans-serif`;
        }

        root.style.setProperty('--color-bg-card-rgb', hexToRgb(currentThemeColors.bgCard));
        root.style.setProperty('--color-primary-rgb', hexToRgb(currentThemeColors.primary));
    }, [currentTheme]);

    const initializeApp = async () => {
        setIsAppLoading(true);
        setLoadingError(false);
        
        try {
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
                    setMaintenanceMode(false);
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

        setTimeout(() => {
            const profile = getUserProfile();
            if ((previousModal === 'auth' || previousModal === 'grade') && !profile.name) {
                setShowWelcomeScreen(true);
            }
        }, 100);
    };

    const goBack = useCallback(() => {
        // Modal priority
        if (viewProfileId) { setViewProfileId(null); return true; }
        if (activeModal) {
            handleModalClose();
            return true;
        }
        if (pendingQuizConfig) { setPendingQuizConfig(null); return true; }

        // Mode History Navigation
        if (history.length > 0) {
            const newHistory = [...history];
            const previousMode = newHistory.pop();
            setHistory(newHistory);
            setMode(previousMode || AppMode.HOME);
            
            // Clean up state when leaving specific modes
            setIsSRSReview(false);
            setChallengeState(null);
            return true;
        }

        // If no history but in a mode other than home, fallback to home
        if (mode !== AppMode.HOME) {
            setMode(AppMode.HOME);
            return true;
        }

        // Home screen navigation stack (Unit -> Grade -> Category)
        if (selectedUnit) { setSelectedUnit(null); return true; }
        if (selectedStudyMode) { setSelectedStudyMode(null); return true; }
        if (selectedGrade) { setSelectedGrade(null); return true; }
        if (selectedCategory) { setSelectedCategory(null); return true; }

        return false; // Reached root, let app exit or handle otherwise
    }, [activeModal, mode, history, pendingQuizConfig, selectedUnit, selectedGrade, selectedCategory, selectedStudyMode, viewProfileId]);

    const handleManualBack = () => { goBack(); };

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                const handled = goBack();
                if (!handled) {
                    CapacitorApp.exitApp();
                }
            });
        }
        return () => {
             if (Capacitor.isNativePlatform()) {
                 CapacitorApp.removeAllListeners();
             }
        }
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
    
    const handleCreateChallenge = (config: any) => { setActiveModal(null); setMode(AppMode.LOADING); const setupChallengeQuiz = async () => { try { const unitWords = await getWordsForUnit(config.unit.id); if (unitWords.length < 4) { showAlert("Hata", "Yetersiz kelime.", "error"); setMode(AppMode.HOME); return; } const finalCount = Math.min(config.count, unitWords.length); const challengeWords = shuffleArray(unitWords).slice(0, finalCount); setWords(challengeWords); setAllUnitWords(unitWords); setTopicTitle(`Düello: ${config.unit.title}`); setActiveQuizDifficulty(config.difficulty); setChallengeState({ mode: 'create', unitId: config.unit.id, challengeType: config.type, targetFriendId: config.targetFriendId }); changeMode(AppMode.QUIZ); } catch (e) { setMode(AppMode.HOME); showAlert("Hata", "Hata oluştu.", "error"); } }; setupChallengeQuiz(); };
    const handleJoinChallenge = (challengeData: any, challengeWords: WordCard[]) => { setActiveModal(null); setWords(challengeWords); setAllUnitWords(challengeWords); setTopicTitle(challengeData.matchId ? `Turnuva: ${challengeData.tournamentName}` : `Düello: ${challengeData.creatorName}`); setActiveQuizDifficulty(challengeData.difficulty || 'normal'); setChallengeState(challengeData.matchId ? { mode: 'tournament', tournamentMatchId: challengeData.matchId, data: challengeData, tournamentName: challengeData.tournamentName } : { mode: 'join', data: challengeData }); changeMode(AppMode.QUIZ); };

    const handleOpenProfile = () => { changeMode(AppMode.PROFILE); setTopicTitle('Profilim'); refreshGlobalState(); };
    const handleOpenInfo = () => { changeMode(AppMode.INFO); setTopicTitle('İpuçları'); };
    const handleOpenMarket = () => { setActiveModal('market'); };
    const handleOpenAnnouncements = async () => { changeMode(AppMode.ANNOUNCEMENTS); setTopicTitle('Duyurular'); const announcements = await getAnnouncements(); if (announcements.length > 0) { setLastReadAnnouncementId(announcements[0].id); setHasUnreadAnnouncements(false); } };
    const handleOpenSettings = () => { setActiveModal('settings'); };
    const handleOpenChallenge = () => { const profile = getUserProfile(); if (profile.isGuest) { showAlert("Misafir Modu", "Giriş yapın.", "warning", () => { setAuthInitialView('register'); setActiveModal('auth'); }); return; } setActiveModal('challenge'); };
    const handleOpenMenu = () => { setActiveModal('menu'); };
    const shuffleArray = <T,>(array: T[]): T[] => { const newArray = [...array]; for (let i = newArray.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[newArray[i], newArray[j]] = [newArray[j], newArray[i]]; } return newArray; };
    const startQuizWithCount = (count: number, difficulty: QuizDifficulty) => { if (!pendingQuizConfig) return; let quizWords = shuffleArray(pendingQuizConfig.words); if (count !== -1 && quizWords.length > count) { quizWords = quizWords.slice(0, count); } lastQuizConfig.current = { count, difficulty, originalWords: pendingQuizConfig.words, allDistractors: pendingQuizConfig.allDistractors }; setWords(quizWords); setAllUnitWords(pendingQuizConfig.allDistractors); setActiveQuizType(pendingQuizConfig.type); setActiveQuizDifficulty(difficulty); setTopicTitle(pendingQuizConfig.title); changeMode(AppMode.QUIZ); setPendingQuizConfig(null); };
    const handleQuizRestart = () => { if (lastQuizConfig.current) { const { count, difficulty, originalWords, allDistractors } = lastQuizConfig.current; let quizWords = shuffleArray(originalWords); if (count !== -1 && quizWords.length > count) { quizWords = quizWords.slice(0, count); } setWords(quizWords); setAllUnitWords(allDistractors); setActiveQuizDifficulty(difficulty); setMode(AppMode.LOADING); setTimeout(() => { setMode(AppMode.QUIZ); }, 50); } else { handleGoHome(); } };
    const handleWelcomeLogin = () => { setShowWelcomeScreen(false); setAuthInitialView('login'); setActiveModal('auth'); };
    const handleWelcomeRegister = () => { setShowWelcomeScreen(false); setAuthInitialView('register'); setActiveModal('auth'); };
    const handleWelcomeGuest = () => { setShowWelcomeScreen(false); setIsOnboardingGuest(true); setAvailableGradesForReview(['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'A1', 'A2', 'B1', 'B2', 'C1']); setActiveModal('grade'); };
    const onSelectCategoryHandler = (cat: CategoryType | null) => { setSelectedCategory(cat); };
    const onSelectGradeHandler = (grade: GradeLevel | null) => { setSelectedGrade(grade); };
    const onSelectUnitHandler = (unit: UnitDef | null) => { setSelectedUnit(unit); };
    const showBackButton = (mode !== AppMode.HOME) || (selectedCategory !== null);

    if (loadingError) return <div className="p-8 text-center">Bağlantı Sorunu</div>;
    if (isAppLoading || maintenanceMode) return <div className="p-8 text-center">{maintenanceMode ? "Bakım Modu" : "Yükleniyor..."}</div>;

    let content;
    switch (mode) {
        case AppMode.HOME: content = (<TopicSelector selectedCategory={selectedCategory} selectedGrade={selectedGrade} selectedMode={selectedStudyMode} selectedUnit={selectedUnit} onSelectCategory={onSelectCategoryHandler} onSelectGrade={onSelectGradeHandler} onSelectMode={(mode) => setSelectedStudyMode(mode)} onSelectUnit={onSelectUnitHandler} onStartModule={handleStartModule} onGoHome={handleGoHome} onOpenMarket={handleOpenMarket} />); break;
        case AppMode.LOADING: content = (<div className="flex flex-col items-center justify-center h-full animate-pulse"> <div className="text-center font-bold" style={{ color: 'var(--color-text-muted)' }}>Yükleniyor...</div> </div>); break;
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
        <div className="flex flex-col h-[100dvh] font-sans overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-main)' }}>
            {showWelcomeScreen && (<WelcomeScreen onLogin={handleWelcomeLogin} onRegister={handleWelcomeRegister} onGuest={handleWelcomeGuest} />)}
            {newBadge && (<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[110] w-full max-w-sm px-4 pointer-events-none"> <div className="bg-yellow-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 border-2 border-yellow-300"> <div className="text-4xl animate-bounce"> {newBadge.image ? (<img src={newBadge.image} alt={newBadge.name} className="w-10 h-10 rounded-full object-cover" />) : (<span className="flex items-center justify-center w-10 h-10 text-3xl">{newBadge.icon}</span>)} </div> <div> <div className="text-xs font-bold text-yellow-100 uppercase tracking-wide mb-0.5">Yeni Rozet Kazanıldı!</div> <div className="font-black text-lg leading-tight">{newBadge.name}</div> </div> <Trophy className="ml-auto text-yellow-200" size={24} /> </div> </div>)}
            
            {/* Modals */}
            {activeModal === 'menu' && <MenuModal onClose={() => setActiveModal(null)} onNavigate={(target) => { 
                setActiveModal(null); 
                if (target === 'home') handleGoHome();
                else if (target === 'profile') handleOpenProfile();
                else if (target === 'settings') handleOpenSettings();
                else if (target === 'announcements') handleOpenAnnouncements();
                else if (target === 'market') handleOpenMarket();
                else if (target === 'info') handleOpenInfo();
                else if (target === 'challenge') handleOpenChallenge();
                else if (target === 'admin') setActiveModal('admin');
            }} hasUnreadAnnouncements={hasUnreadAnnouncements} />}
            
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
            {activeModal === 'avatar' && <AvatarModal onClose={() => setActiveModal(null)} userStats={userStats || { flashcardsViewed: 0, quizCorrect: 0, quizWrong: 0, date: '', dailyGoal: 5, xp: 0, level: 1, streak: 0, lastStudyDate: null, badges: [], xpBoostEndTime: 0, lastGoalMetDate: null, viewedWordsToday: [], perfectQuizzes: 0, questsCompleted: 0, totalTimeSpent: 0, duelWins: 0, duelPoints: 0, duelLosses: 0, duelDraws: 0, matchingAllTimeBest: 0, mazeAllTimeBest: 0, wordSearchAllTimeBest: 0, completedUnits: [], completedGrades: [], weekly: { weekId: '', quizCorrect: 0, quizWrong: 0, cardsViewed: 0, matchingBestTime: 0, mazeHighScore: 0, wordSearchHighScore: 0, duelPoints: 0, duelWins: 0, duelLosses: 0, duelDraws: 0 } }} onUpdate={() => { setHeaderProfile(getUserProfile()); if (handleProfileUpdate) handleProfileUpdate(); }} />}
            {viewProfileId && (<UserProfileModal userId={viewProfileId} onClose={() => setViewProfileId(null)} />)}
            <CustomAlert visible={alertState.visible} title={alertState.title} message={alertState.message} type={alertState.type} onClose={() => setAlertState(prev => ({ ...prev, visible: false }))} onConfirm={alertState.onConfirm} />
            
            {/* TOP HEADER */}
            <header 
                className="fixed top-0 left-0 w-full z-[40] border-b transition-all shadow-sm"
                style={{
                    backgroundColor: 'var(--color-bg-card)', 
                    borderColor: 'var(--color-border)'
                }}
            >
                {/* Added explicit top padding for safe area, removed 'pt-safe' class dependency for spacing logic */}
                <div className="h-14 px-4 pt-safe flex items-center justify-between max-w-7xl mx-auto box-content">
                    <div className="flex items-center gap-2">
                        {showBackButton ? (
                            <button 
                                onClick={handleManualBack} 
                                className="p-2 -ml-2 rounded-full transition-colors hover:opacity-80"
                                style={{color: 'var(--color-text-muted)'}}
                            >
                                <ChevronLeft size={24} />
                            </button>
                        ) : (
                            <div className="w-8"></div>
                        )}
                    </div>
                    
                    <h1 className="text-xl font-black tracking-tight absolute left-1/2 transform -translate-x-1/2 mt-safe" style={{color: 'var(--color-text-main)'}}>
                        Kelim<span style={{color: 'var(--color-primary)'}}>App</span>
                    </h1>

                    <div className="flex items-center justify-end w-8">
                         {isBoostActive && (
                             <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-500">
                                 <Zap size={12} className="fill-current" />
                                 <span className="text-[10px] font-black">{boostTimeLeft}</span>
                             </div>
                         )}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-7xl mx-auto relative main-content mt-14 pb-safe mb-16">
                {content}
            </main>

            {/* BOTTOM NAVIGATION BAR */}
            <nav 
                className="fixed bottom-0 left-0 w-full z-[40] border-t pb-safe transition-all shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
                style={{
                    backgroundColor: 'var(--color-bg-card)', 
                    borderColor: 'var(--color-border)'
                }}
            >
                <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
                    <button onClick={handleGoHome} className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all ${mode === AppMode.HOME ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`} style={{color: mode === AppMode.HOME ? 'var(--color-primary)' : 'var(--color-text-muted)'}}>
                        {UI_ICONS.home}
                    </button>
                    
                    <button onClick={handleOpenChallenge} className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all relative ${activeModal === 'challenge' ? 'opacity-100 text-orange-500' : 'opacity-50 hover:opacity-80'}`} style={{color: activeModal === 'challenge' ? '#f97316' : 'var(--color-text-muted)'}}>
                        <Swords size={24} />
                        {hasPendingDuel && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>}
                    </button>
                    
                    <button onClick={handleOpenMenu} className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all relative ${activeModal === 'menu' ? 'opacity-100 text-blue-500' : 'opacity-50 hover:opacity-80'}`} style={{color: activeModal === 'menu' ? '#3b82f6' : 'var(--color-text-muted)'}}>
                        <MenuIcon size={24} />
                        {hasUnreadAnnouncements && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>}
                    </button>

                    <button onClick={handleOpenProfile} className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all ${mode === AppMode.PROFILE ? 'opacity-100 text-green-500' : 'opacity-50 hover:opacity-80'}`} style={{color: mode === AppMode.PROFILE ? '#22c55e' : 'var(--color-text-muted)'}}>
                        {UI_ICONS.profile}
                    </button>

                    <button onClick={handleOpenSettings} className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all ${activeModal === 'settings' ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`} style={{color: activeModal === 'settings' ? 'var(--color-text-main)' : 'var(--color-text-muted)'}}>
                        {UI_ICONS.settings}
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default App;
