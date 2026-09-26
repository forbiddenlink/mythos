"use client";

import Link from "next/link";
import { Gamepad2, Clock, Trophy, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <Card className="bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2 text-xl">
          <Gamepad2 className="h-5 w-5 text-gold" />
          Interactive Stories
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Play stories featuring {deityName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {relatedStories.map((story) => {
          const discovered = discoveredCounts[story.id] || 0;
          const progress = (discovered / story.totalEndings) * 100;

          return (
            <Link
              key={story.id}
              href={`/stories/interactive/${story.slug}`}
              className="block group"
            >
              <div className="p-4 rounded-xl border border-border hover:border-gold/50 hover:bg-gold/5 transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground group-hover:text-gold transition-colors">
                        {story.title}
                      </h3>
                      <Badge className="bg-gold/20 text-gold-text border-gold/30 text-xs">
                        Interactive
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {story.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {story.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" />
                        {discovered > 0 ? (
                          <span className="text-gold">
                            {discovered}/{story.totalEndings} endings
                          </span>
                        ) : (
                          <span>{story.totalEndings} endings</span>
                        )}
                      </span>
                    </div>

                    {/* Progress bar */}
                    {discovered > 0 && (
                      <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-gold-dark to-gold transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-gold transition-colors shrink-0 mt-1" />
                </div>
              </div>
            </Link>
          );
        })}

        {/* View all CTA */}
        <Button
          asChild
          variant="outline"
          className="w-full border-gold/30 hover:bg-gold/10"
        >
          <Link href="/stories">
            View All Stories
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
