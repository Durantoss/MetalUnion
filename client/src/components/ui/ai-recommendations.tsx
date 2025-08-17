import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Heart, RefreshCw } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

interface BandRecommendation {
  bandId?: string;
  name: string;
  genre: string;
  reason: string;
  similarityScore: number;
  description: string;
}

interface AIRecommendationsProps {
  className?: string;
}

export function AIRecommendations({ className }: AIRecommendationsProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['/api/ai/recommendations', refreshKey],
    enabled: true,
    retry: 1
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    queryClient.invalidateQueries({ queryKey: ['/api/ai/recommendations'] });
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Unable to load AI recommendations.</p>
            <p className="text-sm mt-2">Please sign in to get personalized recommendations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            data-testid="refresh-recommendations"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            ))
          ) : recommendations && Array.isArray(recommendations) && recommendations.length > 0 ? (
            recommendations.map((rec: BandRecommendation, index: number) => (
              <div 
                key={index} 
                className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                data-testid={`recommendation-${index}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{rec.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{rec.genre}</Badge>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                        <span className="text-sm font-medium">{rec.similarityScore}% match</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground italic">
                  "{rec.reason}"
                </p>
                
                <p className="text-sm">
                  {rec.description}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recommendations available.</p>
              <p className="text-sm mt-2">Sign in to get personalized AI recommendations!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}