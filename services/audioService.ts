
/**
 * Plays audio for the given text.
 * Strictly uses Browser Native TTS (SpeechSynthesis) for Offline capabilities.
 * No external API calls are made.
 */
export const speakText = async (text: string): Promise<void> => {
  await playBrowserTTS(text);
};

// Helper for SpeechSynthesis
const playBrowserTTS = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis not supported.");
      resolve();
      return;
    }

    // Cancel any ongoing speech to prevent queue buildup
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85; // Slightly slower for clarity

    // Try to select a high-quality voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      (voice.name.includes('Google') && voice.lang.includes('en-US')) || 
      (voice.name.includes('Samantha')) || // macOS high quality
      (voice.lang === 'en-US')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
};