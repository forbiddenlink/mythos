'use client';

import { useState, useMemo, useCallback } from 'react';

export interface UsePaginationResult<T> {
  paginatedData: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  startIndex: number;
  endIndex: number;
}

/**
 * Generic pagination hook for client-side data pagination
 * @param data Array of items to paginate
 * @param pageSize Number of items per page (default: 24, divisible by 2, 3, 4 for grids)
 * @param initialPage Starting page (default: 1)
 */
export function usePagination<T>(
  data: T[],
  pageSize = 24,
  initialPage = 1
): UsePaginationResult<T> {
  const [page, setPageState] = useState(initialPage);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure page stays within bounds
  const validPage = useMemo(() => {
    return Math.min(Math.max(1, page), totalPages);
  }, [page, totalPages]);

  // Calculate start and end indices
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Get paginated data slice
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.min(Math.max(1, newPage), totalPages));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setPageState((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setPageState((p) => Math.max(p - 1, 1));
  }, []);

  const firstPage = useCallback(() => {
    setPageState(1);
  }, []);

  const lastPage = useCallback(() => {
    setPageState(totalPages);
  }, [totalPages]);

  return {
    paginatedData,
    page: validPage,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage: validPage < totalPages,
    hasPreviousPage: validPage > 1,
    setPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    startIndex: startIndex + 1, // 1-indexed for display
    endIndex,
  };
}
