import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLocalStorage } from "../hooks/use-local-storage";

// UI Components
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle, Lock, User, Mail, Calendar } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration form schema with GDPR/COPPA compliance
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional(),
  birthday: z.string().optional(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "You must provide consent to use this application" }),
  }),
  marketingConsent: z.boolean().optional(),
  dataRetentionConsent: z.boolean().optional(),
});

// Anonymous user nickname prompt schema
const nicknameSchema = z.object({
  nickname: z.string().min(1, "Please enter a nickname")
});

// Interface for anonymous user data
interface AnonymousUser {
  nickname: string;
  sessionStartTime: string;
  isAnonymous: true;
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(false);
  const [_, setLocation] = useLocation();
  const [anonymousUser, setAnonymousUser] = useLocalStorage<AnonymousUser | null>("anonymousUser", null);
  const { user, loginMutation, registerMutation } = useAuth();

  // Nickname form for anonymous users
  const nicknameForm = useForm<z.infer<typeof nicknameSchema>>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: {
      nickname: ""
    }
  });

  // Auto-focus first input on page load
  useEffect(() => {
    const firstInput = document.querySelector('input:not([type="hidden"])') as HTMLInputElement;
    if (firstInput) firstInput.focus();
  }, [activeTab, registrationStep, showNicknamePrompt]);

  // Function to handle anonymous access
  const handleAnonymousAccess = () => {
    setShowNicknamePrompt(true);
  };

  // Function to save anonymous user and redirect to app
  const handleNicknameSubmit = (data: z.infer<typeof nicknameSchema>) => {
    const anonymousUserData: AnonymousUser = {
      nickname: data.nickname,
      sessionStartTime: new Date().toISOString(),
      isAnonymous: true
    };
    setAnonymousUser(anonymousUserData);
    setLocation("/");
  };

  // Set up a timer to show registration prompt after one hour of anonymous use
  useEffect(() => {
    if (anonymousUser) {
      const sessionStartTime = new Date(anonymousUser.sessionStartTime).getTime();
      const oneHourInMs = 60 * 60 * 1000;
      const timeoutId = setTimeout(() => {
        // Show registration prompt after one hour
        if (document.visibilityState === 'visible') {
          const shouldPrompt = window.confirm(
            "Looks like you like this app! Consider registering to save your settings across devices. Would you like to create an account now?"
          );
          if (shouldPrompt) {
            setLocation("/auth");
            setActiveTab("register");
          }
        }
      }, oneHourInMs - (Date.now() - sessionStartTime));

      return () => clearTimeout(timeoutId);
    }
  }, [anonymousUser, setLocation]);

  // Form setup for login
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Form setup for registration
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      displayName: "",
      email: "",
      birthday: "",
      consentGiven: true,
      marketingConsent: false,
      dataRetentionConsent: false,
    },
  });

  // Submit handlers
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({
      ...data,
      consentDate: new Date().toISOString(),
    });
  };

  // If user is logged in, redirect to home page
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Form section */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {activeTab === "login" ? "Login to SpeakMyWay" : "Create an Account"}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? "Sign in to access your personalized communication tools" 
                : "Join SpeakMyWay to create your personalized communication experience"}
            </CardDescription>
          </CardHeader>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 mx-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <div className="relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                placeholder="Enter your username" 
                                className="pl-9" 
                                aria-label="Username"
                                {...field} 
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                type={showLoginPassword ? "text" : "password"} 
                                placeholder="Enter your password" 
                                className="pl-9" 
                                aria-label="Password"
                                {...field} 
                              />
                            </FormControl>
                            <button 
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-2.5 top-2.5"
                              aria-label={showLoginPassword ? "Hide password" : "Show password"}
                            >
                              {showLoginPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>

            {/* Registration Form - Progressive Disclosure */}
            <TabsContent value="register">
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    {/* Step 1: Basic account info */}
                    {registrationStep === 1 && (
                      <>
                        <div className="mb-4 text-center">
                          <h3 className="text-sm font-medium text-muted-foreground">Step 1 of 2: Create your account</h3>
                          <div className="w-full bg-muted h-2 mt-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full w-1/2 rounded-full"></div>
                          </div>
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="register-username">Username <span className="text-destructive">*</span></FormLabel>
                              <div className="relative">
                                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <FormControl>
                                  <Input 
                                    id="register-username"
                                    placeholder="Choose a username" 
                                    className="pl-9" 
                                    aria-required="true"
                                    {...field} 
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="register-password">Password <span className="text-destructive">*</span></FormLabel>
                              <div className="relative">
                                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <FormControl>
                                  <Input 
                                    id="register-password"
                                    type={showRegisterPassword ? "text" : "password"} 
                                    placeholder="Choose a password" 
                                    className="pl-9" 
                                    aria-required="true"
                                    {...field} 
                                  />
                                </FormControl>
                                <button 
                                  type="button"
                                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                  className="absolute right-2.5 top-2.5"
                                  aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                                >
                                  {showRegisterPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>
                              </div>
                              {field.value && (
                                <div className="mt-2">
                                  <div className="text-xs mb-1">Password strength:</div>
                                  <div className="flex space-x-1">
                                    <div className={`h-1 flex-1 rounded-full ${field.value.length > 0 ? 'bg-red-500' : 'bg-muted'}`}></div>
                                    <div className={`h-1 flex-1 rounded-full ${field.value.length >= 6 ? 'bg-amber-500' : 'bg-muted'}`}></div>
                                    <div className={`h-1 flex-1 rounded-full ${field.value.length >= 8 ? 'bg-green-500' : 'bg-muted'}`}></div>
                                  </div>
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="button" 
                          className="w-full" 
                          onClick={() => {
                            // Validate username and password before proceeding
                            const usernameValid = registerForm.trigger('username');
                            const passwordValid = registerForm.trigger('password');

                            // Only proceed if both fields are valid
                            Promise.all([usernameValid, passwordValid]).then(
                              ([isUsernameValid, isPasswordValid]) => {
                                if (isUsernameValid && isPasswordValid) {
                                  setRegistrationStep(2);
                                }
                              }
                            );
                          }}
                        >
                          Continue
                        </Button>
                      </>
                    )}

                    {/* Step 2: Personal info and consent */}
                    {registrationStep === 2 && (
                      <>
                        <div className="mb-4 text-center">
                          <h3 className="text-sm font-medium text-muted-foreground">Step 2 of 2: Personal information</h3>
                          <div className="w-full bg-muted h-2 mt-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full w-full rounded-full"></div>
                          </div>
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="register-displayname">Display Name <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                              <div className="relative">
                                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <FormControl>
                                  <Input 
                                    id="register-displayname"
                                    placeholder="SpeakMyWay will refer to you as..." 
                                    className="pl-9" 
                                    aria-required="false"
                                    {...field} 
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="register-email">Email <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                              <div className="relative">
                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <FormControl>
                                  <Input 
                                    id="register-email"
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="pl-9" 
                                    aria-required="false"
                                    {...field} 
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="birthday"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="register-birthday">Date of Birth <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                              <div className="relative">
                                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <FormControl>
                                  <Input 
                                    id="register-birthday"
                                    type="date" 
                                    className="pl-9"
                                    aria-required="false"
                                    {...field} 
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Consent checkboxes */}
                        <div className="space-y-3 border p-4 rounded-md bg-muted/20">
                          <h3 className="font-medium flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-primary" />
                            Consent Information
                          </h3>

                          <FormField
                            control={registerForm.control}
                            name="consentGiven"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    id="consent-required"
                                    checked={field.value} 
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="leading-tight">
                                  <FormLabel htmlFor="consent-required" className="text-sm font-medium">
                                    I am over the age of 13 years old or the parent or legal guardian giving consent on behalf of a child under 13 to the <a href="#" className="text-primary underline">Terms of Service</a> and <a href="#" className="text-primary underline">Privacy Policy</a> <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="marketingConsent"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    id="marketing-consent"
                                    checked={field.value} 
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="leading-tight">
                                  <FormLabel htmlFor="marketing-consent" className="text-sm font-medium">
                                    I agree to receive marketing communications <span className="text-muted-foreground text-xs">(Optional)</span>
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            className="w-1/3" 
                            onClick={() => setRegistrationStep(1)}
                          >
                            Back
                          </Button>

                          <Button 
                            type="submit" 
                            className="w-2/3" 
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex flex-col gap-3 mt-2">
            <div className="flex justify-center text-sm text-muted-foreground">
              {activeTab === "login" ? (
                <p>Don't have an account? <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>Register</Button></p>
              ) : (
                <p>Already have an account? <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>Login</Button></p>
              )}
            </div>

            <div className="text-center">
              <div className="relative mb-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <Button
                variant="outline"
                type="button"
                onClick={handleAnonymousAccess}
                className="w-full"
              >
                Continue without an account
              </Button>
            </div>
          </CardFooter>

          {/* Nickname prompt modal for anonymous users */}
          {showNicknamePrompt && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-[350px] max-w-[90%]">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Start</CardTitle>
                  <CardDescription>
                    Enter a Name that the Text to Voice settings in this app will refer to you as. You may click continue and you will be referred to as 'Friend'.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...nicknameForm}>
                    <form onSubmit={nicknameForm.handleSubmit(handleNicknameSubmit)} className="space-y-4">
                      <FormField
                        control={nicknameForm.control}
                        name="nickname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="nickname">Name</FormLabel>
                            <FormControl>
                              <Input 
                                id="nickname" 
                                placeholder="Enter a Name" 
                                autoFocus 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-1/2"
                          onClick={() => setShowNicknamePrompt(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="w-1/2">
                          Continue
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          )}
        </Card>
      </div>

      {/* Hero section */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-foreground flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6 text-primary">SpeakMyWay</h1>
          <p className="text-xl mb-8">An Augmentative and Alternative Communication (AAC) app designed specifically for neurodivergent children.</p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="flex items-start space-x-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><path d="M12 18a3 3 0 0 1 3 3v1"></path><path d="M9 22v-1a3 3 0 0 1 6 0v1"></path></svg>
              </div>
              <div>
                <h3 className="font-medium">Voice Support</h3>
                <p className="text-sm">Text-to-speech for all cards and schedules</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
              </div>
              <div>
                <h3 className="font-medium">Customizable</h3>
                <p className="text-sm">Tailor the experience to your needs</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 2v4"></path><path d="M7 2v4"></path><path d="M21 10V8a2 2 0 0 0-2-2H11"></path><path d="M16 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M16 14v1a2 2 0 0 0 2 2h1"></path><path d="M21 16v1a2 2 0 0 1-2 2h-1"></path><path d="M19 20v2"></path><path d="M15 20v2"></path><path d="M3 10v10a2 2 0 0 0 2 2h6"></path></svg>
              </div>
              <div>
                <h3 className="font-medium">Scheduling</h3>
                <p className="text-sm">Create and manage visual schedules</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.421 0 10-4.579 10-10c0-4.952-3.67-9.037-8.419-9.778C13.051 2.15 12.534 2 12 2C6.579 2 2 6.579 2 12s4.579 10 10 10Z"></path><path d="M7 10.25c1.601 0 2.1 1.025 2.1 2s-.499 2-2.1 2c-1.6 0-2.1-1.025-2.1-2s.5-2 2.1-2Z"></path><path d="M16.5 10c-.828 0-1.5.672-1.5 1.5V12"></path><path d="M17 10.5a1.5 1.5 0 0 1 0 3h-.5"></path></svg>
              </div>
              <div>
                <h3 className="font-medium">Child-Friendly</h3>
                <p className="text-sm">Designed for neurodivergent children</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}