import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ikwttetqfltpxpkbqgpj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrd3R0ZXRxZmx0cHhwa2JxZ3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTM5MDgsImV4cCI6MjA2NzcyOTkwOH0.Q4Z8BGLMgZCAAa7eB4VLfvgZXRivpmxsfdFCah1jb-0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper functions for common operations
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export const db = {
  // Products
  getProducts: async (filters?: any) => {
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
    return await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
  },

  // Cart
  getCartItems: async (userId: string) => {
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
    return await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);
  },

  // Orders
  createOrder: async (orderData: any) => {
    return await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
  },

  getUserOrders: async (userId: string) => {
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