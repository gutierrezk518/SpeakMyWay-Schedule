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
  const { 
    setUserName, 
    userName, 
    setUserBirthday, 
    setUserEmail,
    setUserConsentGiven,
    setUserConsentDate,
    setUserMarketingConsent,
    setUserDataRetentionConsent
  } = useAppContext();
  
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
    const storedConsentGiven = localStorage.getItem("speakMyWayConsentGiven");
    const storedConsentDate = localStorage.getItem("speakMyWayConsentDate");
    const storedMarketingConsent = localStorage.getItem("speakMyWayMarketingConsent");
    const storedDataRetentionConsent = localStorage.getItem("speakMyWayDataRetentionConsent");
    
    if (!storedName && !userName) {
      // Open the name input dialog
      setNameDialogOpen(true);
    } else if (storedName && !userName) {
      // Load data into context
      setUserName(storedName);
      if (storedBirthday) setUserBirthday(storedBirthday);
      if (storedEmail) setUserEmail(storedEmail);
      
      // Set consent data in context
      if (storedConsentGiven) setUserConsentGiven(storedConsentGiven === "true");
      if (storedConsentDate) setUserConsentDate(storedConsentDate);
      if (storedMarketingConsent) setUserMarketingConsent(storedMarketingConsent === "true");
      if (storedDataRetentionConsent) setUserDataRetentionConsent(storedDataRetentionConsent === "true");
    }
  }, [
    setUserName, 
    userName, 
    setUserBirthday, 
    setUserEmail, 
    setUserConsentGiven, 
    setUserConsentDate, 
    setUserMarketingConsent, 
    setUserDataRetentionConsent
  ]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleNameSubmit = async () => {
    // Basic validation
    const hasNameError = !inputName.trim();
    const hasEmailError = inputEmail.length > 0 && !validateEmail(inputEmail);
    const hasConsentError = !consentGiven;
    
    setNameError(hasNameError);
    setEmailError(hasEmailError);
    setConsentError(hasConsentError);
    
    if (!hasNameError && !hasEmailError && !hasConsentError) {
      const currentDate = new Date().toISOString();
      
      // Store in localStorage
      localStorage.setItem("speakMyWayUser", inputName);
      localStorage.setItem("speakMyWayConsentGiven", "true");
      localStorage.setItem("speakMyWayConsentDate", currentDate);
      localStorage.setItem("speakMyWayMarketingConsent", marketingConsent.toString());
      localStorage.setItem("speakMyWayDataRetentionConsent", dataRetentionConsent.toString());
      
      // Update context
      setUserName(inputName);
      setUserConsentGiven(true);
      setUserConsentDate(currentDate);
      setUserMarketingConsent(marketingConsent);
      setUserDataRetentionConsent(dataRetentionConsent);
      
      if (inputBirthday) {
        localStorage.setItem("speakMyWayBirthday", inputBirthday);
        setUserBirthday(inputBirthday);
      }
      
      if (inputEmail) {
        localStorage.setItem("speakMyWayEmail", inputEmail);
        setUserEmail(inputEmail);
      }
      
      // Generate a temporary username based on display name and timestamp
      // In a real app, you'd likely implement proper user registration
      const tmpUsername = `${inputName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
      
      try {
        // Store user data in database via API call
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: tmpUsername,
            password: 'temporary_password', // In a real app, implement proper authentication
            displayName: inputName,
            email: inputEmail || null,
            birthday: inputBirthday || null,
            language: 'en',
            consentGiven: true,
            consentDate: currentDate,
            marketingConsent: marketingConsent,
            dataRetentionConsent: dataRetentionConsent
          }),
        });
        
        if (response.ok) {
          // Successfully stored user in database
          const userData = await response.json();
          
          // Store user ID in localStorage for future API calls
          localStorage.setItem("speakMyWayUserId", userData.id.toString());
          
          console.log('User data saved to server', userData);
        } else {
          // Handle error but don't block the user experience
          console.error('Failed to save user data to server');
        }
      } catch (error) {
        // Log error but don't block user experience
        console.error('Error saving user data:', error);
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
              Parent/Guardian: Please provide information to set up the application for your child.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="name" className="mb-2 block">Child's Name or Nickname <span className="text-red-500">*</span></Label>
              <Input 
                id="name" 
                value={inputName} 
                onChange={(e) => {
                  setInputName(e.target.value);
                  if (e.target.value.trim()) {
                    setNameError(false);
                  }
                }}
                placeholder="Enter child's name or nickname"
                className={`w-full ${nameError ? 'border-red-500' : ''}`}
                autoFocus
              />
              {nameError && <p className="text-red-500 text-sm mt-1">Name is required</p>}
            </div>
            
            <div>
              <Label htmlFor="birthday" className="mb-2 block">Child's Birthday</Label>
              <Input 
                id="birthday" 
                type="date"
                value={inputBirthday} 
                onChange={(e) => setInputBirthday(e.target.value)}
                className="w-full"
                max={new Date().toISOString().split('T')[0]} // Sets max date to today
              />
              <p className="text-xs text-gray-500 mt-1">This helps us customize the experience for your child's age group</p>
            </div>
            
            <div>
              <Label htmlFor="email" className="mb-2 block">Parent/Guardian Email Address <span className="text-red-500">*</span></Label>
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
                placeholder="parent.email@example.com"
                className={`w-full ${emailError ? 'border-red-500' : ''}`}
              />
              {emailError && <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>}
              <p className="text-xs text-gray-500 mt-1">Required for parental verification and account management</p>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className={`flex items-start space-x-2 ${consentError ? 'pb-1' : ''}`}>
                <Checkbox 
                  id="consent" 
                  checked={consentGiven}
                  onCheckedChange={(checked) => {
                    setConsentGiven(checked === true);
                    if (checked) setConsentError(false);
                  }}
                  className={consentError ? 'border-red-500' : ''}
                />
                <Label 
                  htmlFor="consent" 
                  className="text-sm leading-tight cursor-pointer"
                >
                  As the parent/guardian, I consent to the collection and processing of my child's information as described in the 
                  <Link href="/privacy-policy" className="text-blue-600 hover:underline ml-1" target="_blank">
                    Privacy Policy
                  </Link>. <span className="text-red-500">*</span>
                </Label>
              </div>
              {consentError && <p className="text-red-500 text-sm">Parental consent is required to continue</p>}
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="marketing" 
                  checked={marketingConsent}
                  onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                />
                <Label 
                  htmlFor="marketing" 
                  className="text-sm leading-tight cursor-pointer"
                >
                  I agree to receive occasional emails about updates and features that may help my child (optional)
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="dataRetention" 
                  checked={dataRetentionConsent}
                  onCheckedChange={(checked) => setDataRetentionConsent(checked === true)}
                />
                <Label 
                  htmlFor="dataRetention" 
                  className="text-sm leading-tight cursor-pointer"
                >
                  I consent to anonymous usage data being collected to improve the application for my child and other children with similar needs (optional)
                </Label>
              </div>
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
            <DialogTitle className="text-xl">Hi {inputName}!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800 mb-2">For {inputName}</h3>
              <p className="text-blue-700 mb-2">I'm your friendly helper! I can help you:</p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-blue-700">
                <li>Talk with pictures</li>
                <li>Plan your day</li>
                <li>Learn new words</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="text-sm font-medium text-gray-800 mb-2">For Parents/Guardians</h3>
              <p className="text-gray-700 mb-2">You can customize the experience by visiting the customize page:</p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-gray-700">
                <li>Adjust voice settings</li>
                <li>Modify display preferences</li>
                <li>Access privacy settings and parental controls</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                // Play welcome voice message
                import('@/lib/tts').then(({ speak }) => {
                  speak(`Welcome ${inputName}! Let's get going!`);
                });
                setWelcomeDialogOpen(false);
              }}
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
