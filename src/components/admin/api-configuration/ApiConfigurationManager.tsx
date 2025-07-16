import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MercadoLivreConfig } from './MercadoLivreConfig';
import { AmazonConfig } from './AmazonConfig';
import { AliExpressConfig } from './AliExpressConfig';
import { ApiStatusDashboard } from './ApiStatusDashboard';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface ApiConnection {
  id: string;
  marketplace_name: string;
  connection_name: string;
  connection_status: string | null;
  last_test_at: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export function ApiConfigurationManager() {
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('api_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatus = (marketplaceName: string) => {
    const connection = connections.find(c => c.marketplace_name === marketplaceName);
    return connection?.connection_status || 'disconnected';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'testing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'default',
      disconnected: 'secondary',
      testing: 'outline',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status === 'disconnected' ? 'Não configurado' : status}</span>
      </Badge>
    );
  };

  const marketplaces = [
    {
      name: 'MercadoLivre',
      description: 'Marketplace líder na América Latina',
      status: getConnectionStatus('MercadoLivre'),
      logo: '🛒'
    },
    {
      name: 'Amazon',
      description: 'Marketplace global',
      status: getConnectionStatus('Amazon'),
      logo: '📦'
    },
    {
      name: 'AliExpress',
      description: 'Marketplace chinês',
      status: getConnectionStatus('AliExpress'),
      logo: '🏪'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuração de APIs</h1>
        <p className="text-muted-foreground mt-2">
          Configure as credenciais dos marketplaces para sincronização automática de produtos
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketplaces.map((marketplace) => (
          <Card key={marketplace.name} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{marketplace.logo}</span>
                  <div>
                    <CardTitle className="text-lg">{marketplace.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {marketplace.description}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(marketplace.status)}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="mercadolivre">MercadoLivre</TabsTrigger>
          <TabsTrigger value="amazon">Amazon</TabsTrigger>
          <TabsTrigger value="aliexpress">AliExpress</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <ApiStatusDashboard 
            connections={connections} 
            onRefresh={loadConnections}
          />
        </TabsContent>

        <TabsContent value="mercadolivre" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Para obter as credenciais do MercadoLivre, acesse o{' '}
              <a 
                href="https://developers.mercadolivre.com.br/devcenter" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Portal de Desenvolvedores
              </a>
              {' '}e crie uma aplicação.
            </AlertDescription>
          </Alert>
          <MercadoLivreConfig 
            onConfigurationChange={loadConnections}
            currentStatus={getConnectionStatus('MercadoLivre')}
          />
        </TabsContent>

        <TabsContent value="amazon" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Para obter as credenciais da Amazon, acesse o{' '}
              <a 
                href="https://sellercentral.amazon.com/apps/manage" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Seller Central
              </a>
              {' '}e registre sua aplicação SP-API.
            </AlertDescription>
          </Alert>
          <AmazonConfig 
            onConfigurationChange={loadConnections}
            currentStatus={getConnectionStatus('Amazon')}
          />
        </TabsContent>

        <TabsContent value="aliexpress" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Para obter as credenciais do AliExpress, acesse o{' '}
              <a 
                href="https://open.aliexpress.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                AliExpress Open Platform
              </a>
              {' '}e crie uma aplicação.
            </AlertDescription>
          </Alert>
          <AliExpressConfig 
            onConfigurationChange={loadConnections}
            currentStatus={getConnectionStatus('AliExpress')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}