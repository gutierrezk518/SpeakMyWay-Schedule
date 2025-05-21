import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAppContext } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator";
import { ConsentCheckboxes } from "@/components/consent-checkboxes";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, isLoading, signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const { 
    setUserConsentGiven,
    setUserConsentDate,
    setUserMarketingConsent
  } = useAppContext();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Consent state
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  
  // Google consent dialog state
  const [showGoogleConsentDialog, setShowGoogleConsentDialog] = useState(false);
  const [googleConsentPrivacy, setGoogleConsentPrivacy] = useState(false);
  const [googleConsentMarketing, setGoogleConsentMarketing] = useState(false);
  const [pendingGoogleAuth, setPendingGoogleAuth] = useState(false);
  
  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please provide both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsAuthenticating(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (!error) {
        // Redirect handled by the useEffect above
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill all the fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }
    
    if (!privacyConsent) {
      toast({
        title: "Privacy Policy Consent Required",
        description: "You must agree to the Privacy Policy to create an account",
        variant: "destructive",
      });
      return;
    }
    
    setIsAuthenticating(true);
    
    try {
      // Save consent information
      const consentDate = new Date().toISOString();
      
      // Add user metadata including consent information
      const userData = {
        app_metadata: { role: 'user' },
        user_metadata: { 
          dateJoined: consentDate,
          privacyPolicyConsent: privacyConsent,
          privacyPolicyConsentDate: consentDate,
          marketingConsent: marketingConsent,
          marketingConsentDate: marketingConsent ? consentDate : null
        }
      };
      
      const { error } = await signUp(email, password, userData);
      
      if (!error) {
        // Update app context with consent information
        setUserConsentGiven(privacyConsent);
        setUserConsentDate(consentDate);
        setUserMarketingConsent(marketingConsent);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Google login initiation
  const handleGoogleLogin = () => {
    setShowGoogleConsentDialog(true);
    setPendingGoogleAuth(true);
  };
  
  // Handle Google login after consent
  const handleGoogleLoginAfterConsent = async () => {
    if (!googleConsentPrivacy) {
      toast({
        title: "Privacy Policy Consent Required",
        description: "You must agree to the Privacy Policy to sign in with Google",
        variant: "destructive",
      });
      return;
    }
    
    setShowGoogleConsentDialog(false);
    setIsAuthenticating(true);
    
    try {
      // Save consent information to use after successful auth
      const consentDate = new Date().toISOString();
      localStorage.setItem('pendingPrivacyConsent', 'true');
      localStorage.setItem('pendingPrivacyConsentDate', consentDate);
      localStorage.setItem('pendingMarketingConsent', googleConsentMarketing.toString());
      
      await signInWithGoogle();
      // Auth state will be managed by the callback URL
      
      // Update app context with consent information - this will happen after redirect
      setUserConsentGiven(googleConsentPrivacy);
      setUserConsentDate(consentDate);
      setUserMarketingConsent(googleConsentMarketing);
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Google login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setIsAuthenticating(false);
    } finally {
      setPendingGoogleAuth(false);
    }
  };
  
  // Cancel Google login flow
  const handleCancelGoogleLogin = () => {
    setShowGoogleConsentDialog(false);
    setPendingGoogleAuth(false);
    // Reset consent values for next attempt
    setGoogleConsentPrivacy(false);
    setGoogleConsentMarketing(false);
  };

  // If checking authentication status or authentication in progress
  if (isLoading || (user && !isAuthenticating)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password">
                        <span className="text-xs text-primary hover:underline">
                          Forgot password?
                        </span>
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  
                  <div className="relative w-full flex items-center justify-center my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <span className="relative bg-white px-2 text-xs text-gray-500">
                      Or continue with
                    </span>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleGoogleLogin}
                    disabled={isAuthenticating || pendingGoogleAuth}
                  >
                    {isAuthenticating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <FcGoogle className="h-5 w-5" />
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    
                    {/* Password strength indicator */}
                    <PasswordStrengthIndicator password={password} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Consent checkboxes */}
                  <ConsentCheckboxes
                    privacyConsent={privacyConsent}
                    setPrivacyConsent={setPrivacyConsent}
                    marketingConsent={marketingConsent}
                    setMarketingConsent={setMarketingConsent}
                  />
                </CardContent>
                
                <CardFooter className="flex flex-col gap-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  
                  <div className="relative w-full flex items-center justify-center my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <span className="relative bg-white px-2 text-xs text-gray-500">
                      Or continue with
                    </span>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleGoogleLogin}
                    disabled={isAuthenticating || pendingGoogleAuth}
                  >
                    {isAuthenticating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <FcGoogle className="h-5 w-5" />
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Google Consent Dialog */}
      <Dialog open={showGoogleConsentDialog} onOpenChange={setShowGoogleConsentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacy Consent</DialogTitle>
            <DialogDescription>
              Before signing in with Google, please review and agree to our terms.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <ConsentCheckboxes
              privacyConsent={googleConsentPrivacy}
              setPrivacyConsent={setGoogleConsentPrivacy}
              marketingConsent={googleConsentMarketing}
              setMarketingConsent={setGoogleConsentMarketing}
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelGoogleLogin}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGoogleLoginAfterConsent}
              disabled={!googleConsentPrivacy || isAuthenticating}
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue with Google"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}