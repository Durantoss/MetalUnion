import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, MapPin, ExternalLink, Clock } from "lucide-react";
import type { Tour } from "@shared/schema";

export default function Tours() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: allTours = [], isLoading } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const filterTours = (tours: Tour[], query: string) => {
    if (!query) return tours;
    const searchTerm = query.toLowerCase();
    return tours.filter(tour => 
      tour.tourName.toLowerCase().includes(searchTerm) ||
      tour.venue.toLowerCase().includes(searchTerm) ||
      tour.city.toLowerCase().includes(searchTerm) ||
      tour.country.toLowerCase().includes(searchTerm)
    );
  };

  const now = new Date();
  const upcomingTours = filterTours(
    allTours.filter(tour => new Date(tour.date) > now),
    searchQuery
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastTours = filterTours(
    allTours.filter(tour => new Date(tour.date) <= now),
    searchQuery
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short',
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

  const getStatusBadge = (tour: Tour) => {
    const isUpcoming = new Date(tour.date) > now;
    
    if (tour.status === 'sold_out') {
      return <Badge className="bg-yellow-600 text-white">Sold Out</Badge>;
    }
    if (tour.status === 'cancelled') {
      return <Badge className="bg-red-600 text-white">Cancelled</Badge>;
    }
    if (isUpcoming) {
      return <Badge className="bg-green-600 text-white">Upcoming</Badge>;
    }
    return <Badge className="bg-gray-600 text-white">Completed</Badge>;
  };

  const TourCard = ({ tour }: { tour: Tour }) => (
    <Card key={tour.id} className="bg-card-dark border-metal-gray hover:border-metal-red transition-colors" data-testid={`card-tour-${tour.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0 flex-1">
            <img 
              src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
              alt={tour.venue}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-black text-lg truncate" data-testid={`text-tour-name-${tour.id}`}>
                  {tour.tourName}
                </h3>
                {getStatusBadge(tour)}
              </div>
              <div className="flex items-center text-gray-400 text-sm mb-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span data-testid={`text-tour-venue-${tour.id}`}>
                  {tour.venue}, {tour.city}, {tour.country}
                </span>
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                <span data-testid={`text-tour-date-${tour.id}`}>
                  {formatDate(tour.date)}
                </span>
                <Clock className="w-4 h-4 ml-3 mr-1" />
                <span data-testid={`text-tour-time-${tour.id}`}>
                  {formatTime(tour.date)}
                </span>
              </div>
              {tour.price && (
                <p className="text-sm text-gray-400 mt-1" data-testid={`text-tour-price-${tour.id}`}>
                  From {tour.price}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {tour.status !== 'cancelled' && new Date(tour.date) > now && (
              <div className="flex space-x-2">
                {/* Ticketmaster Button */}
                {tour.ticketmasterUrl && (
                  <Button 
                    onClick={() => window.open(tour.ticketmasterUrl!, '_blank')}
                    className={`font-bold uppercase text-sm tracking-wider ${
                      tour.status === 'sold_out' 
                        ? 'bg-gray-600 hover:bg-gray-700 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={tour.status === 'sold_out'}
                    data-testid={`button-ticketmaster-${tour.id}`}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {tour.status === 'sold_out' ? 'Sold Out' : 'Ticketmaster'}
                  </Button>
                )}
                
                {/* SeatGeek Button */}
                {tour.seatgeekUrl && (
                  <Button 
                    onClick={() => window.open(tour.seatgeekUrl!, '_blank')}
                    className={`font-bold uppercase text-sm tracking-wider ${
                      tour.status === 'sold_out' 
                        ? 'bg-gray-600 hover:bg-gray-700 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                    disabled={tour.status === 'sold_out'}
                    data-testid={`button-seatgeek-${tour.id}`}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {tour.status === 'sold_out' ? 'Sold Out' : 'SeatGeek'}
                  </Button>
                )}
                
                {/* Fallback to general ticket URL if no specific platform URLs */}
                {!tour.ticketmasterUrl && !tour.seatgeekUrl && tour.ticketUrl && (
                  <Button 
                    onClick={() => window.open(tour.ticketUrl!, '_blank')}
                    className={`font-bold uppercase text-sm tracking-wider ${
                      tour.status === 'sold_out' 
                        ? 'bg-gray-600 hover:bg-gray-700 cursor-not-allowed' 
                        : 'bg-metal-red hover:bg-metal-red-bright'
                    }`}
                    disabled={tour.status === 'sold_out'}
                    data-testid={`button-tickets-${tour.id}`}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {tour.status === 'sold_out' ? 'Sold Out' : 'Get Tickets'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-wider mb-4">Tour Dates</h1>
        <p className="text-gray-400 mb-6">
          Find upcoming concerts and festivals. Don't miss your favorite metal bands live!
        </p>
        
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search tours, venues, cities..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red pl-10"
              data-testid="input-tour-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <Button 
            type="submit" 
            className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider"
            data-testid="button-search-tours"
          >
            Search
          </Button>
        </form>

        {searchQuery && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400">
              {isLoading ? "Searching..." : `Found ${upcomingTours.length + pastTours.length} tours matching "${searchQuery}"`}
            </p>
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchQuery("");
                setSearchInput("");
              }}
              className="text-metal-red hover:text-metal-red-bright"
              data-testid="button-clear-search"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {/* Tours Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card-dark border border-metal-gray mb-8">
          <TabsTrigger 
            value="upcoming" 
            className="data-[state=active]:bg-metal-red data-[state=active]:text-white font-bold uppercase tracking-wider"
            data-testid="tab-upcoming"
          >
            Upcoming ({upcomingTours.length})
          </TabsTrigger>
          <TabsTrigger 
            value="past" 
            className="data-[state=active]:bg-metal-red data-[state=active]:text-white font-bold uppercase tracking-wider"
            data-testid="tab-past"
          >
            Past ({pastTours.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Tours */}
        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="bg-card-dark border-metal-gray">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-16 h-16 bg-metal-gray rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/3 bg-metal-gray" />
                        <Skeleton className="h-4 w-1/2 bg-metal-gray" />
                        <Skeleton className="h-4 w-1/4 bg-metal-gray" />
                      </div>
                      <Skeleton className="w-24 h-10 bg-metal-gray" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingTours.length === 0 ? (
            <Card className="bg-card-dark border-metal-gray">
              <CardContent className="p-12 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  {searchQuery ? "No Upcoming Tours Found" : "No Upcoming Tours"}
                </h2>
                <p className="text-gray-400 mb-6">
                  {searchQuery 
                    ? `No upcoming tours found matching "${searchQuery}". Try different search terms or check past tours.`
                    : "No upcoming tours scheduled yet. Check back soon for the latest tour announcements!"
                  }
                </p>
                {searchQuery && (
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setSearchInput("");
                    }}
                    className="bg-metal-red hover:bg-metal-red-bright"
                    data-testid="button-clear-search-upcoming"
                  >
                    Show All Upcoming Tours
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingTours.map(tour => <TourCard key={tour.id} tour={tour} />)}
            </div>
          )}
        </TabsContent>

        {/* Past Tours */}
        <TabsContent value="past">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="bg-card-dark border-metal-gray">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-16 h-16 bg-metal-gray rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/3 bg-metal-gray" />
                        <Skeleton className="h-4 w-1/2 bg-metal-gray" />
                        <Skeleton className="h-4 w-1/4 bg-metal-gray" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pastTours.length === 0 ? (
            <Card className="bg-card-dark border-metal-gray">
              <CardContent className="p-12 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  {searchQuery ? "No Past Tours Found" : "No Past Tours"}
                </h2>
                <p className="text-gray-400 mb-6">
                  {searchQuery 
                    ? `No past tours found matching "${searchQuery}". Try different search terms or check upcoming tours.`
                    : "No past tours recorded yet. Check back as bands complete their tours!"
                  }
                </p>
                {searchQuery && (
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setSearchInput("");
                    }}
                    className="bg-metal-red hover:bg-metal-red-bright"
                    data-testid="button-clear-search-past"
                  >
                    Show All Past Tours
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastTours.map(tour => <TourCard key={tour.id} tour={tour} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

    </main>
  );
}
