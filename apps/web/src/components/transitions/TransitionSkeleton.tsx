'use client';

import { cn } from '@/lib/utils';

interface TransitionSkeletonProps {
  /**
   * Type of skeleton to display
   * - 'page' - Full page skeleton with header and content
   * - 'card' - Single card skeleton
   * - 'hero' - Hero section skeleton
   */
  type?: 'page' | 'card' | 'hero';
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Loading skeleton for page transitions.
 *
 * Displays a shimmer skeleton while the new page is loading
 * during view transitions.
 *
 * @example
 * // In a loading.tsx file
 * export default function Loading() {
 *   return <TransitionSkeleton type="page" />;
 * }
 */
export function TransitionSkeleton({
  type = 'page',
  className,
}: TransitionSkeletonProps) {
  if (type === 'card') {
    return (
      <div
        className={cn(
          'rounded-xl border border-border bg-card p-6 animate-pulse',
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-2/3 rounded bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-4/5 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (type === 'hero') {
    return (
      <div
        className={cn(
          'relative h-[50vh] bg-gradient-to-b from-muted/50 to-background animate-pulse',
          className
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-12 w-64 mx-auto rounded bg-muted" />
            <div className="h-6 w-96 mx-auto rounded bg-muted/60" />
          </div>
        </div>
      </div>
    );
  }

  // Default: full page skeleton
  return (
    <div className={cn('min-h-screen', className)}>
      {/* Hero skeleton */}
      <div className="relative h-[40vh] bg-gradient-to-b from-muted/30 to-background animate-pulse">
        <div className="absolute bottom-8 left-8">
          <div className="h-8 w-48 rounded bg-muted mb-4" />
          <div className="h-12 w-80 rounded bg-muted" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-8">
        {/* Image skeleton */}
        <div className="w-full max-w-sm mx-auto aspect-[3/4] rounded-2xl bg-muted animate-pulse" />

        {/* Card skeleton */}
        <div className="rounded-xl border border-border bg-card p-8 animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted/60" />
            <div className="h-4 w-5/6 rounded bg-muted/60" />
            <div className="h-4 w-4/5 rounded bg-muted/60" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
            <div className="h-5 w-24 rounded bg-muted mb-4" />
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-16 rounded-full bg-muted/60" />
              <div className="h-6 w-20 rounded-full bg-muted/60" />
              <div className="h-6 w-14 rounded-full bg-muted/60" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
            <div className="h-5 w-24 rounded bg-muted mb-4" />
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-18 rounded-full bg-muted/60" />
              <div className="h-6 w-22 rounded-full bg-muted/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransitionSkeleton;
