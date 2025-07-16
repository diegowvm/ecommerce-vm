import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Activity, Database } from "lucide-react";
import { ApiConnectionsList } from "./ApiConnectionsList";
import { SyncLogsTable } from "./SyncLogsTable";
import { AddApiDialog } from "./AddApiDialog";
import { useToast } from "@/hooks/use-toast";

interface ApiConnection {
  id: string;
  name: string;
  platform: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  totalProducts: number;
  successRate: number;
}

const mockApiConnections: ApiConnection[] = [
  {
    id: '1',
    name: 'MercadoLivre Principal',
    platform: 'MercadoLivre',
    status: 'connected',
    lastSync: '2 horas atrás',
    totalProducts: 1250,
    successRate: 98.5
  },
  {
    id: '2', 
    name: 'Amazon US',
    platform: 'Amazon',
    status: 'error',
    lastSync: '1 dia atrás',
    totalProducts: 0,
    successRate: 0
  },
  {
    id: '3',
    name: 'AliExpress Dropship',
    platform: 'AliExpress', 
    status: 'connected',
    lastSync: '5 horas atrás',
    totalProducts: 850,
    successRate: 92.1
  }
];

export function ApiIntegrationsManager() {
  const [activeTab, setActiveTab] = useState('connections');
  const [apiConnections, setApiConnections] = useState<ApiConnection[]>(mockApiConnections);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const connectedApis = apiConnections.filter(api => api.status === 'connected').length;
  const totalProducts = apiConnections.reduce((sum, api) => sum + api.totalProducts, 0);
  const avgSuccessRate = apiConnections.length > 0 
    ? apiConnections.reduce((sum, api) => sum + api.successRate, 0) / apiConnections.length 
    : 0;

  const handleAddApi = (newApi: Omit<ApiConnection, 'id'>) => {
    const api: ApiConnection = {
      ...newApi,
      id: Date.now().toString()
    };
    
    setApiConnections(prev => [...prev, api]);
    setShowAddDialog(false);
    
    toast({
      title: "API Adicionada",
      description: `${api.name} foi configurada com sucesso`,
    });
  };

  const handleDeleteApi = (id: string) => {
    setApiConnections(prev => prev.filter(api => api.id !== id));
    
    toast({
      title: "API Removida",
      description: "A conexão foi removida com sucesso",
    });
  };

  const handleTestConnection = async (id: string) => {
    const api = apiConnections.find(a => a.id === id);
    if (!api) return;

    toast({
      title: "Testando Conexão",
      description: `Verificando conectividade com ${api.name}...`,
    });

    // Simulate test
    setTimeout(() => {
      const success = Math.random() > 0.3;
      
      if (success) {
        setApiConnections(prev => prev.map(a => 
          a.id === id ? { ...a, status: 'connected' as const } : a
        ));
        
        toast({
          title: "Teste Bem-sucedido",
          description: `Conexão com ${api.name} está funcionando`,
        });
      } else {
        setApiConnections(prev => prev.map(a => 
          a.id === id ? { ...a, status: 'error' as const } : a
        ));
        
        toast({
          title: "Teste Falhou",
          description: `Erro ao conectar com ${api.name}`,
          variant: "destructive",
        });
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integrações de API</h2>
          <p className="text-muted-foreground">
            Gerencie conexões com APIs de fornecedores e marketplaces
          </p>
        </div>
        
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Nova API
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              APIs Conectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedApis}</div>
            <p className="text-xs text-muted-foreground">de {apiConnections.length} configuradas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Total de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">produtos sincronizados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">média de sincronização</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                connectedApis === apiConnections.length ? 'bg-green-500' :
                connectedApis > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                {connectedApis === apiConnections.length ? 'Todas OK' :
                 connectedApis > 0 ? 'Parcial' : 'Erro'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">status das conexões</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections">Conexões</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-6">
          <ApiConnectionsList
            connections={apiConnections}
            onDelete={handleDeleteApi}
            onTest={handleTestConnection}
          />
        </TabsContent>

        <TabsContent value="rate-limits" className="space-y-6">
          <div className="text-center py-8">
            <p>Monitor de Rate Limits será implementado aqui</p>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <SyncLogsTable />
        </TabsContent>
      </Tabs>

      <AddApiDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddApi}
      />
    </div>
  );
}