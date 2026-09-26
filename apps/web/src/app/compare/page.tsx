import { Suspense } from "react";
import { Translated } from "@/components/i18n/Translated";
import { CompareNav } from "@/components/compare/CompareNav";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import {
  DEITY_LIST_FIELDS,
  getDeities,
  getPantheons,
  resolveParallelRefs,
} from "@/lib/data/catalog";
import { pick, project } from "@/lib/data/project";
import { ComparePageClient } from "./ComparePageClient";

/** Prerendered stand-in while the selection is read from the URL. */
function CompareSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading the comparison tool
      </p>
      <div className="h-9 w-72 rounded-md bg-muted" />
      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-muted/70" />
        ))}
      </div>
      <div className="mt-4 h-12 w-full rounded-md bg-muted/60" />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-22 rounded-lg bg-muted/50" />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow={<Translated namespace="pages.compare" k="heroTagline" />}
        mark="scales"
        title={<Translated namespace="pages.compare" k="title" />}
        lede="Set up to four gods side by side to see where their domains, symbols and roles meet and where they part."
      />
      <Container className="pt-2">
        <CompareNav current="/compare" />
      </Container>
      <Container className="section-space-sm">
        <Suspense fallback={<CompareSkeleton />}>
          <ComparePageClient
            deitiesData={getDeities().map((deity) => ({
              ...pick(deity, DEITY_LIST_FIELDS),
              crossPantheonParallels: resolveParallelRefs(deity),
            }))}
            pantheonsData={project(getPantheons(), ["id", "name", "slug"])}
          />
        </Suspense>
      </Container>
      <AboutThisPage title="Compare roles, symbols, and overlaps">
        <p>
          This comparison view is designed for cross-reading. Pick deities from
          one culture or mix figures across multiple pantheons to see where
          their roles align, where their symbols diverge, and which attributes
          were shared across ancient traditions.
        </p>
        <p>
          The most useful comparisons often pair a well-known deity with a less
          familiar counterpart. That makes it easier to spot patterns in
          rulership, war, love, fertility, the underworld, and celestial
          authority without flattening the myths into one generic archetype.
        </p>
        <p>
          Once you have a comparison on screen, use it as a launch point into
          stories, source excerpts, and pantheon pages. The strongest matches
          are often the ones that look similar at first glance but diverge in
          mythic function once you read the surrounding narratives.
        </p>
        <p>
          You can also use this tool as a reading guide. Compare first to frame
          the question, then move outward into the original myths and supporting
          pages to see how each culture defines sovereignty, kinship, justice,
          fate, or divine power on its own terms.
        </p>
        <p>
          When a comparison feels especially close, check the linked pantheon
          context before calling two figures equivalents. Shared domains often
          hide major differences in ritual role, moral character, or place in
          the larger cosmology, and those differences are usually where the most
          interesting reading begins.
        </p>
      </AboutThisPage>
    </div>
  );
}
