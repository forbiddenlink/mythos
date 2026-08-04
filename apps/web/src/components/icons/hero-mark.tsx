import * as React from "react";
import { cn } from "@/lib/utils";
import {
  mythosMarks,
  type MythosMarkId,
} from "@/components/icons/mythos-marks";

type HeroMarkTone = "gold" | "bronze" | "light" | "destructive";

const toneClasses: Record<
  HeroMarkTone,
  { frame: string; ink: string; wash: string }
> = {
  gold: {
    frame: "border-gold/35",
    ink: "text-gold",
    wash: "from-gold/10 via-transparent to-transparent",
  },
  bronze: {
    frame: "border-bronze/40",
    ink: "text-bronze",
    wash: "from-bronze/12 via-transparent to-transparent",
  },
  light: {
    frame: "border-gold/25",
    ink: "text-gold",
    wash: "from-gold/8 via-transparent to-transparent",
  },
  destructive: {
    frame: "border-destructive/35",
    ink: "text-destructive",
    wash: "from-destructive/12 via-transparent to-transparent",
  },
};

interface HeroMarkProps {
  /** Built-in Mythos mark id, or pass custom children */
  mark?: MythosMarkId;
  children?: React.ReactNode;
  tone?: HeroMarkTone;
  className?: string;
  size?: "md" | "lg";
}

/**
 * Architectural hero emblem — corner brackets + classical mark.
 * Replaces the generic rounded Lucide-in-a-box treatment.
 */
export function HeroMark({
  mark = "temple",
  children,
  tone = "gold",
  className,
  size = "md",
}: HeroMarkProps) {
  const colors = toneClasses[tone];
  const Mark = mythosMarks[mark];
  const box = size === "lg" ? "h-16 w-16" : "h-14 w-14";
  const glyph = size === "lg" ? "h-9 w-9" : "h-8 w-8";

  // Prefer custom children (legacy Lucide) only when provided; otherwise the mark
  const hasCustom = children != null && children !== false;
  const content = hasCustom ? children : <Mark className={glyph} />;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        box,
        className,
      )}
      aria-hidden
    >
      {/* Stone tablet face */}
      <div
        className={cn(
          "absolute inset-0 border bg-midnight/40 backdrop-blur-[2px]",
          colors.frame,
        )}
      />
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-br opacity-90",
          colors.wash,
        )}
      />

      {/* Classical corner brackets */}
      <span
        className={cn(
          "absolute left-0 top-0 h-3 w-3 border-l border-t",
          colors.frame,
        )}
      />
      <span
        className={cn(
          "absolute right-0 top-0 h-3 w-3 border-r border-t",
          colors.frame,
        )}
      />
      <span
        className={cn(
          "absolute bottom-0 left-0 h-3 w-3 border-b border-l",
          colors.frame,
        )}
      />
      <span
        className={cn(
          "absolute bottom-0 right-0 h-3 w-3 border-b border-r",
          colors.frame,
        )}
      />

      {/* Tiny pediment tick */}
      <span
        className={cn(
          "absolute -top-px left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45",
          tone === "bronze"
            ? "bg-bronze/70"
            : tone === "destructive"
              ? "bg-destructive/70"
              : "bg-gold/70",
        )}
      />

      <div
        className={cn(
          "relative z-10 flex items-center justify-center",
          colors.ink,
        )}
      >
        {content}
      </div>
    </div>
  );
}
