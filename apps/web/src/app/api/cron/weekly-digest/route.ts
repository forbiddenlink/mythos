import { Resend } from "resend";
import { getJourneys, getStories } from "@/lib/data/catalog";
import {
  createDigestLock,
  handleWeeklyDigestRequest,
} from "@/lib/newsletter-broadcast";

// Reads the request headers and the clock: never prerender this.
export const dynamic = "force-dynamic";

/**
 * Vercel Cron (see vercel.json) calls this weekly with
 * `Authorization: Bearer $CRON_SECRET`. It creates the week's digest as a
 * Resend draft; it sends only when NEWSLETTER_DIGEST_SEND is "true".
 * Upstash is required for the shared delivery lease, including draft runs.
 */
export async function GET(req: Request) {
  return handleWeeklyDigestRequest(req, {
    env: process.env,
    stories: getStories(),
    journeys: getJourneys(),
    now: new Date(),
    createClient: (apiKey) => new Resend(apiKey),
    createLock: createDigestLock,
  });
}
