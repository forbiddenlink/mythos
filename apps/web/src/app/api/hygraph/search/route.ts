import { NextResponse } from "next/server";

/**
 * Hygraph CMS routes are disabled — Mythos Atlas serves static JSON from
 * apps/web/src/data. Kept as stubs so old bookmarks/clients get a clear 410.
 */
function gone() {
  return NextResponse.json(
    {
      error:
        "Hygraph API routes are disabled. Content is served from static JSON.",
    },
    { status: 410 },
  );
}

export async function GET() {
  return gone();
}

export async function POST() {
  return gone();
}
