import OpenAI from "openai";
import { google } from "googleapis";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Google Custom Search API setup for event discovery
const customsearch = google.customsearch('v1');

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
}

export class EventDiscoveryService {
  
  async discoverEvents(request: EventDiscoveryRequest): Promise<DiscoveredEvent[]> {
    try {
      // Step 1: Use OpenAI to generate intelligent search queries
      const searchQueries = await this.generateSearchQueries(request);
      
      // Step 2: Search for events using Google Custom Search
      const rawEvents = await this.searchEvents(searchQueries);
      
      // Step 3: Use OpenAI to analyze and rank events
      const rankedEvents = await this.analyzeAndRankEvents(rawEvents, request);
      
      // Step 4: Enrich events with ticket information
      const enrichedEvents = await this.enrichWithTicketInfo(rankedEvents);
      
      return enrichedEvents;
    } catch (error) {
      console.error('Error in event discovery:', error);
      throw new Error('Failed to discover events');
    }
  }

  private async generateSearchQueries(request: EventDiscoveryRequest): Promise<string[]> {
    const prompt = `
    Generate 5 effective search queries for finding concert and music events based on these preferences:
    
    Location: ${request.userLocation || 'anywhere'}
    Genres: ${request.preferredGenres?.join(', ') || 'any'}
    Favorite Artists: ${request.favoriteArtists?.join(', ') || 'none specified'}
    Price Range: $${request.priceRange?.min || 0} - $${request.priceRange?.max || 200}
    Date Range: ${request.dateRange?.start || 'any time'} to ${request.dateRange?.end || 'any time'}
    
    Create search queries that would find concert tickets, music events, and live performances.
    Focus on Ticketmaster, StubHub, Eventbrite, and venue websites.
    
    Return as JSON: { "queries": ["query1", "query2", "query3", "query4", "query5"] }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"queries": []}');
    return result.queries || [];
  }

  private async searchEvents(queries: string[]): Promise<any[]> {
    const allResults: any[] = [];

    for (const query of queries) {
      try {
        const response = await customsearch.cse.list({
          auth: process.env.GOOGLE_API_KEY,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
          q: `${query} tickets concerts events`,
          num: 10,
        });

        if (response.data.items) {
          allResults.push(...response.data.items);
        }
      } catch (error) {
        console.error(`Error searching for: ${query}`, error);
      }
    }

    return allResults;
  }

  private async analyzeAndRankEvents(rawEvents: any[], request: EventDiscoveryRequest): Promise<DiscoveredEvent[]> {
    const prompt = `
    Analyze these search results and extract concert/music event information. 
    Filter and rank them based on user preferences.
    
    User Preferences:
    - Location: ${request.userLocation || 'anywhere'}
    - Genres: ${request.preferredGenres?.join(', ') || 'any'}
    - Artists: ${request.favoriteArtists?.join(', ') || 'none'}
    - Price Range: $${request.priceRange?.min || 0}-$${request.priceRange?.max || 200}
    
    Search Results:
    ${JSON.stringify(rawEvents.slice(0, 20))}
    
    Extract valid music events and return them as JSON with this structure:
    {
      "events": [
        {
          "id": "unique_id",
          "title": "event_title",
          "artist": "artist_name",
          "venue": "venue_name",
          "date": "YYYY-MM-DD",
          "time": "HH:MM",
          "location": {
            "address": "full_address",
            "city": "city",
            "state": "state"
          },
          "price": {
            "min": 50,
            "max": 150,
            "currency": "USD"
          },
          "ticketUrl": "url_to_buy_tickets",
          "description": "event_description",
          "genre": "music_genre",
          "relevanceScore": 0.95,
          "aiRecommendationReason": "why_this_matches_user_preferences"
        }
      ]
    }
    
    Only include legitimate music events with valid ticket links. Rank by relevance to user preferences.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"events": []}');
    return result.events || [];
  }

  private async enrichWithTicketInfo(events: DiscoveredEvent[]): Promise<DiscoveredEvent[]> {
    // Add additional ticket platform searches for each event
    return events.map(event => ({
      ...event,
      id: event.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }));
  }

  async getPersonalizedRecommendations(userId: string, request: EventDiscoveryRequest): Promise<DiscoveredEvent[]> {
    // This would normally integrate with user behavior data
    // For now, we'll use the basic discovery with enhanced AI analysis
    
    const events = await this.discoverEvents(request);
    
    // Use OpenAI to further personalize based on user history
    const personalizedEvents = await this.personalizeWithAI(events, userId);
    
    return personalizedEvents;
  }

  private async personalizeWithAI(events: DiscoveredEvent[], userId: string): Promise<DiscoveredEvent[]> {
    const prompt = `
    Given these music events, provide personalized insights and reorder them for a metal/rock music fan:
    
    Events: ${JSON.stringify(events)}
    
    Enhance each event with:
    1. Better recommendation reasons focused on metal/rock appeal
    2. Highlight aspects that would interest metal fans
    3. Reorder by relevance to metal/rock community
    4. Add insights about the artist's metal credentials or cross-appeal
    
    Return the same JSON structure but with enhanced aiRecommendationReason and reordered by relevance.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"events": []}');
      return result.events || events;
    } catch (error) {
      console.error('Error personalizing events:', error);
      return events;
    }
  }

  async generateEventInsights(event: DiscoveredEvent): Promise<{
    artistInsights: string;
    venueInfo: string;
    pricingAnalysis: string;
    recommendationTips: string;
  }> {
    const prompt = `
    Provide detailed insights for this music event:
    ${JSON.stringify(event)}
    
    Generate insights in these categories:
    1. Artist insights (background, style, similar artists, why metal fans might like them)
    2. Venue information (capacity, acoustics, location highlights)
    3. Pricing analysis (value assessment, comparison to similar events)
    4. Recommendation tips (best seating, what to expect, preparation tips)
    
    Focus on helping metal/rock fans make informed decisions.
    
    Return as JSON:
    {
      "artistInsights": "detailed_artist_info",
      "venueInfo": "venue_details",
      "pricingAnalysis": "price_value_analysis",
      "recommendationTips": "helpful_tips"
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }
}