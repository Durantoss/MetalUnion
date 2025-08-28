import { performGoogleSearch } from "./googleSearch";

export interface TicketPrice {
  platform: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  fees: number;
  totalPrice: {
    min: number;
    max: number;
  };
  availability: 'available' | 'limited' | 'sold_out' | 'presale';
  url: string;
  lastUpdated: string;
  section?: string;
  seatType?: string;
  verified: boolean;
}

export interface TicketComparison {
  tourId: string;
  bandName: string;
  venue: string;
  date: string;
  prices: TicketPrice[];
  bestDeal: TicketPrice | null;
  averagePrice: number;
  priceRange: {
    lowest: number;
    highest: number;
  };
  lastUpdated: string;
  totalPlatforms: number;
}

// Comprehensive ticket platform database
const TICKET_PLATFORMS = {
  ticketmaster: {
    name: 'Ticketmaster',
    baseUrl: 'https://www.ticketmaster.com',
    reliability: 0.95,
    feePercentage: 0.15, // 15% average fees
    color: '#026cdf'
  },
  stubhub: {
    name: 'StubHub',
    baseUrl: 'https://www.stubhub.com',
    reliability: 0.90,
    feePercentage: 0.12,
    color: '#ff6600'
  },
  seatgeek: {
    name: 'SeatGeek',
    baseUrl: 'https://seatgeek.com',
    reliability: 0.88,
    feePercentage: 0.10,
    color: '#5a67d8'
  },
  vivid_seats: {
    name: 'Vivid Seats',
    baseUrl: 'https://www.vividseats.com',
    reliability: 0.85,
    feePercentage: 0.13,
    color: '#e53e3e'
  },
  viagogo: {
    name: 'viagogo',
    baseUrl: 'https://www.viagogo.com',
    reliability: 0.82,
    feePercentage: 0.18,
    color: '#805ad5'
  },
  tickpick: {
    name: 'TickPick',
    baseUrl: 'https://www.tickpick.com',
    reliability: 0.80,
    feePercentage: 0.08, // No fees advertised
    color: '#38a169'
  },
  gametime: {
    name: 'Gametime',
    baseUrl: 'https://gametime.co',
    reliability: 0.75,
    feePercentage: 0.11,
    color: '#d69e2e'
  },
  bandsintown: {
    name: 'Bandsintown',
    baseUrl: 'https://www.bandsintown.com',
    reliability: 0.70,
    feePercentage: 0.05,
    color: '#3182ce'
  }
};

// Generate realistic pricing data based on venue, band, and market factors
export function generateTicketPrices(
  tourId: string,
  bandName: string,
  venue: string,
  date: string,
  venueCapacity: number = 5000
): TicketComparison {
  const bandPopularity = getBandPopularityMultiplier(bandName);
  const venuePrestige = getVenuePrestigeMultiplier(venue);
  const timeToShow = getTimeToShowMultiplier(date);
  const capacityMultiplier = getCapacityMultiplier(venueCapacity);
  
  // Base price calculation
  const basePrice = Math.round(
    50 * bandPopularity * venuePrestige * timeToShow * capacityMultiplier
  );

  const prices: TicketPrice[] = [];
  const platformKeys = Object.keys(TICKET_PLATFORMS);
  const numPlatforms = Math.min(Math.floor(Math.random() * 6) + 3, platformKeys.length);
  
  // Select random platforms
  const selectedPlatforms = platformKeys
    .sort(() => Math.random() - 0.5)
    .slice(0, numPlatforms);

  selectedPlatforms.forEach(platformKey => {
    const platform = TICKET_PLATFORMS[platformKey as keyof typeof TICKET_PLATFORMS];
    const variation = 0.8 + Math.random() * 0.4; // ±20% price variation
    const platformBasePrice = Math.round(basePrice * variation);
    
    // Different seat types with different pricing
    const seatTypes = ['General Admission', 'Lower Bowl', 'Upper Bowl', 'VIP Package', 'Floor'];
    const selectedSeatType = seatTypes[Math.floor(Math.random() * seatTypes.length)];
    
    let seatMultiplier = 1;
    switch (selectedSeatType) {
      case 'VIP Package': seatMultiplier = 2.5; break;
      case 'Floor': seatMultiplier = 1.8; break;
      case 'Lower Bowl': seatMultiplier = 1.3; break;
      case 'General Admission': seatMultiplier = 1.0; break;
      case 'Upper Bowl': seatMultiplier = 0.7; break;
    }
    
    const seatPrice = Math.round(platformBasePrice * seatMultiplier);
    const priceRange = Math.round(seatPrice * 0.3); // 30% range
    
    const minPrice = Math.max(seatPrice - priceRange, 15);
    const maxPrice = seatPrice + priceRange;
    const fees = Math.round((minPrice + maxPrice) / 2 * platform.feePercentage);
    
    // Availability based on platform and timing
    const availabilityOptions: TicketPrice['availability'][] = ['available', 'limited', 'sold_out', 'presale'];
    const availability = availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)];
    
    prices.push({
      platform: platform.name,
      price: {
        min: minPrice,
        max: maxPrice,
        currency: 'USD'
      },
      fees,
      totalPrice: {
        min: minPrice + fees,
        max: maxPrice + fees
      },
      availability,
      url: `${platform.baseUrl}/search?q=${encodeURIComponent(bandName + ' ' + venue)}`,
      lastUpdated: new Date().toISOString(),
      seatType: selectedSeatType,
      verified: platform.reliability > 0.85,
      section: availability !== 'sold_out' ? `Section ${Math.floor(Math.random() * 20) + 100}` : undefined
    });
  });

  // Sort by total min price
  prices.sort((a, b) => a.totalPrice.min - b.totalPrice.min);
  
  // Find best deal (lowest total price with good availability)
  const bestDeal = prices.find(p => p.availability === 'available' || p.availability === 'limited') || prices[0];
  
  // Calculate statistics
  const allMinPrices = prices.map(p => p.totalPrice.min);
  const allMaxPrices = prices.map(p => p.totalPrice.max);
  const averagePrice = Math.round(
    (allMinPrices.reduce((sum, price) => sum + price, 0) + 
     allMaxPrices.reduce((sum, price) => sum + price, 0)) / (allMinPrices.length + allMaxPrices.length)
  );

  return {
    tourId,
    bandName,
    venue,
    date,
    prices,
    bestDeal,
    averagePrice,
    priceRange: {
      lowest: Math.min(...allMinPrices),
      highest: Math.max(...allMaxPrices)
    },
    lastUpdated: new Date().toISOString(),
    totalPlatforms: prices.length
  };
}

function getBandPopularityMultiplier(bandName: string): number {
  const topTierBands = ['METALLICA', 'IRON MAIDEN', 'BLACK SABBATH', 'GHOST', 'TOOL'];
  const midTierBands = ['LORNA SHORE', 'SPIRITBOX', 'BAD OMENS', 'SLEEP TOKEN'];
  const emergingBands = ['BRAND OF SACRIFICE', 'SHADOW OF INTENT', 'WHITECHAPEL'];
  
  const upperBandName = bandName.toUpperCase();
  
  if (topTierBands.some(band => upperBandName.includes(band))) {
    return 2.0 + Math.random() * 0.5; // 2.0 - 2.5x
  } else if (midTierBands.some(band => upperBandName.includes(band))) {
    return 1.3 + Math.random() * 0.4; // 1.3 - 1.7x
  } else if (emergingBands.some(band => upperBandName.includes(band))) {
    return 0.8 + Math.random() * 0.3; // 0.8 - 1.1x
  }
  
  return 1.0 + Math.random() * 0.3; // 1.0 - 1.3x default
}

function getVenuePrestigeMultiplier(venue: string): number {
  const iconicVenues = ['Madison Square Garden', 'Wembley Stadium', 'Red Rocks Amphitheatre'];
  const majorVenues = ['The Forum', 'Brixton Academy', 'Hammersmith Apollo'];
  const festivals = ['Download Festival', 'Hellfest', 'Wacken Open Air', 'Bloodstock'];
  
  if (iconicVenues.some(v => venue.includes(v))) {
    return 2.2 + Math.random() * 0.3; // 2.2 - 2.5x
  } else if (majorVenues.some(v => venue.includes(v))) {
    return 1.5 + Math.random() * 0.3; // 1.5 - 1.8x
  } else if (festivals.some(v => venue.includes(v))) {
    return 1.8 + Math.random() * 0.4; // 1.8 - 2.2x
  }
  
  return 1.0 + Math.random() * 0.2; // 1.0 - 1.2x default
}

function getTimeToShowMultiplier(date: string): number {
  const showDate = new Date(date);
  const now = new Date();
  const daysUntilShow = Math.ceil((showDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilShow < 7) {
    return 1.8 + Math.random() * 0.4; // Last minute premium
  } else if (daysUntilShow < 30) {
    return 1.3 + Math.random() * 0.3; // Getting close premium
  } else if (daysUntilShow < 90) {
    return 1.1 + Math.random() * 0.2; // Normal pricing
  } else {
    return 0.9 + Math.random() * 0.2; // Early bird discount
  }
}

function getCapacityMultiplier(capacity: number): number {
  if (capacity > 50000) {
    return 1.5 + Math.random() * 0.3; // Stadium pricing
  } else if (capacity > 15000) {
    return 1.2 + Math.random() * 0.2; // Arena pricing
  } else if (capacity > 5000) {
    return 1.0 + Math.random() * 0.1; // Theater pricing
  } else {
    return 0.8 + Math.random() * 0.2; // Club pricing
  }
}

// Service class for managing ticket price comparisons
export class TicketPriceComparisonService {
  private cache: Map<string, TicketComparison> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  async getTicketComparison(
    tourId: string,
    bandName: string,
    venue: string,
    date: string,
    venueCapacity?: number
  ): Promise<TicketComparison> {
    const cacheKey = `${tourId}-${bandName}-${venue}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      const lastUpdated = new Date(cached.lastUpdated);
      const now = new Date();
      
      if (now.getTime() - lastUpdated.getTime() < this.CACHE_DURATION) {
        return cached;
      }
    }

    // Generate fresh pricing data
    const comparison = generateTicketPrices(tourId, bandName, venue, date, venueCapacity);
    this.cache.set(cacheKey, comparison);
    
    return comparison;
  }

  async getBatchTicketComparisons(tours: Array<{
    id: string;
    bandName: string;
    venue: string;
    date: string;
    capacity?: number;
  }>): Promise<TicketComparison[]> {
    const comparisons = await Promise.all(
      tours.map(tour => 
        this.getTicketComparison(tour.id, tour.bandName, tour.venue, tour.date, tour.capacity)
      )
    );
    
    return comparisons;
  }

  // Enhanced search with real Google integration for ticket pricing
  async searchTicketPrices(bandName: string, venue: string): Promise<TicketPrice[]> {
    try {
      const searchQuery = `${bandName} ${venue} concert tickets price ticketmaster stubhub seatgeek`;
      const searchResults = await performGoogleSearch(searchQuery, 'tickets');
      
      if (!searchResults?.items) {
        return [];
      }

      const ticketPrices: TicketPrice[] = [];
      
      for (const item of searchResults.items.slice(0, 8)) {
        const platform = this.detectPlatform(item.link);
        if (platform) {
          const extractedPrice = this.extractPriceFromSnippet(item.snippet);
          if (extractedPrice) {
            ticketPrices.push({
              platform: platform.name,
              price: extractedPrice.price,
              fees: Math.round(extractedPrice.price.min * platform.feePercentage),
              totalPrice: {
                min: extractedPrice.price.min + Math.round(extractedPrice.price.min * platform.feePercentage),
                max: extractedPrice.price.max + Math.round(extractedPrice.price.max * platform.feePercentage)
              },
              availability: extractedPrice.availability,
              url: item.link,
              lastUpdated: new Date().toISOString(),
              seatType: extractedPrice.seatType,
              verified: true
            });
          }
        }
      }
      
      return ticketPrices;
    } catch (error) {
      console.error('Error searching ticket prices:', error);
      return [];
    }
  }

  private detectPlatform(url: string): typeof TICKET_PLATFORMS[keyof typeof TICKET_PLATFORMS] | null {
    for (const [key, platform] of Object.entries(TICKET_PLATFORMS)) {
      if (url.includes(platform.baseUrl.replace('https://', '').replace('www.', ''))) {
        return platform;
      }
    }
    return null;
  }

  private extractPriceFromSnippet(snippet: string): {
    price: { min: number; max: number; currency: string };
    availability: TicketPrice['availability'];
    seatType?: string;
  } | null {
    try {
      // Price extraction patterns
      const pricePatterns = [
        /\$(\d+(?:,\d+)?(?:\.\d{2})?)/g,
        /(\d+(?:,\d+)?(?:\.\d{2})?) USD/g,
        /from \$(\d+(?:,\d+)?(?:\.\d{2})?)/gi,
        /starting at \$(\d+(?:,\d+)?(?:\.\d{2})?)/gi
      ];
      
      const prices: number[] = [];
      
      for (const pattern of pricePatterns) {
        let match;
        while ((match = pattern.exec(snippet)) !== null) {
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price > 0 && price < 10000) {
            prices.push(price);
          }
        }
      }
      
      if (prices.length === 0) return null;
      
      const uniquePrices = [...new Set(prices)].sort((a, b) => a - b);
      
      // Availability detection
      let availability: TicketPrice['availability'] = 'available';
      if (snippet.toLowerCase().includes('sold out') || snippet.toLowerCase().includes('unavailable')) {
        availability = 'sold_out';
      } else if (snippet.toLowerCase().includes('limited') || snippet.toLowerCase().includes('few left')) {
        availability = 'limited';
      } else if (snippet.toLowerCase().includes('presale') || snippet.toLowerCase().includes('pre-sale')) {
        availability = 'presale';
      }
      
      // Seat type detection
      let seatType: string | undefined;
      const seatTypes = ['VIP', 'Floor', 'General Admission', 'Lower', 'Upper', 'Premium'];
      for (const type of seatTypes) {
        if (snippet.toLowerCase().includes(type.toLowerCase())) {
          seatType = type;
          break;
        }
      }
      
      return {
        price: {
          min: uniquePrices[0],
          max: uniquePrices[uniquePrices.length - 1],
          currency: 'USD'
        },
        availability,
        seatType
      };
    } catch (error) {
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const ticketPriceComparisonService = new TicketPriceComparisonService();