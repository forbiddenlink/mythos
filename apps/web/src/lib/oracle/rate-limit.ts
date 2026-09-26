/**
 * Shared Upstash / development in-memory rate limiters for Oracle, quiz, and search.
 * Production fails closed when Upstash is not configured.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// Search is typed/debounced traffic, so it gets a looser per-IP ceiling than
// the chat buckets while still bounding the billed-embeddings cost.
const SEARCH_RATE_LIMIT = 60;

// Oracle requests with no determinable client IP get their own, stricter
// bucket keyed by a header fingerprint (see client-identity.ts) instead of
// sharing one "anonymous" key that a single abuser could exhaust for everyone.
const ORACLE_ANONYMOUS_RATE_LIMIT = 3;

type Bucket = "oracle" | "oracle-anon" | "quiz" | "search";

const BUCKET_LIMITS: Record<Bucket, number> = {
  oracle: RATE_LIMIT,
  "oracle-anon": ORACLE_ANONYMOUS_RATE_LIMIT,
  quiz: RATE_LIMIT,
  search: SEARCH_RATE_LIMIT,
};

const memoryStores: Record<
  Bucket,
  Map<string, { count: number; resetTime: number }>
> = {
  oracle: new Map(),
  "oracle-anon": new Map(),
  quiz: new Map(),
  search: new Map(),
};

const edgeLimiters: Record<Bucket, Ratelimit | null | undefined> = {
  oracle: undefined,
  "oracle-anon": undefined,
  quiz: undefined,
  search: undefined,
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
    limiter: Ratelimit.slidingWindow(BUCKET_LIMITS[bucket], "1 h"),
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
  if (record.count >= BUCKET_LIMITS[bucket]) return false;
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

  // Fail closed in prod for EVERY bucket. quiz/search bill real money; the oracle
  // bucket (even on free Groq) must be globally capped — an in-memory limiter lives
  // in a single serverless instance, so under concurrency the "10/hr per IP" ceiling
  // multiplies per instance and is trivially bypassed, leaving the endpoint open to
  // quota-DoS and use as a free llama-3.3-70b proxy. Requires UPSTASH_* in prod.
  if (isProductionRuntime()) {
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

/**
 * Oracle chat rate limit for requests with no determinable client IP
 * (3/hr per header fingerprint, separate from the per-IP bucket).
 */
export async function checkOracleAnonymousRateLimit(
  identifier: string,
): Promise<OracleRateLimitResult> {
  return checkBucketRateLimit("oracle-anon", identifier);
}

/** Story quiz generation rate limit (separate from Oracle). */
export async function checkQuizRateLimit(
  identifier: string,
): Promise<OracleRateLimitResult> {
  return checkBucketRateLimit("quiz", identifier);
}

/** Search rate limit (60/hr per IP) — guards billed embedding lookups. */
export async function checkSearchRateLimit(
  identifier: string,
): Promise<OracleRateLimitResult> {
  return checkBucketRateLimit("search", identifier);
}
