"use client";

import { Heart } from "lucide-react";
import { m } from "framer-motion";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { BookmarkType } from "@/providers/bookmarks-provider";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

/** How long the "Saved" note stays under the button. */
const NOTE_MS = 2500;

interface BookmarkButtonProps {
  type: BookmarkType;
  id: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Use light variant for dark backgrounds (e.g. hero sections) */
  variant?: "default" | "light";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const buttonSizeMap = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-2.5",
};

export function BookmarkButton({
  type,
  id,
  className,
  size = "md",
  variant = "default",
}: BookmarkButtonProps) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(type, id);
  // A filled heart alone did not tell people where the entry went.
  const [note, setNote] = useState<string | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (noteTimer.current) clearTimeout(noteTimer.current);
    },
    [],
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(type, id);
    setNote(bookmarked ? "Removed from Bookmarks" : "Saved to Bookmarks");
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), NOTE_MS);
  };

  return (
    <m.button
      onClick={handleClick}
      whileTap={{ scale: 0.85 }}
      className={cn(
        "relative rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        buttonSizeMap[size],
        variant === "default" ? "hover:bg-gold/10" : "hover:bg-white/10",
        className,
      )}
      aria-label={
        bookmarked
          ? `Remove ${type} from bookmarks`
          : `Add ${type} to bookmarks`
      }
      aria-pressed={bookmarked}
    >
      <m.div
        initial={false}
        animate={bookmarked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Heart
          className={cn(
            sizeMap[size],
            "transition-colors duration-200",
            bookmarked
              ? "fill-gold text-gold"
              : variant === "default"
                ? "text-muted-foreground hover:text-gold"
                : "text-parchment/60 hover:text-gold",
          )}
          strokeWidth={bookmarked ? 2 : 1.5}
        />
      </m.div>

      {note && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded border border-gold/40 bg-background px-2 py-1 font-sans text-xs text-foreground shadow-md"
        >
          {note}
        </span>
      )}

      {/* Subtle glow behind when bookmarked */}
      {bookmarked && (
        <m.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="absolute inset-0 rounded-full bg-gold/10 -z-10"
        />
      )}
    </m.button>
  );
}
