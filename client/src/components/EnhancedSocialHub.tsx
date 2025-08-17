import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActivityFeed } from './ActivityFeed';
import { InteractivePolls } from './InteractivePolls';
// EventsHub removed - will use inline events display
import { GameficationDashboard } from './GameficationDashboard';
import { InteractiveMap } from './InteractiveMap';
import { UserProfile } from './UserProfile';
import { NotificationCenter } from './NotificationCenter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Trophy, 
  MapPin, 
  Calendar, 
  Bell, 
  User,
  BarChart,
  Sparkles,
  Heart,
  MessageCircle,
  Camera,
  Star
} from 'lucide-react';

interface SocialHubProps {
  userId?: string;
  initialTab?: string;
}

interface LiveStats {
  onlineUsers: number;
  activePolls: number;
  upcomingEvents: number;
  newPhotos: number;
  totalReactions: number;
}

export function EnhancedSocialHub({ userId, initialTab = 'feed' }: SocialHubProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [liveStats, setLiveStats] = useState<LiveStats>({
    onlineUsers: 0,
    activePolls: 0,
    upcomingEvents: 0,
    newPhotos: 0,
    totalReactions: 0
  });
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    loadLiveStats();
    
    // Set up real-time stats updates
    const statsInterval = setInterval(loadLiveStats, 30000); // Every 30 seconds
    
    // Set up notifications polling
    const notificationsInterval = setInterval(checkNotifications, 10000); // Every 10 seconds
    
    return () => {
      clearInterval(statsInterval);
      clearInterval(notificationsInterval);
    };
  }, [userId]);

  const loadLiveStats = async () => {
    try {
      const response = await fetch('/api/social/live-stats');
      if (response.ok) {
        const data = await response.json();
        setLiveStats(data);
      }
    } catch (error) {
      console.error('Error loading live stats:', error);
    }
  };

  const checkNotifications = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/notifications/unread-count`);
      if (response.ok) {
        const data = await response.json();
        setHasNewNotifications(data.count > 0);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const handleUserClick = (clickedUserId: string) => {
    setSelectedUserId(clickedUserId);
    setShowProfile(true);
  };

  const tabConfigs = [
    {
      id: 'feed',
      label: 'Activity Feed',
      icon: TrendingUp,
      description: 'Latest community activity',
      color: 'text-fire-red'
    },
    {
      id: 'polls',
      label: 'Community Polls',
      icon: BarChart,
      description: 'Vote on hot topics',
      color: 'text-purple-400'
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      description: 'Join community events',
      color: 'text-green-400'
    },
    {
      id: 'leaderboard',
      label: 'Leaderboards',
      icon: Trophy,
      description: 'Community champions',
      color: 'text-golden-yellow'
    },
    {
      id: 'map',
      label: 'Music Map',
      icon: MapPin,
      description: 'Global music activity',
      color: 'text-blue-400'
    }
  ];

  return (
    <>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Live Stats Banner */}
        <Card className="bg-void-black/40 border-fire-red/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-400">Live Stats</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="flex items-center gap-1 justify-center">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-lg font-bold text-blue-400">{liveStats.onlineUsers}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Online</div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="flex items-center gap-1 justify-center">
                      <BarChart className="w-4 h-4 text-purple-400" />
                      <span className="text-lg font-bold text-purple-400">{liveStats.activePolls}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Active Polls</div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="flex items-center gap-1 justify-center">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="text-lg font-bold text-green-400">{liveStats.upcomingEvents}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Events</div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="flex items-center gap-1 justify-center">
                      <Camera className="w-4 h-4 text-pink-400" />
                      <span className="text-lg font-bold text-pink-400">{liveStats.newPhotos}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">New Photos</div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="flex items-center gap-1 justify-center">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-lg font-bold text-red-400">{liveStats.totalReactions}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Reactions</div>
                  </motion.div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {userId && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(true)}
                      className="relative"
                      data-testid="notifications-button"
                    >
                      <Bell className="w-4 h-4" />
                      {hasNewNotifications && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-fire-red rounded-full animate-pulse"></div>
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUserId(userId);
                        setShowProfile(true);
                      }}
                      data-testid="profile-button"
                    >
                      <User className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Social Hub */}
        <Card className="bg-void-black/40 border-fire-red/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="gradient-text-neon flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Social Hub
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 mb-6">
                {tabConfigs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="relative group"
                      data-testid={`tab-${tab.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${tab.color}`} />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </div>
                      
                      {/* Live indicators */}
                      {tab.id === 'feed' && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-2 h-2 bg-fire-red rounded-full"
                        />
                      )}
                      
                      {tab.id === 'polls' && liveStats.activePolls > 0 && (
                        <Badge
                          variant="fire"
                          size="sm"
                          className="absolute -top-2 -right-2 w-4 h-4 text-xs flex items-center justify-center p-0"
                        >
                          {liveStats.activePolls}
                        </Badge>
                      )}
                      
                      {tab.id === 'events' && liveStats.upcomingEvents > 0 && (
                        <Badge
                          variant="fire"
                          size="sm"
                          className="absolute -top-2 -right-2 w-4 h-4 text-xs flex items-center justify-center p-0"
                        >
                          {liveStats.upcomingEvents}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="feed" className="mt-0">
                    <ActivityFeed userId={userId} />
                  </TabsContent>

                  <TabsContent value="polls" className="mt-0">
                    <InteractivePolls featured={false} />
                  </TabsContent>

                  <TabsContent value="events" className="mt-0">
                    <div className="space-y-4">
                      <div className="text-center p-8">
                        <Calendar className="w-12 h-12 mx-auto text-electric-yellow mb-4" />
                        <h3 className="text-lg font-semibold text-fire-red mb-2">
                          Community Events Coming Soon
                        </h3>
                        <p className="text-muted-foreground">
                          Check out the dedicated Event Discovery section for AI-powered concert recommendations!
                        </p>
                        <Button 
                          className="mt-4 bg-fire-red/20 border-fire-red/50 text-fire-red hover:bg-fire-red/30"
                          onClick={() => setActiveTab('feed')}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Explore Event Discovery
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="leaderboard" className="mt-0">
                    <GameficationDashboard userId={userId} />
                  </TabsContent>

                  <TabsContent value="map" className="mt-0">
                    <InteractiveMap showFilters={true} />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-void-black/40 border-fire-red/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-fire-red">Quick Actions</h3>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-testid="create-poll"
                >
                  <BarChart className="w-4 h-4" />
                  Create Poll
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-testid="create-event"
                >
                  <Calendar className="w-4 h-4" />
                  Create Event
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-testid="upload-photo"
                >
                  <Camera className="w-4 h-4" />
                  Upload Photo
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-fire-red to-electric-yellow text-void-black"
                  data-testid="write-review"
                >
                  <Star className="w-4 h-4" />
                  Write Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && selectedUserId && (
          <UserProfile
            userId={selectedUserId}
            isOwnProfile={selectedUserId === userId}
            onClose={() => setShowProfile(false)}
          />
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationCenter
            onClose={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}