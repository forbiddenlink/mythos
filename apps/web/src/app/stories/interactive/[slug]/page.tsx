"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowLeft, Clock, Trophy, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { InteractiveStory } from "@/components/stories/InteractiveStory";
import {
  BranchingStory,
  getDiscoveredEndings,
  getStoryProgress,
} from "@/lib/branching-story";
import branchingStoriesData from "@/data/branching-stories.json";
import { useState, useEffect } from "react";
import { RouteHero } from "@/components/layout/route-hero";

const branchingStories = branchingStoriesData as unknown as BranchingStory[];

export default function InteractiveStoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [isStarted, setIsStarted] = useState(false);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  const story = branchingStories.find((s) => s.slug === slug);

  useEffect(() => {
    if (story) {
      const discovered = getDiscoveredEndings(story.id);
      const saved = getStoryProgress(story.id);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate progress from localStorage
      setDiscoveredCount(discovered.length);
      setHasSavedProgress(Boolean(saved));
      // Resume mid-story or when endings were already found
      if (discovered.length > 0 || saved) {
        setIsStarted(true);
      }
    }
  }, [story]);

  if (!story) {
    return (
      <div className="min-h-screen bg-mythic">
        <div className="container mx-auto max-w-4xl px-4 py-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Story Not Found
            </h2>
            <p className="text-muted-foreground mt-2">
              The interactive story you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/stories"
              className="text-gold hover:underline mt-4 inline-block"
            >
              View all stories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <RouteHero tone="surface" heightClassName="h-[35vh] min-h-70">
        <div className="flex items-center justify-center mb-4">
          <Badge className="bg-gold/20 text-gold-text border-gold/30 gap-1">
            <BookOpen className="h-3 w-3" />
            Interactive Story
          </Badge>
        </div>
        <h1 className="page-title text-foreground mb-4">{story.title}</h1>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-px bg-linear-to-r from-transparent to-gold/40" />
          <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
          <div className="w-12 h-px bg-linear-to-l from-transparent to-gold/40" />
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {story.protagonist}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {story.estimatedTime}
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            {story.totalEndings} endings
          </span>
        </div>
      </RouteHero>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs />

        <div className="mt-8">
          <section className="mb-8 rounded-2xl border border-border/60 bg-card/60 p-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Read The Myth By Making Choices
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Interactive stories turn a familiar myth into a branching reading
              experience. Instead of staying outside the narrative, you move
              through it decision by decision and see how different choices
              reshape the ending, the lesson, or the character’s fate.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              That makes this format useful for more than novelty. It helps you
              notice where a myth’s tension really lives, which values are being
              tested, and why the original story structure pushes toward one
              outcome rather than another.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Use the replay value deliberately. Try one path, compare the next,
              then return to the standard story page or related deity entries so
              the choices feel anchored in the wider mythology rather than
              detached from it.
            </p>
          </section>

          {!isStarted ? (
            <Card className="border-border bg-card/50 shadow-none overflow-hidden">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif text-foreground">
                  Begin Your Journey
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {story.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Story info cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg border border-border text-center">
                    <User className="h-6 w-6 text-gold mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Playing As</p>
                    <p className="text-foreground font-medium">
                      {story.protagonist}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border text-center">
                    <Clock className="h-6 w-6 text-gold mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Estimated Time
                    </p>
                    <p className="text-foreground font-medium">
                      {story.estimatedTime}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border text-center">
                    <Trophy className="h-6 w-6 text-gold mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Total Endings
                    </p>
                    <p className="text-foreground font-medium">
                      {discoveredCount > 0 ? (
                        <>
                          <span className="text-gold">{discoveredCount}</span> /{" "}
                          {story.totalEndings} discovered
                        </>
                      ) : (
                        <>{story.totalEndings} to discover</>
                      )}
                    </p>
                  </div>
                </div>

                {/* How to play */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <h2 className="text-gold-text font-semibold mb-2">
                    How to Play
                  </h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-gold">1.</span>
                      Read each scene and make your choice
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold">2.</span>
                      Your choices shape the story and lead to different endings
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold">3.</span>
                      Replay to discover all {story.totalEndings} endings
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold">4.</span>
                      Your progress is saved automatically
                    </li>
                  </ul>
                </div>

                {/* Start button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Button
                    onClick={() => setIsStarted(true)}
                    variant="gold"
                    size="lg"
                    className="gap-2 min-w-50"
                  >
                    <BookOpen className="h-5 w-5" />
                    {hasSavedProgress || discoveredCount > 0
                      ? "Continue Story"
                      : "Begin Story"}
                  </Button>
                  <Link href="/stories">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 border-gold/30 text-gold hover:bg-gold/10"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Stories
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <InteractiveStory story={story} />
          )}
        </div>

        {/* Back navigation */}
        {isStarted && (
          <div className="flex justify-center pt-8">
            <Link href="/stories">
              <Button
                variant="outline"
                className="gap-2 border-gold/30 text-gold hover:bg-gold/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to All Stories
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
