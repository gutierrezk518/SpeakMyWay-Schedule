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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/communication" component={CommunicationBoard} />
      <Route path="/quick-mode" component={QuickMode} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/customize" component={Customize} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { setUserName, userName } = useAppContext();
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false);
  const [inputName, setInputName] = useState("");

  useEffect(() => {
    // Check if it's the first time the user is using the app
    const storedName = localStorage.getItem("speakMyWayUser");
    if (!storedName && !userName) {
      // Open the name input dialog
      setNameDialogOpen(true);
    } else if (storedName && !userName) {
      setUserName(storedName);
    }
  }, [setUserName, userName]);

  const handleNameSubmit = () => {
    if (inputName.trim()) {
      localStorage.setItem("speakMyWayUser", inputName);
      setUserName(inputName);
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
              Please enter your name. We'll refer to you for the schedule and prompts when using the application.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name" className="mb-2 block">Your Name</Label>
            <Input 
              id="name" 
              value={inputName} 
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Enter your name"
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNameSubmit();
                }
              }}
              autoFocus
            />
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
