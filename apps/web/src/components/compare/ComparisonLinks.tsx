import Link from "next/link";
import { getComparisonsForDeity, counterpart } from "@/lib/comparisons";

/**
 * Server-rendered links into the static comparison pages.
 *
 * These exist for readers, but they are also how a crawler reaches
 * /compare/<pair> from a deity entry rather than from the sitemap alone.
 */
export function ComparisonLinks({
  deityId,
  deityName,
}: Readonly<{ deityId: string; deityName: string }>) {
  const comparisons = getComparisonsForDeity(deityId);
  if (comparisons.length === 0) return null;

  return (
    <section className="page-shell pb-16">
      <h2 className="page-section-title">Set {deityName} beside</h2>
      <ul className="mt-4 space-y-2">
        {comparisons.map((comparison) => {
          const other = counterpart(comparison, deityId);
          return (
            <li key={comparison.slug}>
              <Link
                className="font-body text-lg text-foreground underline-offset-4 hover:text-gold-text hover:underline"
                href={`/compare/${comparison.slug}`}
              >
                {deityName} vs {other.displayName}
              </Link>
              <span className="ml-2 font-body text-muted-foreground">
                {other.pantheonName}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
