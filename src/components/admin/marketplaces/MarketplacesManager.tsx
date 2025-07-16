import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw, Loader2 } from "lucide-react";
import { MarketplaceSync } from "./MarketplaceSync";
import { CategoryMappings } from "./CategoryMappings";
import { SyncHistory } from "./SyncHistory";
import { MarketplaceConfig } from "./MarketplaceConfig";
import { NoApisConfigured, NoProductsSync } from "./EmptyStates";
import { useMarketplaceData } from "@/hooks/useMarketplaceData";

const MARKETPLACE_DESCRIPTIONS = {
  'MercadoLivre': 'Marketplace líder no Brasil e América Latina',
  'Amazon': 'Maior marketplace global',
  'AliExpress': 'Marketplace chinês para dropshipping'
};

export function MarketplacesManager() {
  const [activeTab, setActiveTab] = useState('overview');
  const { connections, stats, loading, error } = useMarketplaceData();

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'connected':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'pending':
        return 'Pendente';
      default:
        return 'Desconectado';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketplaces</h2>
          <p className="text-muted-foreground">
            Gerencie suas integrações com marketplaces
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sync">Sincronização</TabsTrigger>
          <TabsTrigger value="mappings">Mapeamentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-destructive">Erro ao carregar dados: {error}</p>
              </CardContent>
            </Card>
          ) : connections.length === 0 ? (
            <NoApisConfigured />
          ) : stats.totalProducts === 0 ? (
            <NoProductsSync apisCount={connections.length} />
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {connections.map((connection) => (
                  <Card key={connection.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{connection.marketplace_name}</CardTitle>
                        <Badge variant={getStatusVariant(connection.connection_status)}>
                          {getStatusLabel(connection.connection_status)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {MARKETPLACE_DESCRIPTIONS[connection.marketplace_name as keyof typeof MARKETPLACE_DESCRIPTIONS] || 'Marketplace integrado'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Produtos</p>
                          <p className="font-semibold">{connection.productCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pedidos</p>
                          <p className="font-semibold">{connection.orderCount}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Última sincronização</p>
                        <p className="text-sm font-medium">{formatTimeAgo(connection.lastSync)}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="w-4 h-4 mr-2" />
                          Configurar
                        </Button>
                        {connection.connection_status === 'connected' && (
                          <Button size="sm" className="flex-1">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Sincronizar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalProducts === 0 ? 'Nenhum produto sincronizado' : 'Produtos sincronizados'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.ordersToday}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.ordersToday === 0 ? 'Nenhum pedido hoje' : 'Pedidos realizados hoje'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Marketplaces Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeMarketplaces}</div>
                    <p className="text-xs text-muted-foreground">
                      de {connections.length} configurado{connections.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.lastSyncTime ? formatTimeAgo(stats.lastSyncTime) : 'Nunca'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.lastSyncMarketplace || 'Nenhuma sincronização'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <MarketplaceSync />
        </TabsContent>

        <TabsContent value="mappings" className="space-y-6">
          <CategoryMappings />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <SyncHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}