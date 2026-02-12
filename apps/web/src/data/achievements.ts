export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  xp: number;
  category: 'exploration' | 'learning' | 'mastery' | 'dedication' | 'special';
  requirement: AchievementRequirement;
  tier: 'bronze' | 'silver' | 'gold' | 'mythic';
}

export type AchievementRequirement =
  | { type: 'deities_viewed'; count: number }
  | { type: 'stories_read'; count: number }
  | { type: 'pantheons_explored'; count: number }
  | { type: 'locations_visited'; count: number }
  | { type: 'quizzes_taken'; count: number }
  | { type: 'quiz_perfect_score'; count: number }
  | { type: 'daily_streak'; count: number }
  | { type: 'total_xp'; count: number }
  | { type: 'all_pantheons' }
  | { type: 'pantheon_complete'; pantheonId: string };

export const achievements: Achievement[] = [
  // Exploration - Deities
  {
    id: 'first_deity',
    name: 'Divine Encounter',
    description: 'View your first deity',
    icon: '👁️',
    xp: 10,
    category: 'exploration',
    requirement: { type: 'deities_viewed', count: 1 },
    tier: 'bronze',
  },
  {
    id: 'deity_explorer',
    name: 'Deity Explorer',
    description: 'View 10 different deities',
    icon: '🔍',
    xp: 25,
    category: 'exploration',
    requirement: { type: 'deities_viewed', count: 10 },
    tier: 'bronze',
  },
  {
    id: 'deity_scholar',
    name: 'Divine Scholar',
    description: 'View 50 different deities',
    icon: '📚',
    xp: 100,
    category: 'exploration',
    requirement: { type: 'deities_viewed', count: 50 },
    tier: 'silver',
  },
  {
    id: 'deity_master',
    name: 'Pantheon Master',
    description: 'View 100 different deities',
    icon: '👑',
    xp: 250,
    category: 'exploration',
    requirement: { type: 'deities_viewed', count: 100 },
    tier: 'gold',
  },

  // Exploration - Stories
  {
    id: 'first_story',
    name: 'Story Seeker',
    description: 'Read your first myth',
    icon: '📖',
    xp: 10,
    category: 'learning',
    requirement: { type: 'stories_read', count: 1 },
    tier: 'bronze',
  },
  {
    id: 'story_lover',
    name: 'Tale Collector',
    description: 'Read 10 different stories',
    icon: '📚',
    xp: 50,
    category: 'learning',
    requirement: { type: 'stories_read', count: 10 },
    tier: 'silver',
  },
  {
    id: 'story_master',
    name: 'Legendary Bard',
    description: 'Read 30 different stories',
    icon: '🎭',
    xp: 150,
    category: 'learning',
    requirement: { type: 'stories_read', count: 30 },
    tier: 'gold',
  },

  // Exploration - Pantheons
  {
    id: 'first_pantheon',
    name: 'Cultural Explorer',
    description: 'Explore your first pantheon',
    icon: '🏛️',
    xp: 15,
    category: 'exploration',
    requirement: { type: 'pantheons_explored', count: 1 },
    tier: 'bronze',
  },
  {
    id: 'world_traveler',
    name: 'World Traveler',
    description: 'Explore 6 different pantheons',
    icon: '🌍',
    xp: 75,
    category: 'exploration',
    requirement: { type: 'pantheons_explored', count: 6 },
    tier: 'silver',
  },
  {
    id: 'mythology_master',
    name: 'Mythology Master',
    description: 'Explore all 12 pantheons',
    icon: '🌟',
    xp: 200,
    category: 'mastery',
    requirement: { type: 'all_pantheons' },
    tier: 'mythic',
  },

  // Locations
  {
    id: 'first_location',
    name: 'Sacred Ground',
    description: 'Visit your first mythical location',
    icon: '📍',
    xp: 10,
    category: 'exploration',
    requirement: { type: 'locations_visited', count: 1 },
    tier: 'bronze',
  },
  {
    id: 'location_explorer',
    name: 'Realm Walker',
    description: 'Visit 20 mythical locations',
    icon: '🗺️',
    xp: 75,
    category: 'exploration',
    requirement: { type: 'locations_visited', count: 20 },
    tier: 'silver',
  },

  // Quizzes
  {
    id: 'first_quiz',
    name: 'Quiz Initiate',
    description: 'Complete your first quiz',
    icon: '❓',
    xp: 15,
    category: 'learning',
    requirement: { type: 'quizzes_taken', count: 1 },
    tier: 'bronze',
  },
  {
    id: 'quiz_enthusiast',
    name: 'Quiz Enthusiast',
    description: 'Complete 10 quizzes',
    icon: '🧠',
    xp: 75,
    category: 'learning',
    requirement: { type: 'quizzes_taken', count: 10 },
    tier: 'silver',
  },
  {
    id: 'perfect_score',
    name: 'Perfect Mind',
    description: 'Get a perfect score on a quiz',
    icon: '💯',
    xp: 50,
    category: 'mastery',
    requirement: { type: 'quiz_perfect_score', count: 1 },
    tier: 'silver',
  },
  {
    id: 'quiz_master',
    name: 'Quiz Champion',
    description: 'Get 5 perfect scores',
    icon: '🏆',
    xp: 150,
    category: 'mastery',
    requirement: { type: 'quiz_perfect_score', count: 5 },
    tier: 'gold',
  },

  // Streaks
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    xp: 25,
    category: 'dedication',
    requirement: { type: 'daily_streak', count: 3 },
    tier: 'bronze',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xp: 75,
    category: 'dedication',
    requirement: { type: 'daily_streak', count: 7 },
    tier: 'silver',
  },
  {
    id: 'streak_30',
    name: 'Monthly Devotee',
    description: 'Maintain a 30-day streak',
    icon: '⚡',
    xp: 300,
    category: 'dedication',
    requirement: { type: 'daily_streak', count: 30 },
    tier: 'gold',
  },
  {
    id: 'streak_100',
    name: 'Eternal Flame',
    description: 'Maintain a 100-day streak',
    icon: '🌟',
    xp: 1000,
    category: 'dedication',
    requirement: { type: 'daily_streak', count: 100 },
    tier: 'mythic',
  },

  // XP milestones
  {
    id: 'xp_100',
    name: 'Rising Star',
    description: 'Earn 100 XP',
    icon: '⭐',
    xp: 25,
    category: 'special',
    requirement: { type: 'total_xp', count: 100 },
    tier: 'bronze',
  },
  {
    id: 'xp_500',
    name: 'Ascending',
    description: 'Earn 500 XP',
    icon: '✨',
    xp: 50,
    category: 'special',
    requirement: { type: 'total_xp', count: 500 },
    tier: 'silver',
  },
  {
    id: 'xp_1000',
    name: 'Legendary',
    description: 'Earn 1000 XP',
    icon: '🌟',
    xp: 100,
    category: 'special',
    requirement: { type: 'total_xp', count: 1000 },
    tier: 'gold',
  },
];

export const tierColors = {
  bronze: { bg: 'bg-amber-900/20', border: 'border-amber-700/50', text: 'text-amber-500' },
  silver: { bg: 'bg-slate-400/20', border: 'border-slate-400/50', text: 'text-slate-300' },
  gold: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
  mythic: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400' },
};

export const categoryLabels = {
  exploration: 'Exploration',
  learning: 'Learning',
  mastery: 'Mastery',
  dedication: 'Dedication',
  special: 'Special',
};
