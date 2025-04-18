import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CommunicationBoard from "@/pages/communication-board";
import QuickMode from "@/pages/quick-mode";
import Schedule from "@/pages/schedule";
import Customize from "@/pages/customize";
import Admin from "@/pages/admin";
import PrivacyPolicy from "@/pages/privacy-policy";
import NavigationBar from "@/components/navigation-bar";
import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/communication" component={CommunicationBoard} />
      <Route path="/quick-mode" component={QuickMode} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/customize" component={Customize} />
      <Route path="/admin" component={Admin} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { setUserName, userName, setUserBirthday, setUserEmail } = useAppContext();
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputBirthday, setInputBirthday] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [dataRetentionConsent, setDataRetentionConsent] = useState(false);

  useEffect(() => {
    // Check if it's the first time the user is using the app
    const storedName = localStorage.getItem("speakMyWayUser");
    const storedBirthday = localStorage.getItem("speakMyWayBirthday");
    const storedEmail = localStorage.getItem("speakMyWayEmail");
    
    if (!storedName && !userName) {
      // Open the name input dialog
      setNameDialogOpen(true);
    } else if (storedName && !userName) {
      setUserName(storedName);
      if (storedBirthday) setUserBirthday(storedBirthday);
      if (storedEmail) setUserEmail(storedEmail);
    }
  }, [setUserName, userName, setUserBirthday, setUserEmail]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleNameSubmit = () => {
    // Basic validation
    const hasNameError = !inputName.trim();
    const hasEmailError = inputEmail.length > 0 && !validateEmail(inputEmail);
    
    setNameError(hasNameError);
    setEmailError(hasEmailError);
    
    if (!hasNameError && !hasEmailError) {
      localStorage.setItem("speakMyWayUser", inputName);
      setUserName(inputName);
      
      if (inputBirthday) {
        localStorage.setItem("speakMyWayBirthday", inputBirthday);
        setUserBirthday(inputBirthday);
      }
      
      if (inputEmail) {
        localStorage.setItem("speakMyWayEmail", inputEmail);
        setUserEmail(inputEmail);
      }
      
      setNameDialogOpen(false);
      setWelcomeDialogOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <NavigationBar />
      <main className="flex-grow overflow-y-auto">
        <Router />
      </main>

      {/* Name Input Dialog */}
      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Welcome to SpeakMyWay</DialogTitle>
            <DialogDescription>
              Please enter your information to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="name" className="mb-2 block">Your Name <span className="text-red-500">*</span></Label>
              <Input 
                id="name" 
                value={inputName} 
                onChange={(e) => {
                  setInputName(e.target.value);
                  if (e.target.value.trim()) {
                    setNameError(false);
                  }
                }}
                placeholder="Enter your name"
                className={`w-full ${nameError ? 'border-red-500' : ''}`}
                autoFocus
              />
              {nameError && <p className="text-red-500 text-sm mt-1">Name is required</p>}
            </div>
            
            <div>
              <Label htmlFor="birthday" className="mb-2 block">Birthday</Label>
              <Input 
                id="birthday" 
                type="date"
                value={inputBirthday} 
                onChange={(e) => setInputBirthday(e.target.value)}
                className="w-full"
                max={new Date().toISOString().split('T')[0]} // Sets max date to today
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="mb-2 block">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                value={inputEmail} 
                onChange={(e) => {
                  setInputEmail(e.target.value);
                  if (!e.target.value || validateEmail(e.target.value)) {
                    setEmailError(false);
                  }
                }}
                placeholder="your.email@example.com"
                className={`w-full ${emailError ? 'border-red-500' : ''}`}
              />
              {emailError && <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>}
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleNameSubmit}
              disabled={!inputName.trim()}
              className="w-full sm:w-auto"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Welcome Dialog */}
      <Dialog open={welcomeDialogOpen} onOpenChange={setWelcomeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Thanks {inputName}!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">I'm your personal assistant. Use me to communicate and organize your schedule.</p>
            <p>Check out our customize page to:</p>
            <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
              <li>Change my voice</li>
              <li>Upload your own cards</li>
              <li>Update your profile and settings</li>
              <li>Watch help videos for getting started</li>
            </ul>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setWelcomeDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Let's Get Started
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
