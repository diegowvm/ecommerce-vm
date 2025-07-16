import Bottleneck from 'bottleneck';
import { supabase } from '@/integrations/supabase/client';
import { logger } from './EnhancedLoggingService';

interface RateLimitConfig {
  marketplace: string;
  maxConcurrent: number;
  minTime: number; // Minimum time between requests in ms
  reservoir: number; // Number of requests per period
  reservoirRefreshAmount: number;
  reservoirRefreshInterval: number; // Period in ms
}

interface RateLimitStatus {
  remaining: number;
  reset: Date;
  limit: number;
}

export class RateLimitManager {
  private static instance: RateLimitManager;
  private limiters = new Map<string, Bottleneck>();
  private rateLimitStatus = new Map<string, RateLimitStatus>();
  
  private constructor() {
    this.initializeDefaultLimiters();
  }

  static getInstance(): RateLimitManager {
    if (!RateLimitManager.instance) {
      RateLimitManager.instance = new RateLimitManager();
    }
    return RateLimitManager.instance;
  }

  /**
   * Initialize default rate limiters for known marketplaces
   */
  private initializeDefaultLimiters() {
    const defaultConfigs: RateLimitConfig[] = [
      {
        marketplace: 'mercadolivre',
        maxConcurrent: 5,
        minTime: 1000,        // 1 second between requests
        reservoir: 300,       // 300 requests per hour
        reservoirRefreshAmount: 300,
        reservoirRefreshInterval: 60 * 60 * 1000 // 1 hour
      },
      {
        marketplace: 'amazon',
        maxConcurrent: 3,
        minTime: 2000,        // 2 seconds between requests
        reservoir: 200,       // 200 requests per hour
        reservoirRefreshAmount: 200,
        reservoirRefreshInterval: 60 * 60 * 1000
      },
      {
        marketplace: 'aliexpress',
        maxConcurrent: 2,
        minTime: 3000,        // 3 seconds between requests
        reservoir: 100,       // 100 requests per hour
        reservoirRefreshAmount: 100,
        reservoirRefreshInterval: 60 * 60 * 1000
      }
    ];

    defaultConfigs.forEach(config => {
      this.createLimiter(config);
    });
  }

  /**
   * Create a rate limiter for a specific marketplace
   */
  private createLimiter(config: RateLimitConfig): void {
    const limiter = new Bottleneck({
      maxConcurrent: config.maxConcurrent,
      minTime: config.minTime,
      reservoir: config.reservoir,
      reservoirRefreshAmount: config.reservoirRefreshAmount,
      reservoirRefreshInterval: config.reservoirRefreshInterval,
      id: `${config.marketplace}-limiter`
    });

    // Add event listeners for monitoring
    limiter.on('failed', (error, jobInfo) => {
      logger.logApiError(config.marketplace, 'rate_limit_failed', error.message);
      console.error(`[RateLimit] ${config.marketplace} request failed:`, error);
    });

    limiter.on('retry', (error, jobInfo) => {
      console.log(`[RateLimit] ${config.marketplace} retrying request after error:`, error);
    });

    limiter.on('depleted', () => {
      console.warn(`[RateLimit] ${config.marketplace} rate limit reservoir depleted`);
      logger.logRateLimitEvent(config.marketplace, 'depleted', {
        remaining: 0,
        resetTime: new Date()
      });
    });

    this.limiters.set(config.marketplace.toLowerCase(), limiter);
  }

  /**
   * Execute a request with rate limiting
   */
  async executeWithRateLimit<T>(
    marketplace: string,
    operation: () => Promise<T>,
    priority = 5
  ): Promise<T> {
    const limiter = this.getLimiter(marketplace);
    
    if (!limiter) {
      console.warn(`[RateLimit] No rate limiter found for ${marketplace}, executing without limits`);
      return await operation();
    }

    return await limiter.schedule(
      { priority },
      async () => {
        const startTime = Date.now();
        
        try {
          const result = await operation();
          
          // Log successful request
          const duration = Date.now() - startTime;
          logger.logApiSuccess(marketplace, 'api_request', duration);
          
          return result;
        } catch (error: any) {
          // Handle rate limit responses
          if (error?.status === 429) {
            await this.handleRateLimitResponse(marketplace, error);
          }
          throw error;
        }
      }
    );
  }

  /**
   * Handle 429 rate limit responses
   */
  private async handleRateLimitResponse(marketplace: string, error: any): Promise<void> {
    const retryAfter = this.extractRetryAfter(error);
    const limiter = this.getLimiter(marketplace);
    
    if (retryAfter && limiter) {
      console.warn(`[RateLimit] ${marketplace} rate limited, pausing for ${retryAfter}ms`);
      
      // Temporarily increase the minTime to respect the retry-after header
      await limiter.stop({ dropWaitingJobs: false });
      
      // Wait for the specified time
      await new Promise(resolve => setTimeout(resolve, retryAfter));
      
      logger.logRateLimitEvent(marketplace, 'rate_limited', {
        retryAfter,
        pausedUntil: new Date(Date.now() + retryAfter)
      });
    }
  }

  /**
   * Extract retry-after value from error response
   */
  private extractRetryAfter(error: any): number | null {
    // Check for Retry-After header in seconds
    const retryAfterHeader = error?.response?.headers?.['retry-after'] || 
                            error?.headers?.['retry-after'];
    
    if (retryAfterHeader) {
      const seconds = parseInt(retryAfterHeader, 10);
      return isNaN(seconds) ? null : seconds * 1000; // Convert to milliseconds
    }
    
    // Default wait time if no header is provided
    return 60000; // 1 minute
  }

  /**
   * Update rate limit status from response headers
   */
  updateRateLimitStatus(marketplace: string, headers: Record<string, string>): void {
    const remaining = parseInt(headers['x-ratelimit-remaining'] || headers['x-rate-limit-remaining'] || '0', 10);
    const reset = headers['x-ratelimit-reset'] || headers['x-rate-limit-reset'];
    const limit = parseInt(headers['x-ratelimit-limit'] || headers['x-rate-limit-limit'] || '0', 10);

    if (remaining !== undefined || reset || limit) {
      const status: RateLimitStatus = {
        remaining: remaining || 0,
        reset: reset ? new Date(parseInt(reset) * 1000) : new Date(Date.now() + 3600000), // 1 hour default
        limit: limit || 0
      };

      this.rateLimitStatus.set(marketplace.toLowerCase(), status);
      
      // Update database with current rate limit status
      this.updateDatabaseRateLimit(marketplace, status);
      
      console.log(`[RateLimit] ${marketplace} status updated:`, status);
    }
  }

  /**
   * Update database with current rate limit information
   */
  private async updateDatabaseRateLimit(marketplace: string, status: RateLimitStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_connections')
        .update({
          rate_limit_remaining: status.remaining,
          rate_limit_reset_at: status.reset.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('marketplace_name', marketplace)
        .eq('is_active', true);

      if (error) {
        console.error(`[RateLimit] Failed to update database for ${marketplace}:`, error);
      }
    } catch (error) {
      console.error(`[RateLimit] Database update error for ${marketplace}:`, error);
    }
  }

  /**
   * Get rate limit status for a marketplace
   */
  getRateLimitStatus(marketplace: string): RateLimitStatus | null {
    return this.rateLimitStatus.get(marketplace.toLowerCase()) || null;
  }

  /**
   * Get rate limiter for marketplace
   */
  private getLimiter(marketplace: string): Bottleneck | undefined {
    return this.limiters.get(marketplace.toLowerCase());
  }

  /**
   * Load dynamic configuration from database
   */
  async loadDynamicConfig(): Promise<void> {
    try {
      const { data: connections, error } = await supabase
        .from('api_connections')
        .select('marketplace_name, settings, rate_limit_remaining, rate_limit_reset_at')
        .eq('is_active', true);

      if (error) {
        console.error('[RateLimit] Failed to load dynamic config:', error);
        return;
      }

      connections?.forEach(connection => {
        const settings = connection.settings as any;
        if (settings?.rateLimitPerMinute) {
          this.updateLimiterConfig(connection.marketplace_name, {
            rateLimitPerMinute: settings.rateLimitPerMinute
          });
        }

        // Update current status if available
        if (connection.rate_limit_remaining !== null && connection.rate_limit_reset_at) {
          this.rateLimitStatus.set(connection.marketplace_name.toLowerCase(), {
            remaining: connection.rate_limit_remaining,
            reset: new Date(connection.rate_limit_reset_at),
            limit: settings?.rateLimitPerMinute || 0
          });
        }
      });

      console.log('[RateLimit] Dynamic configuration loaded successfully');
    } catch (error) {
      console.error('[RateLimit] Error loading dynamic config:', error);
    }
  }

  /**
   * Update limiter configuration dynamically
   */
  private updateLimiterConfig(marketplace: string, config: { rateLimitPerMinute: number }): void {
    const limiter = this.getLimiter(marketplace);
    if (limiter && config.rateLimitPerMinute) {
      // Update reservoir settings based on new rate limit
      const reservoirRefreshAmount = config.rateLimitPerMinute;
      const minTime = Math.max(1000, Math.floor(60000 / config.rateLimitPerMinute)); // Ensure minimum 1 second

      limiter.updateSettings({
        reservoir: reservoirRefreshAmount,
        reservoirRefreshAmount,
        minTime
      });

      console.log(`[RateLimit] Updated ${marketplace} config: ${config.rateLimitPerMinute} requests/minute`);
    }
  }

  /**
   * Get current queue information for monitoring
   */
  getQueueInfo(marketplace: string): {
    running: number;
    pending: number;
    reservoir: number | null;
  } {
    const limiter = this.getLimiter(marketplace);
    if (!limiter) {
      return { running: 0, pending: 0, reservoir: null };
    }

    return {
      running: limiter.running(),
      pending: limiter.queued(),
      reservoir: limiter.reservoir || 0
    };
  }

  /**
   * Initialize rate limiters on startup
   */
  async initialize(): Promise<void> {
    console.log('[RateLimit] Initializing rate limit manager...');
    await this.loadDynamicConfig();
    console.log('[RateLimit] Rate limit manager initialized successfully');
  }

  /**
   * Shutdown all rate limiters gracefully
   */
  async shutdown(): Promise<void> {
    console.log('[RateLimit] Shutting down rate limiters...');
    
    const shutdownPromises = Array.from(this.limiters.values()).map(limiter => 
      limiter.stop({ dropWaitingJobs: false })
    );
    
    await Promise.all(shutdownPromises);
    console.log('[RateLimit] All rate limiters shut down successfully');
  }
}

// Export singleton instance
export const rateLimitManager = RateLimitManager.getInstance();