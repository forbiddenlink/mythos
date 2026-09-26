import type * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Portrait (4:5) for figures: deities and heroes. Landscape (3:2) for
 * places, stories, artifacts, creatures and traditions.
 */
export type EntityCardAspect = "portrait" | "landscape";

export type EntityCardVariant = "grid" | "list";

export interface EntityCardProps {
  href: string;
  title: string;
  /** Accessible name for the link; defaults to the visible title. */
  linkLabel?: string;
  /** Catalog image. Without one the card shows the title's initial. */
  image?: string | null;
  /** Alt text; empty by default because the title names the image. */
  imageAlt?: string;
  /** CSS object-position for the crop, e.g. "50% 20%" for faces. */
  imagePosition?: string;
  imageUnoptimized?: boolean;
  aspect?: EntityCardAspect;
  variant?: EntityCardVariant;
  /** Short tradition name ("Greek"); rendered as a chip. */
  tradition?: string;
  /** Tradition accent (hex) for the chip's dot. */
  traditionColor?: string;
  /** Small line under the title: domains, "Play as Orpheus", an author. */
  subtitle?: React.ReactNode;
  description?: string | null;
  /** Lines of description to show (2 by default). */
  descriptionLines?: 2 | 3;
  /** Pills over the top-left of the image (use <EntityBadge>). */
  badges?: React.ReactNode;
  /**
   * An interactive control over the top-right of the image, e.g. a
   * BookmarkButton. It sits outside the link, so it never nests inside it.
   */
  action?: React.ReactNode;
  /** Quiet metadata row under the description. */
  meta?: React.ReactNode;
  /** Extra content at the end of the body (progress bars). */
  children?: React.ReactNode;
  headingLevel?: "h2" | "h3";
  /** Load the image eagerly (first row above the fold). */
  priority?: boolean;
  /** next/image sizes; defaults follow the EntityGrid columns. */
  sizes?: string;
  /** Show the media block (default true). Text-only cards omit it. */
  media?: boolean;
  className?: string;
  /** Optional view-transition name for the image (shared-element morph). */
  viewTransitionName?: string;
}

const ASPECT_CLASS: Record<EntityCardAspect, string> = {
  portrait: "aspect-[4/5]",
  landscape: "aspect-[3/2]",
};

const DEFAULT_SIZES: Record<EntityCardAspect, string> = {
  portrait: "(min-width: 1024px) 18rem, (min-width: 640px) 33vw, 50vw",
  landscape: "(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw",
};

const CLAMP_CLASS = { 2: "line-clamp-2", 3: "line-clamp-3" } as const;

/**
 * The one image-led card for catalog entries (deities, heroes, creatures,
 * artifacts, places, stories, traditions, works). A borderless editorial card:
 * the image carries a quiet ring, text sits below it, and the title link
 * stretches over the whole card so the card is one click target while badges
 * and the action stay separate, keyboard-reachable controls.
 *
 * Server-compatible (no hooks), so it renders in server and client components.
 */
export function EntityCard({
  href,
  title,
  linkLabel,
  image,
  imageAlt = "",
  imagePosition,
  imageUnoptimized,
  aspect = "landscape",
  variant = "grid",
  tradition,
  traditionColor,
  subtitle,
  description,
  descriptionLines = 2,
  badges,
  action,
  meta,
  children,
  headingLevel: Heading = "h3",
  priority = false,
  sizes,
  media = true,
  className,
  viewTransitionName,
}: EntityCardProps) {
  const list = variant === "list";

  const mediaBlock = media ? (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md bg-midnight ring-1 ring-border/70",
        list ? (aspect === "portrait" ? "w-20 sm:w-24" : "w-28 sm:w-32") : "",
        ASPECT_CLASS[aspect],
      )}
      style={viewTransitionName ? { viewTransitionName } : undefined}
    >
      {image ? (
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority={priority}
          unoptimized={imageUnoptimized}
          sizes={list ? "8rem" : (sizes ?? DEFAULT_SIZES[aspect])}
          className="object-cover transition-transform duration-700 ease-out group-hover/entity:scale-[1.04]"
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
        />
      ) : (
        <EntityInitial title={title} color={traditionColor} small={list} />
      )}
      {!list && (badges || action) ? (
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-midnight/45 to-transparent"
          aria-hidden="true"
        />
      ) : null}
      {!list && badges ? (
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {badges}
        </div>
      ) : null}
    </div>
  ) : null;

  const body = (
    <div
      className={cn(
        "min-w-0",
        list ? "flex-1" : media ? "mt-3.5" : "",
        action && (list || !media) && "pr-10",
      )}
    >
      {tradition || (list && badges) ? (
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {tradition ? (
            <TraditionChip name={tradition} color={traditionColor} />
          ) : null}
          {list ? badges : null}
        </div>
      ) : null}
      <Heading
        className={cn(
          "font-serif font-semibold leading-snug text-foreground transition-colors group-hover/entity:text-gold-text",
          list ? "text-lg" : "text-[1.1875rem] sm:text-xl",
        )}
      >
        <Link
          href={href}
          aria-label={linkLabel}
          className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-gold"
        >
          {title}
        </Link>
      </Heading>
      {subtitle ? (
        <p className="mt-1 type-meta text-muted-foreground">{subtitle}</p>
      ) : null}
      {description ? (
        <p
          className={cn(
            "mt-2 font-body text-[1.0625rem] leading-snug text-muted-foreground",
            CLAMP_CLASS[descriptionLines],
          )}
        >
          {description}
        </p>
      ) : null}
      {meta ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 type-meta text-muted-foreground">
          {meta}
        </div>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );

  return (
    <article
      className={cn(
        "group/entity relative min-w-0",
        list ? "flex items-start gap-4 py-4" : "flex h-full flex-col",
        !media && !list && "border-t border-border pt-5",
        className,
      )}
    >
      {mediaBlock}
      {body}
      {action ? (
        <div
          className={cn(
            "absolute z-10",
            list || !media ? "right-0 top-3" : "right-2 top-2",
            !list &&
              media &&
              "rounded-full bg-midnight/55 text-parchment backdrop-blur-sm",
          )}
        >
          {action}
        </div>
      ) : null}
    </article>
  );
}

/** Pill for the image corner: "Major deity", "Interactive", "Danger 9/10". */
export function EntityBadge({
  children,
  tone = "dark",
  className,
}: {
  children: React.ReactNode;
  tone?: "dark" | "gold";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.8125rem] font-medium leading-5 shadow-sm",
        tone === "gold"
          ? "bg-gold text-midnight"
          : "bg-midnight/80 text-parchment backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Tradition label with its accent dot. */
export function TraditionChip({
  name,
  color,
  className,
}: {
  name: string;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-muted-foreground",
        className,
      )}
    >
      <span
        className="size-2 shrink-0 rounded-full ring-1 ring-foreground/10"
        style={{ backgroundColor: color ?? "var(--gold)" }}
        aria-hidden="true"
      />
      <span className="truncate">{name}</span>
    </span>
  );
}

/** Stand-in when an entry has no image: the initial on a midnight field. */
function EntityInitial({
  title,
  color,
  small,
}: {
  title: string;
  color?: string;
  small?: boolean;
}) {
  return (
    <span
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, color-mix(in oklch, ${color ?? "var(--gold)"} 38%, transparent), transparent 70%), var(--midnight)`,
      }}
      aria-hidden="true"
    >
      <span
        className={cn(
          "font-serif font-semibold text-gold-light/80",
          small ? "text-3xl" : "text-6xl",
        )}
      >
        {title.charAt(0)}
      </span>
    </span>
  );
}

/**
 * Column layout for a set of EntityCards. Portraits run 2 → 3 → 4 columns,
 * landscapes 1 → 2 → 3; `list` stacks rows with hairline dividers.
 */
export function EntityGrid({
  aspect = "landscape",
  variant = "grid",
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  aspect?: EntityCardAspect;
  variant?: EntityCardVariant;
  as?: "div" | "ul" | "ol";
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "children">) {
  return (
    <Tag
      className={cn(
        variant === "list"
          ? "divide-y divide-border/60"
          : aspect === "portrait"
            ? "grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4"
            : "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Placeholder with the card's proportions while data loads. */
export function EntityCardSkeleton({
  aspect = "landscape",
  variant = "grid",
}: {
  aspect?: EntityCardAspect;
  variant?: EntityCardVariant;
}) {
  const list = variant === "list";
  return (
    <div
      className={cn(
        "motion-safe:animate-pulse",
        list ? "flex items-start gap-4 py-4" : "flex flex-col",
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "shrink-0 rounded-md bg-muted",
          ASPECT_CLASS[aspect],
          list && (aspect === "portrait" ? "w-20 sm:w-24" : "w-28 sm:w-32"),
        )}
      />
      <div className={cn("min-w-0 flex-1 space-y-2.5", list ? "" : "mt-3.5")}>
        <div className="h-3 w-20 rounded-full bg-muted" />
        <div className="h-5 w-3/5 rounded bg-muted" />
        <div className="h-3.5 w-full rounded bg-muted/80" />
        <div className="h-3.5 w-4/5 rounded bg-muted/80" />
      </div>
    </div>
  );
}
