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
          className={`rounded-sm h-[calc(12.5%-0.5px)] p-0.5 mb-0 flex flex-col items-center justify-between cursor-pointer
            ${snapshot.isDragging ? 'shadow-xl transform scale-105' : 'shadow-sm hover:shadow-md'}
            ${activity.bgColor === 'purple-100' ? 'bg-purple-100' : 
              activity.bgColor === 'green-100' ? 'bg-green-100' : 
              activity.bgColor === 'blue-100' ? 'bg-blue-100' : 
              activity.bgColor === 'orange-100' ? 'bg-orange-100' : 'bg-gray-100'} 
            text-gray-800 border 
            ${activity.bgColor === 'purple-100' ? 'border-purple-300' : 
              activity.bgColor === 'green-100' ? 'border-green-300' : 
              activity.bgColor === 'blue-100' ? 'border-blue-300' : 
              activity.bgColor === 'orange-100' ? 'border-orange-300' : 'border-gray-300'}`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.9 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {/* Icon container */}
          <div className="flex-grow flex items-center justify-center w-full py-0.5">
            <i className={`${activity.icon} text-sm`}></i>
          </div>
          
          {/* Text container */}
          <div className="w-full bg-white bg-opacity-80 rounded-sm py-0.5 px-0.5 text-center relative">
            <span className="font-medium text-[8px] leading-tight">{activity.title}</span>
            <span className="absolute right-0.5 bottom-0 text-[4px] text-gray-400">
              <i className="ri-volume-up-line"></i>
            </span>
          </div>
          
          {/* Remove button positioned absolutely in the corner */}
          {showRemoveButton && onRemove && (
            <button 
              className="absolute top-0.5 right-0.5 p-0.5 bg-red-100 text-red-500 hover:bg-red-200 rounded-full text-[8px]"
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