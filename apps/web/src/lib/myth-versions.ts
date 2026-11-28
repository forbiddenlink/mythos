import versionsData from "@/data/myth-versions.json";

export type BeatState = "present" | "variant" | "absent" | "lost";
export type SourceKind = "primary" | "later-ancient" | "medieval" | "modern";

export interface VersionCell {
  state: BeatState;
  note?: string;
  /** Locator in the edition linked by the source's readingUrl. */
  passage?: string;
}

export interface VersionSource {
  name: string;
  work: string;
  date: string;
  sortYear: number;
  kind: SourceKind;
  reference?: boolean;
  readingUrl?: string;
  readingLabel?: string;
  cells: Record<string, VersionCell>;
}

export interface MythVersions {
  storySlug: string;
  question: string;
  takeaway: string;
  beats: { id: string; label: string }[];
  sources: VersionSource[];
}

/** The catalog's editorial order, with just the fields a browse list needs. */
export function listMythVersionComparisons() {
  return versionsData.map(({ storySlug, question }) => ({
    storySlug,
    question,
  }));
}

/**
 * A story's version matrix: its key moments against each source that tells
 * it, oldest source first. Returns null when the story has no matrix.
 */
export function getMythVersions(
  storySlug: string,
  source: MythVersions[] = versionsData as MythVersions[],
): MythVersions | null {
  const hit = source.find((v) => v.storySlug === storySlug);
  if (!hit) return null;
  return {
    ...hit,
    sources: [...hit.sources].sort((a, b) => a.sortYear - b.sortYear),
  };
}
