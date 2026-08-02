import { ScrollText } from "lucide-react";
import {
  attestationOf,
  formatYear,
  type PrimarySource,
} from "@/lib/attestation";

const TIER_COLOR: Record<string, string> = {
  "well-attested": "#d4af37",
  corroborated: "#c9a227",
  single: "#a1741f",
  unattested: "#6b7280",
};

/**
 * A compact codex "marginalia" plate stating how firmly a figure is attested,
 * derived entirely from the recorded primary sources — corroboration as
 * confidence, plus the earliest dated attestation. No dates are invented.
 */
export function SourceProvenance({
  sources,
}: {
  sources?: PrimarySource[] | null;
}) {
  const att = attestationOf(sources ?? undefined);
  if (att.count === 0) return null;

  const color = TIER_COLOR[att.tier];

  return (
    <aside
      className="rounded-xl border border-gold/20 bg-midnight/40 p-5"
      aria-label="Source attestation"
    >
      <div className="mb-3 flex items-center gap-2">
        <ScrollText className="h-4 w-4 text-gold/70" aria-hidden />
        <span className="font-serif text-xs uppercase tracking-[0.25em] text-gold/70">
          Attestation
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <span className="font-serif text-lg text-parchment">{att.label}</span>
        <span className="text-sm text-parchment/50">
          · {att.count} primary {att.count === 1 ? "source" : "sources"}
        </span>
      </div>

      {att.earliestYear !== null && att.earliestSource && (
        <p className="mt-3 text-sm leading-relaxed text-parchment/70">
          Earliest attestation{" "}
          <span className="text-gold/90">{formatYear(att.earliestYear)}</span>
          {" — "}
          <span className="italic">{att.earliestSource.source}</span>.
        </p>
      )}

      <p className="mt-2 text-xs italic text-parchment/40">
        Confidence reflects independent primary sources, not editorial opinion.
      </p>
    </aside>
  );
}

export default SourceProvenance;
