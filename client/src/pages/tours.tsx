import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetalLoader } from "@/components/ui/metal-loader";
import TourSubmission from "@/components/forms/tour-submission";
import { apiRequest, queryClient } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  DollarSign, 
  Users, 
  RefreshCw,
  TrendingUp,
  Clock,
  Globe,
  Plus,
  Search,
  Filter,
  ChevronDown,
  X,
  SlidersHorizontal
} from "lucide-react";

interface TourWithBand {
  id: string;
  bandId: string;
  tourName: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  ticketUrl?: string;
  ticketmasterUrl?: string;
  seatgeekUrl?: string;
  price?: string;
  status: string;
  band?: {
    id: string;
    name: string;
    genre: string;
    imageUrl?: string;
  };
}

interface TourStats {
  totalTours: number;
  upcomingTours: number;
  bandsOnTour: number;
  lastUpdated: string;
}

export default function Tours() {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [viewMode, setViewMode] = useState<'upcoming' | 'all'>('upcoming');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  
  const { user, isAuthenticated } = useAuth();
  // const { toast } = useToast();

  // Fetch tours with band information
  const { data: tours = [], isLoading: toursLoading, refetch: refetchTours } = useQuery<TourWithBand[]>({
    queryKey: ["/api/tours/enhanced", viewMode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (viewMode === 'upcoming') params.append('upcoming', 'true');
      const response = await fetch(`/api/tours/enhanced?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tours');
      return response.json();
    },
  });

  // Fetch tour statistics
  const { data: stats, isLoading: statsLoading } = useQuery<TourStats>({
    queryKey: ["/api/tours/stats"],
  });

  // Refresh tour database mutation
  const refreshToursMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/tours/refresh");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tours/enhanced"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tours/stats"] });
      console.log(`Tour database updated: ${data.stats.upcomingTours} upcoming tours from ${data.stats.bandsOnTour} bands`);
    },
    onError: () => {
      console.error("Failed to refresh tour database");
    },
  });

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  // Extract unique values for filter options (simplified to prevent render loop)
  const filterOptions = {
    genres: tours ? Array.from(new Set(tours.map(tour => tour.band?.genre).filter(Boolean))).sort() : [],
    countries: tours ? Array.from(new Set(tours.map(tour => tour.country))).sort() : [],
    cities: tours ? Array.from(new Set(tours.map(tour => tour.city))).sort() : []
  };

  // Simplified filtering to prevent render loops
  let filteredTours = tours || [];
  
  // Apply view mode filter
  if (viewMode === 'upcoming') {
    filteredTours = filteredTours.filter(tour => isUpcoming(tour.date));
  }

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredTours = filteredTours.filter(tour => 
      (tour.band?.name || '').toLowerCase().includes(query) ||
      tour.tourName.toLowerCase().includes(query) ||
      tour.venue.toLowerCase().includes(query) ||
      tour.city.toLowerCase().includes(query) ||
      tour.country.toLowerCase().includes(query)
    );
  }

  // Apply filters
  if (selectedGenre !== 'all') {
    filteredTours = filteredTours.filter(tour => tour.band?.genre === selectedGenre);
  }
  if (selectedCountry !== 'all') {
    filteredTours = filteredTours.filter(tour => tour.country === selectedCountry);
  }
  if (selectedCity !== 'all') {
    filteredTours = filteredTours.filter(tour => tour.city === selectedCity);
  }
  if (dateFrom) {
    filteredTours = filteredTours.filter(tour => new Date(tour.date) >= new Date(dateFrom));
  }
  if (dateTo) {
    filteredTours = filteredTours.filter(tour => new Date(tour.date) <= new Date(dateTo));
  }
  if (priceRange !== 'all') {
    filteredTours = filteredTours.filter(tour => {
      if (!tour.price) return priceRange === 'free';
      const price = parseFloat(tour.price.replace(/[^\d.]/g, ''));
      switch (priceRange) {
        case 'free': return price === 0;
        case 'under-50': return price < 50;
        case '50-100': return price >= 50 && price <= 100;
        case '100-200': return price > 100 && price <= 200;
        case 'over-200': return price > 200;
        default: return true;
      }
    });
  }

  // Apply sorting
  filteredTours = [...filteredTours].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'band':
        return (a.band?.name || '').localeCompare(b.band?.name || '');
      case 'location':
        return `${a.city}, ${a.country}`.localeCompare(`${b.city}, ${b.country}`);
      case 'price':
        const priceA = parseFloat((a.price || '0').replace(/[^\d.]/g, ''));
        const priceB = parseFloat((b.price || '0').replace(/[^\d.]/g, ''));
        return priceA - priceB;
      default:
        return 0;
    }
  });

  const upcomingTours = tours ? tours.filter(tour => isUpcoming(tour.date)) : [];
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedCountry('all');
    setSelectedCity('all');
    setDateFrom('');
    setDateTo('');
    setPriceRange('all');
    setSortBy('date');
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || selectedGenre !== 'all' || selectedCountry !== 'all' || 
    selectedCity !== 'all' || dateFrom || dateTo || priceRange !== 'all' || sortBy !== 'date';

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-metal-red" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider">Metal Tours</h1>
        </div>
        <p className="text-gray-400 text-sm sm:text-base">
          Discover live metal shows and concerts. Find tickets, venues, and tour information for your favorite bands.
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card-dark border-metal-gray">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Tours</p>
                  <p className="text-2xl font-black text-white">{stats.totalTours}</p>
                </div>
                <Calendar className="w-8 h-8 text-metal-red" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card-dark border-metal-gray">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Upcoming Shows</p>
                  <p className="text-2xl font-black text-green-400">{stats.upcomingTours}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card-dark border-metal-gray">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Bands on Tour</p>
                  <p className="text-2xl font-black text-blue-400">{stats.bandsOnTour}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card-dark border-metal-gray">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Last Updated</p>
                  <p className="text-sm font-bold text-gray-300">
                    {new Date(stats.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Quick Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search bands, venues, cities, or countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-card-dark border-metal-gray text-white placeholder:text-gray-400"
            data-testid="input-search-tours"
          />
        </div>

        {/* Quick Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setViewMode('upcoming')}
              variant={viewMode === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              className={viewMode === 'upcoming' ? 'bg-metal-red hover:bg-metal-red-bright' : 'border-metal-gray text-white hover:bg-metal-red/20'}
              data-testid="button-upcoming-tours"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Upcoming ({upcomingTours.length})
            </Button>
            <Button
              onClick={() => setViewMode('all')}
              variant={viewMode === 'all' ? 'default' : 'outline'}
              size="sm"
              className={viewMode === 'all' ? 'bg-metal-red hover:bg-metal-red-bright' : 'border-metal-gray text-white hover:bg-metal-red/20'}
              data-testid="button-all-tours"
            >
              <Calendar className="w-4 h-4 mr-2" />
              All Tours ({tours.length})
            </Button>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className={`border-metal-gray text-white hover:bg-metal-red/20 ${hasActiveFilters ? 'bg-metal-red/20 border-metal-red' : ''}`}
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters {hasActiveFilters && `(${[searchQuery, selectedGenre !== 'all', selectedCountry !== 'all', selectedCity !== 'all', dateFrom, dateTo, priceRange !== 'all', sortBy !== 'date'].filter(Boolean).length})`}
            </Button>

            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="text-metal-red hover:text-metal-red-bright hover:bg-metal-red/10"
                data-testid="button-clear-filters"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => refreshToursMutation.mutate()}
              disabled={refreshToursMutation.isPending}
              variant="outline"
              size="sm"
              className="border-metal-gray text-white hover:bg-metal-red/20"
              data-testid="button-refresh-tours"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshToursMutation.isPending ? 'animate-spin' : ''}`} />
              {refreshToursMutation.isPending ? 'Updating...' : 'Update'}
            </Button>

            {isAuthenticated && (
              <Button
                onClick={() => setShowSubmissionForm(!showSubmissionForm)}
                size="sm"
                className="bg-metal-red hover:bg-metal-red-bright font-bold"
                data-testid="button-add-tour"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tour
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="bg-card-dark border-metal-gray mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-metal-red" />
              Advanced Filters
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Genre Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Genre</label>
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-genre">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent className="bg-card-dark border-metal-gray">
                    <SelectItem value="all">All Genres</SelectItem>
                    {filterOptions.genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Country Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Country</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-country">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent className="bg-card-dark border-metal-gray">
                    <SelectItem value="all">All Countries</SelectItem>
                    {filterOptions.countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">City</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-city">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent className="bg-card-dark border-metal-gray">
                    <SelectItem value="all">All Cities</SelectItem>
                    {filterOptions.cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Price Range</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-price-range">
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent className="bg-card-dark border-metal-gray">
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="under-50">Under $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="100-200">$100 - $200</SelectItem>
                    <SelectItem value="over-200">Over $200</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">From Date</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-card-dark border-metal-gray text-white"
                  data-testid="input-date-from"
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">To Date</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-card-dark border-metal-gray text-white"
                  data-testid="input-date-to"
                />
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card-dark border-metal-gray">
                    <SelectItem value="date">Date (Earliest First)</SelectItem>
                    <SelectItem value="date-desc">Date (Latest First)</SelectItem>
                    <SelectItem value="band">Band Name</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="price">Price (Low to High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-metal-gray/30">
              <p className="text-sm text-gray-400">
                Showing <span className="font-bold text-white">{filteredTours.length}</span> of <span className="font-bold text-white">{tours?.length || 0}</span> tours
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="link"
                    className="ml-2 text-metal-red hover:text-metal-red-bright p-0 h-auto"
                    data-testid="link-clear-filters"
                  >
                    Clear all filters
                  </Button>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tour Submission Form */}
      {showSubmissionForm && isAuthenticated && (
        <div className="mb-8">
          <TourSubmission onSuccess={() => {
            setShowSubmissionForm(false);
            refetchTours();
          }} />
        </div>
      )}

      {/* Tours List */}
      {toursLoading ? (
        <div className="flex items-center justify-center min-h-96">
          <MetalLoader size="lg" variant="flame" text="LOADING TOURS..." />
        </div>
      ) : filteredTours.length === 0 ? (
        <Card className="bg-card-dark border-metal-gray">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-metal-red mb-4" />
            <h2 className="text-2xl font-black mb-4 uppercase tracking-wider text-gray-300">
              {hasActiveFilters ? 'No Tours Match Your Filters' : (viewMode === 'upcoming' ? 'No Upcoming Tours' : 'No Tours Found')}
            </h2>
            <p className="text-gray-400 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms to find more tours'
                : (viewMode === 'upcoming' 
                  ? 'Check back later for new tour announcements' 
                  : 'No tour data available at the moment'
                )
              }
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-metal-gray text-white hover:bg-metal-red/20 mr-4"
                data-testid="button-clear-filters-empty"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
            <Button
              onClick={() => refreshToursMutation.mutate()}
              disabled={refreshToursMutation.isPending}
              className="bg-metal-red hover:bg-metal-red-bright"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Tour Data
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="bg-card-dark/50 border border-metal-gray/30 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                Showing <span className="font-bold text-white">{filteredTours.length}</span> tours
                {hasActiveFilters && (
                  <span className="ml-2 text-xs bg-metal-red/20 text-metal-red px-2 py-1 rounded">
                    Filtered
                  </span>
                )}
              </p>
              <div className="text-xs text-gray-500">
                Sorted by: <span className="text-white capitalize">
                  {sortBy === 'date' ? 'Date (Earliest First)' :
                   sortBy === 'date-desc' ? 'Date (Latest First)' :
                   sortBy === 'band' ? 'Band Name' :
                   sortBy === 'location' ? 'Location' :
                   sortBy === 'price' ? 'Price (Low to High)' : sortBy
                  }
                </span>
              </div>
            </div>
          </div>

          {filteredTours.map((tour) => (
            <Card key={tour.id} className="bg-card-dark border-metal-gray hover:border-metal-red/50 transition-colors" data-testid={`card-tour-${tour.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Band Image */}
                  {tour.band?.imageUrl && (
                    <img 
                      src={tour.band.imageUrl} 
                      alt={tour.band.name}
                      className="w-16 h-16 object-cover border border-metal-gray flex-shrink-0"
                    />
                  )}
                  
                  {/* Tour Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        {tour.band && (
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-2xl font-black text-white" data-testid={`text-band-name-${tour.id}`}>
                              {tour.band.name}
                            </h3>
                            <Badge className="bg-metal-red/20 text-metal-red border-metal-red/30">
                              {tour.band.genre}
                            </Badge>
                          </div>
                        )}
                        <h4 className="text-lg font-bold text-gray-300" data-testid={`text-tour-name-${tour.id}`}>
                          {tour.tourName}
                        </h4>
                      </div>
                      
                      {/* Date Badge */}
                      <div className="text-right">
                        <div className="bg-metal-red text-white px-4 py-2 font-bold uppercase tracking-wider inline-flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(tour.date)}
                        </div>
                        <div className="text-sm text-gray-400 mt-1 text-center">
                          {formatTime(tour.date)}
                        </div>
                      </div>
                    </div>

                    {/* Venue Information */}
                    <div className="bg-black/30 p-4 rounded border border-metal-gray/30">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-6 h-6 text-metal-red flex-shrink-0" />
                          <div>
                            <h5 className="text-xl font-black text-white" data-testid={`text-venue-${tour.id}`}>
                              {tour.venue}
                            </h5>
                            <p className="text-gray-300" data-testid={`text-location-${tour.id}`}>
                              {tour.city}, {tour.country}
                            </p>
                          </div>
                        </div>
                        
                        {tour.status && (
                          <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wider ${
                            tour.status === 'upcoming' ? 'bg-green-600 text-white' :
                            tour.status === 'sold_out' ? 'bg-red-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {tour.status.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      {/* Ticket Information */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {tour.price && (
                            <div className="flex items-center text-green-400">
                              <DollarSign className="w-5 h-5 mr-1" />
                              <span className="font-bold text-lg" data-testid={`text-price-${tour.id}`}>
                                From {tour.price}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {tour.ticketUrl && (
                            <a
                              href={tour.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-6 py-3 bg-metal-red hover:bg-metal-red-bright text-white font-bold text-sm uppercase tracking-wider transition-colors"
                              data-testid={`link-tickets-${tour.id}`}
                            >
                              <Ticket className="w-4 h-4 mr-2" />
                              GET TICKETS
                            </a>
                          )}
                          {tour.ticketmasterUrl && (
                            <a
                              href={tour.ticketmasterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-metal-red font-bold px-4 py-2 border border-gray-600 hover:border-metal-red transition-colors"
                              data-testid={`link-ticketmaster-${tour.id}`}
                            >
                              Ticketmaster
                            </a>
                          )}
                          {tour.seatgeekUrl && (
                            <a
                              href={tour.seatgeekUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-metal-red font-bold"
                              data-testid={`link-seatgeek-${tour.id}`}
                            >
                              SeatGeek
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}