/**
 * Single-use redemption of newsletter confirmation tokens.
 *
 * A signed token stays cryptographically valid for seven days, so without a
 * server-side record it can be replayed to re-run the Resend mutations, and
 * to re-subscribe a contact who unsubscribed after confirming. The first
 * request to redeem a token wins an atomic SET NX on the token's hash (the
 * token itself is never stored); later requests are told it was already
 * redeemed. The record lives until the token would have expired anyway.
 */
import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";

export type RedemptionClaim =
  { status: "claimed" | "already" } | { status: "unavailable" };

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

function redemptionKey(token: string): string {
  return `mythos:newsletter:redeemed:${createHash("sha256").update(token).digest("hex")}`;
}

/** Seconds until a verified token's expiry, at least 1. */
export function secondsUntilTokenExpiry(
  token: string,
  now: Date = new Date(),
): number {
  const expires = Number(token.split(".")[1]);
  const left = expires - Math.floor(now.getTime() / 1000);
  return Number.isFinite(left) && left > 0 ? left : 1;
}

const memoryClaims = new Map<string, number>();

export function __resetNewsletterRedemptionForTests(): void {
  memoryClaims.clear();
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const rToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && rToken ? new Redis({ url, token: rToken }) : null;
}

export async function claimConfirmToken(
  token: string,
  ttlSeconds: number,
): Promise<RedemptionClaim> {
  const key = redemptionKey(token);
  const redis = getRedis();
  if (!redis) {
    // Without a shared store a replay on another instance is undetectable.
    if (isProductionRuntime()) return { status: "unavailable" };
    const now = Date.now();
    const until = memoryClaims.get(key);
    if (until !== undefined && until > now) return { status: "already" };
    memoryClaims.set(key, now + ttlSeconds * 1000);
    return { status: "claimed" };
  }
  try {
    const set = await redis.set(key, "1", { nx: true, ex: ttlSeconds });
    return { status: set === "OK" ? "claimed" : "already" };
  } catch {
    return { status: "unavailable" };
  }
}

/** Give the claim back after a failed upstream call so the reader can retry. */
export async function releaseConfirmToken(token: string): Promise<void> {
  const key = redemptionKey(token);
  const redis = getRedis();
  if (!redis) {
    memoryClaims.delete(key);
    return;
  }
  try {
    await redis.del(key);
  } catch {
    // Left claimed: the reader signs up again for a fresh link.
  }
}
