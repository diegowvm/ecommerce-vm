import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceConnection {
  id: string;
  connection_name: string;
  marketplace_name: string;
  connection_status: string;
  last_test_at: string | null;
  created_at: string;
  updated_at: string;
  productCount: number;
  orderCount: number;
  lastSync: string | null;
}

export interface MarketplaceStats {
  totalProducts: number;
  ordersToday: number;
  activeMarketplaces: number;
  lastSyncTime: string | null;
  lastSyncMarketplace: string | null;
}

export function useMarketplaceData() {
  const [connections, setConnections] = useState<MarketplaceConnection[]>([]);
  const [stats, setStats] = useState<MarketplaceStats>({
    totalProducts: 0,
    ordersToday: 0,
    activeMarketplaces: 0,
    lastSyncTime: null,
    lastSyncMarketplace: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarketplaceData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch API connections
        const { data: apiConnections, error: connectionsError } = await supabase
          .from('api_connections')
          .select('*')
          .order('created_at', { ascending: false });

        if (connectionsError) throw connectionsError;

        // Fetch marketplace products for each connection
        const connectionsWithData = await Promise.all(
          (apiConnections || []).map(async (connection) => {
            // Get product count for this connection
            const { count: productCount } = await supabase
              .from('marketplace_products')
              .select('*', { count: 'exact', head: true })
              .eq('api_connection_id', connection.id);

            // Get order count for this connection (via marketplace_products)
            const { data: products } = await supabase
              .from('marketplace_products')
              .select('local_product_id')
              .eq('api_connection_id', connection.id)
              .not('local_product_id', 'is', null);

            let orderCount = 0;
            if (products && products.length > 0) {
              const productIds = products.map(p => p.local_product_id).filter(Boolean);
              if (productIds.length > 0) {
                const { count } = await supabase
                  .from('order_items')
                  .select('*', { count: 'exact', head: true })
                  .in('product_id', productIds);
                orderCount = count || 0;
              }
            }

            // Get last sync time
            const { data: lastSyncData } = await supabase
              .from('marketplace_products')
              .select('last_sync_at')
              .eq('api_connection_id', connection.id)
              .not('last_sync_at', 'is', null)
              .order('last_sync_at', { ascending: false })
              .limit(1);

            return {
              ...connection,
              productCount: productCount || 0,
              orderCount,
              lastSync: lastSyncData?.[0]?.last_sync_at || null
            };
          })
        );

        setConnections(connectionsWithData);

        // Calculate overall stats
        const totalProducts = connectionsWithData.reduce((sum, conn) => sum + conn.productCount, 0);
        const activeMarketplaces = connectionsWithData.filter(conn => conn.connection_status === 'connected').length;

        // Get orders today
        const today = new Date().toISOString().split('T')[0];
        const { count: ordersToday } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today);

        // Get last sync info
        const lastSyncConnection = connectionsWithData
          .filter(conn => conn.lastSync)
          .sort((a, b) => new Date(b.lastSync!).getTime() - new Date(a.lastSync!).getTime())[0];

        setStats({
          totalProducts,
          ordersToday: ordersToday || 0,
          activeMarketplaces,
          lastSyncTime: lastSyncConnection?.lastSync || null,
          lastSyncMarketplace: lastSyncConnection?.marketplace_name || null
        });

      } catch (err) {
        console.error('Error fetching marketplace data:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }

    fetchMarketplaceData();
  }, []);

  return { connections, stats, loading, error };
}