import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UsePaginationOptions {
  defaultItemsPerPage?: number;
  maxItemsPerPage?: number;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  offset: number;
  limit: number;
}

interface PaginationControls {
  goToPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setTotalItems: (total: number) => void;
  reset: () => void;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    defaultItemsPerPage = 25,
    maxItemsPerPage = 100
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const [totalItems, setTotalItemsState] = useState(0);

  // Get initial values from URL or defaults
  const getInitialPage = () => {
    const pageParam = searchParams.get('page');
    return pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  };

  const getInitialItemsPerPage = () => {
    const limitParam = searchParams.get('limit');
    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      return Math.min(maxItemsPerPage, Math.max(1, limit));
    }
    return defaultItemsPerPage;
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [itemsPerPage, setItemsPerPageState] = useState(getInitialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const offset = (currentPage - 1) * itemsPerPage;

  // Update URL when pagination state changes
  const updateURL = useCallback((page: number, limit: number) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (page === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', page.toString());
    }
    
    if (limit === defaultItemsPerPage) {
      newParams.delete('limit');
    } else {
      newParams.set('limit', limit.toString());
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, defaultItemsPerPage]);

  // Go to specific page
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(validPage);
    updateURL(validPage, itemsPerPage);
  }, [totalPages, itemsPerPage, updateURL]);

  // Change items per page
  const setItemsPerPage = useCallback((items: number) => {
    const validItems = Math.min(maxItemsPerPage, Math.max(1, items));
    setItemsPerPageState(validItems);
    
    // Reset to page 1 when changing items per page
    setCurrentPage(1);
    updateURL(1, validItems);
  }, [maxItemsPerPage, updateURL]);

  // Set total items count
  const setTotalItems = useCallback((total: number) => {
    setTotalItemsState(Math.max(0, total));
    
    // If current page is beyond total pages, go to last page
    const newTotalPages = Math.ceil(total / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      goToPage(newTotalPages);
    }
  }, [currentPage, itemsPerPage, goToPage]);

  // Reset pagination
  const reset = useCallback(() => {
    setCurrentPage(1);
    setItemsPerPageState(defaultItemsPerPage);
    setTotalItemsState(0);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('page');
    newParams.delete('limit');
    setSearchParams(newParams);
  }, [defaultItemsPerPage, searchParams, setSearchParams]);

  // Sync with URL changes (back/forward buttons)
  useEffect(() => {
    const urlPage = getInitialPage();
    const urlItemsPerPage = getInitialItemsPerPage();
    
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
    
    if (urlItemsPerPage !== itemsPerPage) {
      setItemsPerPageState(urlItemsPerPage);
    }
  }, [searchParams]); // Only depend on searchParams to avoid infinite loops

  const paginationState: PaginationState = {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    offset,
    limit: itemsPerPage
  };

  const paginationControls: PaginationControls = {
    goToPage,
    setItemsPerPage,
    setTotalItems,
    reset
  };

  return {
    ...paginationState,
    ...paginationControls
  };
}

// Utility function to apply pagination to Supabase queries
export function applyPagination<T>(
  query: any,
  pagination: { offset: number; limit: number }
) {
  return query.range(pagination.offset, pagination.offset + pagination.limit - 1);
}

// Utility function to get total count from Supabase
export async function getSupabaseTotalCount(
  supabase: any,
  tableName: string,
  filters?: any
) {
  let query = supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });
  
  // Apply filters if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key.includes('ilike')) {
          const [column] = key.split('.');
          query = query.ilike(column, `%${value}%`);
        } else {
          query = query.eq(key, value);
        }
      }
    });
  }
  
  const { count, error } = await query;
  
  if (error) {
    console.error('Error getting total count:', error);
    return 0;
  }
  
  return count || 0;
}