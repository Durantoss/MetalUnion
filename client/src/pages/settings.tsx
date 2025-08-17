import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetalLoader } from "@/components/ui/metal-loader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
import { RememberLogin } from "@/components/remember-login";
import { useAuth } from "@/hooks/useAuth";
import { 
  Settings as SettingsIcon, 
  Save, 
  Bell, 
  Shield, 
  Eye, 
  Mail, 
  Music,
  LogOut,
  Trash2,
  AlertTriangle
} from "lucide-react";

const preferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  tourAlerts: z.boolean().default(true),
  reviewNotifications: z.boolean().default(true),
  bandUpdates: z.boolean().default(true),
  profileVisibility: z.enum(["public", "members", "private"]).default("public"),
  preferredGenres: z.array(z.string()).default([]),
  autoApprovePhotos: z.boolean().default(false),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

interface UserPreferences extends PreferencesFormData {
  id: string;
  userId: string;
}

const metalGenres = [
  "Black Metal", "Death Metal", "Doom Metal", "Folk Metal", "Gothic Metal", 
  "Groove Metal", "Heavy Metal", "Industrial Metal", "Melodic Death Metal",
  "Metalcore", "Nu Metal", "Power Metal", "Progressive Metal", "Sludge Metal",
  "Speed Metal", "Symphonic Metal", "Thrash Metal", "Viking Metal"
];

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  // // const { toast } = useToast();

  const { data: preferences, isLoading: preferencesLoading } = useQuery<UserPreferences>({
    queryKey: ["/api/user/preferences"],
    enabled: isAuthenticated,
  });

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      emailNotifications: preferences?.emailNotifications ?? true,
      tourAlerts: preferences?.tourAlerts ?? true,
      reviewNotifications: preferences?.reviewNotifications ?? true,
      bandUpdates: preferences?.bandUpdates ?? true,
      profileVisibility: preferences?.profileVisibility ?? "public",
      preferredGenres: preferences?.preferredGenres ?? [],
      autoApprovePhotos: preferences?.autoApprovePhotos ?? false,
    },
  });

  // Update form when preferences load
  useState(() => {
    if (preferences) {
      form.reset(preferences);
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: PreferencesFormData) => {
      const response = await apiRequest("PUT", "/api/user/preferences", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update preferences");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
      console.log("Preferences updated successfully");
    },
    onError: (error: Error) => {
      console.error("Preferences update failed:", error.message);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/user/account");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete account");
      }
      return response.json();
    },
    onSuccess: () => {
      console.log("Account deleted successfully");
      // Redirect to home page
      window.location.href = "/";
    },
    onError: (error: Error) => {
      console.error("Account deletion failed:", error.message);
    },
  });

  const onSubmit = (data: PreferencesFormData) => {
    updatePreferencesMutation.mutate(data);
  };

  const handleDeleteAccount = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    deleteAccountMutation.mutate();
  };

  if (authLoading || preferencesLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-96">
          <MetalLoader size="lg" variant="skull" text="LOADING SETTINGS..." />
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
            <p className="text-gray-400 mb-6">You need to be logged in to access settings.</p>
            <a href="/api/login">
              <Button className="bg-metal-red hover:bg-metal-red-bright">Login</Button>
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-metal-red" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider">Account Settings</h1>
        </div>
        <p className="text-gray-400 text-sm sm:text-base">
          Customize your MetalHub experience and manage your account preferences.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          
          {/* Notification Preferences */}
          <Card className="bg-card-dark border-metal-gray">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-metal-red" />
                <h2 className="text-xl font-black uppercase tracking-wider text-white">Notifications</h2>
              </div>
              <p className="text-gray-400 text-sm">Configure what notifications you want to receive</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-metal-gray p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-bold text-white flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-metal-red" />
                        Email Notifications
                      </FormLabel>
                      <FormDescription className="text-gray-400">
                        Receive email notifications for important updates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-email-notifications"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tourAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-metal-gray p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-bold text-white flex items-center">
                        <Music className="w-4 h-4 mr-2 text-metal-red" />
                        Tour Alerts
                      </FormLabel>
                      <FormDescription className="text-gray-400">
                        Get notified when bands you follow announce new tour dates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-tour-alerts"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reviewNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-metal-gray p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-bold text-white">Review Notifications</FormLabel>
                      <FormDescription className="text-gray-400">
                        Be notified when someone likes or comments on your reviews
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-review-notifications"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bandUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-metal-gray p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-bold text-white">Band Updates</FormLabel>
                      <FormDescription className="text-gray-400">
                        Receive updates about your submitted bands and approvals
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-band-updates"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-card-dark border-metal-gray">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-metal-red" />
                <h2 className="text-xl font-black uppercase tracking-wider text-white">Privacy</h2>
              </div>
              <p className="text-gray-400 text-sm">Control who can see your profile and activity</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="profileVisibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-metal-red" />
                      Profile Visibility
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-card-dark border-metal-gray text-white focus:border-metal-red" data-testid="select-profile-visibility">
                          <SelectValue placeholder="Choose visibility level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black border-metal-red">
                        <SelectItem value="public" className="text-white hover:bg-metal-red/20">
                          Public - Anyone can view your profile
                        </SelectItem>
                        <SelectItem value="members" className="text-white hover:bg-metal-red/20">
                          Members Only - Only logged in users can see your profile
                        </SelectItem>
                        <SelectItem value="private" className="text-white hover:bg-metal-red/20">
                          Private - Only you can view your profile
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-gray-400">
                      Control who can see your profile information and activity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoApprovePhotos"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-metal-gray p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-bold text-white">Auto-approve Photo Uploads</FormLabel>
                      <FormDescription className="text-gray-400">
                        Automatically make your uploaded photos visible to others
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-auto-approve-photos"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Session Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RememberLogin />
          </div>

          {/* Music Preferences */}
          <Card className="bg-card-dark border-metal-gray">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Music className="w-5 h-5 text-metal-red" />
                <h2 className="text-xl font-black uppercase tracking-wider text-white">Music Preferences</h2>
              </div>
              <p className="text-gray-400 text-sm">Help us personalize your MetalHub experience</p>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="preferredGenres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold">Favorite Metal Genres</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {metalGenres.map((genre) => (
                        <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value.includes(genre)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...field.value, genre]);
                              } else {
                                field.onChange(field.value.filter((g: string) => g !== genre));
                              }
                            }}
                            className="rounded border-metal-gray bg-card-dark text-metal-red focus:ring-metal-red"
                            data-testid={`checkbox-genre-${genre.toLowerCase().replace(/\s+/g, '-')}`}
                          />
                          <span className="text-sm text-gray-300 hover:text-white">{genre}</span>
                        </label>
                      ))}
                    </div>
                    <FormDescription className="text-gray-400">
                      Select your favorite genres to get personalized recommendations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              type="submit"
              disabled={updatePreferencesMutation.isPending}
              className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider"
              data-testid="button-save-settings"
            >
              <Save className="w-4 h-4 mr-2" />
              {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
            </Button>

            <div className="flex space-x-4">
              <a href="/api/logout">
                <Button variant="outline" className="border-metal-gray text-gray-300 hover:bg-metal-gray/20">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </a>
            </div>
          </div>

          {/* Danger Zone */}
          <Card className="bg-red-900/20 border-red-600">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-black uppercase tracking-wider text-red-400">Danger Zone</h2>
              </div>
              <p className="text-red-300 text-sm">Irreversible and destructive actions</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h3 className="text-lg font-bold text-red-400">Delete Account</h3>
                  <p className="text-red-200 text-sm">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                  className={`${showDeleteConfirm 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-red-900 hover:bg-red-800'
                  } text-white font-bold border-red-600`}
                  data-testid="button-delete-account"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteAccountMutation.isPending ? "Deleting..." : 
                   showDeleteConfirm ? "Confirm Delete" : "Delete Account"}
                </Button>
              </div>
              {showDeleteConfirm && (
                <div className="mt-4 p-4 bg-red-800/30 border border-red-600 rounded">
                  <p className="text-red-200 text-sm font-bold">
                    Are you sure? This will permanently delete your account, all your bands, reviews, and photos. 
                    Type your email to confirm deletion.
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <Button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-800/20"
                      data-testid="button-cancel-delete"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </main>
  );
}