import { createContext, useContext, useState, ReactNode } from "react";
import { speak } from "@/lib/tts";

interface AppContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  voiceSettings: {
    voiceType: string;
    rate: number;
    volume: number;
  };
  setVoiceSettings: (settings: { voiceType: string; rate: number; volume: number }) => void;
  displaySettings: {
    textSize: number;
    highContrast: boolean;
    reduceAnimations: boolean;
  };
  setDisplaySettings: (settings: { textSize: number; highContrast: boolean; reduceAnimations: boolean }) => void;
  messageWords: { id: string; word: string }[];
  addMessageWord: (word: string) => void;
  removeMessageWord: (id: string) => void;
  clearMessageWords: () => void;
  speakMessage: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState("home");
  const [language, setLanguage] = useState("en");
  const [userName, setUserName] = useState("");
  const [voiceSettings, setVoiceSettings] = useState({
    voiceType: "default",
    rate: 1,
    volume: 0.8,
  });
  const [displaySettings, setDisplaySettings] = useState({
    textSize: 1.5,
    highContrast: false,
    reduceAnimations: false,
  });
  const [messageWords, setMessageWords] = useState<{ id: string; word: string }[]>([]);

  const addMessageWord = (word: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setMessageWords([...messageWords, { id, word }]);
    speak(word);
  };

  const removeMessageWord = (id: string) => {
    setMessageWords(messageWords.filter((mw) => mw.id !== id));
  };

  const clearMessageWords = () => {
    setMessageWords([]);
  };

  const speakMessage = () => {
    const message = messageWords.map((mw) => mw.word).join(" ");
    speak(message);
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        language,
        setLanguage,
        userName,
        setUserName,
        voiceSettings,
        setVoiceSettings,
        displaySettings,
        setDisplaySettings,
        messageWords,
        addMessageWord,
        removeMessageWord,
        clearMessageWords,
        speakMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
