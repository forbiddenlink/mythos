"use client";

import Link from "next/link";
import { Clock, Trophy, ChevronRight } from "lucide-react";
import { getDiscoveredEndings } from "@/lib/branching-story";
import type { InteractiveStoryCard } from "@/lib/deity-page";
import { useEffect, useState } from "react";

interface DeityStoryRecommendationsProps {
  deityName: string;
  /** Interactive stories featuring the deity, selected on the server. */
  stories: InteractiveStoryCard[];
}

export function DeityStoryRecommendations({
  deityName,
  stories: relatedStories,
}: DeityStoryRecommendationsProps) {
  const [discoveredCounts, setDiscoveredCounts] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    // Endings discovered live in localStorage, so they are read after mount.
    const counts: Record<string, number> = {};
    relatedStories.forEach((story) => {
      counts[story.id] = getDiscoveredEndings(story.id).length;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate progress from localStorage (SSR-safe)
    setDiscoveredCounts(counts);
  }, [relatedStories]);

  if (relatedStories.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-4 text-[0.9375rem] text-muted-foreground">
        Branching retellings featuring {deityName}: your choices decide the
        ending.
      </p>
      <ul className="divide-y divide-border/70 border-y border-border/70">
        {relatedStories.map((story) => {
          const discovered = discoveredCounts[story.id] || 0;
          const progress = (discovered / story.totalEndings) * 100;

          return (
            <li key={story.id}>
              <Link
                href={`/stories/interactive/${story.slug}`}
                className="group flex items-start justify-between gap-4 py-4"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-gold-text">
                    {story.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[0.9375rem] text-muted-foreground">
                    {story.description}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-[0.8125rem] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {story.estimatedTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                      {discovered > 0 ? (
                        <span className="text-gold-text">
                          {discovered}/{story.totalEndings} endings
                        </span>
                      ) : (
                        <span>{story.totalEndings} endings</span>
                      )}
                    </span>
                  </div>
                  {discovered > 0 && (
                    <div className="mt-3 h-1 max-w-xs overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gold"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <ChevronRight
                  className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-gold-text"
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
