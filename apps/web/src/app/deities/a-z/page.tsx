import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { getDeityListItems, getPantheonShortNames } from "@/lib/data/catalog";
import { groupDeitiesAlphabetically } from "@/lib/deity-az";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Gods and Goddesses A to Z",
  description:
    "Every deity in the atlas in alphabetical order, with the tradition each belongs to. Jump to a letter to find a god or goddess by name.",
  url: "/deities/a-z",
  keywords: [
    "gods A to Z",
    "list of gods and goddesses",
    "deities alphabetical",
    "mythology index",
  ],
});

export default function DeitiesAzPage() {
  const deities = getDeityListItems();
  const groups = groupDeitiesAlphabetically(deities);
  const traditions = getPantheonShortNames();

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Index"
        mark="laurel"
        title="Gods and Goddesses A to Z"
        lede={`${deities.length} deities, listed by name.`}
      />
      <Container className="section-space-sm">
        <nav
          aria-label="Jump to a letter"
          className="mb-12 border-b border-border/70 pb-8"
        >
          <ul className="flex flex-wrap gap-2">
            {groups.map(({ letter, entries }) => (
              <li key={letter}>
                <a
                  href={`#letter-${letter === "#" ? "other" : letter}`}
                  aria-label={`${letter}, ${entries.length} ${entries.length === 1 ? "deity" : "deities"}`}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card font-serif text-lg text-foreground transition-colors hover:border-gold/50 hover:text-gold-text"
                >
                  {letter}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-12">
          {groups.map(({ letter, entries }) => {
            const id = `letter-${letter === "#" ? "other" : letter}`;
            return (
              <section
                key={letter}
                id={id}
                aria-labelledby={`${id}-title`}
                className="scroll-mt-24"
              >
                <h2
                  id={`${id}-title`}
                  className="border-b border-border/70 pb-3 font-serif text-2xl font-semibold text-foreground"
                >
                  {letter}
                </h2>
                <ul className="mt-4 columns-1 gap-10 sm:columns-2 lg:columns-3">
                  {entries.map((deity) => (
                    <li key={deity.slug} className="break-inside-avoid">
                      <Link
                        href={`/deities/${deity.slug}`}
                        className="flex min-h-11 items-baseline gap-2 py-1.5 font-body text-lg text-foreground underline-offset-4 hover:text-gold-text hover:underline"
                      >
                        {deity.name}
                        <span className="type-meta text-muted-foreground">
                          {traditions[deity.pantheonId] ?? ""}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
