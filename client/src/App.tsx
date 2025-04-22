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
import AuthPage from "@/pages/auth-page";
import NavigationBar from "@/components/navigation-bar";
import { useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Schedule} />
      <ProtectedRoute path="/communication" component={CommunicationBoard} />
      <ProtectedRoute path="/quick-mode" component={QuickMode} />
      <Route path="/schedule" component={Schedule} /> {/* Public route for anonymous users */}
      <ProtectedRoute path="/customize" component={Customize} />
      <ProtectedRoute path="/admin" component={Admin} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  // Simple version without welcome dialog
  const { setUserName } = useAppContext();

  useEffect(() => {
    // Load any existing user data from localStorage if available
    const storedName = localStorage.getItem("speakMyWayUser");
    if (storedName) {
      setUserName(storedName);
    }
  }, [setUserName]);

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
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;