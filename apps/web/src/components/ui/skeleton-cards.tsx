"use client";

import { cn } from "@/lib/utils";

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
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0",
        "before:-translate-x-full before:animate-[shimmer_2s_infinite]",
        "before:bg-linear-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "dark:before:via-white/5",
        className,
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
      <div className="h-0.5 bg-linear-to-r from-gold-dark via-gold to-gold-dark opacity-50" />

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
 * GridSkeleton - Configurable grid of skeleton cards
 */
interface GridSkeletonProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  type?: "deity" | "story";
  className?: string;
}

export function GridSkeleton({
  count = 6,
  columns = 3,
  type = "deity",
  className,
}: GridSkeletonProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  const SkeletonCard = type === "story" ? StoryCardSkeleton : DeityCardSkeleton;

  return (
    <div className={cn("grid gap-6", columnClasses[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * PageHeaderSkeleton - Hero section for list pages
 */
export function PageHeaderSkeleton() {
  return (
    <div className="relative h-[50vh] min-h-100 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-midnight/70 via-midnight/60 to-midnight/80" />
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
