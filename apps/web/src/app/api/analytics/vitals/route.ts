import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const metric = await request.json();

    // Log metrics in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Web Vitals API]", metric);
    }

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
