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

// Get the most realistic voice based on preferences
function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported) return null;
  
  const voices = window.speechSynthesis.getVoices();
  console.log("Available voices:", voices.map(v => ({ name: v.name, lang: v.lang })));
  
  if (voices.length === 0) return null;
  
  // Get the full voice type and language preferences
  const voiceType = voicePreferences.voiceType;
  console.log("Selected voice type:", voiceType);
  
  // First check if we're in Spanish mode and prioritize Spanish voices
  const currentLanguage = voicePreferences.language;
  const isSpanish = currentLanguage.startsWith('es');
  
  if (isSpanish) {
    // Spanish voice selection
    const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
    
    if (voiceType === "male" || voiceType === "en-US-male-warm") {
      // Look for Spanish male voices
      const spanishMaleVoices = spanishVoices.filter(v => {
        const name = v.name.toLowerCase();
        return name.includes('pablo') || name.includes('raul') || name.includes('diego') ||
               name.includes('male') || name.includes('man') || name.includes('hombre');
      });
      
      if (spanishMaleVoices.length > 0) {
        console.log("Using Spanish male voice:", spanishMaleVoices[0].name);
        return spanishMaleVoices[0];
      }
    }
    
    if (voiceType === "female" || voiceType === "default") {
      // Look for Spanish female voices
      const spanishFemaleVoices = spanishVoices.filter(v => {
        const name = v.name.toLowerCase();
        return name.includes('sabina') || name.includes('paulina') || name.includes('paloma') ||
               name.includes('female') || name.includes('woman') || name.includes('mujer');
      });
      
      if (spanishFemaleVoices.length > 0) {
        console.log("Using Spanish female voice:", spanishFemaleVoices[0].name);
        return spanishFemaleVoices[0];
      }
    }
    
    // Fallback to any Spanish voice if specific gender not found
    if (spanishVoices.length > 0) {
      console.log("Using fallback Spanish voice:", spanishVoices[0].name);
      return spanishVoices[0];
    }
  }
  
  // Handle simple "male" and "female" options directly for English
  if (voiceType === "male" || voiceType === "en-US-male-warm") {
    // For the original warm male voice, we'll use the Microsoft David voice which is warm and friendly
    const warmMaleVoice = voices.find(v => v.name === "Microsoft David - English (United States)");
    
    if (warmMaleVoice) {
      console.log("Using original warm male voice (Microsoft David)");
      return warmMaleVoice;
    }
    
    // If Microsoft David isn't available, try other common deep male voices
    const otherMaleVoice = voices.find(v => 
      v.name === "Microsoft Mark - English (United States)" || 
      v.name.includes("Daniel") || 
      (v.lang === "en-US" && v.name.toLowerCase().includes("male"))
    );
    
    if (otherMaleVoice) {
      console.log("Using alternative male voice:", otherMaleVoice.name);
      return otherMaleVoice;
    }

    // Last resort: any male voice or US English voice
    const anyMaleVoice = voices.filter(v => {
      const name = v.name.toLowerCase();
      return (name.includes("male") && !name.includes("female"));
    });
    
    if (anyMaleVoice.length > 0) {
      console.log("Using available male voice:", anyMaleVoice[0].name);
      return anyMaleVoice[0];
    }
    
    // Final fallback: any US English voice that isn't explicitly female
    const usVoice = voices.find(v => 
      v.lang === "en-US" && 
      !v.name.toLowerCase().includes("female") &&
      !v.name.toLowerCase().includes("zira")
    );
    
    if (usVoice) {
      console.log("Using US voice:", usVoice.name);
      return usVoice;
    }
  }
  
  if (voiceType === "female" || voiceType === "default") {
    // First, try to get the British female voice specifically
    const britishFemaleVoice = voices.find(v => 
      v.name.toLowerCase().includes("uk english female") || 
      (v.lang === "en-GB" && v.name.toLowerCase().includes("female"))
    );
    
    if (britishFemaleVoice) {
      console.log("Selected BRITISH FEMALE voice:", {
        name: britishFemaleVoice.name,
        lang: britishFemaleVoice.lang
      });
      return britishFemaleVoice;
    }
    
    // If no British female voice, try to find any female voice in English
    const englishFemaleVoices = voices.filter(v => {
      const name = v.name.toLowerCase();
      const isEnglish = v.lang.includes("en");
      const isFemale = name.includes("female") || name.includes("woman") || 
                      name.includes("girl") || name.includes("zira");
      return isEnglish && isFemale;
    });
    
    if (englishFemaleVoices.length > 0) {
      console.log("Selected FEMALE voice:", {
        name: englishFemaleVoices[0].name,
        lang: englishFemaleVoices[0].lang
      });
      return englishFemaleVoices[0];
    }
  }
  
  // If voiceType is just "default", return the first voice for the language
  if (voiceType === "default") {
    // Get voices for the selected language
    const langVoices = voices.filter(voice => voice.lang.includes(voicePreferences.language.slice(0, 2)));
    return langVoices.length > 0 ? langVoices[0] : voices[0];
  }
  
  // Parse the detailed voice type (e.g., "en-US-female-warm" => language: en-US, gender: female, style: warm)
  const voiceParts = voiceType.split("-");
  
  // Handle fully specified voice types (like en-US-female-warm)
  if (voiceParts.length >= 3) {
    const language = `${voiceParts[0]}-${voiceParts[1]}`;
    const gender = voiceParts.length > 2 ? voiceParts[2] : "";
    
    // Filter by language first
    let langMatches = voices.filter(v => v.lang.includes(language.slice(0, 2)));
    
    // Try for exact language match first
    const exactLangMatches = langMatches.filter(v => v.lang === language);
    if (exactLangMatches.length > 0) {
      langMatches = exactLangMatches;
    }
    
    // Then by gender
    if (gender && langMatches.length > 0) {
      const genderMatches = langMatches.filter(v => {
        const name = v.name.toLowerCase();
        if (gender === "female") {
          return name.includes("female") || name.includes("woman") || 
                 name.includes("girl") || name.includes("zira") || 
                 name.includes("fiona") || name.includes("google uk english female");
        } else if (gender === "male") {
          return name.includes("male") || name.includes("man") || 
                 name.includes("guy") || name.includes("david") || 
                 name.includes("mark") || name.includes("google uk english male");
        } else if (gender === "child") {
          return name.includes("child") || name.includes("kid") || 
                 name.includes("junior") || name.includes("young");
        }
        return false;
      });
      
      if (genderMatches.length > 0) {
        console.log("Selected voice:", {
          name: genderMatches[0].name,
          lang: genderMatches[0].lang
        });
        return genderMatches[0];
      }
    }
    
    // If we have language matches but no gender match, return the first language match
    if (langMatches.length > 0) {
      console.log("Selected voice:", {
        name: langMatches[0].name,
        lang: langMatches[0].lang
      });
      return langMatches[0];
    }
  }
  
  // Handle simplified options (like "female", "male", "child")
  if (["female", "male", "child"].includes(voiceType)) {
    // Get voices for the selected language
    const langVoices = voices.filter(voice => voice.lang.includes(voicePreferences.language.slice(0, 2)));
    
    // Find a voice matching the gender
    const genderMatches = langVoices.filter(v => {
      const name = v.name.toLowerCase();
      if (voiceType === "female") {
        return name.includes("female") || name.includes("woman") || name.includes("girl");
      } else if (voiceType === "male") {
        return name.includes("male") || name.includes("man") || name.includes("guy");
      } else if (voiceType === "child") {
        return name.includes("child") || name.includes("kid") || name.includes("junior");
      }
      return false;
    });
    
    if (genderMatches.length > 0) {
      console.log("Selected voice:", {
        name: genderMatches[0].name,
        lang: genderMatches[0].lang
      });
      return genderMatches[0];
    }
    
    // If no gender match but we have language matches, return the first language match
    if (langVoices.length > 0) {
      console.log("Selected voice:", {
        name: langVoices[0].name,
        lang: langVoices[0].lang
      });
      return langVoices[0];
    }
  }
  
  // Fallback to the first voice
  console.log("Selected voice (fallback):", {
    name: voices[0].name,
    lang: voices[0].lang
  });
  return voices[0];
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
