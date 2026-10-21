import type { NextRequest } from "next/server";
import { Resend } from "resend";
import "@/lib/zod-jitless";
import { z } from "zod";
import { readJsonBody } from "@/lib/http/read-json-body";
import { logger } from "@/lib/logger";
import {
  confirmNewsletterSubscription,
  ensureConfirmationEnabled,
  getNewsletterConfig,
} from "@/lib/newsletter";
import {
  checkConfirmMutationAllowed,
  checkUnsubscribeAfterMutation,
  claimConfirmToken,
  completeConfirmToken,
  secondsUntilTokenExpiry,
} from "@/lib/newsletter-redemption";
import { verifyConfirmToken } from "@/lib/newsletter-token";
import { getOracleClientIdentity } from "@/lib/oracle/client-identity";
import { checkNewsletterConfirmRateLimit } from "@/lib/oracle/rate-limit";
import { forbiddenUnlessSameOrigin } from "@/lib/oracle/request-guards";

const MAX_REQUEST_BODY_BYTES = 2 * 1024;
const bodySchema = z.strictObject({ token: z.string().min(1).max(1024) });

/**
 * The platform ends the request here, which really stops it. We do not race
 * the Resend calls against our own timer: a timer cannot cancel a call, so
 * the abandoned call would go on to mutate after we had answered.
 */
export const maxDuration = 30;

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * Double opt-in, step two. POST only, and only from our own confirm page:
 * mail scanners prefetch GET links, so a GET that subscribed would confirm
 * addresses nobody clicked. A valid, unexpired signed token adds the address
 * to the digest segment.
 */
export async function POST(req: NextRequest) {
  const forbidden = forbiddenUnlessSameOrigin(req);
  if (forbidden) return forbidden;

  const config = getNewsletterConfig();
  if (!config) {
    return json({ confirmed: false, reason: "not_configured" }, 501);
  }
  // Without the webhook nothing records unsubscribes, so a link issued before
  // one could resubscribe the reader. Fail closed.
  if (!ensureConfirmationEnabled()) {
    return json({ confirmed: false, reason: "unavailable" }, 503);
  }

  const identity = getOracleClientIdentity(req.headers);
  const limit = await checkNewsletterConfirmRateLimit(
    `newsletter-confirm:${identity.key}`,
  );
  if (!limit.allowed) {
    return limit.reason === "rate_limited"
      ? json({ confirmed: false, reason: "rate_limited" }, 429)
      : json({ confirmed: false, reason: "unavailable" }, 503);
  }

  const body = await readJsonBody(req, MAX_REQUEST_BODY_BYTES);
  if (!body.ok) {
    return json(
      { confirmed: false, reason: body.reason },
      body.reason === "too_large" ? 413 : 400,
    );
  }
  const parsed = bodySchema.safeParse(body.value);
  if (!parsed.success) {
    return json({ confirmed: false, reason: "invalid" }, 400);
  }

  const verified = verifyConfirmToken(parsed.data.token, config.apiKey);
  if (!verified.ok) {
    return json({ confirmed: false, reason: verified.reason }, 400);
  }

  // Single use. The first request to redeem this token wins a pending claim
  // that lives until the token itself expires. A replay of a completed
  // confirmation gets the same success answer without reaching Resend. A
  // replay that finds the claim pending is told to check their inbox or ask
  // for a new link: that claim may still be running, or may have died, and
  // there is no safe way to tell, so it is never answered as success and
  // never taken over or deleted.
  const ttl = secondsUntilTokenExpiry(parsed.data.token);
  const claim = await claimConfirmToken(
    parsed.data.token,
    ttl,
    verified.email,
  );
  if (claim.status === "unavailable") {
    return json({ confirmed: false, reason: "unavailable" }, 503);
  }
  if (claim.status === "pending") {
    return json({ confirmed: false, reason: "in_progress" }, 409);
  }
  if (claim.status === "done") return json({ confirmed: true }, 200);
  const { marker } = claim;

  try {
    const result = await confirmNewsletterSubscription(
      new Resend(config.apiKey),
      verified.email,
      config.segmentId,
      () =>
        checkConfirmMutationAllowed(parsed.data.token, marker, verified.email),
      () => checkUnsubscribeAfterMutation(parsed.data.token, verified.email),
    );
    if (result.ok) {
      await completeConfirmToken(parsed.data.token, marker, ttl, verified.email);
      return json({ confirmed: true }, 200);
    }
    if (result.reason === "aborted") {
      if (result.verdict === "unavailable") {
        return json({ confirmed: false, reason: "unavailable" }, 503);
      }
      return json(
        {
          confirmed: false,
          reason:
            result.verdict === "unsubscribed" ? "superseded" : "in_progress",
        },
        409,
      );
    }
  } catch (error) {
    logger.error("Newsletter confirmation failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  // The claim stays pending on purpose; see above.
  return json({ confirmed: false, reason: "upstream_error" }, 502);
}
