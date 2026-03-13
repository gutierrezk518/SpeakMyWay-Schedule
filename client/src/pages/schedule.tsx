import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { useLocation } from "wouter";

import ActivityCard from "@/components/ui/activity-card";
import { speak } from "@/lib/tts";
import { playTimerComplete } from "@/lib/sounds";
import { useAppContext } from "@/contexts/app-context";
import { useToast } from "@/hooks/use-toast";
import { ScheduleActivity, ScheduleTimeSection, initialScheduleData } from "@/data/scheduleData";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useActivityCards } from "@/hooks/use-activity-cards";
import { getBgClass, getBgLightClass, getBgHoverClass } from "@/lib/utils";

// Tooltip wrapper for icon buttons - shows label on hover/focus
const Tooltip = ({ label, children, position = 'right' }: { label: string; children: React.ReactNode; position?: 'right' | 'bottom' }) => (
  <div className="relative group/tooltip">
    {children}
    <span className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-2.5 py-1.5 opacity-0 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 transition-opacity duration-200 shadow-lg ${
      position === 'right' ? 'left-full ml-2 top-1/2 -translate-y-1/2' : 'top-full mt-2 left-1/2 -translate-x-1/2'
    }`}>
      {label}
    </span>
  </div>
);

// Compact Timer Component
const TimerComponent = () => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Get the user name and language from context
  const { userName, language } = useAppContext();
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          setIsActive(false);
          
          // Play sound effect first
          playTimerComplete();
          
          // Add a small delay before speaking
          setTimeout(() => {
            // Custom message with user's name, translated based on language setting
            let message = '';
            if (language === 'es') {
              message = `Vale ${userName || 'amigo'}, es hora de nuestra próxima actividad`;
            } else {
              message = `OK ${userName || 'friend'}, time for our next activity`;
            }
            speak(message);
          }, 800);
          
          // Optional: vibration if available
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, userName, language]);
  
  const handleToggleTimer = () => {
    if (minutes === 0 && seconds === 0 && !isActive) return;
    setIsActive(!isActive);
  };
  
  const handleReset = () => {
    setIsActive(false);
    setMinutes(5);
    setSeconds(0);
  };
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center mr-3">
        <select
          aria-label="Timer minutes"
          value={minutes}
          onChange={(e) => !isActive && setMinutes(parseInt(e.target.value))}
          disabled={isActive}
          className={`w-12 px-1 py-0.5 text-xs text-center rounded-l border border-r-0 border-purple-300 bg-white ${isActive ? 'opacity-80' : ''}`}
        >
          {Array.from({ length: 60 }, (_, i) => (
            <option key={`min-${i}`} value={i}>{i}</option>
          ))}
        </select>
        <span className="text-xs px-1 text-purple-800">:</span>
        <select
          aria-label="Timer seconds"
          value={seconds}
          onChange={(e) => !isActive && setSeconds(parseInt(e.target.value))}
          disabled={isActive}
          className={`w-12 px-1 py-0.5 text-xs text-center rounded-r border border-purple-300 bg-white ${isActive ? 'opacity-80' : ''}`}
        >
          {Array.from({ length: 60 }, (_, i) => (
            <option key={`sec-${i}`} value={i}>{i}</option>
          ))}
        </select>
      </div>
      
      <div className="flex">
        <button 
          onClick={handleToggleTimer}
          className={`px-2 py-0.5 rounded text-xs text-white mx-1 ${
            isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
          }`}
          disabled={minutes === 0 && seconds === 0 && !isActive}
        >
          {language === 'es' 
            ? (isActive ? "Pausa" : "Iniciar") 
            : (isActive ? "Pause" : "Start")}
        </button>
        
        <button 
          onClick={handleReset}
          className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 mx-1"
        >
          {language === 'es' ? "Reiniciar" : "Reset"}
        </button>
      </div>
    </div>
  );
};

// Define the shape of a schedule section with activities
interface ScheduleSection extends ScheduleTimeSection {
  activities: ScheduleActivity[];
}

export default function Schedule() {
  const { 
    setCurrentPage, 
    addToScheduleHistory, 
    undoScheduleChange, 
    redoScheduleChange,
    canUndo,
    canRedo,
    userName,
    favoriteActivities,
    toggleFavorite,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    language
  } = useAppContext();
  const { toast } = useToast();
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Check for email verification URL parameters when page loads
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const error = urlParams.get('error');
    
    if (verified === 'true') {
      toast({
        title: "Email Verification Successful",
        description: "Your email has been verified. You now have full access to the application.",
        variant: "default",
      });
      
      // Clear the URL parameters after showing the toast
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      let errorMessage = "There was a problem verifying your email.";
      
      if (error === 'invalid_token') {
        errorMessage = "The verification link was invalid. Please request a new one.";
      } else if (error === 'expired_token') {
        errorMessage = "The verification link has expired. Please request a new one.";
      } else if (error === 'server_error') {
        errorMessage = "A server error occurred. Please try again later.";
      }
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Clear the URL parameters after showing the toast
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, location]);
  
  // Schedule state
  const [scheduleData, setScheduleData] = useState<ScheduleSection[]>(() => {
    // Try to load from localStorage first
    const savedSchedule = localStorage.getItem('userSchedule');
    
    // Check if this is a first-time user by checking for a first-visit flag
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    
    if (savedSchedule) {
      // User has saved schedule data, use that
      return JSON.parse(savedSchedule);
    } else if (!hasVisitedBefore) {
      // First-time user - set the flag and return initial data
      localStorage.setItem('hasVisitedBefore', 'true');
      return initialScheduleData;
    } else {
      // User has visited before but has no schedule - return empty schedule
      return [
        {
          id: "morning",
          name: "Morning",
          icon: "ri-sun-fill",
          iconColor: "yellow-500",
          activities: []
        },
        {
          id: "afternoon",
          name: "Afternoon",
          icon: "ri-sun-foggy-fill",
          iconColor: "orange-500",
          activities: []
        },
        {
          id: "evening",
          name: "Evening",
          icon: "ri-moon-fill",
          iconColor: "indigo-500",
          activities: []
        }
      ];
    }
  });
  
  // UI state
  const [selectedTimeSection, setSelectedTimeSection] = useState("morning");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [draggedItem, setDraggedItem] = useState<ScheduleActivity | null>(null);
  const [isDragging, setIsDragging] = useState(false); // Track when drag is in progress
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTimer, setShowTimer] = useState(false); // New state for timer visibility
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [showSearchBar, setShowSearchBar] = useState(false); // Toggle search bar visibility
  const [completingActivities, setCompletingActivities] = useState<Set<string>>(new Set()); // Track cards being checked off
  const [newlyAddedActivity, setNewlyAddedActivity] = useState<string | null>(null); // Track pulse animation for newly added cards
  const [useLargeCards, setUseLargeCards] = useState(false); // Toggle for fewer, larger activity cards
  const [isListening, setIsListening] = useState(false); // Voice search active state
  
  // Database hooks
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: activityCards, isLoading: cardsLoading, error: cardsError } = useActivityCards(selectedCategory);
  // Fetch ALL cards to build a translation lookup for schedule items loaded from localStorage
  const { data: allCards } = useActivityCards();

  // Enrich schedule items that are missing titleEs/speechTextEs (e.g. loaded from localStorage)
  useEffect(() => {
    if (!allCards || allCards.length === 0) return;

    // Build lookup maps for matching schedule items to database cards
    const byId = new Map<string, { titleEs?: string; speechTextEs?: string }>();
    const byTitle = new Map<string, { titleEs?: string; speechTextEs?: string }>();
    for (const card of allCards) {
      const entry = { titleEs: card.titleEs, speechTextEs: card.speechTextEs };
      byId.set(card.id, entry);
      // Also index by English title (lowercased) for cards from initialScheduleData
      if (card.title) {
        byTitle.set(card.title.toLowerCase(), entry);
      }
    }

    let updated = false;
    const newSchedule = scheduleData.map((section: ScheduleSection) => ({
      ...section,
      activities: section.activities.map((activity: ScheduleActivity) => {
        if (activity.titleEs) return activity; // Already has translations

        // Try to match by stripping the UUID suffix (e.g. "42-abc12345" -> "42")
        const baseId = activity.id.replace(/-[a-f0-9]{8}$/, '');
        const translations = byId.get(baseId)
          // Fallback: match by English title (for initialScheduleData cards like "Wake Up")
          || byTitle.get(activity.title.toLowerCase())
          // Fallback: check if activity title contains a DB card title (e.g. "Eat Breakfast" contains "Breakfast")
          || Array.from(byTitle.entries()).find(([dbTitle]) =>
            activity.title.toLowerCase().includes(dbTitle) || dbTitle.includes(activity.title.toLowerCase())
          )?.[1];
        if (translations?.titleEs) {
          updated = true;
          return { ...activity, titleEs: translations.titleEs, speechTextEs: translations.speechTextEs };
        }
        return activity;
      })
    }));

    if (updated) {
      setScheduleData(newSchedule);
    }
  }, [allCards]);

  // Helper function to handle category selection and reset page number
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Set the current page in the app context
  useEffect(() => {
    setCurrentPage("/schedule");
  }, [setCurrentPage]);

  // Save schedule to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('userSchedule', JSON.stringify(scheduleData));
  }, [scheduleData]);
  
  // Get the current time section's activities
  const currentSchedule = scheduleData.find((s: {id: string}) => s.id === selectedTimeSection)?.activities || [];
  
  // Get the available activities for the selected category - using database
  const categoryActivities = selectedCategory === 'favorites'
    ? favoriteActivities // Show user's favorite activities
    : activityCards || []; // Use database activities (already filtered by category in the hook)
            
  // Filter activities by search query if one exists
  const filteredActivities = searchQuery
    ? categoryActivities.filter(activity => {
        const searchLower = searchQuery.toLowerCase();
        return (
          activity.title.toLowerCase().includes(searchLower) ||
          (activity.titleEs && activity.titleEs.toLowerCase().includes(searchLower)) ||
          (activity.speechText && activity.speechText.toLowerCase().includes(searchLower)) ||
          (activity.speechTextEs && activity.speechTextEs.toLowerCase().includes(searchLower))
        );
      })
    : categoryActivities;
  
  // All filtered activities are shown - user scrolls to see more
  
  // Handle drag end event
  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;
    setDraggedItem(null);
    setIsDragging(false); // Set dragging state to false
    
    // If dropped outside a droppable area
    if (!destination) return;
    
    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    // Save current state for undo history before making changes
    const currentSection = scheduleData.find((s: ScheduleSection) => s.id === selectedTimeSection);
    if (currentSection) {
      addToScheduleHistory([...currentSection.activities]);
    }
    
    // If moving within schedule
    if (source.droppableId === "schedule" && destination.droppableId === "schedule") {
      const newSchedule = [...scheduleData];
      const section = newSchedule.find((s: ScheduleSection) => s.id === selectedTimeSection);
      if (!section) return;
      
      const [movedActivity] = section.activities.splice(source.index, 1);
      section.activities.splice(destination.index, 0, movedActivity);
      
      setScheduleData(newSchedule);
    }
    
    // Reordering within activity cards section - prevent it
    if (source.droppableId === "activity-cards" && destination.droppableId === "activity-cards") {
      // We don't want to allow reordering within the activity cards section
      // So we do nothing here
      return;
    }
    
    // If adding from activity cards to schedule
    if (source.droppableId === "activity-cards" && destination.droppableId === "schedule") {
      try {
        const activityToAdd = filteredActivities[source.index];
        if (!activityToAdd) return;
        
        const newSchedule = [...scheduleData];
        const section = newSchedule.find((s: ScheduleSection) => s.id === selectedTimeSection);
        if (!section) return;
        
        // Create a new copy of the activity with a unique ID to ensure it stays on both sides
        const newActivity: ScheduleActivity = {
          ...activityToAdd,
          id: `${activityToAdd.id}-${uuidv4().slice(0, 8)}`
        };
        
        // Add the activity to the schedule
        section.activities = [...section.activities];
        section.activities.splice(destination.index, 0, newActivity);
        setScheduleData(newSchedule);

        // Trigger pulse animation on newly added card
        setNewlyAddedActivity(newActivity.id);
        setTimeout(() => setNewlyAddedActivity(null), 600);

        // Speak the activity's full speech text when it's added to the schedule
        if (language === 'es' && newActivity.speechTextEs) {
          speak(newActivity.speechTextEs);
        } else {
          speak(newActivity.speechText || newActivity.title);
        }
      } catch (error) {
        console.error("Error adding activity to schedule:", error);
      }
    }
    
    // NEW: If adding to favorites category by dragging
    if (source.droppableId === "activity-cards" && 
        (destination.droppableId === "favorites" || destination.droppableId === "favorites-button")) {
      try {
        const activityToAdd = filteredActivities[source.index];
        if (!activityToAdd) return;
        
        // Add to favorites - this will avoid duplicates by checking isFavorite
        addToFavorites(activityToAdd);
        
        // Automatically switch to favorites category to show the result
        if (destination.droppableId === "favorites-button") {
          setSelectedCategory('favorites');
        }
        
        // Speak confirmation
        speak(language === 'es' ? "Añadido a favoritos" : "Added to favorites");
      } catch (error) {
        console.error("Error adding to favorites:", error);
      }
    }
    
    // NEW: If removing from favorites by dragging out
    if (source.droppableId === "favorites" && destination.droppableId === "activity-cards") {
      try {
        const activityToRemove = favoriteActivities[source.index];
        if (!activityToRemove) return;
        
        // Remove from favorites
        removeFromFavorites(activityToRemove.id);
        
        // Speak confirmation
        speak(language === 'es' ? "Eliminado de favoritos" : "Removed from favorites");
      } catch (error) {
        console.error("Error removing from favorites:", error);
      }
    }
  }, [scheduleData, selectedTimeSection, filteredActivities, addToScheduleHistory, selectedCategory, favoriteActivities, addToFavorites, removeFromFavorites]);
  
  // Handle drag start to track the item being dragged
  const onDragStart = useCallback((start: any) => {
    const { source } = start;
    setIsDragging(true); // Set dragging state to true
    
    if (source.droppableId === "activity-cards") {
      const draggedActivity = filteredActivities[source.index];
      setDraggedItem(draggedActivity);
    } else if (source.droppableId === "schedule") {
      const draggedActivity = currentSchedule[source.index];
      setDraggedItem(draggedActivity);
    } else if (source.droppableId === "favorites") {
      const draggedActivity = favoriteActivities[source.index];
      setDraggedItem(draggedActivity);
    }
  }, [filteredActivities, currentSchedule, favoriteActivities]);
  
  // Remove an activity from the schedule
  const removeActivity = (index: number) => {
    // Add current state to history for undo
    const currentSection = scheduleData.find((s: ScheduleSection) => s.id === selectedTimeSection);
    if (currentSection) {
      addToScheduleHistory([...currentSection.activities]);
    }
    
    const newSchedule = [...scheduleData];
    const section = newSchedule.find((s: ScheduleSection) => s.id === selectedTimeSection);
    if (!section) return;
    
    section.activities.splice(index, 1);
    setScheduleData(newSchedule);
  };

  // Complete an activity with check animation then remove
  const completeActivity = (activityId: string, index: number) => {
    setCompletingActivities(prev => new Set(prev).add(activityId));
    setTimeout(() => {
      removeActivity(index);
      setCompletingActivities(prev => {
        const next = new Set(prev);
        next.delete(activityId);
        return next;
      });
    }, 500);
  };

  // Clear all activities
  const clearActivities = () => {
    // Add current state to history for undo
    const currentSection = scheduleData.find((s: ScheduleSection) => s.id === selectedTimeSection);
    if (currentSection && currentSection.activities.length > 0) {
      addToScheduleHistory([...currentSection.activities]);
    }
    
    const newSchedule = scheduleData.map((section: ScheduleSection) => {
      if (section.id === selectedTimeSection) {
        return { ...section, activities: [] };
      }
      return section;
    });
    setScheduleData(newSchedule);
  };
  
  // Handle undo action
  const handleUndo = () => {
    const previousActivities = undoScheduleChange();
    if (previousActivities) {
      const newSchedule = scheduleData.map((section: ScheduleSection) => {
        if (section.id === selectedTimeSection) {
          return { ...section, activities: previousActivities };
        }
        return section;
      });
      setScheduleData(newSchedule);
    }
  };
  
  // Handle redo action
  const handleRedo = () => {
    const nextActivities = redoScheduleChange();
    if (nextActivities) {
      const newSchedule = scheduleData.map((section: ScheduleSection) => {
        if (section.id === selectedTimeSection) {
          return { ...section, activities: nextActivities };
        }
        return section;
      });
      setScheduleData(newSchedule);
    }
  };
  
  // Save the current routine
  const saveRoutine = () => {
    localStorage.setItem('userSchedule', JSON.stringify(scheduleData));
    toast({ title: "Routine saved!", description: "Your schedule has been saved." });
  };
  
  // Save to a specific time section
  const saveToTimeSection = (sectionId: string) => {
    // Update the schedule data with the current activities saved to the selected section
    const newSchedule = [...scheduleData];
    const targetSection = newSchedule.find(s => s.id === sectionId);
    const currentSection = newSchedule.find(s => s.id === selectedTimeSection);
    
    if (targetSection && currentSection) {
      // Copy activities from current section to target section
      targetSection.activities = [...currentSection.activities];
      localStorage.setItem('userSchedule', JSON.stringify(newSchedule));
      setShowSaveModal(false);
      
      // Show confirmation message
      const sectionName = targetSection.name.toLowerCase();
      toast({ title: "Schedule saved!", description: `Saved to ${sectionName}.` });
    }
  };
  
  // Play through the schedule as a complete sentence with ordinal words
  const playSchedule = () => {
    if (currentSchedule.length === 0) {
      if (language === "es") {
        speak("Tu horario está vacío. Agrega algunas actividades primero.");
      } else {
        speak("Your schedule is empty. Add some activities first.");
      }
      return;
    }
    
    // Create array of schedule items with ordinal words
    const scheduleTexts: string[] = [];
    
    currentSchedule.forEach((activity, index) => {
      let ordinalPrefix = "";
      
      if (language === "es") {
        // Spanish ordinal words
        if (index === 0) {
          ordinalPrefix = "Primero vamos a ";
        } else if (index === 1) {
          ordinalPrefix = "Segundo vamos a ";
        } else if (index === 2) {
          ordinalPrefix = "Tercero vamos a ";
        } else if (index === currentSchedule.length - 1) {
          ordinalPrefix = "Y por último vamos a ";
        } else {
          // For positions 4th and beyond
          ordinalPrefix = "Después vamos a ";
        }
        
        // Use Spanish speech text if available
        const textToSpeak = activity.speechTextEs ? 
          activity.speechTextEs.toLowerCase() : 
          (activity.titleEs ? activity.titleEs.toLowerCase() : 
           (activity.speechText ? activity.speechText.toLowerCase() : activity.title.toLowerCase()));
           
        scheduleTexts.push(`${ordinalPrefix}${textToSpeak}`);
      } else {
        // English ordinal words
        if (index === 0) {
          ordinalPrefix = "First we will ";
        } else if (index === 1) {
          ordinalPrefix = "Second we will ";
        } else if (index === 2) {
          ordinalPrefix = "Third we will ";
        } else if (index === currentSchedule.length - 1) {
          ordinalPrefix = "And last we will ";
        } else {
          // For positions 4th and beyond
          ordinalPrefix = `Next we will `;
        }
        
        // Use speechText if available, otherwise use title
        const textToSpeak = activity.speechText ? activity.speechText.toLowerCase() : activity.title.toLowerCase();
        scheduleTexts.push(`${ordinalPrefix}${textToSpeak}`);
      }
    });
    
    // Create a single complete sentence from all schedule items
    let fullText = scheduleTexts.join(", ");
    
    // Use userName from the context that we already extracted at the top of the component
    let namePrefix = "";
    if (language === "es") {
      namePrefix = userName ? `Vale ${userName}. ` : "";
    } else {
      namePrefix = userName ? `Ok ${userName}. ` : "";
    }
    
    // Speak the complete schedule
    speak(namePrefix + fullText);
  };

  // Determine if we're in portrait mode (based on window.innerWidth vs innerHeight)
  const [isPortrait, setIsPortrait] = useState(false);
  
  // Update orientation on resize
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    // Check initially
    checkOrientation();
    
    // Add listener for resize
    window.addEventListener('resize', checkOrientation);
    
    // Clean up
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);
  
  // Voice search using Web Speech Recognition API
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: language === 'es' ? 'No disponible' : 'Not available', description: language === 'es' ? 'Tu navegador no soporta búsqueda por voz' : 'Your browser does not support voice search', variant: 'destructive' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'es' ? 'es-ES' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      if (selectedCategory !== 'all') {
        handleCategoryChange('all');
      }
      if (!showSearchBar) {
        setShowSearchBar(true);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Event handler for clearing search when any card is clicked
  useEffect(() => {
    const handleClearSearch = () => {
      setSearchQuery('');
    };
    
    document.addEventListener('clearSearchOnCardClick', handleClearSearch);
    
    return () => {
      document.removeEventListener('clearSearchOnCardClick', handleClearSearch);
    };
  }, []);
  
  // Handle adding cards to schedule when clicked
  useEffect(() => {
    // Event handler for adding cards to schedule when clicked
    const handleAddCardToSchedule = (event: CustomEvent) => {
      const activity = event.detail?.activity;
      const sourceArea = event.detail?.sourceArea;
      if (!activity) return;
      
      // If the card was clicked from within the schedule area, don't add it again
      if (sourceArea === "schedule") {
        // Speak the activity text without adding it again
        // This is necessary since we removed the speak call from the ActivityCard component
        if (language === "es" && (activity.speechTextEs || activity.titleEs)) {
          speak(activity.speechTextEs || activity.titleEs || activity.speechText || activity.title);
        } else {
          speak(activity.speechText || activity.title);
        }
        return;
      }
      
      // Save current state for undo history
      const currentSection = scheduleData.find((s: ScheduleSection) => s.id === selectedTimeSection);
      if (currentSection) {
        addToScheduleHistory([...currentSection.activities]);
      }
      
      // Create a new copy of the activity with a unique ID
      const newActivity: ScheduleActivity = {
        ...activity,
        id: `${activity.id}-${uuidv4().slice(0, 8)}`
      };
      
      // Add the activity to the schedule
      const newSchedule = [...scheduleData];
      const section = newSchedule.find((s: ScheduleSection) => s.id === selectedTimeSection);
      if (!section) return;
      
      section.activities = [...section.activities, newActivity]; // Add to the end
      setScheduleData(newSchedule);

      // Trigger pulse animation on newly added card
      setNewlyAddedActivity(newActivity.id);
      setTimeout(() => setNewlyAddedActivity(null), 600);

      // Speak the activity's full speech text when it's added to the schedule
      if (language === "es" && (newActivity.speechTextEs || newActivity.titleEs)) {
        speak(newActivity.speechTextEs || newActivity.titleEs || newActivity.speechText || newActivity.title);
      } else {
        speak(newActivity.speechText || newActivity.title);
      }
    };

    // Listen for the custom event
    document.addEventListener('addCardToSchedule', handleAddCardToSchedule as EventListener);
    
    // Clean up
    return () => {
      document.removeEventListener('addCardToSchedule', handleAddCardToSchedule as EventListener);
    };
  }, [scheduleData, selectedTimeSection, addToScheduleHistory]);

  return (
    <section className="h-full max-h-full flex flex-col overflow-hidden">
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className={`flex-1 ${isPortrait ? 'flex flex-col' : 'flex'} overflow-hidden`}>
          {/* Side buttons panel - non portrait mode with tooltips */}
          {!isPortrait && (
            <div className="w-16 sm:w-20 flex flex-col items-center py-4 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 space-y-4">
              <Tooltip label={language === 'es' ? 'Deshacer' : 'Undo'}>
                <button
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-md ${
                    canUndo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'
                  }`}
                  onClick={handleUndo}
                  disabled={!canUndo}
                  aria-label={language === 'es' ? 'Deshacer' : 'Undo'}
                >
                  <i className="ri-arrow-go-back-line text-base sm:text-xl"></i>
                </button>
              </Tooltip>

              <Tooltip label={language === 'es' ? 'Rehacer' : 'Redo'}>
                <button
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-md ${
                    canRedo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'
                  }`}
                  onClick={handleRedo}
                  disabled={!canRedo}
                  aria-label={language === 'es' ? 'Rehacer' : 'Redo'}
                >
                  <i className="ri-arrow-go-forward-line text-base sm:text-xl"></i>
                </button>
              </Tooltip>

              <Tooltip label={language === 'es' ? 'Reproducir horario' : 'Play schedule'}>
                <button
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-lg hover:bg-purple-600"
                  onClick={playSchedule}
                  aria-label={language === 'es' ? 'Reproducir horario' : 'Play schedule'}
                >
                  <i className="ri-play-line text-xl sm:text-2xl"></i>
                </button>
              </Tooltip>

              <Tooltip label={showTimer ? (language === 'es' ? 'Ocultar temporizador' : 'Hide timer') : (language === 'es' ? 'Mostrar temporizador' : 'Show timer')}>
                <button
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl ${showTimer ? 'bg-purple-400' : 'bg-gray-400'} text-white flex items-center justify-center shadow-md hover:bg-purple-500`}
                  onClick={() => setShowTimer(!showTimer)}
                  aria-label={showTimer ? (language === 'es' ? 'Ocultar temporizador' : 'Hide timer') : (language === 'es' ? 'Mostrar temporizador' : 'Show timer')}
                >
                  <i className="ri-timer-line text-base sm:text-xl"></i>
                </button>
              </Tooltip>

              <Tooltip label={language === 'es' ? 'Guardar horario' : 'Save schedule'}>
                <button
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-md hover:bg-green-600"
                  onClick={() => setShowSaveModal(true)}
                  aria-label={language === 'es' ? 'Guardar horario' : 'Save schedule'}
                >
                  <i className="ri-save-line text-base sm:text-xl"></i>
                </button>
              </Tooltip>
            </div>
          )}
          
          {/* Schedule section */}
          <div className={`${isFullscreen ? 'w-full' : isPortrait ? 'w-full flex-shrink-0' : 'w-full sm:w-2/5 md:w-1/3 border-r border-gray-200 dark:border-gray-700'} flex flex-col ${isPortrait ? '' : 'h-full'}`}>
            {/* Action buttons in portrait mode with tooltips */}
            {isPortrait && (
              <div className="flex bg-gray-100 dark:bg-gray-800 px-2 py-2 border-b border-gray-200 dark:border-gray-700 items-center justify-center space-x-4 mt-4">
                <Tooltip label={language === 'es' ? 'Deshacer' : 'Undo'} position="bottom">
                  <button
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${
                      canUndo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'
                    }`}
                    onClick={handleUndo}
                    disabled={!canUndo}
                    aria-label={language === 'es' ? 'Deshacer' : 'Undo'}
                  >
                    <i className="ri-arrow-go-back-line text-base"></i>
                  </button>
                </Tooltip>

                <Tooltip label={language === 'es' ? 'Rehacer' : 'Redo'} position="bottom">
                  <button
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${
                      canRedo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'
                    }`}
                    onClick={handleRedo}
                    disabled={!canRedo}
                    aria-label={language === 'es' ? 'Rehacer' : 'Redo'}
                  >
                    <i className="ri-arrow-go-forward-line text-base"></i>
                  </button>
                </Tooltip>

                <Tooltip label={language === 'es' ? 'Reproducir' : 'Play'} position="bottom">
                  <button
                    className="w-12 h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md hover:bg-purple-600"
                    onClick={playSchedule}
                    aria-label={language === 'es' ? 'Reproducir horario' : 'Play schedule'}
                  >
                    <i className="ri-play-line text-xl"></i>
                  </button>
                </Tooltip>

                <Tooltip label={showTimer ? (language === 'es' ? 'Ocultar' : 'Timer') : (language === 'es' ? 'Temporizador' : 'Timer')} position="bottom">
                  <button
                    className={`w-11 h-11 rounded-lg ${showTimer ? 'bg-purple-400' : 'bg-gray-400'} text-white flex items-center justify-center shadow-sm hover:bg-purple-500`}
                    onClick={() => setShowTimer(!showTimer)}
                    aria-label={showTimer ? (language === 'es' ? 'Ocultar temporizador' : 'Hide timer') : (language === 'es' ? 'Mostrar temporizador' : 'Show timer')}
                  >
                    <i className="ri-timer-line text-base"></i>
                  </button>
                </Tooltip>

                <Tooltip label={language === 'es' ? 'Guardar' : 'Save'} position="bottom">
                  <button
                    className="w-11 h-11 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-sm hover:bg-green-600"
                    onClick={() => setShowSaveModal(true)}
                    aria-label={language === 'es' ? 'Guardar horario' : 'Save schedule'}
                  >
                    <i className="ri-save-line text-base"></i>
                  </button>
                </Tooltip>
              </div>
            )}
            
            <div className="px-3 py-2 sm:px-4 sm:py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                  onClick={toggleFullscreen}
                  aria-label="Fullscreen"
                >
                  <i className={`${isFullscreen ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'}`}></i>
                </button>
                <button
                  className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-500 flex items-center"
                  onClick={clearActivities}
                  aria-label="Clear all activities"
                  title="Clear All Activities"
                >
                  <i className="ri-delete-bin-line mr-1"></i>
                  <span className="text-[9px] font-medium">Clear</span>
                </button>
              </div>
            </div>
            
            {/* Time section tabs - moved to top */}
            <div className="p-1 md:p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 flex-shrink-0 md:shadow-md">
              <div className="flex justify-center space-x-1 md:space-x-2">
                {scheduleData.map((section: ScheduleSection) => (
                  <button 
                    key={section.id}
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-xs sm:text-sm ${
                      selectedTimeSection === section.id 
                        ? 'bg-blue-500 text-white font-medium md:font-semibold shadow-sm' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setSelectedTimeSection(section.id)}
                  >
                    <i className={`${section.icon} mr-1`}></i>
                    {section.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Droppable schedule area */}
            <div className={`flex-grow p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden h-full`}>
              {/* Section header */}
              {(() => {
                const currentSection = scheduleData.find((s: ScheduleSection) => s.id === selectedTimeSection);
                if (!currentSection) return null;
                return (
                  <div className="mb-2 sm:mb-3">
                    <h2 className="text-sm sm:text-base font-semibold text-green-700 dark:text-green-400">
                      {language === 'es' ? 'Mi Horario' : 'My Schedule'}
                    </h2>
                  </div>
                );
              })()}
              <Droppable
                droppableId="schedule"
                direction={isPortrait ? "horizontal" : "vertical"}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 ${isPortrait ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto'} rounded-2xl ${
                      snapshot.isDraggingOver
                        ? 'bg-blue-50 dark:bg-blue-900/30'
                        : 'bg-transparent'
                    } w-full`}
                  >
                    {currentSchedule.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center h-full">
                        <i className="ri-calendar-todo-line text-4xl mb-2"></i>
                        <p className="text-sm font-medium">Add activities to your schedule</p>
                        <p className="text-xs mt-1">Tap or drag cards here</p>
                      </div>
                    ) : isPortrait ? (
                      /* Portrait mode: horizontal scrolling row of square card tiles */
                      <div className="flex flex-row flex-nowrap space-x-4 pb-2 px-1 items-start">
                        {currentSchedule.map((activity: ScheduleActivity, index: number) => (
                          <div key={activity.id} className={`flex flex-col items-center flex-shrink-0 w-[90px] transition-all duration-500 ${newlyAddedActivity === activity.id ? 'animate-pulse ring-2 ring-blue-400 ring-offset-2 rounded-2xl' : ''}`}>
                            <ActivityCard
                              activity={activity}
                              index={index}
                              showRemoveButton={false}
                              categoryId={selectedCategory}
                              isDraggable={true}
                              displayMode="card"
                            />
                            {/* Checkbox below card in portrait */}
                            {!isDragging && (
                              <button
                                className={`mt-1.5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  completingActivities.has(activity.id)
                                    ? 'bg-green-500 scale-110'
                                    : 'border-2 border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400 bg-white dark:bg-gray-700'
                                }`}
                                onClick={(e) => { e.stopPropagation(); completeActivity(activity.id, index); }}
                                aria-label="Complete activity"
                              >
                                {completingActivities.has(activity.id) && (
                                  <i className="ri-check-line text-white text-base animate-bounce"></i>
                                )}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Landscape/desktop mode: vertical list rows */
                      <div className="flex flex-col space-y-2 sm:space-y-3">
                        {currentSchedule.map((activity: ScheduleActivity, index: number) => (
                            <div key={activity.id} className={`relative group transition-all duration-500 ${newlyAddedActivity === activity.id ? 'animate-pulse ring-2 ring-blue-400 ring-offset-2 rounded-2xl' : ''}`}>
                              <ActivityCard
                                activity={activity}
                                index={index}
                                showRemoveButton={true}
                                categoryId={selectedCategory}
                                isDraggable={true}
                                displayMode="list"
                              />
                              {/* Complete checkbox - WCAG 44px minimum touch target */}
                              {!isDragging && (
                                <button
                                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                                    completingActivities.has(activity.id)
                                      ? 'bg-green-500 scale-110'
                                      : 'border-2 border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400 bg-white dark:bg-gray-700'
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); completeActivity(activity.id, index); }}
                                  aria-label="Complete activity"
                                >
                                  {completingActivities.has(activity.id) && (
                                    <i className="ri-check-line text-white text-base animate-bounce"></i>
                                  )}
                                </button>
                              )}
                            </div>
                        ))}
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            
            {/* Extra padding at the bottom to prevent content from being too close to the edge */}
            <div className="h-2"></div>
          </div>
          
          {/* Activity cards section - right side */}
          {!isFullscreen && (
            <div className={`${isPortrait ? 'w-full flex-1' : 'w-2/3'} flex flex-col ${isPortrait ? 'overflow-hidden' : 'h-full'}`}>
              {/* Timer - conditionally displayed */}
              {showTimer && (
                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-950 flex justify-center">
                  <div className="flex items-center justify-between bg-purple-100 dark:bg-purple-900 rounded-xl w-full px-3 py-1.5 max-w-md">
                    <div className="flex items-center">
                      <i className="ri-timer-line text-lg text-purple-700 dark:text-purple-400 mr-2"></i>
                      <span className="text-sm text-purple-800 dark:text-purple-300 font-medium">Timer:</span>
                    </div>
                    <TimerComponent />
                  </div>
                </div>
              )}
              
              {/* Categories tabs at the top of the activities section */}
              <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950">
                <div className="flex flex-wrap gap-1 justify-center">
                  {/* Search button */}
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                      showSearchBar
                      ? 'bg-cyan-500 text-black font-bold md:font-extrabold shadow-lg border-2 border-cyan-700 scale-105'
                      : 'bg-cyan-100 dark:bg-cyan-900 text-black hover:bg-cyan-200 dark:hover:bg-cyan-800 border-2 border-transparent'
                    }`}
                    onClick={() => {
                      const newState = !showSearchBar;
                      setShowSearchBar(newState);
                      
                      // When clicking search, always reset to 'all' to search all cards
                      if (newState) {
                        handleCategoryChange('all');
                      }
                      
                      // Always reset search query when toggling the search
                      setSearchQuery('');
                    }}
                    title={showSearchBar ? "Close search" : "Search for activities"}
                  >
                    <i className={`${showSearchBar ? 'ri-close-line' : 'ri-search-line'} mr-1`}></i>
                    {showSearchBar ? 'Close' : 'Search'}
                  </button>

                  {/* Large cards toggle */}
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                      useLargeCards
                      ? 'bg-indigo-500 text-white font-bold shadow-lg border-2 border-indigo-700 scale-105'
                      : 'bg-indigo-100 dark:bg-indigo-900 text-black dark:text-gray-200 hover:bg-indigo-200 dark:hover:bg-indigo-800 border-2 border-transparent'
                    }`}
                    onClick={() => setUseLargeCards(!useLargeCards)}
                    aria-label={useLargeCards ? "Show smaller cards" : "Show larger cards"}
                  >
                    <i className={`${useLargeCards ? 'ri-grid-line' : 'ri-layout-grid-line'} mr-1`}></i>
                    {useLargeCards ? (language === 'es' ? 'Pequeño' : 'Small') : (language === 'es' ? 'Grande' : 'Large')}
                  </button>

                  {/* Favorites button as droppable target */}
                  <Droppable droppableId="favorites-button" direction="horizontal" isDropDisabled={false}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`${snapshot.isDraggingOver ? 'scale-110 transition-transform' : ''}`}
                      >
                        <button
                          className={`px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                            selectedCategory === 'favorites'
                            ? 'bg-yellow-500 text-black font-bold md:font-extrabold shadow-lg border-2 border-yellow-700 scale-105'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-black hover:bg-yellow-200 dark:hover:bg-yellow-800 border-2 border-transparent'
                          } ${draggedItem ? 'ring-2 ring-yellow-500 ring-offset-2 animate-pulse' : ''}
                          ${snapshot.isDraggingOver ? 'bg-yellow-400 shadow-lg' : ''} relative`}
                          onClick={() => handleCategoryChange('favorites')}
                        >
                          <i className="ri-star-fill mr-1"></i>
                          Favorites
                          {snapshot.isDraggingOver && (
                            <div className="absolute inset-0 bg-yellow-300 bg-opacity-30 rounded-md flex items-center justify-center">
                              <span className="text-[9px] font-bold text-yellow-800">DROP TO ADD</span>
                            </div>
                          )}
                        </button>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  
                  {/* Dynamic category buttons from database */}
                  {categoriesLoading ? (
                    <div className="flex items-center text-gray-500">
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Loading categories...
                    </div>
                  ) : categoriesError ? (
                    <div className="text-red-500 text-xs">
                      Error loading categories
                    </div>
                  ) : (
                    categories?.map((category) => {
                      const categoryKey = category.categoryname_en; // Use original case
                      const isSelected = selectedCategory === categoryKey;
                      const categoryColor = category.color || 'gray-400';
                      
                      return (
                        <button
                          key={category.id}
                          className={`px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                            isSelected
                              ? `${getBgClass(categoryColor)} text-black font-bold md:font-extrabold shadow-lg border-2 border-gray-800 scale-105`
                              : `${getBgLightClass(categoryColor)} text-black ${getBgHoverClass(categoryColor)} border-2 border-transparent`
                          }`}
                          onClick={() => handleCategoryChange(categoryKey)}
                        >
                          {category.categoryname_en === 'all' && <i className="ri-apps-line mr-1"></i>}
                          {language === 'es' && category.name_es 
                            ? category.name_es 
                            : category.categoryname_en.charAt(0).toUpperCase() + category.categoryname_en.slice(1)
                          }
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              
              {/* Search bar below categories - conditionally shown */}
              {showSearchBar && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-md">
                      <input
                        type="text"
                        aria-label="Search for activities"
                        className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                        placeholder="Search for activities..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          // If user starts typing, reset to "all" category to search all cards
                          if (e.target.value.length > 0 && selectedCategory !== 'all') {
                            handleCategoryChange('all');
                          }
                        }}
                        autoFocus
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i className="ri-search-line text-gray-400 dark:text-gray-500"></i>
                      </div>
                      {searchQuery && (
                        <button
                          className="absolute inset-y-0 right-12 pr-1 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          onClick={() => setSearchQuery('')}
                          title="Clear search"
                        >
                          <i className="ri-close-circle-line"></i>
                        </button>
                      )}
                    </div>
                    {/* Voice search button */}
                    <button
                      className={`ml-2 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse shadow-lg'
                          : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                      }`}
                      onClick={startVoiceSearch}
                      aria-label={language === 'es' ? 'Búsqueda por voz' : 'Voice search'}
                    >
                      <i className={`${isListening ? 'ri-mic-fill' : 'ri-mic-line'} text-lg`}></i>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Activity cards - main area optimized to fit viewport */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-800 p-2">
                {cardsLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <i className="ri-loader-4-line animate-spin text-4xl mb-4"></i>
                    <p>Loading activity cards...</p>
                  </div>
                ) : cardsError ? (
                  <div className="flex flex-col items-center justify-center h-64 text-red-500">
                    <i className="ri-error-warning-line text-4xl mb-4"></i>
                    <p>Error loading activity cards</p>
                    <p className="text-sm text-gray-500 mt-2">{cardsError.message}</p>
                  </div>
                ) : selectedCategory === 'favorites' ? (
                  // Special case for favorites - make it a droppable area
                  <Droppable droppableId="favorites" direction="horizontal">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-3 xs:gap-3 sm:gap-3 md:gap-4 lg:gap-5 p-1 sm:p-1 md:p-2 rounded-xl min-h-[200px] ${
                          snapshot.isDraggingOver ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-white dark:bg-gray-800'
                        } border ${
                          snapshot.isDraggingOver ? 'border-yellow-300 dark:border-yellow-700' : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {favoriteActivities.length === 0 ? (
                          <div className="col-span-full flex flex-col items-center justify-center text-center p-4 text-gray-500 dark:text-gray-400">
                            <div className="text-3xl mb-2">⭐</div>
                            <h3 className="font-bold mb-1">No favorites yet</h3>
                            <p className="text-sm">Drag activities here to add them to your favorites.</p>
                          </div>
                        ) : (
                          favoriteActivities.map((activity: ScheduleActivity, index: number) => (
                            <div key={activity.id} className="relative flex flex-col items-center rounded p-1">
                              <ActivityCard
                                activity={activity}
                                index={index}
                                isDraggable={true}
                                categoryId="favorites"
                              />
                              {/* Only show remove buttons when not dragging */}
                              {!isDragging && (
                                <div className="mt-1 w-full flex justify-center">
                                  <button 
                                    className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded text-xs shadow-sm border border-red-300 dark:border-red-700"
                                    onClick={() => toggleFavorite(activity)}
                                    aria-label="Remove from favorites"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ) : (
                  // Regular activity cards - draggable but with disabled reordering
                  <Droppable droppableId="activity-cards" direction="horizontal" isDropDisabled={true}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`grid ${
                          useLargeCards
                            ? 'grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 lg:gap-7 p-2 sm:p-3 md:p-4'
                            : 'grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 xs:gap-3 sm:gap-3 md:gap-4 lg:gap-5 p-1 sm:p-1 md:p-2'
                        } ${
                          snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'
                        }`}
                      >
                        {filteredActivities.map((activity: ScheduleActivity, index: number) => (
                          <div key={activity.id} className="relative">
                            <ActivityCard
                              activity={activity}
                              index={index}
                              isDraggable={true} // Enable dragging
                              categoryId={selectedCategory}
                            />
                          </div>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
              
            </div>
          )}
        </div>
      </DragDropContext>
      
      {/* Save modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md dark:text-gray-100">
            <h2 className="text-lg font-bold mb-4">Save Schedule</h2>
            <p className="mb-4">Choose a time period to save this schedule to:</p>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {scheduleData.map((section) => (
                <button
                  key={section.id}
                  className={`p-2 rounded ${
                    section.id === selectedTimeSection
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200'
                  }`}
                  onClick={() => saveToTimeSection(section.id)}
                >
                  <i className={`${section.icon} mr-2`}></i>
                  {section.name}
                </button>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded dark:text-gray-200"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}