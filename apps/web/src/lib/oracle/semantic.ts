/**
 * Optional semantic retrieval using OpenAI embeddings + precomputed vectors.
 * Run `pnpm --filter web run generate:embeddings` when OPENAI_API_KEY is set to populate data.
 */

import type { ContentType, SearchResult } from "@/lib/search";
import artifacts from "@/data/artifacts.json";
import creatures from "@/data/creatures.json";
import deities from "@/data/deities.json";
import embeddingManifest from "@/data/oracle-embeddings.json";
import locations from "@/data/locations.json";
import stories from "@/data/stories.json";

const pantheonNames: Record<string, string> = {
  "greek-pantheon": "Greek",
  "norse-pantheon": "Norse",
  "egyptian-pantheon": "Egyptian",
  "roman-pantheon": "Roman",
  "hindu-pantheon": "Hindu",
  "japanese-pantheon": "Japanese",
  "celtic-pantheon": "Celtic",
  "mesopotamian-pantheon": "Mesopotamian",
};

interface EmbeddingRow {
  t: ContentType;
  s: string;
  v: number[];
}

interface Manifest {
  model: string;
  dim: number;
  generatedAt: string | null;
  vectors: EmbeddingRow[];
}

const manifest = embeddingManifest as Manifest;

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  const denom = Math.sqrt(ma) * Math.sqrt(mb);
  return denom === 0 ? 0 : dot / denom;
}

async function embedQueryText(text: string): Promise<number[] | null> {
  const apiKey =
    process.env.OPENAI_EMBEDDINGS_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model =
    manifest.model && manifest.model.length > 0
      ? manifest.model
      : "text-embedding-3-small";

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: text.slice(0, 8000),
    }),
  });

  if (!res.ok) {
    console.warn(
      "[oracle-semantic] OpenAI embeddings error:",
      await res.text(),
    );
    return null;
  }

  const json = (await res.json()) as {
    data?: Array<{ embedding: number[] }>;
  };
  const emb = json.data?.[0]?.embedding;
  return emb && emb.length > 0 ? emb : null;
}

function pantheonLabel(pantheonId: string | undefined, kind: string): string {
  const name = pantheonId ? pantheonNames[pantheonId] : "";
  return name ? `${name} ${kind}` : kind;
}

function rowToSearchResult(
  row: EmbeddingRow,
  score: number,
): SearchResult | null {
  const ms = Math.round(score * 1000);
  switch (row.t) {
    case "deity": {
      const d = (
        deities as {
          id: string;
          slug: string;
          name: string;
          pantheonId?: string;
        }[]
      ).find((x) => x.slug === row.s);
      if (!d) return null;
      return {
        type: "deity",
        id: d.id,
        slug: d.slug,
        title: d.name,
        subtitle: pantheonLabel(d.pantheonId, "Deity"),
        matchScore: ms,
      };
    }
    case "story": {
      const s = (
        stories as {
          id: string;
          slug: string;
          title: string;
          pantheonId?: string;
        }[]
      ).find((x) => x.slug === row.s);
      if (!s) return null;
      return {
        type: "story",
        id: s.id,
        slug: s.slug,
        title: s.title,
        subtitle: pantheonLabel(s.pantheonId, "Story"),
        matchScore: ms,
      };
    }
    case "creature": {
      const c = (
        creatures as {
          id: string;
          slug: string;
          name: string;
          pantheonId?: string;
          habitat?: string;
        }[]
      ).find((x) => x.slug === row.s);
      if (!c) return null;
      return {
        type: "creature",
        id: c.id,
        slug: c.slug,
        title: c.name,
        subtitle: c.habitat ?? pantheonLabel(c.pantheonId, "Creature"),
        matchScore: ms,
      };
    }
    case "artifact": {
      const a = (
        artifacts as { id: string; slug: string; name: string; type?: string }[]
      ).find((x) => x.slug === row.s);
      if (!a) return null;
      return {
        type: "artifact",
        id: a.id,
        slug: a.slug,
        title: a.name,
        subtitle: a.type
          ? a.type.charAt(0).toUpperCase() + a.type.slice(1)
          : "Artifact",
        matchScore: ms,
      };
    }
    case "location": {
      const l = (
        locations as {
          id: string;
          slug?: string;
          name: string;
          pantheonId?: string;
          locationType?: string;
        }[]
      ).find((x) => (x.slug ?? x.id) === row.s);
      if (!l) return null;
      const pantheonName = l.pantheonId ? pantheonNames[l.pantheonId] : "";
      const locationType = l.locationType?.replace("_", " ") ?? "";
      const capitalized =
        locationType.length > 0
          ? locationType.charAt(0).toUpperCase() + locationType.slice(1)
          : "";
      return {
        type: "location",
        id: l.id,
        slug: l.slug ?? l.id,
        title: l.name,
        subtitle: pantheonName
          ? `${pantheonName} ${capitalized}`
          : capitalized || "Location",
        matchScore: ms,
      };
    }
    default:
      return null;
  }
}

/**
 * Top semantic matches for the query (empty if no index, no API key, or failure).
 */
export async function semanticSearchResults(
  query: string,
  limit: number,
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2 || !manifest.vectors?.length) return [];

  const qv = await embedQueryText(trimmed);
  if (!qv) return [];

  const scored = manifest.vectors
    .map((row) => ({
      row,
      score: cosine(qv, row.v),
    }))
    .filter((x) => x.score > 0);

  scored.sort((a, b) => b.score - a.score);

  const out: SearchResult[] = [];
  const seen = new Set<string>();
  for (const { row, score } of scored) {
    const sr = rowToSearchResult(row, score);
    if (!sr) continue;
    const key = `${sr.type}:${sr.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(sr);
    if (out.length >= limit) break;
  }

  return out;
}
