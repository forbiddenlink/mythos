import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/http/read-json-body";

const MAX_REQUEST_BODY_BYTES = 16 * 1024;

/**
 * Lightweight event sink for retention pulses (quiz disappointed survey, etc.).
 * Acknowledges receipt; wire to a store when product analytics is ready.
 */
export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request, MAX_REQUEST_BODY_BYTES);
    if (!body.ok) {
      return NextResponse.json(
        {
          error:
            body.reason === "too_large"
              ? "Request body too large"
              : "Invalid request",
        },
        { status: body.reason === "too_large" ? 413 : 400 },
      );
    }
    const event = body.value;
    if (
      !event ||
      typeof event !== "object" ||
      typeof (event as { type?: unknown }).type !== "string"
    ) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[analytics/events]", event);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
