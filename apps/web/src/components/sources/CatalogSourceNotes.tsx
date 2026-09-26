import type { PrimarySource } from "@/lib/attestation";

/**
 * Works the catalog records for an entry whose passages have not been checked
 * against an edition: titles and dates only, never the unchecked wording.
 */
export function CatalogSourceNotes({ sources }: { sources?: PrimarySource[] }) {
  if (!sources?.length) return null;

  return (
    <section
      id="source-notes"
      aria-labelledby="source-notes-heading"
      className="scroll-mt-24"
    >
      <h3 id="source-notes-heading" className="type-h3 text-foreground">
        Source notes
      </h3>
      <p className="mt-1.5 type-ui text-muted-foreground">
        These references are recorded in the catalog. Their passage wording and
        translation have not been checked, so quotations are not displayed here.
      </p>
      <ul className="mt-4 divide-y divide-border/70 border-y border-border/70">
        {sources.map((source, index) => (
          <li
            key={`${source.source}-${index}`}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-3"
          >
            <cite className="font-body text-[1.125rem] not-italic text-foreground">
              {source.source}
            </cite>
            {source.date && (
              <p className="type-meta text-muted-foreground">
                Catalog date: {source.date}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
