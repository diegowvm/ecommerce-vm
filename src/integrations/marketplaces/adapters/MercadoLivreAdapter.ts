import { 
  MarketplaceAdapter, 
  ProductSearchQuery, 
  Product, 
  OrderRequest, 
  OrderConfirmation, 
  OrderStatus,
  MarketplaceError 
} from '../types';
import { 
  authenticateMercadoLivre, 
  MercadoLivreCredentials, 
  AccessToken 
} from '../auth';

export class MercadoLivreAdapter implements MarketplaceAdapter {
  public readonly name = 'MercadoLivre';
  private credentials: MercadoLivreCredentials;
  private accessToken?: AccessToken;

  constructor(credentials: MercadoLivreCredentials) {
    this.credentials = credentials;
  }

  get isAuthenticated(): boolean {
    return !!this.accessToken && this.accessToken.expiresAt > new Date();
  }

  async authenticate(): Promise<boolean> {
    try {
      this.accessToken = await authenticateMercadoLivre(this.credentials);
      return true;
    } catch (error) {
      console.error('MercadoLivre authentication failed:', error);
      return false;
    }
  }

  async refreshAuth(): Promise<boolean> {
    try {
      this.accessToken = await authenticateMercadoLivre(this.credentials);
      return true;
    } catch (error) {
      console.error('MercadoLivre token refresh failed:', error);
      return false;
    }
  }

  async searchProducts(query: ProductSearchQuery): Promise<Product[]> {
    try {
      if (!this.isAuthenticated) {
        await this.authenticate();
      }

      // TODO: Implement Mercado Livre product search
      // 1. Build search URL with parameters
      const searchParams = new URLSearchParams();
      if (query.query) searchParams.append('q', query.query);
      if (query.category) searchParams.append('category', query.category);
      if (query.limit) searchParams.append('limit', query.limit.toString());
      if (query.offset) searchParams.append('offset', query.offset.toString());

      const searchUrl = `https://api.mercadolibre.com/sites/MLB/search?${searchParams.toString()}`;

      // 2. Make API call
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new MarketplaceError(
          `Failed to search products: ${response.statusText}`,
          this.name,
          'searchProducts'
        );
      }

      const data = await response.json();

      // 3. Transform results to our unified format
      return data.results?.map((item: any) => this.transformProduct(item)) || [];

    } catch (error) {
      throw new MarketplaceError(
        `Product search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        'searchProducts',
        error instanceof Error ? error : undefined
      );
    }
  }

  async getProductDetails(productId: string): Promise<Product> {
    try {
      if (!this.isAuthenticated) {
        await this.authenticate();
      }

      // TODO: Implement Mercado Livre product details fetch
      const response = await fetch(`https://api.mercadolibre.com/items/${productId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new MarketplaceError(
          `Failed to get product details: ${response.statusText}`,
          this.name,
          'getProductDetails'
        );
      }

      const data = await response.json();
      return this.transformProduct(data);

    } catch (error) {
      throw new MarketplaceError(
        `Get product details failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        'getProductDetails',
        error instanceof Error ? error : undefined
      );
    }
  }

  async createOrder(order: OrderRequest): Promise<OrderConfirmation> {
    try {
      if (!this.isAuthenticated) {
        await this.authenticate();
      }

      // TODO: Implement Mercado Livre order creation
      // This typically involves:
      // 1. Create order payload
      // 2. Submit order to Mercado Livre API
      // 3. Handle payment processing
      // 4. Return order confirmation

      throw new Error('Order creation not yet implemented for Mercado Livre');

    } catch (error) {
      throw new MarketplaceError(
        `Order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        'createOrder',
        error instanceof Error ? error : undefined
      );
    }
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      if (!this.isAuthenticated) {
        await this.authenticate();
      }

      // TODO: Implement Mercado Livre order status check
      const response = await fetch(`https://api.mercadolibre.com/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new MarketplaceError(
          `Failed to get order status: ${response.statusText}`,
          this.name,
          'getOrderStatus'
        );
      }

      const data = await response.json();
      return this.transformOrderStatus(data);

    } catch (error) {
      throw new MarketplaceError(
        `Get order status failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        'getOrderStatus',
        error instanceof Error ? error : undefined
      );
    }
  }

  async updateInventory(productId: string, quantity: number): Promise<void> {
    try {
      if (!this.isAuthenticated) {
        await this.authenticate();
      }

      // TODO: Implement Mercado Livre inventory update
      const response = await fetch(`https://api.mercadolibre.com/items/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          available_quantity: quantity
        })
      });

      if (!response.ok) {
        throw new MarketplaceError(
          `Failed to update inventory: ${response.statusText}`,
          this.name,
          'updateInventory'
        );
      }

    } catch (error) {
      throw new MarketplaceError(
        `Inventory update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        'updateInventory',
        error instanceof Error ? error : undefined
      );
    }
  }

  async getInventory(productId: string): Promise<number> {
    try {
      const product = await this.getProductDetails(productId);
      return product.stock || 0;
    } catch (error) {
      throw new MarketplaceError(
        `Get inventory failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        'getInventory',
        error instanceof Error ? error : undefined
      );
    }
  }

  // Helper methods for data transformation
  private transformProduct(mlProduct: any): Product {
    return {
      id: mlProduct.id,
      title: mlProduct.title,
      description: mlProduct.description || '',
      price: mlProduct.price,
      originalPrice: mlProduct.original_price,
      currency: mlProduct.currency_id || 'BRL',
      imageUrl: mlProduct.thumbnail,
      images: mlProduct.pictures?.map((pic: any) => pic.url) || [],
      stock: mlProduct.available_quantity,
      category: mlProduct.category_id,
      categoryId: mlProduct.category_id,
      condition: mlProduct.condition as 'new' | 'used' | 'refurbished',
      marketplaceProductId: mlProduct.id,
      marketplaceName: this.name,
      marketplaceUrl: mlProduct.permalink,
      attributes: mlProduct.attributes || {}
    };
  }

  private transformOrderStatus(mlOrder: any): OrderStatus {
    const statusMap: Record<string, OrderStatus['status']> = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };

    return {
      orderId: mlOrder.id,
      status: statusMap[mlOrder.status] || 'pending',
      trackingNumber: mlOrder.shipping?.tracking_number,
      estimatedDelivery: mlOrder.shipping?.estimated_delivery ? new Date(mlOrder.shipping.estimated_delivery) : undefined,
      lastUpdate: new Date(mlOrder.last_updated),
      details: mlOrder.status_detail
    };
  }
}