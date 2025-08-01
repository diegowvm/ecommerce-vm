// Centralized type definitions for the entire application

// User types
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  status: 'active' | 'suspended' | 'banned';
  last_login: string | null;
  login_count: number;
  created_at: string;
  updated_at: string;
  user_roles?: { role: string }[];
  user_tag_assignments?: Array<{ user_tags: { name: string; color: string } }>;
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

export interface UserTag {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
  user_count?: number;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  stock: number;
  featured: boolean;
  active: boolean;
  category_id?: string;
  marketplace_name?: string;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string };
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  order?: number;
  created_at: string;
  updated_at: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  order?: number;
  created_at: string;
  updated_at: string;
}

// Order types
export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  shipping_address?: any;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  marketplace_order_id?: string;
  marketplace_status?: string;
  tracking_code?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  created_at: string;
  products?: Product;
}

export interface OrderReturn {
  id: string;
  order_id: string;
  order_item_id: string | null;
  reason: string;
  status: string;
  refund_amount?: number;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  marketplace_return_id?: string;
}

// Address types
export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  label: string;
  full_name: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  is_default?: boolean;
}

// Wishlist types
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products: Product;
}

// Cart types
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  products?: Product;
}

// Marketplace types
export interface MarketplaceConnection {
  id: string;
  connection_name: string;
  marketplace_name: string;
  connection_status: string;
  productCount?: number;
  orderCount?: number;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceStats {
  totalProducts: number;
  ordersToday: number;
  activeMarketplaces: number;
  lastSyncAt?: string;
}

export interface MarketplaceProduct {
  id: string;
  marketplace_product_id: string;
  title: string;
  price: number;
  original_price?: number;
  available_quantity?: number;
  marketplace_name: string;
  created_at: string;
  updated_at: string;
}

// API and Sync types
export interface SyncExecution {
  id: string;
  sync_schedule_id?: string;
  api_connection_id: string;
  execution_type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  products_processed: number;
  products_imported: number;
  products_updated: number;
  products_failed: number;
  errors?: string[];
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  action_url?: string;
  metadata?: any;
  expires_at?: string;
  read_at?: string;
  created_at: string;
}

// Common utility types
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  offset: number;
  limit: number;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Component prop types
export interface BaseListProps<T> {
  items: T[];
  loading: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  onView?: (item: T) => void;
}

export interface BaseFormProps<T> {
  item?: T;
  onSave: () => void;
  onCancel: () => void;
}

export interface BaseManagerProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}