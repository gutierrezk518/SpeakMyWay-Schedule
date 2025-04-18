import { Link, useLocation } from "wouter";
import { useAppContext } from "@/contexts/app-context";
import { useState } from "react";
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

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en");
  };

  return (
    <>
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
          <Link href="/customize">
            <button className={`p-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}>
              <i className="ri-settings-3-line text-2xl"></i>
            </button>
          </Link>
          
          {/* User Profile Icon - Only show if we have a username */}
          {userName && (
            <button 
              onClick={() => setUserProfileOpen(true)}
              className={`p-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center ${location === '/schedule' && isFavoritesMode ? 'opacity-30 pointer-events-none' : ''}`}
            >
              <i className="ri-user-line text-2xl"></i>
              <span className="hidden md:inline ml-1 font-medium">{userName.split(' ')[0]}</span>
            </button>
          )}
        </div>
      </nav>
      
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
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{userName}</span>
                </div>
                
                {userEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">{userEmail}</span>
                  </div>
                )}
                
                {userBirthday && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Birthday:</span>
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
                  <span className="text-gray-500">Data consent given:</span>
                  <span className="font-medium">{userConsentGiven ? 'Yes' : 'No'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Marketing emails:</span>
                  <span className="font-medium">{userMarketingConsent ? 'Subscribed' : 'Not subscribed'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Analytics consent:</span>
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
