
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where,
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { UserStats, UserProfile, saveUserProfile, getUserProfile, getUserStats, saveUserStats, saveAppSettings, getAppSettings, isLocalDataExists } from './userService';

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
let isFirebaseReady = false;

try {
    // Config kontrolü (Boşsa başlatma)
    if (firebaseConfig.apiKey !== "AIzaSyB...") {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        // Offline persistence (İnternet yokken de çalışması için)
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code == 'failed-precondition') {
                console.log('Persistence failed: Multiple tabs open');
            } else if (err.code == 'unimplemented') {
                console.log('Persistence is not available');
            }
        });

        isFirebaseReady = true;
    }
} catch (e) {
    console.error("Firebase başlatılamadı:", e);
}

export const getAuthInstance = () => auth;

// --- AUTHENTICATION ---

export const registerUser = async (email: string, pass: string, name: string) => {
    if (!isFirebaseReady) throw new Error("Firebase ayarlanmamış");
    // Default to local persistence for new registrations
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    
    // İlk kayıt sonrası mevcut local veriyi buluta at
    await syncLocalToCloud(userCredential.user.uid);
    return userCredential.user;
};

export const loginUser = async (email: string, pass: string, rememberMe: boolean = true) => {
    if (!isFirebaseReady) throw new Error("Firebase ayarlanmamış");
    
    // Set persistence based on user choice
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    
    // CONFLICT RESOLUTION: Local vs Cloud
    // Eğer yerel veride ilerleme varsa, yereli öncelikli kabul et ve buluta yaz.
    // Eğer yerel veri boşsa (yeni cihaz), buluttan çek.
    if (isLocalDataExists()) {
        console.log("Local data exists. Pushing to cloud (Local is master).");
        await syncLocalToCloud(userCredential.user.uid);
    } else {
        console.log("Local data is empty. Pulling from cloud.");
        await syncCloudToLocal(userCredential.user.uid);
    }
    
    return userCredential.user;
};

export const logoutUser = async () => {
    if (!isFirebaseReady) return;
    await signOut(auth);
    window.location.reload(); // Reset state
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

    try {
        await setDoc(doc(db, "users", uid), {
            uid: uid,
            profile: profile,
            stats: stats,
            settings: settings,
            memorized: memorized, 
            bookmarks: bookmarks, 
            lastUpdated: new Date().toISOString(),
            
            leaderboardData: {
                name: profile.name,
                grade: profile.grade || 'General',
                xp: stats.xp,
                level: stats.level,
                avatar: profile.avatar,
                streak: stats.streak,
                totalBadges: stats.badges.length,
                cardsViewed: stats.flashcardsViewed,
                quizScore: stats.quizCorrect,
                memorizedCount: (JSON.parse(memorized) as string[]).length
            }
        }, { merge: true });
    } catch (e) {
        console.error("Cloud save error:", e);
    }
};

export const syncCloudToLocal = async (uid: string) => {
    if (!isFirebaseReady) return;
    
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            if (data.profile) saveUserProfile(data.profile);
            if (data.stats) saveUserStats(data.stats);
            if (data.settings) saveAppSettings(data.settings);
            if (data.memorized) localStorage.setItem('lgs_memorized', data.memorized);
            if (data.bookmarks) localStorage.setItem('lgs_bookmarks', data.bookmarks);
        }
    } catch (e) {
        console.error("Cloud fetch error:", e);
    }
};

export interface LeaderboardEntry {
    uid: string;
    name: string;
    xp: number;
    level: number;
    avatar: string;
    grade: string;
    streak: number;
    badges: number;
    cards: number;
    quiz: number;
}

export const getLeaderboard = async (filterGrade: string | 'ALL'): Promise<LeaderboardEntry[]> => {
    if (!isFirebaseReady) return [];

    try {
        const usersRef = collection(db, "users");
        let q;

        if (filterGrade === 'ALL') {
            q = query(usersRef, orderBy("leaderboardData.xp", "desc"), limit(50));
        } else {
            q = query(
                usersRef, 
                where("leaderboardData.grade", "==", filterGrade),
                orderBy("leaderboardData.xp", "desc"), 
                limit(50)
            );
        }

        const querySnapshot = await getDocs(q);
        const results: LeaderboardEntry[] = [];
        
        querySnapshot.forEach((doc) => {
            const d = doc.data().leaderboardData;
            results.push({
                uid: doc.id,
                name: d.name,
                xp: d.xp,
                level: d.level,
                avatar: d.avatar,
                grade: d.grade,
                streak: d.streak || 0,
                badges: d.totalBadges || 0,
                cards: d.cardsViewed || 0,
                quiz: d.quizScore || 0
            });
        });

        return results;
    } catch (e) {
        console.error("Leaderboard fetch error:", e);
        return [];
    }
};

export { isFirebaseReady };
