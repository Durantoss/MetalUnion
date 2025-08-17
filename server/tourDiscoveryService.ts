import { googleSearchTours } from './googleSearch';
import { aiService } from './aiService';

export interface TourStop {
  city: string;
  state?: string;
  country?: string;
  venue: string;
  date: string;
  ticketUrl?: string;
}

export interface TourInfo {
  id: string;
  tourName: string;
  bands: string[];
  headliner: string;
  currentStops: TourStop[];
  posterUrl?: string;
  description?: string;
  genre?: string;
  startDate?: string;
  endDate?: string;
  ticketPriceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  relevanceScore?: number;
  aiRecommendationReason?: string;
}

export interface TourDiscoveryRequest {
  query?: string;
  location?: string;
  preferredGenres?: string[];
  favoriteArtists?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  radius?: number;
}

// Demo tour data for when APIs are unavailable
const demoTours: TourInfo[] = [
  {
    id: 'demo-tour-1',
    tourName: 'Metal Mayhem World Tour 2025',
    bands: ['Iron Thunder', 'Steel Legion', 'Chaos Engine'],
    headliner: 'Iron Thunder',
    posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    description: 'The most anticipated metal tour of 2025 featuring three powerhouse bands',
    genre: 'Metal',
    startDate: '2025-09-01',
    endDate: '2025-12-15',
    currentStops: [
      {
        city: 'New York',
        state: 'NY',
        venue: 'Madison Square Garden',
        date: '2025-09-15',
        ticketUrl: 'https://example.com/tickets/metal-mayhem-nyc'
      },
      {
        city: 'Chicago',
        state: 'IL', 
        venue: 'United Center',
        date: '2025-09-22',
        ticketUrl: 'https://example.com/tickets/metal-mayhem-chicago'
      },
      {
        city: 'Los Angeles',
        state: 'CA',
        venue: 'Staples Center',
        date: '2025-10-05',
        ticketUrl: 'https://example.com/tickets/metal-mayhem-la'
      }
    ],
    ticketPriceRange: {
      min: 75,
      max: 250,
      currency: 'USD'
    },
    relevanceScore: 0.95,
    aiRecommendationReason: 'Perfect match for metal enthusiasts - features top-tier bands with excellent production quality'
  },
  {
    id: 'demo-tour-2',
    tourName: 'Hardcore Uprising Tour',
    bands: ['Brutal Force', 'Rage Machine', 'Violent Storm'],
    headliner: 'Brutal Force',
    posterUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
    description: 'Underground hardcore at its finest with intimate venue performances',
    genre: 'Hardcore',
    startDate: '2025-08-15',
    endDate: '2025-11-30',
    currentStops: [
      {
        city: 'Philadelphia',
        state: 'PA',
        venue: 'The Fillmore',
        date: '2025-09-18',
        ticketUrl: 'https://example.com/tickets/hardcore-uprising-philly'
      },
      {
        city: 'Boston',
        state: 'MA',
        venue: 'House of Blues',
        date: '2025-09-25',
        ticketUrl: 'https://example.com/tickets/hardcore-uprising-boston'
      },
      {
        city: 'Detroit',
        state: 'MI',
        venue: 'The Majestic',
        date: '2025-10-02',
        ticketUrl: 'https://example.com/tickets/hardcore-uprising-detroit'
      }
    ],
    ticketPriceRange: {
      min: 35,
      max: 80,
      currency: 'USD'
    },
    relevanceScore: 0.87,
    aiRecommendationReason: 'Authentic hardcore experience with affordable pricing and passionate fan community'
  },
  {
    id: 'demo-tour-3',
    tourName: 'Progressive Metal Odyssey',
    bands: ['Dream Warriors', 'Cosmic Void', 'Mathematical Chaos'],
    headliner: 'Dream Warriors',
    posterUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=600&fit=crop',
    description: 'Mind-bending progressive metal with intricate compositions and virtuoso performances',
    genre: 'Progressive Metal',
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    currentStops: [
      {
        city: 'Seattle',
        state: 'WA',
        venue: 'Paramount Theatre',
        date: '2025-10-12',
        ticketUrl: 'https://example.com/tickets/prog-metal-seattle'
      },
      {
        city: 'Portland',
        state: 'OR',
        venue: 'Crystal Ballroom',
        date: '2025-10-19',
        ticketUrl: 'https://example.com/tickets/prog-metal-portland'
      },
      {
        city: 'San Francisco',
        state: 'CA',
        venue: 'The Warfield',
        date: '2025-10-26',
        ticketUrl: 'https://example.com/tickets/prog-metal-sf'
      }
    ],
    ticketPriceRange: {
      min: 55,
      max: 150,
      currency: 'USD'
    },
    relevanceScore: 0.92,
    aiRecommendationReason: 'Exceptional musicianship and complex compositions for sophisticated metal listeners'
  }
];

export class TourDiscoveryService {
  async discoverTours(request: TourDiscoveryRequest): Promise<TourInfo[]> {
    console.log('Tour discovery request received:', request);
    
    const allTours: TourInfo[] = [];
    
    try {
      // Try Google Search for real tour data
      if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
        console.log('Trying Google Search API for real tour data...');
        const googleTours = await googleSearchTours(request);
        allTours.push(...googleTours);
        console.log(`Found ${googleTours.length} Google tours`);
      }
      
      // If no real data available, use demo tours
      if (allTours.length === 0) {
        console.log('No tours found from any platform, returning demo tours');
        allTours.push(...demoTours);
      }
      
      // Filter and rank tours with AI
      let filteredTours = this.filterTours(allTours, request);
      
      // Use AI to rank and provide recommendations
      if (process.env.OPENAI_API_KEY && filteredTours.length > 0) {
        try {
          filteredTours = await aiService.analyzeAndRankTours(filteredTours, request);
        } catch (aiError) {
          console.error('AI ranking error:', aiError);
          // Continue with unranked results
        }
      }
      
      console.log(`Returning ${filteredTours.length} tours to client`);
      return filteredTours.slice(0, 20); // Limit to 20 results
      
    } catch (error) {
      console.error('Error in tour discovery:', error);
      return demoTours.slice(0, 3);
    }
  }
  
  private filterTours(tours: TourInfo[], request: TourDiscoveryRequest): TourInfo[] {
    let filtered = tours;
    
    // Filter by genres
    if (request.preferredGenres && request.preferredGenres.length > 0) {
      filtered = filtered.filter(tour => 
        request.preferredGenres!.some(genre => 
          tour.genre?.toLowerCase().includes(genre.toLowerCase()) ||
          tour.description?.toLowerCase().includes(genre.toLowerCase())
        )
      );
    }
    
    // Filter by favorite artists
    if (request.favoriteArtists && request.favoriteArtists.length > 0) {
      filtered = filtered.filter(tour =>
        request.favoriteArtists!.some(artist =>
          tour.bands.some(band => 
            band.toLowerCase().includes(artist.toLowerCase())
          )
        )
      );
    }
    
    // Filter by price range
    if (request.priceRange && filtered.length > 0) {
      filtered = filtered.filter(tour => {
        if (!tour.ticketPriceRange) return true;
        return tour.ticketPriceRange.min <= request.priceRange!.max &&
               tour.ticketPriceRange.max >= request.priceRange!.min;
      });
    }
    
    // Filter by location/radius (basic city matching for demo)
    if (request.location) {
      const searchLocation = request.location.toLowerCase();
      filtered = filtered.filter(tour =>
        tour.currentStops.some(stop =>
          stop.city.toLowerCase().includes(searchLocation) ||
          stop.state?.toLowerCase().includes(searchLocation)
        )
      );
    }
    
    return filtered;
  }
}