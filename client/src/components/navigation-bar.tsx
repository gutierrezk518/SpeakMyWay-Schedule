import { Link, useLocation } from "wouter";
import { useAppContext } from "@/contexts/app-context";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const pageTitles: Record<string, string> = {
  "/": "SpeakMyWay",
  "/communication": "Communication Board",
  "/quick-mode": "Quick Mode",
  "/schedule": "Today's Schedule",
  "/customize": "Customize",
  "/admin": "Admin Dashboard",
  "/privacy-policy": "Privacy Policy",
};

export default function NavigationBar() {
  const [location] = useLocation();
  const {
    language,
    setLanguage,
    isFavoritesMode,
    userName
  } = useAppContext();
  const { logout } = useAuth();
  
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Function to handle scroll events
  useEffect(() => {
    let prevScrollPos = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // Simple logic: if scrolling down, hide; if scrolling up, show
      if (prevScrollPos < currentScrollPos && currentScrollPos > 10) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      
      prevScrollPos = currentScrollPos;
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en");
  };

  return (
    <>
      <div 
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-200 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <nav className="bg-primary text-white py-1 px-2 shadow-md flex justify-between items-center h-9">
          <div className="flex items-center space-x-1">
            <Link href="/">
              <button className={`p-1 rounded-xl hover:bg-blue-600 active:bg-blue-700 transition-colors ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}>
                <i className="ri-home-4-line text-sm"></i>
              </button>
            </Link>
            <h1 className={`text-sm font-bold ${location === '/schedule' && isFavoritesMode ? 'opacity-30' : ''}`}>{pageTitles[location] || "SpeakMyWay"}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/customize">
              <button className={`p-1 rounded-xl hover:bg-blue-600 active:bg-blue-700 transition-colors ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}>
                <i className="ri-settings-3-line text-sm"></i>
              </button>
            </Link>
            
            {/* User Profile Icon - Only show if we have a username */}
            {userName && (
              <button 
                onClick={() => setUserProfileOpen(true)}
                className={`p-1 rounded-xl hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}
              >
                <i className="ri-user-line text-sm"></i>
                <span className="hidden md:inline ml-1 text-xs font-medium">{userName.split(' ')[0]}</span>
              </button>
            )}
          </div>
        </nav>
      </div>
      
      {/* User Profile Dialog */}
      <Dialog open={userProfileOpen} onOpenChange={setUserProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">User Profile</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Name: </span>
              <span className="font-medium">{userName}</span>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setUserProfileOpen(false)}>
              Close
            </Button>
            <Button variant="destructive" onClick={() => {
              logout();
              setUserProfileOpen(false);
            }}>
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
