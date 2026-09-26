import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageHero } from "@/components/layout/page-hero";
import { ArticleJsonLd, FAQJsonLd } from "@/components/seo/JsonLd";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import {
  getDeityComparison,
  getDeityComparisons,
  getRelatedComparisons,
  type ComparisonDeity,
  type DeityComparison,
} from "@/lib/comparisons";

interface PageProps {
  params: Promise<{ pair: string }>;
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

export async function generateStaticParams() {
  return getDeityComparisons().map((comparison) => ({
    pair: comparison.slug,
  }));
}

/** One sentence saying why these two share a page, used as the lede and the description. */
function basisSentence(comparison: DeityComparison): string {
  const { a, b, basis } = comparison;
  if (basis.kind === "parallel") {
    return basis.notes[0] ?? "";
  }
  if (basis.relation === "parent and child") {
    return `${a.displayName} and ${b.displayName} are recorded in a parent-and-child line within the ${a.pantheonName}.`;
  }
  if (basis.relation === "rivals") {
    return `${a.displayName} and ${b.displayName} stand in recorded opposition within the ${a.pantheonName}.`;
  }
  return `${a.displayName} and ${b.displayName} are recorded as siblings within the ${a.pantheonName}.`;
}

function headline(comparison: DeityComparison): string {
  return `${comparison.a.displayName} vs ${comparison.b.displayName}`;
}

export async function generateMetadata({
  params,
}: Readonly<PageProps>): Promise<Metadata> {
  const { pair } = await params;
  const comparison = getDeityComparison(pair);

  if (!comparison) {
    return generateNotFoundMetadata(
      "Comparison Not Found",
      "This comparison is not part of the atlas.",
    );
  }

  const { a, b } = comparison;
  const title = headline(comparison);
  const description = `${title}: domains, symbols, origins, and where the two traditions actually line up. ${basisSentence(comparison)}`;

  return generateBaseMetadata({
    title,
    description: description.slice(0, 300),
    url: `/compare/${comparison.slug}`,
    type: "article",
    keywords: [
      `${a.name} vs ${b.name}`,
      `${b.name} vs ${a.name}`,
      `${a.name} and ${b.name}`,
      `${a.name} ${b.name} comparison`,
      a.pantheonName,
      b.pantheonName,
      "comparative mythology",
    ],
  });
}

function TraitRow({
  label,
  a,
  b,
}: Readonly<{ label: string; a: string; b: string }>) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-4 border-b border-border/40 py-3 last:border-b-0 sm:gap-6">
      <p className="font-body text-base text-foreground">{a}</p>
      <p className="page-eyebrow whitespace-nowrap text-center text-muted-foreground">
        {label}
      </p>
      <p className="text-right font-body text-base text-foreground">{b}</p>
    </div>
  );
}

function DeityAccount({ deity }: Readonly<{ deity: ComparisonDeity }>) {
  return (
    <article className="space-y-4">
      <h3 className="page-section-title">{deity.displayName}</h3>
      <p className="page-eyebrow text-muted-foreground">{deity.pantheonName}</p>
      {deity.description ? (
        <p className="font-body text-lg leading-relaxed text-foreground">
          {deity.description}
        </p>
      ) : null}
      {deity.originStory ? (
        <p className="font-body leading-relaxed text-muted-foreground">
          {deity.originStory}
        </p>
      ) : null}
      {deity.bioExcerpt ? (
        <p className="font-body leading-relaxed text-muted-foreground">
          {deity.bioExcerpt}
        </p>
      ) : null}
      <Button asChild variant="outline" size="sm">
        <Link href={`/deities/${deity.slug}`}>
          Read the full {deity.name} entry
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}

function WorshipAccount({ deity }: Readonly<{ deity: ComparisonDeity }>) {
  const { temples, festivals, practices } = deity.worship;
  return (
    <div className="space-y-3">
      <p className="page-eyebrow text-muted-foreground">{deity.displayName}</p>
      {temples.length > 0 ? (
        <p className="font-body leading-relaxed">
          <span className="text-gold-text">Cult sites:</span>{" "}
          {temples.join(", ")}.
        </p>
      ) : null}
      {festivals.length > 0 ? (
        <p className="font-body leading-relaxed">
          <span className="text-gold-text">Festivals:</span>{" "}
          {festivals.join(", ")}.
        </p>
      ) : null}
      {practices ? (
        <p className="font-body leading-relaxed text-muted-foreground">
          {practices}
        </p>
      ) : null}
    </div>
  );
}

function hasWorshipDetail(deity: ComparisonDeity): boolean {
  const { temples, festivals, practices } = deity.worship;
  return temples.length > 0 || festivals.length > 0 || Boolean(practices);
}

export default async function ComparisonPage({ params }: Readonly<PageProps>) {
  const { pair } = await params;
  const comparison = getDeityComparison(pair);

  if (!comparison) notFound();

  const { a, b, sharedDomains, sharedSymbols, distinctDomains } = comparison;
  const title = headline(comparison);
  const lede = basisSentence(comparison);
  const related = getRelatedComparisons(comparison);
  const hasWorship = hasWorshipDetail(a) || hasWorshipDetail(b);

  const faq = [
    {
      question: `How are ${a.displayName} and ${b.displayName} related?`,
      answer: lede,
    },
    {
      question: `What do ${a.name} and ${b.name} have in common?`,
      answer: sharedDomains.length
        ? `Both hold ${sharedDomains.join(", ")}.`
        : `They share no domain in this atlas: ${a.name} holds ${a.domain.join(", ")}, while ${b.name} holds ${b.domain.join(", ")}.`,
    },
    {
      question: `Which traditions do they belong to?`,
      answer: comparison.sameTradition
        ? `Both belong to the ${a.pantheonName}.`
        : `${a.displayName} belongs to the ${a.pantheonName}; ${b.displayName} belongs to the ${b.pantheonName}.`,
    },
  ];

  return (
    <>
      <ArticleJsonLd
        headline={title}
        description={lede}
        url={`/compare/${comparison.slug}`}
        section="Comparative mythology"
        tags={[a.name, b.name, a.pantheonName, b.pantheonName]}
      />
      <FAQJsonLd questions={faq} />

      <PageHero
        mark="scales"
        tagline="Side by side"
        title={title}
        description={lede}
      />

      <div className="page-shell">
        <Breadcrumbs />

        <section className="mt-10 space-y-6">
          <h2 className="page-section-title">At a glance</h2>
          <div className="rounded-lg border border-border/60 bg-card/40 px-5 py-2 sm:px-8">
            <TraitRow label="tradition" a={a.pantheonName} b={b.pantheonName} />
            <TraitRow
              label="domains"
              a={a.domain.join(", ") || "—"}
              b={b.domain.join(", ") || "—"}
            />
            <TraitRow
              label="symbols"
              a={a.symbols.join(", ") || "—"}
              b={b.symbols.join(", ") || "—"}
            />
            <TraitRow
              label="also called"
              a={a.alternateNames.join(", ") || "—"}
              b={b.alternateNames.join(", ") || "—"}
            />
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="page-section-title">Where they meet</h2>
          {sharedDomains.length > 0 || sharedSymbols.length > 0 ? (
            <div className="space-y-4">
              {sharedDomains.length > 0 ? (
                <p className="font-body text-lg leading-relaxed">
                  Both are gods of{" "}
                  <span className="text-gold-text">
                    {sharedDomains.join(", ")}
                  </span>
                  .
                </p>
              ) : null}
              {sharedSymbols.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="page-eyebrow text-muted-foreground">
                    shared symbols
                  </span>
                  {sharedSymbols.map((symbol) => (
                    <Badge key={symbol} variant="secondary">
                      {symbol}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="font-body text-lg leading-relaxed text-muted-foreground">
              The atlas records no shared domain or symbol between them. What
              connects them is elsewhere: {lede}
            </p>
          )}
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="page-section-title">Where they part</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="page-eyebrow text-muted-foreground">
                {a.displayName} alone
              </p>
              <p className="mt-2 font-body text-lg leading-relaxed">
                {distinctDomains.a.join(", ") || "Nothing this atlas records."}
              </p>
            </div>
            <div>
              <p className="page-eyebrow text-muted-foreground">
                {b.displayName} alone
              </p>
              <p className="mt-2 font-body text-lg leading-relaxed">
                {distinctDomains.b.join(", ") || "Nothing this atlas records."}
              </p>
            </div>
          </div>
        </section>

        {comparison.basis.kind === "parallel" &&
        comparison.basis.notes.length > 1 ? (
          <section className="mt-12 space-y-4">
            <h2 className="page-section-title">Why they are compared</h2>
            <ul className="space-y-3">
              {comparison.basis.notes.map((note) => (
                <li
                  key={note}
                  className="border-l-2 border-gold/50 pl-4 font-body text-lg leading-relaxed"
                >
                  {note}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasWorship ? (
          <section className="mt-12 space-y-4">
            <h2 className="page-section-title">How each was worshipped</h2>
            <div className="grid gap-8 sm:grid-cols-2">
              <WorshipAccount deity={a} />
              <WorshipAccount deity={b} />
            </div>
          </section>
        ) : null}

        <section className="mt-12 grid gap-10 sm:grid-cols-2">
          <DeityAccount deity={a} />
          <DeityAccount deity={b} />
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="page-section-title">Compare something else</h2>
          {related.length > 0 ? (
            <ul className="columns-1 gap-6 sm:columns-2">
              {related.map((other) => (
                <li key={other.slug} className="mb-2 break-inside-avoid">
                  <Link
                    className="font-body text-lg text-foreground underline-offset-4 hover:text-gold-text hover:underline"
                    href={`/compare/${other.slug}`}
                  >
                    {headline(other)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <Button asChild variant="gold" size="lg">
            <Link href="/compare">
              <Scale className="size-4" aria-hidden="true" />
              Build your own comparison
            </Link>
          </Button>
        </section>
      </div>
    </>
  );
}
