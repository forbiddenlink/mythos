/**
 * Optional semantic retrieval using OpenAI embeddings + precomputed vectors.
 *
 * Inert by default: `src/data/oracle-embeddings.json` ships with an empty
 * `vectors` array, and every entry point checks
 * {@link isSemanticGroundingAvailable} first, so no embedding request (and no
 * scoring work) happens until the file is populated. Generate it with
 * `pnpm --filter web generate:embeddings` (needs OPENAI_EMBEDDINGS_API_KEY or
 * OPENAI_API_KEY; see scripts/generate-oracle-embeddings.ts).
 */

import type { ContentType, SearchResult } from "@/lib/search";
import artifacts from "@/data/artifacts.json";
import creatures from "@/data/creatures.json";
import deities from "@/data/deities.json";
import heroes from "@/data/heroes.json";
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
const EMBEDDING_REQUEST_TIMEOUT_MS = 2_500;

function embeddingsApiKey(): string | undefined {
  return (
    process.env.OPENAI_EMBEDDINGS_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    undefined
  );
}

/**
 * True only when precomputed vectors are bundled AND a query-embedding key is
 * configured. Callers skip semantic retrieval entirely otherwise.
 */
export function isSemanticGroundingAvailable(): boolean {
  return (manifest.vectors?.length ?? 0) > 0 && Boolean(embeddingsApiKey());
}

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
  const apiKey = embeddingsApiKey();
  if (!apiKey) return null;

  const model =
    manifest.model && manifest.model.length > 0
      ? manifest.model
      : "text-embedding-3-small";

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const request = (async (): Promise<number[] | null> => {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: text.slice(0, 8000),
          // The index may be generated with reduced dimensions; the query
          // vector must match it.
          ...(manifest.dim ? { dimensions: manifest.dim } : {}),
        }),
        signal: controller.signal,
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
    })();

    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error("Embedding request timed out"));
      }, EMBEDDING_REQUEST_TIMEOUT_MS);
    });

    return await Promise.race([request, timeout]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(
      "[oracle-semantic] OpenAI embeddings request failed:",
      message,
    );
    return null;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
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
    case "hero": {
      const h = (
        heroes as {
          id: string;
          slug: string;
          name: string;
          pantheonId?: string;
        }[]
      ).find((x) => x.slug === row.s);
      if (!h) return null;
      return {
        type: "hero",
        id: h.id,
        slug: h.slug,
        title: h.name,
        subtitle: pantheonLabel(h.pantheonId, "Hero"),
        matchScore: ms,
      };
    }
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
  if (trimmed.length < 2 || !isSemanticGroundingAvailable()) return [];

  const qv = await embedQueryText(trimmed);
  if (!qv) return [];
  if (manifest.dim && qv.length !== manifest.dim) {
    console.warn(
      `[oracle-semantic] query embedding has ${qv.length} dims but the index has ${manifest.dim}; regenerate oracle-embeddings.json with the same model`,
    );
    return [];
  }

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
