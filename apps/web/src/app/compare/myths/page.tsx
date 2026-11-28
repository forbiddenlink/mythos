import Link from "next/link";
import { Suspense } from "react";
import { Translated } from "@/components/i18n/Translated";
import { CompareNav } from "@/components/compare/CompareNav";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { getPantheons, getStories } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { listMythVersionComparisons } from "@/lib/myth-versions";
import { CompareMythsPageClient } from "./CompareMythsPageClient";

export default function Page() {
  const stories = getStories();
  const titles = new Map(stories.map(({ slug, title }) => [slug, title]));
  const comparisons = listMythVersionComparisons().flatMap((item) => {
    const title = titles.get(item.storySlug);
    return title ? [{ ...item, title }] : [];
  });

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
        {comparisons.length > 0 ? (
          <a
            href="#version-comparisons"
            className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-gold-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Translated namespace="pages.compareMyths" k="versionIndexJump" />
          </a>
        ) : null}
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
            storiesData={project(stories, [
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
        {comparisons.length > 0 ? (
          <section
            id="version-comparisons"
            aria-labelledby="version-comparisons-heading"
            tabIndex={-1}
            className="mt-14 scroll-mt-24 border-t border-border pt-8"
          >
            <h2 id="version-comparisons-heading" className="page-section-title">
              <Translated
                namespace="pages.compareMyths"
                k="versionIndexTitle"
              />
            </h2>
            <p className="mt-3 max-w-prose type-ui text-muted-foreground">
              <Translated
                namespace="pages.compareMyths"
                k="versionIndexDescription"
              />
            </p>
            <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
              {comparisons.map(({ storySlug, title, question }) => (
                <li key={storySlug} className="border-t border-border">
                  <Link
                    href={`/stories/${storySlug}#versions`}
                    prefetch={false}
                    lang="en"
                    className="group block rounded-sm py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    <span className="block font-serif text-lg text-foreground underline decoration-gold/45 underline-offset-4 group-hover:text-gold-text">
                      {title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {question}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
