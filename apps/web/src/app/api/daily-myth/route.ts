import { buildDailyMythPool } from "@/lib/data/daily-myths";

/**
 * Question pool for "Today's myth" on the homepage. Prerendered at build
 * time; the browser picks the day's myth from its local date, so the
 * homepage itself stays static.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildDailyMythPool(), {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
