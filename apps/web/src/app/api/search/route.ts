import { mergeLexicalAndSemantic } from "@/lib/search-merge";
import { searchAll, type SearchResult } from "@/lib/search";
import { semanticSearchResults } from "@/lib/oracle/semantic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(30).optional(),
});

/**
 * Unified search: lexical match over local JSON + optional semantic retrieval
 * when embeddings index and OpenAI key are available (same pipeline as Oracle).
 */
export async function POST(req: NextRequest) {
  try {
    const json: unknown = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { query, limit = 20 } = parsed.data;
    const q = query.trim();
    if (q.length < 2) {
      return NextResponse.json({ results: [] satisfies SearchResult[] });
    }

    const lexical = searchAll(q, 25);
    let semantic: SearchResult[] = [];
    try {
      semantic = await semanticSearchResults(q, 15);
    } catch {
      semantic = [];
    }

    const results = mergeLexicalAndSemantic(lexical, semantic, limit);

    return NextResponse.json({ results });
  } catch (e) {
    console.error("[api/search]", e);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 },
    );
  }
}
