import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Music, 
  Bell,
  Skull,
  Guitar
} from "lucide-react";

const onboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  stagename: z.string().min(2, "Stagename must be at least 2 characters").max(50, "Stagename too long"),
  favoriteGenres: z.array(z.string()).min(1, "Please select at least one genre"),
  notifications: z.object({
    tourAlerts: z.boolean().default(true),
    bandUpdates: z.boolean().default(true),
    reviewNotifications: z.boolean().default(true),
  }),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface UserOnboardingProps {
  onComplete: () => void;
}

const metalGenres = [
  "Black Metal", "Death Metal", "Doom Metal", "Folk Metal", "Gothic Metal", 
  "Groove Metal", "Heavy Metal", "Industrial Metal", "Melodic Death Metal",
  "Metalcore", "Nu Metal", "Power Metal", "Progressive Metal", "Sludge Metal",
  "Speed Metal", "Symphonic Metal", "Thrash Metal", "Viking Metal"
];

export default function UserOnboarding({ onComplete }: UserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  // const { toast } = useToast();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      stagename: "",
      favoriteGenres: [],
      notifications: {
        tourAlerts: true,
        bandUpdates: true,
        reviewNotifications: true,
      },
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const response = await apiRequest("POST", "/api/user/onboarding", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to complete onboarding");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      console.log("Onboarding completed successfully");
      onComplete();
    },
    onError: (error: Error) => {
      console.error("Onboarding failed:", error.message);
    },
  });

  const checkStagename = async (stagename: string): Promise<boolean> => {
    if (!stagename || stagename.length < 2) return false;
    
    try {
      const response = await fetch(`/api/stagename/check/${encodeURIComponent(stagename)}`);
      const data = await response.json();
      return data.available;
    } catch {
      return false;
    }
  };

  const nextStep = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = await form.trigger(['firstName', 'lastName']);
        break;
      case 2:
        isValid = await form.trigger(['stagename']);
        if (isValid) {
          const stagename = form.getValues('stagename');
          const available = await checkStagename(stagename);
          if (!available) {
            form.setError('stagename', { message: 'Stagename already taken' });
            isValid = false;
          }
        }
        break;
      case 3:
        isValid = await form.trigger(['favoriteGenres']);
        break;
    }
    
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const onSubmit = (data: OnboardingFormData) => {
    completeOnboardingMutation.mutate(data);
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 safe-top safe-bottom">
      <Card className="w-full max-w-2xl bg-card-dark border-metal-gray mobile-modal mobile-card overflow-y-auto max-h-[95vh] sm:max-h-none">
        <CardHeader>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Skull className="w-12 h-12 text-metal-red animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white mb-2">
                Welcome to MetalHub
              </h1>
              <p className="text-gray-400">
                Let's set up your profile and get you ready to rock!
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Step {currentStep} of 4</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6" data-testid="onboarding-step-1">
                  <div className="text-center">
                    <User className="w-16 h-16 mx-auto text-metal-red mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Tell us about yourself</h2>
                    <p className="text-gray-400">We'll use this to personalize your experience</p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-bold">First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your first name"
                            className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12 sm:h-14 text-base touch-target"
                            data-testid="input-onboarding-first-name"
                            autoComplete="given-name"
                            inputMode="text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-bold">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your last name"
                            className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12 sm:h-14 text-base touch-target"
                            data-testid="input-onboarding-last-name"
                            autoComplete="family-name"
                            inputMode="text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Stagename */}
              {currentStep === 2 && (
                <div className="space-y-6" data-testid="onboarding-step-2">
                  <div className="text-center">
                    <Crown className="w-16 h-16 mx-auto text-metal-red mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Choose your stagename</h2>
                    <p className="text-gray-400">This is how other metalheads will know you</p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="stagename"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-bold flex items-center">
                          <Crown className="w-4 h-4 mr-2 text-metal-red" />
                          Your Metal Identity
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="DeathMetalWarrior, IronBeast, etc."
                            className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12 sm:h-14 text-center text-lg font-bold touch-target"
                            data-testid="input-onboarding-stagename"
                            autoComplete="username"
                            inputMode="text"
                            maxLength={50}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-400 text-center">
                          Make it unique and memorable! This cannot be changed easily later.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Music Preferences */}
              {currentStep === 3 && (
                <div className="space-y-6" data-testid="onboarding-step-3">
                  <div className="text-center">
                    <Music className="w-16 h-16 mx-auto text-metal-red mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">What metal moves you?</h2>
                    <p className="text-gray-400">Select your favorite genres to get personalized recommendations</p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="favoriteGenres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-bold">Favorite Metal Genres (Select at least 1)</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                          {metalGenres.map((genre) => {
                            const isSelected = field.value.includes(genre);
                            return (
                              <button
                                key={genre}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    field.onChange(field.value.filter(g => g !== genre));
                                  } else {
                                    field.onChange([...field.value, genre]);
                                  }
                                }}
                                className={`p-3 sm:p-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 touch-target active-scale ${
                                  isSelected
                                    ? 'bg-metal-red text-white border-2 border-metal-red'
                                    : 'bg-card-dark border-2 border-metal-gray text-gray-300 hover:border-metal-red hover:text-white'
                                }`}
                                data-testid={`button-genre-${genre.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                {isSelected && <Check className="w-4 h-4 inline mr-1" />}
                                {genre}
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 4: Notifications */}
              {currentStep === 4 && (
                <div className="space-y-6" data-testid="onboarding-step-4">
                  <div className="text-center">
                    <Bell className="w-16 h-16 mx-auto text-metal-red mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Stay in the loop</h2>
                    <p className="text-gray-400">Choose what notifications you'd like to receive</p>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notifications.tourAlerts"
                      render={({ field }) => (
                        <div className="flex items-center justify-between p-4 sm:p-5 rounded-lg border border-metal-gray touch-target">
                          <div>
                            <label className="text-white font-bold flex items-center text-sm sm:text-base">
                              <Guitar className="w-4 h-4 mr-2 text-metal-red" />
                              Tour Alerts
                            </label>
                            <p className="text-xs sm:text-sm text-gray-400">Get notified about new tour dates</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-6 h-6 sm:w-5 sm:h-5 rounded border-metal-gray bg-card-dark text-metal-red focus:ring-metal-red touch-target"
                            data-testid="checkbox-tour-alerts"
                          />
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifications.bandUpdates"
                      render={({ field }) => (
                        <div className="flex items-center justify-between p-4 sm:p-5 rounded-lg border border-metal-gray touch-target">
                          <div>
                            <label className="text-white font-bold text-sm sm:text-base">Band Updates</label>
                            <p className="text-xs sm:text-sm text-gray-400">Updates about your submitted bands</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-6 h-6 sm:w-5 sm:h-5 rounded border-metal-gray bg-card-dark text-metal-red focus:ring-metal-red touch-target"
                            data-testid="checkbox-band-updates"
                          />
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifications.reviewNotifications"
                      render={({ field }) => (
                        <div className="flex items-center justify-between p-4 sm:p-5 rounded-lg border border-metal-gray touch-target">
                          <div>
                            <label className="text-white font-bold text-sm sm:text-base">Review Notifications</label>
                            <p className="text-xs sm:text-sm text-gray-400">When others interact with your reviews</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-6 h-6 sm:w-5 sm:h-5 rounded border-metal-gray bg-card-dark text-metal-red focus:ring-metal-red touch-target"
                            data-testid="checkbox-review-notifications"
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row justify-between pt-6 gap-3 sm:gap-0">
                <Button
                  type="button"
                  onClick={previousStep}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="border-metal-gray text-gray-300 hover:bg-metal-gray/20 touch-target-large active-scale order-2 sm:order-1"
                  data-testid="button-previous-step"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-metal-red hover:bg-metal-red-bright font-bold touch-target-large active-scale order-1 sm:order-2"
                    data-testid="button-next-step"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={completeOnboardingMutation.isPending}
                    className="bg-metal-red hover:bg-metal-red-bright font-bold px-8 touch-target-large active-scale order-1 sm:order-2"
                    data-testid="button-complete-onboarding"
                  >
                    {completeOnboardingMutation.isPending ? "Setting up..." : "Complete Setup"}
                    <Check className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}