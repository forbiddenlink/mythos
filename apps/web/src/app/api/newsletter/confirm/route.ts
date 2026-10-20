import type { NextRequest } from "next/server";
import { Resend } from "resend";
import "@/lib/zod-jitless";
import { z } from "zod";
import { readJsonBody } from "@/lib/http/read-json-body";
import { logger } from "@/lib/logger";
import {
  confirmNewsletterSubscription,
  getNewsletterConfig,
} from "@/lib/newsletter";
import { verifyConfirmToken } from "@/lib/newsletter-token";
import { forbiddenUnlessSameOrigin } from "@/lib/oracle/request-guards";

const MAX_REQUEST_BODY_BYTES = 2 * 1024;
const bodySchema = z.strictObject({ token: z.string().min(1).max(1024) });

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

  try {
    const result = await confirmNewsletterSubscription(
      new Resend(config.apiKey),
      verified.email,
      config.segmentId,
    );
    if (result.ok) return json({ confirmed: true }, 200);
  } catch (error) {
    logger.error("Newsletter confirmation failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return json({ confirmed: false, reason: "upstream_error" }, 502);
}
