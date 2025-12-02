
import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  query, 
  where,
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp, 
  onSnapshot
} from 'firebase/firestore';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithEmailAndPassword, 
  signOut, 
  deleteUser 
} from 'firebase/auth';
import { 
    UserStats, 
    UserProfile, 
    getUserProfile, 
    getUserStats, 
    getAppSettings, 
    getLastUpdatedTimestamp, 
    updateLastUpdatedTimestamp, 
    getTheme, 
    clearLocalUserData 
} from './userService';

const firebaseConfig = {
  apiKey: "AIzaSyDDEtzB8IomjCr1tHZlJ_hOEzmUtyX0bj8",
  authDomain: "kelim-app.firebaseapp.com",
  projectId: "kelim-app",
  storageBucket: "kelim-app.firebasestorage.app",
  messagingSenderId: "507793596268",
  appId: "1:507793596268:web:80649d37e1376de755dd49",
  measurementId: "G-E4MXNWFQTT"
};

let db: any;
let auth: any;
export let isFirebaseReady = false;

try {
    if (firebaseConfig.apiKey !== "AIzaSyB...") {
        const app = initializeApp(firebaseConfig);
        
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager()
            })
        });

        auth = getAuth(app);
        isFirebaseReady = true;
    }
} catch (e) {
    console.error("Firebase başlatılamadı:", e);
}

export const getAuthInstance = () => auth;

// ... (Authentication helpers remain same) ...
const generateFakeEmail = (name: string): string => {
    const trMap: Record<string, string> = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u', ' ': ''
    };
    let cleanName = name.toLowerCase().replace(/[çğıöşüÇĞİÖŞÜ ]/g, (match) => trMap[match] || '');
    cleanName = cleanName.replace(/[^a-z0-9]/g, '');
    return `${cleanName}@kelimapp.user`;
};

export const checkUsernameExists = async (name: string): Promise<boolean> => {
    if (!isFirebaseReady) return false;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("leaderboardData.name", "==", name));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
};

export const registerUser = async (name: string, pass: string, grade: string = '') => {
    if (!isFirebaseReady) throw new Error("Firebase ayarlanmamış");
    const exists = await checkUsernameExists(name);
    if (exists) {
        throw new Error("Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir ad seçin.");
    }
    const fakeEmail = generateFakeEmail(name);
    await setPersistence(auth, browserLocalPersistence);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, pass);
        await updateProfile(userCredential.user, { displayName: name });
        clearLocalUserData();
        const initialProfile = getUserProfile();
        initialProfile.name = name;
        initialProfile.grade = grade;
        localStorage.setItem('lgs_user_profile', JSON.stringify(initialProfile));
        updateLastUpdatedTimestamp();
        await syncLocalToCloud(userCredential.user.uid);
        return userCredential.user;
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("Bu kullanıcı adı sistemsel olarak çakışıyor. Lütfen isminizin sonuna rakam ekleyin.");
        }
        throw error;
    }
};

export const loginUser = async (name: string, pass: string, rememberMe: boolean = true) => {
    if (!isFirebaseReady) throw new Error("Firebase ayarlanmamış");
    const fakeEmail = generateFakeEmail(name);
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, pass);
        return userCredential.user;
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            throw new Error("İsim veya şifre hatalı.");
        }
        throw error;
    }
};

export const logoutUser = async () => {
    if (!isFirebaseReady) return;
    try {
        clearLocalUserData(); 
        await signOut(auth);
    } catch (e) {
        console.error("Sign out error", e);
    } finally {
        window.location.reload();
    }
};

export const deleteAccount = async () => {
    if (!isFirebaseReady || !auth.currentUser) return;
    const user = auth.currentUser;
    const uid = user.uid;
    try {
        await deleteDoc(doc(db, "users", uid));
        await deleteUser(user);
        localStorage.clear();
        window.location.reload();
    } catch (error) {
        console.error("Error deleting account:", error);
        throw error;
    }
};

export const updateCloudUsername = async (uid: string, newName: string) => {
    if (!isFirebaseReady) return;
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
        "leaderboardData.name": newName,
        "profile.name": newName
    });
};

export const sendFeedback = async (type: 'bug' | 'suggestion', message: string, contact?: string) => {
    if (!isFirebaseReady) return;
    const user = auth.currentUser;
    const profile = getUserProfile();
    const stats = getUserStats();
    try {
        await addDoc(collection(db, "feedback"), {
            type,
            message,
            contact: contact || '',
            uid: user ? user.uid : 'anonymous',
            username: profile.name || 'Anonymous',
            userGrade: profile.grade || 'None',
            userLevel: stats.level || 1,
            timestamp: serverTimestamp(),
            platform: navigator.userAgent,
            version: '1.0'
        });
    } catch (e) {
        console.error("Feedback error:", e);
        throw new Error("Geri bildirim gönderilemedi.");
    }
};

// --- SMART DATA SYNC ---

const mergeWithLocalData = (cloudData: any, uid: string): boolean => {
    try {
        const localProfile = getUserProfile();
        const localStats = getUserStats();
        const localSettings = getAppSettings();
        const localMemorized = new Set(JSON.parse(localStorage.getItem('lgs_memorized') || '[]'));
        const localBookmarks = new Set(JSON.parse(localStorage.getItem('lgs_bookmarks') || '[]'));
        const localSRS = JSON.parse(localStorage.getItem('lgs_srs_data') || '{}');
        const localTimestamp = getLastUpdatedTimestamp();

        const cloudProfile: UserProfile = typeof cloudData.profile === 'string' ? JSON.parse(cloudData.profile) : cloudData.profile || {};
        const cloudStats: UserStats = typeof cloudData.stats === 'string' ? JSON.parse(cloudData.stats) : cloudData.stats || {};
        const cloudSettings = typeof cloudData.settings === 'string' ? JSON.parse(cloudData.settings) : cloudData.settings || {};
        const cloudSRS = typeof cloudData.srs === 'string' ? JSON.parse(cloudData.srs) : cloudData.srs || {};
        const cloudTimestamp = cloudData.lastDataUpdate || 0;
        
        const isLocalNewer = localTimestamp >= cloudTimestamp;
        let useLocalState = isLocalNewer;

        if (cloudProfile.name === "Deneme Hesap") { useLocalState = false; }

        const cloudMemorized = new Set(JSON.parse(cloudData.memorized || '[]'));
        const cloudBookmarks = new Set(JSON.parse(cloudData.bookmarks || '[]'));
        
        const mergedMemorized = Array.from(new Set([...localMemorized, ...cloudMemorized]));
        const mergedBookmarks = Array.from(new Set([...localBookmarks, ...cloudBookmarks]));
        
        const mergedThemes = Array.from(new Set([...(localProfile.purchasedThemes || []), ...(cloudProfile.purchasedThemes || [])]));
        const mergedFrames = Array.from(new Set([...(localProfile.purchasedFrames || []), ...(cloudProfile.purchasedFrames || [])]));
        const mergedBackgrounds = Array.from(new Set([...(localProfile.purchasedBackgrounds || []), ...(cloudProfile.purchasedBackgrounds || [])]));
        
        const mergedBadges = Array.from(new Set([...(localStats.badges || []), ...(cloudStats.badges || [])]));
        const mergedCompletedUnits = Array.from(new Set([...(localStats.completedUnits || []), ...(cloudStats.completedUnits || [])]));
        const mergedCompletedGrades = Array.from(new Set([...(localStats.completedGrades || []), ...(cloudStats.completedGrades || [])]));
        const mergedViewedWordsToday = Array.from(new Set([...(localStats.viewedWordsToday || []), ...(cloudStats.viewedWordsToday || [])]));

        const mergedSRS = { ...cloudSRS }; 
        Object.keys(localSRS).forEach(key => {
            if (mergedSRS[key]) {
                if (localSRS[key].box > mergedSRS[key].box) {
                    mergedSRS[key] = localSRS[key];
                }
            } else {
                mergedSRS[key] = localSRS[key];
            }
        });

        const flashcardsViewed = Math.max(localStats.flashcardsViewed, cloudStats.flashcardsViewed || 0);
        const quizCorrect = Math.max(localStats.quizCorrect, cloudStats.quizCorrect || 0);
        const quizWrong = Math.max(localStats.quizWrong, cloudStats.quizWrong || 0);
        const perfectQuizzes = Math.max(localStats.perfectQuizzes, cloudStats.perfectQuizzes || 0);
        const questsCompleted = Math.max(localStats.questsCompleted, cloudStats.questsCompleted || 0);
        const totalTimeSpent = Math.max(localStats.totalTimeSpent, cloudStats.totalTimeSpent || 0);

        const xp = useLocalState ? localStats.xp : (cloudStats.xp || 0);
        const level = useLocalState ? localStats.level : (cloudStats.level || 1);
        const streak = useLocalState ? localStats.streak : (cloudStats.streak || 0);
        const lastStudyDate = useLocalState ? localStats.lastStudyDate : cloudStats.lastStudyDate;
        const dailyGoal = useLocalState ? localStats.dailyGoal : (cloudStats.dailyGoal || 5);
        const xpBoostEndTime = useLocalState ? localStats.xpBoostEndTime : (cloudStats.xpBoostEndTime || 0);
        
        // Merge weekly stats carefully
        const weeklyStats = useLocalState ? localStats.weekly : (cloudStats.weekly || localStats.weekly);

        const currentAvatar = useLocalState ? localProfile.avatar : cloudProfile.avatar;
        const currentFrame = useLocalState ? localProfile.frame : cloudProfile.frame;
        const currentBackground = useLocalState ? localProfile.background : cloudProfile.background;
        const streakFreezes = useLocalState ? (localProfile.inventory?.streakFreezes || 0) : (cloudProfile.inventory?.streakFreezes || 0);
        const lastUsernameChange = useLocalState ? (localProfile.lastUsernameChange || 0) : (cloudProfile.lastUsernameChange || 0);
        
        const name = (useLocalState ? localProfile.name : cloudProfile.name) || localProfile.name || cloudProfile.name;
        const grade = (useLocalState ? localProfile.grade : cloudProfile.grade) || localProfile.grade || cloudProfile.grade;
        
        const mergedSettings = { ...localSettings, ...cloudSettings };

        const mergedStats: UserStats = {
            ...localStats,
            xp,
            level,
            streak,
            lastStudyDate,
            dailyGoal,
            flashcardsViewed,
            quizCorrect,
            quizWrong,
            perfectQuizzes,
            questsCompleted,
            totalTimeSpent,
            badges: mergedBadges,
            completedUnits: mergedCompletedUnits,
            completedGrades: mergedCompletedGrades,
            viewedWordsToday: mergedViewedWordsToday,
            breakdown: localStats.flashcardsViewed > (cloudStats.flashcardsViewed || 0) ? localStats.breakdown : cloudStats.breakdown,
            xpBoostEndTime,
            weekly: weeklyStats
        };

        const mergedProfile: UserProfile = {
            name,
            grade,
            avatar: currentAvatar || '🧑‍🎓',
            frame: currentFrame || 'frame_none',
            background: currentBackground || 'bg_default',
            purchasedThemes: mergedThemes,
            purchasedFrames: mergedFrames,
            purchasedBackgrounds: mergedBackgrounds,
            inventory: { streakFreezes: streakFreezes },
            lastUsernameChange
        };

        localStorage.setItem('lgs_user_profile', JSON.stringify(mergedProfile));
        localStorage.setItem('lgs_user_stats', JSON.stringify(mergedStats));
        localStorage.setItem('lgs_memorized', JSON.stringify(mergedMemorized));
        localStorage.setItem('lgs_bookmarks', JSON.stringify(mergedBookmarks));
        localStorage.setItem('lgs_app_settings', JSON.stringify(mergedSettings));
        localStorage.setItem('lgs_srs_data', JSON.stringify(mergedSRS));
        
        if (!isLocalNewer) {
             const newTimestamp = Date.now();
             localStorage.setItem('lgs_last_data_update', newTimestamp.toString());
             return true; 
        }
        
        return false;
    } catch (e) {
        console.error("Merge error:", e);
        return false;
    }
};

export const syncData = async (uid: string) => {
    if (!isFirebaseReady) return;
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            mergeWithLocalData(cloudData, uid);
            await syncLocalToCloud(uid);
        } else {
            await syncLocalToCloud(uid);
        }
    } catch (e) {
        console.error("Sync error:", e);
    }
};

export const subscribeToUserChanges = (uid: string, onUpdate: () => void) => {
    if (!isFirebaseReady) return () => {};
    const docRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.metadata.hasPendingWrites) { return; }
        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            const updated = mergeWithLocalData(cloudData, uid);
            if (updated) { onUpdate(); }
        }
    }, (error) => {
        console.error("Real-time sync error:", error);
    });
    return unsubscribe;
};

export const syncLocalToCloud = async (userId?: string) => {
    if (!isFirebaseReady) return;
    const uid = userId || auth?.currentUser?.uid;
    if (!uid) return;

    const profile = getUserProfile();
    const stats = getUserStats();
    const settings = getAppSettings();
    const memorized = localStorage.getItem('lgs_memorized') || '[]';
    const bookmarks = localStorage.getItem('lgs_bookmarks') || '[]';
    const srs = localStorage.getItem('lgs_srs_data') || '{}';
    const lastUpdate = getLastUpdatedTimestamp();
    const currentTheme = getTheme();

    try {
        await setDoc(doc(db, "users", uid), {
            uid: uid,
            profile: profile,
            stats: stats, 
            settings: settings,
            memorized: memorized, 
            bookmarks: bookmarks, 
            srs: srs,
            lastUpdated: new Date().toISOString(),
            lastDataUpdate: lastUpdate,
            
            leaderboardData: {
                name: profile.name || 'İsimsiz', 
                grade: profile.grade || 'General',
                xp: stats.xp,
                level: stats.level,
                streak: stats.streak, 
                avatar: profile.avatar,
                frame: profile.frame,
                background: profile.background,
                theme: currentTheme,
                
                weekId: stats.weekly.weekId,
                quizCorrect: stats.weekly.quizCorrect,
                quizWrong: stats.weekly.quizWrong || 0, // New field added
                cardsViewed: stats.weekly.cardsViewed,
                matchingBestTime: stats.weekly.matchingBestTime,
                typingHighScore: stats.weekly.typingHighScore,
                chainHighScore: stats.weekly.chainHighScore
            }
        }, { merge: true });
    } catch (e) {
        console.error("Cloud save error:", e);
    }
};

export interface LeaderboardEntry {
    uid: string;
    name: string;
    xp: number;
    level: number;
    streak?: number; 
    avatar: string;
    frame?: string;
    background?: string;
    theme?: string;
    grade: string;
    
    quizWrong?: number; // Added for detailed view
    value: number; 
}

export const getLeaderboard = async (filterGrade: string | 'ALL', mode: 'xp' | 'quiz' | 'flashcard' | 'matching' | 'typing' | 'chain' = 'xp'): Promise<LeaderboardEntry[]> => {
    if (!isFirebaseReady) return [];

    try {
        const usersRef = collection(db, "users");
        let q;
        
        let sortField = "leaderboardData.xp";
        let direction: 'asc' | 'desc' = 'desc';

        switch(mode) {
            case 'quiz': sortField = "leaderboardData.quizCorrect"; break;
            case 'flashcard': sortField = "leaderboardData.cardsViewed"; break;
            case 'typing': sortField = "leaderboardData.typingHighScore"; break;
            case 'chain': sortField = "leaderboardData.chainHighScore"; break;
            case 'matching': 
                sortField = "leaderboardData.matchingBestTime"; 
                direction = 'desc'; 
                break;
            default: sortField = "leaderboardData.xp";
        }

        if (filterGrade === 'ALL') {
            q = query(usersRef, orderBy(sortField, direction), limit(50));
        } else {
            q = query(
                usersRef, 
                where("leaderboardData.grade", "==", filterGrade),
                orderBy(sortField, direction), 
                limit(50)
            );
        }

        const querySnapshot = await getDocs(q);
        const results: LeaderboardEntry[] = [];
        
        querySnapshot.forEach((doc) => {
            const d = doc.data().leaderboardData;
            if (d) {
                let val = 0;
                if (mode === 'xp') val = d.xp;
                else if (mode === 'quiz') val = d.quizCorrect;
                else if (mode === 'flashcard') val = d.cardsViewed;
                else if (mode === 'typing') val = d.typingHighScore;
                else if (mode === 'chain') val = d.chainHighScore;
                else if (mode === 'matching') val = d.matchingBestTime;

                if (mode === 'matching' && val === 0) return;

                results.push({
                    uid: doc.id,
                    name: d.name,
                    xp: d.xp, 
                    level: d.level,
                    streak: d.streak || 0,
                    avatar: d.avatar,
                    frame: d.frame,
                    background: d.background,
                    theme: d.theme || 'dark',
                    grade: d.grade,
                    quizWrong: d.quizWrong || 0,
                    value: val
                });
            }
        });

        results.sort((a, b) => b.value - a.value);

        return results;
    } catch (e) {
        console.error("Leaderboard fetch error:", e);
        return [];
    }
};
