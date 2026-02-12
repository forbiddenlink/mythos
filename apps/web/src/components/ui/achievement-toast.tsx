'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Trophy } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

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
    .join('');
}

/**
 * Get a lucide-react icon component by name
 */
function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
  const icons = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const pascalName = toPascalCase(iconName);
  return icons[pascalName] || Trophy;
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
        // Base styles
        'fixed bottom-4 right-4 z-50 max-w-sm overflow-hidden rounded-xl',
        // Glass card effect with gold accents
        'bg-card/95 backdrop-blur-md border border-gold/30',
        'shadow-lg shadow-gold/10',
        // Animation transitions
        'transform transition-all duration-300 ease-out',
        // Entrance/exit states
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
        // Glow effect
        'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-gold/5 before:via-gold/10 before:to-gold/5 before:animate-pulse-subtle'
      )}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

      {/* Content */}
      <div className="relative p-4">
        {/* Close button */}
        <button
          onClick={handleClose}
          className={cn(
            'absolute top-2 right-2 p-1 rounded-full',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-accent/50 transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'
          )}
          aria-label="Close notification"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-4 pr-6">
          {/* Icon container with glow */}
          <div
            className={cn(
              'flex-shrink-0 flex items-center justify-center',
              'size-12 rounded-full',
              'bg-gradient-to-br from-gold-dark via-gold to-gold-light',
              'shadow-md shadow-gold/30',
              'animate-glow'
            )}
          >
            <Icon className="size-6 text-midnight" />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0 pt-0.5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="size-3.5 text-gold" />
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
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
                'bg-gold/15 border border-gold/30',
                'text-xs font-semibold text-gold'
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
          className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light transition-none"
          style={{
            width: '100%',
            animation: `achievement-toast-shrink ${autoHideDuration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export default AchievementToast;
