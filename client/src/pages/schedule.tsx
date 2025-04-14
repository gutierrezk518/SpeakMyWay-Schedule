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
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

interface ScheduleSection extends ScheduleTimeSection {
  activities: ScheduleActivity[];
}

export default function Schedule() {
  const { setCurrentPage, userName } = useAppContext();
  const [currentDate] = useState(new Date());
  
  // Schedule state
  const [scheduleData, setScheduleData] = useState<ScheduleSection[]>(() => {
    // Try to load from localStorage first
    const savedSchedule = localStorage.getItem('userSchedule');
    return savedSchedule ? JSON.parse(savedSchedule) : initialScheduleData;
  });
  
  // UI state
  const [selectedTimeSection, setSelectedTimeSection] = useState("morning"); 
  const [selectedCategory, setSelectedCategory] = useState("meals");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const itemsPerPage = 16;
  
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
  const categoryActivities = availableActivities[selectedCategory] || [];
  
  // Calculate pagination
  const totalPages = Math.ceil(categoryActivities.length / itemsPerPage);
  const startIndex = (activitiesPage - 1) * itemsPerPage;
  const visibleActivities = categoryActivities.slice(startIndex, startIndex + itemsPerPage);
  
  // Handle drag end event
  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;
    
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
      const section = newSchedule.find(s => s.id === selectedTimeSection);
      if (!section) return;
      
      const [movedActivity] = section.activities.splice(source.index, 1);
      section.activities.splice(destination.index, 0, movedActivity);
      
      setScheduleData(newSchedule);
    }
    
    // If adding from activity cards to schedule
    if (source.droppableId === "activity-cards" && destination.droppableId === "schedule") {
      const activityToAdd = categoryActivities[source.index];
      const newSchedule = [...scheduleData];
      const section = newSchedule.find(s => s.id === selectedTimeSection);
      if (!section) return;
      
      // Create a new copy of the activity with a unique ID
      const newActivity = {
        ...activityToAdd,
        id: `${activityToAdd.id}-${uuidv4().slice(0, 8)}`
      };
      
      section.activities.splice(destination.index, 0, newActivity);
      setScheduleData(newSchedule);
    }
  }, [scheduleData, selectedTimeSection, categoryActivities]);
  
  // Remove an activity from the schedule
  const removeActivity = (index: number) => {
    const newSchedule = [...scheduleData];
    const section = newSchedule.find(s => s.id === selectedTimeSection);
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
      <div className="p-3 bg-white border-b border-gray-200">
        <h2 className="text-xl font-bold text-center mb-1">Today's Schedule</h2>
        <p className="text-center text-gray-600 mb-2">
          {userName ? `${userName}'s` : "Your"} activities for {format(currentDate, "MMMM d, yyyy")}
        </p>
        
        {/* Time section tabs */}
        <div className="flex justify-center space-x-2 mb-2">
          {scheduleData.map((section: ScheduleSection) => (
            <button 
              key={section.id}
              className={`px-4 py-1 rounded-md ${
                selectedTimeSection === section.id 
                  ? 'bg-blue-500 text-white' 
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
      
      <div className="flex-grow flex overflow-hidden">
        {/* Schedule section - left side */}
        <div className={`${isFullScreen ? 'w-full' : 'w-1/2'} border-r border-gray-200 flex flex-col h-full`}>
          {/* Control buttons */}
          <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <button 
              className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
              onClick={() => setIsFullScreen(!isFullScreen)}
              aria-label={isFullScreen ? "Show activity cards" : "Hide activity cards"}
            >
              <i className={`ri-${isFullScreen ? 'fullscreen-exit' : 'fullscreen'}-line`}></i>
            </button>
            
            <div className="text-center font-semibold">
              <i className={`${scheduleData.find(s => s.id === selectedTimeSection)?.icon} mr-1`}></i>
              {scheduleData.find(s => s.id === selectedTimeSection)?.name} Schedule
            </div>
            
            <button 
              className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 text-red-500"
              onClick={clearActivities}
              aria-label="Clear all activities"
            >
              <i className="ri-delete-bin-line"></i>
            </button>
          </div>
          
          {/* Droppable schedule area */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex-grow overflow-y-auto p-3 bg-gray-50">
              <Droppable droppableId="schedule">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-full rounded-md p-2 ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-white'
                    } border-2 ${
                      snapshot.isDraggingOver ? 'border-blue-300' : 'border-gray-200'
                    }`}
                  >
                    {currentSchedule.length === 0 ? (
                      <div className="text-center p-8 text-gray-500">
                        <i className="ri-drag-drop-line text-4xl mb-2"></i>
                        <p>Drag activities here to build your schedule</p>
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
          </DragDropContext>
        </div>
        
        {/* Activity cards section - right side */}
        {!isFullScreen && (
          <div className="w-1/2 flex flex-col h-full">
            {/* Timer */}
            <div className="p-2 border-b border-gray-200">
              <ActivityTimer />
            </div>
            
            {/* Category tabs */}
            <div className="p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto flex space-x-1">
              {activityCategories.map((category) => (
                <button 
                  key={category.id}
                  className={`px-3 py-1 whitespace-nowrap rounded-md text-sm ${
                    selectedCategory === category.id 
                      ? `bg-${category.color} text-gray-800` 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex-grow overflow-y-auto p-3 bg-white">
                <Droppable droppableId="activity-cards">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2"
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
                  <div className="mt-4 flex justify-center">
                    <div className="flex space-x-1">
                      <button
                        className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        onClick={() => setActivitiesPage(Math.max(1, activitiesPage - 1))}
                        disabled={activitiesPage === 1}
                      >
                        <i className="ri-arrow-left-s-line"></i>
                      </button>
                      
                      <span className="px-2 py-1 bg-gray-100 rounded-md">
                        {activitiesPage} / {totalPages}
                      </span>
                      
                      <button
                        className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        onClick={() => setActivitiesPage(Math.min(totalPages, activitiesPage + 1))}
                        disabled={activitiesPage === totalPages}
                      >
                        <i className="ri-arrow-right-s-line"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </DragDropContext>
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex justify-center space-x-3">
          <button 
            className="flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white hover:bg-blue-600"
            onClick={saveRoutine}
          >
            <i className="ri-save-line mr-1"></i>
            Save Routine
          </button>
        </div>
      </div>
    </section>
  );
}
