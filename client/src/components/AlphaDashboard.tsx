import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Activity, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Shield,
  RefreshCw 
} from 'lucide-react';

interface AlphaDashboardData {
  summary: {
    totalTesters: number;
    activeTesters: number;
    totalSessions: number;
    feedbackCount: number;
    mostActiveFeatures: Array<{ feature: string; count: number }>;
  };
  testers: Array<{
    id: string;
    name: string;
    email: string;
    accessKey: string;
    joinedAt: string;
    lastActive: string;
    sessionsCount: number;
    featuresUsed: string[];
    feedbackSubmitted: boolean;
  }>;
}

export function AlphaDashboard() {
  const [data, setData] = useState<AlphaDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/alpha/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      } else {
        throw new Error('Failed to fetch dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load alpha dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin text-red-400" />
          <span className="ml-2 text-gray-300">Loading alpha dashboard...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="text-center p-8">
          <Shield className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No alpha testing data available</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, testers } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-red-300">Alpha Testing Dashboard</h2>
          <p className="text-gray-400">Monitor your alpha testers and gather insights</p>
        </div>
        <Button
          onClick={fetchDashboard}
          variant="outline"
          size="sm"
          className="border-red-500/50 text-red-300 hover:bg-red-500/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Total Testers</p>
                <p className="text-2xl font-bold text-white">{summary.totalTesters}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Active Testers</p>
                <p className="text-2xl font-bold text-white">{summary.activeTesters}</p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-300">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{summary.totalSessions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Feedback Count</p>
                <p className="text-2xl font-bold text-white">{summary.feedbackCount}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Used Features */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-300">Most Active Features</CardTitle>
          <CardDescription className="text-gray-400">
            Features being tested most by your alpha users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.mostActiveFeatures.length > 0 ? (
            <div className="space-y-2">
              {summary.mostActiveFeatures.slice(0, 5).map((feature, index) => (
                <div key={feature.feature} className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                  <span className="text-sm text-gray-300">{feature.feature}</span>
                  <Badge variant="outline" className="bg-red-500/20 text-red-300">
                    {feature.count} users
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No feature usage data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Testers List */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-300">Alpha Testers</CardTitle>
          <CardDescription className="text-gray-400">
            Detailed view of all alpha testers and their activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testers.map((tester) => (
              <div 
                key={tester.id} 
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-700/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-white">{tester.name}</h4>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-300 text-xs">
                      {tester.accessKey}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{tester.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last: {new Date(tester.lastActive).toLocaleDateString()}
                    </span>
                    <span>Sessions: {tester.sessionsCount}</span>
                    <span>Features: {tester.featuresUsed.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {tester.sessionsCount > 0 && (
                    <Badge variant="outline" className="bg-green-500/20 text-green-300">
                      Active
                    </Badge>
                  )}
                  {tester.feedbackSubmitted && (
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-300">
                      Feedback
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}