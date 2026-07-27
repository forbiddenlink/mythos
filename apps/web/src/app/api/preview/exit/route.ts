import { NextRequest, NextResponse } from "next/server";
import { draftMode, cookies } from "next/headers";
import { safeSameOriginRedirect } from "@/lib/safe-redirect";

/**
 * Exit preview mode
 *
 * Usage:
 *   GET /api/preview/exit?redirect=/stories
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirect = searchParams.get("redirect");

  // Disable draft mode
  const draft = await draftMode();
  draft.disable();

  // Clear preview cookies
  const cookieStore = await cookies();
  cookieStore.delete("preview_type");

  const redirectUrl = safeSameOriginRedirect(redirect, request.url);
  return NextResponse.redirect(redirectUrl);
}
