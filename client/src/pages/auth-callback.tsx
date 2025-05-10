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
      // Get the hash fragment from the URL
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        try {
          // Supabase client will handle parsing the hash and storing the session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (data?.session) {
            // Successfully logged in with OAuth
            toast({
              title: "Login successful",
              description: "You have been logged in",
              duration: 3000,
            });
            navigate('/');
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
      } else {
        // No authentication data found, redirect to auth page
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