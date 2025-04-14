import { useEffect, useState, useCallback } from "react";
import { useAppContext } from "@/contexts/app-context";
import { 
  initialScheduleData, 
  activityCategories, 
  availableActivities, 
  ScheduleActivity,
  ScheduleTimeSection
} from "@/data/scheduleData";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import ActivityCard from "@/components/ui/activity-card";
import ActivityTimer from "@/components/ui/activity-timer";
import { v4 as uuidv4 } from 'uuid';

interface ScheduleSection extends ScheduleTimeSection {
  activities: ScheduleActivity[];
}

export default function Schedule() {
  const { setCurrentPage } = useAppContext();
  
  // Schedule state
  const [scheduleData, setScheduleData] = useState<ScheduleSection[]>(() => {
    // Try to load from localStorage first
    const savedSchedule = localStorage.getItem('userSchedule');
    return savedSchedule ? JSON.parse(savedSchedule) : initialScheduleData;
  });
  
  // UI state
  const [selectedTimeSection, setSelectedTimeSection] = useState("morning"); 
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activitiesPage, setActivitiesPage] = useState(1);
  const itemsPerPage = 48; // Increased to show more activities at once
  const [draggedItem, setDraggedItem] = useState<ScheduleActivity | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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
  
  // Get the available activities for the selected category
  const categoryActivities = selectedCategory === 'all'
    ? Object.values(availableActivities).flat()
    : availableActivities[selectedCategory] || [];
  
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
        
        console.log("Added activity to schedule:", newActivity.title);
      } catch (error) {
        console.error("Error adding activity to schedule:", error);
      }
    }
  }, [scheduleData, selectedTimeSection, visibleActivities]);
  
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
    const newSchedule = [...scheduleData];
    const section = newSchedule.find((s: ScheduleSection) => s.id === selectedTimeSection);
    if (!section) return;
    
    section.activities.splice(index, 1);
    setScheduleData(newSchedule);
  };
  
  // Clear all activities
  const clearActivities = () => {
    const newSchedule = scheduleData.map((section: ScheduleSection) => {
      if (section.id === selectedTimeSection) {
        return { ...section, activities: [] };
      }
      return section;
    });
    setScheduleData(newSchedule);
  };
  
  // Save the current routine
  const saveRoutine = () => {
    alert("Routine saved!");
    localStorage.setItem('userSchedule', JSON.stringify(scheduleData));
  };
  
  return (
    <section className="h-full flex flex-col">
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex-grow flex overflow-hidden">
          {/* Schedule section - left side */}
          <div className={`${isFullscreen ? 'w-full' : 'w-1/3 border-r border-gray-200'} flex flex-col h-full`}>
            <div className="p-2 bg-blue-100 border-b border-gray-200 flex items-center justify-between">
              <div className="text-center font-bold w-full">My Schedule</div>
              <div className="flex space-x-1">
                <button 
                  className="p-1.5 rounded-full bg-blue-200 hover:bg-blue-300 text-blue-700"
                  onClick={toggleFullscreen}
                  aria-label="Fullscreen"
                >
                  <i className={`${isFullscreen ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'}`}></i>
                </button>
                <button 
                  className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-500"
                  onClick={clearActivities}
                  aria-label="Clear all activities"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
            
            {/* Droppable schedule area */}
            <div className="flex-grow p-1 bg-blue-50 flex flex-col">
              <Droppable droppableId="schedule">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`overflow-y-auto flex-grow rounded-md p-2 grid grid-cols-1 gap-1 auto-rows-min ${
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
                        <ActivityCard 
                          key={activity.id} 
                          activity={activity} 
                          index={index}
                          showRemoveButton
                          onRemove={() => removeActivity(index)}
                        />
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            
            {/* Time section tabs */}
            <div className="p-1 bg-gray-50 border-t border-gray-200">
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
            <div className="w-2/3 flex flex-col h-full">
              {/* Timer */}
              <div className="p-1 border-b border-gray-200">
                <ActivityTimer />
              </div>
              
              {/* Category tabs */}
              <div className="p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto flex space-x-1.5 flex-wrap sticky top-0 z-10">
                {activityCategories.map((category) => (
                  <button 
                    key={category.id}
                    className={`px-2 py-1 mb-0.5 whitespace-nowrap rounded-md text-xs font-medium border-2 ${
                      (category.color === 'purple-300' ? 'bg-purple-300' :
                       category.color === 'green-400' ? 'bg-green-400' :
                       category.color === 'green-200' ? 'bg-green-200' :
                       category.color === 'orange-200' ? 'bg-orange-200' :
                       category.color === 'blue-400' ? 'bg-blue-400' :
                       category.color === 'purple-200' ? 'bg-purple-200' :
                       category.color === 'orange-100' ? 'bg-orange-100' : 'bg-gray-200')}
                      ${selectedCategory === category.id 
                        ? 'border-black shadow-lg ring-2 ring-offset-1 ring-black font-bold'
                        : 'border-transparent shadow-sm hover:shadow-md'
                      }
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setActivitiesPage(1);
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              {/* Activity cards grid */}
              <div className="flex-grow p-1 bg-gray-100 flex flex-col">
                <div className="text-center mb-1 text-xs font-medium text-gray-700">Activity Cards</div>
                <Droppable droppableId="activity-cards">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="grid grid-cols-5 gap-1 overflow-y-auto"
                      style={{ minHeight: "200px", maxHeight: "calc(100vh - 200px)" }}
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
              
              {/* Action button */}
              <div className="p-1.5 bg-gray-50 border-t border-gray-200">
                <button 
                  className="w-full flex items-center justify-center px-3 py-1.5 rounded-md bg-green-500 text-white hover:bg-green-600 font-medium text-xs"
                  onClick={saveRoutine}
                >
                  <i className="ri-save-line mr-1 text-sm"></i>
                  Save My Routine
                </button>
              </div>
            </div>
          )}
        </div>
      </DragDropContext>
    </section>
  );
}
