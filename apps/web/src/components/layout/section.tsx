import type * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, type ContainerSize } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type SectionSpacing = "none" | "sm" | "md" | "lg";
type SectionTone = "default" | "muted" | "dark";

const SPACING_CLASS: Record<SectionSpacing, string> = {
  none: "",
  sm: "section-space-sm",
  md: "section-space",
  lg: "section-space-lg",
};

const TONE_CLASS: Record<SectionTone, string> = {
  default: "",
  // A quiet band to separate neighbouring sections without a border box.
  muted: "bg-muted/45 border-y border-border/60",
  // Midnight band; text inside should use parchment tokens.
  dark: "dark bg-midnight text-foreground",
};

interface SectionProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "title"
> {
  /** Vertical rhythm: sm 48px, md 72px, lg 96px on desktop. */
  spacing?: SectionSpacing;
  /** Container width for the section's content. */
  size?: ContainerSize;
  tone?: SectionTone;
  containerClassName?: string;
}

/**
 * A page section on the shared grid: consistent vertical spacing plus a
 * Container. Pair with SectionHeading for the title row.
 */
export function Section({
  spacing = "md",
  size = "content",
  tone = "default",
  className,
  containerClassName,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      className={cn(SPACING_CLASS[spacing], TONE_CLASS[tone], className)}
      {...rest}
    >
      <Container size={size} className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}

interface SectionAction {
  href: string;
  label: string;
}

interface SectionHeadingProps {
  /** Short kicker above the title (tradition, category). */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  /** One line under the title. */
  description?: React.ReactNode;
  /** Right-aligned link ("All guides") or any custom node. */
  action?: SectionAction | React.ReactNode;
  /** Heading level; the visual size stays the section size. */
  as?: "h2" | "h3";
  /** id for the heading, for aria-labelledby on the section. */
  id?: string;
  align?: "left" | "center";
  className?: string;
}

function isAction(value: unknown): value is SectionAction {
  return (
    typeof value === "object" &&
    value !== null &&
    "href" in value &&
    "label" in value
  );
}

/**
 * The one section-heading treatment: optional eyebrow, a Cinzel title, an
 * optional one-line description and an optional action on the right. No
 * decorative bars or icons; use them only where they carry meaning.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  as: Heading = "h2",
  id,
  align = "left",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 md:mb-10",
        centered
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("min-w-0", centered ? "max-w-2xl" : "max-w-3xl")}>
        {eyebrow ? <p className="type-eyebrow mb-2">{eyebrow}</p> : null}
        <Heading id={id} className="page-section-title text-foreground">
          {title}
        </Heading>
        {description ? (
          <p className="type-lede mt-2 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className="shrink-0">
          {isAction(action) ? (
            <Link
              href={action.href}
              className="group inline-flex min-h-11 items-center gap-1.5 type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {action.label}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ) : (
            action
          )}
        </div>
      ) : null}
    </div>
  );
}
