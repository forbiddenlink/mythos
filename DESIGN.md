# Design contracts

The visual direction is the printed atlas (v2): same fonts, palette and imagery, with three signature moves below. Plan and rationale: `design-research/plan.md`. Canonical tokens and components are documented in `apps/web/public/design-system.txt`; token values live in `apps/web/src/app/globals.css` and design philosophy in `.impeccable.md`.

## Catalog navigation

Search, facets, view, sorting and pagination must survive entry navigation, browser Back and reload. Serialize supported catalog state in the URL. Replace filter edits in the current history entry; reset pagination when a filter or sort changes. Validate discrete values and page numbers. Preserve server-rendered pagination links where they already exist.

## Global search recovery

Use the existing command menu's selectable rows for onward destinations, including empty and unavailable search states. Keep status text outside the listbox, distinguish data failure from zero matches, retain arrow/Enter selection and provide at least 44px recovery rows with the existing readable text tokens. Escape returns focus to the element that opened search, including keyboard invocation.

These rules address observed usability failures. They do not change imagery, fonts, palette, card layouts or article hierarchy.

## Enlarged text

Header actions, catalog controls and optional footer tools can wrap when enlarged text needs more space. Keep the normal-size layout intact. Bound select controls to their container and allow long footer labels to wrap, so a 320px viewport remains usable with text enlarged to 200%.

## Failed local operations

A saved-state control can reflect the current in-memory choice, but a failed browser-storage write must show a visible warning with retry and backup recovery. Keep the warning visible while the reader scrolls. Backups include the latest unsaved learning changes. Do not describe a failed clipboard operation or unavailable review data as a successful result. Popovers must stay within the viewport and restore focus when dismissed with Escape.

## Atlas signature moves (v2)

Three devices repeat on every template so a page is recognisable with the logo covered. They borrow from the book object, never from one tradition's motifs: only a plate's top tab takes the tradition colour (`lib/pantheon-colors.ts`).

- **Plates.** A painting is mounted, not tiled. `.plate` (mat, gilt keyline inside the mat edge, 3px tradition-colour tab) wraps `.plate-art`; `.plate-flat` is the border-based variant for a single element with a fill image; `.plate-paper` forces a parchment mat on a midnight band; `.plate-caption` prints "PLATE . title" (home frontispiece only; entity heroes keep the illustration disclosure instead). Used by EntityCard, EntityGallery, DetailHero, guide and parallel tiles, the atlas grid and the home frontispiece. Tokens: `--plate-mat`, `--plate-keyline`, `--plate-shadow`, `--plate-ink` (light parchment mat, dark midnight-light mat).
- **Running heads and Roman numerals.** `.runhead` is a double-rule line with the eyebrow left and the count right; PageHeader, the home title page and the footer colophon use it. Every `.page-section-title` inside `<main>` counts up in Roman numerals through a CSS counter (inline, gold; hung in the margin at 1440px and wider). Do not add manual numbers.
- **Leader-dot index.** `.index-line` sets label, dotted leader and value on one line. The home page opens as a title page: Mythos Atlas, one frontispiece plate, and an index of every tradition with deity counts.

Layout. Entity pages use a 41rem reading column (`--container-reading`) and a 26rem marginalia column with a gilt column rule at 1280px and wider.

Performance. The home LCP is a real `<Image priority>` (the frontispiece), never a CSS background; the first screen requests three fonts, not four (no italic in the first paint).
