"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementToast } from "@/components/ui/achievement-toast";
import type { Achievement } from "@/data/achievements";

const ACHIEVEMENT_NOTIFICATIONS_KEY = "mythos-achievement-notifications";

interface AchievementNotificationPreferences {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const AchievementNotificationContext =
  createContext<AchievementNotificationPreferences | null>(null);

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [hydrationSettled, setHydrationSettled] = useState(false);
  const previousUnlockedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only preference hydration
      setNotificationsEnabled(
        localStorage.getItem(ACHIEVEMENT_NOTIFICATIONS_KEY) === "enabled",
      );
    } catch {
      // Preference storage can be unavailable in privacy-restricted browsers.
    }
    setPreferencesLoaded(true);

    // Progress hydration and automatic achievement checks happen in effects. Do
    // not treat those historical awards as a new notification event.
    const timer = window.setTimeout(() => setHydrationSettled(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setNotificationsEnabled(enabled);
    try {
      localStorage.setItem(
        ACHIEVEMENT_NOTIFICATIONS_KEY,
        enabled ? "enabled" : "disabled",
      );
    } catch {
      // Keep the in-memory preference when localStorage is unavailable.
    }
  }, []);

  // Track newly unlocked achievements
  useEffect(() => {
    const currentUnlocked = new Set(
      achievements.filter((a) => a.unlocked).map((a) => a.id),
    );

    // Keep rebasing while client preferences and stored progress settle. This
    // makes opt-in forward-looking: enabling never replays prior awards.
    if (!preferencesLoaded || !hydrationSettled || !notificationsEnabled) {
      previousUnlockedRef.current = currentUnlocked;
      if (!notificationsEnabled && toastQueue.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- disabling must immediately remove a visible notification
        setToastQueue([]);
      }
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
  }, [
    achievements,
    hydrationSettled,
    notificationsEnabled,
    preferencesLoaded,
    toastQueue.length,
    unlockedCount,
  ]);

  // Handle closing a toast
  const handleCloseToast = (achievementId: string) => {
    setToastQueue((prev) => prev.filter((a) => a.id !== achievementId));
  };

  // Only show the first toast in the queue (stack them one at a time)
  const currentToast = toastQueue[0];

  return (
    <AchievementNotificationContext.Provider
      value={{ enabled: notificationsEnabled, setEnabled }}
    >
      {children}
      {currentToast && (
        <AchievementToast
          key={currentToast.id}
          achievement={currentToast}
          onClose={() => handleCloseToast(currentToast.id)}
        />
      )}
    </AchievementNotificationContext.Provider>
  );
}

/** A footer-ready preference control for achievement toast notifications. */
export function AchievementNotificationToggle({
  className,
}: {
  className?: string;
}) {
  const preferences = useContext(AchievementNotificationContext);
  if (!preferences) {
    throw new Error(
      "AchievementNotificationToggle must be used within AchievementNotificationProvider",
    );
  }

  return (
    <label className={className}>
      <input
        type="checkbox"
        checked={preferences.enabled}
        onChange={(event) => preferences.setEnabled(event.target.checked)}
      />
      <span className="ml-2">Achievement notifications</span>
    </label>
  );
}
