import { Milk } from "lucide-react";
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
const cookImg = "/activity-cards/cook.png";
const breakfastImg = "/activity-cards/breakfast.png";
const lunchImg = "/activity-cards/lunch.png";
const dinnerImg = "/activity-cards/dinner.png";
const snackImg = "/activity-cards/snack.png";
const waterImg = "/activity-cards/glassofwater.png";
const juiceImg = "/activity-cards/juice.png";
const milkImg = "/activity-cards/milk.png";
const chocolatemilkImg = "/activity-cards/chocolatemilk.png";
// Using the actual wake up and sleep images
const wakeupImg = "/activity-cards/wakeup.png"; 
const sleepImg = "/activity-cards/sleep.png";
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
const puzzleImg = "/activity-cards/puzzle.png";
const bathroomImg = "/activity-cards/bathroom.png";
const brushteethImg = "/activity-cards/brushteeth.png";
const washhandsImg = "/activity-cards/wash hands.png";
const showerImg = "/activity-cards/shower.png";
const combhairImg = "/activity-cards/brushhair.png";
const bathImg = "/activity-cards/bath.png";
const washfaceImg = "/activity-cards/washface.png";
const cleanupImg = "/activity-cards/cleanup.png";
const feedpetImg = "/activity-cards/feedpet.png";
const settableImg = "/activity-cards/settable.png"; 
const shoesoffImg = "/activity-cards/shoesoff.png";
const shoesonImg = "/activity-cards/shoeson.png";
const coatonImg = "/activity-cards/coaton.png";
const getdressedImg = "/activity-cards/getdressed.png";
const pajamasImg = "/activity-cards/pajamas on.png";
const doctorImg = "/activity-cards/doctor.png";
const breakImg = "/activity-cards/break.png";
const musicImg = "/activity-cards/music.png";
const therapyImg = "/activity-cards/therapy.png";
const hospitalImg = "/activity-cards/doctor.png";
const haircutImg = "/activity-cards/haircut.png";
const dentistImg = "/activity-cards/dentist.png";
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
const schoolImg = "/activity-cards/school.png";
const sportsImg = "/activity-cards/sports.png";
const ballImg = "/activity-cards/ball.png";
const scooterImg = "/activity-cards/scooter.png";
const slideImg = "/activity-cards/slide.png";
const soccerImg = "/activity-cards/soccer.png";
const basketballImg = "/activity-cards/basketball.png";
const baseballImg = "/activity-cards/baseball.png";
const footballImg = "/activity-cards/football.png";
const playoutsideimg = "/activity-cards/playoutside.png"
const dessertImg = "/activity-cards/dessert.png"

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
    "music": musicImg,
    
    // Meals
    "breakfast": breakfastImg,
    "lunch": lunchImg,
    "dinner": dinnerImg,
    "snack": snackImg,
    "cook": cookImg,
    "water": waterImg,
    "juice": juiceImg,
    "milk": milkImg,
    "chocolatemilk": chocolatemilkImg,
    "dessert": dessertImg,
    
      
    
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
    "sports": sportsImg,
    "ball": ballImg,
    "scooter": scooterImg,
    "slide": slideImg,
    "soccer": soccerImg,
    "basketball": basketballImg,
    "baseball": baseballImg,
    "football": footballImg,
    "playoutside": playoutsideimg,
    
    // Indoors
    "quiettime": quiettimeImg,
    "book": bookImg,
    "blocks": blocksImg,
    "toys": toysImg,
    "puzzle": puzzleImg,
    "break": breakImg,
    
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
    "settable": settableImg,
    
    // Dressing
    "shoesoff": shoesoffImg,
    "shoeson": shoesonImg,
    "coaton": coatonImg,
    "getdressed": getdressedImg,
    "pajamas": pajamasImg,
    "wakeup": "/activity-cards/wakeup.png",
    "sleep": "/activity-cards/sleep.png",
    
    // Appointments
    "doctor": doctorImg,
    "therapy": therapyImg,
    "hospital": hospitalImg,
    "haircut": haircutImg,
    "dentist": dentistImg,
    
    // Transportation
    "bus": busImg,
    "train": trainImg,
    "car": carImg,  
    "transport_bus": busImg,
    "transport_train": trainImg,
    "transport_car": carImg,
    "transport_airplane": airplaneImg,
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
    "school": schoolImg,
    
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
      id: "music", 
      title: "Music", 
      icon: "ri-music-fill", 
      bgColor: "blue-400",
      imageSrc: imagePath("music"),
      speechText: "Listen to Music"
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
    { 
      id: "juice", 
      title: "Juice", 
      icon: "ri-cup-fill", 
      bgColor: "blue-300",
      imageSrc: imagePath("juice"),
      speechText: "Drink Juice" 
    },
    {
      id: "cook",
      title: "Cook",
      icon: "ri-restaurant-line",
      bgColor: "blue-400", 
      imageSrc: imagePath("cook"),
      speechText: "Cook"
    },
    { 
      id: "milk", 
      title: "Milk", 
      icon: "ri-cup-fill", 
      bgColor: "blue-300",
      imageSrc: imagePath("milk"),
      speechText: "Drink Milk" 
    },
    { 
      id: "chocolatemilk", 
      title: "Chocolate Milk", 
      icon: "ri-cup-fill", 
      bgColor: "blue-300",
      imageSrc: imagePath("chocolatemilk"),
      speechText: "Drink Chocolate Milk" 
    },
    { 
      id: "dessert", 
      title: "Dessert", 
      icon: "ri-dessert-fill", 
      bgColor: "blue-300",
      imageSrc: imagePath("dessert"),
      speechText: "Eat Dessert" 
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
      speechText: "Have Play Time" 
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
      speechText: "Go to a Birthday Party" 
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
    { 
      id: "ball", 
      title: "Ball", 
      icon: "ri-Ball-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("ball"),
      speechText: "Play with the Ball" 
    },
    { 
      id: "baseball", 
      title: "Baseball", 
      icon: "ri-Ball-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("baseball"),
      speechText: "Play Baseball" 
    },
    { 
      id: "basketball", 
      title: "Basketball", 
      icon: "ri-basketball-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("basketball"),
      speechText: "Play Basketball" 
    },
    { 
      id: "football", 
      title: "Football", 
      icon: "ri-football-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("football"),
      speechText: "Play Football" 
    },
    { 
      id: "playoutside", 
      title: "Play Outside", 
      icon: "ri-playoutside-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("playoutside"),
      speechText: "Play Outside" 
    },
    { 
      id: "Scooter", 
      title: "Scooter", 
      icon: "ri-Scooter-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("scooter"),
      speechText: "Go On Your Scooter" 
    },
    { 
      id: "Slide", 
      title: "Slide", 
      icon: "ri-Slide-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("slide"),
      speechText: "Go Down the Slide" 
    },
    { 
      id: "Soccer", 
      title: "Soccer", 
      icon: "ri-soccer-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("soccer"),
      speechText: "Play Soccer" 
    },
    { 
      id: "sports", 
      title: "Sports", 
      icon: "ri-sports-fill", 
      bgColor: "green-400",
      imageSrc: imagePath("sports"),
      speechText: "Play Sports" 
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
    { 
      id: "puzzle", 
      title: "Puzzle", 
      icon: "ri-puzzle-fill", 
      bgColor: "blue-400",
      imageSrc: imagePath("puzzle"),
      speechText: "Do a Puzzle" 
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
      id: "Break", 
      title: "Break", 
      icon: "ri-Break-fill", 
      bgColor: "blue-400",
      imageSrc: imagePath("break"),
      speechText: "Take a Break" 
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
      title: "Potty", 
      icon: "ri-door-lock-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("bathroom"),
      speechText: "Go to the Bathroom" 
    },
    { 
      id: "bath", 
      title: "Bath", 
      icon: "ri-showers-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("bath"),
      speechText: "Take a Bath" 
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
      imageSrc: imagePath("combhair"),
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
    { 
      id: "settable", 
      title: "Set the Table", 
      icon: "ri-restaurant-2-fill", 
      bgColor: "green-200", 
      imageSrc: imagePath("settable"),
      speechText: "Set the Table" 
    },
  ],
  "dressing": [
    { 
      id: "wakeup", 
      title: "Wake Up", 
      icon: "ri-sun-fill", 
      bgColor: "green-400", 
      imageSrc: "/activity-cards/wakeup.png",
      speechText: "Wake up" 
    },
    { 
      id: "shoeson", 
      title: "Shoes On", 
      icon: "ri-footprint-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("shoeson"),
      speechText: "Put on our shoes" 
    },
    { 
      id: "shoesoff", 
      title: "Shoes Off", 
      icon: "ri-footprint-fill", 
      bgColor: "green-400", 
      imageSrc: imagePath("shoesoff"),
      speechText: "Take our shoes off" 
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
    { 
      id: "sleep", 
      title: "Go to Sleep", 
      icon: "ri-moon-fill", 
      bgColor: "green-400", 
      imageSrc: "/activity-cards/sleep.png",
      speechText: "Go to sleep" 
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
    { 
      id: "haircut", 
      title: "Haircut", 
      icon: "ri-scissors-fill", 
      bgColor: "purple-300", 
      imageSrc: imagePath("haircut"),
      speechText: "Get a Haircut" 
    },
    { 
      id: "dentist", 
      title: "Dentist", 
      icon: "ri-surgical-mask-fill", 
      bgColor: "purple-300", 
      imageSrc: imagePath("dentist"),
      speechText: "Go to the Dentist" 
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
      speechText: "Go in the Car" 
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
    { 
      id: "school", 
      title: "School", 
      icon: "ri-building-line", 
      bgColor: "orange-300", 
      imageSrc: imagePath("school"),
      speechText: "Go to School" 
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
const flattenedCards = Object.values(customActivityCards).flat();

// Define the priority order for frequently used cards
const priorityOrder = [
  "wakeup",      // Wake Up
  "sleep",       // Go to Sleep
  "breakfast",   // Breakfast
  "brushteeth",  // Brush Teeth
  "lunch",       // Lunch
  "dinner",      // Dinner
  "snack",       // Snack
  "school",      // School
  "color",       // Color
  "tablet",      // Tablet
  "youtube",     // YouTube
  "tv",          // TV
  "phone",       // Phone
  "transport_bus", // Bus
  "playground",  // Playground
  "combhair",    // Brush Hair
  "pajamas",     // Pajamas On
  "cleanup",     // Clean Up
  "school",      // School (duplicate - keeping for completeness)
  "restaurant",  // Restaurant
  "friendshouse", // Friend's House
  "car",         // Car
  "grocery"      // Grocery Store
];

// Find the holiday cards to move to the end
const holidayCards = customActivityCards["holiday"] || [];
const holidayIds = holidayCards.map(card => card.id);

// Function to get priority value for sorting
const getPriorityValue = (card: ScheduleActivity): number => {
  const priorityIndex = priorityOrder.indexOf(card.id);
  if (priorityIndex !== -1) {
    return priorityIndex; // High priority (low value = first)
  }
  
  if (holidayIds.includes(card.id)) {
    return 10000; // Very low priority (high value = last)
  }
  
  return 1000; // Medium priority (middle value)
};

// Sort the cards based on priority
export let allCustomActivityCards: ScheduleActivity[] = [...flattenedCards].sort(
  (a, b) => getPriorityValue(a) - getPriorityValue(b)
);

// Export availableActivities as a copy of customActivityCards for backwards compatibility
export const availableActivities: Record<string, ScheduleActivity[]> = customActivityCards;

// Function to update the all activities array - will be called when reordering
export function updateAllActivitiesOrder(newActivities: ScheduleActivity[]) {
  allCustomActivityCards = [...newActivities];
}