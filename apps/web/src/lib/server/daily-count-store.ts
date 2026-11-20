/**
 * The anonymous daily counts: which counters exist, and where they are kept.
 *
 * Storage is one Redis hash per UTC day, one field per counter, each holding a
 * number. Nothing else is written: no cookie, no network address, no browser
 * details, no identifier, no page address.
 *
 * Production fails closed without Upstash (the caller answers that it could
 * not store). Development keeps the numbers in memory.
 */
import { Redis } from "@upstash/redis";
import { ARRIVAL_SOURCES, PAGE_STEPS, PAGE_TYPES } from "@/lib/daily-counts";
import { NEWSLETTER_PLACEMENTS } from "@/lib/newsletter";
import { isProductionRuntime, utcDayKey } from "@/lib/server/runtime";

const SIGNUP_REFUSALS = ["rate-limited", "invalid", "unavailable"] as const;
const CONFIRM_OUTCOMES = [
  "ok",
  "expired",
  "invalid",
  "busy",
  "rate-limited",
  "unavailable",
] as const;

/**
 * Every counter the store accepts. A name that is not built here cannot be
 * stored, so the store can never be used to carry text.
 */
export const DAILY_COUNTERS: readonly string[] = [
  ...PAGE_STEPS.flatMap((step) =>
    PAGE_TYPES.flatMap((page) =>
      ARRIVAL_SOURCES.map((source) => `${step}:${page}:${source}`),
    ),
  ),
  ...[...NEWSLETTER_PLACEMENTS, "none"].map(
    (placement) => `signup-requested:${placement}`,
  ),
  ...SIGNUP_REFUSALS.map((reason) => `signup-refused:${reason}`),
  "confirm-view",
  ...CONFIRM_OUTCOMES.map((outcome) => `confirm:${outcome}`),
];

const counterSet: ReadonlySet<string> = new Set(DAILY_COUNTERS);

/**
 * Turns a beacon body into a counter, or null when it is anything other than
 * exactly one of the `CountBeacon` shapes. Extra keys are refused.
 */
export function counterForBeacon(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const record = body as Record<string, unknown>;
  const keys = Object.keys(record);
  if (record.step === "confirm-view") {
    return keys.length === 1 ? "confirm-view" : null;
  }
  const { step, page, source } = record;
  if (
    keys.length !== 3 ||
    typeof step !== "string" ||
    typeof page !== "string" ||
    typeof source !== "string" ||
    !(PAGE_STEPS as readonly string[]).includes(step)
  ) {
    return null;
  }
  const counter = `${step}:${page}:${source}`;
  return counterSet.has(counter) ? counter : null;
}

/**
 * Counter for a finished sign-up request. `placement` stays undefined until
 * the request has passed validation and the honeypot, so a bot that fills the
 * hidden field is answered 200 and counted nowhere.
 */
export function signupCounter(
  status: number,
  placement: string | undefined,
): string | null {
  if (status === 200) {
    return placement === undefined ? null : `signup-requested:${placement}`;
  }
  if (status === 429) return "signup-refused:rate-limited";
  if (status === 400 || status === 413) return "signup-refused:invalid";
  if (status >= 500) return "signup-refused:unavailable";
  return null;
}

/** Counter for a finished confirmation request. */
export function confirmCounter(status: number, reason: unknown): string | null {
  if (status === 200) return "confirm:ok";
  if (status === 400 || status === 413) {
    return reason === "expired" ? "confirm:expired" : "confirm:invalid";
  }
  if (status === 409) return "confirm:busy";
  if (status === 429) return "confirm:rate-limited";
  if (status >= 500) return "confirm:unavailable";
  return null;
}

/**
 * Most browser beacons stored in one UTC day. The beacon route takes no
 * per-visitor rate limit, because that would mean keeping a network address,
 * so this ceiling is what bounds a flood. Far above real traffic: Search
 * Console showed about 75 search clicks a day in November 2026.
 */
export const DAILY_BEACON_CAP = 10_000;

/** How long a day's totals are kept. */
const RETENTION_SECONDS = 60 * 60 * 24 * 40;
/** Longest wait for one store request. */
const STORE_TIMEOUT_MS = 1500;
/**
 * How long a forward claim holds before the send is confirmed. Long enough
 * for one run, short enough that a run that died mid-send can be repeated.
 */
const FORWARD_CLAIM_SECONDS = 60 * 10;
/** Hash field that counts stored beacons against the cap. Not a counter. */
const BEACON_TALLY = "beacons";

export type CountResult =
  | { stored: true }
  | { stored: false; reason: "not_configured" | "capped" | "unavailable" };

const memory = new Map<string, Map<string, number>>();
/** Day on which this instance saw the cap reached; skips Redis until it rolls over. */
let cappedDay: string | null = null;

function keyFor(day: string): string {
  return `mythos:count:${day}`;
}

function connect(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  // One retry and a short time limit per request, not the client's default
  // five retries: a count is best effort and must not hold a sign-up answer
  // while the store is down or slow.
  return url && token
    ? new Redis({
        url,
        token,
        retry: { retries: 1 },
        signal: () => AbortSignal.timeout(STORE_TIMEOUT_MS),
      })
    : null;
}

/**
 * Adds one to a field of the day's hash and returns the new value. Null in
 * production without Upstash. Throws when Redis does.
 */
async function bump(day: string, field: string): Promise<number | null> {
  const redis = connect();
  if (!redis) {
    if (isProductionRuntime()) return null;
    const fields = memory.get(day) ?? new Map<string, number>();
    memory.set(day, fields);
    const next = (fields.get(field) ?? 0) + 1;
    fields.set(field, next);
    return next;
  }
  const key = keyFor(day);
  const value = await redis.hincrby(key, field, 1);
  if (value === 1) await redis.expire(key, RETENTION_SECONDS);
  return value;
}

/**
 * Adds one to `counter` for the current UTC day. Never throws: a counter that
 * cannot be stored must not change what the calling route answers.
 *
 * `budgeted` is for counts a browser can cause without passing a rate limit.
 * They are checked against DAILY_BEACON_CAP first.
 */
export async function recordDailyCount(
  counter: string,
  options: { budgeted?: boolean } = {},
  now: Date = new Date(),
): Promise<CountResult> {
  if (!counterSet.has(counter)) return { stored: false, reason: "unavailable" };
  const day = utcDayKey(now);
  if (options.budgeted && cappedDay === day) {
    return { stored: false, reason: "capped" };
  }

  try {
    if (options.budgeted) {
      const tally = await bump(day, BEACON_TALLY);
      if (tally === null) return { stored: false, reason: "not_configured" };
      if (tally > DAILY_BEACON_CAP) {
        cappedDay = day;
        return { stored: false, reason: "capped" };
      }
    }
    return (await bump(day, counter)) === null
      ? { stored: false, reason: "not_configured" }
      : { stored: true };
  } catch {
    return { stored: false, reason: "unavailable" };
  }
}

/**
 * Counts a finished newsletter step. Never changes the route's answer.
 * Refusals share the browser budget, because some of them happen before the
 * route's own rate limit has run.
 */
export async function recordStepCount(
  counter: string | null,
  status: number,
): Promise<void> {
  if (counter) await recordDailyCount(counter, { budgeted: status !== 200 });
}

export interface DayCounts {
  /** Listed counters with a total above zero. */
  counts: Record<string, number>;
  /** Browser beacons stored that day, for comparison with DAILY_BEACON_CAP. */
  beacons: number;
}

/** The totals for one UTC day (`YYYY-MM-DD`). Null when the store could not be read. */
export async function readDailyCounts(day: string): Promise<DayCounts | null> {
  let raw: Record<string, unknown> | null;
  try {
    const redis = connect();
    if (redis) {
      raw = await redis.hgetall<Record<string, unknown>>(keyFor(day));
    } else {
      if (isProductionRuntime()) return null;
      raw = Object.fromEntries(memory.get(day) ?? []);
    }
  } catch {
    return null;
  }

  const total = (field: string): number => {
    const value = Number(raw?.[field]);
    return Number.isSafeInteger(value) && value > 0 ? value : 0;
  };
  const counts: Record<string, number> = {};
  for (const counter of DAILY_COUNTERS) {
    const value = total(counter);
    if (value > 0) counts[counter] = value;
  }
  return { counts, beacons: total(BEACON_TALLY) };
}

const forwardedInMemory = new Set<string>();

function forwardKeyFor(day: string): string {
  return `mythos:count-forwarded:${day}`;
}

/**
 * Claims the single forward of a day's totals to analytics. False when the
 * day is already claimed, null when the store cannot say. A cron delivery
 * that arrives twice must not send the day twice. The claim is short-lived
 * until confirmDayForward keeps it, so a run that dies mid-send does not
 * block the day for good.
 */
export async function claimDayForward(day: string): Promise<boolean | null> {
  try {
    const redis = connect();
    if (!redis) {
      if (isProductionRuntime()) return null;
      if (forwardedInMemory.has(day)) return false;
      forwardedInMemory.add(day);
      return true;
    }
    const set = await redis.set(forwardKeyFor(day), "1", {
      nx: true,
      ex: FORWARD_CLAIM_SECONDS,
    });
    return set === "OK";
  } catch {
    return null;
  }
}

/** Keeps a claim for as long as the day's totals exist, after a send that worked. */
export async function confirmDayForward(day: string): Promise<void> {
  try {
    const redis = connect();
    if (redis) {
      await redis.set(forwardKeyFor(day), "1", { ex: RETENTION_SECONDS });
    }
  } catch {
    // The short claim lapses; a later call for this day could send it again.
  }
}

/** Gives a claim back after a forward that failed, so the next run retries. */
export async function releaseDayForward(day: string): Promise<void> {
  try {
    const redis = connect();
    if (redis) await redis.del(forwardKeyFor(day));
    else forwardedInMemory.delete(day);
  } catch {
    // The claim expires with the day's totals; the day stays unforwarded.
  }
}
