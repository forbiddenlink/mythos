import Link from "next/link";
import { cn } from "@/lib/utils";

const MODES = [
  { href: "/compare", label: "Deities" },
  { href: "/compare/myths", label: "Myths" },
  { href: "/compare/parallels", label: "Parallels" },
  { href: "/compare/pairs", label: "Every pairing" },
] as const;

type CompareMode = (typeof MODES)[number]["href"];

/**
 * The four ways to compare, as a tab-like link row under the page header.
 * Server-rendered; the current mode is passed in, not read from the URL.
 */
export function CompareNav({
  current,
  className,
}: Readonly<{ current: CompareMode; className?: string }>) {
  return (
    <nav
      aria-label="Ways to compare"
      className={cn(
        "flex gap-x-7 overflow-x-auto border-b border-border/70",
        className,
      )}
    >
      {MODES.map((mode) => {
        const active = mode.href === current;
        return (
          <Link
            key={mode.href}
            href={mode.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex min-h-12 shrink-0 items-center border-b-2 type-ui font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
              active
                ? "border-gold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {mode.label}
          </Link>
        );
      })}
    </nav>
  );
}
