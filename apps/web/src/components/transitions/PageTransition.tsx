'use client';

import { ReactNode, CSSProperties, createElement } from 'react';

type ElementType = 'div' | 'section' | 'article' | 'header' | 'main' | 'aside' | 'footer' | 'span';

interface PageTransitionProps {
  children: ReactNode;
  /**
   * View transition name for this page section.
   * Use predefined names for consistent animations:
   * - 'page-header' - Page titles with slide effect
   * - 'hero-section' - Hero sections with blur/scale
   * - 'deity-image' - Deity images for shared element transitions
   * - 'story-card' - Story cards with slide effect
   * - 'pantheon-badge' - Pantheon badges with pop effect
   */
  name?: string;
  /**
   * HTML element to render as wrapper
   * @default 'div'
   */
  as?: ElementType;
  /**
   * Additional CSS class names
   */
  className?: string;
  /**
   * Additional inline styles
   */
  style?: CSSProperties;
}

/**
 * Wrapper component for View Transitions.
 *
 * Apply a view-transition-name to page sections for
 * smooth animations during navigation.
 *
 * @example
 * // Hero section with blur/scale transition
 * <PageTransition name="hero-section">
 *   <HeroContent />
 * </PageTransition>
 *
 * @example
 * // Page header with slide transition
 * <PageTransition name="page-header" as="header">
 *   <h1>Page Title</h1>
 * </PageTransition>
 */
export function PageTransition({
  children,
  name,
  as = 'div',
  className,
  style,
}: PageTransitionProps) {
  return createElement(
    as,
    {
      className,
      style: {
        ...style,
        ...(name ? { viewTransitionName: name } : {}),
      },
    },
    children
  );
}

export default PageTransition;
