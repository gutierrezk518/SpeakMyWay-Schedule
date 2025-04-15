import { ScheduleActivity } from "./scheduleData";

// Custom activity card data with image paths and speech text
// Based on the provided specification from the user

// Helper function to get image path
const imagePath = (imageName: string) => `/src/assets/activity-cards/${imageName}.png`;

export const customActivityCards: Record<string, ScheduleActivity[]> = {
  "media": [
    { 
      id: "youtube", 
      title: "YouTube", 
      icon: "ri-youtube-fill", 
      bgColor: "blue-400",
      imageSrc: imagePath("youtube"),
      speechText: "Watch YouTube" 
    },
    { 
      id: "tablet", 
      title: "Tablet", 
      icon: "ri-tablet-fill", 
      bgColor: "blue-400",
      imageSrc: imagePath("tablet"),
      speechText: "Go on Your Tablet" 
    },
    { 
      id: "tv", 
      title: "TV", 
      icon: "ri-tv-fill", 
      bgColor: "blue-400",
      imageSrc: imagePath("tv"),
      speechText: "Watch TV" 
    },
    { 
      id: "movie", 
      title: "Movie", 
      icon: "ri-movie-fill", 
      bgColor: "blue-400",
      imageSrc: imagePath("movie"),
      speechText: "Watch a Movie" 
    },
    { 
      id: "phone", 
      title: "Phone", 
      icon: "ri-smartphone-fill", 
      bgColor: "blue-400",
      imageSrc: imagePath("phone"),
      speechText: "Go on Your Phone" 
    },
  ],
  "meals": [
    { 
      id: "breakfast", 
      title: "Breakfast", 
      icon: "ri-cup-fill", 
      bgColor: "purple-300",
      imageSrc: imagePath("breakfast"),
      speechText: "Eat Breakfast" 
    },
    { 
      id: "snack", 
      title: "Snack", 
      icon: "ri-cake-3-fill", 
      bgColor: "purple-300",
      imageSrc: imagePath("snack"),
      speechText: "Eat Snack" 
    },
    { 
      id: "lunch", 
      title: "Lunch", 
      icon: "ri-sandwich-line", 
      bgColor: "purple-300",
      imageSrc: imagePath("lunch"),
      speechText: "Eat Lunch" 
    },
    { 
      id: "dinner", 
      title: "Dinner", 
      icon: "ri-restaurant-fill", 
      bgColor: "purple-300",
      imageSrc: imagePath("dinner"),
      speechText: "Eat Dinner" 
    },
    { 
      id: "water", 
      title: "Water", 
      icon: "ri-water-flash-fill", 
      bgColor: "blue-300",
      imageSrc: imagePath("water"),
      speechText: "Drink Water" 
    },
  ],
  "arts": [
    { 
      id: "color", 
      title: "Color", 
      icon: "ri-palette-fill", 
      bgColor: "blue-300",
      imageSrc: imagePath("color"),
      speechText: "Color" 
    },
    { 
      id: "paint", 
      title: "Paint", 
      icon: "ri-paint-brush-fill", 
      bgColor: "blue-300",
      imageSrc: imagePath("paint"),
      speechText: "Paint" 
    },
    { 
      id: "draw", 
      title: "Draw", 
      icon: "ri-pencil-fill", 
      bgColor: "blue-300",
      imageSrc: imagePath("draw"),
      speechText: "Draw" 
    },
    { 
      id: "scissors", 
      title: "Scissors", 
      icon: "ri-scissors-fill", 
      bgColor: "blue-300",
      imageSrc: imagePath("scissors"),
      speechText: "Cut with Scissors" 
    },
    { 
      id: "artsncrafts", 
      title: "Arts & Crafts", 
      icon: "ri-brush-fill", 
      bgColor: "blue-300",
      imageSrc: imagePath("artsncrafts"),
      speechText: "Do Arts and Crafts" 
    },
  ],
  "social": [
    { 
      id: "friends", 
      title: "Friends", 
      icon: "ri-group-fill", 
      bgColor: "purple-200",
      imageSrc: imagePath("friends"),
      speechText: "Play with Friends" 
    },
    { 
      id: "group", 
      title: "Group", 
      icon: "ri-team-fill", 
      bgColor: "purple-200",
      imageSrc: imagePath("group"),
      speechText: "Group Time" 
    },
    { 
      id: "playtime", 
      title: "Play Time", 
      icon: "ri-gamepad-fill", 
      bgColor: "purple-200",
      imageSrc: imagePath("playtime"),
      speechText: "Play Time" 
    },
  ],
  "holiday": [
    { 
      id: "halloween", 
      title: "Halloween", 
      icon: "ri-ghost-fill", 
      bgColor: "orange-300",
      imageSrc: imagePath("halloween"),
      speechText: "Have Halloween" 
    },
    { 
      id: "christmas", 
      title: "Christmas", 
      icon: "ri-gift-fill", 
      bgColor: "orange-300",
      imageSrc: imagePath("christmas"),
      speechText: "Have Christmas" 
    },
    { 
      id: "hanukah", 
      title: "Hanukah", 
      icon: "ri-candle-fill", 
      bgColor: "orange-300",
      imageSrc: imagePath("hanukah"),
      speechText: "Have Hanukah" 
    },
    { 
      id: "birthday", 
      title: "Birthday Party", 
      icon: "ri-cake-fill", 
      bgColor: "orange-300",
      imageSrc: imagePath("birthday"),
      speechText: "Have a Birthday Party" 
    },
    { 
      id: "party", 
      title: "Family Gathering", 
      icon: "ri-group-fill", 
      bgColor: "orange-300",
      imageSrc: imagePath("party"),
      speechText: "Have a Family Gathering" 
    },
    { 
      id: "parade", 
      title: "Parade", 
      icon: "ri-flag-fill", 
      bgColor: "orange-300",
      imageSrc: imagePath("parade"),
      speechText: "Go to a Parade" 
    },
  ],
  "outdoors": [
    { 
      id: "walk", 
      title: "Walk", 
      icon: "ri-walk-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("walk"),
      speechText: "Go for a Walk" 
    },
    { 
      id: "run", 
      title: "Run", 
      icon: "ri-run-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("run"),
      speechText: "Run" 
    },
    { 
      id: "playground", 
      title: "Playground", 
      icon: "ri-run-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("playground"),
      speechText: "Go to the Playground" 
    },
    { 
      id: "swim", 
      title: "Swim", 
      icon: "ri-ship-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("swim"),
      speechText: "Go Swimming" 
    },
    { 
      id: "camp", 
      title: "Camp", 
      icon: "ri-tent-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("camp"),
      speechText: "Go Camping" 
    },
    { 
      id: "hike", 
      title: "Hike", 
      icon: "ri-walk-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("hike"),
      speechText: "Go on a Hike" 
    },
    { 
      id: "swing", 
      title: "Swing", 
      icon: "ri-anchor-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("swing"),
      speechText: "Go on the Swing" 
    },
    { 
      id: "sandbox", 
      title: "Sandbox", 
      icon: "ri-landscape-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("sandbox"),
      speechText: "Go in the Sandbox" 
    },
    { 
      id: "waterplay", 
      title: "Water Play", 
      icon: "ri-water-flash-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("waterplay"),
      speechText: "Have Waterplay" 
    },
    { 
      id: "park", 
      title: "Park", 
      icon: "ri-tree-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("park"),
      speechText: "Go to the Park" 
    },
    { 
      id: "walkdog", 
      title: "Walk Dog", 
      icon: "ri-footprint-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("walkdog"),
      speechText: "Walk the Dog" 
    },
  ],
  "toys": [
    { 
      id: "toys", 
      title: "Toys", 
      icon: "ri-game-fill", 
      bgColor: "blue-400",
      imageSrc: imagePath("toys"),
      speechText: "Play with Toys" 
    },
  ],
  "indoors": [
    { 
      id: "quiettime", 
      title: "Quiet Time", 
      icon: "ri-volume-mute-fill", 
      bgColor: "blue-400",
      imageSrc: imagePath("quiettime"),
      speechText: "Have quiet Time" 
    },
    { 
      id: "book", 
      title: "Book", 
      icon: "ri-book-open-fill", 
      bgColor: "blue-400",
      imageSrc: imagePath("book"),
      speechText: "Read a Book" 
    },
    { 
      id: "blocks", 
      title: "Blocks", 
      icon: "ri-building-fill", 
      bgColor: "blue-400",
      imageSrc: imagePath("blocks"),
      speechText: "Play with Blocks" 
    },
  ],
  "hygiene": [
    { 
      id: "washhands", 
      title: "Wash Hands", 
      icon: "ri-hand-heart-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("washhands"),
      speechText: "Wash your Hands" 
    },
    { 
      id: "brushteeth", 
      title: "Brush Teeth", 
      icon: "ri-brush-2-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("brushteeth"),
      speechText: "Brush Your Teeth" 
    },
    { 
      id: "toilet", 
      title: "Toilet", 
      icon: "ri-door-lock-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("toilet"),
      speechText: "Go to the Bathroom" 
    },
    { 
      id: "shower", 
      title: "Shower", 
      icon: "ri-showers-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("shower"),
      speechText: "Take a Shower" 
    },
    { 
      id: "comb", 
      title: "Brush Hair", 
      icon: "ri-brush-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("comb"),
      speechText: "Comb your Hair" 
    },
    { 
      id: "washface", 
      title: "Wash Face", 
      icon: "ri-emotion-happy-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("washface"),
      speechText: "Wash your Face" 
    },
  ],
  "vacation": [
    { 
      id: "hotel", 
      title: "Hotel", 
      icon: "ri-hotel-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("hotel"),
      speechText: "Go to Hotel" 
    },
    { 
      id: "car", 
      title: "Car Ride", 
      icon: "ri-car-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("car"),
      speechText: "Go for Car Ride" 
    },
    { 
      id: "beach", 
      title: "Beach", 
      icon: "ri-sailboat-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("beach"),
      speechText: "Go to Beach" 
    },
    { 
      id: "zoo", 
      title: "Zoo", 
      icon: "ri-bear-smile-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("zoo"),
      speechText: "Go to the Zoo" 
    },
  ],
  "chores": [
    { 
      id: "pickup", 
      title: "Pick Up Toys", 
      icon: "ri-brush-fill", 
      bgColor: "purple-300", 
      imageSrc: imagePath("pickup"),
      speechText: "Pick Up Your Toys" 
    },
    { 
      id: "feedpet", 
      title: "Feed Pet", 
      icon: "ri-brush-fill", 
      bgColor: "purple-300", 
      imageSrc: imagePath("feedpet"),
      speechText: "Feed your pet" 
    },
    { 
      id: "settable", 
      title: "Set Table", 
      icon: "ri-brush-fill", 
      bgColor: "purple-300", 
      imageSrc: imagePath("settable"),
      speechText: "Set the Table" 
    },
  ],
  "dressing": [
    { 
      id: "pajamas", 
      title: "Put on PJs", 
      icon: "ri-brush-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("pajamas"),
      speechText: "Put on Pajamas" 
    },
    { 
      id: "shoes", 
      title: "Put on Shoes", 
      icon: "ri-brush-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("shoes"),
      speechText: "Put on Our Shoes" 
    },
    { 
      id: "coat", 
      title: "Put on Coat", 
      icon: "ri-brush-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("coat"),
      speechText: "Put on Your Coat" 
    },
    { 
      id: "getdressed", 
      title: "Get Dressed", 
      icon: "ri-shirt-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("getdressed"),
      speechText: "Get Dressed" 
    },
    { 
      id: "shoesoff", 
      title: "Take Shoes Off", 
      icon: "ri-brush-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("shoesoff"),
      speechText: "Take our Shoes Off" 
    },
  ],
  "appointments": [
    { 
      id: "doctor", 
      title: "Doctor", 
      icon: "ri-brush-fill", 
      bgColor: "purple-300", 
      imageSrc: imagePath("doctor"),
      speechText: "Go to the Doctor" 
    },
    { 
      id: "dentist", 
      title: "Dentist", 
      icon: "ri-brush-fill", 
      bgColor: "purple-300", 
      imageSrc: imagePath("dentist"),
      speechText: "Go to the Dentist" 
    },
    { 
      id: "haircut", 
      title: "Haircut", 
      icon: "ri-brush-fill", 
      bgColor: "purple-300", 
      imageSrc: imagePath("haircut"),
      speechText: "Get a Haircut" 
    },
  ],
  "transportation": [
    { 
      id: "bus", 
      title: "Bus", 
      icon: "ri-brush-fill", 
      bgColor: "blue-400", 
      imageSrc: imagePath("bus"),
      speechText: "Get on a Bus" 
    },
    { 
      id: "train", 
      title: "Train", 
      icon: "ri-train-fill", 
      bgColor: "blue-400", 
      imageSrc: imagePath("train"),
      speechText: "Go on a Train" 
    },
    { 
      id: "car2", 
      title: "Car", 
      icon: "ri-car-fill", 
      bgColor: "blue-400", 
      imageSrc: imagePath("car2"),
      speechText: "Go in the Car" 
    },
    { 
      id: "airplane", 
      title: "Airplane", 
      icon: "ri-plane-fill", 
      bgColor: "blue-400", 
      imageSrc: imagePath("airplane"),
      speechText: "Go on the Airplane" 
    },
  ],
  "places": [
    { 
      id: "school", 
      title: "School", 
      icon: "ri-brush-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("school"),
      speechText: "Go to School" 
    },
    { 
      id: "home", 
      title: "Home", 
      icon: "ri-home-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("home"),
      speechText: "Go Home" 
    },
    { 
      id: "grandmas", 
      title: "Grandma's", 
      icon: "ri-brush-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("grandmas"),
      speechText: "Go to Grandma's House" 
    },
    { 
      id: "restaurant", 
      title: "Restaurant", 
      icon: "ri-restaurant-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("restaurant"),
      speechText: "Go to the Restaurant" 
    },
    { 
      id: "pool", 
      title: "Pool", 
      icon: "ri-brush-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("pool"),
      speechText: "Go to the Pool" 
    },
    { 
      id: "backyard", 
      title: "Backyard", 
      icon: "ri-brush-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("backyard"),
      speechText: "Go to the Backyard" 
    },
    { 
      id: "waterpark", 
      title: "Water Park", 
      icon: "ri-water-flash-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("waterpark"),
      speechText: "Go to the Waterpark" 
    },
    { 
      id: "amusementpark", 
      title: "Amusement Park", 
      icon: "ri-brush-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("amusementpark"),
      speechText: "Go to the Amusement Park" 
    },
    { 
      id: "temple", 
      title: "Temple", 
      icon: "ri-brush-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("temple"),
      speechText: "Go to the Temple" 
    },
    { 
      id: "gym", 
      title: "Gym", 
      icon: "ri-brush-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("gym"),
      speechText: "Go to the Gym" 
    },
    { 
      id: "house", 
      title: "Friend's House", 
      icon: "ri-home-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("house"),
      speechText: "Go to a Friend's House" 
    },
    { 
      id: "bowling", 
      title: "Bowling", 
      icon: "ri-brush-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("bowling"),
      speechText: "Go Bowling" 
    },
    { 
      id: "library", 
      title: "Library", 
      icon: "ri-book-open-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("library"),
      speechText: "Go to the Library" 
    },
    { 
      id: "church", 
      title: "Church", 
      icon: "ri-brush-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("church"),
      speechText: "Go to Church" 
    },
    { 
      id: "temple2", 
      title: "Temple", 
      icon: "ri-brush-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("temple2"),
      speechText: "Go to the Temple" 
    },
    { 
      id: "grocerystore", 
      title: "Grocery Store", 
      icon: "ri-shopping-cart-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("grocerystore"),
      speechText: "Go to the Grocery Store" 
    },
    { 
      id: "postoffice", 
      title: "Post Office", 
      icon: "ri-mail-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("postoffice"),
      speechText: "Go to the Post Office" 
    },
  ]
};

// Combine all categories into a single array for the "all" view
export const allCustomActivityCards: ScheduleActivity[] = Object.values(customActivityCards).flat();