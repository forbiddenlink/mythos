'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementToast } from '@/components/ui/achievement-toast';
import type { Achievement } from '@/data/achievements';

interface AchievementNotificationProviderProps {
  children: ReactNode;
}

/**
 * Provider that shows toast notifications when achievements are unlocked.
 * Must be placed inside ProgressProvider.
 */
export function AchievementNotificationProvider({
  children,
}: AchievementNotificationProviderProps) {
  const { achievements, unlockedCount } = useAchievements();
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
  const previousUnlockedRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  // Track newly unlocked achievements
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: detecting new unlocks
  useEffect(() => {
    const currentUnlocked = new Set(
      achievements.filter((a) => a.unlocked).map((a) => a.id)
    );

    // Skip on first render to avoid showing toasts for already-unlocked achievements
    if (!isInitializedRef.current) {
      previousUnlockedRef.current = currentUnlocked;
      isInitializedRef.current = true;
      return;
    }

    // Find newly unlocked achievements
    const newlyUnlocked: Achievement[] = [];
    for (const achievement of achievements) {
      if (
        achievement.unlocked &&
        !previousUnlockedRef.current.has(achievement.id)
      ) {
        newlyUnlocked.push(achievement);
      }
    }

    // Add new achievements to toast queue
    if (newlyUnlocked.length > 0) {
      setToastQueue((prev) => [...prev, ...newlyUnlocked]);
    }

    previousUnlockedRef.current = currentUnlocked;
  }, [achievements, unlockedCount]);

  // Handle closing a toast
  const handleCloseToast = (achievementId: string) => {
    setToastQueue((prev) => prev.filter((a) => a.id !== achievementId));
  };

  // Only show the first toast in the queue (stack them one at a time)
  const currentToast = toastQueue[0];

  return (
    <>
      {children}
      {currentToast && (
        <AchievementToast
          key={currentToast.id}
          achievement={currentToast}
          onClose={() => handleCloseToast(currentToast.id)}
        />
      )}
    </>
  );
}
