import type { TargetAndTransition, Transition } from "framer-motion";

/**
 * Reduced-motion helpers for the hero. Centralizes the "should this animate?"
 * decision so it is unit-testable and applied consistently.
 */

export interface Entrance {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  transition: Transition;
}

export interface Loop {
  animate: TargetAndTransition;
  transition: Transition;
}

/**
 * One-shot entrance animation. Under reduced motion, render immediately at the
 * final ("animate") state with no transition — content appears without movement.
 */
export function heroEntrance(reduce: boolean, full: Entrance) {
  return reduce
    ? {
        initial: false as const,
        animate: full.animate,
        transition: { duration: 0 } as Transition,
      }
    : full;
}

/**
 * Infinite ambient loop (glow ring, scroll bob, orbs). Under reduced motion,
 * no animation runs at all.
 */
export function heroLoop(reduce: boolean, full: Loop) {
  return reduce
    ? {
        animate: {} as TargetAndTransition,
        transition: { duration: 0 } as Transition,
      }
    : full;
}
