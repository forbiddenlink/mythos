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
import { logger } from "@/lib/logger";

export type RedemptionClaim =
  /** `marker` is the exact stored value; `takeover` = it replaced a stale one. */
  | { status: "claimed"; marker: string; takeover: boolean }
  | { status: "done" }
  | { status: "pending" }
  | { status: "unavailable" };

/**
 * A pending claim younger than this blocks retries. Older ones are presumed
 * abandoned and may be taken over (after the caller re-checks the contact).
 */
export const PENDING_STALE_SECONDS = 60;
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

// Compare-and-set / compare-and-delete: only the holder of the exact value
// may change or remove a claim.
const CAS_SET = `if redis.call("get", KEYS[1]) == ARGV[1] then redis.call("set", KEYS[1], ARGV[2], "EX", ARGV[3]) return 1 else return 0 end`;
const CAS_DEL = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`;

function pendingAgeSeconds(value: string, nowMs: number): number {
  const ts = Number(value.split(":")[2]);
  return Number.isFinite(ts) ? (nowMs - ts) / 1000 : Number.POSITIVE_INFINITY;
}

/**
 * Two-state claim. `pending:<id>:<startedMs>` is written with the FULL token
 * TTL, so losing the later write can never let the claim lapse into "free".
 * `done` marks a finished confirmation. Only `done` is answered as success.
 * A pending claim older than PENDING_STALE_SECONDS may be taken over by one
 * caller (compare-and-set); that caller must re-check the contact first.
 */
export async function claimConfirmToken(
  token: string,
  ttlSeconds: number,
): Promise<RedemptionClaim> {
  const key = redemptionKey(token);
  const now = Date.now();
  const marker = `pending:${randomUUID()}:${now}`;
  const redis = getRedis();
  if (!redis) {
    // Without a shared store a replay on another instance is undetectable.
    if (isProductionRuntime()) return { status: "unavailable" };
    const existing = memoryClaims.get(key);
    if (existing && existing.until > now) {
      if (existing.value === DONE) return { status: "done" };
      if (pendingAgeSeconds(existing.value, now) < PENDING_STALE_SECONDS) {
        return { status: "pending" };
      }
      memoryClaims.set(key, { value: marker, until: now + ttlSeconds * 1000 });
      return { status: "claimed", marker, takeover: true };
    }
    memoryClaims.set(key, { value: marker, until: now + ttlSeconds * 1000 });
    return { status: "claimed", marker, takeover: false };
  }
  try {
    const set = await redis.set(key, marker, { nx: true, ex: ttlSeconds });
    if (set === "OK") return { status: "claimed", marker, takeover: false };
    const current = await redis.get<string>(key);
    if (current === DONE) return { status: "done" };
    if (current === null) return { status: "pending" }; // expired mid-check
    if (pendingAgeSeconds(current, now) < PENDING_STALE_SECONDS) {
      return { status: "pending" };
    }
    const won = await redis.eval(
      CAS_SET,
      [key],
      [current, marker, String(ttlSeconds)],
    );
    return Number(won) === 1
      ? { status: "claimed", marker, takeover: true }
      : { status: "pending" };
  } catch {
    return { status: "unavailable" };
  }
}

/**
 * pending -> done, only if the claim is still ours. A failure is logged, not
 * swallowed: the claim then stays pending until it is stale, and the next
 * caller takes over only after re-checking the contact's state.
 */
export async function completeConfirmToken(
  token: string,
  marker: string,
  ttlSeconds: number,
): Promise<boolean> {
  const key = redemptionKey(token);
  const redis = getRedis();
  if (!redis) {
    if (memoryClaims.get(key)?.value !== marker) return false;
    memoryClaims.set(key, {
      value: DONE,
      until: Date.now() + ttlSeconds * 1000,
    });
    return true;
  }
  try {
    const ok = await redis.eval(
      CAS_SET,
      [key],
      [marker, DONE, String(ttlSeconds)],
    );
    if (Number(ok) === 1) return true;
    logger.error("Newsletter confirm claim lost before completion", {});
    return false;
  } catch (error) {
    logger.error("Newsletter confirm completion write failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/** After a failed upstream call, drop the claim only if it is still ours. */
export async function releaseConfirmToken(
  token: string,
  marker: string,
): Promise<void> {
  const key = redemptionKey(token);
  const redis = getRedis();
  if (!redis) {
    if (memoryClaims.get(key)?.value === marker) memoryClaims.delete(key);
    return;
  }
  try {
    await redis.eval(CAS_DEL, [key], [marker]);
  } catch (error) {
    logger.error("Newsletter confirm claim release failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
