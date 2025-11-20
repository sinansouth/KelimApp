import React, { useState, useEffect } from 'react';
import { Save, BarChart3, Clock, Brain, BookOpen, CheckCircle, XCircle, Edit2, Award, Bookmark } from 'lucide-react';
import { getUserProfile, getUserStats, saveUserProfile, UserProfile as IUserProfile, UserStats, getMemorizedSet, getTotalVocabularyCount } from '../services/userService';
import { VOCABULARY } from '../data/vocabulary';
import { UNIT_DATA, GradeLevel } from './TopicSelector';

interface ProfileProps {
  onBack: () => void;
}

const AVATARS = [
  '🦊', '🐼', '🐸', '🦁', '🐯', '🐨', '🐵', '🦄', 
  '🐮', '🐷', '🐹', '🐰', '🐙', '🐬', '🦖', '🦕',
  '🤖', '👻', '👽', '👾', '🦸', '🧚', '🧙', '🧝',
  '⚽', '🏀', '🎱', '🎮', '🚀', '🎸', '🎨', '📚'
];

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const [profile, setProfile] = useState<IUserProfile>({ name: '', age: '', grade: '', avatar: '🦊' });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [memorizedCount, setMemorizedCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);
    setStats(getUserStats());
    
    const rawMemorizedSet = getMemorizedSet();
    let rawBookmarksSet = new Set<string>();
    try {
      const storedBookmarks = localStorage.getItem('lgs_bookmarks');
      if (storedBookmarks) {
         rawBookmarksSet = new Set(JSON.parse(storedBookmarks));
      }
    } catch (e) {
      // ignore
    }

    // Calculate Stats based on Grade if selected
    let relevantWordSet = new Set<string>();
    
    // If user has a valid grade selected (4-8), filter words.
    if (userProfile.grade && ['4','5','6','7','8'].includes(userProfile.grade)) {
        const grade = userProfile.grade as GradeLevel;
        const units = UNIT_DATA[grade];
        if (units) {
          units.forEach(u => {
             // Skip "ALL IN ONE" units to avoid double counting if they had their own vocabulary list, 
             // but in our implementation they don't have a separate list in VOCABULARY, so we skip ID check or check existence.
             // We only iterate standard units that have data in VOCABULARY.
             if (VOCABULARY[u.id]) {
                VOCABULARY[u.id].forEach(w => relevantWordSet.add(w.english));
             }
          });
        }
    } else {
        // If no grade is selected, count EVERYTHING in the app
        Object.values(VOCABULARY).forEach(list => {
           list.forEach(w => relevantWordSet.add(w.english));
        });
    }

    const filteredMemorizedCount = [...rawMemorizedSet].filter(w => relevantWordSet.has(w)).length;
    const filteredBookmarksCount = [...rawBookmarksSet].filter(w => relevantWordSet.has(w)).length;

    setMemorizedCount(filteredMemorizedCount);
    setBookmarksCount(filteredBookmarksCount);
    setTotalWords(relevantWordSet.size);

  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserProfile(profile);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    setIsEditing(false);
    
    // Refresh stats immediately to reflect grade change
    const rawMemorizedSet = getMemorizedSet();
    let rawBookmarksSet = new Set<string>();
    try {
      const storedBookmarks = localStorage.getItem('lgs_bookmarks');
      if (storedBookmarks) {
         rawBookmarksSet = new Set(JSON.parse(storedBookmarks));
      }
    } catch (e) {
      // ignore
    }

    let relevantWordSet = new Set<string>();
    if (profile.grade && ['4','5','6','7','8'].includes(profile.grade)) {
        const grade = profile.grade as GradeLevel;
        const units = UNIT_DATA[grade];
        if (units) {
          units.forEach(u => {
             if (VOCABULARY[u.id]) {
                VOCABULARY[u.id].forEach(w => relevantWordSet.add(w.english));
             }
          });
        }
    } else {
        Object.values(VOCABULARY).forEach(list => {
           list.forEach(w => relevantWordSet.add(w.english));
        });
    }
    
    setMemorizedCount([...rawMemorizedSet].filter(w => relevantWordSet.has(w)).length);
    setBookmarksCount([...rawBookmarksSet].filter(w => relevantWordSet.has(w)).length);
    setTotalWords(relevantWordSet.size);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const totalQuizAnswers = (stats?.quizCorrect || 0) + (stats?.quizWrong || 0);
  const successRate = totalQuizAnswers > 0 
    ? Math.round(((stats?.quizCorrect || 0) / totalQuizAnswers) * 100) 
    : 0;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Header Background */}
        <div className="h-36 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 group">
            <div className="w-28 h-28 bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-md transition-colors">
               <div className="w-full h-full bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-5xl shadow-inner relative overflow-hidden">
                 {profile.avatar}
                 {!isEditing && (
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-full" onClick={() => setIsEditing(true)}>
                      <Edit2 className="text-white drop-shadow-md" size={24} />
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-6 sm:px-8 text-center">
          {/* Profile Info Form */}
          <form onSubmit={handleSave} className="mb-10">
             {!isEditing ? (
               <div className="flex flex-col items-center">
                 <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">
                   {profile.name || 'İsimsiz Öğrenci'}
                 </h2>
                 <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-6 font-medium">
                   <span>{profile.age ? `${profile.age} Yaş` : '- Yaş'}</span>
                   <span>•</span>
                   <span>{profile.grade ? `${profile.grade}. Sınıf` : '-. Sınıf'}</span>
                 </div>
                 <button 
                   type="button"
                   onClick={() => setIsEditing(true)}
                   className="px-6 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                 >
                   Profili Düzenle
                 </button>
               </div>
             ) : (
               <div className="max-w-md mx-auto space-y-6 animate-in fade-in">
                 
                 {/* Avatar Selection */}
                 <div>
                    <label className="block text-xs font-bold text-slate-400 text-center mb-3 uppercase">Avatarını Seç</label>
                    <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                      {AVATARS.map(av => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setProfile(prev => ({ ...prev, avatar: av }))}
                          className={`text-2xl p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all ${profile.avatar === av ? 'bg-white dark:bg-slate-800 shadow ring-2 ring-indigo-500' : ''}`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                 </div>

                 <div className="space-y-3 text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase ml-1">İsim Soyisim</label>
                      <input 
                        type="text" 
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        placeholder="Adın Soyadın"
                        className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase ml-1">Yaş</label>
                        <input 
                          type="number" 
                          name="age"
                          value={profile.age}
                          onChange={handleChange}
                          placeholder="Yaş"
                          className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase ml-1">Sınıf</label>
                        <select 
                          name="grade"
                          value={profile.grade}
                          onChange={handleChange}
                          className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                        >
                          <option value="">Seç</option>
                          <option value="4">4. Sınıf</option>
                          <option value="5">5. Sınıf</option>
                          <option value="6">6. Sınıf</option>
                          <option value="7">7. Sınıf</option>
                          <option value="8">8. Sınıf</option>
                        </select>
                      </div>
                    </div>
                 </div>

                 <div className="flex gap-3 pt-2">
                   <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      İptal
                    </button>
                   <button 
                    type="submit"
                    className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                  >
                    <Save size={18} /> Kaydet
                  </button>
                 </div>
               </div>
             )}

             {showSaved && (
               <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl text-sm font-bold animate-in zoom-in">
                 Profil başarıyla güncellendi!
               </div>
             )}
          </form>

          {/* Statistics Section */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <BarChart3 className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">İstatistikler</h3>
            </div>

            {/* Grade Info Badge (If Grade Selected) */}
            {profile.grade ? (
               <div className="mb-6 flex justify-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    <span>{profile.grade}. Sınıf İçeriği Gösteriliyor</span>
                 </div>
               </div>
            ) : (
              <div className="mb-6 flex justify-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    <span>Tüm Sınıflar Gösteriliyor</span>
                 </div>
               </div>
            )}

            {/* Big Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
               {/* Total Memorized Card */}
               <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 transition-colors flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10 text-left">
                    <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">
                      {memorizedCount} <span className="text-sm text-slate-400 dark:text-slate-500 font-bold">/ {totalWords}</span>
                    </div>
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Ezberlenen Kelime</div>
                  </div>
                  <div className="relative z-10 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <div className="absolute bottom-0 left-0 h-1.5 bg-indigo-200 dark:bg-indigo-800 w-full">
                     <div 
                       className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-1000"
                       style={{ width: `${(memorizedCount / (totalWords || 1)) * 100}%` }}
                     ></div>
                  </div>
               </div>

               {/* Difficult Words (Bookmarks) Card */}
               <div className="p-5 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800/50 transition-colors flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10 text-left">
                    <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">
                      {bookmarksCount} <span className="text-sm text-slate-400 dark:text-slate-500 font-bold">/ {totalWords}</span>
                    </div>
                    <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Zorlandığım (Favori)</div>
                  </div>
                  <div className="relative z-10 w-10 h-10 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
                    <Bookmark size={20} />
                  </div>
                  <div className="absolute bottom-0 left-0 h-1.5 bg-orange-200 dark:bg-orange-800 w-full">
                     <div 
                       className="h-full bg-orange-500 dark:bg-orange-400 transition-all duration-1000"
                       style={{ width: `${(bookmarksCount / (totalWords || 1)) * 100}%` }}
                     ></div>
                  </div>
               </div>
            </div>

            {/* Smaller Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {/* Stat 1: Cards Viewed */}
               <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full mb-3 mx-auto">
                    <BookOpen size={20} />
                  </div>
                  <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">{stats?.flashcardsViewed || 0}</div>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Bugün Bakılan</div>
               </div>

               {/* Stat 2: Quiz Success */}
               <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full mb-3 mx-auto">
                    <Brain size={20} />
                  </div>
                  <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">%{successRate}</div>
                  <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Quiz Başarısı</div>
               </div>

               {/* Stat 3: Questions */}
               <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/50 transition-colors">
                  <div className="flex flex-col gap-2 items-center justify-center h-full">
                     <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold">
                        <CheckCircle size={16} /> 
                        <span>{stats?.quizCorrect || 0} Doğru</span>
                     </div>
                     <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                        <XCircle size={16} /> 
                        <span>{stats?.quizWrong || 0} Yanlış</span>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="mt-8 text-slate-400 dark:text-slate-500 text-xs flex items-center justify-center gap-1">
              <Clock size={12} /> Çalışma istatistikleri her 24 saatte bir otomatik sıfırlanır. (Ezberlenenler hariç)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;