import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { readJsonBody } from "@/lib/http/read-json-body";
import { logger } from "@/lib/logger";
import { siteConfig } from "@/lib/metadata";
import {
  canonicalMailboxKey,
  getNewsletterConfig,
  newsletterRequestSchema,
  requestNewsletterConfirmation,
} from "@/lib/newsletter";
import { checkNewsletterSendBudget } from "@/lib/newsletter-budget";
import { createConfirmToken } from "@/lib/newsletter-token";
import { getOracleClientIdentity } from "@/lib/oracle/client-identity";
import { checkNewsletterRateLimit } from "@/lib/oracle/rate-limit";
import { forbiddenUnlessSameOrigin } from "@/lib/oracle/request-guards";

const MAX_REQUEST_BODY_BYTES = 2 * 1024;

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * Weekly myth digest sign-up, step one of double opt-in: records the address
 * as an unsubscribed contact and emails a signed confirmation link. Nothing
 * is added to the digest segment until /api/newsletter/confirm checks the
 * link. A 200 answer means "check your inbox", never "subscribed".
 *
 * Without RESEND_API_KEY or NEWSLETTER_FROM this answers 501 `not_configured` (like
 * /api/analytics without a PostHog key) instead of pretending to store an
 * address it cannot keep; the form then shows "sign-ups open soon".
 */
export async function POST(req: NextRequest) {
  const forbidden = forbiddenUnlessSameOrigin(req);
  if (forbidden) return forbidden;

  const config = getNewsletterConfig();
  if (!config) {
    return json({ subscribed: false, reason: "not_configured" }, 501);
  }

  const body = await readJsonBody(req, MAX_REQUEST_BODY_BYTES);
  if (!body.ok) {
    return json(
      { subscribed: false, reason: body.reason },
      body.reason === "too_large" ? 413 : 400,
    );
  }

  const parsed = newsletterRequestSchema.safeParse(body.value);
  if (!parsed.success) {
    return json({ subscribed: false, reason: "invalid" }, 400);
  }

  // A filled honeypot is a bot: answer as if it worked, store nothing.
  if (parsed.data.website) {
    return json({ subscribed: false, pending: true }, 200);
  }

  const identity = getOracleClientIdentity(req.headers);
  const limit = await checkNewsletterRateLimit(`newsletter:${identity.key}`);
  if (!limit.allowed) {
    return limit.reason === "rate_limited"
      ? json({ subscribed: false, reason: "rate_limited" }, 429)
      : json({ subscribed: false, reason: "unavailable" }, 503);
  }

  // Per-inbox limit too, so rotating IPs cannot bury one inbox in
  // confirmation emails. Keyed on the canonical mailbox (aliases like
  // victim+1@gmail.com and v.ictim@gmail.com fold together); delivery below
  // still uses the address exactly as submitted.
  const addressKey = createHash("sha256")
    .update(canonicalMailboxKey(parsed.data.email))
    .digest("hex");
  const addressLimit = await checkNewsletterRateLimit(
    `newsletter-address:${addressKey}`,
  );
  if (!addressLimit.allowed) {
    return addressLimit.reason === "rate_limited"
      ? json({ subscribed: false, reason: "rate_limited" }, 429)
      : json({ subscribed: false, reason: "unavailable" }, 503);
  }

  // Aggregate ceiling: per-IP and per-inbox limits can both be rotated past.
  const budget = await checkNewsletterSendBudget();
  if (!budget.allowed) {
    return budget.reason === "budget_exhausted"
      ? json({ subscribed: false, reason: "rate_limited" }, 429)
      : json({ subscribed: false, reason: "unavailable" }, 503);
  }

  try {
    const token = createConfirmToken(parsed.data.email, config.apiKey);
    const confirmUrl = `${siteConfig.url}/newsletter/confirm?token=${encodeURIComponent(token)}`;
    const result = await requestNewsletterConfirmation(
      new Resend(config.apiKey),
      { email: parsed.data.email, from: config.from, confirmUrl },
    );
    if (result.ok) {
      return json({ subscribed: false, pending: true }, 200);
    }
  } catch (error) {
    logger.error("Newsletter sign-up failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return json({ subscribed: false, reason: "upstream_error" }, 502);
}
