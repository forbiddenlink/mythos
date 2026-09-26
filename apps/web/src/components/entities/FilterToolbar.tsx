import type * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The one filter toolbar for list pages: a compact row of search, selects
 * and view toggle with the result count on the right, and an optional chip
 * row below. It sits directly under the PageHeader, before the grid.
 */
export function FilterToolbar({
  children,
  count,
  view,
  chips,
  className,
  label = "Filter the list",
}: {
  /** Search box and selects, left to right. */
  children?: React.ReactNode;
  /** Result count, e.g. "359 deities" (announced politely). */
  count?: React.ReactNode;
  /** A <ViewToggle>, pinned to the right. */
  view?: React.ReactNode;
  /** Chip rows (<ChipRow>) under the controls. */
  chips?: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="search"
      aria-label={label}
      className={cn("border-b border-border/70 pb-4", className)}
    >
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {children}
        {count || view ? (
          <div className="ml-auto flex items-center gap-3">
            {count ? (
              <p
                className="type-meta whitespace-nowrap text-muted-foreground"
                aria-live="polite"
              >
                {count}
              </p>
            ) : null}
            {view}
          </div>
        ) : null}
      </div>
      {chips ? <div className="mt-3 space-y-2.5">{chips}</div> : null}
    </div>
  );
}

/** Search input with an icon and a clear button. */
export function ToolbarSearch({
  id,
  label,
  placeholder,
  value,
  onChange,
  inputRef,
  className,
}: {
  id: string;
  /** Accessible name ("Search deities by name"). */
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id={id}
        type="text"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? label}
        autoComplete="off"
        className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-base text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 sm:text-[0.9375rem]"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-gold"
          aria-label="Clear search"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export interface ViewOption<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
  /** Accessible name when it differs from the label. */
  ariaLabel?: string;
  /** Hide the option below this breakpoint (e.g. tables on phones). */
  className?: string;
}

/** Segmented control for grid / list / table / map views. */
export function ViewToggle<T extends string>({
  value,
  onChange,
  options,
  label = "View",
  alwaysShowLabels = false,
}: {
  value: T;
  onChange: (value: T) => void;
  options: ViewOption<T>[];
  label?: string;
  /** Keep the text labels on phones (icons only by default). */
  alwaysShowLabels?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex shrink-0 rounded-lg border border-border bg-muted/50 p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={option.ariaLabel}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-3 type-ui font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold",
              active
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground",
              option.className,
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className={alwaysShowLabels ? undefined : "max-sm:sr-only"}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** A labelled row of filter chips, with an optional "all" action. */
export function ChipRow({
  label,
  action,
  children,
  className,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      <span className="mr-1.5 type-meta font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
      {action}
    </div>
  );
}

/** A toggle chip: filled gold when active, outlined otherwise. */
export function FilterChip({
  active,
  onClick,
  children,
  count,
  color,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
  /** Tradition accent for the dot. */
  color?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        active
          ? "border-gold/70 bg-gold/15 font-medium text-foreground"
          : "border-border bg-background text-foreground/80 hover:border-gold/50 hover:text-foreground",
      )}
    >
      {color ? (
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      ) : null}
      {children}
      {count !== undefined ? (
        <span className="text-muted-foreground tabular-nums">{count}</span>
      ) : null}
    </button>
  );
}

/** Empty result state shared by the list pages. */
export function EmptyResults({
  title,
  children,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <h2 className="type-h3 text-foreground">{title}</h2>
      {children ? (
        <p className="mt-2 font-body text-lg text-muted-foreground">
          {children}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
