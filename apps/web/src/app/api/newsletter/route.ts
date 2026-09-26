import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { readJsonBody } from "@/lib/http/read-json-body";
import { logger } from "@/lib/logger";
import {
  getNewsletterConfig,
  newsletterRequestSchema,
  subscribeToNewsletter,
} from "@/lib/newsletter";
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
 * Weekly myth digest sign-up. Adds the address to the Resend segment.
 *
 * Without RESEND_API_KEY this answers 501 `not_configured` (like
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
    return json({ subscribed: true }, 200);
  }

  const identity = getOracleClientIdentity(req.headers);
  const limit = await checkNewsletterRateLimit(`newsletter:${identity.key}`);
  if (!limit.allowed) {
    return limit.reason === "misconfigured"
      ? json({ subscribed: false, reason: "unavailable" }, 503)
      : json({ subscribed: false, reason: "rate_limited" }, 429);
  }

  try {
    const result = await subscribeToNewsletter(
      new Resend(config.apiKey),
      parsed.data.email,
      config.segmentId,
    );
    if (result.ok) return json({ subscribed: true }, 200);
  } catch (error) {
    logger.error("Newsletter sign-up failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return json({ subscribed: false, reason: "upstream_error" }, 502);
}
