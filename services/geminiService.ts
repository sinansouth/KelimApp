// This service is deprecated as the app is now offline-first.
// No API keys or internet connection required.
export const speakText = async (text: string): Promise<void> => {
  console.warn("Gemini Service is deprecated. Use audioService instead.");
};

export const generateVocabularyList = async (topic: string): Promise<any[]> => {
  console.warn("Gemini Service is deprecated. Use local vocabulary instead.");
  return [];
};
