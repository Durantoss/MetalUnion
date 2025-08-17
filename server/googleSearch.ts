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
    // Since we don't have Google Custom Search API keys configured,
    // we'll return null to fall back to local search
    console.log(`Google search requested for "${query}" in section "${section}"`);
    
    // This would be the actual implementation with API keys:
    // const response = await fetch(
    //   `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`
    // );
    // const data = await response.json();
    // return data;
    
    return null; // Fallback to local search
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
    if (!process.env.GOOGLE_API_KEY) {
      console.log('Google API key not available for concert search');
      return [];
    }

    // Use a generic search engine ID or create a custom one for concert searches
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '017576662512468239146:omuauf_lfve';
    
    const searchQuery = `${query} ${location} site:ticketmaster.com OR site:livenation.com OR site:seatgeek.com OR site:stubhub.com`;
    
    console.log(`Searching Google for concerts: "${searchQuery}"`);
    
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=10`
    );
    
    if (!response.ok) {
      console.error('Google Custom Search API error:', response.status, response.statusText);
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