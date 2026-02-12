'use client';

import Link from 'next/link';
import { Flame, Brain } from 'lucide-react';
import { useProgress } from '@/hooks/use-progress';
import { useReview } from '@/providers/review-provider';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function StreakBadge() {
  const { progress } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render streak badge if no streak
  if (!mounted || progress.dailyStreak === 0) {
    return null;
  }

  return (
    <Link
      href="/progress"
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors duration-200"
      aria-label={`${progress.dailyStreak} day streak`}
    >
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      >
        <Flame className="h-4 w-4" />
      </motion.div>
      <span className="font-semibold tabular-nums">{progress.dailyStreak}</span>
    </Link>
  );
}

export function ReviewCountBadge() {
  const { dueCount, generateCardsFromProgress } = useReview();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate cards on mount to get accurate due count
    generateCardsFromProgress();
  }, [generateCardsFromProgress]);

  // Don't render if no cards due
  if (!mounted || dueCount === 0) {
    return null;
  }

  return (
    <Link
      href="/review"
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200",
        dueCount > 0
          ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
          : "bg-muted/50 text-muted-foreground hover:bg-muted"
      )}
      aria-label={`${dueCount} cards due for review`}
    >
      <Brain className="h-4 w-4" />
      <span className="font-semibold tabular-nums">{dueCount}</span>
    </Link>
  );
}

export function QuickActions() {
  return (
    <div className="hidden sm:flex items-center gap-2">
      <StreakBadge />
      <ReviewCountBadge />
    </div>
  );
}
