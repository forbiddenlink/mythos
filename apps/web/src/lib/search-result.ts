export type ContentType =
  "deity" | "story" | "creature" | "artifact" | "location" | "hero" | "source";

export interface SearchResult {
  type: ContentType;
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  matchScore: number;
}

export function getResultUrl(result: SearchResult): string {
  const typeToPath: Record<ContentType, string> = {
    deity: "/deities",
    story: "/stories",
    creature: "/creatures",
    artifact: "/artifacts",
    location: "/locations",
    hero: "/heroes",
    source: "/sources",
  };

  return `${typeToPath[result.type]}/${result.slug}`;
}
