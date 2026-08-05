"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Gamepad2, Trophy } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { MythosMark } from "@/components/icons/mythos-marks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import branchingStoriesData from "@/data/branching-stories.json";
import { BranchingStory, getDiscoveredEndings } from "@/lib/branching-story";

const branchingStories = branchingStoriesData as unknown as BranchingStory[];

function InteractiveStoryCard({ story }: Readonly<{ story: BranchingStory }>) {
  const [discoveredCount, setDiscoveredCount] = useState(0);

  useEffect(() => {
    const discovered = getDiscoveredEndings(story.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate discovered count from localStorage
    setDiscoveredCount(discovered.length);
  }, [story.id]);

  const remaining = story.totalEndings - discoveredCount;
  const endingLabel = remaining > 1 ? "endings" : "ending";
  const progressText =
    discoveredCount === story.totalEndings
      ? "All endings discovered!"
      : `${remaining} ${endingLabel} remaining`;

  return (
    <Link href={`/stories/interactive/${story.slug}`} className="group">
      <Card
        asArticle
        className="h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] overflow-hidden relative"
      >
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gold/20 text-amber-900 dark:text-amber-100 border-gold/30 gap-1">
            <Gamepad2 className="h-3 w-3" />
            Interactive
          </Badge>
        </div>

        <div className="h-1 bg-linear-to-r from-gold via-amber-400 to-gold" />

        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center border border-gold/35 bg-midnight/30 group-hover:border-gold/55 transition-colors">
              <MythosMark id="labyrinth" className="h-6 w-6 text-gold" />
            </div>
            <div className="min-w-0 flex-1 pr-16">
              <CardTitle className="text-lg line-clamp-2 group-hover:text-gold transition-colors">
                {story.title}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Play as {story.protagonist}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {story.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {story.estimatedTime}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" />
              {discoveredCount > 0 ? (
                <span className="text-gold">
                  {discoveredCount}/{story.totalEndings}
                </span>
              ) : (
                <span>{story.totalEndings} endings</span>
              )}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{progressText}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function InteractiveStoriesIndexPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        mark="labyrinth"
        tagline="Choose your path"
        title="Interactive Stories"
        description="Branching myths where your choices shape the ending. Discover every path across the pantheons."
      />

      <div className="container mx-auto max-w-6xl px-4 py-12 bg-mythic">
        <Breadcrumbs />

        <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">
          Each tale has multiple endings. Progress is saved on this device —
          return anytime to chase the routes you have not found yet. Prefer a
          linear reading list? Browse{" "}
          <Link
            href="/stories"
            className="text-gold underline hover:text-gold/80"
          >
            all stories
          </Link>
          .
        </p>

        {branchingStories.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            Interactive stories are being curated. Check back soon.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {branchingStories.map((story) => (
              <InteractiveStoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
