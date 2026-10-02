"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders `fallback` until the wrapper is near the viewport, then renders
 * `children`. Use it around a heavy below-the-fold client component (a
 * next/dynamic chart or graph) so its chunk is fetched when the reader is
 * about to see it, not during page load.
 *
 * The first render is always the fallback, on the server and in the browser,
 * so hydration matches. Give the fallback the same height the content will
 * have so nothing shifts. Without IntersectionObserver the content renders at
 * once.
 */
export function RenderWhenVisible({
  children,
  fallback,
  rootMargin = "400px 0px",
}: {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{visible ? children : fallback}</div>;
}
