export type EntityType = 'deity' | 'creature' | 'artifact' | 'story' | 'location' | 'pantheon';

export interface BaseEntity {
    id: string;
    name: string; // or title for stories
    slug: string;
    description?: string;
    imageUrl?: string;
    pantheonId?: string;
}

export interface SearchResult {
    id: string;
    title: string;
    subtitle?: string; // e.g., "Greek Pantheon" or "Monster"
    href: string;
    type: EntityType;
    icon?: string; // identifier for icon component
}

// Specific schemas for data files
export interface Creature extends BaseEntity {
    habitat: string;
    abilities: string[];
    dangerLevel: number; // 1-10
}

export interface Artifact extends BaseEntity {
    ownerId?: string;
    originStory?: string;
    powers: string[];
}

export interface Deity extends BaseEntity {
    id: string;
    pantheonId: string;
    name: string;
    slug: string;
    alternateNames: string[];
    gender: 'male' | 'female' | 'other';
    domain: string[];
    symbols: string[];
    description: string;
    detailedBio?: string;
    originStory?: string;
    importanceRank: number;
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
    worship?: {
        temples?: string[];
        festivals?: string[];
        practices?: string;
    };
}

export interface Story extends BaseEntity {
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
    citationSources?: Array<{
        title: string;
        author?: string;
        lines?: string;
        book?: string;
        chapters?: string;
        chapter?: string;
        type?: string;
    }>;
    featuredDeities?: string[];
    featuredLocations?: string[];
    relatedStories?: string[];
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    xp: number;
    icon: string;
    category?: 'discovery' | 'mastery' | 'streak' | 'exploration';
}

export interface UserProgress {
    deitiesViewed: string[];
    storiesRead: string[];
    pantheonsExplored: string[];
    locationsVisited: string[];
    quizScores: Record<string, number>;
    achievements: string[];
    dailyStreak: number;
    lastVisit: string;
    totalXP: number;
}

export interface Tour {
    id: string;
    name: string;
    description: string;
    pantheonId: string;
    locations: string[];
}
