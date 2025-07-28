import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/app-context';
import { useAuth } from '@/hooks/use-auth';

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { updateUserMetadata } = useAuth();
  const { 
    setUserName,
    setUserConsentGiven,
    setUserConsentDate,
    setUserMarketingConsent
  } = useAppContext();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Check if we have auth data in the URL
        const hash = window.location.hash;
        const query = window.location.search;
        
        console.log("Auth callback - URL hash:", hash);
        console.log("Auth callback - URL search:", query);
        
        // Process any pending consent data from Google sign-in
        const pendingPrivacyConsent = localStorage.getItem('pendingPrivacyConsent');
        const pendingPrivacyConsentDate = localStorage.getItem('pendingPrivacyConsentDate');
        const pendingMarketingConsent = localStorage.getItem('pendingMarketingConsent');
        
        // Supabase client should automatically detect the auth response
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth session error:", error);
          throw error;
        }
        
        if (data?.session) {
          console.log("Session retrieved successfully");
          
          // If we have pending consent data, save it to user metadata
          if (pendingPrivacyConsent && pendingPrivacyConsentDate) {
            try {
              // Save consent information to user metadata
              await updateUserMetadata({
                privacyPolicyConsent: pendingPrivacyConsent === 'true',
                privacyPolicyConsentDate: pendingPrivacyConsentDate,
                marketingConsent: pendingMarketingConsent === 'true',
                marketingConsentDate: pendingMarketingConsent === 'true' ? pendingPrivacyConsentDate : null
              });
              
              // Update app context with consent information
              setUserConsentGiven(pendingPrivacyConsent === 'true');
              setUserConsentDate(pendingPrivacyConsentDate);
              setUserMarketingConsent(pendingMarketingConsent === 'true');
              
              // Clean up localStorage
              localStorage.removeItem('pendingPrivacyConsent');
              localStorage.removeItem('pendingPrivacyConsentDate');
              localStorage.removeItem('pendingMarketingConsent');
            } catch (metadataError) {
              console.error("Error saving consent metadata:", metadataError);
            }
          }
          
          // Get user profile from session
          const user = data.session.user;
          
          // If user has a name in their metadata, save it to app context
          if (user?.user_metadata?.name) {
            setUserName(user.user_metadata.name);
            localStorage.setItem("speakMyWayUser", user.user_metadata.name);
          }
          
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
              // Get user profile from session
              const user = retryData.session.user;
              
              // If user has a name in their metadata, save it to app context
              if (user?.user_metadata?.name) {
                setUserName(user.user_metadata.name);
                localStorage.setItem("speakMyWayUser", user.user_metadata.name);
              }
              
              toast({
                title: "Login successful",
                description: "You have been logged in",
                duration: 3000,
              });
              navigate('/');
            } else {
              // Still no session, redirect to auth page
              toast({
                title: "Login failed",
                description: "Unable to complete authentication",
                variant: "destructive",
              });
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
  }, [navigate, toast, updateUserMetadata, setUserName, setUserConsentGiven, setUserConsentDate, setUserMarketingConsent]);

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