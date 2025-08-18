import OpenAI from "openai";
import { searchConcerts, performGoogleSearch } from './googleSearch';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TourDiscoveryRequest {
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

export interface DiscoveredTour {
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
  platform: 'google' | 'ai-enhanced';
}

export class TourDiscoveryService {
  
  async discoverTours(request: TourDiscoveryRequest): Promise<DiscoveredTour[]> {
    try {
      console.log('Tour discovery request:', request);

      // Step 1: Use OpenAI to generate intelligent search queries
      const searchQueries = await this.generateIntelligentSearchQueries(request);
      console.log('Generated search queries:', searchQueries);
      
      // Step 2: Search using Google Custom Search with concert-specific queries
      const googleResults = await this.searchConcertEvents(searchQueries, request);
      console.log('Google search results:', googleResults.length);
      
      // Step 3: Use OpenAI to analyze, filter, and rank the results
      const analyzedEvents = await this.analyzeAndRankWithAI(googleResults, request);
      console.log('AI analyzed events:', analyzedEvents.length);
      
      // Step 4: Enrich with additional metadata and validation
      const enrichedEvents = await this.enrichEventData(analyzedEvents);
      
      return enrichedEvents;
    } catch (error) {
      console.error('Error in tour discovery:', error);
      // Return empty array instead of throwing to gracefully handle errors
      return [];
    }
  }

  private async generateIntelligentSearchQueries(request: TourDiscoveryRequest): Promise<string[]> {
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not available, using fallback queries');
      return this.generateFallbackQueries(request);
    }

    const prompt = `
    Generate 8 highly effective search queries for finding metal and rock concert tickets and tour information.
    
    User Preferences:
    - Location: ${request.userLocation || 'anywhere'}
    - Genres: ${request.preferredGenres?.join(', ') || 'metal, rock, hardcore'}
    - Favorite Artists: ${request.favoriteArtists?.join(', ') || 'none specified'}
    - Price Range: $${request.priceRange?.min || 0} - $${request.priceRange?.max || 500}
    - Date Range: ${request.dateRange?.start || 'any time'} to ${request.dateRange?.end || 'any time'}
    - Query: ${request.query || 'metal concerts'}
    
    Create search queries optimized for finding:
    1. Concert tickets on Ticketmaster, StubHub, SeatGeek
    2. Tour announcements and dates
    3. Venue-specific event listings
    4. Festival lineups and dates
    5. Band-specific tour information
    
    Focus on metal, rock, hardcore, and related genres. Include venue names, ticket platforms, and date ranges.
    Make queries specific enough to find real events but broad enough to get good coverage.
    
    Return as JSON: { "queries": ["query1", "query2", "query3", "query4", "query5", "query6", "query7", "query8"] }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || '{"queries": []}');
      return result.queries || this.generateFallbackQueries(request);
    } catch (error) {
      console.error('Error generating AI search queries:', error);
      return this.generateFallbackQueries(request);
    }
  }

  private generateFallbackQueries(request: TourDiscoveryRequest): string[] {
    const location = request.userLocation ? ` ${request.userLocation}` : '';
    const genres = request.preferredGenres || ['metal', 'rock'];
    const query = request.query || 'concerts';
    
    return [
      `${query} tickets${location} site:ticketmaster.com`,
      `metal rock concerts${location} site:seatgeek.com`,
      `${genres[0]} tour dates 2025${location}`,
      `live music events${location} site:stubhub.com`,
      `${query} venue tickets${location}`,
      `metal concerts${location} 2025 tour`,
      `rock festival${location} tickets`,
      `${query}${location} live music events`
    ];
  }

  private async searchConcertEvents(queries: string[], request: TourDiscoveryRequest): Promise<any[]> {
    const allResults: any[] = [];

    for (const query of queries) {
      try {
        // Use the existing Google search infrastructure
        const results = await searchConcerts(query, request.userLocation);
        allResults.push(...results);
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error searching for query "${query}":`, error);
      }
    }

    // Remove duplicates based on URL
    const uniqueResults = allResults.filter((item, index, arr) => 
      arr.findIndex(other => other.link === item.link) === index
    );

    console.log(`Found ${uniqueResults.length} unique results from ${allResults.length} total`);
    return uniqueResults.slice(0, 50); // Limit to prevent overwhelming the AI
  }

  private async analyzeAndRankWithAI(googleResults: any[], request: TourDiscoveryRequest): Promise<DiscoveredTour[]> {
    if (!process.env.OPENAI_API_KEY || googleResults.length === 0) {
      console.log('OpenAI API key not available or no results to analyze');
      return [];
    }

    const prompt = `
    Analyze these Google search results and extract legitimate metal/rock concert and tour information.
    Only include events that are clearly concerts, tours, or music festivals.
    
    Search Results: ${JSON.stringify(googleResults.slice(0, 20))}
    
    User Preferences:
    - Location: ${request.userLocation || 'any'}
    - Genres: ${request.preferredGenres?.join(', ') || 'metal, rock'}
    - Artists: ${request.favoriteArtists?.join(', ') || 'any metal/rock artists'}
    - Price Range: $${request.priceRange?.min || 0} - $${request.priceRange?.max || 500}
    
    Extract and return a JSON array of concert events. For each event, provide:
    {
      "events": [
        {
          "id": "unique_id",
          "title": "event_or_tour_name",
          "artist": "band_or_artist_name",
          "venue": "venue_name",
          "date": "YYYY-MM-DD",
          "time": "HH:MM",
          "location": {
            "address": "full_address_if_available",
            "city": "city",
            "state": "state_or_country"
          },
          "price": {
            "min": 50,
            "max": 150,
            "currency": "USD"
          },
          "ticketUrl": "direct_ticket_link",
          "description": "event_description",
          "genre": "specific_genre",
          "relevanceScore": 0.85,
          "aiRecommendationReason": "why_this_matches_user_preferences"
        }
      ]
    }
    
    Requirements:
    1. Only include real, legitimate concert events
    2. Focus on metal, rock, hardcore, and related genres
    3. Assign relevanceScore based on match to user preferences (0.0-1.0)
    4. Provide meaningful aiRecommendationReason explaining the match
    5. Only include events with valid ticket URLs
    6. Prefer events that match user's location preference
    7. Filter out outdated events (should be future dates)
    8. Maximum 15 events in response
    
    If no valid events can be extracted, return {"events": []}.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 3000
      });

      const result = JSON.parse(response.choices[0].message.content || '{"events": []}');
      const events = result.events || [];
      
      // Add platform and ensure required fields
      return events.map((event: any) => ({
        ...event,
        id: event.id || `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        platform: 'ai-enhanced' as const
      }));
    } catch (error) {
      console.error('Error analyzing events with AI:', error);
      return [];
    }
  }

  private async enrichEventData(events: DiscoveredTour[]): Promise<DiscoveredTour[]> {
    // Add additional enrichment if needed
    return events.map(event => ({
      ...event,
      // Ensure all required fields are present
      id: event.id || `enriched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUrl: event.imageUrl || undefined,
      platform: event.platform || 'google'
    }));
  }

  async generateEventInsights(event: DiscoveredTour): Promise<{
    artistInsights: string;
    venueInfo: string;
    pricingAnalysis: string;
    recommendationTips: string;
  }> {
    if (!process.env.OPENAI_API_KEY) {
      return {
        artistInsights: 'Artist insights require OpenAI API key configuration.',
        venueInfo: 'Venue information requires OpenAI API key configuration.',
        pricingAnalysis: 'Pricing analysis requires OpenAI API key configuration.',
        recommendationTips: 'Recommendation tips require OpenAI API key configuration.'
      };
    }

    const prompt = `
    Provide detailed insights for this metal/rock concert event:
    ${JSON.stringify(event)}
    
    Generate insights in these categories:
    1. Artist insights (background, musical style, similar artists, why metal/rock fans would enjoy them)
    2. Venue information (capacity, reputation, location benefits, acoustics if known)
    3. Pricing analysis (value assessment, typical pricing for similar events, worth evaluation)
    4. Recommendation tips (best seating areas, what to expect, preparation suggestions)
    
    Focus on helping metal and rock fans make informed decisions about attending this event.
    
    Return as JSON:
    {
      "artistInsights": "detailed_artist_information",
      "venueInfo": "venue_details_and_highlights",
      "pricingAnalysis": "price_value_analysis",
      "recommendationTips": "helpful_attendance_tips"
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error generating event insights:', error);
      return {
        artistInsights: 'Unable to generate artist insights at this time.',
        venueInfo: 'Unable to generate venue information at this time.',
        pricingAnalysis: 'Unable to generate pricing analysis at this time.',
        recommendationTips: 'Unable to generate recommendation tips at this time.'
      };
    }
  }
}