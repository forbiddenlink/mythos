import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  pageEyebrowClass,
  pageLedeClass,
  pageTitleClass,
} from "@/components/layout/page-typography";
import { HeroMark } from "@/components/icons/hero-mark";
import type { MythosMarkId } from "@/components/icons/mythos-marks";

const _heroVariants = cva("", {
  variants: {
    colorScheme: {
      gold: "",
      red: "",
      /** @deprecated prefer "bronze" — kept for existing callers */
      purple: "",
      bronze: "",
    },
  },
  defaultVariants: {
    colorScheme: "gold",
  },
});

const colorSchemes = {
  gold: {
    taglineColor: "text-gold/80",
    titleColor: "text-parchment",
    descriptionColor: "text-parchment/70",
    dividerColor: "bg-gold/50",
    dividerGradient: "to-gold/40",
    glowColor: "oklch(0.72_0.14_70_/_0.1)",
    overlay: "bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80",
    markTone: "gold" as const,
  },
  red: {
    taglineColor: "text-destructive/80",
    titleColor: "text-parchment",
    descriptionColor: "text-parchment/70",
    dividerColor: "bg-destructive/50",
    dividerGradient: "to-destructive/40",
    glowColor: "oklch(0.55_0.22_25_/_0.15)",
    overlay: "bg-gradient-to-b from-midnight/80 via-midnight/70 to-midnight/90",
    markTone: "destructive" as const,
  },
  bronze: {
    taglineColor: "text-bronze",
    titleColor: "text-parchment",
    descriptionColor: "text-parchment/70",
    dividerColor: "bg-bronze/50",
    dividerGradient: "to-bronze/40",
    glowColor: "oklch(0.55_0.1_55_/_0.12)",
    overlay: "bg-gradient-to-b from-midnight/75 via-midnight/65 to-midnight/85",
    markTone: "bronze" as const,
  },
};

/** Map legacy "purple" callers onto bronze scheme */
const resolveScheme = (
  scheme: "gold" | "red" | "purple" | "bronze" | null | undefined,
) => {
  if (scheme === "purple") return colorSchemes.bronze;
  return colorSchemes[scheme || "gold"];
};

const HERO_IMAGE_WIDTH = 1920;
const HERO_IMAGE_HEIGHT = 1080;

interface PageHeroProps extends VariantProps<typeof _heroVariants> {
  /** Preferred: Mythos classical mark id */
  mark?: MythosMarkId;
  /** @deprecated Prefer `mark` — still accepted for gradual migration */
  icon?: React.ReactNode;
  tagline: string;
  title: string;
  description: string;
  backgroundImage?: string;
  backgroundAlt?: string;
  className?: string;
  viewTransitionName?: string;
  minHeight?: string;
  /** Optional content below the lede (stats, CTAs) */
  children?: React.ReactNode;
}

/**
 * PageHero — canonical dark hero for listing / hub pages.
 * Typography comes from page-typography tokens so every route matches.
 */
export function PageHero({
  mark = "temple",
  icon,
  tagline,
  title,
  description,
  backgroundImage,
  backgroundAlt = "",
  className,
  viewTransitionName,
  colorScheme = "gold",
  minHeight = "min-h-[50vh]",
  children,
}: PageHeroProps) {
  const colors = resolveScheme(colorScheme);

  return (
    <section
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-midnight",
        minHeight,
        className,
      )}
      style={viewTransitionName ? { viewTransitionName } : undefined}
    >
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt={backgroundAlt}
            width={HERO_IMAGE_WIDTH}
            height={HERO_IMAGE_HEIGHT}
            sizes="100vw"
            className="h-full w-full object-cover"
            priority
          />
        </div>
      )}

      <div className={cn("absolute inset-0 z-10", colors.overlay)} />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] z-10"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.glowColor} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-20 text-center px-4 max-w-3xl mx-auto py-16">
        <div className="flex items-center justify-center mb-6">
          {icon ? (
            <HeroMark mark={mark} tone={colors.markTone} size="lg">
              {icon}
            </HeroMark>
          ) : (
            <HeroMark mark={mark} tone={colors.markTone} size="lg" />
          )}
        </div>

        <span className={cn(pageEyebrowClass, colors.taglineColor)}>
          {tagline}
        </span>

        <h1 className={cn(pageTitleClass, "mb-6", colors.titleColor)}>
          {title}
        </h1>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div
            className={cn(
              "w-12 h-px bg-gradient-to-r from-transparent",
              colors.dividerGradient,
            )}
          />
          <div className={cn("w-1.5 h-1.5 rotate-45", colors.dividerColor)} />
          <div
            className={cn(
              "w-12 h-px bg-gradient-to-l from-transparent",
              colors.dividerGradient,
            )}
          />
        </div>

        <p className={cn(pageLedeClass, colors.descriptionColor)}>
          {description}
        </p>

        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}
