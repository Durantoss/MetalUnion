import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  DollarSign, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  Award,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Search,
  RotateCw
} from 'lucide-react';

interface TicketPrice {
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

interface TicketComparison {
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

interface TicketPriceComparisonProps {
  tourId: string;
  className?: string;
  compact?: boolean;
}

// Platform colors mapping
const platformColors: Record<string, string> = {
  'Ticketmaster': '#026cdf',
  'StubHub': '#ff6600',
  'SeatGeek': '#5a67d8',
  'Vivid Seats': '#e53e3e',
  'viagogo': '#805ad5',
  'TickPick': '#38a169',
  'Gametime': '#d69e2e',
  'Bandsintown': '#3182ce'
};

export function TicketPriceComparison({ tourId, className = '', compact = false }: TicketPriceComparisonProps) {
  const [comparison, setComparison] = useState<TicketComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch ticket comparison data
  const fetchComparison = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetch(`/api/tours/${tourId}/ticket-comparison`);
      if (response.ok) {
        const data = await response.json();
        setComparison(data);
        setLastUpdated(new Date());
      } else {
        setError('Failed to load ticket prices');
      }
    } catch (error) {
      console.error('Failed to fetch ticket comparison:', error);
      setError('Unable to load ticket prices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComparison();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchComparison(true), 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [tourId]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-700 rounded mb-2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <AlertTriangle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">{error || 'No ticket data available'}</p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => fetchComparison()}
          className="mt-2"
        >
          <RotateCw className="h-4 w-4 mr-1" />
          Try Again
        </Button>
      </div>
    );
  }

  const getAvailabilityColor = (availability: TicketPrice['availability']) => {
    switch (availability) {
      case 'available': return 'text-green-400 border-green-500';
      case 'limited': return 'text-yellow-400 border-yellow-500';
      case 'presale': return 'text-blue-400 border-blue-500';
      case 'sold_out': return 'text-red-400 border-red-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getAvailabilityIcon = (availability: TicketPrice['availability']) => {
    switch (availability) {
      case 'available': return CheckCircle;
      case 'limited': return AlertTriangle;
      case 'presale': return Clock;
      case 'sold_out': return Users;
      default: return CheckCircle;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPlatformBadgeStyle = (platform: string) => {
    const color = platformColors[platform] || '#6b7280';
    return {
      backgroundColor: `${color}20`,
      borderColor: color,
      color: color
    };
  };

  if (compact) {
    return (
      <div className={`bg-gray-900/30 rounded-lg p-3 ${className}`} data-testid="ticket-comparison-compact">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-white">Best Price</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchComparison(true)}
            disabled={refreshing}
            className="h-6 w-6 p-0"
          >
            <RotateCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {comparison.bestDeal && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span 
                className="text-xs px-2 py-1 rounded border"
                style={getPlatformBadgeStyle(comparison.bestDeal.platform)}
              >
                {comparison.bestDeal.platform}
              </span>
              <span className="text-lg font-bold text-green-400">
                {formatPrice(comparison.bestDeal.totalPrice.min)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{comparison.totalPlatforms} platforms</span>
              <span>Avg: {formatPrice(comparison.averagePrice)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={`bg-gray-900/50 border-gray-700 ${className}`} data-testid="ticket-comparison-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-400" />
            Ticket Price Comparison
          </CardTitle>
          <div className="flex items-center space-x-2">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchComparison(true)}
              disabled={refreshing}
              className="h-8 w-8 p-0"
            >
              <RotateCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Overview */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-black/20 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-400">Lowest Price</div>
            <div className="text-lg font-bold text-green-400">
              {formatPrice(comparison.priceRange.lowest)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Average Price</div>
            <div className="text-lg font-bold text-yellow-400">
              {formatPrice(comparison.averagePrice)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Highest Price</div>
            <div className="text-lg font-bold text-red-400">
              {formatPrice(comparison.priceRange.highest)}
            </div>
          </div>
        </div>

        {/* Best Deal Highlight */}
        {comparison.bestDeal && (
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Best Deal</span>
              </div>
              <Badge 
                variant="outline" 
                className="border-green-500 text-green-400"
              >
                Save up to {formatPrice(comparison.priceRange.highest - comparison.bestDeal.totalPrice.min)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div 
                  className="text-sm font-medium px-2 py-1 rounded border inline-block"
                  style={getPlatformBadgeStyle(comparison.bestDeal.platform)}
                >
                  {comparison.bestDeal.platform}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {comparison.bestDeal.seatType}
                  {comparison.bestDeal.section && ` • ${comparison.bestDeal.section}`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-400">
                  {formatPrice(comparison.bestDeal.totalPrice.min)}
                </div>
                <div className="text-xs text-gray-400">
                  +{formatPrice(comparison.bestDeal.fees)} fees
                </div>
              </div>
            </div>
            
            <a
              href={comparison.bestDeal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center py-2 px-4 rounded-md transition-colors duration-200"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Get Tickets
            </a>
          </div>
        )}

        {/* All Platform Prices */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center">
            <Search className="h-4 w-4 mr-2" />
            All Platforms ({comparison.totalPlatforms})
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {comparison.prices.map((price, index) => {
              const AvailabilityIcon = getAvailabilityIcon(price.availability);
              const savingsVsBest = comparison.bestDeal 
                ? price.totalPrice.min - comparison.bestDeal.totalPrice.min 
                : 0;
              
              return (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                  data-testid={`platform-${price.platform.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="text-xs font-medium px-2 py-1 rounded border"
                      style={getPlatformBadgeStyle(price.platform)}
                    >
                      {price.platform}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <AvailabilityIcon className={`h-3 w-3 ${getAvailabilityColor(price.availability).split(' ')[0]}`} />
                      <span className={`text-xs capitalize ${getAvailabilityColor(price.availability).split(' ')[0]}`}>
                        {price.availability.replace('_', ' ')}
                      </span>
                      {price.verified && (
                        <CheckCircle className="h-3 w-3 text-blue-400" title="Verified Platform" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        {formatPrice(price.totalPrice.min)}
                        {price.totalPrice.min !== price.totalPrice.max && (
                          <span className="text-gray-400"> - {formatPrice(price.totalPrice.max)}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {price.seatType}
                        {savingsVsBest > 0 && (
                          <span className="text-red-400 ml-2">
                            +{formatPrice(savingsVsBest)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <a
                      href={price.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="View on platform"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Trends */}
        <div className="pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <TrendingDown className="h-3 w-3 mr-1 text-green-400" />
                Best: {comparison.bestDeal?.platform}
              </span>
              <span className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-red-400" />
                Range: {formatPrice(comparison.priceRange.highest - comparison.priceRange.lowest)}
              </span>
            </div>
            <span>
              Last updated: {new Date(comparison.lastUpdated).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for batch ticket comparisons
export function useTicketComparisons(tourIds: string[]) {
  const [comparisons, setComparisons] = useState<Record<string, TicketComparison>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tourIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchComparisons = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tours/ticket-comparisons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tourIds })
        });

        if (response.ok) {
          const data = await response.json();
          const comparisonMap = data.reduce((acc: Record<string, TicketComparison>, comparison: TicketComparison) => {
            acc[comparison.tourId] = comparison;
            return acc;
          }, {});
          setComparisons(comparisonMap);
        }
      } catch (error) {
        console.error('Failed to fetch ticket comparisons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisons();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchComparisons, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [tourIds]);

  return { comparisons, loading };
}