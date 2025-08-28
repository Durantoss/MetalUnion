import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogOut, Star, Trophy, Calendar, MessageSquare, Music, User } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface UserProfileProps {
  onLogout?: () => void;
}

export function UserProfile({ onLogout }: UserProfileProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
      onLogout?.();
    },
    onError: (error) => {
      console.error('Logout error:', error);
    },
    onSettled: () => {
      setIsLoggingOut(false);
    },
  });

  const handleLogout = () => {
    setIsLoggingOut(true);
    logoutMutation.mutate();
  };

  if (!user) {
    return null;
  }

  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-black border-gray-800" data-testid="user-profile">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.stagename}
              className="w-20 h-20 rounded-full object-cover border-2 border-red-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-bold text-red-500" data-testid="user-stagename">
          {user.stagename}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {user.bio || 'Metal enthusiast and community member'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-2xl font-bold text-white" data-testid="reputation-points">
                {user.reputationPoints}
              </span>
            </div>
            <p className="text-xs text-gray-400">Reputation</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Music className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-2xl font-bold text-white" data-testid="concert-count">
                {user.concertAttendanceCount}
              </span>
            </div>
            <p className="text-xs text-gray-400">Concerts</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MessageSquare className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-2xl font-bold text-white" data-testid="comment-count">
                {user.commentCount}
              </span>
            </div>
            <p className="text-xs text-gray-400">Comments</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-2xl font-bold text-white" data-testid="login-streak">
                {user.loginStreak}
              </span>
            </div>
            <p className="text-xs text-gray-400">Day Streak</p>
          </div>
        </div>

        <Separator className="bg-gray-800" />

        {/* Badges Section */}
        <div className="space-y-3">
          <div className="flex items-center">
            <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
            <h3 className="text-sm font-semibold text-white">
              Badges ({user.badges.length})
            </h3>
          </div>
          
          {user.badges.length > 0 ? (
            <div className="flex flex-wrap gap-2" data-testid="user-badges">
              {user.badges.map((userBadge: any) => (
                <Badge
                  key={userBadge.id}
                  variant="secondary"
                  className={`${getBadgeColor(userBadge.badge?.rarity || 'common')} text-white text-xs`}
                  title={userBadge.badge?.description}
                >
                  {userBadge.badge?.icon} {userBadge.badge?.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              No badges yet. Start participating to earn your first badge!
            </p>
          )}
        </div>

        <Separator className="bg-gray-800" />

        {/* Account Info */}
        <div className="space-y-2 text-sm">
          {user.email && (
            <p className="text-gray-400">
              <span className="text-white">Email:</span> {user.email}
            </p>
          )}
          {user.location && (
            <p className="text-gray-400">
              <span className="text-white">Location:</span> {user.location}
            </p>
          )}
          {user.lastLoginAt && (
            <p className="text-gray-400">
              <span className="text-white">Last login:</span>{' '}
              {new Date(user.lastLoginAt).toLocaleDateString()}
            </p>
          )}
          {user.rememberMe && (
            <p className="text-green-400 text-xs">
              Extended session active (90 days)
            </p>
          )}
        </div>

        <Separator className="bg-gray-800" />

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
          disabled={isLoggingOut}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? 'Signing out...' : 'Sign Out'}
        </Button>
      </CardContent>
    </Card>
  );
}