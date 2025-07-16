import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  RefreshCw, 
  TrendingUp, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ApiConnection } from './ApiConfigurationManager';

interface ApiStatusDashboardProps {
  connections: ApiConnection[];
  onRefresh: () => void;
}

interface ApiMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  lastSync: string | null;
  errors: number;
}

export function ApiStatusDashboard({ connections, onRefresh }: ApiStatusDashboardProps) {
  const [metrics, setMetrics] = useState<Record<string, ApiMetrics>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, [connections]);

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('api_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Process metrics by marketplace
      const processedMetrics: Record<string, ApiMetrics> = {};
      
      ['MercadoLivre', 'Amazon', 'AliExpress'].forEach(marketplace => {
        const marketplaceMetrics = data?.filter(m => m.marketplace_name === marketplace) || [];
        
        processedMetrics[marketplace] = {
          totalRequests: marketplaceMetrics.length,
          successRate: marketplaceMetrics.length > 0 
            ? (marketplaceMetrics.filter(m => m.success).length / marketplaceMetrics.length) * 100 
            : 0,
          averageResponseTime: marketplaceMetrics.length > 0
            ? marketplaceMetrics.reduce((acc, m) => acc + (m.response_time_ms || 0), 0) / marketplaceMetrics.length
            : 0,
          lastSync: marketplaceMetrics.length > 0 ? marketplaceMetrics[0].created_at : null,
          errors: marketplaceMetrics.filter(m => !m.success).length
        };
      });

      setMetrics(processedMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const refreshAllConnections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('refresh-all-connections');
      
      if (error) throw error;
      
      toast({
        title: "Conexões atualizadas",
        description: "Todas as conexões foram verificadas",
      });
      
      onRefresh();
    } catch (error: any) {
      console.error('Error refreshing connections:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'testing': return 'text-blue-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'testing': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const connectedCount = connections.filter(c => c.connection_status === 'connected').length;
  const totalCount = 3; // MercadoLivre, Amazon, AliExpress

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard de APIs</h2>
          <p className="text-muted-foreground">
            Monitore o status e desempenho das suas integrações
          </p>
        </div>
        <Button 
          onClick={refreshAllConnections} 
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Tudo
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}/{totalCount}</div>
            <div className="mt-2">
              <Progress value={(connectedCount / totalCount) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(metrics).length > 0 
                ? Math.round(Object.values(metrics).reduce((acc, m) => acc + m.successRate, 0) / Object.values(metrics).length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Média das últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(metrics).length > 0 
                ? Math.round(Object.values(metrics).reduce((acc, m) => acc + m.averageResponseTime, 0) / Object.values(metrics).length)
                : 0}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tempo médio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(metrics).reduce((acc, m) => acc + m.totalRequests, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimas 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status Detalhado das Conexões</CardTitle>
          <CardDescription>
            Informações detalhadas sobre cada marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['MercadoLivre', 'Amazon', 'AliExpress'].map((marketplace, index) => {
              const connection = connections.find(c => c.marketplace_name === marketplace);
              const metric = metrics[marketplace];
              const status = connection?.connection_status || 'disconnected';
              
              return (
                <div key={marketplace}>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-xl">
                        {marketplace === 'MercadoLivre' && '🛒'}
                        {marketplace === 'Amazon' && '📦'}
                        {marketplace === 'AliExpress' && '🏪'}
                      </div>
                      <div>
                        <div className="font-medium">{marketplace}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className={getStatusColor(status)}>
                            {getStatusIcon(status)}
                          </span>
                          {status === 'connected' ? 'Conectado' : 
                           status === 'error' ? 'Erro' :
                           status === 'testing' ? 'Testando' : 'Não configurado'}
                        </div>
                      </div>
                    </div>
                    
                    {metric && (
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">
                          {metric.successRate.toFixed(1)}% sucesso
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {metric.totalRequests} requests
                        </div>
                        {metric.lastSync && (
                          <div className="text-xs text-muted-foreground">
                            Última sync: {new Date(metric.lastSync).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {index < 2 && <Separator />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas operações realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {connections.length > 0 ? (
              connections.slice(0, 5).map((connection) => (
                <div key={connection.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      connection.connection_status === 'connected' ? 'bg-green-500' :
                      connection.connection_status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <div className="font-medium">{connection.connection_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {connection.marketplace_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {connection.last_test_at 
                        ? new Date(connection.last_test_at).toLocaleDateString()
                        : 'Nunca testado'
                      }
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
                <p className="text-sm">Configure suas primeiras APIs para ver a atividade aqui</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}