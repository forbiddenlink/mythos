import { Resend } from "resend";
import { handleConsentRepairRequest } from "@/lib/newsletter-consent-repair";

// Reads the request headers and the store: never prerender this.
export const dynamic = "force-dynamic";

/**
 * Vercel Cron (see vercel.json) calls this with
 * `Authorization: Bearer $CRON_SECRET`. It retries unsubscribes that could not
 * be re-applied inline, so a reader who left is never left subscribed.
 */
export async function GET(req: Request) {
  return handleConsentRepairRequest(req, {
    env: process.env,
    createClient: (apiKey) => new Resend(apiKey),
  });
}
