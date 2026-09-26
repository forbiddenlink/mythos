import Link from "next/link";
import { Suspense } from "react";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { getDeities, getRelationships } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { RelationshipQuizPageClient } from "./RelationshipQuizPageClient";

export default function Page() {
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Family ties"
        mark="tree"
        title="Divine Relationships Quiz"
        lede="Test your knowledge of divine family ties, marriages and connections across pantheons."
      />
      <Container className="section-space-sm">
        <Suspense
          fallback={
            <div
              aria-busy="true"
              className="mx-auto h-[34rem] max-w-xl rounded-lg border border-border bg-muted/30"
            >
              <p role="status" className="sr-only">
                Loading quiz settings
              </p>
            </div>
          }
        >
          <RelationshipQuizPageClient
            deitiesData={project(getDeities(), [
              "id",
              "name",
              "slug",
              "pantheonId",
              "domain",
              "imageUrl",
            ])}
            relationshipsData={project(getRelationships(), [
              "id",
              "fromDeityId",
              "toDeityId",
              "relationshipType",
            ])}
          />
        </Suspense>
      </Container>
      <AboutThisPage title="Study mythology as a web of relationships">
        <p>
          This quiz is designed for the part of mythology that pure symbol
          recall cannot capture: who is related to whom, which marriages bind
          divine houses together, and where rivalries, siblings, and parentage
          change the meaning of a story.
        </p>
        <p>
          Use it after browsing the <Link href="/family-tree">family tree</Link>{" "}
          or a set of deity pages. The questions work best when you are testing
          structure, not just isolated facts, and they are a useful bridge
          between visual genealogy and narrative reading.
        </p>
        <p>
          If you want a wider practice loop, pair this route with the{" "}
          <Link href="/quiz/quick">quick quiz</Link> for speed and the{" "}
          <Link href="/games/memory">symbol memory game</Link> for recognition
          before returning here for relationship depth.
        </p>
        <p>
          That makes this page useful for more than trivia. It trains the
          connective tissue of mythology, which is often the difference between
          recognizing a name and actually understanding how a story or pantheon
          structure fits together. If parentage, marriage, and sibling questions
          keep blurring together, the issue is usually not one missed fact but
          an unclear internal map of the pantheon itself.
        </p>
      </AboutThisPage>
    </div>
  );
}
