import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ChangelogType } from "@/components/changelog/ChangelogEntry";

interface ChangelogFiltersProps {
  activeFilter?: ChangelogType;
  counts: Record<"all" | ChangelogType, number>;
}

const filters = [
  { type: undefined, key: "all", label: "All" },
  { type: "feature" as const, key: "feature", label: "Features" },
  { type: "fix" as const, key: "fix", label: "Fixes" },
  { type: "content" as const, key: "content", label: "Content" },
] as const;

export function ChangelogFilters({
  activeFilter,
  counts,
}: ChangelogFiltersProps) {
  return (
    <nav
      aria-label="Filter changelog entries"
      className="inline-flex flex-wrap rounded-md border border-border bg-muted/50 p-0.5"
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.type;
        const href = filter.type
          ? `/changelog?type=${filter.type}`
          : "/changelog";

        return (
          <Link
            key={filter.label}
            href={href}
            className={cn(
              "inline-flex min-h-10 items-center gap-2 rounded-[5px] px-3.5 type-ui font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
              isActive
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {filter.label}
            <span className="type-meta tabular-nums text-muted-foreground">
              {counts[filter.key]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
