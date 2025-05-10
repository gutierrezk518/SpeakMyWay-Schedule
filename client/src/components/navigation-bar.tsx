import { Link, useLocation } from "wouter";
import { useAppContext } from "@/contexts/app-context";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { LogIn, LogOut, User, Settings } from "lucide-react";

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
  
  // Get authentication state
  const { user, isLoading, logout } = useAuth();
  
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Handle logout action
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
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
              <button className={`p-1 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}>
                <i className="ri-home-4-line text-sm"></i>
              </button>
            </Link>
            <h1 className={`text-sm font-bold ${location === '/schedule' && isFavoritesMode ? 'opacity-30' : ''}`}>{pageTitles[location] || "SpeakMyWay"}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/customize">
              <button className={`p-1 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}>
                <i className="ri-settings-3-line text-sm"></i>
              </button>
            </Link>
            
            {/* Authentication Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`p-1 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}>
                  {isLoading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  ) : user ? (
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={user.profileImageUrl || ""} alt={user.email || ""} />
                      <AvatarFallback className="text-[10px] bg-blue-600">
                        {user.email?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <DropdownMenuLabel>
                      {user.email || "Authenticated User"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setUserProfileOpen(true)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/customize">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Authentication</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/auth">
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Sign in</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Legacy User Profile Icon - Only show if we have a username */}
            {userName && !user && (
              <button 
                onClick={() => setUserProfileOpen(true)}
                className={`p-1 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}
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
