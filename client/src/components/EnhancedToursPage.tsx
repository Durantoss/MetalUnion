import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Clock, 
  DollarSign, 
  Search, 
  Filter, 
  Star, 
  Music, 
  Sparkles,
  Bot,
  Globe,
  Ticket
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Tour {
  id: string;
  bandId: string;
  bandName: string;
  bandImageUrl?: string;
  bandGenres?: string[];
  tourName: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  ticketUrl?: string;
  ticketmasterUrl?: string;
  price?: string;
  status: string;
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
  platform?: 'seatgeek' | 'ticketmaster' | 'bandsintown' | 'google' | 'database';
}

interface SearchFilters {
  location: string;
  genres: string[];
  artists: string[];
  priceMin: number;
  priceMax: number;
  dateStart: string;
  dateEnd: string;
  radius: number;
  query: string;
}

export function EnhancedToursPage() {
  const [activeTab, setActiveTab] = useState<'database' | 'discover'>('database');
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: '',
    genres: ['metal', 'rock', 'hardcore'],
    artists: [],
    priceMin: 0,
    priceMax: 500,
    dateStart: '',
    dateEnd: '',
    radius: 50,
    query: ''
  });

  // Fetch existing tours from database
  const { data: tours = [], isLoading: toursLoading, error: toursError } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
    queryFn: async () => {
      const response = await fetch('/api/tours', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tours');
      }
      return response.json();
    }
  });

  // AI-powered tour discovery
  const discoveryMutation = useMutation({
    mutationFn: async (filters: SearchFilters): Promise<DiscoveredEvent[]> => {
      const response = await fetch('/api/events/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userLocation: filters.location,
          preferredGenres: filters.genres,
          favoriteArtists: filters.artists,
          priceRange: {
            min: filters.priceMin,
            max: filters.priceMax
          },
          dateRange: filters.dateStart && filters.dateEnd ? {
            start: new Date(filters.dateStart),
            end: new Date(filters.dateEnd)
          } : undefined,
          radius: filters.radius,
          query: filters.query
        })
      });

      if (!response.ok) {
        throw new Error('Failed to discover events');
      }

      return response.json();
    }
  });

  // Enhanced tour discovery with Google + OpenAI
  const tourDiscoveryMutation = useMutation({
    mutationFn: async (filters: SearchFilters): Promise<DiscoveredEvent[]> => {
      const response = await fetch('/api/tours/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userLocation: filters.location,
          preferredGenres: filters.genres,
          favoriteArtists: filters.artists,
          priceRange: {
            min: filters.priceMin,
            max: filters.priceMax
          },
          dateRange: filters.dateStart && filters.dateEnd ? {
            start: new Date(filters.dateStart),
            end: new Date(filters.dateEnd)
          } : undefined,
          radius: filters.radius,
          query: filters.query
        })
      });

      if (!response.ok) {
        throw new Error('Failed to discover tours');
      }

      return response.json();
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: { min: number; max: number; currency: string } | string) => {
    if (typeof price === 'string') return price;
    return `$${price.min} - $${price.max}`;
  };

  const handleSearch = () => {
    discoveryMutation.mutate(searchFilters);
  };

  const handleSmartDiscovery = () => {
    tourDiscoveryMutation.mutate(searchFilters);
  };

  const popularGenres = ['metal', 'rock', 'hardcore', 'black metal', 'death metal', 'thrash metal', 'progressive metal', 'doom metal'];
  const popularArtists = ['Metallica', 'Iron Maiden', 'Black Sabbath', 'Slipknot', 'Tool', 'System of a Down', 'Rammstein', 'Ghost'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 p-4 pt-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent mb-4">
          🚌 TOURS & EVENTS
        </h1>
        <p className="text-gray-400 text-lg">
          Discover upcoming metal concerts with AI-powered search and real-time recommendations
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-black/40 border border-red-500/30 rounded-lg p-4 text-center">
            <Bot className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">AI Recommendations</h3>
          </div>
          <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-4 text-center">
            <Globe className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">Multi-Platform Search</h3>
          </div>
          <div className="bg-black/40 border border-blue-500/30 rounded-lg p-4 text-center">
            <MapPin className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">Location-Based</h3>
          </div>
          <div className="bg-black/40 border border-green-500/30 rounded-lg p-4 text-center">
            <Ticket className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">Real-Time Tickets</h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setActiveTab('database')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'database'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            data-testid="tab-database-tours"
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Confirmed Tours ({tours.length})
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'discover'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            data-testid="tab-discover-events"
          >
            <Sparkles className="h-4 w-4 inline mr-2" />
            Smart Discovery
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {activeTab === 'discover' && (
        <div className="max-w-6xl mx-auto mb-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Intelligent Event Discovery
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-600"
                  data-testid="button-toggle-filters"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Search */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search for bands, venues, or events..."
                  value={searchFilters.query}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  data-testid="input-event-search"
                />
                <Input
                  placeholder="Location (e.g., New York, NY)"
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white max-w-xs"
                  data-testid="input-location"
                />
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="space-y-4 pt-4 border-t border-gray-700">
                  {/* Genres */}
                  <div>
                    <Label className="text-white mb-2 block">Preferred Genres</Label>
                    <div className="flex flex-wrap gap-2">
                      {popularGenres.map((genre) => (
                        <Badge
                          key={genre}
                          variant={searchFilters.genres.includes(genre) ? 'default' : 'outline'}
                          className={`cursor-pointer ${
                            searchFilters.genres.includes(genre)
                              ? 'bg-red-600 text-white'
                              : 'border-gray-600 text-gray-300 hover:bg-red-600/20'
                          }`}
                          onClick={() => {
                            setSearchFilters(prev => ({
                              ...prev,
                              genres: prev.genres.includes(genre)
                                ? prev.genres.filter(g => g !== genre)
                                : [...prev.genres, genre]
                            }));
                          }}
                          data-testid={`badge-genre-${genre.replace(/\s+/g, '-')}`}
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white mb-2 block">Min Price ($)</Label>
                      <Input
                        type="number"
                        value={searchFilters.priceMin}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, priceMin: parseInt(e.target.value) || 0 }))}
                        className="bg-gray-800 border-gray-600 text-white"
                        min="0"
                        max="500"
                        data-testid="input-price-min"
                      />
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">Max Price ($)</Label>
                      <Input
                        type="number"
                        value={searchFilters.priceMax}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, priceMax: parseInt(e.target.value) || 500 }))}
                        className="bg-gray-800 border-gray-600 text-white"
                        min="0"
                        max="500"
                        data-testid="input-price-max"
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white mb-2 block">Start Date</Label>
                      <Input
                        type="date"
                        value={searchFilters.dateStart}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, dateStart: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white"
                        data-testid="input-date-start"
                      />
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">End Date</Label>
                      <Input
                        type="date"
                        value={searchFilters.dateEnd}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, dateEnd: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white"
                        data-testid="input-date-end"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Search Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleSearch}
                  disabled={discoveryMutation.isPending}
                  className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700"
                  data-testid="button-multi-platform-search"
                >
                  {discoveryMutation.isPending ? (
                    <>🔍 Searching...</>
                  ) : (
                    <>🌐 Multi-Platform Search</>
                  )}
                </Button>
                <Button 
                  onClick={handleSmartDiscovery}
                  disabled={tourDiscoveryMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  data-testid="button-ai-discovery"
                >
                  {tourDiscoveryMutation.isPending ? (
                    <>🤖 AI Analyzing...</>
                  ) : (
                    <>🤖 AI Smart Discovery</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Section */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'database' && (
          <>
            {toursLoading && (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading tours from database...</p>
              </div>
            )}

            {toursError && (
              <div className="text-center py-12">
                <p className="text-red-400">Error loading tours. Please try again later.</p>
              </div>
            )}

            {!toursLoading && !toursError && tours.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No upcoming tours found in database</p>
                <p className="text-sm text-gray-500">Try the Smart Discovery tab for more events</p>
              </div>
            )}

            {!toursLoading && !toursError && tours.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tours.map((tour) => (
                  <Card key={tour.id} className="bg-gray-900/50 border-gray-700 hover:border-red-500/50 transition-colors" data-testid={`card-tour-${tour.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-white mb-1" data-testid={`text-band-name-${tour.id}`}>
                            {tour.bandName}
                          </CardTitle>
                          <p className="text-red-400 font-semibold text-sm" data-testid={`text-tour-name-${tour.id}`}>
                            {tour.tourName}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-600">
                          Database
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-300">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">{tour.venue}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">{formatDate(tour.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="text-sm">{formatTime(tour.date)}</span>
                        </div>
                        {tour.price && (
                          <div className="flex items-center text-gray-300">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span className="text-sm">{tour.price}</span>
                          </div>
                        )}
                      </div>
                      
                      {tour.ticketUrl && (
                        <a 
                          href={tour.ticketUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center py-2 px-4 rounded-md transition-colors duration-200"
                          data-testid={`button-tickets-${tour.id}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get Tickets
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'discover' && (
          <>
            {/* Discovery Results */}
            {discoveryMutation.data && discoveryMutation.data.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Globe className="h-6 w-6 mr-2 text-blue-400" />
                  Multi-Platform Discovery ({discoveryMutation.data.length} events)
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {discoveryMutation.data.map((event) => (
                    <Card key={event.id} className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-colors" data-testid={`card-event-${event.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-white mb-1" data-testid={`text-artist-name-${event.id}`}>
                              {event.artist}
                            </CardTitle>
                            <p className="text-blue-400 font-semibold text-sm" data-testid={`text-event-title-${event.id}`}>
                              {event.title}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-600">
                              {event.platform || 'Multi-Platform'}
                            </Badge>
                            {event.relevanceScore && (
                              <div className="flex items-center text-xs text-yellow-400">
                                <Star className="h-3 w-3 mr-1" />
                                {(event.relevanceScore * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-300">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="text-sm">{event.venue}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm">{event.time}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span className="text-sm">{formatPrice(event.price)}</span>
                          </div>
                        </div>
                        
                        {event.aiRecommendationReason && (
                          <div className="bg-purple-900/20 border border-purple-700/50 rounded p-2">
                            <p className="text-xs text-purple-300">
                              <Bot className="h-3 w-3 inline mr-1" />
                              {event.aiRecommendationReason}
                            </p>
                          </div>
                        )}

                        <a 
                          href={event.ticketUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center py-2 px-4 rounded-md transition-colors duration-200"
                          data-testid={`button-tickets-event-${event.id}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get Tickets
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* AI Tour Discovery Results */}
            {tourDiscoveryMutation.data && tourDiscoveryMutation.data.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Bot className="h-6 w-6 mr-2 text-purple-400" />
                  AI Smart Discovery ({tourDiscoveryMutation.data.length} events)
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {tourDiscoveryMutation.data.map((event) => (
                    <Card key={event.id} className="bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-colors" data-testid={`card-ai-event-${event.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-white mb-1" data-testid={`text-ai-artist-name-${event.id}`}>
                              {event.artist}
                            </CardTitle>
                            <p className="text-purple-400 font-semibold text-sm" data-testid={`text-ai-event-title-${event.id}`}>
                              {event.title}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-600">
                              AI + Google
                            </Badge>
                            {event.relevanceScore && (
                              <div className="flex items-center text-xs text-yellow-400">
                                <Star className="h-3 w-3 mr-1" />
                                {(event.relevanceScore * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-300">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="text-sm">{event.venue}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm">{event.time}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span className="text-sm">{formatPrice(event.price)}</span>
                          </div>
                        </div>
                        
                        {event.aiRecommendationReason && (
                          <div className="bg-purple-900/20 border border-purple-700/50 rounded p-2">
                            <p className="text-xs text-purple-300">
                              <Sparkles className="h-3 w-3 inline mr-1" />
                              {event.aiRecommendationReason}
                            </p>
                          </div>
                        )}

                        <a 
                          href={event.ticketUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center py-2 px-4 rounded-md transition-colors duration-200"
                          data-testid={`button-tickets-ai-event-${event.id}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get Tickets
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Results State */}
            {!discoveryMutation.data && !tourDiscoveryMutation.data && !discoveryMutation.isPending && !tourDiscoveryMutation.isPending && (
              <div className="text-center py-12">
                <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Ready to discover amazing metal concerts?</h3>
                <p className="text-gray-400 mb-6">
                  Use our AI-powered search to find events tailored to your taste, or search across multiple platforms for the best deals.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">🤖 AI Smart Discovery: OpenAI + Google Custom Search</p>
                  <p className="text-sm text-gray-500">🌐 Multi-Platform: SeatGeek, Ticketmaster, Bandsintown</p>
                </div>
              </div>
            )}

            {/* Error States */}
            {discoveryMutation.error && (
              <div className="text-center py-8">
                <p className="text-red-400">Error during multi-platform search. Please try again.</p>
              </div>
            )}

            {tourDiscoveryMutation.error && (
              <div className="text-center py-8">
                <p className="text-red-400">Error during AI discovery. Please try again.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}