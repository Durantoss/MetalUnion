import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Globe, Music, Calendar, Newspaper } from "lucide-react";

export interface WebSearchResult {
  title: string;
  description: string;
  url: string;
  source: string;
  imageUrl?: string;
  type: 'band' | 'tour' | 'news' | 'general';
}

interface WebSearchResultsProps {
  results: WebSearchResult[];
  query: string;
  isLoading?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'band':
      return <Music className="w-4 h-4" />;
    case 'tour':
      return <Calendar className="w-4 h-4" />;
    case 'news':
      return <Newspaper className="w-4 h-4" />;
    default:
      return <Globe className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'band':
      return 'bg-metal-red text-white';
    case 'tour':
      return 'bg-blue-600 text-white';
    case 'news':
      return 'bg-green-600 text-white';
    default:
      return 'bg-metal-gray text-white';
  }
};

export function WebSearchResults({ results, query, isLoading = false }: WebSearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card-dark border-metal-gray animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-metal-gray rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-metal-gray rounded w-3/4" />
                  <div className="h-3 bg-metal-gray rounded w-1/2" />
                  <div className="h-12 bg-metal-gray rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="bg-card-dark border-metal-gray">
        <CardContent className="p-8 text-center">
          <Globe className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="heading-enhanced text-lg mb-2">No Web Results Found</h3>
          <p className="text-secondary text-sm">
            No web results found for "{query}". Try a different search term.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="heading-enhanced text-lg uppercase tracking-wider text-metal-red">
          Web Results ({results.length})
        </h3>
        <Badge variant="outline" className="border-metal-gray text-secondary">
          <Globe className="w-3 h-3 mr-1" />
          Powered by Google
        </Badge>
      </div>
      
      {results.map((result, index) => (
        <Card 
          key={index} 
          className="bg-card-dark border-metal-gray hover:border-metal-red transition-colors group"
          data-testid={`web-result-${index}`}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="flex-shrink-0">
                {result.imageUrl ? (
                  <img
                    src={result.imageUrl}
                    alt=""
                    className="w-16 h-16 object-cover rounded border border-metal-gray"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-metal-gray rounded flex items-center justify-center">
                    {getTypeIcon(result.type)}
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 
                    className="heading-enhanced text-base text-primary line-clamp-2 group-hover:text-metal-red transition-colors"
                    data-testid={`web-result-title-${index}`}
                  >
                    {result.title}
                  </h4>
                  <Badge className={`${getTypeColor(result.type)} text-xs flex items-center gap-1 flex-shrink-0`}>
                    {getTypeIcon(result.type)}
                    {result.type.toUpperCase()}
                  </Badge>
                </div>
                
                <p 
                  className="text-secondary text-sm mb-3 line-clamp-2"
                  data-testid={`web-result-description-${index}`}
                >
                  {result.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs text-muted flex items-center gap-1"
                    data-testid={`web-result-source-${index}`}
                  >
                    <Globe className="w-3 h-3" />
                    {result.source}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(result.url, '_blank', 'noopener,noreferrer')}
                    className="border-metal-gray hover:border-metal-red hover:text-metal-red text-xs clickable-link"
                    data-testid={`web-result-link-${index}`}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Visit
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}