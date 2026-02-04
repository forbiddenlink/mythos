'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* ---------------------------------------------------------------------------
 * Context – wires the compound components together
 * --------------------------------------------------------------------------*/

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error('Select compound components must be used within <Select>');
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

function Select({ value = '', onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const handleValueChange = React.useCallback(
    (v: string) => {
      onValueChange?.(v);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen, triggerRef }}>
      <div data-slot="select" className="relative inline-block">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

/* ---------------------------------------------------------------------------
 * SelectTrigger
 * --------------------------------------------------------------------------*/

interface SelectTriggerProps extends React.ComponentProps<'button'> {}

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  const { open, setOpen, triggerRef } = useSelectContext();

  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-expanded={open}
      data-slot="select-trigger"
      className={cn(
        'flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm',
        'shadow-sm transition-all duration-200',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-border/60 dark:bg-card/50',
        'hover:border-primary/50 dark:hover:border-primary/60',
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
          'shrink-0 opacity-50 transition-transform duration-200',
          open && 'rotate-180',
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

function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelectContext();

  return (
    <span
      data-slot="select-value"
      className={cn('truncate', !value && 'text-muted-foreground')}
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

// We'll use a secondary context so items can register their labels.
interface ItemRegistryValue {
  items: Map<string, string>;
  register: (value: string, label: string) => void;
}

const ItemRegistryContext = React.createContext<ItemRegistryValue | null>(null);

function SelectDisplayValue() {
  const { value } = useSelectContext();
  const registry = React.useContext(ItemRegistryContext);
  const label = registry?.items.get(value);
  return <>{label ?? value}</>;
}

/* ---------------------------------------------------------------------------
 * SelectContent
 * --------------------------------------------------------------------------*/

interface SelectContentProps extends React.ComponentProps<'div'> {}

function SelectContent({ className, children, ...props }: SelectContentProps) {
  const { open, setOpen, triggerRef } = useSelectContext();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Item registry so SelectValue can display the label for the current value.
  const [items] = React.useState(() => new Map<string, string>());
  const register = React.useCallback(
    (value: string, label: string) => {
      items.set(value, label);
    },
    [items],
  );

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
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, setOpen, triggerRef]);

  return (
    <ItemRegistryContext.Provider value={{ items, register }}>
      {/* Hidden wrapper always renders so items can register labels */}
      <div className="contents" aria-hidden={!open}>
        {open && (
          <div
            ref={contentRef}
            data-slot="select-content"
            role="listbox"
            className={cn(
              'absolute z-50 mt-1 min-w-[var(--trigger-width,8rem)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg',
              'animate-in fade-in-0 zoom-in-95',
              'dark:border-border/60 dark:bg-card dark:shadow-black/30',
              className,
            )}
            style={{
              '--trigger-width': triggerRef.current
                ? `${triggerRef.current.offsetWidth}px`
                : undefined,
            } as React.CSSProperties}
            {...props}
          >
            <div className="max-h-60 overflow-y-auto p-1">{children}</div>
          </div>
        )}
        {/* Render children in a hidden span so items always register */}
        {!open && <span className="hidden">{children}</span>}
      </div>
    </ItemRegistryContext.Provider>
  );
}

/* ---------------------------------------------------------------------------
 * SelectItem
 * --------------------------------------------------------------------------*/

interface SelectItemProps extends React.ComponentProps<'div'> {
  value: string;
}

function SelectItem({ className, value, children, ...props }: SelectItemProps) {
  const { value: selected, onValueChange } = useSelectContext();
  const registry = React.useContext(ItemRegistryContext);
  const isSelected = selected === value;

  // Register label text on mount and when children change
  const label = typeof children === 'string' ? children : value;
  React.useEffect(() => {
    registry?.register(value, label);
  }, [registry, value, label]);

  return (
    <div
      role="option"
      aria-selected={isSelected}
      data-slot="select-item"
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors duration-150',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        isSelected && 'bg-primary/10 text-primary font-medium',
        'dark:hover:bg-accent/50',
        className,
      )}
      onClick={() => onValueChange(value)}
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
