import { ScheduleActivity } from "@/data/scheduleData";
import { Draggable } from "react-beautiful-dnd";

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
  // Neurodivergent-friendly design - high contrast, clear visual distinction
  return (
    <Draggable draggableId={activity.id} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-xl aspect-square p-2 mb-3 flex flex-col items-center justify-between
            ${snapshot.isDragging ? 'shadow-xl transform scale-105' : 'shadow-md'}
            bg-${activity.bgColor} text-gray-800 border-2 border-${activity.bgColor === 'white' ? 'gray-300' : activity.bgColor}`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.9 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {/* Icon container */}
          <div className="flex-grow flex items-center justify-center w-full py-2">
            <i className={`${activity.icon} text-3xl`}></i>
          </div>
          
          {/* Text container */}
          <div className="w-full bg-white bg-opacity-80 rounded-lg py-2 px-1 text-center">
            <span className="font-bold text-sm">{activity.title}</span>
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