"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useHydrated } from "@/hooks/use-hydrated";

export function ThemeToggle() {
  const mounted = useHydrated();
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.125rem] w-[1.125rem]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-[1.125rem] w-[1.125rem]" />
      ) : (
        <Moon className="h-[1.125rem] w-[1.125rem]" />
      )}
    </button>
  );
}
