

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WordCard, Badge, GradeLevel } from '../types';
import { Ghost, Bot, CheckCircle, XCircle, ArrowRight, MapPin, ChevronUp, ChevronDown, ChevronLeft, ChevronRight as ChevronRightIcon, RotateCcw } from 'lucide-react';
import { playSound } from '../services/soundService';
// FIX: Import `updateGameStats` to handle game-specific statistics.
import { updateStats, updateQuestProgress, updateGameStats, XP_GAINS } from '../services/userService';
import { getSmartDistractors } from '../services/contentService';
import { syncLocalToCloud } from '../services/supabase';

interface MazeGameProps {
  words: WordCard[];
  onFinish: () => void;
  onBack: () => void;
  onHome: () => void;
  onCelebrate?: (message: string, type: 'unit' | 'quiz' | 'goal') => void;
  grade?: GradeLevel | null;
}

// --- Constants ---
const GRID_SIZE = 21; 
const POOL_SIZE = 3;  
const ENEMY_COUNT = 3;
const TICK_RATE = 130; 

type CellType = 'wall' | 'path' | 'pool';

interface Position {
  x: number;
  y: number;
}

interface DoorArea {
  id: string;
  x: number;
  y: number;
  word: string;
  isCorrect: boolean;
}

type EnemyState = 'wandering' | 'chasing' | 'searching';

interface Enemy {
  id: number;
  pos: Position;
  state: EnemyState;
  lastMove: Position; 
  targetPos: Position | null; 
  startPos: Position;
  color: string;
  patience: number; 
}

const MazeGrid = React.memo(({ grid, doors }: { grid: CellType[][], doors: DoorArea[] }) => {
  return (
    <div 
        className="absolute inset-0 grid w-full h-full"
        style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
    >
        {grid.map((row, y) => row.map((cell, x) => {
            const isPool = cell === 'pool';
            let poolContent = null;
            
            if (isPool) {
                const door = doors.find(d => x >= d.x && x < d.x + POOL_SIZE && y >= d.y && y < d.y + POOL_SIZE);
                if (door && x === door.x + 1 && y === door.y + 1) {
                    poolContent = (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none overflow-visible w-[300%] h-[300%] -translate-x-1/3 -translate-y-1/3">
                            <span className="text-[10px] sm:text-xs font-black text-white bg-black/60 px-2 py-1 rounded-lg text-center leading-tight shadow-sm backdrop-blur-[2px] border border-white/10 break-words max-w-full">
                                {door.word}
                            </span>
                        </div>
                    );
                }
            }

            const wallClass = 'bg-slate-700'; 
            const pathClass = 'bg-[#0f172a]';
            const poolClass = 'bg-indigo-900/50';

            return (
                <div key={`${x}-${y}`} className={`w-full h-full relative ${cell === 'wall' ? wallClass : cell === 'pool' ? poolClass : pathClass}`}>
                    {cell === 'path' && <div className="w-1 h-1 bg-white/5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>}
                    
                    {poolContent && (
                         <div className="absolute inset-0 flex items-center justify-center opacity-20 text-indigo-400">
                             <MapPin size={16} />
                         </div>
                    )}
                    
                    {poolContent}
                </div>
            )
        }))}
    </div>
  );
});

const MazeGame: React.FC<MazeGameProps> = ({ words, onFinish, onBack, onCelebrate, grade }) => {
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 10, y: 10 });
  
  const nextDirRef = useRef<Position>({ x: 0, y: 0 });
  const currentDirRef = useRef<Position>({ x: 0, y: 0 });
  const isMovingRef = useRef<boolean>(false);

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [doors, setDoors] = useState<DoorArea[]>([]);
  const [currentWord, setCurrentWord] = useState<WordCard | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'starting' | 'playing' | 'won' | 'lost' | 'hit'>('starting');
  const [hitMessage, setHitMessage] = useState<string>('');

  const playerPosRef = useRef<Position>({ x: 10, y: 10 });
  const doorsRef = useRef<DoorArea[]>([]);
  const enemiesRef = useRef<Enemy[]>([]); 
  const gridRef = useRef<CellType[][]>([]);
  const gameTickRef = useRef<number>(0);
  
  const gameLoopIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { doorsRef.current = doors; }, [doors]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  const handleExit = () => {
      syncLocalToCloud(); // Sync before exiting
      onBack();
  };

  const generateMaze = () => {
    const newGrid: CellType[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('wall'));
    
    const directions = [{ x: 0, y: -2 }, { x: 0, y: 2 }, { x: -2, y: 0 }, { x: 2, y: 0 }];
    const isValid = (x: number, y: number) => x > 0 && x < GRID_SIZE - 1 && y > 0 && y < GRID_SIZE - 1;

    const carve = (x: number, y: number) => {
      newGrid[y][x] = 'path';
      const shuffledDirs = directions.sort(() => Math.random() - 0.5);
      for (const dir of shuffledDirs) {
        const nx = x + dir.x;
        const ny = y + dir.y;
        if (isValid(nx, ny) && newGrid[ny][nx] === 'wall') {
          newGrid[y + dir.y / 2][x + dir.x / 2] = 'path';
          carve(nx, ny);
        }
      }
    };

    const center = Math.floor(GRID_SIZE / 2);
    carve(center, center);

    for (let i = 0; i < GRID_SIZE * 6; i++) {
        const rx = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        const ry = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        if (newGrid[ry][rx] === 'wall') {
             let pathNeighbors = 0;
             if (newGrid[ry-1]?.[rx] !== 'wall') pathNeighbors++;
             if (newGrid[ry+1]?.[rx] !== 'wall') pathNeighbors++;
             if (newGrid[ry]?.[rx-1] !== 'wall') pathNeighbors++;
             if (newGrid[ry]?.[rx+1] !== 'wall') pathNeighbors++;
             if (pathNeighbors >= 2) newGrid[ry][rx] = 'path';
        }
    }

    const carvePool = (startX: number, startY: number) => {
        for(let y = 0; y < POOL_SIZE; y++) {
            for(let x = 0; x < POOL_SIZE; x++) {
                newGrid[startY + y][startX + x] = 'pool';
            }
        }
        if (newGrid[startY-1]?.[startX+1]) newGrid[startY-1][startX+1] = 'path';
        if (newGrid[startY+POOL_SIZE]?.[startX+1]) newGrid[startY+POOL_SIZE][startX+1] = 'path';
        if (newGrid[startY+1]?.[startX-1]) newGrid[startY+1][startX-1] = 'path';
        if (newGrid[startY+1]?.[startX+POOL_SIZE]) newGrid[startY+1][startX+POOL_SIZE] = 'path';
    };

    carvePool(1, 1);
    carvePool(GRID_SIZE - 1 - POOL_SIZE, 1);
    carvePool(1, GRID_SIZE - 1 - POOL_SIZE);
    carvePool(GRID_SIZE - 1 - POOL_SIZE, GRID_SIZE - 1 - POOL_SIZE);

    for(let y = center - 1; y <= center + 1; y++) {
        for(let x = center - 1; x <= center + 1; x++) newGrid[y][x] = 'path';
    }
    
    const midY = Math.floor(GRID_SIZE / 2);
    newGrid[midY][0] = 'path';
    newGrid[midY][GRID_SIZE-1] = 'path';

    return newGrid;
  };

  const setupLevel = useCallback(() => {
    if (words.length < 4) {
        alert("Bu oyun için en az 4 kelime gerekiyor.");
        onBack();
        return;
    }

    const maze = generateMaze();
    const target = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(target);

    const distractors = getSmartDistractors(target, words, 3);
    
    if (distractors.length < 3) {
        const remaining = 3 - distractors.length;
        const randoms = words
            .filter(w => w.english !== target.english && !distractors.includes(w))
            .sort(() => 0.5 - Math.random())
            .slice(0, remaining);
        distractors.push(...randoms);
    }
    
    const options = [target, ...distractors].sort(() => 0.5 - Math.random());

    const poolLocations = [
        { x: 1, y: 1 }, 
        { x: GRID_SIZE - 1 - POOL_SIZE, y: 1 }, 
        { x: 1, y: GRID_SIZE - 1 - POOL_SIZE }, 
        { x: GRID_SIZE - 1 - POOL_SIZE, y: GRID_SIZE - 1 - POOL_SIZE }
    ];

    const doorAreas: DoorArea[] = options.map((opt, i) => ({
        id: `door-${i}`,
        x: poolLocations[i].x,
        y: poolLocations[i].y,
        word: opt.turkish,
        isCorrect: opt.english === target.english
    }));

    setGrid(maze);
    gridRef.current = maze;
    setDoors(doorAreas);
    
    const center = Math.floor(GRID_SIZE / 2);
    setPlayerPos({ x: center, y: center });
    nextDirRef.current = {x: 0, y: 0};
    currentDirRef.current = {x: 0, y: 0};
    isMovingRef.current = false;

    const newEnemies: Enemy[] = [];
    const colors = ['#ef4444', '#f97316', '#a855f7'];
    
    const spawnPoints = [
        {x: 5, y: 5},
        {x: GRID_SIZE-6, y: 5},
        {x: 5, y: GRID_SIZE-6}
    ];

    for (let i = 0; i < ENEMY_COUNT; i++) {
        let ex = spawnPoints[i].x;
        let ey = spawnPoints[i].y;
        while(maze[ey][ex] === 'wall') { ex++; }

        newEnemies.push({
            id: i, 
            pos: { x: ex, y: ey }, 
            startPos: { x: ex, y: ey },
            state: 'wandering', 
            lastMove: { x: 0, y: 0 },
            targetPos: null,
            color: colors[i % colors.length],
            patience: 0
        });
    }
    setEnemies(newEnemies);
    setGameState('starting');
    setTimeout(() => { setGameState('playing'); }, 2000);

  }, [words, level]);

  const getValidMoves = (pos: Position, currentGrid: CellType[][]) => {
       const moves = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}];
       return moves.filter(m => {
           const nx = pos.x + m.x;
           const ny = pos.y + m.y;
           if (nx < 0 || nx >= GRID_SIZE) return true; 
           if (ny < 0 || ny >= GRID_SIZE) return false;
           return currentGrid[ny][nx] !== 'wall';
       });
  };

  const hasLineOfSight = (p1: Position, p2: Position, currentGrid: CellType[][]): boolean => {
      if (p1.x === p2.x) {
          const start = Math.min(p1.y, p2.y);
          const end = Math.max(p1.y, p2.y);
          for (let i = start + 1; i < end; i++) if (currentGrid[i][p1.x] === 'wall') return false;
          return true;
      } else if (p1.y === p2.y) {
          const start = Math.min(p1.x, p2.x);
          const end = Math.max(p1.x, p2.x);
          for (let i = start + 1; i < end; i++) if (currentGrid[p1.y][i] === 'wall') return false;
          return true;
      }
      return false;
  };

  const gameTick = () => {
      if (gameState !== 'playing') return;
      const maze = gridRef.current;
      const currentPos = playerPosRef.current;
      
      let dir = currentDirRef.current;
      const next = nextDirRef.current;

      if (next.x !== 0 || next.y !== 0) {
          const checkX = currentPos.x + next.x;
          const checkY = currentPos.y + next.y;
          if (checkX >= 0 && checkX < GRID_SIZE && checkY >= 0 && checkY < GRID_SIZE && maze[checkY][checkX] !== 'wall') {
              dir = next;
              currentDirRef.current = next;
              nextDirRef.current = {x: 0, y: 0}; 
          }
      }

      if (dir.x !== 0 || dir.y !== 0) {
          let newX = currentPos.x + dir.x;
          let newY = currentPos.y + dir.y;
          if (newX < 0) newX = GRID_SIZE - 1; else if (newX >= GRID_SIZE) newX = 0;

          if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE && maze[newY][newX] !== 'wall') {
              setPlayerPos({ x: newX, y: newY });
              const hitDoor = doorsRef.current.find(d => 
                  newX >= d.x && newX < d.x + POOL_SIZE &&
                  newY >= d.y && newY < d.y + POOL_SIZE
              );
              if (hitDoor) {
                  if (hitDoor.isCorrect) handleLevelWin(); else handleDoorFail();
                  currentDirRef.current = {x:0, y:0};
                  return;
              }
              isMovingRef.current = true;
          } else {
              isMovingRef.current = false;
          }
      } else {
          isMovingRef.current = false;
      }

      gameTickRef.current += 1;
      if (gameTickRef.current % 2 === 0) {
          moveEnemies(playerPosRef.current);
      }
      checkCollisions();
  };

  const moveEnemies = (targetPos: Position) => {
      const currentGrid = gridRef.current;
      setEnemies(prev => prev.map(enemy => {
          let newState = enemy.state;
          let target = enemy.targetPos;
          let patience = enemy.patience;

          const dist = Math.abs(enemy.pos.x - targetPos.x) + Math.abs(enemy.pos.y - targetPos.y);
          const canSeePlayer = dist < 12 && hasLineOfSight(enemy.pos, targetPos, currentGrid);

          if (canSeePlayer) {
              newState = 'chasing'; target = targetPos; patience = 60; 
          } else if (patience > 0) {
              patience--; newState = 'chasing';
          } else {
              newState = 'wandering'; target = null;
          }
          
          if (newState === 'chasing' && target && enemy.pos.x === target.x && enemy.pos.y === target.y) {
              newState = 'wandering'; target = null; patience = 0;
          }

          const possibleMoves = getValidMoves(enemy.pos, currentGrid).filter(m => {
             const nx = enemy.pos.x + m.x;
             const ny = enemy.pos.y + m.y;
             if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return false;
             const cell = currentGrid[ny][nx];
             if (cell === 'pool') return false;
             return true;
          });

          if (possibleMoves.length === 0) return enemy;

          let bestMove = { x: 0, y: 0 };

          if (newState === 'chasing' && target) {
              const dest = target;
              possibleMoves.sort((a, b) => {
                  const distA = Math.abs((enemy.pos.x + a.x) - dest.x) + Math.abs((enemy.pos.y + a.y) - dest.y);
                  const distB = Math.abs((enemy.pos.x + b.x) - dest.x) + Math.abs((enemy.pos.y + b.y) - dest.y);
                  return distA - distB;
              });
              bestMove = possibleMoves[0];
          } else {
              const nonReverseMoves = possibleMoves.filter(m => !(m.x === -enemy.lastMove.x && m.y === -enemy.lastMove.y));
              if (nonReverseMoves.length > 0) {
                  bestMove = nonReverseMoves[Math.floor(Math.random() * nonReverseMoves.length)];
              } else {
                  bestMove = possibleMoves[0] || {x:0, y:0};
              }
          }
          
          return { ...enemy, pos: { x: enemy.pos.x + bestMove.x, y: enemy.pos.y + bestMove.y }, lastMove: bestMove, state: newState, targetPos: target, patience: patience };
      }));
  };

  const checkCollisions = () => {
      const pPos = playerPosRef.current;
      const collision = enemiesRef.current.some(e => Math.abs(e.pos.x - pPos.x) < 1 && Math.abs(e.pos.y - pPos.y) < 1);
      if (collision) handleEnemyHit();
  };

  useEffect(() => {
      setupLevel();
      return () => stopGameLoop();
  }, []);

  const startGameLoop = () => {
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
      gameLoopIntervalRef.current = setInterval(gameTick, TICK_RATE);
  };

  const stopGameLoop = () => {
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
  };

  useEffect(() => {
      if (gameState === 'playing') startGameLoop(); else stopGameLoop();
      return () => stopGameLoop();
  }, [gameState]);

  const handleInput = (dx: number, dy: number) => {
      if (gameState !== 'playing') return;
      nextDirRef.current = { x: dx, y: dy };
      if (!isMovingRef.current && (currentDirRef.current.x === 0 && currentDirRef.current.y === 0)) {
          currentDirRef.current = { x: dx, y: dy }; 
      }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowUp') handleInput(0, -1);
      if (e.key === 'ArrowDown') handleInput(0, 1);
      if (e.key === 'ArrowLeft') handleInput(-1, 0);
      if (e.key === 'ArrowRight') handleInput(1, 0);
  }, [gameState]);

  useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const handleTouchEnd = (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) > 20 || Math.abs(dy) > 20) { 
          if (Math.abs(dx) > Math.abs(dy)) handleInput(dx > 0 ? 1 : -1, 0);
          else handleInput(0, dy > 0 ? 1 : -1);
      }
      touchStartRef.current = null;
  };

  const handleEnemyHit = () => {
      stopGameLoop();
      playSound('wrong');
      if (lives > 1) {
          setHitMessage('Yakalandın!');
          setGameState('hit');
          setTimeout(() => {
              setLives(l => l - 1);
              const center = Math.floor(GRID_SIZE / 2);
              setPlayerPos({ x: center, y: center });
              setEnemies(enemiesRef.current.map(e => ({ ...e, pos: e.startPos, state: 'wandering', lastMove: {x:0, y:0}, targetPos: null, patience: 0 })));
              currentDirRef.current = {x:0, y:0};
              nextDirRef.current = {x:0, y:0};
              setGameState('playing');
              setHitMessage('');
          }, 1500);
      } else {
          setGameState('lost');
          updateGameStats('maze', score);
          syncLocalToCloud();
      }
  };

  const handleDoorFail = () => {
      stopGameLoop();
      playSound('wrong');
      setHitMessage('Yanlış Kelime!');
      setGameState('hit');
      setScore(s => Math.max(0, s - 10));
      setTimeout(() => {
          const center = Math.floor(GRID_SIZE / 2);
          setPlayerPos({ x: center, y: center });
          currentDirRef.current = {x:0, y:0};
          nextDirRef.current = {x:0, y:0};
          setGameState('playing');
          setHitMessage('');
      }, 1000);
  };

  const handleLevelWin = () => {
      stopGameLoop();
      playSound('correct');
      
      const newScore = score + 50;
      setScore(newScore);

      // --- IMMEDIATE XP UPDATE START (Centralized Value) ---
      const xpGained = XP_GAINS.maze_level;
      updateStats(xpGained, { grade });
      updateQuestProgress('earn_xp', xpGained);
      updateGameStats('maze', newScore);
      updateQuestProgress('play_maze', 1);
      // --- IMMEDIATE XP UPDATE END ---
      
      syncLocalToCloud(); // Sync score

      setGameState('won');
      setTimeout(() => {
         setLevel(l => l + 1);
         setupLevel();
      }, 1000);
  };

  if (gameState === 'lost') {
      return (
          <div className="flex flex-col items-center justify-center h-full bg-[#0f172a] text-white p-6 text-center animate-in zoom-in">
              <Ghost size={80} className="text-red-500 mb-6 animate-bounce" />
              <h2 className="text-4xl font-black mb-2">Oyun Bitti!</h2>
              <p className="text-slate-400 mb-8 text-lg">Toplam Puan: <span className="text-yellow-400 font-bold">{score}</span></p>
              <div className="flex flex-col gap-4 w-full max-w-xs">
                  <button onClick={() => { setScore(0); setLevel(1); setLives(3); setupLevel(); }} className="px-6 py-4 bg-indigo-600 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                       <RotateCcw size={20} /> Tekrar Dene
                  </button>
                  <button onClick={handleExit} className="px-6 py-4 bg-slate-700 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                       <ArrowRight size={20} /> Çıkış
                  </button>
              </div>
          </div>
      );
  }

  // Won state
  if (gameState === 'won') {
       return (
          <div className="flex flex-col items-center justify-center h-full bg-[#0f172a] text-white p-6 text-center animate-in zoom-in">
              <CheckCircle size={80} className="text-green-500 mb-6 animate-bounce" />
              <h2 className="text-4xl font-black mb-2">Bölüm Tamamlandı!</h2>
              <p className="text-slate-400 mb-8 text-lg">Toplam Puan: <span className="text-yellow-400 font-bold">{score}</span></p>
               <div className="flex flex-col gap-4 w-full max-w-xs">
                   <div className="text-xl font-bold text-green-400 animate-pulse">Sonraki seviyeye geçiliyor...</div>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full h-full relative bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center touch-none select-none">
        {/* Game UI */}
        <div className="absolute top-4 left-0 w-full px-6 flex justify-between items-center z-20 pointer-events-none">
            <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl backdrop-blur-sm border border-slate-700">
                 <Bot size={20} className="text-indigo-400" />
                 <span className="font-mono font-bold text-white text-lg">{score}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-800/80 p-2 rounded-xl backdrop-blur-sm border border-slate-700">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-500' : 'bg-slate-600'}`}></div>
                ))}
            </div>
        </div>

         {/* Hit Message Overlay */}
         {gameState === 'hit' && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-500/20 backdrop-blur-[2px] animate-in fade-in duration-200">
                 <div className="bg-red-600 text-white px-8 py-4 rounded-3xl font-black text-2xl shadow-2xl animate-bounce">
                     {hitMessage}
                 </div>
             </div>
         )}
        
        {/* Target Word Hint */}
        <div className="absolute bottom-24 left-0 w-full px-6 flex justify-center z-20 pointer-events-none">
            <div className="bg-indigo-600/90 text-white px-6 py-3 rounded-2xl font-bold shadow-lg backdrop-blur-sm border border-indigo-500/50 flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-indigo-200 mb-1">HEDEF</span>
                <span className="text-xl">{currentWord?.english}</span>
                <span className="text-xs text-indigo-300 font-normal">{currentWord?.turkish}</span>
            </div>
        </div>

        {/* Controls (Mobile) */}
        <div className="absolute bottom-6 left-0 w-full px-6 z-30 flex justify-between items-end pointer-events-none">
            <button onClick={handleExit} className="pointer-events-auto p-3 bg-slate-800/80 rounded-full text-slate-400 hover:text-white border border-slate-700">
                 <XCircle size={24} />
            </button>
            
            <div className="pointer-events-auto grid grid-cols-3 gap-1 bg-slate-800/50 p-2 rounded-full backdrop-blur-sm">
                <div></div>
                <button onPointerDown={(e) => { e.preventDefault(); handleInput(0, -1); }} className="w-12 h-12 bg-slate-700 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"><ChevronUp /></button>
                <div></div>
                <button onPointerDown={(e) => { e.preventDefault(); handleInput(-1, 0); }} className="w-12 h-12 bg-slate-700 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"><ChevronLeft /></button>
                <div className="w-12 h-12 flex items-center justify-center text-slate-500"><Bot size={16} /></div>
                <button onPointerDown={(e) => { e.preventDefault(); handleInput(1, 0); }} className="w-12 h-12 bg-slate-700 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"><ChevronRightIcon /></button>
                <div></div>
                <button onPointerDown={(e) => { e.preventDefault(); handleInput(0, 1); }} className="w-12 h-12 bg-slate-700 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"><ChevronDown /></button>
                <div></div>
            </div>
        </div>

        {/* Game Area */}
        <div 
            className="relative w-full max-w-md aspect-square bg-[#020617] rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <MazeGrid grid={grid} doors={doors} />
            
            {/* Player */}
            <div 
                className="absolute w-[4.76%] h-[4.76%] bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6] z-10 transition-all duration-100 ease-linear flex items-center justify-center"
                style={{
                    left: `${playerPos.x * 4.76}%`,
                    top: `${playerPos.y * 4.76}%`,
                }}
            >
                <div className="w-[60%] h-[60%] bg-white rounded-full"></div>
            </div>

            {/* Enemies */}
            {enemies.map(enemy => (
                <div 
                    key={enemy.id}
                    className="absolute w-[4.76%] h-[4.76%] z-10 transition-all duration-[130ms] ease-linear flex items-center justify-center"
                    style={{
                        left: `${enemy.pos.x * 4.76}%`,
                        top: `${enemy.pos.y * 4.76}%`,
                        color: enemy.color
                    }}
                >
                    <Ghost size={16} className="fill-current animate-pulse" />
                </div>
            ))}
        </div>
    </div>
  );
};

export default MazeGame;
