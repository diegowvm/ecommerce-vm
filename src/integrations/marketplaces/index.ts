// Main exports for marketplace integrations

export * from './types';
export { 
  authenticateMercadoLivre, 
  authenticateAmazon, 
  authenticateAliExpress,
  isTokenExpired,
  willTokenExpireSoon,
  validateSession
} from './auth';

// Adapter exports
export { MercadoLivreAdapter } from './adapters/MercadoLivreAdapter';
export { AmazonAdapter } from './adapters/AmazonAdapter';
export { AliExpressAdapter } from './adapters/AliExpressAdapter';

// Marketplace configurations
export const MARKETPLACE_CONFIGS = {
  MercadoLivre: {
    enabled: true,
    rateLimitPerMinute: 1000,
    syncIntervalHours: 6,
    maxProductsPerSync: 500
  },
  Amazon: {
    enabled: true,
    rateLimitPerMinute: 200,
    syncIntervalHours: 12,
    maxProductsPerSync: 200
  },
  AliExpress: {
    enabled: true,
    rateLimitPerMinute: 300,
    syncIntervalHours: 24,
    maxProductsPerSync: 1000
  }
} as const;

// Supported marketplaces
export const SUPPORTED_MARKETPLACES = [
  'MercadoLivre',
  'Amazon',
  'AliExpress'
] as const;

export type SupportedMarketplace = typeof SUPPORTED_MARKETPLACES[number];

// Factory function to create adapters
export function createMarketplaceAdapter(
  marketplace: SupportedMarketplace,
  credentials: any
) {
  switch (marketplace) {
    case 'MercadoLivre':
      return new MercadoLivreAdapter(credentials);
    case 'Amazon':
      return new AmazonAdapter(credentials);
    case 'AliExpress':
      return new AliExpressAdapter(credentials);
    default:
      throw new Error(`Unsupported marketplace: ${marketplace}`);
  }
}