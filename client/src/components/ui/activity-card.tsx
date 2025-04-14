import { ScheduleActivity } from "@/data/scheduleData";
import { Draggable } from "react-beautiful-dnd";
import { speak } from "@/lib/tts";

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
  // Handle card click to speak the activity title
  const handleCardClick = () => {
    speak(activity.title);
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
          className={`rounded-md ${isInSchedule ? 'w-14 h-14 mx-auto my-1.5' : 'w-full h-auto aspect-square p-1'} flex flex-col items-center justify-between cursor-pointer
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
                <i className={`${activity.icon} text-xl text-gray-800`}></i>
              </div>
              <div className="w-full flex justify-center items-center">
                <span className="text-[9px] text-gray-800 bg-white bg-opacity-60 px-1 py-0.5 rounded font-medium max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {activity.title}
                </span>
              </div>
            </div>
          ) : (
            // Original layout for activity selection cards
            <>
              {/* Icon container */}
              <div className="flex-grow flex items-center justify-center w-full">
                <i className={`${activity.icon} text-lg text-gray-800`}></i>
              </div>
              
              {/* Text container */}
              <div className="w-full bg-white bg-opacity-70 rounded-sm py-1 px-1 text-center">
                <span className="font-medium text-[10px] leading-tight">{activity.title}</span>
                <span className="absolute right-1 bottom-1 text-[8px] text-gray-600">
                  <i className="ri-volume-up-line"></i>
                </span>
              </div>
            </>
          )}
          
          {/* Remove button positioned absolutely in the corner - always visible on schedule cards */}
          {showRemoveButton && onRemove && (
            <button 
              className="absolute top-0 right-0 p-1.5 bg-red-500 text-white hover:bg-red-600 rounded-tr-md rounded-bl-full text-xs shadow-md z-30"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label="Remove activity"
            >
              <i className="ri-close-line"></i>
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
}