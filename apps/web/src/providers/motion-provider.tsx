"use client";

import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

const loadFeatures = () =>
  import("@/lib/motion-features").then((mod) => mod.default);

/**
 * Supplies framer-motion's animation features to `m.*` components. The
 * features load after hydration instead of ship in the first-load bundle, and
 * an `m.*` element renders its normal markup until they arrive. Not strict:
 * routes that still use `motion.*` keep working.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
