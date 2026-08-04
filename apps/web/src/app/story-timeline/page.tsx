import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { SimplePageHeader } from "@/components/layout/simple-page-header";
import { generateBaseMetadata } from "@/lib/metadata";
import { StoryTimelinePageClient } from "./StoryTimelinePageClient";

export const metadata: Metadata = generateBaseMetadata({
  title: "Story Timeline of World Mythology",
  description:
    "Explore mythological stories by cosmic era, from primordial chaos and creation through heroic ages and the twilight of divine powers.",
  url: "/story-timeline",
});

export default function StoryTimelinePage() {
  return (
    <div className="bg-mythic">
      <div className="page-shell max-w-5xl">
        <Breadcrumbs />
        <SimplePageHeader
          align="left"
          mark="chronos"
          tagline="Narrative eras"
          title="Story Timeline"
          description="Groups myths by cosmic era so you can follow narrative sequence — not just historical publication order."
        />

        <section className="mb-10 rounded-xl border border-border/60 bg-card/60 p-6 font-body text-sm leading-7 text-muted-foreground space-y-3">
          <p>
            Move from primordial creation and divine succession into heroic
            quests, city-founding legends, apocalyptic endings, and later
            cultural retellings. This view is especially useful when different
            traditions tell structurally similar stories at different moments in
            the mythic arc.
          </p>
          <p>
            Creation, flood, underworld descent, culture-bringer, and end of the
            world stories become easier to compare when they are grouped by
            function and phase. Treat the timeline as a wayfinding tool:
            identify a story cluster, then open individual myth pages for the
            full narrative, source context, and pantheon-specific details.
          </p>
          <p>
            Myths are not only historical artifacts — they also follow narrative
            stages: origin, struggle, transformation, descent, return, and
            collapse. Grouping by mythic role reveals shared arcs across
            cultures that may never have met yet still solve similar symbolic
            problems.
          </p>
        </section>
      </div>
      <StoryTimelinePageClient />
    </div>
  );
}
