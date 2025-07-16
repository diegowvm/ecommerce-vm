import { supabase } from '@/integrations/supabase/client';
import { createMarketplaceAdapter } from '@/integrations/marketplaces';
import { ApiReliabilityService } from './ApiReliabilityService';
import { 
  OrderRequest, 
  OrderConfirmation,
  OrderStatus,
  MarketplaceError 
} from '@/integrations/marketplaces/types';
import { Tables } from '@/integrations/supabase/types';

type Order = Tables<'orders'>;
type OrderItem = Tables<'order_items'>;
type Product = Tables<'products'>;

interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    products: Product | null;
  })[];
}

export class OrderFulfillmentService {
  
  /**
   * Process a new order by creating orders in marketplace APIs
   */
  async processNewOrder(orderId: string): Promise<{
    success: boolean;
    message: string;
    marketplaceOrders: Array<{ marketplace: string; orderId: string; status: string }>;
  }> {
    console.log(`Processing new order: ${orderId}`);
    
    try {
      // 1. Fetch order details and items
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      const orderWithItems = order as OrderWithItems;
      
      if (!orderWithItems.order_items || orderWithItems.order_items.length === 0) {
        throw new Error(`No items found for order: ${orderId}`);
      }

      console.log(`Found ${orderWithItems.order_items.length} items to process`);

      // 2. Group items by marketplace
      const itemsByMarketplace = this.groupItemsByMarketplace(orderWithItems.order_items);
      
      const marketplaceOrders: Array<{ marketplace: string; orderId: string; status: string }> = [];
      const errors: string[] = [];

      // 3. Process each marketplace group
      for (const [marketplaceName, items] of Object.entries(itemsByMarketplace)) {
        try {
          console.log(`Processing ${items.length} items for ${marketplaceName}`);
          
          const marketplaceOrder = await this.createMarketplaceOrder(
            marketplaceName,
            items,
            orderWithItems
          );
          
          marketplaceOrders.push({
            marketplace: marketplaceName,
            orderId: marketplaceOrder.marketplaceOrderId,
            status: marketplaceOrder.status
          });

          // Update order with marketplace information
          await this.updateOrderWithMarketplaceInfo(
            orderId,
            marketplaceOrder.marketplaceOrderId,
            marketplaceOrder.status,
            marketplaceName
          );

          console.log(`✓ Successfully created order in ${marketplaceName}: ${marketplaceOrder.marketplaceOrderId}`);

        } catch (error) {
          const errorMsg = `Failed to process ${marketplaceName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      // 4. Log the operation
      await this.logOrderFulfillmentOperation(orderId, 'create_order', marketplaceOrders, errors);

      const success = marketplaceOrders.length > 0;
      const message = success 
        ? `Order processed successfully. Created ${marketplaceOrders.length} marketplace orders.`
        : 'Failed to create any marketplace orders.';

      return {
        success,
        message: errors.length > 0 ? `${message} Errors: ${errors.join(', ')}` : message,
        marketplaceOrders
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Order fulfillment failed:', errorMessage);
      
      await this.logOrderFulfillmentOperation(orderId, 'create_order', [], [errorMessage]);
      
      return {
        success: false,
        message: errorMessage,
        marketplaceOrders: []
      };
    }
  }

  /**
   * Update order status from marketplace
   */
  async updateOrderStatusFromMarketplace(orderId: string): Promise<{
    success: boolean;
    message: string;
    status?: string;
    trackingCode?: string;
  }> {
    try {
      // 1. Fetch order marketplace information
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      // Check if order has marketplace information (using any type for now)
      const orderAny = order as any;
      if (!orderAny.marketplace_order_id || !orderAny.marketplace_name) {
        throw new Error(`Order ${orderId} has no marketplace information`);
      }

      // 2. Get marketplace adapter
      const adapter = this.getMarketplaceAdapter(orderAny.marketplace_name);
      if (!adapter) {
        throw new Error(`Failed to create adapter for ${orderAny.marketplace_name}`);
      }

      // 3. Get order status from marketplace
      const marketplaceStatus = await adapter.getOrderStatus(orderAny.marketplace_order_id);
      
      // 4. Update order in database (using simple update for now)
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: this.mapMarketplaceStatusToLocal(marketplaceStatus.status),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        throw new Error(`Failed to update order: ${updateError.message}`);
      }

      // 5. Log success
      await this.logOrderFulfillmentOperation(
        orderId, 
        'update_status', 
        [{ marketplace: orderAny.marketplace_name, orderId: orderAny.marketplace_order_id, status: marketplaceStatus.status }],
        []
      );

      console.log(`✓ Updated order ${orderId} status: ${marketplaceStatus.status}`);

      return {
        success: true,
        message: `Order status updated to: ${marketplaceStatus.status}`,
        status: marketplaceStatus.status,
        trackingCode: marketplaceStatus.trackingNumber
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to update order status for ${orderId}:`, errorMessage);
      
      await this.logOrderFulfillmentOperation(orderId, 'update_status', [], [errorMessage]);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Initiate return process
   */
  async initiateReturn(orderItemId: string, reason: string): Promise<{
    success: boolean;
    message: string;
    returnId?: string;
  }> {
    try {
      // Get order item details
      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .select(`
          *,
          order_id,
          products (name, marketplace_name)
        `)
        .eq('id', orderItemId)
        .single();

      if (itemError || !orderItem) {
        throw new Error(`Order item not found: ${orderItemId}`);
      }

      // Create return record
      const { data: returnRecord, error: returnError } = await supabase
        .from('order_returns')
        .insert({
          order_id: orderItem.order_id,
          order_item_id: orderItemId,
          reason,
          status: 'requested'
        })
        .select('id')
        .single();

      if (returnError || !returnRecord) {
        throw new Error(`Failed to create return record: ${returnError?.message}`);
      }

      // Update order status if this is the first return request (simplified for now)
      await supabase
        .from('orders')
        .update({
          status: 'cancelled', // Use existing status field for now
          updated_at: new Date().toISOString()
        })
        .eq('id', orderItem.order_id);

      // TODO: In future, integrate with marketplace return APIs
      console.log(`Return initiated for item ${orderItemId}, reason: ${reason}`);

      return {
        success: true,
        message: 'Return request created successfully',
        returnId: returnRecord.id
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initiate return:', errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Group order items by marketplace
   */
  private groupItemsByMarketplace(items: (OrderItem & { products: Product | null })[]) {
    const grouped: Record<string, (OrderItem & { products: Product | null })[]> = {};
    
    for (const item of items) {
      const marketplace = item.products?.marketplace_name || 'Unknown';
      
      if (!grouped[marketplace]) {
        grouped[marketplace] = [];
      }
      
      grouped[marketplace].push(item);
    }
    
    return grouped;
  }

  /**
   * Create order in marketplace
   */
  private async createMarketplaceOrder(
    marketplaceName: string,
    items: (OrderItem & { products: Product | null })[],
    order: OrderWithItems
  ): Promise<OrderConfirmation> {
    const adapter = this.getMarketplaceAdapter(marketplaceName);
    if (!adapter) {
      throw new Error(`Failed to create adapter for ${marketplaceName}`);
    }

    // Authenticate
    if (!adapter.isAuthenticated) {
      const authSuccess = await adapter.authenticate();
      if (!authSuccess) {
        throw new Error(`Authentication failed for ${marketplaceName}`);
      }
    }

    // Build order request
    const orderRequest: OrderRequest = {
      items: items.map(item => ({
        productId: item.product_id,
        marketplaceProductId: item.products?.id || item.product_id,
        quantity: item.quantity,
        price: item.price,
        color: item.color || undefined,
        size: item.size || undefined
      })),
      shippingAddress: order.shipping_address as any, // Type assertion for JSON field
      paymentMethod: {
        type: 'credit_card' // TODO: Get from actual order payment info
      },
      marketplaceName
    };

    // Create order in marketplace
    return await adapter.createOrder(orderRequest);
  }

  /**
   * Get marketplace adapter
   */
  private getMarketplaceAdapter(marketplaceName: string) {
    try {
      // TODO: Get real credentials from secure storage
      const mockCredentials = this.getMockCredentials(marketplaceName);
      return createMarketplaceAdapter(marketplaceName as any, mockCredentials);
    } catch (error) {
      console.error(`Failed to create adapter for ${marketplaceName}:`, error);
      return null;
    }
  }

  /**
   * Get mock credentials (replace with real secure storage)
   */
  private getMockCredentials(marketplaceName: string) {
    const credentialsMap = {
      'MercadoLivre': {
        clientId: 'mock_ml_client_id',
        clientSecret: 'mock_ml_client_secret',
        redirectUri: 'http://localhost:3000/auth/callback'
      },
      'Amazon': {
        clientId: 'mock_amazon_client_id',
        clientSecret: 'mock_amazon_client_secret',
        refreshToken: 'mock_refresh_token',
        region: 'us-east-1',
        sellerId: 'mock_seller_id'
      },
      'AliExpress': {
        appKey: 'mock_aliexpress_app_key',
        appSecret: 'mock_aliexpress_app_secret'
      }
    };

    return credentialsMap[marketplaceName] || {};
  }

  /**
   * Update order with marketplace information
   */
  private async updateOrderWithMarketplaceInfo(
    orderId: string,
    marketplaceOrderId: string,
    status: string,
    marketplaceName: string
  ) {
    // Use simple update for now (marketplace fields will be added later)
    const { error } = await supabase
      .from('orders')
      .update({
        status: this.mapMarketplaceStatusToLocal(status),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }
  }

  /**
   * Map marketplace status to local status
   */
  private mapMarketplaceStatusToLocal(marketplaceStatus: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };

    return statusMap[marketplaceStatus] || 'pending';
  }

  /**
   * Log order fulfillment operation
   */
  private async logOrderFulfillmentOperation(
    orderId: string,
    operation: string,
    marketplaceOrders: Array<{ marketplace: string; orderId: string; status: string }>,
    errors: string[]
  ) {
    try {
      await supabase
        .from('marketplace_sync_logs')
        .insert({
          marketplace_name: 'Order Fulfillment',
          operation_type: operation,
          products_processed: marketplaceOrders.length,
          products_imported: 0,
          products_updated: marketplaceOrders.length,
          errors,
          status: errors.length === 0 ? 'completed' : 'failed',
          completed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log order fulfillment operation:', error);
    }
  }
}

// Export singleton instance
export const orderFulfillmentService = new OrderFulfillmentService();