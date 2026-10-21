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
  isConsentRepairCurrent,
  listConsentRepairs,
  withConsentLock,
  type ConsentLockHandle,
  type ConsentRepair,
} from "@/lib/newsletter-redemption";

export interface ConsentRepairSummary {
  repaired: number;
  superseded: number;
  /** Confirm records that turned out to owe nothing. */
  settled: number;
  failed: number;
  /** Left for the next run: another request held the address's lock. */
  skipped: number;
}

type RepairOutcome =
  | "repaired"
  | "superseded"
  | "settled"
  | "failed"
  | "gone"
  | "lost"
  | "in_flight";

/**
 * Assess and apply one record. Runs under the address's consent lock, so no
 * confirm or webhook can mutate this address between the supersession check
 * and the write, and a confirm still mutating is never mistaken for a finished
 * one. The record is re-read first: it was listed before the lock was taken.
 * The lease is re-checked before every Resend write (retries included) and
 * before any delete; a lapsed
 * lease leaves the record for the next run.
 */
async function reconcileRepair(
  client: NewsletterClient,
  repair: ConsentRepair,
  lock: ConsentLockHandle,
): Promise<RepairOutcome> {
  const current = await isConsentRepairCurrent(repair);
  if (current === null) return "failed";
  if (!current) return "gone";
  const verdict = await assessConsentRepair(repair);
  if (verdict === null) return "failed";
  if (verdict === "in_flight") return "in_flight";
  if (verdict === "superseded" || verdict === "settled") {
    if (!(await lock.held())) return "lost";
    await clearConsentRepair(repair);
    return verdict;
  }
  if (!(await lock.held())) return "lost";
  let ok = false;
  try {
    const result = await reassertUnsubscribed(client, repair.email, () =>
      lock.held(),
    );
    if (result.lost) return "lost";
    ok = result.ok;
  } catch {
    // Retried on the next run.
  }
  if (!ok) return "failed";
  if (!(await lock.held())) return "lost";
  return (await clearConsentRepair(repair)) ? "repaired" : "failed";
}

/**
 * Idempotent: reassertUnsubscribed reads the contact first and writes only
 * when it is still subscribed, and a record is deleted only after the contact
 * is confirmed unsubscribed, so a crash between the two just repeats a no-op.
 * Each record is handled under its address's consent lock; when the lock
 * cannot be taken the record is skipped (never deleted) until the next run.
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
    skipped: 0,
  };
  for (const repair of repairs) {
    const locked = await withConsentLock(repair.email, (lock) =>
      reconcileRepair(client, repair, lock),
    );
    if (!locked.locked || locked.value === "lost") {
      summary.skipped += 1;
      continue;
    }
    const outcome = locked.value;
    if (outcome === "gone" || outcome === "in_flight") continue;
    summary[outcome] += 1;
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
