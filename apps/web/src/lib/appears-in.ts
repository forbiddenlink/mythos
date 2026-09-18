import sourcesData from "@/data/sources.json";

export interface SourceCharacterRef {
  id: string;
  kind: "deity" | "hero";
  role: string;
  where: string;
}

interface SourceWithCharacters {
  id: string;
  title: string;
  author?: string;
  year?: string | number;
  characters?: SourceCharacterRef[];
}

export interface AppearsInEntry {
  sourceId: string;
  title: string;
  author?: string;
  year?: string | number;
  role: string;
  where: string;
}

const sources = sourcesData as SourceWithCharacters[];

/**
 * Finds every work in sources.json that lists the given deity or hero id
 * in its `characters` array, e.g. `getAppearsIn("achilles", "hero")`
 * returns the Iliad and the Odyssey (Book 11).
 */
export function getAppearsIn(
  entityId: string,
  kind: "deity" | "hero",
): AppearsInEntry[] {
  const entries: AppearsInEntry[] = [];

  for (const source of sources) {
    for (const character of source.characters || []) {
      if (character.id === entityId && character.kind === kind) {
        entries.push({
          sourceId: source.id,
          title: source.title,
          author: source.author,
          year: source.year,
          role: character.role,
          where: character.where,
        });
      }
    }
  }

  return entries;
}
