import { noStoreJson as json } from "@/lib/http/no-store-json";
import { readJsonBody } from "@/lib/http/read-json-body";
import { forbiddenUnlessSameOrigin } from "@/lib/oracle/request-guards";
import {
  counterForBeacon,
  recordDailyCount,
} from "@/lib/server/daily-count-store";

/** The longest valid body is under 70 bytes. */
const MAX_REQUEST_BODY_BYTES = 256;

/**
 * Anonymous daily count. The body names one counter from a closed list and the
 * route adds one to it. It reads the Origin and Host headers to refuse other
 * sites, and nothing else about the visitor: no network address, no browser
 * details, no cookie. That is also why it has no per-visitor rate limit; the
 * store's daily ceiling bounds a flood instead.
 *
 * Like /api/analytics/events, the answer says what happened: 200 only when the
 * count was stored.
 */
export async function POST(request: Request) {
  const forbidden = forbiddenUnlessSameOrigin(request);
  if (forbidden) return forbidden;

  const body = await readJsonBody(request, MAX_REQUEST_BODY_BYTES);
  const counter = body.ok ? counterForBeacon(body.value) : null;
  if (!counter) return json({ counted: false, reason: "invalid" }, 400);

  const result = await recordDailyCount(counter, { budgeted: true });
  if (result.stored) return json({ counted: true }, 200);
  return json(
    { counted: false, reason: result.reason },
    result.reason === "capped"
      ? 429
      : result.reason === "not_configured"
        ? 501
        : 503,
  );
}
