import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from "@/components/ui/alert";

const InventoryManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch products with stock information
  const { data: products, isLoading } = useQuery({
    queryKey: ['inventory-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const processInventoryData = () => {
    if (!products) return {
      lowStockItems: [],
      outOfStockItems: [],
      totalValue: 0,
      totalProducts: 0,
      stats: { inStock: 0, lowStock: 0, outOfStock: 0 }
    };

    const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= 10);
    const outOfStockItems = products.filter(p => p.stock === 0);
    const inStockItems = products.filter(p => p.stock > 10);
    
    const totalValue = products.reduce((sum, product) => 
      sum + (parseFloat(product.price.toString()) * product.stock), 0
    );

    return {
      lowStockItems,
      outOfStockItems,
      totalValue,
      totalProducts: products.length,
      stats: {
        inStock: inStockItems.length,
        lowStock: lowStockItems.length,
        outOfStock: outOfStockItems.length
      }
    };
  };

  const { lowStockItems, outOfStockItems, totalValue, totalProducts, stats } = processInventoryData();

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "low") return matchesSearch && product.stock > 0 && product.stock <= 10;
    if (filterStatus === "out") return matchesSearch && product.stock === 0;
    if (filterStatus === "in") return matchesSearch && product.stock > 10;
    
    return matchesSearch;
  }) || [];

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Sem Estoque</Badge>;
    if (stock <= 10) return <Badge variant="secondary">Estoque Baixo</Badge>;
    return <Badge variant="default">Em Estoque</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Estoque</h2>
          <p className="text-muted-foreground">
            Controle seu inventário e monitore movimentações
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produtos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total do Estoque</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              Produtos com estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">
              Produtos sem estoque
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="space-y-4">
          {outOfStockItems.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>{outOfStockItems.length} produtos</strong> estão sem estoque e precisam de reposição urgente.
              </AlertDescription>
            </Alert>
          )}
          
          {lowStockItems.length > 0 && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>{lowStockItems.length} produtos</strong> estão com estoque baixo (≤10 unidades).
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos os Produtos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas de Estoque</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Todos</option>
                <option value="in">Em Estoque</option>
                <option value="low">Estoque Baixo</option>
                <option value="out">Sem Estoque</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.featured && <Badge variant="secondary" className="mr-1">Destaque</Badge>}
                              {product.active ? (
                                <Badge variant="default">Ativo</Badge>
                              ) : (
                                <Badge variant="secondary">Inativo</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.categories?.name || 'Sem categoria'}
                      </TableCell>
                      <TableCell>
                        R$ {parseFloat(product.price.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.stock}
                      </TableCell>
                      <TableCell>
                        {getStockBadge(product.stock)}
                      </TableCell>
                      <TableCell>
                        R$ {(parseFloat(product.price.toString()) * product.stock).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Out of Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Produtos Sem Estoque ({outOfStockItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {outOfStockItems.slice(0, 10).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            R$ {parseFloat(product.price.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Repor
                      </Button>
                    </div>
                  ))}
                  {outOfStockItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum produto sem estoque
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">Estoque Baixo ({lowStockItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.slice(0, 10).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.stock} unidades restantes
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Repor
                      </Button>
                    </div>
                  ))}
                  {lowStockItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum produto com estoque baixo
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimentações de Estoque</CardTitle>
              <p className="text-sm text-muted-foreground">
                Histórico de entradas e saídas de produtos
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4" />
                <p>Sistema de movimentações em desenvolvimento</p>
                <p className="text-sm">
                  Este módulo registrará automaticamente todas as movimentações de estoque
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManager;