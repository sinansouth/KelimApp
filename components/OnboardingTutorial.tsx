




import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check, Star, ShoppingBag, User, ArrowRight, Target } from 'lucide-react';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Hoş Geldin!",
    desc: "KelimApp ile İngilizce öğrenme yolculuğuna başlamaya hazırsın. Sana kısa bir tur attıralım.",
    icon: <span className="text-4xl">👋</span>,
    target: null, // No target, center screen
  },
  {
    title: "Seviyeni Seç",
    desc: "Önce okul düzeyini veya Genel İngilizce seviyeni buradan seçerek başla.",
    icon: <Star size={32} className="text-yellow-400" />,
    target: "category-section",
  },
  {
    title: "Kozmetikler",
    desc: "Çalıştıkça XP kazan. Bu puanlarla Kozmetikler Market'ten yeni temalar, çerçeveler ve arka planlar alabilirsin. Seviye atladıkça yeni eşyaların kilidi açılır.",
    icon: <ShoppingBag size={32} className="text-orange-500" />,
    target: "market-button",
  },
  {
    title: "Profil ve İlerleme",
    desc: "Rozetlerini, seviyeni ve istatistiklerini profilinden takip et.",
    icon: <User size={32} className="text-indigo-500" />,
    target: "profile-button",
  },
  {
    title: "Hazırsın!",
    desc: "Artık kelime avına çıkabilirsin. İyi eğlenceler!",
    icon: <Check size={32} className="text-green-500" />,
    target: null,
  }
];

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
  const [cardPosition, setCardPosition] = useState<'top' | 'bottom' | 'center'>('center');

  useEffect(() => {
    const targetId = steps[currentStep].target;
    
    if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });

        // Scroll to element to ensure it's visible
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Decide where to put the card (Top or Bottom) based on element position
        const screenHeight = window.innerHeight;
        if (rect.top > screenHeight / 2) {
          setCardPosition('top'); // Element is at bottom, put card at top
        } else {
          setCardPosition('bottom'); // Element is at top, put card at bottom
        }
      } else {
        // Fallback if element not found
        setTargetRect(null);
        setCardPosition('center');
      }
    } else {
      setTargetRect(null);
      setCardPosition('center');
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  // Dynamic Styles for the Card
  const getCardStyle = () => {
    const baseStyle = "fixed w-11/12 max-w-sm p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[202] transition-all duration-500 ease-in-out left-1/2 transform -translate-x-1/2";
    
    if (cardPosition === 'center') {
      return `${baseStyle} top-1/2 -translate-y-1/2`;
    } else if (cardPosition === 'top') {
      return `${baseStyle} top-24`; // Position near top
    } else {
      return `${baseStyle} bottom-24`; // Position near bottom
    }
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      
      {/* 
         SPOTLIGHT EFFECT:
         Instead of backdrop-filter, we use a massive box-shadow on a transparent div.
         This creates a clear "hole" over the target element while darkening the rest.
      */}
      {targetRect ? (
        <div 
          className="absolute rounded-xl transition-all duration-500 ease-in-out z-[201] pointer-events-none border-2 border-white/50 animate-pulse-fast"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)' // Dark overlay around the hole
          }}
        />
      ) : (
        // Full screen dark overlay for steps without target
        <div className="absolute inset-0 bg-black/80 z-[201] transition-opacity duration-500" />
      )}

      {/* CLICKABLE AREA TO ADVANCE (Invisible layer covering everything except card) */}
      <div className="absolute inset-0 z-[201]" onClick={handleNext}></div>

      {/* TUTORIAL CARD */}
      <div className={getCardStyle()}>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-full shadow-inner text-4xl">
                {steps[currentStep].icon}
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                {steps[currentStep].title}
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed font-medium">
                {steps[currentStep].desc}
            </p>

            <div className="flex items-center justify-between w-full border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex gap-1.5">
                    {steps.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-indigo-600 w-6' : 'bg-slate-200 dark:bg-slate-700 w-1.5'}`}
                        />
                    ))}
                </div>
                <button 
                    onClick={handleNext}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2 text-sm"
                >
                    {currentStep === steps.length - 1 ? 'Başla' : 'İlerle'} <ArrowRight size={16} />
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
