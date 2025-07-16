import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw, History, MapPin } from "lucide-react";
import { MarketplaceSync } from "./MarketplaceSync";
import { CategoryMappings } from "./CategoryMappings";
import { SyncHistory } from "./SyncHistory";
import { MarketplaceConfig } from "./MarketplaceConfig";

const MARKETPLACES = [
  {
    name: 'MercadoLivre',
    status: 'connected',
    lastSync: '2 horas atrás',
    products: 1250,
    orders: 45,
    description: 'Marketplace líder no Brasil e América Latina'
  },
  {
    name: 'Amazon',
    status: 'disconnected',
    lastSync: 'Nunca',
    products: 0,
    orders: 0,
    description: 'Maior marketplace global'
  },
  {
    name: 'AliExpress',
    status: 'pending',
    lastSync: '1 dia atrás',
    products: 500,
    orders: 12,
    description: 'Marketplace chinês para dropshipping'
  }
];

export function MarketplacesManager() {
  const [activeTab, setActiveTab] = useState('overview');

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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MARKETPLACES.map((marketplace) => (
              <Card key={marketplace.name} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{marketplace.name}</CardTitle>
                    <Badge 
                      variant={
                        marketplace.status === 'connected' ? 'default' :
                        marketplace.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {marketplace.status === 'connected' ? 'Conectado' :
                       marketplace.status === 'pending' ? 'Pendente' : 
                       'Desconectado'}
                    </Badge>
                  </div>
                  <CardDescription>{marketplace.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Produtos</p>
                      <p className="font-semibold">{marketplace.products.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pedidos</p>
                      <p className="font-semibold">{marketplace.orders}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Última sincronização</p>
                    <p className="text-sm font-medium">{marketplace.lastSync}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurar
                    </Button>
                    {marketplace.status === 'connected' && (
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
                <div className="text-2xl font-bold">1,750</div>
                <p className="text-xs text-muted-foreground">+12% desde ontem</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">57</div>
                <p className="text-xs text-muted-foreground">+5% desde ontem</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Marketplaces Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">de 3 configurados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2h</div>
                <p className="text-xs text-muted-foreground">MercadoLivre</p>
              </CardContent>
            </Card>
          </div>
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