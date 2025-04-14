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
  const { language, setLanguage } = useAppContext();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en");
  };

  return (
    <nav className="bg-primary text-white p-3 shadow-md flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Link href="/">
          <button className="p-2 rounded hover:bg-blue-600 active:bg-blue-700 transition-colors">
            <i className="ri-home-4-line text-xl"></i>
          </button>
        </Link>
        <h1 className="text-xl font-bold">{pageTitles[location] || "SpeakMyWay"}</h1>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleLanguage}
          className="p-2 rounded hover:bg-blue-600 active:bg-blue-700 transition-colors"
        >
          <i className="ri-global-line text-xl"></i>
          <span className="hidden sm:inline ml-1">{language.toUpperCase()}</span>
        </button>
        <Link href="/admin">
          <button className="p-2 rounded hover:bg-blue-600 active:bg-blue-700 transition-colors">
            <i className="ri-database-2-line text-xl"></i>
          </button>
        </Link>
        <Link href="/customize">
          <button className="p-2 rounded hover:bg-blue-600 active:bg-blue-700 transition-colors">
            <i className="ri-settings-3-line text-xl"></i>
          </button>
        </Link>
      </div>
    </nav>
  );
}
