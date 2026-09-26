import type { Metadata } from "next";
import Link from "next/link";
import { CompareNav } from "@/components/compare/CompareNav";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
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
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Side by side"
        mark="scales"
        title="Every Deity Comparison"
        lede={`${comparisons.length} pairings the atlas documents, from sky fathers across traditions to siblings and rivals within one.`}
      />
      <Container className="pt-2">
        <CompareNav current="/compare/pairs" />
      </Container>
      <Container className="section-space-sm">
        <nav
          aria-label="Largest groups of pairings"
          className="mb-12 border-b border-border/70 pb-8"
        >
          <p className="type-ui font-medium text-foreground">Jump to</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ordered
              .filter(([, entries]) => entries.length >= 6)
              .map(([label, entries]) => (
                <li key={label}>
                  <a
                    href={`#${slugify(label)}`}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 type-ui text-foreground transition-colors hover:border-gold/50 hover:text-gold-text"
                  >
                    {label.replace(/ Pantheon/g, "")}
                    <span className="type-meta tabular-nums text-muted-foreground">
                      {entries.length}
                    </span>
                  </a>
                </li>
              ))}
          </ul>
          <p className="mt-3 type-meta text-muted-foreground">
            {ordered.filter(([, entries]) => entries.length < 6).length} smaller
            groups follow below.
          </p>
        </nav>
        <div className="space-y-12">
          {ordered.map(([label, entries]) => (
            <section
              key={label}
              id={slugify(label)}
              aria-labelledby={`${slugify(label)}-title`}
              className="scroll-mt-24"
            >
              <h2
                id={`${slugify(label)}-title`}
                className="border-b border-border/70 pb-3 font-serif text-2xl font-semibold text-foreground"
              >
                {label}
              </h2>
              <ul className="mt-4 columns-1 gap-10 sm:columns-2 lg:columns-3">
                {entries.map((comparison) => (
                  <li key={comparison.slug} className="break-inside-avoid">
                    <Link
                      className="flex min-h-10 items-center font-body text-lg text-foreground underline-offset-4 hover:text-gold-text hover:underline"
                      href={`/compare/${comparison.slug}`}
                    >
                      {comparison.a.displayName}
                      <span className="mx-1.5 text-muted-foreground">vs</span>
                      {comparison.b.displayName}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
