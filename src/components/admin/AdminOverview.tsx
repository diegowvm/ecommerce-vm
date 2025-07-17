import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  ordersToday: number;
  totalUsers: number;
  newUsersThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  lowStockProducts: number;
  pendingOrders: number;
}

export function AdminOverview() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    ordersToday: 0,
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get current date info
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Fetch all data in parallel
      const [
        productsData,
        ordersData,
        todayOrdersData,
        usersData,
        newUsersData,
        revenueData,
        monthRevenueData,
        recentOrdersData
      ] = await Promise.all([
        // Products stats
        supabase.from('products').select('active, stock'),
        
        // Orders stats
        supabase.from('orders').select('total, status, created_at'),
        
        // Today's orders
        supabase.from('orders')
          .select('id')
          .gte('created_at', today),
        
        // Users stats
        supabase.from('profiles').select('id'),
        
        // New users this month
        supabase.from('profiles')
          .select('id')
          .gte('created_at', firstDayOfMonth),
        
        // All revenue
        supabase.from('orders')
          .select('total')
          .neq('status', 'cancelled'),
        
        // This month revenue
        supabase.from('orders')
          .select('total')
          .neq('status', 'cancelled')
          .gte('created_at', firstDayOfMonth),
        
        // Recent orders
        supabase.from('orders')
          .select(`
            id,
            total,
            status,
            created_at,
            order_items(
              quantity,
              products(name)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Process products data
      const products = productsData.data || [];
      const activeProducts = products.filter(p => p.active).length;
      const lowStockProducts = products.filter(p => (p.stock || 0) < 10).length;

      // Process orders data
      const orders = ordersData.data || [];
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      // Process revenue data
      const totalRevenue = revenueData.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const monthRevenue = monthRevenueData.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      setStats({
        totalProducts: products.length,
        activeProducts,
        totalOrders: orders.length,
        ordersToday: todayOrdersData.data?.length || 0,
        totalUsers: usersData.data?.length || 0,
        newUsersThisMonth: newUsersData.data?.length || 0,
        totalRevenue,
        revenueThisMonth: monthRevenue,
        lowStockProducts,
        pendingOrders,
      });

      setRecentOrders(recentOrdersData.data || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      processing: { label: 'Processando', variant: 'default' as const },
      shipped: { label: 'Enviado', variant: 'default' as const },
      delivered: { label: 'Entregue', variant: 'default' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.revenueThisMonth)} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOrders} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalProducts} produtos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={stats.pendingOrders > 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders > 0 ? 'Necessitam atenção' : 'Todos processados'}
            </p>
          </CardContent>
        </Card>

        <Card className={stats.lowStockProducts > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStockProducts > 0 ? 'Produtos com estoque < 10' : 'Estoques OK'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalOrders > 0 ? Math.round((stats.revenueThisMonth / stats.totalRevenue) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              receita deste mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pedidos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhum pedido recente encontrado
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.order_items?.length || 0} item(s) • {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(order.total)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}