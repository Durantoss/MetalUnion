import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetalLoader } from "@/components/ui/metal-loader";
import LighterRating from "@/components/ui/star-rating";
import { 
  Search as SearchIcon, 
  Filter, 
  X, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Clock,
  Music,
  Camera,
  MessageSquare,
  Calendar as CalendarIcon,
  Star,
  Users,
  Globe,
  Instagram,
  Ticket,
  DollarSign
} from "lucide-react";
import type { Band, Tour, Review, Photo } from "@shared/schema";

interface WebSearchResult {
  title: string;
  description: string;
  url: string;
  source: string;
  imageUrl?: string;
  type: 'band' | 'tour' | 'news' | 'general';
}

// Extended types to include upcoming tours and additional data
type BandWithTours = Band & {
  upcomingTours?: Tour[];
};

type SearchResults = {
  bands: BandWithTours[];
  tours: Tour[];
  reviews: Review[];
  photos: Photo[];
  webResults: WebSearchResult[];
};

const metalGenres = [
  "Black Metal", "Death Metal", "Doom Metal", "Folk Metal", "Gothic Metal", 
  "Groove Metal", "Heavy Metal", "Industrial Metal", "Melodic Death Metal",
  "Metalcore", "Nu Metal", "Power Metal", "Progressive Metal", "Sludge Metal",
  "Speed Metal", "Symphonic Metal", "Thrash Metal", "Viking Metal"
];

const photoCategories = ["live", "promo", "backstage", "equipment"];
const reviewTypes = ["band", "album", "concert"];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState("web");
  const [showWebResults, setShowWebResults] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState("");
  const [selectedReviewType, setSelectedReviewType] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const { data: searchResults, isLoading } = useQuery<SearchResults>({
    queryKey: ["/api/search", searchQuery, selectedGenre, selectedPhotoCategory, selectedReviewType, selectedCountry, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedGenre) params.append('genre', selectedGenre);
      if (selectedPhotoCategory) params.append('photoCategory', selectedPhotoCategory);
      if (selectedReviewType) params.append('reviewType', selectedReviewType);
      if (selectedCountry) params.append('country', selectedCountry);
      if (dateRange) params.append('dateRange', dateRange);
      params.append('includeWeb', showWebResults.toString());
      
      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search');
      }
      return response.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const clearFilters = () => {
    setSelectedGenre("");
    setSelectedPhotoCategory("");
    setSelectedReviewType("");
    setSelectedCountry("");
    setDateRange("");
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getResultCounts = () => {
    if (!searchResults) return { bands: 0, tours: 0, reviews: 0, photos: 0, webResults: 0 };
    return {
      bands: searchResults.bands?.length || 0,
      tours: searchResults.tours?.length || 0,
      reviews: searchResults.reviews?.length || 0,
      photos: searchResults.photos?.length || 0,
      webResults: searchResults.webResults?.length || 0,
    };
  };

  const counts = getResultCounts();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <SearchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-metal-red" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider">Search MetalHub</h1>
        </div>
        <p className="text-gray-400 text-sm sm:text-base">
          Discover bands, tours, reviews, and photos across the metal universe.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="bg-card-dark border-metal-gray mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search bands, tours, reviews, photos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12 text-base"
                data-testid="input-search"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-metal-gray text-white hover:bg-metal-red/20 h-12 px-6"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters {(selectedGenre || selectedPhotoCategory || selectedReviewType || selectedCountry || dateRange) && `(${[selectedGenre, selectedPhotoCategory, selectedReviewType, selectedCountry, dateRange].filter(Boolean).length})`}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 border border-metal-gray rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Genre</label>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-genre">
                      <SelectValue placeholder="All genres" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-metal-red">
                      <SelectItem value="all" className="text-white hover:bg-metal-red/20">All genres</SelectItem>
                      {metalGenres.map((genre) => (
                        <SelectItem key={genre} value={genre} className="text-white hover:bg-metal-red/20">
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Photo Category</label>
                  <Select value={selectedPhotoCategory} onValueChange={setSelectedPhotoCategory}>
                    <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-photo-category">
                      <SelectValue placeholder="All photos" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-metal-red">
                      <SelectItem value="all" className="text-white hover:bg-metal-red/20">All photos</SelectItem>
                      {photoCategories.map((category) => (
                        <SelectItem key={category} value={category} className="text-white hover:bg-metal-red/20">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Review Type</label>
                  <Select value={selectedReviewType} onValueChange={setSelectedReviewType}>
                    <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-review-type">
                      <SelectValue placeholder="All reviews" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-metal-red">
                      <SelectItem value="all" className="text-white hover:bg-metal-red/20">All reviews</SelectItem>
                      {reviewTypes.map((type) => (
                        <SelectItem key={type} value={type} className="text-white hover:bg-metal-red/20">
                          {type.charAt(0).toUpperCase() + type.slice(1)} reviews
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Country</label>
                  <Input
                    placeholder="e.g., USA, UK, Germany"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                    data-testid="input-country"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-date-range">
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-metal-red">
                      <SelectItem value="all" className="text-white hover:bg-metal-red/20">Any time</SelectItem>
                      <SelectItem value="upcoming" className="text-white hover:bg-metal-red/20">Upcoming</SelectItem>
                      <SelectItem value="thisWeek" className="text-white hover:bg-metal-red/20">This week</SelectItem>
                      <SelectItem value="thisMonth" className="text-white hover:bg-metal-red/20">This month</SelectItem>
                      <SelectItem value="thisYear" className="text-white hover:bg-metal-red/20">This year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={clearFilters}
                variant="ghost"
                className="text-gray-400 hover:text-metal-red"
                data-testid="button-clear-filters"
              >
                <X className="w-4 h-4 mr-2" />
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-96">
              <MetalLoader size="lg" variant="flame" text="SEARCHING THE METAL UNIVERSE..." />
            </div>
          ) : (
            <>
              {/* Web Results Toggle */}
              <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold text-white">Search Results</h2>
                {counts.webResults > 0 && (
                  <Badge className="bg-green-600 text-white">
                    {counts.webResults} web results
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Include web results</span>
                <button
                  onClick={() => setShowWebResults(!showWebResults)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-metal-red focus:ring-offset-2 ${
                    showWebResults ? 'bg-metal-red' : 'bg-gray-600'
                  }`}
                  data-testid="toggle-web-results"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showWebResults ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-card-dark border border-metal-gray mb-6">
                <TabsTrigger 
                  value="web" 
                  className="data-[state=active]:bg-metal-red data-[state=active]:text-white text-gray-400"
                  data-testid="tab-web"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Web ({counts.webResults})
                </TabsTrigger>
                <TabsTrigger 
                  value="tours" 
                  className="data-[state=active]:bg-metal-red data-[state=active]:text-white text-gray-400"
                  data-testid="tab-tours"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Tours ({counts.tours})
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="data-[state=active]:bg-metal-red data-[state=active]:text-white text-gray-400"
                  data-testid="tab-reviews"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Reviews ({counts.reviews})
                </TabsTrigger>
                <TabsTrigger 
                  value="photos" 
                  className="data-[state=active]:bg-metal-red data-[state=active]:text-white text-gray-400"
                  data-testid="tab-photos"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Photos ({counts.photos})
                </TabsTrigger>
                <TabsTrigger 
                  value="bands" 
                  className="data-[state=active]:bg-metal-red data-[state=active]:text-white text-gray-400"
                  data-testid="tab-bands"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Bands ({counts.bands})
                </TabsTrigger>
              </TabsList>

              {/* Bands Results */}
              <TabsContent value="bands" className="space-y-4">
                {searchResults?.bands?.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No bands found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {searchResults?.bands?.map((band) => (
                      <Card key={band.id} className="bg-card-dark border-metal-gray" data-testid={`card-band-${band.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            {band.imageUrl && (
                              <img 
                                src={band.imageUrl} 
                                alt={band.name}
                                className="w-20 h-20 object-cover border border-metal-gray flex-shrink-0"
                                data-testid={`img-band-${band.id}`}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-black text-white mb-2" data-testid={`text-band-name-${band.id}`}>
                                {band.name}
                              </h3>
                              <Badge className="bg-metal-red/20 text-metal-red border-metal-red/30 mb-2">
                                {band.genre}
                              </Badge>
                              <p className="text-gray-300 text-sm line-clamp-2" data-testid={`text-band-description-${band.id}`}>
                                {band.description}
                              </p>
                              
                              {/* Upcoming Tours */}
                              {band.upcomingTours && band.upcomingTours.length > 0 && (
                                <div className="mt-3">
                                  <h4 className="text-sm font-bold text-gray-400 mb-2">Upcoming Shows:</h4>
                                  <div className="space-y-1">
                                    {band.upcomingTours.slice(0, 2).map((tour) => (
                                      <div key={tour.id} className="text-xs text-gray-300 flex items-center">
                                        <Calendar className="w-3 h-3 mr-1 text-metal-red" />
                                        {formatDate(tour.date)} - {tour.venue}, {tour.city}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center space-x-3">
                                  {band.website && (
                                    <a 
                                      href={band.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-gray-400 hover:text-metal-red"
                                      data-testid={`link-band-website-${band.id}`}
                                    >
                                      <Globe className="w-4 h-4" />
                                    </a>
                                  )}
                                  {band.instagram && (
                                    <a 
                                      href={band.instagram} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-gray-400 hover:text-metal-red"
                                      data-testid={`link-band-instagram-${band.id}`}
                                    >
                                      <Instagram className="w-4 h-4" />
                                    </a>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-metal-red"
                                  data-testid={`button-view-band-${band.id}`}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Web Results */}
              <TabsContent value="web" className="space-y-4">
                {!showWebResults ? (
                  <div className="text-center py-12">
                    <Globe className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">Web results disabled</h3>
                    <p className="text-gray-500">Enable web results to see search results from across the internet</p>
                    <Button
                      onClick={() => setShowWebResults(true)}
                      className="mt-4 bg-metal-red hover:bg-metal-red-bright"
                    >
                      Enable Web Results
                    </Button>
                  </div>
                ) : searchResults?.webResults?.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No web results found</h3>
                    <p className="text-gray-500">Try adjusting your search terms</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {searchResults?.webResults?.map((result, index) => (
                      <Card key={index} className="bg-card-dark border-metal-gray" data-testid={`card-web-result-${index}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            {result.imageUrl && (
                              <img 
                                src={result.imageUrl} 
                                alt={result.title}
                                className="w-20 h-20 object-cover border border-metal-gray flex-shrink-0"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                                data-testid={`img-web-result-${index}`}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={`text-xs ${
                                  result.type === 'band' ? 'bg-blue-600 text-white' :
                                  result.type === 'tour' ? 'bg-green-600 text-white' :
                                  result.type === 'news' ? 'bg-purple-600 text-white' :
                                  'bg-gray-600 text-white'
                                }`}>
                                  {result.type.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-gray-400">{result.source}</span>
                              </div>
                              
                              <a 
                                href={result.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group"
                                data-testid={`link-web-result-${index}`}
                              >
                                <h3 className="text-lg font-bold text-white group-hover:text-metal-red transition-colors mb-2 line-clamp-2">
                                  {result.title}
                                </h3>
                              </a>
                              
                              <p className="text-gray-300 text-sm line-clamp-3 mb-3" data-testid={`text-web-description-${index}`}>
                                {result.description}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 truncate max-w-xs">
                                  {result.url}
                                </span>
                                <a 
                                  href={result.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-metal-red hover:text-metal-red-bright text-sm font-bold flex items-center"
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  Visit
                                </a>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tours Results */}
              <TabsContent value="tours" className="space-y-4">
                {searchResults?.tours?.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No tours found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {searchResults?.tours?.map((tour) => (
                      <Card key={tour.id} className="bg-card-dark border-metal-gray" data-testid={`card-tour-${tour.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-black text-white mb-2" data-testid={`text-tour-name-${tour.id}`}>
                                {tour.tourName}
                              </h3>
                              <div className="flex items-center text-gray-300 mb-2">
                                <Calendar className="w-4 h-4 mr-2 text-metal-red" />
                                <span data-testid={`text-tour-date-${tour.id}`}>{formatDate(tour.date)}</span>
                              </div>
                              <div className="flex items-center text-gray-300">
                                <MapPin className="w-4 h-4 mr-2 text-metal-red" />
                                <span data-testid={`text-tour-location-${tour.id}`}>
                                  {tour.venue}, {tour.city}, {tour.country}
                                </span>
                              </div>
                            </div>
                            {tour.status && (
                              <Badge 
                                className={`${
                                  tour.status === 'sold_out' 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-green-600 text-white'
                                }`}
                              >
                                {tour.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            )}
                          </div>

                          {tour.price && (
                            <div className="mb-4">
                              <span className="text-sm text-gray-400">Price: </span>
                              <span className="text-white font-bold" data-testid={`text-tour-price-${tour.id}`}>
                                {tour.price}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              {tour.ticketUrl && (
                                <a 
                                  href={tour.ticketUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs bg-metal-red hover:bg-metal-red-bright text-white px-3 py-1 rounded font-bold"
                                  data-testid={`link-tour-tickets-${tour.id}`}
                                >
                                  <ExternalLink className="w-3 h-3 mr-1 inline" />
                                  TICKETS
                                </a>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-metal-red"
                              data-testid={`button-view-tour-${tour.id}`}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Reviews Results */}
              <TabsContent value="reviews" className="space-y-4">
                {searchResults?.reviews?.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No reviews found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {searchResults?.reviews?.map((review) => (
                      <Card key={review.id} className="bg-card-dark border-metal-gray" data-testid={`card-review-${review.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-black text-white" data-testid={`text-review-title-${review.id}`}>
                                  {review.title}
                                </h3>
                                <Badge className="bg-metal-red/20 text-metal-red border-metal-red/30">
                                  {review.reviewType}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 mb-3">
                                <LighterRating rating={review.rating} size="sm" />
                                <span className="text-gray-400 text-sm">
                                  by {review.stagename} • {formatDate(review.createdAt!)}
                                </span>
                              </div>
                              
                              <p className="text-gray-300 line-clamp-3" data-testid={`text-review-content-${review.id}`}>
                                {review.content}
                              </p>
                              
                              {review.targetName && (
                                <div className="mt-3">
                                  <span className="text-sm text-gray-400">Reviewing: </span>
                                  <span className="text-white font-medium" data-testid={`text-review-target-${review.id}`}>
                                    {review.targetName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-gray-400">
                                <Star className="w-4 h-4 mr-1" />
                                <span>{review.likes || 0} likes</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-metal-red"
                              data-testid={`button-view-review-${review.id}`}
                            >
                              Read Full Review
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Photos Results */}
              <TabsContent value="photos" className="space-y-4">
                {searchResults?.photos?.length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No photos found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults?.photos?.map((photo) => (
                      <Card key={photo.id} className="bg-card-dark border-metal-gray overflow-hidden" data-testid={`card-photo-${photo.id}`}>
                        <div className="relative aspect-square">
                          <img 
                            src={photo.imageUrl} 
                            alt={photo.title || 'Metal photo'}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            data-testid={`img-photo-${photo.id}`}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-black/80 text-white text-xs">
                              {photo.category}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h4 className="text-sm font-bold text-white mb-1 truncate" data-testid={`text-photo-title-${photo.id}`}>
                            {photo.title || 'Untitled'}
                          </h4>
                          <p className="text-xs text-gray-400 truncate" data-testid={`text-photo-category-${photo.id}`}>
                            {photo.category} • by {photo.uploadedBy}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            </>
          )}
        </div>
      )}

      {/* Search Hint */}
      {searchQuery.length < 2 && searchInput.length > 0 && (
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">Type at least 2 characters</h3>
          <p className="text-gray-500">Start searching the metal universe...</p>
        </div>
      )}

      {/* No Search Query */}
      {searchQuery.length === 0 && searchInput.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">Search MetalHub</h3>
          <p className="text-gray-500">Discover bands, tours, reviews, and photos from the metal community</p>
        </div>
      )}
    </main>
  );
}