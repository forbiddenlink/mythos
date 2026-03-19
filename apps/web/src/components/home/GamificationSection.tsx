"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/hooks/use-progress";
import { StreakWidget } from "@/components/home/StreakWidget";
import { DailyChallengeBanner } from "@/components/challenges/DailyChallengeBanner";
import { LeaderboardWidget } from "@/components/leaderboard/LeaderboardWidget";

/**
 * Wraps gamification widgets (streak, daily challenges, leaderboard) so they
 * only render when the current user has *some* progress.  First-time visitors
 * see none of these sections — keeping the homepage focused on content.
 */
export function GamificationSection() {
  const { getStats } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- track client hydration
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const stats = getStats();

  // Show gamification only if the user has started engaging
  const hasProgress =
    stats.totalDeitiesViewed > 0 ||
    stats.totalStoriesRead > 0 ||
    stats.totalQuizzesTaken > 0 ||
    stats.dailyStreak > 0;

  if (!hasProgress) return null;

  return (
    <>
      <StreakWidget />
      <DailyChallengeBanner />
      <LeaderboardWidget />
    </>
  );
}
