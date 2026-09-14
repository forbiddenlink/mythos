import { NextResponse } from "next/server";

/**
 * Hygraph preview is disabled — Mythos Atlas serves static JSON.
 * Returning 410 removes an unauthenticated draft-mode surface.
 */
function gone() {
  return NextResponse.json(
    {
      error: "Hygraph preview is disabled. Content is served from static JSON.",
    },
    { status: 410 },
  );
}

export async function GET() {
  return gone();
}
