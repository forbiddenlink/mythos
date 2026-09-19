# Mythos Atlas: QA, research, and next development priorities

Reviewed September 18, 2026, against commit `3b3dc9b` **and the existing uncommitted work**. This is a local development review, not a claim about what is deployed.

## Recommendation

The strongest next phase is to make the existing encyclopedia reliably connected, precisely sourced, and easier to study. The project already has considerable breadth. More features or more generated prose will not, by themselves, improve its quality.

Continue the recent source-library and hero work. Put editorial provenance and source-specific variants ahead of another large content expansion. For visual work, concentrate on reading hierarchy, useful first screens, consistent art treatment, and accessible interactions. The existing classical atlas direction is coherent; it does not need a new visual identity.

Visual design and editorial rewrite decisions belong with Claude under the project's routing instructions. This pass implements verified functional and technical presentation fixes and records the remaining work as concrete recommendations.

## What has changed recently

The September 14–17 history shows:

- Expanded deity biographies, cult notes, relationships, and branching stories.
- Denser creature, artifact, and location entries.
- Completed location/journey visuals, guided tours, and multi-category quizzes.
- Primary-source context after quiz answers.
- Improved creature, artifact, story, and journey illustrations.
- Fixed command-palette navigation, family-tree transitions, daily review, and optional semantic-search timeouts.
- Reduced some client JSON loading and established a supported Node runtime in CI.

The working tree already contained a substantial next batch before this review: heroes, source-detail pages, source-character links, expanded data, and request-body hardening. Those changes were preserved. Do not attribute that whole working-tree diff to this QA pass.

## Current catalog evidence

Computed from the local JSON, not from old README claims:

| Content        | Records |
| -------------- | ------: |
| Pantheons      |      13 |
| Deities        |     190 |
| Heroes         |      20 |
| Stories        |      98 |
| Creatures      |      56 |
| Artifacts      |      52 |
| Locations      |     121 |
| Source records |      34 |
| Journeys       |       6 |
| Tours          |       5 |

Coverage has different meanings and should not be collapsed into a single quality score:

- All 190 deities and all 20 heroes have `primarySources` entries. This establishes that text is present, not that quotations or claims have been verified.
- 94 of 98 stories have `citationSources`.
- 11 deity entries and 11 story entries have structured `primarySourceExcerpts`; those contain 35 excerpts in total. All 35 recorded `sourceId` values resolve.
- 12 stories have variants recorded.
- 21 of 34 source records have character links; 25 have external URLs.
- Source-character links reach 58 deities and 17 heroes.
- 15 of 20 heroes are Greek. The remaining five span Roman, Norse, Celtic, and Hindu traditions. Expansion should follow an explicit coverage plan.
- All 543 local image references across the seven checked content collections resolve to files. File existence does not establish visual suitability, attribution, or historical accuracy.

## Implemented in this pass

1. **Heroes and sources now participate in shared search.** Added result groups, destinations, and Oracle grounding snippets. The optional semantic embedding corpus was not regenerated; these additions work through lexical retrieval.
2. **Search groups respect relevance.** A large group of incidental matches no longer outranks a smaller group containing the exact name. Verified the Iliad source result and keyboard navigation in the browser.
3. **Hero bookmarks work.** Added a real hero bookmark type and saved-item rendering. Existing `story` bookmarks with `hero-` IDs migrate on load while preserving timestamps. Verified saving Heracles and opening its saved link.
4. **Removed nested interactive controls.** Corrected links wrapping buttons on home, journey, comparison, collection, interactive-story, and cinematic-story pages. Story and bookmark cards have separate link and bookmark targets. Verified bookmarking a story does not navigate away and its link still works.
5. **Fixed system-theme switching.** The toggle now uses the resolved theme; a dark system preference correctly offers light mode. Added regression coverage and checked light mode in the browser.
6. **Prevented duplicate source-count inflation.** Multiple excerpts with the same normalized source label count once. This is label deduplication, not proof of historical independence or correctness.
7. **Fixed verified narrow-screen overflow.** Compact header spacing, wrapping breadcrumbs/pagination/game statistics, bounded hero content, explicit single-column grids, constrained journey/family-tree controls, wrapping endpoint text, and clipped cinematic background transforms. Long page titles can wrap rather than be cut off.
8. **Fixed notification overflow.** Achievement entry/exit no longer translates beyond the horizontal viewport; reduced-motion users avoid that transition.
9. **Improved semantics.** Corrected the language trigger's popup type to match its menu and changed the second story-timeline heading to level two.
10. **Added regression checks.** Covered hero/source search and grounding, legacy hero bookmarks, system theme switching, duplicate sources, and catalog image existence.

## QA evidence and limits

- Baseline: 72 test files, 889 tests passing.
- After functional fixes: 74 test files, 904 tests passing.
- Final TypeScript check, production build, and all 904 unit tests passed. Type checking was repeated after build generation completed to avoid racing Next's generated type files.
- Lint: no errors; an existing unused `Badge` import warning remains in `sources/SourcesPageClient.tsx`. It was not introduced by this pass.
- Browser smoke sweep: 60 distinct URLs covering every page route pattern, including representative dynamic detail pages.
- Inspected the broad mobile set at 390px and repeated the hydrated sweep at 320px; also checked seven representative desktop routes at 1440px and eight narrow-phone routes in light mode.
- Final 320px sweep found no nested `a/button` controls or missing `alt` attributes on any of the 60 URLs. It found no document overflow on the 59 non-redirect URLs. `/domains` produced a development React performance-measure error during redirect; a separate production-mode check confirmed successful navigation to `/divine-domains`, no console errors, and no overflow after hydration.
- Explicit flow checks: source search with Enter, hero saving and saved-link resolution, independent story bookmarking, story navigation, and theme switching.

This is not WCAG certification, an exhaustive screen-reader audit, verification of every mythological claim, or a production performance benchmark. The sweep checks initial hydrated states, not every menu/quiz/graph state. Blank-alt decorative images may be correct; image semantics still require human review. The pre-existing full Playwright/axe suite was not run in this pass. Production field metrics and real-user retention were not accessed. No billed Oracle evaluation was run.

A numeric overall design or accessibility score would imply more evidence than this pass collected. The actionable findings below are more useful than an invented score.

## Remaining priorities

### P1 — Establish trustworthy quotation and variant handling

**Evidence:** [hero quote rendering](/Volumes/LizsDisk/mythos/apps/web/src/app/heroes/[slug]/HeroPageClient.tsx:366), [deity quote rendering](/Volumes/LizsDisk/mythos/apps/web/src/app/deities/[slug]/DeityPageClient.tsx:544), and [Heracles data](/Volumes/LizsDisk/mythos/apps/web/src/data/heroes.json:180).

Generic `primarySources.text` entries are wrapped in quotation marks without requiring translator, edition, or an exact passage. Treat these as unverified quotations until checked. A named ancient work alone is insufficient to distinguish a direct translation from an editorial summary.

Heracles is a specific editorial test case: the biography combines the wife's death with the pre-labors madness sequence. The cited Pseudo-Apollodorus account at 2.4.12 describes the children's deaths; 2.6.1 has Megara survive and later be given to Iolaus. The entry should identify which tradition it follows instead of silently combining incompatible details. [Primary text in Theoi's Library](https://www.theoi.com/Text/Apollodorus2.html).

Recommended content contract: work ID, author attribution, passage locator, edition/translator, language, exact-quote versus paraphrase status, source URL, and editorial verification status. Distinguish composition date, surviving manuscript date, and the date of the translated edition. Start with the 20 heroes and the most visited deity/story entries, then expand by coverage rather than word count.

Use stable passage identifiers where available. CTS identifies textual works, versions, and passages; Scaife supplies a reference model for reading original text alongside translations. These tools support citation, not automatic historical verification. [CTS specification](https://cite-architecture.github.io/ctsurn_spec/), [Scaife quick-start guide](https://sites.tufts.edu/perseusupdates/scaife-viewer-quick-start-guide-2-0/).

**Acceptance:** every displayed direct quote has a verifiable translation and passage; every editorial summary is identified as such; conflicting traditions are explicitly attributed. Do not fill missing quotations with generated text.

### P1 — Separate analogy, identification, and historical influence

**Evidence:** [homepage comparison strip](/Volumes/LizsDisk/mythos/apps/web/src/components/mythology/SyncretismStrip.tsx:20) presents “Same gods, different names” and equality signs across mixed kinds of parallels.

A shared domain, a Roman identification, and documented cultural transmission are different claims. Give relationships explicit types and evidence. Preserve regional/period differences. A reader should be able to tell whether a connection means similar function, a source's identification, shared linguistic history, or documented syncretism.

Include present-day religious contexts where appropriate. Several covered traditions are living traditions; the product's global “ancient” framing should not erase that. UNESCO's definition emphasizes traditions transmitted and continually recreated by communities. [UNESCO: intangible cultural heritage](https://ich.unesco.org/en/what-is-intangible-heritage-00003).

**Acceptance:** each cross-tradition connection states its relationship type, support, and limitations. Claude should revise the presentation/copy around that model.

### P1 — Replace automatic scholarly-confidence claims with honest evidence labels

**Evidence:** [attestation calculation](/Volumes/LizsDisk/mythos/apps/web/src/lib/attestation.ts:85), [displayed confidence claim](/Volumes/LizsDisk/mythos/apps/web/src/components/deities/SourceProvenance.tsx:54).

Deduplication now prevents counting identical source labels twice, but two named sources are not automatically independent. Different labels can describe the same work. The earliest dated item in this catalog is also not necessarily the earliest known historical attestation.

Prefer a factual catalog-coverage label until reviewed source independence and claim-level evidence exist. Treat approximate centuries/eras as ranges or clearly marked approximations, not precise event dates.

**Acceptance:** labels describe what the recorded evidence establishes; counts do not imply expert verification. Add canonical source IDs before attempting stronger confidence models.

### P1 — Make task pages start with the task

**Evidence:** [review page introduction](/Volumes/LizsDisk/mythos/apps/web/src/app/review/page.tsx:23), [story timeline wrapper](/Volumes/LizsDisk/mythos/apps/web/src/app/story-timeline/page.tsx:20).

The desktop review screenshot begins with several explanatory paragraphs before the review title and action. Story Timeline has two substantial introductory sections. These are verified hierarchy problems for returning learners, even though the pages render correctly.

For Claude's layout pass: place the due-card count and review action first; retain explanations as optional help. Use the same principle for quiz settings, comparison tools, and maps. Aim for one title, one concise orientation, and the principal task available without an introductory essay.

**Acceptance:** a returning visitor can begin review, compare entries, or select a quiz immediately on a phone; explanations remain available without blocking the task.

### P2 — Continue visual refinement within the existing design system

The observed desktop/mobile pages already share recognizable typography, a restrained gold/parchment palette, and illustrated subject pages. Preserve those strengths.

Concrete design work for Claude:

- Reduce oversized empty hero areas on source/reference and utility pages; reserve cinematic treatment for narrative and promotional pages.
- Standardize title, metadata, source, and action placement across deity, hero, story, creature, and artifact templates.
- Give generated illustrations, symbolic plates, modern reconstructions, and historical objects distinct captions. An illustration should not imply archaeological evidence.
- The Heracles plate is also enlarged as a blurred background, making embedded plate lettering visible as decoration. Use an intentional crop or a separate backdrop rather than accidentally enlarging labels.
- Reconcile the design-system index's allowed glass/gradient utilities with `.impeccable.md`'s restraint rules. Avoid repeated boxes and decorative badges where typography and spacing would suffice.
- Check both themes, 320/390/768/1440px, long names, long translations, empty states, loading, missing images, and 200% text zoom.
- Keep source excerpts and reading text selectable and readable; prioritize line length and contrast over animation.

**Acceptance:** screenshot review of representative templates in both themes; no clipping at narrow widths; visible keyboard focus; coherent art crops; measured contrast. Suggested sequence: `/arrange`, `/normalize`, then `/polish` with Claude.

### P2 — Finish manual accessibility and interaction QA

The atlas and knowledge graph already contain text/list alternatives; extend and test those instead of duplicating them. Verify keyboard order, focus recovery, menu arrow-key behavior, quiz feedback, map controls, and reduced motion in a real screen reader. The cinematic route's fixed navigation and duplicate top-level headings deserve a dedicated review.

Use WCAG 2.2 AA accurately: 24×24 CSS pixels is the minimum target-size criterion with exceptions; 44×44 is the enhanced AAA criterion and a useful comfort target. Focus Appearance 2.4.13 is AAA, while Focus Not Obscured 2.4.11 is AA. Automated axe checks cannot establish full conformance. [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).

**Acceptance:** keyboard-only and screen-reader completion of browse → detail → source, search → result, save → saved item, quiz → feedback, and review → completion; no trapped/hidden focus or essential drag-only actions.

### P2 — Keep content growth from increasing every visitor's download

**Evidence:** [global search's data imports](/Volumes/LizsDisk/mythos/apps/web/src/lib/search.ts:6), [hero client imports](/Volumes/LizsDisk/mythos/apps/web/src/app/heroes/[slug]/HeroPageClient.tsx:16), and [client source lookup](/Volumes/LizsDisk/mythos/apps/web/src/lib/appears-in.ts:1).

The homepage has already moved some JSON processing to the server. Continue that approach: send the selected hero, derived references, and small related-item summaries rather than importing full catalogs into each client feature. Generate a compact search projection or use the existing search endpoint with cancellation and failure handling. Do not introduce a database solely to solve bundle size.

Measure before setting byte budgets. Target field Core Web Vitals at the 75th percentile: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. Separate mobile/desktop and template types. Development timings and a successful build are not performance measurements. [Web Vitals guidance](https://web.dev/articles/vitals).

**Acceptance:** recorded production bundle/asset baseline, no regression on representative templates, and verified field or appropriately labeled lab measurements.

### P2 — Make learning quality measurable

Daily review, quizzes, journeys, and study guides already exist. Connect them deliberately: read an attributed version, answer a question with explanatory/source-linked feedback, and review it later. Include questions about differences between accounts, not only names/domains. Do not grade a contested tradition as universally wrong.

Research supports practice testing and distributed practice, but streaks and XP are not evidence of knowledge retention. [Dunlosky et al.](https://www.psychologicalscience.org/journals/pspi/1529100612453266/), [retrieval-practice research](https://pubmed.ncbi.nlm.nih.gov/21252317/).

The local review scheduler describes itself as simplified FSRS but implements ease-factor/interval rules. Either describe it precisely or adopt a maintained scheduler after validating migration needs; changing algorithms is lower priority than trustworthy questions and progress preservation. [Current scheduler](/Volumes/LizsDisk/mythos/apps/web/src/lib/spaced-repetition.ts:7).

**Acceptance:** measure voluntary return to review, completion, and delayed recall where appropriate; preserve consent and local-first use. Provide progress export/import before requiring accounts or cross-device sync.

### Development-only observation — redirect instrumentation

`/domains` redirects to `/divine-domains`. During the browser sweep, development React performance instrumentation reported a negative timestamp for `DomainsRedirect`; the redirect also caused a transient overflow result. A separate local production server successfully completed the redirect, produced no console errors, and had no overflow after hydration. No application or framework-version change was made for this development-only observation.

### P3 — Keep operational guidance aligned with current code

- The repository instructions still mention Node 20+, while the current package engine is ≥22.22.2.
- PWA is disabled in current Next configuration despite older descriptions of active offline caching.
- The design-system index names an older Next version than the package currently uses.
- Existing unit-test warnings mention Node localStorage configuration and a nested mock that future Vitest releases may reject.
- Keep API/Oracle/catalog type definitions aligned as heroes and sources become first-class entities. Avoid growing another independent type list with every feature.

These are maintenance tasks, not reasons for a framework rewrite.

## Suggested next delivery sequence

| Order | Deliverable                                 | Done when                                                                                                              |
| ----- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1     | Editorial provenance pilot                  | 20 heroes and selected flagship entries have verified attribution, passage links, and explicit quote/paraphrase status |
| 2     | Source-specific variants and comparisons    | No unsupported equality/independence labels; source disagreements are visible                                          |
| 3     | Reading and task hierarchy pass with Claude | Review/quiz/comparison actions are immediate; detail/source templates follow one coherent hierarchy                    |
| 4     | Accessibility release check                 | Manual flows and automated scans pass across representative templates, themes, and viewport sizes                      |
| 5     | Compact client data and performance budgets | Before/after measurements show the catalog can grow without proportional client payload growth                         |
| 6     | Learning continuity                         | Source-linked practice, dependable saves, export/import, and an evidence-based retention measurement plan              |

Defer a new backend, mandatory accounts, additional 3D features, a new design system, and bulk AI-authored entries unless a measured user need justifies them. The next improvement should make the current experience more trustworthy or easier to use.

## Further research: connected features worth building

This follow-up extends the roadmap; the features below are proposals, not claims of implementation. Three possible directions were considered: more encyclopedia breadth, more standalone games/spectacle, or deeper connections between the existing entries and their evidence. Recommend the third first. Existing tours, journeys, quizzes, Anki/PDF exports, review, narration, comparison, and graphs already cover much of the obvious feature list.

### 1. Follow a myth through its sources — first product priority

Build on the source-detail pages and the 12 stories that already record variants. A reader should be able to move from a story to an attributed passage, see what another account changes, and return without losing their reading position. Start with three reviewed cases, not an automated comparison for all 98 stories.

For each account, record the work, passage, translator/edition, approximate composition date, and whether displayed text is a quotation or paraphrase. Compare specific claims, such as sequence of events or parentage. Do not label one version as the canonical truth or infer that a later text is directly dependent on an earlier one. Heracles is a useful first editorial case because the current biography already needs its traditions disentangled.

Acceptance: both sides link to identifiable passages; the differences are explicitly attributed; no generated quotations; keyboard and narrow-screen reading order is clear; links preserve the selected account. Scaife's citable passages and edition organization are useful precedents, not a reason to build a full language-learning reader. [Perseus project updates](https://sites.tufts.edu/perseusupdates/), [Scaife ATLAS](https://atlas.perseus.tufts.edu/).

### 2. Myth in material culture — strongest new visual feature

Add a curated object section to selected existing entries: one to three relevant vases, reliefs, manuscripts, sculptures, or later artworks. Each needs an institution record, accession/object ID, object date, medium, creator/culture where known, image rights, and an editorial explanation of the connection. Keep the object's date separate from the date of the myth or text.

Pilot six objects across three existing stories before expanding. The Met supplies object metadata and public-domain images through its API; check the individual record's rights and image availability. Store reviewed selections locally so reading does not depend on a live museum search. Do not automatically turn keyword matches into historical claims. [The Met API](https://metmuseum.github.io/), [Open Access policy](https://www.metmuseum.org/hubs/open-access).

A concrete research lead is the Met's **Reproduction of Herakles Killing the Hydra of Lerna**. It is explicitly a reproduction: that must remain visible, rather than presenting it as the ancient original. The record is a candidate for editorial review, not an approved asset imported in this pass. [Museum record](https://www.metmuseum.org/art/collection/search/625055).

Acceptance: every displayed image has checked reuse status and institutional attribution; readers can distinguish ancient objects, later reception, modern reproductions, and commissioned site illustration; images have meaningful captions and suitable crops; no invented inscriptions. Claude should define the final editorial layout using the existing design system.

### 3. A reading collection that survives return visits

Extend the current bookmarks and story progress instead of creating another dashboard. Add saved sources, a clear next unread item in a selected learning path, and a versioned local backup/restore for bookmarks and learning progress. Keep accounts optional. The current source library is searchable but is not yet part of the bookmark model.

Acceptance: a saved source opens the exact work after reload; backup round-trips without losing timestamps or scheduling state; malformed imports leave existing data untouched; duplicate imports are predictable; the interface states that local-only data belongs to this browser. Review all existing storage providers before defining the backup format. This is a product recommendation based on the existing architecture, not a claim that research proves this particular interface improves retention.

### 4. An atlas that distinguishes evidence from interpretation

Before adding more animated routes, add location certainty and coordinate provenance to the existing atlas/journeys. Distinguish an identified historical place, a proposed identification, an approximate region, and a mythical location with no secure geographic identification. A line on the map should not imply an archaeologically established itinerary.

Pleiades explicitly distinguishes representative points and places without locatable coordinates. Use stable gazetteer identifiers for reviewed real places where applicable; do not use a gazetteer match to validate a mythic event. [Pleiades representative-point guidance](https://pleiades.stoa.org/help/representative-points).

Acceptance: every new coordinate has a source and location status; uncertainty is understandable without relying only on color; mythical locations can appear in the list without a fabricated precise pin; route legends explain illustrative geometry. Existing journey coordinates require review before changing their labels wholesale.

### 5. Expand coverage through small, reviewed reading paths

The hero catalog is 15/20 Greek, and four story records currently lack `citationSources`: `anansi-bought-stories`, `oduduwa-creation-earth`, `first-twins-ibeji`, and `house-of-bats`. These are editorial research targets, not invitations to invent references or copy Greek structures into other traditions.

Choose one underrepresented tradition at a time and complete a connected set: introductory context, a short reading path, linked figures, source-specific stories, source notes, and respectful present-day context where relevant. Count verified connections and coverage of reader questions rather than paragraphs. For Mesopotamian research, Oxford's ETCSL provides Sumerian compositions, translations, and bibliography; its funding ended in 2006, so use it as an established corpus, not a continuously updated authority. Oracc offers another specialist corpus discovery route. Check each project's reuse terms before reproducing translations. [ETCSL](https://etcsl.orinst.ox.ac.uk/), [Oracc search documentation](https://oracc.museum.upenn.edu/doc/search/searchingcorpora/).

Acceptance: each new path has reviewed sources and all internal links resolve; it identifies the particular textual, regional, or oral tradition; editorial review records uncertainties; there is no unsupported promise of exhaustive coverage.

### 6. Make corrections part of the editorial workflow

Provide a lightweight correction path carrying the entry ID, section, and optional supporting reference. Initially this can point to an existing project issue workflow; do not build a public comment system, moderation service, or new backend merely to collect corrections. Only connect it to a confirmed destination. Show meaningful revision dates only when content changes, not on every build.

Acceptance: a report identifies the exact entry without requiring personal details; user-supplied text is treated as untrusted; submitting a suggestion does not silently publish it; verified corrections are traceable. This is a proposed workflow, not an external service configured during this review.

### Professional presentation criteria for the next design pass

Preserve the classical atlas identity. Specify page families—discovery, reading, task, and comparison—so each has a purposeful first screen instead of repeating the same large hero and stacked cards. A study session should begin with its action; a source should begin with work identity, edition context, and where to read; an illustrated story should leave room for readable prose. Use stable text measures, deliberate image crops, consistent captions, restrained metadata, and purposeful motion. Source quotations, editorial narrative, reconstructed imagery, and archaeological evidence must look distinguishable without competing styles.

Review representative long/short records in both themes at narrow and desktop widths, with keyboard navigation, reduced motion, loading/empty/error states, and real text rather than placeholders. The earlier route sweep establishes basic rendering, not completion of this design work. Under the project's routing rules, Claude should make the final visual and editorial decisions from this brief.

### Follow-up implementation and validation

Fixed source-page association logic in `src/lib/source-matching.ts` and its source-detail caller. An explicit work ID now takes precedence over text matching, including unknown IDs; legacy labels require a complete title at word boundaries, while allowing omission of parenthetical catalog translations. Generic fragments no longer attach citations to longer unrelated titles. This corrects a demonstrated logic weakness; it is not evidence that every current historical attribution has been checked.

Seven focused regression tests cover conflicting IDs, unknown IDs, translated labels, legacy passage labels, parenthetical titles, partial-word matches, and empty labels. Focused tests and lint passed; TypeScript passed during the follow-up. Earlier full-build and 904-test results above describe the preceding pass. No museum assets were imported, no new external service was configured, and no deployment was made.

## Approved implementation batch — September 18 follow-through

The later instruction approved implementation. This section supersedes proposal-only status for the items explicitly completed below; it does not mark the entire long-term roadmap finished.

### Completed

- Source bookmarks now appear in a Reading List on `/bookmarks`; the source detail uses the existing save control. Source and story IDs remain separate. Browser verification saved Iliad and confirmed its reading-list link.
- `/progress` now offers a versioned learning backup and a staged restore. The export is limited to four documented learning keys: bookmarks, reading position, discovery/achievement progress, and review scheduling. Import validates the format/version, nested fields, numeric bounds, real calendar dates, and a 1 MB limit. A preview precedes the explicit replacement action. Unrelated browser settings are excluded. Write failures attempt rollback, with distinct reporting if rollback itself fails. Tests cover source bookmarks, invalid input, storage failures, and repeated restore. Browser verification confirmed malformed imports show an error rather than restoring. Successful restore was verified at the storage-function level, not through a browser reload flow.
- Fixed learning paths that could never complete: their quiz had no matching stored result and was permanently incomplete. Required reading steps now determine completion; the general quiz is explicitly optional recall practice. No fictional path-scoped quiz completion is inferred.
- Daily Review begins with the review interface; its former introductory essay is replaced by optional help below. Story Timeline has one introduction and one main heading.
- SourceProvenance and the attestation timeline now describe catalog coverage and oldest recorded dates, not independent corroboration or a proven first historical attestation. The sources index no longer makes an unsupported first-appearance claim.
- Homepage parallel groups no longer equate the figures or imply documented historical transmission from shared roles alone.
- Journey maps now explain that pins and lines illustrate a narrative rather than prove precise historical routes. Per-location provenance and certainty remain future editorial work.
- Heracles' biography distinguishes the incompatible chronology in Pseudo-Apollodorus and Euripides. Research: [Library 2](https://www.theoi.com/Text/Apollodorus2.html), [CHS: Euripides' Herakles](https://www-current.chs.harvard.edu/primary-source/euripides-herakles/). No fabricated quotation was added.
- Perseus/Medusa has two source-specific passage links with translator attribution. The Hesiod summary no longer turns the absence of a transformation account into an explicit denial. The main narrative no longer calls Medusa a priestess or says Athena aided Perseus because she hated Medusa. [Hesiod 270–286](https://www.theoi.com/Text/HesiodTheogony.html), [Ovid 4.790–803, Kline translation](https://www.poetryintranslation.com/PITBR/Latin/Metamorph4.php). The variants disclosure has a unique accessible ID and hidden content cannot receive keyboard focus.
- Story narratives are labeled editorial retellings; unlocated `keyExcerpts` are presented as story highlights rather than quotation-shaped source passages.
- Added a three-object museum-reference pilot for Heracles, Perseus, and the Trojan War, with institution, accession number, date, medium, context, and museum links. This is a linked reading section, not the proposed six-object image gallery. It distinguishes ancient objects from Canova's later interpretation. [Herakles bronze](https://www.metmuseum.org/art/collection/search/246432), [Trojan War relief](https://www.metmuseum.org/art/collection/search/251473), [Canova's Perseus](https://www.metmuseum.org/art/collection/search/204758).
- Removed a misleading story-page feature that selected a generic 3D apple or shield from title keywords and called it a museum artifact. The standalone artifact functionality remains available.
- Added a footer correction link that opens a draft GitHub issue with the current path and fields for supporting evidence. It does not submit an issue or transmit a report automatically.

### Content research outcomes and limits

Added a secondary scholarly reference for the Oduduwa narrative and a translated primary-work reference for the Bat House account. These references are not a claim that all wording and quotations elsewhere in the catalog are verified. Supporting research: [Agai article, DOI 10.4102/hts.v76i4.6013](https://scielo.org.za/pdf/hts/v76n4/20.pdf), [Christenson's Popol Vuh translation](https://www.famsi.org/research/vanstone/2012/PopolVuhBrief.pdf).

Anansi remains an exact-account research gap. An initially suggested Haley citation was removed from `citationSources` after checking that it describes a three-task version while the current narrative contains four tasks. The page instead includes a transparent related-retelling note. [University of Illinois description of Haley](https://omeka-s.library.illinois.edu/s/rbml/page/a-story-a-story).

The Ibeji origin episode also remains unverified. Research found material about the historical cult of twins, but not support for the page's specific origin narrative; adding that as if it supported the episode would be misleading. [Chappel, Yoruba cult of twins](https://www.cambridge.org/core/journals/africa/article/abs/the-yoruba-cult-of-twins-in-historical-perspective/2968CCB9FE10E727C26998C4297468BA). Both these entries need editorial resolution before their sourcing should be described as complete.

Still outstanding: verify the wider quote corpus, extend reviewed variant coverage beyond this pilot, build the museum image gallery with image-level review, review coordinates individually, add explicit learning-path enrollment if user evidence justifies it, broaden traditions through reviewed reading paths, and complete the deeper visual direction with Claude. No broad content generation or invented evidence was used to fill these gaps.

### Final validation for this batch

- 77 test files / 924 tests passed.
- Production build passed; TypeScript passed after build generation.
- Lint: zero errors, one existing unused `Badge` import warning in SourcesPageClient.
- Independent review caught backup validation/count/error-reporting defects; those were fixed and tested before completion.
- Browser checks covered source saving, source passage links, museum links, malformed-backup rejection, and timeline loading.
- Hydrated 320px checks of progress, bookmarks, source detail, story timeline, journey detail, learning paths, and Perseus found one main heading each, no nested links/buttons, and no document overflow. Also inspected mobile Review and desktop Story Timeline visually.
- Full Playwright/axe, exhaustive screen-reader checks, and production field performance were not run. All edits remain local and uncommitted; no deployment or external issue submission occurred.

## Continued evidence and backup QA

This follow-up supersedes the unresolved Anansi and Ibeji status above, without validating the removed Ibeji origin episode.

- Anansi now follows R. S. Rattray's _Akan-Ashanti Folk-Tales_ (1930), tale 17, pp. 54–59. The recorded account supports the four tasks and identifies Aso's role and Ya Nsia's inclusion in Nyame's demand. Invented dialogue and the golden chest were removed. Attribution explains that this is a collector-mediated recorded account, not a universal version. [Text reproduction](https://api.pageplace.de/preview/DT0400.9781107776746_A23755138/preview-9781107776746_A23755138.pdf).
- The unsupported Ibeji origin episode was replaced with a short, attributed account of twin commemoration and a documented sculpture. The existing URL remains usable; the old narrative image is no longer attached. The page explains the correction and limits its claims to the museum interpretation. [Met object 1979.527.22](https://www.metmuseum.org/art/collection/search/314081).
- Structured references can now link directly to HTTP(S) evidence. Anansi, Ibeji, Oduduwa, and Bat House have direct links; shared labels accommodate scholarship and museum interpretation. Long reference text wraps on narrow screens.
- Backup downloads now pass the same validation as imports, preventing an export that cannot be restored. Import reads ignore stale results after a newer selection, show a reading status, and allow canceling a preview. Four interaction tests cover cancellation, stale reads, explicit restore, and invalid export rejection.

Verification: 78 test files / 928 tests passed; production build and TypeScript passed. Both revised story pages were checked hydrated at 320px: one main heading, no nested interactive controls, and no horizontal document overflow. Their direct evidence links rendered correctly. An independent backup review found no actionable issue after these fixes. Successful restore is covered by a component interaction test with a mocked reload; a complete browser reload restore flow remains unverified. The broader editorial, accessibility, and visual-review limits above still apply. Changes remain local and uncommitted.

## Browser regression and reading accessibility follow-through

The initial full Chromium run passed 65 tests, skipped three pre-existing tests, and failed 14. Six failures came from running Oracle tests against an Oracle-disabled build; eight exposed search requests occurring before the lazy search component registered its listeners. The test configuration now builds with the Oracle UI enabled locally as well as in CI. Search intent is retained by the eager application shell while the search bundle loads. Oracle UI testing does not verify live AI responses; local backend credentials were not configured or inspected.

Expanded accessibility checks cover Zeus, Hades, Ibeji, and Iliad source detail at 320px in both light and dark mode, with reduced motion, heading/nesting checks, and a full WCAG A/AA axe scan of main content. This exposed contrast defects absent from the ten existing index-page scans. Fixes use existing theme tokens for source panels, references, relationship labels, and related-deity badges. Family-tree filters retain colored indicators but use readable button text and expose their pressed state. The narration-speed slider now has an accessible name.

The narration estimate previously divided character count by 150 characters per second. It now estimates 150 words per minute and adjusts for playback speed, with regression tests for empty input and invalid rates. It remains an approximation: voice-specific speaking rates vary.

Content inventory: 13 bilingual deity excerpts, 22 bilingual story excerpts, and 201 legacy deity source records. All bilingual entries name translators; one deity excerpt lacks passage numbers. Zeus's first English Theogony excerpt matches the corresponding text in the cited Evelyn-White translation, apart from its ending punctuation; this spot-check is not corpus verification. [Theogony, opening hymn](https://www.theoi.com/Text/HesiodTheogony.html). Deity fallback source notes now disclose missing edition/translator details and omit quotation formatting. The bilingual excerpt corpus and other uses of legacy source records still require textual review.

### Verification of this continuation

- Unit tests: 79 files / 930 tests passed.
- Full Chromium suite after the search fix: 85 passed, three existing skips, two failures on the same recommended-story badge contrast defect. All eight search scenarios and active Oracle UI scenarios passed.
- After correcting that final badge: rebuilt the application and reran all eight narrow reading-page tests; eight passed, with no axe violations in their main content. This completes the active checks across the full run and focused rerun, not a claim that the final full suite ran in a single green execution.
- Production build, TypeScript, and diff checks passed. Full lint had zero errors and the existing unused `Badge` warning in SourcesPageClient; the final badge file passed scoped lint.
- Existing skipped checks: suggested-question input population, Oracle visibility across all pages, and a separate mobile Oracle-button visibility test. Mobile/tablet Oracle dialog tests did run and pass.
- Still not established: site-wide WCAG conformance, screen-reader usability, all browser engines, exhaustive route/theme coverage, production field performance, or full quotation verification. No deployment or commit was made.

## Expanded evidence, museum, and cross-browser pass

This continuation expands the earlier pilot and supersedes its three skipped Oracle checks.

- Reviewed all 35 structured excerpts and added explicit quotation status, verification level, edition, and HTTP(S) evidence links. Quotation styling and original-language switching require verified wording. Source pages now aggregate deity passages as well as story passages. The detailed [excerpt ledger](./2026-09-18-excerpt-verification.md) records corrections and unresolved edition checks. The 201 legacy deity source notes are inventoried and explicitly unverified; they have not all been individually authenticated.
- Expanded museum references from three to six documented objects, with five public-domain images and an intentionally image-free Ibeji entry whose reuse rights were not established. The additions cover Osiris, Ur-Namma's temple foundation figure, and Yoruba twin commemoration. The foundation figure is identified as a ruler and religious context, not a depiction of Inanna's descent.
- Added Inanna: Text and Temple and Ibeji: Objects and Remembrance study routes. They distinguish literary narrative, material evidence, editorial retelling, and a specific documented practice.
- Corrected the Heracles narrative's chronology and added separate Pseudo-Apollodorus and Euripides accounts. Corrected the Perseus Pindar variant to the music/lament account in Pythian 12 instead of an unsupported geographic claim.
- Real-file backup restoration now runs across navigation and page reload while preserving unrelated theme/locale storage. Formerly skipped Oracle suggestion, route-presence, and mobile-button checks now run without live API spending.
- Added opt-in Firefox and WebKit projects. The first complete three-engine run passed 243 of 273 tests; all 30 failures were the same header/footer contrast issue, subsequently corrected.
- Extended the quality sweep across page families, checking page errors, status, heading count, nested controls, overflow, images, and WCAG A/AA axe rules. The 120-case intermediate run had no runtime errors or overflow, but exposed additional contrast defects, duplicate cinematic headings, unnamed mobile controls, and a museum-image delivery failure. These findings drove targeted fixes rather than being counted as a clean result.
- Fixed a reduced-motion home hydration mismatch and deferred optional audio enhancement work until load/idle. The [performance audit](./2026-09-18-performance.md) records asset measurements; it does not establish a production Core Web Vitals or transfer-size improvement.

### Final verification and remaining limits

- Final production build and its TypeScript check passed. Unit suite: 82 files / 939 tests passed. The configured eight-module coverage gate passed (95.73% statements, 87.04% branches, 97.01% functions, 96.4% lines); this is not repository-wide coverage. Full ESLint finished with zero errors and the pre-existing unused `Badge` import warning in SourcesPageClient.
- The expanded 252-case audit covered 63 representative routes at 320px and 1440px in both themes. Every case returned HTTP 200, with no page errors, document overflow, broken images, nested controls, or duplicate rendered main headings. Nine cases exposed shared contrast or animation issues.
- After those fixes, a fresh production build passed 52 focused route/viewport/theme checks with zero axe A/AA violations, runtime errors, layout issues, or broken images. This rechecked every failed page family and added Ra, Amaterasu, the Trojan War museum image, and both new study routes. Mobile title wrapping was also inspected visually.
- Visual review sampled the home, index, reading/source, study, saved-content, quiz, collection, graph/map, review, and artifact families. Automated checks are broader than the visual sample; neither establishes exhaustive screen-reader usability or WCAG conformance.
- The closing 279-test run passed 276 checks; three Firefox setup checks timed out waiting for the full browser load event. Quiz and search setups now wait for DOM readiness and their relevant UI. The complete quiz/search follow-up passed all 48 checks across Chromium, Firefox, and WebKit. Thus the remaining failures were cleared by a focused rerun; this is not a claim of one entirely green 279-test execution. There are no skipped checks.
- Earlier runs also exposed readiness races. The backup picker is now disabled until its client handler is attached, with an SSR regression test; the real file-picker restore flow passed in all three engines on the final build. Streak fixtures are seeded before application initialization, deity title checks select the accessible level-one heading, and discovery waits for completed content and verifies that the selected deity changes.
- Museum images are delivered directly using Next Image's `unoptimized` option because the optimizer rejected a valid museum response. A real-browser check confirms the image loads. A suspected hero-image routing issue disappeared after restarting the stale preview; no speculative proxy change or asset relocation was retained.

Still open: individual edition checks for the 201 legacy source notes and the structured excerpts still marked unverified; more tradition-specific expert review; manual screen-reader testing; production field performance measurements; and a broader visual/copy direction pass with Claude under the repository's routing guidance. Oracle UI tests use intercepted requests; live model responses and production credentials were not verified. No deployment was performed.
