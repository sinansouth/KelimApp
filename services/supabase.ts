
import { createClient } from '@supabase/supabase-js';
import { Challenge, QuizDifficulty, Tournament, WordCard, TournamentMatch, Announcement } from '../types';
import {
    getUserProfile,
    getUserStats,
    getAppSettings,
    getLastUpdatedTimestamp,
    getTheme,
    saveUserProfile,
    saveUserStats,
    saveAppSettings,
    clearLocalUserData,
    getSRSData,
    saveSRSData,
    overwriteLocalWithCloud
} from './userService';
import { UNIT_ASSETS } from '../data/assets';

// SUPABASE CONFIG
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || "https://idjeqbmjfcoszbulnmzn.supabase.co";
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkamVxYm1qZmNvc3pidWxubXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODE3OTIsImV4cCI6MjA4MDc1Nzc5Mn0.PaP0pDCwSJe6hFOlyZBMWpUPlHCh6wxhsZhtLP1Ba2g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Utility to enforce timeouts on promises
export const withTimeout = <T>(promise: PromiseLike<T>, ms: number = 15000): Promise<T | null> => {
    return Promise.race([
        promise,
        new Promise<null>((resolve) => 
            setTimeout(() => {
                // console.warn(`Operation timed out after ${ms}ms`);
                resolve(null); // Reject yerine Resolve(null) yapıyoruz
            }, ms)
        )
    ]) as Promise<T | null>;
};

export const getAuthInstance = () => {
    return {
        currentUser: supabase.auth.getUser().then(({ data }) => data.user),
    };
};

export const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
};

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
    duelLosses?: number;
    duelDraws?: number;
    duelPoints?: number;
}

// --- DYNAMIC CONTENT & DATABASE SEEDING ---

export const getSystemContent = async (key: string) => {
    try {
        const result = await withTimeout(supabase
            .from('system_content')
            .select('value')
            .eq('key', key)
            .single(), 3000);
        
        if (!result || (result as any).error) return null;
        return (result as any).data?.value;
    } catch (e) {
        return null;
    }
};

export const upsertSystemContent = async (key: string, value: any) => {
    const { error } = await supabase
        .from('system_content')
        .upsert({ key, value, last_updated: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw error;
};

export const getAllGrammar = async () => {
    try {
        const result = await withTimeout(supabase
            .from('grammar')
            .select('*')); // Use default timeout
            
        if (!result || (result as any).error) return [];
        return (result as any).data;
    } catch (e) {
        return [];
    }
};

export const upsertGrammar = async (unitId: string, topics: any[]) => {
    const { error } = await supabase
        .from('grammar')
        .upsert({ unit_id: unitId, topics, last_updated: new Date().toISOString() }, { onConflict: 'unit_id' });
    if (error) throw error;
};

// --- CONTENT MANAGEMENT (Dynamic Vocabulary) ---

export const getUnitData = async (unitId: string): Promise<WordCard[] | null> => {
    try {
        if (navigator.onLine) {
            const query = supabase
                .from('units')
                .select('words')
                .eq('id', unitId)
                .single();

            const result = await withTimeout(query, 15000); // Increased explicit timeout if called from here, though usually via contentService

            if (!result || (result as any).error) return null;
            return (result as any).data?.words as WordCard[];
        }
        return null;
    } catch (e) {
        console.error("Error fetching unit data:", e);
        return null;
    }
};

export const saveUnitData = async (unitId: string, words: WordCard[]) => {
    try {
        const cleanWords = words.map(w => ({
            english: w.english || '',
            turkish: w.turkish || '',
            exampleEng: w.exampleEng || '',
            exampleTr: w.exampleTr || '',
            context: w.context || '',
            unitId: unitId
        }));

        const { error } = await supabase
            .from('units')
            .upsert({
                id: unitId,
                words: cleanWords,
                last_updated: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) throw error;
        console.log(`Unit ${unitId} saved successfully.`);
    } catch (e) {
        console.error(`Error saving unit ${unitId}:`, e);
        throw e;
    }
};

export const updateUnitWords = async (unitId: string, newWordList: WordCard[]) => {
    await saveUnitData(unitId, newWordList);
};

// --- AUTHENTICATION ---

export const loginUser = async (loginInput: string, pass: string, remember: boolean) => {
    let email = loginInput;

    if (!loginInput.includes('@')) {
        const result = await withTimeout(supabase
            .from('profiles')
            .select('email')
            .eq('username', loginInput)
            .single(), 4000);

        const data = (result as any)?.data;
        const error = (result as any)?.error;

        if (error || !data) {
            throw new Error("Kullanıcı adı bulunamadı.");
        }
        email = data.email;
    }

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass,
    });

    if (error) throw error;
};

export const registerUser = async (name: string, email: string, pass: string, grade: string) => {
    const result = await withTimeout(supabase
        .from('profiles')
        .select('username')
        .eq('username', name)
        .single(), 4000);
        
    const existingUser = (result as any)?.data;

    if (existingUser) {
        throw new Error("Bu kullanıcı adı zaten alınmış.");
    }

    const localProfile = getUserProfile();
    const localStats = getUserStats();

    let friendCode = localProfile.friendCode;
    if (!friendCode) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        friendCode = '';
        for (let i = 0; i < 6; i++) friendCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const metadata = {
        name: name,
        grade: grade,
        friend_code: friendCode
    };

    const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: metadata
        }
    });

    if (error) throw error;

    if (data.user) {
        const srsData = getSRSData();

        const inventoryData = {
            streakFreezes: localProfile.inventory.streakFreezes,
            themes: localProfile.purchasedThemes,
            frames: localProfile.purchasedFrames,
            backgrounds: localProfile.purchasedBackgrounds,
            equipped_frame: localProfile.frame,
            equipped_background: localProfile.background
        };

        const statsData = {
            ...localStats,
            lastUsernameChange: Date.now()
        };

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                username: name,
                grade: grade,
                friend_code: friendCode,
                avatar: localProfile.avatar,
                stats: statsData,
                srs_data: srsData,
                inventory: inventoryData,
                role: 'user',
                theme: getTheme(),
                updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id);

        if (updateError) console.error("Migration error:", updateError);

        const newLocalProfile = {
            ...localProfile,
            name: name,
            grade: grade,
            isGuest: false,
            friendCode: friendCode
        };
        saveUserProfile(newLocalProfile);
    }
};

export const resetUserPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });
    if (error) throw error;
};

export const updateUserEmail = async (newEmail: string) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
};

export const logoutUser = async () => {
    await supabase.auth.signOut();
    clearLocalUserData();
    window.location.reload();
};

export const checkUsernameExists = async (username: string): Promise<boolean> => {
    const result = await withTimeout(supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single(), 4000);
        
    return !!(result as any)?.data;
};

export const updateCloudUsername = async (uid: string, newName: string) => {
    const { error } = await supabase
        .from('profiles')
        .update({ username: newName })
        .eq('id', uid);

    if (error) throw error;
};

export const deleteAccount = async () => {
    await supabase.auth.signOut();
    clearLocalUserData();
    window.location.reload();
};

// --- SMART DATA SYNC ---

export const syncLocalToCloud = async (userId?: string) => {
    try {
        const userResponse = await supabase.auth.getUser();
        const uid = userId || userResponse.data.user?.id;
        if (!uid) return; 

        // 1. Yerel verileri al
        const localProfile = getUserProfile();
        const localStats = getUserStats();
        const localSRS = getSRSData();

        if (localProfile.isGuest) return;

        // 2. Buluttaki verileri al (Timestamp kontrolü için)
        
        let cloudData: any = null;
        try {
            const cloudResult = await withTimeout(supabase
                .from('profiles')
                .select('stats, srs_data, inventory, avatar, grade, username, theme, updated_at')
                .eq('id', uid)
                .single(), 4000);
            
            if (cloudResult && !(cloudResult as any).error) {
                cloudData = (cloudResult as any).data;
            }
        } catch (e) {
            console.warn("Could not fetch cloud data for sync comparison, attempting push only.");
        }

        // 3. Karşılaştırma ve Karar Verme
        const localTimestamp = Math.max(localProfile.updatedAt || 0, localStats.updatedAt || 0);
        
        let cloudTimestamp = 0;
        if (cloudData) {
             const statsTs = cloudData.stats?.updatedAt || 0;
             const profileTs = new Date(cloudData.updated_at || 0).getTime();
             cloudTimestamp = Math.max(statsTs, profileTs);
        }

        // Eğer bulut daha yeniyse -> İndir ve Yereli Güncelle
        if (cloudTimestamp > localTimestamp) {
            console.log("Cloud is newer. Pulling data...", cloudTimestamp, ">", localTimestamp);
            overwriteLocalWithCloud({
                profile: {
                    ...localProfile,
                    name: cloudData.username,
                    grade: cloudData.grade,
                    avatar: cloudData.avatar,
                    frame: cloudData.inventory?.equipped_frame,
                    background: cloudData.inventory?.equipped_background,
                    purchasedThemes: cloudData.inventory?.themes,
                    purchasedFrames: cloudData.inventory?.frames,
                    purchasedBackgrounds: cloudData.inventory?.backgrounds,
                    inventory: { streakFreezes: cloudData.inventory?.streakFreezes || 0 },
                    theme: cloudData.theme,
                    updatedAt: cloudTimestamp
                },
                stats: cloudData.stats,
                srs_data: cloudData.srs_data
            });
            return; // Çık, çünkü veri indirdik.
        }

        // Eğer yerel daha yeniyse veya eşitse -> Buluta Yükle
        console.log("Local is newer or equal. Pushing data...", localTimestamp, ">=", cloudTimestamp);

        const inventoryData = {
            streakFreezes: localProfile.inventory.streakFreezes,
            themes: localProfile.purchasedThemes,
            frames: localProfile.purchasedFrames,
            backgrounds: localProfile.purchasedBackgrounds,
            equipped_frame: localProfile.frame,
            equipped_background: localProfile.background
        };

        const updatePayload: any = {
            stats: localStats,
            inventory: inventoryData,
            srs_data: localSRS,
            avatar: localProfile.avatar,
            grade: localProfile.grade,
            username: localProfile.name,
            theme: getTheme(),
            updated_at: new Date().toISOString()
        };

        if (localProfile.isAdmin) {
            updatePayload.role = 'admin';
        }

        await withTimeout(supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', uid), 6000);

    } catch (e: any) {
        console.warn("Sync failed:", e);
    }
};

export const getUserData = async (uid: string) => {
    try {
        const result = await withTimeout(supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single(), 4000);

        if (!result || (result as any).error) return null;
        return transformProfileToUser((result as any).data);
    } catch (e) {
        return null;
    }
};

// --- ADMIN ACTIONS ---

export const searchUser = async (queryText: string) => {
    try {
        let result = await withTimeout(supabase
            .from('profiles')
            .select('*')
            .ilike('username', `%${queryText}%`)
            .limit(1), 4000);
            
        let data = (result as any)?.data;

        if (data && data.length > 0) return transformProfileToUser(data[0]);

        result = await withTimeout(supabase
            .from('profiles')
            .select('*')
            .eq('email', queryText)
            .single(), 4000);
            
        data = (result as any)?.data;

        if (data) return transformProfileToUser(data);
    } catch (e) {
        return null;
    }
    return null;
}

const transformProfileToUser = (data: any) => {
    return {
        uid: data.id,
        email: data.email,
        profile: {
            name: data.username,
            grade: data.grade,
            avatar: data.avatar,
            isAdmin: data.role === 'admin',
            friendCode: data.friend_code,
            frame: data.inventory?.equipped_frame || 'frame_none',
            background: data.inventory?.equipped_background || 'bg_default',
            theme: data.theme || 'dark',
            purchasedThemes: data.inventory?.themes || [],
            purchasedFrames: data.inventory?.frames || [],
            purchasedBackgrounds: data.inventory?.backgrounds || [],
            inventory: { streakFreezes: data.inventory?.streakFreezes || 0 },
            isGuest: false
        },
        stats: data.stats || {},
        srs_data: data.srs_data || {},
        leaderboardData: {
            name: data.username,
            xp: data.stats?.xp || 0,
            level: data.stats?.level || 1
        }
    };
};

export const adminGiveXP = async (uid: string, amount: number) => {
    const { data: profile } = await supabase.from('profiles').select('stats').eq('id', uid).single();

    if (profile && profile.stats) {
        const newStats = { ...profile.stats, xp: (profile.stats.xp || 0) + amount };
        await supabase.from('profiles').update({ stats: newStats }).eq('id', uid);
    }
};

export const toggleAdminStatus = async (uid: string, status: boolean) => {
    await supabase.from('profiles').update({ role: status ? 'admin' : 'user' }).eq('id', uid);
};

// --- ANNOUNCEMENTS ---

export const createGlobalAnnouncement = async (title: string, content: string) => {
    const { error } = await supabase.from('announcements').insert({
        title,
        content,
        date: new Date().toLocaleDateString('tr-TR'),
        created_at: new Date().toISOString()
    });
    if (error) throw error;
};

export const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
};

export const updateAnnouncement = async (id: string, title: string, content: string) => {
    const { error } = await supabase.from('announcements').update({ title, content }).eq('id', id);
    if (error) throw error;
};

export const getGlobalAnnouncements = async (): Promise<Announcement[]> => {
    try {
        const result = await withTimeout(supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false }), 4000);
            
        if (!result || (result as any).error) return [];
        return (result as any).data || [];
    } catch (e) {
        return [];
    }
};

// --- SYSTEM SETTINGS ---

export const getGlobalSettings = async () => {
    try {
        const result = await withTimeout(supabase.from('system_settings').select('*'), 3000);
        
        if (!result || (result as any).error) return {};
        
        const data = (result as any).data;
        const settings: any = {};
        if (data) {
            data.forEach((item: any) => {
                settings[item.key] = item.value;
            });
        }
        return settings;
    } catch (e) {
        return {};
    }
};

export const updateGlobalSettings = async (key: string, value: any) => {
    const { error } = await supabase.from('system_settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) throw error;
};

// --- TOURNAMENTS ---

export const getTournaments = async (): Promise<Tournament[]> => {
    try {
        const result = await withTimeout(supabase.from('tournaments').select('*'), 4000);
        
        if (!result || (result as any).error) return [];
        const data = (result as any).data;
        
        return (data || []).map((t: any) => ({
            ...t,
            rewards: t.rewards || { firstPlace: 1000, secondPlace: 500, thirdPlace: 250, participation: 50 },
            config: t.config || { difficulty: 'normal', wordCount: 20 },
            participants: t.participants || [],
            matches: t.matches || []
        }));
    } catch (e) {
        return [];
    }
};

export const createTournament = async (tournamentData: any) => {
    const { error } = await supabase.from('tournaments').insert(tournamentData);
    if (error) throw error;
};

export const updateTournament = async (id: string, data: any) => {
    const { error } = await supabase.from('tournaments').update(data).eq('id', id);
    if (error) throw error;
};

export const deleteTournament = async (id: string) => {
    const { error } = await supabase.from('tournaments').delete().eq('id', id);
    if (error) throw error;
};

export const updateTournamentStatus = async (id: string, status: string) => {
    await updateTournament(id, { status });
};

export const joinTournament = async (tournamentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Giriş yapmalısınız.");

    const { data: tournament } = await supabase.from('tournaments').select('participants, maxParticipants').eq('id', tournamentId).single();

    if (tournament) {
        const participants = tournament.participants || [];
        if (participants.includes(user.id)) throw new Error("Zaten katıldınız.");
        if (participants.length >= tournament.maxParticipants) throw new Error("Turnuva dolu.");

        const newParticipants = [...participants, user.id];
        await supabase.from('tournaments').update({ participants: newParticipants }).eq('id', tournamentId);
    }
};

export const checkTournamentTimeouts = async (tournamentId: string): Promise<boolean> => {
    const { data: tournament, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

    if (error || !tournament) return false;

    // Only process active tournaments
    if (tournament.status !== 'active') {
        if (tournament.status === 'registration' && Date.now() > tournament.registrationEndDate) {
            await supabase.from('tournaments').update({ status: 'active' }).eq('id', tournamentId);
            return true;
        }
        return false;
    }

    return false;
};

export const submitTournamentScore = async (tournamentId: string, matchId: string, score: number, timeTaken: number) => {
    const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single();
    if (!tournament) return;

    const matches = tournament.matches || [];
    const matchIndex = matches.findIndex((m: any) => m.id === matchId);
    if (matchIndex === -1) return;

    const match = matches[matchIndex];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isPlayer1 = match.player1Id === user.id;

    if (match.round === 2) { // Final
        if (isPlayer1) { match.score1_leg1 = score; match.time1_leg1 = timeTaken; }
        else { match.score2_leg1 = score; match.time2_leg1 = timeTaken; }

        if (match.score1_leg1 !== undefined && match.score2_leg1 !== undefined) {
            match.status = 'completed';
            // Tie-break with time
            if (match.score1_leg1 > match.score2_leg1) match.winnerId = match.player1Id;
            else if (match.score2_leg1 > match.score1_leg1) match.winnerId = match.player2Id;
            else {
                // Scores are equal, use time
                const t1 = match.time1_leg1 || 9999;
                const t2 = match.time2_leg1 || 9999;
                match.winnerId = t1 <= t2 ? match.player1Id : match.player2Id;
            }

            await supabase.from('tournaments').update({ championId: match.winnerId }).eq('id', tournamentId);
            if (match.winnerId) adminGiveXP(match.winnerId, tournament.rewards.firstPlace);
        }
    } else {
        // Normal Rounds (Leg 1 & Leg 2 concept handled in TournamentTree, but simplistic storage here)
        if (isPlayer1) { match.score1_leg1 = score; match.time1_leg1 = timeTaken; }
        else { match.score2_leg1 = score; match.time2_leg1 = timeTaken; }

        if (match.score1_leg1 !== undefined && match.score2_leg1 !== undefined) {
            match.status = 'completed';
            
            if (match.score1_leg1 > match.score2_leg1) match.winnerId = match.player1Id;
            else if (match.score2_leg1 > match.score1_leg1) match.winnerId = match.player2Id;
            else {
                 // Scores equal, use time
                 const t1 = match.time1_leg1 || 9999;
                 const t2 = match.time2_leg1 || 9999;
                 match.winnerId = t1 <= t2 ? match.player1Id : match.player2Id;
            }
        }
    }

    matches[matchIndex] = match;
    await supabase.from('tournaments').update({ matches }).eq('id', tournamentId);
};

export const forfeitTournamentMatch = async (tournamentId: string, matchId: string) => {
    const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single();
    if (!tournament) return;

    const matches = tournament.matches || [];
    const matchIndex = matches.findIndex((m: any) => m.id === matchId);
    if (matchIndex === -1) return;

    const match = matches[matchIndex];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // The user calling this function is the one forfeiting
    const isPlayer1 = match.player1Id === user.id;
    const winnerId = isPlayer1 ? match.player2Id : match.player1Id;

    if (!winnerId) return; // Should not happen in tournament

    match.status = 'completed';
    match.winnerId = winnerId;
    
    // Give forfeiting player 0 score, winner gets pass
    if (isPlayer1) { match.score1_leg1 = 0; } else { match.score2_leg1 = 0; }

    if (match.round === 2) {
        await supabase.from('tournaments').update({ championId: winnerId }).eq('id', tournamentId);
        adminGiveXP(winnerId, tournament.rewards.firstPlace);
    }

    matches[matchIndex] = match;
    await supabase.from('tournaments').update({ matches }).eq('id', tournamentId);
};


// --- FEEDBACK ---

export const sendFeedback = async (type: 'bug' | 'suggestion', message: string, contact: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('feedback').insert({
        type,
        message,
        contact,
        user_id: user?.id || 'anonymous'
    });
};

// --- LEADERBOARD ---

export const getLeaderboard = async (grade: string, mode: 'xp' | 'quiz' | 'flashcard' | 'matching' | 'maze' | 'wordSearch' | 'duel'): Promise<LeaderboardEntry[]> => {
    try {
        let query = supabase.from('profiles').select('*');
        const result = await withTimeout(query.limit(100), 5000);

        if (!result || (result as any).error) return [];
        const data = (result as any).data;

        if (!data) return [];

        const entries: LeaderboardEntry[] = data.map((d: any) => {
            const stats = d.stats || {};
            const weekly = stats.weekly || {};

            let val = 0;
            if (mode === 'xp') val = stats.xp || 0;
            else if (mode === 'quiz') val = weekly.quizCorrect || 0;
            else if (mode === 'flashcard') val = weekly.cardsViewed || 0;
            else if (mode === 'matching') val = weekly.matchingBestTime || 0;
            else if (mode === 'maze') val = weekly.mazeHighScore || 0;
            else if (mode === 'wordSearch') val = weekly.wordSearchHighScore || 0;
            else if (mode === 'duel') val = weekly.duelPoints || 0; // Use weekly duel points

            return {
                uid: d.id,
                name: d.username,
                grade: d.grade,
                xp: stats.xp || 0,
                level: stats.level || 1,
                streak: stats.streak || 0,
                avatar: d.avatar,
                frame: d.inventory?.equipped_frame || 'frame_none',
                background: d.inventory?.equipped_background || 'bg_default',
                theme: d.theme || 'dark',
                value: val,
                quizWrong: weekly.quizWrong,
                duelWins: weekly.duelWins || 0, // Weekly wins
                duelLosses: weekly.duelLosses || 0,
                duelDraws: weekly.duelDraws || 0,
                duelPoints: weekly.duelPoints || 0
            };
        });

        return entries.sort((a, b) => b.value - a.value).slice(0, 50);
    } catch (e) {
        return [];
    }
};

// --- PUBLIC PROFILE FETCHING ---

export const getPublicUserProfile = async (uid: string) => {
    try {
        const result = await withTimeout(supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single(), 4000);

        if (!result || (result as any).error) return null;
        const data = (result as any).data;

        const stats = data.stats || {};
        const weekly = stats.weekly || {};

        return {
            uid: data.id,
            name: data.username,
            grade: data.grade,
            xp: stats.xp || 0,
            level: stats.level || 1,
            streak: stats.streak || 0,
            avatar: data.avatar,
            frame: data.inventory?.equipped_frame || 'frame_none',
            background: data.inventory?.equipped_background || 'bg_default',
            theme: data.theme || 'dark',
            badges: stats.badges || [],
            totalTimeSpent: stats.totalTimeSpent || 0,
            quizCorrect: stats.quizCorrect || 0, // Lifetime
            quizWrong: stats.quizWrong || 0,
            
            // Lifetime Duel stats for profile
            duelPoints: stats.duelPoints || 0,
            duelWins: stats.duelWins || 0,
            duelLosses: stats.duelLosses || 0,
            duelDraws: stats.duelDraws || 0,
            
            // Lifetime Game High Scores (use root level if available, fallback to weekly if not yet migrated)
            matchingBestTime: stats.matchingAllTimeBest || weekly.matchingBestTime || 0,
            mazeHighScore: stats.mazeAllTimeBest || weekly.mazeHighScore || 0,
            wordSearchHighScore: stats.wordSearchAllTimeBest || weekly.wordSearchHighScore || 0
        };
    } catch (e) {
        return null;
    }
};

// --- FRIEND SYSTEM ---

export const addFriend = async (currentUid: string, friendCode: string) => {
    const { data: friendData, error } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('friend_code', friendCode)
        .single();

    if (error || !friendData) throw new Error("Kullanıcı bulunamadı.");
    if (friendData.id === currentUid) throw new Error("Kendini ekleyemezsin.");

    // 1. Seni arkadaş listeme ekle
    const { data: myProfile } = await supabase.from('profiles').select('friends').eq('id', currentUid).single();
    let myFriends: string[] = myProfile?.friends || [];
    if (!myFriends.includes(friendData.id)) {
        myFriends.push(friendData.id);
        await supabase.from('profiles').update({ friends: myFriends }).eq('id', currentUid);
    }

    // 2. Beni senin arkadaş listene ekle (KARŞILIKLI EKLEME)
    const { data: theirProfile } = await supabase.from('profiles').select('friends').eq('id', friendData.id).single();
    let theirFriends: string[] = theirProfile?.friends || [];
    if (!theirFriends.includes(currentUid)) {
        theirFriends.push(currentUid);
        await supabase.from('profiles').update({ friends: theirFriends }).eq('id', friendData.id);
    }

    return friendData.username;
};

export const getFriends = async (uid: string): Promise<LeaderboardEntry[]> => {
    const result = await withTimeout(supabase.from('profiles').select('friends').eq('id', uid).single(), 4000);
    const data = (result as any)?.data;
    
    if (!data || !data.friends || data.friends.length === 0) return [];

    const friendIds = data.friends;
    const friendsResult = await withTimeout(supabase.from('profiles').select('*').in('id', friendIds), 5000);
    const friendsData = (friendsResult as any)?.data;

    if (!friendsData) return [];

    return friendsData.map((d: any) => ({
        uid: d.id,
        name: d.username,
        grade: d.grade,
        xp: d.stats?.xp || 0,
        level: d.stats?.level || 1,
        streak: d.stats?.streak || 0,
        avatar: d.avatar,
        frame: d.inventory?.equipped_frame,
        background: d.inventory?.equipped_background,
        theme: d.theme || 'dark',
        value: d.stats?.xp || 0
    }));
};

// --- CHALLENGE SYSTEM ---

const generateShortId = (length: number = 6): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");

    const challengeId = generateShortId();

    const profile = getUserProfile();
    const unitDef = Object.values(UNIT_ASSETS).flat().find(u => u.id === unitId);

    const challengeData = {
        id: challengeId,
        creator_id: user.id,
        creator_name: creatorName,
        creator_score: creatorScore,
        status: 'waiting',
        data: {
            wordIndices,
            unitId,
            unitName: unitDef?.title || 'Bilinmeyen Ünite',
            grade: profile.grade,
            difficulty,
            wordCount,
            type,
            targetFriendId,
        }
    };

    const { error } = await supabase.from('challenges').insert(challengeData);
    
    if (error) {
        if (error.code === '23505') { 
            return createChallenge(creatorName, creatorScore, wordIndices, unitId, difficulty, wordCount, type, targetFriendId);
        }
        throw error;
    }
    
    return challengeId;
};

export const getChallenge = async (challengeId: string): Promise<Challenge | null> => {
    try {
        const result = await withTimeout(supabase.from('challenges').select('*').eq('id', challengeId).single(), 3000);
        if (!result || (result as any).error) return null;
        const data = (result as any).data;

        return {
            id: data.id,
            creatorId: data.creator_id,
            creatorName: data.creator_name,
            creatorScore: data.creator_score,
            status: data.status,
            createdAt: new Date(data.created_at).getTime(),
            ...data.data
        } as Challenge;
    } catch (e) {
        return null;
    }
};

export const getOpenChallenges = async (currentUid: string): Promise<Challenge[]> => {
    try {
        // 24 saatten eski challengelari filtrele
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const result = await withTimeout(
            supabase.from('challenges')
                .select('*')
                .eq('status', 'waiting')
                .gt('created_at', oneDayAgo) // Created After 24h ago
                .order('created_at', { ascending: false })
                .limit(20), 
            3000
        );
        
        if (!result || (result as any).error) return [];
        const data = (result as any).data;

        return data.map((d: any) => ({
            id: d.id,
            creatorId: d.creator_id,
            creatorName: d.creator_name,
            creatorScore: d.creator_score,
            status: d.status,
            createdAt: new Date(d.created_at).getTime(),
            ...d.data
        })).filter((c: Challenge) =>
            c.creatorId !== currentUid &&
            (c.type === 'public' || (c.type === 'friend' && c.targetFriendId === currentUid))
        );
    } catch (e) {
        return [];
    }
};

export const getPastChallenges = async (currentUid: string): Promise<Challenge[]> => {
    try {
        const result = await withTimeout(supabase.from('challenges')
            .select('*')
            .or(`creator_id.eq.${currentUid},opponent_id.eq.${currentUid}`)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(20), 5000);

        if (!result || (result as any).error) return [];
        const data = (result as any).data;

        return data.map((d: any) => ({
            id: d.id,
            creatorId: d.creator_id,
            creatorName: d.creator_name,
            creatorScore: d.creator_score,
            opponentId: d.opponent_id,
            opponentName: d.opponent_name,
            opponentScore: d.opponent_score,
            winnerId: d.winner_id,
            status: d.status,
            createdAt: new Date(d.created_at).getTime(),
            ...d.data
        })) as Challenge[];
    } catch (e) {
        return [];
    }
};

export const completeChallenge = async (challengeId: string, opponentName: string, opponentScore: number) => {
    const { data: challenge } = await supabase.from('challenges').select('creator_score, creator_id').eq('id', challengeId).single();

    if (challenge) {
        let winnerId = 'tie';
        const { data: { user } } = await supabase.auth.getUser();
        
        if (opponentScore > challenge.creator_score) {
            winnerId = user?.id || 'opponent';
        } else if (opponentScore < challenge.creator_score) {
            winnerId = challenge.creator_id;
        }

        const { error } = await supabase.from('challenges').update({
            status: 'completed',
            opponent_id: user?.id,
            opponent_name: opponentName,
            opponent_score: opponentScore,
            winner_id: winnerId
        }).eq('id', challengeId);
        
        if (error) {
            console.error("Error completing challenge:", error);
        }
    }
};
