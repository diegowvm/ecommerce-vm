import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Create a client with optimized settings for e-commerce
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Products cache configuration
      staleTime: 1000 * 60 * 5, // 5 minutes for product catalog
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

// Cache utility class for marketplace API responses
class ApiCacheService {
  private static CACHE_ENDPOINTS = {
    CACHE_SERVICE: 'https://ikwttetqfltpxpkbqgpj.supabase.co/functions/v1/api-cache'
  };

  // Cache TTL configurations
  private static TTL_CONFIG = {
    PRODUCT_DESCRIPTIONS: 1000 * 60 * 60 * 24, // 24 hours
    PRODUCT_IMAGES: 1000 * 60 * 60 * 24 * 7, // 7 days
    CATEGORIES: 1000 * 60 * 60 * 12, // 12 hours
    PRICES: 1000 * 60 * 5, // 5 minutes
    STOCK: 1000 * 60 * 2, // 2 minutes
    MARKETPLACE_CONFIG: 1000 * 60 * 60 * 6, // 6 hours
  };

  static async get(key: string): Promise<any | null> {
    try {
      const response = await fetch(`${this.CACHE_ENDPOINTS.CACHE_SERVICE}/cache?key=${encodeURIComponent(key)}`, {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrd3R0ZXRxZmx0cHhwa2JxZ3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTM5MDgsImV4cCI6MjA2NzcyOTkwOH0.Q4Z8BGLMgZCAAa7eB4VLfvgZXRivpmxsfdFCah1jb-0`,
        },
      });

      if (response.status === 404) {
        return null; // Cache miss
      }

      if (!response.ok) {
        throw new Error(`Cache GET failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.warn('Cache GET error:', error);
      return null; // Fail silently, return null for cache miss
    }
  }

  static async set(key: string, data: any, type: keyof typeof ApiCacheService.TTL_CONFIG): Promise<void> {
    try {
      const ttl = this.TTL_CONFIG[type];
      
      const response = await fetch(`${this.CACHE_ENDPOINTS.CACHE_SERVICE}/cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrd3R0ZXRxZmx0cHhwa2JxZ3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTM5MDgsImV4cCI6MjA2NzcyOTkwOH0.Q4Z8BGLMgZCAAa7eB4VLfvgZXRivpmxsfdFCah1jb-0`,
        },
        body: JSON.stringify({
          key,
          data,
          ttl
        }),
      });

      if (!response.ok) {
        throw new Error(`Cache SET failed: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Cache SET error:', error);
      // Fail silently, don't break the main operation
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.CACHE_ENDPOINTS.CACHE_SERVICE}/cache?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrd3R0ZXRxZmx0cHhwa2JxZ3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTM5MDgsImV4cCI6MjA2NzcyOTkwOH0.Q4Z8BGLMgZCAAa7eB4VLfvgZXRivpmxsfdFCah1jb-0`,
        },
      });

      if (!response.ok) {
        throw new Error(`Cache DELETE failed: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Cache DELETE error:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      const response = await fetch(`${this.CACHE_ENDPOINTS.CACHE_SERVICE}/cache/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrd3R0ZXRxZmx0cHhwa2JxZ3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTM5MDgsImV4cCI6MjA2NzcyOTkwOH0.Q4Z8BGLMgZCAAa7eB4VLfvgZXRivpmxsfdFCah1jb-0`,
        },
      });

      if (!response.ok) {
        throw new Error(`Cache CLEAR failed: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Cache CLEAR error:', error);
    }
  }

  // Helper methods for specific data types
  static async cacheProductData(productId: string, marketplace: string, data: any) {
    const key = `product:${marketplace}:${productId}`;
    await this.set(key, data, 'PRODUCT_DESCRIPTIONS');
  }

  static async getCachedProductData(productId: string, marketplace: string) {
    const key = `product:${marketplace}:${productId}`;
    return await this.get(key);
  }

  static async cacheProductPrice(productId: string, marketplace: string, price: number) {
    const key = `price:${marketplace}:${productId}`;
    await this.set(key, { price, timestamp: Date.now() }, 'PRICES');
  }

  static async getCachedProductPrice(productId: string, marketplace: string) {
    const key = `price:${marketplace}:${productId}`;
    return await this.get(key);
  }

  static async cacheProductStock(productId: string, marketplace: string, stock: number) {
    const key = `stock:${marketplace}:${productId}`;
    await this.set(key, { stock, timestamp: Date.now() }, 'STOCK');
  }

  static async getCachedProductStock(productId: string, marketplace: string) {
    const key = `stock:${marketplace}:${productId}`;
    return await this.get(key);
  }
}

// Custom hook for cached product queries
export const useCachedProducts = (filters?: any) => {
  return queryClient.prefetchQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('active', true);

      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes for product lists
  });
};

// Custom hook for individual product with aggressive caching
export const useCachedProduct = (productId: string) => {
  return queryClient.prefetchQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes for individual products
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection
  });
};

// Custom hook for stock and price with short cache
export const useCachedStockAndPrice = (productId: string) => {
  return queryClient.prefetchQuery({
    queryKey: ['stock-price', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('price, stock, original_price')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for stock/price
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
  });
};

// Provider component
export const CacheProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export { queryClient, ApiCacheService };