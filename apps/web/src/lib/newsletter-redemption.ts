/**
 * Single-use redemption of newsletter confirmation tokens, and the unsubscribe
 * record that lets a confirm abort instead of re-subscribing a leaver.
 *
 * A signed token stays cryptographically valid for seven days, so without a
 * server-side record it can be replayed. The first request to redeem a token
 * wins an atomic SET NX on the token's hash (the token itself is never
 * stored) with the token's full remaining lifetime as TTL.
 *
 * There is deliberately NO takeover and NO release. A claim is
 * `pending:<id>` until its owner writes `done`, and a claim whose owner died
 * or failed simply expires with the token. Every recovery path we had (stale
 * takeover, release after error, "is the contact already in the segment")
 * could be raced by an unsubscribe, so none exists. Only `done` is ever
 * answered as success.
 *
 * Unsubscribes happen on Resend's hosted page, so the app learns of them from
 * the contact.updated webhook, which calls recordNewsletterUnsubscribe.
 */
import { createHash, randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";
import {
  CONFIRM_TOKEN_TTL_SECONDS,
  confirmTokenIssuedAtMs,
} from "@/lib/newsletter-token";

export type RedemptionClaim =
  | { status: "claimed"; marker: string }
  | { status: "done" }
  | { status: "pending" }
  | { status: "unavailable" };

export type MutationVerdict = "ok" | "lost" | "unsubscribed" | "unavailable";

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

/** Keyed on the address as the contact is stored in Resend (lowercased). */
function unsubscribeKey(email: string): string {
  const normalized = email.trim().toLowerCase();
  return `mythos:newsletter:unsub:${createHash("sha256").update(normalized).digest("hex")}`;
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
const memoryUnsubs = new Map<string, number>();

export function __resetNewsletterRedemptionForTests(): void {
  memoryClaims.clear();
  memoryUnsubs.clear();
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const rToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && rToken ? new Redis({ url, token: rToken }) : null;
}

// Compare-and-set: only the holder of the exact value may change a claim.
const CAS_SET = `if redis.call("get", KEYS[1]) == ARGV[1] then redis.call("set", KEYS[1], ARGV[2], "EX", ARGV[3]) return 1 else return 0 end`;
// One atomic read of "do we still own the claim" and "did the reader leave
// after the link was issued": 0 lost, 2 unsubscribed, 1 ok.
const GUARD = `if redis.call("get", KEYS[1]) ~= ARGV[1] then return 0 end local u = redis.call("get", KEYS[2]) if u and tonumber(u) >= tonumber(ARGV[2]) then return 2 end return 1`;
// Keep the newest unsubscribe time, so a late event cannot move it backwards.
const MAX_SET = `local cur = redis.call("get", KEYS[1]) if (not cur) or tonumber(cur) < tonumber(ARGV[1]) then redis.call("set", KEYS[1], ARGV[1], "EX", ARGV[2]) end return 1`;

/**
 * Two-state claim. `pending:<id>` is written with the FULL token TTL, so it
 * cannot lapse into "free" while the token is still valid. `done` marks a
 * finished confirmation.
 */
export async function claimConfirmToken(
  token: string,
  ttlSeconds: number,
): Promise<RedemptionClaim> {
  const key = redemptionKey(token);
  const now = Date.now();
  const marker = `pending:${randomUUID()}`;
  const redis = getRedis();
  if (!redis) {
    // Without a shared store a replay on another instance is undetectable.
    if (isProductionRuntime()) return { status: "unavailable" };
    const existing = memoryClaims.get(key);
    if (existing && existing.until > now) {
      return existing.value === DONE ? { status: "done" } : { status: "pending" };
    }
    memoryClaims.set(key, { value: marker, until: now + ttlSeconds * 1000 });
    return { status: "claimed", marker };
  }
  try {
    const set = await redis.set(key, marker, { nx: true, ex: ttlSeconds });
    if (set === "OK") return { status: "claimed", marker };
    const current = await redis.get<string>(key);
    return current === DONE ? { status: "done" } : { status: "pending" };
  } catch {
    return { status: "unavailable" };
  }
}

/**
 * pending -> done, only if the claim is still ours. A failure is logged, not
 * swallowed; the claim then stays pending until the token expires.
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

/**
 * Remember that this address unsubscribed at `atMs`. Any confirm link issued
 * before that moment is refused from then on.
 */
export async function recordNewsletterUnsubscribe(
  email: string,
  atMs: number,
): Promise<boolean> {
  const key = unsubscribeKey(email);
  const redis = getRedis();
  if (!redis) {
    if (isProductionRuntime()) return false;
    memoryUnsubs.set(key, Math.max(memoryUnsubs.get(key) ?? 0, atMs));
    return true;
  }
  try {
    await redis.eval(MAX_SET, [key], [String(atMs), String(CONFIRM_TOKEN_TTL_SECONDS)]);
    return true;
  } catch (error) {
    logger.error("Newsletter unsubscribe record write failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * The one guard for Resend mutations. Call it immediately before each one:
 * "ok" only when this request still owns the claim AND the address has not
 * unsubscribed since the token was issued. Any other answer means do not
 * mutate. An unreadable store aborts too (fail closed).
 */
export async function checkConfirmMutationAllowed(
  token: string,
  marker: string,
  email: string,
): Promise<MutationVerdict> {
  const key = redemptionKey(token);
  const unsubKey = unsubscribeKey(email);
  const issuedAtMs = confirmTokenIssuedAtMs(token);
  const redis = getRedis();
  if (!redis) {
    if (isProductionRuntime()) return "unavailable";
    if (memoryClaims.get(key)?.value !== marker) return "lost";
    return (memoryUnsubs.get(unsubKey) ?? -1) >= issuedAtMs
      ? "unsubscribed"
      : "ok";
  }
  try {
    const verdict = Number(
      await redis.eval(GUARD, [key, unsubKey], [marker, String(issuedAtMs)]),
    );
    if (verdict === 1) return "ok";
    if (verdict === 2) return "unsubscribed";
    return "lost";
  } catch {
    return "unavailable";
  }
}
