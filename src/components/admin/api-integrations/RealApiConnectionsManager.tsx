import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShoppingCart, 
  Zap, 
  RefreshCw, 
  Settings, 
  Download, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Upload
} from 'lucide-react';

interface ApiConnection {
  id: string;
  marketplace_name: string;
  connection_name: string;
  connection_status: string;
  last_test_at: string;
  oauth_expires_at: string;
  rate_limit_remaining: number;
  settings: any;
  is_active: boolean;
  created_at: string;
}

interface MarketplaceProduct {
  id: string;
  marketplace_product_id: string;
  title: string;
  price: number;
  original_price: number;
  available_quantity: number;
  sold_quantity: number;
  images: string[];
  marketplace_url: string;
  sync_status: string;
  last_sync_at: string;
  is_imported: boolean;
  auto_sync_enabled: boolean;
}

export function RealApiConnectionsManager() {
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      loadProducts(selectedConnection);
    }
  }, [selectedConnection]);

  const loadConnections = async () => {
    const { data, error } = await supabase
      .from('api_connections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar conexões',
        variant: 'destructive'
      });
      return;
    }

    setConnections(data || []);
    if (data && data.length > 0 && !selectedConnection) {
      setSelectedConnection(data[0].id);
    }
  };

  const loadProducts = async (connectionId: string) => {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select('*')
      .eq('api_connection_id', connectionId)
      .order('last_sync_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading products:', error);
      return;
    }

    setProducts(data || []);
  };

  const handleOAuthConnect = async (marketplace: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('marketplace-oauth', {
        body: {
          marketplace,
          action: 'get_auth_url',
          redirectUri: `${window.location.origin}/admin/api-integrations/callback`
        }
      });

      if (error) throw error;

      // Abrir popup para OAuth
      const authWindow = window.open(
        data.authUrl,
        'oauth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      // Aguardar callback
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          loadConnections(); // Recarregar conexões
          setIsLoading(false);
        }
      }, 1000);

    } catch (error: any) {
      console.error('OAuth error:', error);
      toast({
        title: 'Erro na Autenticação',
        description: error.message,
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  const handleProductSearch = async () => {
    if (!selectedConnection || !searchQuery.trim()) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('product-import', {
        body: {
          connectionId: selectedConnection,
          searchQuery: searchQuery.trim()
        }
      });

      if (error) throw error;

      toast({
        title: 'Busca Concluída',
        description: `${data.products.length} produtos encontrados`
      });

      loadProducts(selectedConnection);
      setShowProductSearch(false);
      setSearchQuery('');

    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Erro na Busca',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncProducts = async (syncType: string = 'all') => {
    if (!selectedConnection) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('sync-products', {
        body: {
          connectionId: selectedConnection,
          syncType
        }
      });

      if (error) throw error;

      toast({
        title: 'Sincronização Iniciada',
        description: 'Os produtos serão atualizados em segundo plano'
      });

    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: 'Erro na Sincronização',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const importProductToStore = async (product: MarketplaceProduct) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.title,
          price: product.price,
          original_price: product.original_price,
          stock: product.available_quantity,
          images: product.images,
          marketplace_name: 'dropshipping',
          description: `Produto importado do marketplace.\n\nPreço original: R$ ${product.original_price}\nDisponível: ${product.available_quantity} unidades`,
          active: true,
          featured: false
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar produto do marketplace
      await supabase
        .from('marketplace_products')
        .update({ 
          local_product_id: data.id,
          is_imported: true 
        })
        .eq('id', product.id);

      toast({
        title: 'Produto Importado',
        description: 'Produto adicionado à sua loja com sucesso'
      });

      loadProducts(selectedConnection);

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Erro na Importação',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Conectado</Badge>;
      case 'disconnected':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Desconectado</Badge>;
      case 'expired':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Expirado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMarketplaceIcon = (marketplace: string) => {
    switch (marketplace.toLowerCase()) {
      case 'mercadolivre':
        return '🛒';
      case 'amazon':
        return '📦';
      case 'aliexpress':
        return '🛍️';
      default:
        return '🏪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conexões de API Reais</h2>
          <p className="text-muted-foreground">
            Gerencie suas integrações com marketplaces e importe produtos reais
          </p>
        </div>
        <Button onClick={() => setShowConnectionDialog(true)}>
          <Zap className="w-4 h-4 mr-2" />
          Nova Conexão
        </Button>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">Conexões</TabsTrigger>
          <TabsTrigger value="products">Produtos Importados</TabsTrigger>
          <TabsTrigger value="sync">Sincronização</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {connections.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma conexão configurada</h3>
                <p className="text-muted-foreground mb-4">
                  Conecte-se aos marketplaces para importar produtos reais
                </p>
                <Button onClick={() => setShowConnectionDialog(true)}>
                  <Zap className="w-4 h-4 mr-2" />
                  Conectar Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connections.map((connection) => (
                <Card key={connection.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedConnection(connection.id)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getMarketplaceIcon(connection.marketplace_name)}</span>
                        <div>
                          <CardTitle className="text-lg">{connection.marketplace_name}</CardTitle>
                          <CardDescription>{connection.connection_name}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(connection.connection_status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Última verificação:</span>
                        <span>{new Date(connection.last_test_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rate limit:</span>
                        <span>{connection.rate_limit_remaining || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Select value={selectedConnection} onValueChange={setSelectedConnection}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Selecionar conexão" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((conn) => (
                    <SelectItem key={conn.id} value={conn.id}>
                      {getMarketplaceIcon(conn.marketplace_name)} {conn.marketplace_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowProductSearch(true)}
                disabled={!selectedConnection}
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar Produtos
              </Button>
              <Button 
                onClick={() => handleSyncProducts()}
                disabled={!selectedConnection || isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
            </div>
          </div>

          {products.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Download className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Use a busca para encontrar produtos nos marketplaces conectados
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardHeader className="pb-2">
                    <div className="aspect-square bg-muted rounded-md overflow-hidden mb-2">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-sm line-clamp-2">{product.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">
                          R$ {product.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          R$ {product.original_price.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Estoque: {product.available_quantity} | Vendidos: {product.sold_quantity}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={product.is_imported ? 'default' : 'secondary'}>
                          {product.is_imported ? 'Importado' : 'Não importado'}
                        </Badge>
                        {!product.is_imported && (
                          <Button 
                            size="sm" 
                            onClick={() => importProductToStore(product)}
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Importar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sincronização Automática</CardTitle>
              <CardDescription>
                Configure a sincronização automática de preços, estoque e informações dos produtos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleSyncProducts('prices')}
                  disabled={!selectedConnection || isLoading}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Sincronizar Preços
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSyncProducts('inventory')}
                  disabled={!selectedConnection || isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar Estoque
                </Button>
                <Button 
                  onClick={() => handleSyncProducts('all')}
                  disabled={!selectedConnection || isLoading}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Sincronização Completa
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para nova conexão */}
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar Marketplace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              <Button 
                className="justify-start h-16" 
                variant="outline"
                onClick={() => handleOAuthConnect('mercadolivre')}
                disabled={isLoading}
              >
                <span className="text-2xl mr-3">🛒</span>
                <div className="text-left">
                  <div className="font-medium">MercadoLivre</div>
                  <div className="text-sm text-muted-foreground">
                    Conectar com MercadoLivre Brasil
                  </div>
                </div>
              </Button>
              <Button 
                className="justify-start h-16" 
                variant="outline"
                onClick={() => handleOAuthConnect('amazon')}
                disabled={isLoading}
              >
                <span className="text-2xl mr-3">📦</span>
                <div className="text-left">
                  <div className="font-medium">Amazon</div>
                  <div className="text-sm text-muted-foreground">
                    Conectar com Amazon SP-API
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para busca de produtos */}
      <Dialog open={showProductSearch} onOpenChange={setShowProductSearch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buscar Produtos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Termo de busca</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: tênis nike, smartphone samsung..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowProductSearch(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleProductSearch}
                disabled={!searchQuery.trim() || isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Buscar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}