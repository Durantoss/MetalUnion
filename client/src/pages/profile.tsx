import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MetalLoader } from "@/components/ui/metal-loader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Calendar, 
  Mail, 
  Guitar, 
  Music, 
  Camera,
  MessageSquare,
  Settings,
  Crown,
  Check
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  stagename: z.string().min(2, "Stagename must be at least 2 characters").max(50, "Stagename too long"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserStats {
  bandsSubmitted: number;
  reviewsWritten: number;
  photosUploaded: number;
  memberSince: string;
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  // // const { toast } = useToast();

  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: isAuthenticated,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      stagename: user?.stagename || "",
    },
  });

  // Reset form when user data changes
  useState(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        stagename: user.stagename || "",
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PUT", "/api/user/profile", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      console.log("Profile updated successfully");
      setIsEditing(false);
    },
    onError: (error: Error) => {
      console.error("Profile update failed:", error.message);
    },
  });

  const checkStagename = async (stagename: string): Promise<boolean> => {
    if (stagename === user?.stagename) return true; // Current stagename is always available
    
    try {
      const response = await fetch(`/api/stagename/check/${encodeURIComponent(stagename)}`);
      const data = await response.json();
      return data.available;
    } catch {
      return false;
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    // Check stagename availability if changed
    if (data.stagename !== user?.stagename) {
      const available = await checkStagename(data.stagename);
      if (!available) {
        form.setError("stagename", { message: "Stagename already taken" });
        return;
      }
    }
    
    updateProfileMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-96">
          <MetalLoader size="lg" variant="skull" text="LOADING PROFILE..." />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-card-dark border-metal-gray">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
            <p className="text-gray-400 mb-6">You need to be logged in to view your profile.</p>
            <a href="/api/login">
              <Button className="bg-metal-red hover:bg-metal-red-bright">Login</Button>
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-6 h-6 sm:w-8 sm:h-8 text-metal-red" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider">My Profile</h1>
        </div>
        <p className="text-gray-400 text-sm sm:text-base">
          Manage your profile information and view your MetalHub activity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="bg-card-dark border-metal-gray">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-wider text-white">Profile Information</h2>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-metal-red"
                    data-testid="button-edit-profile"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      form.reset();
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-400"
                    data-testid="button-cancel-edit"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {!isEditing ? (
                <div className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex items-center space-x-4">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-metal-gray"
                        data-testid="img-profile-picture"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-metal-gray flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white" data-testid="text-user-full-name">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      {user?.stagename && (
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-metal-red" />
                          <span className="text-metal-red font-bold" data-testid="text-user-stagename">
                            {user.stagename}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-metal-gray/30" />

                  {/* Profile Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-400 block mb-1">First Name</label>
                      <p className="text-white" data-testid="text-first-name">
                        {user?.firstName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-400 block mb-1">Last Name</label>
                      <p className="text-white" data-testid="text-last-name">
                        {user?.lastName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-400 block mb-1">Email</label>
                      <p className="text-white flex items-center" data-testid="text-email">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user?.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-400 block mb-1">Stagename</label>
                      <p className="text-white" data-testid="text-stagename-display">
                        {user?.stagename ? (
                          <span className="flex items-center">
                            <Crown className="w-4 h-4 mr-2 text-metal-red" />
                            {user.stagename}
                          </span>
                        ) : (
                          "Not set"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-400 block mb-1">Member Since</label>
                      <p className="text-white flex items-center" data-testid="text-member-since">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {user?.createdAt ? formatDate(user.createdAt) : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-bold">First Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                              data-testid="input-first-name"
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
                              className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                              data-testid="input-last-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stagename"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-bold flex items-center">
                            <Crown className="w-4 h-4 mr-2 text-metal-red" />
                            Stagename
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Choose your metal persona..."
                              className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                              data-testid="input-stagename"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Your unique identity in the metal community
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-metal-red hover:bg-metal-red-bright font-bold"
                        data-testid="button-save-profile"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Stats Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card-dark border-metal-gray">
            <CardHeader>
              <h3 className="text-lg font-black uppercase tracking-wider text-white">Activity Stats</h3>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex justify-center py-8">
                  <MetalLoader size="md" variant="flame" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Guitar className="w-4 h-4 text-metal-red" />
                      <span className="text-gray-300 text-sm">Bands Submitted</span>
                    </div>
                    <span className="text-white font-bold" data-testid="text-bands-count">
                      {userStats?.bandsSubmitted || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-metal-red" />
                      <span className="text-gray-300 text-sm">Reviews Written</span>
                    </div>
                    <span className="text-white font-bold" data-testid="text-reviews-count">
                      {userStats?.reviewsWritten || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-metal-red" />
                      <span className="text-gray-300 text-sm">Photos Uploaded</span>
                    </div>
                    <span className="text-white font-bold" data-testid="text-photos-count">
                      {userStats?.photosUploaded || 0}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card-dark border-metal-gray">
            <CardHeader>
              <h3 className="text-lg font-black uppercase tracking-wider text-white">Quick Actions</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="/my-bands">
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-metal-red" data-testid="button-my-bands">
                  <Music className="w-4 h-4 mr-2" />
                  Manage My Bands
                </Button>
              </a>
              <a href="/settings">
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-metal-red" data-testid="button-settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Member Badge */}
          {user?.stagename && (
            <Card className="bg-gradient-to-br from-metal-red/20 to-transparent border-metal-red">
              <CardContent className="p-4 text-center">
                <Crown className="w-8 h-8 mx-auto text-metal-red mb-2" />
                <h4 className="font-bold text-white mb-1">Metal Community Member</h4>
                <p className="text-sm text-gray-300">Stagename verified</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}