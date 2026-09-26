import { getStoryIndex } from "@/lib/data/catalog";

/**
 * Slim story index (id / title / slug / pantheon / category) for
 * interaction-time client features. Prerendered at build time.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(getStoryIndex(), {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
