import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

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

function SimpleToursPage() {
  const { data: tours = [], isLoading, error } = useQuery({
    queryKey: ['/api/tours'],
    queryFn: async () => {
      const response = await fetch('/api/tours', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tours');
      }
      return response.json() as Tour[];
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 p-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent mb-4">
            🚌 TOUR DATES
          </h1>
          <p className="text-gray-400 text-lg">Discover upcoming metal and rock concerts</p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-400">Loading upcoming tours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 p-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent mb-4">
            🚌 TOUR DATES
          </h1>
          <p className="text-gray-400 text-lg">Discover upcoming metal and rock concerts</p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-400">Error loading tours. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 p-4 pt-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent mb-4">
          🚌 TOUR DATES
        </h1>
        <p className="text-gray-400 text-lg">Discover upcoming metal and rock concerts</p>
      </div>
      
      {tours.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No upcoming tours found</p>
          <p className="text-sm text-gray-500">Check back soon for new tour announcements</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
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
                    {tour.bandGenres && tour.bandGenres.length > 0 && (
                      <Badge variant="secondary" className="bg-red-900/30 text-red-300 text-xs">
                        {tour.bandGenres[0]}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-300 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-red-400" />
                      <span data-testid={`text-date-${tour.id}`}>{formatDate(tour.date)}</span>
                      <Clock className="w-4 h-4 ml-4 mr-2 text-red-400" />
                      <span data-testid={`text-time-${tour.id}`}>{formatTime(tour.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-300 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-red-400" />
                      <span data-testid={`text-venue-${tour.id}`}>
                        {tour.venue}, {tour.city}, {tour.country}
                      </span>
                    </div>
                    
                    {tour.price && (
                      <div className="flex items-center text-gray-300 text-sm">
                        <DollarSign className="w-4 h-4 mr-2 text-red-400" />
                        <span data-testid={`text-price-${tour.id}`}>{tour.price}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {tour.ticketUrl && (
                      <Button 
                        size="sm" 
                        className="bg-red-600 hover:bg-red-700 text-white flex-1"
                        onClick={() => window.open(tour.ticketUrl, '_blank')}
                        data-testid={`button-tickets-${tour.id}`}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Tickets
                      </Button>
                    )}
                    {tour.ticketmasterUrl && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 flex-1"
                        onClick={() => window.open(tour.ticketmasterUrl, '_blank')}
                        data-testid={`button-ticketmaster-${tour.id}`}
                      >
                        Ticketmaster
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { SimpleToursPage };