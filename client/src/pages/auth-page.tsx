import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";

// UI Components
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

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

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { user, loginMutation, registerMutation } = useAuth();
  
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
      consentGiven: false,
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
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
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
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
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
            
            {/* Registration Form */}
            <TabsContent value="register">
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Choose a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="How should we call you?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="birthday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Consent checkboxes */}
                    <div className="space-y-2 border p-3 rounded-md bg-muted/30">
                      <FormField
                        control={registerForm.control}
                        name="consentGiven"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="leading-none">
                              <FormLabel className="text-sm font-medium leading-none">
                                I agree to the Terms of Service and Privacy Policy
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
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="leading-none">
                              <FormLabel className="text-sm font-medium leading-none">
                                I agree to receive marketing communications (Optional)
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="dataRetentionConsent"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="leading-none">
                              <FormLabel className="text-sm font-medium leading-none">
                                I agree to my data being retained for 30 years (Optional)
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <CardFooter className="flex justify-center text-sm text-muted-foreground mt-2">
            {activeTab === "login" ? (
              <p>Don't have an account? <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>Register</Button></p>
            ) : (
              <p>Already have an account? <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>Login</Button></p>
            )}
          </CardFooter>
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