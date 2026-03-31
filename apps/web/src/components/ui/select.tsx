"use client";
// Force reload

import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Context – wires the compound components together
 * --------------------------------------------------------------------------*/

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentId: string;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

interface ItemRegistryValue {
  items: Map<string, string>;
}

const ItemRegistryContext = React.createContext<ItemRegistryValue | null>(null);

function getNodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  let text = "";

  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    text += getNodeText(
      (child.props as { children?: React.ReactNode }).children,
    );
  });

  return text;
}

function collectItemLabels(
  children: React.ReactNode,
  items: Map<string, string>,
): void {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const props = child.props as {
      value?: unknown;
      children?: React.ReactNode;
    };

    if (typeof props.value === "string") {
      const label = getNodeText(props.children).trim();
      items.set(props.value, label || props.value);
    }

    if (props.children) {
      collectItemLabels(props.children, items);
    }
  });
}

function useSelectContext() {
  const ctx = React.useContext(SelectContext);
  if (!ctx)
    throw new Error("Select compound components must be used within <Select>");
  return ctx;
}

/* ---------------------------------------------------------------------------
 * Select (root)
 * --------------------------------------------------------------------------*/

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

function Select({
  value = "",
  onValueChange,
  children,
}: Readonly<SelectProps>) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentId = React.useId();

  const handleValueChange = React.useCallback(
    (v: string) => {
      onValueChange?.(v);
      setOpen(false);
    },
    [onValueChange],
  );

  const selectCtxValue = React.useMemo(
    () => ({
      value,
      onValueChange: handleValueChange,
      open,
      setOpen,
      triggerRef,
      contentId,
    }),
    [value, handleValueChange, open, setOpen, triggerRef, contentId],
  );

  const itemRegistryValue = React.useMemo(() => {
    const items = new Map<string, string>();
    collectItemLabels(children, items);
    return { items };
  }, [children]);

  return (
    <SelectContext.Provider value={selectCtxValue}>
      <ItemRegistryContext.Provider value={itemRegistryValue}>
        <div data-slot="select" className="relative inline-block">
          {children}
        </div>
      </ItemRegistryContext.Provider>
    </SelectContext.Provider>
  );
}

/* ---------------------------------------------------------------------------
 * SelectTrigger
 * --------------------------------------------------------------------------*/

type SelectTriggerProps = React.ComponentProps<"button">;

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  const { open, setOpen, triggerRef, contentId } = useSelectContext();
  const registry = React.useContext(ItemRegistryContext);
  const { value } = useSelectContext();
  const derivedLabel = value
    ? (registry?.items.get(value) ?? value)
    : undefined;
  const accessibleLabel =
    typeof props["aria-label"] === "string"
      ? props["aria-label"]
      : derivedLabel;

  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-expanded={open ? "true" : "false"}
      aria-controls={open ? contentId : undefined}
      aria-label={accessibleLabel}
      data-slot="select-trigger"
      className={cn(
        "flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm",
        "shadow-sm transition-all duration-200",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-border/60 dark:bg-card/50",
        "hover:border-primary/50 dark:hover:border-primary/60",
        className,
      )}
      onClick={() => setOpen((prev) => !prev)}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "shrink-0 opacity-50 transition-transform duration-200",
          open && "rotate-180",
        )}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

/* ---------------------------------------------------------------------------
 * SelectValue
 * --------------------------------------------------------------------------*/

interface SelectValueProps {
  placeholder?: string;
}

function SelectValue({ placeholder }: Readonly<SelectValueProps>) {
  const { value } = useSelectContext();

  return (
    <span
      data-slot="select-value"
      className={cn("truncate", !value && "text-muted-foreground")}
    >
      {value ? <SelectDisplayValue /> : placeholder}
    </span>
  );
}

/**
 * Internal helper: walks the sibling SelectContent tree to find the label
 * for the currently selected value. Since we cannot easily reach into
 * SelectContent children from here, we instead render the raw value and
 * let SelectContent items register themselves via context if needed.
 *
 * For simplicity (no extra context plumbing), SelectValue just renders
 * the value string. The consumers in this project always set explicit
 * readable labels like "All Genders" whose *value* prop differs from
 * the display text. To show the label instead we need the items to
 * register. We keep this simple: render from a collected map.
 */

function SelectDisplayValue() {
  const { value } = useSelectContext();
  const registry = React.useContext(ItemRegistryContext);
  const label = registry?.items.get(value);
  return <>{label ?? value}</>;
}

/* ---------------------------------------------------------------------------
 * SelectContent
 * --------------------------------------------------------------------------*/

type SelectContentProps = React.ComponentProps<"div">;

function SelectContent({ className, children, ...props }: SelectContentProps) {
  const { open, setOpen, triggerRef, contentId } = useSelectContext();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        contentRef.current &&
        !contentRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      id={contentId}
      data-slot="select-content"
      role="listbox"
      className={cn(
        "absolute z-50 mt-1 min-w-(--trigger-width,8rem) overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        "dark:border-border/60 dark:bg-card dark:shadow-black/30",
        className,
      )}
      style={
        {
          /* eslint-disable react-hooks/refs -- ref read for CSS custom property sizing */
          "--trigger-width": triggerRef.current
            ? `${triggerRef.current.offsetWidth}px`
            : undefined,
          /* eslint-enable react-hooks/refs */
        } as React.CSSProperties
      }
      {...props}
    >
      <div className="max-h-60 overflow-y-auto p-1">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * SelectItem
 * --------------------------------------------------------------------------*/

interface SelectItemProps extends React.ComponentProps<"div"> {
  value: string;
}

function SelectItem({
  className,
  value,
  children,
  ...props
}: Readonly<SelectItemProps>) {
  const { value: selected, onValueChange } = useSelectContext();
  const isSelected = selected === value;

  return (
    <div
      role="option"
      aria-selected={isSelected ? "true" : "false"}
      tabIndex={0}
      data-slot="select-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors duration-150",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-primary/10 text-primary font-medium",
        "dark:hover:bg-accent/50",
        className,
      )}
      onClick={() => onValueChange(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onValueChange(value);
        }
      }}
      {...props}
    >
      {children}
      {isSelected && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-auto shrink-0"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Exports
 * --------------------------------------------------------------------------*/

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
