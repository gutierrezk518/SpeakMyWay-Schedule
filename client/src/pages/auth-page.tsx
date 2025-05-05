import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLocalStorage } from "../hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, User } from "lucide-react";

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
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(false);
  const [_, setLocation] = useLocation();
  const [anonymousUser, setAnonymousUser] = useLocalStorage<AnonymousUser | null>("anonymousUser", null);
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

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
  }, [activeTab, showNicknamePrompt]);

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
    setLocation("/schedule");
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
              {activeTab === "login" 
                ? "Login to SpeakMyWay" 
                : activeTab === "register" 
                  ? "Create an Account" 
                  : "Guest Access"}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? "Sign in to access your personalized communication tools" 
                : activeTab === "register"
                  ? "Join SpeakMyWay to create your personalized communication experience"
                  : "Try SpeakMyWay without creating an account"}
            </CardDescription>
          </CardHeader>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 mx-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="guest">Guest</TabsTrigger>
            </TabsList>
            
            {/* Login Form - Modified for Replit Auth */}
            <TabsContent value="login">
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4 mb-4">
                    <h3 className="font-medium mb-2">Sign in to your account</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Securely access your SpeakMyWay account.
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => loginMutation.mutate({} as any)}
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Redirecting..." : "Sign in to your account"}
                    </Button>
                  </div>
                  
                  {/* Info text explaining the benefits */}
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">
                      Our secure sign-in process protects your information with industry-standard security.
                    </p>
                    <p>
                      You'll be briefly redirected to our authentication service to verify your identity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Registration Form - Modified for Replit Auth */}
            <TabsContent value="register">
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4 mb-4">
                    <h3 className="font-medium mb-2">Create a new account</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Join SpeakMyWay to access all features and save your progress.
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => registerMutation.mutate({} as any)}
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Redirecting..." : "Create your account"}
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">
                      Your account will be securely managed with modern security standards.
                    </p>
                    <p>
                      By registering, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
            
            {/* Guest Access tab content */}
            <TabsContent value="guest">
              {showNicknamePrompt ? (
                <CardContent>
                  <Form {...nicknameForm}>
                    <form onSubmit={nicknameForm.handleSubmit(handleNicknameSubmit)} className="space-y-4">
                      <FormField
                        control={nicknameForm.control}
                        name="nickname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nickname</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" placeholder="Enter a nickname" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        Continue as Guest
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              ) : (
                <CardContent className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium">What you should know:</h3>
                    <ul className="mt-2 list-disc pl-5 text-sm">
                      <li>No account or email required</li>
                      <li>Your data will only be saved locally</li>
                      <li>Limited features are available</li>
                      <li>Data will be lost if you clear browser data</li>
                    </ul>
                  </div>
                  <Button onClick={handleAnonymousAccess} className="w-full">
                    Continue as Guest
                  </Button>
                </CardContent>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Right side - Hero section */}
      <div className="flex-1 hidden lg:flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg">
        <div className="max-w-md text-center p-8">
          <h1 className="text-3xl font-bold mb-6">SpeakMyWay</h1>
          <div className="mb-8">
            <p className="text-xl mb-4">Empowering Communication for Everyone</p>
            <p className="text-muted-foreground">
              SpeakMyWay helps children with communication challenges express themselves
              confidently through customizable visual boards, routines, and voice output.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Personalized Schedules</h3>
                <p className="text-sm text-muted-foreground">Create visual routines</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Digital Cards</h3>
                <p className="text-sm text-muted-foreground">Express needs easily</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Voice Output</h3>
                <p className="text-sm text-muted-foreground">Hear words and phrases</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Multilingual</h3>
                <p className="text-sm text-muted-foreground">English and Spanish</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}