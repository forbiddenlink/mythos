import "server-only";

import sourcesJson from "@/data/sources.json";
import type { CitedWork } from "@/components/seo/JsonLd";

interface SourceWork {
  id: string;
  title: string;
  author?: string;
}

const worksById = new Map(
  (sourcesJson as unknown as SourceWork[]).map((work) => [work.id, work]),
);

/** The catalog fields through which an entry points at works in sources.json. */
interface CitingRecord {
  primarySources?: readonly object[] | null;
  primarySourceExcerpts?: readonly object[] | null;
  furtherReading?: readonly object[] | null;
}

function sourceIdOf(entry: object): string | undefined {
  const id = (entry as { sourceId?: unknown }).sourceId;
  return typeof id === "string" && id.length > 0 ? id : undefined;
}

/**
 * Works an entry cites, resolved against sources.json, de-duplicated, in the
 * order the entry cites them. Unresolved ids are dropped rather than guessed.
 */
export function citedWorksFor(record: CitingRecord): CitedWork[] {
  const ids = [
    ...(record.primarySources ?? []),
    ...(record.primarySourceExcerpts ?? []),
    ...(record.furtherReading ?? []),
  ]
    .map(sourceIdOf)
    .filter((id): id is string => id !== undefined);

  const out: CitedWork[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const work = worksById.get(id);
    if (!work) continue;
    out.push({
      title: work.title,
      ...(work.author ? { author: work.author } : {}),
      url: `/sources/${work.id}`,
    });
  }
  return out;
}

/** One work by id, for hand-written citations on guide pages. */
export function citedWork(id: string): CitedWork | undefined {
  const work = worksById.get(id);
  if (!work) return undefined;
  return {
    title: work.title,
    ...(work.author ? { author: work.author } : {}),
    url: `/sources/${work.id}`,
  };
}
