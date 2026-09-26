import { getDeityIndex } from "@/lib/data/catalog";

/**
 * Slim deity index for interaction-time client features (flashcard export,
 * review cards, random discovery). Prerendered at build time and served as a
 * static file; the catalog only changes on deploy.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(getDeityIndex(), {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
