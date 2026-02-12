'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface RelatedDeity {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  domain?: string[];
}

interface RelatedStory {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  imageUrl?: string;
}

interface RelatedLocation {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

interface RelatedContentProps {
  type: 'deity' | 'story' | 'location';
  currentId: string;
  relatedDeities?: RelatedDeity[];
  relatedStories?: RelatedStory[];
  relatedLocations?: RelatedLocation[];
  title?: string;
}

function getDefaultTitle(type: RelatedContentProps['type'], contentType: 'deities' | 'stories' | 'locations'): string {
  const titles: Record<string, Record<string, string>> = {
    deity: {
      stories: 'Featured In',
      locations: 'Sacred Places',
      deities: 'Related Deities',
    },
    story: {
      deities: 'Featured Deities',
      locations: 'Story Locations',
      stories: 'Related Stories',
    },
    location: {
      deities: 'Associated Deities',
      stories: 'Stories Here',
      locations: 'Nearby Locations',
    },
  };
  return titles[type]?.[contentType] || 'Related Content';
}

interface CardProps {
  href: string;
  imageUrl?: string;
  title: string;
  subtitle?: string;
  fallbackIcon?: React.ReactNode;
}

function RelatedCard({ href, imageUrl, title, subtitle, fallbackIcon }: CardProps) {
  return (
    <Link href={href} className="block group flex-shrink-0 w-48 md:w-56">
      <div className="relative h-full rounded-xl bg-card border border-border/60 overflow-hidden transition-all duration-300 hover:border-gold/50 hover:shadow-lg hover:shadow-black/10">
        {/* Image container */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 192px, 224px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
              {fallbackIcon || (
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="text-gold/60 text-2xl font-serif">{title.charAt(0)}</span>
                </div>
              )}
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-serif text-sm font-semibold text-foreground group-hover:text-gold transition-colors duration-300 line-clamp-1">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}

          {/* Link indicator */}
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/70 group-hover:text-gold/80 transition-colors duration-300">
            <span>View</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function RelatedSection({ title, children }: SectionProps) {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {title}
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
      </div>

      {/* Horizontal scroll container */}
      <div className="relative -mx-4 px-4">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {children}
        </div>
        {/* Fade edges for scroll indication */}
        <div className="absolute left-0 top-0 bottom-4 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-4 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

export function RelatedContent({
  type,
  currentId,
  relatedDeities,
  relatedStories,
  relatedLocations,
  title,
}: RelatedContentProps) {
  // Filter out current item from any related list
  const filteredDeities = relatedDeities?.filter(d => d.id !== currentId) || [];
  const filteredStories = relatedStories?.filter(s => s.id !== currentId) || [];
  const filteredLocations = relatedLocations?.filter(l => l.id !== currentId) || [];

  // Check if there's any content to show
  const hasDeities = filteredDeities.length > 0;
  const hasStories = filteredStories.length > 0;
  const hasLocations = filteredLocations.length > 0;
  const hasContent = hasDeities || hasStories || hasLocations;

  if (!hasContent) {
    return null;
  }

  return (
    <section className="space-y-8">
      {/* Optional custom title for entire section */}
      {title && (
        <div className="text-center">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            {title}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1 h-1 rotate-45 bg-gold/50" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
        </div>
      )}

      {/* Deity cards */}
      {hasDeities && (
        <RelatedSection title={getDefaultTitle(type, 'deities')}>
          {filteredDeities.map((deity) => (
            <RelatedCard
              key={deity.id}
              href={`/deities/${deity.slug}`}
              imageUrl={deity.imageUrl}
              title={deity.name}
              subtitle={deity.domain?.slice(0, 2).join(', ')}
            />
          ))}
        </RelatedSection>
      )}

      {/* Story cards */}
      {hasStories && (
        <RelatedSection title={getDefaultTitle(type, 'stories')}>
          {filteredStories.map((story) => (
            <RelatedCard
              key={story.id}
              href={`/stories/${story.slug}`}
              imageUrl={story.imageUrl}
              title={story.title}
              subtitle={story.summary}
            />
          ))}
        </RelatedSection>
      )}

      {/* Location cards */}
      {hasLocations && (
        <RelatedSection title={getDefaultTitle(type, 'locations')}>
          {filteredLocations.map((location) => (
            <RelatedCard
              key={location.id}
              href={`/locations/${location.slug}`}
              imageUrl={location.imageUrl}
              title={location.name}
            />
          ))}
        </RelatedSection>
      )}
    </section>
  );
}

export type { RelatedContentProps, RelatedDeity, RelatedStory, RelatedLocation };
