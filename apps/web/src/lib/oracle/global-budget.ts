/**
 * Global daily spend guard for Anthropic routes (Oracle + story quiz).
 * Caps total successful admissions across all IPs for a UTC day.
 */

import { Redis } from "@upstash/redis";
import { isPaidOracleProvider } from "./provider";

const DEFAULT_DAILY_CAP = 500;

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

function dailyCap(): number {
  const raw = process.env.ORACLE_DAILY_REQUEST_CAP?.trim();
  if (!raw) return DEFAULT_DAILY_CAP;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_CAP;
}

function utcDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export type GlobalOracleBudgetResult =
  | { allowed: true }
  | { allowed: false; reason: "budget_exhausted" | "misconfigured" };

/**
 * Increment and check the global daily request counter.
 * Dev without Upstash: always allow (per-IP in-memory still applies).
 */
export async function checkGlobalOracleBudget(): Promise<GlobalOracleBudgetResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    // The daily cap exists to bound spend. Enforce the "must be configured"
    // guard only for a paid provider; a free Groq Oracle can run without the
    // shared counter (per-IP in-memory limits still curb abuse).
    if (isProductionRuntime() && isPaidOracleProvider()) {
      return { allowed: false, reason: "misconfigured" };
    }
    return { allowed: true };
  }

  const redis = new Redis({ url, token });
  const key = `mythos:oracle:daily:${utcDayKey()}`;
  const count = await redis.incr(key);
  if (count === 1) {
    // Expire shortly after the UTC day ends (+1h slack)
    await redis.expire(key, 60 * 60 * 25);
  }

  if (count > dailyCap()) {
    return { allowed: false, reason: "budget_exhausted" };
  }
  return { allowed: true };
}
