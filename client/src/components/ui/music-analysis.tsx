import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Music, Clock, Mic, Headphones } from 'lucide-react';

interface MusicAnalysis {
  energy: number;
  mood: string;
  subgenres: string[];
  tempo: string;
  vocals: string;
  instruments: string[];
  era: string;
}

interface MusicAnalysisProps {
  bandId: string;
  bandName: string;
  className?: string;
}

export function MusicAnalysis({ bandId, bandName, className }: MusicAnalysisProps) {
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['/api/ai/analyze', bandId],
    enabled: !!bandId,
    retry: 1
  });

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI Music Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>Analysis temporarily unavailable.</p>
            <p className="text-sm mt-1">Try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          AI Music Analysis
          <Badge variant="secondary" className="ml-auto">{bandName}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
          </div>
        ) : analysis && (analysis as any).analysis ? (
          <>
            {/* Energy Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  <span className="font-medium">Energy Level</span>
                </div>
                <span className="text-sm font-medium">{(analysis as any).analysis.energy}/100</span>
              </div>
              <Progress 
                value={(analysis as any).analysis.energy} 
                className="h-2"
                data-testid="energy-progress"
              />
              <p className="text-xs text-muted-foreground">
                {(analysis as any).analysis.energy >= 80 ? 'High energy' : 
                 (analysis as any).analysis.energy >= 60 ? 'Moderate energy' :
                 (analysis as any).analysis.energy >= 40 ? 'Medium energy' : 'Low energy'}
              </p>
            </div>

            {/* Mood & Atmosphere */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                <span className="font-medium">Mood & Atmosphere</span>
              </div>
              <Badge variant="outline" className="text-sm">
                {(analysis as any).analysis.mood}
              </Badge>
            </div>

            {/* Subgenres */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span className="font-medium">Subgenres</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(analysis as any).analysis.subgenres?.map((genre: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs"
                    data-testid={`subgenre-${index}`}
                  >
                    {genre}
                  </Badge>
                )) || <span className="text-sm text-muted-foreground">Not specified</span>}
              </div>
            </div>

            {/* Musical Characteristics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Tempo</span>
                </div>
                <Badge variant="outline" data-testid="tempo-badge">
                  {(analysis as any).analysis.tempo}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  <span className="font-medium">Vocal Style</span>
                </div>
                <Badge variant="outline" data-testid="vocals-badge">
                  {(analysis as any).analysis.vocals}
                </Badge>
              </div>
            </div>

            {/* Instruments */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span className="font-medium">Key Instruments</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(analysis as any).analysis.instruments?.map((instrument: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs"
                    data-testid={`instrument-${index}`}
                  >
                    {instrument}
                  </Badge>
                )) || <span className="text-sm text-muted-foreground">Not specified</span>}
              </div>
            </div>

            {/* Era */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Musical Era</span>
              </div>
              <Badge variant="secondary" data-testid="era-badge">
                {(analysis as any).analysis.era}
              </Badge>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>No analysis data available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}