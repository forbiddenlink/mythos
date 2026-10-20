/**
 * Aggregate daily budget for newsletter confirmation emails.
 *
 * Per-IP and per-inbox limits are bypassable (rotating IPs, mailbox aliases),
 * so this caps total confirmation sends per UTC day across everyone. It
 * fails closed on a Redis error: each admission sends a real email.
 */
import { Redis } from "@upstash/redis";

export const DEFAULT_NEWSLETTER_DAILY_SEND_CAP = 200;

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

export function newsletterDailySendCap(): number {
  const raw = process.env.NEWSLETTER_DAILY_SEND_CAP?.trim();
  if (!raw) return DEFAULT_NEWSLETTER_DAILY_SEND_CAP;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_NEWSLETTER_DAILY_SEND_CAP;
}

export type NewsletterBudgetResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: "budget_exhausted" | "misconfigured" | "unavailable";
    };

const memoryCounts = new Map<string, number>();

export function __resetNewsletterBudgetForTests(): void {
  memoryCounts.clear();
}

export async function checkNewsletterSendBudget(
  now: Date = new Date(),
): Promise<NewsletterBudgetResult> {
  const day = now.toISOString().slice(0, 10);
  const cap = newsletterDailySendCap();
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (isProductionRuntime()) return { allowed: false, reason: "misconfigured" };
    const count = (memoryCounts.get(day) ?? 0) + 1;
    memoryCounts.set(day, count);
    return count > cap
      ? { allowed: false, reason: "budget_exhausted" }
      : { allowed: true };
  }

  try {
    const redis = new Redis({ url, token });
    const key = `mythos:newsletter:daily:${day}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60 * 60 * 25);
    return count > cap
      ? { allowed: false, reason: "budget_exhausted" }
      : { allowed: true };
  } catch {
    return { allowed: false, reason: "unavailable" };
  }
}
