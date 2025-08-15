import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { User, CheckCircle, XCircle, Loader2 } from "lucide-react";

const stagenameSchema = z.object({
  stagename: z.string()
    .min(2, "Stagename must be at least 2 characters")
    .max(50, "Stagename must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Stagename can only contain letters, numbers, underscores, and dashes")
});

type StagenameFormData = z.infer<typeof stagenameSchema>;

export default function Profile() {
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'taken' | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  const form = useForm<StagenameFormData>({
    resolver: zodResolver(stagenameSchema),
    defaultValues: {
      stagename: "",
    },
  });

  const watchStagename = form.watch("stagename");

  // Set initial stagename when user data loads
  useEffect(() => {
    if (user && user.stagename) {
      form.setValue("stagename", user.stagename);
    }
  }, [user, form]);

  // Check stagename availability as user types
  useEffect(() => {
    const checkAvailability = async (stagename: string) => {
      if (!stagename || stagename.length < 2) {
        setAvailabilityStatus(null);
        return;
      }

      // Skip check if it's the user's current stagename
      if (user && user.stagename === stagename) {
        setAvailabilityStatus('available');
        return;
      }

      setCheckingAvailability(true);
      try {
        const response = await fetch(`/api/stagename/check/${encodeURIComponent(stagename)}`);
        const data = await response.json();
        setAvailabilityStatus(data.available ? 'available' : 'taken');
      } catch (error) {
        setAvailabilityStatus(null);
      } finally {
        setCheckingAvailability(false);
      }
    };

    const timeoutId = setTimeout(() => {
      checkAvailability(watchStagename);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchStagename, user]);

  const updateStagenameMutation = useMutation({
    mutationFn: async (data: StagenameFormData) => {
      const response = await apiRequest("PUT", "/api/auth/user/stagename", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Stagename updated!",
        description: "Your metal identity has been set.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update stagename. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StagenameFormData) => {
    if (availabilityStatus !== 'available') {
      toast({
        title: "Error",
        description: "Please choose an available stagename.",
        variant: "destructive",
      });
      return;
    }
    updateStagenameMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-metal-red" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-card-dark border-metal-gray">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
            <p className="text-gray-400 mb-6">You need to be logged in to manage your profile.</p>
            <a href="/api/login">
              <Button className="bg-metal-red hover:bg-metal-red-bright">Login</Button>
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }

  const getAvailabilityIcon = () => {
    if (checkingAvailability) {
      return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
    }
    if (availabilityStatus === 'available') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (availabilityStatus === 'taken') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getAvailabilityText = () => {
    if (checkingAvailability) return "Checking availability...";
    if (availabilityStatus === 'available') return "Available!";
    if (availabilityStatus === 'taken') return "Already taken";
    return "";
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-8 h-8 text-metal-red" />
          <h1 className="text-4xl font-black uppercase tracking-wider">Profile</h1>
        </div>
        <p className="text-gray-400">
          Set your metal identity. Your stagename will be used across reviews and The Pit.
        </p>
      </div>

      {/* Profile Info */}
      <Card className="bg-card-dark border-metal-gray mb-8">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">Account Info</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Email</label>
              <p className="text-white" data-testid="text-user-email">{user.email || 'Not available'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">Name</label>
              <p className="text-white" data-testid="text-user-name">
                {user.firstName || user.lastName 
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : 'Not available'
                }
              </p>
            </div>
          </div>
          
          {user.stagename && (
            <div>
              <label className="text-sm font-medium text-gray-400">Current Stagename</label>
              <div className="flex items-center space-x-2">
                <Badge className="bg-metal-red text-white" data-testid="badge-current-stagename">
                  {user.stagename}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stagename Form */}
      <Card className="bg-card-dark border-metal-gray">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">
            {user.stagename ? 'Update Stagename' : 'Set Your Stagename'}
          </h3>
          <p className="text-gray-400">
            Choose a unique metal identity. This will replace manual name entry in reviews and posts.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="stagename"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold">Stagename *</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Enter your metal stagename"
                          {...field}
                          className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red pr-10"
                          data-testid="input-stagename"
                        />
                      </FormControl>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getAvailabilityIcon()}
                      </div>
                    </div>
                    
                    {watchStagename && watchStagename.length >= 2 && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`text-sm ${
                          availabilityStatus === 'available' ? 'text-green-500' :
                          availabilityStatus === 'taken' ? 'text-red-500' : 'text-gray-400'
                        }`}>
                          {getAvailabilityText()}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-400 mt-2">
                      <ul className="space-y-1">
                        <li>• 2-50 characters</li>
                        <li>• Letters, numbers, underscores, and dashes only</li>
                        <li>• Must be unique across all users</li>
                      </ul>
                    </div>
                    
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="submit"
                  disabled={
                    updateStagenameMutation.isPending || 
                    availabilityStatus !== 'available' ||
                    !watchStagename ||
                    watchStagename === user.stagename
                  }
                  className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider disabled:opacity-50"
                  data-testid="button-save-stagename"
                >
                  {updateStagenameMutation.isPending ? "Saving..." : user.stagename ? "Update Stagename" : "Set Stagename"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}