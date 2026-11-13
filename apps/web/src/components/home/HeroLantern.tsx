"use client";

import { useEffect, useRef } from "react";
import { rafThrottle } from "@/lib/rafThrottle";

/**
 * Candlelight over the engraved sky: a gilded copy of the star chart, masked
 * to a soft circle. CSS sweeps the candle across the chart once on load; after
 * that it follows a fine pointer over the hero. Decorative only. Under
 * reduced motion or on touch screens the CSS keeps it hidden and this effect
 * attaches no listeners.
 */
export function HeroLantern({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const section = el?.closest("section");
    if (!el || !section) return;
    const media = window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!media.matches) return;

    const move = rafThrottle((x: number, y: number) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      el.style.setProperty("--lx", `${((x - r.left) / r.width) * 100}%`);
      el.style.setProperty("--ly", `${((y - r.top) / r.height) * 100}%`);
      el.dataset.lit = "true";
    });
    const onMove = (e: PointerEvent) => move(e.clientX, e.clientY);
    const onLeave = () => {
      move.cancel();
      delete el.dataset.lit;
    };

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    return () => {
      move.cancel();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`hero-lantern ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}
