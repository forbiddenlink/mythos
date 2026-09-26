# Visual overhaul brief (2026-09-26)

Goal: Mythos Atlas should look and feel like a finished, premium product: a
reference people trust, return to, and would pay to support. The brand stays
"classical, scholarly, luminous" (see `.impeccable.md`,
`apps/web/public/design-system.txt`). What changes is execution: consistency,
hierarchy, imagery and polish.

## What the audit found

Screenshots of ~30 routes at 1440px and 390px, light theme, reduced motion.

1. Layout grid is inconsistent. Container widths change between sections of
   the same page (hero ~1200px, body 800px, cards 1200px). Detail pages
   (deity, hero, story, creature, pantheon) put a ~540px text column on the
   left of an 800px container and leave the right half of the screen empty.
2. Pages read like documentation. Index and tool pages open with bordered
   "How to use", "Read the core myths first", "Browse by domain", "Good next
   stops", "See mythology as a network" boxes of small grey text before the
   actual content. The family-tree page has seven paragraphs before the tree.
3. Too many heading treatments: small-caps Cinzel at five sizes, gold
   headings, left-bar headings, icon + heading, bordered accordions. No clear
   H1/H2/H3 rhythm.
4. Imagery is underused. The homepage is text lists only, though the catalog
   has hundreds of portraits. Detail heroes show a small image beside a lot of
   empty space. Interactive-story cards show grey placeholder squares and two
   generic parchment images. Procedural plates look like placeholders.
5. Broken or empty visuals: the "X: figures across traditions" RosettaWheel on
   deity pages renders a bare cross with no names; the homepage featured
   interactive story has no image; a large decorative ruins photo above the
   footer carries no content.
6. Small type everywhere (11-12px labels, 13px body in cards) and low-contrast
   greys; pantheon-card region labels wrap to three lines; reference lists
   show raw `*asterisks*`; the footer is very tall with widely spaced links.
7. Scroll-driven reveal (`.pantheon-reveal`, framer `whileInView`) leaves
   below-the-fold content invisible until scrolled; fine for users, but make
   sure nothing is invisible without JS or before first scroll on short pages.

## Design direction

- **One grid.** Three container widths, used everywhere:
  - `prose`: 68ch for long reading.
  - `content`: 1200px for pages.
  - `wide`: 1360px for visualizations and galleries.
    Horizontal padding: 16px mobile, 24px tablet, 32px desktop.
    Vertical rhythm: section spacing from one scale (e.g. 48 / 72 / 96px).
- **One heading system.**
  - H1 (Cinzel, page title).
  - Section heading component: optional eyebrow, title, optional one-line
    description, optional right-aligned action link.
  - H3 for subsections.
  - No decorative left bars and icons on every heading; use them only where
    they carry meaning.
- **Readable type.** Body 17-18px (Crimson Pro for reading, Source Sans for
  UI). Minimum 14px for UI labels, 12px only for true metadata. Muted text
  meets WCAG AA on both themes.
- **Detail template.**
  - The hero pairs a large image (portrait 4:5 or landscape) with title,
    native name, epithets, domains and actions.
  - Below it, two columns on desktop: the article at 68ch, plus a sticky
    aside with key facts (tradition, domains, symbols, parents/consorts),
    an "On this page" table of contents, related figures with thumbnails,
    and featured guides.
  - Single column on mobile, with the facts collapsed near the top.
- **Index pages.**
  - A shorter page header: title, one-sentence lede, count.
  - The tool or grid comes immediately after.
  - SEO explanation text moves below the content as a compact "About this
    collection" section, or into the lede. Keep the text indexable; don't
    delete meaningful content.
  - One entity card component with an image-led design and consistent
    aspect ratios, used for deities, heroes, creatures, artifacts,
    locations, stories and pantheons.
- **Imagery first.** Use the portraits: the homepage shows faces and places;
  lists lead with images. Placeholder icons are never shown as content.
- **Restraint.** Fewer borders and boxes, more whitespace with purpose. Cards
  only for interactive or structured data (per `.impeccable.md`).
- **Both themes.** Every screen must look intentional in light and dark.
- **Motion.** Purposeful, reduced-motion safe (unchanged rule).

## Verification loop (every agent)

Build (`NEXT_PUBLIC_ORACLE_ENABLED=true pnpm --filter web build`), start
`next start -p <port>`, and screenshot your routes at 1440x900 and 390x844 in
light and dark (Playwright, `reducedMotion: "reduce"`, set
`localStorage["mythos-cookie-consent"]="accepted"`, executablePath
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`). Look at the images
(Read tool), fix what looks wrong, repeat. Also run tsc, lint, biome (errors),
knip, unit tests, bundle budget, and the Playwright e2e suite (temporary config
with the executablePath; ignore the Met image test that needs network).
