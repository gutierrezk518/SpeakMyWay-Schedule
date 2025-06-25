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
import { useOrganizedActivityData, useActivityCategories, useUserFavoritesManager, useSupabaseCategories, useSupabaseVocabularyCards } from "@/hooks/use-supabase-data";
import { useAuth } from "@/hooks/use-auth";
// Authentication removed

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
  // Authentication removed - no user object
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Fetch Supabase data with user context for favorites
  const { data: supabaseActivityData, isLoading: dataLoading, error: dataError } = useOrganizedActivityData(language, user?.id);
  const { data: categories, isLoading: categoriesLoading } = useActivityCategories(language);
  // Temporarily disable favorites to fix card loading issue
  // const { addFavorite, removeFavorite, isAddingFavorite, isRemovingFavorite } = useUserFavoritesManager(user?.id);
  
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
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [draggedItem, setDraggedItem] = useState<ScheduleActivity | null>(null);
  const [isDragging, setIsDragging] = useState(false); // Track when drag is in progress
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTimer, setShowTimer] = useState(false); // New state for timer visibility
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [showSearchBar, setShowSearchBar] = useState(false); // Toggle search bar visibility
  
  // Helper function to handle category selection and reset page number
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setActivitiesPage(1); // Reset to page 1 when changing categories
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
  
  // Get the available activities for the selected category - using Supabase data
  const categoryActivities = !supabaseActivityData ? [] : selectedCategory === 'all'
    ? supabaseActivityData.allCards // Use all cards from Supabase
    : supabaseActivityData.organizedData[selectedCategory] || [];

  // Debug individual data sources
  const { data: rawCategories, isLoading: rawCategoriesLoading } = useSupabaseCategories();
  const { data: rawCards, isLoading: rawCardsLoading } = useSupabaseVocabularyCards();
  
  console.log('=== INDIVIDUAL DATA DEBUG ===');
  console.log('rawCategories:', rawCategories?.length, 'loading:', rawCategoriesLoading);
  console.log('rawCards:', rawCards?.length, 'loading:', rawCardsLoading);
  console.log('=== ORGANIZED DATA DEBUG ===');
  console.log('supabaseActivityData exists:', !!supabaseActivityData);
  console.log('dataLoading:', dataLoading);
  console.log('dataError:', dataError);
  console.log('selectedCategory:', selectedCategory);
  console.log('categoryActivities count:', categoryActivities.length);
  if (supabaseActivityData) {
    console.log('Total allCards:', supabaseActivityData.allCards.length);
    console.log('organizedData keys:', Object.keys(supabaseActivityData.organizedData));
  }
  console.log('=== END DEBUG ===');
            
  // Filter activities by search query if one exists
  const filteredActivities = searchQuery 
    ? categoryActivities.filter(activity => {
        const searchLower = searchQuery.toLowerCase();
        return (
          activity.title.toLowerCase().includes(searchLower) || 
          (activity.speechText && activity.speechText.toLowerCase().includes(searchLower))
        );
      })
    : categoryActivities;
  
  // Dynamic grid layout based on screen size
  // Calculate items per page based on viewport size to prevent scrolling
  const getItemsPerPage = () => {
    // Prevent scrolling by calculating exact number of items that fit on screen
    if (typeof window !== 'undefined') {
      // Calculate the appropriate height available for cards section
      // For different screen sizes and orientations
      const isLandscape = window.innerWidth > window.innerHeight;
      const scheduleSectionHeight = isLandscape 
        ? window.innerHeight * 0.6  // In landscape, we have more vertical space available
        : window.innerHeight * 0.45; // In portrait, we need to account for "My Schedule" taking up space

      // Account for different card sizes on different screens
      const cardHeight = window.innerWidth >= 768 ? 95 : 80; // Smaller cards on phones
      const availableRows = Math.floor(scheduleSectionHeight / cardHeight);
      
      // Calculate columns based on responsive grid classes we set
      let columns = 4; // Default mobile columns
      if (window.innerWidth >= 1536) columns = 7; // 2xl screens (matches 2xl:grid-cols-7)
      if (window.innerWidth >= 1280 && window.innerWidth < 1536) columns = 7; // xl screens (matches xl:grid-cols-7)
      if (window.innerWidth >= 1024 && window.innerWidth < 1280) columns = 6; // lg screens (matches lg:grid-cols-6)
      if (window.innerWidth >= 768 && window.innerWidth < 1024) columns = 5; // md screens (matches md:grid-cols-5)
      if (window.innerWidth >= 640 && window.innerWidth < 768) columns = 4; // sm screens (matches sm:grid-cols-4)
      
      // Calculate exact items that fit on screen without scrolling
      const maxItems = availableRows * columns;
      
      // Enforce minimum items per page for small screens where scrolling is expected
      return Math.max(maxItems, window.innerWidth < 768 ? 20 : 24);
    }
    return 24; // Default fallback
  };
  
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());
  
  // Effect to adjust items per page based on window width
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (activitiesPage - 1) * itemsPerPage;
  const visibleActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);
  
  // Handle drag end event
  const onDragEnd = useCallback(async (result: DropResult) => {
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
        const activityToAdd = visibleActivities[source.index];
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
        
        // Speak the activity's full speech text when it's added to the schedule
        if (language === 'es' && newActivity.speechTextEs) {
          speak(newActivity.speechTextEs);
        } else {
          speak(newActivity.speechText || newActivity.title);
        }
        console.log("Added activity to schedule:", newActivity.title, "Speech:", language === 'es' ? newActivity.speechTextEs : newActivity.speechText);
      } catch (error) {
        console.error("Error adding activity to schedule:", error);
      }
    }
    
    // NEW: If adding to favorites category by dragging
    if (source.droppableId === "activity-cards" && 
        (destination.droppableId === "favorites" || destination.droppableId === "favorites-button")) {
      try {
        const activityToAdd = visibleActivities[source.index];
        if (!activityToAdd || !user) return;
        
        // Add to user favorites in Supabase (temporarily disabled)
        console.log('Would add to favorites:', activityToAdd.id);
        
        // Automatically switch to favorites category to show the result
        if (destination.droppableId === "favorites-button") {
          setSelectedCategory('favorites');
        }
        
        // Speak confirmation
        speak(language === 'es' ? "Añadido a favoritos" : "Added to favorites");
      } catch (error) {
        console.error("Error adding to favorites:", error);
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive",
        });
      }
    }
    
    // NEW: If removing from favorites by dragging out
    if (source.droppableId === "favorites" && destination.droppableId === "activity-cards") {
      try {
        const favoriteCards = supabaseActivityData?.organizedData['favorites'] || [];
        const activityToRemove = favoriteCards[source.index];
        if (!activityToRemove || !user) return;
        
        // Remove from user favorites in Supabase (temporarily disabled)
        console.log('Would remove from favorites:', activityToRemove.id);
        
        // Speak confirmation
        speak(language === 'es' ? "Eliminado de favoritos" : "Removed from favorites");
      } catch (error) {
        console.error("Error removing from favorites:", error);
        toast({
          title: "Error", 
          description: "Failed to remove from favorites",
          variant: "destructive",
        });
      }
    }
  }, [scheduleData, selectedTimeSection, visibleActivities, addToScheduleHistory, selectedCategory, activitiesPage, itemsPerPage, supabaseActivityData, user, toast]);
  
  // Handle drag start to track the item being dragged
  const onDragStart = useCallback((start: any) => {
    const { source } = start;
    setIsDragging(true); // Set dragging state to true
    
    if (source.droppableId === "activity-cards") {
      const draggedActivity = visibleActivities[source.index];
      setDraggedItem(draggedActivity);
    } else if (source.droppableId === "schedule") {
      const draggedActivity = currentSchedule[source.index];
      setDraggedItem(draggedActivity);
    } else if (source.droppableId === "favorites") {
      const favoriteCards = supabaseActivityData?.organizedData['favorites'] || [];
      const draggedActivity = favoriteCards[source.index];
      setDraggedItem(draggedActivity);
    }
  }, [visibleActivities, currentSchedule, supabaseActivityData]);
  
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
    alert("Routine saved!");
    localStorage.setItem('userSchedule', JSON.stringify(scheduleData));
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
      alert(`Schedule saved to ${sectionName}!`);
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
  
  // Event handler for clearing search when any card is clicked
  useEffect(() => {
    const handleClearSearch = () => {
      console.log("Clearing search from card click event");
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
      
      // Speak the activity's full speech text when it's added to the schedule
      if (language === "es" && (newActivity.speechTextEs || newActivity.titleEs)) {
        speak(newActivity.speechTextEs || newActivity.titleEs || newActivity.speechText || newActivity.title);
      } else {
        speak(newActivity.speechText || newActivity.title);
      }
      console.log("Added activity to schedule via click:", newActivity.title);
    };
    
    // Listen for the custom event
    document.addEventListener('addCardToSchedule', handleAddCardToSchedule as EventListener);
    
    // Clean up
    return () => {
      document.removeEventListener('addCardToSchedule', handleAddCardToSchedule as EventListener);
    };
  }, [scheduleData, selectedTimeSection, addToScheduleHistory]);

  return (
    <section className="h-full flex flex-col" style={{ height: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className={`flex-grow ${isPortrait ? 'flex flex-col' : 'flex'} overflow-hidden`} style={{ flex: 1, overflow: 'hidden' }}>
          {/* Side buttons panel - non portrait mode */}
          {!isPortrait && (
            <div className="w-16 sm:w-20 flex flex-col items-center py-4 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 space-y-4">
              {/* Undo button */}
              <button 
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shadow-md ${
                  canUndo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'
                }`}
                onClick={handleUndo}
                disabled={!canUndo}
                title="Undo"
              >
                <i className="ri-arrow-go-back-line text-base sm:text-xl"></i>
              </button>
              
              {/* Redo button */}
              <button 
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shadow-md ${
                  canRedo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'
                }`}
                onClick={handleRedo}
                disabled={!canRedo}
                title="Redo"
              >
                <i className="ri-arrow-go-forward-line text-base sm:text-xl"></i>
              </button>
              
              {/* Play button - largest button */}
              <button 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-purple-500 text-white flex items-center justify-center shadow-lg hover:bg-purple-600"
                onClick={playSchedule}
                title="Play schedule"
              >
                <i className="ri-play-line text-xl sm:text-2xl"></i>
              </button>
              
              {/* Timer toggle button */}
              <button 
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-lg ${showTimer ? 'bg-purple-400' : 'bg-gray-400'} text-white flex items-center justify-center shadow-md hover:bg-purple-500`}
                onClick={() => setShowTimer(!showTimer)}
                title={showTimer ? "Hide timer" : "Show timer"}
              >
                <i className="ri-timer-line text-base sm:text-xl"></i>
              </button>
              
              {/* Save button */}
              <button 
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-md hover:bg-green-600"
                onClick={() => setShowSaveModal(true)}
                title="Save schedule"
              >
                <i className="ri-save-line text-base sm:text-xl"></i>
              </button>
            </div>
          )}
          
          {/* Schedule section */}
          <div className={`${isFullscreen ? 'w-full' : isPortrait ? 'w-full h-auto max-h-[40vh]' : 'w-full sm:w-2/5 md:w-1/3 border-r border-gray-200'} flex flex-col h-full`} style={{ display: 'flex', flexDirection: 'column', flex: isPortrait ? '0 0 auto' : '1' }}>
            {/* Action buttons in portrait mode - now above schedule header */}
            {isPortrait && (
              <div className="flex bg-gray-100 dark:bg-gray-800 px-2 py-2 border-b border-gray-200 dark:border-gray-700 items-center justify-center space-x-4 mt-4">
                {/* Undo button */}
                <button 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
                    canUndo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'
                  }`}
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title="Undo"
                >
                  <i className="ri-arrow-go-back-line text-base"></i>
                </button>
                
                {/* Redo button */}
                <button 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
                    canRedo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'
                  }`}
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title="Redo"
                >
                  <i className="ri-arrow-go-forward-line text-base"></i>
                </button>
                
                {/* Play button */}
                <button 
                  className="w-12 h-12 rounded-lg bg-purple-500 text-white flex items-center justify-center shadow-md hover:bg-purple-600"
                  onClick={playSchedule}
                  title="Play schedule"
                >
                  <i className="ri-play-line text-xl"></i>
                </button>
                
                {/* Timer toggle button */}
                <button 
                  className={`w-10 h-10 rounded-lg ${showTimer ? 'bg-purple-400' : 'bg-gray-400'} text-white flex items-center justify-center shadow-sm hover:bg-purple-500`}
                  onClick={() => setShowTimer(!showTimer)}
                  title={showTimer ? "Hide timer" : "Show timer"}
                >
                  <i className="ri-timer-line text-base"></i>
                </button>
                
                {/* Favorites button removed from portrait mode as requested */}
                
                {/* Save button */}
                <button 
                  className="w-10 h-10 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-sm hover:bg-green-600"
                  onClick={() => setShowSaveModal(true)}
                  title="Save schedule"
                >
                  <i className="ri-save-line text-base"></i>
                </button>
              </div>
            )}
            
            <div className="p-2 bg-blue-100 dark:bg-blue-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="font-bold mr-auto">My Schedule</div>
              
              <div className="flex space-x-1 ml-auto">
                <button 
                  className="p-1.5 rounded-full bg-blue-200 hover:bg-blue-300 text-blue-700"
                  onClick={toggleFullscreen}
                  aria-label="Fullscreen"
                >
                  <i className={`${isFullscreen ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'}`}></i>
                </button>
                <button 
                  className="p-1.5 rounded-md bg-red-100 hover:bg-red-200 text-red-500 flex items-center"
                  onClick={clearActivities}
                  aria-label="Clear all activities"
                  title="Clear All Activities"
                >
                  <i className="ri-delete-bin-line mr-1"></i>
                  <span className="text-[9px] font-medium">Clear All</span>
                </button>
              </div>
            </div>
            
            {/* Time section tabs - moved to top */}
            <div className="p-1 md:p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 flex-shrink-0 md:shadow-md">
              <div className="flex justify-center space-x-1 md:space-x-2">
                {scheduleData.map((section: ScheduleSection) => (
                  <button 
                    key={section.id}
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
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
            <div className={`flex-grow p-1 bg-blue-50 dark:bg-blue-950 ${isPortrait ? 'block' : 'flex flex-col'} overflow-hidden h-full`}>
              <Droppable 
                droppableId="schedule"
                direction={isPortrait ? "horizontal" : "vertical"}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ 
                      height: isPortrait ? '140px' : '100%',
                      minHeight: isPortrait ? '140px' : 'calc(100% - 16px)',
                      maxHeight: isPortrait ? '140px' : '100%'
                    }}
                    className={`${isPortrait 
                      ? 'overflow-x-auto rounded-md p-2 flex flex-nowrap items-center'
                      : 'overflow-y-auto rounded-md p-2 flex flex-col items-center'
                    } ${
                      snapshot.isDraggingOver 
                        ? 'bg-blue-100 dark:bg-blue-900' 
                        : 'bg-white dark:bg-gray-800'
                    } border ${
                      snapshot.isDraggingOver 
                        ? 'border-blue-300 dark:border-blue-700' 
                        : 'border-blue-200 dark:border-gray-700'
                    } w-full h-full`}
                  >
                    {currentSchedule.length === 0 ? (
                      <div className="text-center p-1 text-gray-500 dark:text-gray-400 h-full flex flex-col justify-center w-full">
                        <div className="text-lg mb-0.5">👋</div>
                        <p className="text-[8px] font-medium">Drag activities here</p>
                      </div>
                    ) : (
                      <div className={isPortrait ? 'flex overflow-x-auto pb-2 w-full space-x-8 xs:space-x-12 sm:space-x-24 md:space-x-32' : 'grid grid-cols-1 gap-10 px-4 ml-8'}>
                        {currentSchedule.map((activity: ScheduleActivity, index: number) => (
                          <div key={activity.id} className={`relative ${isPortrait ? 'flex flex-col items-center' : 'w-14 h-14 mx-auto'}`}>
                            <ActivityCard 
                              activity={activity} 
                              index={index}
                              showRemoveButton={true}
                              categoryId={selectedCategory}
                              isDraggable={true}
                            />
                            
                            {/* Only show remove buttons when not dragging */}
                            {!isDragging && (
                              isPortrait ? (
                                // Portrait mode: Show remove button below card
                                <div className="mt-1 w-full text-center">
                                  <button 
                                    className="px-2 py-0.5 bg-red-100 text-red-500 hover:bg-red-200 rounded text-xs shadow-sm border border-red-300"
                                    onClick={() => removeActivity(index)}
                                    aria-label="Remove activity"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                // Landscape mode: Show circle with checkmark to the left of the card
                                <div className="absolute top-0 -left-12 h-full flex items-center">
                                  <button 
                                    className="p-0 bg-orange-200 text-red-600 hover:bg-orange-300 rounded-full text-xs shadow-md z-40 border border-gray-300 w-8 h-8 flex items-center justify-center"
                                    onClick={() => removeActivity(index)}
                                    aria-label="Mark as completed"
                                  >
                                    <i className="ri-check-line text-lg font-bold"></i>
                                  </button>
                                </div>
                              )
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
            <div className={`${isPortrait ? 'w-full flex-grow' : 'w-2/3'} flex flex-col h-full`}>
              {/* Timer - conditionally displayed */}
              {showTimer && (
                <div className="px-3 py-1 border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-950 flex justify-center">
                  <div className="flex items-center justify-between bg-purple-100 dark:bg-purple-900 rounded-md w-full px-3 py-1.5 max-w-md">
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
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                      showSearchBar
                      ? 'bg-cyan-500 text-white font-medium md:font-semibold shadow-sm' 
                      : 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800'
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
                
                  {/* Loading state for categories */}
                  {(categoriesLoading || dataLoading) ? (
                    <div className="px-3 py-1.5 text-xs text-gray-500">Loading categories...</div>
                  ) : categories ? (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                          selectedCategory === category.id 
                          ? 'bg-blue-500 text-white font-medium md:font-semibold shadow-sm' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        onClick={() => handleCategoryChange(category.id)}
                      >
                        {category.id === 'all' && <i className="ri-apps-line mr-1"></i>}
                        {category.id === 'favorites' && <i className="ri-star-fill mr-1"></i>}
                        {category.id === 'hygiene' && <i className="ri-hand-sanitizer-line mr-1"></i>}
                        {category.id === 'meals' && <i className="ri-restaurant-line mr-1"></i>}
                        {category.id === 'dressing' && <i className="ri-shirt-line mr-1"></i>}
                        {category.id === 'places' && <i className="ri-map-pin-line mr-1"></i>}
                        {category.id === 'transportation' && <i className="ri-car-line mr-1"></i>}
                        {category.id === 'appointments' && <i className="ri-calendar-event-line mr-1"></i>}
                        {category.id === 'vacation' && <i className="ri-suitcase-line mr-1"></i>}
                        {category.id === 'chores' && <i className="ri-broom-line mr-1"></i>}
                        {category.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-1.5 text-xs text-red-500">Error loading categories</div>
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
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          onClick={() => setSearchQuery('')}
                          title="Clear search"
                        >
                          <i className="ri-close-circle-line"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Activity cards - main area with extra padding at bottom on larger screens */}
              <div className="flex-grow overflow-auto bg-white dark:bg-gray-800 p-2 pb-2 md:pb-16">
                {selectedCategory === 'favorites' ? (
                  // Special case for favorites - make it a droppable area
                  <Droppable droppableId="favorites" direction="horizontal">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-1 sm:gap-3 md:gap-4 lg:gap-5 p-0.5 sm:p-1 md:p-2 rounded-md min-h-[200px] ${
                          snapshot.isDraggingOver ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-white dark:bg-gray-800'
                        } border ${
                          snapshot.isDraggingOver ? 'border-yellow-300 dark:border-yellow-700' : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {(supabaseActivityData?.organizedData['favorites']?.length || 0) === 0 ? (
                          <div className="col-span-full flex flex-col items-center justify-center text-center p-4 text-gray-500 dark:text-gray-400">
                            <div className="text-3xl mb-2">⭐</div>
                            <h3 className="font-bold mb-1">No favorites yet</h3>
                            <p className="text-sm">Drag activities here to add them to your favorites.</p>
                          </div>
                        ) : (
                          (supabaseActivityData?.organizedData['favorites'] || []).map((activity: ScheduleActivity, index: number) => (
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
                                    onClick={() => {
                                      console.log('Would remove from favorites:', activity.id);
                                    }}
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
                        className={`grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-7 gap-1 sm:gap-3 md:gap-4 lg:gap-10 p-0.5 sm:p-1 md:p-2 ${
                          snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'
                        }`}
                      >
                        {visibleActivities.map((activity: ScheduleActivity, index: number) => (
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
              
              {/* Pagination controls - always visible for all screen sizes */}
              {totalPages > 1 && selectedCategory !== 'favorites' && (
                <div className="sticky bottom-0 mt-4 mb-1 p-1 border border-gray-200 dark:border-gray-700 flex justify-center space-x-2 bg-white dark:bg-gray-800 shadow-md w-full max-w-full rounded-lg mx-auto">
                  <button
                    className={`px-2 py-1 rounded-md text-xs sm:text-sm ${
                      activitiesPage === 1 
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                    }`}
                    onClick={() => activitiesPage > 1 && setActivitiesPage(activitiesPage - 1)}
                    disabled={activitiesPage === 1}
                  >
                    <i className="ri-arrow-left-s-line"></i>
                  </button>
                  <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded-md text-xs sm:text-sm font-medium border border-blue-200 dark:border-blue-800 min-w-[60px] text-center dark:text-gray-200">
                    {activitiesPage} of {totalPages}
                  </span>
                  <button
                    className={`px-2 py-1 rounded-md text-xs sm:text-sm ${
                      activitiesPage === totalPages 
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                    }`}
                    onClick={() => activitiesPage < totalPages && setActivitiesPage(activitiesPage + 1)}
                    disabled={activitiesPage === totalPages}
                  >
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </DragDropContext>
      
      {/* Save modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md dark:text-gray-100">
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