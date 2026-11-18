/**
 * The daily read-out of the anonymous counts.
 *
 * Once a day a cron reads the finished UTC day and sends each total to
 * PostHog as one `daily_total` event, so the numbers can be charted beside the
 * consented analytics. The answer also carries the totals, so the same call
 * with `?day=YYYY-MM-DD` reads any kept day.
 */
import {
  captureServerBatch,
  type ServerBatchEvent,
} from "@/lib/analytics/posthog-server";
import { noStoreJson as json } from "@/lib/http/no-store-json";
import { bearerMatches } from "@/lib/server/cron-auth";
import {
  claimDayForward,
  readDailyCounts,
  releaseDayForward,
} from "@/lib/server/daily-count-store";
import { utcDayKey } from "@/lib/server/runtime";

/**
 * Server-made only. It is deliberately not in ANALYTICS_EVENTS: that list is
 * what a browser may send, and a browser must not be able to post a total.
 */
const DAILY_TOTAL_EVENT = "daily_total";
/** One fixed sender for every total. It is not a visitor. */
const DAILY_TOTAL_DISTINCT_ID = "daily-count";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function eventsFor(
  day: string,
  counts: Readonly<Record<string, number>>,
): ServerBatchEvent[] {
  // Noon keeps the event inside its own day in every reporting time zone
  // PostHog is likely to be read in.
  const timestamp = new Date(`${day}T12:00:00.000Z`);
  return Object.entries(counts).map(([counter, total]) => {
    const [step, page, source] = counter.split(":");
    return {
      event: DAILY_TOTAL_EVENT,
      distinctId: DAILY_TOTAL_DISTINCT_ID,
      timestamp,
      properties: {
        day,
        counter,
        total,
        // Page counters are `step:page:source`; the newsletter steps have no
        // page or source.
        ...(page && source ? { step, page, source } : {}),
      },
    };
  });
}

type ForwardOutcome =
  "sent" | "already_sent" | "nothing_to_send" | "day_not_finished" | "failed";

async function forward(
  day: string,
  counts: Readonly<Record<string, number>>,
  now: Date,
): Promise<ForwardOutcome> {
  // A day still being counted would be sent short, and only once.
  if (day >= utcDayKey(now)) return "day_not_finished";
  const events = eventsFor(day, counts);
  if (events.length === 0) return "nothing_to_send";

  const claimed = await claimDayForward(day);
  if (claimed === null) return "failed";
  if (!claimed) return "already_sent";

  const result = await captureServerBatch(events);
  if (result.ok) return "sent";
  await releaseDayForward(day);
  return "failed";
}

/**
 * 401 for a wrong bearer when CRON_SECRET is set (checked first), 501 while it
 * is unset, 400 for a malformed day, 503 when the store cannot be read, 502
 * when the totals were read but could not be sent on (the next call retries).
 */
export async function handleDailyCountsRequest(
  req: Request,
  env: Readonly<Record<string, string | undefined>>,
  now: Date = new Date(),
): Promise<Response> {
  const secret = env.CRON_SECRET?.trim();
  if (secret && !bearerMatches(req.headers.get("authorization"), secret)) {
    return json({ ok: false, reason: "unauthorized" }, 401);
  }
  if (!secret) return json({ ok: false, reason: "not_configured" }, 501);

  const day =
    new URL(req.url).searchParams.get("day") ??
    utcDayKey(new Date(now.getTime() - DAY_MS));
  if (!DAY_PATTERN.test(day)) {
    return json({ ok: false, reason: "invalid_day" }, 400);
  }

  const totals = await readDailyCounts(day);
  if (!totals) return json({ ok: false, reason: "unavailable" }, 503);

  const forwarded = await forward(day, totals.counts, now);
  return json(
    { ok: forwarded !== "failed", day, ...totals, forwarded },
    forwarded === "failed" ? 502 : 200,
  );
}
