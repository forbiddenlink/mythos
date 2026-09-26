"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
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
      <div className="h-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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
      <div className="h-125 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
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
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-12 bg-mythic">
        <Breadcrumbs />

        <div
          role="tablist"
          aria-label="Timeline view"
          className="mt-6 inline-flex flex-wrap gap-1 border border-border bg-card/60 p-1"
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
                  "min-h-11 px-4 py-2 text-left text-sm transition-colors",
                  selected
                    ? "bg-gold/15 text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="block font-medium">{option.label}</span>
                <span className="block text-xs text-muted-foreground">
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
            className="mt-8"
          >
            <TimelineControls
              currentRange={viewRange}
              minYear={MIN_YEAR}
              maxYear={MAX_YEAR}
              onRangeChange={setViewRange}
            />

            <TimelineVisualizationD3
              pantheons={pantheons}
              events={events}
              viewRange={viewRange}
            />

            <div className="mt-12 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Using the Interactive Timeline
              </h2>
              <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Navigation
                  </h3>
                  <p>
                    Use your mouse wheel to <strong>zoom in</strong> up to 50x
                    magnification. Click and drag to <strong>pan</strong> across
                    different eras.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Events & Details
                  </h3>
                  <p>
                    <strong>Hollow circles</strong> represent key mythical or
                    historical events. Hover over them to reveal detailed
                    descriptions and dates.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Pantheons
                  </h3>
                  <p>
                    Colored bars show catalog periods where dates are recorded.
                    Collections without a shared period are labeled after the
                    dated entries. <strong>Click</strong> an entry to highlight
                    it and dim others.
                  </p>
                </div>
              </div>
            </div>

            {attestation ? <div className="mt-12">{attestation}</div> : null}
          </div>
        ) : (
          <div
            role="tabpanel"
            id="timeline-panel-stories"
            aria-labelledby="timeline-tab-stories"
            className="mt-8"
          >
            <StoryTimelineView
              stories={stories}
              pantheons={pantheons.map(({ id, name, slug }) => ({
                id,
                name,
                slug,
              }))}
            />

            <div className="mt-12 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                Understanding the Cosmic Eras
              </h2>
              <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Myths are grouped into five eras: the{" "}
                  <strong>Primordial</strong> void, the{" "}
                  <strong>Creation</strong> of worlds and gods, the{" "}
                  <strong>Golden Age</strong> of divine rule, the{" "}
                  <strong>Heroic Age</strong> of mortal champions, and the{" "}
                  <strong>Decline</strong> or twilight of the gods.
                </p>
                <p>
                  These editorial groupings help compare narrative patterns.
                  They do not imply a shared chronology or the same sequence of
                  eras in every tradition.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
