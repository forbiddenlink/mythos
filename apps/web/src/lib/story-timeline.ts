/**
 * Story Timeline Utilities
 *
 * Maps mythological stories to eras and builds chronological timelines
 * for visualization of mythological narratives.
 */

export type MythologicalEra =
  | 'primordial'    // Before creation, chaos, void
  | 'creation'      // World creation, first gods/beings
  | 'golden-age'    // Age of titans/first rulers, paradise
  | 'heroic'        // Age of heroes, demigods, great adventures
  | 'decline'       // Fall of gods, apocalypse, endings

export interface TimelineEvent {
  id: string
  title: string
  description: string
  era: MythologicalEra
  pantheon: string
  pantheonName: string
  order: number // Order within era (0-100)
  relatedStories: string[]
  category: string
  slug: string
}

export interface Story {
  id: string
  pantheonId: string
  title: string
  slug: string
  summary: string
  category?: string
  moralThemes?: string[]
}

export interface Pantheon {
  id: string
  name: string
  slug: string
}

// Era metadata for display
export const ERA_METADATA: Record<MythologicalEra, {
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  order: number
}> = {
  primordial: {
    label: 'Primordial Age',
    description: 'The time before creation, when chaos and void reigned',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
    borderColor: 'border-violet-500/40',
    order: 0,
  },
  creation: {
    label: 'Creation Era',
    description: 'The birth of the cosmos, gods, and first beings',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/40',
    order: 1,
  },
  'golden-age': {
    label: 'Golden Age',
    description: 'The reign of elder gods and the age of paradise',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/40',
    order: 2,
  },
  heroic: {
    label: 'Heroic Age',
    description: 'The time of heroes, demigods, and great adventures',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/40',
    order: 3,
  },
  decline: {
    label: 'Age of Decline',
    description: 'The twilight of the gods, apocalypse, and endings',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/40',
    order: 4,
  },
}

// Story to era mappings based on content and category
const STORY_ERA_MAPPINGS: Record<string, { era: MythologicalEra; order: number }> = {
  // Norse
  'creation-myth-norse': { era: 'creation', order: 10 },
  'yggdrasil': { era: 'creation', order: 20 },
  'binding-of-fenrir': { era: 'golden-age', order: 50 },
  'death-of-baldur': { era: 'decline', order: 60 },
  'ragnarok': { era: 'decline', order: 100 },

  // Greek
  'titanomachy': { era: 'primordial', order: 80 },

  // Egyptian
  'creation-heliopolis': { era: 'creation', order: 10 },
  'osiris-myth': { era: 'golden-age', order: 40 },
  'ra-journey': { era: 'golden-age', order: 30 },
  'contendings': { era: 'heroic', order: 50 },
  'weighing-heart': { era: 'golden-age', order: 60 },

  // Roman
  'aeneid': { era: 'heroic', order: 70 },
  'romulus-remus': { era: 'heroic', order: 80 },
}

// Default era mappings by category
const CATEGORY_ERA_DEFAULTS: Record<string, { era: MythologicalEra; order: number }> = {
  'creation': { era: 'creation', order: 50 },
  'cosmology': { era: 'creation', order: 40 },
  'primordial': { era: 'primordial', order: 50 },
  'war': { era: 'heroic', order: 60 },
  'hero': { era: 'heroic', order: 50 },
  'epic': { era: 'heroic', order: 55 },
  'tragedy': { era: 'heroic', order: 70 },
  'romance': { era: 'heroic', order: 45 },
  'myth': { era: 'golden-age', order: 50 },
  'afterlife': { era: 'golden-age', order: 80 },
  'apocalypse': { era: 'decline', order: 90 },
  'decline': { era: 'decline', order: 70 },
}

/**
 * Determines the mythological era for a story based on its content and category
 */
export function getStoryEra(story: Story): { era: MythologicalEra; order: number } {
  // Check explicit mapping first
  if (STORY_ERA_MAPPINGS[story.id]) {
    return STORY_ERA_MAPPINGS[story.id]
  }

  // Check category defaults
  if (story.category && CATEGORY_ERA_DEFAULTS[story.category]) {
    return CATEGORY_ERA_DEFAULTS[story.category]
  }

  // Analyze story content for era indicators
  const summary = story.summary.toLowerCase()
  const title = story.title.toLowerCase()

  // Primordial indicators
  if (
    summary.includes('before creation') ||
    summary.includes('primordial') ||
    summary.includes('chaos') ||
    summary.includes('void') ||
    title.includes('primordial')
  ) {
    return { era: 'primordial', order: 50 }
  }

  // Creation indicators
  if (
    summary.includes('creation') ||
    summary.includes('first') ||
    summary.includes('beginning') ||
    summary.includes('origin') ||
    title.includes('creation') ||
    title.includes('origin')
  ) {
    return { era: 'creation', order: 50 }
  }

  // Decline/apocalypse indicators
  if (
    summary.includes('end of') ||
    summary.includes('twilight') ||
    summary.includes('apocalypse') ||
    summary.includes('ragnarok') ||
    summary.includes('destruction') ||
    title.includes('end') ||
    title.includes('twilight') ||
    title.includes('ragnarok')
  ) {
    return { era: 'decline', order: 70 }
  }

  // Hero indicators
  if (
    summary.includes('hero') ||
    summary.includes('warrior') ||
    summary.includes('battle') ||
    summary.includes('quest') ||
    summary.includes('adventure')
  ) {
    return { era: 'heroic', order: 50 }
  }

  // Default to golden age
  return { era: 'golden-age', order: 50 }
}

/**
 * Builds a chronological timeline of mythological events from stories
 */
export function buildMythTimeline(
  stories: Story[],
  pantheons: Pantheon[],
  pantheonFilter?: string
): TimelineEvent[] {
  const pantheonMap = new Map(pantheons.map(p => [p.id, p.name]))

  // Filter by pantheon if specified
  let filteredStories = stories
  if (pantheonFilter && pantheonFilter !== 'all') {
    filteredStories = stories.filter(s => s.pantheonId === pantheonFilter)
  }

  // Convert stories to timeline events
  const events: TimelineEvent[] = filteredStories.map(story => {
    const { era, order } = getStoryEra(story)

    return {
      id: story.id,
      title: story.title,
      description: story.summary,
      era,
      pantheon: story.pantheonId,
      pantheonName: pantheonMap.get(story.pantheonId) || story.pantheonId,
      order,
      relatedStories: [], // Could be populated with cross-references
      category: story.category || 'myth',
      slug: story.slug,
    }
  })

  // Sort by era order, then by order within era
  events.sort((a, b) => {
    const eraOrderA = ERA_METADATA[a.era].order
    const eraOrderB = ERA_METADATA[b.era].order

    if (eraOrderA !== eraOrderB) {
      return eraOrderA - eraOrderB
    }

    return a.order - b.order
  })

  return events
}

/**
 * Groups timeline events by era
 */
export function groupEventsByEra(
  events: TimelineEvent[]
): Map<MythologicalEra, TimelineEvent[]> {
  const groups = new Map<MythologicalEra, TimelineEvent[]>()

  // Initialize all eras
  const eras: MythologicalEra[] = ['primordial', 'creation', 'golden-age', 'heroic', 'decline']
  eras.forEach(era => groups.set(era, []))

  // Group events
  events.forEach(event => {
    const eraEvents = groups.get(event.era) || []
    eraEvents.push(event)
    groups.set(event.era, eraEvents)
  })

  return groups
}

/**
 * Gets unique pantheons from events
 */
export function getUniquePantheons(events: TimelineEvent[]): string[] {
  const pantheons = new Set<string>()
  events.forEach(e => pantheons.add(e.pantheon))
  return Array.from(pantheons)
}

/**
 * Pantheon color mappings for consistency with existing components
 */
export const PANTHEON_COLORS: Record<string, {
  bg: string
  border: string
  text: string
  dot: string
}> = {
  'greek-pantheon': {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/40',
    text: 'text-blue-400',
    dot: 'bg-blue-500'
  },
  'norse-pantheon': {
    bg: 'bg-violet-500/20',
    border: 'border-violet-500/40',
    text: 'text-violet-400',
    dot: 'bg-violet-500'
  },
  'egyptian-pantheon': {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    dot: 'bg-amber-500'
  },
  'roman-pantheon': {
    bg: 'bg-red-500/20',
    border: 'border-red-500/40',
    text: 'text-red-400',
    dot: 'bg-red-500'
  },
  'hindu-pantheon': {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/40',
    text: 'text-orange-400',
    dot: 'bg-orange-500'
  },
  'japanese-pantheon': {
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/40',
    text: 'text-pink-400',
    dot: 'bg-pink-500'
  },
  'celtic-pantheon': {
    bg: 'bg-green-500/20',
    border: 'border-green-500/40',
    text: 'text-green-400',
    dot: 'bg-green-500'
  },
  'aztec-pantheon': {
    bg: 'bg-teal-500/20',
    border: 'border-teal-500/40',
    text: 'text-teal-400',
    dot: 'bg-teal-500'
  },
  'chinese-pantheon': {
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/40',
    text: 'text-rose-400',
    dot: 'bg-rose-500'
  },
  'mesopotamian-pantheon': {
    bg: 'bg-yellow-700/20',
    border: 'border-yellow-700/40',
    text: 'text-yellow-600',
    dot: 'bg-yellow-700'
  },
  'african-pantheon': {
    bg: 'bg-violet-600/20',
    border: 'border-violet-600/40',
    text: 'text-violet-500',
    dot: 'bg-violet-600'
  },
  'polynesian-pantheon': {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/40',
    text: 'text-cyan-400',
    dot: 'bg-cyan-500'
  },
  'mesoamerican-pantheon': {
    bg: 'bg-lime-600/20',
    border: 'border-lime-600/40',
    text: 'text-lime-500',
    dot: 'bg-lime-600'
  },
}

/**
 * Gets color scheme for a pantheon with fallback
 */
export function getPantheonColors(pantheonId: string) {
  return PANTHEON_COLORS[pantheonId] || {
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/40',
    text: 'text-gray-400',
    dot: 'bg-gray-500',
  }
}
