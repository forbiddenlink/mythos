// Local interfaces matching the data structure

export interface Deity {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  alternateNames?: string[];
  gender?: "male" | "female" | "other";
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
  summary?: string;
  fullNarrative?: string;
  keyExcerpts?: string;
  category: string;
  moralThemes: string[];
  culturalSignificance?: string;
  imageUrl?: string;
}

export interface UserPreferences {
  viewedDeities: string[];
  readStories: string[];
  favoriteDomains: string[]; // inferred from viewed content
  favoritePantheons: string[]; // inferred from viewed content
}

/**
 * Extract user preferences from their viewing history
 */
export function extractUserPreferences(
  viewedDeities: string[],
  readStories: string[],
  allDeities: Deity[],
  allStories: Story[],
): UserPreferences {
  // Count domain occurrences from viewed deities
  const domainCounts: Record<string, number> = {};
  const pantheonCounts: Record<string, number> = {};

  // Analyze viewed deities
  for (const deityId of viewedDeities) {
    const deity = allDeities.find((d) => d.id === deityId);
    if (deity) {
      // Count domains
      for (const domain of deity.domain || []) {
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      }
      // Count pantheons
      if (deity.pantheonId) {
        pantheonCounts[deity.pantheonId] =
          (pantheonCounts[deity.pantheonId] || 0) + 1;
      }
    }
  }

  // Analyze read stories
  for (const storyId of readStories) {
    const story = allStories.find((s) => s.id === storyId);
    if (story?.pantheonId) {
      pantheonCounts[story.pantheonId] =
        (pantheonCounts[story.pantheonId] || 0) + 1;
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
 * Format pantheon ID to readable name
 */
function formatPantheonName(pantheonId: string): string {
  const names: Record<string, string> = {
    "greek-pantheon": "Greek",
    "norse-pantheon": "Norse",
    "egyptian-pantheon": "Egyptian",
    "roman-pantheon": "Roman",
    "hindu-pantheon": "Hindu",
    "japanese-pantheon": "Japanese",
    "celtic-pantheon": "Celtic",
    "mesopotamian-pantheon": "Mesopotamian",
  };
  return (
    names[pantheonId] ||
    pantheonId.replace("-pantheon", "").replaceAll("-", " ")
  );
}

// ============================================================================
// Learning Paths
// ============================================================================

export type LearningGoal =
  "pantheon-mastery" | "domain-expert" | "story-scholar" | "completionist";

export interface LearningPathStep {
  type: "deity" | "story" | "quiz";
  itemId: string;
  /** Page slug for deity steps (links resolve without a catalog lookup). */
  slug?: string;
  title: string;
  completed: boolean;
  /** Optional recall practice does not gate completion of a reading path. */
  required?: boolean;
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

/** Result from a goal-specific step builder */
interface StepBuilderResult {
  id: string;
  name: string;
  description: string;
  steps: LearningPathStep[];
  minutesPerStep: number;
  /** Override progress instead of computing from steps */
  progressOverride?: number;
  pantheonId?: string;
  domain?: string;
}

/** Compute progress & estimated time, then assemble a LearningPath */
export function isRequiredLearningPathStep(step: LearningPathStep): boolean {
  return step.required !== false;
}

export function getRequiredLearningPathSteps(
  steps: LearningPathStep[],
): LearningPathStep[] {
  return steps.filter(isRequiredLearningPathStep);
}

function computeStepProgress(steps: LearningPathStep[]): number {
  const requiredSteps = getRequiredLearningPathSteps(steps);
  if (requiredSteps.length === 0) return 0;
  return Math.round(
    (requiredSteps.filter((step) => step.completed).length /
      requiredSteps.length) *
      100,
  );
}

function finalizePath(
  result: StepBuilderResult,
  goal: LearningGoal,
): LearningPath {
  const { steps, minutesPerStep, progressOverride, ...rest } = result;
  const progress = progressOverride ?? computeStepProgress(steps);

  return {
    ...rest,
    steps,
    progress,
    estimatedTime: `${Math.ceil(steps.length * minutesPerStep)} minutes`,
    goal,
  };
}

function buildPantheonMasterySteps(
  prefs: UserPreferences,
  allDeities: Deity[],
  allStories: Story[],
  pantheonId: string,
): StepBuilderResult {
  const pantheonDeities = allDeities
    .filter((d) => d.pantheonId === pantheonId)
    .sort((a, b) => (a.importanceRank || 99) - (b.importanceRank || 99));
  const pantheonStories = allStories.filter((s) => s.pantheonId === pantheonId);

  const steps: LearningPathStep[] = [
    ...pantheonDeities.slice(0, 10).map((deity) => ({
      type: "deity" as const,
      itemId: deity.id,
      slug: deity.slug,
      title: `Learn about ${deity.name}`,
      completed: prefs.viewedDeities.includes(deity.id),
    })),
    ...pantheonStories.slice(0, 5).map((story) => ({
      type: "story" as const,
      itemId: story.id,
      title: `Read: ${story.title}`,
      completed: prefs.readStories.includes(story.id),
    })),
    {
      type: "quiz",
      itemId: `quiz-${pantheonId}`,
      title: `${formatPantheonName(pantheonId)} Mythology Quiz`,
      completed: false,
      required: false,
    },
  ];

  return {
    id: `pantheon-mastery-${pantheonId}`,
    name: `Master ${formatPantheonName(pantheonId)} Mythology`,
    description: `Explore the major deities and stories of the ${formatPantheonName(pantheonId)} pantheon, from creation myths to epic tales.`,
    steps,
    minutesPerStep: 5,
    pantheonId,
  };
}

function buildDomainExpertSteps(
  prefs: UserPreferences,
  allDeities: Deity[],
  domain: string,
): StepBuilderResult {
  const domainDeities = allDeities
    .filter((d) => d.domain?.includes(domain))
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

  const steps: LearningPathStep[] = [
    ...selectedDeities.map((deity) => ({
      type: "deity" as const,
      itemId: deity.id,
      slug: deity.slug,
      title: `Study ${deity.name} (${formatPantheonName(deity.pantheonId)})`,
      completed: prefs.viewedDeities.includes(deity.id),
    })),
    {
      type: "quiz",
      itemId: `quiz-domain-${domain}`,
      title: `${capitalizeFirst(domain)} Domain Quiz`,
      completed: false,
      required: false,
    },
  ];

  return {
    id: `domain-expert-${domain}`,
    name: `${capitalizeFirst(domain)} Gods Across Cultures`,
    description: `Discover how different cultures conceived of ${domain} deities, comparing their attributes and stories.`,
    steps,
    minutesPerStep: 5,
    domain,
  };
}

function buildStoryScholarSteps(
  prefs: UserPreferences,
  allStories: Story[],
): StepBuilderResult {
  const categories = [
    "creation",
    "war",
    "epic",
    "tragedy",
    "heroic",
    "transformation",
  ];
  const selectedStories: Story[] = [];

  for (const category of categories) {
    const categoryStories = allStories.filter((s) => s.category === category);
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

  const steps: LearningPathStep[] = [
    ...selectedStories.slice(0, 10).map((story) => ({
      type: "story" as const,
      itemId: story.id,
      title: story.title,
      completed: prefs.readStories.includes(story.id),
    })),
    {
      type: "quiz",
      itemId: "quiz-stories",
      title: "Mythology Stories Quiz",
      completed: false,
      required: false,
    },
  ];

  return {
    id: "story-scholar",
    name: "Tales of the Divine",
    description:
      "Journey through the greatest stories of mythology, from creation myths to heroic epics.",
    steps,
    minutesPerStep: 8,
  };
}

function buildCompletionistSteps(
  prefs: UserPreferences,
  allDeities: Deity[],
  allStories: Story[],
): StepBuilderResult {
  const unviewedDeities = allDeities.filter(
    (d) => !prefs.viewedDeities.includes(d.id),
  );
  const unreadStories = allStories.filter(
    (s) => !prefs.readStories.includes(s.id),
  );

  const sortedDeities = [...unviewedDeities]
    .sort((a, b) => (a.importanceRank || 99) - (b.importanceRank || 99))
    .slice(0, 12);

  const steps: LearningPathStep[] = [
    ...sortedDeities.map((deity) => ({
      type: "deity" as const,
      itemId: deity.id,
      slug: deity.slug,
      title: `Discover ${deity.name}`,
      completed: false,
    })),
    ...unreadStories.slice(0, 6).map((story) => ({
      type: "story" as const,
      itemId: story.id,
      title: story.title,
      completed: false,
    })),
    {
      type: "quiz",
      itemId: "quiz-comprehensive",
      title: "Comprehensive Mythology Quiz",
      completed: false,
      required: false,
    },
  ];

  const totalContent = allDeities.length + allStories.length;
  const viewedContent = prefs.viewedDeities.length + prefs.readStories.length;

  return {
    id: "completionist",
    name: "The Grand Journey",
    description: `Complete your mythology collection! You've discovered ${viewedContent} of ${totalContent} items.`,
    steps,
    minutesPerStep: 5,
    progressOverride: Math.round((viewedContent / totalContent) * 100),
  };
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
  },
): LearningPath {
  switch (goal) {
    case "pantheon-mastery": {
      const pantheonId =
        options?.pantheonId || prefs.favoritePantheons[0] || "greek-pantheon";
      return finalizePath(
        buildPantheonMasterySteps(prefs, allDeities, allStories, pantheonId),
        goal,
      );
    }
    case "domain-expert": {
      const domain = options?.domain || prefs.favoriteDomains[0] || "war";
      return finalizePath(
        buildDomainExpertSteps(prefs, allDeities, domain),
        goal,
      );
    }
    case "story-scholar":
      return finalizePath(buildStoryScholarSteps(prefs, allStories), goal);
    case "completionist":
      return finalizePath(
        buildCompletionistSteps(prefs, allDeities, allStories),
        goal,
      );
    default:
      return {
        id: "default",
        name: "Explore Mythology",
        description: "Start your mythological journey.",
        steps: [],
        progress: 0,
        estimatedTime: "0 minutes",
        goal: "completionist",
      };
  }
}

/**
 * Generate multiple learning paths based on user preferences
 */
export function generatePersonalizedPaths(
  prefs: UserPreferences,
  allDeities: Deity[],
  allStories: Story[],
): LearningPath[] {
  const paths: LearningPath[] = [];

  // Pantheon mastery path - use favorite or least explored
  const favoritePantheon = prefs.favoritePantheons[0];
  if (favoritePantheon) {
    paths.push(
      generateLearningPath(prefs, "pantheon-mastery", allDeities, allStories, {
        pantheonId: favoritePantheon,
      }),
    );
  } else {
    // Suggest Greek as a starting point for new users
    paths.push(
      generateLearningPath(prefs, "pantheon-mastery", allDeities, allStories, {
        pantheonId: "greek-pantheon",
      }),
    );
  }

  // Domain expert path
  const favoriteDomain = prefs.favoriteDomains[0];
  if (favoriteDomain) {
    paths.push(
      generateLearningPath(prefs, "domain-expert", allDeities, allStories, {
        domain: favoriteDomain,
      }),
    );
  } else {
    paths.push(
      generateLearningPath(prefs, "domain-expert", allDeities, allStories, {
        domain: "war",
      }),
    );
  }

  // Story scholar path
  paths.push(
    generateLearningPath(prefs, "story-scholar", allDeities, allStories),
  );

  // Completionist path (only if user has some progress)
  if (prefs.viewedDeities.length > 0 || prefs.readStories.length > 0) {
    paths.push(
      generateLearningPath(prefs, "completionist", allDeities, allStories),
    );
  }

  return paths;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
