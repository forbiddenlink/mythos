"use client";

import { useEffect, useState } from "react";
import { loadSearchIndex } from "@/lib/catalog-client";
import type { SearchIndex } from "@/lib/search-engine";

/**
 * The command-palette search index, fetched the first time `enabled` is true
 * and shared across components for the rest of the page's life.
 */
export function useSearchIndex(enabled: boolean): {
  index: SearchIndex | null;
  error: boolean;
} {
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled || index) return;
    let cancelled = false;
    loadSearchIndex()
      .then((loaded) => {
        if (!cancelled) {
          setIndex(loaded);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, index]);

  return { index, error };
}
