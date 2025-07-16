import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { marketplace, credentials } = await req.json();

    console.log(`Testing ${marketplace} API connection`);

    // Simulate API test based on marketplace
    const testResult = await testMarketplaceConnection(marketplace, credentials);

    return new Response(JSON.stringify(testResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error testing API connection:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function testMarketplaceConnection(marketplace: string, credentials: any) {
  // Simulate connection test delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Basic validation and simulated test
  switch (marketplace) {
    case 'MercadoLivre':
      if (!credentials.clientId || !credentials.clientSecret) {
        throw new Error('Client ID and Client Secret are required');
      }
      return { success: true, message: 'MercadoLivre connection test successful' };
      
    case 'Amazon':
      if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken) {
        throw new Error('All Amazon credentials are required');
      }
      return { success: true, message: 'Amazon SP-API connection test successful' };
      
    case 'AliExpress':
      if (!credentials.appKey || !credentials.appSecret) {
        throw new Error('App Key and App Secret are required');
      }
      return { success: true, message: 'AliExpress connection test successful' };
      
    default:
      throw new Error(`Unsupported marketplace: ${marketplace}`);
  }
}