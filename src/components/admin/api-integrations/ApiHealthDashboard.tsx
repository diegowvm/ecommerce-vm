import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ApiHealth {
  marketplace: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  lastSuccess: Date | null;
  lastError: Date | null;
  successRate: number;
  avgResponseTime: number;
  totalRequests: number;
  errorCount: number;
  rateLimitHits: number;
}

interface ApiAlert {
  id: string;
  marketplace: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  createdAt: Date;
  isActive: boolean;
}

export const ApiHealthDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<ApiHealth[]>([]);
  const [alerts, setAlerts] = useState<ApiAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealthData = async () => {
    try {
      setRefreshing(true);

      // Get API metrics for health calculation
      const { data: metrics, error: metricsError } = await supabase
        .from('api_metrics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false });

      if (metricsError) {
        console.error('Error fetching API metrics:', metricsError);
        return;
      }

      // Get active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('api_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) {
        console.error('Error fetching alerts:', alertsError);
      }

      // Process metrics data by marketplace
      const healthByMarketplace = new Map<string, ApiHealth>();
      
      metrics?.forEach(metric => {
        if (!healthByMarketplace.has(metric.marketplace_name)) {
          healthByMarketplace.set(metric.marketplace_name, {
            marketplace: metric.marketplace_name,
            status: 'unknown',
            lastSuccess: null,
            lastError: null,
            successRate: 0,
            avgResponseTime: 0,
            totalRequests: 0,
            errorCount: 0,
            rateLimitHits: 0
          });
        }

        const health = healthByMarketplace.get(metric.marketplace_name)!;
        health.totalRequests++;

        if (metric.success) {
          health.lastSuccess = new Date(metric.created_at);
          if (metric.response_time_ms) {
            health.avgResponseTime = (health.avgResponseTime + metric.response_time_ms) / 2;
          }
        } else {
          health.errorCount++;
          health.lastError = new Date(metric.created_at);
          
          if (metric.status_code === 429) {
            health.rateLimitHits++;
          }
        }
      });

      // Calculate health status and success rate
      const healthArray = Array.from(healthByMarketplace.values()).map(health => {
        health.successRate = health.totalRequests > 0 
          ? ((health.totalRequests - health.errorCount) / health.totalRequests) * 100
          : 0;

        // Determine status
        if (health.rateLimitHits > 5 || health.successRate < 50) {
          health.status = 'critical';
        } else if (health.rateLimitHits > 2 || health.successRate < 80) {
          health.status = 'warning';
        } else if (health.successRate >= 90) {
          health.status = 'healthy';
        } else {
          health.status = 'unknown';
        }

        return health;
      });

      setHealthData(healthArray);
      
      // Transform alerts data
      const transformedAlerts: ApiAlert[] = alertsData?.map(alert => ({
        id: alert.id,
        marketplace: alert.marketplace_name || 'System',
        type: alert.alert_type,
        severity: alert.severity as 'high' | 'medium' | 'low',
        message: alert.message,
        createdAt: new Date(alert.created_at),
        isActive: alert.is_active || false
      })) || [];

      setAlerts(transformedAlerts);

    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchHealthData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const formatTimeElapsed = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Health Dashboard</CardTitle>
          <CardDescription>Loading health data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const overallHealth = healthData.length > 0 
    ? healthData.reduce((acc, h) => acc + h.successRate, 0) / healthData.length
    : 0;

  const criticalIssues = healthData.filter(h => h.status === 'critical').length;
  const activeAlerts = alerts.filter(a => a.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Health Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Monitor API performance and system health across all marketplaces
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchHealthData}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Health Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overall Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallHealth.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">success rate (24h)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Critical Issues  
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalIssues}</div>
            <p className="text-xs text-muted-foreground">marketplaces affected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground">requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData.reduce((acc, h) => acc + h.totalRequests, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Marketplace Health */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {healthData.map((health) => {
          const StatusIcon = getStatusIcon(health.status);
          
          return (
            <Card key={health.marketplace}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize">
                    {health.marketplace}
                  </CardTitle>
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(health.status)}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span className="font-medium">{health.successRate.toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Avg Response</span>
                  <span className="font-medium">{health.avgResponseTime.toFixed(0)}ms</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Rate Limit Hits</span>
                  <span className={`font-medium ${health.rateLimitHits > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {health.rateLimitHits}
                  </span>
                </div>

                <div className="pt-2 border-t space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Last Success</span>
                    <span>{formatTimeElapsed(health.lastSuccess)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Last Error</span>
                    <span>{formatTimeElapsed(health.lastError)}</span>
                  </div>
                </div>

                <Badge 
                  variant={health.status === 'healthy' ? 'default' : 
                          health.status === 'warning' ? 'secondary' : 'destructive'}
                  className="w-full justify-center"
                >
                  {health.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>
              Recent alerts requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{alert.marketplace} - {alert.type}</div>
                    <div className="text-sm">{alert.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTimeElapsed(alert.createdAt)}
                    </div>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity) as any}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {healthData.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Health Data</h3>
              <p className="text-muted-foreground">
                API metrics will appear here once integrations are active
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};