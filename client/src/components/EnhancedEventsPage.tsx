import { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Star, 
  Calendar,
  Music,
  Ticket,
  Search,
  Sparkles,
  TrendingUp
} from 'lucide-react';

// Simplified auth hook for demo
const useAuth = () => ({ user: null, isAuthenticated: false });

interface EventDiscoveryRequest {
  userLocation?: string;
  preferredGenres?: string[];
  favoriteArtists?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  radius?: number;
}

interface DiscoveredEvent {
  id: string;
  title: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  price: {
    min: number;
    max: number;
    currency: string;
  };
  ticketUrl: string;
  description: string;
  genre: string;
  imageUrl?: string;
  relevanceScore: number;
  aiRecommendationReason: string;
}

export function EnhancedEventsPage() {
  const { user, isAuthenticated } = useAuth();
  
  const [searchParams, setSearchParams] = useState<EventDiscoveryRequest>({
    userLocation: '',
    preferredGenres: ['metal', 'rock', 'hardcore'],
    favoriteArtists: [],
    priceRange: { min: 20, max: 200 },
    radius: 50
  });
  
  const [selectedEvent, setSelectedEvent] = useState<DiscoveredEvent | null>(null);
  const [events, setEvents] = useState<DiscoveredEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchParams.userLocation) {
      setError('Please enter a location to search for events');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/events/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error('Failed to discover events');
      }

      const discoveredEvents = await response.json();
      setEvents(discoveredEvents);
    } catch (err) {
      console.error('Error discovering events:', err);
      setError('Unable to discover events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: { min: number; max: number; currency: string }) => {
    if (price.min === price.max) {
      return `$${price.min}`;
    }
    return `$${price.min} - $${price.max}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const EventCard = ({ event }: { event: DiscoveredEvent }) => (
    <div style={{
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      border: '1px solid rgba(153, 27, 27, 0.5)',
      borderRadius: '12px',
      padding: '1.5rem',
      backdropFilter: 'blur(4px)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.5)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(153, 27, 27, 0.5)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              color: '#facc15',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              {event.title}
            </h3>
            <p style={{
              color: '#f87171',
              fontWeight: '600',
              fontSize: '1.125rem',
              marginBottom: '0.5rem'
            }}>
              {event.artist}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem'
              }}>
                {event.genre}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', color: '#facc15' }}>
                <Star style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                  {(event.relevanceScore * 100).toFixed(0)}% match
                </span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#4ade80'
            }}>
              {formatPrice(event.price)}
            </p>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#d1d5db' }}>
            <Calendar style={{ width: '16px', height: '16px', marginRight: '8px', color: '#facc15' }} />
            {formatDate(event.date)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#d1d5db' }}>
            <Clock style={{ width: '16px', height: '16px', marginRight: '8px', color: '#facc15' }} />
            {event.time}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#d1d5db', gridColumn: 'span 2' }}>
            <MapPin style={{ width: '16px', height: '16px', marginRight: '8px', color: '#ef4444' }} />
            {event.venue}, {event.location.city}, {event.location.state}
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '8px',
        padding: '12px',
        border: '1px solid rgba(153, 27, 27, 0.3)',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
          <Sparkles style={{ width: '16px', height: '16px', color: '#facc15', marginTop: '4px', flexShrink: 0 }} />
          <p style={{
            color: '#d1d5db',
            fontSize: '0.875rem',
            fontStyle: 'italic'
          }}>
            {event.aiRecommendationReason}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setSelectedEvent(event)}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(234, 179, 8, 0.5)',
            color: '#facc15',
            borderRadius: '6px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          data-testid={`button-details-${event.id}`}
        >
          <Music style={{ width: '16px', height: '16px' }} />
          View Details
        </button>
        <button
          onClick={() => window.open(event.ticketUrl, '_blank')}
          style={{
            flex: 1,
            padding: '12px',
            background: 'linear-gradient(to right, #dc2626, #eab308)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, #b91c1c, #d97706)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, #dc2626, #eab308)';
          }}
          data-testid={`button-tickets-${event.id}`}
        >
          <Ticket style={{ width: '16px', height: '16px' }} />
          Get Tickets
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #111827, #000000, #111827)',
      color: 'white',
      padding: '1rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '900',
            background: 'linear-gradient(to right, #facc15, #dc2626)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            fontFamily: 'monospace'
          }}>
            EVENT DISCOVERY
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#d1d5db'
          }}>
            AI-powered event discovery with intelligent ticket recommendations
          </p>
        </div>

        {/* Search Controls */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(153, 27, 27, 0.5)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#facc15', marginBottom: '0.5rem' }}>
                Location
              </label>
              <input
                type="text"
                placeholder="Enter city or zip code"
                value={searchParams.userLocation}
                onChange={(e) => setSearchParams(prev => ({ ...prev, userLocation: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(153, 27, 27, 0.5)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
                data-testid="input-location"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#facc15', marginBottom: '0.5rem' }}>
                Max Price
              </label>
              <input
                type="number"
                placeholder="200"
                value={searchParams.priceRange?.max}
                onChange={(e) => setSearchParams(prev => ({ 
                  ...prev, 
                  priceRange: { ...prev.priceRange!, max: Number(e.target.value) }
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(153, 27, 27, 0.5)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
                data-testid="input-max-price"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#facc15', marginBottom: '0.5rem' }}>
                Radius (miles)
              </label>
              <input
                type="number"
                placeholder="50"
                value={searchParams.radius}
                onChange={(e) => setSearchParams(prev => ({ ...prev, radius: Number(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(153, 27, 27, 0.5)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
                data-testid="input-radius"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <button
                onClick={handleSearch}
                disabled={isLoading || !searchParams.userLocation}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(to right, #dc2626, #eab308)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: isLoading || !searchParams.userLocation ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !searchParams.userLocation ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                data-testid="button-search-events"
              >
                <Search style={{ width: '16px', height: '16px' }} />
                {isLoading ? 'Discovering...' : 'Discover Events'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '2px solid rgba(234, 179, 8, 0.2)',
                borderTop: '2px solid #facc15',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ fontSize: '1.25rem', color: '#facc15' }}>
                Searching SeatGeek, Ticketmaster & Bandsintown...
              </span>
            </div>
          </div>
        )}

        {/* Demo Events Notice */}
        {!isLoading && events.length > 0 && events[0].id.startsWith('demo-') && (
          <div style={{
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'start',
            gap: '12px'
          }}>
            <div style={{
              color: '#facc15',
              fontSize: '1.5rem',
              flexShrink: 0,
              marginTop: '4px'
            }}>
              ℹ️
            </div>
            <div>
              <h3 style={{ color: '#facc15', marginBottom: '8px', fontSize: '1rem', fontWeight: 'bold' }}>
                Demo Mode Active
              </h3>
              <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.4', marginBottom: '8px' }}>
                Currently showing sample events. Once API keys for SeatGeek, Ticketmaster, and Bandsintown are configured, 
                you'll see real concert and event data from all major ticketing platforms.
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                The system is ready and will automatically search multiple platforms for the best metal, rock, and hardcore events in your area.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <p style={{ color: '#f87171' }}>{error}</p>
          </div>
        )}

        {/* Event Results */}
        {events.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#facc15'
              }}>
                Found {events.length} Events
              </h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '1.5rem'
            }}>
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* No events message */}
        {!isLoading && !error && events.length === 0 && searchParams.userLocation && (
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(153, 27, 27, 0.3)',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <Music style={{ width: '64px', height: '64px', color: '#6b7280', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
              No Events Found
            </h3>
            <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
              Try expanding your search radius or adjusting your price range.
            </p>
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 50
          }}>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(153, 27, 27, 0.5)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '1000px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{
                borderBottom: '1px solid rgba(153, 27, 27, 0.3)',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ fontSize: '1.875rem', color: '#facc15', marginBottom: '0.5rem' }}>
                      {selectedEvent.title}
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: '#f87171', fontWeight: '600' }}>
                      {selectedEvent.artist}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    style={{
                      color: '#9ca3af',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      padding: '0.5rem'
                    }}
                    data-testid="button-close-modal"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#facc15', marginBottom: '1rem' }}>
                      Event Details
                    </h3>
                    <div style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <Calendar style={{ width: '20px', height: '20px', color: '#facc15' }} />
                        <span>{formatDate(selectedEvent.date)} at {selectedEvent.time}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <MapPin style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                        <div>
                          <p style={{ fontWeight: '500' }}>{selectedEvent.venue}</p>
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{selectedEvent.location.address}</p>
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{selectedEvent.location.city}, {selectedEvent.location.state}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <DollarSign style={{ width: '20px', height: '20px', color: '#4ade80' }} />
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4ade80' }}>
                          {formatPrice(selectedEvent.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#facc15', marginBottom: '1rem' }}>
                      AI Recommendation
                    </h3>
                    <div style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '8px',
                      padding: '1rem',
                      border: '1px solid rgba(153, 27, 27, 0.3)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                        <Sparkles style={{ width: '20px', height: '20px', color: '#facc15', marginTop: '4px' }} />
                        <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                          {selectedEvent.aiRecommendationReason}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => window.open(selectedEvent.ticketUrl, '_blank')}
                    style={{
                      flex: 1,
                      padding: '1rem 1.5rem',
                      background: 'linear-gradient(to right, #dc2626, #eab308)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s ease'
                    }}
                    data-testid="button-buy-tickets-modal"
                  >
                    <ExternalLink style={{ width: '20px', height: '20px' }} />
                    Buy Tickets Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}