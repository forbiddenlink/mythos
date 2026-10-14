import Link from "next/link";
import { EntryCloserSave } from "@/components/layout/EntryCloserSave";
import { getJourneys } from "@/lib/data/catalog";
import { findJourneyForPantheon } from "@/lib/journeys";
import type { BookmarkType } from "@/providers/bookmarks-provider";

export type EntryCloserEntityType =
  BookmarkType | "creature" | "artifact" | "location";

export interface EntryCloserProps {
  entityType: EntryCloserEntityType;
  id: string;
  name: string;
  /** Tradition of the entry; picks the journey to suggest. */
  pantheonId?: string;
}

/** Entity types the bookmark provider can store. */
const SAVEABLE: ReadonlySet<EntryCloserEntityType> = new Set<BookmarkType>([
  "deity",
  "story",
  "pantheon",
  "hero",
  "source",
]);

const linkClass =
  "inline-flex min-h-11 items-center type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current";

/**
 * One quiet closing block under an entry: save it, keep exploring, report a
 * problem, or read about the weekly digest. No modal, timer or gate; every item
 * is an ordinary link or form the reader can ignore.
 */
export function EntryCloser({
  entityType,
  id,
  name,
  pantheonId,
}: Readonly<EntryCloserProps>) {
  const journey = findJourneyForPantheon(getJourneys(), pantheonId);
  const canSave = SAVEABLE.has(entityType);

  return (
    <section
      aria-labelledby={`entry-closer-${id}`}
      data-testid="entry-closer"
      className="mt-16 border-t border-gold/25 pt-8"
    >
      <h2 id={`entry-closer-${id}`} className="type-h3 text-foreground">
        Keep exploring
      </h2>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
        {canSave ? (
          <li>
            <EntryCloserSave
              type={entityType as BookmarkType}
              id={id}
              name={name}
            />
          </li>
        ) : null}
        {journey ? (
          <li>
            <Link href={`/journeys/${journey.slug}`} className={linkClass}>
              Walk a journey: {journey.title}
            </Link>
          </li>
        ) : null}
        <li>
          <Link href="/contact" className={linkClass}>
            Suggest a correction
          </Link>
        </li>
      </ul>
      <p className="mt-6 type-ui text-muted-foreground">
        <Link href="/newsletter" className={linkClass}>
          One myth a week, with its sources
        </Link>{" "}
        in a short email. The sign-up form is just below.
      </p>
      <p className="mt-4 type-meta text-muted-foreground">
        Free to read, no ads.{" "}
        <Link href="/support" className="underline underline-offset-4">
          Optional support.
        </Link>
      </p>
    </section>
  );
}
