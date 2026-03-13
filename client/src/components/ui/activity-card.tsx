import { ScheduleActivity } from "@/data/scheduleData";
import { Draggable } from "react-beautiful-dnd";
import { getBgClass } from "@/lib/utils";
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
  const { language } = useAppContext();

  // Determine if card is in the schedule section (checking removeButton)
  const isInSchedule = showRemoveButton;

  // Determine if this card is in the Favorites category based on category ID
  const isInFavorites = categoryId === 'favorites';

  // Display title based on current language — supports live language switching
  const displayTitle = language === 'es' && activity.titleEs ? activity.titleEs : activity.title;
  
  // Handle card click to add to schedule
  const handleCardClick = () => {
    // Determine the source area based on where the card is
    const sourceArea = isInSchedule ? "schedule" :
                      isInFavorites ? "favorites" : "activity-cards";
                      
    // First, dispatch a custom event specifically to clear search
    const clearSearchEvent = new CustomEvent('clearSearchOnCardClick', {});
    document.dispatchEvent(clearSearchEvent);
    
    // Then, dispatch the regular event to add card to schedule
    const event = new CustomEvent('addCardToSchedule', { 
      detail: { 
        activity,
        sourceArea 
      } 
    });
    document.dispatchEvent(event);
    
    // Don't speak here as it will be handled in the event handler
    // Removed to fix the double-speaking issue on iOS
  };
  
  // Create a common card UI based on where it's used
  const cardContent = (isDragging = false) => (
    <>
      {isInSchedule ? (
        // Compact horizontal layout for schedule cards
        <div className="flex flex-col items-center justify-between w-full h-full">
          <div className="flex-grow flex items-center justify-center w-full h-3/4">
            {activity.imageSrc ? (
              <div className="w-full h-full p-1 flex items-center justify-center">
                <img 
                  src={activity.imageSrc} 
                  alt={`${displayTitle} activity card`}
                  className="max-w-full max-h-full object-contain"
                  style={{ maxHeight: "80%" }}
                />
              </div>
            ) : (
              <i className={`${activity.icon} text-base sm:text-2xl text-gray-800 dark:text-gray-100`}></i>
            )}
          </div>
          <div className="w-full flex justify-center items-center">
            <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 bg-opacity-75 px-0.5 sm:px-1 py-0.5 rounded-lg font-medium max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
              {displayTitle}
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
                  alt={`${displayTitle} activity card`}
                  className="max-w-full max-h-full object-contain"
                  style={{ maxHeight: "85%" }}
                />
              </div>
            ) : (
              <i className={`${activity.icon} text-lg sm:text-2xl text-gray-800 dark:text-gray-100`}></i>
            )}
          </div>
          
          {/* Text container - more accessible */}
          <div className="w-full bg-white dark:bg-gray-800 bg-opacity-80 rounded-b-xl py-0.5 sm:py-1 px-0.5 sm:px-1 text-center">
            <span className="font-medium text-[10px] xs:text-[11px] sm:text-xs leading-tight max-w-full overflow-hidden text-ellipsis whitespace-nowrap block dark:text-gray-100">
              {displayTitle}
            </span>
          </div>
        </>
      )}
    </>
  );
  
  // Common class names for card with static color mapping
  const getBgColorClass = (bgColor: string) => getBgClass(bgColor);

  const cardClassNames = `rounded-xl ${
    // For cards in schedule section:
    isInSchedule
      ? 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20'
      // For cards in activity selection:
      // Use auto width to fit grid, with max sizes to prevent overflow
      : 'w-full h-auto aspect-square max-w-[85px] xs:max-w-[90px] sm:max-w-[95px] md:max-w-[110px] lg:max-w-[120px]'
    } flex flex-col items-center justify-between cursor-pointer
    shadow-md hover:shadow-lg
    ${getBgColorClass(activity.bgColor)}
    text-gray-800 dark:text-gray-100`;
  
  // Neurodivergent-friendly design - high contrast, clear visual distinction, increased sizes
  if (isDraggable) {
    // For elements that need to be draggable (schedule items and favorites)
    return (
      <Draggable draggableId={activity.id} index={index} isDragDisabled={false}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            role="button"
            aria-label={`${displayTitle} activity, draggable`}
            onClick={handleCardClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } }}
            className={`${cardClassNames} focus:outline-2 focus:outline-blue-500 ${snapshot.isDragging ? 'shadow-xl transform scale-105' : ''}`}
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0.9 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {cardContent(snapshot.isDragging)}
          </div>
        )}
      </Draggable>
    );
  } else {
    // For non-draggable elements (regular activity cards)
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Add ${displayTitle} to schedule`}
        onClick={handleCardClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } }}
        className={cardClassNames}
      >
        {cardContent(false)}
      </div>
    );
  }
}