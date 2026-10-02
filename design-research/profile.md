# Mythos Atlas: product profile (v2 redesign, 2026-10-01)

Written against: 7e7c63b9 (origin/main, 2026-10-01). Baseline screenshots (390 and 1280, light and dark, 52 routes) are in `screens/base/` (gitignored, regenerable).

## What it is
A free, illustrated atlas of world mythology for learners, students and design-minded visitors. 26 traditions, 359 deities, 162 stories, heroes, creatures, artifacts, places, family trees, comparison tools, quizzes, source citations.
Main action: move from orientation (a tradition or story) into deeper study (a deity, a story, its sources).

## Routes and templates
- Home `/`: hero, tradition showcase, Today's myth, themed collections, parallels, interactive-story banner, guides, did-you-know.
- Index templates (PageHeader + EntityCard grid): `/pantheons`, `/deities`, `/heroes`, `/creatures`, `/stories`, `/locations`, `/artifacts`, `/sources`, `/journeys`, `/collections/[slug]`, `/gods-of`, `/domains`.
- Entity templates (DetailHero + DetailLayout): `/deities/[slug]`, `/heroes/[slug]`, `/creatures/[slug]`, `/pantheons/[slug]`, `/artifacts/[slug]`, `/locations/[slug]`, `/stories/[slug]`, `/sources/[slug]`, `/journeys/[slug]`, `/compare/[pair]`.
- Reading and play: `/stories/[slug]/read`, `/stories/interactive/*`, cinematic stories, `/study/[slug]`, `/quiz/*`, `/games/*`, `/oracle`, `/review`.
- Visualisations: `/atlas`, `/timeline`, `/family-tree`, `/knowledge-graph`, `/cosmology`.
- Utility: `/about`, `/facts`, `/paths`, `/guides/*`, `/support`, `/contact`, `/privacy`, `/terms`, `/changelog`, `/accessibility`, `/bookmarks`, `/progress`, `/achievements`, 404.

## Shared system
Tokens in `apps/web/src/app/globals.css` (OKLCH, light parchment and dark midnight). Fonts: Cinzel, Crimson Pro, Source Sans 3 (local). Layout primitives: Container (68ch, 1200, 1360), Section, SectionHeading, PageHeader, DetailHero, DetailLayout, ArticleSection, FactList, EntityCard, EntityGallery. Per-tradition colours in `lib/pantheon-colors.ts`.

## Already distinctive and worth keeping
- The 283 painted entries in one oil-painting manner; the dark cinematic band over parchment body; Cinzel small caps; gold as the only accent.
- Drop caps and hierarchy on entity articles; tradition colour dots.

## Where it read as generic (baseline review)
- Every image was a rounded-corner tile with a ring: gallery of thumbnails, no object quality.
- Headers were a gold eyebrow plus a Cinzel title: the same on all 20 index pages.
- Home hero was a 6-tile mosaic plus a CSS background image; Today's myth, collections and parallels rendered as an undifferentiated card stack.
- Wide screens: the article column hugged the left of the 1200px container with a large empty gap before the aside.

## Unknowns (not invented)
- Real-user LCP (no RUM access). Lighthouse numbers below are lab only.
- Whether any analytics events depend on removed home markup: checked by diff in the QA gate.
