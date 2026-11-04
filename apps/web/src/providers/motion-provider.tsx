"use client";

import { LazyMotion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

const loadFeatures = () =>
  import("@/lib/motion-features").then((mod) => mod.default);

/**
 * Supplies framer-motion's animation features to `m.*` components. The
 * features load after hydration instead of ship in the first-load bundle, and
 * an `m.*` element renders its normal markup until they arrive. Not strict:
 * routes that still use `motion.*` keep working.
 *
 * `reducedMotion="user"` makes every framer animation honour the reader's
 * prefers-reduced-motion setting. The CSS rule in globals.css only stops CSS
 * animations; JS-driven transforms and layout animations bypass it.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures}>{children}</LazyMotion>
    </MotionConfig>
  );
}
