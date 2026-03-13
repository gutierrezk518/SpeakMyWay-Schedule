// Text-to-speech functionality

// Check if browser supports speech synthesis
const isSpeechSupported = 'speechSynthesis' in window;

// Voice types with preferred voices for each type
export const voiceTypes = {
  // English voices
  "en-US-female-warm": { name: "Samantha", lang: "en-US", gender: "female", description: "Warm & Friendly Female" },
  "en-US-female-professional": { name: "Karen", lang: "en-US", gender: "female", description: "Professional Female" },
  "en-US-male-warm": { name: "Alex", lang: "en-US", gender: "male", description: "Warm & Friendly Male" },
  "en-US-male-deep": { name: "Daniel", lang: "en-US", gender: "male", description: "Deep & Clear Male" },
  "en-GB-female": { name: "Fiona", lang: "en-GB", gender: "female", description: "British Female" },
  "en-GB-male": { name: "Arthur", lang: "en-GB", gender: "male", description: "British Male" },
  "en-US-child": { name: "Junior", lang: "en-US", gender: "child", description: "Child Voice" },
  
  // Spanish voices
  "es-ES-female": { name: "Microsoft Sabina", lang: "es-ES", gender: "female", description: "Spanish Female" },
  "es-ES-male": { name: "Microsoft Pablo", lang: "es-ES", gender: "male", description: "Spanish Male" },
  "es-MX-female": { name: "Microsoft Paulina", lang: "es-MX", gender: "female", description: "Mexican Female" },
  "es-MX-male": { name: "Microsoft Raul", lang: "es-MX", gender: "male", description: "Mexican Male" },
  
  // Simplified options for UI
  "female": { name: "Google UK English Female", lang: "en-GB", gender: "female", description: "Female Voice" },
  "male": { name: "en-US-male-warm", lang: "en-US", gender: "male", description: "Male Voice" },
  
  // Default options
  "default": { name: "Default", lang: "en-US", gender: "neutral", description: "System Default" },
};

// Store voice preferences
let voicePreferences = {
  voiceType: "default", 
  rate: 1,
  volume: 0.8,
  language: "en-US" // or "es-ES" for Spanish
};

// Get all available voices for the current language
export function getAvailableVoices(language: string = "en"): SpeechSynthesisVoice[] {
  if (!isSpeechSupported) return [];
  
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return [];
  
  // Filter by language
  return voices.filter(voice => voice.lang.includes(language));
}

// Keywords used to identify voice gender from voice names
const maleKeywords = [
  'male', 'man', 'hombre', 'david', 'mark', 'daniel', 'guy',
  'pablo', 'raul', 'diego', 'jorge', 'carlos', 'enrique',
  'microsoft pablo', 'microsoft enrique', 'google uk english male'
];
const femaleKeywords = [
  'female', 'woman', 'mujer', 'girl', 'zira', 'fiona', 'lucia',
  'sabina', 'paulina', 'paloma', 'helena', 'pilar', 'ines',
  'lupe', 'esperanza', 'carmen',
  'microsoft helena', 'google uk english female', 'google español'
];
const childKeywords = ['child', 'kid', 'junior', 'young'];

// Filter voices by gender using keyword matching
function filterByGender(voices: SpeechSynthesisVoice[], gender: string): SpeechSynthesisVoice[] {
  const keywords = gender === 'male' ? maleKeywords
    : gender === 'female' ? femaleKeywords
    : gender === 'child' ? childKeywords
    : [];
  if (keywords.length === 0) return [];
  return voices.filter(v => {
    const name = v.name.toLowerCase();
    // For male, exclude "female" matches
    if (gender === 'male' && name.includes('female')) return false;
    return keywords.some(kw => name.includes(kw));
  });
}

// Filter voices by language prefix (e.g., "en", "es")
function filterByLang(voices: SpeechSynthesisVoice[], langPrefix: string): SpeechSynthesisVoice[] {
  return voices.filter(v => v.lang.startsWith(langPrefix));
}

// Resolve the effective gender from a voiceType string
function resolveGender(voiceType: string): string {
  if (voiceType === 'male' || voiceType === 'en-US-male-warm' || voiceType === 'en-US-male-deep') return 'male';
  if (voiceType === 'female' || voiceType === 'default') return 'female';
  if (voiceType === 'en-US-child') return 'child';
  // Parse from structured type like "en-US-female-warm"
  const parts = voiceType.split('-');
  if (parts.length >= 3) return parts[2];
  return '';
}

// Get the most realistic voice based on preferences
function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const voiceType = voicePreferences.voiceType;
  const langPrefix = voicePreferences.language.slice(0, 2);
  const gender = resolveGender(voiceType);
  const langVoices = filterByLang(voices, langPrefix);

  // Try gender-specific match within the target language
  if (gender) {
    const genderMatch = filterByGender(langVoices, gender);
    if (genderMatch.length > 0) return genderMatch[0];
  }

  // For English male, try well-known voices as fallback
  if (langPrefix === 'en' && gender === 'male') {
    const david = voices.find(v => v.name === "Microsoft David - English (United States)");
    if (david) return david;
    const usNonFemale = voices.find(v =>
      v.lang === "en-US" &&
      !v.name.toLowerCase().includes("female") &&
      !v.name.toLowerCase().includes("zira")
    );
    if (usNonFemale) return usNonFemale;
  }

  // For English female, try British female first
  if (langPrefix === 'en' && gender === 'female') {
    const britishFemale = voices.find(v =>
      v.name.toLowerCase().includes("uk english female") ||
      (v.lang === "en-GB" && v.name.toLowerCase().includes("female"))
    );
    if (britishFemale) return britishFemale;
  }

  // For Spanish with gender preference but no match, try index-based fallback
  if (langPrefix === 'es' && langVoices.length > 1 && gender === 'female') {
    return langVoices[1]; // Often the second Spanish voice is female
  }

  // Handle fully-specified voice types (e.g., "en-GB-female")
  const parts = voiceType.split('-');
  if (parts.length >= 3) {
    const exactLang = `${parts[0]}-${parts[1]}`;
    const exactMatches = voices.filter(v => v.lang === exactLang);
    if (exactMatches.length > 0) {
      const genderMatch = filterByGender(exactMatches, gender);
      if (genderMatch.length > 0) return genderMatch[0];
      return exactMatches[0];
    }
  }

  // Fallback to any voice for the language, or the first available voice
  return langVoices.length > 0 ? langVoices[0] : voices[0];
}

// Set voice preferences
export function setVoicePreferences(preferences: {
  voiceType?: string;
  rate?: number;
  volume?: number;
  language?: string;
}) {
  voicePreferences = { ...voicePreferences, ...preferences };
  
  // When language changes to Spanish, auto-switch to appropriate voice
  if (preferences.language && preferences.language.startsWith('es')) {
    voicePreferences.language = preferences.language.includes('MX') ? 'es-MX' : 'es-ES';
  } else if (preferences.language && preferences.language.startsWith('en')) {
    voicePreferences.language = 'en-US';
  }
  
}

// Speak text
export function speak(text: string): void {
  if (!isSpeechSupported) {
    console.error("Speech synthesis not supported in this browser");
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set voice if available
  const voice = getPreferredVoice();
  if (voice) utterance.voice = voice;
  
  // Set preferences
  utterance.rate = voicePreferences.rate;
  utterance.volume = voicePreferences.volume;
  utterance.lang = voicePreferences.language;
  
  // Speak
  window.speechSynthesis.speak(utterance);
}

// Speak sequence of texts with pause between each
export function speakWithPause(texts: string[], prefix: string = "", pauseDuration: number = 400): void {
  if (!isSpeechSupported || texts.length === 0) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  let currentIndex = 0;
  
  const speakNext = () => {
    if (currentIndex >= texts.length) return;
    
    const text = currentIndex === 0 ? prefix + texts[currentIndex] : texts[currentIndex];
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if available
    const voice = getPreferredVoice();
    if (voice) utterance.voice = voice;
    
    // Set preferences
    utterance.rate = voicePreferences.rate;
    utterance.volume = voicePreferences.volume;
    utterance.lang = voicePreferences.language;
    
    // Continue to next item after this one finishes
    utterance.onend = () => {
      currentIndex++;
      if (currentIndex < texts.length) {
        setTimeout(speakNext, pauseDuration);
      }
    };
    
    // Speak
    window.speechSynthesis.speak(utterance);
  };
  
  speakNext();
}

// Word prediction functionality
// Simple implementation for now, can be enhanced later
export function predictNextWords(lastWord: string): string[] {
  const commonFollowingWords: Record<string, string[]> = {
    "I": ["want", "need", "am", "will", "can"],
    "want": ["to", "some", "more", "it", "that"],
    "need": ["to", "help", "it", "some", "more"],
    "to": ["go", "eat", "play", "see", "get"],
    "go": ["to", "home", "outside", "now", "with"],
    "play": ["with", "games", "outside", "now", "together"],
    "eat": ["food", "now", "lunch", "breakfast", "dinner"],
    "drink": ["water", "juice", "milk", "soda", "now"],
    "feel": ["happy", "sad", "tired", "sick", "good"],
    "help": ["me", "please", "now", "with", "this"],
    "like": ["to", "it", "that", "this", "playing"],
    "see": ["the", "you", "that", "it", "them"],
    "get": ["it", "that", "some", "more", "ready"],
    "my": ["mom", "dad", "teacher", "friend", "toy"],
    "more": ["please", "time", "food", "water", "help"],
    "please": ["help", "stop", "wait", "give", "listen"],
    "thank": ["you", "mom", "dad", "teacher", "friends"],
    "no": ["thank", "way", "more", "please", "problem"],
    "yes": ["please", "I", "thank", "that's", "I'll"],
  };
  
  // Return predictions if we have them for this word
  if (lastWord.toLowerCase() in commonFollowingWords) {
    return commonFollowingWords[lastWord.toLowerCase()];
  }
  
  // Default predictions for words we don't have specific followups for
  return ["please", "now", "help", "more", "thank"];
}
