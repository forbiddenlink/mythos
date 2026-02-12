'use client';

import { cn } from '@/lib/utils';

/**
 * Base Skeleton component with shimmer animation
 * Uses a gradient animation that's dark-theme compatible
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-muted',
        'before:absolute before:inset-0',
        'before:-translate-x-full before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
        'dark:before:via-white/5',
        className
      )}
      {...props}
    />
  );
}

/**
 * DeityCardSkeleton - Matches the deity card layout in the grid view
 * Dimensions based on Card with CardHeader (icon/image + title + domain) and CardContent (description)
 */
export function DeityCardSkeleton() {
  return (
    <div className="glass-card rounded-xl border border-border/60 py-6 shadow-sm">
      {/* CardHeader */}
      <div className="px-6 space-y-4">
        {/* Top row: image/icon + badge */}
        <div className="flex items-start justify-between">
          {/* Image placeholder - 16x16 = 64px */}
          <Skeleton className="w-16 h-16 rounded-xl" />
          {/* Badge + bookmark placeholder */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
        {/* Title */}
        <Skeleton className="h-7 w-3/4 mt-4" />
        {/* Domain/description */}
        <Skeleton className="h-4 w-1/2" />
      </div>
      {/* CardContent - description lines */}
      <div className="px-6 mt-6 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

/**
 * StoryCardSkeleton - Matches the story card layout
 * Features a top gradient border, icon, title, summary, and theme badges
 */
export function StoryCardSkeleton() {
  return (
    <div className="glass-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
      {/* Top gradient border */}
      <div className="h-0.5 bg-gradient-to-r from-gold-dark via-gold to-gold-dark opacity-50" />

      {/* CardHeader */}
      <div className="px-6 py-6 space-y-4">
        <div className="flex items-start gap-3">
          {/* Icon placeholder - 12x12 = 48px */}
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          {/* Title area */}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
          {/* Bookmark button */}
          <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        </div>
      </div>

      {/* CardContent - summary + badges */}
      <div className="px-6 pb-6 space-y-4">
        {/* Summary lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* Theme badges */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * DetailPageSkeleton - For deity and story detail pages
 * Shows hero section placeholder, main content cards
 */
export function DetailPageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero section placeholder */}
      <div className="relative h-[40vh] min-h-[300px] bg-gradient-to-b from-midnight/70 via-midnight/60 to-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 max-w-4xl mx-auto space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <Skeleton className="w-20 h-20 rounded-xl" />
            </div>
            {/* Title */}
            <Skeleton className="h-12 w-2/3 mx-auto" />
            {/* Subtitle */}
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-8">
        {/* Main content card */}
        <div className="glass-card rounded-xl border border-border/60 p-6 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Secondary cards grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl border border-border/60 p-6 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
          <div className="glass-card rounded-xl border border-border/60 p-6 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-18 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * TableRowSkeleton - For DeitiesTable rows
 * Matches the 5-column layout: Name, Domain, Symbols, Gender, Importance
 */
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-200 dark:border-slate-800">
      {/* Name */}
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-24" />
      </td>
      {/* Domain badges */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </td>
      {/* Symbols badges */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </td>
      {/* Gender */}
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-16" />
      </td>
      {/* Importance */}
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-8" />
      </td>
    </tr>
  );
}

/**
 * TableSkeleton - Full table with header and rows
 */
export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <Skeleton className="h-10 w-full rounded-md" />

      {/* Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-12" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-14" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * GridSkeleton - Configurable grid of skeleton cards
 */
interface GridSkeletonProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  type?: 'deity' | 'story';
  className?: string;
}

export function GridSkeleton({
  count = 6,
  columns = 3,
  type = 'deity',
  className,
}: GridSkeletonProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const SkeletonCard = type === 'story' ? StoryCardSkeleton : DeityCardSkeleton;

  return (
    <div className={cn('grid gap-6', columnClasses[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * FiltersSkeleton - For filter controls above grids
 */
export function FiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Skeleton className="h-10 w-full sm:w-64 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}

/**
 * PageHeaderSkeleton - Hero section for list pages
 */
export function PageHeaderSkeleton() {
  return (
    <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent" />

      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <Skeleton className="w-16 h-16 rounded-xl" />
        </div>
        {/* Subtitle */}
        <Skeleton className="h-4 w-32 mx-auto" />
        {/* Title */}
        <Skeleton className="h-16 w-48 mx-auto" />
        {/* Divider placeholder */}
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="w-12 h-px" />
          <Skeleton className="w-1.5 h-1.5 rotate-45" />
          <Skeleton className="w-12 h-px" />
        </div>
        {/* Description */}
        <Skeleton className="h-6 w-96 mx-auto max-w-full" />
      </div>
    </div>
  );
}

// Export base skeleton for custom use cases
export { Skeleton };
