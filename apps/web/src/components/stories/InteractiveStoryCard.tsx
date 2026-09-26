"use client";

import { useEffect, useState } from "react";
import { Clock, Trophy } from "lucide-react";
import { EntityBadge, EntityCard } from "@/components/entities/EntityCard";
import { getDiscoveredEndings } from "@/lib/branching-story";

/** Interactive-story card fields (no story graph). */
export interface InteractiveStoryListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  protagonist: string;
  estimatedTime: string;
  totalEndings: number;
  coverImage?: string;
  /** Short tradition name, when known. */
  tradition?: string;
  traditionColor?: string;
}

/**
 * EntityCard for a branching myth, with the reader's endings progress (read
 * from localStorage after hydration).
 */
export function InteractiveStoryCard({
  story,
  priority,
  headingLevel,
}: Readonly<{
  story: InteractiveStoryListItem;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}>) {
  const [discoveredCount, setDiscoveredCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate discovered count from localStorage
    setDiscoveredCount(getDiscoveredEndings(story.id).length);
  }, [story.id]);

  const complete = discoveredCount >= story.totalEndings;

  return (
    <EntityCard
      href={`/stories/interactive/${story.slug}`}
      title={story.title}
      image={story.coverImage}
      imagePosition="50% 35%"
      aspect="landscape"
      priority={priority}
      headingLevel={headingLevel}
      tradition={story.tradition}
      traditionColor={story.traditionColor}
      subtitle={`Play as ${story.protagonist}`}
      description={story.description}
      badges={<EntityBadge tone="gold">Interactive</EntityBadge>}
      meta={
        <>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {story.estimatedTime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="size-3.5" aria-hidden="true" />
            {discoveredCount > 0
              ? `${discoveredCount} of ${story.totalEndings} endings found`
              : `${story.totalEndings} endings`}
          </span>
        </>
      }
    >
      {discoveredCount > 0 ? (
        <div
          className="h-1 overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={
            complete
              ? "All endings discovered"
              : `${discoveredCount} of ${story.totalEndings} endings discovered`
          }
        >
          <div
            className="h-full rounded-full bg-gold"
            style={{
              width: `${Math.min(100, (discoveredCount / story.totalEndings) * 100)}%`,
            }}
          />
        </div>
      ) : null}
    </EntityCard>
  );
}
