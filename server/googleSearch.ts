interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  htmlTitle?: string;
  htmlSnippet?: string;
  pagemap?: {
    cse_thumbnail?: Array<{
      src: string;
      width: string;
      height: string;
    }>;
    cse_image?: Array<{
      src: string;
    }>;
  };
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

export interface EnhancedSearchResult {
  title: string;
  description: string;
  url: string;
  source: string;
  imageUrl?: string;
  type: 'band' | 'tour' | 'news' | 'general';
}

export class GoogleSearchService {
  private readonly apiKey: string;
  private readonly searchEngineId: string;
  private readonly baseUrl = 'https://www.googleapis.com/customsearch/v1';

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY!;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID!;
    
    if (!this.apiKey || !this.searchEngineId) {
      throw new Error('Google Search API credentials not found in environment variables');
    }
  }

  async searchMetalBands(query: string, numResults: number = 5): Promise<EnhancedSearchResult[]> {
    try {
      const metalQuery = `${query} metal band music`;
      const response = await this.performSearch(metalQuery, numResults);
      return this.parseResults(response, 'band');
    } catch (error) {
      console.error('Error searching for metal bands:', error);
      return [];
    }
  }

  async searchMetalTours(query: string, numResults: number = 5): Promise<EnhancedSearchResult[]> {
    try {
      const tourQuery = `${query} metal tour concert dates tickets 2024 2025`;
      const response = await this.performSearch(tourQuery, numResults);
      return this.parseResults(response, 'tour');
    } catch (error) {
      console.error('Error searching for metal tours:', error);
      return [];
    }
  }

  async searchMetalNews(query: string, numResults: number = 5): Promise<EnhancedSearchResult[]> {
    try {
      const newsQuery = `${query} metal music news album review`;
      const response = await this.performSearch(newsQuery, numResults);
      return this.parseResults(response, 'news');
    } catch (error) {
      console.error('Error searching for metal news:', error);
      return [];
    }
  }

  async searchGeneral(query: string, numResults: number = 5): Promise<EnhancedSearchResult[]> {
    try {
      const response = await this.performSearch(query, numResults);
      return this.parseResults(response, 'general');
    } catch (error) {
      console.error('Error performing general search:', error);
      return [];
    }
  }

  private async performSearch(query: string, numResults: number): Promise<GoogleSearchResponse> {
    const params = new URLSearchParams({
      key: this.apiKey,
      cx: this.searchEngineId,
      q: query,
      num: numResults.toString(),
      safe: 'active'
    });

    const response = await fetch(`${this.baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private parseResults(response: GoogleSearchResponse, type: EnhancedSearchResult['type']): EnhancedSearchResult[] {
    if (!response.items) {
      return [];
    }

    return response.items.map(item => ({
      title: this.cleanHtmlTitle(item.htmlTitle || item.title),
      description: this.cleanHtmlSnippet(item.htmlSnippet || item.snippet),
      url: item.link,
      source: item.displayLink,
      imageUrl: this.extractImageUrl(item),
      type
    }));
  }

  private cleanHtmlTitle(title: string): string {
    return title.replace(/<[^>]*>/g, '').trim();
  }

  private cleanHtmlSnippet(snippet: string): string {
    return snippet.replace(/<[^>]*>/g, '').trim();
  }

  private extractImageUrl(item: GoogleSearchResult): string | undefined {
    // Try to get thumbnail first
    if (item.pagemap?.cse_thumbnail?.length) {
      return item.pagemap.cse_thumbnail[0].src;
    }
    
    // Fallback to regular image
    if (item.pagemap?.cse_image?.length) {
      return item.pagemap.cse_image[0].src;
    }
    
    return undefined;
  }
}

export const googleSearchService = new GoogleSearchService();