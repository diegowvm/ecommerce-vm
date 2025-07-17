import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  TrendingDown,
  Eye,
  DollarSign,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  PieChart,
  Plus,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: { name: string; sales: number; revenue: number }[];
  recentOrders: any[];
  salesData: { month: string; revenue: number; orders: number }[];
  categoryData: { name: string; value: number; color: string }[];
  statusData: { status: string; count: number; color: string }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    monthlyOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topProducts: [],
    recentOrders: [],
    salesData: [],
    categoryData: [],
    statusData: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch basic counts
      const [productsCount, usersCount, ordersData] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total, status, created_at')
      ]);

      const totalOrders = ordersData.data?.length || 0;
      const totalRevenue = ordersData.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      // Calculate monthly data
      const currentMonth = new Date().getMonth();
      const monthlyOrders = ordersData.data?.filter(order => 
        new Date(order.created_at).getMonth() === currentMonth
      ).length || 0;
      
      const monthlyRevenue = ordersData.data?.filter(order => 
        new Date(order.created_at).getMonth() === currentMonth
      ).reduce((sum, order) => sum + Number(order.total), 0) || 0;

      // Calculate metrics
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const conversionRate = usersCount.count && totalOrders ? (totalOrders / usersCount.count) * 100 : 0;

      // Mock data for charts (replace with real data later)
      const salesData = [
        { month: 'Jan', revenue: 12000, orders: 45 },
        { month: 'Fev', revenue: 19000, orders: 67 },
        { month: 'Mar', revenue: 15000, orders: 52 },
        { month: 'Abr', revenue: 25000, orders: 89 },
        { month: 'Mai', revenue: 22000, orders: 78 },
        { month: 'Jun', revenue: 30000, orders: 95 }
      ];

      const categoryData = [
        { name: 'Esportivos', value: 35, color: COLORS[0] },
        { name: 'Casual', value: 30, color: COLORS[1] },
        { name: 'Formal', value: 20, color: COLORS[2] },
        { name: 'Outros', value: 15, color: COLORS[3] }
      ];

      const statusData = [
        { status: 'Entregue', count: 156, color: '#10B981' },
        { status: 'Processando', count: 43, color: '#F59E0B' },
        { status: 'Enviado', count: 27, color: '#3B82F6' },
        { status: 'Cancelado', count: 12, color: '#EF4444' }
      ];

      setStats({
        totalProducts: productsCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalOrders,
        totalRevenue,
        monthlyRevenue,
        monthlyOrders,
        averageOrderValue,
        conversionRate,
        topProducts: [
          { name: 'Air Max Pro', sales: 156, revenue: 23400 },
          { name: 'Classic Runner', sales: 134, revenue: 19800 },
          { name: 'Sport Elite', sales: 98, revenue: 14200 }
        ],
        recentOrders: ordersData.data?.slice(0, 5) || [],
        salesData,
        categoryData,
        statusData
      });
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

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted/20 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-muted/20 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do desempenho do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <Button size="sm" variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-card/50 to-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5%
              </span>
              {" "}desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-card/50 to-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2%
              </span>
              {" "}desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-card/50 to-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5.4%
              </span>
              {" "}desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-card/50 to-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3.8%
              </span>
              {" "}desde o mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Receita vs Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Vendas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {stats.categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} vendas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-muted-foreground">receita</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Status dos Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.statusData.map((status, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="font-medium">{status.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{status.count}</span>
                    <Badge variant="outline" className="text-xs">
                      {((status.count / stats.totalOrders) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}