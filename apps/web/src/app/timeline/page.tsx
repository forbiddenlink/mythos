import type { Metadata } from "next";
import { Clock3 } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { generateBaseMetadata } from "@/lib/metadata";
import { TimelinePageClient } from "./TimelinePageClient";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Timeline",
  description:
    "Explore a visual mythology timeline from 3500 BCE to 1600 CE and compare Greek, Norse, Egyptian, Roman, Hindu, Japanese, Celtic, Aztec, and Chinese traditions.",
  url: "/timeline",
});

export default function TimelinePage() {
  return (
    <>
      <PageHero
        icon={<Clock3 />}
        tagline="Chronology"
        title="Mythology Timeline"
        description="Trace major mythological traditions across eras, compare their active periods, and explore when stories and civilizations overlapped."
        backgroundImage="/stories-hero.jpg"
        backgroundAlt="A mythic landscape representing the passage of eras and civilizations"
      />
      <section className="bg-mythic">
        <div className="container mx-auto max-w-5xl px-4 py-10">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Read Mythology In Historical Sequence
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              This timeline places major pantheons beside one another so you can
              see when traditions overlapped, when civilizations rose and fell,
              and how long different mythic systems remained culturally active.
              It works well as a first orientation layer before you move into
              deity profiles, stories, and source notes.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Use it to compare broad eras rather than chase exact dates for
              every myth. The goal is to understand sequence, proximity, and
              cultural context: which traditions coexisted, which were separated
              by centuries, and how geography and time frame the stories people
              told about gods, kings, monsters, and the cosmos.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Once you spot an overlap or gap, jump from the timeline into the
              related pantheon and story pages. That back-and-forth makes the
              chronology useful as a study tool instead of just a visual list of
              dates.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              This means the page works best as a context layer rather than a
              final authority on exact historical dating. Mythology often
              survives through long oral and textual traditions, so the same
              story can belong to a much older cultural pattern than the source
              manuscript that preserves it. Reading the timeline with that in
              mind makes it easier to separate mythic sequence, historical
              period, and literary transmission.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Try using the timeline to frame specific questions: which
              traditions overlap with classical Greece, which mythic systems
              remain active into late antiquity, and which story worlds are
              separated by centuries even when they share familiar themes such
              as flood myths, underworld journeys, or divine kingship. That is
              where chronology stops being decorative and starts improving
              interpretation.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              For students, writers, and curious readers, the page can also act
              as a reading-order tool. Move from the broad timeline into a
              pantheon overview, then into deity profiles and individual
              narratives. That sequence gives each myth a clearer civilizational
              frame before you focus on characters and plot.
            </p>
          </div>
        </div>
      </section>
      <TimelinePageClient />
    </>
  );
}
