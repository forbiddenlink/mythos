import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '@/hooks/usePagination';

function generateItems(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i + 1);
}

describe('usePagination', () => {
  describe('basic calculations', () => {
    it('should default pageSize to 24', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data));
      expect(result.current.pageSize).toBe(24);
    });

    it('should calculate totalPages correctly', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data));
      expect(result.current.totalPages).toBe(3); // ceil(50/24)
    });

    it('should calculate totalPages as 1 for empty data', () => {
      const { result } = renderHook(() => usePagination([]));
      expect(result.current.totalPages).toBe(1); // Math.max(1, ...)
    });

    it('should set totalItems to data length', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data));
      expect(result.current.totalItems).toBe(50);
    });

    it('should start on page 1 by default', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data));
      expect(result.current.page).toBe(1);
    });

    it('should allow custom initial page', () => {
      const data = generateItems(100);
      const { result } = renderHook(() => usePagination(data, 10, 3));
      expect(result.current.page).toBe(3);
    });

    it('should allow custom page size', () => {
      const data = generateItems(100);
      const { result } = renderHook(() => usePagination(data, 10));
      expect(result.current.pageSize).toBe(10);
      expect(result.current.totalPages).toBe(10);
    });
  });

  describe('paginated data', () => {
    it('should return first page of data', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10));
      expect(result.current.paginatedData).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should return correct slice for a given page', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10, 3));
      expect(result.current.paginatedData).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
    });

    it('should return partial last page', () => {
      const data = generateItems(25);
      const { result } = renderHook(() => usePagination(data, 10, 3));
      expect(result.current.paginatedData).toEqual([21, 22, 23, 24, 25]);
    });

    it('should return empty array for empty data', () => {
      const { result } = renderHook(() => usePagination([]));
      expect(result.current.paginatedData).toEqual([]);
    });
  });

  describe('indices', () => {
    it('should calculate 1-indexed startIndex and endIndex', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10));
      expect(result.current.startIndex).toBe(1);
      expect(result.current.endIndex).toBe(10);
    });

    it('should calculate correct indices for middle pages', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10, 3));
      expect(result.current.startIndex).toBe(21);
      expect(result.current.endIndex).toBe(30);
    });

    it('should calculate correct endIndex for last partial page', () => {
      const data = generateItems(25);
      const { result } = renderHook(() => usePagination(data, 10, 3));
      expect(result.current.startIndex).toBe(21);
      expect(result.current.endIndex).toBe(25);
    });
  });

  describe('navigation flags', () => {
    it('should not have previous page on page 1', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10));
      expect(result.current.hasPreviousPage).toBe(false);
      expect(result.current.hasNextPage).toBe(true);
    });

    it('should not have next page on last page', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10, 5));
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.hasPreviousPage).toBe(true);
    });

    it('should have both flags on middle pages', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10, 3));
      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.hasPreviousPage).toBe(true);
    });

    it('should have neither flag for single page', () => {
      const data = generateItems(5);
      const { result } = renderHook(() => usePagination(data, 10));
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.hasPreviousPage).toBe(false);
    });
  });

  describe('navigation actions', () => {
    it('should go to next page', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10));
      expect(result.current.page).toBe(1);

      act(() => {
        result.current.nextPage();
      });
      expect(result.current.page).toBe(2);
    });

    it('should go to previous page', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10, 3));

      act(() => {
        result.current.previousPage();
      });
      expect(result.current.page).toBe(2);
    });

    it('should go to first page', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10, 4));

      act(() => {
        result.current.firstPage();
      });
      expect(result.current.page).toBe(1);
    });

    it('should go to last page', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10));

      act(() => {
        result.current.lastPage();
      });
      expect(result.current.page).toBe(5);
    });

    it('should set specific page', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10));

      act(() => {
        result.current.setPage(4);
      });
      expect(result.current.page).toBe(4);
    });

    it('should not go below page 1 with previousPage', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10));

      act(() => {
        result.current.previousPage();
      });
      expect(result.current.page).toBe(1);
    });

    it('should not go beyond last page with nextPage', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10, 5));

      act(() => {
        result.current.nextPage();
      });
      expect(result.current.page).toBe(5);
    });

    it('should clamp setPage to valid range', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10));

      act(() => {
        result.current.setPage(100);
      });
      expect(result.current.page).toBe(5);

      act(() => {
        result.current.setPage(0);
      });
      expect(result.current.page).toBe(1);

      act(() => {
        result.current.setPage(-5);
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle single item', () => {
      const data = [42];
      const { result } = renderHook(() => usePagination(data, 10));
      expect(result.current.totalPages).toBe(1);
      expect(result.current.paginatedData).toEqual([42]);
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.hasPreviousPage).toBe(false);
    });

    it('should handle data exactly divisible by page size', () => {
      const data = generateItems(30);
      const { result } = renderHook(() => usePagination(data, 10));
      expect(result.current.totalPages).toBe(3);

      act(() => {
        result.current.lastPage();
      });
      expect(result.current.paginatedData).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
    });

    it('should handle page size larger than data', () => {
      const data = generateItems(5);
      const { result } = renderHook(() => usePagination(data, 100));
      expect(result.current.totalPages).toBe(1);
      expect(result.current.paginatedData).toEqual([1, 2, 3, 4, 5]);
    });

    it('should clamp invalid initial page to valid range', () => {
      const data = generateItems(50);
      const { result } = renderHook(() => usePagination(data, 10, 100));
      // validPage clamps to totalPages (5)
      expect(result.current.page).toBe(5);
    });
  });
});
