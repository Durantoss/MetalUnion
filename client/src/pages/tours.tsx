import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MetalLoader } from "@/components/ui/metal-loader";
import TourSubmission from "@/components/forms/tour-submission";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  Plus
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
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

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
      toast({
        title: "Tour Database Updated!",
        description: `Found ${data.stats.upcomingTours} upcoming tours from ${data.stats.bandsOnTour} bands.`,
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to refresh tour database. Please try again.",
        variant: "destructive",
      });
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

  const upcomingTours = tours.filter(tour => isUpcoming(tour.date));

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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setViewMode('upcoming')}
            variant={viewMode === 'upcoming' ? 'default' : 'outline'}
            className={viewMode === 'upcoming' ? 'bg-metal-red hover:bg-metal-red-bright' : 'border-metal-gray text-white hover:bg-metal-red/20'}
            data-testid="button-upcoming-tours"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Upcoming ({upcomingTours.length})
          </Button>
          <Button
            onClick={() => setViewMode('all')}
            variant={viewMode === 'all' ? 'default' : 'outline'}
            className={viewMode === 'all' ? 'bg-metal-red hover:bg-metal-red-bright' : 'border-metal-gray text-white hover:bg-metal-red/20'}
            data-testid="button-all-tours"
          >
            <Calendar className="w-4 h-4 mr-2" />
            All Tours ({tours.length})
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => refreshToursMutation.mutate()}
            disabled={refreshToursMutation.isPending}
            variant="outline"
            className="border-metal-gray text-white hover:bg-metal-red/20"
            data-testid="button-refresh-tours"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshToursMutation.isPending ? 'animate-spin' : ''}`} />
            {refreshToursMutation.isPending ? 'Updating...' : 'Update Tours'}
          </Button>

          {isAuthenticated && (
            <Button
              onClick={() => setShowSubmissionForm(!showSubmissionForm)}
              className="bg-metal-red hover:bg-metal-red-bright font-bold"
              data-testid="button-add-tour"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tour
            </Button>
          )}
        </div>
      </div>

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
      ) : tours.length === 0 ? (
        <Card className="bg-card-dark border-metal-gray">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-metal-red mb-4" />
            <h2 className="text-2xl font-black mb-4 uppercase tracking-wider text-gray-300">
              {viewMode === 'upcoming' ? 'No Upcoming Tours' : 'No Tours Found'}
            </h2>
            <p className="text-gray-400 mb-6">
              {viewMode === 'upcoming' 
                ? 'Check back later for new tour announcements' 
                : 'No tour data available at the moment'
              }
            </p>
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
          {tours
            .filter(tour => viewMode === 'all' || isUpcoming(tour.date))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((tour) => (
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