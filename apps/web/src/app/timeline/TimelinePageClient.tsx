"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { StageLoading } from "@/components/layout/tool-stage";
import { TimelineControls } from "@/components/timeline/TimelineControls";
import { cn } from "@/lib/utils";

// Lazy load the D3 views: only the chosen one is fetched.
const TimelineVisualizationD3 = dynamic(
  () =>
    import("@/components/timeline/TimelineVisualizationD3").then((mod) => ({
      default: mod.TimelineVisualizationD3,
    })),
  {
    loading: () => (
      <StageLoading
        tone="dark"
        mark="chronos"
        label="Laying out three thousand years…"
        className="h-[min(70vh,44rem)] rounded-lg ring-1 ring-border"
      />
    ),
    ssr: false,
  },
);

const StoryTimelineView = dynamic(
  () =>
    import("@/components/timeline/StoryTimelineView").then((mod) => ({
      default: mod.StoryTimelineView,
    })),
  {
    loading: () => (
      <StageLoading
        mark="scroll"
        label="Arranging the stories by era…"
        className="h-[min(70vh,44rem)] rounded-lg border border-border"
      />
    ),
    ssr: false,
  },
);

export interface TimelinePantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
  region: string;
  timePeriodStart: number | null;
  timePeriodEnd: number | null;
  description: string | null;
}

export interface TimelineEvent {
  id: string;
  title: string;
  year: number;
  pantheonId: string;
  type: "mythical" | "historical";
  description: string;
}

export interface TimelineStory {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
  category?: string;
}

export type TimelineView = "traditions" | "stories";

const VIEWS: Array<{ id: TimelineView; label: string; hint: string }> = [
  {
    id: "traditions",
    label: "Traditions and events",
    hint: "Historical periods and dated events",
  },
  {
    id: "stories",
    label: "Stories by cosmic era",
    hint: "From primordial chaos to the twilight of the gods",
  },
];

/** `#stories` opens the story view (the retired /story-timeline links here). */
export function viewFromHash(hash: string): TimelineView {
  return hash.replace(/^#/, "") === "stories" ? "stories" : "traditions";
}

export function TimelinePageClient({
  pantheons,
  events,
  stories,
  attestation,
}: Readonly<{
  pantheons: TimelinePantheon[];
  events: TimelineEvent[];
  stories: TimelineStory[];
  /** Server-rendered attestation chart shown with the traditions view. */
  attestation?: ReactNode;
}>) {
  const MIN_YEAR = -3500;
  const MAX_YEAR = 2025;
  const [viewRange, setViewRange] = useState<[number, number]>([
    MIN_YEAR,
    MAX_YEAR,
  ]);
  const [view, setView] = useState<TimelineView>("traditions");

  // The page is prerendered; the view is read from the URL after hydration.
  useEffect(() => {
    const sync = () => setView(viewFromHash(globalThis.location.hash));
    sync();
    globalThis.addEventListener("hashchange", sync);
    return () => globalThis.removeEventListener("hashchange", sync);
  }, []);

  const choose = (next: TimelineView) => {
    setView(next);
    globalThis.history.replaceState(
      null,
      "",
      next === "stories" ? "#stories" : globalThis.location.pathname,
    );
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Timeline view"
        className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border/70"
      >
        {VIEWS.map((option) => {
          const selected = view === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              id={`timeline-tab-${option.id}`}
              aria-selected={selected}
              aria-controls={`timeline-panel-${option.id}`}
              onClick={() => choose(option.id)}
              className={cn(
                "-mb-px min-h-11 border-b-2 pb-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                selected
                  ? "border-gold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="block type-ui font-semibold">
                {option.label}
              </span>
              <span className="block type-meta text-muted-foreground">
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>

      {view === "traditions" ? (
        <div
          role="tabpanel"
          id="timeline-panel-traditions"
          aria-labelledby="timeline-tab-traditions"
          className="mt-5"
        >
          <TimelineControls
            currentRange={viewRange}
            minYear={MIN_YEAR}
            maxYear={MAX_YEAR}
            onRangeChange={setViewRange}
          />

          <div className="mt-5">
            <TimelineVisualizationD3
              pantheons={pantheons}
              events={events}
              viewRange={viewRange}
            />
          </div>

          {attestation ? (
            <div className="mt-16 md:mt-20">{attestation}</div>
          ) : null}
        </div>
      ) : (
        <div
          role="tabpanel"
          id="timeline-panel-stories"
          aria-labelledby="timeline-tab-stories"
          className="mt-6"
        >
          <StoryTimelineView
            stories={stories}
            pantheons={pantheons.map(({ id, name, slug }) => ({
              id,
              name,
              slug,
            }))}
          />
        </div>
      )}
    </div>
  );
}
