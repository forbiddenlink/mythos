import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { groupAlphabetically } from "@/lib/az-index";

export interface AzIndexEntry {
  name: string;
  href: string;
  /** Short label after the name, such as the tradition. */
  meta?: string;
}

interface AzIndexProps {
  title: string;
  lede: string;
  /** Singular and plural noun for the jump links' accessible names. */
  noun: { one: string; many: string };
  entries: readonly AzIndexEntry[];
}

/** Server-rendered alphabetical list, so every entry is a plain crawlable link. */
export function AzIndex({ title, lede, noun, entries }: Readonly<AzIndexProps>) {
  const groups = groupAlphabetically(entries);

  return (
    <div className="min-h-screen">
      <PageHeader eyebrow="Index" mark="laurel" title={title} lede={lede} />
      <Container className="section-space-sm">
        <nav
          aria-label="Jump to a letter"
          className="mb-12 border-b border-border/70 pb-8"
        >
          <ul className="flex flex-wrap gap-2">
            {groups.map(({ letter, entries: group }) => (
              <li key={letter}>
                <a
                  href={`#letter-${letter === "#" ? "other" : letter}`}
                  aria-label={`${letter}, ${group.length} ${group.length === 1 ? noun.one : noun.many}`}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card font-serif text-lg text-foreground transition-colors hover:border-gold/50 hover:text-gold-text"
                >
                  {letter}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-12">
          {groups.map(({ letter, entries: group }) => {
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
                  {group.map((entry) => (
                    <li key={entry.href} className="break-inside-avoid">
                      <Link
                        href={entry.href}
                        className="flex min-h-11 items-baseline gap-2 py-1.5 font-body text-lg text-foreground underline-offset-4 hover:text-gold-text hover:underline"
                      >
                        {entry.name}
                        <span className="type-meta text-muted-foreground">
                          {entry.meta ?? ""}
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
