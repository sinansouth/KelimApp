
import { createClient } from '@supabase/supabase-js';
import { WordCard, Announcement } from '../types';

// OFFLINE MODE: Supabase client is mocked to avoid external calls.
// We keep the imports to avoid breaking other files that might depend on types from @supabase/supabase-js.

export const supabase: any = {
    auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signInWithPassword: async () => ({ data: { user: null }, error: { message: "Offline Mode: Giriş devre dışı." } }),
        signUp: async () => ({ data: { user: null }, error: { message: "Offline Mode: Kayıt devre dışı." } }),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ error: null }),
        updateUser: async () => ({ error: null }),
        signInWithOAuth: async () => ({ error: null }),
        get currentUser() {
            return (async () => null)();
        }
    },
    from: () => ({
        select: () => ({
            eq: () => ({
                single: async () => ({ data: null, error: null }),
                order: () => ({ limit: async () => ({ data: [], error: null }) })
            }),
            order: () => ({ limit: async () => ({ data: [], error: null }) }),
            ilike: () => ({ limit: async () => ({ data: [], error: null }) }),
            delete: () => ({ eq: async () => ({ error: null }) }),
        }),
        upsert: async () => ({ data: null, error: null }),
        update: () => ({ eq: async () => ({ error: null }) }),
        insert: async () => ({ error: null }),
        delete: () => ({ eq: async () => ({ error: null }) }),
    }),
    rpc: async () => ({ data: null, error: null })
};

// --- HELPER TYPES & UTILS ---

export interface DbResult<T> {
    data: T | null;
    error: any;
}

export interface LeaderboardEntry {
    uid: string;
    name: string;
    avatar: string;
    frame: string;
    background: string;
    level: number;
    xp: number;
    grade: string;
    value: number;
    streak?: number;
    theme: string;
    duelWins?: number;
    duelDraws?: number;
    duelLosses?: number;
}

export async function withTimeout<T>(promise: any, ms: number = 30000): Promise<T | null> {
    return promise;
}

export async function getCurrentUser() {
    return null;
}

export const getAuthInstance = () => {
    return supabase.auth;
};

// --- MOCKED SERVICES ---

export const getUnitData = async (...args: any[]): Promise<WordCard[] | null> => null;
export const saveUnitData = async (...args: any[]) => { };
export const updateUnitWords = async (...args: any[]) => { };

export const loginUser = async (...args: any[]) => {
    throw new Error("Offline Mode: Giriş devre dışı.");
};

export const signInWithGoogle = async (...args: any[]) => {
    throw new Error("Offline Mode: Google ile Giriş devre dışı.");
};

export const registerUser = async (...args: any[]) => {
    throw new Error("Offline Mode: Kayıt devre dışı.");
};

export const logoutUser = async (...args: any[]) => {
    window.location.reload();
};

export const resetUserPassword = async (...args: any[]) => { };
export const updateUserEmail = async (...args: any[]) => { };
export const deleteAccount = async (...args: any[]) => {
    window.location.reload();
};

export const syncLocalToCloud = async (...args: any[]) => { };
export const getUserData = async (...args: any[]) => null;
export const checkUsernameExists = async (...args: any[]) => false;
export const updateCloudUsername = async (...args: any[]) => { };

// Add other missing exports as no-ops
export const getGlobalAnnouncements = async (...args: any[]) => [];
export const getGlobalSettings = async (...args: any[]) => ({
    maintenance_mode: { isActive: false, message: '' },
    version_check: { latestVersion: '1.0.0', minVersion: '1.0.0', forceUpdate: false }
});
export const getOpenChallenges = async (...args: any[]) => [];
export const createChallenge = async (...args: any[]) => null;
export const joinChallenge = async (...args: any[]) => null;
export const completeChallenge = async (...args: any[]) => { };
export const getSystemContent = async (...args: any[]) => null;
export const upsertSystemContent = async (...args: any[]) => { };
export const getAllGrammar = async (...args: any[]) => [];
export const upsertGrammar = async (...args: any[]) => { };
export const getSystemStats = async (...args: any[]) => ({ totalUsers: 0, activeTournaments: 0, totalChallenges: 0, totalFeedback: 0 });
export const getRecentUsers = async (...args: any[]) => [];
export const updateUserRole = async (...args: any[]) => { };
export const searchUser = async (...args: any[]) => null;
export const adminGiveXP = async (...args: any[]) => { };
export const toggleAdminStatus = async (...args: any[]) => { };
export const sendFeedback = async (...args: any[]) => { };
export const getAllFeedback = async (...args: any[]) => [];
export const deleteFeedback = async (...args: any[]) => { };
export const submitTournamentScore = async (...args: any[]) => { };
export const forfeitTournamentMatch = async (...args: any[]) => { };
export const getLeaderboard = async (...args: any[]) => [];
export const getPublicUserProfile = async (...args: any[]) => null;
export const getChallenge = async (...args: any[]) => null;
export const getChallengeHistory = async (...args: any[]) => [];
export const getTournaments = async (...args: any[]) => [];
export const joinTournament = async (...args: any[]) => { };
export const checkTournamentTimeouts = async (...args: any[]) => false;
export const getFriends = async (...args: any[]) => [];
export const addFriend = async (...args: any[]) => { };
export const createTournament = async (...args: any[]) => { };
export const updateTournament = async (...args: any[]) => { };
export const deleteTournament = async (...args: any[]) => { };
export const updateTournamentStatus = async (...args: any[]) => { };
export const createGlobalAnnouncement = async (...args: any[]) => { };
export const deleteAnnouncement = async (...args: any[]) => { };
export const updateAnnouncement = async (...args: any[]) => { };
export const updateGlobalSettings = async (...args: any[]) => { };