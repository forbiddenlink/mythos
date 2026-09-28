"use client";

import { useCallback, useSyncExternalStore } from "react";

const changeEvent = "mythos-catalog-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener("popstate", callback);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(changeEvent, callback);
  };
}

/** Read the live URL on return navigation, including a cached page remount. */
export function useCatalogState<T extends string>(
  key: string,
  defaultValue: T,
  allowed?: readonly T[],
  resetPage = true,
  initialValue: string = defaultValue,
): readonly [T, (value: string) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(key) ?? defaultValue,
    () => initialValue,
  );
  const value =
    raw !== null && (!allowed || allowed.includes(raw as T))
      ? (raw as T)
      : defaultValue;
  const setValue = useCallback(
    (next: string) => {
      // Read at the moment of the event so batched resets retain every change.
      const url = new URL(window.location.href);
      if (next === defaultValue) url.searchParams.delete(key);
      else url.searchParams.set(key, next);
      if (resetPage) url.searchParams.delete("page");
      window.history.replaceState(
        null,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
      window.dispatchEvent(new Event(changeEvent));
    },
    [key, defaultValue, resetPage],
  );
  return [value, setValue];
}
