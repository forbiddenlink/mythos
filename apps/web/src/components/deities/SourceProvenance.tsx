import { ScrollText } from "lucide-react";
import {
  attestationOf,
  formatYear,
  type PrimarySource,
} from "@/lib/attestation";

/**
 * A compact codex "marginalia" plate summarizing the sources recorded for a
 * figure in this catalog. It deliberately avoids treating the dataset as a
 * complete survey of surviving evidence.
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
      className="rounded-xl border border-gold/20 bg-muted/50 p-5"
      aria-label="Catalogued sources"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ScrollText className="h-4 w-4 text-gold-text" aria-hidden />
        <span className="font-serif text-xs uppercase tracking-[0.25em] text-gold-text">
          Catalogued sources
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full bg-gold"
          aria-hidden
        />
        <span className="font-serif text-lg text-foreground">{att.label}</span>
        <span className="text-sm text-muted-foreground">
          · {att.count} primary {att.count === 1 ? "source" : "sources"}
        </span>
      </div>

      {att.earliestYear !== null && att.earliestSource && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Oldest dated work in this catalog{" "}
          <span className="text-gold-text">{formatYear(att.earliestYear)}</span>
          {" — "}
          <span className="italic">{att.earliestSource.source}</span>.
        </p>
      )}

      <p className="mt-2 text-xs italic text-muted-foreground">
        Coverage reflects this catalog&apos;s source records; it does not
        establish independent corroboration or the first surviving mention.
      </p>
    </aside>
  );
}
