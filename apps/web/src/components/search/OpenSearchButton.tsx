"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A large search field look-alike that opens the global command palette
 * (the same ⌘K search as the header). Used on the 404 and error pages.
 */
export function OpenSearchButton({
  label = "Search deities, stories and places",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        document.dispatchEvent(new CustomEvent("open-command-palette"))
      }
      className={cn(
        "group flex min-h-13 w-full items-center gap-3 rounded-md border border-border bg-background px-4 text-left type-ui text-muted-foreground shadow-sm transition-colors hover:border-gold/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        className,
      )}
    >
      <Search className="size-5 shrink-0 text-gold-text" aria-hidden="true" />
      <span className="flex-1">{label}</span>
      <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-xs text-muted-foreground sm:inline">
        Ctrl K
      </kbd>
    </button>
  );
}
