// Text-to-speech functionality

// Check if browser supports speech synthesis
const isSpeechSupported = 'speechSynthesis' in window;

// Store voice preferences
let voicePreferences = {
  voiceType: "default", // "default", "child", "female", "male"
  rate: 1,
  volume: 0.8,
  language: "en-US" // or "es-ES" for Spanish
};

// Get the appropriate voice based on preferences
function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported) return null;
  
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  
  // Filter by language
  const langVoices = voices.filter(voice => voice.lang.includes(voicePreferences.language.slice(0, 2)));
  if (langVoices.length === 0) return voices[0];
  
  // Try to match voice type preference
  if (voicePreferences.voiceType === "default") {
    return langVoices[0];
  } else if (voicePreferences.voiceType === "female") {
    const femaleVoice = langVoices.find(v => v.name.includes("female") || v.name.includes("woman"));
    return femaleVoice || langVoices[0];
  } else if (voicePreferences.voiceType === "male") {
    const maleVoice = langVoices.find(v => v.name.includes("male") || v.name.includes("man"));
    return maleVoice || langVoices[0];
  } else if (voicePreferences.voiceType === "child") {
    const childVoice = langVoices.find(v => v.name.includes("child") || v.name.includes("kid"));
    return childVoice || langVoices[0];
  }
  
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
