/**
 * Coalesce rapid calls (e.g. scroll) into at most one invocation per animation
 * frame. The wrapped fn runs with the most recent arguments on the next frame.
 */
export function rafThrottle<A extends unknown[]>(fn: (...args: A) => void) {
  let scheduled = false;
  let lastArgs: A | null = null;
  let raf = 0;

  function wrapped(...args: A) {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    raf = requestAnimationFrame(() => {
      scheduled = false;
      if (lastArgs) fn(...lastArgs);
    });
  }

  wrapped.cancel = () => {
    cancelAnimationFrame(raf);
    scheduled = false;
  };

  return wrapped;
}
