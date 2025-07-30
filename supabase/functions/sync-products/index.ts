import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Connection pooling singleton
let supabaseClient: any = null;

const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false },
        global: { headers: { 'x-client-info': 'sync-products-optimized' } }
      }
    );
  }
  return supabaseClient;
};

// Enhanced retry with adaptive backoff and jitter
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 500
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      console.error(`[Retry] Attempt ${attempt} failed:`, error?.message || error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Adaptive backoff with jitter to prevent thundering herd
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 1000; // Add randomness
      const delay = Math.min(exponentialDelay + jitter, 30000); // Cap at 30s
      
      // Rate limit detection
      if (error?.message?.includes('rate limit') || error?.status === 429) {
        console.log(`[Retry] Rate limit detected, waiting longer: ${delay * 2}ms`);
        await new Promise(resolve => setTimeout(resolve, delay * 2));
      } else {
        console.log(`[Retry] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Enhanced circuit breaker with metrics
class AdvancedCircuitBreaker {
  private failures: number = 0;
  private successes: number = 0;
  private lastFailTime: number = 0;
  private lastSuccessTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 3,
    private timeout: number = 30000,
    private successThreshold: number = 2
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailTime > this.timeout) {
        this.state = 'half-open';
        console.log(`[CircuitBreaker] Moving to half-open state`);
      } else {
        throw new Error(`Circuit breaker is open. Waiting ${Math.ceil((this.timeout - (Date.now() - this.lastFailTime)) / 1000)}s`);
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.successes++;
    this.lastSuccessTime = Date.now();
    
    if (this.state === 'half-open' && this.successes >= this.successThreshold) {
      console.log(`[CircuitBreaker] Closing after ${this.successes} successes`);
      this.state = 'closed';
      this.failures = 0;
      this.successes = 0;
    } else if (this.state === 'closed') {
      this.failures = 0;
    }
  }
  
  private onFailure() {
    this.failures++;
    this.successes = 0;
    this.lastFailTime = Date.now();
    
    if (this.failures >= this.threshold) {
      console.log(`[CircuitBreaker] Opening after ${this.failures} failures`);
      this.state = 'open';
    }
  }
  
  getStats() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailTime: this.lastFailTime,
      lastSuccessTime: this.lastSuccessTime
    };
  }
}

const circuitBreakers = new Map<string, AdvancedCircuitBreaker>();

function getCircuitBreaker(key: string): AdvancedCircuitBreaker {
  if (!circuitBreakers.has(key)) {
    circuitBreakers.set(key, new AdvancedCircuitBreaker());
  }
  return circuitBreakers.get(key)!;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { connectionId, syncType = 'all' } = await req.json();
    const supabase = getSupabaseClient();
    
    console.log(`[Sync] Starting optimized sync for connection ${connectionId}, type: ${syncType}`);

    // Optimized connection query with only needed fields
    const { data: connection, error: connectionError } = await supabase
      .from('api_connections')
      .select('id, marketplace_name, oauth_access_token, oauth_refresh_token, settings, is_active, connection_name')
      .eq('id', connectionId)
      .eq('is_active', true)
      .single();

    if (connectionError || !connection) {
      throw new Error(`Connection not found or inactive: ${connectionError?.message}`);
    }

    // Create sync execution record with batch processing info
    const { data: execution, error: executionError } = await supabase
      .from('sync_executions')
      .insert({
        api_connection_id: connectionId,
        execution_type: `sync_${syncType}`,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (executionError || !execution) {
      throw new Error(`Failed to create sync execution: ${executionError?.message}`);
    }

    // Start optimized sync in background with proper error handling
    console.log(`[Sync] Starting optimized ${syncType} sync for connection ${connectionId} (execution: ${execution.id})`);
    EdgeRuntime.waitUntil(
      performOptimizedSync(connection, syncType, execution.id)
        .catch(error => {
          console.error(`[Sync] Background sync failed for execution ${execution.id}:`, error);
          // Update execution status to failed
          supabase
            .from('sync_executions')
            .update({ 
              status: 'failed', 
              completed_at: new Date().toISOString(),
              execution_log: `Fatal error: ${error.message}`
            })
            .eq('id', execution.id)
            .then();
        })
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Optimized sync started successfully',
        execution_id: execution.id,
        marketplace: connection.marketplace_name,
        type: syncType
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('[Sync] Error starting sync:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Optimized batch sync with connection pooling and intelligent batching
async function performOptimizedSync(connection: any, syncType: string, executionId: string) {
  const startTime = Date.now();
  let processedCount = 0;
  let importedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  const BATCH_SIZE = 20; // Optimized batch size
  
  const supabase = getSupabaseClient();

  try {
    console.log(`[Sync] Starting optimized sync for marketplace: ${connection.marketplace_name}`);

    // Get products to sync with pagination
    const { data: products, error, count } = await supabase
      .from('marketplace_products')
      .select('id, marketplace_product_id, title, price, last_sync_at, sync_status, is_imported, local_product_id, markup_value', { count: 'exact' })
      .eq('api_connection_id', connection.id)
      .eq('auto_sync_enabled', true)
      .order('last_sync_at', { ascending: true, nullsFirst: true })
      .limit(150); // Process more products but in batches

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    const totalProducts = count || 0;
    console.log(`[Sync] Found ${products?.length || 0} products to sync (total: ${totalProducts})`);

    // Update execution with products found
    await supabase
      .from('sync_executions')
      .update({ products_found: totalProducts })
      .eq('id', executionId);

    if (!products || products.length === 0) {
      await supabase
        .from('sync_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          execution_log: 'No products found to sync'
        })
        .eq('id', executionId);
      return;
    }

    // Process in optimized batches
    const batches = [];
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      batches.push(products.slice(i, i + BATCH_SIZE));
    }

    console.log(`[Sync] Processing ${batches.length} batches of ${BATCH_SIZE} products each`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`[Sync] Processing batch ${batchIndex + 1}/${batches.length}`);

      // Process batch with circuit breaker
      const circuitBreaker = getCircuitBreaker(`sync-${connection.marketplace_name}`);
      
      try {
        await circuitBreaker.execute(async () => {
          const batchPromises = batch.map(async (product) => {
            try {
              const result = await syncSingleProductOptimized(connection, product, syncType);
              processedCount++;
              if (result.imported) importedCount++;
              if (result.updated) updatedCount++;
              return { success: true, productId: product.id };
            } catch (error: any) {
              errorCount++;
              const errorMsg = `Product ${product.marketplace_product_id}: ${error.message}`;
              errors.push(errorMsg);
              console.error(`[Sync] Error syncing product ${product.marketplace_product_id}:`, error);
              return { success: false, productId: product.id, error: error.message };
            }
          });

          await Promise.allSettled(batchPromises);
        });

        // Adaptive delay between batches
        if (batchIndex < batches.length - 1) {
          const delay = errorCount > 0 ? 300 : 100; // Slower if errors occurred
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error: any) {
        console.error(`[Sync] Batch ${batchIndex + 1} failed:`, error);
        errorCount += batch.length;
        errors.push(`Batch ${batchIndex + 1} failed: ${error.message}`);
      }

      // Update progress periodically
      if (batchIndex % 3 === 0) {
        await supabase
          .from('sync_executions')
          .update({
            products_processed: processedCount,
            products_imported: importedCount,
            products_updated: updatedCount,
            products_failed: errorCount
          })
          .eq('id', executionId);
      }
    }

    // Final update
    const duration = Date.now() - startTime;
    const successRate = totalProducts > 0 ? (processedCount / totalProducts) * 100 : 100;
    
    await supabase
      .from('sync_executions')
      .update({
        status: errorCount > 0 ? 'completed_with_errors' : 'completed',
        completed_at: new Date().toISOString(),
        products_processed: processedCount,
        products_imported: importedCount,
        products_updated: updatedCount,
        products_failed: errorCount,
        errors: errors.slice(0, 25), // Limit errors to prevent oversized records
        summary: {
          duration_ms: duration,
          success_rate: successRate,
          batches_processed: batches.length,
          circuit_breaker_stats: getCircuitBreaker(`sync-${connection.marketplace_name}`).getStats()
        }
      })
      .eq('id', executionId);

    console.log(`[Sync] Optimized sync completed. Processed: ${processedCount}, Imported: ${importedCount}, Updated: ${updatedCount}, Errors: ${errorCount}, Duration: ${duration}ms`);

  } catch (error: any) {
    console.error('[Sync] Optimized sync failed:', error);
    await supabase
      .from('sync_executions')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        products_processed: processedCount,
        products_failed: errorCount,
        errors: [...errors, `Fatal error: ${error.message}`],
        execution_log: error.stack || error.message
      })
      .eq('id', executionId);
  }
}

async function syncSingleProductOptimized(connection: any, product: any, syncType: string) {
  const circuitBreaker = getCircuitBreaker(`${connection.marketplace_name}-product`);
  
  return await circuitBreaker.execute(async () => {
    switch (connection.marketplace_name.toLowerCase()) {
      case 'mercadolivre':
        return await syncMercadoLivreProductOptimized(connection, product, syncType);
      case 'amazon':
        return await syncAmazonProductOptimized(connection, product, syncType);
      default:
        throw new Error(`Marketplace ${connection.marketplace_name} não suportado`);
    }
  });
}

async function syncMercadoLivreProductOptimized(connection: any, product: any, syncType: string) {
  const supabase = getSupabaseClient();
  
  const apiProduct = await retryWithBackoff(
    async () => {
      const response = await fetch(`https://api.mercadolibre.com/items/${product.marketplace_product_id}`, {
        headers: {
          'Authorization': `Bearer ${connection.oauth_access_token}`,
          'User-Agent': 'Xegai-Sync/1.0'
        }
      });

      if (!response.ok) {
        const error = new Error(`MercadoLivre API Error: ${response.status} ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }

      return await response.json();
    },
    3,
    1000
  );

  const updates: any = {
    last_sync_at: new Date().toISOString(),
    sync_status: 'completed',
    sync_errors: null
  };

  let hasChanges = false;

  // Optimized sync based on type
  if (syncType === 'all' || syncType === 'prices') {
    const originalPrice = apiProduct.price;
    const markupValue = product.markup_value || 1.30;
    const newPrice = Math.round(originalPrice * markupValue * 100) / 100;
    
    if (product.price !== newPrice || product.original_price !== originalPrice) {
      updates.original_price = originalPrice;
      updates.price = newPrice;
      hasChanges = true;
    }
  }

  if (syncType === 'all' || syncType === 'inventory') {
    if (product.available_quantity !== apiProduct.available_quantity) {
      updates.available_quantity = apiProduct.available_quantity;
      hasChanges = true;
    }
    if (product.sold_quantity !== apiProduct.sold_quantity) {
      updates.sold_quantity = apiProduct.sold_quantity;
      hasChanges = true;
    }
  }

  if (syncType === 'all' || syncType === 'details') {
    if (product.title !== apiProduct.title) {
      updates.title = apiProduct.title;
      hasChanges = true;
    }
    if (product.condition !== apiProduct.condition) {
      updates.condition = apiProduct.condition;
      hasChanges = true;
    }
    
    const newImages = apiProduct.pictures?.map((pic: any) => pic.secure_url) || [];
    if (JSON.stringify(product.images) !== JSON.stringify(newImages)) {
      updates.images = newImages;
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    return { updated: false, imported: false };
  }

  // Update marketplace product
  const { error } = await supabase
    .from('marketplace_products')
    .update(updates)
    .eq('id', product.id);

  if (error) {
    throw new Error(`Database update failed: ${error.message}`);
  }

  // Update local product if imported
  if (product.local_product_id && (updates.title || updates.price || updates.available_quantity || updates.images)) {
    const localUpdates: any = {};
    if (updates.title) localUpdates.name = updates.title;
    if (updates.price) localUpdates.price = updates.price;
    if (updates.available_quantity !== undefined) localUpdates.stock = updates.available_quantity;
    if (updates.images) localUpdates.images = updates.images;
    if (Object.keys(localUpdates).length > 0) {
      localUpdates.updated_at = new Date().toISOString();
      
      await supabase
        .from('products')
        .update(localUpdates)
        .eq('id', product.local_product_id);
    }
  }

  return { updated: true, imported: false };
}

async function syncAmazonProductOptimized(connection: any, product: any, syncType: string) {
  // Optimized Amazon sync placeholder
  await retryWithBackoff(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (Math.random() < 0.05) {
        const error = new Error('Amazon API temporary failure');
        (error as any).status = 500;
        throw error;
      }
      
      return { success: true };
    },
    2,
    1500
  );

  return { updated: false, imported: false };
}