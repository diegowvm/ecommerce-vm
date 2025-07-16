import { productSyncService } from '@/services/ProductSyncService';
import { supabase } from '@/integrations/supabase/client';

interface SyncOptions {
  delayBetweenCalls?: number; // milliseconds
  batchSize?: number;
  maxConcurrent?: number;
}

/**
 * Schedule daily sync for all products
 */
export async function scheduleDailySync(options: SyncOptions = {}) {
  const {
    delayBetweenCalls = 1000, // 1 second delay between calls
    batchSize = 10,
    maxConcurrent = 3
  } = options;

  console.log('Starting daily sync process...');

  try {
    // Get all active products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category_id, categories(name)')
      .eq('active', true)
      .order('updated_at', { ascending: true }); // Oldest first

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    if (!products || products.length === 0) {
      console.log('No products found for sync');
      return;
    }

    console.log(`Found ${products.length} products to sync`);

    // Process products in batches
    const batches = chunkArray(products, batchSize);
    let totalProcessed = 0;
    let totalSuccesses = 0;
    let totalErrors = 0;

    for (const batch of batches) {
      console.log(`Processing batch of ${batch.length} products...`);
      
      // Process batch with limited concurrency
      const batchPromises = batch.map(async (product, index) => {
        // Add delay to respect rate limits
        await delay(index * delayBetweenCalls);
        
        return processProductSync(product.id, product.name);
      });

      // Wait for batch to complete with concurrency limit
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Count results
      batchResults.forEach(result => {
        totalProcessed++;
        if (result.status === 'fulfilled' && result.value.success) {
          totalSuccesses++;
        } else {
          totalErrors++;
          console.error('Product sync failed:', result);
        }
      });

      // Log progress
      console.log(`Batch completed. Progress: ${totalProcessed}/${products.length}`);
      
      // Delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await delay(delayBetweenCalls * 2);
      }
    }

    console.log(`Daily sync completed. Processed: ${totalProcessed}, Successes: ${totalSuccesses}, Errors: ${totalErrors}`);

    // Log sync summary
    await logSyncSummary(totalProcessed, totalSuccesses, totalErrors);

  } catch (error) {
    console.error('Daily sync failed:', error);
    await logSyncError(error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Process sync for a single product
 */
async function processProductSync(productId: string, productName: string) {
  try {
    // Try different marketplaces in order of preference
    const marketplaces = ['MercadoLivre', 'Amazon', 'AliExpress'];
    
    for (const marketplace of marketplaces) {
      try {
        const result = await productSyncService.updateProductStockAndPrice(
          productId, 
          marketplace
        );
        
        if (result.success) {
          console.log(`✓ ${productName} synced from ${marketplace}`);
          return { success: true, marketplace, message: result.message };
        }
      } catch (error) {
        console.warn(`Failed to sync ${productName} from ${marketplace}:`, error);
        continue; // Try next marketplace
      }
    }
    
    throw new Error(`Failed to sync ${productName} from all marketplaces`);
    
  } catch (error) {
    console.error(`✗ Failed to sync ${productName}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Log sync summary to database
 */
async function logSyncSummary(processed: number, successes: number, errors: number) {
  try {
    await supabase
      .from('marketplace_sync_logs')
      .insert({
        marketplace_name: 'Daily Sync',
        operation_type: 'daily_update',
        products_processed: processed,
        products_imported: 0,
        products_updated: successes,
        errors: errors > 0 ? [`${errors} products failed to sync`] : [],
        status: errors === 0 ? 'completed' : 'completed',
        completed_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log sync summary:', error);
  }
}

/**
 * Log sync error to database
 */
async function logSyncError(errorMessage: string) {
  try {
    await supabase
      .from('marketplace_sync_logs')
      .insert({
        marketplace_name: 'Daily Sync',
        operation_type: 'daily_update',
        products_processed: 0,
        products_imported: 0,
        products_updated: 0,
        errors: [errorMessage],
        status: 'failed',
        completed_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log sync error:', error);
  }
}

/**
 * Utility function to add delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Utility function to chunk array into smaller arrays
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Schedule hourly order status sync
 */
export async function scheduleHourlyOrderStatusSync() {
  console.log('Starting hourly order status sync...');

  try {
    // Get orders that need status updates
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'confirmed', 'processing', 'shipped'])
      .order('updated_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    if (!orders || orders.length === 0) {
      console.log('No orders found for status sync');
      return;
    }

    // Filter orders that have marketplace information
    const marketplaceOrders = orders.filter((order: any) => 
      order.marketplace_order_id && order.marketplace_name
    );

    if (marketplaceOrders.length === 0) {
      console.log('No marketplace orders found for status sync');
      return;
    }

    console.log(`Found ${marketplaceOrders.length} marketplace orders to sync status`);

    const { orderFulfillmentService } = await import('@/services/OrderFulfillmentService');
    
    let successCount = 0;
    let errorCount = 0;

    // Process orders with delay to respect rate limits
    for (const order of marketplaceOrders) {
      try {
        const result = await orderFulfillmentService.updateOrderStatusFromMarketplace(order.id);
        
        if (result.success) {
          successCount++;
          console.log(`✓ Updated order ${order.id} status`);
        } else {
          errorCount++;
          console.error(`✗ Failed to update order ${order.id}:`, result.message);
        }

        // Add delay between requests
        await delay(2000); // 2 seconds

      } catch (error) {
        errorCount++;
        console.error(`✗ Error updating order ${order.id}:`, error);
      }
    }

    console.log(`Order status sync completed. Success: ${successCount}, Errors: ${errorCount}`);

    // Log sync summary
    await supabase
      .from('marketplace_sync_logs')
      .insert({
        marketplace_name: 'Order Status Sync',
        operation_type: 'hourly_order_status_update',
        products_processed: marketplaceOrders.length,
        products_imported: 0,
        products_updated: successCount,
        errors: errorCount > 0 ? [`${errorCount} orders failed to sync`] : [],
        status: errorCount === 0 ? 'completed' : 'completed',
        completed_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Hourly order status sync failed:', error);
    
    // Log sync error
    await supabase
      .from('marketplace_sync_logs')
      .insert({
        marketplace_name: 'Order Status Sync',
        operation_type: 'hourly_order_status_update',
        products_processed: 0,
        products_imported: 0,
        products_updated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        status: 'failed',
        completed_at: new Date().toISOString()
      });
  }
}

/**
 * Start scheduled sync with interval
 */
export function startScheduledSync() {
  // Run immediately on start
  if (process.env.NODE_ENV === 'production') {
    console.log('Starting initial daily sync...');
    scheduleDailySync();
    
    console.log('Starting initial hourly order status sync...');
    scheduleHourlyOrderStatusSync();
    
    // Schedule daily sync (24 hours = 24 * 60 * 60 * 1000 ms)
    setInterval(() => {
      console.log('Running scheduled daily sync...');
      scheduleDailySync();
    }, 24 * 60 * 60 * 1000);
    
    // Schedule hourly order status sync (1 hour = 60 * 60 * 1000 ms)
    setInterval(() => {
      console.log('Running scheduled hourly order status sync...');
      scheduleHourlyOrderStatusSync();
    }, 60 * 60 * 1000);
    
    console.log('Daily sync and hourly order status sync schedulers started');
  } else {
    console.log('Sync schedulers disabled in development mode');
  }
}