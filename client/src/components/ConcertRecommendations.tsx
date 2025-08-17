import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Calendar, Star, Zap, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ConcertRecommendation {
  band: {
    id: string;
    name: string;
    genre: string;
    description: string;
    imageUrl?: string;
  };
  tour?: {
    id: string;
    venue: string;
    city: string;
    country: string;
    date: string;
    ticketUrl?: string;
  };
  matchScore: number;
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedInterest: number;
}

interface UserPreferences {
  favoriteGenres: string[];
  location?: {
    city: string;
    country: string;
    radius: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  travelWillingness: 'local' | 'regional' | 'national' | 'international';
  concertFrequency: 'weekly' | 'monthly' | 'occasionally' | 'rarely';
}

interface ConcertRecommendationsProps {
  onClose?: () => void;
}

export function ConcertRecommendations({ onClose }: ConcertRecommendationsProps) {
  const { isAuthenticated } = useAuth();
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteGenres: ['Metal', 'Rock'],
    travelWillingness: 'regional',
    concertFrequency: 'monthly'
  });

  // Get user preferences
  const { data: userPreferences } = useQuery({
    queryKey: ['/api/recommendations/user-preferences'],
    enabled: isAuthenticated,
  });

  // Get concert recommendations
  const { data: recommendationsData, isLoading: loadingRecommendations, refetch } = useQuery({
    queryKey: ['/api/recommendations/concerts'],
    queryFn: () => apiRequest('/api/recommendations/concerts', {
      method: 'POST',
      body: JSON.stringify({
        preferences,
        maxRecommendations: 8,
        timeframe: 'quarter'
      }),
    }),
    enabled: isAuthenticated,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (newPreferences: UserPreferences) =>
      apiRequest('/api/recommendations/user-preferences', {
        method: 'PUT',
        body: JSON.stringify(newPreferences),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations/user-preferences'] });
      refetch();
    },
  });

  useEffect(() => {
    if (userPreferences && typeof userPreferences === 'object') {
      const prefs = userPreferences as UserPreferences;
      setPreferences({
        ...prefs,
        favoriteGenres: prefs.favoriteGenres || ['Metal', 'Rock'],
        travelWillingness: prefs.travelWillingness || 'regional',
        concertFrequency: prefs.concertFrequency || 'monthly'
      });
    }
  }, [userPreferences]);

  const recommendations: ConcertRecommendation[] = recommendationsData?.recommendations || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const handleUpdatePreferences = () => {
    updatePreferencesMutation.mutate(preferences);
    setShowPreferences(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Concert Recommendations</h3>
        <p className="text-gray-400 mb-4">Login to get personalized concert recommendations based on your music taste</p>
        <Button onClick={onClose} variant="outline">Close</Button>
      </div>
    );
  }

  if (showPreferences) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Concert Preferences</h3>
          <Button onClick={() => setShowPreferences(false)} variant="outline" size="sm">
            Back
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Favorite Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {['Metal', 'Rock', 'Hard Rock', 'Punk', 'Alternative', 'Grunge', 'Progressive'].map(genre => (
                <Badge
                  key={genre}
                  variant={preferences.favoriteGenres.includes(genre) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    const newGenres = preferences.favoriteGenres.includes(genre)
                      ? preferences.favoriteGenres.filter(g => g !== genre)
                      : [...preferences.favoriteGenres, genre];
                    setPreferences({...preferences, favoriteGenres: newGenres});
                  }}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Travel Willingness
            </label>
            <select
              value={preferences.travelWillingness}
              onChange={(e) => setPreferences({
                ...preferences, 
                travelWillingness: e.target.value as any
              })}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            >
              <option value="local">Local only (same city)</option>
              <option value="regional">Regional (within 200km)</option>
              <option value="national">National (same country)</option>
              <option value="international">International</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Concert Frequency
            </label>
            <select
              value={preferences.concertFrequency}
              onChange={(e) => setPreferences({
                ...preferences, 
                concertFrequency: e.target.value as any
              })}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="occasionally">Occasionally</option>
              <option value="rarely">Rarely</option>
            </select>
          </div>

          <Button 
            onClick={handleUpdatePreferences}
            disabled={updatePreferencesMutation.isPending}
            className="w-full"
          >
            {updatePreferencesMutation.isPending ? 'Updating...' : 'Update Preferences'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">AI Concert Recommendations</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowPreferences(true)} 
            variant="outline" 
            size="sm"
          >
            <Settings className="h-4 w-4 mr-1" />
            Preferences
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          )}
        </div>
      </div>

      {loadingRecommendations ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No concert recommendations available right now</p>
          <p className="text-sm text-gray-500">Try updating your preferences or check back later</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <Card key={`${rec.band.id}-${index}`} className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {rec.band.imageUrl && (
                      <img 
                        src={rec.band.imageUrl}
                        alt={rec.band.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <CardTitle className="text-white text-lg">{rec.band.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {rec.band.genre}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(rec.priority)}`}></div>
                    <span className={`text-sm font-mono ${getScoreColor(rec.matchScore)}`}>
                      {rec.matchScore}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-300 text-sm">{rec.band.description}</p>
                
                {rec.tour && (
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {rec.tour.venue}, {rec.tour.city}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(rec.tour.date).toLocaleDateString()}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">Why this recommendation:</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {rec.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Interest Level:</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.round(rec.estimatedInterest / 20) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {rec.tour?.ticketUrl && (
                    <Button 
                      size="sm" 
                      onClick={() => window.open(rec.tour?.ticketUrl, '_blank')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Get Tickets
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}