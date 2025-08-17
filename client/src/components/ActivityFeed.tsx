import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReactionButton } from './ReactionButton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Heart, 
  Star, 
  Camera, 
  Music, 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userReputation: number;
  activityType: 'review_posted' | 'photo_uploaded' | 'band_followed' | 'achievement_earned' | 'event_created' | 'poll_created';
  title: string;
  description: string;
  targetType?: 'band' | 'review' | 'photo' | 'user' | 'event' | 'poll';
  targetId?: string;
  targetName?: string;
  metadata?: {
    bandName?: string;
    rating?: number;
    photoUrl?: string;
    achievementIcon?: string;
    eventDate?: string;
    pollOptions?: string[];
    location?: string;
  };
  reactions?: Record<string, number>;
  userReaction?: string;
  commentsCount: number;
  isPublic: boolean;
  createdAt: string;
}

interface LiveUpdate {
  type: 'new_activity' | 'reaction_added' | 'comment_added';
  data: any;
}

const activityIcons = {
  review_posted: MessageCircle,
  photo_uploaded: Camera,
  band_followed: Music,
  achievement_earned: Star,
  event_created: Calendar,
  poll_created: TrendingUp,
};

const activityColors = {
  review_posted: 'text-blue-400',
  photo_uploaded: 'text-purple-400',
  band_followed: 'text-green-400',
  achievement_earned: 'text-yellow-400',
  event_created: 'text-orange-400',
  poll_created: 'text-red-400',
};

export function ActivityFeed({ userId }: { userId?: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  useEffect(() => {
    loadActivities();
    
    // Set up real-time updates
    const eventSource = new EventSource('/api/activity-feed/live');
    
    eventSource.onmessage = (event) => {
      const liveUpdate: LiveUpdate = JSON.parse(event.data);
      handleLiveUpdate(liveUpdate);
    };

    eventSource.onerror = (error) => {
      console.error('Activity feed SSE error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [userId, filter]);

  const loadActivities = async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (filter !== 'all') params.append('filter', filter);
      
      const response = await fetch(`/api/activity-feed?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
        setLastUpdateTime(new Date());
      }
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLiveUpdate = (update: LiveUpdate) => {
    switch (update.type) {
      case 'new_activity':
        setActivities(prev => [update.data, ...prev.slice(0, 49)]); // Keep latest 50
        setHasNewUpdates(true);
        break;
      case 'reaction_added':
        setActivities(prev => prev.map(activity => 
          activity.id === update.data.activityId 
            ? { ...activity, reactions: update.data.reactions }
            : activity
        ));
        break;
      case 'comment_added':
        setActivities(prev => prev.map(activity => 
          activity.id === update.data.activityId 
            ? { ...activity, commentsCount: activity.commentsCount + 1 }
            : activity
        ));
        break;
    }
  };

  const handleReaction = async (reactionType: string, activityId: string) => {
    try {
      const response = await fetch(`/api/activity-feed/${activityId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType })
      });

      if (!response.ok) {
        throw new Error('Failed to react');
      }
    } catch (error) {
      console.error('Error reacting to activity:', error);
      throw error;
    }
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.targetType && activity.targetId) {
      // Navigate to the target item
      const routes: Record<string, string> = {
        band: `/bands/${activity.targetId}`,
        review: `/reviews/${activity.targetId}`,
        photo: `/photos/${activity.targetId}`,
        user: `/users/${activity.targetId}`,
        event: `/events/${activity.targetId}`,
        poll: `/polls/${activity.targetId}`,
      };
      
      const route = routes[activity.targetType];
      if (route) {
        window.location.href = route;
      }
    }
  };

  const refreshFeed = () => {
    setHasNewUpdates(false);
    loadActivities();
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
          <p className="text-center mt-4 text-muted-foreground">Loading activity feed...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-void-black/40 border-fire-red/20 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="gradient-text-neon flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Live Activity Feed
          </CardTitle>
          
          {hasNewUpdates && (
            <Button
              variant="outline"
              size="sm"
              onClick={refreshFeed}
              className="bg-gradient-to-r from-fire-red/20 to-electric-yellow/20 border-fire-red/40 animate-pulse"
              data-testid="refresh-feed"
            >
              New Updates Available
            </Button>
          )}
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
          <TabsList>
            <TabsTrigger value="all" data-testid="filter-all">All Activity</TabsTrigger>
            <TabsTrigger value="following" data-testid="filter-following">Following</TabsTrigger>
            <TabsTrigger value="trending" data-testid="filter-trending">Trending</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-96">
          <AnimatePresence mode="popLayout">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                <p className="text-muted-foreground">
                  {filter === 'following' 
                    ? "Follow some users to see their activity here" 
                    : "Be the first to create some activity!"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const Icon = activityIcons[activity.activityType];
                  const iconColor = activityColors[activity.activityType];
                  
                  return (
                    <motion.div
                      key={activity.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <Card className="bg-void-black/20 border-fire-red/10 hover:border-fire-red/20 transition-all cursor-pointer">
                        <CardContent className="p-4" onClick={() => handleActivityClick(activity)}>
                          <div className="flex items-start gap-3">
                            {/* User Avatar */}
                            <div className="relative flex-shrink-0">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={activity.userAvatar} />
                                <AvatarFallback>
                                  {activity.userName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              {/* Activity type indicator */}
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-void-black border-2 border-fire-red/20 flex items-center justify-center">
                                <Icon className={`w-3 h-3 ${iconColor}`} />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Header */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-sm hover:text-fire-red cursor-pointer">
                                  {activity.userName}
                                </span>
                                
                                {activity.userReputation >= 1000 && (
                                  <Badge variant="outline" size="sm">
                                    <Star className="w-3 h-3 mr-1" />
                                    {activity.userReputation}
                                  </Badge>
                                )}
                                
                                <span className="text-xs text-muted-foreground">
                                  {new Date(activity.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Activity Content */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm group-hover:text-fire-red transition-colors">
                                  {activity.title}
                                </h4>
                                
                                {activity.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {activity.description}
                                  </p>
                                )}

                                {/* Metadata Display */}
                                {activity.metadata && (
                                  <div className="space-y-2">
                                    {activity.metadata.photoUrl && (
                                      <div className="w-full max-w-xs">
                                        <img 
                                          src={activity.metadata.photoUrl} 
                                          alt="Activity photo"
                                          className="w-full rounded-lg border border-fire-red/20"
                                        />
                                      </div>
                                    )}
                                    
                                    {activity.metadata.rating && (
                                      <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }, (_, i) => (
                                          <Star 
                                            key={i} 
                                            className={`w-4 h-4 ${i < activity.metadata!.rating! ? 'text-electric-yellow fill-current' : 'text-muted-foreground'}`}
                                          />
                                        ))}
                                        <span className="text-sm font-medium ml-1">
                                          {activity.metadata.rating}/5
                                        </span>
                                      </div>
                                    )}
                                    
                                    {activity.metadata.bandName && (
                                      <Badge variant="outline" className="w-fit">
                                        <Music className="w-3 h-3 mr-1" />
                                        {activity.metadata.bandName}
                                      </Badge>
                                    )}
                                    
                                    {activity.metadata.eventDate && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(activity.metadata.eventDate).toLocaleDateString()}
                                      </div>
                                    )}
                                    
                                    {activity.metadata.location && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        {activity.metadata.location}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Action Bar */}
                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-fire-red/10">
                                <div className="flex items-center gap-3">
                                  <ReactionButton
                                    targetId={activity.id}
                                    targetType="review" // Generic for activity items
                                    initialReactions={activity.reactions}
                                    userReaction={activity.userReaction}
                                    onReact={handleReaction}
                                    size="sm"
                                  />
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-fire-red"
                                    data-testid={`comment-button-${activity.id}`}
                                  >
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    {activity.commentsCount}
                                  </Button>
                                </div>
                                
                                {activity.targetType && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    data-testid={`view-details-${activity.id}`}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
        
        {activities.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={loadActivities}
              data-testid="load-more-activities"
            >
              Load More Activities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}