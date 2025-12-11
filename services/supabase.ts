
import { createClient } from '@supabase/supabase-js';
import { Challenge, Announcement, Tournament, WordCard } from '../types';

// SUPABASE CONFIG - Using import.meta.env for Vite compatibility
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || "https://idjeqbmjfcoszbulnmzn.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkamVxYm1qZmNvc3pidWxubXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODE3OTIsImV4cCI6MjA4MDc1Nzc5Mn0.PaP0pDCwSJe6hFOlyZBMWpUPlHCh6wxhsZhtLP1Ba2g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Utility to enforce timeouts on promises
export const withTimeout = <T>(promise: PromiseLike<T>, ms: number = 15000): Promise<T | null> => {
    return Promise.race([
        promise,
        new Promise<null>((resolve) => 
            setTimeout(() => {
                resolve(null);
            }, ms)
        )
    ]) as Promise<T | null>;
};

// --- GENERIC FETCHERS (No circular deps) ---

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

export const getUnitData = async (unitId: string): Promise<WordCard[] | null> => {
    try {
        if (navigator.onLine) {
            const query = supabase
                .from('units')
                .select('words')
                .eq('id', unitId)
                .single();

            const result = await withTimeout(query, 15000);

            if (!result || (result as any).error) return null;
            return (result as any).data?.words as WordCard[];
        }
        return null;
    } catch (e) {
        console.error("Error fetching unit data:", e);
        return null;
    }
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

// ... Keep other generic fetchers that DON'T use userService ...
// We move specific user logic to userService.ts to avoid circular dependency

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

// Admin stuff that doesn't rely on userService
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

const transformProfileToUser = (data: any) => {
    return {
        uid: data.id,
        email: data.email,
        profile: {
            name: data.username,
            grade: data.grade,
            avatar: data.avatar,
            role: data.role || 'user', 
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

// ... other exports ...
// Re-export specific functions needed by components that don't depend on user state
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

export const checkTournamentTimeouts = async (tournamentId: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('process_tournament_round', { p_tournament_id: tournamentId });
    if (error) throw error;
    return data && (data as string).includes("oluşturuldu");
};

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

export const updateAnnouncement = async (id: string, title: string, content: string) => {
    const { error } = await supabase.from('announcements').update({ title, content }).eq('id', id);
    if (error) throw error;
};

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

export const adminGiveXP = async (uid: string, amount: number) => {
    const { data: profile } = await supabase.from('profiles').select('stats').eq('id', uid).single();

    if (profile && profile.stats) {
        const newStats = { ...profile.stats, xp: (profile.stats.xp || 0) + amount };
        await supabase.from('profiles').update({ stats: newStats }).eq('id', uid);
    }
};

export const updateUserRole = async (uid: string, role: 'admin' | 'user' | 'banned') => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', uid);
    if (error) throw error;
};

export const updateTournamentStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('tournaments').update({ status }).eq('id', id);
    if(error) throw error;
};

export const joinTournament = async (tournamentId: string) => {
    const { error } = await supabase.rpc('join_tournament_secure', { p_tournament_id: tournamentId });
    if (error) throw new Error(error.message);
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
    await submitTournamentScore(tournamentId, matchId, -1, 9999);
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

export const getAuthInstance = () => {
    return {
        currentUser: supabase.auth.getUser().then(({ data }) => data.user),
    };
};

// ... other necessary exports
export const updateCumulativeStats = async (action_type: 'quiz_correct' | 'quiz_wrong' | 'card_view', amount: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    try {
        await supabase.rpc('update_cumulative_stats', { p_action_type: action_type, p_amount: amount });
    } catch (e) {
        console.error(`RPC call failed`, e);
    }
};

export const updateGameScore = async (game_type: 'matching' | 'maze' | 'wordSearch', new_score: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    try {
        await supabase.rpc('update_game_score', { p_game_type: game_type, p_new_score: new_score });
    } catch (e) {
        console.error(`RPC call failed`, e);
    }
};
