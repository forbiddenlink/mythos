import {
  attestationOf,
  formatYear,
  type PrimarySource,
} from "@/lib/attestation";

/**
 * A one-line summary of the sources this catalog records for a figure: how
 * many, and the oldest dated one. It deliberately avoids treating the dataset
 * as a complete survey of surviving evidence.
 */
export function SourceProvenance({
  sources,
}: {
  sources?: PrimarySource[] | null;
}) {
  const att = attestationOf(sources ?? undefined);
  if (att.count === 0) return null;

  return (
    <aside
      aria-label="Catalogued sources"
      className="border-y border-border/70 py-4"
    >
      <p className="type-ui text-foreground">
        <span className="font-medium">
          {att.count} catalogued {att.count === 1 ? "work" : "works"}
        </span>
        {att.earliestYear !== null && att.earliestSource ? (
          <span className="text-muted-foreground">
            {" "}
            · oldest dated:{" "}
            <cite className="text-foreground">{att.earliestSource.source}</cite>
            , {formatYear(att.earliestYear)}
          </span>
        ) : null}
      </p>
      <p className="mt-1.5 type-meta text-muted-foreground">
        Coverage reflects this catalog&apos;s source records; it does not
        establish independent corroboration or the first surviving mention.
      </p>
    </aside>
  );
}
