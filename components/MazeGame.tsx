
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WordCard, Badge, GradeLevel } from '../types';
import { Ghost, Bot, CheckCircle, XCircle, ArrowRight, MapPin } from 'lucide-react';
import { playSound } from '../services/soundService';
import { updateStats, updateQuestProgress, updateGameStats } from '../services/userService';

interface MazeGameProps {
  words: WordCard[];
  onFinish: () => void;
  onBack: () => void;
  onHome: () => void;
  onCelebrate?: (message: string, type: 'unit' | 'quiz' | 'goal') => void;
  grade?: GradeLevel | null;
}

// --- Constants ---
const GRID_SIZE = 21; // Odd number for maze generation
const POOL_SIZE = 3;  // 3x3 Goal Areas
const ENEMY_COUNT = 3;
const TICK_RATE = 130; 

type CellType = 'wall' | 'path' | 'pool';

interface Position {
  x: number;
  y: number;
}

interface DoorArea {
  id: string;
  // Top-left coordinate of the 3x3 pool
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
  lastMove: Position; // Direction of last move
  targetPos: Position | null; // Where it saw the player last
  startPos: Position;
  color: string;
  patience: number; // How long to keep chasing after losing sight
}

// --- Memoized Grid Component ---
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
            // Check if this cell is part of a door pool to render text overlay only once (at center)
            const isPool = cell === 'pool';
            let poolContent = null;
            
            if (isPool) {
                // Find which door this belongs to
                const door = doors.find(d => x >= d.x && x < d.x + POOL_SIZE && y >= d.y && y < d.y + POOL_SIZE);
                // Render text only at the center cell of the 3x3 pool
                if (door && x === door.x + 1 && y === door.y + 1) {
                    poolContent = (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none overflow-visible w-[300%] h-[300%] -translate-x-1/3 -translate-y-1/3">
                            <span className="text-[8px] sm:text-[10px] font-black text-yellow-200 text-center leading-tight drop-shadow-md px-1 break-words w-full">
                                {door.word}
                            </span>
                        </div>
                    );
                }
            }

            return (
                <div key={`${x}-${y}`} className={`w-full h-full relative ${cell === 'wall' ? 'bg-indigo-950 border-[0.5px] border-indigo-900/30' : cell === 'pool' ? 'bg-indigo-900/40' : ''}`}>
                     {/* Path Dot */}
                    {cell === 'path' && <div className="w-1 h-1 bg-white/5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>}
                    
                    {/* Pool Marker Icon (only in center) */}
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
  
  // Movement Refs
  const nextDirRef = useRef<Position>({ x: 0, y: 0 });
  const currentDirRef = useRef<Position>({ x: 0, y: 0 });
  const isMovingRef = useRef<boolean>(false);

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [doors, setDoors] = useState<DoorArea[]>([]);
  const [currentWord, setCurrentWord] = useState<WordCard | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'hit'>('playing');
  const [hitMessage, setHitMessage] = useState<string>('');

  // Game Loop Refs
  const playerPosRef = useRef<Position>({ x: 10, y: 10 });
  const doorsRef = useRef<DoorArea[]>([]);
  const enemiesRef = useRef<Enemy[]>([]); 
  const gridRef = useRef<CellType[][]>([]);
  const gameTickRef = useRef<number>(0);
  
  const gameLoopIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { doorsRef.current = doors; }, [doors]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  // --- Maze Generation ---
  const generateMaze = () => {
    const newGrid: CellType[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('wall'));
    
    // Recursive Backtracker for maze generation
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

    // Add extra loops to make it less linear (more pac-man like)
    for (let i = 0; i < GRID_SIZE * 6; i++) {
        const rx = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        const ry = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        if (newGrid[ry][rx] === 'wall') {
             // Check neighbors
             let pathNeighbors = 0;
             if (newGrid[ry-1]?.[rx] !== 'wall') pathNeighbors++;
             if (newGrid[ry+1]?.[rx] !== 'wall') pathNeighbors++;
             if (newGrid[ry]?.[rx-1] !== 'wall') pathNeighbors++;
             if (newGrid[ry]?.[rx+1] !== 'wall') pathNeighbors++;
             // Don't open walls that are surrounded by walls, only thin walls between paths
             if (pathNeighbors >= 2) newGrid[ry][rx] = 'path';
        }
    }

    // Carve 3x3 Pools in Corners and ensure they are connected
    const carvePool = (startX: number, startY: number) => {
        for(let y = 0; y < POOL_SIZE; y++) {
            for(let x = 0; x < POOL_SIZE; x++) {
                newGrid[startY + y][startX + x] = 'pool';
            }
        }
        // Ensure at least one connection to a path
        // Simply clear a ring around it to be sure
        if (newGrid[startY-1]?.[startX+1]) newGrid[startY-1][startX+1] = 'path';
        if (newGrid[startY+POOL_SIZE]?.[startX+1]) newGrid[startY+POOL_SIZE][startX+1] = 'path';
        if (newGrid[startY+1]?.[startX-1]) newGrid[startY+1][startX-1] = 'path';
        if (newGrid[startY+1]?.[startX+POOL_SIZE]) newGrid[startY+1][startX+POOL_SIZE] = 'path';
    };

    // Coordinates for 3x3 pools
    carvePool(1, 1); // Top Left
    carvePool(GRID_SIZE - 1 - POOL_SIZE, 1); // Top Right
    carvePool(1, GRID_SIZE - 1 - POOL_SIZE); // Bottom Left
    carvePool(GRID_SIZE - 1 - POOL_SIZE, GRID_SIZE - 1 - POOL_SIZE); // Bottom Right

    // Ensure start area is open
    for(let y = center - 1; y <= center + 1; y++) {
        for(let x = center - 1; x <= center + 1; x++) newGrid[y][x] = 'path';
    }
    
    // Teleport tunnels (Left-Right)
    const midY = Math.floor(GRID_SIZE / 2);
    newGrid[midY][0] = 'path';
    newGrid[midY][GRID_SIZE-1] = 'path';

    return newGrid;
  };

  // --- Setup Level ---
  const setupLevel = useCallback(() => {
    if (words.length < 4) {
        alert("Bu oyun için en az 4 kelime gerekiyor.");
        onBack();
        return;
    }

    const maze = generateMaze();
    const target = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(target);

    const distractors = words.filter(w => w.english !== target.english).sort(() => 0.5 - Math.random()).slice(0, 3);
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
    
    // Spawn enemies in corners (not inside pools if possible, but nearby)
    const spawnPoints = [
        {x: 5, y: 5},
        {x: GRID_SIZE-6, y: 5},
        {x: 5, y: GRID_SIZE-6}
    ];

    for (let i = 0; i < ENEMY_COUNT; i++) {
        // Find nearest valid path to spawn point
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
    setGameState('playing');
  }, [words, level]);

  // --- Movement Logic ---
  const getValidMoves = (pos: Position, currentGrid: CellType[][]) => {
       const moves = [
          {x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}
       ];
       return moves.filter(m => {
           const nx = pos.x + m.x;
           const ny = pos.y + m.y;
           // Check bounds and walls (allow teleport tunnel entry)
           if (nx < 0 || nx >= GRID_SIZE) return true; // Allow exiting grid for teleport for player
           if (ny < 0 || ny >= GRID_SIZE) return false;
           return currentGrid[ny][nx] !== 'wall';
       });
  };

  const hasLineOfSight = (p1: Position, p2: Position, currentGrid: CellType[][]): boolean => {
      // Simple check: same row or same col and no walls in between
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

  // --- Game Loop ---
  const gameTick = () => {
      if (gameState !== 'playing') return;
      const maze = gridRef.current;
      const currentPos = playerPosRef.current;
      
      // 1. Move Player
      let dir = currentDirRef.current;
      const next = nextDirRef.current;

      // Try to turn (Pre-turn logic)
      if (next.x !== 0 || next.y !== 0) {
          const checkX = currentPos.x + next.x;
          const checkY = currentPos.y + next.y;
          
          // Check Bounds & Walls
          if (checkX >= 0 && checkX < GRID_SIZE && checkY >= 0 && checkY < GRID_SIZE && maze[checkY][checkX] !== 'wall') {
              dir = next;
              currentDirRef.current = next;
              nextDirRef.current = {x: 0, y: 0}; 
          }
      }

      // Move Player
      if (dir.x !== 0 || dir.y !== 0) {
          let newX = currentPos.x + dir.x;
          let newY = currentPos.y + dir.y;

          // Teleport Logic
          if (newX < 0) newX = GRID_SIZE - 1;
          else if (newX >= GRID_SIZE) newX = 0;

          if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE && maze[newY][newX] !== 'wall') {
              setPlayerPos({ x: newX, y: newY });
              
              // Check Door Pool Collision
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
              // Hit wall, stop
              isMovingRef.current = false;
          }
      } else {
          isMovingRef.current = false;
      }

      // 2. Move Enemies (Slower than player: move every 2nd tick or use speed factor)
      // Here we move them every tick but they have their own logic
      gameTickRef.current += 1;
      if (gameTickRef.current % 2 === 0) {
          moveEnemies(playerPosRef.current);
      }

      // 3. Check Collisions
      checkCollisions();
  };

  const moveEnemies = (targetPos: Position) => {
      const currentGrid = gridRef.current;
      
      setEnemies(prev => prev.map(enemy => {
          let newState = enemy.state;
          let target = enemy.targetPos;
          let patience = enemy.patience;

          // Vision Check
          const dist = Math.abs(enemy.pos.x - targetPos.x) + Math.abs(enemy.pos.y - targetPos.y);
          const canSeePlayer = dist < 12 && hasLineOfSight(enemy.pos, targetPos, currentGrid);

          if (canSeePlayer) {
              newState = 'chasing';
              target = targetPos; // Update last seen position
              patience = 60; // Reset patience (approx 8 seconds)
          } else if (patience > 0) {
              // Lost sight but still has patience - Keep chasing last known location
              patience--;
              newState = 'chasing';
          } else {
              // Patience ran out
              newState = 'wandering';
              target = null;
          }
          
          // If chasing but arrived at last known target, reset to wandering immediately
          if (newState === 'chasing' && target && enemy.pos.x === target.x && enemy.pos.y === target.y) {
              newState = 'wandering';
              target = null;
              patience = 0;
          }

          // Determine Move Direction
          // Filter moves: Must be within grid bounds AND not 'wall' AND not 'pool'
          const possibleMoves = getValidMoves(enemy.pos, currentGrid).filter(m => {
             const nx = enemy.pos.x + m.x;
             const ny = enemy.pos.y + m.y;
             
             // STRICT BOUNDARY CHECK (No teleport for enemies)
             if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return false;
             
             // POOL CHECK - STRICT
             const cell = currentGrid[ny][nx];
             if (cell === 'pool') return false;
             
             return true;
          });

          if (possibleMoves.length === 0) return enemy;

          let bestMove = { x: 0, y: 0 };

          if (newState === 'chasing' && target) {
              // Move towards target
              const dest = target;
              // Sort moves by distance to target
              possibleMoves.sort((a, b) => {
                  const distA = Math.abs((enemy.pos.x + a.x) - dest.x) + Math.abs((enemy.pos.y + a.y) - dest.y);
                  const distB = Math.abs((enemy.pos.x + b.x) - dest.x) + Math.abs((enemy.pos.y + b.y) - dest.y);
                  return distA - distB;
              });
              bestMove = possibleMoves[0];
          } else {
              // Wandering with Inertia (Don't Look Back Logic)
              // Filter out the reverse of lastMove to prevent shaking/oscillating
              const nonReverseMoves = possibleMoves.filter(m => !(m.x === -enemy.lastMove.x && m.y === -enemy.lastMove.y));
              
              if (nonReverseMoves.length > 0) {
                  // Pick random from valid non-reverse moves
                  bestMove = nonReverseMoves[Math.floor(Math.random() * nonReverseMoves.length)];
              } else {
                  // Dead end, must turn back (only option is reverse)
                  bestMove = possibleMoves[0] || {x:0, y:0};
              }
          }
          
          return { 
              ...enemy, 
              pos: { x: enemy.pos.x + bestMove.x, y: enemy.pos.y + bestMove.y }, 
              lastMove: bestMove,
              state: newState,
              targetPos: target,
              patience: patience
          };
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
      if (gameState === 'playing') startGameLoop();
      else stopGameLoop();
      return () => stopGameLoop();
  }, [gameState]);

  // Input Handlers
  const handleInput = (dx: number, dy: number) => {
      if (gameState !== 'playing') return;
      nextDirRef.current = { x: dx, y: dy };
      // Instant move if stopped
      if (!isMovingRef.current && (currentDirRef.current.x === 0 && currentDirRef.current.y === 0)) {
          currentDirRef.current = { x: dx, y: dy }; 
          // Force a tick immediately for responsiveness
          // But be careful not to double-tick logic too fast, just set direction
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

  // Touch Input
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const handleTouchEnd = (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
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
              // Reset enemies
              setEnemies(enemiesRef.current.map(e => ({ 
                  ...e, 
                  pos: e.startPos, 
                  state: 'wandering',
                  lastMove: {x:0, y:0},
                  targetPos: null,
                  patience: 0
              })));
              currentDirRef.current = {x:0, y:0};
              nextDirRef.current = {x:0, y:0};
              setGameState('playing');
              setHitMessage('');
          }, 1500);
      } else {
          setGameState('lost');
          updateGameStats('maze', score);
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
      setScore(s => s + 50);
      
      // XP Rewards
      updateStats('quiz_correct', grade, undefined, 1);
      updateQuestProgress('earn_xp', 50);
      updateGameStats('maze', score + 50);
      
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
                  <button onClick={() => { setScore(0); setLevel(1); setLives(3); setupLevel(); }} className="px-6 py-4 bg-indigo-600 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform">Tekrar Dene</button>
                  <button onClick={onBack} className="px-6 py-4 bg-slate-700 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform">Çıkış</button>
              </div>
          </div>
      )
  }

  const getEntityStyle = (pos: Position, speed: number) => ({
      left: `${(pos.x / GRID_SIZE) * 100}%`,
      top: `${(pos.y / GRID_SIZE) * 100}%`,
      width: `${100 / GRID_SIZE}%`,
      height: `${100 / GRID_SIZE}%`,
      transition: `top ${speed}ms linear, left ${speed}ms linear`
  });

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-200 select-none overflow-hidden relative">
        {/* Info Bar */}
        <div className="p-3 flex justify-between items-center bg-slate-900/80 border-b border-slate-700 shadow-md shrink-0 z-20">
            <div className="flex items-center gap-4">
                <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                         <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? "bg-red-500 shadow-[0_0_8px_red]" : "bg-slate-700"}`} />
                    ))}
                </div>
                <div className="text-xs font-bold text-cyan-400 bg-slate-800 border border-cyan-900 px-3 py-1 rounded-full">LVL {level}</div>
            </div>
            <div className="font-black text-xl text-yellow-400 font-mono tracking-widest drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{score.toString().padStart(4, '0')}</div>
        </div>

        {/* Target Word */}
        <div className="py-4 text-center bg-slate-900/50 shrink-0 border-b border-slate-700 z-10 relative">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
             <span className="text-[10px] text-cyan-300 uppercase tracking-[0.2em] font-bold block mb-1 shadow-cyan-500/50">HEDEF KELİME</span>
             <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] px-2">{currentWord?.english}</h2>
        </div>

        {/* Maze Area */}
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden touch-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div className="relative rounded-xl shadow-2xl overflow-hidden bg-slate-900 border-4 border-slate-700 aspect-square w-full max-w-[500px]">
                
                <MazeGrid grid={grid} doors={doors} />

                {/* Entities Layer */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Enemies */}
                    {enemies.map((enemy) => (
                        <div key={enemy.id} className="absolute flex items-center justify-center z-20" style={getEntityStyle(enemy.pos, TICK_RATE * 2)}> 
                            <Ghost size={'75%'} color={enemy.color} fill={enemy.color} className="drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]" />
                            {enemy.state === 'chasing' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-red-500 animate-bounce font-bold text-xs">!</div>}
                        </div>
                    ))}

                    {/* Player */}
                    <div className="absolute flex items-center justify-center z-30" style={getEntityStyle(playerPos, TICK_RATE)}>
                        <div className="w-[70%] h-[70%] bg-cyan-400/20 blur-md rounded-full absolute animate-pulse"></div>
                        <Bot size={'80%'} className="text-cyan-300 fill-cyan-500/40 relative z-10 drop-shadow-[0_0_5px_cyan]" />
                    </div>
                </div>

                {/* Overlay Messages */}
                {(gameState === 'hit' || gameState === 'won') && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                         {gameState === 'won' ? <CheckCircle size={64} className="text-green-500 mb-4 animate-bounce" /> : <XCircle size={64} className="text-red-500 mb-4 animate-pulse" />}
                         <h3 className="text-3xl font-black text-white text-center px-4 drop-shadow-lg">{gameState === 'won' ? 'Doğru!' : hitMessage}</h3>
                    </div>
                )}
            </div>
        </div>

        {/* Controls Hint */}
        <div className="pb-safe text-center text-[10px] text-slate-500 p-2 flex justify-center gap-4 opacity-50">
             <span className="flex items-center gap-1">Kaydır <ArrowRight size={12}/></span>
             <span className="flex items-center gap-1">Veya Tuşlar</span>
        </div>
    </div>
  );
};

export default MazeGame;
