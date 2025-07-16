import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Activity, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const ApiMonitoring = () => {
  // Fetch API metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['api-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch active alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['api-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 1 minute
  });

  // Process data for charts
  const processMetricsForCharts = () => {
    if (!metrics) return { responseTimeData: [], successRateData: [], marketplaceStats: [] };

    // Group by hour for response time chart
    const responseTimeData = metrics.reduce((acc: any[], metric) => {
      const hour = format(new Date(metric.created_at), 'HH:mm');
      const existing = acc.find(item => item.time === hour && item.marketplace === metric.marketplace_name);
      
      if (existing) {
        existing.avgResponseTime = (existing.avgResponseTime + metric.response_time_ms) / 2;
      } else {
        acc.push({
          time: hour,
          marketplace: metric.marketplace_name,
          avgResponseTime: metric.response_time_ms || 0
        });
      }
      
      return acc;
    }, []);

    // Calculate success rate by marketplace
    const marketplaceStats = metrics.reduce((acc: any[], metric) => {
      const existing = acc.find(item => item.marketplace === metric.marketplace_name);
      
      if (existing) {
        existing.total += 1;
        if (metric.success) existing.successful += 1;
      } else {
        acc.push({
          marketplace: metric.marketplace_name,
          total: 1,
          successful: metric.success ? 1 : 0
        });
      }
      
      return acc;
    }, []);

    marketplaceStats.forEach(stat => {
      stat.successRate = ((stat.successful / stat.total) * 100).toFixed(1);
    });

    return { responseTimeData, marketplaceStats };
  };

  const { responseTimeData, marketplaceStats } = processMetricsForCharts();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const resolveAlert = async (alertId: string) => {
    await supabase
      .from('api_alerts')
      .update({ 
        is_active: false, 
        resolved_at: new Date().toISOString() 
      })
      .eq('id', alertId);
  };

  if (metricsLoading || alertsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Monitoramento de API</h1>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Última atualização: {format(new Date(), 'HH:mm:ss')}
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Chamadas</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics && metrics.length > 0 
                ? `${((metrics.filter(m => m.success).length / metrics.length) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics && metrics.length > 0
                ? `${Math.round(metrics.reduce((acc, m) => acc + (m.response_time_ms || 0), 0) / metrics.length)}ms`
                : '0ms'
              }
            </div>
            <p className="text-xs text-muted-foreground">Resposta média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="marketplace">Por Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tempo de Resposta por Hora</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value}ms`, 'Tempo de Resposta']}
                    labelFormatter={(label) => `Hora: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgResponseTime" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts && alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            {alert.marketplace_name && (
                              <Badge variant="outline">{alert.marketplace_name}</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolver
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>Nenhum alerta ativo no momento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marketplaceStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="marketplace" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Taxa de Sucesso']}
                  />
                  <Bar dataKey="successRate" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketplaceStats.map((stat) => (
              <Card key={stat.marketplace}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base capitalize">{stat.marketplace}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total de Chamadas</span>
                      <span className="font-medium">{stat.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sucessos</span>
                      <span className="font-medium text-green-600">{stat.successful}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
                      <Badge variant={parseFloat(stat.successRate) > 95 ? 'default' : 'destructive'}>
                        {stat.successRate}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiMonitoring;