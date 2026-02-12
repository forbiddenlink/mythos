'use client';

import { useMemo } from 'react';
import { useProgress } from '@/hooks/use-progress';
import {
  extractUserPreferences,
  generateRecommendations,
  getDiscoveryRecommendations,
  getDailyDigest,
  findSimilarDeities,
  findRelatedStories,
  getPantheonSuggestions,
  getExplorationSuggestion,
  type Deity,
  type Story,
  type RecommendationResult,
  type DailyDigest,
  type PantheonSuggestion,
} from '@/lib/recommendations';
import deitiesData from '@/data/deities.json';
import storiesData from '@/data/stories.json';

const allDeities = deitiesData as Deity[];
const allStories = storiesData as Story[];

export interface UseRecommendationsResult {
  recommendations: RecommendationResult;
  dailyDigest: DailyDigest;
  pantheonSuggestions: PantheonSuggestion[];
  explorationSuggestion: PantheonSuggestion | null;
  getSimilarDeities: (deity: Deity, limit?: number) => Deity[];
  getRelatedStories: (story: Story, limit?: number) => Story[];
  hasHistory: boolean;
}

export function useRecommendations(): UseRecommendationsResult {
  const { progress } = useProgress();

  const hasHistory = useMemo(() => {
    return progress.deitiesViewed.length > 0 || progress.storiesRead.length > 0;
  }, [progress.deitiesViewed.length, progress.storiesRead.length]);

  const recommendations = useMemo(() => {
    if (!hasHistory) {
      return getDiscoveryRecommendations(allDeities, allStories);
    }

    const prefs = extractUserPreferences(
      progress.deitiesViewed,
      progress.storiesRead,
      allDeities,
      allStories
    );

    return generateRecommendations(prefs, allDeities, allStories);
  }, [progress.deitiesViewed, progress.storiesRead, hasHistory]);

  const dailyDigest = useMemo(() => {
    return getDailyDigest(allDeities, allStories);
  }, []);

  const pantheonSuggestions = useMemo(() => {
    return getPantheonSuggestions(progress.deitiesViewed, allDeities);
  }, [progress.deitiesViewed]);

  const explorationSuggestion = useMemo(() => {
    return getExplorationSuggestion(progress.deitiesViewed, allDeities);
  }, [progress.deitiesViewed]);

  const getSimilarDeities = useMemo(() => {
    return (deity: Deity, limit: number = 4) => {
      return findSimilarDeities(deity, allDeities, limit);
    };
  }, []);

  const getRelatedStories = useMemo(() => {
    return (story: Story, limit: number = 3) => {
      return findRelatedStories(story, allStories, limit);
    };
  }, []);

  return {
    recommendations,
    dailyDigest,
    pantheonSuggestions,
    explorationSuggestion,
    getSimilarDeities,
    getRelatedStories,
    hasHistory,
  };
}
