import { NextResponse } from "next/server";

/**
 * Lightweight event sink for retention pulses (quiz disappointed survey, etc.).
 * Acknowledges receipt; wire to a store when product analytics is ready.
 */
export async function POST(request: Request) {
  try {
    const event = await request.json();
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
