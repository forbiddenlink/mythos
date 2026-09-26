import Link from "next/link";
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
    <section
      aria-labelledby="domain-index-heading"
      className="page-shell pb-20"
    >
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
      <h2 id="domain-index-heading" className="page-section-title">
        Every domain, deity by deity
      </h2>
      <p className="mt-2 max-w-[68ch] font-body text-muted-foreground">
        One page per domain that at least three deities in two or more
        traditions share, listing each of them with their entry&apos;s own
        description.
      </p>
      <ul className="mt-6 grid gap-x-8 gap-y-2 font-body text-lg sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/gods-of/${page.slug}`}
              className="text-foreground underline-offset-4 hover:text-gold-text hover:underline"
            >
              {godsOfTitle(page)}
            </Link>{" "}
            <span className="text-sm text-muted-foreground">
              {page.deityCount} · {page.traditions.length} traditions
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DivineDomainsPage() {
  return (
    <>
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
