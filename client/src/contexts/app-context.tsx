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
  // Favorites functionality
  favoriteActivities: ScheduleActivity[];
  toggleFavorite: (activity: ScheduleActivity) => void;
  isFavorite: (activityId: string) => boolean;
  // Favorites selection mode
  isFavoritesMode: boolean;
  setFavoritesMode: (mode: boolean) => void;
  toggleFavoritesMode: () => void;
  temporaryFavorites: ScheduleActivity[];
  addToTemporaryFavorites: (activity: ScheduleActivity) => void;
  removeFromTemporaryFavorites: (activityId: string) => void;
  isTemporaryFavorite: (activityId: string) => boolean;
  commitTemporaryFavorites: () => void;
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
  
  // Favorites state - load from localStorage if available
  const [favoriteActivities, setFavoriteActivities] = useState<ScheduleActivity[]>(() => {
    const savedFavorites = localStorage.getItem('userFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  
  // Favorites selection mode
  const [isFavoritesMode, setFavoritesMode] = useState(false);
  const [temporaryFavorites, setTemporaryFavorites] = useState<ScheduleActivity[]>([]);
  
  // Toggle favorites selection mode
  const toggleFavoritesMode = () => {
    if (isFavoritesMode) {
      // If we're already in favorites mode, commit the changes and exit the mode
      commitTemporaryFavorites();
      speak('Favorites updated!');
      toast.success('Favorites updated!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#22c55e',
          color: 'white',
          fontWeight: 'bold',
        },
        icon: '⭐',
      });
    } else {
      // Enter favorites mode and show instructions
      setFavoritesMode(true);
      const toastMessage = 'Select Activity Cards you\'d like to add to your Favorites category. When finished, select the star again.';
      speak(toastMessage);
      toast(toastMessage, {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#22c55e',
          color: 'white',
          maxWidth: '350px',
          fontWeight: 'medium',
        },
        icon: '⭐',
      });
    }
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
    
    let updatedFavorites;
    
    if (isAlreadyFavorited) {
      // Remove from favorites
      updatedFavorites = favoriteActivities.filter(favActivity => 
        favActivity.id.split('-')[0] !== activity.id.split('-')[0]
      );
    } else {
      // Add to favorites - create a clean copy without any draggable item IDs
      const cleanActivity = { ...activity };
      // If ID contains a UUID suffix, remove it to keep the original activity ID
      cleanActivity.id = cleanActivity.id.split('-')[0];
      updatedFavorites = [...favoriteActivities, cleanActivity];
    }
    
    // Update state and save to localStorage
    setFavoriteActivities(updatedFavorites);
    localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
  };
  
  // Check if an activity is in favorites
  const isFavorite = (activityId: string) => {
    // Strip UUID if present
    const baseId = activityId.split('-')[0];
    return favoriteActivities.some(activity => activity.id.split('-')[0] === baseId);
  };
  
  // Add activity to temporary favorites during selection mode
  const addToTemporaryFavorites = (activity: ScheduleActivity) => {
    // Check if already in temporary favorites
    const baseId = activity.id.split('-')[0];
    const isAlreadyInTemp = temporaryFavorites.some(temp => temp.id.split('-')[0] === baseId);
    
    if (!isAlreadyInTemp) {
      // Create a clean copy without any draggable item IDs
      const cleanActivity = { ...activity };
      // If ID contains a UUID suffix, remove it to keep the original ID
      cleanActivity.id = cleanActivity.id.split('-')[0];
      setTemporaryFavorites([...temporaryFavorites, cleanActivity]);
    }
  };
  
  // Remove activity from temporary favorites
  const removeFromTemporaryFavorites = (activityId: string) => {
    // Strip UUID if present
    const baseId = activityId.split('-')[0];
    setTemporaryFavorites(temporaryFavorites.filter(
      activity => activity.id.split('-')[0] !== baseId
    ));
  };
  
  // Check if an activity is in temporary favorites
  const isTemporaryFavorite = (activityId: string) => {
    // Strip UUID if present
    const baseId = activityId.split('-')[0];
    return temporaryFavorites.some(activity => activity.id.split('-')[0] === baseId);
  };
  
  // Save temporary favorites to permanent favorites
  const commitTemporaryFavorites = () => {
    // Combine existing favorites with temporary favorites
    const combinedFavorites = [...favoriteActivities];
    
    // Add only new temporary favorites that aren't already in the permanent favorites
    temporaryFavorites.forEach(tempActivity => {
      const tempBaseId = tempActivity.id.split('-')[0];
      const alreadyExists = combinedFavorites.some(
        existingFav => existingFav.id.split('-')[0] === tempBaseId
      );
      
      if (!alreadyExists) {
        combinedFavorites.push(tempActivity);
      }
    });
    
    // Update favorites state
    setFavoriteActivities(combinedFavorites);
    localStorage.setItem('userFavorites', JSON.stringify(combinedFavorites));
    
    // Clear temporary favorites and exit selection mode
    setTemporaryFavorites([]);
    setFavoritesMode(false);
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
        redoScheduleChange,
        favoriteActivities,
        toggleFavorite,
        isFavorite,
        isFavoritesMode,
        setFavoritesMode,
        toggleFavoritesMode,
        temporaryFavorites,
        addToTemporaryFavorites,
        removeFromTemporaryFavorites,
        isTemporaryFavorite,
        commitTemporaryFavorites
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
