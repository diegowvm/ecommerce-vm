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
 * Start scheduled sync with interval
 */
export function startScheduledSync() {
  // Run immediately on start
  if (process.env.NODE_ENV === 'production') {
    console.log('Starting initial daily sync...');
    scheduleDailySync();
    
    // Schedule daily sync (24 hours = 24 * 60 * 60 * 1000 ms)
    setInterval(() => {
      console.log('Running scheduled daily sync...');
      scheduleDailySync();
    }, 24 * 60 * 60 * 1000);
    
    console.log('Daily sync scheduler started');
  } else {
    console.log('Daily sync scheduler disabled in development mode');
  }
}