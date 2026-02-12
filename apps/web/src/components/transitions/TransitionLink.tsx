'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ComponentProps, MouseEvent, useCallback, ReactNode } from 'react';

type LinkProps = ComponentProps<typeof Link>;

interface TransitionLinkProps extends Omit<LinkProps, 'children'> {
  children: ReactNode;
  /**
   * View transition name for shared element transitions
   * Apply matching name on target page for morph effect
   */
  viewTransitionName?: string;
}

/**
 * Enhanced Link component with View Transitions API support.
 *
 * Uses the native View Transitions API to enable smooth
 * page-to-page transitions in supported browsers.
 *
 * For shared element transitions, apply matching viewTransitionName
 * to both the source element and target element.
 *
 * @example
 * // Card linking to detail page with shared image transition
 * <TransitionLink href={`/deities/${slug}`} viewTransitionName={`deity-${slug}`}>
 *   <Image style={{ viewTransitionName: `deity-${slug}` }} ... />
 * </TransitionLink>
 */
export function TransitionLink({
  children,
  href,
  viewTransitionName,
  onClick,
  style,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      // Call original onClick if provided
      onClick?.(e);

      // If default prevented or modifier key pressed, let browser handle it
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) {
        return;
      }

      // Check for View Transitions API support
      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        e.preventDefault();

        document.startViewTransition(() => {
          router.push(href.toString());
        });
      }
      // If no support, fall back to normal Link behavior
    },
    [href, onClick, router]
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      style={{
        ...style,
        ...(viewTransitionName ? { viewTransitionName } : {}),
      }}
      {...props}
    >
      {children}
    </Link>
  );
}

export default TransitionLink;
