import type { Band, Tour } from "@shared/schema";

export interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name: string;
      city: {
        name: string;
      };
      country: {
        name: string;
        countryCode: string;
      };
    }>;
  };
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
}

export class TicketmasterService {
  private readonly baseUrl = 'https://app.ticketmaster.com/discovery/v2';
  private readonly apiKey = process.env.TICKETMASTER_API_KEY;

  constructor() {
    // Note: Ticketmaster API key would be needed for real implementation
    // For now, we'll generate ticket links based on band names
  }

  /**
   * Generate a Ticketmaster search URL for a band
   */
  generateTicketmasterUrl(bandName: string, city?: string): string {
    const baseUrl = 'https://www.ticketmaster.com/search';
    const params = new URLSearchParams({
      q: bandName,
      sort: 'date,asc',
      tmbv: 'v2'
    });

    if (city) {
      params.append('city', city);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate multiple ticket platform URLs for a band
   */
  generateTicketUrls(bandName: string, city?: string) {
    const cleanBandName = bandName.replace(/[^\w\s]/g, '').trim();
    
    return {
      ticketmaster: this.generateTicketmasterUrl(cleanBandName, city),
      stubhub: `https://www.stubhub.com/find/s/?q=${encodeURIComponent(cleanBandName)}`,
      seatgeek: `https://seatgeek.com/search?q=${encodeURIComponent(cleanBandName)}`,
      vivid: `https://www.vividseats.com/search?searchterm=${encodeURIComponent(cleanBandName)}`
    };
  }

  /**
   * Create a tour with Ticketmaster integration
   */
  async createTourWithTickets(tour: {
    bandId: string;
    tourName: string;
    venue: string;
    city: string;
    country: string;
    date: string;
    bandName: string;
  }) {
    const ticketUrls = this.generateTicketUrls(tour.bandName, tour.city);
    
    return {
      ...tour,
      ticketUrl: ticketUrls.ticketmaster,
      alternativeTicketUrls: {
        stubhub: ticketUrls.stubhub,
        seatgeek: ticketUrls.seatgeek,
        vivid: ticketUrls.vivid
      },
      status: 'upcoming' as const,
      createdAt: new Date(),
    };
  }

  /**
   * Get upcoming tours for a band with ticket links
   */
  async getUpcomingToursWithTickets(band: Band, existingTours: Tour[] = []) {
    const ticketUrls = this.generateTicketUrls(band.name);
    
    // If there are existing tours, add ticket URLs
    const toursWithTickets = existingTours.map(tour => ({
      ...tour,
      ticketUrl: tour.ticketUrl || ticketUrls.ticketmaster,
      alternativeTicketUrls: {
        stubhub: ticketUrls.stubhub,
        seatgeek: ticketUrls.seatgeek,
        vivid: ticketUrls.vivid
      }
    }));

    // Generate some sample upcoming tours if none exist
    if (toursWithTickets.length === 0) {
      const sampleTours = this.generateSampleTours(band, ticketUrls);
      return sampleTours;
    }

    return toursWithTickets;
  }

  /**
   * Generate sample tours for demonstration (would be replaced with real API data)
   */
  private generateSampleTours(band: Band, ticketUrls: any) {
    const venues = [
      { name: 'Madison Square Garden', city: 'New York', country: 'US' },
      { name: 'The Forum', city: 'Los Angeles', country: 'US' },
      { name: 'Red Rocks Amphitheatre', city: 'Denver', country: 'US' },
      { name: 'O2 Arena', city: 'London', country: 'UK' },
      { name: 'Wembley Stadium', city: 'London', country: 'UK' }
    ];

    const tourCount = Math.floor(Math.random() * 3) + 1; // 1-3 tours
    const tours = [];

    for (let i = 0; i < tourCount; i++) {
      const venue = venues[Math.floor(Math.random() * venues.length)];
      const daysFromNow = Math.floor(Math.random() * 180) + 30; // 30-210 days from now
      const tourDate = new Date();
      tourDate.setDate(tourDate.getDate() + daysFromNow);

      tours.push({
        id: `tour-${band.id}-${i}`,
        bandId: band.id,
        tourName: `${band.name} World Tour 2024`,
        venue: venue.name,
        city: venue.city,
        country: venue.country,
        date: tourDate.toISOString().split('T')[0],
        ticketUrl: ticketUrls.ticketmaster,
        alternativeTicketUrls: {
          stubhub: ticketUrls.stubhub,
          seatgeek: ticketUrls.seatgeek,
          vivid: ticketUrls.vivid
        },
        status: 'upcoming' as const,
        createdAt: new Date(),
      });
    }

    return tours;
  }

  /**
   * Generate ticket purchasing options for a specific tour
   */
  generateTourTicketOptions(tour: Tour, bandName: string) {
    const baseUrls = this.generateTicketUrls(bandName, tour.city);
    
    return {
      primary: {
        name: 'Ticketmaster',
        url: tour.ticketUrl || baseUrls.ticketmaster,
        description: 'Official tickets'
      },
      alternatives: [
        {
          name: 'StubHub',
          url: baseUrls.stubhub,
          description: 'Resale marketplace'
        },
        {
          name: 'SeatGeek',
          url: baseUrls.seatgeek,
          description: 'Compare prices'
        },
        {
          name: 'Vivid Seats',
          url: baseUrls.vivid,
          description: 'Guaranteed tickets'
        }
      ]
    };
  }
}

export const ticketmasterService = new TicketmasterService();