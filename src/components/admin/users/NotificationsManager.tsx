import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bell, Plus, Send, Eye, Trash2, Users, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  status: 'unread' | 'read' | 'archived';
  action_url: string | null;
  created_at: string;
  read_at: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const notificationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  type: z.enum(['info', 'success', 'warning', 'error', 'system']),
  action_url: z.string().optional(),
  recipient_type: z.enum(['all', 'specific']),
  specific_user_id: z.string().optional()
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export function NotificationsManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<Array<{ user_id: string; full_name: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: 'info',
      recipient_type: 'all'
    }
  });

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNotifications((data as any[])?.map(notification => ({
        ...notification,
        type: notification.type || 'info',
        status: notification.status || 'unread'
      })) || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar notificações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const onSubmit = async (data: NotificationFormData) => {
    try {
      if (data.recipient_type === 'all') {
        // Send to all users
        const { error } = await supabase
          .from('notifications')
          .insert(
            users.map(user => ({
              user_id: user.user_id,
              title: data.title,
              message: data.message,
              type: data.type,
              action_url: data.action_url || null
            }))
          );

        if (error) throw error;
      } else {
        // Send to specific user
        if (!data.specific_user_id) {
          toast({
            title: "Erro",
            description: "Selecione um usuário específico",
            variant: "destructive"
          });
          return;
        }

        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: data.specific_user_id,
            title: data.title,
            message: data.message,
            type: data.type,
            action_url: data.action_url || null
          });

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Notificação enviada com sucesso!",
      });

      form.reset();
      setIsDialogOpen(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação",
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: AlertCircle,
      system: Bell
    };
    return icons[type as keyof typeof icons] || Info;
  };

  const getTypeBadge = (type: string) => {
    const config = {
      info: { label: 'Info', variant: 'default' as const },
      success: { label: 'Sucesso', variant: 'default' as const },
      warning: { label: 'Aviso', variant: 'secondary' as const },
      error: { label: 'Erro', variant: 'destructive' as const },
      system: { label: 'Sistema', variant: 'outline' as const }
    };

    const typeConfig = config[type as keyof typeof config] || config.info;
    const Icon = getTypeIcon(type);

    return (
      <Badge variant={typeConfig.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {typeConfig.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      unread: { label: 'Não lida', variant: 'secondary' as const },
      read: { label: 'Lida', variant: 'default' as const },
      archived: { label: 'Arquivada', variant: 'outline' as const }
    };

    const statusConfig = config[status as keyof typeof config] || config.unread;

    return (
      <Badge variant={statusConfig.variant}>
        {statusConfig.label}
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Sistema de Notificações
              </CardTitle>
              <CardDescription>
                Gerencie e envie notificações para os usuários da plataforma
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Notificação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Notificação</DialogTitle>
                  <DialogDescription>
                    Envie notificações personalizadas para usuários específicos ou todos os usuários
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o título da notificação" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensagem</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Digite a mensagem da notificação"
                              className="min-h-20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="info">Informação</SelectItem>
                                <SelectItem value="success">Sucesso</SelectItem>
                                <SelectItem value="warning">Aviso</SelectItem>
                                <SelectItem value="error">Erro</SelectItem>
                                <SelectItem value="system">Sistema</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="recipient_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destinatários</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione os destinatários" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">Todos os Usuários</SelectItem>
                                <SelectItem value="specific">Usuário Específico</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch('recipient_type') === 'specific' && (
                      <FormField
                        control={form.control}
                        name="specific_user_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuário</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um usuário" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user.user_id} value={user.user_id}>
                                    {user.full_name || 'Usuário sem nome'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="action_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de Ação (Opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://exemplo.com/acao" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Notificação
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enviada em</TableHead>
                  <TableHead>Lida em</TableHead>
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
                    </TableRow>
                  ))
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma notificação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="font-medium">
                          {notification.profiles.full_name || 'Usuário sem nome'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={notification.title}>
                          {notification.title}
                        </div>
                        <div className="text-sm text-muted-foreground max-w-xs truncate" title={notification.message}>
                          {notification.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(notification.type)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(notification.status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(notification.created_at)}
                      </TableCell>
                      <TableCell>
                        {notification.read_at ? formatDate(notification.read_at) : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}