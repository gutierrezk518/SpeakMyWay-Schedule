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
  // Get favorites functionality and language from context
  const { 
    isFavorite, 
    toggleFavorite,
    addToFavorites,
    language
  } = useAppContext();
  
  // Determine if this activity is a favorite
  const isActivityFavorite = isFavorite(activity.id);
  
  // Determine if card is in the schedule section (checking removeButton)
  const isInSchedule = showRemoveButton;
  
  // Determine if this card is in the Favorites category based on category ID
  const isInFavorites = categoryId === 'favorites';
  
  // Only click functionality, no long press as per user request
  
  // Apply Spanish translations when needed
  const applySpanishTranslations = () => {
    if (language === "es" && !activity.titleEs) {
      // Create Spanish translations if none exist
      // These would typically come from the database
      const translations: Record<string, { title: string, speech?: string }> = {
        "Breakfast": { title: "Desayuno", speech: "Desayuno" },
        "Lunch": { title: "Almuerzo", speech: "Almuerzo" },
        "Dinner": { title: "Cena", speech: "Cena" },
        "Snack": { title: "Merienda", speech: "Merienda" },
        "Water": { title: "Agua", speech: "Agua" },
        "Juice": { title: "Jugo", speech: "Jugo" },
        "Milk": { title: "Leche", speech: "Leche" },
        "Toilet": { title: "Baño", speech: "Ir al baño" },
        "Brush Teeth": { title: "Cepillar dientes", speech: "Cepillar los dientes" },
        "Bath": { title: "Baño", speech: "Tomar un baño" },
        "Wake Up": { title: "Despertar", speech: "Despertar" },
        "Go to Sleep": { title: "Dormir", speech: "Ir a dormir" },
        "Play Outside": { title: "Jugar afuera", speech: "Jugar afuera" },
        "Color": { title: "Colorear", speech: "Colorear" },
        "Book": { title: "Libro", speech: "Leer un libro" },
        "Play": { title: "Jugar", speech: "Jugar" },
        "Outdoor Play": { title: "Juego al aire libre", speech: "Jugar al aire libre" },
        "YouTube": { title: "YouTube", speech: "YouTube" },
        "TV": { title: "Televisión", speech: "Ver televisión" },
        "Movie": { title: "Película", speech: "Ver una película" },
        "Tablet": { title: "Tableta", speech: "Usar la tableta" },
        "Phone": { title: "Teléfono", speech: "Usar el teléfono" },
        "Cook": { title: "Cocinar", speech: "Cocinar" },
        "Shower": { title: "Ducha", speech: "Tomar una ducha" },
        "Bathroom": { title: "Baño", speech: "Ir al baño" },
        "Get Dressed": { title: "Vestirse", speech: "Vestirse" },
        "Shoes": { title: "Zapatos", speech: "Ponerse los zapatos" },
        "School": { title: "Escuela", speech: "Ir a la escuela" },
        "Home": { title: "Casa", speech: "Ir a casa" },
        "Park": { title: "Parque", speech: "Ir al parque" },
        "Swimming": { title: "Nadar", speech: "Ir a nadar" },
        "Doctor": { title: "Doctor", speech: "Ir al doctor" },
        "Grocery Store": { title: "Supermercado", speech: "Ir al supermercado" },
        "Library": { title: "Biblioteca", speech: "Ir a la biblioteca" },
        "Car": { title: "Coche", speech: "Ir en coche" },
        "Bus": { title: "Autobús", speech: "Ir en autobús" },
        "Walk": { title: "Caminar", speech: "Caminar" },
        "Bike": { title: "Bicicleta", speech: "Montar en bicicleta" }
      };
      
      if (translations[activity.title]) {
        activity.titleEs = translations[activity.title].title;
        activity.speechTextEs = translations[activity.title].speech;
      }
    }
  };
  
  // Apply translations immediately when the component renders
  useEffect(() => {
    applySpanishTranslations();
  }, [language]);
  
  // Handle card click to add to schedule
  const handleCardClick = () => {
    // Apply Spanish translations again just in case
    applySpanishTranslations();
    
    // Determine the source area based on where the card is
    const sourceArea = isInSchedule ? "schedule" : 
                      isInFavorites ? "favorites" : "activity-cards";
    
    console.log("Card clicked:", activity.title, "Source area:", sourceArea, "isInSchedule:", isInSchedule);
                      
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
            <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-800 bg-white bg-opacity-75 px-0.5 sm:px-1 py-0.5 rounded font-medium max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
              {language === "es" && activity.titleEs ? activity.titleEs : activity.title}
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
          <div className="w-full bg-white bg-opacity-80 rounded-b-lg py-0.5 sm:py-1 px-0.5 sm:px-1 text-center">
            <span className="font-medium text-[10px] xs:text-[11px] sm:text-xs leading-tight max-w-full overflow-hidden text-ellipsis whitespace-nowrap block">
              {language === "es" && activity.titleEs ? activity.titleEs : activity.title}
            </span>
          </div>
        </>
      )}
    </>
  );
  
  // Common class names for card
  const cardClassNames = `rounded-lg ${
    // For cards in schedule section:
    isInSchedule 
      ? 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20' 
      // For cards in activity selection:
      // Use smaller size on phones, larger on tablets & computers
      : 'w-[56px] h-[56px] xs:w-[64px] xs:h-[64px] sm:w-[80px] sm:h-[80px] md:w-24 md:h-24'
    } flex flex-col items-center justify-between cursor-pointer
    shadow-md hover:shadow-lg
    ${activity.bgColor === 'purple-300' ? 'bg-purple-300' : 
      activity.bgColor === 'green-400' ? 'bg-green-400' : 
      activity.bgColor === 'blue-300' ? 'bg-blue-300' : 
      activity.bgColor === 'blue-400' ? 'bg-blue-400' : 
      activity.bgColor === 'orange-300' ? 'bg-orange-300' : 
      activity.bgColor === 'purple-200' ? 'bg-purple-200' : 
      activity.bgColor === 'orange-100' ? 'bg-orange-100' : 
      activity.bgColor === 'orange-200' ? 'bg-orange-200' : 'bg-gray-100'} 
    text-gray-800`;
  
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
            onClick={handleCardClick}
            className={`${cardClassNames} ${snapshot.isDragging ? 'shadow-xl transform scale-105' : ''}`}
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
        onClick={handleCardClick}
        className={cardClassNames}
      >
        {cardContent(false)}
      </div>
    );
  }
}