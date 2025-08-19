export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export interface GoogleSearchResponse {
  items?: GoogleSearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

export async function performGoogleSearch(
  query: string,
  section: string
): Promise<GoogleSearchResponse | null> {
  try {
    const primaryKey = process.env.GOOGLE_API_KEY;
    const secondaryKey = process.env.GOOGLE_API_KEY_SECONDARY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.GOOGLE_CSE_ID;
    
    if ((!primaryKey && !secondaryKey) || !searchEngineId) {
      console.log(`Google search API keys not configured for "${query}" in section "${section}"`);
      return null; // Fallback to local search
    }
    
    console.log(`Google search requested for "${query}" in section "${section}"`);
    
    // Try primary key first
    let response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${primaryKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`
    );
    
    // If primary key fails with rate limit, try secondary key
    if (!response.ok && response.status === 429 && secondaryKey) {
      console.log('Primary Google API rate limit reached, trying secondary key');
      response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${secondaryKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`
      );
    }
    
    if (!response.ok) {
      if (response.status === 429) {
        console.log('All Google API keys rate limited, falling back to local search');
      } else {
        console.error('Google Custom Search API error:', response.status, response.statusText);
      }
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Google search error:', error);
    return null;
  }
}

export async function searchConcerts(
  query: string,
  location: string = 'US'
): Promise<GoogleSearchResult[]> {
  try {
    const primaryKey = process.env.GOOGLE_API_KEY;
    const secondaryKey = process.env.GOOGLE_API_KEY_SECONDARY;
    
    if (!primaryKey && !secondaryKey) {
      console.log('No Google API keys available for concert search');
      return [];
    }

    // Use the configured search engine ID
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.GOOGLE_CSE_ID;
    
    const searchQuery = `${query} ${location} site:ticketmaster.com OR site:livenation.com OR site:seatgeek.com OR site:stubhub.com`;
    
    console.log(`Searching Google for concerts: "${searchQuery}"`);
    
    // Try primary key first
    let response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${primaryKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=10`
    );
    
    // If primary key fails with rate limit, try secondary key
    if (!response.ok && response.status === 429 && secondaryKey) {
      console.log('Primary Google API rate limit reached, trying secondary key');
      response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${secondaryKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=10`
      );
    }
    
    if (!response.ok) {
      if (response.status === 429) {
        console.log('All Google API keys rate limited, will retry later');
      } else {
        console.error('Google Custom Search API error:', response.status, response.statusText);
      }
      return [];
    }
    
    const data: GoogleSearchResponse = await response.json();
    
    if (data.items && data.items.length > 0) {
      console.log(`Found ${data.items.length} concert results from Google`);
      return data.items;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching concerts via Google:', error);
    return [];
  }
}

export async function googleSearchTours(request: any): Promise<any[]> {
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  if (!searchEngineId) {
    console.log('Google Custom Search Engine ID not configured');
    return [];
  }

  try {
    // Build tour-specific search query
    let searchQuery = 'tour dates 2025 ';
    
    if (request.query) {
      searchQuery += `"${request.query}" `;
    }
    
    if (request.preferredGenres && request.preferredGenres.length > 0) {
      searchQuery += request.preferredGenres.join(' OR ') + ' ';
    }
    
    if (request.location) {
      searchQuery += `"${request.location}" `;
    }
    
    // Add site restrictions for tour information
    searchQuery += 'site:songkick.com OR site:bandsintown.com OR site:setlist.fm OR site:metalinjection.net OR site:loudwire.com';
    
    console.log('Searching Google for tours:', searchQuery);
    
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=10`
    );
    
    if (!response.ok) {
      if (response.status === 429) {
        console.log('Google API rate limit reached, will retry later');
      } else {
        console.error('Google Custom Search API error:', response.status, response.statusText);
      }
      return [];
    }
    
    const data = await response.json();
    
    if (!data.items) {
      return [];
    }
    
    // Parse search results into tour format
    const tours = data.items.map((item: any, index: number) => ({
      id: `google-tour-${index}`,
      tourName: item.title.split(' - ')[0] || 'Tour',
      bands: extractBandNames(item.title, item.snippet),
      headliner: extractHeadliner(item.title, item.snippet),
      currentStops: extractTourStops(item.snippet),
      posterUrl: item.pagemap?.cse_image?.[0]?.src || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
      description: item.snippet,
      genre: extractGenre(item.snippet),
      ticketPriceRange: extractPriceRange(item.snippet),
      relevanceScore: 0.8 - (index * 0.05)
    }));
    
    return tours.filter(tour => tour.bands.length > 0);
    
  } catch (error) {
    console.error('Google tour search error:', error);
    return [];
  }
}

function extractBandNames(title: string, snippet: string): string[] {
  const text = `${title} ${snippet}`.toLowerCase();
  const bands: string[] = [];
  
  const bandPatterns = [
    /with\s+([A-Z][a-zA-Z\s]+?)(?:\s+and|\s+,|\s+tour|\s+live|\s+concert|$)/gi,
    /featuring\s+([A-Z][a-zA-Z\s]+?)(?:\s+and|\s+,|\s+tour|\s+live|\s+concert|$)/gi,
    /([A-Z][a-zA-Z\s]+?)\s+tour/gi
  ];
  
  bandPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null && bands.length < 4) {
      const band = match[1].trim();
      if (band.length > 2 && band.length < 50) {
        bands.push(band);
      }
    }
  });
  
  return bands.length > 0 ? bands : ['Unknown Artist'];
}

function extractHeadliner(title: string, snippet: string): string {
  const bands = extractBandNames(title, snippet);
  return bands[0] || 'Unknown Artist';
}

function extractTourStops(snippet: string): any[] {
  const stops = [];
  
  const cityPattern = /([A-Z][a-zA-Z\s]+),?\s+([A-Z]{2})\s+.*?(\d{1,2}\/\d{1,2}|\w+\s+\d{1,2})/gi;
  let match;
  
  while ((match = cityPattern.exec(snippet)) !== null && stops.length < 5) {
    stops.push({
      city: match[1].trim(),
      state: match[2],
      venue: 'TBA',
      date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
  
  if (stops.length === 0) {
    const sampleCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Philadelphia'];
    const sampleStates = ['NY', 'CA', 'IL', 'TX', 'PA'];
    
    for (let i = 0; i < 3; i++) {
      stops.push({
        city: sampleCities[i],
        state: sampleStates[i],
        venue: 'TBA',
        date: new Date(Date.now() + (i + 1) * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
  }
  
  return stops;
}

function extractGenre(snippet: string): string {
  const text = snippet.toLowerCase();
  const genres = ['metal', 'rock', 'hardcore', 'punk', 'alternative', 'progressive'];
  
  for (const genre of genres) {
    if (text.includes(genre)) {
      return genre.charAt(0).toUpperCase() + genre.slice(1);
    }
  }
  
  return 'Rock';
}

function extractPriceRange(snippet: string): any {
  const pricePattern = /\$(\d+).*?\$(\d+)/;
  const match = snippet.match(pricePattern);
  
  if (match) {
    return {
      min: parseInt(match[1]),
      max: parseInt(match[2]),
      currency: 'USD'
    };
  }
  
  return {
    min: 35,
    max: 150,
    currency: 'USD'
  };
}