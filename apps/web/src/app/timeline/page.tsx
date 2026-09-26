import type { Metadata } from "next";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
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
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Chronology"
        mark="chronos"
        title="Mythology Timeline"
        lede="See when traditions flourished and overlapped, or follow their stories from creation to the twilight of the gods."
      />
      <Container size="wide" className="pt-6 pb-4 md:pt-8">
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
      </Container>
      <AboutThisPage title="Using the interactive timeline" size="wide">
        <p>
          Read the dates as context, not a final authority: myths often outlive,
          or long predate, the manuscripts that preserve them. The story view
          groups tales by the era they describe, which is an editorial frame
          rather than a shared chronology.
        </p>
        <p>
          <strong>Navigation.</strong> Use your mouse wheel to zoom in up to 50x
          magnification, and click and drag to pan across eras. The era buttons
          and year fields jump straight to a range.
        </p>
        <p>
          <strong>Events and details.</strong> Hollow circles mark key mythical
          or historical events; hover over them for descriptions and dates.
        </p>
        <p>
          <strong>Pantheons.</strong> Coloured bars show catalog periods where
          dates are recorded. Collections without a shared period are labelled
          after the dated entries. Click an entry to highlight it and dim the
          others.
        </p>
        <p>
          <strong>Cosmic eras.</strong> In the story view, myths are grouped
          into five eras: the Primordial void, the Creation of worlds and gods,
          the Golden Age of divine rule, the Heroic Age of mortal champions, and
          the Decline or twilight of the gods. These editorial groupings help
          compare narrative patterns; they do not imply a shared chronology or
          the same sequence of eras in every tradition.
        </p>
      </AboutThisPage>
    </div>
  );
}
