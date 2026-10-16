# Mythos Atlas QA walkthrough (dev server :3517, 2026-10-16)

Method: Node Playwright (chromium), consent pre-set via `mythos-cookie-consent=accepted`. Scripts: `/private/tmp/claude-501/-Volumes-LizsDisk-mythos/ec1f1f00-12a9-4ad2-8d5a-8d60adbd4169/scratchpad/qa/` (sweep results: `sweep_all.json`). Screenshots: `/Volumes/LizsDisk/mythos/design-research/shots/walkthrough/` (`<route>-1440.png`, `<route>-390.png`, `int-*.png` for interactions). No application code edited. Note: full-page screenshots show the sticky header mid-image; that is a capture artifact, not a defect.

## Findings (severity | route | viewport | what happens | evidence | likely source)

P0 (broken): none found.

P1 (bad UX / wrong content)

- P1 | /compare?deities=zeus,odin | 1440 | "Cross-Pantheon Parallels" labels every parallel with the CURRENT card's pantheon: Zeus card shows "Jupiter (Greek Pantheon)", "Odin (Greek)", "Indra (Greek)"; Odin card shows "Zeus (Norse)", "Mercury (Norse)", "The Dagda (Norse)". Data is right (zeus -> roman/norse/hindu; odin -> greek/roman/celtic). | shots/walkthrough/int-compare-selected.png | src/components/compare/ComparisonCard.tsx:49-57 (`formatPantheonName` returns the `pantheonName` prop for any id) used at :218
- P1 | all pages with desktop header | 1440 | Mega menu (Explore/Visualize/Learn): hover opens it, so a normal mouse click on the trigger then CLOSES it (aria-expanded true -> false). Keyboard: Tab-focus opens it (onFocus), Enter then closes it. Users who click the trigger get a flicker/no menu. | probe: hover expanded=true, click expanded=false; kbd Enter expanded=false | src/components/layout/mega-menu.tsx onClick (`if (isOpen) onClose()`) combined with onMouseEnter/onFocus open
- P1 | /deities | 1440 | Gender filter offers only Male/Female; 14 deities (androgynous 4, none 10) can never be selected by gender. Domain filter lists 622 raw values, including prose such as "winter (by later association with his brother Baldr's death)" and "uncertain; possibly plants or a protective/messenger role"; dropdown is effectively unusable and not narrowed by the chosen tradition (after picking Akan it still offers all 622). | probe output; data: deities.json gender counts {male 224, female 122, androgynous 4, none 10}, 8 domains over 40 chars | deities filter component + domain normalization (data/deities.json `domain`)
- P1 | /creatures/fenrir, /artifacts/imhullu | 1440 | No bookmark control on creature or artifact detail pages (deities and stories have one), and /bookmarks only ever lists deities and stories. Inconsistent save model; user cannot save two of the main entity types. (heroes/locations not checked) | probe "no bookmark btn on /creatures/fenrir, /artifacts/imhullu" | detail-layout / bookmarks provider

P2 (polish)

- P2 | all routes | both | `lang` attribute switches to `es` (also fr/de) while page body, H1 and the header aria-labels ("1 day streak", "Interface language", "Switch to dark mode") stay English, so screen readers pronounce English with a Spanish voice. The switcher button warns about this, but the html lang is still wrong. | probe: lang=es, h1 "Mythos Atlas", /deities h1 "Deities" | src/components/i18n/LanguageSwitcher.tsx / IntlProvider.tsx
- P2 | /atlas | 1440 | Tradition labels on the 3D map are nearly invisible or overlap each other: AKAN is dark-on-dark, AZTEC dark red, POLYNESIAN/YORUBA/HINDU overlap nodes, CANAANITE clipped by the star cluster. Canvas has no focusable controls or list alternative (zero buttons in main), so keyboard users cannot use it. | shots/walkthrough/int-atlas-canvas.png, atlas-1440.png | src/components/atlas (three.js scene labels)
- P2 | /family-tree | 1440 | Initial view is not framed: left 40% of canvas empty, Gaia off-screen; user must press "Fit". Figures with two parents (Zeus, Hera, Poseidon...) appear as duplicate nodes. | shots/walkthrough/int-ft-fresh.png; 20 node buttons for 34 figures incl. 2x "Zeus." | family-tree component layout
- P2 | /stories/interactive/thor-jotunheim | 1440 | "Endings Discovered" tracker shows 1/4 but renders 8 chips (one labelled, 7 "???"); labelled chip text truncated ("Through cunning disguise..."). Possibly counts nodes not endings (not confirmed). | shots/walkthrough/int-story-thor-jotunheim-end.png | stories/interactive component
- P2 | /stories/interactive/* | both | Breadcrumb is a title-cased slug: "Judgment Of Paris", "Thor Jotunheim" while H1 is "The Judgment of Paris" / "Thor's Journey to Jotunheim". | int-story-*-end.png | Breadcrumbs.tsx
- P2 | menu links | 1440 | Keyboard focus ring on mega-menu links is `outline: auto 1px` at 50% alpha, weak against the 2px solid gold on the triggers and header links. | Tab walk computed styles | header/mega-menu classes
- P2 | /divine-domains, /domains, /gods-of, /games, /paths, /stories/ragnarok/cinematic, /pantheons/greek/creatures, /pantheons/greek/goddesses, /pantheons/slavic/creatures | both | Next warns the LCP image lacks `loading="eager"`/priority (e.g. /deities/ra.jpg, /journeys/gilgamesh-quest.png). Perf only. | sweep console warnings | above-the-fold `<Image>` usage
- P2 | /knowledge-graph, /deities/rhea, /deities/persephone | both | React Flow warning: new nodeTypes/edgeTypes object each render. Perf only. | sweep console | family-tree/graph components
- P2 | /atlas, /oracle | both | `THREE.Clock` deprecation warning (use THREE.Timer). | sweep console | three.js scene code
- P2 | cmd+K palette | 1440 | Query "zeus" returns 15 results incl. weak matches (Aegis, Pandora's Box, Cyclops "Sicily and Volcanic Islands"); one run pressed Enter and did not navigate (not reproduced on 2 later runs, likely dev-compile latency). | int-palette-zeus.png | GlobalSearch.tsx
- P2 | one-off | 1440 | One React hydration-mismatch console error ("A tree hydrated but some attributes of the server rendered HTML didn't match") appeared during the bookmark flow; could not reproduce in 3 follow-up passes over /bookmarks, /stories, /creatures, /compare. Unconfirmed. | e.js run log

## Verified working (no defect)

- Sweep: 89 routes x 2 viewports = 178 loads. 0 horizontal overflow, 0 broken images, 0 page errors, 0 5xx, exactly one H1 on every 200 page. Only 404s are the intentional bad routes plus `/pantheons/slavic/goddesses` (route exists but returns 404; not linked from the Slavic page, so unreachable by UI).
- Header: skip link first in tab order, focus visible on all header items, Tab opens menus and moves into their links; mobile drawer opens, links navigate and close it, Esc closes it, 23 links all valid.
- Theme toggle: switches and persists across reload. Language switcher: opens, ES applies to nav labels, persists via `locale` cookie.
- Cmd+K palette: opens, searches, Arrow/Enter and click navigate to /deities/zeus, empty state shown, Esc closes and restores focus.
- Bookmarks: add on deity and story, count and entries on /bookmarks, remove works.
- Quizzes: knowledge (5 q) completes with score; personality (8 q) gives a result; relationships (10 q) completes. Interactive stories (judgment-of-paris, thor-jotunheim) reach endings via choices.
- Index filters: /deities search, tradition, domain, gender, sort, table view all work and sync to URL; empty state with "Clear filters" works. /stories and /creatures search work.
- Newsletter (footer): empty and invalid email blocked by native validation, valid email without consent shows "Enter a valid email address and tick the box to subscribe."; no request sent. No real address submitted.
- 404 page: on-brand, has search and links, title "Page Not Found". Back/forward and scroll restoration on /deities work.
- Links: 132 unique hrefs checked from /, /deities/zeus, /deities/rhea; all internal links 200 (only external metmuseum.org returned 429 to a bot request, not a site defect).

## Not covered / could not test

- No `/search` page exists in the app router (only /api/search), so "search page" was not tested; only the palette.
- Knowledge-graph node click (React Flow DOM click produced no visible panel; inconclusive), timeline interaction beyond control inventory, cosmology (no controls), map pan/click on /locations leaflet map, games/memory play-through, oracle chat (needs provider keys), achievements/progress/review state flows, cinematic story pages beyond load.
- Quiz result share slugs (/quiz/result/[result]) were not reached (personality result renders inline at /quiz/personality).
- Language switcher fr/de not exercised; only ES.
- Contrast was judged visually on screenshots (no automated axe run); dark mode only visually spot-checked (home, zeus, quiz, story), no issues obvious at that scale.
- Dev server was restarted by something outside this run mid-sweep (ERR_CONNECTION_REFUSED, then a `ChunkLoadError` overlay on /family-tree in Next dev). 25 failed loads were re-run and passed; those errors are environment, not app defects.
- Dev mode only: no production build performance, caching or CSP behavior checked.

## Status (2026-10-16)

P1, all fixed:

- Compare parallels label: fixed in `ComparisonCard.tsx` (own pantheon name only for the card's own tradition).
- Mega menu click-after-hover: fixed in `mega-menu.tsx`, with a regression test (`mega-menu.test.tsx`).
- Deity filters: gender adds Androgynous and Not specified; domain list scoped to the chosen tradition and to domains shared by 2 or more deities.
- Bookmarks: creatures, artifacts and locations are now bookmarkable, and /bookmarks groups them (verified in browser).

P2:

- Interface language: fixed. `<html lang>` stays `en` (pages are prerendered English); every translated string carries `lang={locale}`: the `Translated` helper, primary and mobile nav, header search and bookmarks controls, compare and compare-myths UI strings, and the Oracle (chat dialog and /oracle). E2E asserts the contract on /quiz.
- /atlas labels: tinted toward parchment so dark tradition colours read on the night sky. Fixed. Keyboard alternative for the canvas is still the tradition grid below the map; not changed.
- /family-tree framing: a tall tree now opens on its root, vertically centred. Fixed. Duplicate "Also under X" nodes are deliberate, labelled and dashed; left as is.
- Thor tracker 1/4 vs 8: data bug. `totalEndings` was stale for thor-jotunheim (4, really 8) and orpheus-underworld (4, really 3). Corrected, with a test over every story.
- Breadcrumbs: pages can name the last crumb (`currentLabel`); detail pages and interactive stories use their title. Slug fallback keeps minor words lower case ("Judgment of Paris").
- Mega-menu link focus ring: now a 2px gold outline. Fixed.
- LCP eager loading: `EntityCard` maps `priority` to `loading="eager"` + `fetchPriority="high"` (Next 16 deprecates `priority`); first cards on /paths and pantheon subpages, and /games cards, load eagerly. Re-swept: no LCP warnings on the listed pages.
- React Flow nodeTypes: both `nodeTypes` objects are already module-level constants; the warning is a dev HMR artifact. No change.
- THREE.Clock: internal to R3F/drei, not app code. No change.
- cmd+K "zeus": Zeus ranks first; the rest are entities connected to Zeus. Not a defect.
- Hydration mismatch: still not reproduced.
- E2E flake (search palette, catalog-recovery): retry loop re-clicked a palette that was still opening and toggled it shut. Now retries only while closed.
