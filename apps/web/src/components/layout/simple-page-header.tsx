import * as React from "react";
import { cn } from "@/lib/utils";
import {
  pageEyebrowClass,
  pageLedeOnLightClass,
  pageTitleClass,
} from "@/components/layout/page-typography";
import { HeroMark } from "@/components/icons/hero-mark";
import type { MythosMarkId } from "@/components/icons/mythos-marks";

interface SimplePageHeaderProps {
  /** Preferred: Mythos classical mark id */
  mark?: MythosMarkId;
  /** @deprecated Prefer `mark` — still accepted for gradual migration */
  icon?: React.ReactNode;
  /** Optional uppercase eyebrow above the title */
  tagline?: string;
  title: string;
  description?: string;
  /** Extra content under the lede (stats chips, CTAs, etc.) */
  children?: React.ReactNode;
  className?: string;
  /** Centered (hub pages) or left (editorial/prose pages) */
  align?: "center" | "left";
}

/**
 * Light-background page intro for hubs that don't need a full dark PageHero
 * (quiz, collections, contact, etc.). Same typography as PageHero.
 */
export function SimplePageHeader({
  mark = "scroll",
  icon,
  tagline,
  title,
  description,
  children,
  className,
  align = "center",
}: SimplePageHeaderProps) {
  const isLeft = align === "left";

  return (
    <header
      className={cn(
        "mb-10 md:mb-12 mt-6",
        isLeft ? "text-left max-w-3xl" : "text-center",
        className,
      )}
    >
      <div
        className={cn("flex mb-6", isLeft ? "justify-start" : "justify-center")}
      >
        {icon ? (
          <HeroMark mark={mark} tone="light" size="lg">
            {icon}
          </HeroMark>
        ) : (
          <HeroMark mark={mark} tone="light" size="lg" />
        )}
      </div>

      {tagline ? <span className={pageEyebrowClass}>{tagline}</span> : null}

      <h1 className={cn(pageTitleClass, "text-foreground mb-4")}>{title}</h1>

      <div
        className={cn(
          "flex items-center gap-4 mb-6",
          isLeft ? "justify-start" : "justify-center",
        )}
      >
        <div className="w-12 h-px bg-linear-to-r from-transparent to-gold/40" />
        <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
        <div className="w-12 h-px bg-linear-to-l from-transparent to-gold/40" />
      </div>

      {description ? (
        <p
          className={cn(
            pageLedeOnLightClass,
            "mb-8",
            isLeft && "mx-0 max-w-2xl",
          )}
        >
          {description}
        </p>
      ) : null}

      {children}
    </header>
  );
}
