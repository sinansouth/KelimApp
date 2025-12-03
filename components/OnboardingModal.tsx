
import React, { useState } from 'react';
import { UserProfile, saveUserProfile } from '../services/userService';
import { playSound } from '../services/soundService';
import { Save, User, GraduationCap } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && grade) {
      const profile: UserProfile = {
        name,
        grade,
        avatar: '🧑‍🎓', 
        frame: 'frame_none',
        background: 'bg_default',
        purchasedThemes: ['light', 'dark'],
        purchasedFrames: ['frame_none'],
        purchasedBackgrounds: ['bg_default'],
        inventory: { streakFreezes: 0 }
      };
      saveUserProfile(profile);
      playSound('success');
      onComplete();
    } else {
      playSound('wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div 
        className="rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border"
        style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}
      >
        
        <div className="bg-indigo-600 p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-30"></div>
            <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg animate-bounce-subtle">
                    👋
                </div>
                <h2 className="text-2xl font-black text-white mb-1">KelimApp'e Hoş Geldin!</h2>
                <p className="text-indigo-100 text-sm font-medium">Seni daha yakından tanıyalım.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase ml-1" style={{color: 'var(--color-text-muted)'}}>Adın Soyadın</label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{color: 'var(--color-text-muted)'}} />
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    style={{
                        backgroundColor: 'var(--color-bg-main)', 
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-main)'
                    }}
                    placeholder="Örn: Ali Yılmaz"
                    required
                />
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-bold uppercase ml-1" style={{color: 'var(--color-text-muted)'}}>Sınıf / Seviye</label>
             <div className="relative">
                 <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{color: 'var(--color-text-muted)'}} />
                 <select
                     value={grade}
                     onChange={(e) => setGrade(e.target.value)}
                     className="w-full pl-10 pr-8 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                     style={{
                         backgroundColor: 'var(--color-bg-main)', 
                         borderColor: 'var(--color-border)',
                         color: 'var(--color-text-main)'
                     }}
                     required
                 >
                     <option value="" disabled>Seçiniz</option>
                     <optgroup label="İlkokul">
                         <option value="2">2. Sınıf</option>
                         <option value="3">3. Sınıf</option>
                         <option value="4">4. Sınıf</option>
                     </optgroup>
                     <optgroup label="Ortaokul">
                         <option value="5">5. Sınıf</option>
                         <option value="6">6. Sınıf</option>
                         <option value="7">7. Sınıf</option>
                         <option value="8">8. Sınıf</option>
                     </optgroup>
                     <optgroup label="Lise">
                         <option value="9">9. Sınıf</option>
                         <option value="10">10. Sınıf</option>
                         <option value="11">11. Sınıf</option>
                         <option value="12">12. Sınıf</option>
                     </optgroup>
                     <optgroup label="Genel İngilizce">
                         <option value="A1">A1 (Başlangıç)</option>
                         <option value="A2">A2 (Temel)</option>
                         <option value="B1">B1 (Orta)</option>
                         <option value="B2">B2 (Orta Üstü)</option>
                         <option value="C1">C1 (İleri)</option>
                     </optgroup>
                 </select>
             </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            <Save size={20} />
            Kaydet ve Başla
          </button>

        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
