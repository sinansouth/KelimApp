
import React, { useState, useEffect, useRef } from 'react';
import { WordCard, Badge, GradeLevel } from '../types';
import { MessageCircle, Send, RotateCcw, WholeWord, AlertTriangle, Info } from 'lucide-react';
import { playSound } from '../services/soundService';
import { updateStats, updateQuestProgress, updateGameStats } from '../services/userService';
import Mascot from './Mascot';

interface WordChainGameProps {
  unitWords: WordCard[]; // Words from current unit
  allWords: WordCard[]; // All dictionary for validation
  onFinish: () => void;
  onBack: () => void;
  onHome: () => void;
  onCelebrate?: (message: string, type: 'unit' | 'quiz' | 'goal') => void;
  grade?: GradeLevel | null;
}

interface Message {
    id: number;
    text: string;
    sender: 'bot' | 'user';
    isError?: boolean;
}

const WordChainGame: React.FC<WordChainGameProps> = ({ unitWords, allWords, onFinish, onBack, onCelebrate, grade }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [currentLetter, setCurrentLetter] = useState<string>(''); // Target start letter

  // Use a Ref to track used words for the bot's async logic to avoid stale closures
  const usedWordsRef = useRef<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      startNewGame();
  }, []);

  useEffect(() => {
      scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startNewGame = () => {
      // Pick a random starting word from the UNIT
      const startWord = unitWords[Math.floor(Math.random() * unitWords.length)].english.toLocaleLowerCase('en');
      
      setMessages([{
          id: Date.now(),
          text: startWord,
          sender: 'bot'
      }]);
      
      const newUsed = new Set([startWord]);
      setUsedWords(newUsed);
      usedWordsRef.current = newUsed;
      
      setCurrentLetter(startWord.slice(-1));
      setScore(0);
      setLives(3);
      setIsGameOver(false);
      setInput('');
      
      setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isGameOver || !input.trim()) return;
      
      const userWord = input.trim().toLocaleLowerCase('en');
      
      // 1. Check if word starts with correct letter
      if (userWord.charAt(0) !== currentLetter) {
          handleError(`Kelime "${currentLetter.toUpperCase()}" harfiyle başlamalı!`);
          return;
      }

      // 2. Check if word was already used (Using Ref for immediate check)
      if (usedWordsRef.current.has(userWord)) {
          handleError(`Bu kelime zaten kullanıldı!`);
          return;
      }

      // 3. Check if word exists in our dictionary (any unit)
      const wordExists = allWords.some(w => w.english.toLocaleLowerCase('en') === userWord);
      
      if (!wordExists) {
           handleError(`Bu kelime sözlüğümüzde yok!`);
           return;
      }

      // Valid Move
      playSound('correct');
      setMessages(prev => [...prev, { id: Date.now(), text: userWord, sender: 'user' }]);
      
      // Update both state and ref
      setUsedWords(prev => {
          const next = new Set(prev).add(userWord);
          usedWordsRef.current = next;
          return next;
      });
      
      setScore(prev => prev + 10);
      
      // XP: 10 per word
      updateQuestProgress('earn_xp', 10);
      
      setInput('');
      
      // Bot's Turn
      const nextLetter = userWord.slice(-1);
      setTimeout(() => botTurn(nextLetter), 800);
  };

  const handleError = (msg: string) => {
      playSound('wrong');
      setMessages(prev => [...prev, { id: Date.now(), text: msg, sender: 'user', isError: true }]);
      setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
              setIsGameOver(true);
              playSound('wrong');
              updateGameStats('chain', score); // Update Leaderboard
          }
          return newLives;
      });
      setInput('');
  };

  const botTurn = (startChar: string) => {
      // Bot tries to find a word starting with startChar
      // CRITICAL: Check against usedWordsRef.current to ensure we have the latest list including user's last word
      const usedSet = usedWordsRef.current;
      
      const availableWords = allWords.filter(w => {
          const wLower = w.english.toLocaleLowerCase('en');
          return wLower.startsWith(startChar) && !usedSet.has(wLower);
      });

      if (availableWords.length > 0) {
          // Pick one (prefer unit words if possible for relevance)
          const unitMatches = availableWords.filter(w => unitWords.some(uw => uw.english.toLocaleLowerCase('en') === w.english.toLocaleLowerCase('en')));
          const pickPool = unitMatches.length > 0 ? unitMatches : availableWords;
          const pick = pickPool[Math.floor(Math.random() * pickPool.length)].english.toLocaleLowerCase('en');

          setMessages(prev => [...prev, { id: Date.now(), text: pick, sender: 'bot' }]);
          
          // Update both state and ref
          setUsedWords(prev => {
              const next = new Set(prev).add(pick);
              usedWordsRef.current = next;
              return next;
          });

          setCurrentLetter(pick.slice(-1));
          playSound('pop');
      } else {
          // Bot can't find a word! User wins bonus!
          playSound('success');
          setMessages(prev => [...prev, { id: Date.now(), text: "Aklıma kelime gelmiyor! Sen kazandın! (+50 XP)", sender: 'bot' }]);
          setScore(prev => prev + 50);
          setIsGameOver(true);
          
          // Award stats
          updateStats('quiz_correct', grade, undefined, 5); 
          updateQuestProgress('earn_xp', 50); // Bonus
          updateGameStats('chain', score + 50); // Update Leaderboard
          
          if (onCelebrate) onCelebrate('Tebrikler! Oyunu kazandın!', 'goal');
      }
  };
  
  const handleRestart = () => {
      if (score > 0) {
          // Ensure final stats are pushed if game over by lives
          if (isGameOver) updateGameStats('chain', score);
      }
      startNewGame();
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-slate-50 dark:bg-black/20">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                    <WholeWord size={20} />
                </div>
                <div>
                    <h2 className="font-black text-slate-800 dark:text-white">Kelime Türet</h2>
                    <div className="text-xs text-slate-500">Son harfle başla!</div>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <div className="font-black text-lg text-indigo-600">{score} Puan</div>
                <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < lives ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Tip Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-[10px] text-blue-600 dark:text-blue-300 flex items-center justify-center gap-2 text-center border-b border-blue-100 dark:border-blue-800">
             <Info size={12} className="shrink-0" />
             <span>İpucu: Uygulamadaki tüm İngilizce kelimeleri kullanabilirsin.</span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
             {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                     {msg.sender === 'bot' && (
                         <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-2 shrink-0 overflow-hidden">
                            <Mascot mood="happy" size={35} />
                         </div>
                     )}
                     <div 
                        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm font-medium
                            ${msg.sender === 'user' 
                                ? msg.isError ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                            }
                        `}
                     >
                        {msg.text}
                     </div>
                 </div>
             ))}
             <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 pb-safe">
             {!isGameOver ? (
                 <form onSubmit={handleSubmit} className="flex gap-2 relative">
                    <div className="absolute -top-10 left-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg animate-bounce">
                        "{currentLetter.toUpperCase()}" ile başla!
                    </div>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 border-2 focus:border-indigo-500 rounded-xl outline-none transition-all dark:text-white font-bold"
                        placeholder={`${currentLetter.toUpperCase()}...`}
                        autoFocus
                        autoComplete="off"
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim()}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all active:scale-95"
                    >
                        <Send size={20} />
                    </button>
                 </form>
             ) : (
                 <div className="flex gap-3">
                     <button onClick={handleRestart} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                         <RotateCcw size={18} /> Tekrar Oyna
                     </button>
                     <button onClick={onBack} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all active:scale-95">
                         Çıkış
                     </button>
                 </div>
             )}
        </div>
    </div>
  );
};

export default WordChainGame;
