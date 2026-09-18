import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/http/read-json-body";

const MAX_REQUEST_BODY_BYTES = 8 * 1024;

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
    const _metric = body.value;

    // In production, you could forward to:
    // - Google Analytics
    // - Vercel Analytics
    // - A custom analytics service
    // - A database for custom dashboards

    // For now, just acknowledge receipt
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
