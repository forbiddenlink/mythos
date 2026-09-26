import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { EntityCard } from "@/components/entities/EntityCard";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import {
  CollectionPageJsonLd,
  FAQJsonLd,
  ItemListJsonLd,
} from "@/components/seo/JsonLd";
import {
  domainSlug,
  getGodsOfDomain,
  getGodsOfDomains,
  godsOfFaq,
  godsOfTitle,
  type GodsOfDomain,
} from "@/lib/gods-of";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import { getPantheonColor } from "@/lib/pantheon-colors";

interface PageProps {
  params: Promise<{ domain: string }>;
}

// Every qualifying domain is prerendered; anything else is a static 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getGodsOfDomains().map((page) => ({ domain: page.slug }));
}

function listNames(page: GodsOfDomain, limit: number): string {
  return page.traditions
    .flatMap((t) => t.deities.slice(0, 1))
    .concat(page.traditions.flatMap((t) => t.deities.slice(1)))
    .slice(0, limit)
    .map((d) => d.name)
    .join(", ");
}

function lede(page: GodsOfDomain): string {
  return `${page.deityCount} deities from ${page.traditions.length} traditions whose entries in this atlas list ${page.domain} among their domains, grouped by tradition.`;
}

export async function generateMetadata({
  params,
}: Readonly<PageProps>): Promise<Metadata> {
  const { domain } = await params;
  const page = getGodsOfDomain(domain);
  if (!page) {
    return generateNotFoundMetadata(
      "Domain Not Found",
      "No domain page exists for this name.",
    );
  }
  const title = `${godsOfTitle(page)} in World Mythology`;
  return generateBaseMetadata({
    title,
    description:
      `${listNames(page, 6)} and more: ${page.deityCount} gods and goddesses of ${page.domain} from ${page.traditions.length} traditions, with their parallels and sources.`.slice(
        0,
        300,
      ),
    url: `/gods-of/${page.slug}`,
    image: null,
    keywords: [
      `god of ${page.domain}`,
      `gods of ${page.domain}`,
      `goddess of ${page.domain}`,
      ...page.traditions
        .slice(0, 5)
        .map((t) => `${t.name} god of ${page.domain}`),
      "divine domains",
    ],
  });
}

/** Other qualifying domains most often held by the same deities. */
function relatedDomains(page: GodsOfDomain, limit = 10) {
  const available = new Map(getGodsOfDomains().map((p) => [p.slug, p]));
  const counts = new Map<string, number>();
  for (const tradition of page.traditions) {
    for (const deity of tradition.deities) {
      for (const raw of deity.domains) {
        const slug = domainSlug(raw);
        if (slug === page.slug || !available.has(slug)) continue;
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
    .slice(0, limit)
    .map(([slug]) => available.get(slug))
    .filter((p): p is GodsOfDomain => p !== undefined);
}

export default async function GodsOfDomainPage({
  params,
}: Readonly<PageProps>) {
  const { domain } = await params;
  const page = getGodsOfDomain(domain);
  if (!page) notFound();

  const title = godsOfTitle(page);
  const faq = godsOfFaq(page);
  const related = relatedDomains(page);
  const url = `/gods-of/${page.slug}`;
  let position = 0;
  const items = page.traditions.flatMap((tradition) =>
    tradition.deities.map((deity) => ({
      name: deity.name,
      url: `/deities/${deity.slug}`,
      position: ++position,
    })),
  );

  return (
    <>
      <CollectionPageJsonLd
        name={`${title} in World Mythology`}
        description={lede(page)}
        url={url}
        numberOfItems={page.deityCount}
      />
      <ItemListJsonLd
        name={title}
        description={lede(page)}
        url={url}
        items={items}
      />
      <FAQJsonLd questions={faq} />

      <PageHero
        mark="constellation"
        tagline="Divine domains"
        title={title}
        description={lede(page)}
      />

      <Container className="pt-6 pb-4 md:pt-8">
        <nav aria-label="Traditions on this page">
          <ul className="flex flex-wrap gap-1.5">
            {page.traditions.map((tradition) => (
              <li key={tradition.pantheonId}>
                <a
                  href={`#${tradition.pantheonId}`}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm text-foreground/85 transition-colors hover:border-gold/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: getPantheonColor(tradition.pantheonId),
                    }}
                    aria-hidden="true"
                  />
                  {tradition.name}
                  <span className="text-muted-foreground tabular-nums">
                    {tradition.deities.length}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <Container className="pb-16">
        <div className="mt-6 md:mt-8">
          {page.traditions.map((tradition) => (
            <section
              key={tradition.pantheonId}
              id={tradition.pantheonId}
              aria-labelledby={`${tradition.pantheonId}-heading`}
              className="grid scroll-mt-24 gap-x-10 gap-y-2 border-t border-border/70 py-6 lg:grid-cols-[13rem_minmax(0,1fr)]"
            >
              <div className="flex items-baseline justify-between gap-4 lg:block">
                <h2
                  id={`${tradition.pantheonId}-heading`}
                  className="font-serif text-2xl font-semibold leading-tight text-foreground"
                >
                  {tradition.name}
                </h2>
                <p className="type-meta mt-1 shrink-0 text-muted-foreground">
                  {tradition.deities.length}{" "}
                  {tradition.deities.length === 1 ? "deity" : "deities"}
                </p>
              </div>
              <div className="grid gap-x-8 md:grid-cols-2">
                {tradition.deities.map((deity) => (
                  <EntityCard
                    key={deity.id}
                    variant="list"
                    href={`/deities/${deity.slug}`}
                    title={deity.name}
                    image={deity.imageUrl}
                    imagePosition="50% 22%"
                    aspect="portrait"
                    traditionColor={getPantheonColor(tradition.pantheonId)}
                    subtitle={deity.domains.slice(0, 3).join(" · ")}
                    description={deity.description}
                    descriptionLines={3}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {page.parallels.length > 0 ? (
          <section
            className="mt-16 max-w-reading"
            aria-labelledby="parallels-heading"
          >
            <h2 id="parallels-heading" className="page-section-title">
              Parallels across traditions
            </h2>
            <p className="mt-2 font-body text-muted-foreground">
              Editorial comparisons recorded on these entries; a shared role
              does not establish a shared origin.
            </p>
            <ul className="mt-4 space-y-4">
              {page.parallels.map((parallel) => (
                <li
                  key={`${parallel.a.slug}-${parallel.b.slug}`}
                  className="border-l-2 border-gold/40 pl-4"
                >
                  <p className="font-body text-lg text-foreground">
                    <Link
                      href={`/deities/${parallel.a.slug}`}
                      className="underline decoration-gold/50 underline-offset-4 hover:text-gold-text hover:decoration-current"
                    >
                      {parallel.a.name}
                    </Link>{" "}
                    <span className="text-muted-foreground">
                      ({parallel.a.tradition})
                    </span>{" "}
                    and{" "}
                    <Link
                      href={`/deities/${parallel.b.slug}`}
                      className="underline decoration-gold/50 underline-offset-4 hover:text-gold-text hover:decoration-current"
                    >
                      {parallel.b.name}
                    </Link>{" "}
                    <span className="text-muted-foreground">
                      ({parallel.b.tradition})
                    </span>
                  </p>
                  <p className="mt-1 font-body text-muted-foreground">
                    {parallel.note}
                  </p>
                  {parallel.compareSlug ? (
                    <Link
                      href={`/compare/${parallel.compareSlug}`}
                      className="mt-1 inline-flex items-center gap-1 text-sm text-gold-text underline decoration-gold/50 underline-offset-4 hover:decoration-current"
                    >
                      Compare {parallel.a.name} and {parallel.b.name}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          className="mt-16 max-w-reading"
          aria-labelledby="answers-heading"
        >
          <h2 id="answers-heading" className="page-section-title">
            Quick answers
          </h2>
          <dl className="mt-4 space-y-5">
            {faq.map((entry) => (
              <div key={entry.question}>
                <dt className="font-serif text-lg text-foreground">
                  {entry.question}
                </dt>
                <dd className="mt-1 font-body text-muted-foreground">
                  {entry.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {related.length > 0 ? (
          <section className="mt-16" aria-labelledby="related-heading">
            <h2 id="related-heading" className="page-section-title">
              Related domains
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {related.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/gods-of/${other.slug}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-border bg-background px-4 type-ui text-foreground transition-colors hover:border-gold/60 hover:text-gold-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {godsOfTitle(other)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-16 max-w-reading border-t border-border/50 pt-6 type-ui text-muted-foreground">
          Built from each deity&apos;s catalog entry
          {page.matchedTerms.length > 1
            ? ` (matching ${page.matchedTerms.map((t) => `“${t}”`).join(", ")})`
            : ""}
          . See every domain side by side on{" "}
          <Link
            href="/divine-domains"
            className="text-gold-text underline decoration-gold/50 underline-offset-4 hover:decoration-current"
          >
            Divine Domains
          </Link>
          , or browse every{" "}
          <Link
            href="/compare/parallels"
            className="text-gold-text underline decoration-gold/50 underline-offset-4 hover:decoration-current"
          >
            cross-pantheon parallel
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
