import { ScheduleActivity } from "@/data/scheduleData";
import { Draggable } from "react-beautiful-dnd";
import { speak } from "@/lib/tts";
import { useAppContext } from "@/contexts/app-context";

interface ActivityCardProps {
  activity: ScheduleActivity;
  index: number;
  isDraggable?: boolean;
  showRemoveButton?: boolean;
  onRemove?: () => void;
  categoryId?: string;
}

export default function ActivityCard({ 
  activity, 
  index, 
  isDraggable = true, 
  showRemoveButton = false,
  onRemove,
  categoryId
}: ActivityCardProps): JSX.Element {
  // Get favorites functionality from context - simplified
  const { 
    isFavorite, 
    toggleFavorite,
    addToFavorites
  } = useAppContext();
  
  // Determine if this activity is a favorite
  const isActivityFavorite = isFavorite(activity.id);
  
  // Determine if card is in the schedule section (checking removeButton)
  const isInSchedule = showRemoveButton;
  
  // Determine if this card is in the Favorites category based on category ID
  const isInFavorites = categoryId === 'favorites';
  
  // Only click functionality, no long press as per user request
  
  // Handle card click to add to schedule
  const handleCardClick = () => {
    // Determine the source area based on where the card is
    const sourceArea = isInSchedule ? "schedule" : 
                      isInFavorites ? "favorites" : "activity-cards";
    
    console.log("Card clicked:", activity.title, "Source area:", sourceArea, "isInSchedule:", isInSchedule);
                      
    // Custom event to add card to schedule when clicked
    const event = new CustomEvent('addCardToSchedule', { 
      detail: { 
        activity,
        sourceArea 
      } 
    });
    document.dispatchEvent(event);
    
    // Speak the activity regardless of location
    speak(activity.speechText || activity.title);
  };
  
  // Neurodivergent-friendly design - high contrast, clear visual distinction, increased sizes
  return (
    <Draggable draggableId={activity.id} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleCardClick}
          className={`rounded-lg ${isInSchedule ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-[80px] h-[80px] sm:w-24 sm:h-24'} flex flex-col items-center justify-between cursor-pointer
            ${snapshot.isDragging ? 'shadow-xl transform scale-105' : 'shadow-md hover:shadow-lg'}
            ${activity.bgColor === 'purple-300' ? 'bg-purple-300' : 
              activity.bgColor === 'green-400' ? 'bg-green-400' : 
              activity.bgColor === 'blue-300' ? 'bg-blue-300' : 
              activity.bgColor === 'blue-400' ? 'bg-blue-400' : 
              activity.bgColor === 'orange-300' ? 'bg-orange-300' : 
              activity.bgColor === 'purple-200' ? 'bg-purple-200' : 
              activity.bgColor === 'orange-100' ? 'bg-orange-100' : 
              activity.bgColor === 'orange-200' ? 'bg-orange-200' : 'bg-gray-100'} 
            text-gray-800`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.9 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {isInSchedule ? (
            // Compact horizontal layout for schedule cards
            <div className="flex flex-col items-center justify-between w-full h-full">
              <div className="flex-grow flex items-center justify-center w-full h-3/4">
                {activity.imageSrc ? (
                  <div className="w-full h-full p-1 flex items-center justify-center">
                    <img 
                      src={activity.imageSrc} 
                      alt={activity.title}
                      className="max-w-full max-h-full object-contain"
                      style={{ maxHeight: "80%" }}
                    />
                  </div>
                ) : (
                  <i className={`${activity.icon} text-base sm:text-2xl text-gray-800`}></i>
                )}
              </div>
              <div className="w-full flex justify-center items-center">
                <span className="text-[11px] sm:text-xs text-gray-800 bg-white bg-opacity-75 px-1 py-0.5 rounded font-medium max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {activity.title}
                </span>
              </div>
            </div>
          ) : (
            // Original layout for activity selection cards
            <>
              {/* Image/Icon container with responsive sizing */}
              <div className="flex-grow flex items-center justify-center w-full h-3/4">
                {activity.imageSrc ? (
                  <div className="w-full h-full p-1.5 flex items-center justify-center">
                    <img 
                      src={activity.imageSrc} 
                      alt={activity.title}
                      className="max-w-full max-h-full object-contain"
                      style={{ maxHeight: "85%" }}
                    />
                  </div>
                ) : (
                  <i className={`${activity.icon} text-lg sm:text-2xl text-gray-800`}></i>
                )}
              </div>
              
              {/* Text container - more accessible */}
              <div className="w-full bg-white bg-opacity-80 rounded-b-lg py-1 px-1 text-center">
                <span className="font-medium text-[11px] sm:text-xs leading-tight max-w-full overflow-hidden text-ellipsis whitespace-nowrap block">{activity.title}</span>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}