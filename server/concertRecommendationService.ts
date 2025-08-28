import OpenAI from "openai";
import { storage } from "./storage";
import type { Band, Tour, User } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ConcertRecommendation {
  band: Band;
  tour?: Tour;
  matchScore: number;
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedInterest: number; // 0-100
}

export interface UserPreferences {
  favoriteGenres: string[];
  location?: {
    city: string;
    country: string;
    radius: number; // kilometers
  };
  priceRange?: {
    min: number;
    max: number;
  };
  preferredVenues?: string[];
  travelWillingness: 'local' | 'regional' | 'national' | 'international';
  concertFrequency: 'weekly' | 'monthly' | 'occasionally' | 'rarely';
}

export interface ConcertRecommendationRequest {
  userId: string;
  preferences?: UserPreferences;
  maxRecommendations?: number;
  location?: string;
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
}

export class ConcertRecommendationService {
  async generateRecommendations(request: ConcertRecommendationRequest): Promise<ConcertRecommendation[]> {
    try {
      const { userId, preferences, maxRecommendations = 10, location, timeframe = 'quarter' } = request;
      
      // Get user data and history
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get all bands and tours
      const allBands = await storage.getBands();
      const allTours = await storage.getTours();
      
      // Get user's band interaction history (reviews, photos, etc.)
      const userInteractionHistory = await this.getUserInteractionHistory(userId);
      
      // Analyze user preferences using AI
      const aiAnalysis = await this.analyzeUserPreferences(user, userInteractionHistory, preferences);
      
      // Get potential concert matches
      const potentialMatches = await this.findPotentialMatches(allBands, allTours, aiAnalysis, timeframe);
      
      // Score and rank recommendations using AI
      const scoredRecommendations = await this.scoreRecommendations(
        potentialMatches,
        aiAnalysis,
        location,
        maxRecommendations
      );
      
      return scoredRecommendations;
    } catch (error) {
      console.error('Error generating concert recommendations:', error);
      throw error;
    }
  }

  private async getUserInteractionHistory(userId: string) {
    try {
      // Get user's bands
      const userBands = await storage.getBandsByOwner(userId);
      
      // Get all reviews and filter by user's activity
      const allReviews = await storage.getReviews();
      const userReviews = allReviews.filter(review => 
        userBands.some(band => band.name === review.stagename)
      );
      
      // Get all photos and filter by user's bands
      const allPhotos = await storage.getPhotos();
      const userPhotos = allPhotos.filter(photo =>
        userBands.some(band => band.id === photo.bandId)
      );
      
      return {
        bandsSubmitted: userBands,
        reviewsWritten: userReviews,
        photosUploaded: userPhotos,
        interactionCount: userBands.length + userReviews.length + userPhotos.length
      };
    } catch (error) {
      console.error('Error getting user interaction history:', error);
      return {
        bandsSubmitted: [],
        reviewsWritten: [],
        photosUploaded: [],
        interactionCount: 0
      };
    }
  }

  private async analyzeUserPreferences(
    user: User, 
    history: any, 
    explicitPreferences?: UserPreferences
  ) {
    try {
      const prompt = `
        Analyze this metal music fan's preferences and provide concert recommendations insights.
        
        User Profile:
        - Email: ${user.email || 'Not provided'}
        - Stagename: ${user.stagename || 'Not set'}
        - Member since: ${user.createdAt}
        
        Activity History:
        - Bands submitted: ${history.bandsSubmitted.length}
        - Reviews written: ${history.reviewsWritten.length}
        - Photos uploaded: ${history.photosUploaded.length}
        - Total interactions: ${history.interactionCount}
        
        Bands they've interacted with:
        ${history.bandsSubmitted.map((band: Band) => `- ${band.name} (${band.genre}): ${band.description}`).join('\n')}
        
        Reviews they've written:
        ${history.reviewsWritten.map((review: any) => `- ${review.title} (${review.rating}/5 stars): ${review.content.substring(0, 100)}...`).join('\n')}
        
        Explicit Preferences:
        ${explicitPreferences ? JSON.stringify(explicitPreferences, null, 2) : 'None provided'}
        
        Based on this data, analyze their music preferences and provide recommendations in JSON format:
        {
          "preferredGenres": ["genre1", "genre2", ...],
          "musicTaste": "description of their taste",
          "concertStyle": "intimate/large venues/festivals/etc",
          "discoveryOpenness": 0-100,
          "loyaltyLevel": 0-100,
          "activityLevel": "low/medium/high",
          "recommendationStrategy": "strategy description"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert music analyst specializing in metal and rock genres. Analyze user behavior to understand their concert preferences."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return {
        ...analysis,
        explicitPreferences,
        userHistory: history
      };
    } catch (error) {
      console.error('Error analyzing user preferences:', error);
      // Return default analysis if AI fails
      return {
        preferredGenres: ['Rock', 'Metal'],
        musicTaste: 'General metal and rock fan',
        concertStyle: 'medium venues',
        discoveryOpenness: 50,
        loyaltyLevel: 50,
        activityLevel: 'medium',
        recommendationStrategy: 'balanced approach',
        explicitPreferences,
        userHistory: history
      };
    }
  }

  private async findPotentialMatches(
    bands: Band[], 
    tours: Tour[], 
    analysis: any, 
    timeframe: string
  ) {
    // Filter tours by timeframe
    const now = new Date();
    const timeframeDays: Record<string, number> = {
      'week': 7,
      'month': 30,
      'quarter': 90,
      'year': 365
    };
    
    const endDate = new Date(now.getTime() + (timeframeDays[timeframe] || 90) * 24 * 60 * 60 * 1000);
    
    const relevantTours = tours.filter(tour => {
      const tourDate = new Date(tour.date);
      return tourDate >= now && tourDate <= endDate && tour.status === 'upcoming';
    });

    // Match bands to tours and analyze relevance
    const potentialMatches = bands.map(band => {
      const bandTours = relevantTours.filter(tour => tour.bandId === band.id);
      return {
        band,
        tours: bandTours,
        genreMatch: analysis.preferredGenres.some((genre: string) => 
          band.genre.toLowerCase().includes(genre.toLowerCase())
        )
      };
    }).filter(match => match.tours.length > 0 || match.genreMatch);

    return potentialMatches;
  }

  private async scoreRecommendations(
    potentialMatches: any[], 
    analysis: any, 
    location?: string, 
    maxRecommendations = 10
  ): Promise<ConcertRecommendation[]> {
    try {
      const prompt = `
        Score and rank these concert recommendations for a metal fan based on their preferences.
        
        User Analysis:
        ${JSON.stringify(analysis, null, 2)}
        
        User Location: ${location || 'Not specified'}
        
        Potential Concerts:
        ${potentialMatches.map((match, index) => `
        ${index + 1}. ${match.band.name} (${match.band.genre})
           Description: ${match.band.description}
           Founded: ${match.band.founded}
           Upcoming Tours: ${match.tours.length}
           Tour Details: ${match.tours.map((tour: Tour) => 
             `${tour.venue} in ${tour.city}, ${tour.country} on ${tour.date}`
           ).join('; ')}
        `).join('\n')}
        
        Score each concert (0-100) and provide recommendations in JSON format:
        {
          "recommendations": [
            {
              "bandName": "band name",
              "matchScore": 0-100,
              "reasons": ["reason1", "reason2", ...],
              "priority": "high/medium/low",
              "estimatedInterest": 0-100
            }
          ]
        }
        
        Consider:
        - Genre alignment with user preferences
        - Band popularity and user's discovery openness
        - Tour accessibility (location, venue size)
        - User's activity level and concert frequency
        - Band's style match with user's taste profile
        
        Return top ${maxRecommendations} recommendations.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert concert recommendation engine specializing in metal and rock music. Provide intelligent, personalized concert suggestions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const aiRecommendations = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      
      // Convert AI recommendations to our format
      const recommendations: ConcertRecommendation[] = aiRecommendations.recommendations.map((rec: any) => {
        const match = potentialMatches.find(m => m.band.name === rec.bandName);
        if (!match) return null;
        
        return {
          band: match.band,
          tour: match.tours[0], // Take first upcoming tour
          matchScore: rec.matchScore,
          reasons: rec.reasons,
          priority: rec.priority,
          estimatedInterest: rec.estimatedInterest
        };
      }).filter(Boolean);

      return recommendations.slice(0, maxRecommendations);
    } catch (error) {
      console.error('Error scoring recommendations:', error);
      
      // Fallback to simple scoring if AI fails
      return potentialMatches.slice(0, maxRecommendations).map(match => ({
        band: match.band,
        tour: match.tours[0],
        matchScore: match.genreMatch ? 80 : 60,
        reasons: match.genreMatch ? ['Genre match'] : ['Popular band'],
        priority: 'medium' as const,
        estimatedInterest: 70
      }));
    }
  }

  async getConcertInsights(bandId: string, userId?: string) {
    try {
      const band = await storage.getBand(bandId);
      if (!band) {
        throw new Error('Band not found');
      }

      const tours = await storage.getToursByBand(bandId);
      const reviews = await storage.getReviewsByBand(bandId);
      
      const prompt = `
        Provide insights about this band's concerts and tours for a metal music fan.
        
        Band: ${band.name} (${band.genre})
        Description: ${band.description}
        Founded: ${band.founded}
        Members: ${band.members?.join(', ')}
        Albums: ${band.albums?.join(', ')}
        
        Upcoming Tours: ${tours.length}
        ${tours.map(tour => `- ${tour.venue} in ${tour.city}, ${tour.country} on ${tour.date}`).join('\n')}
        
        Recent Reviews: ${reviews.length}
        ${reviews.slice(0, 3).map(review => `- ${review.title} (${review.rating}/5): ${review.content.substring(0, 100)}...`).join('\n')}
        
        Provide concert insights in JSON format:
        {
          "concertExperience": "description of what to expect at their shows",
          "bestSongs": ["song1", "song2", ...],
          "venueRecommendations": "ideal venue types for this band",
          "fanRating": 0-100,
          "showHighlights": ["highlight1", "highlight2", ...],
          "ticketAdvice": "when and how to buy tickets"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a concert expert specializing in metal and rock shows. Provide detailed insights about band performances."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error getting concert insights:', error);
      throw error;
    }
  }
}

export const concertRecommendationService = new ConcertRecommendationService();