
import React, { useState, useEffect, useRef } from 'react';
import { WordCard, Badge, GradeLevel } from '../types';
import { Keyboard, Check, X, RotateCcw, ArrowRight, HelpCircle, Heart, Flag } from 'lucide-react';
import { playSound } from '../services/soundService';
import { updateStats, updateQuestProgress, updateGameStats } from '../services/userService';
import Mascot from './Mascot';

interface TypingGameProps {
  words: WordCard[];
  onFinish: () => void;
  onBack: () => void;
  onHome: () => void;
  onCelebrate?: (message: string, type: 'unit' | 'quiz' | 'goal') => void;
  grade?: GradeLevel | null;
}

const TypingGame: React.FC<TypingGameProps> = ({ words, onFinish, onBack, onCelebrate, grade }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<WordCard[]>([]);
  const [lives, setLives] = useState(3);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShuffledWords([...words].sort(() => 0.5 - Math.random()));
    setCurrentIndex(0);
    setScore(0);
    setLives(3);
    setShowResult(false);
  }, [words]);

  useEffect(() => {
      if (!showResult && inputRef.current) {
          inputRef.current.focus();
      }
  }, [currentIndex, showResult]);

  const currentWord = shuffledWords[currentIndex];

  // Helper to create masked sentence handling suffixes and separated phrases
  const getMaskedSentence = (sentence: string, targetWord: string) => {
      if (!sentence || !targetWord) return "";
      
      // Clean target word from punctuation for safer matching
      const cleanTarget = targetWord.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      // Break target phrase into stems (e.g., "back up" -> ["back", "up"])
      const stems = cleanTarget.trim().split(/\s+/);
      
      // Create regex: matches stems followed by optional alpha chars (suffixes like -s, -ing, -ed)
      // We join stems with | to match any part of the phrasal verb if they are separated
      const patternString = `\\b(?:${stems.join('|')})[a-z]*\\b`;
      const pattern = new RegExp(patternString, 'gi');
      
      // Replace matches with underscore
      return sentence.replace(pattern, '_____');
  };

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;

    // Case-insensitive check (Locale safe)
    const isCorrect = input.trim().toLocaleLowerCase('en') === currentWord.english.toLocaleLowerCase('en');

    if (isCorrect) {
        setFeedback('correct');
        playSound('correct');
        setScore(prev => prev + 10); // +10 per word
        setTimeout(() => {
            nextWord();
        }, 800);
    } else {
        setFeedback('wrong');
        playSound('wrong');
        handleLifeLost();
    }
  };
  
  const handleGiveUp = () => {
      setInput(currentWord.english); 
      setFeedback('wrong');
      playSound('wrong');
      handleLifeLost();
  };

  const handleLifeLost = () => {
      setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
              // Game Over
              setTimeout(finishGame, 1000);
          } else {
              // Continue but show feedback
              setTimeout(() => {
                  // Only clear input if it was a wrong attempt, keep it if it was a skip (give up) so user sees correct answer
                  if (input.toLocaleLowerCase('en') !== currentWord.english.toLocaleLowerCase('en')) {
                       setInput(''); 
                  }
                  setFeedback(null);
                  
                  // If it was a skip (give up), we move to next word automatically
                  if (input.toLocaleLowerCase('en') === currentWord.english.toLocaleLowerCase('en')) {
                      nextWord();
                  } else {
                      // If just a wrong guess, let user try again or skip manually
                      inputRef.current?.focus();
                  }
              }, 1000);
          }
          return newLives;
      });
  };
  
  const nextWord = () => {
      setFeedback(null);
      setInput('');
      setHintUsed(false);
      
      if (currentIndex < shuffledWords.length - 1) {
          setCurrentIndex(prev => prev + 1);
      } else {
          finishGame();
      }
  };

  const finishGame = () => {
      setShowResult(true);
      if (score > 0) playSound('success');
      
      // Only update stats if score > 0
      if (score > 0) {
          // Add to typing leaderboard
          updateGameStats('typing', score);
          
          // XP Balancing: 15 XP per word (score is 10/word, so *1.5)
          const xpEarned = Math.floor(score * 1.5);
          updateQuestProgress('earn_xp', xpEarned);
          
          // Quest progress
          updateQuestProgress('play_typing', score); 
      }
  };

  const getHint = () => {
      if (hintUsed) return;
      setHintUsed(true);
      setScore(s => Math.max(0, s - 2)); 
      const len = currentWord.english.length;
      if (len <= 1) return;
      setInput(currentWord.english.substring(0, 2)); // Give first 2 chars
      inputRef.current?.focus();
  };

  if (!currentWord) return null;

  if (showResult) {
       return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-lg">
                  <Keyboard size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Oyun Bitti!</h2>
              <div className="text-6xl font-black text-indigo-600 my-6">{score}<span className="text-lg text-slate-400 ml-2">Puan</span></div>
              
              <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button onClick={() => { setShuffledWords([...words].sort(() => 0.5 - Math.random())); setCurrentIndex(0); setScore(0); setLives(3); setShowResult(false); }} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95">
                      Tekrar Oyna
                  </button>
                  <button onClick={onBack} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all active:scale-95">
                      Geri Dön
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto p-6">
        
        <div className="w-full flex justify-between items-center mb-4">
             <div className="flex gap-1">
                 {[...Array(3)].map((_, i) => (
                     <Heart key={i} size={24} className={`${i < lives ? 'fill-red-500 text-red-500' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'} transition-colors`} />
                 ))}
             </div>
             
             <button 
                onClick={finishGame}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-200 transition-colors shadow-sm"
             >
                 <Flag size={14} /> Bitir
             </button>
        </div>

        <div className="w-full flex justify-between items-center mb-6 text-sm font-bold text-slate-400">
             <span>{currentIndex + 1} / {shuffledWords.length}</span>
             <span className="text-indigo-500 text-xl">{score}</span>
        </div>

        <div className="mb-4 relative w-full flex justify-center" style={{minHeight: '120px'}}>
             <Mascot 
                mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'sad' : 'neutral'} 
                size={100} 
                message={
                    <span className="italic text-slate-600 dark:text-slate-300 font-medium text-base">
                        "{getMaskedSentence(currentWord.exampleEng, currentWord.english)}"
                    </span>
                }
             />
        </div>
        
        <div className="w-full max-w-md text-center mb-8">
             <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-2 animate-in slide-in-from-bottom-2">
                 {currentWord.turkish}
             </h2>
             <p className="text-indigo-500 text-sm font-bold uppercase tracking-widest">{currentWord.context}</p>
        </div>

        <div className="w-full max-w-md relative group">
            <form onSubmit={handleCheck} className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={`w-full p-4 text-center text-xl font-bold rounded-2xl border-2 outline-none transition-all shadow-sm
                        ${feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-700' : 
                          feedback === 'wrong' ? 'border-red-500 bg-red-50 text-red-700' : 
                          'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                        }
                    `}
                    placeholder="İngilizcesini yaz..."
                    autoComplete="off"
                    autoFocus
                    disabled={feedback !== null}
                />
                
                <button 
                   type="button"
                   onClick={getHint}
                   disabled={hintUsed || feedback !== null}
                   className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-500 disabled:opacity-30 transition-colors"
                   title="İpucu (-2 Puan)"
                >
                    <HelpCircle size={20} />
                </button>
            </form>
        </div>

        <div className="flex gap-3 mt-6 w-full max-w-md">
             <button 
               onClick={handleGiveUp}
               disabled={feedback !== null}
               className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
             >
                 Pas Geç
             </button>
             <button 
               onClick={() => handleCheck()}
               disabled={feedback !== null || !input}
               className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
             >
                 Kontrol Et
             </button>
        </div>

    </div>
  );
};

export default TypingGame;
