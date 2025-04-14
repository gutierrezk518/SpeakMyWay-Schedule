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

// Categories for the activity cards
export const activityCategories = [
  { id: "meals", name: "Meals", color: "purple-300" },
  { id: "arts", name: "Arts", color: "orange-300" },
  { id: "outdoors", name: "Outdoors", color: "yellow-300" },
  { id: "indoors", name: "Indoors", color: "blue-300" },
  { id: "social", name: "Social", color: "purple-300" },
  { id: "holiday", name: "Holiday", color: "orange-300" },
  { id: "vacation", name: "Vacation", color: "yellow-300" },
  { id: "hygiene", name: "Hygiene", color: "blue-300" },
];

// All available activities grouped by category
export const availableActivities: Record<string, ScheduleActivity[]> = {
  "meals": [
    { id: "breakfast", title: "Breakfast", icon: "ri-restaurant-line", bgColor: "purple-300" },
    { id: "lunch", title: "Lunch", icon: "ri-restaurant-2-line", bgColor: "purple-300" },
    { id: "dinner", title: "Dinner", icon: "ri-restaurant-fill", bgColor: "purple-300" },
    { id: "snack", title: "Snack", icon: "ri-cake-line", bgColor: "purple-300" },
    { id: "water", title: "Water", icon: "ri-cup-line", bgColor: "green-300" },
    { id: "juice", title: "Juice", icon: "ri-cup-fill", bgColor: "green-300" },
  ],
  "arts": [
    { id: "paint", title: "Paint", icon: "ri-paint-brush-line", bgColor: "orange-300" },
    { id: "draw", title: "Draw", icon: "ri-pencil-line", bgColor: "orange-300" },
    { id: "color", title: "Color", icon: "ri-palette-line", bgColor: "orange-300" },
    { id: "craft", title: "Crafts", icon: "ri-scissors-cut-line", bgColor: "orange-300" },
    { id: "stickers", title: "Stickers", icon: "ri-emotion-line", bgColor: "orange-300" },
  ],
  "outdoors": [
    { id: "play-friends", title: "Play with Friends", icon: "ri-team-line", bgColor: "yellow-300" },
    { id: "playground", title: "Playground", icon: "ri-basketball-line", bgColor: "yellow-300" },
    { id: "walk", title: "Walk", icon: "ri-walk-line", bgColor: "yellow-300" },
    { id: "bike", title: "Bike", icon: "ri-bike-line", bgColor: "yellow-300" },
    { id: "swing", title: "Swing", icon: "ri-community-line", bgColor: "yellow-300" },
  ],
  "indoors": [
    { id: "watch-tv", title: "Watch TV", icon: "ri-tv-line", bgColor: "blue-300" },
    { id: "tablet", title: "Tablet", icon: "ri-tablet-line", bgColor: "blue-300" },
    { id: "puzzle", title: "Puzzle", icon: "ri-puzzle-line", bgColor: "blue-300" },
    { id: "trains", title: "Trains", icon: "ri-train-line", bgColor: "blue-300" },
    { id: "homework", title: "Homework", icon: "ri-book-line", bgColor: "blue-300" },
  ],
  "social": [
    { id: "morning-meeting", title: "Morning Meeting", icon: "ri-calendar-event-line", bgColor: "purple-300" },
    { id: "group-activity", title: "Group Activity", icon: "ri-team-line", bgColor: "purple-300" },
    { id: "circle-time", title: "Circle Time", icon: "ri-group-line", bgColor: "purple-300" },
    { id: "sing", title: "Sing", icon: "ri-music-line", bgColor: "purple-300" },
    { id: "listen-music", title: "Listen to Music", icon: "ri-headphone-line", bgColor: "purple-300" },
  ],
  "hygiene": [
    { id: "toilet", title: "Toilet", icon: "ri-restroom-line", bgColor: "blue-300" },
    { id: "brush-teeth", title: "Brush Teeth", icon: "ri-brush-line", bgColor: "blue-300" },
    { id: "wash-hands", title: "Wash Hands", icon: "ri-hand-sanitizer-line", bgColor: "blue-300" },
    { id: "wash-face", title: "Wash Face", icon: "ri-drop-line", bgColor: "blue-300" },
    { id: "brush-hair", title: "Brush Hair", icon: "ri-brush-3-line", bgColor: "blue-300" },
    { id: "get-dressed", title: "Get Dressed", icon: "ri-t-shirt-line", bgColor: "blue-300" },
    { id: "bath", title: "Bath", icon: "ri-drop-fill", bgColor: "blue-300" },
    { id: "pjs-on", title: "PJs On", icon: "ri-moon-line", bgColor: "blue-300" },
  ],
  "other": [
    { id: "wake-up", title: "Wake Up", icon: "ri-alarm-line", bgColor: "blue-500" },
    { id: "play", title: "Play", icon: "ri-gamepad-line", bgColor: "green-300" },
    { id: "play-toys", title: "Play with Toys", icon: "ri-shopping-basket-line", bgColor: "green-300" },
    { id: "play-dog", title: "Play with Dog", icon: "ri-bear-smile-line", bgColor: "green-300" },
    { id: "play-cat", title: "Play with Cat", icon: "ri-bear-smile-fill", bgColor: "green-300" },
    { id: "do", title: "Do", icon: "ri-check-line", bgColor: "blue-300" },
    { id: "glue", title: "Glue", icon: "ri-ruler-line", bgColor: "yellow-300" },
    { id: "scissors", title: "Scissors", icon: "ri-scissors-line", bgColor: "yellow-300" },
    { id: "playdough", title: "Playdough", icon: "ri-shape-line", bgColor: "yellow-300" },
  ],
};

// Initial schedule data
export const initialScheduleData = [
  {
    id: "morning",
    name: "Morning",
    icon: "ri-sun-line",
    iconColor: "yellow-500",
    activities: [
      {
        id: "morning-1",
        title: "Wake Up",
        icon: "ri-alarm-line",
        bgColor: "purple-300",
      },
    ]
  },
  {
    id: "afternoon",
    name: "Afternoon",
    icon: "ri-sun-foggy-line",
    iconColor: "orange-500",
    activities: [
      {
        id: "afternoon-1",
        title: "Play",
        icon: "ri-gamepad-line",
        bgColor: "green-300",
      },
    ]
  },
  {
    id: "evening",
    name: "Evening",
    icon: "ri-moon-line",
    iconColor: "indigo-500",
    activities: [
      {
        id: "evening-1",
        title: "Dinner",
        icon: "ri-restaurant-fill",
        bgColor: "purple-300",
      },
    ]
  }
];
