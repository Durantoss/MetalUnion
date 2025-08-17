import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Guitar, LogIn, Shield, Clock, Users } from "lucide-react";

interface LoginPromptProps {
  title?: string;
  subtitle?: string;
  returnTo?: string;
  showFeatures?: boolean;
}

export function LoginPrompt({ 
  title = "Join the Metal Community",
  subtitle = "Sign in to access your bands, reviews, and connect with metalheads worldwide",
  returnTo,
  showFeatures = true
}: LoginPromptProps) {
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = () => {
    const loginUrl = `/api/login${rememberMe ? '?remember=true' : ''}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`;
    window.location.href = loginUrl;
  };

  return (
    <Card className="bg-card-dark border-metal-gray max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-metal-red/20 border-2 border-metal-red/50 rounded-full flex items-center justify-center">
            <Guitar className="w-8 h-8 text-metal-red" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-400 text-sm">
          {subtitle}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {showFeatures && (
          <>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Guitar className="w-4 h-4 text-metal-red flex-shrink-0" />
                <span className="text-gray-300">Submit and manage your band profiles</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Users className="w-4 h-4 text-metal-red flex-shrink-0" />
                <span className="text-gray-300">Connect with the metal community</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Shield className="w-4 h-4 text-metal-red flex-shrink-0" />
                <span className="text-gray-300">Secure authentication via Replit</span>
              </div>
            </div>
            <Separator className="bg-metal-gray/30" />
          </>
        )}

        {/* Remember Me Option */}
        <div className="flex items-center justify-between p-3 bg-metal-gray/10 border border-metal-gray/30 rounded">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-white text-sm font-medium">Remember Me</div>
              <div className="text-xs text-gray-400">Stay signed in for 90 days</div>
            </div>
          </div>
          <Switch
            checked={rememberMe}
            onCheckedChange={setRememberMe}
            className="data-[state=checked]:bg-metal-red"
            data-testid="switch-login-remember"
          />
        </div>

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          className="w-full bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider h-12 text-base"
          data-testid="button-login"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Sign In with Replit
        </Button>

        <div className="text-xs text-gray-500 text-center">
          By signing in, you agree to our terms of service and privacy policy
        </div>
      </CardContent>
    </Card>
  );
}