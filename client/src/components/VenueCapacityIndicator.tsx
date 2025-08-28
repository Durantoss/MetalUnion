import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Card, CardContent } from './ui/card';
import { 
  Users, 
  TrendingUp, 
  Zap, 
  Activity,
  Flame,
  Volume2,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface VenueCapacityData {
  venueCapacity: number;
  currentAttendance: number;
  attendeeCount: number;
  capacityPercentage: number;
  status: 'available' | 'filling_fast' | 'nearly_full' | 'sold_out';
}

interface CrowdEnergyData {
  energyLevel: number; // 0.0 to 1.0
  energyStatus: 'low' | 'moderate' | 'high' | 'explosive';
  lastUpdate: string;
  metrics: {
    socialBuzz: number;
    reviewSentiment: number;
    anticipationScore: number;
    bandPopularity: number;
  };
}

interface VenueRealtimeData {
  tourId: string;
  capacity: VenueCapacityData;
  energy: CrowdEnergyData;
}

interface VenueCapacityIndicatorProps {
  tourId: string;
  className?: string;
  compact?: boolean;
}

export function VenueCapacityIndicator({ tourId, className = '', compact = false }: VenueCapacityIndicatorProps) {
  const [venueData, setVenueData] = useState<VenueRealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch venue data
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        if (!loading) setLoading(true);
        
        const response = await fetch(`/api/tours/${tourId}/venue-data`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for session
        });
        
        if (response.ok) {
          const data = await response.json();
          setVenueData(data);
          setLastUpdated(new Date());
          console.log('Venue data updated:', data);
        } else {
          console.error('Venue data API error:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch venue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueData();
    
    // Set up real-time updates every 45 seconds (increased interval for better performance)
    const interval = setInterval(fetchVenueData, 45000);
    
    return () => clearInterval(interval);
  }, [tourId]);

  if (loading || !venueData) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-700 rounded mb-2"></div>
        <div className="h-2 bg-gray-700 rounded"></div>
      </div>
    );
  }

  const { capacity, energy } = venueData;

  // Status color mapping
  const statusColors = {
    available: 'bg-green-600',
    filling_fast: 'bg-yellow-600',
    nearly_full: 'bg-orange-600',
    sold_out: 'bg-red-600'
  };

  const statusIcons = {
    available: CheckCircle,
    filling_fast: TrendingUp,
    nearly_full: AlertTriangle,
    sold_out: Users
  };

  const energyColors = {
    low: 'text-gray-400',
    moderate: 'text-blue-400',
    high: 'text-orange-400',
    explosive: 'text-red-400'
  };

  const energyIcons = {
    low: Activity,
    moderate: Volume2,
    high: Flame,
    explosive: Zap
  };

  const StatusIcon = statusIcons[capacity.status];
  const EnergyIcon = energyIcons[energy.energyStatus];

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {/* Capacity indicator */}
        <div className="flex items-center space-x-2">
          <StatusIcon className="h-4 w-4 text-white" />
          <div className="flex items-center space-x-1">
            <Progress 
              value={capacity.capacityPercentage} 
              className="w-12 h-2"
            />
            <span className="text-xs text-gray-300">{capacity.capacityPercentage}%</span>
          </div>
        </div>

        {/* Energy indicator */}
        <div className="flex items-center space-x-1">
          <EnergyIcon className={`h-4 w-4 ${energyColors[energy.energyStatus]}`} />
          <span className={`text-xs font-medium ${energyColors[energy.energyStatus]}`}>
            {energy.energyStatus.toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card className={`bg-gray-900/50 border-gray-700 ${className}`} data-testid="venue-capacity-card">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Venue Status
          </h3>
          {lastUpdated && (
            <div className="flex items-center text-xs text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Capacity Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Capacity</span>
            <Badge 
              className={`${statusColors[capacity.status]} text-white text-xs`}
              data-testid="capacity-status-badge"
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {capacity.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-2">
            <Progress 
              value={capacity.capacityPercentage} 
              className="h-3"
              data-testid="capacity-progress-bar"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatNumber(capacity.currentAttendance)} sold</span>
              <span>{formatNumber(capacity.venueCapacity)} capacity</span>
            </div>
          </div>
        </div>

        {/* Crowd Energy Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Crowd Energy</span>
            <Badge 
              variant="outline" 
              className={`border-current ${energyColors[energy.energyStatus]} text-xs`}
              data-testid="energy-status-badge"
            >
              <EnergyIcon className="h-3 w-3 mr-1" />
              {energy.energyStatus.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-2">
            <Progress 
              value={energy.energyLevel * 100} 
              className={`h-2 ${energy.energyStatus === 'explosive' ? '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-yellow-500' : ''}`}
              data-testid="energy-progress-bar"
            />
            <div className="text-xs text-gray-400">
              Energy Level: {Math.round(energy.energyLevel * 100)}/100
            </div>
          </div>

          {/* Energy Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Social Buzz:</span>
              <span className="text-white">{Math.round(energy.metrics.socialBuzz * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Anticipation:</span>
              <span className="text-white">{Math.round(energy.metrics.anticipationScore * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sentiment:</span>
              <span className="text-white">{Math.round(energy.metrics.reviewSentiment * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Popularity:</span>
              <span className="text-white">{Math.round(energy.metrics.bandPopularity * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Real-time Attendee Count */}
        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center">
              <Activity className="h-4 w-4 mr-1" />
              Real-time Count:
            </span>
            <span className="text-white font-medium" data-testid="realtime-attendee-count">
              {formatNumber(capacity.attendeeCount)} attendees
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for fetching multiple venue statuses
export function useVenueStatuses(tourIds: string[]) {
  const [venueStatuses, setVenueStatuses] = useState<Record<string, VenueRealtimeData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tourIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchVenueStatuses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tours/venue-status', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include session cookies
          body: JSON.stringify({ tourIds })
        });

        if (response.ok) {
          const data = await response.json();
          const statusMap = data.reduce((acc: Record<string, VenueRealtimeData>, venueData: VenueRealtimeData) => {
            acc[venueData.tourId] = venueData;
            return acc;
          }, {});
          setVenueStatuses(statusMap);
          console.log('Batch venue statuses updated:', Object.keys(statusMap).length, 'tours');
        } else {
          console.error('Venue status batch API error:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch venue statuses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueStatuses();
    
    // Real-time updates (60 seconds for batch operations)
    const interval = setInterval(fetchVenueStatuses, 60000);
    
    return () => clearInterval(interval);
  }, [tourIds]);

  return { venueStatuses, loading };
}