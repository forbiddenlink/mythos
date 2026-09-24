# Mythos Atlas improvement plan

**Date:** 2026-09-22; updated 2026-09-23  
**Decision:** strengthen trust, reading quality, and product evidence before adding a broad new feature set or bulk content.

## Optional support and cinematic reading — 2026-09-23

Created the user-approved live Stripe support setup under ImKindaGeeky. Product `prod_VJe1ZiWOYTvbLY`, price `price_1UJ0jdA1qZnsNmFKlHc9v4nZ`, and payment link `plink_1UJ0jwA1qZnsNmFKoHnGXJvt`: https://buy.stripe.com/dRmbJ0b641kOblE3xm0Ny01. USD, one-time, customer-chosen amount, $5 preset and $1 minimum; no recurring price. Link and PaymentIntent metadata identify `app=mythos` / `purpose=optional_support`. Hosted Stripe confirmation avoids inferring payment success from a website URL. There is no site entitlement or fulfillment to unlock; transaction records remain in Stripe. No account-wide payment settings were changed.

Added `/support`, footer and About links, sitemap inclusion, and a Stripe processing disclosure in Privacy. The support page explains the work funded, amount choice, optional nature and ImKindaGeeky merchant identity. The live checkout was opened and its title, preset amount and one-time wording checked without entering payment details or submitting a charge. Only the live account is connected; a completed sandbox payment, settlement and refunds were not exercised.

CinematicStory no longer waits for mount or hides reading text behind scroll reveals. Image-only scale motion uses a reduced-motion media query that responds to preference changes, with scoped cleanup instead of killing every ScrollTrigger on the page. Removed the looping decorative arrow and text entrance effects. Two initial no-JavaScript route tests exposed an additional Next.js streaming limitation: the existing stories loading boundary remains visible with scripts disabled. This pass does **not** claim full no-JavaScript route support. Revised checks directly verify real title/scene elements in the server HTML, not text in the React payload; browser checks verify readable content and image animation removal on a live reduced-motion preference change.

Visual inspection also caught the cinematic navigation overlapping the main site header. Both cinematic pages now use a named sticky story-navigation bar below the shared header, with an opaque background. Position checks pass at 320/1440 before and after scrolling.

Validation: eight focused checks (support navigation at 320/1440, existing reduced-motion reading, two server-content checks, live motion preference change, and two cinematic-navigation checks); 24 layout/accessibility cases across support, About, Ragnarök and Titanomachy cinematic pages at 320/768/1440 in both themes. An additional 12 layout cases passed after the cinematic-navigation correction. No detected overflow, broken images, runtime errors or automated accessibility failures. Typecheck, changed-file lint and diff check passed. Independent review found no material issue; the streaming limitation above supersedes its earlier optimistic no-JavaScript wording. [Final review preview](https://mythos-38hkigllf-elizabeth-emersons-projects.vercel.app/support) built successfully and the deployed support page, merchant disclosure and checkout destination were verified in the browser. Production site not promoted.

## Current priorities after open-work review — 2026-09-23 evening

This section is the current work queue. Older sections below preserve historical evidence and may describe work subsequently completed. It supersedes their outstanding-task lists where they conflict.

### Verified repository and open work

- Local main is `ffc4f93`, two commits ahead of the remote main observed through GitHub (`4a2aa6e`). Reading/source fixes and material-color work are committed locally; they are not yet integrated into remote main. Preview deployment and GitHub integration are separate steps.
- [PR 118](https://github.com/forbiddenlink/mythos/pull/118) remains open. Its failed E2E job includes a museum-image URL expectation incompatible with its optimizer change, plus flaky ambiguous All/Shuffle selectors. The SSR structured-data fix is worthwhile. Hidden duplicate link lists should be replaced by usable server-rendered pagination; optimization of external museum images needs an explicit tested delivery policy. Do not merge the entire branch merely because its preview built.
- [PR 117](https://github.com/forbiddenlink/mythos/pull/117) changes a brace-expansion override and the matching lockfile declaration. Its build failed in the Google-font loader, not in an observed brace-expansion regression. Current local code bundles fonts. Refresh this PR against the integrated baseline and rerun CI; the old result does not establish current compatibility.
- One open issue is the dependency dashboard (#104), not a product backlog.
- The pre-existing hook edit and generated next-env change were preserved. Runtime pin is 22.22.2; the installed/current runtime is Node 22.23.1. This pass uses the installed Node 22 explicitly, not Node 24.
- Later Ramayana editions, the hymn and Contendings, and Pluto/Proserpina/Avalokiteshvara corrections are now documented and present. They are no longer untouched tasks. The Valmiki Uttara Kanda remains uncollated; checking selected passages still does not certify whole articles.

### Product direction and alternatives

**Recommend: a curated atlas with playful discovery.** The core experience is choosing an intriguing subject, reading a clear account, examining an object or place, noticing a source difference, and saving something worth returning to. Use existing collections, journeys, comparisons and bookmarks before inventing another feature family.

A games-first product could emphasize daily puzzles and repeat visits, but risks making the encyclopedia secondary and demands an ongoing editorial puzzle supply. A research-library product could prioritize exhaustive bibliographic tools, but risks raising the entry barrier for casual readers. Keep scholarly depth available and play optional within the curated-atlas direction.

Research informs this recommendation; it does not prove Mythos reader demand. [V&A trails](https://www.vam.ac.uk/info/va-trails) demonstrate bounded thematic exploration through selected objects. [The Met's Show and Tell](https://www.metmuseum.org/exhibitions/listings/2016/show-and-tell) distinguishes storytelling through sequences, a single evocative scene, and contextual interpretation. [NN/g's progressive disclosure guidance](https://www.nngroup.com/articles/progressive-disclosure/) supports deferring secondary complexity; [recognition and recall](https://www.nngroup.com/articles/recognition-and-recall/) supports visible, understandable choices. Adapt these principles rather than copying museum layouts.

### Fresh visual findings

Current local desktop home and Collections were inspected in the browser. The home opening has a coherent typographic hierarchy, atmospheric image and two clear primary routes. Preserve that foundation. Its later six-path section repeats choices already offered in the hero, featured pantheons and navigation. Collections has a large icon/title treatment and a second explanatory panel; at the inspected 1264×712 desktop viewport no collection choices appear above the fold. The next visual work should improve access to material, not add decoration. These observations are heuristic, not participant findings or a full responsive audit.

### Implementation sequence and completion gates

| Order | Work package                   | Concrete change                                                                                                                                                                                              | Completion evidence                                                                                                                                                      |
| ----- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | Integrate open work safely     | Consolidate the two local commits and review PR118 against them; retain source corrections; resolve image policy and replace hidden links with real pagination. Refresh PR117 afterward.                     | Current-head CI passes; image loads and JSON-LD verified in raw HTML; all hero/location pages reachable through visible links with JS disabled; review integration diff. |
| 2     | Collections and home hierarchy | Put collection choices immediately after one concise introduction; use an image-led featured theme plus restrained editorial list. Replace repeated home onboarding with a selected story/object connection. | First meaningful choice visible at common desktop and phone sizes; long titles, no-image entries, keyboard, zoom and both themes work; before/after full-page captures.  |
| 3     | One exemplary exploration path | Improve an existing Persephone or Osiris path from story to checked source, object and comparison, ending with one relevant continuation. No new generic carousel.                                           | Reader can find story, source edition and next entry without searching several panels; zero unresolved links; image provenance and each featured claim checked.          |
| 4     | Useful return visit            | Make existing saved items and reading continuation easy to find. Test existing review/quiz flows before expanding them.                                                                                      | Save, reload, resume and remove work; graceful empty/corrupt-storage states; no account or notification pressure.                                                        |
| 5     | Performance                    | Profile home, story, collections and the heaviest map on a controlled production build. Remove measured transfer/render bottlenecks.                                                                         | Same device/network/profile across repeated before/after runs; report median and variability, not one score; distinguish lab from field data.                            |
| 6     | Editorial coverage             | Maintain claim/edition/object review status; finish uncollated material and missing comparison-target decisions.                                                                                             | Named edition, precise locator and scoped confidence; no invented article just to satisfy a link check; living traditions framed accurately.                             |

### Visual standard for implementation

Keep the existing font/token system. Give each page a clear purpose: an editorial opening for a story, compact orientation for a catalog, and an immediate useful control for a tool. Prefer specific images and meaningful captions over repeated icon badges, framed title plates and uniform card grids. Select image crops by subject; do not crop inscriptions or museum objects merely to fill a card. Keep historical objects and editorial illustrations visibly distinguishable. Motion should explain a transition or focus attention, respect reduced motion, and never postpone reading. “Fun” should come from discovering a connection, trying a consequential story choice, or answering a sourced question—not additional confetti, badges or constant prompts.

### Whole-site release checklist

Each implementation batch must identify affected template families and cover: narrow/medium/wide screens; light/dark themes; keyboard and focus order; reduced motion; long/empty/error states; image loading and credits; internal links and fragments; source claims and cultural framing; metadata/structured data; consent and saved-state behavior; loading cost; and deployment rollback. Full screen-reader assessment, real-device performance, translations, live operational alerts and optional Rust-backend checks remain separate work. Do not turn an automated passing count into a claim that all categories are certified.

The existing reader-test kit remains unrun because no participants are available. A useful initial target is five readers completing: choose a myth, explain one source difference, identify an artwork's status, save a page, and return to it. Record completion, hesitation and wrong turns. No retention claim should be made from internal walkthroughs; custom event endpoints currently do not provide a persisted research dataset.

### Collections design implementation — 2026-09-23

The collection index now has a compact editorial opening, a featured Rulers of the Dead route illustrated by the existing Met Osiris object (545802), full museum attribution, and a numbered list preserving all 12 collection destinations. The first collection link is visible at 320×800 and works by keyboard. Homepage collections now follow pantheons; the redundant six-path FeaturesGrid is no longer rendered. Collection detail pages replace three repeated explanatory paragraphs with brief guidance that preserves differences among traditions. The shared comparison wheel now says “figures across traditions” rather than asserting a common archetype.

Verification: 18 layout cases for home, Collections and its featured detail, followed by 12 cases for the revised detail and shared deity-page labels, then six more for the final index heading width; no detected overflow, broken images, runtime errors or automated accessibility violations. Fifteen browser regressions passed, including destination completeness, mobile keyboard entry, counts, homepage scrolling and reduced motion. Changed-file lint and type checking passed; local production build passed. The first protected preview build also passed with the final detail copy. The [final review preview](https://mythos-clmjyns01-elizabeth-emersons-projects.vercel.app/collections) also built successfully and was visually checked with the museum image loaded. It includes the final index heading-width refinement. Production was not promoted. Desktop/mobile and light/dark Collections screenshots were inspected; the featured route was followed successfully. Independent focused review found no material issue. These are scoped checks, not a whole-site certification or reader validation.

Existing return-visit verification also passed: nine browser checks for saves, reloads, progress, review entry and backup restoration; 71 targeted unit checks covering saved-state providers, bookmark controls and backup handling, including malformed storage. This is functional evidence, not retention evidence.

Still open: PR reconciliation and visible server-rendered catalog pagination; the complete exemplary story-to-source-to-object path; measured production performance; remaining edition collation; real-reader evidence. The index redesign is not completion of all six work packages above.

### Work continued during this pass

Carried forward the core structured-data rendering fix from PR118 into the current workspace, without its image-policy or hidden-link changes. The shared helper now emits JSON-LD in server HTML and escapes less-than signs. Review exposed duplicate collection schemas in five parent layouts; the schemas now belong to their listing pages, including Locations outside its Suspense boundary. Two helper regressions pass, and one HTTP test checks seven routes for unique script IDs and correctly scoped collection data. Type checking, changed-file lint, independent review and the production build pass. This is a technical correction with no visual redesign in this pass. The plan above is ready to guide subsequent implementation; it is not a claim those changes are already shipped.

## Goal

Make Mythos Atlas feel like a distinctive, carefully edited atlas: useful to a curious reader, credible enough to cite and return to, and visually deliberate rather than generically "mythology themed." The next releases should improve the quality of the experience end-to-end, not merely increase the number of routes or cards.

The governing standard is a clear authored point of view: each page earns its visual treatment, every factual claim can be traced to an appropriate source, and interaction helps exploration or close reading. A generated image, ornate surface, quiz, or AI answer is never a substitute for those things.

## Pluto and Proserpina — 2026-09-23

No separate Roman deity articles. Pluto and Proserpina stay alternate names of Hades and Persephone, so search still finds those pages. A cross-pantheon parallel that only matches the same entry no longer renders as a Roman link back to that Greek page. The notes name Ovid's telling, the story The Rape of Proserpina, and say it is not the Homeric Hymn. The knowledge-graph caption no longer writes Hades = Pluto = Osiris.

Avalokiteshvara is an alternate name of Guanyin, not a Hindu deity. The parallel that filed that name under the Hindu pantheon was removed. The Guanyin article still gives the name and the Indian Buddhist origin.

## Later Ramayana editions — 2026-09-23

The three later columns now name the English editions used for this pass.

Kamban is cited from V. S. Mudaliar's 1970 condensed English version, which is still in copyright, so the column names the book and does not link a full text. The old cell said Ravana lifts the earth Sita stands on. Mudaliar's Aranya Kandam says he remembers a curse, digs out her hut, and carries her inside it so that he never touches her. Sita later tells Hanuman the same thing. The golden deer, the ashoka grove, Ravana's death, and the fire-god returning her unburnt are in that condensation. Its six kandams end at the coronation. This pass does not decide whether a separate Tamil Uttara Kandam exists.

The Adhyatma Ramayana follows Lala Baij Nath's 1912 translation in the Sacred Books of the Hindus, linked from its Internet Archive record. Aranya Kanda, chapter VII, verses 1–4: Rama tells Sita to leave a shadow and live in the fire for a year. Yuddha Kanda, chapter XI, verses 69–75: the arrow tears out Ravana's heart. Chapter XIII, verses 19–21: the fire returns the Sita entrusted to it, and the illusory Sita disappears. Uttara Kanda, chapter IV, verses 55–59: Lakshmana leaves her near Valmiki's ashram.

Tulsidas follows F. S. Growse's 1883 translation. In the Forest book, doha 19, Sita enters the fire and leaves an image; doha 22 is the golden deer; doha 24 seats that Sita in Ravana's chariot. In The Beautiful, after doha 7, Hanuman finds her in the ashoka grove. In Lanka, chhand 29, thirty-one shafts dry the nectar in Ravana's navel and strike off his heads and arms, and the earth reels as he falls. Dohas 105–106 send Sita into the fire; her shadow and the stain of disgrace are consumed, and Fire leads her back to Rama. Growse's introduction says the Sequel omits Sita's exile and substitutes the story of Kakabhushundi.

## Comparison locators follow-up — 2026-09-23

The Great Hymn and the Contendings columns on the Osiris matrix now name the translations they were checked against. The hymn follows Miriam Lichtheim, _Ancient Egyptian Literature_, volume 2 (1976), for Louvre C 286. Her introduction says Egyptian texts rarely write the slaying; the hymn itself starts that episode with Isis already searching, shading Osiris with her plumage, raising his inertness, and receiving the seed. The Ennead then gives Horus the kingship in the hall of Geb. Those claims sit between Lichtheim's line markers 10 and 20, plus the hymn's opening praise of Osiris as lord of eternity. No public passage URL was added, because the checked edition is not a free-standing public-domain page.

The Contendings follow Alan H. Gardiner's 1931 Chester Beatty translation, linked from the library's own PDF. The papyrus does not narrate the murder, the method, the body, Isis's search, or Horus's conception. It opens with the child already claiming the office. Osiris answers from the West, and his second letter threatens to send messengers for the hearts of wrongdoers (Gardiner, recto 14–15). The Ennead says the case has lasted eighty years, and the close sets the White Crown on Horus. The older "bawdy contests" wording was removed because this pass did not re-read those episodes line by line.

The Valmiki column now cites Ralph T. H. Griffith's verse translation (1870–1874) and links its public index. Checked cantos: the golden deer (Book III, XLIII), the abduction into the car (III, XLIX), Hanuman in the ashoka grove (V, XIV–XV), Ravana's death (VI, CX), and the restoration sequence (VI, CXVII–CXX). The banishment remains present for the Valmiki tradition, with an explicit limit: Griffith's Books I–VI end at the consecration (VI, CXXX) and do not contain it. The Uttara Kanda was not collated. Kamban, the Adhyatma Ramayana, and Tulsidas still have no canto-level edition check.

## Comparison source editions follow-up — 2026-09-23

[Updated review preview](https://mythos-8gzdgwvwp-elizabeth-emersons-projects.vercel.app/stories/osiris-myth) is ready; production build passed and visible edition attribution was verified in the signed-in browser. Production is unchanged.

The seven comparison matrices now display their stored work descriptions, so edition and translator details are visible where recorded. This does not imply that every source has an edition-level citation yet.

Two Osiris columns were checked against [Diodorus, Library 1.21, Oldfather translation](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Diodorus_Siculus/1A%2A.html#21) and [Plutarch, On Isis and Osiris §§13–19, Babbitt translation](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris%2A/A.html#13). Both passage anchors resolve in the source HTML. Every cell in those two columns now has a scoped explanation and locator. Diodorus leaves the murder method unspecified; his cited chapter does not describe underworld kingship. Plutarch distinguishes the posthumous Harpocrates from the Horus who fights Typhon. Underworld kingship is also absent from the cited Plutarch sections, although Osiris returns from the other world. These are claims about the selected passages, not the whole works or Egyptian religion.

Six matrix data tests and a new mobile reading test passed. All seven matrix pages passed 42 development-server layout checks (320/768/1440px, both themes), with no detected overflow, image failures, runtime errors or automated accessibility violations. Changed-file lint and type checking passed. The rendered Osiris table was visually inspected. Independent review caught the Plutarch rule cell still marked as a variant; corrected to absent before deployment. Further precise checking remains for the hymn, Contendings and Ramayana sources.

## Museum artwork and discovery follow-up — 2026-09-23

The user approved the Vercel upload. The artwork/discovery preview, including the short-screen navigation fix, is ready at https://mythos-a7i36kqr8-elizabeth-emersons-projects.vercel.app. It was opened and its museum attribution verified in the signed-in browser. Production remains unchanged.

Heracles and Theseus now have explicitly curated museum artwork: four object associations across two hero entries. The introductory figure shows the complete object with date, medium, museum accession link and rights; the remaining object appears in a gallery without repeating the introductory image. Other heroes retain their existing editorial illustrations. Hero associations are explicit rather than inferred from a shared story, preventing unrelated figures from receiving the same portrait.

The [V&A collections](https://www.vam.ac.uk/collections) and [trails](https://www.vam.ac.uk/info/va-trails) informed the emphasis on objects, provenance and thematic entry points. Met records checked for this pass include [Herakles statuette](https://www.metmuseum.org/art/collection/search/246432), [Theseus eye-cup](https://www.metmuseum.org/art/collection/search/248177), and [Theseus skyphos](https://www.metmuseum.org/art/collection/search/244858). The skyphos description now respects the museum's distinction between separate protagonists and a continuous narrative.

Collections and journeys lead desktop and mobile discovery menus. Desktop descriptions explain the tools in plain language, remove internal “ICP” terminology and wrap rather than truncate. A browser test follows the collections route on desktop and journeys on mobile.

Validation: 16 museum data/helper tests, 14 reading browser tests, one desktop/mobile navigation test, and 18 layout cases across three heroes, three widths and both themes passed. No automated accessibility-rule failures, overflow, broken images or runtime errors in those 18 cases. Typecheck, changed-file lint and production build passed; independent review found no actionable regression. Desktop Heracles, its expanded discovery menu and mobile Theseus screenshots were inspected. These counts are scoped checks, not manual WCAG certification or reader research.

A follow-up reproduced an off-screen final Discover link at 1280×400, including after keyboard focus (viewport ratio 0). The dropdown now scrolls within the available height. The regression and desktop/mobile navigation checks pass on the permitted localhost development origin, with clean changed-file lint, type checking and independent review. The Vercel production build also passed.

Next priorities: curate remaining artwork only where identification and rights support it; continue precise source locators for the outstanding comparison matrices. Do not expand the catalog faster than its editorial review.

## Whole-site link and detail-layout follow-up — 2026-09-23

Current [review preview](https://mythos-fhii0nusp-elizabeth-emersons-projects.vercel.app) is ready and was opened in the signed-in browser. Production remains unchanged.

Fresh crawl: 720 sitemap routes and all discovered internal destinations, totaling 843 pages. No HTTP failures, missing title/description metadata, or missing server-rendered fragment targets. This is automated coverage, not a claim that every paragraph was manually read. The 138 public source URLs in catalog URL fields were also requested: 39 returned 200/206, while 99 Met website URLs returned 429 and remain inconclusive for website availability. No 404/410 responses occurred. The earlier museum API checks do not remove this limitation.

The unchanged baseline passed 528 layout/accessibility cases: 88 routes, three widths and two themes. After rebuilding, the changed pages passed 36 fresh cases with no overflow, broken images, runtime errors or automated accessibility-rule violations. Fourteen Chromium reading-flow regressions passed, including the catalog label and living-tradition wording checks. Targeted data/matrix tests passed (138 distinct checks across the initial run and corrected title assertion rerun). Type checking, changed-file lint and the local production build passed. Mobile Heracles/Oshun and desktop Heracles screenshots were visually inspected. These automated counts are not a complete manual WCAG audit or a factual certification.

The five detail templates now use each editorial image once, as a foreground figure. Removing the enlarged duplicate background avoids blurred lettering and unnecessary full-width image variants across 502 deity, hero, creature, artifact and location records. The existing atmospheric colors remain. Hero headings no longer append “tradition” to a collection name already ending in “Pantheon.” Deity collection labels use the catalog's authored names, and worship summaries no longer imply that every practice ended in antiquity. Creature related-entry headings use “tradition.”

The Osiris matrix's Pyramid Texts column now identifies selected utterances and Mercer’s 1952 translation, with paragraph locators for every positive claim. The former “never narrated” wording overlooked a drowning allusion in PT 364 §615d; the revised cell acknowledges it without turning the ritual text into a continuous murder narrative. Evidence: [PT 355–374](https://archive.sacred-texts.com/egy/pyt/pyt19.htm), [PT 532](https://sacred-texts.com/egy/pyt/pyt28.htm), and the [edition index](https://archive.sacred-texts.com/egy/pyt/index.htm). Other Osiris sources and the Ramayana matrix still require their own precise citation review.

### Design critique of the inspected reading experience

Heuristic judgments below are editorial assessments, not measured reader outcomes or a whole-site certification. The design still has recognizable template remnants: repeated ornate title plates and a dense feature/navigation inventory. Removing blurry duplicate artwork is a concrete improvement, not a claim that the visual identity is finished.

| Heuristic                      | Score / 4 | Assessment                                                                           |
| ------------------------------ | --------- | ------------------------------------------------------------------------------------ |
| System status                  | 3         | Save state and reading position are communicated.                                    |
| Match with reader expectations | 2         | Cultural framing improved; mixed article/entity structured data still merits review. |
| User control                   | 3         | Direct reading, back links and optional reading modes remain available.              |
| Consistency                    | 3         | Shared source notes and detail navigation provide predictable reading.               |
| Error prevention               | 3         | Broken internal destinations were not found; saved-data validation exists.           |
| Recognition                    | 3         | About and source links are visible within the article.                               |
| Efficiency                     | 3         | Search and direct section links support repeated use.                                |
| Visual restraint               | 3         | Duplicate background imagery removed; title-plate artwork still needs curation.      |
| Error recovery                 | 3         | Existing empty and error states provide return paths.                                |
| Help and orientation           | 2         | Broad navigation still offers many competing discovery tools.                        |
| Total                          | 28 / 40   | Useful baseline; not finished or reader-validated.                                   |

Cognitive-load checklist: two concerns remain—large navigation groups and more than four visible choices at several discovery points. Grouping, reading hierarchy, section links and optional modes help. Treat this as a moderate heuristic concern, not proof of abandonment.

For a first-time reader, the choice between atlas, locations, knowledge graph, family tree and multiple comparison tools needs clearer task-based guidance. For a student checking evidence, exact passage locators remain more valuable than another decorative panel; only the inspected source claims are checked. These are simulated walkthrough perspectives, not participant findings.

Next design priorities: curate meaningful artwork instead of manufacturing more ornate placeholders; test navigation labels with readers when available; complete the remaining matrix citation work. No new feature is justified merely by the number of existing routes. A browser audit resume now requires both a matching base URL and explicit build identity to avoid reusing stale green results.

## Source and interaction release — 2026-09-23

This section supersedes the earlier excerpt counts below. All **40 primary-source excerpt records** now have checked English transcriptions, translator credits and locators. The remaining 22 intermediate records were replaced with passages checked against the named English editions; their original-language strings were removed, not certified. This is excerpt verification, not verification of every article. The Kukulkan entry explicitly identifies its Popol Vuh passage as a K’iche’ comparison about Gucumatz rather than a direct Yucatec attestation.

[Review preview](https://mythos-c2oqu5lnr-elizabeth-emersons-projects.vercel.app) is ready; production is unchanged. Local and hosted builds passed. The full unit run passed 1,029 tests; the final content/source subset passed 140 tests after the excerpt replacements. Fifty-six targeted browser checks passed across reading, comparisons, discovery and interaction suites, including reruns after responsive selector corrections. These are separate from the earlier full-site checks below. Deployment protection remains enabled; the signed-in browser opens the preview. Oracle UI was disabled at build time and its server kill switch configured; an unauthenticated HTTP probe stopped at deployment protection rather than exercising the application gate.

The seven version matrices received a bounded review. Corrected the Euripides/Orpheus counterfactual, the missing speaker's name in the Sumerian flood fragment, its sacrifice wording, and the Osiris time span and overbroad claim. Added passage links for the two corrected comparisons. Exact Pyramid Text utterances and edition/canto-level support for the Ramayana matrix still need editorial work; these matrices are not marked fully certified.

Rechecked the nine museum API failures from the earlier pass: all nine now return matching accession numbers and public-domain flags. Combined with the earlier checks, all 98 catalog museum records have identifier/rights checks. This does not certify interpretation, image suitability, or the provenance of generated illustrations.

Interaction fixes: restored native Tab navigation in the network family tree; cancelled stale memory-game timers; preserved the map viewport when filters change; replaced overlapping mobile comparison medallions with readable links; validated saved leaderboard, bookmarks and reading progress. Map recommendations now say “in this tradition,” avoiding an unsupported place-specific association. Three comparisons now link to existing hero articles in both prose and the comparison visualization.

### Content queue after this release

There are 19 comparison references to 18 figures without dedicated catalog articles. They remain readable text rather than fabricated links. The first editorial decision is whether each needs an article, an alias, or a qualified comparison:

- Roman identities/relationships: Pluto and Proserpina — resolve their relationship to existing Hades/Persephone coverage before creating duplicate entries.
- Potential focused articles: Helios, Selene, Skadi, Tethys, Asclepius, Longwang, Plutus, Eos. Asclepius is referenced twice.
- Source and cultural framing first: Avalokiteshvara, Kartikeya, Purusha, Aruru, Castor and Pollux, the Ashvins, Ganga and Usha. In particular, Avalokiteshvara must not be classified as Hindu merely because of an Indian origin.

New content should begin with one complete editorial packet, including evidence, distinctions from existing entries, pronunciation and image provenance. No bulk entries were added during this pass. The unsupported shared-origin suggestion in the Ame-no-Uzume/Usha comparison was removed.

### Reader evidence

The owner has no participants currently available. The [reader test kit](2026-09-23-reader-test-kit.md) is prepared but has not been run. Recruitment, subject-specialist review, production field performance and real reader feedback remain separate evidence needs; automated QA cannot stand in for them.

## Remaining detail templates and source credibility — 2026-09-23 follow-up

Implemented across the shared templates for **27 heroes, 63 creatures, 52 artifacts and 127 locations**. The pages now offer direct About / Source notes navigation, introductions before supporting details on mobile, and explicit editorial illustration captions. Prose no longer sits inside colored-border cards. Creature danger numbers are labeled as catalog ratings. Location decorative backdrops no longer duplicate the title for screen readers, image sizing is explicit, and long related-place labels can wrap.

Legacy `{text, source, date}` records have no passage verification metadata. A shared Source notes component now retains bibliographic references and catalog dates while withholding unchecked wording on these four templates and the deity template. This removes their misleading presentation as direct quotations. The two Akan figure records also contained unsupported worship claims and an internal drafting instruction; those worship blocks were removed pending evidence.

The five previously unverified excerpt slots now contain **different, checked English passages**. This does not validate the discarded original wording or original-language strings. Current totals: **18 verified English excerpts, 22 source-and-locator verified, zero not-verified excerpt records**. The 22 intermediate records are not being promoted to fully verified translations.

| Entry       | Replacement and evidence                                                                                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ra          | [Budge, Hymn to Ra, Papyrus of Nekht](https://sourcebooks.web.fordham.edu/ancient/ra-ani.asp), Sheet 21 opening sentence.                                                                                            |
| Anubis      | [Budge, note to Plates XXXIII–XXXIV](https://sacred-texts.com/book/the-book-of-the-dead/shell/plates-xxxiii-and-xxxiv), opening clause of the Nebseni papyrus quotation associated with Chapter 151.                 |
| Osiris      | [Budge, Legends of the Gods](https://www.gutenberg.org/cache/epub/9411/pg9411.html), quotation of the Pyramid Texts citing Mer-en-Ra line 336 / Pepi II line 862; Budge's omission of the king's names is disclosed. |
| Ramayana    | [Griffith, Book VI, Canto CX](https://sacred-texts.com/hin/rama/ry481.htm), six lines beginning “He laid it on the twisted cord”; preserves the edition's canto numbering.                                           |
| Mahabharata | [Ganguli, Book 6, Section XXI](https://sacred-texts.com/hin/m06/m06021.htm), sentence from Arjuna's reply to Yudhishthira; replaces the unsupported Udyoga Parva attribution.                                        |

All five have named translators, locators, external reading links, and explicit English-only verification notes. No unchecked Sanskrit or Egyptian transcription is retained in these slots. Historic translations are not presented as modern critical editions. Independent source review approved the bounded claims.

The stable `/pantheons/african` collection now identifies itself as **African Traditions**, not an exclusively Yoruba pantheon. Its overview distinguishes Yoruba and Akan traditions, identifies the scope of the browsing collection, and cites UNESCO, the Met and Rattray. Anansi and Nyame remain identified as Akan. A shared starting date is no longer asserted. The location collection filter uses the broader label, and the timeline labels the undated collection after dated entries instead of placing it at year zero. This is an honest umbrella collection, not a completed per-tradition taxonomy/filter migration.

PDF exports now follow the same source policy as the pages: reference names and catalog dates remain, but unchecked quotation text is omitted. A regression inspects the generated PDF. Internal drafting instructions were also removed from 19 other figure, artifact and place records. Tests now allow absent worship notes instead of pressuring every figure into an unsupported cult-history template; all present notes still undergo validation. These removals do not certify the surrounding prose.

Validation: production build and typecheck passed; 1,010 unit tests passed across 97 files, followed by 30 passing data regressions after strengthening the editorial guard. Lint has zero errors and one pre-existing unused-import warning. There are **387 unique passing browser checks across the full run and targeted reruns**, not one uninterrupted clean run. The initial 384-check run had 51 failures: 48 hardcoded-port test failures, one facts-filter loading race, and two Firefox navigation timeouts. The test configuration and loading assertion were corrected, and all failed cases passed their reruns; three additional editorial checks also passed. Mocked Oracle tests made no paid live calls.

The merged responsive/accessibility evidence covers **114 passing combinations across 19 routes, two themes and three widths**, with no detected overflow, broken images, page errors or axe violations. Six initial image cases required restoring the prior related-image size selection; this is not a claim to have fixed the image optimizer globally. Detailed results and remaining release limits are recorded in the QA results. Nothing has been committed or deployed.

## Quotation verification — 2026-09-23 follow-up

Four previously unverified excerpt records now contain English passages checked against named online transcriptions. The original unverified Greek/Old Norse strings were removed, not silently certified. An independent source review confirmed the corrected wording, locators and bounded edition notes.

| Entry  | Checked passage                                                                          | Scope of correction                                                                                                                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cronus | [Evelyn-White, Theogony 173–175](https://www.theoi.com/Text/HesiodTheogony.html)         | Replaced mismatched wording, including the incorrect speaker pronoun, with the linked English transcription.                                                                                            |
| Gaia   | [Evelyn-White, Theogony 163–166](https://www.theoi.com/Text/HesiodTheogony.html)         | Replaced the unsupported quotation with Earth's actual speech in the same episode. This does not validate the discarded wording.                                                                        |
| Hecate | [Evelyn-White, passage beginning at 410](https://www.theoi.com/Text/HesiodTheogony.html) | Replaced the compressed/mismatched wording with the first two English sentences; locator describes that exact selection.                                                                                |
| Ymir   | [Bellows, Grimnismol stanza 40](https://sacred-texts.com/neu/poe/poe06.htm)              | Replaced the mismatched translation with Bellows's English stanza; line-break and caesura-bar normalization is explicitly disclosed. [Archive attribution](https://sacred-texts.com/neu/poe/index.htm). |

Osiris's source URL incorrectly referred to OIP 124. The [official ISAC catalog](https://isac.uchicago.edu/research/publications/oriental-institute-publications-oip) identifies that volume as a Tell es-Sweyhat excavation report. The link now identifies [Allen's 2005 publisher record](https://cart.sbl-site.org/books/061523P), with an explicit note that this is bibliographic evidence only. The stored passage, locator and Egyptian text remain unverified and withheld.

Excerpt counts at this earlier checkpoint: **13 verified, 22 source-and-locator verified, 5 unverified**. Verification here concerns the displayed English text in the cited transcription, not original-language collation, every claim in the article, or an independent assessment of manuscript variants.

At that checkpoint, the unresolved records were Ra and Anubis (exact attributed translation/edition), Osiris (passage/locator and Egyptian transcription), and the Ramayana and Mahabharata story excerpts (wording, locator and attribution). They were withheld at that checkpoint; their replacements and the African collection correction are documented in the later follow-up above.

Production build, scoped lint and 27 relevant unit tests passed. All 18 reading/source checks passed in Chromium, Firefox and WebKit, including corrected passages on both figure/source routes and continued withholding for Ra/Book of the Dead. Mobile excerpt presentation was inspected. All 48 responsive/accessibility combinations passed (eight routes × two themes × three widths), with no detected overflow, broken images, page errors or axe violations. Results are retained in the QA file. Nothing was committed or deployed.

## First-visit learning paths — 2026-09-23 follow-up

Bookmarks, Review and Progress now have compact first-visit views instead of leading with decorative headers, zero-value metrics or achievement panels. Bookmarks explains the heart control and links to stories and figures. Review offers Athena as a concrete starting entry, with another-figure browsing alongside it. Progress leads with choosing a tradition or story and keeps the existing backup/restore interface available. All three explain that learning data is stored in the current browser.

The populated views are preserved. Progress only uses the starter view when XP, viewed figures, read stories, explored pantheons, visited places, quiz results and achievements are all empty. Review still generates cards from recorded reading activity and leaves its starter view when cards appear. Independent review found no lost functionality or storage-claim mismatch.

Validation: production build, scoped lint and 28 progress/review provider tests passed. All 18 responsive/accessibility combinations passed (three routes × two themes × three widths), and mobile screenshots were inspected. Fifteen existing cross-browser progress checks passed; the nine new first-visit journeys passed in the final targeted run. Together these cover 24 unique checks across Chromium, Firefox and WebKit. The journeys exercise catalog search, saving Athena, reopening bookmarks after reload, tradition-to-figure navigation, transition to populated progress, and generating/starting a review deck. Backup controls remain present; this pass does not claim a new full backup-import test.

Test development exposed two test assumptions: immediate hard navigation interrupted Firefox route completion, and Athena was not guaranteed on the catalog's first ranked page. Final tests follow actual links and catalog search instead. An initial test-option type error was also corrected before the successful build. Evidence and intermediate outcomes are recorded in the QA file. No deployment or commit was made. Next work is the editorial trust backlog, followed by the remaining detail templates and a reviewed release preview.

## Pantheon orientation and period display — 2026-09-23 follow-up

The shared template for all 16 pantheon pages now opens with the culture, title and, where a separate detailed history exists, the existing catalog introduction in a left-aligned reading hierarchy. Shorter records retain their introduction once in the About section. Direct links lead to history/context, figures and stories; links to the latter two appear only when records exist. This replaces the centered icon-and-divider framing without changing historical content or removing the deeper history and cosmology sections.

A reproduced date-display bug labeled every starting year BCE, including positive Aztec and Slavic years. The template now respects the sign of both dates and retains known starts when the end is null. The metadata is labeled **Catalog period**, and missing end dates are stated explicitly rather than inferred as present-day continuity or replaced with “Ancient times.” These are display corrections, not scholarly verification of the catalog's date ranges. Cultural classification and the dates themselves still require editorial review. Visual review also flagged the existing Aztec summary for its narrow emphasis on sacrifice; its historical framing needs a sourced editorial revision.

The new browser regression failed against the old build because the correct Aztec CE range was absent. It covers Aztec, Slavic and Hindu periods plus all three jump destinations. Production build and scoped lint pass. The first reading run encountered two ambiguous matches outside active main content; the assertions now target main content, and the **final full reading run passed all 15 checks** across Chromium, Firefox and WebKit.

The initial all-pantheon sweep covered 96 combinations (16 routes × two themes × three widths). It found mobile overflow on Aztec in both themes: a long story title and category competed on one row. The shared story-card header now wraps. The same cases reported unloaded portraits; the previously flagged portrait was confirmed loaded in the final browser diagnostic. Five pages without a separate detailed history also received a final adjustment to avoid repeating their introduction. The final 30-case recheck passed; combined with the 66 unchanged cases, all 96 combinations now have passing evidence. This is a merged full sweep and targeted recheck, not one clean final 96-case run. Evidence is recorded in the QA file; earlier failures are retained rather than hidden. Nothing was deployed.

## Deity template reading improvements — 2026-09-23 follow-up

This pass extends the reading standard across the shared template for all 233 deity entries. On the 360px Athena baseline, the heading began at y=534 below a large portrait, while save/share/export controls compressed the heading column. The source section also promised an original-language toggle for passages whose original wording was not verified.

The introduction now precedes the portrait on mobile; desktop retains portrait-left/text-right composition. Utility controls occupy a separate row. The name uses parchment on the dark hero. Direct links lead to the biography and recorded sources; the source link is shown only when catalog records exist, including works derived from the source catalog. Editorial portraits receive an illustration caption, while museum portraits retain their object/institution credit. Source guidance now describes quotations, paraphrases and verification notes without promising an unavailable language control. No new historical claim or excerpt verification is asserted by this template change.

Scoped critique: the classical typography and restrained palette fit the atlas, but the prior portrait-first mobile sequence and compressed heading weakened reading priority. Generic decorative treatment remains a concern in some secondary sections; this pass does not certify the entire template as free of repetitive design. The mobile learner had to scroll before orientation; the source-checking reader had to search down the page and encountered misleading toggle instructions. Both paths now have explicit reading links. Of the eight cognitive-load checklist items, hierarchy and single-task focus were the two clearest failures before this change; secondary-section complexity remains for a later pass.

The following scores are a subjective pre-change heuristic review of this reading path, not measured reader outcomes:

| Heuristic         | Score / 4 | Evidence or limitation                                                |
| ----------------- | --------- | --------------------------------------------------------------------- |
| System status     | 3         | Existing saved-state feedback; not all export states reviewed         |
| Real-world match  | 2         | Source-toggle instructions contradicted some records                  |
| User control      | 3         | Back navigation present; no direct reading links                      |
| Consistency       | 2         | Story/source reading hierarchy had not reached deities                |
| Error prevention  | 3         | Unverified quotes withheld; instructions still misleading             |
| Recognition       | 2         | Biography and sources required discovery by scrolling                 |
| Efficiency        | 2         | Portrait delayed orientation on mobile                                |
| Minimalist design | 2         | Heading competed with utility controls                                |
| Error recovery    | 3         | Existing navigation/not-found paths; not exhaustively evaluated       |
| Help              | 3         | Attribution and source notes present, with inaccurate toggle guidance |
| Total             | 25 / 40   | Focused reading-path review                                           |

Validation: production build and scoped lint pass. All 48 selected browsing/reading checks passed across Chromium, Firefox and WebKit. The strengthened responsive-ordering check then passed in all three engines, including desktop portrait placement. Independent code review found no material defect and requested that desktop assertion. All 48 responsive/axe cases passed (eight deity routes × two themes × three widths), with no detected overflow, broken images or page errors. Mobile, desktop and long-name screenshots were inspected. Detailed results are saved in the QA evidence file. Nothing was deployed. Next template priorities remain pantheon orientation and the empty states in Bookmarks, Review and Progress; taxonomy and quotation verification remain a separate editorial backlog.

## Font delivery and source verification — 2026-09-23 follow-up

Crimson Pro now loads when used rather than preloading both normal and italic faces on every route. On the sampled Persephone page this avoids a 90,988-byte unused italic font transfer. The follow-up mobile laboratory run scored 76, with simulated LCP 6.46 s, blocking time 92 ms and unchanged layout shift (0.001). Those timings overlap the previous results; the demonstrated benefit is the smaller download, not a proven speed increase. The font files, typography and available italic face are unchanged.

Yama's stored English paraphrase did not match the attributed Griffith translation. It has been replaced with a short exact English opening clause from [Rigveda 10.14.2](https://sacred-texts.com/hin/rigveda/rv10014.htm), checked against that transcription. The unchecked Sanskrit transliteration was removed. Metadata explicitly limits verification to the English opening clause; it does not certify the Sanskrit, whole hymn or deity article. An independent source review confirmed the wording and attribution. Across 40 excerpts, the current counts are **9 verified, 22 source-and-locator verified, and 9 unverified**.

The production build and 27 relevant unit checks pass. Six checks across Chromium, Firefox and WebKit confirm the corrected passage on deity/source pages, its attribution and source link, absence of an unsupported original-language toggle, and successful on-demand italic loading. All 36 responsive/accessibility cases passed across six routes, both themes and three widths; mobile source/story screenshots were also inspected. Results are recorded with this follow-up in the QA evidence file. Normal Crimson Pro also no longer preloads, so representative landing-page LCP remains a deployed-preview check. Nothing has been deployed.

## Performance implementation — 2026-09-23

Follow-up to the measured mobile reading problem. The final changes preserve the existing design and content:

- Story pages resolve their story and related figures/places/stories on the server, passing only needed records to the client. Museum objects render on the server through a content slot.
- Global search mounts on first search intent and stays mounted afterward, preserving dialog close behavior. Random discovery loads its deity catalogue on demand and exposes loading/retry states.
- Oracle citation serialization uses a data-free search-result helper; it no longer imports the full search catalogue just to construct or decode a citation.
- Achievement notifications import the supported icons explicitly instead of the entire icon namespace. Existing emoji-to-trophy fallback behavior is preserved.
- The static homepage comparison strip now renders on the server; its linked-mention helper had imported full catalogues into a shared browser chunk.

A tested restriction on logo/breadcrumb/pantheon prefetching provided negligible improvement and was reverted. Normal navigation prefetching is preserved. The public framework contract is documented in [Next Link](https://nextjs.org/docs/app/api-reference/components/link#prefetch).

| Mobile story metric     | Before          | Final two runs                         |
| ----------------------- | --------------- | -------------------------------------- |
| JavaScript transfer     | 1,288,672 bytes | approximately 466,000 bytes (64% less) |
| Performance score       | 70              | 75–77                                  |
| Simulated LCP           | 12.1 s          | 6.6–6.9 s                              |
| Total blocking time     | 260 ms          | 80–110 ms                              |
| Cumulative layout shift | 0.001           | 0.001                                  |
| Automated SEO score     | 100             | 100                                    |

Production build and 1,000 unit tests across 95 files pass. Across Chromium, Firefox and WebKit, 342 checks passed in the full suite; three added museum checks initially used an incorrect fixture, were corrected to use the actually linked Perseus object, and passed on rerun. All 345 unique checks are covered. The final four-route sweep passed all 24 combinations of theme and width, with no detected axe violations, horizontal overflow, visible broken images or page errors. Lint has no errors and the same pre-existing unused-import warning. Detailed results are recorded in the QA evidence file. Independent scoped code review found no material regressions. These remain local laboratory measurements, not production field Core Web Vitals. Lazy search/discovery now pay their data-loading cost when first opened; the catalogues have not been replaced with smaller search indexes yet.

## Expanded audit and implementation — follow-up pass

The first pass was an assessment, not an exhaustive quality certification. This follow-up expands route coverage, exercises three browser engines, checks both themes at three widths, reviews privacy and state recovery, and fixes reproduced defects. It still does not certify every historical claim, every interaction state, or the optional Rust service.

### Scope and evidence

| Area                           | Coverage                                                                           | Result                                                                                                                                                                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route inventory                | 844 enumerated static/detail/reading URLs on a production preview                  | All returned HTTP 200 with titles and descriptions. `/domains` is an intentional streamed redirect to `/divine-domains`; browser verification follows the destination. Response success alone does not certify content correctness.    |
| Catalog integrity              | All 24 JSON datasets parsed; 1,948 selected direct cross-references checked        | No invalid IDs in these checks. Separate comparison-reference analysis found four canonical-name mismatches, fixed, and 22 remaining references requiring editorial/entity-model decisions.                                            |
| Shared catalog schemas         | Seven principal GraphQL catalogs                                                   | Passing schema regressions. Runtime GraphQL fallback to raw invalid data remains a maintenance concern.                                                                                                                                |
| Unit tests and coverage        | 999 tests, 94 files                                                                | Passed. 96.42% lines / 86.74% branches **only for the eight explicitly included coverage modules**, not the whole repo.                                                                                                                |
| Production build               | Next.js webpack production build, including TypeScript                             | Passed with bundled local fonts; no Google Fonts download needed. Sentry upload disabled for local verification.                                                                                                                       |
| Lint                           | Web ESLint                                                                         | Zero errors; one pre-existing unused `Badge` warning in SourcesPageClient.                                                                                                                                                             |
| Dependency advisories          | `pnpm audit --prod`, 708 production dependencies                                   | Zero reported known vulnerabilities at audit time. Not a proof of complete application security.                                                                                                                                       |
| Cross-browser journeys         | Chromium, Firefox, WebKit                                                          | 336/336 full suite passed; six additional Gaia regressions passed after the final badge fix.                                                                                                                                           |
| Automated layout/accessibility | 88 routes × light/dark × 320/768/1440px, reduced motion                            | 528/528 cases passed before the story/source redesign. The affected 13-route follow-up passed 78/78 after contrast and Gaia fixes; all remaining sampled routes retain the earlier baseline.                                           |
| Mobile laboratory performance  | Production Persephone story, Lighthouse 13.5.0 default mobile simulation, two runs | 70/100 performance, 100/100 automated SEO; simulated LCP 12.1s, CLS 0.001. An explicit hero-image priority hint clears the discovery warning but does not improve the overall score. This remains a priority; not a field measurement. |
| Visual inspection              | Contact sheets for 24 representative routes, light desktop and dark mobile         | Reviewed composition and reading priority. This is 48 first-viewport captures, not a manual reading of every page or a full-page visual certification.                                                                                 |
| Privacy and saved state        | Independent review plus targeted regression tests                                  | Fixed quiz consent bypass and malformed progress/review state recovery; validated backup import already enforces schemas and rollback.                                                                                                 |

Final results are recorded in [the QA evidence file](2026-09-22-qa-results.json). The repeatable sweep lives in `apps/web/scripts/quality-sweep.ts`; screenshots and detailed local diagnostics were produced under `/tmp/mythos-verified-sweep` and `/tmp/mythos-contact`.

### Reproduced defects fixed locally

1. **Build reliability:** reproduced the dependency-PR Google font loader failure, including after network access was available. Bundled original Cinzel, Crimson Pro (normal and italic), and Source Sans 3 variable fonts as WOFF2 with their OFL licenses. Centralized declarations preserve the existing font variables and weights. Updated the design contract's font source and framework version.
2. **Consent:** quiz-retention feedback previously sent rating and score telemetry even without opt-in and under Global Privacy Control. Both beacon and fetch now consult the shared consent gate; local feedback saving still works. The no-consent, rejected, and GPC regression cases failed before the fix and pass afterward.
3. **Recoverable saved state:** parseable invalid progress/review values could crash providers. Each field is now validated using the existing backup schemas; valid fields survive, malformed or missing fields use defaults. Both provider regressions failed before the fix and pass afterward. Bookmarks' alleged `{}` crash was rejected during review because its loader already catches that error.
4. **Atlas fallback:** reduced-motion/no-WebGL mode lacked an h1 and used unreadable palette colors for labels. Added the existing title, semantic text colors, and a theme-matched keyboard list overlay. The canvas path still has one h1.
5. **Comparison-table keyboard access and overflow:** Osiris and Inanna story pages overflowed at 320px. Absolutely positioned screen-reader labels escaped the table's unpositioned scroll container. Making the container relative changed Osiris's page width from 656px to 320px in a live diagnostic. The labelled scroll region is now keyboard-focusable with a visible focus ring.
6. **Pantheon badges:** Greek hierarchy labels had a measured light-theme contrast ratio of 1.43:1. They now use the existing `text-gold-text` token.
7. **Reduced-motion reading:** a screenshot exposed the cinematic title remaining at opacity 0 after hydration. The new browser regression reproduced it. Both the title and story plates now explicitly reach their visible state when reduced motion is enabled.
8. **Reader text contrast:** checking one reading per tradition found low-contrast title/ending labels in 13 of 16 palettes. Text now uses parchment on the existing midnight background; decorative tradition colors remain intact.
9. **Canonical comparison links:** three `freya` references now point to `freyja`; one `ouranos` reference points to `uranus`. A regression checks alternate-name references that have a same-tradition canonical entry. No culturally distinct counterpart was silently merged.
10. **Catalog count drift:** cosmology metadata said 13 universes despite 16 records. Metadata and visible count now derive from data; llms.txt avoids a duplicate numeric claim.
11. **Earlier fixes retained:** truthful sitemap dates (omitted until genuine edit metadata exists), ten story featured-figure field corrections, and catalog-schema tests.
12. **Test reliability:** progress persistence now asserts that Athena was actually saved before and after reload. History navigation waits for destination URLs and headings. Narrow-layout assertions wait for font readiness and a settled layout. The audit follows streamed redirects, waits for initial and lazy images, handles hidden/nested-scroll images, detects transparent headings, records exceptions, and exits unsuccessfully when a case fails.

13. **Crawler rendering:** removed the `/_next/` robots exclusion, which blocked JavaScript, stylesheets and optimized images needed to render public pages. The new resource-access regression failed before the correction and passed afterward. This follows [Google’s JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

14. **Long deity labels:** the expanded Gaia sample exposed a worship label expanding a 320px page to 382px. Long festival/worship badges now wrap; new light/dark narrow-width regressions reproduced the old overflow. The content also mixes an oath practice into a festival field and needs editorial classification review.

No deployment or commit was made. Browser testing uses a local production preview; Oracle network calls in the E2E suite are mocked. The live Oracle's paid response path and production observability were not exercised.

### Story/source design implemented locally

The user explicitly authorized visual and copy work here while Claude credits are unavailable. The story template now has a left-aligned reading hierarchy, immediate narrative/source/comparison links, an illustration caption that distinguishes it from catalogued historical objects, and one optional narration interface after the story. The source template uses a single title and compact bibliographic metadata. References use a numbered list; excerpts have clear verification labels and narrow-screen controls. Unverified wording is withheld on both entity and source pages, with citations and pending verification notes retained. No excerpt was promoted to verified. Cronus's source locator was corrected from 174–176 to 173–175, but the stored wording remains unverified.

New browser regressions cover direct reading, optional narration, source navigation and withholding disputed wording. Subsequent browser checks reproduced light-theme contrast issues in editorial/source links and labels; these now use the existing semantic gold text token.

### Visual/editorial work still needed

Updated backlog after the template passes above; completed reading-order and first-visit work is distinguished from remaining research.

- **Mobile reading priority:** story, deity, pantheon, hero, creature, artifact and location templates have received reading-path improvements. Validate these changes with readers and on real devices; automated layout checks do not establish usability.
- **Repeated framing:** Pantheons, Stories, Collections, Games, and Family Tree repeat explanatory panels before useful browsing or interaction. Evaluate each panel by whether a reader needs it at that point; do not mechanically shorten every page.
- **Hierarchy consistency:** story, source, study, visualization, and utility pages use noticeably different title spacing and icon treatments. Establish intentional rules by page purpose and test representative long titles and sparse states.
- **Useful empty states:** Review, Bookmarks and Progress now provide concrete starting paths. Measure whether new readers reach a first meaningful saved/read/reviewed item successfully.
- **Graph/map purpose:** compare Family Tree, Knowledge Graph, and Aether Map using actual reader tasks. Clarify why each exists and whether its mobile/fallback experience earns its navigation placement. Do not add another visualization until that is established.
- **Images and trust:** audit image provenance, historical appropriateness, composition, crops, and captions record by record. Passing image requests and axe cannot establish any of those qualities.

### Content work still needed

- The African umbrella collection now explicitly distinguishes traditions and no longer asserts a shared starting date. A full per-tradition entity model and filter migration remain open; review related records before splitting identifiers.
- The 40 source excerpts now comprise 18 verified English passages and 22 source-and-locator-verified records. Complete English wording and edition checks for those 22; the absence of unverified excerpt slots does not certify all article prose or legacy references.
- Twenty-two comparison references still lack a canonical deity target. Examples include Helios, Selene, Kartikeya, Purusha, Aruru, Ashvins, Ganga, Skadi, Tethys, Asclepius, Longwang, Plutus, Eos, and Usha; others point to heroes or culturally distinct counterparts such as Pluto, Proserpina, and Avalokiteshvara. Classify each as a missing article, a different entity type, a deliberately unlinked comparison, or a mistaken claim. Do not fabricate entries just to make a link check green.
- Review all seven version matrices against their named sources, beginning with the most visited stories. Expand comparative content only after the source and presentation standard is demonstrated on an exemplary reading path.
- The custom analytics ingestion endpoints acknowledge events but do not persist a product-evidence dataset. Avoid treating survey wording or event hooks as proof that user research has happened.

### Initial performance measurement (superseded by the 2026-09-23 pass above)

The first story preview still needed loading-performance work. The image-priority recommendation is now addressed, but both mobile Lighthouse runs scored 70 with simulated 12.1s LCP (actual unthrottled image paint was much earlier). Do not describe the site as fast based on local unthrottled browsing. Profile initial script/data transfer, font loading and render dependencies on representative story, browse and visualization routes, then compare a deployed preview under controlled conditions and field vitals. The score of 100 applies only to Lighthouse’s automated SEO checks, not search ranking or editorial quality.

### Coverage limits and remaining category checks

- **Content and provenance:** catalogue integrity is checked, not every claim. Of 98 Met object records, 89 official API responses matched catalogue accession identifiers and public-domain flags; nine returned HTTP 403 and remain unresolved. Image appropriateness and all external source destinations still need record-level review.
- **Accessibility:** automated axe, keyboard-related regressions and reduced-motion checks do not replace screen-reader testing with people or complete WCAG conformance assessment.
- **Performance:** laboratory results and production field Core Web Vitals are separate. Measure real reading and graph/map routes on lower-powered mobile devices; do not infer real-user performance from this local test machine.
- **Security/privacy:** dependency advisories, consent regressions and saved-state review passed. This was not an authenticated penetration test. Oracle’s paid live path and infrastructure controls were not reconfigured.
- **Operations:** production alert delivery, restore drills and field analytics require separate live verification. Custom analytics handlers currently acknowledge rather than persist events.
- **Localization:** message catalogues exist, but translation quality and full route-level language consistency have not been certified.
- **Optional backend:** the Rust/PostgreSQL service was not started or runtime-tested; the primary web app is self-contained.
- **Product usefulness:** no moderated reader study was conducted. Template refinement and scholarly checks take priority over more generic features or bulk content.

### What to do next, in order

1. **Review the verified changes in a deployed preview, including mobile performance.** Recheck consent, reduced motion, fonts, and a story-to-source path in that deployed preview before production release.
2. **Review the implemented story/source path with readers.** It now provides the concrete pattern for comparison. Test finding the narrative, identifying an editorial retelling, locating a source, comparing tellings and distinguishing an illustration from a museum object. Further work can continue here under the user’s explicit authorization.
3. **Address measured mobile loading cost, then apply the accepted pattern across template families**, with an explicit checklist for every family and exceptions for purpose. Avoid a site-wide decorative reskin.
4. **Finish the editorial trust backlog**: granular tradition taxonomy, the 22 remaining English translation checks, comparison targets, attribution, and image provenance. Then add targeted material that closes a real gap; bulk story generation is not the next milestone.
5. **Run 5–7 moderated reader sessions**, including people new to the site and keyboard/mobile users. Let task failures determine the next feature. Source-aware comparisons and stronger story–object–place connections are promising; more games or another generic AI interface have not earned priority.

“Excellent throughout” remains a continuing standard with reviewable evidence. The automated sweep, browser regressions, and record-level editorial checklist cover different kinds of quality; none replaces the others.

## Initial assessment (before the expanded QA pass)

Historical assessment below: its Claude-only routing and proposed story/source handoff are superseded by the user’s later authorization and the implemented work documented above.

### Verified inventory

The static catalog is already substantial. Counts below were produced locally on 2026-09-22 with `jq 'length' apps/web/src/data/<file>.json`:

| Catalog                | Count |
| ---------------------- | ----: |
| traditions / pantheons |    16 |
| deities                |   233 |
| stories                |   108 |
| creatures              |    63 |
| artifacts              |    52 |
| locations              |   127 |
| heroes                 |    27 |
| cosmologies            |    16 |
| museum objects         |    98 |
| relationships          |   231 |
| myth-version records   |     7 |
| sources                |    34 |

There are 24 JSON datasets (36,192 source lines), 93 unit-test files, and 10 E2E files, counted with `find` and `wc` on the same date. This supports a quality-and-connection phase; it is not evidence that all entries have equal scholarly or editorial depth.

### What is already strong

- The product has an intentional design contract: a luminous dark-academia atlas, typed token system, accessibility and reduced-motion rules, a single cinematic home hero, and an explicit warning against card grids and generic product styling ([design-system.txt](../../apps/web/public/design-system.txt#L1-L39)).
- Story routes already support citations, source excerpts, and a version matrix where data exists ([StoryPageClient.tsx](../../apps/web/src/app/stories/[slug]/StoryPageClient.tsx#L423-L459), [VersionMatrix.tsx](../../apps/web/src/components/stories/VersionMatrix.tsx)). Deity records likewise have a primary-source-excerpt treatment ([DeityPageClient.tsx](../../apps/web/src/app/deities/[slug]/DeityPageClient.tsx#L561)). The current excerpt inventory must not be overstated: 40 excerpts total; 8 verified, 22 source-and-locator-verified, and 10 not verified.
- The main Vercel analytics integration is gated behind explicit consent, and product progress is local-first ([ConsentGatedAnalytics.tsx](../../apps/web/src/components/analytics/ConsentGatedAnalytics.tsx), [progress-provider.tsx](../../apps/web/src/providers/progress-provider.tsx)).
- CI is structurally sound: lint and typecheck, coverage tests, then a production build and Chromium E2E ([test.yml](../../.github/workflows/test.yml)). The five most recent main-line runs completed successfully. A newer dependency-update PR failed in the `next/font/google` loader during its build before E2E; that is a PR-specific failure to investigate, not evidence that main is failing.
- The first pass had 990 passing tests across 93 files with coverage, a successful production build (including TypeScript), and lint with zero errors plus one existing unused `Badge` warning. The build attempted Sentry source-map upload but could not reach `sentry.io` under restricted network access; compilation and build output passed, but upload remains unverified. The production preview confirmed restored Anansi/Nyame links on the Anansi story and Camazotz/Hero Twins links on House of Bats. Live browser sampling covered home search and navigation to Persephone. The full E2E suite and exhaustive visual/accessibility review were not rerun in this pass. No deployment was performed.

### Observed defects and maintenance gaps

1. The sitemap previously set every URL's `lastModified` to metadata-generation time, signalling false freshness. The fix now omits it until catalog records supply actual editorial dates ([sitemap.ts](../../apps/web/src/app/sitemap.ts#L23-L25)); its strengthened regression test passes.
2. The seven principal GraphQL catalog datasets have schemas ([schemas.ts](../../apps/web/src/lib/schemas.ts#L275-L281)). Regression tests for all seven have now been added and pass; retain this as a release gate, and add failure cases as the schema evolves.
3. `design-system.txt` says Next.js 16.2 while the app package is 16.3.4. This is a small documentation drift but weakens the claim that the machine-readable contract is authoritative ([design-system.txt](../../apps/web/public/design-system.txt#L8-L10), [package.json](../../apps/web/package.json#L1-L10)).
4. Analytics ingestion is not currently a measurement store: `/api/analytics/events` validates and acknowledges a typed event, logging only outside production ([events route](../../apps/web/src/app/api/analytics/events/route.ts#L6-L37)); `/api/analytics/vitals` likewise only acknowledges a payload ([vitals route](../../apps/web/src/app/api/analytics/vitals/route.ts#L20-L29)). Do not make product bets from either endpoint until there is a consented, documented measurement path.
5. Several components still use ad-hoc surface and text values such as Slate, Amber, raw pixel typography, and bespoke badges. This is an observed design-system consistency risk, not a judgment that every occurrence is poor. Audit priority should be reader-facing, high-traffic routes first.
6. Ten stories stored their featured figures in `featuredDeityIds`, but the story reader consumes `featuredDeities` ([StoryPageClient.tsx](../../apps/web/src/app/stories/[slug]/StoryPageClient.tsx#L159-L172)); the current fix migrates those ten names. This was a display/data-shape bug, not a content-quality gap. Of the 51 stories that previously lacked `featuredDeities`, 41 remain candidates for editorial review; some may appropriately have none.
7. A live sample of the Persephone story at approximately 840px shows a long title/ornament region, byline/correction text and four action controls before breadcrumb, art, and narrative. It also presents both `Read Aloud` ([StoryPageClient.tsx](../../apps/web/src/app/stories/[slug]/StoryPageClient.tsx#L268-L295)) and `StoryNarrator` ([StoryPageClient.tsx](../../apps/web/src/app/stories/[slug]/StoryPageClient.tsx#L348-L355)). This is one observed route, not a claim that every template has the same issue.
8. The live Anansi story is culturally misclassified by shared metadata: its record describes an Akan-Ashanti account and cites Rattray’s _Akan-Ashanti Folk-Tales_ ([stories.json](../../apps/web/src/data/stories.json#L2916-L2942)), while its `pantheonId` resolves to `African Pantheon (Yoruba)` ([pantheons.json](../../apps/web/src/data/pantheons.json#L271-L279)). This is a substantive taxonomy/editorial issue, not a visual-label patch. Trace related entities and metadata, then have Claude and an appropriately qualified editorial reviewer decide the model and migration before changing it.

## Product direction

Do not launch another broad content type or a large game feature next. The more valuable differentiator is a **source-aware comparative reader**: a reader can see what is being claimed, the tradition and edition behind it, where sources disagree, and how an artwork or place relates to that particular telling. Mythos already has the data primitives for the beginning of this experience; the plan is to deepen a small, editorially chosen set first.

This direction draws inspiration from established institutional patterns, without copying their UI: the Met's object records and chronological context, the British Museum's object-record discipline, and the Scaife ecosystem’s precise work/passage navigation. Treat these as research references for a later visual/editorial review: [The Met Timeline of Art History](https://www.metmuseum.org/essays/timeline-of-art-history), [British Museum Collection](https://www.britishmuseum.org/collection), and [Scaife Atlas](https://atlas.perseus.tufts.edu/library/). The Met reference and the Scaife Atlas library were directly verified. British Museum object pages returned 403 to automated retrieval and the Scaife Reader was unavailable to that retrieval method, so inspect both manually before turning either into a detailed implementation model. The visual language remains Mythos’s own tokens and editorial voice.

## Prioritized roadmap

### P0 — Establish a credible release and quality loop

**Outcome:** the live site has an honest technical baseline and a repeatable way to find high-value problems.

1. Preserve and verify the completed sitemap and GraphQL schema fixes.
   - Keep sitemap dates derived from actual content/repository metadata, or omit `lastModified` until such metadata is available. Never generate a date simply because the sitemap was requested.
   - Retain passing validation for `pantheons`, `deities`, `stories`, `creatures`, `artifacts`, `locations`, and `relationships` at the catalog boundary; add a malformed-fixture test for each meaningful failure mode rather than only testing happy-path JSON.
   - Resolve the unused `Badge` lint warning or document why it is intentionally retained.

2. Run the production-shaped release gate against the commit that will ship.
   - `pnpm lint`
   - `pnpm --filter web exec tsc --noEmit`
   - `pnpm --filter web test:coverage`
   - `pnpm --filter web build`
   - `pnpm --filter web e2e:start-only` after the build
   - Test the public sitemap XML and the top reader journeys in a deployed preview. Capture failed Playwright traces/screenshots as defects, not as informal notes.
   - Include the restored Anansi-to-Anansi/Nyame links in the preview smoke path, then open the Anansi taxonomy issue as an editorial review item rather than silently relabeling it.

3. Add an intentional visual and accessibility review cadence.
   - Use a fixed route sample: home, a pantheon, a deity, a story/read page, a location, global search, a game, and a narrow-screen route. For each template, review both themes, mobile layout, loading/empty/error state, and a content-rich as well as sparse instance where available.
   - Check 360px, 768px, and 1440px; keyboard-only navigation; focus visibility; reduced motion; light/dark contrast; image alt text and caption/provenance selection; and interaction with consent dismissed/rejected/accepted.
   - Make a short, timestamped issue list with a screenshot, exact route, viewport, expected behavior, and severity. Fix P0/P1 items before adding scope.
   - Give Claude a focused visual/editorial brief for the story template: reduce reading friction above the narrative; distinguish title, art, context, and narrative with intentional hierarchy; and test whether the two narration controls have distinct, comprehensible semantics. Do not prescribe the redesign from this audit.

**Acceptance criteria**

- [ ] All five release-gate commands pass on the shipping commit.
- [x] Every sitemap date is attributable to a real change, or no date is emitted; current output omits dates pending editorial metadata.
- [ ] All seven principal JSON catalogs retain passing schema validation; each schema change adds a meaningful invalid-data test.
- [ ] The review sample has no keyboard trap, hidden focus state, horizontal overflow, unreadable text, or broken image/link at the three viewports.
- [ ] No lint warnings remain unless the rule is disabled with a focused explanation.

### P1 — Learn from readers before feature expansion

**Outcome:** the roadmap is informed by observed reader needs, not feature appetite.

1. Conduct a small moderated reader study with 5–7 people: a mythology enthusiast, an educator/student, a casual visual browser, and people unfamiliar with the project. Avoid asking whether they “like” the site. Give them tasks:
   - Find an account of Persephone and identify what source supports it.
   - Compare two versions of one myth and explain the difference in their own words.
   - Follow an object or place back to a related story.
   - Save a thread of interest and return to it.
   - Recover from a failed search or unfamiliar term.
     Record completion, points of hesitation, quotes, and routes; obtain explicit consent before recording.

2. Define a minimal, consented measurement plan before wiring analytics.
   - Questions: Do readers reach a detail page from discovery? Do they open sources? Do they compare versions? Do they return to saved material? Where do searches fail?
   - Send only an event name, anonymous session/page context, route category, and a non-sensitive content identifier after opt-in. Do not collect free-text Oracle prompts, names, IP addresses, or content that could identify a reader.
   - Document retention, deletion, opt-out behavior, and the owner of the event taxonomy. Decide whether Vercel Analytics plus a minimal aggregate store is sufficient before building a custom pipeline.

3. Convert findings into a single ranked opportunity list. Require an evidence link (study observation or consented metric), the affected audience, a success metric, and a named trade-off for each proposed feature.

**Acceptance criteria**

- [ ] At least five consented sessions yield task observations, including three of the core reading/comparison tasks.
- [ ] A one-page event taxonomy connects every event to a product question and has a documented retention/opt-out policy.
- [ ] The next feature proposal cites evidence and its expected reader outcome; speculative features stay in a backlog.

### P2 — Make one exemplary scholarly reading path

**Outcome:** a small body of content demonstrates what Mythos is uniquely good at.

1. Choose 6–10 flagship stories spanning at least four traditions with editorial review. Start with the recent Persephone story only if its claims, translations, source editions, and cultural framing can be verified; do not treat recency as a reason to feature it. Prioritize the 10 currently unverified excerpts before treating them as editorial evidence.
2. For each flagship story, establish an editorial packet:
   - concise, human-edited overview and a clear scope note;
   - cited primary/secondary sources with author/work, edition or translation, book/line or stable locator, language where relevant, and stable URL/identifier where available;
   - version-specific claims rather than a single flattened “canonical” narrative;
   - respectful tradition-specific framing and reviewer attribution for living/Indigenous traditions;
   - clearly labeled uncertainty, contested readings, and missing evidence.
3. Extend the reader only after the packet is ready: source cards that link to the exact edition/passage; a restrained version comparison; links from claims to relevant objects, places, and related figures; and a provenance label for illustrations/objects.
4. Route the visual/editorial brief to Claude, which owns taste work under the project’s agent guidance. Use the existing token contract: hierarchy and typographic rhythm first; images serve a documented story beat with an appropriate caption/provenance treatment; decorative treatments are scarce; interactive visualizations clarify relationships. Review page screenshots against the anti-pattern list in the design system.

**Acceptance criteria**

- [ ] Every flagship story exposes its cited sources and exact locators where the source permits them.
- [ ] At least one comparison genuinely explains a material difference between versions, with sources for both sides.
- [ ] Each story has at least two meaningful contextual links (object/place/figure), and each link is checked.
- [ ] A subject-matter/editorial reviewer signs off on claim framing and sources before publishing.
- [ ] The design review identifies no generic card-soup, stock “AI mysticism,” or decorative treatment that competes with comprehension.

### P3 — Expand content by depth and coverage, not bulk (ongoing after P2)

**Outcome:** catalog growth becomes a dependable editorial program.

1. Create an internal content completeness rubric with required fields and levels: factual claims, citations, primary-source locators, related entities, pronunciation/terminology, image provenance, cultural framing, accessibility text, and translations.
2. Audit the existing catalog against this rubric, then prioritize gaps by reader demand and representational balance. More deities alone are a low-value next increment; strong candidates are underdeveloped links between existing stories, objects, places, and non-Greek/Roman traditions already present.
   - First audit shared taxonomy nodes that flatten distinct traditions. Anansi/Akan-Ashanti versus the current Yoruba umbrella is the concrete starting case.
3. Add in curated batches of 5–10 entries only after their sources and relationship graph are complete. Every batch receives schema validation, relationship-link validation, editorial review, and a page-level visual QA check.

**Acceptance criteria**

- [ ] The rubric is applied to every new content batch and recorded with it.
- [ ] New entries do not ship with untraceable claims or placeholder provenance.
- [ ] Each batch improves a measurable coverage gap or a reader task from P1.

### P4 — Add features only when a reader problem warrants them (post-evidence)

Potential next bets, in order of fit with the product direction:

1. **Guided comparative paths:** short, authored trails through variants, places, material culture, and themes. This fits the atlas model better than another standalone game.
2. **Collection notebook:** save passages, sources, and objects into a personal reading trail with a citation-preserving export. Validate demand in P1 because bookmarks/progress already exist.
3. **Source-aware search:** show sources, traditions, and entry type in results; improve zero-result recovery. Use only if study evidence shows discovery/search friction.
4. **Map or graph refinements:** add a visualization only for a question users cannot answer in prose or filters. Each visual needs a legend, accessible list/table alternative, performance budget, and a mobile review.
5. **Oracle improvements:** defer until reader research shows it adds value beyond the source-aware reader. If expanded, answers must state uncertainty, cite the catalog/source record used, avoid invented citations, and offer a path back to the relevant page.

## Editorial and visual quality rules

- Treat typography, spacing, evidence, and information hierarchy as the design. Decorative imagery is support material.
- Do not use generated prose unedited. An editor should remove generic adjectives, inflated certainty, repeated structure, empty “timeless” framing, and claims that collapse distinct traditions into one story.
- Do not represent living traditions as a set of interchangeable “pantheons.” Use appropriate community-reviewed terminology and context, disclose limits, and seek qualified review before expanding coverage.
- Prefer a few durable page compositions over a library of interchangeable card modules. The existing design system explicitly instructs this.
- Preserve reader control: reduced motion, text-first access to information encoded in images/graphs, visible focus, meaningful labels, and no essential content behind hover or animation.
- Keep generated visual assets traceable in internal records: creation method, prompt/source references, dates, human review, and whether an image is interpretive rather than historical evidence. Public labels should be concise and honest.

## Work sequencing and ownership

| Order | Work                                                                                        | Owner / reviewer                  | Dependency                  |
| ----- | ------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------- |
| 1     | Sitemap accuracy, catalog schema tests, lint warning, full release gate                     | engineering                       | current in-progress patches |
| 2     | Visual/accessibility audit and defect triage; send focused visual/editorial brief to Claude | engineering + Claude              | shipping preview            |
| 3     | Reader study and consented event plan                                                       | product + research lead           | P0 baseline                 |
| 4     | Flagship story editorial packets                                                            | editor + subject-matter reviewers | P1 evidence                 |
| 5     | Comparative reader design and implementation                                                | Claude + engineering              | approved packets            |
| 6     | Curated content batches and evidence-led features                                           | editorial + engineering           | P2 metrics/review           |

## Deliberately deferred

- Bulk generation of lore, art, pages, or gamification mechanics.
- A new backend/database migration merely to make the catalog look more sophisticated.
- A broad analytics pipeline before explicit consent, a useful event taxonomy, and a retention policy.
- Any Oracle expansion without a source-grounded evaluation set and clear failure behavior.

## Definition of progress

For each release, report: the reader problem addressed; the exact routes/content affected; test and accessibility results; editorial/source review status; consented evidence when relevant; and screenshots at the review viewports. A feature is complete only when it passes those checks and improves a reader task—not when the implementation is merely merged.

## September 23 continuation — addressable catalog pages

Heroes and Locations now use visible pagination anchors backed by server-resolved URL parameters. All 27 heroes and 127 locations appear in the expected actual HTML page slices. Search, tradition/type selections, and location era/view preferences survive page links and reloads; changing a filter resets page one. Era filtering applies before the first render, and clearing filters clears the era as well. Invalid page numbers safely fall back or clamp. Mobile page links open the location list, while an explicitly selected map preference remains respected.

The location filter panel now remains in normal page flow: its previous tall sticky layout covered scrolled cards. Duat uses its existing WebP asset after the PNG-to-AVIF request stalled locally; the WebP optimization returned immediately and the scrolled-thumbnail browser regression passes. Lazy loading is preserved. This does not establish a universal image-encoder defect.

Validation: nine targeted browser tests passed; 30 existing pagination-hook tests passed; typecheck and scoped lint passed; 12 layout/accessibility cases (320/768/1440, light/dark, both page-two catalogs) passed with no broken images, overflow, nested controls, console errors, or automated accessibility violations. Focused independent review found no material issue. Earlier failed checks were retained in temporary logs and informed the thumbnail fix. Raw HTML assertions are not a claim that every streamed route works with JavaScript disabled.

Next: reconcile the remaining dependency/image-policy work in open PRs against the current changes, then profile deployed browse and story loading. The broader editorial review and real-reader validation remain unfinished. Production has not been promoted.

Protected preview: https://mythos-irpkencj7-elizabeth-emersons-projects.vercel.app/locations?page=2&view=list . Remote production build passed; deployed browser smoke confirmed page two and next-page navigation to entries 49–72.
