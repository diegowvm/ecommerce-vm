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
  // Amazon SP-API sync implementation
  console.log('Amazon sync not fully implemented yet');
  throw new Error('Amazon sync em desenvolvimento');
}