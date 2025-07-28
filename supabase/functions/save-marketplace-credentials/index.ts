import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { marketplace, credentials } = await req.json();

    console.log(`Saving credentials for ${marketplace}`);

    // Save credentials as Supabase secrets (simulated)
    const secretNames = getSecretNames(marketplace);
    
    // Get the authenticated user from the request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Verify the JWT and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    // Save connection info to database with proper user ID
    const { data, error } = await supabase
      .from('api_connections')
      .upsert({
        marketplace_name: marketplace,
        connection_name: `${marketplace} API`,
        connection_status: 'connected',
        is_active: true,
        user_id: user.id, // Use actual authenticated user ID
        settings: credentials
      }, {
        onConflict: 'marketplace_name,user_id'
      });

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${marketplace} credentials saved successfully`,
      secretNames 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error saving credentials:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSecretNames(marketplace: string) {
  switch (marketplace) {
    case 'MercadoLivre':
      return ['MERCADO_LIVRE_CLIENT_ID', 'MERCADO_LIVRE_CLIENT_SECRET', 'MERCADO_LIVRE_REDIRECT_URI'];
    case 'Amazon':
      return ['AMAZON_CLIENT_ID', 'AMAZON_CLIENT_SECRET', 'AMAZON_REFRESH_TOKEN', 'AMAZON_REGION', 'AMAZON_SELLER_ID'];
    case 'AliExpress':
      return ['ALIEXPRESS_APP_KEY', 'ALIEXPRESS_APP_SECRET'];
    default:
      return [];
  }
}