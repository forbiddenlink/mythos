"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, type ComponentProps } from "react";

type LinkProps = ComponentProps<typeof Link>;

/**
 * A drop-in next/link that wraps the navigation in the native View Transitions
 * API so a shared `view-transition-name` (e.g. a deity portrait) morphs into
 * its counterpart on the destination page.
 *
 * Deliberately does NOT use Next's experimental viewTransition flag (which
 * previously broke navigation here). Every edge case — modifier/middle click,
 * new-tab targets, no API support, reduced motion — falls through to normal
 * Link navigation, so this can never leave a click dead.
 */
export const ViewTransitionLink = forwardRef<HTMLAnchorElement, LinkProps>(
  function ViewTransitionLink({ href, onClick, ...rest }, ref) {
    const router = useRouter();

    return (
      <Link
        ref={ref}
        href={href}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          // Respect modified clicks and non-primary buttons.
          if (
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            e.button !== 0
          ) {
            return;
          }
          if (rest.target && rest.target !== "_self") return;
          if (typeof href !== "string") return;

          const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          if (typeof document.startViewTransition !== "function" || reduce) {
            return;
          }

          // Take over navigation only when we can actually animate it.
          e.preventDefault();
          document.startViewTransition(() => {
            router.push(href);
          });
        }}
        {...rest}
      />
    );
  },
);

export default ViewTransitionLink;
