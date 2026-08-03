import * as React from "react";
import { cn } from "@/lib/utils";

interface RouteHeroProps {
  /** Outer wrapper height, e.g. "h-[40vh] min-h-75" */
  heightClassName?: string;
  /** Background gradient overlay classes, e.g. "bg-linear-to-b from-midnight/70 via-midnight/60 to-mythic z-10" */
  overlayClassName?: string;
  children: React.ReactNode;
}

/**
 * RouteHero - shared background chrome (gradient overlay + radial gold glow)
 * for simple page-level hero sections. Content is passed as children so each
 * page keeps its own icon/tagline/title/description markup untouched.
 *
 * Note: distinct from components/layout/page-hero.tsx's `PageHero`, which
 * owns a fixed icon+tagline+title+description shape for listing pages.
 * This primitive only dedupes the background chrome for pages whose hero
 * content doesn't fit that fixed shape.
 */
export function RouteHero({
  heightClassName = "h-[40vh] min-h-75",
  overlayClassName = "bg-linear-to-b from-midnight/70 via-midnight/60 to-mythic z-10",
  children,
}: RouteHeroProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        heightClassName,
      )}
    >
      <div className={cn("absolute inset-0", overlayClassName)} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
}
