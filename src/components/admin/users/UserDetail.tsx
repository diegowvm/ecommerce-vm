import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Calendar,
  Crown,
  Shield,
  ShoppingCart,
  Package,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserDetailProps {
  user: any;
  onBack: () => void;
  onUpdateRole: (userId: string, role: string) => void;
}

export function UserDetail({ user, onBack, onUpdateRole }: UserDetailProps) {
  const { toast } = useToast();
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    averageOrder: 0
  });

  useEffect(() => {
    fetchUserOrders();
  }, [user.user_id]);

  const fetchUserOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUserOrders(data || []);
      
      const totalOrders = data?.length || 0;
      const totalSpent = data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;
      
      setStats({
        totalOrders,
        totalSpent,
        averageOrder
      });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos do usuário",
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserRole = () => {
    return user.user_roles?.[0]?.role || 'user';
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Administrador
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <User className="w-3 h-3" />
        Usuário
      </Badge>
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleRoleChange = () => {
    const currentRole = getUserRole();
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (confirm(`Tem certeza que deseja alterar o papel deste usuário para ${newRole === 'admin' ? 'Administrador' : 'Usuário'}?`)) {
      onUpdateRole(user.user_id, newRole);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {user.full_name || 'Usuário sem nome'}
          </h2>
          <p className="text-muted-foreground">
            Detalhes completos do usuário
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getRoleBadge(getUserRole())}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="text-xl">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">
                  {user.full_name || 'Nome não informado'}
                </h3>
                <p className="text-muted-foreground">ID: {user.user_id}</p>
                {getRoleBadge(getUserRole())}
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contato
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">
                      {user.phone || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Datas
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Cadastro</p>
                    <p className="font-medium">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Última Atualização</p>
                    <p className="font-medium">
                      {formatDate(user.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Purchase History */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Histórico de Compras
              </h4>
              
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted/20 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : userOrders.length > 0 ? (
                <div className="space-y-3">
                  {userOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">#{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(order.total)}</p>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {userOrders.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      E mais {userOrders.length - 5} pedidos...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum pedido encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions and Stats */}
        <div className="space-y-6">
          {/* Role Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Permissões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Papel Atual</p>
                {getRoleBadge(getUserRole())}
              </div>
              
              <Button 
                onClick={handleRoleChange}
                variant={getUserRole() === 'admin' ? 'destructive' : 'default'}
                className="w-full"
              >
                <Shield className="w-4 h-4 mr-2" />
                {getUserRole() === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
              </Button>
            </CardContent>
          </Card>

          {/* Purchase Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Estatísticas de Compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Gasto</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.averageOrder)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}