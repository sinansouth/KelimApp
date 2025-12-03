
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    User
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs,
    onSnapshot
} from 'firebase/firestore';

import { 
    getUserProfile, 
    getUserStats, 
    getAppSettings, 
    getLastUpdatedTimestamp, 
    updateLastUpdatedTimestamp, 
    getTheme, 
    clearLocalUserData,
    saveUserProfile,
    saveUserStats,
    saveAppSettings
} from './userService';

// REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDDEtzB8IomjCr1tHZlJ_hOEzmUtyX0bj8",
  authDomain: "kelim-app.firebaseapp.com",
  projectId: "kelim-app",
  storageBucket: "kelim-app.firebasestorage.app",
  messagingSenderId: "507793596268",
  appId: "1:507793596268:web:80649d37e1376de755dd49",
  measurementId: "G-E4MXNWFQTT"
};

// Initialize Firebase
// We remove the try-catch block that enabled offline mode. 
// If config is wrong, the app should fail loudly so you can debug the connection.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export auth instance for listeners
export const getAuthInstance = () => auth;

// --- AUTHENTICATION ---

export const loginUser = async (email: string, pass: string, remember: boolean) => {
    // Enforce online login
    const emailFormat = email.includes('@') ? email : `${email}@kelimapp.com`;
    await signInWithEmailAndPassword(auth, emailFormat, pass);
};

export const registerUser = async (name: string, pass: string, grade: string) => {
    // Enforce online registration
    
    // 1. Create Auth User
    // We create a fake email structure because Firebase Auth requires email
    const email = `${name}@kelimapp.com`; 
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = userCredential.user.uid;
    const user = userCredential.user;

    // 2. Update Firebase Auth Profile (Display Name)
    await updateProfile(user, { displayName: name });
    
    // 3. Prepare Initial Data
    const profile = {
        name: name,
        grade: grade,
        avatar: '🧑‍🎓',
        frame: 'frame_none',
        background: 'bg_default',
        purchasedThemes: ['light', 'dark'],
        purchasedFrames: ['frame_none'],
        purchasedBackgrounds: ['bg_default'],
        inventory: { streakFreezes: 0 }
    };
    
    // Save locally immediately for UI responsiveness
    saveUserProfile(profile); 

    const stats = getUserStats(); // Get default stats structure
    const settings = getAppSettings();
    const currentTheme = getTheme();
    
    const userData = {
        uid: uid,
        profile: profile,
        stats: stats,
        settings: settings,
        lastUpdated: new Date().toISOString(),
        lastDataUpdate: Date.now(),
        leaderboardData: {
            name: name,
            grade: grade,
            xp: stats.xp,
            level: stats.level,
            streak: stats.streak,
            avatar: profile.avatar,
            frame: profile.frame,
            background: profile.background,
            theme: currentTheme,
            weekId: stats.weekly.weekId,
            quizCorrect: 0,
            quizWrong: 0,
            cardsViewed: 0,
            matchingBestTime: 0,
            typingHighScore: 0,
            chainHighScore: 0,
            mazeHighScore: 0,
            wordSearchHighScore: 0
        }
    };

    // 4. Write to Firestore
    // This is the critical part for "Database" visibility
    await setDoc(doc(db, "users", uid), userData, { merge: true });
};

export const logoutUser = async () => {
    await signOut(auth);
    // Local cleanup
    clearLocalUserData();
    window.location.reload();
};

export const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, limit(50)); 
        const snapshot = await getDocs(q);
        
        const targetLower = username.toLowerCase();
        
        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.profile && data.profile.name && data.profile.name.toLowerCase() === targetLower) {
                return true;
            }
        }
        return false;
    } catch (e) {
        console.error("Username check error", e);
        // If error occurs (e.g. network), assume false to let user try, or handle error in UI
        return false;
    }
};

export const updateCloudUsername = async (uid: string, newName: string) => {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, { profile: { name: newName }, leaderboardData: { name: newName } }, { merge: true });
};

export const deleteAccount = async () => {
    if (auth.currentUser) {
         // Ideally, delete Firestore doc here too, but requires cloud functions or client delete permissions
         await auth.currentUser.delete();
    }
    clearLocalUserData();
    window.location.reload();
};

// --- DATA SYNC ---

export const syncLocalToCloud = async (userId?: string) => {
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
                quizWrong: stats.weekly.quizWrong || 0, 
                cardsViewed: stats.weekly.cardsViewed,
                matchingBestTime: stats.weekly.matchingBestTime,
                typingHighScore: stats.weekly.typingHighScore,
                chainHighScore: stats.weekly.chainHighScore,
                mazeHighScore: stats.weekly.mazeHighScore || 0,
                wordSearchHighScore: stats.weekly.wordSearchHighScore || 0
            }
        }, { merge: true });
    } catch (e) {
        console.error("Cloud save error:", e);
    }
};

export const syncData = async (uid: string) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            const localUpdate = getLastUpdatedTimestamp();
            const cloudUpdate = data.lastDataUpdate || 0;
            
            // If cloud is newer, overwrite local
            if (cloudUpdate > localUpdate) {
                if (data.profile) saveUserProfile(data.profile, true);
                if (data.stats) saveUserStats(data.stats); 
                if (data.settings) saveAppSettings(data.settings);
                if (data.memorized) localStorage.setItem('lgs_memorized', data.memorized);
                if (data.bookmarks) localStorage.setItem('lgs_bookmarks', data.bookmarks);
                if (data.srs) localStorage.setItem('lgs_srs_data', data.srs);
                updateLastUpdatedTimestamp();
            } else if (localUpdate > cloudUpdate) {
                // Local is newer, push to cloud
                await syncLocalToCloud(uid);
            }
        } else {
            // New user on cloud, push local data to initialize cloud
            await syncLocalToCloud(uid);
        }
    } catch (e) {
        console.error("Sync error:", e);
    }
};

export const subscribeToUserChanges = (uid: string, callback: () => void) => {
    return onSnapshot(doc(db, "users", uid), (doc) => {
        // source is "Local" for local writes, "Server" for external changes
        const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        if (source === "Server") {
             callback();
        }
    });
};

// --- LEADERBOARD ---

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
    quizWrong?: number; 
    value: number; 
}

export const getLeaderboard = async (filterGrade: string | 'ALL', mode: 'xp' | 'quiz' | 'flashcard' | 'matching' | 'typing' | 'chain' | 'maze' | 'wordSearch' = 'xp'): Promise<LeaderboardEntry[]> => {
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
            case 'maze': sortField = "leaderboardData.mazeHighScore"; break;
            case 'wordSearch': sortField = "leaderboardData.wordSearchHighScore"; break;
            case 'matching': 
                sortField = "leaderboardData.matchingBestTime"; 
                direction = 'desc'; // Lower time is better
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
                else if (mode === 'maze') val = d.mazeHighScore || 0;
                else if (mode === 'wordSearch') val = d.wordSearchHighScore || 0;
                else if (mode === 'matching') val = d.matchingBestTime;

                // Filter out 0 scores for specific games to keep leaderboard clean
                if (mode !== 'xp' && val === 0) return;

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
        
        return results;
    } catch (e) {
        console.error("Leaderboard fetch error:", e);
        return [];
    }
};

export const sendFeedback = async (type: string, message: string, contact: string) => {
    try {
        await setDoc(doc(collection(db, "feedback")), {
            type,
            message,
            contact,
            timestamp: new Date().toISOString(),
            uid: auth.currentUser?.uid || 'anonymous'
        });
    } catch (e) {
        console.error("Feedback error", e);
        throw e;
    }
};
