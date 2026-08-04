/**
 * Canonical page chrome classes — use these instead of inventing
 * per-page H1 / lede / shell recipes. Keeps every route in the same
 * classical atlas voice (Cinzel display + Crimson body).
 *
 * Prefer the CSS utilities in globals.css (`.page-title`, `.page-shell`, etc.)
 * so sizing never depends on Tailwind picking up composed class strings.
 */
export const pageEyebrowClass = "page-eyebrow";

export const pageTitleClass = "page-title";

export const pageTitleOnDarkClass = "page-title text-parchment";

export const pageLedeClass = "page-lede";

export const pageLedeOnDarkClass = "page-lede text-parchment/70";

export const pageLedeOnLightClass = "page-lede text-muted-foreground";

export const pageShellClass = "page-shell";

export const pageSectionTitleClass = "page-section-title";
