import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { generateBaseMetadata } from "@/lib/metadata";
import { AttestationTimeline } from "@/components/timeline/AttestationTimeline";
import eventsData from "@/data/events.json";
import { getDeities, getPantheons, getStories } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { attestationPoints } from "@/lib/attestation";
import {
  TimelinePageClient,
  type TimelineEvent,
  type TimelinePantheon,
} from "./TimelinePageClient";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Timeline",
  description:
    "Two timelines in one: the historical periods and dated events of the world's mythic traditions, and their stories arranged by cosmic era from creation to the twilight of the gods.",
  url: "/timeline",
});

export default function TimelinePage() {
  const pantheons: TimelinePantheon[] = getPantheons().map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    culture: p.culture,
    region: p.region,
    timePeriodStart: p.timePeriodStart ?? null,
    timePeriodEnd: p.timePeriodEnd ?? null,
    description: p.description ?? null,
  }));
  const deities = getDeities();

  return (
    <>
      <PageHero
        mark="chronos"
        tagline="Chronology"
        title="Mythology Timeline"
        description="See when traditions flourished and overlapped, or follow their stories from creation to the twilight of the gods."
        backgroundImage="/stories-hero.jpg"
        backgroundAlt="A mythic landscape representing the passage of eras and civilizations"
      />
      <section className="bg-mythic">
        <div className="container mx-auto max-w-5xl px-4 pt-10">
          <p className="max-w-3xl font-body text-lg leading-relaxed text-muted-foreground">
            Read the dates as context, not a final authority: myths often
            outlive, or long predate, the manuscripts that preserve them. The
            story view groups tales by the era they describe, which is an
            editorial frame rather than a shared chronology.
          </p>
        </div>
      </section>
      <TimelinePageClient
        pantheons={pantheons}
        events={eventsData as TimelineEvent[]}
        stories={project(getStories(), [
          "id",
          "pantheonId",
          "title",
          "slug",
          "summary",
          "category",
        ])}
        attestation={
          <AttestationTimeline
            points={attestationPoints(deities)}
            total={deities.length}
          />
        }
      />
    </>
  );
}
