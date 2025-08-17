import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Star, Award, Heart, MessageCircle, Camera, Clock, MapPin, Music } from 'lucide-react';

interface UserProfileProps {
  userId: string;
  isOwnProfile?: boolean;
  onClose?: () => void;
}

interface UserData {
  id: string;
  stagename: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  bio?: string;
  location?: string;
  favoriteGenres?: string[];
  reputationPoints: number;
  badges: string[];
  isOnline: boolean;
  lastActive: string;
  loginStreak: number;
  totalReviews: number;
  totalPhotos: number;
  totalLikes: number;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  pointsValue: number;
  progress?: number;
  earnedAt?: string;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-fire-red to-electric-yellow',
};

export function UserProfile({ userId, isOwnProfile = false, onClose }: UserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const [userResponse, achievementsResponse, activitiesResponse] = await Promise.allSettled([
        fetch(`/api/users/${userId}`),
        fetch(`/api/users/${userId}/achievements`),
        fetch(`/api/users/${userId}/activities`)
      ]);

      if (userResponse.status === 'fulfilled' && userResponse.value.ok) {
        const user = await userResponse.value.json();
        setUserData(user);
        setIsFollowing(user.isFollowing || false);
      }

      if (achievementsResponse.status === 'fulfilled' && achievementsResponse.value.ok) {
        const userAchievements = await achievementsResponse.value.json();
        setAchievements(userAchievements);
      }

      if (activitiesResponse.status === 'fulfilled' && activitiesResponse.value.ok) {
        const userActivities = await activitiesResponse.value.json();
        setActivities(userActivities);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        if (userData) {
          setUserData({
            ...userData,
            followerCount: userData.followerCount + (isFollowing ? -1 : 1)
          });
        }
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const getReputationLevel = (points: number) => {
    if (points >= 10000) return { level: 'Legendary', color: 'from-fire-red to-electric-yellow', progress: 100 };
    if (points >= 5000) return { level: 'Epic', color: 'from-purple-400 to-purple-600', progress: (points - 5000) / 5000 * 100 };
    if (points >= 2000) return { level: 'Expert', color: 'from-blue-400 to-blue-600', progress: (points - 2000) / 3000 * 100 };
    if (points >= 500) return { level: 'Advanced', color: 'from-green-400 to-green-600', progress: (points - 500) / 1500 * 100 };
    return { level: 'Rookie', color: 'from-gray-400 to-gray-500', progress: points / 500 * 100 };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-void-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md bg-void-black/90 border-fire-red/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-fire-red animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-electric-yellow animate-pulse delay-100"></div>
              <div className="w-3 h-3 rounded-full bg-fire-red animate-pulse delay-200"></div>
            </div>
            <p className="text-center mt-4 text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="fixed inset-0 bg-void-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md bg-void-black/90 border-fire-red/20">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">User not found</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reputationLevel = getReputationLevel(userData.reputationPoints);

  return (
    <TooltipProvider>
      <div className="fixed inset-0 bg-void-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <Card className="bg-void-black/95 border-fire-red/20 backdrop-blur-sm">
            <CardHeader className="relative pb-4">
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 z-10"
                data-testid={`close-profile-${userId}`}
              >
                ✕
              </Button>

              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-fire-red/40">
                    <AvatarImage src={userData.profileImageUrl} alt={userData.stagename} />
                    <AvatarFallback className="text-2xl font-bold">
                      {userData.stagename.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {userData.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-void-black animate-pulse"></div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold gradient-text-neon">{userData.stagename}</h2>
                    {userData.badges?.includes('verified') && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="fire" className="gap-1">
                            <Shield className="w-3 h-3" />
                            Verified
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Verified community member</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {userData.firstName && userData.lastName && (
                    <p className="text-muted-foreground mb-2">
                      {userData.firstName} {userData.lastName}
                    </p>
                  )}

                  {userData.bio && (
                    <p className="text-sm text-muted-foreground mb-3 max-w-md">{userData.bio}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {userData.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {userData.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {userData.isOnline ? 'Online now' : `Last seen ${new Date(userData.lastActive).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>

                {!isOwnProfile && (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className={isFollowing ? "" : "bg-gradient-to-r from-fire-red to-electric-yellow text-void-black"}
                      data-testid={`follow-button-${userId}`}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`message-button-${userId}`}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-fire-red">{userData.followerCount}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-electric-yellow">{userData.followingCount}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-fire-red">{userData.totalReviews}</div>
                  <div className="text-sm text-muted-foreground">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-electric-yellow">{userData.totalLikes}</div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </div>
              </div>

              {/* Reputation Level */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="reputation" className="px-3 py-1">
                    {reputationLevel.level}
                  </Badge>
                  <span className="text-sm font-mono text-muted-foreground">
                    {userData.reputationPoints.toLocaleString()} pts
                  </span>
                </div>
                <Progress value={reputationLevel.progress} className="h-2" />
              </div>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                  <TabsTrigger value="achievements" data-testid="tab-achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
                  <TabsTrigger value="stats" data-testid="tab-stats">Stats</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <div className="space-y-6">
                    {userData.favoriteGenres && userData.favoriteGenres.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Music className="w-4 h-4 text-fire-red" />
                          Favorite Genres
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {userData.favoriteGenres.map((genre, index) => (
                            <Badge key={index} variant="outline">{genre}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-electric-yellow" />
                        Recent Achievements
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {achievements.slice(0, 4).map((achievement) => (
                          <Tooltip key={achievement.id}>
                            <TooltipTrigger>
                              <div className={`p-3 rounded-lg border bg-gradient-to-r ${rarityColors[achievement.rarity]} bg-opacity-20 border-opacity-30 hover:bg-opacity-30 transition-all cursor-pointer`}>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{achievement.icon}</span>
                                  <div>
                                    <h4 className="font-semibold text-sm">{achievement.name}</h4>
                                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{achievement.pointsValue} points • {achievement.rarity}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="achievements" className="mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {achievements.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border bg-gradient-to-r ${rarityColors[achievement.rarity]} bg-opacity-20 border-opacity-30`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{achievement.name}</h4>
                              <Badge variant={achievement.rarity === 'legendary' ? 'fire' : 'outline'} size="sm">
                                {achievement.rarity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono text-muted-foreground">
                                +{achievement.pointsValue} pts
                              </span>
                              {achievement.earnedAt && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(achievement.earnedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {activities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-void-black/40 border border-fire-red/10"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fire-red to-electric-yellow flex items-center justify-center text-xs font-bold text-void-black">
                            {activity.activityType === 'review_posted' ? '📝' :
                             activity.activityType === 'photo_uploaded' ? '📸' :
                             activity.activityType === 'achievement_earned' ? '🏆' : '⚡'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{activity.title}</h4>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card className="bg-void-black/40 border-fire-red/20">
                      <CardHeader>
                        <CardTitle className="text-sm text-fire-red">Engagement Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Reviews Written</span>
                            <span className="font-mono">{userData.totalReviews}</span>
                          </div>
                          <Progress value={Math.min(userData.totalReviews / 50 * 100, 100)} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Photos Uploaded</span>
                            <span className="font-mono">{userData.totalPhotos}</span>
                          </div>
                          <Progress value={Math.min(userData.totalPhotos / 100 * 100, 100)} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Likes Received</span>
                            <span className="font-mono">{userData.totalLikes}</span>
                          </div>
                          <Progress value={Math.min(userData.totalLikes / 1000 * 100, 100)} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-void-black/40 border-fire-red/20">
                      <CardHeader>
                        <CardTitle className="text-sm text-electric-yellow">Community Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Login Streak</span>
                          <Badge variant="fire">{userData.loginStreak} days</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Member Since</span>
                          <span className="text-sm font-mono">{new Date(userData.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Reputation Level</span>
                          <Badge variant="reputation">{reputationLevel.level}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}