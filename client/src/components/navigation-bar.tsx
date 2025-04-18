import { Link, useLocation } from "wouter";
import { useAppContext } from "@/contexts/app-context";

const pageTitles: Record<string, string> = {
  "/": "SpeakMyWay",
  "/communication": "Communication Board",
  "/quick-mode": "Quick Mode",
  "/schedule": "Today's Schedule",
  "/customize": "Customize",
  "/admin": "Admin Dashboard",
};

export default function NavigationBar() {
  const [location] = useLocation();
  const { language, setLanguage, isFavoritesMode } = useAppContext();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en");
  };

  return (
    <nav className="bg-primary text-white p-4 shadow-md flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <Link href="/">
          <button className={`p-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}>
            <i className="ri-home-4-line text-2xl"></i>
          </button>
        </Link>
        <h1 className={`text-2xl font-bold ${location === '/schedule' && isFavoritesMode ? 'opacity-30' : ''}`}>{pageTitles[location] || "SpeakMyWay"}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleLanguage}
          className={`p-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}
        >
          <i className="ri-global-line text-2xl"></i>
          <span className="hidden sm:inline ml-1 text-lg">{language.toUpperCase()}</span>
        </button>
        <Link href="/admin">
          <button className={`p-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}>
            <i className="ri-database-2-line text-2xl"></i>
          </button>
        </Link>
        <Link href="/customize">
          <button className={`p-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}>
            <i className="ri-settings-3-line text-2xl"></i>
          </button>
        </Link>
      </div>
    </nav>
  );
}
