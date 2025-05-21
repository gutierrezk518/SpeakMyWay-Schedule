import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Check if we have auth data in the URL
        const hash = window.location.hash;
        const query = window.location.search;
        
        console.log("Auth callback - URL hash:", hash);
        console.log("Auth callback - URL search:", query);
        
        // Supabase client should automatically detect the auth response
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth session error:", error);
          throw error;
        }
        
        if (data?.session) {
          console.log("Session retrieved successfully");
          // Successfully logged in with OAuth
          toast({
            title: "Login successful",
            description: "You have been logged in",
            duration: 3000,
          });
          navigate('/');
        } else {
          console.log("No session data found");
          // We have auth parameters but no session - might be an error or processing delay
          toast({
            title: "Authentication in progress",
            description: "Finalizing your login...",
            duration: 3000,
          });
          
          // Try once more after a short delay
          setTimeout(async () => {
            const { data: retryData, error: retryError } = await supabase.auth.getSession();
            if (retryError) {
              throw retryError;
            }
            
            if (retryData?.session) {
              toast({
                title: "Login successful",
                description: "You have been logged in",
                duration: 3000,
              });
              navigate('/');
            } else {
              // Still no session, redirect to auth page
              navigate('/auth');
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        toast({
          title: "Login failed",
          description: "There was a problem with the authentication",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    handleRedirect();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <h2 className="mt-4 text-lg font-medium">Completing authentication...</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we verify your credentials
        </p>
      </div>
    </div>
  );
}