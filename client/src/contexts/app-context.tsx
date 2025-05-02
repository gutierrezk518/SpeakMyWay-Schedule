import { createContext, useContext, useState, ReactNode, SetStateAction } from "react";
import { speak } from "@/lib/tts";
import { ScheduleActivity } from "@/data/scheduleData";
import { toast } from "react-hot-toast";

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
  userBirthday: string;
  setUserBirthday: (date: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userConsentGiven: boolean;
  setUserConsentGiven: (consent: boolean) => void;
  userConsentDate: string;
  setUserConsentDate: (date: string) => void; 
  userMarketingConsent: boolean;
  setUserMarketingConsent: (consent: boolean) => void;
  userDataRetentionConsent: boolean;
  setUserDataRetentionConsent: (consent: boolean) => void;
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
  // Favorites functionality - simplified
  favoriteActivities: ScheduleActivity[];
  toggleFavorite: (activity: ScheduleActivity) => void;
  isFavorite: (activityId: string) => boolean;
  addToFavorites: (activity: ScheduleActivity) => void;
  removeFromFavorites: (activityId: string) => void;
  // UI state
  isFavoritesMode: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState("home");
  
  // Language with localStorage persistence
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('userLanguage') || "en";
  });
  
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('userLanguage', lang);
  };
  
  // Check for anonymous user
  const [anonymousUser, setAnonymousUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('anonymousUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing anonymous user data:", error);
      return null;
    }
  });
  
  // User profile data with localStorage persistence
  const [userName, setUserNameState] = useState(() => {
    // If there's an anonymous user, use their nickname
    if (anonymousUser?.nickname) {
      return anonymousUser.nickname;
    }
    // Otherwise use the stored userName or empty string
    return localStorage.getItem('userName') || "";
  });
  
  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('userName', name);
  };
  
  const [userBirthday, setUserBirthdayState] = useState(() => {
    return localStorage.getItem('userBirthday') || "";
  });
  
  const setUserBirthday = (date: string) => {
    setUserBirthdayState(date);
    localStorage.setItem('userBirthday', date);
  };
  
  const [userEmail, setUserEmailState] = useState(() => {
    return localStorage.getItem('userEmail') || "";
  });
  
  const setUserEmail = (email: string) => {
    setUserEmailState(email);
    localStorage.setItem('userEmail', email);
  };
  
  const [userConsentGiven, setUserConsentGivenState] = useState(() => {
    const savedConsent = localStorage.getItem('userConsentGiven');
    return savedConsent ? savedConsent === 'true' : false;
  });
  
  const setUserConsentGiven = (consent: boolean) => {
    setUserConsentGivenState(consent);
    localStorage.setItem('userConsentGiven', consent.toString());
  };
  
  const [userConsentDate, setUserConsentDateState] = useState(() => {
    return localStorage.getItem('userConsentDate') || "";
  });
  
  const setUserConsentDate = (date: string) => {
    setUserConsentDateState(date);
    localStorage.setItem('userConsentDate', date);
  };
  
  const [userMarketingConsent, setUserMarketingConsentState] = useState(() => {
    const savedConsent = localStorage.getItem('userMarketingConsent');
    return savedConsent ? savedConsent === 'true' : false;
  });
  
  const setUserMarketingConsent = (consent: boolean) => {
    setUserMarketingConsentState(consent);
    localStorage.setItem('userMarketingConsent', consent.toString());
  };
  
  const [userDataRetentionConsent, setUserDataRetentionConsentState] = useState(() => {
    const savedConsent = localStorage.getItem('userDataRetentionConsent');
    return savedConsent ? savedConsent === 'true' : false;
  });
  
  const setUserDataRetentionConsent = (consent: boolean) => {
    setUserDataRetentionConsentState(consent);
    localStorage.setItem('userDataRetentionConsent', consent.toString());
  };
  const [voiceSettings, setVoiceSettings] = useState({
    voiceType: "default",
    rate: 1,
    volume: 0.8,
    language: "en-US",
  });
  const [displaySettings, setDisplaySettings] = useState(() => {
    const savedSettings = localStorage.getItem('displaySettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      textSize: 1.5,
      darkMode: false,
    };
  });
  const [messageWords, setMessageWords] = useState<{ id: string; word: string }[]>([]);
  
  // Undo/Redo state
  const [scheduleHistory, setScheduleHistory] = useState<ScheduleActivity[][]>([[]]);
  const [scheduleHistoryIndex, setScheduleHistoryIndex] = useState(0);
  
  // Favorites state - load from localStorage if available
  const [favoriteActivities, setFavoriteActivities] = useState<ScheduleActivity[]>(() => {
    const savedFavorites = localStorage.getItem('userFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  
  // Simple favorites management - no mode needed
  const addToFavorites = (activity: ScheduleActivity) => {
    if (!isFavorite(activity.id)) {
      // Create a clean copy without any draggable IDs
      const cleanActivity = { ...activity };
      if (cleanActivity.id.includes('-')) {
        // Strip any UUID suffix that might have been added
        cleanActivity.id = cleanActivity.id.split('-')[0];
      }
      
      const updatedFavorites = [...favoriteActivities, cleanActivity];
      setFavoriteActivities(updatedFavorites);
      localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
      
      speak('Added to favorites!');
      toast.success('Added to favorites!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#ffd700',
          color: 'black',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          borderRadius: '4px',
          padding: '8px 12px',
        },
        icon: '⭐',
      });
    }
  };
  
  // Remove from favorites
  const removeFromFavorites = (activityId: string) => {
    // Strip UUID if present
    const baseId = activityId.split('-')[0];
    const updatedFavorites = favoriteActivities.filter(
      activity => activity.id.split('-')[0] !== baseId
    );
    
    setFavoriteActivities(updatedFavorites);
    localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
    
    speak('Removed from favorites');
    toast.success('Removed from favorites', {
      duration: 2000,
      position: 'top-center',
      style: {
        background: '#e5e5e5',
        color: 'black',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        borderRadius: '4px',
        padding: '8px 12px',
      },
      icon: '✓',
    });
  };
  
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
  
  // Toggle an activity as favorite
  const toggleFavorite = (activity: ScheduleActivity) => {
    // Check if the activity is already a favorite
    const isAlreadyFavorited = favoriteActivities.some(favActivity => 
      favActivity.id.split('-')[0] === activity.id.split('-')[0]
    );
    
    if (isAlreadyFavorited) {
      removeFromFavorites(activity.id);
    } else {
      addToFavorites(activity);
    }
  };
  
  // Check if an activity is in favorites
  const isFavorite = (activityId: string) => {
    // Strip UUID if present
    const baseId = activityId.split('-')[0];
    return favoriteActivities.some(activity => activity.id.split('-')[0] === baseId);
  };

  // Default to false
  const isFavoritesMode = false;

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        language,
        setLanguage,
        userName,
        setUserName,
        userBirthday,
        setUserBirthday,
        userEmail,
        setUserEmail,
        userConsentGiven,
        setUserConsentGiven,
        userConsentDate,
        setUserConsentDate,
        userMarketingConsent,
        setUserMarketingConsent,
        userDataRetentionConsent,
        setUserDataRetentionConsent,
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
        redoScheduleChange,
        favoriteActivities,
        toggleFavorite,
        isFavorite,
        addToFavorites,
        removeFromFavorites,
        isFavoritesMode
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