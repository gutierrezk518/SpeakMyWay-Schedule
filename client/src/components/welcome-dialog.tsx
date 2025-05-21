import { useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeDialog({ isOpen, onClose }: WelcomeDialogProps) {
  const { user, updateUserMetadata } = useAuth();
  const { setUserName } = useAppContext();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter your name to continue",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update user metadata with name
      await updateUserMetadata({ name });
      
      // Update local app context
      setUserName(name);
      
      toast({
        title: "Welcome to Speak My Way!",
        description: `Hi ${name}, your profile has been set up successfully.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating user name:", error);
      toast({
        title: "An error occurred",
        description: "We couldn't save your name. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Speak My Way!</DialogTitle>
          <DialogDescription className="text-base">
            Let's personalize your experience. What should we call you?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">My Name</Label>
            <Input
              id="user-name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              This name will be used throughout the app, including in voice interactions.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}