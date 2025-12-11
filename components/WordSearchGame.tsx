

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WordCard, Badge, GradeLevel } from '../types';
import { CheckCircle, RotateCcw, ArrowRight, HelpCircle, Search, Grid3X3, Home, Play } from 'lucide-react';
import { playSound } from '../services/soundService';
// FIX: Import `updateGameStats` to handle game-specific statistics.
import { updateStats, updateQuestProgress, updateGameStats, XP_GAINS } from '../services/userService';
import { syncLocalToCloud } from '../services/supabase';

interface WordSearchGameProps {
  words: WordCard[];
  onFinish: () => void;
  onBack: () => void;
  onHome: () => void;
  onCelebrate?: (message: string, type: 'unit' | 'quiz' | 'goal') => void;
  grade?: GradeLevel | null;
}

interface GridCell {
  char: string;
  x: number;
  y: number;
  isSelected: boolean;
  isFound: boolean;
  isPartOfWord?: boolean;
}

interface PlacedWord {
    id: string;
    text: string;
    meaning: string;
    cells: {x: number, y: number}[];
    found: boolean;
    color: string;
}

const COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

const WordSearchGame: React.FC<WordSearchGameProps> = ({ words, onFinish, onBack, onHome, onCelebrate, grade }) => {
    const [gameMode, setGameMode] = useState<'setup' | 'playing' | 'finished'>('setup');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [grid, setGrid] = useState<GridCell[][]>([]);
    const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
    const [selection, setSelection] = useState<{start: {x: number, y: number} | null, end: {x: number, y: number} | null}>({ start: null, end: null });
    const [foundCount, setFoundCount] = useState(0);
    const [foundToast, setFoundToast] = useState<{visible: boolean, word: string, meaning: string} | null>(null);
    const [score, setScore] = useState(0);
    const [cumulativeScore, setCumulativeScore] = useState(0);

    const gridRef = useRef<HTMLDivElement>(null);
    const isSelecting = useRef(false);

    const getSettings = (diff: 'easy' | 'medium' | 'hard') => {
        switch(diff) {
            case 'easy': return { size: 8, wordCount: 5, multiplier: 10, directions: [[0,1], [1,0]] }; 
            case 'medium': return { size: 10, wordCount: 8, multiplier: 20, directions: [[0,1], [1,0], [1,1]] };
            case 'hard': return { size: 12, wordCount: 12, multiplier: 30, directions: [[0,1], [1,0], [1,1], [-1,1]] };
        }
    };

    const startGame = (diff: 'easy' | 'medium' | 'hard', keepScore: boolean = false) => {
        setDifficulty(diff);
        const settings = getSettings(diff);
        const gridSize = settings.size;
        
        const newGrid: GridCell[][] = [];
        for(let y=0; y<gridSize; y++) {
            const row: GridCell[] = [];
            for(let x=0; x<gridSize; x++) {
                row.push({
                    char: '',
                    x: x,
                    y: y,
                    isSelected: false,
                    isFound: false
                });
            }
            newGrid.push(row);
        }

        const selectedWords = [...words]
            .sort(() => 0.5 - Math.random())
            .slice(0, settings.wordCount)
            .filter(w => w.english.length <= gridSize)
            .sort((a, b) => b.english.length - a.english.length);

        const newPlacedWords: PlacedWord[] = [];

        for (let i = 0; i < selectedWords.length; i++) {
            const word = selectedWords[i];
            const wordText = word.english.toUpperCase().replace(/[^A-Z]/g, ''); 
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 100) {
                const dir = settings.directions[Math.floor(Math.random() * settings.directions.length)];
                const [dx, dy] = dir;
                
                const maxX = dx === 1 ? gridSize - wordText.length : dx === -1 ? gridSize - 1 : gridSize - 1;
                const minX = dx === -1 ? wordText.length - 1 : 0;
                const maxY = dy === 1 ? gridSize - wordText.length : dy === -1 ? gridSize - 1 : gridSize - 1;
                const minY = dy === -1 ? wordText.length - 1 : 0;

                if (minX > maxX || minY > maxY) { attempts++; continue; }

                const startX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
                const startY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

                let clear = true;
                for (let j = 0; j < wordText.length; j++) {
                    const cx = startX + j * dx;
                    const cy = startY + j * dy;
                    if (newGrid[cy][cx].char !== '' && newGrid[cy][cx].char !== wordText[j]) {
                        clear = false;
                        break;
                    }
                }

                if (clear) {
                    const wordCells = [];
                    for (let j = 0; j < wordText.length; j++) {
                        const cx = startX + j * dx;
                        const cy = startY + j * dy;
                        newGrid[cy][cx].char = wordText[j];
                        newGrid[cy][cx].isPartOfWord = true;
                        wordCells.push({x: cx, y: cy});
                    }
                    newPlacedWords.push({
                        id: word.english,
                        text: word.english,
                        meaning: word.turkish,
                        cells: wordCells,
                        found: false,
                        color: COLORS[i % COLORS.length]
                    });
                    placed = true;
                }
                attempts++;
            }
        }

        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for(let y=0; y<gridSize; y++) {
            for(let x=0; x<gridSize; x++) {
                if (newGrid[y][x].char === '') {
                    newGrid[y][x].char = alphabet[Math.floor(Math.random() * alphabet.length)];
                }
            }
        }

        setGrid(newGrid);
        setPlacedWords(newPlacedWords);
        setFoundCount(0);
        
        if (keepScore) {
            setScore(cumulativeScore);
        } else {
            setScore(0);
            setCumulativeScore(0);
        }
        
        setGameMode('playing');
    };

    const handleExit = () => {
        syncLocalToCloud(); // Sync before leaving
        onBack();
    };

    const getCellsBetween = (start: {x: number, y: number}, end: {x: number, y: number}) => {
        const cells: {x: number, y: number}[] = [];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        if (steps === 0) return [{x: start.x, y: start.y}];

        const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;

        if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return []; 

        let cx = start.x;
        let cy = start.y;

        for (let i = 0; i <= steps; i++) {
            cells.push({x: cx, y: cy});
            cx += stepX;
            cy += stepY;
        }
        return cells;
    };

    const handlePointerDown = (x: number, y: number) => {
        isSelecting.current = true;
        setSelection({ start: {x, y}, end: {x, y} });
    };

    const handlePointerMove = (x: number, y: number) => {
        if (!isSelecting.current || !selection.start) return;
        if (selection.end?.x === x && selection.end?.y === y) return;
        setSelection(prev => ({ ...prev, end: {x, y} }));
    };

    const handlePointerUp = () => {
        if (!isSelecting.current || !selection.start || !selection.end) return;
        isSelecting.current = false;

        const selectedCells = getCellsBetween(selection.start, selection.end);
        if (selectedCells.length > 0) {
            checkSelection(selectedCells);
        }
        setSelection({ start: null, end: null });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSelecting.current || !gridRef.current) return;
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.hasAttribute('data-x')) {
            const x = parseInt(element.getAttribute('data-x')!);
            const y = parseInt(element.getAttribute('data-y')!);
            handlePointerMove(x, y);
        }
    };

    const checkSelection = (cells: {x: number, y: number}[]) => {
        const selectedText = cells.map(c => grid[c.y][c.x].char).join('');
        const reverseText = selectedText.split('').reverse().join('');

        const foundWord = placedWords.find(w => !w.found && (
            w.text.toUpperCase().replace(/[^A-Z]/g, '') === selectedText || 
            w.text.toUpperCase().replace(/[^A-Z]/g, '') === reverseText
        ));

        if (foundWord) {
            const newPlacedWords = placedWords.map(w => 
                w.id === foundWord.id ? { ...w, found: true } : w
            );
            setPlacedWords(newPlacedWords);
            
            const newGrid = [...grid];
            foundWord.cells.forEach(c => {
                newGrid[c.y][c.x].isFound = true;
            });
            setGrid(newGrid);
            
            playSound('correct');
            
            const points = getSettings(difficulty).multiplier;
            setScore(prev => prev + points);

            // --- IMMEDIATE XP UPDATE START (Centralized Value) ---
            const xpGained = XP_GAINS.wordsearch_word[difficulty];
            updateStats(xpGained, { grade });
            updateQuestProgress('earn_xp', xpGained);
            updateQuestProgress('play_word_search', points);
            
            syncLocalToCloud(); // Immediate sync
            // --- IMMEDIATE XP UPDATE END ---

            setFoundCount(prev => {
                const newCount = prev + 1;
                if (newCount === placedWords.length) handleWin(points);
                return newCount;
            });

            setFoundToast({ visible: true, word: foundWord.text, meaning: foundWord.meaning });
            setTimeout(() => setFoundToast(null), 2000);
        }
    };

    const handleWin = (lastPoints: number) => {
        setTimeout(() => {
            playSound('success');
            setGameMode('finished');
            
            const finalScore = score + lastPoints;
            setCumulativeScore(finalScore);
            
            updateGameStats('wordSearch', finalScore);
            syncLocalToCloud(); // Sync after win
            
            if (onCelebrate) onCelebrate('Tebrikler! Tüm kelimeleri buldun!', 'goal');
        }, 1000);
    };
    
    const highlightedCells = new Set<string>();
    if (selection.start && selection.end) {
        const cells = getCellsBetween(selection.start, selection.end);
        cells.forEach(c => highlightedCells.add(`${c.x},${c.y}`));
    }

    if (gameMode === 'setup') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in">
             <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 shadow-sm">
                 <Search size={40} />
             </div>
             <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Kelime Bulmaca</h2>
             <p className="text-slate-500 dark:text-slate-400 mb-8 text-center">Zorluk seviyesini seç:</p>
             
             <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                 <button onClick={() => startGame('easy')} className="p-4 rounded-xl border-2 border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold text-lg active:scale-95 transition-transform">
                     Kolay (8x8)
                 </button>
                 <button onClick={() => startGame('medium')} className="p-4 rounded-xl border-2 border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-bold text-lg active:scale-95 transition-transform">
                     Orta (10x10)
                 </button>
                 <button onClick={() => startGame('hard')} className="p-4 rounded-xl border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold text-lg active:scale-95 transition-transform">
                     Zor (12x12)
                 </button>
             </div>
             <button onClick={onBack} className="mt-8 text-slate-400 hover:text-slate-600 text-sm font-bold">Vazgeç</button>
        </div>
      );
    }

    if (gameMode === 'finished') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-lg">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Harika!</h2>
                <div className="text-5xl font-black text-indigo-600 my-4">{score}<span className="text-lg text-slate-400 ml-2">Puan</span></div>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Tüm kelimeleri buldun.</p>
                
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button onClick={() => startGame(difficulty, true)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                        <Play size={18} /> Yeni Bulmaca
                    </button>
                    <button onClick={onBack} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
                         <ArrowRight size={18} /> Geri Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full max-w-lg mx-auto p-4 select-none overflow-hidden">
            
            <div className="flex justify-between items-center mb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                         <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full">
                             {foundCount} / {placedWords.length}
                         </span>
                    </div>
                    <div className="text-sm font-black text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
                        {score} Puan
                    </div>
                </div>
                <div className="flex gap-2">
                     <button onClick={handleExit} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 text-xs font-bold">
                        Çıkış
                    </button>
                    <button onClick={() => setGameMode('setup')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <RotateCcw size={20} className="text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
                 {foundToast && (
                     <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg animate-in zoom-in fade-in duration-200 flex flex-col items-center min-w-[200px] border-2 border-green-400 pointer-events-none">
                         <span className="font-black text-lg">{foundToast.word}</span>
                         <span className="text-sm opacity-90 font-medium">{foundToast.meaning}</span>
                     </div>
                 )}

                 <div 
                    ref={gridRef}
                    className="grid bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-md border-2 border-slate-200 dark:border-slate-700 touch-none shrink-1"
                    style={{
                        gridTemplateColumns: `repeat(${grid.length}, 1fr)`,
                        gap: '2px',
                        width: '100%',
                        aspectRatio: '1/1',
                        maxWidth: '400px',
                        maxHeight: '50vh',
                        touchAction: 'none'
                    }}
                    onTouchStart={() => {}} 
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handlePointerUp}
                 >
                    {grid.map((row, y) => (
                        row.map((cell, x) => {
                            const isHighlighted = highlightedCells.has(`${x},${y}`);
                            const foundWordInfo = placedWords.find(w => w.found && w.cells.some(c => c.x === x && c.y === y));
                            
                            let bgClass = 'bg-slate-50 dark:bg-slate-700/50';
                            let textClass = 'text-slate-700 dark:text-slate-300';
                            
                            if (isHighlighted) {
                                bgClass = 'bg-indigo-500';
                                textClass = 'text-white';
                            }

                            return (
                                <div
                                    key={`${x}-${y}`}
                                    data-x={x}
                                    data-y={y}
                                    onPointerDown={(e) => { 
                                        e.preventDefault(); 
                                        handlePointerDown(x, y); 
                                        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                                    }}
                                    onPointerEnter={() => handlePointerMove(x, y)}
                                    onPointerUp={handlePointerUp}
                                    className={`flex items-center justify-center rounded-md text-xs sm:text-sm md:text-base font-bold uppercase select-none cursor-pointer transition-colors duration-100 ${!foundWordInfo && !isHighlighted ? bgClass : ''} ${textClass}`}
                                    style={foundWordInfo && !isHighlighted ? { backgroundColor: foundWordInfo.color, color: 'white' } : {}}
                                >
                                    {cell.char}
                                </div>
                            )
                        })
                    ))}
                 </div>
            </div>

            <div className="shrink-0 mt-4 max-h-[150px] overflow-y-auto custom-scrollbar pb-safe">
                 <div className="flex flex-wrap justify-center gap-2">
                     {placedWords.map(w => (
                         <div 
                            key={w.id} 
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-300 flex items-center gap-1
                                ${w.found 
                                    ? 'bg-transparent opacity-50 line-through' 
                                    : 'bg-white dark:bg-slate-800 shadow-sm'
                                }
                            `}
                            style={{
                                borderColor: w.found ? 'transparent' : 'var(--color-border)',
                                color: w.found ? 'gray' : 'var(--color-text-main)',
                                backgroundColor: w.found ? 'transparent' : w.color + '20', 
                                borderLeftWidth: w.found ? '1px' : '4px',
                                borderLeftColor: w.found ? 'transparent' : w.color
                            }}
                         >
                             {w.text}
                             {w.found && <CheckCircle size={10} className="inline ml-1" />}
                         </div>
                     ))}
                 </div>
            </div>

        </div>
    );
};

export default WordSearchGame;
