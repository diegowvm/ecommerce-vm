import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory cache with TTL
class InMemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>();

  set(key: string, data: any, ttlMs: number) {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { data, expiry });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new InMemoryCache();

// Cleanup expired cache entries every 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === 'GET' && path === '/cache') {
      // Get cached data
      const key = url.searchParams.get('key');
      if (!key) {
        return new Response(
          JSON.stringify({ error: 'Cache key is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const data = cache.get(key);
      if (data === null) {
        return new Response(
          JSON.stringify({ error: 'Cache miss', key }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ data, key, cached: true }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Cache': 'HIT'
          } 
        }
      );
    }

    if (req.method === 'POST' && path === '/cache') {
      // Set cached data
      const body = await req.json();
      const { key, data, ttl = 3600000 } = body; // Default TTL: 1 hour

      if (!key || data === undefined) {
        return new Response(
          JSON.stringify({ error: 'Key and data are required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      cache.set(key, data, ttl);

      return new Response(
        JSON.stringify({ success: true, key, ttl }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (req.method === 'DELETE' && path === '/cache') {
      // Delete cached data
      const key = url.searchParams.get('key');
      if (!key) {
        return new Response(
          JSON.stringify({ error: 'Cache key is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      cache.delete(key);

      return new Response(
        JSON.stringify({ success: true, key }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (req.method === 'POST' && path === '/cache/clear') {
      // Clear all cached data
      cache.clear();

      return new Response(
        JSON.stringify({ success: true, message: 'Cache cleared' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (req.method === 'GET' && path === '/cache/stats') {
      // Get cache statistics
      const stats = {
        size: cache.cache.size,
        keys: Array.from(cache.cache.keys()),
        memory_usage: JSON.stringify(cache.cache).length
      };

      return new Response(
        JSON.stringify(stats),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Cache service error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})