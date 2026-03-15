import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const _heroVariants = cva("", {
  variants: {
    colorScheme: {
      gold: "",
      red: "",
      purple: "",
    },
  },
  defaultVariants: {
    colorScheme: "gold",
  },
});

// Color scheme mappings
const colorSchemes = {
  gold: {
    iconBorder: "border-gold/20",
    iconBg: "bg-midnight/50",
    iconGradient: "from-gold/10",
    iconColor: "text-gold",
    taglineColor: "text-gold/80",
    titleColor: "text-parchment",
    descriptionColor: "text-parchment/70",
    dividerColor: "bg-gold/50",
    dividerGradient: "to-gold/40",
    glowColor: "oklch(0.72_0.14_70_/_0.1)",
  },
  red: {
    iconBorder: "border-red-500/20",
    iconBg: "bg-slate-950/50",
    iconGradient: "from-red-500/10",
    iconColor: "text-red-500",
    taglineColor: "text-red-500/80",
    titleColor: "text-slate-100",
    descriptionColor: "text-slate-400",
    dividerColor: "bg-red-500/50",
    dividerGradient: "to-red-500/40",
    glowColor: "oklch(0.55_0.22_25_/_0.15)",
  },
  purple: {
    iconBorder: "border-purple-500/20",
    iconBg: "bg-slate-950/50",
    iconGradient: "from-purple-500/10",
    iconColor: "text-purple-400",
    taglineColor: "text-purple-400/80",
    titleColor: "text-slate-100",
    descriptionColor: "text-slate-400",
    dividerColor: "bg-purple-400/50",
    dividerGradient: "to-purple-400/40",
    glowColor: "oklch(0.55_0.15_300_/_0.15)",
  },
};

interface PageHeroProps extends VariantProps<typeof _heroVariants> {
  /**
   * Icon component to display above the tagline
   */
  icon: React.ReactNode;
  /**
   * Small uppercase tagline above the title
   */
  tagline: string;
  /**
   * Main heading text
   */
  title: string;
  /**
   * Description paragraph below the title
   */
  description: string;
  /**
   * Optional background image path
   */
  backgroundImage?: string;
  /**
   * Optional className for the section
   */
  className?: string;
  /**
   * Optional view transition name for the hero section
   */
  viewTransitionName?: string;
  /**
   * Minimum height class (default: min-h-[50vh])
   */
  minHeight?: string;
}

/**
 * PageHero - Reusable hero section for listing pages
 *
 * Provides consistent styling across deities, stories, creatures, etc.
 * with proper gradient overlays, typography, and spacing.
 * Supports gold (default), red (creatures), and purple (artifacts) color schemes.
 */
export function PageHero({
  icon,
  tagline,
  title,
  description,
  backgroundImage,
  className,
  viewTransitionName,
  colorScheme = "gold",
  minHeight = "min-h-[50vh]",
}: PageHeroProps) {
  const colors = colorSchemes[colorScheme || "gold"];

  return (
    <section
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        minHeight,
        colorScheme !== "gold" && "bg-slate-950",
        className,
      )}
      style={viewTransitionName ? { viewTransitionName } : undefined}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Gradient Overlay */}
      <div
        className={cn(
          "absolute inset-0 z-10",
          colorScheme === "gold" &&
            "bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80",
          colorScheme === "red" &&
            "bg-[radial-gradient(ellipse_at_center,_oklch(0.4_0.15_25_/_0.2)_0%,_transparent_70%)]",
          colorScheme === "purple" &&
            "bg-[radial-gradient(ellipse_at_top,_oklch(0.4_0.15_300_/_0.3)_0%,_transparent_60%)]",
        )}
      />

      {/* Radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] z-10"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.glowColor} 0%, transparent 70%)`,
        }}
      />

      {/* Hero Content */}
      <div className="relative z-20 text-center px-4 max-w-3xl mx-auto py-16">
        {/* Icon Container */}
        <div className="flex items-center justify-center mb-6">
          <div
            className={cn(
              "relative p-4 rounded-xl border backdrop-blur-sm",
              colors.iconBorder,
              colors.iconBg,
            )}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-xl bg-gradient-to-br to-transparent",
                colors.iconGradient,
              )}
            />
            <div
              className={cn(
                "relative [&_svg]:h-10 [&_svg]:w-10 [&_svg]:stroke-[1.5]",
                colors.iconColor,
              )}
            >
              {icon}
            </div>
          </div>
        </div>

        {/* Tagline */}
        <span
          className={cn(
            "inline-block text-sm tracking-[0.25em] uppercase mb-4 font-medium",
            colors.taglineColor,
          )}
        >
          {tagline}
        </span>

        {/* Title */}
        <h1
          className={cn(
            "font-serif text-display font-semibold tracking-tight mb-6",
            colors.titleColor,
          )}
        >
          {title}
        </h1>

        {/* Decorative Divider */}
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

        {/* Description */}
        <p
          className={cn(
            "text-body-lg max-w-2xl mx-auto font-body leading-relaxed",
            colors.descriptionColor,
          )}
        >
          {description}
        </p>
      </div>
    </section>
  );
}
