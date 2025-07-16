import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Square, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productSyncService } from "@/services/ProductSyncService";
import { createMarketplaceAdapter, SUPPORTED_MARKETPLACES } from "@/integrations/marketplaces";

export function MarketplaceSync() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  const [maxProducts, setMaxProducts] = useState('100');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lastResults, setLastResults] = useState<any>(null);
  const { toast } = useToast();

  const handleStartSync = async () => {
    if (!selectedMarketplace) {
      toast({
        title: "Erro",
        description: "Selecione um marketplace para sincronizar",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setLastResults(null);

    try {
      // TODO: Get real credentials from Supabase Secrets or user configuration
      const mockCredentials = {
        clientId: 'mock_client_id',
        clientSecret: 'mock_client_secret',
        redirectUri: 'http://localhost:3000/auth/callback'
      };

      // Create adapter
      const adapter = createMarketplaceAdapter(selectedMarketplace as any, mockCredentials);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Start sync
      const result = await productSyncService.importProductsFromMarketplace(
        adapter,
        selectedMarketplace,
        {
          maxProducts: parseInt(maxProducts) || 100,
          categoryFilter: categoryFilter || undefined
        }
      );

      clearInterval(progressInterval);
      setProgress(100);
      setLastResults(result);

      toast({
        title: "Sincronização Concluída",
        description: `${result.productsImported} produtos importados, ${result.productsUpdated} atualizados`,
      });

    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Erro na Sincronização",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const handleStopSync = () => {
    setIsRunning(false);
    setProgress(0);
    toast({
      title: "Sincronização Interrompida",
      description: "O processo foi cancelado pelo usuário",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Sincronização</CardTitle>
          <CardDescription>
            Configure os parâmetros para importar produtos dos marketplaces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="marketplace">Marketplace</Label>
              <Select
                value={selectedMarketplace}
                onValueChange={setSelectedMarketplace}
                disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um marketplace" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_MARKETPLACES.map((marketplace) => (
                    <SelectItem key={marketplace} value={marketplace}>
                      {marketplace}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxProducts">Máximo de Produtos</Label>
              <Input
                id="maxProducts"
                type="number"
                value={maxProducts}
                onChange={(e) => setMaxProducts(e.target.value)}
                placeholder="100"
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryFilter">Filtro de Categoria (opcional)</Label>
            <Input
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="Ex: eletrônicos, roupas, calçados"
              disabled={isRunning}
            />
          </div>

          <Separator />

          <div className="flex items-center gap-4">
            {!isRunning ? (
              <Button onClick={handleStartSync} disabled={!selectedMarketplace}>
                <Play className="w-4 h-4 mr-2" />
                Iniciar Sincronização
              </Button>
            ) : (
              <Button onClick={handleStopSync} variant="destructive">
                <Square className="w-4 h-4 mr-2" />
                Parar Sincronização
              </Button>
            )}

            <Button variant="outline" disabled={isRunning}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronização Automática
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progresso da sincronização</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              MercadoLivre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Conectado</div>
            <p className="text-xs text-muted-foreground">Última sync: 2h atrás</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Amazon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Desconectado</div>
            <p className="text-xs text-muted-foreground">Configuração necessária</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              AliExpress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Pendente</div>
            <p className="text-xs text-muted-foreground">Autenticação expirada</p>
          </CardContent>
        </Card>
      </div>

      {/* Last Results */}
      {lastResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Último Resultado de Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Marketplace</p>
                <p className="font-semibold">{lastResults.marketplaceName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processados</p>
                <p className="font-semibold">{lastResults.productsProcessed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Importados</p>
                <p className="font-semibold text-green-600">{lastResults.productsImported}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atualizados</p>
                <p className="font-semibold text-blue-600">{lastResults.productsUpdated}</p>
              </div>
            </div>

            {lastResults.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {lastResults.errors.length} erro(s) encontrado(s) durante a sincronização.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Duração: {Math.round((new Date(lastResults.endTime).getTime() - new Date(lastResults.startTime).getTime()) / 1000)}s</span>
              <Badge variant={lastResults.status === 'completed' ? 'default' : 'destructive'}>
                {lastResults.status === 'completed' ? 'Concluído' : 'Falhou'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}