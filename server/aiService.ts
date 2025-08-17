import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY must be set. Did you forget to add it to secrets?");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface BandRecommendation {
  bandId?: string;
  name: string;
  genre: string;
  reason: string;
  similarityScore: number;
  description: string;
}

export interface MusicAnalysis {
  energy: number;
  mood: string;
  subgenres: string[];
  tempo: string;
  vocals: string;
  instruments: string[];
  era: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  recommendations?: BandRecommendation[];
}

export class AIService {
  
  // Background AI: Generate recommendations based on user preferences
  async generateRecommendations(preferences: any): Promise<BandRecommendation[]> {
    try {
      const prompt = `You are a metal music expert AI. Based on these user preferences:
${JSON.stringify(preferences, null, 2)}

Generate 3-5 personalized band recommendations. Consider:
- Preferred genres and recent listening patterns
- Activity level and engagement
- Musical evolution and discovery patterns

Respond in JSON format: {"recommendations": [{"name": "Band Name", "genre": "Genre", "reason": "Why they'd like it", "similarityScore": 85, "description": "Brief description"}]}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      return result.recommendations || [];
    } catch (error) {
      console.error('Background recommendations error:', error);
      return [];
    }
  }
  
  // Smart Band Recommendations
  async getRecommendations(
    userBands: string[],
    userGenres: string[],
    existingBands: Array<{id: string, name: string, genre: string, description: string}>
  ): Promise<BandRecommendation[]> {
    try {
      const prompt = `You are a metal music expert. Based on these user preferences:
Favorite Bands: ${userBands.join(', ')}
Preferred Genres: ${userGenres.join(', ')}

Available bands in database: ${existingBands.map(b => `${b.name} (${b.genre})`).join(', ')}

Recommend 5 bands from the database that this user would love. For each recommendation, provide:
- Band name (must match exactly from database)
- Reason for recommendation 
- Similarity score (0-100)
- Brief description of why they'd like it

Respond in JSON format: {"recommendations": [{"name": "...", "reason": "...", "similarityScore": 85, "description": "..."}]}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      
      return result.recommendations.map((rec: any) => {
        const dbBand = existingBands.find(b => b.name.toLowerCase() === rec.name.toLowerCase());
        return {
          bandId: dbBand?.id,
          name: rec.name,
          genre: dbBand?.genre || 'Unknown',
          reason: rec.reason,
          similarityScore: rec.similarityScore,
          description: rec.description
        };
      });
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return [];
    }
  }

  // Natural Language Search Enhancement
  async enhanceSearchQuery(query: string): Promise<{
    enhancedQuery: string;
    intent: string;
    filters: {
      genre?: string;
      era?: string;
      mood?: string;
    };
  }> {
    try {
      const prompt = `Analyze this music search query and enhance it for better metal/rock band search results:
Query: "${query}"

Determine:
1. Search intent (find_band, discover_similar, mood_based, era_based, genre_specific)
2. Enhanced search terms for better results
3. Any filters that should be applied (genre, era, mood)

Respond in JSON: {"enhancedQuery": "...", "intent": "...", "filters": {"genre": "...", "era": "...", "mood": "..."}}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{"enhancedQuery": "", "intent": "find_band", "filters": {}}');
    } catch (error) {
      console.error('Error enhancing search query:', error);
      return { enhancedQuery: query, intent: 'find_band', filters: {} };
    }
  }

  // Music Analysis & Insights
  async analyzeBand(bandName: string, genre: string, description: string, albums?: string[]): Promise<MusicAnalysis> {
    try {
      const prompt = `Analyze this metal/rock band and provide detailed musical insights:
Band: ${bandName}
Genre: ${genre}
Description: ${description}
${albums ? `Albums: ${albums.join(', ')}` : ''}

Provide analysis including:
- Energy level (0-100)
- Overall mood/atmosphere
- Subgenres and musical style details
- Typical tempo (slow/mid/fast)
- Vocal style
- Primary instruments/sound characteristics
- Era/time period influence

Respond in JSON: {"energy": 85, "mood": "...", "subgenres": ["..."], "tempo": "...", "vocals": "...", "instruments": ["..."], "era": "..."}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{"energy": 50, "mood": "Unknown", "subgenres": [], "tempo": "mid", "vocals": "Unknown", "instruments": [], "era": "Modern"}');
    } catch (error) {
      console.error('Error analyzing band:', error);
      return {
        energy: 50,
        mood: "Unknown",
        subgenres: [],
        tempo: "mid",
        vocals: "Unknown", 
        instruments: [],
        era: "Modern"
      };
    }
  }

  // Smart Photo Analysis
  async analyzePhoto(photoDescription: string, category: string): Promise<{
    enhancedDescription: string;
    suggestedTags: string[];
    mood: string;
    quality: string;
  }> {
    try {
      const prompt = `Analyze this metal/rock concert photo:
Category: ${category}
Current Description: ${photoDescription}

Provide:
- Enhanced, more descriptive caption
- Relevant tags for categorization
- Mood/atmosphere of the photo
- Photo quality assessment

Respond in JSON: {"enhancedDescription": "...", "suggestedTags": ["..."], "mood": "...", "quality": "..."}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{"enhancedDescription": "", "suggestedTags": [], "mood": "energetic", "quality": "good"}');
    } catch (error) {
      console.error('Error analyzing photo:', error);
      return {
        enhancedDescription: photoDescription,
        suggestedTags: [],
        mood: "energetic",
        quality: "good"
      };
    }
  }

  // AI Music Expert Chatbot
  async chatWithAI(
    message: string,
    context: {
      userFavoriteBands?: string[];
      currentPage?: string;
      recentSearches?: string[];
    }
  ): Promise<ChatResponse> {
    try {
      const systemPrompt = `You are MetalBot, an expert AI assistant for MetalHub - a metal and rock music community platform. You have extensive knowledge of:
- Metal and rock bands, their history, members, albums
- Concert information and tour dates  
- Music recommendations and discovery
- Genre classifications and subgenres

User context:
- Favorite bands: ${context.userFavoriteBands?.join(', ') || 'Unknown'}
- Current page: ${context.currentPage || 'Unknown'}
- Recent searches: ${context.recentSearches?.join(', ') || 'None'}

Provide helpful, knowledgeable responses about metal/rock music. Keep responses conversational but informative.
If appropriate, suggest specific bands or provide recommendations.
Always stay focused on metal/rock music topics.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      });

      const aiResponse = response.choices[0].message.content || "I'm here to help with metal and rock music questions!";

      // Extract any band recommendations from the response
      const bandMentions = aiResponse.match(/\b[A-Z][a-zA-Z\s&]+(?=\s(?:is|are|was|were|plays|played))/g) || [];
      
      return {
        message: aiResponse,
        suggestions: this.generateFollowUpSuggestions(message),
        recommendations: []
      };
    } catch (error) {
      console.error('Error in AI chat:', error);
      return {
        message: "Sorry, I'm having trouble connecting right now. Try asking about your favorite metal bands or discovering new music!",
        suggestions: [
          "Recommend bands similar to Metallica",
          "What's the difference between death metal and black metal?",
          "Tell me about recent metal album releases"
        ]
      };
    }
  }

  private generateFollowUpSuggestions(message: string): string[] {
    const suggestions = [
      "Recommend similar bands",
      "Find upcoming concerts",
      "Explore this genre more",
      "Tell me about band history",
      "Show me album recommendations"
    ];
    return suggestions.slice(0, 3);
  }
}

export const aiService = new AIService();