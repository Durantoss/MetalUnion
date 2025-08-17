import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ExternalLink, Calendar, MapPin, Clock, Ticket } from 'lucide-react';

interface Tour {
  id: string;
  tourName: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  ticketUrl?: string;
  alternativeTicketUrls?: {
    stubhub: string;
    seatgeek: string;
    vivid: string;
  };
  status: string;
}

interface TicketOption {
  name: string;
  url: string;
  description: string;
}

interface TicketLinksProps {
  bandId: string;
  bandName: string;
  onClose?: () => void;
}

export function TicketLinks({ bandId, bandName, onClose }: TicketLinksProps) {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  const { data: ticketData, isLoading } = useQuery({
    queryKey: [`/api/bands/${bandId}/tickets`],
  });

  const { data: bandData } = useQuery({
    queryKey: [`/api/bands/${bandId}`],
  });

  const tours: Tour[] = (bandData as any)?.upcomingTours || [];
  const directTicketUrl = (ticketData as any)?.directTicketUrl;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const getTicketOptions = (tour: Tour): TicketOption[] => {
    const options: TicketOption[] = [];
    
    if (tour.ticketUrl) {
      options.push({
        name: 'Ticketmaster',
        url: tour.ticketUrl,
        description: 'Official tickets'
      });
    }

    if (tour.alternativeTicketUrls) {
      options.push(
        {
          name: 'StubHub',
          url: tour.alternativeTicketUrls.stubhub,
          description: 'Resale marketplace'
        },
        {
          name: 'SeatGeek',
          url: tour.alternativeTicketUrls.seatgeek,
          description: 'Compare prices'
        },
        {
          name: 'Vivid Seats',
          url: tour.alternativeTicketUrls.vivid,
          description: 'Guaranteed tickets'
        }
      );
    }

    return options;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-white">
            Tickets for {bandName}
          </h3>
        </div>
        {onClose && (
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        )}
      </div>

      {/* Direct ticket search link */}
      <Card className="bg-gradient-to-r from-red-900/20 to-red-700/20 border-red-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Find All {bandName} Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-sm mb-4">
            Search for all {bandName} concerts and events across multiple dates and venues
          </p>
          <Button 
            onClick={() => window.open(directTicketUrl, '_blank')}
            className="bg-red-600 hover:bg-red-700 w-full"
            data-testid={`button-tickets-${bandName.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Search on Ticketmaster
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming tours */}
      {tours.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-white">Upcoming Tours</h4>
          {tours.filter(tour => isUpcoming(tour.date)).map((tour) => (
            <Card key={tour.id} className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">{tour.tourName}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {tour.venue}, {tour.city}, {tour.country}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(tour.date)}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={tour.status === 'upcoming' ? 'default' : 'outline'}
                    className="capitalize"
                  >
                    {tour.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getTicketOptions(tour).map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => window.open(option.url, '_blank')}
                      variant={index === 0 ? 'default' : 'outline'}
                      className={`flex flex-col items-start p-4 h-auto ${
                        index === 0 ? 'bg-red-600 hover:bg-red-700' : ''
                      }`}
                      data-testid={`button-ticket-${option.name.toLowerCase().replace(/\s+/g, '-')}-${tour.id}`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <ExternalLink className="h-4 w-4" />
                        <span className="font-medium">{option.name}</span>
                      </div>
                      <span className="text-xs opacity-80 mt-1">
                        {option.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">No Upcoming Tours</h4>
            <p className="text-gray-400 mb-4">
              {bandName} doesn't have any scheduled tours right now.
            </p>
            <Button 
              onClick={() => window.open(directTicketUrl, '_blank')}
              variant="outline"
              data-testid={`button-search-tickets-${bandName.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Search for Future Dates
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alternative ticket platforms */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-md">Other Ticket Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'StubHub', description: 'Resale marketplace' },
              { name: 'SeatGeek', description: 'Compare prices' },
              { name: 'Vivid Seats', description: 'Guaranteed tickets' }
            ].map((platform) => (
              <Button
                key={platform.name}
                onClick={() => {
                  const url = platform.name === 'StubHub' 
                    ? `https://www.stubhub.com/find/s/?q=${encodeURIComponent(bandName)}`
                    : platform.name === 'SeatGeek'
                    ? `https://seatgeek.com/search?q=${encodeURIComponent(bandName)}`
                    : `https://www.vividseats.com/search?searchterm=${encodeURIComponent(bandName)}`;
                  window.open(url, '_blank');
                }}
                variant="outline"
                className="flex flex-col items-center p-3 h-auto"
                data-testid={`button-platform-${platform.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="font-medium text-sm">{platform.name}</span>
                <span className="text-xs opacity-70 mt-1">
                  {platform.description}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}