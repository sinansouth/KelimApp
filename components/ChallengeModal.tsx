
import React, { useState, useEffect } from 'react';
import { X, Swords, Copy, ArrowRight, Hash, GraduationCap, BookOpen, Settings, Check, Globe, Lock, Users, UserPlus, Search, User, Clock, History, Trophy, PlayCircle, RefreshCw, Calendar, AlertCircle, WifiOff } from 'lucide-react';
import { playSound } from '../services/soundService';
import { getChallenge, getOpenChallenges, getFriends, getAuthInstance, getPastChallenges, getTournaments, joinTournament, checkTournamentTimeouts } from '../services/supabase';
import { WordCard, GradeLevel, UnitDef, QuizDifficulty, Challenge, Tournament, TournamentMatch } from '../types';
import { UNIT_ASSETS } from '../data/assets';
import TournamentTree from './TournamentTree';
import { getWordsForUnit } from '../services/contentService';

interface ChallengeModalProps {
  onClose: () => void;
  onCreateChallenge: (config: { 
      grade: GradeLevel, 
      unit: UnitDef, 
      difficulty: QuizDifficulty, 
      count: number,
      type: 'public' | 'private' | 'friend',
      targetFriendId?: string
  }) => void; 
  onJoinChallenge: (challengeData: any, words: WordCard[]) => void; 
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ onClose, onCreateChallenge, onJoinChallenge }) => {
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'history' | 'tournaments' | 'tournament_view'>('menu');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [challengeList, setChallengeList] = useState<Challenge[]>([]);
  const [historyList, setHistoryList] = useState<Challenge[]>([]);
  const [tournamentList, setTournamentList] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Creation States
  const [step, setStep] = useState<number>(1);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnitDef | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>('normal');
  const [selectedCount, setSelectedCount] = useState<number>(10);
  
  // New Creation Options
  const [challengeType, setChallengeType] = useState<'public' | 'friend' | 'private'>('public');
  const [friends, setFriends] = useState<{uid: string, name: string}[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  
  const [myUid, setMyUid] = useState<string>('');

  const grades: GradeLevel[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'A1', 'A2', 'B1', 'B2', 'C1'];
  
  const difficultyOptions: { id: QuizDifficulty, label: string, color: string }[] = [
    { id: 'relaxed', label: 'Rahat (30s)', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: 'easy', label: 'Kolay (20s)', color: 'bg-green-100 text-green-700 border-green-300' },
    { id: 'normal', label: 'Normal (15s)', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { id: 'hard', label: 'Zor (10s)', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { id: 'impossible', label: 'İmkansız (5s)', color: 'bg-red-100 text-red-700 border-red-300' },
  ];

  const countOptions = [10, 25, 50];

  useEffect(() => {
      const auth = getAuthInstance();
      auth.currentUser.then(user => {
          if(user) setMyUid(user.id);
      });
  }, []);

  useEffect(() => {
      if (isOffline) return;

      if (mode === 'join') fetchOpenChallenges();
      if (mode === 'history') fetchHistory();
      if (mode === 'tournaments') fetchTournaments();
      
      if (mode === 'create' && step === 3) {
          if (myUid) {
              getFriends(myUid).then(list => {
                  setFriends(list.map(f => ({ uid: f.uid, name: f.name })));
              });
          }
      }
  }, [mode, step, myUid, isOffline]);

  const fetchOpenChallenges = async () => {
      setLoading(true);
      if (myUid) {
          try {
              const list = await getOpenChallenges(myUid);
              setChallengeList(list);
          } catch (e) {
              console.error(e);
          }
      }
      setLoading(false);
  };

  const fetchHistory = async () => {
      setLoading(true);
      if (myUid) {
          try {
              const list = await getPastChallenges(myUid);
              setHistoryList(list);
          } catch (e) {
              console.error(e);
          }
      }
      setLoading(false);
  }

  const fetchTournaments = async () => {
      setLoading(true);
      try {
          const list = await getTournaments();
          setTournamentList(list);
          
          list.forEach(t => {
              if (t.status === 'active') {
                  checkTournamentTimeouts(t.id).catch(console.error);
              }
          });
      } catch (e) { console.error(e); }
      setLoading(false);
  }

  const handleJoinByCode = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!joinCode.trim()) return;
      joinSpecificChallenge(joinCode.trim());
  };

  const joinSpecificChallenge = async (cId: string) => {
      if (!navigator.onLine) {
          alert("İnternet bağlantısı yok.");
          return;
      }
      setLoading(true);
      setError('');

      try {
          const challenge = await getChallenge(cId);
          if (!challenge) {
              setError("Böyle bir düello bulunamadı.");
              playSound('wrong');
          } else if (challenge.status === 'completed') {
              setError("Bu düello zaten tamamlanmış.");
              playSound('wrong');
          } else {
              let challengeWords: WordCard[] = [];
              if (challenge.unitId && challenge.wordIndices) {
                   let pool: WordCard[] = await getWordsForUnit(challenge.unitId);
                   
                   challengeWords = challenge.wordIndices.map(i => pool[i]).filter(Boolean);
              }
              
              if (challengeWords.length > 0) {
                  onJoinChallenge(challenge, challengeWords);
              } else {
                  setError("Düello verisi yüklenemedi.");
              }
          }
      } catch (err) {
          console.error(err);
          setError("Bir hata oluştu.");
      } finally {
          setLoading(false);
      }
  };

  const handleJoinTournament = async (tId: string) => {
      setLoading(true);
      try {
          await joinTournament(tId);
          fetchTournaments();
          alert("Turnuvaya kaydoldun!");
      } catch (e: any) {
          alert(e.message || "Hata");
      } finally {
          setLoading(false);
      }
  };

  const handlePlayTournamentMatch = async (match: TournamentMatch) => {
      if (!selectedTournament) return;
      
      const unitId = selectedTournament.unitId;
      let pool: WordCard[] = await getWordsForUnit(unitId);

      const words = pool.sort(() => 0.5 - Math.random()).slice(0, selectedTournament.config.wordCount);
      
      onJoinChallenge({ 
          matchId: match.id, 
          tournamentId: selectedTournament.id, 
          difficulty: selectedTournament.config.difficulty,
          tournamentName: selectedTournament.title
      }, words);
  };

  const handleCreateSubmit = async () => {
      if (!navigator.onLine) {
          alert("İnternet bağlantısı yok.");
          return;
      }
      if (selectedGrade && selectedUnit) {
          onCreateChallenge({
              grade: selectedGrade,
              unit: selectedUnit,
              difficulty: selectedDifficulty,
              count: selectedCount,
              type: challengeType,
              targetFriendId: selectedFriendId
          });
      }
  };
  
  const formatTime = (timestamp: number) => {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString();
  }

  if (isOffline) {
      return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col p-8 text-center">
                <WifiOff size={48} className="text-slate-400 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">İnternet Bağlantısı Yok</h3>
                <p className="text-sm text-slate-500 mb-6">Düello ve turnuva modlarını kullanmak için lütfen internete bağlanın.</p>
                <button onClick={onClose} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Tamam</button>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        <div className="bg-orange-500 p-5 text-center relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={24} />
            </button>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-500 mx-auto mb-2 shadow-lg">
                {mode === 'tournaments' || mode === 'tournament_view' ? <Trophy size={24} /> : <Swords size={24} />}
            </div>
            <h2 className="text-xl font-black text-white mb-0.5">
                {mode === 'tournaments' || mode === 'tournament_view' ? 'Turnuvalar' : 'Meydan Oku'}
            </h2>
            <p className="text-orange-100 text-xs font-medium">
                {mode === 'tournaments' || mode === 'tournament_view' ? 'Şampiyon kim olacak?' : 'Arkadaşınla kozlarını paylaş!'}
            </p>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {mode === 'menu' ? (
                <div className="space-y-3">
                    <button 
                        onClick={() => setMode('create')}
                        className="w-full py-4 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-between group"
                    >
                        <div className="text-left">
                            <div className="text-base font-black">Düello Oluştur</div>
                            <div className="text-xs opacity-80 font-medium">Kendi kurallarınla yarış</div>
                        </div>
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </button>

                    <button 
                        onClick={() => setMode('join')}
                        className="w-full py-4 px-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 text-slate-700 dark:text-white rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-between group"
                    >
                        <div className="text-left">
                            <div className="text-base font-black">Düelloya Katıl</div>
                            <div className="text-xs text-slate-500 font-medium">Açık davetleri gör</div>
                        </div>
                        <Hash size={20} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </button>

                    <button 
                        onClick={() => setMode('tournaments')}
                        className="w-full py-4 px-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-2xl font-bold shadow-md transition-all active:scale-95 flex items-center justify-between group"
                    >
                        <div className="text-left">
                            <div className="text-base font-black">Turnuvalar</div>
                            <div className="text-xs opacity-90 font-medium">Büyük ödül için yarış</div>
                        </div>
                        <Trophy size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                    
                    <button 
                        onClick={() => setMode('history')}
                        className="w-full py-3 px-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 group mt-2"
                    >
                        <History size={16} /> Geçmiş Maçlar
                    </button>
                </div>
            ) : mode === 'join' ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 dark:text-white">Aktif Düellolar</h3>
                        <button onClick={fetchOpenChallenges} className="text-xs text-indigo-500 font-bold hover:underline">Yenile</button>
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Yükleniyor...</div>
                    ) : challengeList.length > 0 ? (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                            {challengeList.map(c => (
                                <button 
                                    key={c.id}
                                    onClick={() => joinSpecificChallenge(c.id)}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500 bg-slate-50 dark:bg-slate-800/50 text-left transition-all group"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm text-slate-800 dark:text-white">{c.creatorName}</span>
                                        <span className="text-xs font-black text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{c.creatorScore}%</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mb-1 truncate">
                                        {c.grade === 'GENERAL' ? 'Genel' : `${c.grade}. Sınıf`} • {c.unitName}
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                         <span className="flex items-center gap-1">
                                             {c.type === 'friend' ? <User size={10} /> : <Globe size={10} />}
                                             {c.type === 'friend' ? 'Sana Özel' : 'Herkese Açık'}
                                         </span>
                                         <span className="flex items-center gap-1">
                                             <Clock size={10} />
                                             {formatTime(c.createdAt)}
                                         </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                            Şu an açık düello yok.
                        </div>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2 text-center">Veya Kod ile Katıl</p>
                        <form onSubmit={handleJoinByCode} className="flex gap-2">
                            <input 
                                type="text" 
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="KOD"
                                className="flex-1 p-3 text-center font-bold uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-orange-500"
                            />
                            <button 
                                type="submit" 
                                disabled={!joinCode}
                                className="px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold disabled:opacity-50"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </form>
                        {error && <p className="text-xs text-red-500 font-bold mt-2 text-center">{error}</p>}
                    </div>

                    <button onClick={() => setMode('menu')} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl">Geri</button>
                </div>
            ) : mode === 'tournaments' ? (
                 <div className="space-y-4">
                     {loading ? <div className="text-center py-8 text-slate-400">Yükleniyor...</div> : tournamentList.length > 0 ? (
                         tournamentList.map(t => {
                             const isRegistered = t.participants.includes(myUid || '');
                             const now = Date.now();
                             const regStart = t.registrationStartDate || 0;
                             
                             const isNotStartedYet = t.status === 'registration' && now < regStart;
                             const isRegistrationOpen = t.status === 'registration' && !isNotStartedYet && now <= t.registrationEndDate;

                             return (
                             <div key={t.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                                 <div className="flex justify-between items-start mb-2">
                                     <div>
                                         <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide mb-1">
                                             {t.grade === 'GENERAL' ? 'Genel' : `${t.grade}. Sınıf`} • {t.unitName}
                                         </div>
                                         <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t.title}</h3>
                                     </div>
                                     <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                                         t.status === 'registration' ? (isNotStartedYet ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-green-600') : 
                                         t.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                     }`}>
                                         {t.status === 'registration' ? (isNotStartedYet ? 'Bekleniyor' : 'Kayıt Açık') : t.status === 'active' ? 'Devam Ediyor' : 'Tamamlandı'}
                                     </span>
                                 </div>
                                 
                                 <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mb-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                     <div>
                                         <span className="block font-bold text-slate-400">Kayıt:</span>
                                         {isNotStartedYet 
                                             ? `${formatDate(regStart)}'de Başlıyor`
                                             : `Bitiş: ${formatDate(t.registrationEndDate)}`
                                         }
                                     </div>
                                     <div>
                                         <span className="block font-bold text-slate-400">Maçlar:</span>
                                         {formatDate(t.startDate)}
                                     </div>
                                 </div>

                                 <div className="flex gap-4 text-xs text-slate-500 mb-4">
                                     <span className="flex items-center gap-1"><Users size={14} /> {t.participants.length}/{t.maxParticipants}</span>
                                     {t.minLevel > 1 && <span className="flex items-center gap-1"><Trophy size={14} /> Min Lvl {t.minLevel}</span>}
                                 </div>

                                 {t.status === 'registration' ? (
                                     !isRegistered ? (
                                        <button 
                                            onClick={() => handleJoinTournament(t.id)}
                                            disabled={!isRegistrationOpen}
                                            className={`w-full py-2 rounded-xl font-bold text-sm transition-colors ${!isRegistrationOpen ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                        >
                                            {isNotStartedYet ? `Kayıt ${formatDate(regStart)}'de Başlıyor` : 'Turnuvaya Katıl'}
                                        </button>
                                     ) : (
                                         <div className="w-full py-2 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2">
                                             <Check size={16} /> Kayıtlısın
                                         </div>
                                     )
                                 ) : (
                                     <button 
                                        onClick={() => { setSelectedTournament(t); setMode('tournament_view'); }}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors"
                                     >
                                         Turnuvayı Görüntüle
                                     </button>
                                 )}
                             </div>
                         )})
                     ) : (
                         <div className="text-center py-10 text-slate-400">Aktif turnuva bulunamadı.</div>
                     )}
                     <button onClick={() => setMode('menu')} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl mt-2">Geri</button>
                 </div>
            ) : mode === 'tournament_view' && selectedTournament ? (
                <TournamentTree 
                    tournament={selectedTournament} 
                    currentUserId={myUid || ''} 
                    onPlayMatch={handlePlayTournamentMatch}
                    onBack={() => setMode('tournaments')}
                />
            ) : mode === 'history' ? (
                 <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-800 dark:text-white">Geçmiş Düellolar</h3>
                        <button onClick={fetchHistory} className="text-xs text-indigo-500 font-bold hover:underline">Yenile</button>
                    </div>

                    {loading ? (
                         <div className="text-center py-8 text-slate-400">Yükleniyor...</div>
                    ) : historyList.length > 0 ? (
                         <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                             {historyList.map(c => {
                                 const isCreator = c.creatorId === myUid;
                                 const opponentName = isCreator ? (c.opponentName || 'Rakip') : c.creatorName;
                                 const myScore = isCreator ? c.creatorScore : c.opponentScore;
                                 const oppScore = isCreator ? c.opponentScore : c.creatorScore;
                                 
                                 let resultColor = 'text-slate-500';
                                 if (c.winnerId === 'tie') resultColor = 'text-yellow-500';
                                 else if (c.winnerId === myUid) resultColor = 'text-green-500';
                                 else if (c.winnerId && c.winnerId !== 'tie') resultColor = 'text-red-500';

                                 return (
                                     <div key={c.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-between items-center">
                                         <div>
                                             <div className="text-[10px] text-slate-400 mb-1">
                                                 {new Date(c.createdAt).toLocaleDateString()} • {c.grade === 'GENERAL' ? 'Genel' : `${c.grade}. Sınıf`}
                                             </div>
                                             <div className="font-bold text-sm text-slate-800 dark:text-white">vs {opponentName}</div>
                                         </div>
                                         <div className="text-right">
                                             <div className={`font-black text-lg ${resultColor}`}>
                                                 {myScore}% - {oppScore}%
                                             </div>
                                             <div className="text-[10px] text-slate-400 uppercase font-bold">
                                                 {c.winnerId === 'tie' ? 'Berabere' : (c.winnerId === myUid ? 'Kazandın' : 'Kaybettin')}
                                             </div>
                                         </div>
                                     </div>
                                 )
                             })}
                         </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400 text-sm">Henüz tamamlanmış düellon yok.</div>
                    )}
                    <button onClick={() => setMode('menu')} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl mt-4">Geri</button>
                 </div>
            ) : (
                // CREATE MODE STEPS
                <div className="space-y-4">
                    {step === 1 && (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <GraduationCap className="text-indigo-500" size={20} />
                                <h3 className="font-bold text-slate-800 dark:text-white">Sınıf Seç</h3>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {grades.map(g => (
                                    <button 
                                        key={g}
                                        onClick={() => { setSelectedGrade(g); setStep(2); }}
                                        className="p-3 rounded-xl border hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm font-bold transition-all"
                                        style={{borderColor: 'var(--color-border)', color: 'var(--color-text-main)'}}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setMode('menu')} className="w-full mt-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl">Geri</button>
                        </>
                    )}

                    {step === 2 && selectedGrade && (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="text-indigo-500" size={20} />
                                <h3 className="font-bold text-slate-800 dark:text-white">Ünite Seç ({selectedGrade}. Sınıf)</h3>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {UNIT_ASSETS[selectedGrade]?.map(u => (
                                    !u.id.endsWith('all') && u.id !== 'uAll' && (
                                        <button 
                                            key={u.id}
                                            onClick={() => { setSelectedUnit(u); setStep(3); }}
                                            className="w-full p-3 text-left rounded-xl border hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm font-medium transition-all truncate"
                                            style={{borderColor: 'var(--color-border)', color: 'var(--color-text-main)'}}
                                        >
                                            <span className="font-bold mr-2">{u.unitNo}:</span> {u.title}
                                        </button>
                                    )
                                ))}
                            </div>
                            <button onClick={() => { setStep(1); setSelectedGrade(null); }} className="w-full mt-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl">Geri</button>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="space-y-6">
                                {/* Challenge Type */}
                                <div>
                                     <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Düello Tipi</label>
                                     <div className="grid grid-cols-3 gap-2">
                                         <button onClick={() => setChallengeType('public')} className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-bold transition-all ${challengeType === 'public' ? 'border-green-500 bg-green-50 text-green-600' : 'border-slate-200 text-slate-500'}`}>
                                             <Globe size={20} /> Herkese Açık
                                         </button>
                                         <button onClick={() => setChallengeType('friend')} className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-bold transition-all ${challengeType === 'friend' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500'}`}>
                                             <UserPlus size={20} /> Arkadaşla
                                         </button>
                                         <button onClick={() => setChallengeType('private')} className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-bold transition-all ${challengeType === 'private' ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-slate-200 text-slate-500'}`}>
                                             <Lock size={20} /> Gizli (Kod)
                                         </button>
                                     </div>
                                </div>

                                {/* Friend Selector (If Type is Friend) */}
                                {challengeType === 'friend' && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Arkadaş Seç</label>
                                        {friends.length > 0 ? (
                                            <select 
                                                value={selectedFriendId}
                                                onChange={(e) => setSelectedFriendId(e.target.value)}
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-sm font-bold"
                                            >
                                                <option value="">Bir arkadaş seç...</option>
                                                {friends.map(f => (
                                                    <option key={f.uid} value={f.uid}>{f.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-xs text-red-500 text-center p-2 bg-red-50 rounded-lg">Henüz arkadaşın yok. Profilinden ekle.</div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Zorluk (Süre)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {difficultyOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSelectedDifficulty(opt.id)}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${selectedDifficulty === opt.id ? opt.color : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Soru Sayısı</label>
                                    <div className="flex gap-2">
                                        {countOptions.map(cnt => (
                                            <button
                                                key={cnt}
                                                onClick={() => setSelectedCount(cnt)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${selectedCount === cnt ? 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                            >
                                                {cnt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => { setStep(2); setSelectedUnit(null); }} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl">Geri</button>
                                <button 
                                    onClick={handleCreateSubmit} 
                                    disabled={challengeType === 'friend' && !selectedFriendId}
                                    className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Check size={18} /> Oluştur
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default ChallengeModal;
