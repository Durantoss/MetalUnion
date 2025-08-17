import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Crown, 
  Award, 
  TrendingUp, 
  Flame, 
  Zap, 
  Target,
  Calendar,
  Users,
  MessageCircle,
  Camera,
  Heart,
  Medal,
  Sparkles
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  reputationPoints: number;
  totalReviews: number;
  totalPhotos: number;
  totalLikes: number;
  badges: string[];
  loginStreak: number;
  rankChange: number; // +1, -1, 0 for up, down, no change
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'social' | 'content' | 'engagement' | 'time';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  pointsValue: number;
  progress: number;
  maxProgress: number;
  isEarned: boolean;
  earnedAt?: string;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  rewardPoints: number;
  expiresAt: string;
  isCompleted: boolean;
}

const rankIcons = {
  1: Crown,
  2: Medal,
  3: Medal,
};

const rankColors = {
  1: 'text-golden-yellow',
  2: 'text-gray-300',
  3: 'text-amber-600',
};

const rarityGradients = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-fire-red to-electric-yellow',
};

export function GameficationDashboard({ userId }: { userId?: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    loadGamificationData();
  }, [userId]);

  const loadGamificationData = async () => {
    try {
      const [leaderboardRes, achievementsRes, challengesRes, statsRes] = await Promise.allSettled([
        fetch('/api/leaderboard'),
        fetch('/api/achievements/progress'),
        fetch('/api/daily-challenges'),
        userId ? fetch(`/api/users/${userId}/stats`) : Promise.resolve({ ok: false })
      ]);

      if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value.ok) {
        const data = await leaderboardRes.value.json();
        setLeaderboard(data);
      }

      if (achievementsRes.status === 'fulfilled' && achievementsRes.value.ok) {
        const data = await achievementsRes.value.json();
        setAchievements(data);
      }

      if (challengesRes.status === 'fulfilled' && challengesRes.value.ok) {
        const data = await challengesRes.value.json();
        setDailyChallenges(data);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const data = await statsRes.value.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReputationLevel = (points: number) => {
    if (points >= 10000) return { level: 'Legendary', color: 'from-fire-red to-electric-yellow', progress: 100 };
    if (points >= 5000) return { level: 'Epic', color: 'from-purple-400 to-purple-600', progress: (points - 5000) / 5000 * 100 };
    if (points >= 2000) return { level: 'Expert', color: 'from-blue-400 to-blue-600', progress: (points - 2000) / 3000 * 100 };
    if (points >= 500) return { level: 'Advanced', color: 'from-green-400 to-green-600', progress: (points - 500) / 1500 * 100 };
    return { level: 'Rookie', color: 'from-gray-400 to-gray-500', progress: points / 500 * 100 };
  };

  const getRankIcon = (rank: number) => {
    const Icon = rankIcons[rank as keyof typeof rankIcons] || Trophy;
    const color = rankColors[rank as keyof typeof rankColors] || 'text-muted-foreground';
    return <Icon className={`w-5 h-5 ${color}`} />;
  };

  if (loading) {
    return (
      <Card className="bg-void-black/40 border-fire-red/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-fire-red animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-electric-yellow animate-pulse delay-100"></div>
            <div className="w-3 h-3 rounded-full bg-fire-red animate-pulse delay-200"></div>
          </div>
          <p className="text-center mt-4 text-muted-foreground">Loading gamification data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="bg-void-black/40 border-fire-red/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="gradient-text-neon flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Community Leaderboards & Achievements
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="achievements" data-testid="tab-achievements">Achievements</TabsTrigger>
              <TabsTrigger value="challenges" data-testid="tab-challenges">Daily Challenges</TabsTrigger>
              <TabsTrigger value="stats" data-testid="tab-stats">My Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  <AnimatePresence>
                    {leaderboard.map((entry, index) => {
                      const reputationLevel = getReputationLevel(entry.reputationPoints);
                      
                      return (
                        <motion.div
                          key={entry.userId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`
                            relative p-4 rounded-lg border transition-all group cursor-pointer
                            ${entry.rank <= 3 
                              ? 'bg-gradient-to-r from-fire-red/10 to-electric-yellow/10 border-fire-red/30' 
                              : 'bg-void-black/20 border-fire-red/10 hover:border-fire-red/20'
                            }
                          `}
                          data-testid={`leaderboard-entry-${entry.userId}`}
                        >
                          {/* Rank position highlight */}
                          {entry.rank <= 3 && (
                            <div className="absolute inset-0 bg-gradient-to-r from-fire-red/5 to-electric-yellow/5 rounded-lg"></div>
                          )}
                          
                          <div className="relative flex items-center gap-4">
                            {/* Rank and change indicator */}
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1">
                                {getRankIcon(entry.rank)}
                                <span className={`text-lg font-bold ${entry.rank <= 3 ? 'text-fire-red' : 'text-muted-foreground'}`}>
                                  #{entry.rank}
                                </span>
                              </div>
                              
                              {entry.rankChange !== 0 && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`text-xs px-1 rounded ${
                                    entry.rankChange > 0 ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {entry.rankChange > 0 ? '↗' : '↘'} {Math.abs(entry.rankChange)}
                                </motion.div>
                              )}
                            </div>

                            {/* User info */}
                            <div className="flex items-center gap-3 flex-1">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={entry.userAvatar} />
                                <AvatarFallback className="font-bold">
                                  {entry.userName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold hover:text-fire-red cursor-pointer">
                                    {entry.userName}
                                  </h3>
                                  
                                  {entry.badges.includes('verified') && (
                                    <Badge variant="fire" size="sm" className="gap-1">
                                      <Crown className="w-3 h-3" />
                                      Verified
                                    </Badge>
                                  )}
                                  
                                  {entry.loginStreak >= 30 && (
                                    <Badge variant="outline" size="sm" className="gap-1">
                                      <Flame className="w-3 h-3" />
                                      {entry.loginStreak}d streak
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <Badge 
                                    className={`bg-gradient-to-r ${reputationLevel.color} text-white`}
                                    size="sm"
                                  >
                                    {reputationLevel.level}
                                  </Badge>
                                  <span className="text-sm font-mono text-muted-foreground">
                                    {entry.reputationPoints.toLocaleString()} pts
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <MessageCircle className="w-4 h-4" />
                                        {entry.totalReviews}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{entry.totalReviews} reviews written</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <Camera className="w-4 h-4" />
                                        {entry.totalPhotos}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{entry.totalPhotos} photos uploaded</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <Heart className="w-4 h-4" />
                                        {entry.totalLikes}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{entry.totalLikes} likes received</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>

                            {/* Special effects for top 3 */}
                            {entry.rank === 1 && (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-1 -right-1"
                              >
                                <Sparkles className="w-6 h-6 text-golden-yellow" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="achievements">
              <div className="space-y-6">
                {/* Progress Overview */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card className="bg-void-black/20 border-fire-red/10">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-fire-red">
                          {achievements.filter(a => a.isEarned).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Achievements Earned</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-void-black/20 border-fire-red/10">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-electric-yellow">
                          {achievements.filter(a => a.progress > 0 && !a.isEarned).length}
                        </div>
                        <div className="text-sm text-muted-foreground">In Progress</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <ScrollArea className="h-80">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`
                          relative overflow-hidden transition-all group cursor-pointer
                          ${achievement.isEarned 
                            ? `bg-gradient-to-r ${rarityGradients[achievement.rarity]} bg-opacity-20 border-opacity-50` 
                            : 'bg-void-black/20 border-fire-red/10 hover:border-fire-red/20'
                          }
                        `}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`
                                text-3xl p-2 rounded-lg
                                ${achievement.isEarned 
                                  ? 'bg-gradient-to-r from-fire-red/20 to-electric-yellow/20' 
                                  : 'bg-void-black/40 opacity-50'
                                }
                              `}>
                                {achievement.icon}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`font-semibold ${achievement.isEarned ? 'text-fire-red' : ''}`}>
                                    {achievement.name}
                                  </h3>
                                  <Badge 
                                    variant={achievement.rarity === 'legendary' ? 'fire' : 'outline'} 
                                    size="sm"
                                  >
                                    {achievement.rarity}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-2">
                                  {achievement.description}
                                </p>
                                
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-mono text-muted-foreground">
                                    +{achievement.pointsValue} pts
                                  </span>
                                  {achievement.isEarned && achievement.earnedAt && (
                                    <span className="text-xs text-fire-red">
                                      Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                
                                {!achievement.isEarned && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>Progress</span>
                                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                                    </div>
                                    <Progress 
                                      value={(achievement.progress / achievement.maxProgress) * 100} 
                                      className="h-2"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {achievement.isEarned && (
                              <motion.div
                                animate={{ 
                                  scale: [1, 1.1, 1],
                                  opacity: [0.5, 1, 0.5] 
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity, 
                                  ease: "easeInOut" 
                                }}
                                className="absolute top-2 right-2"
                              >
                                <Award className="w-5 h-5 text-golden-yellow" />
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="challenges">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Daily Challenges</h3>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date().toLocaleDateString()}
                  </Badge>
                </div>
                
                {dailyChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`
                      ${challenge.isCompleted 
                        ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20' 
                        : 'bg-void-black/20 border-fire-red/10'
                      }
                    `}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            ${challenge.isCompleted 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-fire-red/20 text-fire-red'
                            }
                          `}>
                            {challenge.isCompleted ? (
                              <Award className="w-5 h-5" />
                            ) : (
                              <Target className="w-5 h-5" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold">{challenge.title}</h4>
                              <Badge variant="outline" size="sm">
                                {challenge.rewardPoints} pts
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {challenge.description}
                            </p>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-mono">
                                  {challenge.progress}/{challenge.target}
                                </span>
                              </div>
                              
                              <Progress 
                                value={(challenge.progress / challenge.target) * 100} 
                                className="h-2"
                              />
                              
                              {!challenge.isCompleted && (
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>
                                    {challenge.target - challenge.progress} left to complete
                                  </span>
                                  <span>
                                    Expires in {Math.ceil((new Date(challenge.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))}h
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                
                {dailyChallenges.length === 0 && (
                  <Card className="bg-void-black/20 border-fire-red/10">
                    <CardContent className="p-6 text-center">
                      <Target className="w-12 h-12 text-muted-foreground mb-4 opacity-50 mx-auto" />
                      <h3 className="text-lg font-semibold mb-2">No challenges today</h3>
                      <p className="text-muted-foreground">Check back tomorrow for new daily challenges!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats">
              {userStats ? (
                <div className="space-y-6">
                  {/* Personal stats overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-void-black/20 border-fire-red/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-fire-red">{userStats.rank}</div>
                        <div className="text-sm text-muted-foreground">Global Rank</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-void-black/20 border-fire-red/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-electric-yellow">{userStats.reputationPoints}</div>
                        <div className="text-sm text-muted-foreground">Reputation</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-void-black/20 border-fire-red/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-fire-red">{userStats.loginStreak}</div>
                        <div className="text-sm text-muted-foreground">Day Streak</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-void-black/20 border-fire-red/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-electric-yellow">{userStats.achievementsEarned}</div>
                        <div className="text-sm text-muted-foreground">Achievements</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Detailed breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-void-black/20 border-fire-red/10">
                      <CardHeader>
                        <CardTitle className="text-sm text-fire-red">Content Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Reviews Written', value: userStats.totalReviews, icon: MessageCircle },
                          { label: 'Photos Uploaded', value: userStats.totalPhotos, icon: Camera },
                          { label: 'Likes Received', value: userStats.totalLikes, icon: Heart },
                        ].map((stat, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <stat.icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{stat.label}</span>
                            </div>
                            <Badge variant="outline">{stat.value}</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-void-black/20 border-fire-red/10">
                      <CardHeader>
                        <CardTitle className="text-sm text-electric-yellow">Social Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Followers', value: userStats.followersCount, icon: Users },
                          { label: 'Following', value: userStats.followingCount, icon: Users },
                          { label: 'Comments Made', value: userStats.commentsCount, icon: MessageCircle },
                        ].map((stat, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <stat.icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{stat.label}</span>
                            </div>
                            <Badge variant="outline">{stat.value}</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="bg-void-black/20 border-fire-red/10">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mb-4 opacity-50 mx-auto" />
                    <h3 className="text-lg font-semibold mb-2">No stats available</h3>
                    <p className="text-muted-foreground">Log in to see your personal statistics!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}