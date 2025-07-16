import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { rateLimitManager } from '@/services/RateLimitManager';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitInfo {
  marketplace: string;
  remaining: number;
  limit: number;
  resetTime: Date;
  queueInfo: {
    running: number;
    pending: number;
    reservoir: number | null;
  };
}

export const RateLimitMonitor: React.FC = () => {
  const [rateLimits, setRateLimits] = useState<RateLimitInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRateLimitData = async () => {
    try {
      setRefreshing(true);
      
      // Get active API connections
      const { data: connections, error } = await supabase
        .from('api_connections')
        .select('marketplace_name, rate_limit_remaining, rate_limit_reset_at, settings')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching rate limit data:', error);
        return;
      }

      const rateLimitData: RateLimitInfo[] = [];

      for (const connection of connections || []) {
        const status = rateLimitManager.getRateLimitStatus(connection.marketplace_name);
        const queueInfo = rateLimitManager.getQueueInfo(connection.marketplace_name);
        const settings = connection.settings as any;

        rateLimitData.push({
          marketplace: connection.marketplace_name,
          remaining: connection.rate_limit_remaining || status?.remaining || 0,
          limit: settings?.rateLimitPerMinute || status?.limit || 0,
          resetTime: connection.rate_limit_reset_at 
            ? new Date(connection.rate_limit_reset_at)
            : status?.reset || new Date(),
          queueInfo
        });
      }

      setRateLimits(rateLimitData);
    } catch (error) {
      console.error('Error fetching rate limit data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRateLimitData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRateLimitData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRateLimitStatus = (remaining: number, limit: number) => {
    if (limit === 0) return 'unknown';
    const percentage = (remaining / limit) * 100;
    if (percentage > 50) return 'healthy';
    if (percentage > 20) return 'warning';
    return 'critical';
  };

  const getRateLimitColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Clock;
    }
  };

  const formatTimeUntilReset = (resetTime: Date) => {
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Reset now';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Monitor</CardTitle>
          <CardDescription>Loading rate limit information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rate Limit Monitor</h3>
          <p className="text-sm text-muted-foreground">
            Monitor API rate limits and request queues for all marketplaces
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchRateLimitData}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rateLimits.map((info) => {
          const status = getRateLimitStatus(info.remaining, info.limit);
          const StatusIcon = getStatusIcon(status);
          const percentage = info.limit > 0 ? (info.remaining / info.limit) * 100 : 0;

          return (
            <Card key={info.marketplace}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize">
                    {info.marketplace}
                  </CardTitle>
                  <StatusIcon className={`w-5 h-5 ${getRateLimitColor(status)}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rate Limit Status */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Rate Limit</span>
                    <span>{info.remaining} / {info.limit}</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <Badge 
                      variant={status === 'healthy' ? 'default' : 
                              status === 'warning' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {status.toUpperCase()}
                    </Badge>
                    <span>Reset: {formatTimeUntilReset(info.resetTime)}</span>
                  </div>
                </div>

                {/* Queue Information */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-sm font-medium">Request Queue</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{info.queueInfo.running}</div>
                      <div className="text-muted-foreground">Running</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">{info.queueInfo.pending}</div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">
                        {info.queueInfo.reservoir || 0}
                      </div>
                      <div className="text-muted-foreground">Available</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rateLimits.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Connections</h3>
              <p className="text-muted-foreground">
                Connect to marketplaces to monitor rate limits
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};