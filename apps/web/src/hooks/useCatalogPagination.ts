"use client";

import { useCatalogState } from "@/hooks/useCatalogState";
import type { UsePaginationResult } from "@/hooks/usePagination";
import { catalogPage } from "@/lib/catalog-query";

/** URL-backed pagination for catalogs with client-side filters. */
export function useCatalogPagination<T>(
  data: T[],
  pageSize: number,
  initialPage = 1,
): UsePaginationResult<T> {
  const [rawPage, setRawPage] = useCatalogState<string>(
    "page",
    "1",
    undefined,
    false,
    String(initialPage),
  );
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const page = Math.min(catalogPage({ page: rawPage }), totalPages);
  const start = (page - 1) * pageSize;
  const setPage = (next: number): void => {
    setRawPage(String(Math.min(Math.max(1, next), totalPages)));
  };
  return {
    paginatedData: data.slice(start, start + pageSize),
    page,
    totalPages,
    totalItems: data.length,
    pageSize,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    setPage,
    nextPage: () => setPage(page + 1),
    previousPage: () => setPage(page - 1),
    firstPage: () => setPage(1),
    lastPage: () => setPage(totalPages),
    startIndex: start + 1,
    endIndex: Math.min(start + pageSize, data.length),
  };
}
