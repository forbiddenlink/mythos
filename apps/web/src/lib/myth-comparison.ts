/**
 * Myth Comparison Library
 *
 * Provides utilities for finding and comparing similar myths across cultures.
 */

// Story type definition
export interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
  fullNarrative?: string;
  keyExcerpts?: string;
  category: string;
  moralThemes: string[];
  culturalSignificance?: string;
  imageUrl?: string;
  citationSources?: Array<{
    title: string;
    author?: string;
    lines?: string;
    chapters?: string;
    type?: string;
    date?: string;
    spell?: string;
    spells?: string;
    book?: string;
  }>;
  variants?: Array<{
    source: string;
    difference: string;
    note?: string;
    date?: string;
  }>;
}

// Myth comparison result
export interface MythComparison {
  stories: Story[];
  commonThemes: string[];
  differences: ThemeDifference[];
  culturalContext: CulturalContext[];
  similarityScore: number;
}

export interface ThemeDifference {
  aspect: string;
  descriptions: { storyId: string; storyTitle: string; description: string }[];
}

export interface CulturalContext {
  storyId: string;
  storyTitle: string;
  pantheonId: string;
  significance: string;
}

// Myth categories for grouping similar stories
export type MythCategory =
  | 'creation'
  | 'flood'
  | 'underworld'
  | 'hero'
  | 'trickster'
  | 'war'
  | 'apocalypse'
  | 'cosmology'
  | 'tragedy'
  | 'afterlife'
  | 'epic'
  | 'myth';

// Theme mappings for finding similar myths
const THEME_GROUPS: Record<string, string[]> = {
  'creation': [
    'creation from chaos',
    'order from chaos',
    'divine craftsmanship',
    'creation through sacrifice',
    'cosmic order',
    'the origins of humanity'
  ],
  'flood': [
    'destruction and renewal',
    'divine punishment',
    'survival',
    'rebirth',
    'destruction and restoration'
  ],
  'underworld_journey': [
    'death and resurrection',
    'the afterlife',
    'death',
    'rebirth',
    'loss and grief',
    'forbidden knowledge'
  ],
  'hero_journey': [
    'heroism',
    'courage',
    'sacrifice',
    'destiny',
    'cleverness over brute force'
  ],
  'trickster': [
    'cunning',
    'deception',
    'perspective and truth',
    'transformation',
    'humility in perception'
  ],
  'divine_conflict': [
    'generational conflict',
    'divine succession',
    'justice',
    'power',
    'rightful succession'
  ]
};

// Predefined comparison sets
export interface PresetComparison {
  id: string;
  name: string;
  description: string;
  storyIds: string[];
  category: MythCategory;
}

export const PRESET_MYTH_COMPARISONS: PresetComparison[] = [
  {
    id: 'creation-myths',
    name: 'Creation Myths',
    description: 'Compare how different cultures explain the origin of the world',
    storyIds: ['creation-myth-norse', 'creation-heliopolis', 'pangu-creation', 'enuma-elish'],
    category: 'creation'
  },
  {
    id: 'creation-from-chaos',
    name: 'Order from Chaos',
    description: 'Myths where structured world emerges from primordial disorder',
    storyIds: ['creation-myth-norse', 'creation-heliopolis', 'separation-of-rangi-and-papa', 'yoruba-creation'],
    category: 'creation'
  },
  {
    id: 'underworld-journeys',
    name: 'Underworld Journeys',
    description: 'Heroes and gods who ventured into the realm of the dead',
    storyIds: ['orpheus-eurydice', 'izanagi-yomi', 'quetzalcoatl-mictlan', 'inanna-descent'],
    category: 'underworld'
  },
  {
    id: 'flood-myths',
    name: 'Flood Myths',
    description: 'Stories of great floods that destroyed and renewed the world',
    storyIds: ['flood-utnapishtim', 'ragnarok', 'nuwa-repairs-sky'],
    category: 'flood'
  },
  {
    id: 'hero-journeys',
    name: 'Hero Journeys',
    description: 'Epic tales of heroes overcoming great challenges',
    storyIds: ['perseus-medusa', 'theseus-minotaur', 'nezha-legend', 'hero-twins-popol-vuh'],
    category: 'hero'
  },
  {
    id: 'divine-wars',
    name: 'Divine Wars',
    description: 'Cosmic battles between gods for supremacy',
    storyIds: ['titanomachy', 'cath-maige-tuired', 'contendings', 'birth-huitzilopochtli'],
    category: 'war'
  },
  {
    id: 'trickster-tales',
    name: 'Trickster Tales',
    description: 'Stories featuring clever, boundary-crossing figures',
    storyIds: ['prometheus-fire', 'eshu-two-friends', 'maui-steals-fire', 'mead-of-poetry'],
    category: 'trickster'
  },
  {
    id: 'death-resurrection',
    name: 'Death and Resurrection',
    description: 'Myths about dying and rising deities or heroes',
    storyIds: ['osiris-myth', 'death-of-baldur', 'maize-god-rebirth', 'inanna-descent'],
    category: 'tragedy'
  },
  {
    id: 'solar-myths',
    name: 'Solar Myths',
    description: 'Stories about the sun and its journey',
    storyIds: ['ra-journey', 'amaterasu-cave', 'archer-yi', 'maui-slows-the-sun'],
    category: 'cosmology'
  },
  {
    id: 'afterlife-beliefs',
    name: 'Afterlife Journeys',
    description: 'Conceptions of what happens after death',
    storyIds: ['weighing-heart', 'book-of-dead-journey', 'aeneid', 'ragnarok'],
    category: 'afterlife'
  }
];

/**
 * Calculate similarity score between two stories based on themes and category
 */
function calculateSimilarity(story1: Story, story2: Story): number {
  let score = 0;

  // Category match (weight: 0.3)
  if (story1.category === story2.category) {
    score += 0.3;
  }

  // Theme overlap (weight: 0.5)
  const themes1 = new Set(story1.moralThemes.map(t => t.toLowerCase()));
  const themes2 = new Set(story2.moralThemes.map(t => t.toLowerCase()));

  let themeOverlap = 0;
  themes1.forEach(theme => {
    if (themes2.has(theme)) {
      themeOverlap++;
    }
  });

  const totalThemes = Math.max(themes1.size, themes2.size);
  if (totalThemes > 0) {
    score += 0.5 * (themeOverlap / totalThemes);
  }

  // Check theme group matches (weight: 0.2)
  let groupMatches = 0;
  for (const [, groupThemes] of Object.entries(THEME_GROUPS)) {
    const story1HasGroup = story1.moralThemes.some(t =>
      groupThemes.some(gt => t.toLowerCase().includes(gt.toLowerCase()))
    );
    const story2HasGroup = story2.moralThemes.some(t =>
      groupThemes.some(gt => t.toLowerCase().includes(gt.toLowerCase()))
    );
    if (story1HasGroup && story2HasGroup) {
      groupMatches++;
    }
  }

  if (groupMatches > 0) {
    score += 0.2 * Math.min(groupMatches / 2, 1);
  }

  return score;
}

/**
 * Find myths similar to a given story
 */
export function findSimilarMyths(
  story: Story,
  allStories: Story[],
  limit: number = 5
): Array<{ story: Story; similarity: number }> {
  const similarities: Array<{ story: Story; similarity: number }> = [];

  for (const otherStory of allStories) {
    if (otherStory.id === story.id) continue;

    const similarity = calculateSimilarity(story, otherStory);

    if (similarity > 0.2) { // Minimum threshold
      similarities.push({ story: otherStory, similarity });
    }
  }

  // Sort by similarity descending
  similarities.sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, limit);
}

/**
 * Get stories by category
 */
export function getStoriesByCategory(
  stories: Story[],
  category: MythCategory
): Story[] {
  return stories.filter(s => s.category === category);
}

/**
 * Compare multiple myth versions/similar stories
 */
export function compareMythVersions(
  storyIds: string[],
  allStories: Story[]
): MythComparison | null {
  // Get the stories to compare
  const stories = storyIds
    .map(id => allStories.find(s => s.id === id || s.slug === id))
    .filter((s): s is Story => s !== undefined);

  if (stories.length < 2) {
    return null;
  }

  // Find common themes
  const themeCounts = new Map<string, number>();
  stories.forEach(story => {
    story.moralThemes.forEach(theme => {
      const normalizedTheme = theme.toLowerCase();
      themeCounts.set(normalizedTheme, (themeCounts.get(normalizedTheme) || 0) + 1);
    });
  });

  const commonThemes = Array.from(themeCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([theme]) => theme.charAt(0).toUpperCase() + theme.slice(1));

  // Identify key differences
  const differences: ThemeDifference[] = [];

  // Compare categories
  const categoryDiff = getAspectDifference(stories, 'Category', s => s.category);
  if (categoryDiff) differences.push(categoryDiff);

  // Compare cultural origins
  const originDiff = getAspectDifference(stories, 'Cultural Origin', s =>
    formatPantheonName(s.pantheonId)
  );
  if (originDiff) differences.push(originDiff);

  // Compare outcomes/endings (from key excerpts)
  const outcomeDiff = getAspectDifference(stories, 'Key Elements', s =>
    s.keyExcerpts || s.summary
  );
  if (outcomeDiff) differences.push(outcomeDiff);

  // Extract cultural contexts
  const culturalContext: CulturalContext[] = stories.map(story => ({
    storyId: story.id,
    storyTitle: story.title,
    pantheonId: story.pantheonId,
    significance: story.culturalSignificance || 'Cultural significance not available.'
  }));

  // Calculate overall similarity score
  let totalSimilarity = 0;
  let comparisons = 0;
  for (let i = 0; i < stories.length; i++) {
    for (let j = i + 1; j < stories.length; j++) {
      totalSimilarity += calculateSimilarity(stories[i], stories[j]);
      comparisons++;
    }
  }
  const similarityScore = comparisons > 0 ? totalSimilarity / comparisons : 0;

  return {
    stories,
    commonThemes,
    differences,
    culturalContext,
    similarityScore
  };
}

/**
 * Helper to extract differences for a specific aspect
 */
function getAspectDifference(
  stories: Story[],
  aspect: string,
  extractor: (s: Story) => string
): ThemeDifference | null {
  const descriptions = stories.map(story => ({
    storyId: story.id,
    storyTitle: story.title,
    description: extractor(story)
  }));

  // Check if all descriptions are the same
  const uniqueDescriptions = new Set(descriptions.map(d => d.description));
  if (uniqueDescriptions.size <= 1) {
    return null;
  }

  return { aspect, descriptions };
}

/**
 * Format pantheon ID to readable name
 */
function formatPantheonName(pantheonId: string): string {
  return pantheonId
    .replace('-pantheon', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get unique themes across all stories in a comparison
 */
export function getUniqueThemes(stories: Story[]): string[] {
  const themes = new Set<string>();
  stories.forEach(story => {
    story.moralThemes.forEach(theme => themes.add(theme.toLowerCase()));
  });
  return Array.from(themes).map(t => t.charAt(0).toUpperCase() + t.slice(1));
}

/**
 * Check if a theme is shared between multiple stories
 */
export function isSharedTheme(theme: string, stories: Story[]): boolean {
  const normalizedTheme = theme.toLowerCase();
  let count = 0;
  for (const story of stories) {
    if (story.moralThemes.some(t => t.toLowerCase() === normalizedTheme)) {
      count++;
      if (count >= 2) return true;
    }
  }
  return false;
}

/**
 * Get stories by theme
 */
export function getStoriesByTheme(
  stories: Story[],
  theme: string
): Story[] {
  const normalizedTheme = theme.toLowerCase();
  return stories.filter(story =>
    story.moralThemes.some(t => t.toLowerCase().includes(normalizedTheme))
  );
}

/**
 * Get all available categories from stories
 */
export function getAvailableCategories(stories: Story[]): string[] {
  const categories = new Set<string>();
  stories.forEach(story => categories.add(story.category));
  return Array.from(categories).sort();
}

/**
 * Search stories by title, theme, or content
 */
export function searchStories(
  stories: Story[],
  query: string
): Story[] {
  const normalizedQuery = query.toLowerCase();

  return stories.filter(story =>
    story.title.toLowerCase().includes(normalizedQuery) ||
    story.summary.toLowerCase().includes(normalizedQuery) ||
    story.moralThemes.some(t => t.toLowerCase().includes(normalizedQuery)) ||
    story.category.toLowerCase().includes(normalizedQuery)
  );
}
