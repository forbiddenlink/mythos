# Page-level findings from the lead's visual audit (2026-09-26)

Screenshots were taken at 1440x900 and 390x844, light theme, reduced motion.

## Detail pages (deity, hero, story, creature, artifact, location, pantheon, compare)

- Deity/hero/story/creature: the text column is about 540px at the left of an
  800px container, with the right side empty. Adopt the new DetailLayout
  (article plus sticky aside).
- Deity hero: the small image is on the left, with a large empty area on the
  right of the title block.
- Hero pages show procedural plates (a new plate style is in progress).
- The deity "X: figures across traditions" RosettaWheel is a bare cross with
  no names (the foundation agent is fixing it).
- Headings mix gold H2s ("The King of Olympus"), left-bar H2s with icons
  ("Cross-Pantheon Parallels", "Ancient Sources", "Appears In", "Worship &
  Cult"), an accordion ("Further Reading"), and a bordered card
  ("References & further reading"). "Further Reading" and "References"
  duplicate each other; merge them.
- The References list shows raw markdown: `*Greek Religion*`. Render
  emphasis.
- "Referenced across Mythos" is a bordered box above the article. It would
  fit better as an aside block.
- Story page: the hero is fine. The body column is narrow and the "Editorial
  narrative +" heading looks odd.
- Pantheon page (/pantheons/greek): the dark hero has no image. The "About"
  H2 is followed by bold sans H3s (a different style from the rest). The text
  column is narrow.
- Compare pair (/compare/zeus-vs-odin): the hero has no portraits (show both
  figures side by side). The "Where they meet" text is awkward: "The atlas
  records no shared domain or symbol between them. What connects them is
  elsewhere: Both are ..." (capital B after a colon, and the note sentence is
  repeated in "Why they are compared"). "Zeus already lists Odin; both are
  ..." is internal wording that shouldn't be shown to readers.

## Index and list pages

- The shared PageHero is huge (about 350px), with an icon in a box, an
  eyebrow, a centred title and an ornament. The foundation agent is replacing
  it.
- The explainer boxes read like documentation. Move or condense them into
  AboutThisPage:
  - /deities: "Browse By Domain, Symbol, And Role" and "Good Next Stops".
  - /pantheons: "How To Use The Pantheon Guide".
  - /stories: "Read The Core Myths First".
  - /family-tree: seven paragraphs.
  - /quiz: "Study With Every Quiz Mode".
  - /timeline: "Using the Interactive Timeline" box and the intro paragraph
    above the breadcrumb.
- /deities cards: a tiny 44px thumbnail and lots of white space. Lead with
  the image (e.g. 4:5 portrait or 3:2 crop) and move the "Major Deity" pill
  and the heart onto the image.
- /pantheons cards: good imagery, but the region labels wrap to three lines
  (use a shorter `region` or truncate to one line). "Chart the Heavens" is a
  large dark box that looks empty until the 3D view loads; it needs a real
  loading/fallback state. The console shows "Failed to fetch" on
  /pantheons; investigate.
- /stories interactive cards: grey placeholder squares beside the titles,
  and two cards use a generic parchment image (the plates agent is
  generating covers). The "Interactive" pill overlaps the orange top rule.
- /heroes, /creatures, /artifacts, /locations: use the unified entity card.
  On /locations the "Types" chips look disabled (faded) even though they are
  filters. The filter panel is heavy.
- /gods-of/war: good structure. The tradition chips are plain underlined
  links in two wrapping lines; use a proper chip/segmented style. Names are
  inconsistent: "Canaanite Pantheon (Ugarit) (2)" vs "Greek (2)".
- /paths: decent. The featured collection image comes from the Met (it
  fails in the sandbox but works in production). The 01-12 numbered list is
  OK.

## Tool and app pages

- /quiz:
  - The hero icon sits in a grey box with an orange icon (off-brand).
  - "Learn / Challenge / Achieve" is a row of three meaningless feature
    tiles; remove it.
  - The Knowledge Quiz only renders after hydration, so the static HTML
    shows an empty gap. Render a server "start" state or skeleton.
  - The "More quizzes" cards use grey icon boxes.
- /progress (Your Stats): the empty state is sparse. Fill it with an
  attractive empty state and a preview of what you'll track. The backup card
  is fine.
- /timeline: the D3 chart shows a spinner for a long time. The intro
  paragraph sits above the breadcrumb (misplaced). Heavy filter card.
- /family-tree: the tree needs a proper loading state. The explainer wall
  goes below the tree.
- /atlas: with reduced motion (or no WebGL) it falls back to a plain list of
  names in columns. Make the fallback look designed (e.g. portraits grouped
  by tradition).
- /about, /support, /achievements, /review, /oracle, /sources, 404 and the
  worksheet: apply the new PageHeader and Section primitives and check
  spacing.

## Global

- Header: the streak pill and control sizes are inconsistent. The desktop
  language switcher is a flag plus "EN" (a flag for English is a poor
  choice; use a globe icon).
- Footer: very tall, with widely spaced link lists and a decorative ruins
  image band above it (the foundation agent is handling this).
- Many labels are 11-12px grey. Raise sizes and contrast.

## Status after the foundation merge (afc6114)

Done by the foundation work:

- Homepage.
- Deity detail page, now on `DetailLayout`.
- Header and footer.
- Index heroes, now the compact `PageHero` → `PageHeader`.
- RosettaWheel, replaced by `ParallelFigures`.

Also fixed: route `loading.tsx` files removed, so prerendered pages no longer
flash a spinner.

Still open, as reported by the foundation agent:

- Index pages open with bordered "How to use / Read the core myths first"
  boxes plus extra top padding. Move these into `AboutThisPage`.
- Card styles are inconsistent across index pages: monospace region labels on
  pantheon cards, and procedural plates on hero cards.
- On /pantheons, "Chart the Heavens" is an empty dark box, and on mobile its
  buttons overlap its heading.
- The Thor and Orpheus interactive covers are parchment placeholders (the
  plates agent is working on this).
- These shared source components still use left-bar or card headings:
  AppearsIn, ReferencesList, EntityPlainSourcesList, SourceProvenance and
  MuseumGallery.
- The family-tree ReactFlow view starts with its nodes offset to the left.
- `SimplePageHeader` and `RouteHero` are still used on about 12 routes.
- The hero, creature, story, artifact, location and pantheon detail pages
  still use the old layout.
- The Loki portrait resembles a real actor (a likeness risk).

## Primitive APIs (apps/web/src/components/layout/)

- Tokens:
  - Type: `.type-display`, `.detail-title`, `.page-title`,
    `.page-section-title`, `.type-h3`, `.type-reading`, `.type-lede`,
    `.type-ui`, `.type-meta`, `.type-eyebrow`.
  - Widths: `max-w-reading` / `max-w-content` / `max-w-wide`.
  - `--gutter`.
  - `--section-space-{sm,,lg}` and `.section-space-*`.
- `<Container size="reading|content|wide|full" as>`
- `<Section spacing="none|sm|md|lg" tone="default|muted|dark" size containerClassName>`
- `<SectionHeading eyebrow title description action={{href,label}}|node as id align>`
  is the only section-title style.
- `<PageHeader eyebrow mark title lede count actions image imageAlt breadcrumbs accent viewTransitionName>`.
  `<PageHero>` keeps its old props and renders `PageHeader`.
- `<AboutThisPage title defaultOpen size|false>` is a native `<details>` below
  the content.
- `detail-layout.tsx`:
  - `<DetailLayout hero facts toc aside after asideLabel>`
  - `<DetailHero image={{src,alt,unoptimized,fit}} imageCaption imageFallback eyebrow title titleAddon nativeName epithets tags tagsLabel lede actions meta accentColor breadcrumbs ...>`
  - `<ArticleSection id title eyebrow description reading>`
  - Aside blocks: `<FactList>`, `<OnThisPage>`, `<RelatedFigures>`,
    `<AsideLinks>`.
  - The reference implementation is `app/deities/[slug]/page.tsx`.
- `components/mythology/ParallelFigures.tsx` provides
  `<ParallelFigures label figures variant>`. Keep the label ending in
  "across pantheons" (an e2e test relies on it).

## Index and list pages pass

Done (screenshots in `docs/design/screenshots/index/`):

- One card: `components/entities/EntityCard.tsx` (`EntityCard`, `EntityGrid`,
  `EntityBadge`, `TraditionChip`, `EntityCardSkeleton`) on /deities,
  /heroes, /creatures, /artifacts, /locations, /stories,
  /stories/interactive, /pantheons, /sources, /gods-of/[domain],
  /divine-domains, /guides, /journeys, /paths and /bookmarks. /facts keeps
  quote cards but uses the same toolbar and portrait chips.
- One filter pattern: `components/entities/FilterToolbar.tsx` under the
  PageHeader; explainer boxes moved into `AboutThisPage`.
- /pantheons: "Chart the Heavens" is a server-rendered SVG star chart. The
  "Failed to fetch" console error came from drei's `<Text>` fetching its
  default font from a CDN; the WebGL component is gone.
- Tradition names are short everywhere (`shortTraditionName`).

Still open: the procedural plates on hero, some pantheon and two journey
covers, and the Thor/Orpheus interactive covers, wait on the images pass.
