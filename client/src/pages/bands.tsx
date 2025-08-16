import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MetalLoader } from "@/components/ui/metal-loader";
import LighterRating from "@/components/ui/star-rating";
import { Search, Filter, X, Calendar, MapPin, ExternalLink, Clock } from "lucide-react";
import type { Band, Tour } from "@shared/schema";

// Extended type to include upcoming tours
type BandWithTours = Band & {
  upcomingTours?: Tour[];
};

export default function Bands() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: allBands = [], isLoading } = useQuery<BandWithTours[]>({
    queryKey: ["/api/bands", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      const response = await fetch(`/api/bands?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bands');
      }
      return response.json();
    },
  });

  // Extract unique genres for filter dropdown
  const availableGenres = useMemo(() => {
    const genres = allBands.map(band => band.genre).filter(Boolean);
    return Array.from(new Set(genres)).sort();
  }, [allBands]);

  // Filter bands by genre (search is handled by backend)
  const bands = useMemo(() => {
    let filtered = allBands;

    // Genre filter (only applied locally for better UX)
    if (selectedGenre && selectedGenre !== "all") {
      filtered = filtered.filter(band => band.genre === selectedGenre);
    }

    return filtered;
  }, [allBands, selectedGenre]);

  // Helper functions for tour display
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Generate autocomplete suggestions
  useEffect(() => {
    if (searchInput.length >= 2) {
      const suggestions = allBands
        .filter(band => 
          band.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          band.genre?.toLowerCase().includes(searchInput.toLowerCase())
        )
        .map(band => band.name)
        .slice(0, 5);
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchInput, allBands]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSearchInput("");
    setSelectedGenre("all");
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchInput(suggestion);
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const activeFiltersCount = (searchQuery ? 1 : 0) + (selectedGenre && selectedGenre !== "all" ? 1 : 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider mb-4 sm:mb-6">All Bands</h1>
        
        {/* Enhanced Search Section */}
        <div className="bg-card-dark border border-metal-gray p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-4">
            {/* Search Input with Autocomplete */}
            <div className="relative flex-1">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="SEARCH THE METAL ARCHIVES..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="bg-black border-metal-gray text-white placeholder-gray-400 focus:border-metal-red pl-10 sm:pl-12 pr-4 h-12 sm:h-14 font-bold uppercase tracking-wider text-sm sm:text-base"
                  data-testid="input-band-search"
                />
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-metal-red w-4 h-4 sm:w-5 sm:h-5" />
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-black border-2 border-metal-red z-10 max-h-48 sm:max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full text-left px-3 sm:px-4 py-3 sm:py-3 text-white hover:bg-metal-red/20 transition-colors font-bold uppercase tracking-wide border-b border-metal-gray last:border-b-0 text-sm sm:text-base min-h-[44px]"
                        data-testid={`suggestion-${index}`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Genre Filter */}
            <div className="min-w-full sm:min-w-48">
              <Select value={selectedGenre || "all"} onValueChange={setSelectedGenre}>
                <SelectTrigger className="bg-black border-metal-gray text-white focus:border-metal-red h-12 sm:h-14 font-bold uppercase tracking-wider text-sm sm:text-base" data-testid="select-genre-filter">
                  <SelectValue placeholder="ALL GENRES" />
                </SelectTrigger>
                <SelectContent className="bg-black border-metal-red">
                  <SelectItem value="all" className="text-white hover:bg-metal-red/20 font-bold uppercase min-h-[44px] text-sm sm:text-base">ALL GENRES</SelectItem>
                  {availableGenres.map((genre) => (
                    <SelectItem key={genre} value={genre} className="text-white hover:bg-metal-red/20 font-bold uppercase min-h-[44px] text-sm sm:text-base">
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider min-w-full sm:min-w-32 h-12 sm:h-14 text-sm sm:text-base ${activeFiltersCount > 0 ? 'ring-2 ring-metal-red' : ''}`}
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              FILTERS {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedGenre) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-0 w-full sm:w-auto">Active Filters:</span>
              
              {searchQuery && (
                <Badge className="bg-metal-red text-white font-bold uppercase px-3 py-2 text-xs sm:text-sm min-h-[36px]" data-testid="filter-search">
                  SEARCH: "{searchQuery}"
                  <X 
                    className="w-3 h-3 ml-2 cursor-pointer hover:bg-white/20 rounded" 
                    onClick={() => { setSearchQuery(""); setSearchInput(""); }}
                  />
                </Badge>
              )}
              
              {selectedGenre && selectedGenre !== "all" && (
                <Badge className="bg-metal-red text-white font-bold uppercase px-3 py-2 text-xs sm:text-sm min-h-[36px]" data-testid="filter-genre">
                  GENRE: {selectedGenre}
                  <X 
                    className="w-3 h-3 ml-2 cursor-pointer hover:bg-white/20 rounded" 
                    onClick={() => setSelectedGenre("all")}
                  />
                </Badge>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-gray-400 hover:text-metal-red font-bold uppercase tracking-wider text-xs sm:text-sm min-h-[36px] px-3"
                data-testid="button-clear-filters"
              >
                CLEAR ALL
              </Button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {(searchQuery || selectedGenre) && (
          <div className="flex items-center justify-between mb-4 sm:mb-6 bg-metal-red/10 border border-metal-red/30 px-3 sm:px-4 py-3">
            <p className="text-gray-300 font-bold uppercase tracking-wider text-sm sm:text-base">
              {isLoading ? "SEARCHING THE DEPTHS..." : `${bands.length} BANDS FOUND`}
              {searchQuery && ` MATCHING "${searchQuery}"`}
              {selectedGenre && ` IN ${selectedGenre}`}
            </p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-96">
          <MetalLoader size="lg" variant="flame" text="SUMMONING BANDS..." />
        </div>
      ) : bands.length === 0 ? (
        <Card className="bg-card-dark border-metal-gray">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <MetalLoader size="md" variant="skull" />
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-wider text-gray-300">
              {searchQuery ? "NO BANDS FOUND" : "THE VAULT IS EMPTY"}
            </h2>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? "The underground remains silent... try different search terms."
                : "Be the first to unleash bands into our realm!"
              }
            </p>
          {searchQuery && (
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSearchInput("");
              }}
              className="bg-metal-red hover:bg-metal-red-bright w-full sm:w-auto min-h-[48px]"
              data-testid="button-browse-all"
            >
              Browse All Bands
            </Button>
          )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {bands.map((band) => (
            <Card key={band.id} className="bg-card-dark border-metal-gray hover:border-metal-red transition-colors group" data-testid={`card-band-${band.id}`}>
              {band.imageUrl && (
                <img 
                  src={band.imageUrl} 
                  alt={`${band.name} live performance`} 
                  className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-black mb-2" data-testid={`text-band-name-${band.id}`}>{band.name}</h3>
                <p className="text-gray-200 font-medium mb-3" data-testid={`text-band-genre-${band.id}`}>{band.genre}</p>
                <div className="flex items-center mb-3">
                  <LighterRating rating={5} size="sm" />
                  <span className="text-xs sm:text-sm text-gray-300 ml-2">(Reviews coming soon)</span>
                </div>
                <p className="text-sm text-gray-200 mb-4 line-clamp-2 sm:line-clamp-3" data-testid={`text-band-description-${band.id}`}>
                  {band.description}
                </p>

                {/* Upcoming Tours Section */}
                {band.upcomingTours && band.upcomingTours.length > 0 && (
                  <div className="mb-4 p-3 sm:p-4 bg-metal-red/10 border border-metal-red/30 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Calendar className="w-4 h-4 text-metal-red mr-2" />
                      <h4 className="text-sm sm:text-base font-bold text-metal-red uppercase tracking-wider">
                        Upcoming Shows
                      </h4>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {band.upcomingTours.map((tour) => (
                        <div 
                          key={tour.id} 
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-metal-red/20 last:border-b-0 last:pb-0"
                          data-testid={`tour-info-${tour.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                              <span className="font-bold text-white text-xs sm:text-sm truncate" data-testid={`text-tour-name-${tour.id}`}>
                                {tour.tourName}
                              </span>
                              <div className="flex items-center text-gray-400 text-xs">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span data-testid={`text-tour-location-${tour.id}`} className="truncate">
                                  {tour.city}, {tour.country}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 gap-3">
                              <span data-testid={`text-tour-date-${tour.id}`}>
                                {formatDate(tour.date)}
                              </span>
                              <span data-testid={`text-tour-time-${tour.id}`}>
                                {formatTime(tour.date)}
                              </span>
                              {tour.price && (
                                <span data-testid={`text-tour-price-${tour.id}`}>
                                  From {tour.price}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Ticket Links */}
                          <div className="flex flex-row gap-2 self-start sm:self-auto">
                            {tour.ticketmasterUrl && (
                              <Button
                                size="sm"
                                onClick={() => window.open(tour.ticketmasterUrl!, '_blank')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 min-h-[32px]"
                                data-testid={`button-ticketmaster-${tour.id}`}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Ticketmaster</span>
                                <span className="sm:hidden">TM</span>
                              </Button>
                            )}
                            {tour.seatgeekUrl && (
                              <Button
                                size="sm"
                                onClick={() => window.open(tour.seatgeekUrl!, '_blank')}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 min-h-[32px]"
                                data-testid={`button-seatgeek-${tour.id}`}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">SeatGeek</span>
                                <span className="sm:hidden">SG</span>
                              </Button>
                            )}
                            {!tour.ticketmasterUrl && !tour.seatgeekUrl && tour.ticketUrl && (
                              <Button
                                size="sm"
                                onClick={() => window.open(tour.ticketUrl!, '_blank')}
                                className="bg-metal-red hover:bg-metal-red-bright text-white text-xs px-2 py-1 min-h-[32px]"
                                data-testid={`button-tickets-${tour.id}`}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Tickets</span>
                                <span className="sm:hidden">Tix</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <Link href={`/bands/${band.id}`} data-testid={`button-view-profile-${band.id}`} className="flex-1">
                    <Button className="bg-metal-red hover:bg-metal-red-bright text-sm font-bold uppercase tracking-wider w-full sm:w-auto min-h-[44px]">
                      View Profile
                    </Button>
                  </Link>
                  {band.founded && (
                    <span className="text-xs text-gray-500 uppercase tracking-wider text-center sm:text-right" data-testid={`text-band-founded-${band.id}`}>
                      Since {band.founded}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
