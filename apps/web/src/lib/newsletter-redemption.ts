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
 *
 * Resend has no conditional write, so an update already in flight can still
 * commit `unsubscribed: false` over an unsubscribe that lands mid-call. Every
 * claim is therefore also listed in a per-address index (issued-at, and the
 * time the confirm finished or "p" while it is still running). Two checks read
 * it so consent converges on the reader's latest intent: the webhook asks
 * unsubscribeNeedsRepair after recording, and a confirm asks
 * checkUnsubscribeAfterMutation after its last mutation. Each side writes
 * before it reads, so at least one of them always sees the other.
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

/**
 * How far an unsubscribe's timestamp may sit after a finished confirm's end
 * time and still count as overlapping it. Resend stamps the event, we stamp
 * the end, and the two clocks are not the same clock.
 */
export const CONFIRM_OVERLAP_SKEW_MS = 2 * 60 * 1000;

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

/** Keyed on the address; one field per token (its hash). */
function confirmIndexKey(email: string): string {
  const normalized = email.trim().toLowerCase();
  return `mythos:newsletter:confirms:${createHash("sha256").update(normalized).digest("hex")}`;
}

function tokenField(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** "<issuedAtMs>:p" while running, "<issuedAtMs>:<endMs>" once finished. */
function indexValue(token: string, end: number | "p"): string {
  return `${confirmTokenIssuedAtMs(token)}:${end}`;
}

interface ConfirmActivity {
  issuedAtMs: number;
  /** Infinity while the confirm has not finished. */
  endMs: number;
}

function parseActivity(raw: unknown): ConfirmActivity | null {
  const [issued, end] = String(raw).split(":");
  const issuedAtMs = Number(issued);
  if (!Number.isFinite(issuedAtMs)) return null;
  if (end === "p") return { issuedAtMs, endMs: Number.POSITIVE_INFINITY };
  const endMs = Number(end);
  return Number.isFinite(endMs) ? { issuedAtMs, endMs } : null;
}

const memoryClaims = new Map<string, { value: string; until: number }>();
const memoryUnsubs = new Map<string, number>();
const memoryConfirms = new Map<string, Map<string, string>>();

export function __resetNewsletterRedemptionForTests(): void {
  memoryClaims.clear();
  memoryUnsubs.clear();
  memoryConfirms.clear();
  memoryRepairs.clear();
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
// Write one index field and keep the whole index no longer than a token lives.
const INDEX_SET = `redis.call("hset", KEYS[1], ARGV[1], ARGV[2]) redis.call("expire", KEYS[1], ARGV[3]) return 1`;
const MAX_SET = `local cur = redis.call("get", KEYS[1]) if (not cur) or tonumber(cur) < tonumber(ARGV[1]) then redis.call("set", KEYS[1], ARGV[1], "EX", ARGV[2]) end return 1`;

/**
 * Two-state claim. `pending:<id>` is written with the FULL token TTL, so it
 * cannot lapse into "free" while the token is still valid. `done` marks a
 * finished confirmation.
 */
export async function claimConfirmToken(
  token: string,
  ttlSeconds: number,
  email: string,
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
    writeMemoryIndex(email, token, "p");
    return { status: "claimed", marker };
  }
  try {
    const set = await redis.set(key, marker, { nx: true, ex: ttlSeconds });
    if (set === "OK") {
      // List the confirm BEFORE its first guard, so a webhook that records an
      // unsubscribe after this point is guaranteed to see it. If the index
      // cannot be written the claim stays pending (nothing was mutated) and
      // the reader asks for a new link.
      if (!(await writeRedisIndex(redis, email, token, "p"))) {
        return { status: "unavailable" };
      }
      return { status: "claimed", marker };
    }
    const current = await redis.get<string>(key);
    return current === DONE ? { status: "done" } : { status: "pending" };
  } catch {
    return { status: "unavailable" };
  }
}

function writeMemoryIndex(
  email: string,
  token: string,
  end: number | "p",
): void {
  const key = confirmIndexKey(email);
  const index = memoryConfirms.get(key) ?? new Map<string, string>();
  index.set(tokenField(token), indexValue(token, end));
  memoryConfirms.set(key, index);
}

async function writeRedisIndex(
  redis: Redis,
  email: string,
  token: string,
  end: number | "p",
): Promise<boolean> {
  try {
    await redis.eval(
      INDEX_SET,
      [confirmIndexKey(email)],
      [tokenField(token), indexValue(token, end), String(CONFIRM_TOKEN_TTL_SECONDS)],
    );
    return true;
  } catch (error) {
    logger.error("Newsletter confirm index write failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/** Every confirm listed for the address; null when the store cannot be read. */
async function readConfirmActivity(
  email: string,
): Promise<ConfirmActivity[] | null> {
  const key = confirmIndexKey(email);
  const redis = getRedis();
  let raw: Record<string, unknown> | Map<string, string> | null;
  if (!redis) {
    if (isProductionRuntime()) return null;
    raw = memoryConfirms.get(key) ?? null;
  } else {
    try {
      raw = await redis.hgetall<Record<string, unknown>>(key);
    } catch {
      return null;
    }
  }
  if (!raw) return [];
  const values = raw instanceof Map ? [...raw.values()] : Object.values(raw);
  return values.flatMap((v) => parseActivity(v) ?? []);
}

/**
 * pending -> done, only if the claim is still ours. A failure is logged, not
 * swallowed; the claim then stays pending until the token expires.
 */
export async function completeConfirmToken(
  token: string,
  marker: string,
  ttlSeconds: number,
  email: string,
): Promise<boolean> {
  const key = redemptionKey(token);
  const redis = getRedis();
  if (!redis) {
    if (memoryClaims.get(key)?.value !== marker) return false;
    memoryClaims.set(key, {
      value: DONE,
      until: Date.now() + ttlSeconds * 1000,
    });
    writeMemoryIndex(email, token, Date.now());
    return true;
  }
  try {
    const ok = await redis.eval(
      CAS_SET,
      [key],
      [marker, DONE, String(ttlSeconds)],
    );
    if (Number(ok) === 1) {
      // A failed write leaves the entry "p", which only over-repairs.
      await writeRedisIndex(redis, email, token, Date.now());
      return true;
    }
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

export type PostMutationVerdict = "ok" | "unsubscribed" | "unavailable";

/**
 * Run after a confirm's last Resend mutation. "unsubscribed" means the reader
 * left after this token was issued and has not asked for a newer link since,
 * so the caller must set the contact unsubscribed again: the mutation that
 * just finished may have committed over the unsubscribe. An unreadable store
 * answers "unavailable" (fail closed).
 */
export async function checkUnsubscribeAfterMutation(
  token: string,
  email: string,
): Promise<PostMutationVerdict> {
  const unsubKey = unsubscribeKey(email);
  const issuedAtMs = confirmTokenIssuedAtMs(token);
  const redis = getRedis();
  let unsubAt: number | null;
  if (!redis) {
    if (isProductionRuntime()) return "unavailable";
    unsubAt = memoryUnsubs.get(unsubKey) ?? null;
  } else {
    try {
      const raw = await redis.get<string | number>(unsubKey);
      unsubAt = raw === null || raw === undefined ? null : Number(raw);
    } catch {
      return "unavailable";
    }
  }
  if (unsubAt === null || !(unsubAt >= issuedAtMs)) return "ok";
  const activity = await readConfirmActivity(email);
  if (!activity) return "unavailable";
  // A link requested after the unsubscribe is a newer intent to subscribe.
  return activity.some((a) => a.issuedAtMs > unsubAt) ? "ok" : "unsubscribed";
}

/**
 * Run by the webhook after it recorded an unsubscribe at `atMs`. True when a
 * confirm whose link predates the unsubscribe was running or finished around
 * it, so its mutation may have committed over it and the contact must be set
 * unsubscribed again. False when no such confirm exists, or when the reader
 * has asked for a newer link since (a late retry of an old event must not undo
 * a deliberate re-subscribe). Null when the store cannot be read.
 */
export async function unsubscribeNeedsRepair(
  email: string,
  atMs: number,
): Promise<boolean | null> {
  const activity = await readConfirmActivity(email);
  if (!activity) return null;
  if (activity.some((a) => a.issuedAtMs > atMs)) return false;
  return activity.some((a) => a.endMs >= atMs - CONFIRM_OVERLAP_SKEW_MS);
}

/**
 * Durable consent repairs. When re-applying an unsubscribe fails (Resend down
 * for every retry), the contact may stay subscribed with nobody left to fix
 * it: the webhook was already acknowledged and the confirm token is spent. The
 * repair is therefore its own work item, independent of token redemption, and
 * the cron retries it until it sticks. One field per address (its hash), value
 * `<atMs>:<email>`; `atMs` is when the reader's unsubscribe intent was seen.
 */
const REPAIR_HASH = "mythos:newsletter:consent-repair";
const REPAIR_TTL_SECONDS = 30 * 24 * 60 * 60;
// Delete the field only if it still holds the value we repaired, so a newer
// record written meanwhile survives.
const REPAIR_CLEAR = `if redis.call("hget", KEYS[1], ARGV[1]) == ARGV[2] then return redis.call("hdel", KEYS[1], ARGV[1]) end return 0`;

export interface ConsentRepair {
  email: string;
  atMs: number;
}

const memoryRepairs = new Map<string, string>();

function repairField(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

function repairValue(repair: ConsentRepair): string {
  return `${repair.atMs}:${repair.email.trim().toLowerCase()}`;
}

function parseRepair(raw: unknown): ConsentRepair | null {
  const text = String(raw);
  const split = text.indexOf(":");
  if (split < 1) return null;
  const atMs = Number(text.slice(0, split));
  const email = text.slice(split + 1);
  return Number.isFinite(atMs) && email ? { email, atMs } : null;
}

/** Persist "this address must end up unsubscribed". True once it is stored. */
export async function recordConsentRepair(
  email: string,
  atMs: number,
): Promise<boolean> {
  const field = repairField(email);
  const value = repairValue({ email, atMs });
  const redis = getRedis();
  if (!redis) {
    if (isProductionRuntime()) return false;
    memoryRepairs.set(field, value);
    return true;
  }
  try {
    await redis.eval(
      INDEX_SET,
      [REPAIR_HASH],
      [field, value, String(REPAIR_TTL_SECONDS)],
    );
    return true;
  } catch (error) {
    logger.error("Newsletter consent repair write failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/** Every pending repair; null when the store cannot be read. */
export async function listConsentRepairs(): Promise<ConsentRepair[] | null> {
  const redis = getRedis();
  if (!redis) {
    if (isProductionRuntime()) return null;
    return [...memoryRepairs.values()].flatMap((v) => parseRepair(v) ?? []);
  }
  try {
    const raw = await redis.hgetall<Record<string, unknown>>(REPAIR_HASH);
    return Object.values(raw ?? {}).flatMap((v) => parseRepair(v) ?? []);
  } catch {
    return null;
  }
}

/** Remove a repair that is done, unless a newer one replaced it. */
export async function clearConsentRepair(
  repair: ConsentRepair,
): Promise<boolean> {
  const field = repairField(repair.email);
  const value = repairValue(repair);
  const redis = getRedis();
  if (!redis) {
    if (memoryRepairs.get(field) === value) memoryRepairs.delete(field);
    return true;
  }
  try {
    await redis.eval(REPAIR_CLEAR, [REPAIR_HASH], [field, value]);
    return true;
  } catch (error) {
    logger.error("Newsletter consent repair clear failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * False when the reader asked for a newer link after the unsubscribe (a
 * deliberate re-subscribe the repair must not undo). Null when unreadable.
 */
export async function consentRepairStillWanted(
  repair: ConsentRepair,
): Promise<boolean | null> {
  const activity = await readConfirmActivity(repair.email);
  if (!activity) return null;
  return !activity.some((a) => a.issuedAtMs > repair.atMs);
}
