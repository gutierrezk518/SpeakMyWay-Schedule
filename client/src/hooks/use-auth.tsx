import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Session,
  AuthError,
  AuthResponse,
  OAuthResponse
} from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, userData?: object) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<OAuthResponse>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateUserMetadata: (metadata: object) => Promise<{ error: AuthError | null }>;
  needsWelcomeScreen: boolean;
  completeWelcomeScreen: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsWelcomeScreen, setNeedsWelcomeScreen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if user needs welcome screen
  useEffect(() => {
    if (user && !isLoading) {
      // Check if the user has already seen the welcome screen
      const hasSeenWelcomeScreen = localStorage.getItem(`hasSeenWelcomeScreen-${user.id}`);

      // Show welcome screen for all new users regardless of whether they have a name
      if (!hasSeenWelcomeScreen) {
        setNeedsWelcomeScreen(true);
      } else {
        setNeedsWelcomeScreen(false);
      }
    }
  }, [user, isLoading]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    console.log("Attempting to sign in with email:", email);

    const response = await supabase.auth.signInWithPassword({ email, password });

    if (response.error) {
      console.error("Sign in error:", response.error);
      toast({
        title: "Login failed",
        description: response.error.message,
        variant: "destructive",
      });
    } else {
      console.log("Sign in successful, session:", response.data.session);
      console.log("User data:", response.data.user);

      // Set user and session immediately
      setUser(response.data.user);
      setSession(response.data.session);

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    }

    setIsLoading(false);
    return response;
  };

  const signUp = async (email: string, password: string, userData?: object) => {
    setIsLoading(true);
    const response = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: userData
      }
    });

    if (response.error) {
      toast({
        title: "Registration failed",
        description: response.error.message,
        variant: "destructive",
      });
    } else if (response.data?.user) {
      toast({
        title: "Registration successful",
        description: "Please check your email for verification instructions.",
      });
    }

    setIsLoading(false);
    return response;
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    // Use current origin for redirects to make it work in any environment
    const redirectUrl = `${window.location.origin}/auth-callback`;
    console.log("Using redirect URL for Google auth:", redirectUrl);

    const response = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    if (response.error) {
      console.error("Google login error:", response.error);
      toast({
        title: "Google login failed",
        description: response.error.message,
        variant: "destructive",
      });
    } else {
      console.log("Google login initiated successfully");
    }

    setIsLoading(false);
    return response;
  };

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (!error) {
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link",
      });
    } else {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const updateUserMetadata = async (metadata: object) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });

      if (error) throw error;

      // Update local user state
      if (data?.user) {
        setUser(data.user);
      }

      return { error: null };
    } catch (error) {
      console.error("Error updating user metadata:", error);
      return { error: error as AuthError };
    }
  };

  const completeWelcomeScreen = () => {
    if (user) {
      localStorage.setItem(`hasSeenWelcomeScreen-${user.id}`, 'true');
      setNeedsWelcomeScreen(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    setUser,
    resetPassword,
    updateUserMetadata,
    needsWelcomeScreen,
    completeWelcomeScreen
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}