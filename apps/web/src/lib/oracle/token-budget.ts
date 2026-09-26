/**
 * Global daily token budget for the Oracle, alongside the request cap in
 * global-budget.ts.
 *
 * Each request reserves an up-front estimate (input + max output) before the
 * model is called; when the stream ends the reservation is settled against
 * the provider-reported usage. Reserving first means concurrent requests
 * cannot all squeeze under the cap at once.
 *
 * Storage mirrors the request cap: Upstash in production (fails closed when it
 * is not configured), a process-local counter in development.
 */

import { Redis } from "@upstash/redis";

export const DEFAULT_DAILY_TOKEN_CAP = 2_000_000;

/**
 * Rough, deliberately pessimistic token estimate (~3 chars per token; English
 * prose is closer to 4). Over-estimating only delays the cap slightly, and the
 * reservation is corrected with real usage once the response finishes.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 3);
}

/** Estimated input + worst-case output tokens for one Oracle request. */
export function estimateOracleRequestTokens(input: {
  system: string;
  messages: ReadonlyArray<{ content: string }>;
  maxOutputTokens: number;
}): number {
  // A few tokens of per-message framing overhead.
  const inputTokens =
    estimateTokens(input.system) +
    input.messages.reduce((n, m) => n + estimateTokens(m.content) + 4, 0);
  return inputTokens + input.maxOutputTokens;
}

export function dailyTokenCap(): number {
  const raw = process.env.ORACLE_DAILY_TOKEN_CAP?.trim();
  if (!raw) return DEFAULT_DAILY_TOKEN_CAP;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_TOKEN_CAP;
}

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

function utcDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function redisKey(day: string): string {
  return `mythos:oracle:tokens:${day}`;
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Development-only fallback; per-process, so never used in production. */
const memoryUsage = new Map<string, number>();

export function __resetOracleTokenBudgetForTests(): void {
  memoryUsage.clear();
}

export interface OracleTokenReservation {
  day: string;
  estimate: number;
}

export type OracleTokenBudgetResult =
  | { allowed: true; reservation: OracleTokenReservation }
  | { allowed: false; reason: "budget_exhausted" | "misconfigured" };

/**
 * Reserve `estimate` tokens against today's budget. Rejects (and releases the
 * reservation) when it would push the day's total past the cap.
 */
export async function reserveOracleTokens(
  estimate: number,
): Promise<OracleTokenBudgetResult> {
  const cap = dailyTokenCap();
  const day = utcDayKey();
  const amount = Math.max(0, Math.ceil(estimate));
  const redis = getRedis();

  if (!redis) {
    // Same semantics as the request cap: no shared counter in production means
    // no global ceiling at all, so refuse rather than run unbounded.
    if (isProductionRuntime()) {
      return { allowed: false, reason: "misconfigured" };
    }
    const used = memoryUsage.get(day) ?? 0;
    if (used + amount > cap) {
      return { allowed: false, reason: "budget_exhausted" };
    }
    memoryUsage.set(day, used + amount);
    return { allowed: true, reservation: { day, estimate: amount } };
  }

  const key = redisKey(day);
  const total = await redis.incrby(key, amount);
  if (total === amount) {
    // First write of the day: expire shortly after the UTC day ends.
    await redis.expire(key, 60 * 60 * 25);
  }
  if (total > cap) {
    await redis.decrby(key, amount);
    return { allowed: false, reason: "budget_exhausted" };
  }
  return { allowed: true, reservation: { day, estimate: amount } };
}

/**
 * Replace a reservation's estimate with the tokens actually used. When usage
 * is unknown (aborted stream, provider omitted it) the estimate stands, which
 * errs on the side of over-counting.
 */
export async function settleOracleTokens(
  reservation: OracleTokenReservation,
  actualTokens: number | undefined,
): Promise<void> {
  if (actualTokens == null || !Number.isFinite(actualTokens)) return;
  const delta = Math.ceil(actualTokens) - reservation.estimate;
  if (delta === 0) return;

  const redis = getRedis();
  if (!redis) {
    if (isProductionRuntime()) return;
    const used = memoryUsage.get(reservation.day) ?? 0;
    memoryUsage.set(reservation.day, Math.max(0, used + delta));
    return;
  }
  await redis.incrby(redisKey(reservation.day), delta);
}

/** Tokens counted so far today (development counter only; for tests/diagnostics). */
export function __memoryTokensUsedToday(): number {
  return memoryUsage.get(utcDayKey()) ?? 0;
}
