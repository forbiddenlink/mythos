/**
 * Story Timeline Utilities
 *
 * Maps mythological stories to eras and builds chronological timelines
 * for visualization of mythological narratives.
 */

export type MythologicalEra =
  | "primordial" // Before creation, chaos, void
  | "creation" // World creation, first gods/beings
  | "golden-age" // Age of titans/first rulers, paradise
  | "heroic" // Age of heroes, demigods, great adventures
  | "decline"; // Fall of gods, apocalypse, endings

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  era: MythologicalEra;
  pantheon: string;
  pantheonName: string;
  order: number; // Order within era (0-100)
  relatedStories: string[];
  category: string;
  slug: string;
}

export interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
  category?: string;
  moralThemes?: string[];
}

export interface Pantheon {
  id: string;
  name: string;
  slug: string;
}

// Era metadata for display
export const ERA_METADATA: Record<
  MythologicalEra,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    order: number;
  }
> = {
  primordial: {
    label: "Primordial Age",
    description: "The time before creation, when chaos and void reigned",
    color: "text-patina",
    bgColor: "bg-patina/20",
    borderColor: "border-patina/40",
    order: 0,
  },
  creation: {
    label: "Creation Era",
    description: "The birth of the cosmos, gods, and first beings",
    color: "text-gold",
    bgColor: "bg-gold/20",
    borderColor: "border-gold/40",
    order: 1,
  },
  "golden-age": {
    label: "Golden Age",
    description: "The reign of elder gods and the age of paradise",
    color: "text-gold",
    bgColor: "bg-gold/15",
    borderColor: "border-gold/35",
    order: 2,
  },
  heroic: {
    label: "Heroic Age",
    description: "The time of heroes, demigods, and great adventures",
    color: "text-bronze",
    bgColor: "bg-bronze/20",
    borderColor: "border-bronze/40",
    order: 3,
  },
  decline: {
    label: "Age of Decline",
    description: "The twilight of the gods, apocalypse, and endings",
    color: "text-destructive",
    bgColor: "bg-destructive/15",
    borderColor: "border-destructive/35",
    order: 4,
  },
};

// Story to era mappings based on content and category
const STORY_ERA_MAPPINGS: Record<
  string,
  { era: MythologicalEra; order: number }
> = {
  // Norse
  "creation-myth-norse": { era: "creation", order: 10 },
  yggdrasil: { era: "creation", order: 20 },
  "binding-of-fenrir": { era: "golden-age", order: 50 },
  "death-of-baldur": { era: "decline", order: 60 },
  ragnarok: { era: "decline", order: 100 },

  // Greek
  titanomachy: { era: "primordial", order: 80 },

  // Egyptian
  "creation-heliopolis": { era: "creation", order: 10 },
  "osiris-myth": { era: "golden-age", order: 40 },
  "ra-journey": { era: "golden-age", order: 30 },
  contendings: { era: "heroic", order: 50 },
  "weighing-heart": { era: "golden-age", order: 60 },

  // Roman
  aeneid: { era: "heroic", order: 70 },
  "romulus-remus": { era: "heroic", order: 80 },
};

// Default era mappings by category
const CATEGORY_ERA_DEFAULTS: Record<
  string,
  { era: MythologicalEra; order: number }
> = {
  creation: { era: "creation", order: 50 },
  cosmology: { era: "creation", order: 40 },
  primordial: { era: "primordial", order: 50 },
  war: { era: "heroic", order: 60 },
  hero: { era: "heroic", order: 50 },
  epic: { era: "heroic", order: 55 },
  tragedy: { era: "heroic", order: 70 },
  romance: { era: "heroic", order: 45 },
  myth: { era: "golden-age", order: 50 },
  afterlife: { era: "golden-age", order: 80 },
  apocalypse: { era: "decline", order: 90 },
  decline: { era: "decline", order: 70 },
};

/**
 * Determines the mythological era for a story based on its content and category
 */
export function getStoryEra(story: Story): {
  era: MythologicalEra;
  order: number;
} {
  // Check explicit mapping first
  if (STORY_ERA_MAPPINGS[story.id]) {
    return STORY_ERA_MAPPINGS[story.id];
  }

  // Check category defaults
  if (story.category && CATEGORY_ERA_DEFAULTS[story.category]) {
    return CATEGORY_ERA_DEFAULTS[story.category];
  }

  // Analyze story content for era indicators
  const summary = story.summary.toLowerCase();
  const title = story.title.toLowerCase();

  // Primordial indicators
  if (
    summary.includes("before creation") ||
    summary.includes("primordial") ||
    summary.includes("chaos") ||
    summary.includes("void") ||
    title.includes("primordial")
  ) {
    return { era: "primordial", order: 50 };
  }

  // Creation indicators
  if (
    summary.includes("creation") ||
    summary.includes("first") ||
    summary.includes("beginning") ||
    summary.includes("origin") ||
    title.includes("creation") ||
    title.includes("origin")
  ) {
    return { era: "creation", order: 50 };
  }

  // Decline/apocalypse indicators
  if (
    summary.includes("end of") ||
    summary.includes("twilight") ||
    summary.includes("apocalypse") ||
    summary.includes("ragnarok") ||
    summary.includes("destruction") ||
    title.includes("end") ||
    title.includes("twilight") ||
    title.includes("ragnarok")
  ) {
    return { era: "decline", order: 70 };
  }

  // Hero indicators
  if (
    summary.includes("hero") ||
    summary.includes("warrior") ||
    summary.includes("battle") ||
    summary.includes("quest") ||
    summary.includes("adventure")
  ) {
    return { era: "heroic", order: 50 };
  }

  // Default to golden age
  return { era: "golden-age", order: 50 };
}

/**
 * Builds a chronological timeline of mythological events from stories
 */
export function buildMythTimeline(
  stories: Story[],
  pantheons: Pantheon[],
  pantheonFilter?: string,
): TimelineEvent[] {
  const pantheonMap = new Map(pantheons.map((p) => [p.id, p.name]));

  // Filter by pantheon if specified
  let filteredStories = stories;
  if (pantheonFilter && pantheonFilter !== "all") {
    filteredStories = stories.filter((s) => s.pantheonId === pantheonFilter);
  }

  // Convert stories to timeline events
  const events: TimelineEvent[] = filteredStories.map((story) => {
    const { era, order } = getStoryEra(story);

    return {
      id: story.id,
      title: story.title,
      description: story.summary,
      era,
      pantheon: story.pantheonId,
      pantheonName: pantheonMap.get(story.pantheonId) || story.pantheonId,
      order,
      relatedStories: [], // Could be populated with cross-references
      category: story.category || "myth",
      slug: story.slug,
    };
  });

  // Sort by era order, then by order within era
  events.sort((a, b) => {
    const eraOrderA = ERA_METADATA[a.era].order;
    const eraOrderB = ERA_METADATA[b.era].order;

    if (eraOrderA !== eraOrderB) {
      return eraOrderA - eraOrderB;
    }

    return a.order - b.order;
  });

  return events;
}

/**
 * Groups timeline events by era
 */
export function groupEventsByEra(
  events: TimelineEvent[],
): Map<MythologicalEra, TimelineEvent[]> {
  const groups = new Map<MythologicalEra, TimelineEvent[]>();

  // Initialize all eras
  const eras: MythologicalEra[] = [
    "primordial",
    "creation",
    "golden-age",
    "heroic",
    "decline",
  ];
  eras.forEach((era) => groups.set(era, []));

  // Group events
  events.forEach((event) => {
    const eraEvents = groups.get(event.era) || [];
    eraEvents.push(event);
    groups.set(event.era, eraEvents);
  });

  return groups;
}

/**
 * Gets unique pantheons from events
 */
export function getUniquePantheons(events: TimelineEvent[]): string[] {
  const pantheons = new Set<string>();
  events.forEach((e) => pantheons.add(e.pantheon));
  return Array.from(pantheons);
}

/**
 * Pantheon color mappings for consistency with existing components
 */
export const PANTHEON_COLORS: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    dot: string;
  }
> = {
  "greek-pantheon": {
    bg: "bg-gold/20",
    border: "border-gold/40",
    text: "text-gold",
    dot: "bg-gold",
  },
  "norse-pantheon": {
    bg: "bg-patina/20",
    border: "border-patina/40",
    text: "text-patina",
    dot: "bg-patina",
  },
  "egyptian-pantheon": {
    bg: "bg-bronze/20",
    border: "border-bronze/40",
    text: "text-bronze",
    dot: "bg-bronze",
  },
  "roman-pantheon": {
    bg: "bg-destructive/15",
    border: "border-destructive/35",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  "hindu-pantheon": {
    bg: "bg-gold/15",
    border: "border-gold/30",
    text: "text-gold",
    dot: "bg-gold",
  },
  "japanese-pantheon": {
    bg: "bg-bronze/15",
    border: "border-bronze/30",
    text: "text-bronze",
    dot: "bg-bronze",
  },
  "celtic-pantheon": {
    bg: "bg-patina/15",
    border: "border-patina/30",
    text: "text-patina",
    dot: "bg-patina",
  },
  "aztec-pantheon": {
    bg: "bg-bronze/20",
    border: "border-bronze/40",
    text: "text-bronze",
    dot: "bg-bronze",
  },
  "chinese-pantheon": {
    bg: "bg-gold/20",
    border: "border-gold/35",
    text: "text-gold",
    dot: "bg-gold",
  },
  "mesopotamian-pantheon": {
    bg: "bg-bronze/15",
    border: "border-bronze/35",
    text: "text-bronze",
    dot: "bg-bronze",
  },
  "african-pantheon": {
    bg: "bg-patina/20",
    border: "border-patina/40",
    text: "text-patina",
    dot: "bg-patina",
  },
  "polynesian-pantheon": {
    bg: "bg-patina/15",
    border: "border-patina/35",
    text: "text-patina",
    dot: "bg-patina",
  },
  "mesoamerican-pantheon": {
    bg: "bg-bronze/20",
    border: "border-bronze/35",
    text: "text-bronze",
    dot: "bg-bronze",
  },
};

/**
 * Gets color scheme for a pantheon with fallback
 */
export function getPantheonColors(pantheonId: string) {
  return (
    PANTHEON_COLORS[pantheonId] || {
      bg: "bg-muted",
      border: "border-border",
      text: "text-muted-foreground",
      dot: "bg-muted-foreground",
    }
  );
}
