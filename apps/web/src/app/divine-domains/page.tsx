import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Section, SectionHeading } from "@/components/layout/section";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { getDeities, getPantheonShortNames } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { getGodsOfDomains, godsOfTitle } from "@/lib/gods-of";
import { DivineDomainsPageClient } from "./DivineDomainsPageClient";

/**
 * The hub for domains of influence. The interactive explorer is client-side;
 * the index below is server-rendered so every "gods of <domain>" page is one
 * crawlable link away from here.
 */
function DomainIndex() {
  const pages = getGodsOfDomains();
  return (
    <Section tone="muted" spacing="md" aria-labelledby="domain-index-heading">
      <ItemListJsonLd
        name="Gods by domain"
        description="Every divine domain held by at least three deities in two or more traditions."
        url="/divine-domains"
        items={pages.map((page, index) => ({
          name: godsOfTitle(page),
          url: `/gods-of/${page.slug}`,
          position: index + 1,
        }))}
      />
      <SectionHeading
        id="domain-index-heading"
        eyebrow="Index"
        title="Every domain, deity by deity"
        description="One page per domain that at least three deities in two or more traditions share."
      />
      <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <li
            key={page.slug}
            className="flex items-baseline justify-between gap-3 border-t border-border/60 py-3"
          >
            <Link
              href={`/gods-of/${page.slug}`}
              className="font-serif text-lg text-foreground underline decoration-gold/40 underline-offset-4 hover:text-gold-text hover:decoration-current"
            >
              {godsOfTitle(page)}
            </Link>
            <span className="shrink-0 type-meta text-muted-foreground tabular-nums">
              {page.deityCount} · {page.traditions.length} traditions
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default function DivineDomainsPage() {
  return (
    <>
      <PageHeader
        mark="compass"
        eyebrow="Cross-pantheon comparison"
        title="Divine Domains"
        lede="Compare the deities who share a sphere of influence, from war and wisdom to love and death."
      />
      <DivineDomainsPageClient
        deities={project(getDeities(), [
          "id",
          "name",
          "slug",
          "pantheonId",
          "domain",
          "description",
          "imageUrl",
          "alternateNames",
          "importanceRank",
          "crossPantheonParallels",
        ])}
        pantheonNames={getPantheonShortNames()}
        domainPages={Object.fromEntries(
          getGodsOfDomains().flatMap((page) =>
            page.matchedTerms.map((term) => [term, page.slug]),
          ),
        )}
      />
      <DomainIndex />
    </>
  );
}
