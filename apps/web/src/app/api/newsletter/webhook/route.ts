import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { logger } from "@/lib/logger";
import { getNewsletterConfig } from "@/lib/newsletter";
import { recordNewsletterUnsubscribe } from "@/lib/newsletter-redemption";

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
 *
 * contact.created is ignored on purpose: step one creates the contact as
 * unsubscribed, which is not a reader leaving. Requests are authenticated by
 * Resend's signature (RESEND_WEBHOOK_SECRET), not by origin.
 */
export async function POST(req: NextRequest) {
  const config = getNewsletterConfig();
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!config || !secret) {
    return json({ ok: false, reason: "not_configured" }, 501);
  }

  const payload = await req.text();
  let event: ReturnType<Resend["webhooks"]["verify"]>;
  try {
    event = new Resend(config.apiKey).webhooks.verify({
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
  return json({ ok: true, recorded: true }, 200);
}
