import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rafThrottle } from "../../lib/rafThrottle";

// jsdom does not provide requestAnimationFrame under fake timers; polyfill it
// on top of setTimeout so we can advance frames deterministically.
beforeEach(() => {
  vi.useFakeTimers();
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(
      () => cb(0),
      16,
    ) as unknown as number) as typeof requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((id: number) =>
    clearTimeout(id)) as typeof cancelAnimationFrame;
});
afterEach(() => vi.useRealTimers());

describe("rafThrottle", () => {
  it("coalesces multiple sync calls into one invocation per frame", () => {
    const spy = vi.fn();
    const throttled = rafThrottle(() => spy());
    throttled();
    throttled();
    throttled();
    expect(spy).toHaveBeenCalledTimes(0); // waits for the frame
    vi.advanceTimersByTime(16);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("uses the most recent arguments", () => {
    const spy = vi.fn<(n: number) => void>();
    const throttled = rafThrottle((n: number) => spy(n));
    throttled(1);
    throttled(2);
    throttled(3);
    vi.advanceTimersByTime(16);
    expect(spy).toHaveBeenCalledWith(3);
  });

  it("allows a new invocation on the next frame", () => {
    const spy = vi.fn();
    const throttled = rafThrottle(() => spy());
    throttled();
    vi.advanceTimersByTime(16);
    throttled();
    vi.advanceTimersByTime(16);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("cancel() prevents a pending invocation", () => {
    const spy = vi.fn();
    const throttled = rafThrottle(() => spy());
    throttled();
    throttled.cancel();
    vi.advanceTimersByTime(32);
    expect(spy).toHaveBeenCalledTimes(0);
  });
});
