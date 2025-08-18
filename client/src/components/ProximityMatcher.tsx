import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  Zap, 
  Settings, 
  Eye, 
  EyeOff, 
  Music, 
  MessageCircle,
  Navigation,
  Wifi,
  WifiOff
} from 'lucide-react';

interface ProximityMatch {
  id: string;
  userId: string;
  stagename: string;
  distance: number;
  venueName?: string;
  eventName?: string;
  matchType: string;
  profileImageUrl?: string;
  favoriteGenres?: string[];
}

interface ProximitySettings {
  proximityEnabled: boolean;
  proximityRadius: number;
  shareLocationAtConcerts: boolean;
}

export function ProximityMatcher() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [settings, setSettings] = useState<ProximitySettings>({
    proximityEnabled: false,
    proximityRadius: 500,
    shareLocationAtConcerts: false
  });
  const [nearbyUsers, setNearbyUsers] = useState<ProximityMatch[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    venueName?: string;
    eventName?: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Mock data for demonstration
  const mockNearbyUsers: ProximityMatch[] = [
    {
      id: '1',
      userId: 'user1',
      stagename: 'MetalWarrior',
      distance: 45,
      venueName: 'The Forum',
      eventName: 'Metallica World Tour',
      matchType: 'concert',
      favoriteGenres: ['Thrash Metal', 'Heavy Metal']
    },
    {
      id: '2',
      userId: 'user2', 
      stagename: 'RiffMaster',
      distance: 120,
      venueName: 'The Forum',
      eventName: 'Metallica World Tour',
      matchType: 'concert',
      favoriteGenres: ['Progressive Metal', 'Death Metal']
    },
    {
      id: '3',
      userId: 'user3',
      stagename: 'BassSlayer',
      distance: 280,
      venueName: 'Local Metal Bar',
      eventName: null,
      matchType: 'venue',
      favoriteGenres: ['Black Metal', 'Doom Metal']
    }
  ];

  const toggleProximityMatching = () => {
    if (!isEnabled) {
      requestLocationPermission();
    } else {
      setIsEnabled(false);
      setIsLocationSharing(false);
      setCurrentLocation(null);
      setNearbyUsers([]);
    }
  };

  const requestLocationPermission = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ 
            latitude, 
            longitude,
            venueName: 'The Forum', // This would be detected via venue API
            eventName: 'Metallica World Tour' // This would be detected via event API
          });
          setIsEnabled(true);
          setIsLocationSharing(true);
          setNearbyUsers(mockNearbyUsers); // In real app, fetch from API
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
          // For demo, still enable with mock data
          setIsEnabled(true);
          setNearbyUsers(mockNearbyUsers);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setIsLoadingLocation(false);
      // For demo, still enable with mock data
      setIsEnabled(true);
      setNearbyUsers(mockNearbyUsers);
    }
  };

  const initiateChat = (userId: string, stagename: string) => {
    console.log(`Initiating chat with ${stagename} (${userId})`);
    // This would open the messaging interface with this user
    alert(`Opening chat with ${stagename}! This would connect to the messaging system.`);
  };

  const getDistanceColor = (distance: number) => {
    if (distance < 50) return 'text-green-400';
    if (distance < 200) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case 'concert': return <Music className="w-4 h-4" />;
      case 'venue': return <MapPin className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-black/60 border-red-900/30 backdrop-blur-lg">
      <div className="p-6">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600/20 rounded-lg border border-red-500/30">
              <Navigation className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Concert Proximity</h3>
              <p className="text-gray-400 text-sm">Connect with metalheads at your location</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              data-testid="button-proximity-settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleProximityMatching}
              disabled={isLoadingLocation}
              className={`
                relative inline-flex h-8 w-14 rounded-full transition-colors duration-200 ease-in-out
                ${isEnabled ? 'bg-red-600' : 'bg-gray-700'}
                ${isLoadingLocation ? 'opacity-50' : ''}
              `}
              data-testid="toggle-proximity-matching"
            >
              <span
                className={`
                  inline-block h-6 w-6 rounded-full bg-white transition-transform duration-200 ease-in-out
                  ${isEnabled ? 'translate-x-7' : 'translate-x-1'}
                  mt-1
                `}
              />
              {isLoadingLocation && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-black/40 rounded-lg border border-gray-700/50">
            <h4 className="text-lg font-semibold text-white mb-4">Proximity Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Share location at concerts</label>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, shareLocationAtConcerts: !prev.shareLocationAtConcerts }))}
                  className={`
                    relative inline-flex h-6 w-11 rounded-full transition-colors duration-200
                    ${settings.shareLocationAtConcerts ? 'bg-green-600' : 'bg-gray-600'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200
                      ${settings.shareLocationAtConcerts ? 'translate-x-6' : 'translate-x-1'}
                      mt-1
                    `}
                  />
                </button>
              </div>
              
              <div>
                <label className="text-gray-300 block mb-2">Search radius: {settings.proximityRadius}m</label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={settings.proximityRadius}
                  onChange={(e) => setSettings(prev => ({ ...prev, proximityRadius: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        )}

        {/* Status Display */}
        {isEnabled && (
          <div className="mb-6">
            <div className="flex items-center space-x-4 p-4 bg-red-600/10 rounded-lg border border-red-500/20">
              <div className="flex items-center space-x-2">
                {isLocationSharing ? (
                  <Wifi className="w-5 h-5 text-green-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium text-white">
                  {isLocationSharing ? 'Location Active' : 'Location Disabled'}
                </span>
              </div>
              
              {currentLocation && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-300">
                    {currentLocation.venueName || 'Unknown Venue'}
                  </span>
                </div>
              )}
              
              <Badge variant="outline" className="text-red-400 border-red-500/30">
                {nearbyUsers.length} nearby
              </Badge>
            </div>
          </div>
        )}

        {/* Nearby Users List */}
        {isEnabled && nearbyUsers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Metalheads Nearby</span>
            </h4>
            
            {nearbyUsers.map((user) => (
              <div 
                key={user.id}
                className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-700/30 hover:border-red-500/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user.stagename.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 className="font-semibold text-white">{user.stagename}</h5>
                      {getMatchTypeIcon(user.matchType)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className={getDistanceColor(user.distance)}>
                        {user.distance}m away
                      </span>
                      {user.venueName && (
                        <span>{user.venueName}</span>
                      )}
                    </div>
                    
                    {user.favoriteGenres && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.favoriteGenres.slice(0, 2).map((genre, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-yellow-400 border-yellow-500/30">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => initiateChat(user.userId, user.stagename)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  data-testid={`button-chat-${user.userId}`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {isEnabled && nearbyUsers.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-400 mb-2">No metalheads nearby</h4>
            <p className="text-gray-500 text-sm">
              No other users found within {settings.proximityRadius}m. 
              Try increasing your search radius or check back later.
            </p>
          </div>
        )}

        {/* Disabled State */}
        {!isEnabled && (
          <div className="text-center py-8">
            <Navigation className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-400 mb-2">Proximity Matching Disabled</h4>
            <p className="text-gray-500 text-sm mb-4">
              Enable location sharing to connect with metalheads at your concert venue
            </p>
            <Button
              onClick={requestLocationPermission}
              disabled={isLoadingLocation}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-enable-proximity"
            >
              <Zap className="w-4 h-4 mr-2" />
              Enable Proximity
            </Button>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-6 p-3 bg-yellow-600/10 rounded-lg border border-yellow-500/20">
          <div className="flex items-start space-x-2">
            <Eye className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-200">
              <strong>Privacy:</strong> Your location is only shared when at concert venues and expires after the event. 
              You can disable this feature anytime.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}