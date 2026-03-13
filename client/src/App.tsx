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
import AuthCallbackPage from "@/pages/auth-callback";
import AuthTestPage from "@/pages/auth-test";
import ResetPasswordPage from "@/pages/reset-password";
import NavigationBar from "@/components/navigation-bar";
import { OnboardingDialog } from "@/components/onboarding-dialog";
import { useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import { ErrorBoundary } from "@/components/error-boundary";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Schedule} />
      <ProtectedRoute path="/communication" component={CommunicationBoard} />
      <ProtectedRoute path="/quick-mode" component={QuickMode} />
      <Route path="/schedule" component={Schedule} /> {/* Public route for anonymous users */}
      <ProtectedRoute path="/customize" component={Customize} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/callback" component={AuthCallbackPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
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

  // One-time migration: copy legacy "speakMyWay*" keys into the canonical keys
  // used by app-context, then remove the legacy keys so this never re-runs.
  useEffect(() => {
    const sanitize = (val: string | null, maxLen = 256): string | null => {
      if (!val) return null;
      return val.trim().slice(0, maxLen);
    };

    const legacyName = sanitize(localStorage.getItem("speakMyWayUser"), 100);
    if (legacyName) {
      // Only migrate if the canonical key is empty (don't overwrite newer data)
      if (!localStorage.getItem("userName")) {
        setUserName(legacyName);
      }

      const storedBirthday = sanitize(localStorage.getItem("speakMyWayBirthday"), 20);
      const storedEmail = sanitize(localStorage.getItem("speakMyWayEmail"), 320);
      const storedConsentGiven = sanitize(localStorage.getItem("speakMyWayConsentGiven"), 10);
      const storedConsentDate = sanitize(localStorage.getItem("speakMyWayConsentDate"), 30);
      const storedMarketingConsent = sanitize(localStorage.getItem("speakMyWayMarketingConsent"), 10);
      const storedDataRetentionConsent = sanitize(localStorage.getItem("speakMyWayDataRetentionConsent"), 10);

      if (storedBirthday && !localStorage.getItem("userBirthday")) setUserBirthday(storedBirthday);
      if (storedEmail && !localStorage.getItem("userEmail")) setUserEmail(storedEmail);
      if (storedConsentGiven) setUserConsentGiven(storedConsentGiven === "true");
      if (storedConsentDate) setUserConsentDate(storedConsentDate);
      if (storedMarketingConsent) setUserMarketingConsent(storedMarketingConsent === "true");
      if (storedDataRetentionConsent) setUserDataRetentionConsent(storedDataRetentionConsent === "true");

      // Remove legacy keys so migration doesn't repeat
      localStorage.removeItem("speakMyWayUser");
      localStorage.removeItem("speakMyWayBirthday");
      localStorage.removeItem("speakMyWayEmail");
      localStorage.removeItem("speakMyWayConsentGiven");
      localStorage.removeItem("speakMyWayConsentDate");
      localStorage.removeItem("speakMyWayMarketingConsent");
      localStorage.removeItem("speakMyWayDataRetentionConsent");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-100 overflow-hidden">
      <NavigationBar />
      <main className="flex-1 overflow-hidden pt-9" aria-label="Main content">
        <Router />
      </main>
      <OnboardingDialog />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;