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
          className={`rounded-lg aspect-square p-1.5 mb-2 flex flex-col items-center justify-between cursor-pointer
            ${snapshot.isDragging ? 'shadow-xl transform scale-105' : 'shadow-sm hover:shadow-md'}
            bg-${activity.bgColor} text-gray-800 border border-${activity.bgColor === 'white' ? 'gray-300' : activity.bgColor}`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.9 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {/* Icon container */}
          <div className="flex-grow flex items-center justify-center w-full py-1">
            <i className={`${activity.icon} text-2xl`}></i>
          </div>
          
          {/* Text container */}
          <div className="w-full bg-white bg-opacity-80 rounded-md py-1 px-0.5 text-center relative">
            <span className="font-medium text-xs leading-tight">{activity.title}</span>
            <span className="absolute right-0.5 bottom-0.5 text-[8px] text-gray-400">
              <i className="ri-volume-up-line"></i>
            </span>
          </div>
          
          {/* Remove button positioned absolutely in the corner */}
          {showRemoveButton && onRemove && (
            <button 
              className="absolute top-1 right-1 p-1.5 bg-red-100 text-red-500 hover:bg-red-200 rounded-full"
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