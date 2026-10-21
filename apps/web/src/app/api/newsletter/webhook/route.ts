import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { logger } from "@/lib/logger";
import {
  getNewsletterConfig,
  getNewsletterWebhookSecret,
  reassertUnsubscribed,
} from "@/lib/newsletter";
import {
  recordConsentRepair,
  recordNewsletterUnsubscribe,
  unsubscribeNeedsRepair,
} from "@/lib/newsletter-redemption";

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

  const payload = await req.text();
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

  const parsedAt = Date.parse(event.created_at);
  const atMs = Number.isFinite(parsedAt) ? parsedAt : Date.now();
  const recorded = await recordNewsletterUnsubscribe(event.data.email, atMs);
  if (!recorded) {
    logger.error("Newsletter unsubscribe could not be recorded", {});
    // Non-2xx so Resend retries the delivery.
    return json({ ok: false, reason: "unavailable" }, 503);
  }

  // Record first, then look for a confirm: the confirm side does the reverse
  // (lists itself, then checks for an unsubscribe), so one of us always sees
  // the other. Both outcomes below are safe to repeat.
  const needsRepair = await unsubscribeNeedsRepair(event.data.email, atMs);
  if (needsRepair === null) {
    logger.error("Newsletter confirm activity could not be read", {});
    return json({ ok: false, reason: "unavailable" }, 503);
  }
  if (needsRepair) {
    let repaired = false;
    try {
      repaired = (await reassertUnsubscribed(resend, event.data.email)).ok;
    } catch (error) {
      logger.error("Newsletter unsubscribe repair threw", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    if (!repaired) {
      logger.error("Newsletter unsubscribe could not be re-applied", {});
      // Persist it too: Resend gives up retrying after a while, the cron does not.
      if (!(await recordConsentRepair(event.data.email, atMs))) {
        logger.error("Newsletter consent repair could not be persisted", {});
      }
      return json({ ok: false, reason: "unavailable" }, 503);
    }
  }
  return json({ ok: true, recorded: true }, 200);
}
