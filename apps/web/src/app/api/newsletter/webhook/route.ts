import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { readCappedStream } from "@/lib/http/read-json-body";
import { logger } from "@/lib/logger";
import {
  getNewsletterConfig,
  getNewsletterWebhookSecret,
  reassertUnsubscribed,
} from "@/lib/newsletter";
import {
  recordConsentRepair,
  type ConsentLockHandle,
  recordNewsletterUnsubscribe,
  unsubscribeNeedsRepair,
  withConsentLock,
} from "@/lib/newsletter-redemption";

/** Resend contact events are a few hundred bytes; anything this big is not one. */
const MAX_BODY_BYTES = 64 * 1024;

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * Resend webhook receiver. Readers unsubscribe on Resend's hosted page, so
 * this is the only way the app learns of it. A contact.updated event that
 * leaves the contact unsubscribed is recorded, and the confirm route then
 * refuses any link issued before that moment (see newsletter-redemption).
 * A confirm that was running around the unsubscribe may have committed over
 * it, so the contact is set unsubscribed again when one is found.
 *
 * contact.created is ignored on purpose: step one creates the contact as
 * unsubscribed, which is not a reader leaving. Requests are authenticated by
 * Resend's signature (RESEND_WEBHOOK_SECRET), not by origin.
 */
export async function POST(req: NextRequest) {
  const config = getNewsletterConfig();
  const secret = getNewsletterWebhookSecret();
  if (!config || !secret) {
    return json({ ok: false, reason: "not_configured" }, 501);
  }

  // Cap the read before the signature check: verification needs the whole
  // body, so an uncapped read lets any caller make us buffer it first.
  const declaredLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    await req.body?.cancel();
    return json({ ok: false, reason: "too_large" }, 413);
  }
  const bytes = await readCappedStream(req.body, MAX_BODY_BYTES);
  if (bytes === null) return json({ ok: false, reason: "too_large" }, 413);
  const payload = new TextDecoder().decode(bytes);
  const resend = new Resend(config.apiKey);
  let event: ReturnType<Resend["webhooks"]["verify"]>;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: req.headers.get("svix-id") ?? "",
        timestamp: req.headers.get("svix-timestamp") ?? "",
        signature: req.headers.get("svix-signature") ?? "",
      },
      webhookSecret: secret,
    });
  } catch {
    return json({ ok: false, reason: "invalid_signature" }, 401);
  }

  if (event.type !== "contact.updated" || event.data.unsubscribed !== true) {
    return json({ ok: true, recorded: false }, 200);
  }

  const email = event.data.email;
  const parsedAt = Date.parse(event.created_at);
  const atMs = Number.isFinite(parsedAt) ? parsedAt : Date.now();

  // Record first and outside the lock: the record is monotonic and atomic, and
  // it must land even when the lock is busy, or the unsubscribe is lost once
  // Resend stops retrying. Only a failed write is a 503.
  const recorded = await recordNewsletterUnsubscribe(email, atMs);
  if (!recorded) {
    logger.error("Newsletter unsubscribe could not be recorded", {});
    // Non-2xx so Resend retries the delivery.
    return json({ ok: false, reason: "unavailable" }, 503);
  }

  // Looking for an overlapping confirm and re-applying run under the
  // address's consent lock, so no confirm or cron repair slips between them.
  const locked = await withConsentLock(email, (lock) =>
    applyUnsubscribe(resend, email, atMs, lock),
  );
  if (!locked.locked) {
    logger.error("Newsletter consent lock unavailable for unsubscribe", {});
    return deferRepair(email, atMs, 200);
  }
  return locked.value;
}

/**
 * Queue the re-apply for the cron (monotonic, so a newer intent is never
 * replaced). 200 when the work is durably queued, 503 when even that failed.
 */
async function deferRepair(
  email: string,
  atMs: number,
  queuedStatus: 200 | 503,
): Promise<Response> {
  if (!(await recordConsentRepair(email, atMs))) {
    logger.error("Newsletter consent repair could not be persisted", {});
    return json({ ok: false, reason: "unavailable" }, 503);
  }
  return queuedStatus === 200
    ? json({ ok: true, recorded: true, queued: true }, 200)
    : json({ ok: false, reason: "unavailable" }, 503);
}

async function applyUnsubscribe(
  resend: Resend,
  email: string,
  atMs: number,
  lock: ConsentLockHandle,
): Promise<Response> {
  // Record first, then look for a confirm: the confirm side does the reverse
  // (lists itself, then checks for an unsubscribe), so one of us always sees
  // the other. Both outcomes below are safe to repeat.
  const needsRepair = await unsubscribeNeedsRepair(email, atMs);
  if (needsRepair === null) {
    logger.error("Newsletter confirm activity could not be read", {});
    return json({ ok: false, reason: "unavailable" }, 503);
  }
  if (needsRepair) {
    // A lapsed lease must not be followed by a write; queue it and let Resend retry.
    if (!(await lock.held())) return deferRepair(email, atMs, 503);
    let repaired = false;
    try {
      repaired = (await reassertUnsubscribed(resend, email)).ok;
    } catch (error) {
      logger.error("Newsletter unsubscribe repair threw", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    if (!repaired) {
      logger.error("Newsletter unsubscribe could not be re-applied", {});
      // Persist it too: Resend gives up retrying after a while, the cron does not.
      if (!(await recordConsentRepair(email, atMs))) {
        logger.error("Newsletter consent repair could not be persisted", {});
      }
      return json({ ok: false, reason: "unavailable" }, 503);
    }
  }
  return json({ ok: true, recorded: true }, 200);
}
