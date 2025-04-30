export interface ScheduleActivity {
  id: string;
  title: string;
  titleEs?: string;    // Spanish title
  icon: string;
  bgColor: string;
  time?: string;
  imageSrc?: string;   // Path to custom image
  speechText?: string; // Text to speak with TTS that may differ from display text
  speechTextEs?: string; // Spanish text to speak with TTS
}

export interface ScheduleTimeSection {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
}

// Time sections for organizing the schedule
export const timeSections: ScheduleTimeSection[] = [
  {
    id: "morning",
    name: "Morning",
    icon: "ri-sun-line",
    iconColor: "blue-300",
  },
  {
    id: "afternoon",
    name: "Afternoon",
    icon: "ri-sun-foggy-line",
    iconColor: "blue-500",
  },
  {
    id: "evening",
    name: "Evening",
    icon: "ri-moon-line",
    iconColor: "indigo-500",
  },
];

// Categories for the activity cards - using colors from the wireframe
export const activityCategories = [
  { id: "all", name: "All", color: "gray-300" },
  { id: "favorites", name: "Favorites", color: "yellow-300" },
  { id: "media", name: "Media", color: "blue-400" },
  { id: "meals", name: "Meals", color: "purple-300" },
  { id: "arts", name: "Arts", color: "blue-300" },
  { id: "social", name: "Social", color: "purple-200" },
  { id: "holiday", name: "Holiday", color: "orange-100" },
  { id: "vacation", name: "Vacation", color: "orange-200" }, 
  { id: "outdoors", name: "Outdoors", color: "orange-300" },
  { id: "indoors", name: "Indoors", color: "blue-400" },
  { id: "hygiene", name: "Hygiene", color: "green-400" },
  { id: "chores", name: "Chores", color: "green-200" },
  { id: "dressing", name: "Dressing", color: "green-400" },
  { id: "appointments", name: "Appointments", color: "purple-300" },
  { id: "transportation", name: "Transportation", color: "blue-500" },
  { id: "places", name: "Places", color: "orange-300" },
];

// All available activities grouped by category - using clear, high-contrast colors
// and simplified icons for neurodivergent accessibility
export const availableActivities: Record<string, ScheduleActivity[]> = {
  "meals": [
    { id: "breakfast", title: "Breakfast", icon: "ri-cup-fill", bgColor: "purple-300" },
    { id: "lunch", title: "Lunch", icon: "ri-sandwich-line", bgColor: "purple-300" },
    { id: "dinner", title: "Dinner", icon: "ri-restaurant-fill", bgColor: "purple-300" },
    { id: "snack", title: "Snack", icon: "ri-cake-3-fill", bgColor: "purple-300" },
    { id: "water", title: "Water", icon: "ri-water-flash-fill", bgColor: "blue-300" },
    { id: "juice", title: "Juice", icon: "ri-drink-2-fill", bgColor: "blue-300" },
    { id: "milk", title: "Milk", icon: "ri-glass-line", bgColor: "blue-300" },
    { id: "fruits", title: "Fruits", icon: "ri-apple-fill", bgColor: "orange-300" },
  ],
  "hygiene": [
    { id: "toilet", title: "Toilet", icon: "ri-door-lock-fill", bgColor: "green-400" },
    { id: "brush-teeth", title: "Brush Teeth", icon: "ri-brush-2-fill", bgColor: "green-400" },
    { id: "wash-hands", title: "Wash Hands", icon: "ri-hand-heart-fill", bgColor: "green-400" },
    { id: "wash-face", title: "Wash Face", icon: "ri-emotion-happy-fill", bgColor: "green-400" },
    { id: "brush-hair", title: "Brush Hair", icon: "ri-brush-fill", bgColor: "green-400" },
    { id: "get-dressed", title: "Get Dressed", icon: "ri-shirt-fill", bgColor: "green-400" },
    { id: "bath", title: "Bath", icon: "ri-bubble-chart-fill", bgColor: "green-400" },
    { id: "pjs-on", title: "PJs On", icon: "ri-moon-clear-fill", bgColor: "green-400" },
  ],
  "arts": [
    { id: "paint", title: "Paint", icon: "ri-paint-brush-fill", bgColor: "blue-300" },
    { id: "draw", title: "Draw", icon: "ri-pencil-fill", bgColor: "blue-300" },
    { id: "color", title: "Color", icon: "ri-palette-fill", bgColor: "blue-300" },
    { id: "craft", title: "Crafts", icon: "ri-scissors-fill", bgColor: "blue-300" },
    { id: "stickers", title: "Stickers", icon: "ri-star-smile-fill", bgColor: "blue-300" },
    { id: "glue", title: "Glue", icon: "ri-drop-fill", bgColor: "blue-300" },
    { id: "playdough", title: "Playdough", icon: "ri-shape-fill", bgColor: "blue-300" },
  ],
  "outdoors": [
    { id: "play-friends", title: "Play Friends", icon: "ri-group-fill", bgColor: "orange-300" },
    { id: "playground", title: "Playground", icon: "ri-run-fill", bgColor: "orange-300" },
    { id: "walk", title: "Walk", icon: "ri-footprint-fill", bgColor: "orange-300" },
    { id: "bike", title: "Bike", icon: "ri-bike-fill", bgColor: "orange-300" },
    { id: "swing", title: "Swing", icon: "ri-anchor-fill", bgColor: "orange-300" },
    { id: "garden", title: "Garden", icon: "ri-plant-fill", bgColor: "orange-300" },
    { id: "park", title: "Park", icon: "ri-tree-fill", bgColor: "orange-300" },
  ],
  "indoors": [
    { id: "watch-tv", title: "Watch TV", icon: "ri-tv-fill", bgColor: "blue-400" },
    { id: "tablet", title: "Tablet", icon: "ri-tablet-fill", bgColor: "blue-400" },
    { id: "puzzle", title: "Puzzle", icon: "ri-puzzle-fill", bgColor: "blue-400" },
    { id: "trains", title: "Trains", icon: "ri-train-fill", bgColor: "blue-400" },
    { id: "blocks", title: "Blocks", icon: "ri-building-fill", bgColor: "blue-400" },
    { id: "read", title: "Read", icon: "ri-book-open-fill", bgColor: "blue-400" },
    { id: "lego", title: "Lego", icon: "ri-building-3-fill", bgColor: "blue-400" },
  ],
  "social": [
    { id: "morning-meeting", title: "Meeting", icon: "ri-user-voice-fill", bgColor: "purple-300" },
    { id: "group-activity", title: "Group Time", icon: "ri-team-fill", bgColor: "purple-300" },
    { id: "circle-time", title: "Circle Time", icon: "ri-group-fill", bgColor: "purple-300" },
    { id: "sing", title: "Sing", icon: "ri-music-fill", bgColor: "purple-300" },
    { id: "listen-music", title: "Music", icon: "ri-headphone-fill", bgColor: "purple-300" },
    { id: "share", title: "Share", icon: "ri-share-forward-fill", bgColor: "purple-300" },
    { id: "take-turns", title: "Take Turns", icon: "ri-exchange-fill", bgColor: "purple-300" },
  ],
  "holiday": [
    { id: "holiday-1", title: "Christmas", icon: "ri-gift-fill", bgColor: "orange-300" },
    { id: "holiday-2", title: "Halloween", icon: "ri-ghost-fill", bgColor: "orange-300" },
    { id: "holiday-3", title: "Easter", icon: "ri-egg-fill", bgColor: "orange-300" },
    { id: "holiday-4", title: "Birthday", icon: "ri-cake-fill", bgColor: "orange-300" },
    { id: "holiday-5", title: "Thanksgiving", icon: "ri-leaf-fill", bgColor: "orange-300" },
    { id: "holiday-6", title: "Valentine's", icon: "ri-heart-fill", bgColor: "orange-300" },
    { id: "holiday-7", title: "New Year", icon: "ri-calendar-fill", bgColor: "orange-300" },
    { id: "holiday-8", title: "Party", icon: "ri-party-fill", bgColor: "orange-300" },
  ],
  "vacation": [
    { id: "vacation-1", title: "Beach", icon: "ri-sailboat-fill", bgColor: "orange-300" },
    { id: "vacation-2", title: "Zoo", icon: "ri-bear-smile-fill", bgColor: "orange-300" },
    { id: "vacation-3", title: "Museum", icon: "ri-building-fill", bgColor: "orange-300" },
    { id: "vacation-4", title: "Camping", icon: "ri-tent-fill", bgColor: "orange-300" },
    { id: "vacation-5", title: "Travel", icon: "ri-plane-fill", bgColor: "orange-300" },
    { id: "vacation-6", title: "Hotel", icon: "ri-hotel-fill", bgColor: "orange-300" },
    { id: "vacation-7", title: "Car Trip", icon: "ri-car-fill", bgColor: "orange-300" },
    { id: "vacation-8", title: "Grandma's", icon: "ri-home-fill", bgColor: "orange-300" },
  ],
};

// Initial schedule data with kid-friendly icons and colors - only shown to first-time users
export const initialScheduleData = [
  {
    id: "morning",
    name: "Morning",
    icon: "ri-sun-fill",
    iconColor: "yellow-500",
    activities: [
      {
        id: "morning-wakeup",
        title: "Wake Up",
        icon: "ri-alarm-fill",
        bgColor: "purple-300",
        imageSrc: "/activity-cards/wakeup.png",
        speechText: "Wake up"
      },
      {
        id: "morning-breakfast",
        title: "Eat Breakfast",
        icon: "ri-cup-fill",
        bgColor: "purple-300",
        imageSrc: "/activity-cards/breakfast.png",
        speechText: "Eat breakfast"
      },
      {
        id: "morning-brushteeth",
        title: "Brush Teeth",
        icon: "ri-brush-2-fill",
        bgColor: "green-400",
        imageSrc: "/activity-cards/brushteeth.png",
        speechText: "Brush your teeth"
      }
    ]
  },
  {
    id: "afternoon",
    name: "Afternoon",
    icon: "ri-sun-foggy-fill",
    iconColor: "orange-500",
    activities: [
      {
        id: "afternoon-lunch",
        title: "Eat Lunch",
        icon: "ri-sandwich-line",
        bgColor: "purple-300",
        imageSrc: "/activity-cards/lunch.png",
        speechText: "Eat lunch"
      },
      {
        id: "afternoon-outside",
        title: "Play Outside",
        icon: "ri-sun-line",
        bgColor: "green-400",
        imageSrc: "/activity-cards/playground.png",
        speechText: "Play outside"
      },
      {
        id: "afternoon-color",
        title: "Color",
        icon: "ri-palette-fill",
        bgColor: "blue-300",
        imageSrc: "/activity-cards/color.png",
        speechText: "Color"
      }
    ]
  },
  {
    id: "evening",
    name: "Evening",
    icon: "ri-moon-fill",
    iconColor: "indigo-500",
    activities: [
      {
        id: "evening-bath",
        title: "Bath",
        icon: "ri-bubble-chart-fill", 
        bgColor: "green-400",
        imageSrc: "/activity-cards/bath.png",
        speechText: "Take a bath"
      },
      {
        id: "evening-book",
        title: "Book",
        icon: "ri-book-open-fill",
        bgColor: "blue-400",
        imageSrc: "/activity-cards/book.png",
        speechText: "Read a book"
      },
      {
        id: "evening-brushteeth",
        title: "Brush Teeth",
        icon: "ri-brush-2-fill",
        bgColor: "green-400",
        imageSrc: "/activity-cards/brushteeth.png",
        speechText: "Brush your teeth"
      },
      {
        id: "evening-bed",
        title: "Go to Sleep",
        icon: "ri-moon-clear-fill",
        bgColor: "green-400",
        imageSrc: "/activity-cards/sleep.png",
        speechText: "Go to sleep"
      }
    ]
  }
];
