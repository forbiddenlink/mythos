import "server-only";
import { SourceProvenance } from "@/components/deities/SourceProvenance";
import { AppearsIn } from "@/components/mythology/AppearsIn";
import { getAppearsIn } from "@/lib/appears-in";
import type { PrimarySource } from "@/lib/attestation";
import { CatalogSourceNotes } from "./CatalogSourceNotes";
import {
  type CitationSourceItem,
  CitationSourcesList,
} from "./CitationSourcesList";
import { type FurtherReadingReference, ReferencesList } from "./ReferencesList";
import { type PrimarySourceExcerpt, SourceExcerptsList } from "./SourceExcerpt";

export interface EntitySourceFields {
  primarySources?: PrimarySource[] | null;
  primarySourceExcerpts?: PrimarySourceExcerpt[] | null;
  furtherReading?: FurtherReadingReference[] | null;
  /** Editorial bibliography lines. */
  sources?: string[] | null;
  citationSources?: CitationSourceItem[] | null;
}

interface EntitySourcesProps extends EntitySourceFields {
  /** Works that list this figure as a character ("Appears in"). */
  appearsIn?: { id: string; kind: "deity" | "hero" };
  /** Show the dated-sources summary line (figures, not stories). */
  provenance?: boolean;
}

/** Whether an entry has anything for its "Sources and further reading" section. */
export function hasEntitySources({
  appearsIn,
  ...fields
}: EntitySourceFields & {
  appearsIn?: { id: string; kind: "deity" | "hero" };
}): boolean {
  return Boolean(
    fields.primarySources?.length ||
    fields.primarySourceExcerpts?.length ||
    fields.furtherReading?.length ||
    fields.sources?.length ||
    fields.citationSources?.length ||
    (appearsIn && getAppearsIn(appearsIn.id, appearsIn.kind).length),
  );
}

/**
 * The body of an entry's "Sources and further reading" section: the dated
 * source summary, checked passages (or catalog notes when none are checked),
 * the works that feature the figure, works cited, and one further-reading
 * list. Each part is a titled subsection (h3) under the section's h2.
 */
export function EntitySources({
  primarySources,
  primarySourceExcerpts,
  furtherReading,
  sources,
  citationSources,
  appearsIn,
  provenance = true,
}: EntitySourcesProps) {
  const excerpts = primarySourceExcerpts ?? [];
  return (
    <div className="space-y-12">
      {provenance ? <SourceProvenance sources={primarySources} /> : null}

      {excerpts.length > 0 ? (
        <section aria-labelledby="ancient-sources-heading">
          <h3 id="ancient-sources-heading" className="type-h3 text-foreground">
            Ancient sources
          </h3>
          <p className="mt-1.5 type-ui text-muted-foreground">
            Quotations, paraphrases and verification notes. Each passage states
            what has been checked.
          </p>
          <SourceExcerptsList excerpts={excerpts} className="mt-2" />
        </section>
      ) : (
        <CatalogSourceNotes sources={primarySources ?? undefined} />
      )}

      {citationSources?.length ? (
        <CitationSourcesList sources={citationSources} />
      ) : null}

      {appearsIn ? (
        <AppearsIn entityId={appearsIn.id} kind={appearsIn.kind} />
      ) : null}

      <ReferencesList references={furtherReading ?? []} lines={sources ?? []} />
    </div>
  );
}
