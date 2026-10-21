/**
 * Cron-driven retry of consent repairs that failed inline (see
 * recordConsentRepair). Free of Next imports so it can be tested with a fake
 * client, like the digest handler.
 */
import { timingSafeEqual } from "node:crypto";
import {
  getNewsletterConfig,
  reassertUnsubscribed,
  type NewsletterClient,
} from "@/lib/newsletter";
import {
  assessConsentRepair,
  clearConsentRepair,
  listConsentRepairs,
} from "@/lib/newsletter-redemption";

export interface ConsentRepairSummary {
  repaired: number;
  superseded: number;
  /** Confirm records that turned out to owe nothing. */
  settled: number;
  failed: number;
}

/**
 * Idempotent: reassertUnsubscribed reads the contact first and writes only
 * when it is still subscribed, and a record is deleted only after the contact
 * is confirmed unsubscribed, so a crash between the two just repeats a no-op.
 */
export async function runConsentRepairs(
  client: NewsletterClient,
): Promise<ConsentRepairSummary | null> {
  const repairs = await listConsentRepairs();
  if (!repairs) return null;
  const summary: ConsentRepairSummary = {
    repaired: 0,
    superseded: 0,
    settled: 0,
    failed: 0,
  };
  for (const repair of repairs) {
    const verdict = await assessConsentRepair(repair);
    if (verdict === null) {
      summary.failed += 1;
      continue;
    }
    if (verdict === "in_flight") continue;
    if (verdict === "superseded" || verdict === "settled") {
      await clearConsentRepair(repair);
      summary[verdict] += 1;
      continue;
    }
    let ok = false;
    try {
      ok = (await reassertUnsubscribed(client, repair.email)).ok;
    } catch {
      // Retried on the next run.
    }
    if (ok && (await clearConsentRepair(repair))) summary.repaired += 1;
    else summary.failed += 1;
  }
  return summary;
}

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function bearerMatches(header: string | null, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * Cron entry point. Same gate as the weekly digest: 401 without the shared
 * CRON_SECRET (checked first), 501 when not configured. 502 when any repair
 * is still outstanding so the failed run shows in Vercel's cron logs.
 */
export async function handleConsentRepairRequest(
  req: Request,
  deps: {
    env: Readonly<Record<string, string | undefined>>;
    createClient: (apiKey: string) => NewsletterClient;
  },
): Promise<Response> {
  const secret = deps.env.CRON_SECRET?.trim();
  if (secret && !bearerMatches(req.headers.get("authorization"), secret)) {
    return json({ ok: false, reason: "unauthorized" }, 401);
  }
  const config = getNewsletterConfig(deps.env);
  if (!secret || !config) {
    return json({ ok: false, reason: "not_configured" }, 501);
  }
  const summary = await runConsentRepairs(deps.createClient(config.apiKey));
  if (!summary) return json({ ok: false, reason: "unavailable" }, 503);
  return json({ ok: summary.failed === 0, ...summary }, summary.failed ? 502 : 200);
}
