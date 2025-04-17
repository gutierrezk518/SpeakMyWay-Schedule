import { ScheduleActivity } from "./scheduleData";

// Custom activity card data with image paths and speech text
// Based on the provided specification from the spreadsheet

// Define all image paths for the activity cards
// Image paths are relative to the public folder
const youtubeImg = "/activity-cards/youtube.png";
const tabletImg = "/activity-cards/tablet.png";
const tvImg = "/activity-cards/tv.png";
const movieImg = "/activity-cards/movie.png";
const phoneImg = "/activity-cards/phone.png";
const breakfastImg = "/activity-cards/breakfast.png";
const lunchImg = "/activity-cards/lunch.png";
const dinnerImg = "/activity-cards/dinner.png";
const snackImg = "/activity-cards/snack.png";
const waterImg = "/activity-cards/glassofwater.png";
const juiceImg = "/activity-cards/juice.png";
const colorImg = "/activity-cards/color.png";
const paintImg = "/activity-cards/paint.png";
const drawImg = "/activity-cards/draw.png";
const scissorsImg = "/activity-cards/scissor.png";
const artsncraftsImg = "/activity-cards/artsncrafts.png";
const friendsImg = "/activity-cards/friends.png";
const groupactivityImg = "/activity-cards/groupactivity.png";
const halloweenImg = "/activity-cards/halloween.png";
const hanukkahImg = "/activity-cards/hanukkah.png";
const christmasImg = "/activity-cards/christmas.png";
const birthdaypartyImg = "/activity-cards/birthdayparty.png";
const familygatheringImg = "/activity-cards/familygathering.png";
const paradeImg = "/activity-cards/parade.png";
const walkImg = "/activity-cards/walk.png";
const playgroundImg = "/activity-cards/playground.png";
const runImg = "/activity-cards/run.png";
const swimmingImg = "/activity-cards/swimming.png";
const campingImg = "/activity-cards/camping.png";
const bikeImg = "/activity-cards/bike.png";
const swingImg = "/activity-cards/swing.png";
const sandboxImg = "/activity-cards/sandbox.png";
const waterplayImg = "/activity-cards/waterplay.png";
const parkImg = "/activity-cards/park.png";
const walkdogImg = "/activity-cards/walkdog.png";
const quiettimeImg = "/activity-cards/quiettime.png";
const bookImg = "/activity-cards/book.png";
const blocksImg = "/activity-cards/blocks.png";
const toysImg = "/activity-cards/toys.png";
const bathroomImg = "/activity-cards/bathroom.png";
const brushteethImg = "/activity-cards/brushteeth.png";
const washhandsImg = "/activity-cards/wash hands.png";
const showerImg = "/activity-cards/shower.png";
const combhairImg = "/activity-cards/brushhair.png";
const bathImg = "/activity-cards/bath.png";
const washfaceImg = "/activity-cards/washface.png";
const cleanupImg = "/activity-cards/cleanup.png";
const feedpetImg = "/activity-cards/feedpet.png";
const shoesoffImg = "/activity-cards/shoesoff.png";
const shoesonImg = "/activity-cards/shoeson.png";
const coatonImg = "/activity-cards/coaton.png";
const getdressedImg = "/activity-cards/getdressed.png";
const pajamasImg = "/activity-cards/pajamas on.png";
const doctorImg = "/activity-cards/doctor.png";
const therapyImg = "/activity-cards/therapy.png";
const hospitalImg = "/activity-cards/doctor.png";
const busImg = "/activity-cards/schoolbus.png";
const trainImg = "/activity-cards/train.png";
const carImg = "/activity-cards/car.png";
const airplaneImg = "/activity-cards/plane.png";
const homeImg = "/activity-cards/home.png";
const grandmasImg = "/activity-cards/grandma.png";
const restaurantImg = "/activity-cards/resturant.png"; // Note: File is named "resturant.png" (without the 'a')
const poolImg = "/activity-cards/pool.png";
const backyardImg = "/activity-cards/backyard.png";
const waterParkImg = "/activity-cards/waterpark.png";
const amusementParkImg = "/activity-cards/amusementpark.png";
const ymcaImg = "/activity-cards/ymca.png";
const gymImg = "/activity-cards/gym.png";
const friendshouseImg = "/activity-cards/friendshouse.png";
const bowlingImg = "/activity-cards/bowling.png";
const libraryImg = "/activity-cards/library.png";
const churchImg = "/activity-cards/church.png";
const groceryImg = "/activity-cards/grocerystore.png";
const postOfficeImg = "/activity-cards/postoffice.png";
const hotelImg = "/activity-cards/hotel.png";
const beachImg = "/activity-cards/beach.png";
const zooImg = "/activity-cards/zoo.png";

// Helper function to get image path
const imagePath = (imageName: string) => {
  // Map of available images - we'll use our uploaded custom images
  const availableImages: Record<string, string> = {
    // Media
    "youtube": youtubeImg,
    "tablet": tabletImg,
    "tv": tvImg,
    "movie": movieImg,
    "phone": phoneImg,
    
    // Meals
    "breakfast": breakfastImg,
    "lunch": lunchImg,
    "dinner": dinnerImg,
    "snack": snackImg,
    "water": waterImg,
    "juice": juiceImg,
    
    // Arts
    "color": colorImg,
    "paint": paintImg,
    "draw": drawImg,
    "scissors": scissorsImg,
    "artsncrafts": artsncraftsImg,
    
    // Social
    "friends": friendsImg,
    "group": groupactivityImg,
    
    // Holiday
    "halloween": halloweenImg,
    "hanukkah": hanukkahImg,
    "christmas": christmasImg,
    "birthday": birthdaypartyImg,
    "birthdayparty": birthdaypartyImg,
    "party": familygatheringImg,
    "familygathering": familygatheringImg,
    "parade": paradeImg,
    
    // Outdoors
    "walk": walkImg,
    "playground": playgroundImg,
    "run": runImg,
    "swim": swimmingImg,
    "swimming": swimmingImg,
    "camp": campingImg,
    "camping": campingImg,
    "bike": bikeImg,
    "swing": swingImg,
    "sandbox": sandboxImg,
    "waterplay": waterplayImg,
    "park": parkImg,
    "walkdog": walkdogImg,
    
    // Indoors
    "quiettime": quiettimeImg,
    "book": bookImg,
    "blocks": blocksImg,
    "toys": toysImg,
    
    // Hygiene
    "bathroom": bathroomImg,
    "brushteeth": brushteethImg,
    "washhands": washhandsImg,
    "shower": showerImg,
    "combhair": combhairImg,
    "bath": bathImg,
    "washface": washfaceImg,
    
    // Chores
    "cleanup": cleanupImg,
    "feedpet": feedpetImg,
    
    // Dressing
    "shoesoff": shoesoffImg,
    "shoeson": shoesonImg,
    "coaton": coatonImg,
    "getdressed": getdressedImg,
    "pajamas": pajamasImg,
    
    // Appointments
    "doctor": doctorImg,
    "therapy": therapyImg,
    "hospital": hospitalImg,
    
    // Transportation
    "bus": busImg,
    "train": trainImg,
    "car": carImg,  
    "transport_bus": busImg,
    "transport_train": trainImg,
    "transport_car": carImg,
    "transport_airplane": airplaneImg,
    "car_ride": carImg, // For the vacation category car ride
    "airplane": airplaneImg,
    
    // Places
    "home": homeImg,
    "grandmas": grandmasImg,
    "restaurant": restaurantImg,
    "pool": poolImg,
    "backyard": backyardImg,
    "waterpark": waterParkImg,
    "amusementpark": amusementParkImg,
    "ymca": ymcaImg,
    "gym": gymImg,
    "friendshouse": friendshouseImg,
    "bowling": bowlingImg,
    "library": libraryImg,
    "church": churchImg,
    "grocery": groceryImg,
    "postoffice": postOfficeImg,
    "hotel": hotelImg,
    "beach": beachImg,
    "zoo": zooImg,
    
    // Fallback to a generic icon if specific icon isn't found
    "default": toysImg, // Using toys as a default fallback icon
  };
  
  // Return the specific image if available, otherwise use default
  return availableImages[imageName] || availableImages["default"];
};

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
      id: "hanukkah", 
      title: "Hanukkah", 
      icon: "ri-candle-fill", 
      bgColor: "orange-300",
      imageSrc: imagePath("hanukkah"),
      speechText: "Have Hanukkah" 
    },
    { 
      id: "birthday", 
      title: "Birthday Party", 
      icon: "ri-cake-fill", 
      bgColor: "orange-300",
      imageSrc: imagePath("birthdayparty"),
      speechText: "Have a Birthday Party" 
    },
    { 
      id: "party", 
      title: "Family Gathering", 
      icon: "ri-group-fill", 
      bgColor: "orange-300",
      imageSrc: imagePath("familygathering"),
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
      id: "swimming", 
      title: "Swimming", 
      icon: "ri-ship-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("swimming"),
      speechText: "Go Swimming" 
    },
    { 
      id: "camping", 
      title: "Camping", 
      icon: "ri-tent-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("camping"),
      speechText: "Go Camping" 
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
      imageSrc: imagePath("bathroom"),
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
      imageSrc: imagePath("brushhair"),
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
  "chores": [
    { 
      id: "cleanup", 
      title: "Clean Up", 
      icon: "ri-broom-fill", 
      bgColor: "green-200", 
      imageSrc: imagePath("cleanup"),
      speechText: "Clean Up" 
    },
    { 
      id: "feedpet", 
      title: "Feed Pet", 
      icon: "ri-restaurant-fill", 
      bgColor: "green-200", 
      imageSrc: imagePath("feedpet"),
      speechText: "Feed Pet" 
    },
  ],
  "dressing": [
    { 
      id: "shoeson", 
      title: "Shoes On", 
      icon: "ri-footprint-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("shoeson"),
      speechText: "Put Shoes On" 
    },
    { 
      id: "shoesoff", 
      title: "Shoes Off", 
      icon: "ri-footprint-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("shoesoff"),
      speechText: "Take our Shoes Off" 
    },
    { 
      id: "coaton", 
      title: "Coat On", 
      icon: "ri-t-shirt-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("coaton"),
      speechText: "Put Coat On" 
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
      id: "pajamas", 
      title: "Pajamas On", 
      icon: "ri-shirt-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("pajamas"),
      speechText: "Put Pajamas On" 
    },
  ],
  "appointments": [
    { 
      id: "doctor", 
      title: "Doctor", 
      icon: "ri-hospital-fill", 
      bgColor: "purple-300", 
      imageSrc: imagePath("doctor"),
      speechText: "Go to the Doctor" 
    },
    { 
      id: "therapy", 
      title: "Therapy", 
      icon: "ri-mental-health-fill", 
      bgColor: "purple-300", 
      imageSrc: imagePath("therapy"),
      speechText: "Go to Therapy" 
    },
    { 
      id: "hospital", 
      title: "Hospital", 
      icon: "ri-hospital-fill", 
      bgColor: "purple-300", 
      imageSrc: imagePath("hospital"),
      speechText: "Go to Hospital" 
    },
  ],
  "transportation": [
    { 
      id: "transport_bus", 
      title: "Bus", 
      icon: "ri-bus-fill", 
      bgColor: "blue-500", 
      imageSrc: imagePath("bus"),
      speechText: "Get on a Bus" 
    },
    { 
      id: "transport_train", 
      title: "Train", 
      icon: "ri-train-fill", 
      bgColor: "blue-500", 
      imageSrc: imagePath("train"),
      speechText: "Go on a Train" 
    },
    { 
      id: "transport_car", 
      title: "Car", 
      icon: "ri-car-fill", 
      bgColor: "blue-500", 
      imageSrc: imagePath("car"),
      speechText: "Car Ride" 
    },
    { 
      id: "transport_airplane", 
      title: "Airplane", 
      icon: "ri-plane-fill", 
      bgColor: "blue-500", 
      imageSrc: imagePath("airplane"),
      speechText: "Go on an Airplane" 
    },
  ],
  "places": [
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
      icon: "ri-home-heart-fill", 
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
      icon: "ri-water-flash-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("pool"),
      speechText: "Go to the Pool" 
    },
    { 
      id: "backyard", 
      title: "Backyard", 
      icon: "ri-home-gear-fill", 
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
      icon: "ri-ferris-wheel-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("amusementpark"),
      speechText: "Go to the Amusement Park" 
    },
    { 
      id: "ymca", 
      title: "YMCA", 
      icon: "ri-run-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("ymca"),
      speechText: "Go to the YMCA" 
    },
    { 
      id: "gym", 
      title: "Gym", 
      icon: "ri-run-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("gym"),
      speechText: "Go to the Gym" 
    },
    { 
      id: "friendshouse", 
      title: "Friend's House", 
      icon: "ri-home-smile-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("friendshouse"),
      speechText: "Go to a Friend's House" 
    },
    { 
      id: "bowling", 
      title: "Bowling", 
      icon: "ri-ball-pen-fill", 
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
      icon: "ri-building-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("church"),
      speechText: "Go to Church" 
    },
    { 
      id: "grocery", 
      title: "Grocery Store", 
      icon: "ri-shopping-cart-fill", 
      bgColor: "orange-300", 
      imageSrc: imagePath("grocery"),
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
  ],
  "vacation": [
    { 
      id: "hotel", 
      title: "Hotel", 
      icon: "ri-hotel-fill", 
      bgColor: "orange-200", 
      imageSrc: imagePath("hotel"),
      speechText: "Go to Hotel" 
    },
    { 
      id: "car_ride", 
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

};

// Combine all categories into a single array for the "all" view
// Export a mutable reference to all activity cards
export let allCustomActivityCards: ScheduleActivity[] = Object.values(customActivityCards).flat();

// Function to update the all activities array - will be called when reordering
export function updateAllActivitiesOrder(newActivities: ScheduleActivity[]) {
  allCustomActivityCards = [...newActivities];
}