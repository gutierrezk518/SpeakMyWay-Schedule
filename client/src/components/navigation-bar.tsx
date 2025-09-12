import { Link, useLocation } from "wouter";
import { useAppContext } from "@/contexts/app-context";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
    userName,
    userEmail,
    userBirthday,
    userConsentGiven,
    userMarketingConsent,
    userDataRetentionConsent
  } = useAppContext();
  
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
              <button className={`p-1 rounded-2xl hover:bg-blue-600 active:bg-blue-700 transition-colors ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}>
                <i className="ri-home-4-line text-sm"></i>
              </button>
            </Link>
            <h1 className={`text-sm font-bold ${location === '/schedule' && isFavoritesMode ? 'opacity-30' : ''}`}>{pageTitles[location] || "SpeakMyWay"}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/customize">
              <button className={`p-1 rounded-2xl hover:bg-blue-600 active:bg-blue-700 transition-colors ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}>
                <i className="ri-settings-3-line text-sm"></i>
              </button>
            </Link>
            
            {/* User Profile Icon - Only show if we have a username */}
            {userName && (
              <button 
                onClick={() => setUserProfileOpen(true)}
                className={`p-1 rounded-2xl hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}
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
          
          <div className="py-4 space-y-4">
            <div>
              <h3 className="font-medium text-lg">Your Information</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Name:</span>
                  <span className="font-medium">{userName}</span>
                </div>
                
                {userEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="font-medium">{userEmail}</span>
                  </div>
                )}
                
                {userBirthday && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Birthday:</span>
                    <span className="font-medium">{new Date(userBirthday).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-lg">Privacy Settings</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Data consent given:</span>
                  <span className="font-medium">{userConsentGiven ? 'Yes' : 'No'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Marketing emails:</span>
                  <span className="font-medium">{userMarketingConsent ? 'Subscribed' : 'Not subscribed'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Analytics consent:</span>
                  <span className="font-medium">{userDataRetentionConsent ? 'Granted' : 'Not granted'}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <Link href="/privacy-policy" onClick={() => setUserProfileOpen(false)}>
                <Button variant="outline" className="w-full">
                  View Privacy Policy
                </Button>
              </Link>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setUserProfileOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
