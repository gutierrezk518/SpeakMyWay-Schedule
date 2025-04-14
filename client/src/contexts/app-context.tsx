import { createContext, useContext, useState, ReactNode, SetStateAction } from "react";
import { speak } from "@/lib/tts";
import { ScheduleActivity } from "@/data/scheduleData";

// Define the voice settings type
type VoiceSettingsType = {
  voiceType: string;
  rate: number;
  volume: number;
  language: string;
};

interface AppContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  voiceSettings: VoiceSettingsType;
  setVoiceSettings: React.Dispatch<React.SetStateAction<VoiceSettingsType>>;
  displaySettings: {
    textSize: number;
    highContrast: boolean;
    reduceAnimations: boolean;
  };
  setDisplaySettings: React.Dispatch<React.SetStateAction<{
    textSize: number;
    highContrast: boolean;
    reduceAnimations: boolean;
  }>>;
  messageWords: { id: string; word: string }[];
  addMessageWord: (word: string) => void;
  removeMessageWord: (id: string) => void;
  clearMessageWords: () => void;
  speakMessage: () => void;
  // Schedule history for undo/redo functionality
  scheduleHistory: ScheduleActivity[][];
  scheduleHistoryIndex: number;
  addToScheduleHistory: (schedule: ScheduleActivity[]) => void;
  canUndo: boolean;
  canRedo: boolean;
  undoScheduleChange: () => ScheduleActivity[] | undefined;
  redoScheduleChange: () => ScheduleActivity[] | undefined;
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
    language: "en-US",
  });
  const [displaySettings, setDisplaySettings] = useState({
    textSize: 1.5,
    highContrast: false,
    reduceAnimations: false,
  });
  const [messageWords, setMessageWords] = useState<{ id: string; word: string }[]>([]);
  
  // Undo/Redo state
  const [scheduleHistory, setScheduleHistory] = useState<ScheduleActivity[][]>([[]]);
  const [scheduleHistoryIndex, setScheduleHistoryIndex] = useState(0);
  
  // Derived properties
  const canUndo = scheduleHistoryIndex > 0;
  const canRedo = scheduleHistoryIndex < scheduleHistory.length - 1;

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
  
  // Add current schedule to history
  const addToScheduleHistory = (schedule: ScheduleActivity[]) => {
    // Create deep copy to prevent reference issues
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    
    // If we're in the middle of the history, truncate forward history
    const newHistory = scheduleHistory.slice(0, scheduleHistoryIndex + 1);
    
    // Add new state to history
    newHistory.push(newSchedule);
    
    // Update history and point to latest state
    setScheduleHistory(newHistory);
    setScheduleHistoryIndex(newHistory.length - 1);
  };
  
  // Undo the last action
  const undoScheduleChange = (): ScheduleActivity[] | undefined => {
    if (!canUndo) return undefined;
    
    const newIndex = scheduleHistoryIndex - 1;
    setScheduleHistoryIndex(newIndex);
    
    // Return the previous state
    return JSON.parse(JSON.stringify(scheduleHistory[newIndex]));
  };
  
  // Redo the last undone action
  const redoScheduleChange = (): ScheduleActivity[] | undefined => {
    if (!canRedo) return undefined;
    
    const newIndex = scheduleHistoryIndex + 1;
    setScheduleHistoryIndex(newIndex);
    
    // Return the next state
    return JSON.parse(JSON.stringify(scheduleHistory[newIndex]));
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
        scheduleHistory,
        scheduleHistoryIndex,
        addToScheduleHistory,
        canUndo,
        canRedo,
        undoScheduleChange,
        redoScheduleChange
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
