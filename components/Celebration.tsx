
import React, { useEffect, useState } from 'react';
import { Trophy, Star, X, PartyPopper } from 'lucide-react';

interface CelebrationProps {
  message: string;
  type: 'unit' | 'quiz' | 'goal';
  onClose: () => void;
}

const Celebration: React.FC<CelebrationProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Confetti CSS */}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: #f00;
          animation: confetti-fall 3s linear forwards;
        }
      `}</style>

      {/* Confetti Elements */}
      {visible && Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}vw`,
            top: `-10px`,
            backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 5)],
            animationDuration: `${Math.random() * 2 + 1}s`,
            animationDelay: `${Math.random() * 1}s`,
          }}
        />
      ))}

      {/* Card */}
      <div className={`relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full mx-4 transform transition-all duration-500 ${visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
        <div className="absolute -top-10 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-200 dark:shadow-none animate-bounce">
           {type === 'quiz' ? <Trophy size={40} className="text-white" /> : 
            type === 'goal' ? <PartyPopper size={40} className="text-white" /> :
            <Star size={40} className="text-white" fill="white" />}
        </div>

        <div className="mt-8 space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            {type === 'quiz' ? 'Tebrikler!' : type === 'goal' ? 'Hedef Tamam!' : 'Harika İş!'}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 font-medium text-lg leading-relaxed">
            {message}
          </p>
        </div>

        <button 
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          className="mt-6 w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
        >
          Devam Et
        </button>
      </div>
    </div>
  );
};

export default Celebration;
