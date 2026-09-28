# Targeted usability review

Date: 2026-09-28. Checkout at start: `d6052b4`.

The existing visual identity is worth preserving. This review recommends two functional corrections, not a new visual system. The authorized second pass implemented these corrections and the demonstrated enlarged-text fixes. See `second-pass.md` for current results; the remainder of this brief records the first-pass context.

## Audience and goals

From the repository's design context: mythology learners, students, self-directed readers, and portfolio visitors. The core journey is to find a figure or story, read its context and sources, follow related entries, and optionally save or practice what was learned. This is repository context, not measured audience research.

## Inventory and constraints

The active pnpm/Turborepo workspace has one Next.js web app, with 66 page templates. Page families include catalogs, entity details, editorial guides, comparison tools, maps/graphs/timeline, reading experiences, quizzes, local learning progress, and information pages. `coverage.md` records every route pattern and representative.

Content comes from static JSON. Bookmarks and progress are browser-local. There are no account roles to audit. Oracle, newsletter, analytics, and support integrations are optional. No submissions, messages, purchases, or deployment changes were made.

Runtime: `.nvmrc` pins Node 22.22.2; the installed runtime used was Node 22.23.1, within the repository's Node >=22.22.2 requirement. pnpm is 10.34.5. Python Playwright was unavailable; the installed Node Playwright package was used. The local dev server required sandbox permission to bind its port.

## Strengths to preserve

Visual judgment, supported by the captured local pages:

- The Cinzel, Crimson Pro, and Source Sans hierarchy suits the scholarly content.
- Gold, midnight, and parchment remain coherent across catalogs, details, tools, and information pages.
- Illustrated catalog cards and the shared detail layout provide recognizable paths into the content.
- Mobile layouts generally reflow cleanly. Broad restyling would replace working decisions without solving the issues below.
- Sources, image disclosures, empty bookmark invitations, and reading routes already exist.

## Verified weaknesses

### W1: Catalog context is lost when returning from an entry

Reproduction: open `/deities`, select Greek, enter Athena, open Athena, then use browser Back. The text field becomes empty, the tradition becomes All traditions, and the directory returns to all 359 deities.

Evidence: `journeys.json`; `shots/current/deities-filtered-mobile.png`. Source: `apps/web/src/app/deities/DeitiesPageClient.tsx:84` initializes the view, filters, and ordering to defaults. `CatalogGallery.tsx:84` has the same local-state pattern. The existing Heroes implementation at `apps/web/src/app/heroes/HeroesPageClient.tsx:48` already reads URL state, but the browser follow-up also lost the Heroes query on Back. Treat it as partial precedent, not a proven fix. Additional affected catalogs are recorded in `final-audit.json`.

Recommended correction: retain the existing appearance and serialize validated catalog state into the URL, following the established project pattern. Back, reload, and shared links should restore the same query, facets, view, sorting, and page where supported. Reset should explicitly clear them. Avoid creating a history entry for every keystroke.

### W2: Empty global search has low-contrast controls and invalid list semantics

Reproduction: open header Search and enter `zzzzzzzz`; wait for the no-results message. The three browse buttons use 12px gold text. The automated checker reports 2.47:1 contrast against the light popover, below its 4.5:1 criterion. It also reports buttons inside a listbox where selectable options are expected. The footer advertises arrow-key navigation, while these fallback actions are ordinary buttons.

Evidence: `journeys.json`; `shots/current/global-search-empty-mobile.png`. Source: `apps/web/src/components/search/GlobalSearch.tsx:348`. The initial test caught a loading state; the final recorded check explicitly waited for no-results content and reproduced both issues.

Recommended correction: reuse ordinary command rows for the existing three destinations, with the existing readable text/selection tokens and at least a 44px row height. Put status text outside the options list. Preserve Escape, focus return, search input, and arrow/Enter navigation. Check the loading state separately so it does not announce a malformed empty list.

## Direction comparison

| Criterion         | A: keep the button cluster                                               | B: reuse command rows (recommended)                                  |
| ----------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Visual scope      | Keep arrangement; enlarge and recolor controls                           | Change only the empty-search body to existing full-width search rows |
| Keyboard behavior | Move buttons outside listbox; use Tab; change helper text for this state | Same arrow/Enter model as successful search results                  |
| Mobile            | Three actions can wrap                                                   | Predictable three-row layout and larger hit areas                    |
| Brand fit         | Existing tokens and fonts                                                | Existing tokens and fonts                                            |
| Tradeoff          | Smallest layout change, but two interaction models                       | Taller empty popover, consistent interaction model                   |
| Implementation    | Separate empty-state control group                                       | Reuse CommandItem and current navigation handlers                    |

W1 has no proposed visual redesign in either direction. Direction B best matches the existing command palette and resolves the observed defects with a small local change. Neither direction needs new dependencies, rewritten navigation, or a new design system.

## Prototype and verification

The isolated files under `prototypes/` reproduce real local markup and embed the existing fonts. Page and artwork styles are retained. The prototype shows a fixed Athena/Greek result and a dedicated empty-search demonstration; it is not a production implementation of catalog persistence or the full search engine. Other catalog controls are static. The top preview explanation is review-only copy.

- `deities.html`: open Athena and use browser Back to demonstrate retained catalog context.
- `athena.html?search=empty`: shared search state over an entity detail page.
- `stories.html?search=empty`: shared search state over another catalog.
- Arrow keys and Enter choose the three existing browse destinations; Escape closes the dialog. No live write operations are connected.
- Tested at 1440×1000, 390×844, and 768×1024; screenshot inspection plus automated dialog checks. Dark mode checked separately. `prototypes/verification.json` records the results.

The preview initially lost font loading across its separate local origin; embedding the existing font files corrected it before final screenshots. Some external image requests prevented network-idle waits; document readiness and explicit control/font readiness were used for the final checks.

## Acceptance criteria after approval

1. A filtered catalog returns to the same context after entry navigation, including a non-first page.
2. Query parameters are validated; defaults, reset, reload, and browser history work predictably.
3. Empty search has readable text, valid options, working pointer/keyboard selection, and reliable focus return.
4. Shared search still handles ordinary results, pending data, and errors.
5. Existing page layouts, artwork, typography, and content remain visually unchanged outside the approved search-state correction.
6. Focused regression tests, relevant lint/type checks, and browser verification pass before implementation is called complete.

## Limits

The audit is on the local checkout, not a verified production-equivalent deployment. Baselines primarily use reduced motion and a clean test browser with optional cookies rejected. Automated checks are not a complete accessibility certification. Paid/provider-backed services and live forms were not exercised. The coverage file distinguishes captured baselines, exercised states, source-only observations, and unresolved checks.
