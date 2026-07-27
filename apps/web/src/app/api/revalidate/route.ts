import { NextResponse } from "next/server";

/**
 * Hygraph revalidation webhooks are disabled — Mythos Atlas serves static JSON.
 * Returning 410 removes an unauthenticated cache-busting surface.
 */
function gone() {
  return NextResponse.json(
    {
      error:
        "Hygraph revalidation is disabled. Content is served from static JSON.",
    },
    { status: 410 },
  );
}

export async function POST() {
  return gone();
}

export async function GET() {
  return gone();
}
