"use client";

import { getFocusableElements } from "@/lib/a11y/focus-trap";
import { type RefObject, useEffect } from "react";

/** App-shell landmarks to hide from AT/tab order while a modal is active. */
const INERT_SIBLING_SELECTORS = ["header", "#main-content", "footer"];

/**
 * Keeps keyboard focus within `containerRef` while `active` (modal/dialog).
 * Also marks the app-shell landmarks (header, main content, footer) inert
 * and aria-hidden so background content isn't reachable while the modal is
 * open (the modal itself is mounted outside those landmarks, so this can't
 * accidentally hide the dialog).
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !containerRef.current) return;

      const focusables = getFocusableElements(containerRef.current);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement;

      if (e.shiftKey) {
        if (activeEl === first || !containerRef.current.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [active, containerRef]);

  useEffect(() => {
    if (!active) return;

    const siblings = INERT_SIBLING_SELECTORS.map((selector) =>
      document.querySelector<HTMLElement>(selector),
    ).filter(
      (el): el is HTMLElement =>
        el !== null && !el.contains(containerRef.current),
    );

    siblings.forEach((el) => {
      el.setAttribute("inert", "");
      el.setAttribute("aria-hidden", "true");
    });

    return () => {
      siblings.forEach((el) => {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      });
    };
  }, [active, containerRef]);
}
