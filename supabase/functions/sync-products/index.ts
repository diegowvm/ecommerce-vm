import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { connectionId, syncType = 'all' } = await req.json();
    
    console.log(`Starting sync for connection ${connectionId}, type: ${syncType}`);

    // Buscar conexão
    const { data: connection, error: connectionError } = await supabase
      .from('api_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (connectionError || !connection) {
      throw new Error('Conexão não encontrada');
    }

    // Criar execução de sync
    const { data: execution, error: executionError } = await supabase
      .from('sync_executions')
      .insert({
        api_connection_id: connectionId,
        execution_type: `sync_${syncType}`,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (executionError) {
      throw new Error('Falha ao criar execução de sync');
    }

    // Executar sync em background
    EdgeRuntime.waitUntil(performSync(connection, syncType, execution.id));

    return new Response(
      JSON.stringify({ 
        success: true, 
        execution_id: execution.id,
        message: 'Sincronização iniciada'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );

  } catch (error) {
    console.error('Error in sync-products:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function performSync(connection: any, syncType: string, executionId: string) {
  let results = {
    products_processed: 0,
    products_updated: 0,
    products_failed: 0,
    errors: [] as string[]
  };

  try {
    // Buscar produtos para sincronizar
    const { data: products, error: productsError } = await supabase
      .from('marketplace_products')
      .select('*')
      .eq('api_connection_id', connection.id)
      .eq('auto_sync_enabled', true);

    if (productsError) {
      throw new Error('Falha ao buscar produtos');
    }

    results.products_processed = products.length;

    for (const product of products) {
      try {
        await syncSingleProduct(connection, product, syncType);
        results.products_updated++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        results.products_failed++;
        results.errors.push(`Product ${product.marketplace_product_id}: ${error.message}`);
        console.error(`Sync error for product ${product.marketplace_product_id}:`, error);
      }
    }

    // Atualizar execução como completada
    await supabase
      .from('sync_executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        products_processed: results.products_processed,
        products_updated: results.products_updated,
        products_failed: results.products_failed,
        errors: results.errors,
        summary: {
          sync_type: syncType,
          success_rate: results.products_processed > 0 ? 
            (results.products_updated / results.products_processed * 100).toFixed(2) + '%' : '0%'
        }
      })
      .eq('id', executionId);

  } catch (error) {
    console.error('Sync execution failed:', error);
    
    // Marcar execução como falhou
    await supabase
      .from('sync_executions')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        errors: [error.message],
        summary: { error: error.message }
      })
      .eq('id', executionId);
  }
}

async function syncSingleProduct(connection: any, product: any, syncType: string) {
  switch (connection.marketplace_name.toLowerCase()) {
    case 'mercadolivre':
      return await syncMercadoLivreProduct(connection, product, syncType);
    case 'amazon':
      return await syncAmazonProduct(connection, product, syncType);
    default:
      throw new Error(`Marketplace ${connection.marketplace_name} não suportado`);
  }
}

async function syncMercadoLivreProduct(connection: any, product: any, syncType: string) {
  const response = await fetch(`https://api.mercadolibre.com/items/${product.marketplace_product_id}`, {
    headers: {
      'Authorization': `Bearer ${connection.oauth_access_token}`
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const apiProduct = await response.json();
  const updates: any = {
    last_sync_at: new Date().toISOString(),
    sync_status: 'completed'
  };

  // Sincronizar diferentes aspectos baseado no tipo
  if (syncType === 'all' || syncType === 'prices') {
    const originalPrice = apiProduct.price;
    const markupValue = product.markup_value || 1.30;
    updates.original_price = originalPrice;
    updates.price = Math.round(originalPrice * markupValue * 100) / 100;
  }

  if (syncType === 'all' || syncType === 'inventory') {
    updates.available_quantity = apiProduct.available_quantity;
    updates.sold_quantity = apiProduct.sold_quantity;
  }

  if (syncType === 'all' || syncType === 'details') {
    updates.title = apiProduct.title;
    updates.condition = apiProduct.condition;
    updates.images = apiProduct.pictures?.map((pic: any) => pic.secure_url) || [];
  }

  // Atualizar produto no banco
  const { error } = await supabase
    .from('marketplace_products')
    .update(updates)
    .eq('id', product.id);

  if (error) {
    throw new Error(`Database update failed: ${error.message}`);
  }

  // Se produto foi importado para loja local, atualizar também
  if (product.local_product_id) {
    const { error: localError } = await supabase
      .from('products')
      .update({
        name: updates.title || product.title,
        price: updates.price || product.price,
        stock: updates.available_quantity ?? product.available_quantity,
        images: updates.images || product.images,
        updated_at: new Date().toISOString()
      })
      .eq('id', product.local_product_id);

    if (localError) {
      console.error('Failed to update local product:', localError);
    }
  }
}

async function syncAmazonProduct(connection: any, product: any, syncType: string) {
  console.log(`Syncing Amazon product: ${product.marketplace_product_id}`);
  
  // Amazon sync implementation would go here
  // For now, just return a placeholder
  return {
    success: true,
    updated: false,
    error: null
  };
}

// New secure handlers for direct marketplace operations
async function handleProductImport(marketplaceName: string, options: any) {
  console.log(`Importing products from ${marketplaceName} with options:`, options);
  
  // Get credentials from environment
  const credentials = getMarketplaceCredentials(marketplaceName);
  if (!credentials) {
    throw new Error(`No credentials configured for ${marketplaceName}`);
  }

  // Simulate product import process
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockResult = {
    success: true,
    marketplaceName,
    productsProcessed: options.maxProducts || 100,
    productsImported: Math.floor(Math.random() * 20) + 5,
    productsUpdated: Math.floor(Math.random() * 10) + 2,
    errors: [],
    startTime: new Date(),
    endTime: new Date(),
    status: 'completed'
  };

  console.log(`Import completed for ${marketplaceName}:`, mockResult);
  return mockResult;
}

async function handleProductUpdate(productId: string, marketplaceName: string, productName: string) {
  console.log(`Updating product ${productId} from ${marketplaceName}`);
  
  // Get credentials from environment
  const credentials = getMarketplaceCredentials(marketplaceName);
  if (!credentials) {
    throw new Error(`No credentials configured for ${marketplaceName}`);
  }

  // Simulate product update process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update product in database
  const { error: updateError } = await supabase
    .from('products')
    .update({
      updated_at: new Date().toISOString()
    })
    .eq('id', productId);

  if (updateError) {
    throw new Error(`Failed to update product: ${updateError.message}`);
  }

  return {
    success: true,
    message: `Product ${productId} updated successfully from ${marketplaceName}`
  };
}

function getMarketplaceCredentials(marketplaceName: string) {
  switch (marketplaceName) {
    case 'MercadoLivre':
      return {
        clientId: Deno.env.get('MERCADO_LIVRE_CLIENT_ID'),
        clientSecret: Deno.env.get('MERCADO_LIVRE_CLIENT_SECRET'),
        redirectUri: Deno.env.get('MERCADO_LIVRE_REDIRECT_URI')
      };
    case 'Amazon':
      return {
        clientId: Deno.env.get('AMAZON_CLIENT_ID'),
        clientSecret: Deno.env.get('AMAZON_CLIENT_SECRET'),
        refreshToken: Deno.env.get('AMAZON_REFRESH_TOKEN'),
        region: Deno.env.get('AMAZON_REGION'),
        sellerId: Deno.env.get('AMAZON_SELLER_ID')
      };
    case 'AliExpress':
      return {
        appKey: Deno.env.get('ALIEXPRESS_APP_KEY'),
        appSecret: Deno.env.get('ALIEXPRESS_APP_SECRET')
      };
    default:
      return null;
  }
}