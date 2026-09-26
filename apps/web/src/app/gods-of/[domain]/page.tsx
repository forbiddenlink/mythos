import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
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
        minHeight="min-h-[40vh]"
      />

      <div className="page-shell">
        <Breadcrumbs />

        <nav
          aria-label="Traditions on this page"
          className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-body text-base"
        >
          {page.traditions.map((tradition) => (
            <a
              key={tradition.pantheonId}
              href={`#${tradition.pantheonId}`}
              className="text-muted-foreground underline-offset-4 hover:text-gold-text hover:underline"
            >
              {tradition.name} ({tradition.deities.length})
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-12">
          {page.traditions.map((tradition) => (
            <section
              key={tradition.pantheonId}
              id={tradition.pantheonId}
              aria-labelledby={`${tradition.pantheonId}-heading`}
              className="scroll-mt-24"
            >
              <h2
                id={`${tradition.pantheonId}-heading`}
                className="page-section-title"
              >
                {tradition.name}
              </h2>
              <ul className="mt-4 divide-y divide-border/50 border-y border-border/50">
                {tradition.deities.map((deity) => (
                  <li key={deity.id} className="flex gap-4 py-4">
                    {deity.imageUrl ? (
                      <Image
                        src={deity.imageUrl}
                        alt=""
                        width={56}
                        height={56}
                        className="size-14 shrink-0 rounded-full border border-gold/30 object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 space-y-1">
                      <Link
                        href={`/deities/${deity.slug}`}
                        className="font-serif text-xl text-foreground underline-offset-4 hover:text-gold-text hover:underline"
                      >
                        {deity.name}
                      </Link>
                      {deity.description ? (
                        <p className="font-body leading-relaxed text-muted-foreground">
                          {deity.description}
                        </p>
                      ) : null}
                      <p className="text-sm text-muted-foreground">
                        <span className="text-gold-text">Domains:</span>{" "}
                        {deity.domains.join(", ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {page.parallels.length > 0 ? (
          <section className="mt-14" aria-labelledby="parallels-heading">
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
                      className="underline-offset-4 hover:text-gold-text hover:underline"
                    >
                      {parallel.a.name}
                    </Link>{" "}
                    <span className="text-muted-foreground">
                      ({parallel.a.tradition})
                    </span>{" "}
                    and{" "}
                    <Link
                      href={`/deities/${parallel.b.slug}`}
                      className="underline-offset-4 hover:text-gold-text hover:underline"
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
                      className="mt-1 inline-flex items-center gap-1 text-sm text-gold-text underline-offset-4 hover:underline"
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

        <section className="mt-14" aria-labelledby="answers-heading">
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
          <section className="mt-14" aria-labelledby="related-heading">
            <h2 id="related-heading" className="page-section-title">
              Related domains
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-body text-lg">
              {related.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/gods-of/${other.slug}`}
                    className="text-foreground underline-offset-4 hover:text-gold-text hover:underline"
                  >
                    {godsOfTitle(other)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-14 border-t border-border/50 pt-6 pb-16 text-sm text-muted-foreground">
          Built from each deity&apos;s catalog entry
          {page.matchedTerms.length > 1
            ? ` (matching ${page.matchedTerms.map((t) => `“${t}”`).join(", ")})`
            : ""}
          . See every domain side by side on{" "}
          <Link
            href="/divine-domains"
            className="text-gold-text underline-offset-4 hover:underline"
          >
            Divine Domains
          </Link>
          , or browse every{" "}
          <Link
            href="/compare/parallels"
            className="text-gold-text underline-offset-4 hover:underline"
          >
            cross-pantheon parallel
          </Link>
          .
        </p>
      </div>
    </>
  );
}
