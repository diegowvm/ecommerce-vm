// Base marketplace types and interfaces

export interface ProductSearchQuery {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  marketplace?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  imageUrl?: string;
  images?: string[];
  colors?: string[];
  sizes?: string[];
  stock?: number;
  category?: string;
  categoryId?: string;
  brand?: string;
  condition?: 'new' | 'used' | 'refurbished';
  marketplaceProductId: string;
  marketplaceName: string;
  marketplaceUrl?: string;
  attributes?: Record<string, any>;
}

export interface OrderRequest {
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  marketplaceName: string;
}

export interface OrderItem {
  productId: string;
  marketplaceProductId: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

export interface Address {
  fullName: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'boleto' | 'pix';
  details?: Record<string, any>;
}

export interface OrderConfirmation {
  orderId: string;
  marketplaceOrderId: string;
  status: string;
  total: number;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  paymentId?: string;
}

export interface OrderStatus {
  orderId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  estimatedDelivery?: Date;
  lastUpdate: Date;
  details?: string;
}

// Marketplace adapter interface
export interface MarketplaceAdapter {
  readonly name: string;
  readonly isAuthenticated: boolean;
  
  // Product operations
  searchProducts(query: ProductSearchQuery): Promise<Product[]>;
  getProductDetails(productId: string): Promise<Product>;
  
  // Order operations
  createOrder(order: OrderRequest): Promise<OrderConfirmation>;
  getOrderStatus(orderId: string): Promise<OrderStatus>;
  
  // Inventory operations
  updateInventory(productId: string, quantity: number): Promise<void>;
  getInventory(productId: string): Promise<number>;
  
  // Authentication
  authenticate(): Promise<boolean>;
  refreshAuth(): Promise<boolean>;
}

// Configuration types
export interface MarketplaceConfig {
  enabled: boolean;
  rateLimitPerMinute: number;
  syncIntervalHours: number;
  defaultCategoryId?: string;
  maxProductsPerSync?: number;
}

export interface SyncResult {
  marketplaceName: string;
  productsProcessed: number;
  productsImported: number;
  productsUpdated: number;
  errors: string[];
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
}

// Error types
export class MarketplaceError extends Error {
  constructor(
    message: string,
    public marketplaceName: string,
    public operation: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'MarketplaceError';
  }
}

export class AuthenticationError extends MarketplaceError {
  constructor(marketplaceName: string, originalError?: Error) {
    super(
      `Authentication failed for ${marketplaceName}`,
      marketplaceName,
      'authenticate',
      originalError
    );
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends MarketplaceError {
  constructor(
    marketplaceName: string,
    public retryAfter?: number,
    originalError?: Error
  ) {
    super(
      `Rate limit exceeded for ${marketplaceName}`,
      marketplaceName,
      'rate_limit',
      originalError
    );
    this.name = 'RateLimitError';
  }
}