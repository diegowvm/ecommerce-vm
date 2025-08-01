// Centralized API service for all Supabase operations
import { supabase } from '@/integrations/supabase/client';
import { 
  Product, 
  Category, 
  Subcategory, 
  Order, 
  OrderItem, 
  UserProfile, 
  UserStats,
  Address,
  WishlistItem,
  CartItem,
  MarketplaceConnection
} from '@/types';

// Product operations
export const ProductAPI = {
  async getAll(filters?: { 
    searchTerm?: string; 
    categoryId?: string; 
    featured?: boolean;
    active?: boolean;
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories(name, slug)
      `)
      .order('created_at', { ascending: false });

    if (filters?.searchTerm) {
      query = query.ilike('name', `%${filters.searchTerm}%`);
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }

    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Product[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Product;
  },

  async create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async update(id: string, productData: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Category operations
export const CategoryAPI = {
  async getAll() {
    const { data, error } = await supabase.rpc('fetch_categories_with_subcategories');
    if (error) throw error;
    
    return (data || []).map((category: any) => ({
      ...category,
      subcategories: Array.isArray(category.subcategories) 
        ? category.subcategories 
        : typeof category.subcategories === 'string' 
        ? JSON.parse(category.subcategories)
        : []
    })) as Category[];
  },

  async create(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async update(id: string, categoryData: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Subcategory operations
export const SubcategoryAPI = {
  async create(subcategoryData: Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('subcategories')
      .insert(subcategoryData)
      .select()
      .single();

    if (error) throw error;
    return data as Subcategory;
  },

  async update(id: string, subcategoryData: Partial<Subcategory>) {
    const { data, error } = await supabase
      .from('subcategories')
      .update(subcategoryData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Subcategory;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// User operations
export const UserAPI = {
  async getAll(filters?: { 
    searchTerm?: string; 
    statusFilter?: string;
  }) {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        user_roles(role),
        user_tag_assignments(user_tags(name, color))
      `)
      .order('created_at', { ascending: false });

    if (filters?.searchTerm) {
      query = query.or(`full_name.ilike.%${filters.searchTerm}%,phone.ilike.%${filters.searchTerm}%`);
    }

    if (filters?.statusFilter && filters.statusFilter !== 'all') {
      query = query.eq('status', filters.statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return (data as any[])?.map(user => ({
      ...user,
      status: user.status || 'active'
    })) as UserProfile[];
  },

  async getStats() {
    const { data, error } = await supabase.rpc('get_user_stats');
    if (error) throw error;
    return data?.[0] as UserStats;
  },

  async updateStatus(userId: string, newStatus: 'active' | 'suspended' | 'banned') {
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
  },

  async updateRole(userId: string, newRole: 'user' | 'admin') {
    const { error } = await supabase.rpc('admin_update_user_role', {
      target_user_id: userId,
      new_role: newRole
    });

    if (error) throw error;
  }
};

// Order operations
export const OrderAPI = {
  async getAll(filters?: { 
    searchTerm?: string; 
    statusFilter?: string;
    userId?: string;
  }) {
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

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.statusFilter && filters.statusFilter !== 'all') {
      query = query.eq('status', filters.statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as any[];
  },

  async getById(orderId: string) {
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
  },

  async create(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  async updateStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  }
};

// Wishlist operations
export const WishlistAPI = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        products(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any[];
  },

  async add(userId: string, productId: string) {
    const { error } = await supabase
      .from('wishlist')
      .insert({ user_id: userId, product_id: productId });

    if (error) throw error;
  },

  async remove(userId: string, productId: string) {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  }
};

// Cart operations
export const CartAPI = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CartItem[];
  },

  async add(cartItem: Omit<CartItem, 'id' | 'created_at' | 'updated_at'>) {
    const { error } = await supabase
      .from('cart_items')
      .insert(cartItem);

    if (error) throw error;
  },

  async update(id: string, cartItem: Partial<CartItem>) {
    const { error } = await supabase
      .from('cart_items')
      .update(cartItem)
      .eq('id', id);

    if (error) throw error;
  },

  async remove(id: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Address operations
export const AddressAPI = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data as Address[];
  },

  async create(addressData: Omit<Address, 'id' | 'created_at' | 'updated_at'>) {
    const { error } = await supabase
      .from('addresses')
      .insert(addressData);

    if (error) throw error;
  },

  async update(id: string, addressData: Partial<Address>) {
    const { error } = await supabase
      .from('addresses')
      .update(addressData)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async setDefault(userId: string, addressId: string) {
    // First, unset all defaults for this user
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the new default
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId);

    if (error) throw error;
  }
};