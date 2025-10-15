import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAppContext } from "@/contexts/app-context";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, UserCircle } from "lucide-react";

const nameSchema = z.object({
  name: z.string().min(1, "Please enter your name").max(50, "Name is too long"),
});

export function OnboardingDialog() {
  const { user, updateUserMetadata } = useAuth();
  const { setUserName } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    // Check if user is logged in and doesn't have a name set
    if (user) {
      const hasMetadataName = user.user_metadata?.display_name;
      const hasLocalStorageName = localStorage.getItem('userName');

      // Show dialog if user has no name in either location
      if (!hasMetadataName && !hasLocalStorageName) {
        setIsOpen(true);
      } else if (hasMetadataName && !hasLocalStorageName) {
        // Sync metadata name to localStorage if it exists
        setUserName(hasMetadataName);
      }
    }
  }, [user, setUserName]);

  const onSubmit = async (values: z.infer<typeof nameSchema>) => {
    setIsSubmitting(true);

    try {
      // Update Supabase user metadata
      const { error } = await updateUserMetadata({
        display_name: values.name,
      });

      if (error) throw error;

      // Update app context and localStorage
      setUserName(values.name);

      // Close dialog
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating user name:", error);
      form.setError("name", {
        message: "Failed to save name. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <UserCircle className="h-16 w-16 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center">Welcome to SpeakMyWay!</DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p className="text-base pt-2">
              Let's personalize your experience
            </p>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter Your Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sarah, John, Alex"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    SpeakMyWay will use this name when reading your schedules and activities
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
