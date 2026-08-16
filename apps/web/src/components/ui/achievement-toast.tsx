"use client";

import { useEffect, useState, useCallback } from "react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

export interface AchievementToastProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    xp: number;
    icon: string;
  };
  onClose: () => void;
  autoHideDuration?: number;
}

/**
 * Convert a string to PascalCase for icon lookup
 * e.g., "map-pin" -> "MapPin", "trophy" -> "Trophy"
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Get a lucide-react icon component by name
 */
function getIcon(
  iconName: string,
): React.ComponentType<{ className?: string }> {
  const icons = Icons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  const pascalName = toPascalCase(iconName);
  return icons[pascalName] || Icons.Trophy;
}

export function AchievementToast({
  achievement,
  onClose,
  autoHideDuration = 5000,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation to complete before calling onClose
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // Trigger entrance animation on mount
  useEffect(() => {
    // Small delay to ensure the component is mounted before animating
    const enterTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(enterTimer);
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, autoHideDuration);

    return () => clearTimeout(dismissTimer);
  }, [autoHideDuration, handleClose]);

  const Icon = getIcon(achievement.icon);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        // Base styles — full-width on mobile (never covers central content),
        // compact bottom-right on larger screens
        "fixed z-50 overflow-hidden rounded-xl",
        "bottom-4 left-4 right-4 max-w-none sm:left-auto sm:right-4 sm:max-w-sm",
        // Solid on-brand card (no glassmorphism / glow — matches editorial tone)
        "bg-card border border-gold/25 shadow-lg shadow-black/20",
        // Animation transitions
        "transform transition-all duration-300 ease-out",
        // Entrance/exit states
        isVisible && !isExiting
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0",
      )}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-gold-dark via-gold to-gold-dark" />

      {/* Content */}
      <div className="relative p-4">
        {/* Close button */}
        <button
          onClick={handleClose}
          className={cn(
            "absolute top-2 right-2 p-1 rounded-full",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-accent/50 transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
          )}
          aria-label="Close notification"
        >
          <Icons.X className="size-4" />
        </button>

        <div className="flex items-start gap-4 pr-6">
          {/* Icon container with glow */}
          <div
            className={cn(
              "shrink-0 flex items-center justify-center",
              "size-12 rounded-full",
              "bg-linear-to-br from-gold-dark via-gold to-gold-light",
              "shadow-sm",
            )}
          >
            {}
            <Icon className="size-6 text-midnight" />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0 pt-0.5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <Icons.Trophy className="size-3.5 text-gold" />
              <span className="text-xs font-medium uppercase tracking-wider text-gold">
                Achievement Unlocked!
              </span>
            </div>

            {/* Achievement name */}
            <h3 className="font-serif font-semibold text-base text-foreground leading-tight mb-1 truncate">
              {achievement.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2">
              {achievement.description}
            </p>

            {/* XP badge */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                "bg-gold/15 border border-gold/30",
                "text-xs font-semibold text-gold",
              )}
            >
              <span className="text-gold-light">+{achievement.xp}</span>
              <span>XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar for auto-dismiss (optional visual indicator) */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold/20 overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-gold-dark via-gold to-gold-light transition-none"
          style={{
            width: "100%",
            animation: `achievement-toast-shrink ${autoHideDuration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export default AchievementToast;
