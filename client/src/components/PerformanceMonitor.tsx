import React, { useEffect, useState } from 'react';
import { Activity, Cpu, Database, Clock, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePerformanceMonitor } from '@/lib/performance';
import { databaseOptimizer } from '@/lib/database-optimization';

interface PerformanceMonitorProps {
  showDetails?: boolean;
}

/**
 * Real-time performance monitoring dashboard component
 */
export function PerformanceMonitor({ showDetails = false }: PerformanceMonitorProps) {
  const [perfStats, setPerfStats] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { getSummary, getNavigationTiming } = usePerformanceMonitor();

  useEffect(() => {
    // Update stats every 5 seconds
    const interval = setInterval(() => {
      setPerfStats(getSummary());
      setDbStats(databaseOptimizer.getPerformanceStats());
    }, 5000);

    // Initial load
    setPerfStats(getSummary());
    setDbStats(databaseOptimizer.getPerformanceStats());

    return () => clearInterval(interval);
  }, [getSummary]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!perfStats || !showDetails) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="w-3 h-3" />
        <Badge variant={isOnline ? 'default' : 'destructive'} className="text-xs">
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
        {perfStats?.recentMetrics && (
          <span>{perfStats.recentMetrics} metrics</span>
        )}
      </div>
    );
  }

  const navigation = getNavigationTiming();
  
  return (
    <Card className="w-full max-w-2xl bg-black/60 border-red-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-red-400">
          <Activity className="w-5 h-5" />
          Performance Monitor
          <Badge variant={isOnline ? 'default' : 'destructive'} className="ml-auto">
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Core Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-950/20 rounded border border-red-500/20">
            <Clock className="w-5 h-5 mx-auto mb-1 text-red-400" />
            <div className="text-sm text-muted-foreground">Metrics</div>
            <div className="text-lg font-mono text-white">{perfStats.recentMetrics}</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-950/20 rounded border border-yellow-500/20">
            <Cpu className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
            <div className="text-sm text-muted-foreground">Slow Ops</div>
            <div className="text-lg font-mono text-white">{perfStats.slowOperations}</div>
          </div>
          
          <div className="text-center p-3 bg-blue-950/20 rounded border border-blue-500/20">
            <Database className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <div className="text-sm text-muted-foreground">Cache Size</div>
            <div className="text-lg font-mono text-white">{dbStats?.cacheStats?.size || 0}</div>
          </div>
          
          <div className="text-center p-3 bg-green-950/20 rounded border border-green-500/20">
            <Wifi className="w-5 h-5 mx-auto mb-1 text-green-400" />
            <div className="text-sm text-muted-foreground">Active Requests</div>
            <div className="text-lg font-mono text-white">{dbStats?.activeRequests || 0}</div>
          </div>
        </div>

        {/* Performance Averages */}
        {Object.keys(perfStats.averages).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-400">Average Response Times (ms)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(perfStats.averages).map(([metric, value]: [string, any]) => (
                <div key={metric} className="flex justify-between p-2 bg-gray-800/50 rounded">
                  <span className="text-muted-foreground">{metric}:</span>
                  <span className={`font-mono ${value > 1000 ? 'text-red-400' : 'text-green-400'}`}>
                    {Math.round(value)}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Timing */}
        {navigation && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-yellow-400">Page Load Performance</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex justify-between p-2 bg-gray-800/50 rounded">
                <span className="text-muted-foreground">DNS:</span>
                <span className="font-mono text-green-400">{navigation.dns}ms</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-800/50 rounded">
                <span className="text-muted-foreground">Request:</span>
                <span className="font-mono text-blue-400">{navigation.request}ms</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-800/50 rounded">
                <span className="text-muted-foreground">Total:</span>
                <span className={`font-mono ${navigation.total > 3000 ? 'text-red-400' : 'text-green-400'}`}>
                  {navigation.total}ms
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Mini performance indicator for navigation bar
 */
export function PerformanceIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasSlowConnection, setHasSlowConnection] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection speed
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setHasSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-full ${
        !isOnline ? 'bg-red-500' : 
        hasSlowConnection ? 'bg-yellow-500' : 'bg-green-500'
      }`} />
      {!isOnline && <span className="text-xs text-red-400">Offline</span>}
      {hasSlowConnection && isOnline && <span className="text-xs text-yellow-400">Slow</span>}
    </div>
  );
}