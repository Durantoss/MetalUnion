// Simplified Events Page to prevent React hooks errors
import { Calendar, MapPin, Music, Star, Clock, DollarSign, Users, ExternalLink } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  artist: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  price: string;
  genre: string;
  image: string;
  description: string;
  attendees: number;
  rating: number;
}

export function EnhancedEventsPage() {
  // Demo events data for testing
  const events: Event[] = [
    {
      id: '1',
      title: 'Metallica World Tour 2025',
      artist: 'Metallica',
      venue: 'Madison Square Garden',
      location: 'New York, NY',
      date: 'March 15, 2025',
      time: '8:00 PM',
      price: '$125 - $350',
      genre: 'Heavy Metal',
      image: '/api/placeholder/400/300',
      description: 'The legendary metal band returns with their biggest tour yet, featuring classics and new material.',
      attendees: 18500,
      rating: 4.9
    },
    {
      id: '2',
      title: 'Iron Maiden Legacy Tour',
      artist: 'Iron Maiden',
      venue: 'Red Rocks Amphitheatre',
      location: 'Morrison, CO',
      date: 'April 22, 2025',
      time: '7:30 PM',
      price: '$89 - $275',
      genre: 'Heavy Metal',
      image: '/api/placeholder/400/300',
      description: 'Up the Irons! Experience the epic storytelling and incredible musicianship of Iron Maiden.',
      attendees: 9525,
      rating: 4.8
    },
    {
      id: '3',
      title: 'System of a Down Reunion',
      artist: 'System of a Down',
      venue: 'Download Festival',
      location: 'Castle Donington, UK',
      date: 'June 14, 2025',
      time: '9:00 PM',
      price: '$299 - $599',
      genre: 'Nu Metal',
      image: '/api/placeholder/400/300',
      description: 'The most anticipated reunion of the decade! SOAD returns to the stage.',
      attendees: 85000,
      rating: 5.0
    },
    {
      id: '4',
      title: 'Slipknot Knotfest',
      artist: 'Slipknot',
      venue: 'Knotfest Grounds',
      location: 'San Bernardino, CA',
      date: 'May 10, 2025',
      time: '6:00 PM',
      price: '$149 - $425',
      genre: 'Nu Metal',
      image: '/api/placeholder/400/300',
      description: 'The nine bring chaos and incredible energy in this festival experience.',
      attendees: 45000,
      rating: 4.7
    }
  ];

  const handleTicketClick = (event: Event) => {
    alert(`Redirecting to ticket purchase for ${event.title}\nVenue: ${event.venue}\nDate: ${event.date}`);
  };

  const handleViewDetails = (event: Event) => {
    alert(`Event Details:\n\n${event.title}\nArtist: ${event.artist}\nVenue: ${event.venue}\nLocation: ${event.location}\nDate: ${event.date} at ${event.time}\nPrice Range: ${event.price}\n\n${event.description}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent mb-4">
            Event Discovery
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover the best metal and rock concerts with AI-powered recommendations. 
            Find your next unforgettable live music experience.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-black/40 border border-red-500/30 rounded-lg p-6 text-center">
            <Star className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">AI Recommendations</h3>
            <p className="text-gray-400">Smart event matching based on your musical taste and location</p>
          </div>
          <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-6 text-center">
            <MapPin className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Local Events</h3>
            <p className="text-gray-400">Find concerts and festivals happening near you</p>
          </div>
          <div className="bg-black/40 border border-blue-500/30 rounded-lg p-6 text-center">
            <Music className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Genre Focused</h3>
            <p className="text-gray-400">Specialized in metal, rock, and alternative music</p>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-black/40 border border-red-900/30 rounded-lg overflow-hidden hover:border-red-500/50 transition-all">
              {/* Event Image Placeholder */}
              <div className="h-48 bg-gradient-to-r from-red-600/20 to-yellow-600/20 flex items-center justify-center">
                <Music className="h-16 w-16 text-red-400" />
              </div>
              
              {/* Event Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                    <p className="text-red-400 font-semibold">{event.artist}</p>
                    <p className="text-gray-400 text-sm">{event.genre}</p>
                  </div>
                  <div className="flex items-center space-x-1 bg-yellow-600/20 px-2 py-1 rounded">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">{event.rating}</span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{event.venue}</span>
                    <span className="text-gray-500">•</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{event.date}</span>
                    <span className="text-gray-500">•</span>
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>{event.price}</span>
                    <span className="text-gray-500">•</span>
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{event.attendees.toLocaleString()} attending</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{event.description}</p>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleTicketClick(event)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center space-x-2 touch-manipulation"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Get Tickets</span>
                  </button>
                  <button 
                    onClick={() => handleViewDetails(event)}
                    className="px-4 py-3 border border-red-500/30 text-red-400 rounded-lg hover:border-red-400 hover:bg-red-600/10 transition-all touch-manipulation"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-black/40 border border-red-900/30 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Want More Personalized Recommendations?</h2>
          <p className="text-gray-400 mb-6">
            Connect your music preferences to get AI-powered event suggestions tailored just for you.
          </p>
          <button className="bg-gradient-to-r from-red-600 to-yellow-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-red-700 hover:to-yellow-700 transition-all transform hover:scale-105">
            Set Up Preferences
          </button>
        </div>
      </div>
    </div>
  );
}