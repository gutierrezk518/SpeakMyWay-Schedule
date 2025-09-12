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
import PrivacyPolicy from "@/pages/privacy-policy";
import AuthPage from "@/pages/auth-page";
import AuthTestPage from "@/pages/auth-test";
import NavigationBar from "@/components/navigation-bar";
import { useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import { Link } from "wouter";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Schedule} />
      <ProtectedRoute path="/communication" component={CommunicationBoard} />
      <ProtectedRoute path="/quick-mode" component={QuickMode} />
      <Route path="/schedule" component={Schedule} /> {/* Public route for anonymous users */}
      <ProtectedRoute path="/customize" component={Customize} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <ProtectedRoute path="/auth-test" component={AuthTestPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  // Simple version without welcome dialog
  const { 
    setUserName,
    setUserBirthday,
    setUserEmail,
    setUserConsentGiven,
    setUserConsentDate,
    setUserMarketingConsent,
    setUserDataRetentionConsent
  } = useAppContext();

  useEffect(() => {
    // Load any existing user data from localStorage if available
    const storedName = localStorage.getItem("speakMyWayUser");
    const storedBirthday = localStorage.getItem("speakMyWayBirthday");
    const storedEmail = localStorage.getItem("speakMyWayEmail");
    const storedConsentGiven = localStorage.getItem("speakMyWayConsentGiven");
    const storedConsentDate = localStorage.getItem("speakMyWayConsentDate");
    const storedMarketingConsent = localStorage.getItem("speakMyWayMarketingConsent");
    const storedDataRetentionConsent = localStorage.getItem("speakMyWayDataRetentionConsent");
    
    if (storedName) {
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
    setUserBirthday, 
    setUserEmail, 
    setUserConsentGiven, 
    setUserConsentDate, 
    setUserMarketingConsent, 
    setUserDataRetentionConsent
  ]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-100 overflow-hidden">
      <NavigationBar />
      <main className="flex-1 overflow-hidden pt-9">
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