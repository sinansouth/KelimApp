


import React from 'react';
import { Tournament, TournamentMatch } from '../types';
import { Trophy, User, Clock, CheckCircle, Play } from 'lucide-react';

interface TournamentTreeProps {
  tournament: Tournament;
  currentUserId: string;
  onPlayMatch: (match: TournamentMatch) => void;
  onBack: () => void;
}

const TournamentTree: React.FC<TournamentTreeProps> = ({ tournament, currentUserId, onPlayMatch, onBack }) => {
  
  const getRoundEndTime = (roundNumber: number) => {
      const totalRounds = tournament.maxParticipants === 64 ? 6 : tournament.maxParticipants === 32 ? 5 : 4;
      const currentRoundIndex = Math.log2(tournament.maxParticipants) - Math.log2(roundNumber);
      // NOTE: roundDuration is in MINUTES now
      const roundDurationMs = (tournament.roundDuration || 30) * 60 * 1000;
      
      return tournament.startDate + (currentRoundIndex * roundDurationMs) + roundDurationMs;
  };

  const formatRemainingTime = (endTime: number) => {
      const now = Date.now();
      const diff = endTime - now;
      if (diff <= 0) return "Süre Doldu";
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (hours > 24) return `${Math.floor(hours/24)} gün kaldı`;
      if (hours > 0) return `${hours}s ${minutes}dk kaldı`;
      return `${minutes}dk ${seconds}sn kaldı`;
  };

  const renderMatch = (match: TournamentMatch) => {
    const isPlayer1 = match.player1Id === currentUserId;
    const isPlayer2 = match.player2Id === currentUserId;
    const isParticipating = isPlayer1 || isPlayer2;
    
    let p1Status = 'waiting';
    let p2Status = 'waiting';
    
    if (match.round === 2) { // Final - single leg
        p1Status = match.score1_leg1 !== undefined ? 'done' : 'waiting';
        p2Status = match.score2_leg1 !== undefined ? 'done' : 'waiting';
    } else {
        // 2 legs
        const p1Leg1 = match.score1_leg1 !== undefined;
        const p1Leg2 = match.score1_leg2 !== undefined;
        p1Status = p1Leg1 ? (p1Leg2 ? 'done' : 'leg2') : 'leg1';
        
        const p2Leg1 = match.score2_leg1 !== undefined;
        const p2Leg2 = match.score2_leg2 !== undefined;
        p2Status = p2Leg1 ? (p2Leg2 ? 'done' : 'leg2') : 'leg1';
    }

    const canPlay = isParticipating && match.status !== 'completed' && match.status !== 'waiting' && 
                    ((isPlayer1 && p1Status !== 'done') || (isPlayer2 && p2Status !== 'done'));
                    
    const endTime = getRoundEndTime(match.round);
    const isActiveRound = tournament.currentRound === match.round;

    return (
        <div key={match.id} className={`bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border ${isParticipating ? 'border-indigo-500 shadow-md' : 'border-slate-200 dark:border-slate-700'} mb-2 relative`}>
            <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-slate-400">
                    {match.round === 2 ? 'FİNAL' : match.round === 4 ? 'Yarı Final' : match.round === 8 ? 'Çeyrek Final' : `Son ${match.round}`}
                </span>
                {match.status === 'completed' 
                    ? <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle size={10}/> Tamamlandı</span>
                    : isActiveRound && <span className="text-orange-500 font-bold text-[10px] flex items-center gap-1"><Clock size={10}/> {formatRemainingTime(endTime)}</span>
                }
            </div>

            {/* Player 1 */}
            <div className={`flex justify-between items-center p-2 rounded-lg mb-1 ${match.winnerId === match.player1Id ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                <div className="flex items-center gap-2">
                    <User size={14} className={isPlayer1 ? 'text-indigo-500' : 'text-slate-400'} />
                    <span className={`font-bold ${isPlayer1 ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {match.player1Name || 'Bekleniyor...'}
                    </span>
                </div>
                <div className="text-xs font-mono font-bold">
                    {match.round === 2 
                        ? (match.score1_leg1 !== undefined ? match.score1_leg1 : '-') 
                        : `${match.score1_leg1 !== undefined ? match.score1_leg1 : '-'} / ${match.score1_leg2 !== undefined ? match.score1_leg2 : '-'}`
                    }
                </div>
            </div>

            {/* Player 2 */}
            <div className={`flex justify-between items-center p-2 rounded-lg ${match.winnerId === match.player2Id ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                <div className="flex items-center gap-2">
                    <User size={14} className={isPlayer2 ? 'text-indigo-500' : 'text-slate-400'} />
                    <span className={`font-bold ${isPlayer2 ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {match.player2Name || 'Bekleniyor...'}
                    </span>
                </div>
                <div className="text-xs font-mono font-bold">
                     {match.round === 2 
                        ? (match.score2_leg1 !== undefined ? match.score2_leg1 : '-') 
                        : `${match.score2_leg1 !== undefined ? match.score2_leg1 : '-'} / ${match.score2_leg2 !== undefined ? match.score2_leg2 : '-'}`
                    }
                </div>
            </div>
            
            {canPlay && (
                <button 
                    onClick={() => onPlayMatch(match)}
                    className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors animate-pulse"
                >
                    <Play size={12} fill="currentColor" /> Maçı Oyna
                </button>
            )}
        </div>
    );
  };

  // Group matches by round
  // Dynamically determine rounds based on maxParticipants
  const rounds = [];
  let r = tournament.maxParticipants;
  while(r >= 2) {
      rounds.push(r);
      r = r / 2;
  }

  const matchesByRound = rounds.reduce((acc, r) => {
      acc[r] = tournament.matches.filter(m => m.round === r);
      return acc;
  }, {} as Record<number, TournamentMatch[]>);

  return (
    <div className="h-full flex flex-col">
        <div className="p-4 text-center border-b border-slate-100 dark:border-slate-800">
             <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">{tournament.unitName}</div>
             <h2 className="text-xl font-black text-slate-800 dark:text-white">{tournament.title}</h2>
             {tournament.championId && (
                 <div className="mt-2 flex items-center justify-center gap-2 text-yellow-500 font-bold bg-yellow-50 dark:bg-yellow-900/20 py-1 px-3 rounded-full mx-auto w-fit">
                     <Trophy size={16} /> Şampiyon Belli Oldu!
                 </div>
             )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {rounds.map(r => {
                const matches = matchesByRound[r];
                if (!matches || matches.length === 0) return null;
                
                return (
                    <div key={r} className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">
                                {r === 2 ? 'Final' : r === 4 ? 'Yarı Final' : r === 8 ? 'Çeyrek Final' : `Son ${r}`}
                            </span>
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {matches.map(renderMatch)}
                        </div>
                    </div>
                )
            })}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={onBack} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl">Geri Dön</button>
        </div>
    </div>
  );
};

export default TournamentTree;
