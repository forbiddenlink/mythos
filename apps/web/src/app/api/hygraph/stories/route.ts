import { NextRequest, NextResponse } from "next/server";
import { fetchStories } from "@/lib/content/stories";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const pantheonSlug = searchParams.get("pantheonSlug") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  try {
    const result = await fetchStories({
      pantheonSlug,
      category,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 },
    );
  }
}
