# Direction plan (v2): the printed atlas

Written against: 7e7c63b9 (origin/main, 2026-10-01). Evolves the approved direction in `DESIGN.md` and `.impeccable.md` (classical, scholarly, luminous; Cinzel, Crimson Pro, Source Sans; gold on midnight and parchment). The 283 painted entries stay. It does not replace the system; it gives it a point of view.

## Direction
Mythos Atlas is a book you can open anywhere. Every surface borrows from the printed atlas and the folio plate book, never from a tradition's own motifs (each tradition keeps its identity only through its name, its painting and its colour tab).
- Type: unchanged families. Cinzel small caps for titles, Crimson Pro for reading, Source Sans for controls. New: letter-spaced caps running heads, Roman numeral section marks.
- Palette: unchanged tokens. New tokens `--plate-mat`, `--plate-keyline`, `--plate-shadow`, `--plate-ink` (parchment mat in light, midnight-light mat in dark, always parchment on a midnight band).
- Spacing and layout: unchanged grid. The entity page marginalia column gets a gilt column rule so the gutter reads as a book gutter.
- Imagery: paintings are mounted as plates, not tiles. No new images are generated (budget unused).
- Motion: none added. Hover zoom on plates is disabled under prefers-reduced-motion.
References drawn on (see references.md): folio and plate books, map-sheet atlases, museum object labels, specimen plates.

## Signature moves (repeat on every template)
1. **Plates.** A painting is a mounted plate: ivory mat, thin gilt keyline just inside the mat edge, a 3px tab in the tradition colour (`lib/pantheon-colors.ts`), and on heroes a printed caption ("PLATE . Zeus"). Used by EntityCard, EntityGallery, DetailHero, home frontispiece, guide and parallel tiles.
2. **Running heads and hung numerals.** Index page headers carry a double-rule running head (eyebrow left, count right). H2 section titles count up in Roman numerals through a CSS counter (hung in the margin at 1440px and wider). The footer opens with a colophon rule.
3. **Leader-dot index.** The home page opens as a title page: Mythos Atlas, one frontispiece plate, and an index of all 26 traditions with leader dots and deity counts and a colour tab each. The same `.index-line` device is available site-wide.

## Anti-generic check
No gradient blobs (the hero keeps one faint gold radial behind the plate, justified as lamplight on the page), no three-equal-card feature row as the main layout, no glass, no Inter, no emoji or stroke icons as decoration, no logo wall, no unsourced counters (the home counts come from the catalog), no stock people, not centred.

## Features ranked by impact on the main action (orientation to deeper study)
1. Home index of every tradition, one click from the first screen. Buildable, shipped.
2. Frontispiece plate links straight to a deity. Shipped.
3. Plate captions and tradition colour tab make a card's tradition legible at a glance. Shipped.
4. Section numerals plus "On this page" make long entries navigable. Shipped.
5. Per-entry "plate number" and cross-reference chips: needs-approval (data model).
6. Saved reading lists across devices: needs-approval (auth, schema).

## Page by page
Home: title page (above). Indexes: running head, plate cards. Entity pages: plate hero, numerals, gilt rule. Reading, play and visualisation pages inherit the running head, numerals and plate cards; their bespoke canvases are untouched. Utility pages inherit. 404 keeps its layout.

## Performance finding (part of this work)
Mobile LCP: measured the same way on main and the branch; see report.md.
