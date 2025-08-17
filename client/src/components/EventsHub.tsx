import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  Music,
  Video,
  UserPlus,
  ExternalLink,
  Filter,
  Plus,
  Sparkles,
  Trophy
} from 'lucide-react';

interface Event {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar?: string;
  title: string;
  description: string;
  eventType: 'meetup' | 'listening_party' | 'concert_group' | 'festival' | 'contest';
  location?: string;
  virtualLink?: string;
  dateTime: string;
  maxAttendees?: number;
  currentAttendees: number;
  isActive: boolean;
  tags: string[];
  userStatus?: 'attending' | 'interested' | 'declined' | null;
  attendees: Array<{
    userId: string;
    userName: string;
    userAvatar?: string;
    status: string;
  }>;
  createdAt: string;
}

const eventTypeIcons = {
  meetup: Users,
  listening_party: Music,
  concert_group: Star,
  festival: Sparkles,
  contest: Trophy,
};

const eventTypeColors = {
  meetup: 'text-blue-400',
  listening_party: 'text-purple-400',
  concert_group: 'text-green-400',
  festival: 'text-yellow-400',
  contest: 'text-red-400',
};

const eventTypeBadges = {
  meetup: 'Meetup',
  listening_party: 'Listening Party',
  concert_group: 'Concert Group',
  festival: 'Festival',
  contest: 'Contest',
};

export function EventsHub({ featured = false }: { featured?: boolean }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'attending' | 'upcoming'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadEvents();
  }, [featured, filter, typeFilter]);

  const loadEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (featured) params.append('featured', 'true');
      if (filter !== 'all') params.append('filter', filter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventAction = async (eventId: string, action: 'attending' | 'interested' | 'declined') => {
    try {
      const response = await fetch(`/api/events/${eventId}/attend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(prev => prev.map(event => 
          event.id === eventId ? updatedEvent : event
        ));
      }
    } catch (error) {
      console.error('Error updating event attendance:', error);
    }
  };

  const isEventUpcoming = (event: Event) => {
    return new Date(event.dateTime) > new Date();
  };

  const getTimeUntilEvent = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.dateTime);
    const diff = eventDate.getTime() - now.getTime();
    
    if (diff < 0) return 'Past event';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m`;
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
          <p className="text-center mt-4 text-muted-foreground">Loading events...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-void-black/40 border-fire-red/20 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="gradient-text-neon flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            {featured ? 'Upcoming Events' : 'Community Events'}
          </CardTitle>
          
          {!featured && (
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-fire-red/20 to-electric-yellow/20 border-fire-red/40"
              data-testid="create-event"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>

        {!featured && (
          <div className="space-y-3">
            <Tabs value={filter} onValueChange={setFilter as any}>
              <TabsList>
                <TabsTrigger value="all" data-testid="filter-all">All Events</TabsTrigger>
                <TabsTrigger value="attending" data-testid="filter-attending">Attending</TabsTrigger>
                <TabsTrigger value="upcoming" data-testid="filter-upcoming">Upcoming</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Filter className="w-4 h-4 text-fire-red" />
                Type:
              </div>
              {['all', ...Object.keys(eventTypeIcons)].map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                  className={`gap-2 ${typeFilter === type ? 'bg-gradient-to-r from-fire-red to-electric-yellow text-void-black' : ''}`}
                  data-testid={`type-filter-${type}`}
                >
                  {type !== 'all' && React.createElement(eventTypeIcons[type as keyof typeof eventTypeIcons], {
                    className: `w-3 h-3 ${typeFilter === type ? 'text-void-black' : eventTypeColors[type as keyof typeof eventTypeColors]}`
                  })}
                  {type === 'all' ? 'All' : eventTypeBadges[type as keyof typeof eventTypeBadges]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className={featured ? "h-64" : "h-96"}>
          <AnimatePresence>
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  {filter === 'attending' 
                    ? "You're not attending any events yet" 
                    : "Be the first to create a community event!"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => {
                  const Icon = eventTypeIcons[event.eventType];
                  const iconColor = eventTypeColors[event.eventType];
                  const isUpcoming = isEventUpcoming(event);
                  const timeUntil = getTimeUntilEvent(event);
                  const isFull = Boolean(event.maxAttendees && event.currentAttendees >= event.maxAttendees);
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`
                        relative overflow-hidden transition-all group cursor-pointer
                        ${!isUpcoming 
                          ? 'bg-void-black/10 border-fire-red/5 opacity-60' 
                          : 'bg-void-black/20 border-fire-red/10 hover:border-fire-red/20'
                        }
                        ${event.userStatus === 'attending' ? 'ring-1 ring-fire-red/30' : ''}
                      `}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Event type icon */}
                            <div className={`
                              w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
                              ${isUpcoming ? 'bg-gradient-to-r from-fire-red/20 to-electric-yellow/20' : 'bg-void-black/20'}
                            `}>
                              <Icon className={`w-6 h-6 ${iconColor}`} />
                            </div>

                            <div className="flex-1">
                              {/* Event header */}
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg group-hover:text-fire-red transition-colors">
                                      {event.title}
                                    </h3>
                                    <Badge variant="outline" className="capitalize">
                                      {eventTypeBadges[event.eventType]}
                                    </Badge>
                                    {!isUpcoming && (
                                      <Badge variant="outline" size="sm">Past</Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Avatar className="w-4 h-4">
                                        <AvatarImage src={event.organizerAvatar} />
                                        <AvatarFallback className="text-xs">
                                          {event.organizerName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>by {event.organizerName}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                
                                {isUpcoming && (
                                  <div className="text-right">
                                    <Badge variant={timeUntil.includes('d') ? 'outline' : 'fire'} size="sm">
                                      {timeUntil}
                                    </Badge>
                                  </div>
                                )}
                              </div>

                              {/* Event description */}
                              {event.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {event.description}
                                </p>
                              )}

                              {/* Event details */}
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span>{new Date(event.dateTime).toLocaleString()}</span>
                                </div>
                                
                                {event.location && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                
                                {event.virtualLink && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Video className="w-4 h-4 text-muted-foreground" />
                                    <span>Virtual event</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span>
                                    {event.currentAttendees} attending
                                    {event.maxAttendees && ` / ${event.maxAttendees} max`}
                                    {isFull && <Badge variant="destructive" size="sm" className="ml-2">Full</Badge>}
                                  </span>
                                </div>
                              </div>

                              {/* Tags */}
                              {event.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                  {event.tags.slice(0, 3).map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="outline" size="sm">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {event.tags.length > 3 && (
                                    <Badge variant="outline" size="sm">
                                      +{event.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Attendees preview */}
                              {event.attendees.length > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="flex -space-x-2">
                                    {event.attendees.slice(0, 5).map((attendee, attendeeIndex) => (
                                      <Avatar key={attendeeIndex} className="w-6 h-6 border-2 border-void-black">
                                        <AvatarImage src={attendee.userAvatar} />
                                        <AvatarFallback className="text-xs">
                                          {attendee.userName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>
                                  {event.attendees.length > 5 && (
                                    <span className="text-xs text-muted-foreground">
                                      and {event.attendees.length - 5} others
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Action buttons */}
                              {isUpcoming && event.isActive && (
                                <div className="flex items-center gap-2">
                                  {event.userStatus === 'attending' ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEventAction(event.id, 'declined');
                                      }}
                                      className="border-fire-red text-fire-red"
                                      data-testid={`leave-event-${event.id}`}
                                    >
                                      ✓ Attending
                                    </Button>
                                  ) : (
                                    <>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEventAction(event.id, 'attending');
                                        }}
                                        className="bg-gradient-to-r from-fire-red to-electric-yellow text-void-black"
                                        disabled={isFull}
                                        data-testid={`attend-event-${event.id}`}
                                      >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        {isFull ? 'Full' : 'Attend'}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEventAction(event.id, 'interested');
                                        }}
                                        data-testid={`interested-event-${event.id}`}
                                      >
                                        <Star className="w-4 h-4 mr-2" />
                                        Interested
                                      </Button>
                                    </>
                                  )}
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto"
                                    data-testid={`view-event-${event.id}`}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>

                        {/* Special effects for featured events */}
                        {event.eventType === 'festival' && (
                          <motion.div
                            animate={{ 
                              opacity: [0.3, 0.8, 0.3],
                              scale: [1, 1.1, 1] 
                            }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity, 
                              ease: "easeInOut" 
                            }}
                            className="absolute top-2 right-2"
                          >
                            <Sparkles className="w-5 h-5 text-golden-yellow" />
                          </motion.div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
        
        {!featured && events.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={loadEvents}
              data-testid="load-more-events"
            >
              Load More Events
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

