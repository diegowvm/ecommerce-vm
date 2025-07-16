import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  marketplace: string;
  event_type: string;
  data: {
    order_id?: string;
    product_id?: string;
    status?: string;
    stock?: number;
    price?: number;
    tracking_code?: string;
    [key: string]: any;
  };
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    console.log('Webhook received:', req.method, req.url);
    
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const payload: WebhookPayload = await req.json();
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));

    // Validate webhook payload
    if (!payload.marketplace || !payload.event_type || !payload.data) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process webhook based on event type
    switch (payload.event_type) {
      case 'order_status_updated':
        await handleOrderStatusUpdate(supabase, payload);
        break;
      
      case 'stock_updated':
        await handleStockUpdate(supabase, payload);
        break;
      
      case 'price_updated':
        await handlePriceUpdate(supabase, payload);
        break;
      
      case 'order_shipped':
        await handleOrderShipped(supabase, payload);
        break;
      
      default:
        console.log(`Unhandled event type: ${payload.event_type}`);
        break;
    }

    // Log webhook event
    await logWebhookEvent(supabase, payload, 'success');

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Log error
    await logWebhookEvent(supabase, null, 'error', error.message);

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})

async function handleOrderStatusUpdate(supabase: any, payload: WebhookPayload) {
  const { order_id, status, tracking_code } = payload.data;
  
  if (!order_id) {
    throw new Error('Order ID is required for order status update');
  }

  // Find order by marketplace_order_id
  const { data: orders, error: findError } = await supabase
    .from('orders')
    .select('id')
    .eq('marketplace_order_id', order_id)
    .limit(1);

  if (findError) {
    throw new Error(`Failed to find order: ${findError.message}`);
  }

  if (!orders || orders.length === 0) {
    console.log(`Order not found for marketplace_order_id: ${order_id}`);
    return;
  }

  const updateData: any = {
    marketplace_status: status,
    updated_at: new Date().toISOString()
  };

  // Map marketplace status to internal status
  if (status) {
    const statusMap: { [key: string]: string } = {
      'confirmed': 'confirmed',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'returned': 'returned'
    };
    
    if (statusMap[status.toLowerCase()]) {
      updateData.status = statusMap[status.toLowerCase()];
    }
  }

  if (tracking_code) {
    updateData.tracking_code = tracking_code;
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orders[0].id);

  if (updateError) {
    throw new Error(`Failed to update order: ${updateError.message}`);
  }

  console.log(`Order ${order_id} updated successfully`);
}

async function handleStockUpdate(supabase: any, payload: WebhookPayload) {
  const { product_id, stock } = payload.data;
  
  if (!product_id || stock === undefined) {
    throw new Error('Product ID and stock are required for stock update');
  }

  // Find product by marketplace-specific ID or SKU
  const { data: products, error: findError } = await supabase
    .from('products')
    .select('id')
    .eq('marketplace_name', payload.marketplace)
    .ilike('name', `%${product_id}%`)
    .limit(1);

  if (findError) {
    throw new Error(`Failed to find product: ${findError.message}`);
  }

  if (!products || products.length === 0) {
    console.log(`Product not found for ID: ${product_id}`);
    return;
  }

  const { error: updateError } = await supabase
    .from('products')
    .update({ 
      stock: parseInt(stock.toString()),
      updated_at: new Date().toISOString()
    })
    .eq('id', products[0].id);

  if (updateError) {
    throw new Error(`Failed to update product stock: ${updateError.message}`);
  }

  console.log(`Product ${product_id} stock updated to ${stock}`);
}

async function handlePriceUpdate(supabase: any, payload: WebhookPayload) {
  const { product_id, price } = payload.data;
  
  if (!product_id || price === undefined) {
    throw new Error('Product ID and price are required for price update');
  }

  // Find product by marketplace-specific ID or SKU
  const { data: products, error: findError } = await supabase
    .from('products')
    .select('id, price as current_price')
    .eq('marketplace_name', payload.marketplace)
    .ilike('name', `%${product_id}%`)
    .limit(1);

  if (findError) {
    throw new Error(`Failed to find product: ${findError.message}`);
  }

  if (!products || products.length === 0) {
    console.log(`Product not found for ID: ${product_id}`);
    return;
  }

  const updateData: any = {
    price: parseFloat(price.toString()),
    updated_at: new Date().toISOString()
  };

  // Keep original price if this is the first price update
  if (!products[0].current_price) {
    updateData.original_price = parseFloat(price.toString());
  }

  const { error: updateError } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', products[0].id);

  if (updateError) {
    throw new Error(`Failed to update product price: ${updateError.message}`);
  }

  console.log(`Product ${product_id} price updated to ${price}`);
}

async function handleOrderShipped(supabase: any, payload: WebhookPayload) {
  const { order_id, tracking_code } = payload.data;
  
  if (!order_id) {
    throw new Error('Order ID is required for order shipped event');
  }

  // Find order by marketplace_order_id
  const { data: orders, error: findError } = await supabase
    .from('orders')
    .select('id')
    .eq('marketplace_order_id', order_id)
    .limit(1);

  if (findError) {
    throw new Error(`Failed to find order: ${findError.message}`);
  }

  if (!orders || orders.length === 0) {
    console.log(`Order not found for marketplace_order_id: ${order_id}`);
    return;
  }

  const updateData: any = {
    status: 'shipped',
    marketplace_status: 'shipped',
    updated_at: new Date().toISOString()
  };

  if (tracking_code) {
    updateData.tracking_code = tracking_code;
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orders[0].id);

  if (updateError) {
    throw new Error(`Failed to update order status: ${updateError.message}`);
  }

  console.log(`Order ${order_id} marked as shipped`);
}

async function logWebhookEvent(supabase: any, payload: WebhookPayload | null, status: 'success' | 'error', errorMessage?: string) {
  try {
    const logData = {
      marketplace_name: payload?.marketplace || 'unknown',
      operation_type: `webhook_${payload?.event_type || 'unknown'}`,
      status: status === 'success' ? 'completed' : 'failed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      errors: status === 'error' ? [errorMessage || 'Unknown error'] : null
    };

    await supabase
      .from('marketplace_sync_logs')
      .insert(logData);
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}
