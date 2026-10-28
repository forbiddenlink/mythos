"use client";

import { Heart } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { BookmarkType } from "@/providers/bookmarks-provider";
import { cn } from "@/lib/utils";

/** Text toggle for saving the current entry to the reader's bookmarks. */
export function EntryCloserSave({
  type,
  id,
  name,
}: Readonly<{ type: BookmarkType; id: string; name: string }>) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const saved = isBookmarked(type, id);
  return (
    <button
      type="button"
      onClick={() => toggleBookmark(type, id)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved` : `Save this: ${name}`}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold",
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn("size-4", saved && "fill-current")}
      />
      {saved ? "Saved" : "Save this"}
    </button>
  );
}
