import { ScheduleActivity } from "@/data/scheduleData";
import { Draggable } from "react-beautiful-dnd";
import { speak } from "@/lib/tts";
// For importing custom image assets
import { lazy, Suspense } from "react";

interface ActivityCardProps {
  activity: ScheduleActivity;
  index: number;
  isDraggable?: boolean;
  showRemoveButton?: boolean;
  onRemove?: () => void;
}

export default function ActivityCard({ 
  activity, 
  index, 
  isDraggable = true, 
  showRemoveButton = false,
  onRemove
}: ActivityCardProps) {
  // Determine if card is in the schedule section (showing removeButton indicates it's in schedule)
  const isInSchedule = showRemoveButton;
  // Handle card click to speak the activity title or speech text if available
  const handleCardClick = () => {
    // Use custom speech text if available, otherwise use the title
    speak(activity.speechText || activity.title);
  };
  
  // Neurodivergent-friendly design - high contrast, clear visual distinction
  return (
    <Draggable draggableId={activity.id} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleCardClick}
          className={`rounded-md ${isInSchedule ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-[58px] h-[58px] sm:w-16 sm:h-16'} flex flex-col items-center justify-between cursor-pointer
            ${snapshot.isDragging ? 'shadow-xl transform scale-105' : 'shadow-sm hover:shadow-md'}
            ${activity.bgColor === 'purple-300' ? 'bg-purple-300' : 
              activity.bgColor === 'green-400' ? 'bg-green-400' : 
              activity.bgColor === 'blue-300' ? 'bg-blue-300' : 
              activity.bgColor === 'blue-400' ? 'bg-blue-400' : 
              activity.bgColor === 'orange-300' ? 'bg-orange-300' : 
              activity.bgColor === 'purple-200' ? 'bg-purple-200' : 
              activity.bgColor === 'orange-100' ? 'bg-orange-100' : 
              activity.bgColor === 'orange-200' ? 'bg-orange-200' : 'bg-gray-100'} 
            text-gray-800 border-none`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.9 : 1,
            transition: 'all 0.2s ease'
          }}
        >
{isInSchedule ? (
            // Compact horizontal layout for schedule cards
            <div className="flex flex-col items-center justify-between w-full h-full">
              <div className="flex-grow flex items-center justify-center w-full">
                {activity.imageSrc ? (
                  <div className="w-full h-full p-0.5 flex items-center justify-center">
                    <img 
                      src={activity.imageSrc} 
                      alt={activity.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <i className={`${activity.icon} text-sm sm:text-xl text-gray-800`}></i>
                )}
              </div>
              <div className="w-full flex justify-center items-center">
                <span className="text-[8px] sm:text-[9px] text-gray-800 bg-white bg-opacity-60 px-1 py-0.5 rounded font-medium max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {activity.title}
                </span>
              </div>
            </div>
          ) : (
            // Original layout for activity selection cards
            <>
              {/* Image/Icon container with responsive sizing */}
              <div className="flex-grow flex items-center justify-center w-full">
                {activity.imageSrc ? (
                  <div className="w-full h-full p-1 flex items-center justify-center">
                    <img 
                      src={activity.imageSrc} 
                      alt={activity.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <i className={`${activity.icon} text-sm sm:text-xl text-gray-800`}></i>
                )}
              </div>
              
              {/* Text container - more mobile-friendly */}
              <div className="w-full bg-white bg-opacity-70 rounded-sm py-0.5 sm:py-1 px-1 text-center">
                <span className="font-medium text-[8px] sm:text-[9px] leading-tight max-w-full overflow-hidden text-ellipsis whitespace-nowrap block">{activity.title}</span>
                <span className="absolute right-1 bottom-1 text-[7px] sm:text-[8px] text-gray-600">
                  <i className="ri-volume-up-line"></i>
                </span>
              </div>
            </>
          )}
          
          {/* Remove button positioned absolutely in the corner - always visible on schedule cards */}
          {showRemoveButton && onRemove && (
            <button 
              className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white hover:bg-red-600 rounded-full text-xs shadow-md z-40 border-2 border-white w-5 h-5 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label="Remove activity"
            >
              <i className="ri-close-line text-[10px]"></i>
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
}