import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import type { Product, FilterOptions, PaginationParams } from '@/types';

export const useProducts = (filters?: Partial<FilterOptions & PaginationParams>) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => db.getProducts(filters),
    select: (data) => data.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => db.getProduct(id),
    select: (data) => data.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => db.getProducts({ featured: true }),
    select: (data) => data.data || [],
    staleTime: 10 * 60 * 1000,
  });
};

export const useProductsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => db.getProducts({ category: categoryId }),
    select: (data) => data.data || [],
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useInfiniteProducts = (filters?: Partial<FilterOptions & PaginationParams>) => {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => 
      db.getProducts({ 
        ...filters, 
        page: pageParam, 
        limit: filters?.limit || 12 
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.data && lastPage.data.length === (filters?.limit || 12);
      return hasMore ? allPages.length + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      products: data.pages.flatMap(page => page.data || [])
    }),
    staleTime: 5 * 60 * 1000,
  });
};

// Search products with debouncing
export const useProductSearch = (searchTerm: string, delay = 300) => {
  return useQuery({
    queryKey: ['products', 'search', searchTerm],
    queryFn: () => db.getProducts({ search: searchTerm }),
    select: (data) => data.data || [],
    enabled: searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000,
  });
};