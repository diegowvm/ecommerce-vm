import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWishlist } from '../useWishlist';
import { createMockUser } from '@/test-utils/factories';

const mockSupabase = {
  auth: {
    getSession: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
    })),
    insert: vi.fn(),
    delete: vi.fn(),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useWishlist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: createMockUser() } },
    });
  });

  it('should initialize with empty wishlist', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: vi.fn(),
      delete: vi.fn(),
    });

    const { result } = renderHook(() => useWishlist());

    await vi.waitFor(() => {
      expect(result.current.wishlistItems).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should load wishlist items', async () => {
    const mockWishlistItems = [
      { id: '1', product_id: 'product-1', user_id: 'user-1' },
      { id: '2', product_id: 'product-2', user_id: 'user-1' },
    ];

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockWishlistItems, error: null }),
        }),
      }),
      insert: vi.fn(),
      delete: vi.fn(),
    });

    const { result } = renderHook(() => useWishlist());

    await vi.waitFor(() => {
      expect(result.current.wishlistItems).toEqual(mockWishlistItems);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should add item to wishlist', async () => {
    const mockWishlistItems = [];

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockWishlistItems, error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn(),
    });

    const { result } = renderHook(() => useWishlist());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.addToWishlist('product-1');

    expect(mockSupabase.from).toHaveBeenCalledWith('wishlist');
    expect(mockSupabase.from().insert).toHaveBeenCalledWith({
      product_id: 'product-1',
    });
  });

  it('should remove item from wishlist', async () => {
    const mockWishlistItems = [
      { id: '1', product_id: 'product-1', user_id: 'user-1' },
    ];

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockWishlistItems, error: null }),
        }),
      }),
      insert: vi.fn(),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    const { result } = renderHook(() => useWishlist());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.removeFromWishlist('product-1');

    expect(mockSupabase.from).toHaveBeenCalledWith('wishlist');
    expect(mockSupabase.from().delete).toHaveBeenCalled();
  });

  it('should check if item is in wishlist', async () => {
    const mockWishlistItems = [
      { id: '1', product_id: 'product-1', user_id: 'user-1' },
    ];

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockWishlistItems, error: null }),
        }),
      }),
      insert: vi.fn(),
      delete: vi.fn(),
    });

    const { result } = renderHook(() => useWishlist());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isInWishlist('product-1')).toBe(true);
    expect(result.current.isInWishlist('product-2')).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Database error' } 
          }),
        }),
      }),
      insert: vi.fn(),
      delete: vi.fn(),
    });

    const { result } = renderHook(() => useWishlist());

    await vi.waitFor(() => {
      expect(result.current.wishlistItems).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });
});