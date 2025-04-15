import { useEffect, useState, useCallback, Fragment } from "react";
import { useAppContext } from "@/contexts/app-context";
import { 
  initialScheduleData, 
  activityCategories, 
  availableActivities, 
  ScheduleActivity,
  ScheduleTimeSection
} from "@/data/scheduleData";
import { customActivityCards, allCustomActivityCards } from "@/data/activityCardData";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import ActivityCard from "@/components/ui/activity-card";
import ActivityTimer from "@/components/ui/activity-timer";
import { v4 as uuidv4 } from 'uuid';
import { speak, speakWithPause } from "@/lib/tts";
import toast from 'react-hot-toast';

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
    isFavoritesMode,
    setFavoritesMode,
    temporaryFavorites,
    addToTemporaryFavorites,
    removeFromTemporaryFavorites,
    isTemporaryFavorite,
    commitTemporaryFavorites
  } = useAppContext();
  
  // Schedule state
  const [scheduleData, setScheduleData] = useState<ScheduleSection[]>(() => {
    // Try to load from localStorage first
    const savedSchedule = localStorage.getItem('userSchedule');
    return savedSchedule ? JSON.parse(savedSchedule) : initialScheduleData;
  });
  
  // UI state
  const [selectedTimeSection, setSelectedTimeSection] = useState("morning");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activitiesPage, setActivitiesPage] = useState(1);
  const itemsPerPage = 25; // Show a 5x5 grid of activities at once
  const [draggedItem, setDraggedItem] = useState<ScheduleActivity | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTimer, setShowTimer] = useState(false); // New state for timer visibility
  
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
      : customActivityCards[selectedCategory] || availableActivities[selectedCategory] || [];
  
  // Calculate pagination
  const totalPages = Math.ceil(categoryActivities.length / itemsPerPage);
  const startIndex = (activitiesPage - 1) * itemsPerPage;
  const visibleActivities = categoryActivities.slice(startIndex, startIndex + itemsPerPage);
  
  // Handle drag end event
  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;
    setDraggedItem(null);
    
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
  }, [scheduleData, selectedTimeSection, visibleActivities, addToScheduleHistory]);
  
  // Handle drag start to track the item being dragged
  const onDragStart = useCallback((start: any) => {
    const { source } = start;
    if (source.droppableId === "activity-cards") {
      const draggedActivity = visibleActivities[source.index];
      setDraggedItem(draggedActivity);
    } else if (source.droppableId === "schedule") {
      const draggedActivity = currentSchedule[source.index];
      setDraggedItem(draggedActivity);
    }
  }, [visibleActivities, currentSchedule]);
  
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
  
  // Handle toggling favorites selection mode
  const toggleFavoritesMode = () => {
    if (isFavoritesMode) {
      // If we're already in favorites mode, commit the changes and exit the mode
      commitTemporaryFavorites();
      toast.success('Favorites updated!', { 
        style: {
          background: '#22c55e', // Green background
          color: '#ffffff',      // White text
        },
        position: 'top-center',
      });
    } else {
      // Enter favorites mode and show instructions
      setFavoritesMode(true);
      const toastMessage = 'Select Activity Cards you\'d like to add to your Favorites category. When finished, select the star again.';
      toast.success(toastMessage, { 
        duration: 5000,
        style: {
          background: '#22c55e', // Green background
          color: '#ffffff',      // White text
        },
        position: 'top-center',
      });
      speak(toastMessage);
    }
  };

  return (
    <section className="h-full flex flex-col">
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className={`flex-grow ${isPortrait ? 'flex flex-col h-full' : 'flex'} overflow-hidden`}>
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
              
              {/* Favorites button */}
              <button 
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md ${
                  isFavoritesMode 
                    ? 'bg-yellow-600 text-white ring-2 ring-yellow-300' 
                    : selectedCategory === 'favorites'
                      ? 'bg-yellow-500 text-white ring-1 ring-yellow-300'
                      : 'bg-yellow-400 text-white'
                } flex items-center justify-center shadow-sm hover:bg-yellow-500`}
                onClick={isFavoritesMode ? toggleFavoritesMode : () => setSelectedCategory('favorites')}
                title={isFavoritesMode ? "Finish selecting favorites" : "View favorites"}
              >
                <i className="ri-star-fill text-sm sm:text-lg"></i>
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
          <div className={`${isFullscreen ? 'w-full' : isPortrait ? 'w-full h-auto max-h-[30vh]' : 'w-full sm:w-2/5 md:w-1/3 border-r border-gray-200'} flex flex-col h-full`}>
            {/* Action buttons in portrait mode - now above schedule header */}
            {isPortrait && (
              <div className="flex bg-gray-100 px-2 py-1 border-b border-gray-200 items-center justify-center space-x-3">
                {/* Undo button */}
                <button 
                  className={`w-7 h-7 rounded-md flex items-center justify-center shadow-sm ${
                    canUndo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'
                  }`}
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title="Undo"
                >
                  <i className="ri-arrow-go-back-line text-xs"></i>
                </button>
                
                {/* Redo button */}
                <button 
                  className={`w-7 h-7 rounded-md flex items-center justify-center shadow-sm ${
                    canRedo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500'
                  }`}
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title="Redo"
                >
                  <i className="ri-arrow-go-forward-line text-xs"></i>
                </button>
                
                {/* Play button */}
                <button 
                  className="w-7 h-7 rounded-md bg-purple-500 text-white flex items-center justify-center shadow-sm hover:bg-purple-600"
                  onClick={playSchedule}
                  title="Play schedule"
                >
                  <i className="ri-play-line text-xs"></i>
                </button>
                
                {/* Timer toggle button */}
                <button 
                  className={`w-7 h-7 rounded-md ${showTimer ? 'bg-purple-400' : 'bg-gray-400'} text-white flex items-center justify-center shadow-sm hover:bg-purple-500`}
                  onClick={() => setShowTimer(!showTimer)}
                  title={showTimer ? "Hide timer" : "Show timer"}
                >
                  <i className="ri-timer-line text-xs"></i>
                </button>
                
                {/* Favorites button */}
                <button 
                  className={`w-7 h-7 rounded-md ${
                    isFavoritesMode 
                      ? 'bg-yellow-600 text-white ring-2 ring-yellow-300' 
                      : selectedCategory === 'favorites'
                        ? 'bg-yellow-500 text-white ring-1 ring-yellow-300'
                        : 'bg-yellow-400 text-white'
                  } flex items-center justify-center shadow-sm hover:bg-yellow-500`}
                  onClick={isFavoritesMode ? toggleFavoritesMode : () => setSelectedCategory('favorites')}
                  title={isFavoritesMode ? "Finish selecting favorites" : "View favorites"}
                >
                  <i className="ri-star-fill text-xs"></i>
                </button>
                
                {/* Save button */}
                <button 
                  className="w-7 h-7 rounded-md bg-green-500 text-white flex items-center justify-center shadow-sm hover:bg-green-600"
                  onClick={() => setShowSaveModal(true)}
                  title="Save schedule"
                >
                  <i className="ri-save-line text-xs"></i>
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
            
            {/* Droppable schedule area */}
            <div className={`flex-grow p-1 bg-blue-50 ${isPortrait ? 'flex flex-row' : 'flex flex-col'} overflow-hidden`}>
              <Droppable 
                droppableId="schedule"
                direction={isPortrait ? "horizontal" : "vertical"}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ 
                      padding: '4px',
                      height: isPortrait ? '100px' : 'auto',
                      minHeight: isPortrait ? '100px' : '200px',
                      maxHeight: isPortrait ? '100px' : '100%'
                    }}
                    className={`${isPortrait 
                      ? 'overflow-x-auto flex-grow rounded-md p-2 flex flex-row gap-3 items-center'
                      : 'overflow-y-auto flex-grow rounded-md p-2 grid grid-cols-1 gap-4 auto-rows-max place-items-center'
                    } ${
                      snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-white'
                    } border ${
                      snapshot.isDraggingOver ? 'border-blue-300' : 'border-blue-200'
                    }`}
                  >
                    {currentSchedule.length === 0 ? (
                      <div className="text-center p-1 text-gray-500 h-full flex flex-col justify-center">
                        <div className="text-lg mb-0.5">👋</div>
                        <p className="text-[8px] font-medium">Drag activities here</p>
                      </div>
                    ) : (
                      currentSchedule.map((activity: ScheduleActivity, index: number) => (
                        <div key={activity.id} className={`relative ${isPortrait ? 'inline-block' : 'w-14 h-14 mx-auto'} pt-1.5 pb-1.5`}>
                          <ActivityCard 
                            activity={activity} 
                            index={index}
                            showRemoveButton={false}
                          />
                          <button 
                            className="absolute -top-1 -right-1 p-1 bg-red-100 text-red-500 hover:bg-red-200 rounded-full text-xs shadow-sm z-40 border border-red-300 w-4 h-4 flex items-center justify-center"
                            onClick={() => removeActivity(index)}
                            aria-label="Remove activity"
                          >
                            <i className="ri-close-line text-[8px]"></i>
                          </button>
                        </div>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            
            {/* Time section tabs */}
            <div className="p-1 bg-gray-50 border-t border-gray-200 sticky bottom-0 z-10 shadow-md">
              <div className="flex justify-center space-x-1">
                {scheduleData.map((section: ScheduleSection) => (
                  <button 
                    key={section.id}
                    className={`px-2 py-1 rounded-md text-xs ${
                      selectedTimeSection === section.id 
                        ? 'bg-blue-500 text-white font-medium shadow-sm' 
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
          </div>
          
          {/* Activity cards section - right side */}
          {!isFullscreen && (
            <div className={`${isPortrait ? 'w-full flex-grow' : 'w-2/3'} flex flex-col h-full`}>
              {/* Timer - conditionally displayed */}
              {showTimer && (
                <div className="p-2 border-b border-gray-200">
                  <ActivityTimer />
                </div>
              )}
              
              {/* Category tabs - always visible */}
              <div className={`${isPortrait ? 'p-1' : 'p-2'} bg-gray-50 border-b border-gray-200 overflow-x-auto flex space-x-1 flex-wrap sticky top-0 z-20 shadow-md ${isPortrait ? 'max-h-16' : 'max-h-24'} overflow-y-auto justify-center`}>
                {activityCategories.map((category) => (
                  <button 
                    key={category.id}
                    className={`${isPortrait ? 'px-1.5 py-0.5 mb-0.5 text-[9px]' : 'px-2 py-1 mb-0.5 text-xs'} whitespace-nowrap rounded-md font-medium border-2 ${
                      (category.color === 'purple-300' ? 'bg-purple-300' :
                       category.color === 'green-400' ? 'bg-green-400' :
                       category.color === 'green-200' ? 'bg-green-200' :
                       category.color === 'orange-200' ? 'bg-orange-200' :
                       category.color === 'blue-400' ? 'bg-blue-400' :
                       category.color === 'purple-200' ? 'bg-purple-200' :
                       category.color === 'orange-100' ? 'bg-orange-100' : 'bg-gray-200')}
                      ${selectedCategory === category.id 
                        ? 'border-black shadow-lg ring-1 ring-offset-1 ring-black font-bold'
                        : 'border-transparent shadow-sm hover:shadow-md'
                      }
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setActivitiesPage(1);
                    }}
                  >
                    <i className={`${
                      category.id === 'favorites' ? 'ri-star-fill' :
                      category.id === 'meals' ? 'ri-restaurant-fill' : 
                      category.id === 'hygiene' ? 'ri-hand-heart-fill' : 
                      category.id === 'arts' ? 'ri-palette-fill' : 
                      category.id === 'outdoors' ? 'ri-plant-fill' : 
                      category.id === 'indoors' ? 'ri-home-fill' : 
                      category.id === 'social' ? 'ri-team-fill' : 
                      category.id === 'holiday' ? 'ri-gift-fill' : 
                      category.id === 'vacation' ? 'ri-plane-fill' : 
                      'ri-apps-fill'
                    } ${isPortrait ? '' : 'mr-1'}`}></i>
                    {category.name}
                  </button>
                ))}
              </div>
              
              {/* Activity cards grid */}
              <div className={`flex-grow ${isPortrait ? 'p-0.5' : 'p-1'} bg-gray-100 flex flex-col relative overflow-hidden`}>
                <div className={`text-center ${isPortrait ? 'text-[10px] mb-0.5 mt-0.5' : 'mb-1 text-xs mt-1'} font-medium flex items-center justify-center`}>
                {isFavoritesMode ? (
                  <span className="bg-green-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center">
                    <i className="ri-star-line mr-1"></i>
                    Selecting Favorites
                  </span>
                ) : (
                  <span className="text-gray-700">Activity Cards</span>
                )}
              </div>
                <Droppable droppableId="activity-cards">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`grid ${isPortrait ? 'grid-cols-4 gap-0.5 px-1' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 sm:gap-2 px-2'} overflow-y-auto flex-grow`}
                      style={{ 
                        minHeight: isPortrait ? "150px" : "200px", 
                        height: isPortrait ? "calc(70vh - 160px)" : "calc(100vh - 300px)", 
                        gridTemplateRows: "repeat(auto-fill, minmax(60px, 1fr))", 
                        alignItems: "center",
                        justifyItems: "center",
                        width: "100%"
                      }}
                    >
                      {visibleActivities.map((activity, index) => (
                        <ActivityCard 
                          key={activity.id} 
                          activity={activity} 
                          index={index}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-1 flex justify-center">
                    <div className="flex space-x-1">
                      <button
                        className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-xs"
                        onClick={() => setActivitiesPage(Math.max(1, activitiesPage - 1))}
                        disabled={activitiesPage === 1}
                      >
                        <i className="ri-arrow-left-s-line"></i>
                      </button>
                      
                      <span className="px-2 py-1 bg-white rounded-md font-medium text-xs">
                        {activitiesPage} / {totalPages}
                      </span>
                      
                      <button
                        className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-xs"
                        onClick={() => setActivitiesPage(Math.min(totalPages, activitiesPage + 1))}
                        disabled={activitiesPage === totalPages}
                      >
                        <i className="ri-arrow-right-s-line"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bottom spacing */}
              <div className="p-1.5 bg-gray-50 border-t border-gray-200 sticky bottom-0 z-10 shadow-md">
                <div className="h-2"></div>
              </div>
            </div>
          )}
        </div>
      </DragDropContext>
      
      {/* Save modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-3 text-center">Save Schedule</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Select where you'd like to save this schedule:
            </p>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {scheduleData.map((section) => (
                <button
                  key={section.id}
                  className={`p-3 rounded-md flex flex-col items-center justify-center hover:bg-blue-50 border-2 ${
                    section.id === 'morning' ? 'border-yellow-400 bg-yellow-50' :
                    section.id === 'afternoon' ? 'border-blue-400 bg-blue-50' :
                    'border-purple-400 bg-purple-50'
                  }`}
                  onClick={() => saveToTimeSection(section.id)}
                >
                  <i className={`${section.icon} text-xl mb-1 ${
                    section.id === 'morning' ? 'text-yellow-500' :
                    section.id === 'afternoon' ? 'text-blue-500' :
                    'text-purple-500'
                  }`}></i>
                  <span className="text-xs font-medium">{section.name}</span>
                </button>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
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
