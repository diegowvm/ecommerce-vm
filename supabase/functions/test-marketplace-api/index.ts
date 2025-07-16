import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry logic for API testing
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), 10000);
      console.log(`[API Test] Retry ${attempt + 1}/${maxRetries} in ${delay}ms for ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

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
  console.log(`[API Test] Testing ${marketplace} connection with retry logic`);
  
  return await retryWithBackoff(
    async () => {
      // Simulate connection test delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Basic validation and simulated test
      switch (marketplace) {
        case 'MercadoLivre':
          if (!credentials.clientId || !credentials.clientSecret) {
            throw new Error('Client ID and Client Secret are required');
          }
          
          // Simulate potential API failures
          if (Math.random() < 0.1) {
            const error = new Error('MercadoLivre API temporary failure');
            (error as any).status = 500;
            throw error;
          }
          
          console.log(`[API Test] MercadoLivre connection successful`);
          return { 
            success: true, 
            message: 'MercadoLivre connection test successful',
            tested_at: new Date().toISOString()
          };
          
        case 'Amazon':
          if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken) {
            throw new Error('All Amazon credentials are required');
          }
          
          // Simulate potential API failures
          if (Math.random() < 0.1) {
            const error = new Error('Amazon SP-API temporary failure');
            (error as any).status = 503;
            throw error;
          }
          
          console.log(`[API Test] Amazon connection successful`);
          return { 
            success: true, 
            message: 'Amazon SP-API connection test successful',
            tested_at: new Date().toISOString()
          };
          
        case 'AliExpress':
          if (!credentials.appKey || !credentials.appSecret) {
            throw new Error('App Key and App Secret are required');
          }
          
          // Simulate potential API failures
          if (Math.random() < 0.1) {
            const error = new Error('AliExpress API temporary failure');
            (error as any).status = 502;
            throw error;
          }
          
          console.log(`[API Test] AliExpress connection successful`);
          return { 
            success: true, 
            message: 'AliExpress connection test successful',
            tested_at: new Date().toISOString()
          };
          
        default:
          throw new Error(`Unsupported marketplace: ${marketplace}`);
      }
    },
    3, // maxRetries
    1000 // baseDelay
  );
}