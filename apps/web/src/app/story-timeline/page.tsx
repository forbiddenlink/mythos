import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
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
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <Breadcrumbs />
        <section className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-6">
          <h1 className="font-serif text-4xl font-semibold text-foreground">
            Story Timeline
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            The story timeline groups myths by narrative era so you can move
            from primordial creation and divine succession into heroic quests,
            city-founding legends, apocalyptic endings, and later cultural
            retellings. It is designed to show narrative sequence rather than
            just historical publication order.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            This view is especially useful when different traditions tell
            structurally similar stories at different moments in the mythic arc.
            Creation, flood, underworld descent, culture-bringer, and end of the
            world stories become easier to compare when they are grouped by
            function and phase.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Treat the timeline as a wayfinding tool: identify a story cluster,
            then open the individual myth pages to read the full narrative,
            source context, and pantheon-specific details behind each entry.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            This structure is useful because myths are not only historical
            artifacts. They also follow narrative stages: origin, struggle,
            transformation, descent, return, and collapse. Grouping stories by
            mythic role helps reveal those shared arcs across cultures that may
            never have met directly yet still solve similar symbolic problems in
            similar ways.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Use the page when you want to compare functions rather than names. A
            creation myth in one tradition, an underworld descent in another,
            and an apocalyptic battle elsewhere may belong to different
            civilizations but still fill parallel positions in the larger
            narrative architecture of myth.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            The page also makes it easier to plan a reading path. Start with a
            story era, identify a cluster such as flood myths or hero journeys,
            then open the related entries to compare summary, source material,
            major characters, and the local values each culture attaches to the
            same broad narrative shape.
          </p>
        </section>
      </div>
      <StoryTimelinePageClient />
    </div>
  );
}
