/**
 * Branching Story Engine Types and Utilities
 *
 * This module provides the type definitions and helper functions for
 * creating and navigating choose-your-own-adventure mythology stories.
 */

export interface StoryChoice {
  text: string;
  nextNodeId: string;
  consequence?: string; // Brief description of what happens from this choice
}

export interface StoryEnding {
  type: 'good' | 'neutral' | 'tragic';
  summary: string;
}

export interface StoryNode {
  id: string;
  content: string; // Markdown content
  choices?: StoryChoice[];
  ending?: StoryEnding;
}

export interface BranchingStory {
  id: string;
  slug: string;
  title: string;
  description: string;
  pantheonId: string;
  protagonist: string;
  coverImage?: string;
  totalEndings: number;
  estimatedTime: string; // e.g., "5-10 min"
  nodes: Record<string, StoryNode>;
  startNodeId: string;
}

export interface StoryProgress {
  storyId: string;
  currentNodeId: string;
  pathTaken: string[];
  endingsDiscovered: string[];
  lastPlayed: string; // ISO date string
}

// Storage key prefix for localStorage
const STORY_PROGRESS_KEY = 'mythos-story-progress';
const STORY_ENDINGS_KEY = 'mythos-story-endings';

/**
 * Save story progress to localStorage
 */
export function saveStoryProgress(progress: StoryProgress): void {
  if (typeof window === 'undefined') return;

  try {
    const allProgress = getStoredProgress();
    allProgress[progress.storyId] = progress;
    localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Failed to save story progress:', error);
  }
}

/**
 * Get all stored story progress
 */
export function getStoredProgress(): Record<string, StoryProgress> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORY_PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Get progress for a specific story
 */
export function getStoryProgress(storyId: string): StoryProgress | null {
  const allProgress = getStoredProgress();
  return allProgress[storyId] || null;
}

/**
 * Clear progress for a specific story (for replay)
 */
export function clearStoryProgress(storyId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const allProgress = getStoredProgress();
    delete allProgress[storyId];
    localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Failed to clear story progress:', error);
  }
}

/**
 * Get all discovered endings for a story
 */
export function getDiscoveredEndings(storyId: string): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORY_ENDINGS_KEY);
    const allEndings: Record<string, string[]> = stored ? JSON.parse(stored) : {};
    return allEndings[storyId] || [];
  } catch {
    return [];
  }
}

/**
 * Save a discovered ending
 */
export function saveDiscoveredEnding(storyId: string, endingNodeId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORY_ENDINGS_KEY);
    const allEndings: Record<string, string[]> = stored ? JSON.parse(stored) : {};

    if (!allEndings[storyId]) {
      allEndings[storyId] = [];
    }

    if (!allEndings[storyId].includes(endingNodeId)) {
      allEndings[storyId].push(endingNodeId);
    }

    localStorage.setItem(STORY_ENDINGS_KEY, JSON.stringify(allEndings));
  } catch (error) {
    console.error('Failed to save ending:', error);
  }
}

/**
 * Get all ending nodes from a story
 */
export function getStoryEndings(story: BranchingStory): StoryNode[] {
  return Object.values(story.nodes).filter(node => node.ending);
}

/**
 * Calculate completion percentage for a story
 */
export function getStoryCompletionPercent(story: BranchingStory): number {
  const discoveredEndings = getDiscoveredEndings(story.id);
  const totalEndings = story.totalEndings;

  if (totalEndings === 0) return 0;
  return Math.round((discoveredEndings.length / totalEndings) * 100);
}

/**
 * Get the ending type color class
 */
export function getEndingTypeColor(type: StoryEnding['type']): string {
  switch (type) {
    case 'good':
      return 'text-green-400 border-green-500/30 bg-green-500/10';
    case 'neutral':
      return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    case 'tragic':
      return 'text-red-400 border-red-500/30 bg-red-500/10';
    default:
      return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
  }
}

/**
 * Get the ending type label
 */
export function getEndingTypeLabel(type: StoryEnding['type']): string {
  switch (type) {
    case 'good':
      return 'Triumphant Ending';
    case 'neutral':
      return 'Bittersweet Ending';
    case 'tragic':
      return 'Tragic Ending';
    default:
      return 'Ending';
  }
}
