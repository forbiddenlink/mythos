/**
 * Generates apps/web/src/data/oracle-embeddings.json — the optional semantic
 * index the Oracle (and /api/search) use to fill retrieval slots that keyword
 * grounding leaves empty.
 *
 * The committed file is an empty stub (`"vectors": []`), which keeps the
 * semantic path completely inert: no embedding calls are made at runtime until
 * this script has been run and its output committed.
 *
 * Usage (from the repo root):
 *   OPENAI_EMBEDDINGS_API_KEY=sk-... pnpm --filter web generate:embeddings
 *   pnpm --filter web generate:embeddings -- --dry-run          # count + size estimate, no API calls
 *   pnpm --filter web generate:embeddings -- --dimensions=1536  # full-size vectors
 *
 * Env: OPENAI_EMBEDDINGS_API_KEY (preferred) or OPENAI_API_KEY. The same key
 * must be configured at runtime for query embeddings, or the index is ignored.
 *
 * Defaults: text-embedding-3-small at 512 dimensions, values rounded to 5
 * decimals — about a third of the full-size file with negligible recall loss.
 * The runtime sends the stored `dim` with every query so both sides match.
 */

import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const outPath = join(webRoot, "src/data/oracle-embeddings.json");

const MODEL = "text-embedding-3-small";
const BATCH = 64;
const MAX_ATTEMPTS = 5;
const MAX_INPUT_CHARS = 8000;

type ContentType =
  "deity" | "hero" | "story" | "creature" | "artifact" | "location";

interface Row {
  t: ContentType;
  s: string;
  v: number[];
}

interface Item {
  t: ContentType;
  s: string;
  text: string;
}

function parseArgs(argv: string[]): { dryRun: boolean; dimensions: number } {
  const dryRun = argv.includes("--dry-run");
  const dimArg = argv.find((a) => a.startsWith("--dimensions="));
  const dimensions = dimArg
    ? Number.parseInt(dimArg.split("=")[1] ?? "", 10)
    : 512;
  if (!Number.isInteger(dimensions) || dimensions < 64 || dimensions > 1536) {
    throw new Error("--dimensions must be an integer between 64 and 1536");
  }
  return { dryRun, dimensions };
}

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(webRoot, "src/data", name), "utf8")) as T;
}

function text(...parts: Array<string | undefined | string[]>): string {
  return parts
    .flat()
    .filter((p): p is string => Boolean(p?.trim()))
    .join(". ")
    .slice(0, MAX_INPUT_CHARS);
}

function collectItems(): Item[] {
  type Named = {
    id: string;
    slug?: string;
    name: string;
    alternateNames?: string[];
    description?: string;
    domain?: string[];
  };
  const items: Item[] = [];

  for (const d of loadJson<Named[]>("deities.json")) {
    items.push({
      t: "deity",
      s: d.slug ?? d.id,
      text: text(d.name, d.alternateNames, d.domain, d.description),
    });
  }
  for (const h of loadJson<Named[]>("heroes.json")) {
    items.push({
      t: "hero",
      s: h.slug ?? h.id,
      text: text(h.name, h.alternateNames, h.description),
    });
  }
  for (const s of loadJson<{ slug: string; title: string; summary?: string }[]>(
    "stories.json",
  )) {
    items.push({ t: "story", s: s.slug, text: text(s.title, s.summary) });
  }
  for (const c of loadJson<Named[]>("creatures.json")) {
    items.push({
      t: "creature",
      s: c.slug ?? c.id,
      text: text(c.name, c.description),
    });
  }
  for (const a of loadJson<Named[]>("artifacts.json")) {
    items.push({
      t: "artifact",
      s: a.slug ?? a.id,
      text: text(a.name, a.description),
    });
  }
  for (const l of loadJson<Named[]>("locations.json")) {
    items.push({
      t: "location",
      s: l.slug ?? l.id,
      text: text(l.name, l.description),
    });
  }
  return items.filter((i) => i.s && i.text);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function embedBatch(
  apiKey: string,
  inputs: string[],
  dimensions: number,
): Promise<number[][]> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, input: inputs, dimensions }),
    });

    if (res.ok) {
      const json = (await res.json()) as {
        data: Array<{ embedding: number[]; index: number }>;
      };
      const sorted = [...json.data].sort((a, b) => a.index - b.index);
      if (sorted.length !== inputs.length) {
        throw new Error(
          `Expected ${inputs.length} embeddings, got ${sorted.length}`,
        );
      }
      return sorted.map((d) => d.embedding);
    }

    const retryable = res.status === 429 || res.status >= 500;
    const body = await res.text();
    if (!retryable || attempt >= MAX_ATTEMPTS) {
      throw new Error(`OpenAI embeddings failed: ${res.status} ${body}`);
    }
    const retryAfter = Number.parseFloat(res.headers.get("retry-after") ?? "");
    const delay = Number.isFinite(retryAfter)
      ? retryAfter * 1000
      : 1000 * 2 ** attempt;
    console.error(
      `  ${res.status}; retrying in ${Math.round(delay)}ms (attempt ${attempt}/${MAX_ATTEMPTS})`,
    );
    await sleep(delay);
  }
}

async function main(): Promise<void> {
  const { dryRun, dimensions } = parseArgs(process.argv.slice(2));
  const items = collectItems();
  console.error(
    `${items.length} catalog entries to embed (${MODEL}, ${dimensions} dims)`,
  );

  if (dryRun) {
    const approxBytes = items.length * dimensions * 9;
    console.error(
      `Dry run: would write ~${(approxBytes / 1e6).toFixed(1)} MB to ${outPath}`,
    );
    return;
  }

  const apiKey =
    process.env.OPENAI_EMBEDDINGS_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "Set OPENAI_EMBEDDINGS_API_KEY (or OPENAI_API_KEY) to generate embeddings. Use --dry-run to preview.",
    );
    process.exit(1);
  }

  const vectors: Row[] = [];
  for (let i = 0; i < items.length; i += BATCH) {
    const chunk = items.slice(i, i + BATCH);
    const embeddings = await embedBatch(
      apiKey,
      chunk.map((c) => c.text),
      dimensions,
    );
    chunk.forEach((item, j) => {
      const v = embeddings[j]!;
      if (v.length !== dimensions) {
        throw new Error(
          `Embedding for ${item.t}:${item.s} has ${v.length} dims, expected ${dimensions}`,
        );
      }
      vectors.push({
        t: item.t,
        s: item.s,
        v: v.map((x) => Math.round(x * 1e5) / 1e5),
      });
    });
    console.error(
      `Embedded ${Math.min(i + BATCH, items.length)}/${items.length}`,
    );
  }

  const payload = {
    model: MODEL,
    dim: dimensions,
    generatedAt: new Date().toISOString(),
    vectors,
  };

  // Write atomically so an interrupted run never leaves a truncated index.
  const tmp = `${outPath}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(payload)}\n`, "utf8");
  renameSync(tmp, outPath);
  console.error(`Wrote ${vectors.length} vectors to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
