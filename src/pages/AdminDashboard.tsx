import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Stats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  categories?: { name: string };
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      // Products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Orders count and revenue
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total');

      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total, 0) || 0;

      setStats({
        totalProducts: productsCount || 0,
        totalUsers: usersCount || 0,
        totalOrders,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        stock,
        active,
        categories (name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos",
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ active: !currentStatus })
      .eq('id', productId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto",
        variant: "destructive",
      });
    } else {
      setProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, active: !currentStatus }
            : product
        )
      );
      toast({
        title: "Produto atualizado",
        description: `Produto ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o pedido",
        variant: "destructive",
      });
    } else {
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      toast({
        title: "Pedido atualizado",
        description: "Status do pedido atualizado com sucesso",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="text-muted-foreground">
                Você não tem permissão para acessar esta área.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass border-border/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
              </CardContent>
            </Card>

            <Card className="glass border-border/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card className="glass border-border/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>

            <Card className="glass border-border/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="orders">Pedidos</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              <Card className="glass border-border/20">
                <CardHeader>
                  <CardTitle>Produtos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-4 animate-pulse">
                          <div className="w-12 h-12 bg-surface rounded"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-surface rounded w-2/3"></div>
                            <div className="h-4 bg-surface rounded w-1/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 rounded-lg border border-border/20">
                          <div className="flex items-center space-x-4">
                            <div className="space-y-1">
                              <h4 className="font-medium">{product.name}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {product.categories?.name}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  R$ {product.price.toFixed(2).replace('.', ',')}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Estoque: {product.stock}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={product.active ? "default" : "secondary"}>
                              {product.active ? "Ativo" : "Inativo"}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleProductStatus(product.id, product.active)}
                            >
                              {product.active ? (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              ) : (
                                <Package className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <Card className="glass border-border/20">
                <CardHeader>
                  <CardTitle>Pedidos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-4 animate-pulse">
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-surface rounded w-2/3"></div>
                            <div className="h-4 bg-surface rounded w-1/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border border-border/20">
                          <div className="space-y-1">
                            <h4 className="font-medium">
                              Pedido #{order.id.slice(0, 8)}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Cliente</span>
                              <span>•</span>
                              <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                              <span>•</span>
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="px-3 py-1 rounded border border-border bg-background text-sm"
                            >
                              <option value="pending">Pendente</option>
                              <option value="processing">Processando</option>
                              <option value="shipped">Enviado</option>
                              <option value="delivered">Entregue</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}