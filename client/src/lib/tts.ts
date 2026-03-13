// Text-to-speech functionality
// Primary: Google Cloud TTS (WaveNet) via Supabase Edge Function
// Fallback: Web Speech API (offline / error)

import { supabase } from "./supabase";

// ── Browser speech support ──────────────────────────────────────────
const isSpeechSupported = "speechSynthesis" in window;

// ── Voice types (kept for reference / UI labels) ────────────────────
export const voiceTypes = {
  "en-US-female-warm": { name: "Samantha", lang: "en-US", gender: "female", description: "Warm & Friendly Female" },
  "en-US-female-professional": { name: "Karen", lang: "en-US", gender: "female", description: "Professional Female" },
  "en-US-male-warm": { name: "Alex", lang: "en-US", gender: "male", description: "Warm & Friendly Male" },
  "en-US-male-deep": { name: "Daniel", lang: "en-US", gender: "male", description: "Deep & Clear Male" },
  "en-GB-female": { name: "Fiona", lang: "en-GB", gender: "female", description: "British Female" },
  "en-GB-male": { name: "Arthur", lang: "en-GB", gender: "male", description: "British Male" },
  "en-US-child": { name: "Junior", lang: "en-US", gender: "child", description: "Child Voice" },
  "es-ES-female": { name: "Microsoft Sabina", lang: "es-ES", gender: "female", description: "Spanish Female" },
  "es-ES-male": { name: "Microsoft Pablo", lang: "es-ES", gender: "male", description: "Spanish Male" },
  "es-MX-female": { name: "Microsoft Paulina", lang: "es-MX", gender: "female", description: "Mexican Female" },
  "es-MX-male": { name: "Microsoft Raul", lang: "es-MX", gender: "male", description: "Mexican Male" },
  "female": { name: "Google UK English Female", lang: "en-GB", gender: "female", description: "Female Voice" },
  "male": { name: "en-US-male-warm", lang: "en-US", gender: "male", description: "Male Voice" },
  "default": { name: "Default", lang: "en-US", gender: "neutral", description: "System Default" },
};

// ── Voice preferences ───────────────────────────────────────────────
let voicePreferences = {
  voiceType: "default",
  rate: 1,
  volume: 0.8,
  language: "en-US",
};

export function setVoicePreferences(preferences: {
  voiceType?: string;
  rate?: number;
  volume?: number;
  language?: string;
}) {
  voicePreferences = { ...voicePreferences, ...preferences };
  if (preferences.language && preferences.language.startsWith("es")) {
    voicePreferences.language = preferences.language.includes("MX") ? "es-MX" : "es-ES";
  } else if (preferences.language && preferences.language.startsWith("en")) {
    voicePreferences.language = "en-US";
  }
}

// ── In-memory audio cache ───────────────────────────────────────────
// Key = "text|lang|gender", Value = base64 audio string
const audioCache = new Map<string, string>();
const MAX_CACHE_SIZE = 200;

function getCacheKey(text: string, lang: string, gender: string): string {
  return `${text}|${lang}|${gender}`;
}

function addToCache(key: string, audioBase64: string) {
  // Evict oldest entry if cache is full
  if (audioCache.size >= MAX_CACHE_SIZE) {
    const firstKey = audioCache.keys().next().value;
    if (firstKey) audioCache.delete(firstKey);
  }
  audioCache.set(key, audioBase64);
}

// ── Resolve gender from voiceType ───────────────────────────────────
function resolveGender(voiceType: string): string {
  if (voiceType === "male" || voiceType === "en-US-male-warm" || voiceType === "en-US-male-deep") return "male";
  if (voiceType === "female" || voiceType === "default") return "female";
  if (voiceType === "en-US-child") return "female"; // Map child to female WaveNet
  const parts = voiceType.split("-");
  if (parts.length >= 3) return parts[2];
  return "female";
}

// ── Current Audio instance (for stopping) ───────────────────────────
let currentAudio: HTMLAudioElement | null = null;
// Generation counter: incremented on every speak() call.
// Stale async callbacks check this to avoid playing over a newer request.
let speakGeneration = 0;

function stopCurrentAudio() {
  speakGeneration++;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  if (isSpeechSupported) {
    window.speechSynthesis.cancel();
  }
}

// ── Google Cloud TTS via Edge Function ──────────────────────────────
async function fetchGoogleTTS(text: string, lang: string, gender: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

  try {
    const { data, error } = await supabase.functions.invoke("google-tts", {
      body: { text, language: lang, gender },
    });

    clearTimeout(timeout);

    if (error) throw new Error(error.message || "Edge function error");
    if (!data?.audioContent) throw new Error("No audio content returned");

    return data.audioContent;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ── Play base64 MP3 audio ───────────────────────────────────────────
function playBase64Audio(base64: string, volume: number): Promise<void> {
  return new Promise((resolve, reject) => {
    stopCurrentAudio();
    const audio = new Audio(`data:audio/mp3;base64,${base64}`);
    audio.volume = volume;
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      currentAudio = null;
      reject(new Error("Audio playback failed"));
    };
    audio.play().catch(reject);
  });
}

// ── Web Speech API fallback ─────────────────────────────────────────
const maleKeywords = [
  "male", "man", "hombre", "david", "mark", "daniel", "guy",
  "pablo", "raul", "diego", "jorge", "carlos", "enrique",
  "microsoft pablo", "microsoft enrique", "google uk english male",
];
const femaleKeywords = [
  "female", "woman", "mujer", "girl", "zira", "fiona", "lucia",
  "sabina", "paulina", "paloma", "helena", "pilar", "ines",
  "lupe", "esperanza", "carmen",
  "microsoft helena", "google uk english female", "google español",
];

function filterByGender(voices: SpeechSynthesisVoice[], gender: string): SpeechSynthesisVoice[] {
  const keywords = gender === "male" ? maleKeywords : gender === "female" ? femaleKeywords : [];
  if (keywords.length === 0) return [];
  return voices.filter((v) => {
    const name = v.name.toLowerCase();
    if (gender === "male" && name.includes("female")) return false;
    return keywords.some((kw) => name.includes(kw));
  });
}

function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const langPrefix = voicePreferences.language.slice(0, 2);
  const gender = resolveGender(voicePreferences.voiceType);
  const langVoices = voices.filter((v) => v.lang.startsWith(langPrefix));

  if (gender) {
    const match = filterByGender(langVoices, gender);
    if (match.length > 0) return match[0];
  }

  if (langPrefix === "en" && gender === "male") {
    const david = voices.find((v) => v.name === "Microsoft David - English (United States)");
    if (david) return david;
  }

  if (langPrefix === "en" && gender === "female") {
    const brit = voices.find((v) => v.name.toLowerCase().includes("uk english female") || (v.lang === "en-GB" && v.name.toLowerCase().includes("female")));
    if (brit) return brit;
  }

  return langVoices.length > 0 ? langVoices[0] : voices[0] || null;
}

function speakWithWebSpeech(text: string): void {
  if (!isSpeechSupported) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getPreferredVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = voicePreferences.rate;
  utterance.volume = voicePreferences.volume;
  utterance.lang = voicePreferences.language;
  window.speechSynthesis.speak(utterance);
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Speak text using Google Cloud TTS, falling back to Web Speech API.
 * Safe to call fire-and-forget (errors are handled internally).
 */
export function speak(text: string): void {
  if (!text) return;
  stopCurrentAudio();

  const gen = speakGeneration; // capture current generation
  const lang = voicePreferences.language.slice(0, 2);
  const gender = resolveGender(voicePreferences.voiceType);
  const cacheKey = getCacheKey(text, lang, gender);

  // Check cache first
  const cached = audioCache.get(cacheKey);
  if (cached) {
    if (gen !== speakGeneration) return; // stale
    playBase64Audio(cached, voicePreferences.volume).catch(() => {
      if (gen !== speakGeneration) return;
      speakWithWebSpeech(text);
    });
    return;
  }

  // Try Google Cloud TTS, fall back to Web Speech API
  fetchGoogleTTS(text, lang, gender)
    .then((audioBase64) => {
      addToCache(cacheKey, audioBase64);
      if (gen !== speakGeneration) return; // stale — a newer speak() was called
      return playBase64Audio(audioBase64, voicePreferences.volume);
    })
    .catch(() => {
      if (gen !== speakGeneration) return; // stale
      speakWithWebSpeech(text);
    });
}

/**
 * Speak a sequence of texts with pauses between each.
 */
export function speakWithPause(texts: string[], prefix: string = "", pauseDuration: number = 400): void {
  if (texts.length === 0) return;
  stopCurrentAudio();

  const gen = speakGeneration; // capture current generation
  const lang = voicePreferences.language.slice(0, 2);
  const gender = resolveGender(voicePreferences.voiceType);

  let index = 0;

  const speakNext = () => {
    if (gen !== speakGeneration) return; // stale
    if (index >= texts.length) return;
    const text = index === 0 ? prefix + texts[index] : texts[index];
    index++;

    const cacheKey = getCacheKey(text, lang, gender);
    const cached = audioCache.get(cacheKey);

    if (cached) {
      playBase64Audio(cached, voicePreferences.volume)
        .then(() => { if (gen === speakGeneration) setTimeout(speakNext, pauseDuration); })
        .catch(() => {
          if (gen !== speakGeneration) return;
          speakWithWebSpeech(text);
          setTimeout(speakNext, pauseDuration + 1500);
        });
      return;
    }

    fetchGoogleTTS(text, lang, gender)
      .then((audioBase64) => {
        addToCache(cacheKey, audioBase64);
        if (gen !== speakGeneration) return;
        return playBase64Audio(audioBase64, voicePreferences.volume);
      })
      .then(() => { if (gen === speakGeneration) setTimeout(speakNext, pauseDuration); })
      .catch(() => {
        if (gen !== speakGeneration) return;
        speakWithWebSpeech(text);
        setTimeout(speakNext, pauseDuration + 1500);
      });
  };

  speakNext();
}

// ── Utility exports ─────────────────────────────────────────────────

export function getAvailableVoices(language: string = "en"): SpeechSynthesisVoice[] {
  if (!isSpeechSupported) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices.filter((voice) => voice.lang.includes(language));
}

// Word prediction (unchanged)
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

  if (lastWord.toLowerCase() in commonFollowingWords) {
    return commonFollowingWords[lastWord.toLowerCase()];
  }
  return ["please", "now", "help", "more", "thank"];
}
