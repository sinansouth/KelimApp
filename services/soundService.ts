
import { getAppSettings } from './userService';

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let ctx: AudioContext | null = null;

const initAudio = () => {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
};

// --- ROBUST TEXT-TO-SPEECH ---

export const speakText = (text: string) => {
    const settings = getAppSettings();
    if (!settings.soundEnabled) return;

    // Clean text (remove special chars that might confuse TTS)
    const cleanText = text.replace(/[^\w\s]/gi, '');

    // Strategy 1: Try Online Google TTS (Best Quality & Native Accent)
    // This bypasses the device's potentially bad TTS engine if internet is available.
    const playOnline = () => {
        return new Promise<void>((resolve, reject) => {
            if (!navigator.onLine) {
                reject("Offline");
                return;
            }
            
            // Using Google Translate's TTS API (Unofficial but widely used for lightweight tasks)
            // tl=en-us ensures American English pronunciation
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-us&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
            const audio = new Audio(url);
            
            // Handle audio playing
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => resolve())
                    .catch((error) => reject(error));
            } else {
                reject("Audio play blocked or failed");
            }
        });
    };

    // Strategy 2: Fallback to Native Browser TTS (Offline Capable)
    // Crucial: Forcefully find and select an English voice to prevent Turkish reading.
    const playNative = () => {
        if (!('speechSynthesis' in window)) return;

        const synth = window.speechSynthesis;
        
        // Cancel any ongoing speech
        if (synth.speaking) {
            synth.cancel();
        }

        const speak = () => {
            const utterance = new SpeechSynthesisUtterance(cleanText);
            const voices = synth.getVoices();
            
            // SMART VOICE SELECTION ALGORITHM
            // 1. Look for Google US English (High Quality on Android/Chrome)
            let selectedVoice = voices.find(v => v.name === 'Google US English');
            
            // 2. If not found, look for any US English voice
            if (!selectedVoice) selectedVoice = voices.find(v => v.lang === 'en-US');
            
            // 3. If not found, look for British English
            if (!selectedVoice) selectedVoice = voices.find(v => v.lang === 'en-GB');
            
            // 4. If not found, look for any English voice
            if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en'));

            if (selectedVoice) {
                utterance.voice = selectedVoice;
                utterance.lang = selectedVoice.lang; // Explicitly set lang
            } else {
                // Absolute fallback: Force lang tag even if voice object isn't found
                utterance.lang = 'en-US'; 
            }

            // Adjust properties for clarity
            utterance.rate = 0.9; // Slightly slower for better understanding
            utterance.pitch = 1;
            utterance.volume = 1;
            
            synth.speak(utterance);
        };

        // Chrome on Android sometimes loads voices asynchronously
        if (synth.getVoices().length === 0) {
            synth.addEventListener('voiceschanged', speak, { once: true });
        } else {
            speak();
        }
    };

    // Execute: Try Online first, if fails (offline/error), use Native
    playOnline().catch((err) => {
        // Fallback to native if online fails
        playNative();
    });
};

// --- SOUND EFFECTS ---

export const playSound = (type: 'correct' | 'wrong' | 'click' | 'success' | 'flip' | 'pop') => {
  const settings = getAppSettings();
  if (!settings.soundEnabled) return;

  try {
    const context = initAudio();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.connect(gain);
    gain.connect(context.destination);

    const now = context.currentTime;

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); 
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.1); 
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'flip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'success') {
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; 
      frequencies.forEach((freq, i) => {
        const o = context.createOscillator();
        const g = context.createGain();
        o.connect(g);
        g.connect(context.destination);
        o.type = 'sine';
        o.frequency.value = freq;
        const startTime = now + i * 0.08;
        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
        o.start(startTime);
        o.stop(startTime + 0.4);
      });
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};
