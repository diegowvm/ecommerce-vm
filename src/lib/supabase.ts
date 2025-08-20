// Re-export the main supabase client to avoid multiple instances
export { supabase } from '@/integrations/supabase/client';
// Helper functions for common operations
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    const { supabase } = await import('@/integrations/supabase/client');
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  },

  signIn: async (email: string, password: string) => {
    const { supabase } = await import('@/integrations/supabase/client');
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  signOut: async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    return await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: async (callback: (event: string, session: any) => void) => {
    const { supabase } = await import('@/integrations/supabase/client');
    return supabase.auth.onAuthStateChange(callback);
  }
};

export const db = {
  // Products
  getProducts: async (filters?: any) => {
    const { supabase } = await import('@/integrations/supabase/client');
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('active', true);

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    return await query;
  },

  getProduct: async (id: string) => {
    const { supabase } = await import('@/integrations/supabase/client');
    return await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('id', id)
      .eq('active', true)
      .single();
  },

  // Categories
  getCategories: async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    return await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
  },

  // Cart
  getCartItems: async (userId: string) => {
    const { supabase } = await import('@/integrations/supabase/client');
    return await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          price,
          images,
          stock
        )
      `)
      .eq('user_id', userId);
  },

  addToCart: async (userId: string, productId: string, quantity: number, size?: string, color?: string) => {
    const { supabase } = await import('@/integrations/supabase/client');
    return await supabase
      .from('cart_items')
      .upsert({
        user_id: userId,
        product_id: productId,
        quantity,
        size,
        color
      });
  },

  removeFromCart: async (id: string) => {
    const { supabase } = await import('@/integrations/supabase/client');
    return await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);
  },

  // Orders
  createOrder: async (orderData: any) => {
    const { supabase } = await import('@/integrations/supabase/client');
    return await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
  },

  getUserOrders: async (userId: string) => {
    const { supabase } = await import('@/integrations/supabase/client');
    return await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            images
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }
};