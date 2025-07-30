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
        global: { headers: { 'x-client-info': 'marketplace-oauth-optimized' } }
      }
    );
  }
  return supabaseClient;
};

// Token cache to prevent repeated API calls
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

// Enhanced retry with rate limit handling
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      console.error(`[OAuth] Attempt ${attempt} failed:`, error?.message || error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Enhanced backoff for OAuth APIs
      const delay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 500;
      const totalDelay = Math.min(delay + jitter, 15000);
      
      if (error?.status === 429 || error?.message?.includes('rate limit')) {
        console.log(`[OAuth] Rate limit detected, waiting ${totalDelay * 2}ms`);
        await new Promise(resolve => setTimeout(resolve, totalDelay * 2));
      } else {
        console.log(`[OAuth] Retrying in ${totalDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }
  }
  throw new Error('OAuth retry limit exceeded');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { marketplace, action, ...params } = await req.json();
    
    console.log(`[OAuth] Processing ${action} for ${marketplace}`);

    let result;
    switch (marketplace.toLowerCase()) {
      case 'mercadolivre':
        result = await handleMercadoLivreOAuthOptimized(action, params);
        break;
      case 'amazon':
        result = await handleAmazonOAuthOptimized(action, params);
        break;
      default:
        throw new Error(`Marketplace ${marketplace} não suportado`);
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('[OAuth] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleMercadoLivreOAuthOptimized(action: string, params: any) {
  const supabase = getSupabaseClient();
  
  switch (action) {
    case 'get_auth_url':
      const clientId = Deno.env.get('MERCADOLIVRE_CLIENT_ID');
      const redirectUri = params.redirectUri;
      
      if (!clientId) {
        throw new Error('MERCADOLIVRE_CLIENT_ID não configurado');
      }
      
      if (!redirectUri) {
        throw new Error('redirectUri é obrigatório');
      }

      const scopes = ['read', 'write', 'offline_access'];
      const authUrl = `https://auth.mercadolibre.com.br/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join('%20')}`;
      
      return {
        success: true,
        authUrl: authUrl,
        marketplace: 'mercadolivre'
      };

    case 'exchange_code':
      const { code, userId, redirectUri: exchangeRedirectUri, connectionName } = params;
      
      if (!code || !userId) {
        throw new Error('Código de autorização e userId são obrigatórios');
      }

      return await retryWithBackoff(async () => {
        const clientId = Deno.env.get('MERCADOLIVRE_CLIENT_ID');
        const clientSecret = Deno.env.get('MERCADOLIVRE_CLIENT_SECRET');
        
        if (!clientId || !clientSecret) {
          throw new Error('Credenciais do MercadoLivre não configuradas');
        }

        const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'User-Agent': 'Xegai-OAuth/1.0'
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            redirect_uri: exchangeRedirectUri
          })
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.text();
          throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorData}`);
        }

        const tokenData = await tokenResponse.json();
        
        // Cache the token
        const cacheKey = `ml_${userId}`;
        tokenCache.set(cacheKey, {
          token: tokenData.access_token,
          expiresAt: Date.now() + (tokenData.expires_in * 1000)
        });

        // Get user info to create connection name
        let userData = { nickname: 'Usuario MercadoLivre' };
        try {
          const userResponse = await fetch(`https://api.mercadolibre.com/users/me?access_token=${tokenData.access_token}`);
          if (userResponse.ok) {
            userData = await userResponse.json();
          }
        } catch (error) {
          console.warn('[OAuth] Could not fetch user data:', error);
        }

        // Save connection to database with optimized conflict handling
        const connectionData = {
          user_id: userId,
          marketplace_name: 'mercadolivre',
          connection_name: connectionName || `MercadoLivre - ${userData.nickname}`,
          oauth_access_token: tokenData.access_token,
          oauth_refresh_token: tokenData.refresh_token,
          oauth_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          connection_status: 'connected',
          is_active: true,
          last_test_at: new Date().toISOString(),
          settings: {
            user_id: tokenData.user_id,
            nickname: userData.nickname,
            scope: tokenData.scope,
            created_via: 'oauth_optimized'
          }
        };

        const { data: connection, error } = await supabase
          .from('api_connections')
          .upsert(connectionData, {
            onConflict: 'user_id,marketplace_name'
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Falha ao salvar conexão: ${error.message}`);
        }

        console.log(`[OAuth] MercadoLivre connection created/updated successfully for user ${userId}`);

        return {
          success: true,
          connection: {
            id: connection.id,
            marketplace_name: connection.marketplace_name,
            connection_name: connection.connection_name,
            connection_status: connection.connection_status
          },
          tokenData: {
            user_id: tokenData.user_id,
            expires_in: tokenData.expires_in,
            user_nickname: userData.nickname
          }
        };
      });

    case 'refresh_token':
      const { connectionId, refreshToken } = params;
      
      return await retryWithBackoff(async () => {
        const clientId = Deno.env.get('MERCADOLIVRE_CLIENT_ID');
        const clientSecret = Deno.env.get('MERCADOLIVRE_CLIENT_SECRET');
        
        if (!clientId || !clientSecret) {
          throw new Error('Credenciais do MercadoLivre não configuradas');
        }

        // If refreshToken not provided, get it from database
        let tokenToRefresh = refreshToken;
        let connectionUserId = null;
        
        if (!tokenToRefresh && connectionId) {
          const { data: connection, error: fetchError } = await supabase
            .from('api_connections')
            .select('oauth_refresh_token, user_id')
            .eq('id', connectionId)
            .single();

          if (fetchError || !connection) {
            throw new Error(`Conexão não encontrada: ${fetchError?.message}`);
          }
          
          tokenToRefresh = connection.oauth_refresh_token;
          connectionUserId = connection.user_id;
        }

        if (!tokenToRefresh) {
          throw new Error('Refresh token não encontrado');
        }

        const refreshResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'User-Agent': 'Xegai-OAuth/1.0'
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: tokenToRefresh
          })
        });

        if (!refreshResponse.ok) {
          const errorData = await refreshResponse.text();
          throw new Error(`Token refresh failed: ${refreshResponse.status} - ${errorData}`);
        }

        const tokenData = await refreshResponse.json();
        
        // Update cache if we have user ID
        if (connectionUserId) {
          const cacheKey = `ml_${connectionUserId}`;
          tokenCache.set(cacheKey, {
            token: tokenData.access_token,
            expiresAt: Date.now() + (tokenData.expires_in * 1000)
          });
        }

        // Update connection in database
        const updateData = {
          oauth_access_token: tokenData.access_token,
          oauth_refresh_token: tokenData.refresh_token || tokenToRefresh,
          oauth_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          connection_status: 'connected',
          last_test_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('api_connections')
          .update(updateData)
          .eq('id', connectionId);

        if (updateError) {
          throw new Error(`Falha ao atualizar conexão: ${updateError.message}`);
        }

        return {
          success: true,
          tokenData: {
            expires_in: tokenData.expires_in,
            refreshed_at: new Date().toISOString()
          }
        };
      });

    default:
      throw new Error(`Ação ${action} não suportada para MercadoLivre`);
  }
}

async function handleAmazonOAuthOptimized(action: string, params: any) {
  const supabase = getSupabaseClient();
  
  switch (action) {
    case 'get_auth_url':
      const clientId = Deno.env.get('AMAZON_SP_CLIENT_ID');
      const redirectUri = params.redirectUri;
      
      if (!clientId) {
        throw new Error('AMAZON_SP_CLIENT_ID não configurado');
      }
      
      if (!redirectUri) {
        throw new Error('redirectUri é obrigatório');
      }

      const state = crypto.randomUUID();
      const authUrl = `https://sellercentral.amazon.com.br/apps/authorize/consent?application_id=${clientId}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&version=beta`;
      
      return {
        success: true,
        authUrl: authUrl,
        state: state,
        marketplace: 'amazon'
      };

    case 'exchange_code':
      const { code, userId, redirectUri: exchangeRedirectUri, connectionName, marketplaceIds } = params;
      
      return await retryWithBackoff(async () => {
        const clientId = Deno.env.get('AMAZON_SP_CLIENT_ID');
        const clientSecret = Deno.env.get('AMAZON_SP_CLIENT_SECRET');
        
        if (!clientId || !clientSecret) {
          throw new Error('Credenciais do Amazon SP-API não configuradas');
        }

        const tokenResponse = await fetch('https://api.amazon.com/auth/o2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'User-Agent': 'Xegai-OAuth/1.0'
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            redirect_uri: exchangeRedirectUri
          })
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.text();
          throw new Error(`Amazon token exchange failed: ${tokenResponse.status} - ${errorData}`);
        }

        const tokenData = await tokenResponse.json();
        
        // Cache the token
        const cacheKey = `amz_${userId}`;
        tokenCache.set(cacheKey, {
          token: tokenData.access_token,
          expiresAt: Date.now() + (tokenData.expires_in * 1000)
        });

        // Save connection to database
        const connectionData = {
          user_id: userId,
          marketplace_name: 'amazon',
          connection_name: connectionName || 'Amazon SP-API Connection',
          oauth_access_token: tokenData.access_token,
          oauth_refresh_token: tokenData.refresh_token,
          oauth_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          connection_status: 'connected',
          is_active: true,
          last_test_at: new Date().toISOString(),
          settings: {
            marketplace_ids: marketplaceIds || ['A2Q3Y263D00KWC'], // Brasil por padrão
            region: params.region || 'us-east-1',
            scope: tokenData.scope,
            token_type: tokenData.token_type,
            created_via: 'oauth_optimized'
          }
        };

        const { data: connection, error } = await supabase
          .from('api_connections')
          .upsert(connectionData, {
            onConflict: 'user_id,marketplace_name'
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Falha ao salvar conexão Amazon: ${error.message}`);
        }

        console.log(`[OAuth] Amazon connection created/updated successfully for user ${userId}`);

        return {
          success: true,
          connection: {
            id: connection.id,
            marketplace_name: connection.marketplace_name,
            connection_name: connection.connection_name,
            connection_status: connection.connection_status
          },
          tokenData: {
            expires_in: tokenData.expires_in,
            scope: tokenData.scope
          }
        };
      });

    default:
      throw new Error(`Ação ${action} não suportada para Amazon`);
  }
}