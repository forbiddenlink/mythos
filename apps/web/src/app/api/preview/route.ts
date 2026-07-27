import { NextRequest, NextResponse } from "next/server";
import { draftMode, cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { safeSameOriginRedirect } from "@/lib/safe-redirect";

function secretsEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/**
 * Preview mode API route
 *
 * Enable preview mode to see draft content from Hygraph.
 *
 * Usage:
 *   GET /api/preview?secret=YOUR_SECRET&slug=/stories/some-story
 *
 * The secret should match HYGRAPH_PREVIEW_SECRET env var.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "/";
  const type = searchParams.get("type") ?? "story"; // story, deity, location, etc.

  const previewSecret = process.env.HYGRAPH_PREVIEW_SECRET;

  if (!previewSecret) {
    return NextResponse.json(
      { error: "Preview mode not configured" },
      { status: 500 },
    );
  }

  if (!secret || !secretsEqual(secret, previewSecret)) {
    return NextResponse.json(
      { error: "Invalid preview token" },
      { status: 401 },
    );
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Store the content type for the preview
  const cookieStore = await cookies();
  cookieStore.set("preview_type", type, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  const redirectUrl = safeSameOriginRedirect(slug, request.url);
  return NextResponse.redirect(redirectUrl);
}
