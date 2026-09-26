import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  Building,
  Calendar,
  ScrollText,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import {
  RosettaWheel,
  type WheelDeity,
} from "@/components/collections/RosettaWheel";
import { SourceProvenance } from "@/components/deities/SourceProvenance";
import { MythosMark } from "@/components/icons/mythos-marks";
import { AppearsIn } from "@/components/mythology/AppearsIn";
import { CatalogSourceNotes } from "@/components/sources/CatalogSourceNotes";
import { EntityPlainSourcesList } from "@/components/sources/EntityPlainSourcesList";
import { ReferencesList } from "@/components/sources/ReferencesList";
import { SourceExcerptsList } from "@/components/sources/SourceExcerpt";
import { Badge } from "@/components/ui/badge";
import type { DeityRecord } from "@/lib/data/types";
import { formatPantheonLabel, type ResolvedParallel } from "@/lib/deity-page";

/** Detailed biography (markdown, rendered on the server) and origin story. */
export function DeityNarrative({ deity }: { deity: DeityRecord }) {
  return (
    <>
      <section id="deity-about" className="max-w-[68ch] scroll-mt-24">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-5 border-l-4 border-gold pl-4">
          About {deity.name}
        </h2>
        {deity.detailedBio ? (
          <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:text-gold-text prose-a:text-gold dark:prose-a:text-gold-light max-w-none leading-relaxed [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:mt-1 [&>p:first-of-type]:first-letter:font-serif [&>p:first-of-type]:first-letter:text-6xl [&>p:first-of-type]:first-letter:leading-[0.8] [&>p:first-of-type]:first-letter:text-gold">
            <ReactMarkdown>{deity.detailedBio}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted-foreground leading-relaxed text-lg">
            {deity.description}
          </p>
        )}
      </section>

      {deity.originStory && (
        <section className="max-w-[68ch]">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
            Origin Story
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
            {deity.originStory}
          </p>
        </section>
      )}
    </>
  );
}

/** Rosetta wheel plus the annotated list of cross-pantheon parallels. */
export function DeityParallels({
  deity,
  parallels,
  compareSlugs = {},
}: {
  deity: DeityRecord;
  parallels: ResolvedParallel[];
  /** Counterpart id → slug of its /compare page with this deity, when one exists. */
  compareSlugs?: Record<string, string>;
}) {
  if (parallels.length === 0) return null;

  const wheel: WheelDeity[] = [
    { name: deity.name, slug: deity.slug, pantheonId: deity.pantheonId },
    ...parallels.flatMap((p) =>
      p.href && p.slug
        ? [
            {
              name: p.name,
              slug: p.slug,
              pantheonId: p.pantheonId,
              href: p.href,
            },
          ]
        : [],
    ),
  ];

  return (
    <>
      <RosettaWheel
        archetype={deity.domain?.[0] ?? formatPantheonLabel(deity.pantheonId)}
        deities={wheel}
      />
      <section className="max-w-[68ch]">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1 border-l-4 border-gold pl-4 flex items-center gap-2">
          <MythosMark id="scales" className="h-5 w-5 text-gold" />
          Cross-Pantheon Parallels
        </h2>
        <p className="text-muted-foreground text-sm mb-5 pl-5">
          Editorial comparisons across traditions; shared roles do not establish
          a shared origin.
        </p>
        <ul className="space-y-4">
          {parallels.map((parallel) => (
            <li
              key={parallel.deityId}
              className="border-l-2 pl-4"
              style={{ borderColor: parallel.pantheonColor }}
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {parallel.href ? (
                  <Link
                    href={parallel.href}
                    className="font-medium text-foreground hover:text-gold transition-colors"
                  >
                    {parallel.name}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">
                    {parallel.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: parallel.pantheonColor }}
                    aria-hidden
                  />
                  {parallel.pantheonLabel}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {parallel.note}
              </p>
              {compareSlugs[parallel.deityId] ? (
                <Link
                  href={`/compare/${compareSlugs[parallel.deityId]}`}
                  className="mt-1 inline-block text-sm text-gold-text underline-offset-4 hover:underline"
                >
                  Compare {deity.name} and {parallel.name} side by side
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/** Source coverage, excerpts, "appears in", further reading and bibliography. */
export function DeitySources({ deity }: { deity: DeityRecord }) {
  return (
    <div id="deity-sources" className="space-y-12 scroll-mt-24">
      <div className="reveal-on-scroll">
        <SourceProvenance sources={deity.primarySources} />
      </div>

      {deity.primarySourceExcerpts &&
        deity.primarySourceExcerpts.length > 0 && (
          <section className="max-w-[68ch]">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-1 border-l-4 border-gold pl-4 flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-gold" />
              Ancient Sources
            </h2>
            <p className="text-muted-foreground text-sm mb-5 pl-5">
              Quotations, paraphrases and verification notes. Each passage
              states what has been checked.
            </p>
            <SourceExcerptsList excerpts={deity.primarySourceExcerpts} />
          </section>
        )}

      {/* Legacy source notes without edition metadata */}
      {deity.primarySources &&
        deity.primarySources.length > 0 &&
        !deity.primarySourceExcerpts?.length && (
          <CatalogSourceNotes sources={deity.primarySources} />
        )}

      <AppearsIn entityId={deity.id} kind="deity" />

      {deity.furtherReading && deity.furtherReading.length > 0 && (
        <ReferencesList
          references={deity.furtherReading}
          title="Further Reading"
          showDescriptions={false}
          collapsible={true}
          defaultExpanded={false}
        />
      )}

      {deity.sources && deity.sources.length > 0 && (
        <EntityPlainSourcesList lines={deity.sources} variant="deity" />
      )}
    </div>
  );
}

/** Temples, festivals and practices. */
export function DeityWorship({ deity }: { deity: DeityRecord }) {
  const worship = deity.worship;
  if (
    !worship ||
    !(worship.temples?.length || worship.festivals?.length || worship.practices)
  ) {
    return null;
  }

  return (
    <section className="max-w-[68ch]">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-1 border-l-4 border-gold pl-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-gold" />
        Worship & Cult
      </h2>
      <p className="text-muted-foreground text-sm mb-5 pl-5">
        Temples, festivals, and practices recorded for {deity.name}
      </p>
      <div className="space-y-6">
        {worship.temples && worship.temples.length > 0 && (
          <div>
            <h4 className="font-medium flex items-center gap-2 text-foreground mb-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              Sacred Temples
            </h4>
            <ul className="space-y-2">
              {worship.temples.map((temple) => (
                <li
                  key={temple}
                  className="text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-gold mt-1">&#8226;</span>
                  {temple}
                </li>
              ))}
            </ul>
          </div>
        )}

        {worship.festivals && worship.festivals.length > 0 && (
          <div>
            <h4 className="font-medium flex items-center gap-2 text-foreground mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Festivals & Celebrations
            </h4>
            <div className="flex flex-wrap gap-2">
              {worship.festivals.map((festival) => (
                <Badge
                  key={festival}
                  variant="outline"
                  className="max-w-full whitespace-normal border-gold/30 text-gold-text"
                >
                  {festival}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {worship.practices && (
          <div>
            <h4 className="font-medium text-foreground mb-2">
              Worship Practices
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {worship.practices}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/** Domains & symbols — compact metadata, not twin cards. */
export function DeityAttributes({ deity }: { deity: DeityRecord }) {
  if (!deity.domain?.length && !deity.symbols?.length) return null;
  return (
    <div className="grid gap-8 sm:grid-cols-2 border-y border-border/70 py-6">
      {deity.domain && deity.domain.length > 0 && (
        <section>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-gold" aria-hidden />
            Domains
          </h3>
          <ul className="flex flex-wrap gap-2" aria-label="Domains">
            {deity.domain.map((d) => (
              <li
                key={d}
                className="border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-gold-text"
              >
                {d}
              </li>
            ))}
          </ul>
        </section>
      )}

      {deity.symbols && deity.symbols.length > 0 && (
        <section>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-gold" aria-hidden />
            Symbols
          </h3>
          <ul className="flex flex-wrap gap-2" aria-label="Symbols">
            {deity.symbols.map((s) => (
              <li
                key={s}
                className="border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
