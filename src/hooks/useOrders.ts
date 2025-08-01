import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderReturn } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useOrders(searchTerm: string = '', statusFilter: string = 'all', userId?: string) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(name, image_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Erro ao carregar pedidos');
      toast({
        title: "Erro",
        description: "Erro ao carregar pedidos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do pedido atualizado com sucesso",
      });

      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do pedido",
        variant: "destructive"
      });
      return false;
    }
  };

  const getOrderById = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(*)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pedido",
        variant: "destructive"
      });
      return null;
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pedido criado com sucesso",
      });

      await fetchOrders();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar pedido",
        variant: "destructive"
      });
      return null;
    }
  };

  const requestReturn = async (orderId: string, reason: string, orderItemId?: string) => {
    try {
      const { error } = await supabase
        .from('order_returns')
        .insert({
          order_id: orderId,
          order_item_id: orderItemId,
          reason,
          status: 'requested'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Solicitação de devolução enviada com sucesso",
      });

      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error requesting return:', error);
      toast({
        title: "Erro",
        description: "Erro ao solicitar devolução",
        variant: "destructive"
      });
      return false;
    }
  };

  const getOrderReturns = async (orderId?: string): Promise<OrderReturn[]> => {
    try {
      let query = supabase
        .from('order_returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (orderId) {
        query = query.eq('order_id', orderId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching order returns:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter, userId]);

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    getOrderById,
    createOrder,
    requestReturn,
    getOrderReturns,
    refetch: fetchOrders
  };
}