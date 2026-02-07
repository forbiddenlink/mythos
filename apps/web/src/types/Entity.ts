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
