import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Revalidation webhook for Hygraph
 *
 * Set this as a webhook in Hygraph to automatically revalidate
 * content when it's published or updated.
 *
 * Usage:
 *   POST /api/revalidate
 *   Headers: x-hygraph-signature: YOUR_SECRET
 *   Body: { "operation": "publish", "data": { "__typename": "Story", "slug": "..." } }
 */
export async function POST(request: NextRequest) {
  // Verify the webhook secret
  const signature = request.headers.get("x-hygraph-signature");
  const webhookSecret = process.env.HYGRAPH_WEBHOOK_SECRET;

  if (webhookSecret && signature !== webhookSecret) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { operation, data } = body;

    // Extract content type and slug
    const typename = data?.__typename;
    const slug = data?.slug;

    // Map Hygraph types to cache tags
    const typeToTag: Record<string, string> = {
      Story: "hygraph-stories",
      Deity: "hygraph-deities",
      Pantheon: "hygraph-pantheons",
      Creature: "hygraph-creatures",
      Artifact: "hygraph-artifacts",
      Location: "hygraph-locations",
    };

    // Map types to paths for path-based revalidation
    const typeToPath: Record<string, string> = {
      Story: "/stories",
      Deity: "/deities",
      Pantheon: "/pantheons",
      Creature: "/creatures",
      Artifact: "/artifacts",
      Location: "/locations",
    };

    const revalidatedTags: string[] = [];
    const revalidatedPaths: string[] = [];

    // Revalidate by tag
    if (typename && typeToTag[typename]) {
      revalidateTag(typeToTag[typename], "max");
      revalidatedTags.push(typeToTag[typename]);
    }

    // Also revalidate search cache
    revalidateTag("search", "max");

    // Revalidate specific paths
    if (typename && typeToPath[typename]) {
      // Revalidate the list page
      revalidatePath(typeToPath[typename]);
      revalidatedPaths.push(typeToPath[typename]);

      // Revalidate the specific item page if we have a slug
      if (slug) {
        const itemPath = `${typeToPath[typename]}/${slug}`;
        revalidatePath(itemPath);
        revalidatedPaths.push(itemPath);
      }
    }

    // Revalidate homepage (might show featured content)
    revalidatePath("/");
    revalidatedPaths.push("/");

    console.log("Hygraph webhook revalidation:", {
      operation,
      typename,
      slug,
      revalidatedTags,
      revalidatedPaths,
    });

    return NextResponse.json({
      revalidated: true,
      operation,
      typename,
      slug,
      tags: revalidatedTags,
      paths: revalidatedPaths,
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 },
    );
  }
}

// Also support GET for manual revalidation
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const secret = searchParams.get("secret");
  const tag = searchParams.get("tag");
  const path = searchParams.get("path");

  // Verify secret for manual revalidation
  const revalidateSecret = process.env.REVALIDATE_SECRET;

  if (revalidateSecret && secret !== revalidateSecret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const revalidated: { tags: string[]; paths: string[] } = {
    tags: [],
    paths: [],
  };

  if (tag) {
    revalidateTag(tag, "max");
    revalidated.tags.push(tag);
  }

  if (path) {
    revalidatePath(path);
    revalidated.paths.push(path);
  }

  // If no specific tag or path, revalidate all Hygraph content
  if (!tag && !path) {
    const allTags = [
      "hygraph-stories",
      "hygraph-deities",
      "hygraph-pantheons",
      "hygraph-creatures",
      "hygraph-artifacts",
      "hygraph-locations",
    ];

    for (const t of allTags) {
      revalidateTag(t, "max");
      revalidated.tags.push(t);
    }
  }

  return NextResponse.json({
    revalidated: true,
    ...revalidated,
  });
}
