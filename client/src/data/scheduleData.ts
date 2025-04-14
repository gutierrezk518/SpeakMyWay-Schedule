export interface ScheduleActivity {
  id: string;
  title: string;
  icon: string;
  bgColor: string;
  time?: string;
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

// Categories for the activity cards - using brighter, more distinct colors for better neurodivergent accessibility
export const activityCategories = [
  { id: "meals", name: "Food & Drink", color: "yellow-400" },
  { id: "hygiene", name: "Hygiene", color: "blue-400" },
  { id: "arts", name: "Arts & Crafts", color: "pink-400" },
  { id: "outdoors", name: "Outdoors", color: "green-400" },
  { id: "indoors", name: "Indoors", color: "purple-400" },
  { id: "social", name: "Social", color: "red-400" },
  { id: "routine", name: "My Routine", color: "teal-400" },
  { id: "other", name: "Other", color: "gray-400" },
];

// All available activities grouped by category - using clear, high-contrast colors
// and simplified icons for neurodivergent accessibility
export const availableActivities: Record<string, ScheduleActivity[]> = {
  "meals": [
    { id: "breakfast", title: "Breakfast", icon: "ri-cup-fill", bgColor: "yellow-400" },
    { id: "lunch", title: "Lunch", icon: "ri-sandwich-line", bgColor: "yellow-400" },
    { id: "dinner", title: "Dinner", icon: "ri-restaurant-fill", bgColor: "yellow-400" },
    { id: "snack", title: "Snack", icon: "ri-cake-3-fill", bgColor: "yellow-400" },
    { id: "water", title: "Water", icon: "ri-water-flash-fill", bgColor: "yellow-400" },
    { id: "juice", title: "Juice", icon: "ri-drink-2-fill", bgColor: "yellow-400" },
    { id: "milk", title: "Milk", icon: "ri-glass-line", bgColor: "yellow-400" },
    { id: "fruits", title: "Fruits", icon: "ri-apple-fill", bgColor: "yellow-400" },
  ],
  "hygiene": [
    { id: "toilet", title: "Toilet", icon: "ri-door-lock-fill", bgColor: "blue-400" },
    { id: "brush-teeth", title: "Brush Teeth", icon: "ri-brush-2-fill", bgColor: "blue-400" },
    { id: "wash-hands", title: "Wash Hands", icon: "ri-hand-heart-fill", bgColor: "blue-400" },
    { id: "wash-face", title: "Wash Face", icon: "ri-emotion-happy-fill", bgColor: "blue-400" },
    { id: "brush-hair", title: "Brush Hair", icon: "ri-brush-fill", bgColor: "blue-400" },
    { id: "get-dressed", title: "Get Dressed", icon: "ri-shirt-fill", bgColor: "blue-400" },
    { id: "bath", title: "Bath", icon: "ri-bubble-chart-fill", bgColor: "blue-400" },
    { id: "pjs-on", title: "PJs On", icon: "ri-moon-clear-fill", bgColor: "blue-400" },
  ],
  "arts": [
    { id: "paint", title: "Paint", icon: "ri-paint-brush-fill", bgColor: "pink-400" },
    { id: "draw", title: "Draw", icon: "ri-pencil-fill", bgColor: "pink-400" },
    { id: "color", title: "Color", icon: "ri-palette-fill", bgColor: "pink-400" },
    { id: "craft", title: "Crafts", icon: "ri-scissors-fill", bgColor: "pink-400" },
    { id: "stickers", title: "Stickers", icon: "ri-star-smile-fill", bgColor: "pink-400" },
    { id: "glue", title: "Glue", icon: "ri-drop-fill", bgColor: "pink-400" },
    { id: "playdough", title: "Playdough", icon: "ri-shape-fill", bgColor: "pink-400" },
  ],
  "outdoors": [
    { id: "play-friends", title: "Play Friends", icon: "ri-group-fill", bgColor: "green-400" },
    { id: "playground", title: "Playground", icon: "ri-run-fill", bgColor: "green-400" },
    { id: "walk", title: "Walk", icon: "ri-footprint-fill", bgColor: "green-400" },
    { id: "bike", title: "Bike", icon: "ri-bike-fill", bgColor: "green-400" },
    { id: "swing", title: "Swing", icon: "ri-anchor-fill", bgColor: "green-400" },
    { id: "garden", title: "Garden", icon: "ri-plant-fill", bgColor: "green-400" },
    { id: "park", title: "Park", icon: "ri-tree-fill", bgColor: "green-400" },
  ],
  "indoors": [
    { id: "watch-tv", title: "Watch TV", icon: "ri-tv-fill", bgColor: "purple-400" },
    { id: "tablet", title: "Tablet", icon: "ri-tablet-fill", bgColor: "purple-400" },
    { id: "puzzle", title: "Puzzle", icon: "ri-puzzle-fill", bgColor: "purple-400" },
    { id: "trains", title: "Trains", icon: "ri-train-fill", bgColor: "purple-400" },
    { id: "blocks", title: "Blocks", icon: "ri-building-fill", bgColor: "purple-400" },
    { id: "read", title: "Read", icon: "ri-book-open-fill", bgColor: "purple-400" },
    { id: "lego", title: "Lego", icon: "ri-building-3-fill", bgColor: "purple-400" },
  ],
  "social": [
    { id: "morning-meeting", title: "Meeting", icon: "ri-user-voice-fill", bgColor: "red-400" },
    { id: "group-activity", title: "Group Time", icon: "ri-team-fill", bgColor: "red-400" },
    { id: "circle-time", title: "Circle Time", icon: "ri-group-fill", bgColor: "red-400" },
    { id: "sing", title: "Sing", icon: "ri-music-fill", bgColor: "red-400" },
    { id: "listen-music", title: "Music", icon: "ri-headphone-fill", bgColor: "red-400" },
    { id: "share", title: "Share", icon: "ri-share-forward-fill", bgColor: "red-400" },
    { id: "take-turns", title: "Take Turns", icon: "ri-exchange-fill", bgColor: "red-400" },
  ],
  "routine": [
    { id: "wake-up", title: "Wake Up", icon: "ri-alarm-fill", bgColor: "teal-400" },
    { id: "homework", title: "Homework", icon: "ri-book-fill", bgColor: "teal-400" },
    { id: "therapy", title: "Therapy", icon: "ri-mental-health-fill", bgColor: "teal-400" },
    { id: "medicine", title: "Medicine", icon: "ri-medicine-bottle-fill", bgColor: "teal-400" },
    { id: "bedtime", title: "Bedtime", icon: "ri-zzz-fill", bgColor: "teal-400" },
    { id: "quiet-time", title: "Quiet Time", icon: "ri-rest-time-fill", bgColor: "teal-400" },
    { id: "doctor", title: "Doctor", icon: "ri-stethoscope-fill", bgColor: "teal-400" },
  ],
  "other": [
    { id: "play", title: "Play", icon: "ri-gamepad-fill", bgColor: "gray-400" },
    { id: "toys", title: "Toys", icon: "ri-box-3-fill", bgColor: "gray-400" },
    { id: "pet-dog", title: "Pet Dog", icon: "ri-bear-smile-fill", bgColor: "gray-400" },
    { id: "pet-cat", title: "Pet Cat", icon: "ri-lion-fill", bgColor: "gray-400" },
    { id: "wait", title: "Wait", icon: "ri-time-fill", bgColor: "gray-400" },
    { id: "help", title: "Help", icon: "ri-hand-heart-fill", bgColor: "gray-400" },
    { id: "listen", title: "Listen", icon: "ri-ear-fill", bgColor: "gray-400" },
    { id: "look", title: "Look", icon: "ri-eye-fill", bgColor: "gray-400" },
  ],
};

// Initial schedule data with kid-friendly icons and colors
export const initialScheduleData = [
  {
    id: "morning",
    name: "Morning",
    icon: "ri-sun-fill",
    iconColor: "yellow-500",
    activities: [
      {
        id: "morning-1",
        title: "Wake Up",
        icon: "ri-alarm-fill",
        bgColor: "teal-400",
      },
    ]
  },
  {
    id: "afternoon",
    name: "Afternoon",
    icon: "ri-sun-foggy-fill",
    iconColor: "orange-500",
    activities: [
      {
        id: "afternoon-1",
        title: "Play",
        icon: "ri-gamepad-fill",
        bgColor: "gray-400",
      },
    ]
  },
  {
    id: "evening",
    name: "Evening",
    icon: "ri-moon-fill",
    iconColor: "indigo-500",
    activities: [
      {
        id: "evening-1",
        title: "Dinner",
        icon: "ri-restaurant-fill",
        bgColor: "yellow-400",
      },
    ]
  }
];
