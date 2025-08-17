import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Clock, Shield, RefreshCw, LogOut, User, CheckCircle, AlertTriangle } from "lucide-react";

interface SessionInfo {
  sessionStart?: string;
  lastActivity?: string;
  expiresAt?: string;
  rememberMe?: boolean;
}

export function SessionStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  // Get session info from user data
  const sessionInfo = user as SessionInfo | null;

  useEffect(() => {
    if (sessionInfo?.rememberMe !== undefined) {
      setRememberMe(sessionInfo.rememberMe);
    }
  }, [sessionInfo?.rememberMe]);

  const refreshSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/refresh-session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      console.log("Session refreshed successfully");
    },
  });

  const extendSessionMutation = useMutation({
    mutationFn: async (rememberMe: boolean) => {
      const response = await apiRequest("POST", "/api/auth/extend-session", { rememberMe });
      return response.json();
    },
    onSuccess: (data) => {
      setRememberMe(data.rememberMe);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      console.log(data.message);
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      return `${hours}h remaining`;
    }
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Card className="bg-card-dark border-metal-gray">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-metal-red" />
            <h3 className="font-bold text-white">Session Status</h3>
          </div>
          <Badge className="bg-green-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* User Info */}
        <div className="flex items-center space-x-3 p-3 bg-metal-gray/20 border border-metal-gray/50 rounded">
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt="Profile" 
              className="w-10 h-10 rounded border border-metal-gray object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-metal-red/20 border border-metal-red/50 flex items-center justify-center">
              <User className="w-5 h-5 text-metal-red" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white truncate">
              {user?.stagename || `${user?.firstName} ${user?.lastName}` || "User"}
            </h4>
            <p className="text-sm text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Session Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {sessionInfo?.sessionStart && (
            <div>
              <div className="text-gray-400 flex items-center mb-1">
                <Clock className="w-3 h-3 mr-1" />
                Session Start
              </div>
              <div className="text-white font-medium">
                {formatDate(sessionInfo.sessionStart)}
              </div>
            </div>
          )}
          
          {sessionInfo?.lastActivity && (
            <div>
              <div className="text-gray-400 flex items-center mb-1">
                <RefreshCw className="w-3 h-3 mr-1" />
                Last Activity
              </div>
              <div className="text-white font-medium">
                {formatDate(sessionInfo.lastActivity)}
              </div>
            </div>
          )}
          
          {sessionInfo?.expiresAt && (
            <div className="col-span-2">
              <div className="text-gray-400 flex items-center mb-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Session Expires
              </div>
              <div className="text-white font-medium">
                {getTimeRemaining(sessionInfo.expiresAt)}
              </div>
            </div>
          )}
        </div>

        {/* Remember Me Toggle */}
        <div className="flex items-center justify-between p-3 bg-metal-gray/10 border border-metal-gray/30 rounded">
          <div>
            <div className="text-white font-medium">Remember Me</div>
            <div className="text-sm text-gray-400">
              Keep me signed in for 90 days
            </div>
          </div>
          <Switch
            checked={rememberMe}
            onCheckedChange={(checked) => {
              setRememberMe(checked);
              extendSessionMutation.mutate(checked);
            }}
            disabled={extendSessionMutation.isPending}
            className="data-[state=checked]:bg-metal-red"
            data-testid="switch-remember-me"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-metal-gray/30">
          <Button
            onClick={() => refreshSessionMutation.mutate()}
            disabled={refreshSessionMutation.isPending}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-metal-gray/20 flex-1"
            data-testid="button-refresh-session"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {refreshSessionMutation.isPending ? "Refreshing..." : "Refresh Session"}
          </Button>
          
          <Button
            onClick={() => window.location.href = "/api/logout"}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-600/10 flex-1"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Secure session managed by MetalHub
        </div>
      </CardContent>
    </Card>
  );
}