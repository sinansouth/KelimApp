


import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateEmail,
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
    onSnapshot,
    updateDoc,
    arrayUnion,
    addDoc,
    deleteDoc
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
    saveAppSettings,
    updateStats
} from './userService';
import { Challenge, QuizDifficulty, Tournament, TournamentMatch } from '../types';
import { UNIT_ASSETS } from '../data/assets';
import { Announcement } from '../data/announcements';
import { sendNotification } from './notificationService';

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export auth instance for listeners
export const getAuthInstance = () => auth;

export interface LeaderboardEntry {
    uid: string;
    name: string;
    grade: string;
    xp: number;
    level: number;
    streak: number;
    avatar: string;
    frame: string;
    background: string;
    theme: string;
    value: number; 
    quizWrong?: number;
    duelWins?: number;
    duelPoints?: number;
}

// --- AUTHENTICATION ---

export const loginUser = async (loginInput: string, pass: string, remember: boolean) => {
    let email = loginInput;

    // Check if input is username (doesn't have @)
    if (!loginInput.includes('@')) {
        // Query Firestore to find email associated with username
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("profile.name", "==", loginInput), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
             const userData = querySnapshot.docs[0].data();
             if (userData.email) {
                 email = userData.email;
             } else {
                 throw new Error("Kullanıcı adı bulundu ancak e-posta adresi kayıtlı değil. Lütfen e-posta adresinizle giriş yapın.");
             }
        } else {
             // Fallback: Try to check leaderboard data just in case structure varies
             const q2 = query(usersRef, where("leaderboardData.name", "==", loginInput), limit(1));
             const snap2 = await getDocs(q2);
             if (!snap2.empty) {
                 const userData = snap2.docs[0].data();
                 if (userData.email) email = userData.email;
                 else throw new Error("Bu kullanıcı adı ile kayıtlı bir hesap bulunamadı.");
             } else {
                 throw new Error("Bu kullanıcı adı ile kayıtlı bir hesap bulunamadı.");
             }
        }
    }

    await signInWithEmailAndPassword(auth, email, pass);
};

export const registerUser = async (name: string, email: string, pass: string, grade: string) => {
    // 1. Check if username taken
    const exists = await checkUsernameExists(name);
    if (exists) {
        throw new Error("Bu kullanıcı adı zaten alınmış.");
    }

    // 2. Create Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = userCredential.user.uid;
    const user = userCredential.user;

    // 3. Update Profile Display Name
    await updateProfile(user, { displayName: name });
    
    // 4. Send Verification Email
    await sendEmailVerification(user);

    // 5. Prepare Data (Merge with existing guest data if any)
    const currentProfile = getUserProfile();
    
    const profile = {
        ...currentProfile, 
        name: name, 
        grade: grade,
        isGuest: false,
        lastUsernameChange: Date.now() // Set initial change time
    };

    // Ensure friendCode exists
    if (!profile.friendCode) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        profile.friendCode = result;
    }
    
    saveUserProfile(profile); 
    const stats = getUserStats(); 
    const settings = getAppSettings();
    const currentTheme = getTheme();
    
    const userData = {
        uid: uid,
        email: email, // Store email to allow username login lookup
        profile: profile,
        stats: stats,
        settings: settings,
        friends: [], // Initialize friends array
        lastUpdated: new Date().toISOString(),
        lastDataUpdate: Date.now(),
        isGuest: false, // Explicitly mark as not guest for queries
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
            quizCorrect: stats.weekly.quizCorrect,
            quizWrong: stats.weekly.quizWrong,
            cardsViewed: stats.weekly.cardsViewed,
            matchingBestTime: stats.weekly.matchingBestTime,
            mazeHighScore: stats.weekly.mazeHighScore,
            wordSearchHighScore: stats.weekly.wordSearchHighScore,
            duelWins: stats.duelWins || 0,
            duelPoints: stats.duelPoints || 0
        }
    };

    // 6. Write to Firestore
    await setDoc(doc(db, "users", uid), userData, { merge: true });
};

export const resetUserPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
};

export const updateUserEmail = async (newEmail: string) => {
    if (auth.currentUser) {
        await updateEmail(auth.currentUser, newEmail);
        await sendEmailVerification(auth.currentUser);
        // Update Firestore
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { email: newEmail });
    }
};

export const logoutUser = async () => {
    await signOut(auth);
    clearLocalUserData();
    window.location.reload();
};

export const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("profile.name", "==", username), limit(1)); 
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (e) {
        console.error("Username check error", e);
        return false;
    }
};

export const updateCloudUsername = async (uid: string, newName: string) => {
    const userRef = doc(db, "users", uid);
    // Store in multiple places for consistency
    await setDoc(userRef, { 
        profile: { name: newName, lastUsernameChange: Date.now() }, 
        leaderboardData: { name: newName } 
    }, { merge: true });
    
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newName });
    }
};

export const deleteAccount = async () => {
    if (auth.currentUser) {
         const uid = auth.currentUser.uid;
         // Delete Firestore data first (optional but clean)
         // await deleteDoc(doc(db, "users", uid));
         await auth.currentUser.delete();
    }
    clearLocalUserData();
    window.location.reload();
};

// --- ADMIN ACTIONS ---

export const searchUser = async (queryText: string) => {
    const usersRef = collection(db, "users");
    
    // Try Email
    let q = query(usersRef, where("email", "==", queryText), limit(1));
    let snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].data();

    // Try Name
    q = query(usersRef, where("leaderboardData.name", "==", queryText), limit(1));
    snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].data();

    // Try UID
    try {
        const docRef = doc(db, "users", queryText);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data();
    } catch(e) {}

    return null;
}

export const findUserByEmail = async (email: string) => {
   return searchUser(email);
}

export const toggleAdminStatus = async (uid: string, isAdmin: boolean) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { "profile.isAdmin": isAdmin });
}

export const adminGiveXP = async (uid: string, amount: number) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
        const data = userSnap.data();
        const currentXP = data.stats?.xp || 0;
        const newXP = currentXP + amount;
        
        await updateDoc(userRef, { 
            "stats.xp": newXP,
            "leaderboardData.xp": newXP 
        });
    }
}

// --- ANNOUNCEMENTS ---

export const createGlobalAnnouncement = async (title: string, content: string) => {
    const announcementsRef = collection(db, "announcements");
    await addDoc(announcementsRef, {
        id: `ann_${Date.now()}`,
        title,
        content,
        date: new Date().toLocaleDateString('tr-TR'),
        createdAt: Date.now()
    });
}

export const getGlobalAnnouncements = async (): Promise<Announcement[]> => {
    const announcementsRef = collection(db, "announcements");
    const q = query(announcementsRef, orderBy("createdAt", "desc"), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Announcement);
}


// --- DATA SYNC ---

export const syncLocalToCloud = async (userId?: string) => {
    const uid = userId || auth?.currentUser?.uid;
    if (!uid) return;

    const userEmail = auth?.currentUser?.email;

    const profile = getUserProfile();
    const stats = getUserStats();
    const settings = getAppSettings();
    const memorized = localStorage.getItem('lgs_memorized') || '[]';
    const bookmarks = localStorage.getItem('lgs_bookmarks') || '[]';
    const srs = localStorage.getItem('lgs_srs_data') || '{}';
    const lastUpdate = getLastUpdatedTimestamp();
    const currentTheme = getTheme();

    try {
        const dataToSave: any = {
            uid: uid,
            profile: profile,
            stats: stats, 
            settings: settings,
            memorized: memorized, 
            bookmarks: bookmarks, 
            srs: srs,
            lastUpdated: new Date().toISOString(),
            lastDataUpdate: lastUpdate,
            isGuest: profile.isGuest,
            
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
                mazeHighScore: stats.weekly.mazeHighScore || 0,
                wordSearchHighScore: stats.weekly.wordSearchHighScore || 0,
                duelWins: stats.duelWins || 0,
                duelPoints: stats.duelPoints || 0
            }
        };

        // Explicitly save email if available to ensure username login works
        if (userEmail) {
            dataToSave.email = userEmail;
        }

        await setDoc(doc(db, "users", uid), dataToSave, { merge: true });
    } catch (e) {
        console.error("Cloud save error:", e);
    }
};

// Manual fetch function to inspect cloud data
export const getUserData = async (uid: string) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (e) {
        console.error("Get user data error:", e);
        return null;
    }
}

// Simplified auto-sync logic
export const syncData = async (uid: string) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
           // Do nothing, AuthModal handles conflict
        } else {
            // New user on cloud (rare if registered), push local data
            await syncLocalToCloud(uid);
        }
    } catch (e) {
        console.error("Sync error:", e);
    }
};

export const subscribeToUserChanges = (uid: string, callback: () => void) => {
    return onSnapshot(doc(db, "users", uid), (doc) => {
        const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        if (source === "Server") {
             // callback();
        }
    });
};

// --- PUBLIC PROFILE FETCHING ---

export const getPublicUserProfile = async (uid: string) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data.leaderboardData,
                badges: data.stats?.badges || [], 
                totalTimeSpent: data.stats?.totalTimeSpent || 0
            };
        }
        return null;
    } catch (e) {
        console.error("Error fetching public profile:", e);
        return null;
    }
};

// --- FRIEND SYSTEM ---

export const addFriend = async (currentUid: string, friendCode: string) => {
    // friendCode is now the 6-char string, not UID
    if (!friendCode) throw new Error("Kod boş olamaz.");

    // Query for user with this friendCode
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("profile.friendCode", "==", friendCode), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        throw new Error("Kullanıcı bulunamadı.");
    }

    const friendDoc = querySnapshot.docs[0];
    const friendUid = friendDoc.id;
    const friendData = friendDoc.data();

    if (currentUid === friendUid) throw new Error("Kendini arkadaş olarak ekleyemezsin.");
    
    // Add to current user's friend list
    const userRef = doc(db, "users", currentUid);
    await updateDoc(userRef, {
        friends: arrayUnion(friendUid)
    });
    
    // Add mutual friendship
    const friendRef = doc(db, "users", friendUid);
    await updateDoc(friendRef, {
        friends: arrayUnion(currentUid)
    });
    
    return friendData.leaderboardData.name; // Return friend's name
};

export const getFriends = async (uid: string): Promise<LeaderboardEntry[]> => {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) return [];
        
        const friendIds = userSnap.data().friends || [];
        if (friendIds.length === 0) return [];
        
        // Fetch details for each friend
        const friendsData: LeaderboardEntry[] = [];
        for (const fid of friendIds) {
            const fSnap = await getDoc(doc(db, "users", fid));
            if (fSnap.exists()) {
                const d = fSnap.data();
                friendsData.push({
                     uid: d.uid,
                     name: d.leaderboardData.name,
                     grade: d.leaderboardData.grade,
                     xp: d.leaderboardData.xp,
                     level: d.leaderboardData.level,
                     streak: d.leaderboardData.streak,
                     avatar: d.leaderboardData.avatar,
                     frame: d.leaderboardData.frame,
                     background: d.leaderboardData.background,
                     theme: d.leaderboardData.theme,
                     value: d.leaderboardData.xp, 
                     duelWins: d.leaderboardData.duelWins || 0,
                     duelPoints: d.leaderboardData.duelPoints || 0
                 });
            }
        }
        return friendsData;
    } catch (e) {
        console.error("Error fetching friends", e);
        return [];
    }
};

// --- CHALLENGE SYSTEM ---

export const createChallenge = async (
    creatorName: string, 
    creatorScore: number, 
    wordIndices: number[], 
    unitId: string, 
    difficulty: QuizDifficulty, 
    wordCount: number,
    type: 'public' | 'private' | 'friend' = 'private',
    targetFriendId?: string
): Promise<string> => {
    if (!auth.currentUser) throw new Error("User not logged in");
    
    const challengeId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Find unit title and grade for better display in lists
    let unitName = 'Karışık';
    let grade = 'Genel';
    if (unitId && unitId !== 'mixed') {
        for (const [g, units] of Object.entries(UNIT_ASSETS)) {
            const found = units.find(u => u.id === unitId);
            if (found) {
                unitName = found.title;
                grade = g;
                break;
            }
        }
    }

    const challengeData: Challenge = {
        id: challengeId,
        type,
        creatorId: auth.currentUser.uid,
        creatorName: creatorName,
        creatorScore: creatorScore,
        wordIndices: wordIndices,
        unitId: unitId,
        unitName: unitName,
        grade: grade,
        difficulty: difficulty,
        wordCount: wordCount,
        status: 'waiting',
        createdAt: Date.now()
    };

    if (targetFriendId) {
        challengeData.targetFriendId = targetFriendId;
    }
    
    await setDoc(doc(db, "challenges", challengeId), challengeData);
    return challengeId;
};

export const getChallenge = async (challengeId: string): Promise<Challenge | null> => {
    const docRef = doc(db, "challenges", challengeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data() as Challenge;
        // Check expiration (24 hours)
        const now = Date.now();
        const expiration = 24 * 60 * 60 * 1000; // 24 hours
        if (now - data.createdAt > expiration) {
            return null; // Expired
        }
        return data;
    }
    return null;
};

export const getOpenChallenges = async (currentUid: string): Promise<Challenge[]> => {
    const challengesRef = collection(db, "challenges");
    const now = Date.now();
    const expiration = 24 * 60 * 60 * 1000; // 24 hours
    const validTime = now - expiration;

    // Simplified Query
    const q = query(
        challengesRef, 
        where("status", "==", "waiting")
    );

    const snapshot = await getDocs(q);
    const challenges: Challenge[] = [];
    
    snapshot.forEach(doc => {
        const data = doc.data() as Challenge;
        
        // Client-side Filtering
        const isExpired = data.createdAt <= validTime;
        const isMyOwn = data.creatorId === currentUid;
        
        if (!isExpired && !isMyOwn) {
            if (data.type === 'public') {
                challenges.push(data);
            } 
            else if (data.type === 'friend' && data.targetFriendId === currentUid) {
                challenges.push(data);
            }
        }
    });
    
    return challenges.sort((a,b) => b.createdAt - a.createdAt);
};

export const getPastChallenges = async (currentUid: string): Promise<Challenge[]> => {
    const challengesRef = collection(db, "challenges");
    
    const qCreator = query(
        challengesRef,
        where("creatorId", "==", currentUid),
        where("status", "==", "completed"),
        limit(20)
    );

    const qOpponent = query(
        challengesRef,
        where("opponentId", "==", currentUid),
        where("status", "==", "completed"),
        limit(20)
    );

    const [snap1, snap2] = await Promise.all([getDocs(qCreator), getDocs(qOpponent)]);
    
    const challenges: Challenge[] = [];
    snap1.forEach(doc => challenges.push(doc.data() as Challenge));
    snap2.forEach(doc => challenges.push(doc.data() as Challenge));
    
    const uniqueChallenges = Array.from(new Map(challenges.map(item => [item.id, item])).values());
    return uniqueChallenges.sort((a, b) => b.createdAt - a.createdAt);
};


export const completeChallenge = async (challengeId: string, opponentName: string, opponentScore: number) => {
    const docRef = doc(db, "challenges", challengeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data() as Challenge;
        let winnerId = 'tie';
        if (opponentScore > data.creatorScore) {
            winnerId = auth.currentUser?.uid || 'opponent';
        } else if (opponentScore < data.creatorScore) {
            winnerId = data.creatorId;
        }

        await updateDoc(docRef, {
            status: 'completed',
            opponentId: auth.currentUser?.uid,
            opponentName,
            opponentScore,
            winnerId
        });
    }
};

// --- TOURNAMENT SYSTEM ---

export const createTournament = async (data: Partial<Tournament>) => {
    if (!auth.currentUser) return;
    
    const tid = Math.random().toString(36).substring(2, 8).toUpperCase();
    const tournamentData: Tournament = {
        id: tid,
        title: data.title || 'Yeni Turnuva',
        grade: data.grade || 'A1',
        unitId: data.unitId || 'all',
        unitName: data.unitName || 'Karışık',
        status: 'registration',
        registrationStartDate: data.registrationStartDate || Date.now(),
        registrationEndDate: data.registrationEndDate || (Date.now() + (2 * 24 * 60 * 60 * 1000)), // Default 2 days for reg
        startDate: data.startDate || (Date.now() + (3 * 24 * 60 * 60 * 1000)), // Default start in 3 days
        endDate: data.endDate || (Date.now() + (7 * 24 * 60 * 60 * 1000)),
        maxParticipants: data.maxParticipants || 32,
        minLevel: data.minLevel || 1, // New Level Limit
        roundDuration: data.roundDuration || 30, // Minutes per round (Changed)
        rewards: data.rewards || { firstPlace: 1000, secondPlace: 500, thirdPlace: 250, participation: 50 }, // Rewards
        participants: [],
        matches: [],
        currentRound: data.maxParticipants || 32, // Default start
        config: data.config || { difficulty: 'normal', wordCount: 20 }
    };

    await setDoc(doc(db, "tournaments", tid), tournamentData);
    return tid;
};

export const updateTournament = async (tournamentId: string, data: Partial<Tournament>) => {
     if (!auth.currentUser) return;
     const tRef = doc(db, "tournaments", tournamentId);
     await updateDoc(tRef, data);
}

export const deleteTournament = async (tournamentId: string) => {
     if (!auth.currentUser) return;
     await deleteDoc(doc(db, "tournaments", tournamentId));
}

export const updateTournamentStatus = async (tournamentId: string, status: 'registration' | 'active' | 'completed') => {
    const tRef = doc(db, "tournaments", tournamentId);
    await updateDoc(tRef, { status });
}

// Function to process timeouts for matches in a tournament (AUTOMATIC/LAZY TRIGGERED)
// Returns true if any update was made
export const checkTournamentTimeouts = async (tournamentId: string): Promise<boolean> => {
    const tRef = doc(db, "tournaments", tournamentId);
    const tSnap = await getDoc(tRef);
    
    if (!tSnap.exists()) return false;
    
    const tournament = tSnap.data() as Tournament;
    const currentUserId = auth.currentUser?.uid;
    
    // Only process active tournaments
    if (tournament.status !== 'active') {
        // If registration expired, start it automatically
        if (tournament.status === 'registration' && Date.now() > tournament.registrationEndDate) {
             // Generate brackets and start
             // Simplified: Just mark active. Real bracket generation logic would go here.
             await updateDoc(tRef, { status: 'active' });
             if (currentUserId && tournament.participants.includes(currentUserId)) {
                 sendNotification("Turnuva Başladı!", `${tournament.title} başladı, iyi şanslar!`);
             }
             return true;
        }
        return false;
    }

    const matches = tournament.matches;
    let hasUpdates = false;
    const now = Date.now();
    
    // Round Duration Logic: Minutes
    // Using MINUTES now
    const ROUND_DURATION = (tournament.roundDuration || 30) * 60 * 1000; // Minutes to Ms
    
    // Calculate expected round end time
    // Round 32 -> 16 -> 8 -> 4 -> 2
    let roundsPlayed = 0;
    if (tournament.maxParticipants === 32) {
        if (tournament.currentRound === 16) roundsPlayed = 1;
        if (tournament.currentRound === 8) roundsPlayed = 2;
        if (tournament.currentRound === 4) roundsPlayed = 3;
        if (tournament.currentRound === 2) roundsPlayed = 4;
    } else if (tournament.maxParticipants === 64) {
        if (tournament.currentRound === 32) roundsPlayed = 1;
        if (tournament.currentRound === 16) roundsPlayed = 2;
        if (tournament.currentRound === 8) roundsPlayed = 3;
        if (tournament.currentRound === 4) roundsPlayed = 4;
        if (tournament.currentRound === 2) roundsPlayed = 5;
    }
    
    const roundStartTime = tournament.startDate + (roundsPlayed * ROUND_DURATION);
    const roundEndTime = roundStartTime + ROUND_DURATION;

    // Check for matches relevant to current user to send notifications
    if (currentUserId) {
        const myMatch = matches.find(m => (m.player1Id === currentUserId || m.player2Id === currentUserId) && m.round === tournament.currentRound && m.status !== 'completed');
        if (myMatch) {
            // Check if it's waiting for me specifically
            // e.g. Leg 1 or Leg 2 pending
            let needToPlay = false;
             if (myMatch.player1Id === currentUserId) {
                if (myMatch.score1_leg1 === undefined) needToPlay = true;
                else if (myMatch.round !== 2 && myMatch.score1_leg2 === undefined) needToPlay = true;
             } else {
                if (myMatch.score2_leg1 === undefined) needToPlay = true;
                else if (myMatch.round !== 2 && myMatch.score2_leg2 === undefined) needToPlay = true;
             }

             if (needToPlay) {
                 // Send a notification (throttled by local storage or similar usually, but here simply calling it)
                 // Ideally we check if we already notified recently. 
                 // For this demo, we assume this function is called on page load.
                 sendNotification("Sıra Sende!", `${tournament.title} turnuvasında maç sırası sende.`);
             }
        }
    }

    // Check if current round time has expired
    if (now > roundEndTime) {
        // Timeout Logic: Force finish current round matches
        const currentRoundMatches = matches.filter(m => m.round === tournament.currentRound && m.status !== 'completed');
        
        if (currentRoundMatches.length > 0) {
            for (let i = 0; i < matches.length; i++) {
                const m = matches[i];
                if (m.round === tournament.currentRound && m.status !== 'completed') {
                    let updated = false;
                    
                    // Set 0 for unplayed
                    if (m.score1_leg1 === undefined) { m.score1_leg1 = 0; updated = true; }
                    if (m.score2_leg1 === undefined) { m.score2_leg1 = 0; updated = true; }
                    
                    if (m.round !== 2) {
                        if (m.score1_leg2 === undefined) { m.score1_leg2 = 0; updated = true; }
                        if (m.score2_leg2 === undefined) { m.score2_leg2 = 0; updated = true; }
                    }
                    
                    if (updated) {
                         const total1 = (m.score1_leg1 || 0) + (m.score1_leg2 || 0);
                         const total2 = (m.score2_leg1 || 0) + (m.score2_leg2 || 0);
                         
                         m.status = 'completed';
                         m.winnerId = total1 >= total2 ? m.player1Id : m.player2Id;
                         
                         hasUpdates = true;
                    }
                }
            }
             if (currentUserId && currentRoundMatches.some(m => m.player1Id === currentUserId || m.player2Id === currentUserId)) {
                  sendNotification("Tur Bitti!", `${tournament.title} turnuvasında tur süresi doldu.`);
             }
        }
    }
    
    if (hasUpdates) {
        await updateDoc(tRef, { matches: matches });
        return true;
    }
    return false;
};


export const joinTournament = async (tournamentId: string) => {
    if (!auth.currentUser) throw new Error("Giriş yapmalısınız.");
    
    const userStats = getUserStats();
    const tRef = doc(db, "tournaments", tournamentId);
    const tSnap = await getDoc(tRef);
    
    if (!tSnap.exists()) throw new Error("Turnuva bulunamadı.");
    const tData = tSnap.data() as Tournament;
    
    if (tData.status !== 'registration') throw new Error("Kayıtlar kapandı.");
    
    // Check start date
    if (Date.now() < (tData.registrationStartDate || 0)) throw new Error("Kayıtlar henüz başlamadı.");
    
    // Check end date
    if (Date.now() > tData.registrationEndDate) throw new Error("Kayıt süresi doldu.");

    // Level Check
    if (userStats.level < (tData.minLevel || 1)) throw new Error(`Bu turnuvaya katılmak için ${tData.minLevel}. seviye olmalısınız.`);

    if (tData.participants.length >= tData.maxParticipants) throw new Error("Turnuva dolu.");
    if (tData.participants.includes(auth.currentUser.uid)) throw new Error("Zaten katıldınız.");
    
    await updateDoc(tRef, {
        participants: arrayUnion(auth.currentUser.uid)
    });
};

export const getTournaments = async (): Promise<Tournament[]> => {
    // Fetch active or registration tournaments
    const q = query(collection(db, "tournaments"), limit(20));
    const snaps = await getDocs(q);
    const tournaments: Tournament[] = [];
    snaps.forEach(d => tournaments.push(d.data() as Tournament));
    
    return tournaments.sort((a,b) => {
        const statusWeight = { 'registration': 3, 'active': 2, 'completed': 1 };
        const statusDiff = statusWeight[a.status] - statusWeight[b.status];
        if (statusDiff !== 0) return statusDiff * -1;
        return b.startDate - a.startDate;
    });
};

export const submitTournamentScore = async (tournamentId: string, matchId: string, score: number, timeTaken: number = 0) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    
    const tRef = doc(db, "tournaments", tournamentId);
    const tSnap = await getDoc(tRef);
    if (!tSnap.exists()) return;
    
    const tournament = tSnap.data() as Tournament;
    const matchIndex = tournament.matches.findIndex(m => m.id === matchId);
    
    if (matchIndex === -1) return;
    
    const match = tournament.matches[matchIndex];
    const isPlayer1 = match.player1Id === userId;
    
    const isFinal = match.round === 2;
    let updatedMatch = { ...match };
    
    if (isFinal) {
         if (isPlayer1) { updatedMatch.score1_leg1 = score; updatedMatch.time1_leg1 = timeTaken; }
         else { updatedMatch.score2_leg1 = score; updatedMatch.time2_leg1 = timeTaken; }
         
         if (updatedMatch.score1_leg1 !== undefined && updatedMatch.score2_leg1 !== undefined) {
             updatedMatch.status = 'completed';
             // Win Logic: Score first, then Time
             if (updatedMatch.score1_leg1 > updatedMatch.score2_leg1) updatedMatch.winnerId = updatedMatch.player1Id;
             else if (updatedMatch.score2_leg1 > updatedMatch.score1_leg1) updatedMatch.winnerId = updatedMatch.player2Id;
             else {
                 // Scores equal, check time (lower is better)
                 const t1 = updatedMatch.time1_leg1 || 9999;
                 const t2 = updatedMatch.time2_leg1 || 9999;
                 updatedMatch.winnerId = t1 <= t2 ? updatedMatch.player1Id : updatedMatch.player2Id;
             }
             
             await updateDoc(tRef, { championId: updatedMatch.winnerId });
             // Award Rewards
             if (updatedMatch.winnerId) adminGiveXP(updatedMatch.winnerId, tournament.rewards.firstPlace);
             const loserId = updatedMatch.winnerId === updatedMatch.player1Id ? updatedMatch.player2Id : updatedMatch.player1Id;
             if (loserId) adminGiveXP(loserId, tournament.rewards.secondPlace);
             
             // Notify winner
             if (updatedMatch.winnerId === userId) sendNotification("Tebrikler!", "Turnuva şampiyonu oldunuz!");
         }
    } else {
        // Regular Match (2 Legs) - Simplified here, usually would wait for leg 2
        // For this example, we treat single game as leg 1 or 2 depending on slot
        if (isPlayer1) {
             if (updatedMatch.score1_leg1 === undefined) { updatedMatch.score1_leg1 = score; updatedMatch.time1_leg1 = timeTaken; }
             else { updatedMatch.score1_leg2 = score; updatedMatch.time1_leg2 = timeTaken; }
        } else {
             if (updatedMatch.score2_leg1 === undefined) { updatedMatch.score2_leg1 = score; updatedMatch.time2_leg1 = timeTaken; }
             else { updatedMatch.score2_leg2 = score; updatedMatch.time2_leg2 = timeTaken; }
        }
        
        const p1Done = updatedMatch.score1_leg1 !== undefined && updatedMatch.score1_leg2 !== undefined;
        const p2Done = updatedMatch.score2_leg1 !== undefined && updatedMatch.score2_leg2 !== undefined;
        
        if (p1Done && p2Done) {
             updatedMatch.status = 'completed';
             const total1 = (updatedMatch.score1_leg1 || 0) + (updatedMatch.score1_leg2 || 0);
             const total2 = (updatedMatch.score2_leg1 || 0) + (updatedMatch.score2_leg2 || 0);
             const time1 = (updatedMatch.time1_leg1 || 0) + (updatedMatch.time1_leg2 || 0);
             const time2 = (updatedMatch.time2_leg1 || 0) + (updatedMatch.time2_leg2 || 0);

             if (total1 > total2) updatedMatch.winnerId = updatedMatch.player1Id;
             else if (total2 > total1) updatedMatch.winnerId = updatedMatch.player2Id;
             else updatedMatch.winnerId = time1 <= time2 ? updatedMatch.player1Id : updatedMatch.player2Id;
        }
    }
    
    const newMatches = [...tournament.matches];
    newMatches[matchIndex] = updatedMatch;
    
    await updateDoc(tRef, { matches: newMatches });
    
    // Participation Reward (Once per tournament logic needed, simplified here)
    updateStats('xp', null, undefined, tournament.rewards.participation);
};


// --- FEEDBACK ---

export const sendFeedback = async (type: 'bug' | 'suggestion', message: string, contact: string) => {
    const feedbackRef = doc(collection(db, "feedback"));
    await setDoc(feedbackRef, {
        type,
        message,
        contact,
        uid: auth.currentUser?.uid || 'anonymous',
        timestamp: Date.now()
    });
};

// --- LEADERBOARD ---

export const getLeaderboard = async (grade: string, mode: 'xp' | 'quiz' | 'flashcard' | 'matching' | 'maze' | 'wordSearch' | 'duel'): Promise<LeaderboardEntry[]> => {
    const usersRef = collection(db, "users");
    let q;
    
    let field = 'leaderboardData.xp';
    if (mode === 'quiz') field = 'leaderboardData.quizCorrect'; 
    if (mode === 'flashcard') field = 'leaderboardData.cardsViewed';
    if (mode === 'matching') field = 'leaderboardData.matchingBestTime';
    if (mode === 'maze') field = 'leaderboardData.mazeHighScore';
    if (mode === 'wordSearch') field = 'leaderboardData.wordSearchHighScore';
    if (mode === 'duel') field = 'leaderboardData.duelPoints'; 

    q = query(
        usersRef, 
        orderBy(field, "desc"), 
        limit(100)
    );
    
    const snapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.isGuest === false && data.leaderboardData) {
            let val = 0;
             if (mode === 'xp') val = data.leaderboardData.xp;
             else if (mode === 'quiz') val = data.leaderboardData.quizCorrect;
             else if (mode === 'flashcard') val = data.leaderboardData.cardsViewed;
             else if (mode === 'matching') val = data.leaderboardData.matchingBestTime;
             else if (mode === 'maze') val = data.leaderboardData.mazeHighScore;
             else if (mode === 'wordSearch') val = data.leaderboardData.wordSearchHighScore;
             else if (mode === 'duel') val = data.leaderboardData.duelPoints || 0;
             
             entries.push({
                 uid: data.uid,
                 name: data.leaderboardData.name,
                 grade: data.leaderboardData.grade,
                 xp: data.leaderboardData.xp,
                 level: data.leaderboardData.level,
                 streak: data.leaderboardData.streak,
                 avatar: data.leaderboardData.avatar,
                 frame: data.leaderboardData.frame,
                 background: data.leaderboardData.background,
                 theme: data.leaderboardData.theme,
                 value: val,
                 quizWrong: mode === 'quiz' ? data.leaderboardData.quizWrong : undefined,
                 duelWins: data.leaderboardData.duelWins || 0,
                 duelPoints: data.leaderboardData.duelPoints || 0
             });
        }
    });
    
    return entries.slice(0, 50);
};

