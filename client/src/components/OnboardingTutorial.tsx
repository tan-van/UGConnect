import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Users, Building2, Search, MessageSquare } from "lucide-react";

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'creator' | 'client';
}

interface Step {
  title: string;
  description: string;
  Icon: typeof CheckCircle2;
}

const creatorSteps: Step[] = [
  {
    title: "Complete Your Profile",
    description: "Add your social media handles, content categories, and showcase your best work to attract potential clients.",
    Icon: CheckCircle2,
  },
  {
    title: "Set Your Rates",
    description: "Define your pricing for different types of content creation services.",
    Icon: Building2,
  },
  {
    title: "Manage Opportunities",
    description: "Review and respond to collaboration requests from clients through your dashboard.",
    Icon: MessageSquare,
  },
];

const clientSteps: Step[] = [
  {
    title: "Browse Creators",
    description: "Explore our diverse network of content creators filtered by category, followers, and engagement rates.",
    Icon: Search,
  },
  {
    title: "Review Portfolios",
    description: "Check creators' previous work and performance metrics to find the perfect match for your campaign.",
    Icon: Users,
  },
  {
    title: "Start Collaborating",
    description: "Reach out to creators and manage your campaigns through the platform.",
    Icon: MessageSquare,
  },
];

export default function OnboardingTutorial({ isOpen, onClose, userRole }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const steps = userRole === 'creator' ? creatorSteps : clientSteps;

  const completeTutorialMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome aboard! 🎉",
        description: "You're all set to start using UGConnect.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorialMutation.mutate();
    }
  };

  const CurrentIcon = steps[currentStep].Icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to UGConnect!</DialogTitle>
          <DialogDescription>
            Let's get you started with a quick tour of the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="py-8">
          <div className="flex items-start gap-4">
            <CurrentIcon className="h-8 w-8 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">{steps[currentStep].title}</h3>
              <p className="text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Skip Tutorial
            </Button>
            <Button 
              onClick={handleNext}
              disabled={completeTutorialMutation.isPending}
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}