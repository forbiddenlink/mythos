import ReactMarkdown from "react-markdown";
import { SourceProvenance } from "@/components/deities/SourceProvenance";
import { AppearsIn } from "@/components/mythology/AppearsIn";
import {
  ParallelFigures,
  type ParallelFigure,
} from "@/components/mythology/ParallelFigures";
import { CatalogSourceNotes } from "@/components/sources/CatalogSourceNotes";
import { EntityPlainSourcesList } from "@/components/sources/EntityPlainSourcesList";
import { ReferencesList } from "@/components/sources/ReferencesList";
import { SourceExcerptsList } from "@/components/sources/SourceExcerpt";
import type { DeityRecord } from "@/lib/data/types";
import type { ResolvedParallel } from "@/lib/deity-page";

/** Reading styles for long-form catalog prose (markdown rendered on the server). */
const readingProseClass =
  "prose prose-lg max-w-none dark:prose-invert type-reading prose-p:my-4 prose-p:leading-[1.7] prose-headings:font-serif prose-headings:font-semibold prose-headings:text-foreground prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-[1.375rem] prose-h3:text-xl prose-a:text-gold-text prose-a:decoration-gold/50 prose-a:underline-offset-4 prose-strong:text-foreground text-foreground/90";

/** Detailed biography and origin story. */
export function DeityNarrative({ deity }: { deity: DeityRecord }) {
  return (
    <>
      {deity.detailedBio ? (
        <div className={`illuminated-tale ${readingProseClass}`}>
          <ReactMarkdown>{deity.detailedBio}</ReactMarkdown>
        </div>
      ) : (
        <p className="type-reading text-foreground/90">{deity.description}</p>
      )}

      {deity.originStory && (
        <div className="mt-10">
          <h3 className="type-h3 text-foreground">Origin story</h3>
          <p className="type-reading mt-3 whitespace-pre-line text-foreground/90">
            {deity.originStory}
          </p>
        </div>
      )}
    </>
  );
}

/** Cross-pantheon parallels with portraits, notes and comparison links. */
export function DeityParallels({
  deity,
  parallels,
  compareSlugs = {},
  images = {},
}: {
  deity: DeityRecord;
  parallels: ResolvedParallel[];
  /** Counterpart id → slug of its /compare page with this deity, when one exists. */
  compareSlugs?: Record<string, string>;
  /** Counterpart href → portrait. */
  images?: Record<string, string | null | undefined>;
}) {
  if (parallels.length === 0) return null;

  const figures: ParallelFigure[] = parallels.map((parallel) => ({
    name: parallel.name,
    href: parallel.href,
    pantheonId: parallel.pantheonId,
    traditionLabel: parallel.pantheonLabel,
    imageUrl: parallel.href ? images[parallel.href] : null,
    note: parallel.note,
    compare: compareSlugs[parallel.deityId]
      ? {
          href: `/compare/${compareSlugs[parallel.deityId]}`,
          label: `Compare ${deity.name} and ${parallel.name} side by side`,
        }
      : undefined,
  }));

  return (
    <ParallelFigures
      label={`${deity.domain?.[0] ?? deity.name} across pantheons`}
      figures={figures}
    />
  );
}

/** Source coverage, excerpts, "appears in", further reading and bibliography. */
export function DeitySources({ deity }: { deity: DeityRecord }) {
  return (
    <div className="space-y-10">
      <SourceProvenance sources={deity.primarySources} />

      {deity.primarySourceExcerpts &&
        deity.primarySourceExcerpts.length > 0 && (
          <section aria-labelledby="deity-ancient-sources">
            <h3 id="deity-ancient-sources" className="type-h3 text-foreground">
              Ancient sources
            </h3>
            <p className="mt-1 mb-5 text-[0.9375rem] text-muted-foreground">
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

/** Whether the deity has any worship records to show. */
export function hasWorship(deity: DeityRecord): boolean {
  const worship = deity.worship;
  return Boolean(
    worship &&
    (worship.temples?.length || worship.festivals?.length || worship.practices),
  );
}

/** Temples, festivals and practices. */
export function DeityWorship({ deity }: { deity: DeityRecord }) {
  const worship = deity.worship;
  if (!worship || !hasWorship(deity)) return null;

  return (
    <div className="space-y-8">
      {worship.practices && (
        <p className="type-reading text-foreground/90">{worship.practices}</p>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        {worship.temples && worship.temples.length > 0 && (
          <div>
            <h3 className="type-h3 text-foreground">Sacred sites</h3>
            <ul className="mt-3 divide-y divide-border/70 border-y border-border/70">
              {worship.temples.map((temple) => (
                <li
                  key={temple}
                  className="py-2.5 text-[0.9375rem] leading-snug text-foreground/90"
                >
                  {temple}
                </li>
              ))}
            </ul>
          </div>
        )}

        {worship.festivals && worship.festivals.length > 0 && (
          <div>
            <h3 className="type-h3 text-foreground">Festivals</h3>
            <ul className="mt-3 divide-y divide-border/70 border-y border-border/70">
              {worship.festivals.map((festival) => (
                <li
                  key={festival}
                  className="py-2.5 text-[0.9375rem] leading-snug text-foreground/90"
                >
                  {festival}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
