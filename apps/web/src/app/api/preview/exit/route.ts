import { NextRequest, NextResponse } from "next/server";
import { draftMode, cookies } from "next/headers";

/**
 * Exit preview mode
 *
 * Usage:
 *   GET /api/preview/exit?redirect=/stories
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirect = searchParams.get("redirect") ?? "/";

  // Disable draft mode
  const draft = await draftMode();
  draft.disable();

  // Clear preview cookies
  const cookieStore = await cookies();
  cookieStore.delete("preview_type");

  // Redirect to the specified URL
  const redirectUrl = new URL(redirect, request.url);
  return NextResponse.redirect(redirectUrl);
}
