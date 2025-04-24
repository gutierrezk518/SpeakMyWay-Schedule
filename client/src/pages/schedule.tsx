import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";

import ActivityCard from "@/components/ui/activity-card";
import { speak } from "@/lib/tts";
import { playTimerComplete } from "@/lib/sounds";
import { useAppContext } from "@/contexts/app-context";
import { availableActivities, allCustomActivityCards, customActivityCards, updateAllActivitiesOrder } from "@/data/activityCardData";
import { ScheduleActivity, ScheduleTimeSection, initialScheduleData } from "@/data/scheduleData";

// Compact Timer Component
const TimerComponent = () => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Get the user name from context
  const { userName } = useAppContext();
  
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
            // Custom message with user's name
            const message = `OK ${userName || 'friend'}, time for our next activity`;
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
  }, [isActive, minutes, seconds, userName]);
  
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
          {isActive ? "Pause" : "Start"}
        </button>
        
        <button 
          onClick={handleReset}
          className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 mx-1"
        >
          Reset
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
    removeFromFavorites
  } = useAppContext();
  
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
  
  // Get the available activities for the selected category - using custom activities with images
  const categoryActivities = selectedCategory === 'all'
    ? allCustomActivityCards // Use our custom activities with images
    : selectedCategory === 'favorites'
      ? favoriteActivities // Show user's favorite activities
      : selectedCategory === 'indoors-chores' 
        ? [...(customActivityCards['media'] || []), ...(customActivityCards['arts'] || []), ...(customActivityCards['indoors'] || []), ...(customActivityCards['chores'] || [])]
        : selectedCategory === 'outdoors-social'
          ? [...(customActivityCards['outdoors'] || []), ...(customActivityCards['social'] || [])]
          : selectedCategory === 'vacation'
            ? [...(customActivityCards['vacation'] || [])]
            : customActivityCards[selectedCategory] || availableActivities[selectedCategory] || [];
            
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
        speak(newActivity.speechText || newActivity.title);
        console.log("Added activity to schedule:", newActivity.title, "Speech:", newActivity.speechText);
      } catch (error) {
        console.error("Error adding activity to schedule:", error);
      }
    }
    
    // NEW: If adding to favorites category by dragging
    if (source.droppableId === "activity-cards" && 
        (destination.droppableId === "favorites" || destination.droppableId === "favorites-button")) {
      try {
        const activityToAdd = visibleActivities[source.index];
        if (!activityToAdd) return;
        
        // Add to favorites - this will avoid duplicates by checking isFavorite
        addToFavorites(activityToAdd);
        
        // Automatically switch to favorites category to show the result
        if (destination.droppableId === "favorites-button") {
          setSelectedCategory('favorites');
        }
        
        // Speak confirmation
        speak("Added to favorites");
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
        speak("Removed from favorites");
      } catch (error) {
        console.error("Error removing from favorites:", error);
      }
    }
  }, [scheduleData, selectedTimeSection, visibleActivities, addToScheduleHistory, selectedCategory, activitiesPage, itemsPerPage, favoriteActivities, addToFavorites, removeFromFavorites]);
  
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
      const draggedActivity = favoriteActivities[source.index];
      setDraggedItem(draggedActivity);
    }
  }, [visibleActivities, currentSchedule, favoriteActivities]);
  
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
      speak("Your schedule is empty. Add some activities first.");
      return;
    }
    
    // Create array of schedule items with ordinal words
    const scheduleTexts: string[] = [];
    
    currentSchedule.forEach((activity, index) => {
      let ordinalPrefix = "";
      
      // Assign ordinal word based on position
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
    });
    
    // Create a single complete sentence from all schedule items
    let fullText = scheduleTexts.join(", ");
    
    // Use userName from the context that we already extracted at the top of the component
    const namePrefix = userName ? `Ok ${userName}. ` : "";
    
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
        speak(activity.speechText || activity.title);
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
      speak(newActivity.speechText || newActivity.title);
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
            <div className="w-12 sm:w-14 flex flex-col items-center py-2 bg-gray-100 border-r border-gray-200 space-y-2">
              {/* Undo button */}
              <button 
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center shadow-sm ${
                  canUndo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'
                }`}
                onClick={handleUndo}
                disabled={!canUndo}
                title="Undo"
              >
                <i className="ri-arrow-go-back-line text-sm sm:text-lg"></i>
              </button>
              
              {/* Redo button */}
              <button 
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center shadow-sm ${
                  canRedo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'
                }`}
                onClick={handleRedo}
                disabled={!canRedo}
                title="Redo"
              >
                <i className="ri-arrow-go-forward-line text-sm sm:text-lg"></i>
              </button>
              
              {/* Play button */}
              <button 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-purple-500 text-white flex items-center justify-center shadow-sm hover:bg-purple-600"
                onClick={playSchedule}
                title="Play schedule"
              >
                <i className="ri-play-line text-sm sm:text-lg"></i>
              </button>
              
              {/* Timer toggle button */}
              <button 
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md ${showTimer ? 'bg-purple-400' : 'bg-gray-400'} text-white flex items-center justify-center shadow-sm hover:bg-purple-500`}
                onClick={() => setShowTimer(!showTimer)}
                title={showTimer ? "Hide timer" : "Show timer"}
              >
                <i className="ri-timer-line text-sm sm:text-lg"></i>
              </button>
              
              {/* Save button */}
              <button 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-green-500 text-white flex items-center justify-center shadow-sm hover:bg-green-600"
                onClick={() => setShowSaveModal(true)}
                title="Save schedule"
              >
                <i className="ri-save-line text-sm sm:text-lg"></i>
              </button>
            </div>
          )}
          
          {/* Schedule section */}
          <div className={`${isFullscreen ? 'w-full' : isPortrait ? 'w-full h-auto max-h-[30vh]' : 'w-full sm:w-2/5 md:w-1/3 border-r border-gray-200'} flex flex-col h-full`} style={{ display: 'flex', flexDirection: 'column', flex: isPortrait ? '0 0 auto' : '1' }}>
            {/* Action buttons in portrait mode - now above schedule header */}
            {isPortrait && (
              <div className="flex bg-gray-100 px-2 py-2 border-b border-gray-200 items-center justify-center space-x-4 mt-4">
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
                
                {/* Favorites button - now just navigates to favorites category */}
                <button 
                  className={`w-10 h-10 rounded-lg ${
                    selectedCategory === 'favorites'
                      ? 'bg-yellow-500 text-white ring-1 ring-yellow-300'
                      : 'bg-yellow-400 text-white'
                  } flex items-center justify-center shadow-sm hover:bg-yellow-500`}
                  onClick={() => setSelectedCategory('favorites')}
                  title="Show favorites"
                >
                  <i className="ri-star-fill text-base"></i>
                </button>
                
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
            
            <div className="p-2 bg-blue-100 border-b border-gray-200 flex items-center justify-between">
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
            <div className="p-1 md:p-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-30 flex-shrink-0 md:shadow-md">
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
            <div className={`flex-grow p-1 bg-blue-50 ${isPortrait ? 'block' : 'flex flex-col'} overflow-hidden h-full`}>
              <Droppable 
                droppableId="schedule"
                direction={isPortrait ? "horizontal" : "vertical"}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ 
                      height: isPortrait ? '100px' : '100%',
                      minHeight: isPortrait ? '100px' : 'calc(100% - 16px)',
                      maxHeight: isPortrait ? '100px' : '100%'
                    }}
                    className={`${isPortrait 
                      ? 'overflow-x-auto rounded-md p-2 flex flex-nowrap items-center'
                      : 'overflow-y-auto rounded-md p-2 flex flex-col items-center'
                    } ${
                      snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-white'
                    } border ${
                      snapshot.isDraggingOver ? 'border-blue-300' : 'border-blue-200'
                    } w-full h-full`}
                  >
                    {currentSchedule.length === 0 ? (
                      <div className="text-center p-1 text-gray-500 h-full flex flex-col justify-center w-full">
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
                <div className="px-3 py-1 border-b border-gray-200 bg-purple-50 flex justify-center">
                  <div className="flex items-center justify-between bg-purple-100 rounded-md w-full px-3 py-1.5 max-w-md">
                    <div className="flex items-center">
                      <i className="ri-timer-line text-lg text-purple-700 mr-2"></i>
                      <span className="text-sm text-purple-800 font-medium">Timer:</span>
                    </div>
                    <TimerComponent />
                  </div>
                </div>
              )}
              
              {/* Categories tabs at the top of the activities section */}
              <div className="p-2 border-b border-gray-200 bg-blue-50">
                <div className="flex flex-wrap gap-1 justify-center">
                  {/* Search button */}
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                      showSearchBar
                      ? 'bg-cyan-500 text-white font-medium md:font-semibold shadow-sm' 
                      : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
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
                
                  {/* All category button */}
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                      selectedCategory === 'all' 
                      ? 'bg-blue-500 text-white font-medium md:font-semibold shadow-sm' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => handleCategoryChange('all')}
                  >
                    <i className="ri-apps-line mr-1"></i>
                    All
                  </button>
                  
                  {/* Make the favorites button a droppable target */}
                  <Droppable droppableId="favorites-button" direction="horizontal" isDropDisabled={false}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`${snapshot.isDraggingOver ? 'scale-110 transition-transform' : ''}`}
                      >
                        <button
                          className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                            selectedCategory === 'favorites' 
                            ? 'bg-yellow-500 text-white font-medium md:font-semibold shadow-sm' 
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
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
                  
                  {/* Dressing Category */}
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                      selectedCategory === 'dressing' 
                      ? 'bg-rose-500 text-white font-medium md:font-semibold shadow-sm' 
                      : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    }`}
                    onClick={() => handleCategoryChange('dressing')}
                  >
                    <i className="ri-shirt-line mr-1"></i>
                    Dressing
                  </button>
                  
                  {/* Holiday Category */}
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                      selectedCategory === 'holiday' 
                      ? 'bg-orange-500 text-white font-medium md:font-semibold shadow-sm' 
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                    onClick={() => handleCategoryChange('holiday')}
                  >
                    <i className="ri-calendar-event-line mr-1"></i>
                    Holiday
                  </button>
                  
                  {/* Hygiene Category */}
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                      selectedCategory === 'hygiene' 
                      ? 'bg-teal-500 text-white font-medium md:font-semibold shadow-sm' 
                      : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                    }`}
                    onClick={() => handleCategoryChange('hygiene')}
                  >
                    <i className="ri-hand-sanitizer-line mr-1"></i>
                    Hygiene
                  </button>
                  
                  {/* Indoors & Chores Category */}
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                      selectedCategory === 'indoors-chores' 
                      ? 'bg-blue-500 text-white font-medium md:font-semibold shadow-sm' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    onClick={() => handleCategoryChange('indoors-chores')}
                  >
                    <i className="ri-home-line mr-1"></i>
                    Indoors & Chores
                  </button>
                  
                  {/* Meals Category */}
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                      selectedCategory === 'meals' 
                      ? 'bg-green-500 text-white font-medium md:font-semibold shadow-sm' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    onClick={() => handleCategoryChange('meals')}
                  >
                    <i className="ri-restaurant-line mr-1"></i>
                    Meals
                  </button>
                  
                  {/* Outdoors & Social Category */}
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                      selectedCategory === 'outdoors-social' 
                      ? 'bg-sky-500 text-white font-medium md:font-semibold shadow-sm' 
                      : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                    }`}
                    onClick={() => handleCategoryChange('outdoors-social')}
                  >
                    <i className="ri-sun-line mr-1"></i>
                    Outdoors & Social
                  </button>
                  
                  {/* Places & Transportation Category */}
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                      selectedCategory === 'places' 
                      ? 'bg-purple-500 text-white font-medium md:font-semibold shadow-sm' 
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                    onClick={() => handleCategoryChange('places')}
                  >
                    <i className="ri-map-pin-line mr-1"></i>
                    Places & Transport
                  </button>
                  
                  {/* Vacation Category */}
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs sm:text-sm ${
                      selectedCategory === 'vacation' 
                      ? 'bg-indigo-500 text-white font-medium md:font-semibold shadow-sm' 
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                    onClick={() => handleCategoryChange('vacation')}
                  >
                    <i className="ri-suitcase-line mr-1"></i>
                    Vacation
                  </button>
                </div>
              </div>
              
              {/* Search bar below categories - conditionally shown */}
              {showSearchBar && (
                <div className="p-2 border-b border-gray-200 bg-blue-50">
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-md">
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <i className="ri-search-line text-gray-400"></i>
                      </div>
                      {searchQuery && (
                        <button 
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
              <div className="flex-grow overflow-auto bg-white p-2 pb-2 md:pb-16">
                {selectedCategory === 'favorites' ? (
                  // Special case for favorites - make it a droppable area
                  <Droppable droppableId="favorites" direction="horizontal">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-1 sm:gap-3 md:gap-4 lg:gap-5 p-0.5 sm:p-1 md:p-2 rounded-md min-h-[200px] ${
                          snapshot.isDraggingOver ? 'bg-yellow-100' : 'bg-white'
                        } border ${
                          snapshot.isDraggingOver ? 'border-yellow-300' : 'border-gray-200'
                        }`}
                      >
                        {favoriteActivities.length === 0 ? (
                          <div className="col-span-full flex flex-col items-center justify-center text-center p-4 text-gray-500">
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
                                    className="px-2 py-0.5 bg-red-100 text-red-500 hover:bg-red-200 rounded text-xs shadow-sm border border-red-300"
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
                        className={`grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-7 gap-1 sm:gap-3 md:gap-4 lg:gap-10 p-0.5 sm:p-1 md:p-2 ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-white'
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
              
              {/* Pagination controls - positioned at bottom right on medium screens to avoid overlap */}
              {totalPages > 1 && selectedCategory !== 'favorites' && (
                <div className="sticky md:fixed bottom-0 left-0 md:left-auto md:right-4 md:bottom-4 p-2 border-t md:border border-gray-200 flex justify-center space-x-2 bg-gray-50 shadow-md w-full md:w-auto md:rounded-lg z-40">
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-sm ${
                      activitiesPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                    onClick={() => activitiesPage > 1 && setActivitiesPage(activitiesPage - 1)}
                    disabled={activitiesPage === 1}
                  >
                    <i className="ri-arrow-left-s-line"></i>
                  </button>
                  <span className="px-2 py-1 md:px-3 md:py-1.5 bg-white rounded-md text-sm font-medium border border-blue-200">
                    Page {activitiesPage} of {totalPages}
                  </span>
                  <button
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-sm ${
                      activitiesPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Save Schedule</h2>
            <p className="mb-4">Choose a time period to save this schedule to:</p>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {scheduleData.map((section) => (
                <button
                  key={section.id}
                  className={`p-2 rounded ${
                    section.id === selectedTimeSection
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
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
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
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