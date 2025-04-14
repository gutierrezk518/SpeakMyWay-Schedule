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
  return (
    <Draggable draggableId={activity.id} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-md p-3 mb-2 flex items-center justify-between
            ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'}
            bg-${activity.bgColor} text-gray-800`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1
          }}
        >
          <div className="flex items-center">
            <i className={`${activity.icon} text-xl mr-2`}></i>
            <span className="font-medium">{activity.title}</span>
          </div>
          
          {showRemoveButton && onRemove && (
            <button 
              className="p-1 text-gray-600 hover:text-gray-800 rounded-full"
              onClick={onRemove}
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