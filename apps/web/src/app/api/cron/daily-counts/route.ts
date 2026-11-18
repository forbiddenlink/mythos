import { handleDailyCountsRequest } from "@/lib/server/daily-count-report";

// Reads the request headers and the store: never prerender this.
export const dynamic = "force-dynamic";

/**
 * Vercel Cron (see vercel.json) calls this with
 * `Authorization: Bearer $CRON_SECRET` shortly after midnight UTC. It sends
 * the finished day's anonymous totals to PostHog and answers with them.
 */
export async function GET(req: Request) {
  return handleDailyCountsRequest(req, process.env);
}
