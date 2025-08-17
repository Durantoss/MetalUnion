import OpenAI from "openai";
import { searchConcerts } from './googleSearch';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface EventDiscoveryRequest {
  userLocation?: string;
  preferredGenres?: string[];
  favoriteArtists?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  radius?: number; // in miles
  query?: string;
}

export interface DiscoveredEvent {
  id: string;
  title: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  price: {
    min: number;
    max: number;
    currency: string;
  };
  ticketUrl: string;
  description: string;
  genre: string;
  imageUrl?: string;
  relevanceScore: number;
  aiRecommendationReason: string;
  platform: 'seatgeek' | 'ticketmaster' | 'bandsintown';
}

interface SeatGeekEvent {
  id: number;
  title: string;
  performers: Array<{
    name: string;
    image: string;
    genres?: Array<{ name: string }>;
  }>;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    location: { lat: number; lon: number };
  };
  datetime_utc: string;
  stats: {
    lowest_price: number | null;
    average_price: number | null;
    highest_price: number | null;
  };
  url: string;
  short_title: string;
}

interface TicketmasterEvent {
  id: string;
  name: string;
  dates: {
    start: {
      localDate: string;
      localTime: string;
    };
  };
  _embedded?: {
    attractions?: Array<{
      name: string;
      images?: Array<{ url: string }>;
      classifications?: Array<{
        genre?: { name: string };
      }>;
    }>;
    venues?: Array<{
      name: string;
      address?: { line1: string };
      city?: { name: string };
      state?: { name: string };
      location?: { latitude: string; longitude: string };
    }>;
  };
  priceRanges?: Array<{
    min: number;
    max: number;
    currency: string;
  }>;
  url: string;
}

export class MultiPlatformEventService {
  
  async discoverEvents(request: EventDiscoveryRequest): Promise<DiscoveredEvent[]> {
    console.log('Starting multi-platform event discovery with request:', request);
    
    try {
      const allEvents: DiscoveredEvent[] = [];
      
      // Search SeatGeek
      if (process.env.SEATGEEK_CLIENT_ID) {
        console.log('Searching SeatGeek...');
        const seatgeekEvents = await this.searchSeatGeek(request);
        allEvents.push(...seatgeekEvents);
        console.log(`Found ${seatgeekEvents.length} SeatGeek events`);
      } else {
        console.log('SeatGeek API key not available, skipping...');
      }
      
      // Search Ticketmaster
      if (process.env.TICKETMASTER_API_KEY) {
        console.log('Searching Ticketmaster...');
        const ticketmasterEvents = await this.searchTicketmaster(request);
        allEvents.push(...ticketmasterEvents);
        console.log(`Found ${ticketmasterEvents.length} Ticketmaster events`);
      } else {
        console.log('Ticketmaster API key not available, skipping...');
      }
      
      // Search Bandsintown (artist-specific only)
      if (process.env.BANDSINTOWN_API_KEY && request.favoriteArtists?.length) {
        console.log('Searching Bandsintown for specific artists...');
        const bandsintownEvents = await this.searchBandsintown(request);
        allEvents.push(...bandsintownEvents);
        console.log(`Found ${bandsintownEvents.length} Bandsintown events`);
      }
      
      // Try Google Search API as a fallback if other platforms have no results
      if (allEvents.length === 0 && process.env.GOOGLE_API_KEY) {
        console.log('Trying Google Search API for real event data...');
        try {
          const googleEvents = await this.searchGoogleEvents(request);
          allEvents.push(...googleEvents);
          console.log(`Found ${googleEvents.length} Google events`);
        } catch (error) {
          console.error('Error searching Google events:', error);
        }
      }

      if (allEvents.length === 0) {
        console.log('No events found from any platform, returning demo events');
        return this.generateDemoEvents(request);
      }
      
      // Remove duplicates and rank events
      const uniqueEvents = this.removeDuplicates(allEvents);
      const rankedEvents = await this.rankEventsWithAI(uniqueEvents, request);
      
      console.log(`Returning ${rankedEvents.length} ranked events`);
      return rankedEvents.slice(0, 20); // Limit to 20 results
      
    } catch (error) {
      console.error('Error in multi-platform event discovery:', error);
      return this.generateDemoEvents(request);
    }
  }
  
  private async searchSeatGeek(request: EventDiscoveryRequest): Promise<DiscoveredEvent[]> {
    try {
      const params = new URLSearchParams({
        client_id: process.env.SEATGEEK_CLIENT_ID!,
        'taxonomy_name': 'concert',
        per_page: '20'
      });
      
      // Location filtering
      if (request.userLocation) {
        params.append('venue.city', request.userLocation);
      }
      
      // Genre/query filtering
      if (request.query) {
        params.append('q', request.query);
      } else if (request.preferredGenres?.length) {
        params.append('q', request.preferredGenres.join(' OR '));
      } else {
        params.append('q', 'metal rock hardcore punk');
      }
      
      // Price filtering
      if (request.priceRange) {
        params.append('lowest_price.gte', request.priceRange.min.toString());
        params.append('highest_price.lte', request.priceRange.max.toString());
      }
      
      // Date filtering
      if (request.dateRange?.start) {
        params.append('datetime_utc.gte', request.dateRange.start.toISOString());
      }
      if (request.dateRange?.end) {
        params.append('datetime_utc.lte', request.dateRange.end.toISOString());
      }
      
      const response = await fetch(`https://api.seatgeek.com/2/events?${params}`);
      
      if (!response.ok) {
        console.error('SeatGeek API error:', response.status, response.statusText);
        return [];
      }
      
      const data = await response.json();
      return this.transformSeatGeekEvents(data.events || []);
      
    } catch (error) {
      console.error('Error searching SeatGeek:', error);
      return [];
    }
  }
  
  private async searchTicketmaster(request: EventDiscoveryRequest): Promise<DiscoveredEvent[]> {
    try {
      const params = new URLSearchParams({
        apikey: process.env.TICKETMASTER_API_KEY!,
        classificationName: 'music',
        size: '20'
      });
      
      // Location filtering
      if (request.userLocation) {
        params.append('city', request.userLocation);
      }
      
      // Genre/query filtering
      if (request.query) {
        params.append('keyword', request.query);
      } else if (request.preferredGenres?.length) {
        params.append('keyword', request.preferredGenres.join(' '));
      } else {
        params.append('keyword', 'metal rock hardcore punk');
      }
      
      // Date filtering
      if (request.dateRange?.start) {
        params.append('startDateTime', request.dateRange.start.toISOString());
      }
      if (request.dateRange?.end) {
        params.append('endDateTime', request.dateRange.end.toISOString());
      }
      
      const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`);
      
      if (!response.ok) {
        console.error('Ticketmaster API error:', response.status, response.statusText);
        return [];
      }
      
      const data = await response.json();
      return this.transformTicketmasterEvents(data._embedded?.events || []);
      
    } catch (error) {
      console.error('Error searching Ticketmaster:', error);
      return [];
    }
  }
  
  private async searchBandsintown(request: EventDiscoveryRequest): Promise<DiscoveredEvent[]> {
    try {
      const events: DiscoveredEvent[] = [];
      
      if (!request.favoriteArtists?.length) {
        return [];
      }
      
      // Bandsintown is artist-centric, so search for each favorite artist
      for (const artist of request.favoriteArtists.slice(0, 5)) { // Limit to 5 artists
        try {
          const encodedArtist = encodeURIComponent(artist);
          const url = `https://rest.bandsintown.com/artists/${encodedArtist}/events?app_id=${process.env.BANDSINTOWN_API_KEY}`;
          
          const response = await fetch(url);
          if (response.ok) {
            const artistEvents = await response.json();
            if (Array.isArray(artistEvents)) {
              const transformedEvents = this.transformBandsintownEvents(artistEvents, artist);
              events.push(...transformedEvents);
            }
          }
        } catch (error) {
          console.error(`Error searching Bandsintown for ${artist}:`, error);
          continue;
        }
      }
      
      return events;
      
    } catch (error) {
      console.error('Error searching Bandsintown:', error);
      return [];
    }
  }
  
  private transformSeatGeekEvents(events: SeatGeekEvent[]): DiscoveredEvent[] {
    return events.map(event => ({
      id: `seatgeek-${event.id}`,
      title: event.title,
      artist: event.performers?.[0]?.name || event.short_title,
      venue: event.venue.name,
      date: event.datetime_utc.split('T')[0],
      time: new Date(event.datetime_utc).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      location: {
        address: event.venue.address,
        city: event.venue.city,
        state: event.venue.state,
        coordinates: {
          lat: event.venue.location.lat,
          lng: event.venue.location.lon
        }
      },
      price: {
        min: event.stats.lowest_price || 25,
        max: event.stats.highest_price || event.stats.average_price || 100,
        currency: 'USD'
      },
      ticketUrl: event.url,
      description: `${event.title} at ${event.venue.name}`,
      genre: event.performers?.[0]?.genres?.[0]?.name || 'Music',
      imageUrl: event.performers?.[0]?.image,
      relevanceScore: 0.8,
      aiRecommendationReason: 'Popular event in your area',
      platform: 'seatgeek'
    }));
  }
  
  private transformTicketmasterEvents(events: TicketmasterEvent[]): DiscoveredEvent[] {
    return events.map(event => {
      const venue = event._embedded?.venues?.[0];
      const attraction = event._embedded?.attractions?.[0];
      const priceRange = event.priceRanges?.[0];
      
      return {
        id: `ticketmaster-${event.id}`,
        title: event.name,
        artist: attraction?.name || event.name,
        venue: venue?.name || 'TBA',
        date: event.dates.start.localDate,
        time: event.dates.start.localTime || '20:00',
        location: {
          address: venue?.address?.line1 || '',
          city: venue?.city?.name || '',
          state: venue?.state?.name || '',
          coordinates: venue?.location ? {
            lat: parseFloat(venue.location.latitude),
            lng: parseFloat(venue.location.longitude)
          } : undefined
        },
        price: {
          min: priceRange?.min || 30,
          max: priceRange?.max || 150,
          currency: priceRange?.currency || 'USD'
        },
        ticketUrl: event.url,
        description: `${event.name} at ${venue?.name || 'venue TBA'}`,
        genre: attraction?.classifications?.[0]?.genre?.name || 'Music',
        imageUrl: attraction?.images?.[0]?.url,
        relevanceScore: 0.8,
        aiRecommendationReason: 'Highly rated event',
        platform: 'ticketmaster'
      };
    });
  }
  
  private transformBandsintownEvents(events: any[], artistName: string): DiscoveredEvent[] {
    return events.map(event => ({
      id: `bandsintown-${event.id}`,
      title: `${artistName} Live`,
      artist: artistName,
      venue: event.venue?.name || 'TBA',
      date: event.datetime?.split('T')[0] || '',
      time: event.datetime ? new Date(event.datetime).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : '20:00',
      location: {
        address: event.venue?.street_address || '',
        city: event.venue?.city || '',
        state: event.venue?.region || '',
        coordinates: event.venue?.latitude ? {
          lat: parseFloat(event.venue.latitude),
          lng: parseFloat(event.venue.longitude)
        } : undefined
      },
      price: {
        min: 25,
        max: 100,
        currency: 'USD'
      },
      ticketUrl: event.url || event.facebook_rsvp_url || '',
      description: `${artistName} live at ${event.venue?.name || 'venue TBA'}`,
      genre: 'Music',
      imageUrl: undefined,
      relevanceScore: 0.9, // High relevance since it's a favorite artist
      aiRecommendationReason: `Your favorite artist ${artistName} is performing!`,
      platform: 'bandsintown'
    }));
  }
  
  private removeDuplicates(events: DiscoveredEvent[]): DiscoveredEvent[] {
    const seen = new Set();
    return events.filter(event => {
      const key = `${event.artist}-${event.venue}-${event.date}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  private async rankEventsWithAI(events: DiscoveredEvent[], request: EventDiscoveryRequest): Promise<DiscoveredEvent[]> {
    if (events.length === 0) return events;
    
    try {
      const prompt = `
You are an AI music recommendation expert. Rank and enhance these events based on user preferences:

User Preferences:
- Location: ${request.userLocation || 'Any'}
- Genres: ${request.preferredGenres?.join(', ') || 'Metal, Rock, Hardcore'}
- Favorite Artists: ${request.favoriteArtists?.join(', ') || 'None specified'}
- Price Range: $${request.priceRange?.min || 0}-$${request.priceRange?.max || 500}

Events to rank:
${events.slice(0, 10).map((event, i) => `
${i + 1}. ${event.title} by ${event.artist}
   Venue: ${event.venue}
   Date: ${event.date}
   Price: $${event.price.min}-$${event.price.max}
   Genre: ${event.genre}
`).join('\n')}

For each event, provide:
1. A relevance score (0.0-1.0)
2. A compelling reason why this event matches the user's preferences (be specific and engaging)

Respond in JSON format:
{
  "rankings": [
    {
      "index": 0,
      "relevanceScore": 0.95,
      "recommendationReason": "Perfect match for metal fans - this underground hardcore show features crushing riffs and an intimate venue experience"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const ranking = JSON.parse(response.choices[0].message.content || '{"rankings": []}');
      
      // Apply AI rankings
      ranking.rankings?.forEach((rank: any) => {
        if (events[rank.index]) {
          events[rank.index].relevanceScore = rank.relevanceScore;
          events[rank.index].aiRecommendationReason = rank.recommendationReason;
        }
      });
      
      // Sort by relevance score
      return events.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
    } catch (error) {
      console.error('Error ranking events with AI:', error);
      return events.sort((a, b) => a.platform === 'bandsintown' ? -1 : 1); // Prioritize Bandsintown (favorite artists)
    }
  }
  
  private generateDemoEvents(request: EventDiscoveryRequest): DiscoveredEvent[] {
    const demoEvents: DiscoveredEvent[] = [
      {
        id: 'demo-1',
        title: 'Metal Masters Live',
        artist: 'Iron Thunder',
        venue: 'The Metal Venue',
        date: '2025-09-15',
        time: '20:00',
        location: {
          address: '123 Rock Street',
          city: request.userLocation || 'Rock City',
          state: 'CA',
        },
        price: { min: 45, max: 85, currency: 'USD' },
        ticketUrl: 'https://example.com/tickets/demo-1',
        description: 'An epic night of crushing metal riffs and thunderous drums',
        genre: 'Metal',
        relevanceScore: 0.95,
        aiRecommendationReason: 'Perfect match for metal enthusiasts - powerful live performance with excellent venue acoustics',
        platform: 'seatgeek'
      },
      {
        id: 'demo-2',
        title: 'Hardcore Uprising',
        artist: 'Brutal Force',
        venue: 'Underground Club',
        date: '2025-09-20',
        time: '21:30',
        location: {
          address: '456 Hardcore Ave',
          city: request.userLocation || 'Punk City',
          state: 'NY',
        },
        price: { min: 25, max: 45, currency: 'USD' },
        ticketUrl: 'https://example.com/tickets/demo-2',
        description: 'Raw, unfiltered hardcore energy in an intimate setting',
        genre: 'Hardcore',
        relevanceScore: 0.88,
        aiRecommendationReason: 'Ideal for hardcore fans seeking authentic underground experience with affordable pricing',
        platform: 'ticketmaster'
      }
    ];
    
    return demoEvents;
  }
  
  async generateEventInsights(event: DiscoveredEvent): Promise<any> {
    try {
      const prompt = `
Analyze this music event and provide detailed insights:

Event: ${event.title}
Artist: ${event.artist}
Venue: ${event.venue}
Date: ${event.date}
Genre: ${event.genre}
Price: $${event.price.min}-$${event.price.max}
Location: ${event.location.city}, ${event.location.state}

Provide insights in JSON format:
{
  "artistAnalysis": "Brief analysis of the artist's style and reputation",
  "venueInsights": "Information about the venue and its characteristics", 
  "pricingAnalysis": "Is this good value? Market comparison",
  "crowdExpectation": "What kind of crowd/atmosphere to expect",
  "recommendations": ["3-4 specific tips for attendees"],
  "similarEvents": ["2-3 similar events they might enjoy"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error generating event insights:', error);
      return {
        artistAnalysis: "Exciting live performer with great energy",
        venueInsights: "Popular venue known for great sound quality",
        pricingAnalysis: "Competitive pricing for this type of event",
        crowdExpectation: "Energetic crowd of music enthusiasts",
        recommendations: ["Arrive early for best spots", "Check out the opening acts", "Bring earplugs for comfort"],
        similarEvents: ["Other metal shows in the area", "Upcoming rock festivals"]
      };
    }
  }

  private async searchGoogleEvents(request: EventDiscoveryRequest): Promise<DiscoveredEvent[]> {
    try {
      const searchQuery = this.buildGoogleSearchQuery(request);
      const googleResults = await searchConcerts(searchQuery, request.userLocation || 'US');
      
      // Transform Google search results to our event format
      const events: DiscoveredEvent[] = [];
      
      for (const result of googleResults.slice(0, 10)) {
        try {
          // Extract event information using AI
          const eventData = await this.extractEventFromGoogleResult(result, request);
          if (eventData) {
            events.push(eventData);
          }
        } catch (error) {
          console.error('Error processing Google result:', error);
        }
      }
      
      return events;
    } catch (error) {
      console.error('Error searching Google events:', error);
      return [];
    }
  }

  private buildGoogleSearchQuery(request: EventDiscoveryRequest): string {
    const parts = [];
    
    if (request.query) {
      parts.push(request.query);
    } else if (request.preferredGenres?.length) {
      parts.push(request.preferredGenres.join(' OR '));
    } else {
      parts.push('metal rock hardcore punk');
    }
    
    parts.push('concert tickets 2025');
    
    if (request.userLocation) {
      parts.push(`"${request.userLocation}"`);
    }
    
    return parts.join(' ');
  }

  private async extractEventFromGoogleResult(result: any, request: EventDiscoveryRequest): Promise<DiscoveredEvent | null> {
    if (!process.env.OPENAI_API_KEY) return null;
    
    try {
      const prompt = `Extract concert event information from this search result:
Title: ${result.title}
Snippet: ${result.snippet}
URL: ${result.link}

Extract and return JSON with:
{
  "title": "Concert title",
  "artist": "Artist name", 
  "venue": "Venue name",
  "date": "YYYY-MM-DD format",
  "time": "HH:MM format",
  "location": {
    "city": "City",
    "state": "State abbreviation",
    "address": "Venue address if available"
  },
  "price": {
    "min": 30,
    "max": 100,
    "currency": "USD"
  },
  "genre": "Music genre",
  "description": "Brief description",
  "isValidEvent": true
}

If this is not a valid concert event listing, return {"isValidEvent": false}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const extracted = JSON.parse(response.choices[0].message.content || '{}');
      
      if (!extracted.isValidEvent) {
        return null;
      }

      // Generate AI recommendation reason
      const aiReason = await this.generateRecommendationReason(extracted, request);

      return {
        id: `google-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: extracted.title || 'Concert Event',
        artist: extracted.artist || 'Various Artists',
        venue: extracted.venue || 'TBD Venue',
        date: extracted.date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: extracted.time || '20:00',
        location: {
          address: extracted.location?.address || '',
          city: extracted.location?.city || request.userLocation?.split(',')[0] || 'TBD',
          state: extracted.location?.state || 'CA'
        },
        price: {
          min: extracted.price?.min || 25,
          max: extracted.price?.max || 75,
          currency: extracted.price?.currency || 'USD'
        },
        ticketUrl: result.link,
        description: extracted.description || 'Concert event details',
        genre: extracted.genre || 'Rock',
        relevanceScore: 0.7,
        aiRecommendationReason: aiReason,
        platform: 'seatgeek' // Use consistent platform for UI display
      };

    } catch (error) {
      console.error('Error extracting event from Google result:', error);
      return null;
    }
  }

  private async generateRecommendationReason(eventData: any, request: EventDiscoveryRequest): Promise<string> {
    try {
      const userPrefs = request.preferredGenres?.join(', ') || 'rock and metal';
      const prompt = `Generate a brief recommendation reason for this concert:
      
Event: ${eventData.title} by ${eventData.artist}
Genre: ${eventData.genre}
User likes: ${userPrefs}
Location: ${eventData.location?.city}

Write 1-2 sentences explaining why this event matches the user's preferences.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 100
      });

      return response.choices[0].message.content?.trim() || 
        `Great ${eventData.genre} event that matches your taste for ${userPrefs} music`;

    } catch (error) {
      return `Recommended based on your interest in ${request.preferredGenres?.join(' and ') || 'rock music'}`;
    }
  }
}