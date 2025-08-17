import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Clock, CheckCircle, User, Shield } from 'lucide-react';

interface SessionInfo {
  isActive: boolean;
  expiresAt?: Date;
  lastActivity?: Date;
  sessionAge?: number;
}

export function RememberLogin() {
  const { user, isAuthenticated } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({ isActive: false });

  useEffect(() => {
    if (isAuthenticated && user) {
      // Simulate session info (in a real app this might come from an API)
      const sessionStart = localStorage.getItem('sessionStart');
      const now = new Date();
      
      if (!sessionStart) {
        localStorage.setItem('sessionStart', now.toISOString());
      }
      
      const startTime = new Date(sessionStart || now.toISOString());
      const sessionAge = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
      const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
      
      setSessionInfo({
        isActive: true,
        expiresAt,
        lastActivity: now,
        sessionAge
      });
    } else {
      setSessionInfo({ isActive: false });
      localStorage.removeItem('sessionStart');
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <Card className="bg-card-dark border-metal-gray">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-400">
            <Shield className="h-5 w-5" />
            Session Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-gray-400">
              Not logged in
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Login to enable persistent sessions
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatTimeLeft = (expiresAt: Date) => {
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();
    const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (daysLeft > 0) {
      return `${daysLeft} days, ${hoursLeft} hours`;
    }
    return `${hoursLeft} hours`;
  };

  const refreshSession = async () => {
    try {
      // Force a fresh auth check
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  return (
    <Card className="bg-card-dark border-metal-gray">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Session Active
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Logged in as:</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {user?.stagename || user?.firstName || 'User'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Session age:</span>
            <Badge variant="outline">
              {sessionInfo.sessionAge} days
            </Badge>
          </div>

          {sessionInfo.expiresAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Expires in:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeLeft(sessionInfo.expiresAt)}
              </Badge>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-metal-gray">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Auto-login enabled</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Your login will be remembered for 30 days and automatically refreshed when you use the app.
          </p>
          
          <Button 
            onClick={refreshSession}
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            Refresh Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}