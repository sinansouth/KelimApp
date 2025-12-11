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

// --- CUMULATIVE STATS (for weekly/all-time leaderboards) ---
export const updateCumulativeStats = async (action_type: 'quiz_correct' | 'quiz_wrong' | 'card_view', amount: number) => {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
        const { error } = await supabase.rpc('update_cumulative_stats', { 
            p_action_type: action_type, 
            p_amount: amount 
        });
        
        if (error) {
            console.error(`Error updating cumulative stat ${action_type}:`, error.message || error);
        }
    } catch (e) {
        console.error(`RPC call failed for update_cumulative_stats:`, e);
    }
};

export const updateGameScore = async (game_type: 'matching' | 'maze' | 'wordSearch', new_score: number) => {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
        const { error } = await supabase.rpc('update_game_score', { 
            p_game_type: game_type, 
            p_new_score: new_score 
        });
        
        if (error) {
            console.error(`Error updating game score for ${game_type}:`, error.message || error);
        }
    } catch (e) {
        console.error(`RPC call failed for update_game_score:`, e);
    }
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

export const getSystemStats = async () => {
    try {
        const usersCount = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const tournamentsCount = await supabase.from('tournaments').select('*', { count: 'exact', head: true }).eq('status', 'active');
        const challengesCount = await supabase.from('challenges').select('*', { count: 'exact', head: true });
        const feedbackCount = await supabase.from('feedback').select('*', { count: 'exact', head: true });

        return {
            totalUsers: usersCount.count || 0,
            activeTournaments: tournamentsCount.count || 0,
            totalChallenges: challengesCount.count || 0,
            totalFeedback: feedbackCount.count || 0
        };
    } catch (e) {
        return { totalUsers: 0, activeTournaments: 0, totalChallenges: 0, totalFeedback: 0 };
    }
};

export const getRecentUsers = async () => {
    try {
        const result = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (result.error) throw result.error;
        return (result.data || []).map(transformProfileToUser);
    } catch (e) {
        console.error("Error fetching recent users", e);
        return [];
    }
};

export const updateUserRole = async (uid: string, role: 'admin' | 'user' | 'banned') => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', uid);
    if (error) throw error;
};

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
            role: data.role || 'user', // Store role string
            isAdmin: data.role === 'admin',
            isBanned: data.role === 'banned',
            friendCode: data.friend_code,
            frame: data.inventory?.equipped_frame || 'frame_none',
            background: data.inventory?.equipped_background || 'bg_default',
            theme: data.theme || 'dark',
            purchasedThemes: data.inventory?.themes || [],
            purchasedFrames: data.inventory?.frames || [],
            purchasedBackgrounds: data.inventory?.backgrounds || [],
            inventory: { streakFreezes: data.inventory?.streakFreezes || 0 },
            isGuest: false,
            createdAt: data.created_at
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

// --- FEEDBACK SYSTEM ---

export const sendFeedback = async (type: string, message: string, contact: string) => {
    const { error } = await supabase.from('feedback').insert({
        type,
        message,
        contact,
        created_at: new Date().toISOString()
    });
    if (error) throw error;
};

export const getAllFeedback = async () => {
    try {
        const result = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false });
        return result.data || [];
    } catch (e) {
        return [];
    }
};

export const deleteFeedback = async (id: number) => {
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (error) throw error;
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

// --- CHALLENGES ---

export const getChallenge = async (id: string) => {
    try {
        const { data, error } = await supabase
            .from('challenges')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return transformChallengeData(data);
    } catch (e) {
        console.error("Error fetching challenge:", e);
        return null;
    }
};

export const getOpenChallenges = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('challenges')
            .select('*')
            .eq('status', 'waiting')
            .or(`type.eq.public,and(type.eq.friend,target_friend_id.eq.${userId})`)
            .neq('creator_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(transformChallengeData);
    } catch (e) {
        console.error("Error fetching open challenges:", e);
        return [];
    }
};

export const getPastChallenges = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('challenges')
            .select('*')
            .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return (data || []).map(transformChallengeData);
    } catch (e) {
        console.error("Error fetching past challenges:", e);
        return [];
    }
};

export const createChallenge = async (
    creatorName: string, 
    creatorScore: number, 
    wordIndices: number[], 
    unitId: string, 
    difficulty: string, 
    wordCount: number, 
    type: string, 
    targetFriendId?: string
) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const payload: any = {
        creator_id: user.id,
        creator_name: creatorName,
        creator_score: creatorScore,
        word_indices: wordIndices,
        unit_id: unitId,
        difficulty,
        word_count: wordCount,
        type,
        status: 'waiting',
        created_at: new Date().toISOString()
    };

    if (targetFriendId) {
        payload.target_friend_id = targetFriendId;
    }

    const { data, error } = await supabase
        .from('challenges')
        .insert(payload)
        .select('id')
        .single();

    if (error) throw error;
    return data.id;
};

export const completeChallenge = async (challengeId: string, playerName: string, score: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: challenge, error: fetchError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();
        
    if (fetchError || !challenge) throw new Error("Challenge not found");
    if (challenge.status !== 'waiting') throw new Error("Challenge already completed");

    let winnerId = 'tie';
    if (challenge.creator_score > score) winnerId = challenge.creator_id;
    else if (score > challenge.creator_score) winnerId = user.id;

    const updateData = {
        opponent_id: user.id,
        opponent_name: playerName,
        opponent_score: score,
        winner_id: winnerId,
        status: 'completed'
    };

    const { error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', challengeId);

    if (error) throw error;
};

const transformChallengeData = (data: any): Challenge => {
    return {
        id: data.id,
        type: data.type,
        creatorId: data.creator_id,
        creatorName: data.creator_name,
        creatorScore: data.creator_score,
        wordIndices: data.word_indices,
        unitId: data.unit_id,
        unitName: data.unit_name, 
        difficulty: data.difficulty,
        wordCount: data.word_count,
        targetFriendId: data.target_friend_id,
        opponentId: data.opponent_id,
        opponentName: data.opponent_name,
        opponentScore: data.opponent_score,
        status: data.status,
        winnerId: data.winner_id,
        createdAt: new Date(data.created_at).getTime()
    };
};

// --- LEADERBOARD ---

export const getLeaderboard = async (grade: string, mode: string): Promise<LeaderboardEntry[]> => {
    try {
        const { data, error } = await supabase.from('profiles').select('id, username, grade, avatar, stats, inventory, theme');
        
        if (error) throw error;

        let entries = (data || []).map((user: any) => {
            const stats = user.stats || {};
            const weekly = stats.weekly || {};
            let value = 0;
            
            if (mode === 'xp') value = stats.xp || 0;
            else if (mode === 'quiz') value = weekly.quizCorrect || 0;
            else if (mode === 'flashcard') value = weekly.cardsViewed || 0;
            else if (mode === 'matching') value = weekly.matchingBestTime || 0;
            else if (mode === 'maze') value = weekly.mazeHighScore || 0;
            else if (mode === 'wordSearch') value = weekly.wordSearchHighScore || 0;
            else if (mode === 'duel') value = weekly.duelPoints || 0;

            return {
                uid: user.id,
                name: user.username,
                grade: user.grade,
                xp: stats.xp || 0,
                level: stats.level || 1,
                streak: stats.streak || 0,
                avatar: user.avatar,
                frame: user.inventory?.equipped_frame || 'frame_none',
                background: user.inventory?.equipped_background || 'bg_default',
                theme: user.theme || 'dark',
                value: value,
                duelWins: weekly.duelWins || 0,
                duelLosses: weekly.duelLosses || 0,
                duelDraws: weekly.duelDraws || 0,
                duelPoints: weekly.duelPoints || 0
            } as LeaderboardEntry;
        });

        entries.sort((a, b) => b.value - a.value);
        return entries.slice(0, 50);
    } catch (e) {
        console.error("Leaderboard fetch error:", e);
        return [];
    }
};

// --- FRIENDS ---

export const getFriends = async (userId: string): Promise<LeaderboardEntry[]> => {
    try {
        const { data, error } = await supabase
            .from('friends')
            .select('friend_id, profiles!friend_id(id, username, grade, avatar, stats, inventory, theme)')
            .eq('user_id', userId);

        if (error) throw error;

        return (data || []).map((f: any) => {
            const p = f.profiles;
            return {
                uid: p.id,
                name: p.username,
                grade: p.grade,
                xp: p.stats?.xp || 0,
                level: p.stats?.level || 1,
                streak: p.stats?.streak || 0,
                avatar: p.avatar,
                frame: p.inventory?.equipped_frame || 'frame_none',
                background: p.inventory?.equipped_background || 'bg_default',
                theme: p.theme || 'dark',
                value: p.stats?.xp || 0
            } as LeaderboardEntry;
        });
    } catch (e) {
        console.error("Error fetching friends:", e);
        return [];
    }
};

export const addFriend = async (userId: string, friendCode: string) => {
    const { data: friend, error: searchError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('friend_code', friendCode)
        .single();

    if (searchError || !friend) throw new Error("Kullanıcı bulunamadı.");
    if (friend.id === userId) throw new Error("Kendini ekleyemezsin.");

    const { data: existing } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', userId)
        .eq('friend_id', friend.id)
        .single();

    if (existing) throw new Error("Zaten arkadaşsınız.");

    const { error: insertError } = await supabase
        .from('friends')
        .insert([{ user_id: userId, friend_id: friend.id }]);

    if (insertError) throw insertError;
    return friend.username;
};

// --- PUBLIC PROFILE ---

export const getPublicUserProfile = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, grade, avatar, stats, inventory, theme')
            .eq('id', userId)
            .single();

        if (error || !data) return null;

        const stats = data.stats || {};
        const inventory = data.inventory || {};
        const weekly = stats.weekly || {};

        return {
            uid: data.id,
            name: data.username,
            grade: data.grade,
            avatar: data.avatar,
            level: stats.level || 1,
            xp: stats.xp || 0,
            streak: stats.streak || 0,
            totalTimeSpent: stats.totalTimeSpent || 0,
            frame: inventory.equipped_frame || 'frame_none',
            background: inventory.equipped_background || 'bg_default',
            theme: data.theme || 'dark',
            badges: stats.badges || [],
            duelWins: weekly.duelWins || stats.duelWins || 0,
            duelLosses: weekly.duelLosses || stats.duelLosses || 0,
            duelDraws: weekly.duelDraws || stats.duelDraws || 0,
            duelPoints: weekly.duelPoints || stats.duelPoints || 0,
            quizCorrect: stats.quizCorrect || 0,
            quizWrong: stats.quizWrong || 0,
            matchingBestTime: weekly.matchingBestTime || stats.matchingAllTimeBest || 0,
            mazeHighScore: weekly.mazeHighScore || stats.mazeAllTimeBest || 0,
            wordSearchHighScore: weekly.wordSearchHighScore || stats.wordSearchAllTimeBest || 0
        };
    } catch (e) {
        console.error("Error fetching public profile:", e);
        return null;
    }
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
    const { error } = await supabase.rpc('join_tournament_secure', { p_tournament_id: tournamentId });
    if (error) throw new Error(error.message);
};

export const checkTournamentTimeouts = async (tournamentId: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('process_tournament_round', { p_tournament_id: tournamentId });
    if (error) throw error;
    return data && (data as string).includes("oluşturuldu");
};

export const submitTournamentScore = async (tournamentId: string, matchId: string, score: number, timeTaken: number) => {
    const { error } = await supabase.rpc('update_match_score_secure', {
        p_tournament_id: tournamentId,
        p_match_id: matchId,
        p_score: score,
        p_time: timeTaken
    });
    if (error) throw error;
};

export const forfeitTournamentMatch = async (tournamentId: string, matchId: string) => {
    // This is more complex and would need a dedicated RPC function. For now, we submit a score of -1.
    await submitTournamentScore(tournamentId, matchId, -1, 9999);
};