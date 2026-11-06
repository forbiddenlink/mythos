import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during SSR and the hydration render, true on the client afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
