import * as React from "react";
import { cn } from "@/lib/utils";

interface RouteHeroProps {
  /** Outer wrapper height, e.g. "h-[40vh] min-h-75" */
  heightClassName?: string;
  /** Background gradient overlay classes */
  overlayClassName?: string;
  /** Widen content for complex heroes (default max-w-3xl to match PageHero) */
  contentClassName?: string;
  children: React.ReactNode;
}

/**
 * RouteHero — background chrome only for pages whose content doesn't fit
 * PageHero's fixed icon/tagline/title/description shape.
 *
 * Children should use `pageTitleClass` / `pageEyebrowClass` / `pageLedeOnDarkClass`
 * from `@/components/layout/page-typography` so typography matches PageHero.
 */
export function RouteHero({
  heightClassName = "min-h-[40vh]",
  overlayClassName = "bg-linear-to-b from-midnight/70 via-midnight/60 to-midnight/80 z-10",
  contentClassName,
  children,
}: RouteHeroProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-midnight",
        heightClassName,
      )}
    >
      <div className={cn("absolute inset-0", overlayClassName)} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />
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
