"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveStory } from "@/components/stories/InteractiveStory";
import {
  type BranchingStory,
  getDiscoveredEndings,
  getStoryProgress,
} from "@/lib/branching-story";

const HOW_TO_PLAY = [
  "Read each scene and make your choice.",
  "Your choices shape the story and lead to different endings.",
  "Replay to discover every ending.",
  "Your progress is saved automatically in this browser.",
];

/**
 * The branching-story player. The server page passes the one story it needs;
 * progress and discovered endings come from localStorage after hydration.
 */
export function InteractiveStoryPlayer({
  story,
}: Readonly<{ story: BranchingStory }>) {
  const [isStarted, setIsStarted] = useState(false);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => {
    const discovered = getDiscoveredEndings(story.id);
    const saved = getStoryProgress(story.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate progress from localStorage
    setDiscoveredCount(discovered.length);
    setHasSavedProgress(Boolean(saved));
    // Resume mid-story or when endings were already found.
    if (discovered.length > 0 || saved) {
      setIsStarted(true);
    }
  }, [story.id]);

  useEffect(() => {
    if (!isStarted) return;
    const scene = document.getElementById("interactive-story-scene");
    if (!scene) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    scene.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [isStarted]);

  if (isStarted) {
    return (
      <div>
        <InteractiveStory story={story} />
        <div className="flex justify-center pt-10">
          <Link
            href="/stories"
            className="inline-flex min-h-11 items-center gap-2 type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to all stories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="interactive-start-title"
      className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-xl shadow-black/5"
    >
      <div className="grid gap-px bg-border/70 sm:grid-cols-3">
        {[
          { label: "Playing as", value: story.protagonist },
          { label: "Reading time", value: story.estimatedTime },
          {
            label: "Endings",
            value:
              discoveredCount > 0
                ? `${discoveredCount} / ${story.totalEndings} discovered`
                : `${story.totalEndings} to discover`,
          },
        ].map((fact) => (
          <div key={fact.label} className="bg-card px-6 py-4">
            <p className="type-meta uppercase tracking-[0.14em] text-muted-foreground">
              {fact.label}
            </p>
            <p className="mt-1 font-body text-xl font-semibold text-foreground">
              {fact.value}
            </p>
          </div>
        ))}
      </div>

      <div className="px-6 py-8 md:px-10 md:py-10">
        <h2
          id="interactive-start-title"
          className="page-section-title text-foreground"
        >
          Begin your journey
        </h2>
        <p className="type-reading mt-3 text-muted-foreground">
          {story.description}
        </p>

        <h3 className="mt-8 type-ui font-semibold text-foreground">
          How to play
        </h3>
        <ol className="mt-3 space-y-2 type-ui text-muted-foreground">
          {HOW_TO_PLAY.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="w-4 shrink-0 text-right font-semibold tabular-nums text-gold-text">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button
            onClick={() => setIsStarted(true)}
            variant="gold"
            size="lg"
            className="gap-2"
          >
            <BookOpen className="size-5" aria-hidden="true" />
            {hasSavedProgress || discoveredCount > 0
              ? "Continue Story"
              : "Begin Story"}
          </Button>
          <Link
            href="/stories"
            className="inline-flex min-h-11 items-center gap-2 type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Stories
          </Link>
        </div>
      </div>
    </section>
  );
}
