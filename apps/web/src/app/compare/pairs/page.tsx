import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { generateBaseMetadata } from "@/lib/metadata";
import { getDeityComparisons } from "@/lib/comparisons";

export const metadata: Metadata = generateBaseMetadata({
  title: "Every Deity Comparison",
  description:
    "Head-to-head pages for every pairing the atlas documents: sky fathers across traditions, siblings and rivals within one, with domains, symbols, and origins side by side.",
  url: "/compare/pairs",
  keywords: [
    "mythology comparisons",
    "compare gods",
    "comparative mythology",
    "gods side by side",
  ],
});

/** Group heading for a pairing, so the index reads as traditions, not 353 links. */
function groupLabel(a: string, b: string): string {
  return a === b ? `Within the ${a}` : [a, b].sort().join(" and ");
}

export default function ComparisonIndexPage() {
  const comparisons = getDeityComparisons();

  const groups = new Map<string, typeof comparisons>();
  for (const comparison of comparisons) {
    const label = groupLabel(
      comparison.a.pantheonName,
      comparison.b.pantheonName,
    );
    const bucket = groups.get(label);
    if (bucket) bucket.push(comparison);
    else groups.set(label, [comparison]);
  }

  const ordered = [...groups.entries()].sort(
    ([leftLabel, left], [rightLabel, right]) =>
      right.length - left.length || leftLabel.localeCompare(rightLabel),
  );

  return (
    <>
      <PageHero
        mark="scales"
        tagline="Side by side"
        title="Every Deity Comparison"
        description={`${comparisons.length} pairings the atlas documents, from sky fathers across traditions to siblings and rivals within one.`}
      />

      <div className="page-shell pb-16">
        {ordered.map(([label, entries]) => (
          <section key={label} className="mt-10">
            <h2 className="page-section-title">{label}</h2>
            <ul className="mt-3 columns-1 gap-8 sm:columns-2 lg:columns-3">
              {entries.map((comparison) => (
                <li key={comparison.slug} className="mb-2 break-inside-avoid">
                  <Link
                    className="font-body text-foreground underline-offset-4 hover:text-gold-text hover:underline"
                    href={`/compare/${comparison.slug}`}
                  >
                    {comparison.a.displayName} vs {comparison.b.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
