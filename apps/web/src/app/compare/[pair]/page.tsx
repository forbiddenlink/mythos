import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Scale } from "lucide-react";
import {
  ArticleStack,
  FactLink,
  TagList,
} from "@/components/content/detail-parts";
import { ReadingParagraph } from "@/components/content/reading-prose";
import { AboutThisPage } from "@/components/layout/about-this-page";
import {
  ArticleSection,
  AsideLinks,
  DetailHero,
  DetailLayout,
  FactList,
  type TocItem,
} from "@/components/layout/detail-layout";
import { ArticleJsonLd, FAQJsonLd } from "@/components/seo/JsonLd";
import {
  getDeityComparison,
  getDeityComparisons,
  getRelatedComparisons,
  type ComparisonDeity,
  type DeityComparison,
} from "@/lib/comparisons";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import { getPantheonColor } from "@/lib/pantheon-colors";

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

const listFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

/** "sky, thunder and justice" as readers write it. */
function list(items: readonly string[]): string {
  return listFormat.format(items.map((item) => item.toLowerCase()));
}

function sentence(text: string): string {
  const trimmed = text.trim();
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function shortTradition(deity: ComparisonDeity): string {
  return deity.pantheonName.replace(/\s+(Pantheon|Tradition|Traditions)$/, "");
}

/** One sentence saying why these two share a page (lede and description). */
function basisSentence(comparison: DeityComparison): string {
  const { a, b, basis } = comparison;
  if (basis.kind === "parallel") {
    const note = basis.notes[0];
    return note
      ? sentence(note)
      : `${a.displayName} and ${b.displayName} hold comparable places in the ${shortTradition(a)} and ${shortTradition(b)} traditions.`;
  }
  if (basis.relation === "parent and child") {
    return `${a.displayName} and ${b.displayName} are recorded as parent and child in the ${a.pantheonName}.`;
  }
  if (basis.relation === "rivals") {
    return `${a.displayName} and ${b.displayName} are recorded as rivals in the ${a.pantheonName}.`;
  }
  return `${a.displayName} and ${b.displayName} are recorded as siblings in the ${a.pantheonName}.`;
}

/** Plain-language account of what the two share. */
function meetingSentences(comparison: DeityComparison): string[] {
  const { a, b, sharedDomains, sharedSymbols, basis } = comparison;
  const sentences: string[] = [];
  if (sharedDomains.length > 0) {
    sentences.push(`Both are associated with ${list(sharedDomains)}.`);
  }
  if (sharedSymbols.length > 0) {
    sentences.push(
      `They share ${sharedSymbols.length === 1 ? "a symbol" : "symbols"}: ${list(sharedSymbols)}.`,
    );
  }
  if (sentences.length === 0) {
    sentences.push(
      `The atlas records no domain or symbol that ${a.name} and ${b.name} share.`,
    );
    sentences.push(
      basis.kind === "parallel"
        ? "They are compared for the part each plays in their own tradition rather than for any attribute in common."
        : "They are compared because of how the myths connect them, not because of what they rule.",
    );
  }
  return sentences;
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
    image: null,
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

/** The two portraits, facing each other across a "vs" seal. */
function PairPortraits({ a, b }: { a: ComparisonDeity; b: ComparisonDeity }) {
  return (
    <div className="relative mx-auto grid w-full max-w-[20rem] grid-cols-2 gap-3 md:max-w-none">
      {[a, b].map((deity) => (
        <figure key={deity.id} className="min-w-0">
          <Link
            href={`/deities/${deity.slug}`}
            className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <span className="relative block aspect-4/5 overflow-hidden rounded-md bg-midnight-light shadow-2xl shadow-black/50 ring-1 ring-gold/25">
              {deity.imageUrl ? (
                <Image
                  src={deity.imageUrl}
                  alt={deity.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 14rem, (min-width: 768px) 10rem, 9rem"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : (
                <span
                  className="flex h-full items-center justify-center font-serif text-6xl text-gold/70"
                  aria-hidden="true"
                >
                  {deity.name.charAt(0)}
                </span>
              )}
            </span>
          </Link>
          <figcaption className="mt-2.5 text-center">
            <span className="block font-serif text-lg leading-tight text-parchment">
              {deity.displayName}
            </span>
            <span className="mt-0.5 flex items-center justify-center gap-1.5 type-meta text-parchment/75">
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: getPantheonColor(deity.pantheonId) }}
                aria-hidden="true"
              />
              {shortTradition(deity)}
            </span>
          </figcaption>
        </figure>
      ))}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-[40%] flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/60 bg-midnight font-serif text-sm uppercase tracking-widest text-gold-light shadow-lg"
      >
        vs
      </span>
    </div>
  );
}

function DeityAccount({ deity }: Readonly<{ deity: ComparisonDeity }>) {
  return (
    <article className="min-w-0">
      <p className="type-eyebrow">{deity.pantheonName}</p>
      <h3 className="type-h3 mt-1 text-foreground">{deity.displayName}</h3>
      <div className="mt-3 space-y-3 font-body text-[1.0625rem] leading-relaxed text-foreground/90">
        {deity.description ? <p>{deity.description}</p> : null}
        {deity.originStory ? (
          <p className="text-muted-foreground">{deity.originStory}</p>
        ) : null}
        {deity.bioExcerpt ? (
          <p className="text-muted-foreground">{deity.bioExcerpt}</p>
        ) : null}
      </div>
      <Link
        href={`/deities/${deity.slug}`}
        className="mt-4 inline-flex min-h-10 items-center gap-1.5 type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
      >
        Read the full {deity.name} entry
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

function WorshipAccount({ deity }: Readonly<{ deity: ComparisonDeity }>) {
  const { temples, festivals, practices } = deity.worship;
  if (temples.length === 0 && festivals.length === 0 && !practices) {
    return (
      <div className="min-w-0">
        <h3 className="type-h3 text-foreground">{deity.displayName}</h3>
        <p className="mt-2 type-ui text-muted-foreground">
          No cult sites or festivals are recorded in the atlas.
        </p>
      </div>
    );
  }
  return (
    <div className="min-w-0">
      <h3 className="type-h3 text-foreground">{deity.displayName}</h3>
      <dl className="mt-3 space-y-3 type-ui">
        {temples.length > 0 ? (
          <div>
            <dt className="text-muted-foreground">Cult sites</dt>
            <dd className="text-foreground">{temples.join("; ")}</dd>
          </div>
        ) : null}
        {festivals.length > 0 ? (
          <div>
            <dt className="text-muted-foreground">Festivals</dt>
            <dd className="text-foreground">{festivals.join("; ")}</dd>
          </div>
        ) : null}
      </dl>
      {practices ? (
        <p className="mt-3 font-body text-[1.0625rem] leading-relaxed text-foreground/90">
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

  const { a, b, sharedDomains, sharedSymbols, distinctDomains, basis } =
    comparison;
  const title = headline(comparison);
  const lede = basisSentence(comparison);
  const related = getRelatedComparisons(comparison);
  const hasWorship = hasWorshipDetail(a) || hasWorshipDetail(b);
  // The first note is the lede; the others explain the pairing further.
  const furtherNotes = basis.kind === "parallel" ? basis.notes.slice(1) : [];
  const meeting = meetingSentences(comparison);

  const faq = [
    {
      question: `How are ${a.displayName} and ${b.displayName} related?`,
      answer: lede,
    },
    {
      question: `What do ${a.name} and ${b.name} have in common?`,
      answer: sharedDomains.length
        ? `Both are associated with ${list(sharedDomains)}.`
        : `They share no domain in this atlas: ${a.name} is associated with ${list(a.domain)}, and ${b.name} with ${list(b.domain)}.`,
    },
    {
      question: `Which traditions do they belong to?`,
      answer: comparison.sameTradition
        ? `Both belong to the ${a.pantheonName}.`
        : `${a.displayName} belongs to the ${a.pantheonName}, and ${b.displayName} to the ${b.pantheonName}.`,
    },
  ];

  const toc: TocItem[] = [
    { id: "glance", label: "At a glance" },
    { id: "meet", label: "Where they meet" },
    { id: "part", label: "Where they part" },
    ...(furtherNotes.length > 0
      ? [{ id: "why", label: "Why they are compared" }]
      : []),
    ...(hasWorship ? [{ id: "worship", label: "Worship" }] : []),
    { id: "accounts", label: "The two figures" },
  ];

  const relationLabel =
    basis.kind === "parallel"
      ? comparison.sameTradition
        ? "Parallel figures"
        : "Parallel across traditions"
      : basis.relation === "parent and child"
        ? "Parent and child"
        : basis.relation === "rivals"
          ? "Rivals"
          : "Siblings";

  const facts = (
    <FactList
      facts={[
        {
          label: comparison.sameTradition ? "Tradition" : "Traditions",
          value: comparison.sameTradition
            ? a.pantheonName
            : `${shortTradition(a)} and ${shortTradition(b)}`,
        },
        { label: "Compared as", value: relationLabel },
        {
          label: "Shared domains",
          value: sharedDomains.length ? (
            <span className="capitalize">{sharedDomains.join(", ")}</span>
          ) : (
            "None recorded"
          ),
        },
        {
          label: "Entries",
          value: (
            <>
              <FactLink href={`/deities/${a.slug}`}>{a.name}</FactLink>,{" "}
              <FactLink href={`/deities/${b.slug}`}>{b.name}</FactLink>
            </>
          ),
        },
      ]}
    />
  );

  const rows: Array<{ label: string; a: string; b: string }> = [
    { label: "Tradition", a: a.pantheonName, b: b.pantheonName },
    {
      label: "Domains",
      a: a.domain.join(", ") || "None recorded",
      b: b.domain.join(", ") || "None recorded",
    },
    {
      label: "Symbols",
      a: a.symbols.join(", ") || "None recorded",
      b: b.symbols.join(", ") || "None recorded",
    },
    {
      label: "Also called",
      a: a.alternateNames.join(", ") || "None recorded",
      b: b.alternateNames.join(", ") || "None recorded",
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

      <DetailLayout
        hero={
          <DetailHero
            accentColor={getPantheonColor(a.pantheonId)}
            media={<PairPortraits a={a} b={b} />}
            eyebrow={
              <>
                <span>Side by side</span>
                <span className="text-gold/50" aria-hidden="true">
                  ·
                </span>
                <span className="text-parchment/85">{relationLabel}</span>
              </>
            }
            title={title}
            lede={<p>{lede}</p>}
            actions={
              <Link
                href="/compare"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/25 px-4 type-ui text-parchment transition-colors hover:border-gold/60 hover:bg-white/10"
              >
                <Scale className="size-4" aria-hidden="true" />
                Build your own comparison
              </Link>
            }
          />
        }
        facts={facts}
        toc={toc}
        asideLabel={`${title} at a glance`}
        aside={
          <AsideLinks
            title="More comparisons"
            links={related.map((other) => ({
              href: `/compare/${other.slug}`,
              label: headline(other),
            }))}
          />
        }
      >
        <ArticleStack>
          <ArticleSection id="glance" title="At a glance" reading={false}>
            <div>
              <table className="w-full table-fixed border-collapse text-left">
                <caption className="sr-only">
                  {a.displayName} and {b.displayName} compared
                </caption>
                <thead>
                  <tr className="border-b border-border">
                    <td className="w-24 py-3 sm:w-36" />
                    <th
                      scope="col"
                      className="py-3 pr-4 font-serif text-lg font-semibold text-foreground"
                    >
                      {a.displayName}
                    </th>
                    <th
                      scope="col"
                      className="py-3 font-serif text-lg font-semibold text-foreground"
                    >
                      {b.displayName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-border/70 align-top"
                    >
                      <th
                        scope="row"
                        className="py-3 pr-4 type-ui font-normal text-muted-foreground"
                      >
                        {row.label}
                      </th>
                      <td className="py-3 pr-4 font-body text-[1.0625rem] text-foreground">
                        {row.a}
                      </td>
                      <td className="py-3 font-body text-[1.0625rem] text-foreground">
                        {row.b}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ArticleSection>

          <ArticleSection id="meet" title="Where they meet">
            <div className="space-y-4">
              {meeting.map((line) => (
                <ReadingParagraph key={line}>{line}</ReadingParagraph>
              ))}
              {sharedSymbols.length > 0 ? (
                <TagList items={sharedSymbols} label="Shared symbols" />
              ) : null}
            </div>
          </ArticleSection>

          <ArticleSection id="part" title="Where they part" reading={false}>
            <div className="grid gap-8 sm:grid-cols-2">
              {(
                [
                  [a, distinctDomains.a],
                  [b, distinctDomains.b],
                ] as const
              ).map(([deity, domains]) => (
                <div key={deity.id} className="min-w-0">
                  <h3 className="type-h3 text-foreground">
                    Only {deity.displayName}
                  </h3>
                  <p className="mt-2 type-reading text-foreground/90">
                    {domains.length > 0
                      ? sentence(`associated with ${list(domains)}`)
                      : "Every domain the atlas records is shared with the other."}
                  </p>
                </div>
              ))}
            </div>
          </ArticleSection>

          {furtherNotes.length > 0 ? (
            <ArticleSection id="why" title="Why they are compared">
              <div className="space-y-4">
                {furtherNotes.map((note) => (
                  <ReadingParagraph key={note}>
                    {sentence(note)}
                  </ReadingParagraph>
                ))}
              </div>
            </ArticleSection>
          ) : null}

          {hasWorship ? (
            <ArticleSection
              id="worship"
              title="How each was worshipped"
              reading={false}
            >
              <div className="grid gap-10 sm:grid-cols-2">
                <WorshipAccount deity={a} />
                <WorshipAccount deity={b} />
              </div>
            </ArticleSection>
          ) : null}

          <ArticleSection id="accounts" title="The two figures" reading={false}>
            <div className="grid gap-10 sm:grid-cols-2">
              <DeityAccount deity={a} />
              <DeityAccount deity={b} />
            </div>
          </ArticleSection>

          <AboutThisPage title="About this comparison" size={false}>
            <p>
              Comparisons pair figures that play a similar role across
              traditions, or that the myths connect within one. A shared role
              does not, by itself, establish a shared origin.
            </p>
          </AboutThisPage>
        </ArticleStack>
      </DetailLayout>
    </>
  );
}
