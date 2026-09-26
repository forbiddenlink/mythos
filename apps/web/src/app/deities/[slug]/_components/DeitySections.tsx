import { ReadingProse } from "@/components/content/reading-prose";
import {
  ParallelFigures,
  type ParallelFigure,
} from "@/components/mythology/ParallelFigures";
import type { DeityRecord } from "@/lib/data/types";
import type { ResolvedParallel } from "@/lib/deity-page";

/** Detailed biography and origin story. */
export function DeityNarrative({ deity }: { deity: DeityRecord }) {
  return (
    <>
      {deity.detailedBio ? (
        <ReadingProse markdown={deity.detailedBio} dropCap />
      ) : (
        <p className="type-reading text-foreground/90">{deity.description}</p>
      )}

      {deity.originStory && (
        <div className="mt-10">
          <h3 className="type-h3 text-foreground">Origin story</h3>
          <p className="type-reading mt-3 whitespace-pre-line text-foreground/90">
            {deity.originStory}
          </p>
        </div>
      )}
    </>
  );
}

/** Cross-pantheon parallels with portraits, notes and comparison links. */
export function DeityParallels({
  deity,
  parallels,
  compareSlugs = {},
  images = {},
}: {
  deity: DeityRecord;
  parallels: ResolvedParallel[];
  /** Counterpart id → slug of its /compare page with this deity, when one exists. */
  compareSlugs?: Record<string, string>;
  /** Counterpart href → portrait. */
  images?: Record<string, string | null | undefined>;
}) {
  if (parallels.length === 0) return null;

  const figures: ParallelFigure[] = parallels.map((parallel) => ({
    name: parallel.name,
    href: parallel.href,
    pantheonId: parallel.pantheonId,
    traditionLabel: parallel.pantheonLabel,
    imageUrl: parallel.href ? images[parallel.href] : null,
    note: parallel.note,
    compare: compareSlugs[parallel.deityId]
      ? {
          href: `/compare/${compareSlugs[parallel.deityId]}`,
          label: `Compare ${deity.name} and ${parallel.name} side by side`,
        }
      : undefined,
  }));

  return (
    <ParallelFigures
      label={`${deity.domain?.[0] ?? deity.name} across pantheons`}
      figures={figures}
    />
  );
}

/** Whether the deity has any worship records to show. */
export function hasWorship(deity: DeityRecord): boolean {
  const worship = deity.worship;
  return Boolean(
    worship &&
    (worship.temples?.length || worship.festivals?.length || worship.practices),
  );
}

/** Temples, festivals and practices. */
export function DeityWorship({ deity }: { deity: DeityRecord }) {
  const worship = deity.worship;
  if (!worship || !hasWorship(deity)) return null;

  return (
    <div className="space-y-8">
      {worship.practices && (
        <p className="type-reading text-foreground/90">{worship.practices}</p>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        {worship.temples && worship.temples.length > 0 && (
          <div>
            <h3 className="type-h3 text-foreground">Sacred sites</h3>
            <ul className="mt-3 divide-y divide-border/70 border-y border-border/70">
              {worship.temples.map((temple) => (
                <li
                  key={temple}
                  className="py-2.5 text-[0.9375rem] leading-snug text-foreground/90"
                >
                  {temple}
                </li>
              ))}
            </ul>
          </div>
        )}

        {worship.festivals && worship.festivals.length > 0 && (
          <div>
            <h3 className="type-h3 text-foreground">Festivals</h3>
            <ul className="mt-3 divide-y divide-border/70 border-y border-border/70">
              {worship.festivals.map((festival) => (
                <li
                  key={festival}
                  className="py-2.5 text-[0.9375rem] leading-snug text-foreground/90"
                >
                  {festival}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
