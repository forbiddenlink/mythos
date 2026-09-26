import type * as React from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /** Short kicker above the title. */
  eyebrow?: React.ReactNode;
  /** Optional classical mark shown beside the eyebrow. */
  mark?: MythosMarkId;
  title: React.ReactNode;
  /** One sentence. Longer explanations belong in <AboutThisPage> below the content. */
  lede?: React.ReactNode;
  /** Collection size, e.g. "359 deities". Rendered as quiet metadata. */
  count?: React.ReactNode;
  /** Buttons or links aligned with the title on wide screens. */
  actions?: React.ReactNode;
  /** Extra content under the lede (filters summary, chips). Keep it short. */
  children?: React.ReactNode;
  /** Atmospheric background image; the header turns midnight when set. */
  image?: string;
  imageAlt?: string;
  /** Show the breadcrumb trail (default true). */
  breadcrumbs?: boolean;
  /** Tint for the eyebrow on image headers. */
  accent?: "gold" | "red" | "bronze";
  className?: string;
  /** Style hook for view transitions between index and detail pages. */
  viewTransitionName?: string;
}

const ACCENT_ON_DARK = {
  gold: "text-gold-light",
  red: "text-[oklch(0.78_0.12_30)]",
  bronze: "text-[oklch(0.8_0.09_60)]",
} as const;

/**
 * Compact index-page header: breadcrumb, eyebrow, H1, a one-sentence lede and
 * an optional count or actions. With `image` it becomes a short midnight band
 * with the image as atmosphere (not a full-screen hero); without, it sits on
 * the page surface. The page's tool or grid should follow immediately.
 */
export function PageHeader({
  eyebrow,
  mark,
  title,
  lede,
  count,
  actions,
  children,
  image,
  imageAlt = "",
  breadcrumbs = true,
  accent = "gold",
  className,
  viewTransitionName,
}: PageHeaderProps) {
  const onDark = Boolean(image);

  return (
    <div
      data-page-header=""
      className={cn(
        "relative isolate overflow-hidden",
        onDark
          ? "dark bg-midnight text-foreground"
          : "border-b border-border/60 bg-muted/35",
        className,
      )}
      style={viewTransitionName ? { viewTransitionName } : undefined}
    >
      {image ? (
        <div className="absolute inset-0 -z-10" aria-hidden={!imageAlt}>
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-r from-midnight via-midnight/85 to-midnight/35" />
          <div className="absolute inset-0 bg-linear-to-t from-midnight/90 via-transparent to-midnight/40" />
        </div>
      ) : (
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_85%_0%,color-mix(in_oklch,var(--gold)_12%,transparent),transparent_70%)]"
          aria-hidden="true"
        />
      )}

      <Container className="pt-5 pb-9 md:pt-6 md:pb-12">
        {breadcrumbs ? (
          <Breadcrumbs
            tone={onDark ? "onDark" : "default"}
            className="mb-6 md:mb-10"
          />
        ) : null}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="min-w-0 max-w-3xl">
            {eyebrow ? (
              <p
                className={cn(
                  "type-eyebrow mb-3 flex items-center gap-2",
                  onDark && ACCENT_ON_DARK[accent],
                )}
              >
                {mark ? <MythosMark id={mark} className="size-4" /> : null}
                {eyebrow}
              </p>
            ) : null}
            <h1 className="page-title text-foreground">{title}</h1>
            {lede ? (
              <p
                className={cn(
                  "type-lede mt-3 max-w-2xl",
                  onDark ? "text-parchment/85" : "text-muted-foreground",
                )}
              >
                {lede}
              </p>
            ) : null}
            {count ? (
              <p
                className={cn(
                  "type-meta mt-4 font-medium uppercase tracking-[0.14em]",
                  onDark ? "text-parchment/75" : "text-muted-foreground",
                )}
              >
                {count}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {actions}
            </div>
          ) : null}
        </div>

        {children ? <div className="mt-6">{children}</div> : null}
      </Container>
    </div>
  );
}
