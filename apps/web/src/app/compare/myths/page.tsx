import { Suspense } from "react";
import { Translated } from "@/components/i18n/Translated";
import { CompareNav } from "@/components/compare/CompareNav";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { getPantheons, getStories } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { CompareMythsPageClient } from "./CompareMythsPageClient";

export default function Page() {
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow={<Translated namespace="pages.compareMyths" k="heroTagline" />}
        mark="scales"
        title={<Translated namespace="pages.compareMyths" k="title" />}
        lede={<Translated namespace="pages.compareMyths" k="description" />}
      />
      <Container className="pt-2">
        <CompareNav current="/compare/myths" />
      </Container>
      <Container className="section-space-sm">
        <Suspense
          fallback={
            <p
              role="status"
              aria-busy="true"
              className="type-ui text-muted-foreground"
            >
              Loading the myth comparison…
            </p>
          }
        >
          <CompareMythsPageClient
            pantheonsData={project(getPantheons(), ["id", "name", "slug"])}
            storiesData={project(getStories(), [
              "id",
              "pantheonId",
              "title",
              "slug",
              "summary",
              "keyExcerpts",
              "category",
              "moralThemes",
              "culturalSignificance",
              "imageUrl",
              "citationSources",
            ])}
          />
        </Suspense>
      </Container>
    </div>
  );
}
