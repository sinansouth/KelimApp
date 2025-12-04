import React from 'react';

// Use specific distinct URLs for testing logic, although these are placeholders.
// In a real scenario, these would be distinct transparent GIFs.
// Since I cannot edit the files, I am using mix-blend-mode to remove white backgrounds visually on light themes.
const MASCOT_GIFS = {
    neutral: 'https://8upload.com/image/683d30980d832725/neutral.png',
    happy: 'https://8upload.com/image/c725cfc9f2eb36c7/happy.png',
    sad: 'https://8upload.com/image/a365c1b92ddaff6e/sad.png',
    thinking: 'https://8upload.com/image/f78213d42d2c769f/thinking.png' // Placeholder: reuse neutral if specific thinking gif is missing
};

interface MascotProps {
    mood: 'neutral' | 'happy' | 'sad' | 'thinking';
    size?: number;
    message?: React.ReactNode; // Changed from string to ReactNode
}

const Mascot: React.FC<MascotProps> = ({ mood, size = 100, message }) => {
    const gifUrl = MASCOT_GIFS[mood] || MASCOT_GIFS.neutral;

    return (
        <div className="flex items-end gap-3 relative">
            <div className="relative shrink-0">
                {/* 
                   mix-blend-multiply removes white background in light mode.
                   The key={gifUrl} forces React to re-mount the image when source changes, ensuring the GIF plays from the start.
                */}
                <img 
                    key={gifUrl}
                    src={gifUrl} 
                    alt="Mascot" 
                    width={size} 
                    height={size}
                    className="object-contain mix-blend-multiply dark:mix-blend-normal"
                    style={{ maxWidth: '100%', height: 'auto' }}
                />
            </div>
            
            {message && (
                <div className="relative bg-white dark:bg-slate-800 text-slate-800 dark:text-white p-4 rounded-2xl rounded-bl-none shadow-lg border border-slate-200 dark:border-slate-700 text-sm font-medium max-w-[240px] min-w-[120px] animate-in fade-in slide-in-from-bottom-2 z-10 mb-6">
                    {message}
                    <div className="absolute -left-3 bottom-0 w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-white dark:border-t-slate-800 border-r-[12px] border-r-transparent transform translate-y-[2px] -rotate-12"></div>
                </div>
            )}
        </div>
    );
};

export default Mascot;
