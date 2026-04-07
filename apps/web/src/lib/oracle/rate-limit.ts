/**
 * Oracle rate limiting: Upstash Redis when configured, otherwise in-memory (dev / single instance).
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

let edgeRatelimit: Ratelimit | null | undefined;

function getEdgeRatelimit(): Ratelimit | null {
  if (edgeRatelimit !== undefined) return edgeRatelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    edgeRatelimit = null;
    return null;
  }

  const redis = new Redis({ url, token });
  edgeRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT, "1 h"),
    prefix: "mythos:oracle",
    analytics: false,
  });
  return edgeRatelimit;
}

function checkInMemoryRateLimit(identifier: string): boolean {
  const now = Date.now();

  if (rateLimitStore.size > 1000) {
    for (const [key, val] of rateLimitStore) {
      if (now > val.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Returns true if the request is allowed, false if rate limited.
 */
export async function checkOracleRateLimit(
  identifier: string,
): Promise<boolean> {
  const rl = getEdgeRatelimit();
  if (rl) {
    const { success } = await rl.limit(identifier);
    return success;
  }
  return checkInMemoryRateLimit(identifier);
}
