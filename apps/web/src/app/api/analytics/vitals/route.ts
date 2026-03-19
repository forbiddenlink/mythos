import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const _metric = await request.json();

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
