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
import NavigationBar from "@/components/navigation-bar";
import { useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/communication" component={CommunicationBoard} />
      <Route path="/quick-mode" component={QuickMode} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/customize" component={Customize} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { setUserName, userName } = useAppContext();

  useEffect(() => {
    // Check if it's the first time the user is using the app
    const storedName = localStorage.getItem("speakMyWayUser");
    if (!storedName && !userName) {
      const name = prompt("Please enter your name. We will refer to you for the schedule and for prompts when using the application.");
      if (name) {
        localStorage.setItem("speakMyWayUser", name);
        setUserName(name);
        alert(`Thanks ${name}! I'm your personal assistant. Use me to communicate. Check out our customize page to change my voice, upload your own cards, and update your profile and settings. We have help videos there as well for getting started.`);
      }
    } else if (storedName && !userName) {
      setUserName(storedName);
    }
  }, [setUserName, userName]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <NavigationBar />
      <main className="flex-grow overflow-y-auto">
        <Router />
      </main>
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
