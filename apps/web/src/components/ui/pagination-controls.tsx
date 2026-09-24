"use client";

import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  getPageHref?: (page: number) => string;
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
  getPageHref,
}: PaginationControlsProps) {
  // Generate page numbers to display
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
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
        pages.push("ellipsis");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed at end
      if (endPage < totalPages - 1) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const control = (
    target: number,
    label: string,
    content: ReactNode,
    onClick: () => void,
    disabled = false,
    current = false,
  ): ReactNode => {
    const props = {
      variant: current ? ("default" as const) : ("outline" as const),
      size: "icon" as const,
      className: cn(
        "h-8 w-8",
        current && "bg-gold hover:bg-gold-dark text-midnight",
      ),
      "aria-label": label,
      "aria-current": current ? ("page" as const) : undefined,
    };
    return getPageHref && !disabled ? (
      <Button {...props} asChild>
        <a href={getPageHref(target)}>{content}</a>
      </Button>
    ) : (
      <Button {...props} onClick={onClick} disabled={disabled}>
        {content}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4",
        className,
      )}
    >
      {showItemCount && (
        <p className="text-sm text-muted-foreground">
          Showing {startIndex}–{endIndex} of {totalItems}
        </p>
      )}

      <nav
        className="flex max-w-full flex-wrap items-center justify-center gap-1"
        aria-label="Pagination"
      >
        {control(
          1,
          "Go to first page",
          <ChevronsLeft className="h-4 w-4" />,
          onFirstPage,
          !hasPreviousPage,
        )}
        {control(
          page - 1,
          "Go to previous page",
          <ChevronLeft className="h-4 w-4" />,
          onPreviousPage,
          !hasPreviousPage,
        )}

        {/* Page numbers */}
        <div className="flex max-w-full flex-wrap items-center justify-center gap-1">
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === "ellipsis") {
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
              <span key={pageNum}>
                {control(
                  pageNum,
                  `Page ${pageNum}`,
                  pageNum,
                  () => onPageChange(pageNum),
                  false,
                  pageNum === page,
                )}
              </span>
            );
          })}
        </div>

        {control(
          page + 1,
          "Go to next page",
          <ChevronRight className="h-4 w-4" />,
          onNextPage,
          !hasNextPage,
        )}
        {control(
          totalPages,
          "Go to last page",
          <ChevronsRight className="h-4 w-4" />,
          onLastPage,
          !hasNextPage,
        )}
      </nav>
    </div>
  );
}
