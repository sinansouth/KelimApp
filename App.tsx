import React, { Component, useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { WordCard, AppMode, Badge, ThemeType, UnitDef, GradeLevel, StudyMode, CategoryType, QuizDifficulty, Challenge, UserStats } from './types';
import { getTodayDateString, getWeekId } from './services/userService';
import TopicSelector from './components/TopicSelector';
import { THEME_COLORS, UNIT_ASSETS } from './data/assets';
const FlashcardDeck = React.lazy(() => import('./components/FlashcardDeck'));
const QuizSetupModal = React.lazy(() => import('./components/QuizSetupModal'));
const Quiz = React.lazy(() => import('./components/Quiz'));
const Profile = React.lazy(() => import('./components/Profile'));
const GrammarView = React.lazy(() => import('./components/GrammarView'));
import InfoView from './components/InfoView';
import AnnouncementsView from './components/AnnouncementsView';
import Celebration from './components/Celebration';
import SettingsModal from './components/SettingsModal';
import GradeSelectionModal from './components/GradeSelectionModal';
import MarketModal from './components/MarketModal';
import FeedbackModal from './components/FeedbackModal';
import AdminModal from './components/AdminModal';
import SRSIntro from './components/SRSIntro';
import NavigationBar from './components/NavigationBar';
import CustomAlert, { AlertType } from './components/CustomAlert';
import MenuModal from './components/MenuModal';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import { getUserProfile, getTheme, getAppSettings, getMemorizedSet, getDueWords, saveLastActivity, getLastReadAnnouncementId, setLastReadAnnouncementId, checkDataVersion, getDueGrades, getUserStats, updateTimeSpent, createGuestProfile, hasSeenTutorial, markTutorialAsSeen, saveSRSData, saveUserStats, saveUserProfile } from './services/userService';
import { supabase, syncLocalToCloud, getGlobalSettings, logoutUser } from './services/supabase';
import { getWordsForUnit, fetchAllWords, getVocabulary, fetchDynamicContent, getAnnouncements } from './services/contentService';
import { requestNotificationPermission } from './services/notificationService';
import { playSound } from './services/soundService';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { handleError } from './services/errorHandler';
const MatchingGame = React.lazy(() => import('./components/MatchingGame'));
const MazeGame = React.lazy(() => import('./components/MazeGame'));

// Error Boundary Component
interface ErrorBoundaryProps {
    children: React.ReactNode;
    onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public state: ErrorBoundaryState = { hasError: false, error: undefined };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        if (this.props.onError) {
            this.props.onError(error);
        }
        handleError(error, "Uygulama bileşeninde hata oluştu", {
            componentStack: errorInfo.componentStack
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <AlertTriangle className="text-red-600" size={48} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Bir Hata Oluştu</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                        {this.state.error?.message || 'Bileşen yüklenirken bir hata oluştu'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all"
                    >
                        Sayfayı Yenile
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const App: React.FC = () => {
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(false);
    const [mode, setMode] = useState<AppMode>(AppMode.HOME);
    const [history, setHistory] = useState<AppMode[]>([]);
    const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark');
    const [userStats, setUserStats] = useState<UserStats>(() => getUserStats());

    const [activeModal, setActiveModal] = useState<'settings' | 'srs' | 'market' | 'auth' | 'grade' | 'feedback' | 'admin' | 'avatar' | 'challenge' | 'menu' | 'srs_intro' | null>(null);
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
        tournamentName?: string,
        grade?: string
    } | null>(null);

    const lastQuizConfig = useRef<{ count: number, difficulty: QuizDifficulty, originalWords: WordCard[], allDistractors: WordCard[] } | null>(null);

    const [isSRSReview, setIsSRSReview] = useState(false);
    const [emptyWarningType, setEmptyWarningType] = useState<'bookmarks' | 'memorized' | null>(null);
    const [celebration, setCelebration] = useState<{ show: boolean; message: string; type: 'unit' | 'quiz' | 'goal' } | null>(null);
    const [newBadge, setNewBadge] = useState<Badge | null>(null);
    const [hasUnreadAnnouncements, setHasUnreadAnnouncements] = useState(false);
    const [hasPendingDuel, setHasPendingDuel] = useState(false);

    const [viewProfileId, setViewProfileId] = useState<string | null>(null);

    const [alertState, setAlertState] = useState<{ visible: boolean; title: string; message: string; type: AlertType; onConfirm?: () => void }>({
        visible: false, title: '', message: '', type: 'info'
    });

    const showAlert = (title: string, message: string, type: AlertType = 'info', onConfirm?: () => void) => {
        setAlertState({ visible: true, title, message, type, onConfirm });
    };

    const refreshGlobalState = useCallback(() => {
        setUserStats(getUserStats());
    }, []);

    const initializeApp = async () => {
        setIsAppLoading(true);
        setLoadingError(false);

        try {
            await Promise.all([
                fetchAllWords().catch(e => console.warn("Failed to fetch all words", e)),
                fetchDynamicContent().catch(e => console.warn("Failed to fetch dynamic content", e))
            ]);

            const currentSettings = getAppSettings();
            applyTheme(currentSettings.theme);

            const announcements = await getAnnouncements();
            const lastReadId = getLastReadAnnouncementId();
            if (announcements.length > 0 && announcements[0].id !== lastReadId) {
                setHasUnreadAnnouncements(true);
            }

            setIsAppLoading(false);
        } catch (error) {
            console.error("Initialization error:", error);
            setLoadingError(true);
            setIsAppLoading(false);
        }
    };

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

    useEffect(() => {
        initializeApp();
        const currentLocal = getUserProfile();
        if (!currentLocal.name) {
            // Automatically create guest profile and ask for grade
            createGuestProfile('5');
            setActiveModal('grade');
            setIsOnboardingGuest(true);
        }
        applyUserProfileGrade();
        requestNotificationPermission();
    }, [applyUserProfileGrade]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                updateTimeSpent(1);
            }
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleQuizRestart = () => {
        setMode(AppMode.QUIZ);
        setHistory(prev => [...prev.slice(0, -1), AppMode.QUIZ]);
    };

    const handleNextAfterReview = () => {
        goBack();
        if (isSRSReview) {
            refreshGlobalState();
        }
    };

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
        if (viewProfileId) { setViewProfileId(null); return true; }
        if (activeModal) { handleModalClose(); return true; }
        if (pendingQuizConfig) { setPendingQuizConfig(null); return true; }
        if (history.length > 0) {
            const newHistory = [...history];
            const previousMode = newHistory.pop();
            setHistory(newHistory);
            setMode(previousMode || AppMode.HOME);
            setIsSRSReview(false);
            setChallengeState(null);
            return true;
        }
        if (mode !== AppMode.HOME) { setMode(AppMode.HOME); return true; }
        if (selectedUnit) { setSelectedUnit(null); return true; }
        if (selectedStudyMode) { setSelectedStudyMode(null); return true; }
        if (selectedGrade) { setSelectedGrade(null); return true; }
        if (selectedCategory) { setSelectedCategory(null); return true; }
        return false;
    }, [activeModal, mode, history, pendingQuizConfig, selectedUnit, selectedGrade, selectedCategory, selectedStudyMode, viewProfileId]);

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            CapacitorApp.addListener('backButton', () => {
                const handled = goBack();
                if (!handled) CapacitorApp.exitApp();
            });
        }
        return () => { if (Capacitor.isNativePlatform()) CapacitorApp.removeAllListeners(); };
    }, [goBack]);

    const handleGradeSelect = async (grade: GradeLevel) => {
        setSelectedGrade(grade);
        setActiveModal(null);
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
    };

    const handleStartModule = async (action: any, unit: UnitDef) => {
        if (!selectedGrade && action !== 'review') { showAlert("Hata", "Lütfen önce bir sınıf seçin.", "error"); return; }
        if (selectedGrade) saveLastActivity(selectedGrade, unit.id);
        setMode(AppMode.LOADING);
        try {
            let unitWords: WordCard[] = [];
            if (action === 'review' && unit.id === 'global_review') {
                unitWords = await getDueWords();
            } else {
                unitWords = await getWordsForUnit(unit.id);
            }

            const vocabulary = await getVocabulary();
            const allDistractors = Object.values(vocabulary).flat();

            if (unitWords.length === 0 && action !== 'grammar') {
                if (action === 'review') {
                    setActiveModal('srs_intro');
                    setMode(AppMode.HOME); return;
                }
                showAlert("Kelime Yok", "Bu ünite için kelime eklenmemiş.", "warning");
                setMode(AppMode.HOME); return;
            }
            setAllUnitWords(allDistractors);
            setTopicTitle(unit.title);
            switch (action) {
                case 'study': setWords(unitWords); changeMode(AppMode.FLASHCARDS); break;
                case 'matching': setWords(unitWords); changeMode(AppMode.MATCHING); break;
                case 'maze': setWords(unitWords); changeMode(AppMode.MAZE); break;
                case 'quiz': setPendingQuizConfig({ words: unitWords, allDistractors, title: unit.title, type: 'standard' }); setMode(AppMode.HOME); break;
                case 'review': setPendingQuizConfig({ words: unitWords, allDistractors, title: unit.title, type: 'review' }); setMode(AppMode.HOME); break;
                case 'grammar': changeMode(AppMode.GRAMMAR); break;
            }
        } catch (e) { setMode(AppMode.HOME); }
    };

    const handleGoHome = () => {
        setHistory([]); setMode(AppMode.HOME); setTopicTitle(''); setWords([]); setAllUnitWords([]); setSelectedUnit(null); setSelectedStudyMode(null); setSelectedGrade(null); setSelectedCategory(null); setIsSRSReview(false); setPendingQuizConfig(null); setActiveModal(null); setChallengeState(null); refreshGlobalState();
    };

    const startQuizWithCount = (count: number, difficulty: QuizDifficulty) => {
        if (!pendingQuizConfig) return;
        let quizWords = shuffleArray(pendingQuizConfig.words);
        if (count !== -1 && quizWords.length > count) quizWords = quizWords.slice(0, count);
        lastQuizConfig.current = { count, difficulty, originalWords: pendingQuizConfig.words, allDistractors: pendingQuizConfig.allDistractors };
        setWords(quizWords);
        setAllUnitWords(pendingQuizConfig.allDistractors);
        setActiveQuizType(pendingQuizConfig.type);
        setActiveQuizDifficulty(difficulty);
        setTopicTitle(pendingQuizConfig.title);
        changeMode(AppMode.QUIZ);
        setPendingQuizConfig(null);
    };

    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Helper to get page title based on current mode
    const getPageTitle = () => {
        if (mode === AppMode.HOME) return 'KelimApp';
        if (selectedUnit && (mode === AppMode.FLASHCARDS || mode === AppMode.QUIZ || mode === AppMode.GRAMMAR || mode === AppMode.MATCHING || mode === AppMode.MAZE)) {
            return selectedUnit.title;
        }
        switch (mode) {
            case AppMode.PROFILE: return 'Profil';
            case AppMode.SETTINGS: return 'Ayarlar';
            case AppMode.MARKET: return 'Ekstra Market';
            case AppMode.INFO: return 'Uygulama Rehberi';
            case AppMode.ANNOUNCEMENTS: return 'Duyurular';
            default: return 'KelimApp';
        }
    };

    // UI RENDER START 
    if (loadingError) return <div className="p-8 text-center">Yükleme Hatası</div>;
    if (isAppLoading || maintenanceMode) return <SplashScreen />;

    return (
        <ErrorBoundary>
            <div
                className="h-full w-full max-w-lg mx-auto relative flex flex-col transition-colors duration-300"
                style={{
                    backgroundColor: 'var(--color-bg-main)',
                    color: 'var(--color-text-main)',
                    fontFamily: 'var(--font-theme)'
                }}
            >
                {/* Fixed Top Bar */}
                <div className="h-14 shrink-0 flex items-center px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40 relative" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(var(--color-bg-card-rgb), 0.8)' }}>
                    {mode !== AppMode.HOME && (
                        <button
                            onClick={goBack}
                            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-10"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <h1 className="text-xl font-black tracking-tight truncate max-w-[60%] text-center" style={{ color: mode === AppMode.HOME ? 'var(--color-primary)' : 'var(--color-text-main)' }}>
                            {getPageTitle()}
                        </h1>
                    </div>
                </div>

                <Suspense fallback={<SplashScreen />}>
                    <div className="flex-1 overflow-hidden relative">
                        {mode === AppMode.HOME && (
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
                                onOpenMarket={() => setMode(AppMode.MARKET)}
                                onOpenInfo={() => setMode(AppMode.INFO)}
                            />
                        )}
                        {mode === AppMode.FLASHCARDS && <FlashcardDeck words={words} onFinish={handleNextAfterReview} onBack={goBack} onHome={handleGoHome} isReviewMode={isSRSReview} onCelebrate={(msg) => setCelebration({ show: true, message: msg, type: 'unit' })} onBadgeUnlock={setNewBadge} grade={selectedGrade} />}
                        {mode === AppMode.QUIZ && <Quiz words={words} allWords={allUnitWords} onRestart={handleQuizRestart} onBack={goBack} onHome={handleGoHome} isBookmarkQuiz={activeQuizType === 'bookmarks'} isReviewMode={isSRSReview} difficulty={activeQuizDifficulty} onCelebrate={(msg) => setCelebration({ show: true, message: msg, type: 'quiz' })} onBadgeUnlock={setNewBadge} grade={selectedGrade} />}
                        {mode === AppMode.GRAMMAR && selectedUnit && <GrammarView unit={selectedUnit} onBack={goBack} onHome={handleGoHome} />}
                        {mode === AppMode.MATCHING && <MatchingGame words={words} onFinish={handleNextAfterReview} onBack={goBack} onHome={handleGoHome} grade={selectedGrade} />}
                        {mode === AppMode.MAZE && <MazeGame words={words} onFinish={handleNextAfterReview} onBack={goBack} onHome={handleGoHome} grade={selectedGrade} />}
                        {mode === AppMode.PROFILE && <Profile onBack={goBack} onProfileUpdate={() => refreshGlobalState()} onOpenMarket={() => setMode(AppMode.MARKET)} showAlert={showAlert} onViewProfile={setViewProfileId} />}
                        {mode === AppMode.SETTINGS && <SettingsModal onClose={goBack} onOpenFeedback={() => setActiveModal('feedback')} onOpenAdmin={() => setActiveModal('admin')} onRestartTutorial={() => {
                            markTutorialAsSeen(false);
                            window.location.reload();
                        }} />}
                        {mode === AppMode.MARKET && <MarketModal onClose={goBack} onThemeChange={() => applyTheme(getTheme())} />}
                        {mode === AppMode.INFO && <InfoView onBack={goBack} />}
                        {mode === AppMode.ANNOUNCEMENTS && <AnnouncementsView onBack={goBack} />}
                    </div>

                    {/* Navigation Bar */}
                    <NavigationBar
                        currentMode={mode}
                        onNavigate={(newMode) => setMode(newMode)}
                        onOpenMenu={() => setActiveModal('menu')}
                        onResetHome={handleGoHome}
                    />

                    {/* Modals */}
                    {activeModal === 'menu' && (
                        <MenuModal
                            onClose={handleModalClose}
                            onNavigate={(target) => {
                                handleModalClose();
                                switch (target) {
                                    case 'market': setMode(AppMode.MARKET); break;
                                    case 'info': setMode(AppMode.INFO); break;
                                    case 'announcements': setMode(AppMode.ANNOUNCEMENTS); break;
                                    case 'admin': setActiveModal('admin'); break;
                                }
                            }}
                        />
                    )}
                    {activeModal === 'settings' && (
                        <SettingsModal
                            onClose={handleModalClose}
                            onOpenFeedback={() => setActiveModal('feedback')}
                            onOpenAdmin={() => setActiveModal('admin')}
                            onRestartTutorial={() => {
                                markTutorialAsSeen(false);
                                window.location.reload();
                            }}
                        />
                    )}
                    {activeModal === 'grade' && <GradeSelectionModal grades={availableGradesForReview} onSelect={handleGradeSelect} onClose={handleModalClose} />}
                    {activeModal === 'admin' && <AdminModal onClose={handleModalClose} onUpdate={() => refreshGlobalState()} />}
                    {activeModal === 'feedback' && <FeedbackModal onClose={handleModalClose} />}
                    {activeModal === 'srs_intro' && <SRSIntro onClose={handleModalClose} />}

                    {pendingQuizConfig && (
                        <QuizSetupModal
                            onClose={() => setPendingQuizConfig(null)}
                            onStart={startQuizWithCount}
                            totalWords={pendingQuizConfig.words.length}
                            title={pendingQuizConfig.title}
                        />
                    )}

                    {celebration?.show && <Celebration message={celebration.message} type={celebration.type} onClose={() => setCelebration(null)} />}
                    {alertState.visible && (
                        <CustomAlert
                            visible={alertState.visible}
                            title={alertState.title}
                            message={alertState.message}
                            type={alertState.type}
                            onConfirm={() => { alertState.onConfirm?.(); setAlertState({ ...alertState, visible: false }); }}
                            onClose={() => setAlertState({ ...alertState, visible: false })}
                        />
                    )}
                </Suspense>
            </div>
        </ErrorBoundary>
    );
};

export default App;
