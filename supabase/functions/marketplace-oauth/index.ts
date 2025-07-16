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
    const { marketplace, action, ...params } = await req.json();
    
    console.log(`Processing ${action} for ${marketplace}`, params);

    switch (marketplace.toLowerCase()) {
      case 'mercadolivre':
        return await handleMercadoLivreOAuth(action, params);
      case 'amazon':
        return await handleAmazonOAuth(action, params);
      default:
        throw new Error(`Marketplace ${marketplace} não suportado`);
    }
  } catch (error) {
    console.error('Error in marketplace-oauth:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleMercadoLivreOAuth(action: string, params: any) {
  const clientId = Deno.env.get('MERCADOLIVRE_CLIENT_ID');
  const clientSecret = Deno.env.get('MERCADOLIVRE_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Credenciais do MercadoLivre não configuradas');
  }

  switch (action) {
    case 'get_auth_url':
      const authUrl = `https://auth.mercadolibre.com.br/authorization?response_type=code&client_id=${clientId}&redirect_uri=${params.redirectUri}&scope=read write offline_access`;
      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );

    case 'exchange_code':
      const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code: params.code,
          redirect_uri: params.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Falha ao trocar código por token');
      }

      const tokenData = await tokenResponse.json();
      
      // Salvar conexão no banco
      const { data: connection, error } = await supabase
        .from('api_connections')
        .upsert({
          user_id: params.userId,
          marketplace_name: 'MercadoLivre',
          connection_name: params.connectionName || 'MercadoLivre Connection',
          oauth_access_token: tokenData.access_token,
          oauth_refresh_token: tokenData.refresh_token,
          oauth_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          connection_status: 'connected',
          last_test_at: new Date().toISOString(),
          settings: {
            user_id: tokenData.user_id,
            scope: tokenData.scope
          }
        }, {
          onConflict: 'user_id,marketplace_name'
        });

      if (error) {
        console.error('Error saving connection:', error);
        throw new Error('Falha ao salvar conexão');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          connection,
          tokenData: {
            user_id: tokenData.user_id,
            expires_in: tokenData.expires_in
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );

    case 'refresh_token':
      const refreshResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: params.refreshToken,
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Falha ao renovar token');
      }

      const refreshData = await refreshResponse.json();
      
      // Atualizar token no banco
      const { error: updateError } = await supabase
        .from('api_connections')
        .update({
          oauth_access_token: refreshData.access_token,
          oauth_refresh_token: refreshData.refresh_token,
          oauth_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          connection_status: 'connected',
          last_test_at: new Date().toISOString(),
        })
        .eq('id', params.connectionId);

      if (updateError) {
        throw new Error('Falha ao atualizar token');
      }

      return new Response(
        JSON.stringify({ success: true, refreshData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );

    default:
      throw new Error(`Ação ${action} não suportada para MercadoLivre`);
  }
}

async function handleAmazonOAuth(action: string, params: any) {
  const clientId = Deno.env.get('AMAZON_SP_CLIENT_ID');
  const clientSecret = Deno.env.get('AMAZON_SP_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Credenciais do Amazon SP-API não configuradas');
  }

  switch (action) {
    case 'get_auth_url':
      const state = crypto.randomUUID();
      const authUrl = `https://sellercentral.amazon.com.br/apps/authorize/consent?application_id=${clientId}&state=${state}&redirect_uri=${params.redirectUri}&version=beta`;
      
      return new Response(
        JSON.stringify({ authUrl, state }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );

    case 'exchange_code':
      const tokenResponse = await fetch('https://api.amazon.com/auth/o2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code: params.code,
          redirect_uri: params.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Falha ao trocar código por token Amazon');
      }

      const tokenData = await tokenResponse.json();
      
      // Salvar conexão Amazon no banco
      const { data: connection, error } = await supabase
        .from('api_connections')
        .upsert({
          user_id: params.userId,
          marketplace_name: 'Amazon',
          connection_name: params.connectionName || 'Amazon SP-API Connection',
          oauth_access_token: tokenData.access_token,
          oauth_refresh_token: tokenData.refresh_token,
          oauth_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          connection_status: 'connected',
          last_test_at: new Date().toISOString(),
          settings: {
            marketplace_ids: params.marketplaceIds || ['A2Q3Y263D00KWC'], // Brasil por padrão
            region: params.region || 'us-east-1'
          }
        }, {
          onConflict: 'user_id,marketplace_name'
        });

      if (error) {
        console.error('Error saving Amazon connection:', error);
        throw new Error('Falha ao salvar conexão Amazon');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          connection,
          tokenData: {
            expires_in: tokenData.expires_in
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );

    default:
      throw new Error(`Ação ${action} não suportada para Amazon`);
  }
}