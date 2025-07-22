import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Search, Users, UserPlus, Filter, Activity, Mail, Shield, MoreHorizontal, Eye, Edit, Ban, CheckCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  status: 'active' | 'suspended' | 'banned';
  last_login: string | null;
  login_count: number;
  created_at: string;
  user_roles: Array<{ role: string }>;
  user_tag_assignments: Array<{ user_tags: { name: string; color: string } }>;
}

interface UserStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  banned_users: number;
  new_users_30d: number;
  active_users_7d: number;
  avg_login_count: number;
}

export function EnhancedUsersManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [searchTerm, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role),
          user_tag_assignments(user_tags(name, color))
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsers((data as any[])?.map(user => ({
        ...user,
        status: user.status || 'active'
      })) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_stats');
      if (error) throw error;
      setStats(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('user_id', userId);

      if (error) throw error;

      // Log the activity
      await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_action: 'status_change',
        p_description: `Status changed to ${newStatus}`,
        p_metadata: { new_status: newStatus, changed_by: 'admin' }
      });

      toast({
        title: "Sucesso",
        description: `Status do usuário atualizado para ${newStatus}`,
      });

      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do usuário",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', variant: 'default' as const, icon: CheckCircle },
      suspended: { label: 'Suspenso', variant: 'secondary' as const, icon: Ban },
      banned: { label: 'Banido', variant: 'destructive' as const, icon: Ban }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
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

  const getInitials = (name: string | null) => {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos (30 dias)</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new_users_30d}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos (7 dias)</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_users_7d}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Usuários</CardTitle>
          <CardDescription>
            Gerencie usuários, visualize estatísticas e controle permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="suspended">Suspensos</SelectItem>
                <SelectItem value="banned">Banidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Logins</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.full_name || 'Sem nome'}</div>
                            <div className="text-sm text-muted-foreground">{user.phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.user_tag_assignments?.map((tagAssignment, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              style={{ backgroundColor: `${tagAssignment.user_tags.color}20` }}
                            >
                              {tagAssignment.user_tags.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.last_login ? formatDate(user.last_login) : 'Nunca'}
                      </TableCell>
                      <TableCell>{user.login_count || 0}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setIsDialogOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {user.status === 'active' && (
                              <DropdownMenuItem onClick={() => updateUserStatus(user.user_id, 'suspended')}>
                                <Ban className="mr-2 h-4 w-4" />
                                Suspender
                              </DropdownMenuItem>
                            )}
                            {user.status === 'suspended' && (
                              <DropdownMenuItem onClick={() => updateUserStatus(user.user_id, 'active')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Ativar
                              </DropdownMenuItem>
                            )}
                            {user.status !== 'banned' && (
                              <DropdownMenuItem 
                                onClick={() => updateUserStatus(user.user_id, 'banned')}
                                className="text-destructive"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Banir
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Informações completas do usuário selecionado
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url || ''} />
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.full_name || 'Sem nome'}</h3>
                  <p className="text-muted-foreground">{selectedUser.phone}</p>
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Último Login</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Nunca'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total de Logins</label>
                  <p className="text-sm text-muted-foreground">{selectedUser.login_count || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Membro desde</label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedUser.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Funções</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedUser.user_roles?.map((role, index) => (
                      <Badge key={index} variant="secondary">
                        {role.role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {selectedUser.user_tag_assignments && selectedUser.user_tag_assignments.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedUser.user_tag_assignments.map((tagAssignment, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        style={{ backgroundColor: `${tagAssignment.user_tags.color}20` }}
                      >
                        {tagAssignment.user_tags.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}