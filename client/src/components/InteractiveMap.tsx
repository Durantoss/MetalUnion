import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Music, 
  Camera, 
  Star, 
  Navigation,
  Filter,
  Search,
  Globe,
  Zap
} from 'lucide-react';

interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: 'venue' | 'event' | 'user' | 'photo' | 'review';
  title: string;
  description?: string;
  metadata?: {
    bandName?: string;
    eventDate?: string;
    rating?: number;
    userCount?: number;
    photoCount?: number;
    genre?: string;
    venue?: string;
  };
  createdAt: string;
}

interface InteractiveMapProps {
  showFilters?: boolean;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
}

const locationIcons = {
  venue: Music,
  event: Calendar,
  user: Users,
  photo: Camera,
  review: Star,
};

const locationColors = {
  venue: 'text-purple-400',
  event: 'text-green-400',
  user: 'text-blue-400',
  photo: 'text-pink-400',
  review: 'text-yellow-400',
};

// Mock world map component (in a real app, you'd use Google Maps, Mapbox, etc.)
function WorldMap({ locations, selectedLocation, onLocationClick, filters }: {
  locations: MapLocation[];
  selectedLocation?: MapLocation;
  onLocationClick: (location: MapLocation) => void;
  filters: Record<string, boolean>;
}) {
  const filteredLocations = locations.filter(loc => filters[loc.type]);
  
  return (
    <div className="relative w-full h-96 bg-void-black/20 rounded-lg border border-fire-red/20 overflow-hidden">
      {/* Simple world map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-void-black via-gray-900 to-void-black">
        {/* Grid lines to simulate map */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-fire-red/20" style={{ top: `${i * 10}%` }} />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-fire-red/20" style={{ left: `${i * 10}%` }} />
          ))}
        </div>
        
        {/* Location markers */}
        <AnimatePresence>
          {filteredLocations.map((location, index) => {
            const Icon = locationIcons[location.type];
            const color = locationColors[location.type];
            const isSelected = selectedLocation?.id === location.id;
            
            // Convert lat/lng to x/y coordinates (simplified)
            const x = ((location.lng + 180) / 360) * 100;
            const y = ((90 - location.lat) / 180) * 100;
            
            return (
              <motion.div
                key={location.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isSelected ? 1.2 : 1, 
                  opacity: 1,
                  z: isSelected ? 10 : 1
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  absolute w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all
                  ${isSelected 
                    ? 'bg-gradient-to-r from-fire-red to-electric-yellow border-white shadow-lg shadow-fire-red/50' 
                    : 'bg-void-black/80 border-fire-red/40 hover:border-fire-red hover:scale-110'
                  }
                `}
                style={{ 
                  left: `${Math.max(2, Math.min(96, x))}%`, 
                  top: `${Math.max(2, Math.min(96, y))}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => onLocationClick(location)}
                data-testid={`map-marker-${location.id}`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-void-black' : color}`} />
                
                {/* Pulse animation for active markers */}
                {location.type === 'event' && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-green-400"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Connecting lines for related locations */}
        {selectedLocation && filteredLocations
          .filter(loc => loc.metadata?.bandName === selectedLocation.metadata?.bandName && loc.id !== selectedLocation.id)
          .map(relatedLoc => {
            const x1 = ((selectedLocation.lng + 180) / 360) * 100;
            const y1 = ((90 - selectedLocation.lat) / 180) * 100;
            const x2 = ((relatedLoc.lng + 180) / 360) * 100;
            const y2 = ((90 - relatedLoc.lat) / 180) * 100;
            
            return (
              <motion.svg
                key={`line-${relatedLoc.id}`}
                className="absolute inset-0 w-full h-full pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
              >
                <line
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(239, 68, 68)" />
                    <stop offset="100%" stopColor="rgb(245, 158, 11)" />
                  </linearGradient>
                </defs>
              </motion.svg>
            );
          })
        }
      </div>
      
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-void-black/90 rounded-lg p-3 border border-fire-red/20">
        <div className="text-xs font-semibold mb-2 text-fire-red">Legend</div>
        <div className="space-y-1">
          {Object.entries(locationIcons).map(([type, Icon]) => {
            const color = locationColors[type as keyof typeof locationColors];
            const count = filteredLocations.filter(loc => loc.type === type).length;
            
            return (
              <div key={type} className="flex items-center gap-2 text-xs">
                <Icon className={`w-3 h-3 ${color}`} />
                <span className="capitalize">{type}</span>
                <Badge variant="outline" size="sm">{count}</Badge>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Current view info */}
      <div className="absolute top-4 left-4 bg-void-black/90 rounded-lg p-3 border border-fire-red/20">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-fire-red" />
          <span className="text-sm font-semibold text-fire-red">Global View</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Showing {filteredLocations.length} locations
        </div>
      </div>
    </div>
  );
}

export function InteractiveMap({ 
  showFilters = true, 
  defaultCenter = { lat: 40.7128, lng: -74.0060 },
  defaultZoom = 2 
}: InteractiveMapProps) {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation>();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    venue: true,
    event: true,
    user: true,
    photo: true,
    review: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const response = await fetch('/api/map/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  const toggleFilter = (type: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredLocations = locations.filter(location => 
    filters[location.type] && 
    (searchQuery === '' || 
     location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     location.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <Card className="bg-void-black/40 border-fire-red/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-fire-red animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-electric-yellow animate-pulse delay-100"></div>
            <div className="w-3 h-3 rounded-full bg-fire-red animate-pulse delay-200"></div>
          </div>
          <p className="text-center mt-4 text-muted-foreground">Loading map data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-void-black/40 border-fire-red/20 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="gradient-text-neon flex items-center gap-2">
            <Navigation className="w-6 h-6" />
            Interactive Music Map
          </CardTitle>
          
          {showFilters && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 bg-void-black/40 border border-fire-red/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fire-red/40"
                  data-testid="location-search"
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="map" className="space-y-4">
          <TabsList>
            <TabsTrigger value="map" data-testid="tab-map">Map View</TabsTrigger>
            <TabsTrigger value="list" data-testid="tab-list">List View</TabsTrigger>
            <TabsTrigger value="stats" data-testid="tab-stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            {showFilters && (
              <div className="flex flex-wrap gap-2 p-3 bg-void-black/20 rounded-lg border border-fire-red/10">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Filter className="w-4 h-4 text-fire-red" />
                  Filters:
                </div>
                {Object.entries(filters).map(([type, enabled]) => {
                  const Icon = locationIcons[type as keyof typeof locationIcons];
                  const color = locationColors[type as keyof typeof locationColors];
                  
                  return (
                    <Button
                      key={type}
                      variant={enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter(type as keyof typeof filters)}
                      className={`gap-2 ${enabled ? 'bg-gradient-to-r from-fire-red to-electric-yellow text-void-black' : ''}`}
                      data-testid={`filter-${type}`}
                    >
                      <Icon className={`w-4 h-4 ${enabled ? 'text-void-black' : color}`} />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                      <Badge variant={enabled ? "secondary" : "outline"} size="sm">
                        {locations.filter(loc => loc.type === type).length}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            )}

            <div className="space-y-4">
              <WorldMap
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationClick={handleLocationClick}
                filters={filters}
              />

              {/* Location details panel */}
              <AnimatePresence>
                {selectedLocation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Card className="bg-void-black/20 border-fire-red/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`
                            w-12 h-12 rounded-lg border-2 border-fire-red/20 flex items-center justify-center
                            bg-gradient-to-r from-fire-red/20 to-electric-yellow/20
                          `}>
                            {React.createElement(locationIcons[selectedLocation.type], {
                              className: `w-6 h-6 ${locationColors[selectedLocation.type]}`
                            })}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{selectedLocation.title}</h3>
                              <Badge variant="outline" className="capitalize">
                                {selectedLocation.type}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <MapPin className="w-4 h-4" />
                              {selectedLocation.name}
                            </div>
                            
                            {selectedLocation.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {selectedLocation.description}
                              </p>
                            )}
                            
                            {selectedLocation.metadata && (
                              <div className="space-y-2">
                                {selectedLocation.metadata.bandName && (
                                  <div className="flex items-center gap-2">
                                    <Music className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-medium">{selectedLocation.metadata.bandName}</span>
                                  </div>
                                )}
                                
                                {selectedLocation.metadata.eventDate && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-green-400" />
                                    <span className="text-sm">
                                      {new Date(selectedLocation.metadata.eventDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                
                                {selectedLocation.metadata.rating && (
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm">
                                      {selectedLocation.metadata.rating}/5 rating
                                    </span>
                                  </div>
                                )}
                                
                                {selectedLocation.metadata.userCount && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm">
                                      {selectedLocation.metadata.userCount} users
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLocation(undefined)}
                            data-testid="close-location-details"
                          >
                            ✕
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredLocations.map((location, index) => {
                const Icon = locationIcons[location.type];
                const color = locationColors[location.type];
                
                return (
                  <motion.div
                    key={location.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-void-black/20 border-fire-red/10 hover:border-fire-red/20 transition-all cursor-pointer">
                      <CardContent className="p-4" onClick={() => handleLocationClick(location)}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-void-black/40 border border-fire-red/20 flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${color}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{location.title}</h4>
                              <Badge variant="outline" size="sm" className="capitalize">
                                {location.type}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {location.name}
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {new Date(location.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(locationIcons).map(([type, Icon]) => {
                const color = locationColors[type as keyof typeof locationColors];
                const count = locations.filter(loc => loc.type === type).length;
                
                return (
                  <Card key={type} className="bg-void-black/20 border-fire-red/10">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Icon className={`w-8 h-8 ${color}`} />
                      </div>
                      <div className="text-2xl font-bold text-fire-red">{count}</div>
                      <div className="text-sm text-muted-foreground capitalize">{type}s</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}