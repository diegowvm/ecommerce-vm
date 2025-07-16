import { supabase } from '@/integrations/supabase/client';
import { ApiReliabilityService } from './ApiReliabilityService';
import { rateLimitManager } from './RateLimitManager';
import { 
  MarketplaceAdapter, 
  Product as MarketplaceProduct, 
  SyncResult,
  MarketplaceError 
} from '@/integrations/marketplaces/types';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type ProductInsert = TablesInsert<'products'>;
type CategoryMapping = Tables<'marketplace_category_mappings'>;
type SyncLog = Tables<'marketplace_sync_logs'>;

export class ProductSyncService {
  
  /**
   * Import products from a marketplace using the provided adapter
   */
  async importProductsFromMarketplace(
    adapter: MarketplaceAdapter,
    marketplaceName: string,
    options: {
      maxProducts?: number;
      categoryFilter?: string;
      priceRange?: { min: number; max: number };
    } = {}
  ): Promise<SyncResult> {
    const startTime = new Date();
    let syncLogId: string | null = null;
    
    try {
      // Initialize rate limiting if not already done
      await rateLimitManager.initialize();
      
      // Create sync log entry
      syncLogId = await this.createSyncLog(marketplaceName, 'import');
      
      console.log(`Starting product import from ${marketplaceName}...`);
      
      // Authenticate with marketplace
      if (!adapter.isAuthenticated) {
        const authSuccess = await adapter.authenticate();
        if (!authSuccess) {
          throw new MarketplaceError(
            'Failed to authenticate with marketplace',
            marketplaceName,
            'authenticate'
          );
        }
      }
      
      // Search products from marketplace
      const searchQuery = {
        limit: options.maxProducts || 100,
        category: options.categoryFilter,
        minPrice: options.priceRange?.min,
        maxPrice: options.priceRange?.max
      };
      
      const marketplaceProducts = await adapter.searchProducts(searchQuery);
      console.log(`Found ${marketplaceProducts.length} products from ${marketplaceName}`);
      
      // Process products in chunks to avoid overwhelming the database
      const chunkSize = 10;
      const chunks = this.chunkArray(marketplaceProducts, chunkSize);
      
      let totalImported = 0;
      let totalUpdated = 0;
      const errors: string[] = [];
      
      for (const chunk of chunks) {
        try {
          const result = await this.processProductChunk(chunk, marketplaceName);
          totalImported += result.imported;
          totalUpdated += result.updated;
          
          console.log(`Processed chunk: ${result.imported} imported, ${result.updated} updated`);
        } catch (error) {
          const errorMsg = `Chunk processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
      
      const endTime = new Date();
      const syncResult: SyncResult = {
        marketplaceName,
        productsProcessed: marketplaceProducts.length,
        productsImported: totalImported,
        productsUpdated: totalUpdated,
        errors,
        startTime,
        endTime,
        status: errors.length > 0 ? 'completed' : 'completed'
      };
      
      // Update sync log
      if (syncLogId) {
        await this.updateSyncLog(syncLogId, syncResult);
      }
      
      console.log(`Import completed: ${totalImported} imported, ${totalUpdated} updated, ${errors.length} errors`);
      return syncResult;
      
    } catch (error) {
      const errorMsg = `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      
      const syncResult: SyncResult = {
        marketplaceName,
        productsProcessed: 0,
        productsImported: 0,
        productsUpdated: 0,
        errors: [errorMsg],
        startTime,
        endTime: new Date(),
        status: 'failed'
      };
      
      // Update sync log with error
      if (syncLogId) {
        await this.updateSyncLog(syncLogId, syncResult);
      }
      
      throw error;
    }
  }
  
  /**
   * Process a chunk of products
   */
  private async processProductChunk(
    products: MarketplaceProduct[],
    marketplaceName: string
  ): Promise<{ imported: number; updated: number }> {
    let imported = 0;
    let updated = 0;
    
    for (const marketplaceProduct of products) {
      try {
        // Map marketplace product to our schema
        const mappedProduct = await this.mapMarketplaceProduct(marketplaceProduct, marketplaceName);
        
        // Check if product already exists
        const existingProduct = await this.findExistingProduct(
          marketplaceProduct.marketplaceProductId,
          marketplaceName
        );
        
        if (existingProduct) {
          // Update existing product
          await this.updateProduct(existingProduct.id, mappedProduct);
          updated++;
          console.log(`Updated product: ${mappedProduct.name}`);
        } else {
          // Insert new product
          await this.insertProduct(mappedProduct);
          imported++;
          console.log(`Imported product: ${mappedProduct.name}`);
        }
        
      } catch (error) {
        console.error(`Failed to process product ${marketplaceProduct.id}:`, error);
        throw error;
      }
    }
    
    return { imported, updated };
  }
  
  /**
   * Map marketplace product to our database schema
   */
  private async mapMarketplaceProduct(
    marketplaceProduct: MarketplaceProduct,
    marketplaceName: string
  ): Promise<ProductInsert> {
    // Get category mapping
    const categoryId = await this.mapCategory(
      marketplaceProduct.categoryId || marketplaceProduct.category,
      marketplaceProduct.category,
      marketplaceName
    );
    
    return {
      name: marketplaceProduct.title,
      description: marketplaceProduct.description || null,
      price: marketplaceProduct.price,
      original_price: marketplaceProduct.originalPrice || null,
      image_url: marketplaceProduct.imageUrl || null,
      images: marketplaceProduct.images?.length ? marketplaceProduct.images : null,
      colors: marketplaceProduct.colors?.length ? marketplaceProduct.colors : null,
      sizes: marketplaceProduct.sizes?.length ? marketplaceProduct.sizes : null,
      stock: marketplaceProduct.stock || 0,
      category_id: categoryId,
      active: true,
      featured: false
    };
  }
  
  /**
   * Map marketplace category to our category system
   */
  private async mapCategory(
    marketplaceCategoryId: string | undefined,
    marketplaceCategoryName: string | undefined,
    marketplaceName: string
  ): Promise<string | null> {
    if (!marketplaceCategoryId && !marketplaceCategoryName) {
      return await this.getDefaultCategoryId();
    }
    
    try {
      // Look for existing mapping
      const { data: mapping } = await supabase
        .from('marketplace_category_mappings')
        .select('xegai_category_id')
        .eq('marketplace_name', marketplaceName)
        .eq('marketplace_category_id', marketplaceCategoryId || marketplaceCategoryName || '')
        .single();
      
      if (mapping?.xegai_category_id) {
        return mapping.xegai_category_id;
      }
      
      // No mapping found, use default category
      return await this.getDefaultCategoryId();
      
    } catch (error) {
      console.error('Error mapping category:', error);
      return await this.getDefaultCategoryId();
    }
  }
  
  /**
   * Get or create default category for unmapped products
   */
  private async getDefaultCategoryId(): Promise<string | null> {
    try {
      // Look for "Outros" or "Importados" category
      let { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', 'Importados')
        .single();
      
      if (!category) {
        // Create default category if it doesn't exist
        const { data: newCategory } = await supabase
          .from('categories')
          .insert({
            name: 'Importados',
            slug: 'importados'
          })
          .select('id')
          .single();
        
        category = newCategory;
      }
      
      return category?.id || null;
    } catch (error) {
      console.error('Error getting default category:', error);
      return null;
    }
  }
  
  /**
   * Find existing product by marketplace ID
   */
  private async findExistingProduct(
    marketplaceProductId: string,
    marketplaceName: string
  ): Promise<{ id: string } | null> {
    try {
      // For now, we'll use a simple name-based matching
      // In a real implementation, you might want to store marketplace_product_id
      // as a separate field in the products table
      
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .ilike('name', `%${marketplaceProductId}%`)
        .limit(1)
        .single();
      
      return product;
    } catch (error) {
      // Product not found
      return null;
    }
  }
  
  /**
   * Insert new product
   */
  private async insertProduct(product: ProductInsert): Promise<void> {
    const { error } = await supabase
      .from('products')
      .insert(product);
    
    if (error) {
      throw new Error(`Failed to insert product: ${error.message}`);
    }
  }
  
  /**
   * Update existing product
   */
  private async updateProduct(productId: string, updates: Partial<ProductInsert>): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId);
    
    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }
  
  /**
   * Create sync log entry
   */
  private async createSyncLog(
    marketplaceName: string,
    operationType: string
  ): Promise<string> {
    const { data, error } = await supabase
      .from('marketplace_sync_logs')
      .insert({
        marketplace_name: marketplaceName,
        operation_type: operationType,
        status: 'running'
      })
      .select('id')
      .single();
    
    if (error) {
      throw new Error(`Failed to create sync log: ${error.message}`);
    }
    
    return data.id;
  }
  
  /**
   * Update sync log with results
   */
  private async updateSyncLog(logId: string, result: SyncResult): Promise<void> {
    const { error } = await supabase
      .from('marketplace_sync_logs')
      .update({
        products_processed: result.productsProcessed,
        products_imported: result.productsImported,
        products_updated: result.productsUpdated,
        errors: result.errors,
        completed_at: result.endTime?.toISOString(),
        status: result.status
      })
      .eq('id', logId);
    
    if (error) {
      console.error('Failed to update sync log:', error);
    }
  }
  
  /**
   * Utility function to chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
  
  /**
   * Create category mapping
   */
  async createCategoryMapping(
    marketplaceName: string,
    marketplaceCategoryId: string,
    marketplaceCategoryName: string,
    xegaiCategoryId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('marketplace_category_mappings')
      .insert({
        marketplace_name: marketplaceName,
        marketplace_category_id: marketplaceCategoryId,
        marketplace_category_name: marketplaceCategoryName,
        xegai_category_id: xegaiCategoryId
      });
    
    if (error) {
      throw new Error(`Failed to create category mapping: ${error.message}`);
    }
  }
  
  /**
   * Get sync logs for a marketplace
   */
  async getSyncLogs(marketplaceName?: string, limit = 50): Promise<SyncLog[]> {
    let query = supabase
      .from('marketplace_sync_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);
    
    if (marketplaceName) {
      query = query.eq('marketplace_name', marketplaceName);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to get sync logs: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Update product stock and price from marketplace via secure Edge Function
   */
  async updateProductStockAndPrice(
    productId: string, 
    marketplaceName: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name, description')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        throw new Error(`Product not found: ${productId}`);
      }

      // Call secure Edge Function to update product with reliability service
      const result = await ApiReliabilityService.callExternalApi(
        `sync-products-${productId}`,
        async () => {
          console.log(`[ProductSync] Updating product ${productId} via Edge Function`);
          const { data, error } = await supabase.functions.invoke('sync-products', {
            body: {
              operation: 'update_product',
              productId,
              marketplaceName,
              productName: product.name
            }
          });

          if (error) {
            const edgeError = new Error(`Edge Function error: ${error.message}`);
            (edgeError as any).status = 500;
            throw edgeError;
          }

          if (!data?.success) {
            const edgeError = new Error(data?.message || 'Unknown error from Edge Function');
            (edgeError as any).status = 400;
            throw edgeError;
          }

          return data;
        },
        {
          maxRetries: 3,
          baseDelay: 1500,
          retryCondition: (error) => {
            const status = error?.status;
            return status === 500 || status === 502 || status === 503;
          }
        }
      );

      return {
        success: true,
        message: `Product ${productId} updated successfully from ${marketplaceName}`
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to update product ${productId}:`, errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * SECURITY: All credential access now handled via secure Edge Functions
   * These methods have been removed to prevent credential exposure
   */
}

// Export singleton instance
export const productSyncService = new ProductSyncService();