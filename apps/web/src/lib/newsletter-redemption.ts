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
 *
 * Those two checks narrow the races; they cannot close them, because every
 * check-then-mutate sequence here spans a Resend round trip. withConsentLock
 * closes them structurally: the confirm route, the webhook's record step, each
 * consent repair and the cron's reconcile all run under one per-address lock,
 * so for a given address only one of them is ever between "read" and "write".
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

// ---------------------------------------------------------------------------
// Per-address consent lock
// ---------------------------------------------------------------------------

interface LockTiming {
  /** How long a holder may keep the lock before it lapses on its own. */
  leaseMs: number;
  /** How long a caller waits for a busy lock before giving up. */
  waitMs: number;
  /** Pause between attempts (jittered). */
  retryMs: number;
}

/**
 * The lease must outlast the longest critical section. The confirm route caps
 * a request at 30s (its maxDuration) and the webhook and cron set none, so 60s
 * covers all three; it still expires on its own if the holder dies.
 */
const DEFAULT_LOCK_TIMING: LockTiming = {
  leaseMs: 60_000,
  waitMs: 5_000,
  retryMs: 50,
};
let lockTiming: LockTiming = { ...DEFAULT_LOCK_TIMING };

export function __setConsentLockTimingForTests(t: Partial<LockTiming>): void {
  lockTiming = { ...lockTiming, ...t };
}

const memoryLocks = new Map<string, { token: string; until: number }>();
// Delete the lock only if we still hold it, so a lapsed lease that someone
// else has since taken is never released from under them.
const LOCK_RELEASE = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) end return 0`;

function consentLockKey(email: string): string {
  const normalized = email.trim().toLowerCase();
  return `mythos:newsletter:lock:${createHash("sha256").update(normalized).digest("hex")}`;
}

type TryLock = "acquired" | "busy" | "unavailable";

async function tryLock(key: string, token: string): Promise<TryLock> {
  const redis = getRedis();
  if (!redis) {
    // Without a shared store another instance cannot be excluded.
    if (isProductionRuntime()) return "unavailable";
    const now = Date.now();
    const held = memoryLocks.get(key);
    if (held && held.until > now) return "busy";
    memoryLocks.set(key, { token, until: now + lockTiming.leaseMs });
    return "acquired";
  }
  try {
    const set = await redis.set(key, token, { nx: true, px: lockTiming.leaseMs });
    return set === "OK" ? "acquired" : "busy";
  } catch (error) {
    logger.error("Newsletter consent lock could not be taken", {
      error: error instanceof Error ? error.message : String(error),
    });
    return "unavailable";
  }
}

async function unlock(key: string, token: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    if (memoryLocks.get(key)?.token === token) memoryLocks.delete(key);
    return;
  }
  try {
    await redis.eval(LOCK_RELEASE, [key], [token]);
  } catch (error) {
    // The lease lapses on its own; a failed release only delays the next holder.
    logger.error("Newsletter consent lock release failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Proof-of-ownership check handed to the code running under the lock. */
export interface ConsentLockHandle {
  /**
   * True while this holder still owns the lock. Call it immediately before
   * each Resend mutation and before deleting any repair or write-ahead record:
   * a lease can lapse under a slow request, and nothing may then be changed.
   * An unreadable store answers false (fail closed).
   */
  held(): Promise<boolean>;
}

/** Thrown from inside a locked section when the lease was lost. */
export class ConsentLockLostError extends Error {
  constructor() {
    super("consent lock lost");
  }
}

async function isLockHeld(key: string, token: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    const held = memoryLocks.get(key);
    return held?.token === token && held.until > Date.now();
  }
  try {
    return (await redis.get<string>(key)) === token;
  } catch {
    return false;
  }
}

export type ConsentLockResult<T> =
  | { locked: true; value: T }
  | { locked: false };

/**
 * Run `fn` while holding the consent lock for `email`. Every read-check-mutate
 * sequence over one address's consent goes through here, so two of them can
 * never interleave. Waits a bounded time for a busy lock, then gives up with
 * `{ locked: false }` and `fn` never runs: the caller must answer retryably
 * (confirm 503, webhook 503) or skip the item (cron) and must not delete or
 * "settle" anything. Re-evaluate any decision made before the lock was taken.
 */
export async function withConsentLock<T>(
  email: string,
  fn: (lock: ConsentLockHandle) => Promise<T>,
): Promise<ConsentLockResult<T>> {
  const key = consentLockKey(email);
  const token = randomUUID();
  const attempts = Math.max(1, Math.ceil(lockTiming.waitMs / lockTiming.retryMs));
  let acquired = false;
  for (let i = 0; i < attempts; i += 1) {
    const result = await tryLock(key, token);
    if (result === "unavailable") return { locked: false };
    if (result === "acquired") {
      acquired = true;
      break;
    }
    await new Promise((resolve) =>
      setTimeout(resolve, lockTiming.retryMs * (0.5 + Math.random())),
    );
  }
  if (!acquired) return { locked: false };
  try {
    return {
      locked: true,
      value: await fn({ held: () => isLockHeld(key, token) }),
    };
  } finally {
    await unlock(key, token);
  }
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
  memoryLocks.clear();
  lockTiming = { ...DEFAULT_LOCK_TIMING };
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
 * Durable consent reconciliation. Resend has no conditional write, so a
 * confirm can commit `unsubscribed: false` over an unsubscribe, and every path
 * that re-applies it can fail. The work is therefore a record of its own, in
 * one hash the cron drains, independent of token redemption. Two kinds:
 *
 * - "confirm": written BEFORE a confirm's first Resend mutation (write-ahead),
 *   so no resubscribe can happen without a record the cron can find. Field
 *   `confirm:<token hash>`, value `<issuedAtMs>:<armedAtMs>:<email>`. The cron
 *   decides from the recorded unsubscribe whether anything is owed; a confirm
 *   that finished cleanly removes its own record.
 * - "unsubscribe": written when a webhook could not re-apply an unsubscribe.
 *   Field is the address hash, value `<atMs>:<email>`. Only ever moves forward:
 *   a delayed older event must not replace a newer reader intent.
 */
const REPAIR_HASH = "mythos:newsletter:consent-repair";
const REPAIR_TTL_SECONDS = 30 * 24 * 60 * 60;
/** A confirm with no recorded unsubscribe is given this long to finish. */
export const CONFIRM_ARM_GRACE_MS = 15 * 60 * 1000;
// Delete the field only if it still holds the value we repaired, so a newer
// record written meanwhile survives.
const REPAIR_CLEAR = `if redis.call("hget", KEYS[1], ARGV[1]) == ARGV[2] then return redis.call("hdel", KEYS[1], ARGV[1]) end return 0`;
// Replace the record only when the new one is not older than the stored one.
const REPAIR_SET_NEWEST = `local cur = redis.call("hget", KEYS[1], ARGV[1]) if cur then local at = tonumber(string.match(cur, "^(%d+):")) if at and at >= tonumber(ARGV[4]) then return 0 end end redis.call("hset", KEYS[1], ARGV[1], ARGV[2]) redis.call("expire", KEYS[1], ARGV[3]) return 1`;

export type ConsentRepairKind = "unsubscribe" | "confirm";

export interface ConsentRepair {
  email: string;
  /** Unsubscribe: when the reader's intent was seen. Confirm: token issued-at. */
  atMs: number;
  kind: ConsentRepairKind;
  field: string;
  /** Confirm only: when the record was written. */
  armedAtMs?: number;
}

const memoryRepairs = new Map<string, string>();

function unsubscribeRepairField(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

function repairValue(repair: ConsentRepair): string {
  const email = repair.email.trim().toLowerCase();
  return repair.kind === "confirm"
    ? `${repair.atMs}:${repair.armedAtMs ?? 0}:${email}`
    : `${repair.atMs}:${email}`;
}

function parseRepair(field: string, raw: unknown): ConsentRepair | null {
  const parts = String(raw).split(":");
  if (field.startsWith("confirm:")) {
    const [at, armed, ...rest] = parts;
    const email = rest.join(":");
    const atMs = Number(at);
    const armedAtMs = Number(armed);
    return Number.isFinite(atMs) && Number.isFinite(armedAtMs) && email
      ? { email, atMs, armedAtMs, kind: "confirm", field }
      : null;
  }
  const [at, ...rest] = parts;
  const email = rest.join(":");
  const atMs = Number(at);
  return Number.isFinite(atMs) && email
    ? { email, atMs, kind: "unsubscribe", field }
    : null;
}

async function writeRepair(
  repair: ConsentRepair,
  newestOnly: boolean,
): Promise<boolean> {
  const value = repairValue(repair);
  const redis = getRedis();
  if (!redis) {
    if (isProductionRuntime()) return false;
    const cur = memoryRepairs.get(repair.field);
    const curAt = cur ? Number(cur.split(":")[0]) : Number.NaN;
    if (newestOnly && Number.isFinite(curAt) && curAt >= repair.atMs) return true;
    memoryRepairs.set(repair.field, value);
    return true;
  }
  try {
    if (newestOnly) {
      await redis.eval(
        REPAIR_SET_NEWEST,
        [REPAIR_HASH],
        [repair.field, value, String(REPAIR_TTL_SECONDS), String(repair.atMs)],
      );
    } else {
      await redis.eval(
        INDEX_SET,
        [REPAIR_HASH],
        [repair.field, value, String(REPAIR_TTL_SECONDS)],
      );
    }
    return true;
  } catch (error) {
    logger.error("Newsletter consent repair write failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Persist "this address must end up unsubscribed". True once a record at least
 * as new as `atMs` is stored.
 */
export async function recordConsentRepair(
  email: string,
  atMs: number,
): Promise<boolean> {
  return writeRepair(
    {
      email,
      atMs,
      kind: "unsubscribe",
      field: unsubscribeRepairField(email),
    },
    true,
  );
}

/**
 * Write-ahead record for a confirm. Call it before the first Resend mutation
 * and refuse to mutate when it returns null: a resubscribe is then always
 * covered by a record the cron can reconcile, whatever fails afterwards.
 */
export async function armConfirmReconcile(
  email: string,
  token: string,
): Promise<ConsentRepair | null> {
  const repair: ConsentRepair = {
    email,
    atMs: confirmTokenIssuedAtMs(token),
    armedAtMs: Date.now(),
    kind: "confirm",
    field: `confirm:${tokenField(token)}`,
  };
  return (await writeRepair(repair, false)) ? repair : null;
}

/** Every pending record; null when the store cannot be read. */
export async function listConsentRepairs(): Promise<ConsentRepair[] | null> {
  const redis = getRedis();
  if (!redis) {
    if (isProductionRuntime()) return null;
    return [...memoryRepairs].flatMap(([f, v]) => parseRepair(f, v) ?? []);
  }
  try {
    const raw = await redis.hgetall<Record<string, unknown>>(REPAIR_HASH);
    return Object.entries(raw ?? {}).flatMap(([f, v]) => parseRepair(f, v) ?? []);
  } catch {
    return null;
  }
}

/** Remove a record that is done, unless a newer one replaced it. */
export async function clearConsentRepair(
  repair: ConsentRepair,
): Promise<boolean> {
  const value = repairValue(repair);
  const redis = getRedis();
  if (!redis) {
    if (memoryRepairs.get(repair.field) === value) {
      memoryRepairs.delete(repair.field);
    }
    return true;
  }
  try {
    await redis.eval(REPAIR_CLEAR, [REPAIR_HASH], [repair.field, value]);
    return true;
  } catch (error) {
    logger.error("Newsletter consent repair clear failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * True while the stored record is still exactly `repair`. The cron lists
 * records before taking the lock, so it asks again inside it: a confirm that
 * finished meanwhile has cleared its own, and a newer repair replaced the rest.
 * Null when the store cannot be read.
 */
export async function isConsentRepairCurrent(
  repair: ConsentRepair,
): Promise<boolean | null> {
  const value = repairValue(repair);
  const redis = getRedis();
  if (!redis) {
    if (isProductionRuntime()) return null;
    return memoryRepairs.get(repair.field) === value;
  }
  try {
    const raw = await redis.hgetall<Record<string, unknown>>(REPAIR_HASH);
    const stored = raw?.[repair.field];
    return stored !== undefined && String(stored) === value;
  } catch {
    return null;
  }
}

/** Latest recorded unsubscribe: a time, undefined for none, null if unreadable. */
async function readUnsubscribeAt(
  email: string,
): Promise<number | undefined | null> {
  const key = unsubscribeKey(email);
  const redis = getRedis();
  if (!redis) {
    if (isProductionRuntime()) return null;
    return memoryUnsubs.get(key);
  }
  try {
    const raw = await redis.get<string | number>(key);
    return raw === null || raw === undefined ? undefined : Number(raw);
  } catch {
    return null;
  }
}

export type ConsentRepairAssessment =
  /** Re-apply the unsubscribe. */
  | "owed"
  /** The reader asked for a newer link after leaving; do not undo it. */
  | "superseded"
  /** A confirm record with no unsubscribe behind it, past its grace period. */
  | "settled"
  /** A confirm record that may still be running; look again next run. */
  | "in_flight";

/**
 * What the cron should do with a record, judged against the latest recorded
 * unsubscribe and not the record's own timestamp, so neither a delayed older
 * event nor a clock-stamped confirm record can make a deliberate resubscribe
 * look newer or older than it was. Null when the store cannot be read.
 */
export async function assessConsentRepair(
  repair: ConsentRepair,
  now: number = Date.now(),
): Promise<ConsentRepairAssessment | null> {
  const unsubAt = await readUnsubscribeAt(repair.email);
  if (unsubAt === null) return null;
  let at: number;
  if (repair.kind === "confirm") {
    // Same test the mutation guard uses: left after this link was issued.
    if (unsubAt === undefined || unsubAt < repair.atMs) {
      return now - (repair.armedAtMs ?? 0) > CONFIRM_ARM_GRACE_MS
        ? "settled"
        : "in_flight";
    }
    at = unsubAt;
  } else {
    at = Math.max(repair.atMs, unsubAt ?? 0);
  }
  const activity = await readConfirmActivity(repair.email);
  if (!activity) return null;
  return activity.some((a) => a.issuedAtMs > at) ? "superseded" : "owed";
}
