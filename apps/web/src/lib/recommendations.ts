// Local interfaces matching the data structure
export interface Deity {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  alternateNames?: string[];
  gender?: 'male' | 'female' | 'other';
  domain: string[];
  symbols?: string[];
  description?: string;
  detailedBio?: string;
  originStory?: string;
  importanceRank?: number;
  imageUrl?: string;
  crossPantheonParallels?: Array<{
    pantheonId: string;
    deityId: string;
    note: string;
  }>;
  primarySources?: Array<{
    text: string;
    source: string;
    date?: string;
  }>;
}

export interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
  fullNarrative: string;
  keyExcerpts: string;
  category: string;
  moralThemes: string[];
  culturalSignificance: string;
  imageUrl?: string;
}

export interface UserPreferences {
  viewedDeities: string[];
  readStories: string[];
  favoriteDomains: string[]; // inferred from viewed content
  favoritePantheons: string[]; // inferred from viewed content
}

export interface RecommendationResult {
  deities: Deity[];
  stories: Story[];
  reason: string;
}

export interface DailyDigest {
  deity: Deity | null;
  story: Story | null;
  date: string;
}

export interface SimilarContentResult {
  deities: Deity[];
  stories: Story[];
}

export interface PantheonSuggestion {
  pantheonId: string;
  pantheonName: string;
  unviewedCount: number;
  totalCount: number;
  suggestion: string;
}

/**
 * Extract user preferences from their viewing history
 */
export function extractUserPreferences(
  viewedDeities: string[],
  readStories: string[],
  allDeities: Deity[],
  allStories: Story[]
): UserPreferences {
  // Count domain occurrences from viewed deities
  const domainCounts: Record<string, number> = {};
  const pantheonCounts: Record<string, number> = {};

  // Analyze viewed deities
  for (const deityId of viewedDeities) {
    const deity = allDeities.find(d => d.id === deityId);
    if (deity) {
      // Count domains
      for (const domain of deity.domain || []) {
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      }
      // Count pantheons
      if (deity.pantheonId) {
        pantheonCounts[deity.pantheonId] = (pantheonCounts[deity.pantheonId] || 0) + 1;
      }
    }
  }

  // Analyze read stories
  for (const storyId of readStories) {
    const story = allStories.find(s => s.id === storyId);
    if (story?.pantheonId) {
      pantheonCounts[story.pantheonId] = (pantheonCounts[story.pantheonId] || 0) + 1;
    }
  }

  // Get top domains (at least 2 occurrences or top 5)
  const favoriteDomains = Object.entries(domainCounts)
    .filter(([, count]) => count >= 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([domain]) => domain);

  // Get top pantheons
  const favoritePantheons = Object.entries(pantheonCounts)
    .filter(([, count]) => count >= 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([pantheon]) => pantheon);

  return {
    viewedDeities,
    readStories,
    favoriteDomains,
    favoritePantheons,
  };
}

/**
 * Score a deity based on user preferences
 */
function scoreDeity(deity: Deity, prefs: UserPreferences): number {
  let score = 0;

  // Boost for matching domains
  for (const domain of deity.domain || []) {
    if (prefs.favoriteDomains.includes(domain)) {
      score += 3;
    }
  }

  // Boost for matching pantheon
  if (deity.pantheonId && prefs.favoritePantheons.includes(deity.pantheonId)) {
    score += 2;
  }

  // Higher importance rank = higher base score
  if (deity.importanceRank) {
    score += Math.max(0, 6 - deity.importanceRank);
  }

  return score;
}

/**
 * Score a story based on user preferences
 */
function scoreStory(story: Story, prefs: UserPreferences): number {
  let score = 0;

  // Boost for matching pantheon
  if (story.pantheonId && prefs.favoritePantheons.includes(story.pantheonId)) {
    score += 3;
  }

  // Boost for popular categories
  const popularCategories = ['creation', 'war', 'epic', 'tragedy'];
  if (popularCategories.includes(story.category)) {
    score += 1;
  }

  return score;
}

/**
 * Generate personalized recommendations based on user preferences
 */
export function generateRecommendations(
  prefs: UserPreferences,
  allDeities: Deity[],
  allStories: Story[]
): RecommendationResult {
  // Filter out already viewed content
  const unviewedDeities = allDeities.filter(d => !prefs.viewedDeities.includes(d.id));
  const unreadStories = allStories.filter(s => !prefs.readStories.includes(s.id));

  // Score and sort deities
  const scoredDeities = unviewedDeities
    .map(deity => ({ deity, score: scoreDeity(deity, prefs) }))
    .sort((a, b) => b.score - a.score);

  // Score and sort stories
  const scoredStories = unreadStories
    .map(story => ({ story, score: scoreStory(story, prefs) }))
    .sort((a, b) => b.score - a.score);

  // Get top 5 deities and top 3 stories
  const recommendedDeities = scoredDeities.slice(0, 5).map(s => s.deity);
  const recommendedStories = scoredStories.slice(0, 3).map(s => s.story);

  // Generate reason based on preferences
  let reason = '';
  if (prefs.favoriteDomains.length > 0 && prefs.favoritePantheons.length > 0) {
    const domainStr = prefs.favoriteDomains.slice(0, 2).join(' and ');
    reason = `Based on your interest in ${domainStr} deities`;
  } else if (prefs.favoritePantheons.length > 0) {
    const pantheonName = formatPantheonName(prefs.favoritePantheons[0]);
    reason = `Since you enjoy ${pantheonName} mythology`;
  } else if (prefs.favoriteDomains.length > 0) {
    reason = `Based on your interest in ${prefs.favoriteDomains[0]} deities`;
  } else {
    reason = 'Discover these fascinating myths';
  }

  return {
    deities: recommendedDeities,
    stories: recommendedStories,
    reason,
  };
}

/**
 * Get daily digest - one deity and one story per day
 * Uses date as seed for consistent daily selection
 */
export function getDailyDigest(
  allDeities: Deity[],
  allStories: Story[],
  dateString?: string
): DailyDigest {
  const date = dateString || new Date().toISOString().split('T')[0];

  // Create a simple hash from date for pseudo-random but consistent selection
  const dateHash = date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Select deity based on date
  const deityIndex = dateHash % allDeities.length;
  const deity = allDeities[deityIndex] || null;

  // Select story based on date (use different offset)
  const storyIndex = (dateHash + 17) % allStories.length;
  const story = allStories[storyIndex] || null;

  return {
    deity,
    story,
    date,
  };
}

/**
 * Find similar deities based on domain overlap
 */
export function findSimilarDeities(
  currentDeity: Deity,
  allDeities: Deity[],
  limit: number = 4
): Deity[] {
  const otherDeities = allDeities.filter(d => d.id !== currentDeity.id);

  const scored = otherDeities.map(deity => {
    let score = 0;

    // Domain overlap
    const domainOverlap = (deity.domain || []).filter(
      d => (currentDeity.domain || []).includes(d)
    ).length;
    score += domainOverlap * 3;

    // Same pantheon bonus
    if (deity.pantheonId === currentDeity.pantheonId) {
      score += 2;
    }

    // Cross-pantheon parallel bonus
    if (currentDeity.crossPantheonParallels?.some(p => p.deityId === deity.id)) {
      score += 5;
    }

    return { deity, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.deity);
}

/**
 * Find related stories based on pantheon and themes
 */
export function findRelatedStories(
  currentStory: Story,
  allStories: Story[],
  limit: number = 3
): Story[] {
  const otherStories = allStories.filter(s => s.id !== currentStory.id);

  const scored = otherStories.map(story => {
    let score = 0;

    // Same pantheon bonus
    if (story.pantheonId === currentStory.pantheonId) {
      score += 3;
    }

    // Same category bonus
    if (story.category === currentStory.category) {
      score += 2;
    }

    // Theme overlap
    const themeOverlap = (story.moralThemes || []).filter(
      t => (currentStory.moralThemes || []).includes(t)
    ).length;
    score += themeOverlap * 1;

    return { story, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.story);
}

/**
 * Get pantheon completion suggestions
 */
export function getPantheonSuggestions(
  viewedDeities: string[],
  allDeities: Deity[]
): PantheonSuggestion[] {
  // Group deities by pantheon
  const pantheonGroups: Record<string, Deity[]> = {};
  for (const deity of allDeities) {
    if (deity.pantheonId) {
      if (!pantheonGroups[deity.pantheonId]) {
        pantheonGroups[deity.pantheonId] = [];
      }
      pantheonGroups[deity.pantheonId].push(deity);
    }
  }

  const suggestions: PantheonSuggestion[] = [];

  for (const [pantheonId, deities] of Object.entries(pantheonGroups)) {
    const viewedInPantheon = deities.filter(d => viewedDeities.includes(d.id));
    const unviewedCount = deities.length - viewedInPantheon.length;

    if (unviewedCount > 0 && viewedInPantheon.length > 0) {
      const percentage = Math.round((viewedInPantheon.length / deities.length) * 100);
      suggestions.push({
        pantheonId,
        pantheonName: formatPantheonName(pantheonId),
        unviewedCount,
        totalCount: deities.length,
        suggestion: percentage >= 50
          ? `Complete your ${formatPantheonName(pantheonId)} knowledge (${percentage}% explored)`
          : `Continue exploring ${formatPantheonName(pantheonId)} mythology`,
      });
    } else if (unviewedCount === deities.length) {
      suggestions.push({
        pantheonId,
        pantheonName: formatPantheonName(pantheonId),
        unviewedCount,
        totalCount: deities.length,
        suggestion: `Discover ${formatPantheonName(pantheonId)} mythology`,
      });
    }
  }

  // Sort by progress (most progress first, then by total count)
  return suggestions.sort((a, b) => {
    const aProgress = (a.totalCount - a.unviewedCount) / a.totalCount;
    const bProgress = (b.totalCount - b.unviewedCount) / b.totalCount;
    if (aProgress !== bProgress) {
      return bProgress - aProgress;
    }
    return b.totalCount - a.totalCount;
  });
}

/**
 * Get exploration suggestion for least-explored pantheon
 */
export function getExplorationSuggestion(
  viewedDeities: string[],
  allDeities: Deity[]
): PantheonSuggestion | null {
  const suggestions = getPantheonSuggestions(viewedDeities, allDeities);

  // Find pantheon with least exploration (but some content)
  const leastExplored = suggestions
    .filter(s => s.unviewedCount > 0)
    .sort((a, b) => {
      const aExplored = (a.totalCount - a.unviewedCount) / a.totalCount;
      const bExplored = (b.totalCount - b.unviewedCount) / b.totalCount;
      return aExplored - bExplored;
    })[0];

  return leastExplored || null;
}

/**
 * Format pantheon ID to readable name
 */
function formatPantheonName(pantheonId: string): string {
  const names: Record<string, string> = {
    'greek-pantheon': 'Greek',
    'norse-pantheon': 'Norse',
    'egyptian-pantheon': 'Egyptian',
    'roman-pantheon': 'Roman',
    'hindu-pantheon': 'Hindu',
    'japanese-pantheon': 'Japanese',
    'celtic-pantheon': 'Celtic',
    'mesopotamian-pantheon': 'Mesopotamian',
  };
  return names[pantheonId] || pantheonId.replace('-pantheon', '').replace(/-/g, ' ');
}

/**
 * Get random recommendations for new users with no history
 */
export function getDiscoveryRecommendations(
  allDeities: Deity[],
  allStories: Story[]
): RecommendationResult {
  // For new users, recommend high-importance deities from different pantheons
  const pantheonDeities: Record<string, Deity[]> = {};

  for (const deity of allDeities) {
    if (deity.pantheonId) {
      if (!pantheonDeities[deity.pantheonId]) {
        pantheonDeities[deity.pantheonId] = [];
      }
      pantheonDeities[deity.pantheonId].push(deity);
    }
  }

  // Get top deity from each pantheon
  const recommendedDeities: Deity[] = [];
  for (const deities of Object.values(pantheonDeities)) {
    const sorted = [...deities].sort((a, b) => (a.importanceRank || 99) - (b.importanceRank || 99));
    if (sorted[0]) {
      recommendedDeities.push(sorted[0]);
    }
  }

  // Get diverse stories
  const storyCategories = ['creation', 'war', 'epic'];
  const recommendedStories: Story[] = [];
  for (const category of storyCategories) {
    const story = allStories.find(s => s.category === category);
    if (story) {
      recommendedStories.push(story);
    }
  }

  return {
    deities: recommendedDeities.slice(0, 5),
    stories: recommendedStories.slice(0, 3),
    reason: 'Start your mythological journey',
  };
}

// ============================================================================
// Learning Paths
// ============================================================================

export type LearningGoal = 'pantheon-mastery' | 'domain-expert' | 'story-scholar' | 'completionist';

export interface LearningPathStep {
  type: 'deity' | 'story' | 'quiz';
  itemId: string;
  title: string;
  completed: boolean;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  steps: LearningPathStep[];
  progress: number; // 0-100
  estimatedTime: string; // e.g., "2 hours"
  goal: LearningGoal;
  pantheonId?: string; // For pantheon-mastery paths
  domain?: string; // For domain-expert paths
}

/**
 * Generate a learning path based on user preferences and a specific goal
 */
export function generateLearningPath(
  prefs: UserPreferences,
  goal: LearningGoal,
  allDeities: Deity[],
  allStories: Story[],
  options?: {
    pantheonId?: string;
    domain?: string;
  }
): LearningPath {
  const steps: LearningPathStep[] = [];

  switch (goal) {
    case 'pantheon-mastery': {
      const pantheonId = options?.pantheonId || prefs.favoritePantheons[0] || 'greek-pantheon';
      const pantheonDeities = allDeities
        .filter(d => d.pantheonId === pantheonId)
        .sort((a, b) => (a.importanceRank || 99) - (b.importanceRank || 99));
      const pantheonStories = allStories.filter(s => s.pantheonId === pantheonId);

      // Add deities in order of importance
      for (const deity of pantheonDeities.slice(0, 10)) {
        steps.push({
          type: 'deity',
          itemId: deity.id,
          title: `Learn about ${deity.name}`,
          completed: prefs.viewedDeities.includes(deity.id),
        });
      }

      // Add stories
      for (const story of pantheonStories.slice(0, 5)) {
        steps.push({
          type: 'story',
          itemId: story.id,
          title: `Read: ${story.title}`,
          completed: prefs.readStories.includes(story.id),
        });
      }

      // Add quiz at the end
      steps.push({
        type: 'quiz',
        itemId: `quiz-${pantheonId}`,
        title: `${formatPantheonName(pantheonId)} Mythology Quiz`,
        completed: false, // Quizzes are tracked separately
      });

      const completedCount = steps.filter(s => s.completed).length;
      const progress = Math.round((completedCount / steps.length) * 100);

      return {
        id: `pantheon-mastery-${pantheonId}`,
        name: `Master ${formatPantheonName(pantheonId)} Mythology`,
        description: `Explore the major deities and stories of the ${formatPantheonName(pantheonId)} pantheon, from creation myths to epic tales.`,
        steps,
        progress,
        estimatedTime: `${Math.ceil(steps.length * 5)} minutes`,
        goal,
        pantheonId,
      };
    }

    case 'domain-expert': {
      const domain = options?.domain || prefs.favoriteDomains[0] || 'war';
      const domainDeities = allDeities
        .filter(d => d.domain?.includes(domain))
        .sort((a, b) => (a.importanceRank || 99) - (b.importanceRank || 99));

      // Get deities from different pantheons for comparative study
      const uniquePantheons = new Set<string>();
      const selectedDeities: Deity[] = [];
      for (const deity of domainDeities) {
        if (selectedDeities.length >= 8) break;
        if (!uniquePantheons.has(deity.pantheonId)) {
          selectedDeities.push(deity);
          uniquePantheons.add(deity.pantheonId);
        }
      }
      // Fill remaining slots with more deities
      for (const deity of domainDeities) {
        if (selectedDeities.length >= 8) break;
        if (!selectedDeities.includes(deity)) {
          selectedDeities.push(deity);
        }
      }

      for (const deity of selectedDeities) {
        steps.push({
          type: 'deity',
          itemId: deity.id,
          title: `Study ${deity.name} (${formatPantheonName(deity.pantheonId)})`,
          completed: prefs.viewedDeities.includes(deity.id),
        });
      }

      // Add quiz at the end
      steps.push({
        type: 'quiz',
        itemId: `quiz-domain-${domain}`,
        title: `${capitalizeFirst(domain)} Domain Quiz`,
        completed: false,
      });

      const completedCount = steps.filter(s => s.completed).length;
      const progress = Math.round((completedCount / steps.length) * 100);

      return {
        id: `domain-expert-${domain}`,
        name: `${capitalizeFirst(domain)} Gods Across Cultures`,
        description: `Discover how different cultures conceived of ${domain} deities, comparing their attributes and stories.`,
        steps,
        progress,
        estimatedTime: `${Math.ceil(steps.length * 5)} minutes`,
        goal,
        domain,
      };
    }

    case 'story-scholar': {
      // Group stories by category and pick diverse ones
      const categories = ['creation', 'war', 'epic', 'tragedy', 'heroic', 'transformation'];
      const selectedStories: Story[] = [];

      for (const category of categories) {
        const categoryStories = allStories.filter(s => s.category === category);
        if (categoryStories.length > 0) {
          selectedStories.push(categoryStories[0]);
          if (categoryStories.length > 1) {
            selectedStories.push(categoryStories[1]);
          }
        }
      }

      // Ensure we have at least some stories
      if (selectedStories.length < 6) {
        for (const story of allStories) {
          if (selectedStories.length >= 10) break;
          if (!selectedStories.includes(story)) {
            selectedStories.push(story);
          }
        }
      }

      for (const story of selectedStories.slice(0, 10)) {
        steps.push({
          type: 'story',
          itemId: story.id,
          title: story.title,
          completed: prefs.readStories.includes(story.id),
        });
      }

      // Add quiz at the end
      steps.push({
        type: 'quiz',
        itemId: 'quiz-stories',
        title: 'Mythology Stories Quiz',
        completed: false,
      });

      const completedCount = steps.filter(s => s.completed).length;
      const progress = Math.round((completedCount / steps.length) * 100);

      return {
        id: 'story-scholar',
        name: 'Tales of the Divine',
        description: 'Journey through the greatest stories of mythology, from creation myths to heroic epics.',
        steps,
        progress,
        estimatedTime: `${Math.ceil(steps.length * 8)} minutes`,
        goal,
      };
    }

    case 'completionist': {
      // Mix of everything, focusing on unviewed content first
      const unviewedDeities = allDeities.filter(d => !prefs.viewedDeities.includes(d.id));
      const unreadStories = allStories.filter(s => !prefs.readStories.includes(s.id));

      // Sort by importance and take top deities
      const sortedDeities = [...unviewedDeities]
        .sort((a, b) => (a.importanceRank || 99) - (b.importanceRank || 99))
        .slice(0, 12);

      for (const deity of sortedDeities) {
        steps.push({
          type: 'deity',
          itemId: deity.id,
          title: `Discover ${deity.name}`,
          completed: false,
        });
      }

      for (const story of unreadStories.slice(0, 6)) {
        steps.push({
          type: 'story',
          itemId: story.id,
          title: story.title,
          completed: false,
        });
      }

      steps.push({
        type: 'quiz',
        itemId: 'quiz-comprehensive',
        title: 'Comprehensive Mythology Quiz',
        completed: false,
      });

      const totalContent = allDeities.length + allStories.length;
      const viewedContent = prefs.viewedDeities.length + prefs.readStories.length;
      const progress = Math.round((viewedContent / totalContent) * 100);

      return {
        id: 'completionist',
        name: 'The Grand Journey',
        description: `Complete your mythology collection! You've discovered ${viewedContent} of ${totalContent} items.`,
        steps,
        progress,
        estimatedTime: `${Math.ceil(steps.length * 5)} minutes`,
        goal,
      };
    }

    default:
      return {
        id: 'default',
        name: 'Explore Mythology',
        description: 'Start your mythological journey.',
        steps: [],
        progress: 0,
        estimatedTime: '0 minutes',
        goal: 'completionist',
      };
  }
}

/**
 * Generate multiple learning paths based on user preferences
 */
export function generatePersonalizedPaths(
  prefs: UserPreferences,
  allDeities: Deity[],
  allStories: Story[]
): LearningPath[] {
  const paths: LearningPath[] = [];

  // Pantheon mastery path - use favorite or least explored
  const favoritePantheon = prefs.favoritePantheons[0];
  if (favoritePantheon) {
    paths.push(generateLearningPath(prefs, 'pantheon-mastery', allDeities, allStories, {
      pantheonId: favoritePantheon,
    }));
  } else {
    // Suggest Greek as a starting point for new users
    paths.push(generateLearningPath(prefs, 'pantheon-mastery', allDeities, allStories, {
      pantheonId: 'greek-pantheon',
    }));
  }

  // Domain expert path
  const favoriteDomain = prefs.favoriteDomains[0];
  if (favoriteDomain) {
    paths.push(generateLearningPath(prefs, 'domain-expert', allDeities, allStories, {
      domain: favoriteDomain,
    }));
  } else {
    paths.push(generateLearningPath(prefs, 'domain-expert', allDeities, allStories, {
      domain: 'war',
    }));
  }

  // Story scholar path
  paths.push(generateLearningPath(prefs, 'story-scholar', allDeities, allStories));

  // Completionist path (only if user has some progress)
  if (prefs.viewedDeities.length > 0 || prefs.readStories.length > 0) {
    paths.push(generateLearningPath(prefs, 'completionist', allDeities, allStories));
  }

  return paths;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
