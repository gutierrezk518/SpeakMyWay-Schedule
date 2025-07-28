import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface GoogleLoginButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function GoogleLoginButton({ onClick, isLoading }: GoogleLoginButtonProps) {
  return (
    <Button 
      type="button" 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <FcGoogle className="h-5 w-5" />
          <span>Sign in with Google</span>
        </>
      )}
    </Button>
  );
}