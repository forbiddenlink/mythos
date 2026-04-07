/**
 * Generates apps/web/src/data/oracle-embeddings.json using OpenAI text-embedding-3-small.
 * Requires OPENAI_API_KEY. Run: pnpm --filter web run generate:embeddings
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const outPath = join(webRoot, "src/data/oracle-embeddings.json");

const MODEL = "text-embedding-3-small";
const BATCH = 64;

type ContentType = "deity" | "story" | "creature" | "artifact" | "location";

interface Row {
  t: ContentType;
  s: string;
  v: number[];
}

function loadJson<T>(name: string): T {
  const p = join(webRoot, "src/data", name);
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

async function embedBatch(
  apiKey: string,
  inputs: string[],
): Promise<number[][]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      input: inputs,
    }),
  });
  if (!res.ok) {
    throw new Error(
      `OpenAI embeddings failed: ${res.status} ${await res.text()}`,
    );
  }
  const json = (await res.json()) as {
    data: Array<{ embedding: number[]; index: number }>;
  };
  const sorted = [...json.data].sort((a, b) => a.index - b.index);
  return sorted.map((d) => d.embedding);
}

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Set OPENAI_API_KEY to generate embeddings.");
    process.exit(1);
  }

  const deities =
    loadJson<{ slug: string; name: string; description?: string }[]>(
      "deities.json",
    );
  const stories =
    loadJson<{ slug: string; title: string; summary?: string }[]>(
      "stories.json",
    );
  const creatures =
    loadJson<{ slug: string; name: string; description?: string }[]>(
      "creatures.json",
    );
  const artifacts =
    loadJson<{ slug: string; name: string; description?: string }[]>(
      "artifacts.json",
    );
  const locations =
    loadJson<
      { id: string; slug?: string; name: string; description?: string }[]
    >("locations.json");

  const texts: { t: ContentType; s: string; text: string }[] = [];

  for (const d of deities) {
    texts.push({
      t: "deity",
      s: d.slug,
      text: `${d.name}. ${d.description ?? ""}`.slice(0, 8000),
    });
  }
  for (const s of stories) {
    texts.push({
      t: "story",
      s: s.slug,
      text: `${s.title}. ${s.summary ?? ""}`.slice(0, 8000),
    });
  }
  for (const c of creatures) {
    texts.push({
      t: "creature",
      s: c.slug,
      text: `${c.name}. ${c.description ?? ""}`.slice(0, 8000),
    });
  }
  for (const a of artifacts) {
    texts.push({
      t: "artifact",
      s: a.slug,
      text: `${a.name}. ${a.description ?? ""}`.slice(0, 8000),
    });
  }
  for (const l of locations) {
    const slug = l.slug ?? l.id;
    texts.push({
      t: "location",
      s: slug,
      text: `${l.name}. ${l.description ?? ""}`.slice(0, 8000),
    });
  }

  const vectors: Row[] = [];

  for (let i = 0; i < texts.length; i += BATCH) {
    const chunk = texts.slice(i, i + BATCH);
    const embeddings = await embedBatch(
      apiKey,
      chunk.map((c) => c.text),
    );
    for (let j = 0; j < chunk.length; j++) {
      vectors.push({
        t: chunk[j].t,
        s: chunk[j].s,
        v: embeddings[j],
      });
    }
    console.error(
      `Embedded ${Math.min(i + BATCH, texts.length)}/${texts.length}`,
    );
  }

  const payload = {
    model: MODEL,
    dim: vectors[0]?.v.length ?? 1536,
    generatedAt: new Date().toISOString(),
    vectors,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(payload)}\n`, "utf8");
  console.error(`Wrote ${vectors.length} vectors to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
