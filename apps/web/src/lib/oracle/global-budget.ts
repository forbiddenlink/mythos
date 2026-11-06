/**
 * Global daily request guard for the paid AI routes (Oracle + story quiz).
 * Caps total successful admissions across all IPs for a UTC day. Each scope
 * has its own counter, so heavy quiz use cannot take the Oracle offline.
 */

import { Redis } from "@upstash/redis";
import { isProductionRuntime, utcDayKey } from "@/lib/server/runtime";

const DEFAULT_DAILY_CAP = 500;

function dailyCap(): number {
  const raw = process.env.ORACLE_DAILY_REQUEST_CAP?.trim();
  if (!raw) return DEFAULT_DAILY_CAP;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_CAP;
}

export type GlobalBudgetScope = "oracle" | "quiz";

// The oracle key keeps its historical name so a deploy does not reset today's count.
function dailyKey(scope: GlobalBudgetScope): string {
  return scope === "oracle"
    ? `mythos:oracle:daily:${utcDayKey()}`
    : `mythos:${scope}:daily:${utcDayKey()}`;
}

export type GlobalOracleBudgetResult =
  // `reservation` is the counter key this admission incremented, absent when
  // no shared counter is configured. Pass the result to the release call.
  | { allowed: true; reservation?: string }
  | { allowed: false; reason: "budget_exhausted" | "misconfigured" };

/**
 * Increment and check the global daily request counter.
 * Dev without Upstash: always allow (per-IP in-memory still applies).
 */
export async function checkGlobalOracleBudget(
  scope: GlobalBudgetScope = "oracle",
): Promise<GlobalOracleBudgetResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    // The daily cap bounds both spend AND free-tier quota/abuse. Enforce the
    // "must be configured" guard for ALL providers in prod: a free Groq Oracle
    // still has finite quota worth protecting, and without the shared counter
    // there is no global ceiling at all (per-IP in-memory is per-instance).
    if (isProductionRuntime()) {
      return { allowed: false, reason: "misconfigured" };
    }
    return { allowed: true };
  }

  const redis = new Redis({ url, token });
  const key = dailyKey(scope);
  const count = await redis.incr(key);
  if (count === 1) {
    // Expire shortly after the UTC day ends (+1h slack)
    await redis.expire(key, 60 * 60 * 25);
  }

  if (count > dailyCap()) {
    return { allowed: false, reason: "budget_exhausted" };
  }
  return { allowed: true, reservation: key };
}

/**
 * Give back a slot taken by checkGlobalOracleBudget when the request is then
 * refused by a later gate (the token cap), so a denied request does not eat
 * the day's request cap. It decrements the exact key the admission
 * incremented, so a refund that lands after UTC midnight still returns the
 * slot to the day it was taken from. Best effort: a failed refund
 * over-counts, which keeps the cap conservative.
 */
export async function releaseGlobalOracleBudget(
  admission: Extract<GlobalOracleBudgetResult, { allowed: true }>,
): Promise<void> {
  const key = admission.reservation;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!key || !url || !token) return;
  try {
    await new Redis({ url, token }).decr(key);
  } catch {
    // Over-counting is the safe failure.
  }
}
