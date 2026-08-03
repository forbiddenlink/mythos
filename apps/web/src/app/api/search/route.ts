import { mergeLexicalAndSemantic } from "@/lib/search-merge";
import { searchAll, type SearchResult } from "@/lib/search";
import { semanticSearchResults } from "@/lib/oracle/semantic";
import { forbiddenUnlessSameOrigin } from "@/lib/oracle/request-guards";
import { checkSearchRateLimit } from "@/lib/oracle/rate-limit";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(30).optional(),
});

function getClientIp(req: NextRequest): string {
  const vercelForwarded = req.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (vercelForwarded) return vercelForwarded;

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1]!;
  }

  return "anonymous";
}

/**
 * Unified search: lexical match over local JSON + optional semantic retrieval
 * when embeddings index and OpenAI key are available (same pipeline as Oracle).
 */
export async function POST(req: NextRequest) {
  try {
    const originBlock = forbiddenUnlessSameOrigin(req);
    if (originBlock) return originBlock;

    const rateLimit = await checkSearchRateLimit(getClientIp(req));
    if (!rateLimit.allowed) {
      if (rateLimit.reason === "misconfigured") {
        return NextResponse.json(
          { error: "Search is unavailable. Rate limiting is not configured." },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { error: "Too many search requests. Please try again shortly." },
        { status: 429 },
      );
    }

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
    logger.exception(e instanceof Error ? e : new Error("Search route error"), {
      route: "/api/search",
    });
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
