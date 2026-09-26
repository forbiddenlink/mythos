import { getSearchIndex } from "@/lib/search";

/**
 * Prebuilt command-palette search index (names, alternate names, domains and
 * short descriptions only). Prerendered at build time; the palette fetches it
 * the first time it opens.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(getSearchIndex(), {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
