import type { NextRequest } from "next/server";
import { Resend } from "resend";
import "@/lib/zod-jitless";
import { z } from "zod";
import { readJsonBody } from "@/lib/http/read-json-body";
import { logger } from "@/lib/logger";
import {
  confirmNewsletterSubscription,
  getNewsletterConfig,
  hasUnsubscribedAfterConfirming,
} from "@/lib/newsletter";
import {
  claimConfirmToken,
  completeConfirmToken,
  releaseConfirmToken,
  secondsUntilTokenExpiry,
} from "@/lib/newsletter-redemption";
import { verifyConfirmToken } from "@/lib/newsletter-token";
import { getOracleClientIdentity } from "@/lib/oracle/client-identity";
import { checkNewsletterConfirmRateLimit } from "@/lib/oracle/rate-limit";
import { forbiddenUnlessSameOrigin } from "@/lib/oracle/request-guards";

const MAX_REQUEST_BODY_BYTES = 2 * 1024;
const bodySchema = z.strictObject({ token: z.string().min(1).max(1024) });

/** Well under the 60s staleness window, so a hung call cannot outlive its claim. */
const RESEND_TIMEOUT_MS = 20_000;

function withTimeout<T>(work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("Resend call timed out")),
      RESEND_TIMEOUT_MS,
    );
  });
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}

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

  // Single use. The first request to redeem this token wins a pending claim.
  // A replay of a completed confirmation gets the same success answer without
  // reaching Resend (so it cannot re-subscribe someone who unsubscribed after
  // confirming). A replay that finds the claim still pending is told to retry:
  // the first request may yet fail, so it cannot be answered as success.
  const ttl = secondsUntilTokenExpiry(parsed.data.token);
  const claim = await claimConfirmToken(parsed.data.token, ttl);
  if (claim.status === "unavailable") {
    return json({ confirmed: false, reason: "unavailable" }, 503);
  }
  if (claim.status === "pending") {
    return json({ confirmed: false, reason: "in_progress" }, 409);
  }
  if (claim.status === "done") return json({ confirmed: true }, 200);
  const { marker, takeover } = claim;

  try {
    const client = new Resend(config.apiKey);
    // Taking over an abandoned claim: the first attempt may have finished at
    // Resend (only its done-write was lost) and the reader may have left
    // since. Never replay the mutation onto an unsubscribed leaver.
    if (takeover) {
      const left = await withTimeout(
        hasUnsubscribedAfterConfirming(
          client,
          verified.email,
          config.segmentId,
        ),
      );
      if (left === null) throw new Error("contact state unavailable");
      if (left) {
        await completeConfirmToken(parsed.data.token, marker, ttl);
        return json({ confirmed: true }, 200);
      }
    }
    const result = await withTimeout(
      confirmNewsletterSubscription(client, verified.email, config.segmentId),
    );
    if (result.ok) {
      await completeConfirmToken(parsed.data.token, marker, ttl);
      return json({ confirmed: true }, 200);
    }
  } catch (error) {
    logger.error("Newsletter confirmation failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  // Hand the claim back so the reader can retry the same link.
  await releaseConfirmToken(parsed.data.token, marker);
  return json({ confirmed: false, reason: "upstream_error" }, 502);
}
