import type { NextRequest } from "next/server";

/**
 * Reject cross-origin POSTs that omit Origin or mismatch Host.
 * Returns a Response to send, or null if the request is allowed.
 */
export function forbiddenUnlessSameOrigin(req: NextRequest): Response | null {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null;
}

/** Explicit kill switch for paid Anthropic routes. */
export function isOracleKillSwitchOn(): boolean {
  const v = process.env.ORACLE_KILL_SWITCH?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
