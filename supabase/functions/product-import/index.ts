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
    const { connectionId, searchQuery, importSelected = false, productIds = [] } = await req.json();
    
    console.log(`Starting product import for connection ${connectionId}`);

    // Buscar conexão da API
    const { data: connection, error: connectionError } = await supabase
      .from('api_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (connectionError || !connection) {
      throw new Error('Conexão API não encontrada');
    }

    // Verificar se token ainda é válido
    if (new Date(connection.oauth_expires_at) < new Date()) {
      throw new Error('Token expirado, renovação necessária');
    }

    let products: any[] = [];

    switch (connection.marketplace_name.toLowerCase()) {
      case 'mercadolivre':
        products = await importFromMercadoLivre(connection, searchQuery, importSelected, productIds);
        break;
      case 'amazon':
        products = await importFromAmazon(connection, searchQuery, importSelected, productIds);
        break;
      default:
        throw new Error(`Marketplace ${connection.marketplace_name} não suportado`);
    }

    // Criar log de execução
    const { data: execution } = await supabase
      .from('sync_executions')
      .insert({
        api_connection_id: connectionId,
        execution_type: importSelected ? 'selective_import' : 'search_import',
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        products_found: products.length,
        products_processed: products.length,
        products_imported: products.filter(p => p.imported).length,
        summary: {
          search_query: searchQuery,
          import_mode: importSelected ? 'selective' : 'search'
        }
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        products,
        execution: execution,
        imported_count: products.filter(p => p.imported).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );

  } catch (error) {
    console.error('Error in product-import:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function importFromMercadoLivre(connection: any, searchQuery: string, importSelected: boolean, productIds: string[]) {
  const baseUrl = 'https://api.mercadolibre.com';
  const results: any[] = [];

  if (importSelected && productIds.length > 0) {
    // Importar produtos específicos
    for (const productId of productIds) {
      try {
        const productResponse = await fetch(`${baseUrl}/items/${productId}`, {
          headers: {
            'Authorization': `Bearer ${connection.oauth_access_token}`
          }
        });

        if (productResponse.ok) {
          const product = await productResponse.json();
          const processedProduct = await processMercadoLivreProduct(product, connection);
          results.push(processedProduct);
        }
      } catch (error) {
        console.error(`Error importing product ${productId}:`, error);
      }
    }
  } else {
    // Buscar produtos
    const searchResponse = await fetch(`${baseUrl}/sites/MLB/search?q=${encodeURIComponent(searchQuery)}&limit=50`, {
      headers: {
        'Authorization': `Bearer ${connection.oauth_access_token}`
      }
    });

    if (!searchResponse.ok) {
      throw new Error('Falha na busca do MercadoLivre');
    }

    const searchData = await searchResponse.json();
    
    for (const item of searchData.results.slice(0, 20)) { // Limitar a 20 produtos
      try {
        const detailResponse = await fetch(`${baseUrl}/items/${item.id}`, {
          headers: {
            'Authorization': `Bearer ${connection.oauth_access_token}`
          }
        });

        if (detailResponse.ok) {
          const product = await detailResponse.json();
          const processedProduct = await processMercadoLivreProduct(product, connection);
          results.push(processedProduct);
        }
        
        // Rate limiting - aguardar 100ms entre requisições
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing product ${item.id}:`, error);
      }
    }
  }

  return results;
}

async function processMercadoLivreProduct(product: any, connection: any) {
  // Calcular preço com markup
  const originalPrice = product.price;
  const markupValue = 1.30; // 30% de markup padrão
  const finalPrice = Math.round(originalPrice * markupValue * 100) / 100;

  const productData = {
    api_connection_id: connection.id,
    marketplace_product_id: product.id,
    marketplace_name: 'MercadoLivre',
    title: product.title,
    description: product.descriptions?.[0]?.plain_text || product.title,
    price: finalPrice,
    original_price: originalPrice,
    currency: product.currency_id,
    available_quantity: product.available_quantity,
    sold_quantity: product.sold_quantity,
    condition: product.condition,
    categories: product.category_id ? [product.category_id] : [],
    images: product.pictures?.map((pic: any) => pic.secure_url) || [],
    attributes: {
      brand: product.attributes?.find((attr: any) => attr.id === 'BRAND')?.value_name,
      model: product.attributes?.find((attr: any) => attr.id === 'MODEL')?.value_name,
      gtin: product.attributes?.find((attr: any) => attr.id === 'GTIN')?.value_name,
    },
    shipping_info: product.shipping || {},
    seller_info: {
      seller_id: product.seller_id,
      permalink: product.permalink
    },
    marketplace_url: product.permalink,
    last_sync_at: new Date().toISOString(),
    sync_status: 'completed',
    profit_margin: 30.00,
    markup_type: 'percentage',
    markup_value: markupValue,
    auto_sync_enabled: true
  };

  // Verificar se produto já existe
  const { data: existing } = await supabase
    .from('marketplace_products')
    .select('id')
    .eq('api_connection_id', connection.id)
    .eq('marketplace_product_id', product.id)
    .single();

  let imported = false;
  if (existing) {
    // Atualizar produto existente
    const { error } = await supabase
      .from('marketplace_products')
      .update(productData)
      .eq('id', existing.id);
    
    imported = !error;
  } else {
    // Inserir novo produto
    const { error } = await supabase
      .from('marketplace_products')
      .insert(productData);
    
    imported = !error;
  }

  return {
    ...productData,
    imported,
    original_data: product
  };
}

async function importFromAmazon(connection: any, searchQuery: string, importSelected: boolean, productIds: string[]) {
  // Amazon SP-API implementation
  // Por enquanto retorna array vazio - implementação completa requer AWS SDK
  console.log('Amazon import not fully implemented yet');
  return [];
}