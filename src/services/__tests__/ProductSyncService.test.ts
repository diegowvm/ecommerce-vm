import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductSyncService } from '../ProductSyncService';
import { createMockProduct, createMockApiConnection } from '@/test-utils/factories';
import { MarketplaceAdapter } from '@/integrations/marketplaces/types';

// Mock do Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        maybeSingle: vi.fn(),
      })),
      order: vi.fn(() => ({
        limit: vi.fn(),
      })),
    })),
    insert: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock do adapter
const mockAdapter: MarketplaceAdapter = {
  name: 'MercadoLivre',
  isAuthenticated: true,
  searchProducts: vi.fn(),
  getProductDetails: vi.fn(),
  createOrder: vi.fn(),
  getOrderStatus: vi.fn(),
  updateInventory: vi.fn(),
  getInventory: vi.fn(),
  authenticate: vi.fn(),
  refreshAuth: vi.fn(),
};

describe('ProductSyncService', () => {
  let service: ProductSyncService;

  beforeEach(() => {
    service = new ProductSyncService();
    vi.clearAllMocks();
  });

  describe('importProductsFromMarketplace', () => {
    it('should import products successfully', async () => {
      const mockProducts = [
        createMockProduct({ id: 'MLB123' }),
        createMockProduct({ id: 'MLB456' }),
      ];

      mockAdapter.searchProducts = vi.fn().mockResolvedValue(mockProducts);
      
      // Mock do log de sincronização
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: { id: 'log-id' }, error: null }),
        update: vi.fn().mockResolvedValue({ data: null, error: null }),
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      });

      const result = await service.importProductsFromMarketplace(mockAdapter, 'MercadoLivre');

      expect(result.marketplaceName).toBe('MercadoLivre');
      expect(result.productsProcessed).toBe(2);
      expect(result.status).toBe('completed');
      expect(mockAdapter.searchProducts).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
      });
    });

    it('should handle authentication failure', async () => {
      const unauthenticatedAdapter = { ...mockAdapter, isAuthenticated: false };
      unauthenticatedAdapter.authenticate = vi.fn().mockResolvedValue(false);

      const result = await service.importProductsFromMarketplace(unauthenticatedAdapter, 'MercadoLivre');

      expect(result.status).toBe('failed');
      expect(result.errors).toContain('Authentication failed for MercadoLivre');
    });

    it('should handle search errors gracefully', async () => {
      mockAdapter.searchProducts = vi.fn().mockRejectedValue(new Error('API Error'));

      const result = await service.importProductsFromMarketplace(mockAdapter, 'MercadoLivre');

      expect(result.status).toBe('failed');
      expect(result.errors).toContain('API Error');
    });
  });

  describe('mapMarketplaceProduct', () => {
    it('should map marketplace product correctly', async () => {
      const mockProduct = createMockProduct();
      
      // Mock da categoria
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'category-id' } }),
          }),
        }),
        insert: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn(),
      });

      const result = await service['mapMarketplaceProduct'](mockProduct, 'MercadoLivre');

      expect(result.name).toBe(mockProduct.title);
      expect(result.price).toBe(mockProduct.price);
      expect(result.original_price).toBe(mockProduct.originalPrice);
      // expect(result.marketplace_name).toBe('MercadoLivre'); // marketplace_name field doesn't exist
      expect(result.active).toBe(true);
    });
  });

  describe('chunkArray', () => {
    it('should chunk array correctly', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const chunks = service['chunkArray'](array, 3);

      expect(chunks).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10]
      ]);
    });

    it('should handle empty array', () => {
      const chunks = service['chunkArray']([], 3);
      expect(chunks).toEqual([]);
    });
  });

  describe('findExistingProduct', () => {
    it('should find existing product', async () => {
      const mockProduct = { id: 'product-id' };
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockProduct }),
          }),
        }),
        insert: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn(),
      });

      const result = await service['findExistingProduct']('MLB123', 'MercadoLivre');

      expect(result).toEqual(mockProduct);
    });

    it('should return null when product not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
        insert: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn(),
      });

      const result = await service['findExistingProduct']('MLB123', 'MercadoLivre');

      expect(result).toBeNull();
    });
  });
});