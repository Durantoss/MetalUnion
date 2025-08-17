import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Sparkles, Filter, Loader2 } from 'lucide-react';

interface SearchEnhancement {
  enhancedQuery: string;
  intent: string;
  filters: {
    genre?: string;
    era?: string;
    mood?: string;
  };
}

interface SmartSearchResult {
  originalQuery: string;
  enhancement: SearchEnhancement;
  searchResults: Array<{
    id: string;
    name: string;
    genre: string;
    monthlyListeners: number;
  }>;
}

interface SmartSearchProps {
  onResults?: (results: SmartSearchResult) => void;
  className?: string;
}

export function SmartSearch({ onResults, className }: SmartSearchProps) {
  const [query, setQuery] = useState('');

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string): Promise<SmartSearchResult> => {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: searchQuery })
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      onResults?.(data);
    }
  });

  const handleSearch = () => {
    if (query.trim()) {
      searchMutation.mutate(query.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !searchMutation.isPending) {
      handleSearch();
    }
  };

  return (
    <div className={className}>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Try: 'bands like Metallica but heavier' or 'atmospheric black metal'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={searchMutation.isPending}
            className="pl-10"
            data-testid="smart-search-input"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={!query.trim() || searchMutation.isPending}
          data-testid="smart-search-button"
        >
          {searchMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Search
            </>
          )}
        </Button>
      </div>

      {searchMutation.isPending && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing your search with AI...</span>
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      )}

      {searchMutation.data && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Enhanced Search
              </h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Original:</span> "{searchMutation.data.originalQuery}"
              </p>
              <p className="text-sm">
                <span className="font-medium">Enhanced:</span> "{searchMutation.data.enhancement.enhancedQuery}"
              </p>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  {searchMutation.data.enhancement.intent}
                </Badge>
                {searchMutation.data.enhancement.filters.genre && (
                  <Badge variant="outline" className="text-xs">
                    {searchMutation.data.enhancement.filters.genre}
                  </Badge>
                )}
                {searchMutation.data.enhancement.filters.mood && (
                  <Badge variant="outline" className="text-xs">
                    {searchMutation.data.enhancement.filters.mood}
                  </Badge>
                )}
                {searchMutation.data.enhancement.filters.era && (
                  <Badge variant="outline" className="text-xs">
                    {searchMutation.data.enhancement.filters.era}
                  </Badge>
                )}
              </div>
            </div>

            {searchMutation.data.searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Search Results</h4>
                <div className="space-y-2">
                  {searchMutation.data.searchResults.map((band) => (
                    <div 
                      key={band.id}
                      className="flex justify-between items-center p-2 rounded border hover:bg-accent/50"
                      data-testid={`search-result-${band.id}`}
                    >
                      <div>
                        <p className="font-medium">{band.name}</p>
                        <p className="text-sm text-muted-foreground">{band.genre}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {(band.monthlyListeners / 1000000).toFixed(1)}M listeners
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {searchMutation.isError && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-muted-foreground">
              <p>Search enhancement temporarily unavailable.</p>
              <p className="text-sm mt-1">Try the regular search instead.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}