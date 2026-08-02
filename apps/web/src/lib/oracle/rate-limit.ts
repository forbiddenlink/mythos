/**
 * Shared Upstash / in-memory rate limiters for paid Anthropic routes.
 * Production fails closed when Upstash is not configured.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isPaidOracleProvider } from "./provider";

const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

type Bucket = "oracle" | "quiz";

const memoryStores: Record<
  Bucket,
  Map<string, { count: number; resetTime: number }>
> = {
  oracle: new Map(),
  quiz: new Map(),
};

const edgeLimiters: Record<Bucket, Ratelimit | null | undefined> = {
  oracle: undefined,
  quiz: undefined,
};

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

function getEdgeRatelimit(bucket: Bucket): Ratelimit | null {
  if (edgeLimiters[bucket] !== undefined) return edgeLimiters[bucket]!;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    edgeLimiters[bucket] = null;
    return null;
  }

  const redis = new Redis({ url, token });
  edgeLimiters[bucket] = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT, "1 h"),
    prefix: `mythos:${bucket}`,
    analytics: false,
  });
  return edgeLimiters[bucket]!;
}

function checkInMemoryRateLimit(bucket: Bucket, identifier: string): boolean {
  const store = memoryStores[bucket];
  const now = Date.now();

  if (store.size > 1000) {
    for (const [key, val] of store) {
      if (now > val.resetTime) store.delete(key);
    }
  }

  const record = store.get(identifier);
  if (!record || now > record.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

export type OracleRateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "rate_limited" | "misconfigured" };

async function checkBucketRateLimit(
  bucket: Bucket,
  identifier: string,
): Promise<OracleRateLimitResult> {
  const rl = getEdgeRatelimit(bucket);
  if (rl) {
    const { success } = await rl.limit(identifier);
    return success
      ? { allowed: true }
      : { allowed: false, reason: "rate_limited" };
  }

  // Fail closed in prod only when the bucket bills real money. The quiz bucket
  // always runs on paid Anthropic; the oracle bucket may run free on Groq, in
  // which case an in-memory limiter is acceptable (no spend to protect).
  const requiresSharedLimiter = bucket === "quiz" || isPaidOracleProvider();
  if (isProductionRuntime() && requiresSharedLimiter) {
    return { allowed: false, reason: "misconfigured" };
  }

  return checkInMemoryRateLimit(bucket, identifier)
    ? { allowed: true }
    : { allowed: false, reason: "rate_limited" };
}

/** Oracle chat rate limit (10/hr per IP). */
export async function checkOracleRateLimit(
  identifier: string,
): Promise<OracleRateLimitResult> {
  return checkBucketRateLimit("oracle", identifier);
}

/** Story quiz generation rate limit (separate from Oracle). */
export async function checkQuizRateLimit(
  identifier: string,
): Promise<OracleRateLimitResult> {
  return checkBucketRateLimit("quiz", identifier);
}
