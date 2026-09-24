import type { PrimarySource } from "@/lib/attestation";

export function CatalogSourceNotes({ sources }: { sources?: PrimarySource[] }) {
  if (!sources?.length) return null;

  return (
    <section
      id="source-notes"
      className="scroll-mt-24 border-t border-border pt-6"
    >
      <h2 className="page-section-title text-foreground">Source notes</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        These references are recorded in the catalog. Their passage wording and
        translation have not been checked, so quotations are not displayed here.
      </p>
      <ul className="mt-5 divide-y divide-border">
        {sources.map((source, index) => (
          <li key={`${source.source}-${index}`} className="py-3">
            <cite className="font-serif not-italic text-foreground">
              {source.source}
            </cite>
            {source.date && (
              <p className="mt-1 text-sm text-muted-foreground">
                Catalog date: {source.date}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
