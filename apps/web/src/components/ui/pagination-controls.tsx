'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  className?: string;
  showItemCount?: boolean;
}

export function PaginationControls({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onNextPage,
  onPreviousPage,
  onFirstPage,
  onLastPage,
  startIndex,
  endIndex,
  totalItems,
  className,
  showItemCount = true,
}: PaginationControlsProps) {
  // Generate page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages if not too many
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(totalPages - 1, page + 1);

      // Adjust if at the beginning or end
      if (page <= 3) {
        endPage = 4;
      } else if (page >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      // Add ellipsis if needed at start
      if (startPage > 2) {
        pages.push('ellipsis');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed at end
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
      {showItemCount && (
        <p className="text-sm text-muted-foreground">
          Showing {startIndex}–{endIndex} of {totalItems}
        </p>
      )}

      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* First page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onFirstPage}
          disabled={!hasPreviousPage}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-muted-foreground"
                  aria-hidden
                >
                  ...
                </span>
              );
            }

            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  'h-8 w-8',
                  pageNum === page && 'bg-gold hover:bg-gold-dark text-midnight'
                )}
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={pageNum === page ? 'page' : undefined}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onNextPage}
          disabled={!hasNextPage}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onLastPage}
          disabled={!hasNextPage}
          aria-label="Go to last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}
