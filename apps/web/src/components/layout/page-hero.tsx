import type * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import type { MythosMarkId } from "@/components/icons/mythos-marks";

interface PageHeroProps {
  /** Classical mark shown beside the eyebrow. */
  mark?: MythosMarkId;
  /** @deprecated Ignored; the compact header shows `mark` only. */
  icon?: React.ReactNode;
  tagline: string;
  title: string;
  description: string;
  backgroundImage?: string;
  backgroundAlt?: string;
  className?: string;
  viewTransitionName?: string;
  colorScheme?: "gold" | "red" | "purple" | "bronze";
  /** @deprecated Ignored; index headers are compact by design. */
  minHeight?: string;
  /** Collection size or other one-line metadata. */
  count?: React.ReactNode;
  /** Buttons aligned with the title on wide screens. */
  actions?: React.ReactNode;
  /** Optional content below the lede (stats, CTAs). */
  children?: React.ReactNode;
  /** Breadcrumb trail inside the header (default true). */
  breadcrumbs?: boolean;
}

/**
 * PageHero — kept as the stable API for index and hub pages; it now renders
 * the compact PageHeader (breadcrumb, eyebrow, title, one-sentence lede).
 * Pages should not render <Breadcrumbs /> themselves under it.
 */
export function PageHero({
  mark = "temple",
  tagline,
  title,
  description,
  backgroundImage,
  backgroundAlt = "",
  className,
  viewTransitionName,
  colorScheme = "gold",
  count,
  actions,
  children,
  breadcrumbs = true,
}: PageHeroProps) {
  return (
    <PageHeader
      mark={mark}
      eyebrow={tagline}
      title={title}
      lede={description}
      count={count}
      actions={actions}
      image={backgroundImage}
      imageAlt={backgroundAlt}
      accent={
        colorScheme === "red"
          ? "red"
          : colorScheme === "gold"
            ? "gold"
            : "bronze"
      }
      className={className}
      viewTransitionName={viewTransitionName}
      breadcrumbs={breadcrumbs}
    >
      {children}
    </PageHeader>
  );
}
