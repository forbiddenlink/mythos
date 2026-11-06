"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

const trimId = (raw: string): string => raw.trim();

interface UseUrlSelectionOptions<T> {
  /** Query param that holds the comma-separated slugs, for example "deities". */
  param: string;
  /** Route the param lives on, for example "/compare". */
  basePath: string;
  /** Resolves one id or slug from the URL to an item; undefined drops it. Keep it referentially stable. */
  resolve: (id: string) => T | undefined;
  /** Slug written back to the URL for an item. */
  getSlug: (item: T) => string;
  /** Maximum number of items kept from the URL and accepted by `setSelection`. */
  max: number;
  /** Normalizes each raw id before `resolve`; keep it referentially stable. Defaults to trimming. */
  normalizeId?: (raw: string) => string;
}

/** Writes not yet visible in the URL, newest last. */
interface PendingSelection<T> {
  items: T[];
  /** Param values written so far, decoded as `searchParams.get` returns them. */
  written: Array<string | null>;
}

/**
 * The URL owns the selection. The selection is derived from the query string
 * on every render (so navigating to the bare route clears it) and changes are
 * written with `router.replace`, never from inside a state updater.
 *
 * `router.replace` commits asynchronously, so a second change made before the
 * first one lands would otherwise start from the stale URL and undo it. Until
 * the URL shows the newest write, the hook returns that write. Any URL change
 * that is not one of its own writes (back button, a link) discards it.
 */
export function useUrlSelection<T>({
  param,
  basePath,
  resolve,
  getSlug,
  max,
  normalizeId = trimId,
}: Readonly<UseUrlSelectionOptions<T>>): [T[], (next: T[]) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get(param);

  const [pending, setPending] = useState<PendingSelection<T> | null>(null);
  const [seenRaw, setSeenRaw] = useState(raw);
  if (raw !== seenRaw) {
    // Adjust state while rendering when the URL moves (React's documented
    // alternative to an effect): keep the pending write only while the URL is
    // still catching up through this hook's own earlier writes.
    setSeenRaw(raw);
    if (pending) {
      const newest = pending.written[pending.written.length - 1];
      if (raw === newest || !pending.written.includes(raw)) setPending(null);
    }
  }

  const fromUrl = useMemo(() => {
    if (!raw) return [];
    return raw
      .split(",")
      .map((id) => resolve(normalizeId(id)))
      .filter((item): item is T => item !== undefined)
      .slice(0, max);
  }, [raw, resolve, normalizeId, max]);

  const selection = pending ? pending.items : fromUrl;

  const setSelection = useCallback(
    (next: T[]) => {
      const items = next.slice(0, max);
      const value = items.length === 0 ? null : items.map(getSlug).join(",");
      setPending((current) => ({
        items,
        written: [...(current?.written ?? []), value],
      }));
      if (value === null) {
        router.replace(basePath, { scroll: false });
        return;
      }
      const params = new URLSearchParams();
      params.set(param, value);
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [router, basePath, param, max, getSlug],
  );

  return [selection, setSelection];
}
