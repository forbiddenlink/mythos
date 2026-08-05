import * as React from "react";
import { cn } from "@/lib/utils";

interface RouteHeroProps {
  /** Outer wrapper height, e.g. "h-[40vh] min-h-75" */
  heightClassName?: string;
  /** Background gradient overlay classes */
  overlayClassName?: string;
  /** Widen content for complex heroes (default max-w-3xl to match PageHero) */
  contentClassName?: string;
  /**
   * `cinematic` — always midnight (legacy atlas chrome).
   * `surface` — theme-aware wash so light/dark body pages stay coherent.
   */
  tone?: "cinematic" | "surface";
  children: React.ReactNode;
}

/**
 * RouteHero — background chrome for pages whose content doesn't fit
 * PageHero's fixed icon/tagline/title/description shape.
 *
 * Prefer `tone="surface"` for encyclopedia detail routes that continue into
 * theme-aware body content. Keep `cinematic` for intentionally dark set pieces.
 */
export function RouteHero({
  heightClassName = "min-h-[40vh]",
  overlayClassName,
  contentClassName,
  tone = "cinematic",
  children,
}: RouteHeroProps) {
  const isSurface = tone === "surface";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        isSurface ? "bg-muted/40" : "bg-midnight",
        heightClassName,
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          overlayClassName ??
            (isSurface
              ? "bg-linear-to-b from-muted/70 via-background/40 to-background z-10"
              : "bg-linear-to-b from-midnight/70 via-midnight/60 to-midnight/80 z-10"),
        )}
      />
      <div
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial via-transparent to-transparent z-10",
          isSurface ? "from-gold/8" : "from-gold/10",
        )}
      />
      <div
        className={cn(
          "relative z-20 text-center px-4 max-w-3xl mx-auto py-16",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
