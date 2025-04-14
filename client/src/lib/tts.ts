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
  "es-ES-female": { name: "Monica", lang: "es-ES", gender: "female", description: "Spanish Female" },
  "es-ES-male": { name: "Jorge", lang: "es-ES", gender: "male", description: "Spanish Male" },
  "es-MX-female": { name: "Paulina", lang: "es-MX", gender: "female", description: "Mexican Female" },
  "es-MX-male": { name: "Juan", lang: "es-MX", gender: "male", description: "Mexican Male" },
  
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

// Get the most realistic voice based on preferences
function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported) return null;
  
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  
  // Get language from preferences
  const language = voicePreferences.language.slice(0, 2);
  
  // Filter by language
  const langVoices = voices.filter(voice => voice.lang.includes(language));
  if (langVoices.length === 0) return voices[0];
  
  // If voiceType is just "default", return the first voice for the language
  if (voicePreferences.voiceType === "default") {
    return langVoices[0];
  }
  
  // Try to match voice type by name or characteristics
  const voiceType = voicePreferences.voiceType;
  const voiceInfo = voiceTypes[voiceType as keyof typeof voiceTypes];
  
  // If we have specific info for this voice type
  if (voiceInfo) {
    // Try to find a voice that matches the preferred name
    let matchedVoice = langVoices.find(v => 
      v.name.includes(voiceInfo.name) || 
      v.name.toLowerCase().includes(voiceInfo.name.toLowerCase())
    );
    
    // If we didn't find by name, try by gender/characteristics
    if (!matchedVoice) {
      matchedVoice = langVoices.find(v => {
        const vName = v.name.toLowerCase();
        if (voiceInfo.gender === "female") {
          return vName.includes("female") || vName.includes("woman") || vName.includes("girl");
        } else if (voiceInfo.gender === "male") {
          return vName.includes("male") || vName.includes("man") || vName.includes("guy");
        } else if (voiceInfo.gender === "child") {
          return vName.includes("child") || vName.includes("kid") || vName.includes("junior");
        }
        return false;
      });
    }
    
    if (matchedVoice) return matchedVoice;
  }
  
  // Fallback to simple matching if voice type doesn't match our known types
  if (voiceType.includes("female")) {
    const femaleVoice = langVoices.find(v => 
      v.name.toLowerCase().includes("female") || 
      v.name.toLowerCase().includes("woman")
    );
    return femaleVoice || langVoices[0];
  } else if (voiceType.includes("male")) {
    const maleVoice = langVoices.find(v => 
      v.name.toLowerCase().includes("male") || 
      v.name.toLowerCase().includes("man")
    );
    return maleVoice || langVoices[0];
  } else if (voiceType.includes("child")) {
    const childVoice = langVoices.find(v => 
      v.name.toLowerCase().includes("child") || 
      v.name.toLowerCase().includes("kid")
    );
    return childVoice || langVoices[0];
  }
  
  // Return first voice for the language as last resort
  return langVoices[0];
}

// Set voice preferences
export function setVoicePreferences(preferences: {
  voiceType?: string;
  rate?: number;
  volume?: number;
  language?: string;
}) {
  voicePreferences = { ...voicePreferences, ...preferences };
  
  // For debugging - log available voices
  if (isSpeechSupported && preferences.voiceType) {
    const voices = window.speechSynthesis.getVoices();
    console.log("Available voices:", voices.map(v => ({name: v.name, lang: v.lang})));
    console.log("Selected voice type:", preferences.voiceType);
    const voice = getPreferredVoice();
    console.log("Selected voice:", voice ? {name: voice.name, lang: voice.lang} : null);
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
