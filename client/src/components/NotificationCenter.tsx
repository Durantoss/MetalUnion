import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Settings, Users, Heart, MessageCircle, Award, Star, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'follow' | 'like' | 'reply' | 'mention' | 'achievement' | 'event';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  metadata?: any;
  createdAt: string;
}

interface NotificationSettings {
  follows: boolean;
  likes: boolean;
  replies: boolean;
  mentions: boolean;
  achievements: boolean;
  events: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const notificationIcons = {
  follow: Users,
  like: Heart,
  reply: MessageCircle,
  mention: MessageCircle,
  achievement: Award,
  event: Star,
};

const notificationColors = {
  follow: 'text-blue-400',
  like: 'text-red-400',
  reply: 'text-green-400',
  mention: 'text-yellow-400',
  achievement: 'text-purple-400',
  event: 'text-orange-400',
};

export function NotificationCenter({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    follows: true,
    likes: true,
    replies: true,
    mentions: true,
    achievements: true,
    events: true,
    emailNotifications: false,
    pushNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
    loadSettings();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/notification-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const updateSettings = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      const response = await fetch('/api/user/notification-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      
      if (!response.ok) {
        // Revert on error
        setSettings(settings);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      // Revert on error
      setSettings(settings);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Navigate to the action URL
      window.location.href = notification.actionUrl;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.isRead) return false;
    if (activeTab !== 'all' && n.type !== activeTab) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
            <p className="text-center mt-4 text-muted-foreground">Loading notifications...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-void-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh]"
      >
        <Card className="bg-void-black/95 border-fire-red/20 backdrop-blur-sm h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-6 h-6 text-fire-red" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="fire"
                      className="absolute -top-2 -right-2 w-5 h-5 text-xs flex items-center justify-center p-0"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </div>
                <CardTitle className="gradient-text-neon">Notifications</CardTitle>
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    data-testid="mark-all-read"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  data-testid="close-notifications"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                data-testid="filter-all"
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
                data-testid="filter-unread"
              >
                Unread ({unreadCount})
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mx-6 mb-4">
                <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                <TabsTrigger value="follow" data-testid="tab-follow">Social</TabsTrigger>
                <TabsTrigger value="like" data-testid="tab-engagement">Activity</TabsTrigger>
                <TabsTrigger value="settings" data-testid="tab-settings">
                  <Settings className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <ScrollArea className="h-96 px-6">
                  <AnimatePresence>
                    {filteredNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                        <p className="text-muted-foreground">
                          {filter === 'unread' ? "You're all caught up!" : "You'll see notifications here when you get them."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredNotifications.map((notification, index) => {
                          const Icon = notificationIcons[notification.type];
                          const iconColor = notificationColors[notification.type];
                          
                          return (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              className={`
                                relative p-4 rounded-lg border transition-all cursor-pointer group
                                ${notification.isRead 
                                  ? 'bg-void-black/20 border-fire-red/10' 
                                  : 'bg-gradient-to-r from-fire-red/10 to-electric-yellow/10 border-fire-red/20'
                                }
                                hover:bg-fire-red/5 hover:border-fire-red/30
                              `}
                              onClick={() => handleNotificationClick(notification)}
                              data-testid={`notification-${notification.id}`}
                            >
                              {!notification.isRead && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-fire-red rounded-full animate-pulse"></div>
                              )}
                              
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  {notification.fromUserAvatar ? (
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={notification.fromUserAvatar} />
                                      <AvatarFallback>{notification.fromUserName?.slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-fire-red/20 to-electric-yellow/20 flex items-center justify-center`}>
                                      <Icon className={`w-4 h-4 ${iconColor}`} />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      data-testid={`delete-notification-${notification.id}`}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="follow" className="mt-0">
                <ScrollArea className="h-96 px-6">
                  <div className="space-y-2">
                    {filteredNotifications.filter(n => n.type === 'follow').map((notification) => (
                      <div key={notification.id} className="p-4 rounded-lg bg-void-black/20 border border-fire-red/10">
                        {/* Similar notification layout but filtered */}
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-blue-400" />
                          <div>
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="like" className="mt-0">
                <ScrollArea className="h-96 px-6">
                  <div className="space-y-2">
                    {filteredNotifications.filter(n => ['like', 'reply'].includes(n.type)).map((notification) => (
                      <div key={notification.id} className="p-4 rounded-lg bg-void-black/20 border border-fire-red/10">
                        <div className="flex items-center gap-3">
                          {notification.type === 'like' ? (
                            <Heart className="w-4 h-4 text-red-400" />
                          ) : (
                            <MessageCircle className="w-4 h-4 text-green-400" />
                          )}
                          <div>
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="px-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4">Notification Types</h3>
                      <div className="space-y-4">
                        {Object.entries(settings).slice(0, 6).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <label className="font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </label>
                              <p className="text-sm text-muted-foreground">
                                Get notified about {key.toLowerCase()}
                              </p>
                            </div>
                            <Switch
                              checked={value}
                              onCheckedChange={(checked) => updateSettings(key as keyof NotificationSettings, checked)}
                              data-testid={`setting-${key}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Delivery Methods</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium">Email Notifications</label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications via email
                            </p>
                          </div>
                          <Switch
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) => updateSettings('emailNotifications', checked)}
                            data-testid="setting-email"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium">Push Notifications</label>
                            <p className="text-sm text-muted-foreground">
                              Receive push notifications in your browser
                            </p>
                          </div>
                          <Switch
                            checked={settings.pushNotifications}
                            onCheckedChange={(checked) => updateSettings('pushNotifications', checked)}
                            data-testid="setting-push"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}