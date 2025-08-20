import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserStats } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useUsers(searchTerm: string = '', statusFilter: string = 'all') {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
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
      setError('Erro ao carregar usuários');
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
        .eq('id', userId);

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

      await fetchUsers();
      await fetchStats();
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do usuário",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const { error } = await supabase.rpc('admin_update_user_role', {
        target_user_id: userId,
        new_role: newRole
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Papel do usuário atualizado com sucesso",
      });

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o papel do usuário",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [searchTerm, statusFilter]);

  return {
    users,
    stats,
    loading,
    error,
    updateUserStatus,
    updateUserRole,
    refetch: fetchUsers,
    refetchStats: fetchStats
  };
}