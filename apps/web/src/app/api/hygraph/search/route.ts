import { NextRequest, NextResponse } from "next/server";
import { searchContent } from "@/lib/hygraph/content";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);

  if (!query || query.trim().length === 0) {
    return NextResponse.json({
      deities: [],
      creatures: [],
      artifacts: [],
      pantheons: [],
      stories: [],
    });
  }

  try {
    const results = await searchContent(query, limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
