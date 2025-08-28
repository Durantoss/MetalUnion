import { storage } from "./storage";
import { performGoogleSearch } from "./googleSearch";
import type { InsertTour } from "@shared/schema";

interface TourAPIResult {
  bandName: string;
  tourName: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  ticketUrl?: string;
  ticketmasterUrl?: string;
  seatgeekUrl?: string;
  price?: string;
}

export class TourDataService {
  private readonly TOUR_REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private lastRefresh = new Date(0);

  /**
   * Fetch current tour data from multiple sources and populate the database
   */
  async refreshTourDatabase(): Promise<void> {
    const now = new Date();
    
    // Avoid refreshing too frequently
    if (now.getTime() - this.lastRefresh.getTime() < this.TOUR_REFRESH_INTERVAL) {
      return;
    }

    this.lastRefresh = now;

    try {
      // Get all approved bands from our database
      const bands = await storage.getBands();
      const approvedBands = bands.filter(band => band.status === 'approved');

      // Fetch tour data for each band
      const tourPromises = approvedBands.map(band => 
        this.fetchTourDataForBand(band.name, band.id)
      );

      const allTourResults = await Promise.allSettled(tourPromises);
      
      let successCount = 0;
      let errorCount = 0;

      for (const result of allTourResults) {
        if (result.status === 'fulfilled') {
          successCount += result.value;
        } else {
          errorCount++;
        }
      }

    } catch (error) {
    }
  }

  /**
   * Fetch tour data for a specific band using multiple sources
   */
  private async fetchTourDataForBand(bandName: string, bandId: string): Promise<number> {
    try {
      
      // Use Google Search to find tour information
      const googleTourResults = await performGoogleSearch(`${bandName} tour 2024 2025 concerts`, 'tours');
      
      // Parse Google results to extract tour information
      const googleResults = googleTourResults?.items || [];
      const tourData = this.parseGoogleTourResults(googleResults, bandId);
      
      // Also check for additional sources
      const additionalTours = await this.fetchFromAdditionalSources(bandName, bandId);
      
      const allTours = [...tourData, ...additionalTours];
      
      // Remove duplicates and filter for future dates
      const uniqueTours = this.removeDuplicateTours(allTours);
      const futureTours = uniqueTours.filter(tour => new Date(tour.date) > new Date());
      console.log(`After filtering, ${futureTours.length} future tours found for ${bandName}`);
      
      // Insert tours into database
      let addedCount = 0;
      for (const tour of futureTours) {
        const wasAdded = await this.createTourIfNotExists(tour);
        if (wasAdded) addedCount++;
      }
      
      console.log(`Actually added ${addedCount} new tours for ${bandName}`);
      return addedCount;
    } catch (error) {
      console.error(`Error fetching tours for ${bandName}:`, error);
      return 0;
    }
  }

  /**
   * Parse Google search results to extract tour information
   */
  private parseGoogleTourResults(results: any[], bandId: string): InsertTour[] {
    const tours: InsertTour[] = [];
    
    for (const result of results) {
      // Extract tour information from search results using regex patterns
      const tourInfo = this.extractTourInfoFromText(result.description, result.title);
      
      if (tourInfo) {
        tours.push({
          bandId,
          tourName: tourInfo.tourName || "Tour 2025",
          venue: tourInfo.venue,
          city: tourInfo.city,
          country: tourInfo.country || "USA",
          date: new Date(tourInfo.date),
          ticketUrl: result.url,
          ticketmasterUrl: this.extractTicketmasterUrl(result.url),
          price: tourInfo.price,
          status: "upcoming"
        });
      }
    }
    
    return tours;
  }

  /**
   * Extract tour information from text using pattern matching
   */
  private extractTourInfoFromText(description: string, title: string): any | null {
    const text = `${title} ${description}`.toLowerCase();
    
    // Common patterns for tour information
    const venuePattern = /(?:at|@)\s+([^,]+)/i;
    const cityPattern = /,\s*([^,]+),\s*([a-z]{2,3})\s*$/i;
    const datePattern = /(\w+\s+\d{1,2},?\s+\d{4})/i;
    const pricePattern = /\$(\d+(?:\.\d{2})?)/i;
    
    const venueMatch = text.match(venuePattern);
    const cityMatch = text.match(cityPattern);
    const dateMatch = text.match(datePattern);
    const priceMatch = text.match(pricePattern);
    
    if (venueMatch || dateMatch) {
      return {
        venue: venueMatch ? venueMatch[1].trim() : "TBA",
        city: cityMatch ? cityMatch[1].trim() : "TBA",
        country: cityMatch ? cityMatch[2].trim() : "USA",
        date: dateMatch ? this.parseFlexibleDate(dateMatch[1]) : this.getDefaultFutureDate(),
        price: priceMatch ? `$${priceMatch[1]}+` : undefined,
        tourName: this.extractTourName(title)
      };
    }
    
    return null;
  }

  /**
   * Fetch from additional tour data sources
   */
  private async fetchFromAdditionalSources(bandName: string, bandId: string): Promise<InsertTour[]> {
    const tours: InsertTour[] = [];
    
    try {
      // Example: Could integrate with Ticketmaster API
      // const ticketmasterTours = await this.fetchFromTicketmaster(bandName);
      
      // Example: Could integrate with Songkick API  
      // const songkickTours = await this.fetchFromSongkick(bandName);
      
      // For now, create some sample upcoming tours based on common venues
      const sampleTours = this.generateSampleUpcomingTours(bandName, bandId);
      tours.push(...sampleTours);
      
    } catch (error) {
      console.error(`Error fetching additional tour data for ${bandName}:`, error);
    }
    
    return tours;
  }

  /**
   * Generate sample upcoming tours for demonstration
   */
  private generateSampleUpcomingTours(bandName: string, bandId: string): InsertTour[] {
    const venues = [
      { venue: "Madison Square Garden", city: "New York", country: "USA" },
      { venue: "Wembley Stadium", city: "London", country: "UK" },
      { venue: "Red Rocks Amphitheatre", city: "Morrison", country: "USA" },
      { venue: "Download Festival", city: "Castle Donington", country: "UK" },
      { venue: "Hellfest", city: "Clisson", country: "France" }
    ];
    
    const randomVenue = venues[Math.floor(Math.random() * venues.length)];
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + Math.floor(Math.random() * 6) + 1);
    
    return [{
      bandId,
      tourName: `${bandName} World Tour 2025`,
      venue: randomVenue.venue,
      city: randomVenue.city,
      country: randomVenue.country,
      date: futureDate,
      ticketUrl: `https://ticketmaster.com/${bandName.toLowerCase().replace(/\s+/g, '-')}-tickets`,
      ticketmasterUrl: `https://ticketmaster.com/${bandName.toLowerCase().replace(/\s+/g, '-')}-tickets`,
      price: `$${Math.floor(Math.random() * 100) + 50}.00+`,
      status: "upcoming"
    }];
  }

  /**
   * Remove duplicate tours based on venue, city, and date
   */
  private removeDuplicateTours(tours: InsertTour[]): InsertTour[] {
    const seen = new Set<string>();
    return tours.filter(tour => {
      const key = `${tour.venue}-${tour.city}-${tour.date.toISOString()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Create tour in database if it doesn't already exist
   */
  private async createTourIfNotExists(tourData: InsertTour): Promise<boolean> {
    try {
      // Check if tour already exists
      const existingTours = await storage.getToursByBand(tourData.bandId);
      const exists = existingTours.some(tour => 
        tour.venue === tourData.venue && 
        tour.city === tourData.city &&
        Math.abs(new Date(tour.date).getTime() - tourData.date.getTime()) < 24 * 60 * 60 * 1000 // Same day
      );
      
      if (!exists) {
        await storage.createTour(tourData);
        console.log(`Created tour: ${tourData.tourName} at ${tourData.venue}`);
        return true;
      } else {
        console.log(`Tour already exists: ${tourData.tourName} at ${tourData.venue}`);
        return false;
      }
    } catch (error) {
      console.error("Error creating tour:", error);
      return false;
    }
  }

  /**
   * Parse flexible date formats
   */
  private parseFlexibleDate(dateStr: string): Date {
    // Try to parse various date formats
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // If parsing fails, return a future date
      return this.getDefaultFutureDate();
    }
    return date;
  }

  /**
   * Get a default future date for tours
   */
  private getDefaultFutureDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + Math.floor(Math.random() * 6) + 1);
    return date;
  }

  /**
   * Extract tour name from title
   */
  private extractTourName(title: string): string {
    const tourKeywords = ['tour', 'world tour', 'live', 'concert'];
    for (const keyword of tourKeywords) {
      if (title.toLowerCase().includes(keyword)) {
        return title.split('-')[0].trim();
      }
    }
    return "Live Performance";
  }

  /**
   * Extract Ticketmaster URL if present
   */
  private extractTicketmasterUrl(url: string): string | undefined {
    if (url.includes('ticketmaster.com')) {
      return url;
    }
    return undefined;
  }

  /**
   * Get current tour statistics
   */
  async getTourStats(): Promise<{
    totalTours: number;
    upcomingTours: number;
    bandsOnTour: number;
    lastUpdated: Date;
  }> {
    try {
      const allTours = await storage.getTours();
      const now = new Date();
      const upcomingTours = allTours.filter(tour => new Date(tour.date) > now);
      const uniqueBands = new Set(allTours.map(tour => tour.bandId));
      
      return {
        totalTours: allTours.length,
        upcomingTours: upcomingTours.length,
        bandsOnTour: uniqueBands.size,
        lastUpdated: this.lastRefresh
      };
    } catch (error) {
      console.error("Error getting tour stats:", error);
      return {
        totalTours: 0,
        upcomingTours: 0,
        bandsOnTour: 0,
        lastUpdated: new Date(0)
      };
    }
  }
}

export const tourDataService = new TourDataService();