// Global Types for Xegai Shop
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  category_id: string;
  brand?: string;
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  active: boolean;
  rating?: number;
  reviews_count?: number;
  created_at: string;
  updated_at: string;
  image_url?: string; // For compatibility
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  product?: Product;
  products?: Product; // For compatibility with database joins
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: any; // Compatible with Json type
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  tracking_code?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  order_items?: OrderItem[]; // For compatibility with database joins
  return_status?: string;
  return_reason?: string;
  return_requested_at?: string;
  marketplace_order_id?: string;
  marketplace_status?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  product?: Product;
  products?: Product; // For compatibility with database joins
}

export interface Address {
  id?: string;
  user_id?: string;
  name?: string;
  street?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  cep?: string;
  is_default?: boolean;
  [key: string]: any; // Make it compatible with Json type
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  sort?: 'name' | 'price' | 'created_at';
  order?: 'asc' | 'desc';
}

export interface FilterOptions {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  inStock: boolean;
}

// Additional types for complete functionality
export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  status?: string;
  last_login?: string;
  login_count?: number;
  created_at: string;
  updated_at: string;
  user_id?: string; // For compatibility with database queries
  user_roles?: Array<{ role: string }>;
  user_tag_assignments?: Array<{ user_tags: { id: string; name: string; color: string } }>;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  banned_users: number;
  new_users_30d: number;
  active_users_7d: number;
  avg_login_count: number;
}

export interface OrderReturn {
  id: string;
  order_id: string;
  order_item_id?: string;
  reason: string;
  status: string;
  refund_amount?: number;
  marketplace_return_id?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

export interface MarketplaceConnection {
  id: string;
  user_id: string;
  marketplace_name: string;
  connection_name: string;
  connection_status: string;
  api_key_reference?: string;
  oauth_access_token?: string;
  oauth_refresh_token?: string;
  oauth_expires_at?: string;
  last_test_at?: string;
  rate_limit_remaining?: number;
  rate_limit_reset_at?: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}