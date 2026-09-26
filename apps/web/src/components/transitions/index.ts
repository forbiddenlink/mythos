/**
 * View Transitions Components
 *
 * This module provides components for implementing the View Transitions API
 * for smooth page-to-page navigation in the Mythos Atlas app.
 *
 * ## Available Components
 *
 * - `TransitionLink` - Enhanced Link with view transition support
 *
 * ## CSS Transition Names
 *
 * Define transition animations in globals.css for these names:
 * - `deity-image` - Deity card/image morph transitions
 * - `story-card` - Story card slide transitions
 * - `page-header` - Page header slide transitions
 * - `hero-section` - Hero blur/scale transitions
 * - `pantheon-badge` - Badge pop transitions
 *
 * ## Usage
 *
 * ```tsx
 * import { TransitionLink } from '@/components/transitions';
 *
 * // Link with view transition
 * <TransitionLink href="/deities/zeus">
 *   Zeus
 * </TransitionLink>
 *
 * // Shared element transition (image morphs between pages)
 * <TransitionLink href="/deities/zeus">
 *   <Image style={{ viewTransitionName: 'deity-zeus' }} />
 * </TransitionLink>
 * ```
 */

export { TransitionLink } from "./TransitionLink";
