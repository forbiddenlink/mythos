'use client';

import { useContext, useEffect, useCallback, useRef } from 'react';
import { ProgressContext, type UserProgress } from '@/providers/progress-provider';
import { achievements, type Achievement, type AchievementRequirement } from '@/data/achievements';

const ALL_PANTHEON_IDS = [
  'greek', 'norse', 'egyptian', 'roman', 'celtic', 'hindu',
  'japanese', 'mesopotamian', 'chinese', 'mesoamerican', 'african', 'polynesian'
];

function checkRequirement(requirement: AchievementRequirement, progress: UserProgress): boolean {
  switch (requirement.type) {
    case 'deities_viewed':
      return progress.deitiesViewed.length >= requirement.count;
    case 'stories_read':
      return progress.storiesRead.length >= requirement.count;
    case 'pantheons_explored':
      return progress.pantheonsExplored.length >= requirement.count;
    case 'locations_visited':
      return progress.locationsVisited.length >= requirement.count;
    case 'quizzes_taken':
      return Object.keys(progress.quizScores).length >= requirement.count;
    case 'quiz_perfect_score': {
      const perfectScores = Object.values(progress.quizScores).filter(s => s === 100).length;
      return perfectScores >= requirement.count;
    }
    case 'daily_streak':
      return progress.dailyStreak >= requirement.count;
    case 'total_xp':
      return progress.totalXP >= requirement.count;
    case 'all_pantheons':
      return ALL_PANTHEON_IDS.every(id => progress.pantheonsExplored.includes(id));
    case 'pantheon_complete':
      // Would need deity data to check - simplified for now
      return false;
    default:
      return false;
  }
}

export interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
  progress?: { current: number; target: number };
}

export function useAchievements() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useAchievements must be used within ProgressProvider');
  }

  const { progress, unlockAchievement } = context;
  const lastUnlockedRef = useRef<string[]>(progress.achievements);

  // Check and unlock achievements
  const checkAchievements = useCallback(() => {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of achievements) {
      // Skip if already unlocked
      if (progress.achievements.includes(achievement.id)) {
        continue;
      }

      // Check if requirement is met
      if (checkRequirement(achievement.requirement, progress)) {
        unlockAchievement(achievement.id, achievement.xp);
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }, [progress, unlockAchievement]);

  // Auto-check achievements when progress changes
  useEffect(() => {
    // Only check if achievements have changed (avoid infinite loop)
    if (lastUnlockedRef.current.length !== progress.achievements.length) {
      lastUnlockedRef.current = progress.achievements;
      return;
    }

    checkAchievements();
  }, [progress.deitiesViewed.length, progress.storiesRead.length, progress.pantheonsExplored.length,
      progress.locationsVisited.length, Object.keys(progress.quizScores).length, progress.dailyStreak,
      progress.totalXP, checkAchievements, progress.achievements.length]);

  // Get progress toward an achievement
  const getProgress = useCallback((achievement: Achievement): { current: number; target: number } | undefined => {
    const req = achievement.requirement;
    switch (req.type) {
      case 'deities_viewed':
        return { current: progress.deitiesViewed.length, target: req.count };
      case 'stories_read':
        return { current: progress.storiesRead.length, target: req.count };
      case 'pantheons_explored':
        return { current: progress.pantheonsExplored.length, target: req.count };
      case 'locations_visited':
        return { current: progress.locationsVisited.length, target: req.count };
      case 'quizzes_taken':
        return { current: Object.keys(progress.quizScores).length, target: req.count };
      case 'quiz_perfect_score':
        return { current: Object.values(progress.quizScores).filter(s => s === 100).length, target: req.count };
      case 'daily_streak':
        return { current: progress.dailyStreak, target: req.count };
      case 'total_xp':
        return { current: progress.totalXP, target: req.count };
      case 'all_pantheons':
        return { current: progress.pantheonsExplored.length, target: ALL_PANTHEON_IDS.length };
      default:
        return undefined;
    }
  }, [progress]);

  // Get all achievements with their status
  const getAchievementsWithStatus = useCallback((): AchievementWithStatus[] => {
    return achievements.map(achievement => ({
      ...achievement,
      unlocked: progress.achievements.includes(achievement.id),
      progress: getProgress(achievement),
    }));
  }, [progress.achievements, getProgress]);

  // Get recently unlocked achievements (for notifications)
  const getRecentlyUnlocked = useCallback((): Achievement[] => {
    return achievements.filter(a => progress.achievements.includes(a.id)).slice(-3);
  }, [progress.achievements]);

  return {
    achievements: getAchievementsWithStatus(),
    unlockedCount: progress.achievements.length,
    totalCount: achievements.length,
    checkAchievements,
    getRecentlyUnlocked,
  };
}
