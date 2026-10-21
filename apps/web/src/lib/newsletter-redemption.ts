/**
 * Single-use redemption of newsletter confirmation tokens.
 *
 * A signed token stays cryptographically valid for seven days, so without a
 * server-side record it can be replayed to re-run the Resend mutations, and
 * to re-subscribe a contact who unsubscribed after confirming. The first
 * request to redeem a token wins an atomic SET NX on the token's hash (the
 * token itself is never stored). The record lives until the token would have
 * expired anyway once the confirmation succeeds.
 */
import { createHash, randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";

export type RedemptionClaim =
  | { status: "claimed"; claimId: string }
  | { status: "done" }
  | { status: "pending" }
  | { status: "unavailable" };

/** How long an in-flight claim blocks retries if its owner vanishes. */
export const PENDING_TTL_SECONDS = 60;
const DONE = "done";

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

const memoryClaims = new Map<string, { value: string; until: number }>();

export function __resetNewsletterRedemptionForTests(): void {
  memoryClaims.clear();
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const rToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && rToken ? new Redis({ url, token: rToken }) : null;
}

/**
 * Two-state claim. "pending:<id>" (short TTL) marks a request that is still
 * calling Resend; "done" (token TTL) marks a completed confirmation. Only
 * "done" may be answered as success: a pending claim can still fail, and a
 * claim whose acknowledgement was lost must not read as a finished one.
 */
export async function claimConfirmToken(
  token: string,
): Promise<RedemptionClaim> {
  const key = redemptionKey(token);
  const claimId = randomUUID();
  const pending = `pending:${claimId}`;
  const redis = getRedis();
  if (!redis) {
    // Without a shared store a replay on another instance is undetectable.
    if (isProductionRuntime()) return { status: "unavailable" };
    const now = Date.now();
    const existing = memoryClaims.get(key);
    if (existing && existing.until > now) {
      return { status: existing.value === DONE ? "done" : "pending" };
    }
    memoryClaims.set(key, {
      value: pending,
      until: now + PENDING_TTL_SECONDS * 1000,
    });
    return { status: "claimed", claimId };
  }
  try {
    const set = await redis.set(key, pending, {
      nx: true,
      ex: PENDING_TTL_SECONDS,
    });
    if (set === "OK") return { status: "claimed", claimId };
    const current = await redis.get<string>(key);
    // Expired between the SET and the GET: tell the caller to retry.
    return { status: current === DONE ? "done" : "pending" };
  } catch {
    return { status: "unavailable" };
  }
}

/** Mark the confirmation finished for the rest of the token's life. */
export async function completeConfirmToken(
  token: string,
  ttlSeconds: number,
): Promise<void> {
  const key = redemptionKey(token);
  const redis = getRedis();
  if (!redis) {
    memoryClaims.set(key, {
      value: DONE,
      until: Date.now() + ttlSeconds * 1000,
    });
    return;
  }
  try {
    await redis.set(key, DONE, { ex: ttlSeconds });
  } catch {
    // Stays pending for up to a minute, then a retry re-runs the idempotent
    // confirmation.
  }
}

const COMPARE_AND_DELETE = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`;

/** After a failed upstream call, drop the claim only if it is still ours. */
export async function releaseConfirmToken(
  token: string,
  claimId: string,
): Promise<void> {
  const key = redemptionKey(token);
  const pending = `pending:${claimId}`;
  const redis = getRedis();
  if (!redis) {
    if (memoryClaims.get(key)?.value === pending) memoryClaims.delete(key);
    return;
  }
  try {
    await redis.eval(COMPARE_AND_DELETE, [key], [pending]);
  } catch {
    // Left pending: it expires on its own within a minute.
  }
}
