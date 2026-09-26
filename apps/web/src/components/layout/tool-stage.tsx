import type * as React from "react";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────
   Tool pages (family tree, knowledge graph, timeline, atlas) share one
   shape: a compact PageHeader, a slim toolbar, then the visualization on
   a full-width "stage". These primitives keep that shape consistent and
   give every stage a designed loading and empty state instead of a bare
   spinner.
   ───────────────────────────────────────────────────────────────────── */

interface ToolToolbarProps {
  /** Accessible name for the toolbar group. */
  label: string;
  className?: string;
  children: React.ReactNode;
}

/** One compact row of controls above a stage; wraps on phones. */
export function ToolToolbar({ label, className, children }: ToolToolbarProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border/70 pb-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  /** Accessible name when the label is an icon or abbreviated. */
  ariaLabel?: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (value: T) => void;
  className?: string;
}

/** Two to four mutually exclusive views, as pressed toggle buttons. */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex rounded-md border border-border bg-muted/50 p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            aria-label={option.ariaLabel}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-10 items-center gap-2 rounded-[5px] px-3.5 type-ui font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
              selected
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface StageLoadingProps {
  /** What is loading, e.g. "Drawing the Greek family tree". */
  label: string;
  mark?: MythosMarkId;
  /** Height utility for the frame; match the stage so nothing jumps. */
  className?: string;
  /** Midnight surface for stages that render on dark (graph, stars). */
  tone?: "default" | "dark";
}

/**
 * The frame a visualization occupies while its code loads: same size as
 * the stage, a faint star grid, the tool's mark and a one-line status.
 * Marked aria-busy so assistive tech (and tests) know it is pending.
 */
export function StageLoading({
  label,
  mark = "constellation",
  className,
  tone = "default",
}: StageLoadingProps) {
  const dark = tone === "dark";
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "relative isolate flex h-[min(70vh,40rem)] w-full flex-col items-center justify-center gap-4 overflow-hidden",
        dark ? "bg-midnight text-parchment" : "bg-muted/40 text-foreground",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[28px_28px]",
          dark ? "opacity-[0.12]" : "opacity-[0.08]",
        )}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_45%_at_50%_50%,color-mix(in_oklch,var(--gold)_14%,transparent),transparent_75%)]"
      />
      <MythosMark
        id={mark}
        className={cn(
          "size-10 motion-safe:animate-pulse",
          dark ? "text-gold-light" : "text-gold-text",
        )}
      />
      <p
        className={cn(
          "type-ui",
          dark ? "text-parchment/85" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-0.5 w-32 overflow-hidden rounded-full",
          dark ? "bg-parchment/15" : "bg-border",
        )}
      >
        <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gold motion-safe:animate-[stage-sweep_1.4s_ease-in-out_infinite]" />
      </span>
    </div>
  );
}

interface EmptyStateProps {
  mark?: MythosMarkId;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Primary and secondary links. */
  actions?: React.ReactNode;
  /** A preview of what will fill the page (sample stats, cards). */
  preview?: React.ReactNode;
  /** Heading level for the title. */
  as?: "h2" | "h3";
  id?: string;
  className?: string;
}

/**
 * A designed empty state: an invitation on the left and, on wide screens, a
 * quiet preview of what the page will show once there is something to show.
 */
export function EmptyState({
  mark = "compass",
  eyebrow,
  title,
  description,
  actions,
  preview,
  as: Heading = "h2",
  id,
  className,
}: EmptyStateProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "grid items-center gap-10 lg:gap-16",
        preview && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]",
        className,
      )}
    >
      <div className="max-w-xl">
        <span className="mb-6 flex size-14 items-center justify-center rounded-full border border-gold/35 bg-gold/10 text-gold-text">
          <MythosMark id={mark} className="size-7" />
        </span>
        {eyebrow ? <p className="type-eyebrow mb-3">{eyebrow}</p> : null}
        <Heading id={id} className="page-section-title text-foreground">
          {title}
        </Heading>
        {description ? (
          <div className="type-lede mt-4 text-muted-foreground">
            {description}
          </div>
        ) : null}
        {actions ? (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {actions}
          </div>
        ) : null}
      </div>
      {preview ? <div className="min-w-0">{preview}</div> : null}
    </section>
  );
}

/** Primary pill-shaped link used by empty states and tool pages. */
export const primaryLinkClass =
  "inline-flex min-h-11 items-center gap-2 rounded-md bg-gold px-5 type-ui font-semibold text-midnight transition-colors hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

/** Quiet text link beside a primary action. */
export const secondaryLinkClass =
  "inline-flex min-h-11 items-center gap-1.5 type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
