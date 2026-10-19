# Additional content and data review

Scope: current local catalogs, shared source presentation, deity family components, and static API projections. No external scholarly verification of the existing catalog, live AI calls, emails, payments, or infrastructure queries. Reviewed source handling and relationships against current files, using the 2026-10-16 audit only as a hint.

## Fixed source presentation issue (P2)

`apps/web/src/components/sources/EntitySources.tsx:67–79` chooses checked excerpts **or** catalog notes. Adding one excerpt therefore removes the titles/dates of other catalog references from that subsection. `SourceProvenance.tsx:25–35` supplies a count and the oldest work, not the full list.

Current entries with catalog source IDs absent from their excerpt source ID set:

- Poseidon: `odyssey`.
- Athena: `iliad`, `theogony`.
- Thor: `prose-edda`.
- Osiris: `book-of-the-dead`, `plutarch-isis-osiris`.
- Anubis: `plutarch-isis-osiris`.
- Hecate: `homeric-hymns`.
- Ymir: `prose-edda`.

These IDs are catalog metadata comparisons, not a statement that each omitted work is absent everywhere on the page: independent “Appears in” and further-reading lists can expose some of them. Recommended fix: retain catalog title/date notes for unrepresented works beside checked excerpts, preserving the distinction between unchecked wording and verified excerpts. Integration expanded ownership; fixed in `EntitySources.tsx` by displaying only the remaining catalog works. Stable IDs take priority; normalized labels support legacy records without IDs. Distinct IDs are not merged simply because labels match.

## Coverage limits, not newly proven historical errors

Current dataset totals: 360 deities, 162 stories, 103 creatures, 76 artifacts, 37 heroes, 184 locations, 362 relationships. Every deity/creature/artifact/hero/location has catalog `primarySources`; all stories have `citationSources`. These are bibliography presence checks, not verification of the narrative or quotation wording.

At the initial review, 33 of 362 relationship records had passage evidence. The scoped addition below raises this to 57 of 362 (15.7%); 10 remain marked disputed. The other 305 lack the structured passage-evidence field, which does not prove their genealogies false. Sixteen deity entries have checked/source-status-labelled excerpt records. No heroes, creatures, artifacts, or locations have that excerpt field. UI source-note caveats currently distinguish catalog metadata from checked passages; avoid describing the whole catalog as verified.

`buildBloodline` excludes disputed relationships (`apps/web/src/lib/deity-page.ts:191–192`), and the current dataset has no undisputed pair marked both parent/child and sibling. Reference integrity, schema, relationship-evidence, source-excerpt, and journey-reference suites passed in this review. These do not validate every historical assertion.

A recursive metadata scan of every JSON catalog found zero unknown `sourceId` references and zero unexpected URL schemes in URL-named fields. This checks local strings, not live reachability. Static daily-myth, story catalog, and search-index routes return explicit public data projections and public cache headers. Quiz generation has a bounded body schema, same-origin guard, kill switch, IP rate limiting, and budget calls in the inspected route. Search also bounds request bytes and query length, rate-limits before retrieval, and degrades to lexical results on semantic failure. Newsletter inspection was code-only: same-origin check, bounded JSON, honeypot, and a rate limit precede subscription. No request or address was submitted. This limited read does not establish comprehensive API/security coverage.

## Implemented family disclosure

`DeityFamilyFaq.tsx` uses closed native `details` with a focusable `summary`. Full linked question/answer text stays in the DOM and the FAQ JSON-LD remains identical to its rendered answer text. The Bloodline diagram and relationship citation list remain in the existing page. The sidebar already caps kin lists; no useful facts were removed.

Focused verification: 55 tests across six suites passed for the first data/disclosure checks; after the source fix, 11 tests across the source and FAQ suites passed, including the additional keyboard-focus assertion. Tests cover native disclosure state, focus entry, linked answers, DOM persistence when closed, exact JSON-LD answer parity, and omission when empty. Browser keyboard activation and narrow layout remain integration checks.

## Additional Greek and Norse relationship passages

Added evidence to 24 existing uncited records (14 Greek, 10 Norse); no edges, directions, confidence labels, descriptions, or dispute flags changed. The original twenty-entry review manifest still describes its original scope. This addition establishes that these specific passages support these edges, not that biographies or all variants have been checked.

Greek edition: H. G. Evelyn-White, _Hesiod, the Homeric Hymns and Homerica_ (1914), Loeb 57; Theoi transcription. The [edition metadata](https://www.theoi.com/Text/HomericHymns1.html) identifies the translator and edition. Theogony sibling edges are inferred from explicitly shared parent lists, not quoted sibling labels.

| Added record IDs                                        | Passage                                                              | Evidence scope                                        |
| ------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| r2–r6                                                   | [Theogony 453–458](https://www.theoi.com/Text/HesiodTheogony.html)   | Rhea/Cronus child list supports Zeus's sibling edges. |
| greek-helios-selene, greek-helios-eos, greek-selene-eos | Theogony 371–374, same link                                          | Shared Theia/Hyperion parent list.                    |
| greek-cronus-tethys                                     | Theogony 134–138, same link                                          | Shared Earth/Heaven parent list.                      |
| greek-atlas-prometheus                                  | Theogony 507–511, same link                                          | Shared Clymene/Iapetus parent list.                   |
| greek-demeter-plutus                                    | Theogony 969–974, same link                                          | Demeter's child by Iasion.                            |
| greek-nyx-nemesis; greek-nyx-thanatos                   | Theogony 223–225; 211–213, same link                                 | Night's children.                                     |
| greek-apollo-asclepius                                  | [Homeric Hymn 16.1–4](https://www.theoi.com/Text/HomericHymns3.html) | Explicit Apollo paternity.                            |

Norse edition: Arthur Gilchrist Brodeur, _The Prose Edda_ (1916), American-Scandinavian Foundation; Internet Sacred Text Archive transcription. The [title page](https://sacred-texts.com/book/the-prose-edda/title-page) verifies the edition. Roman numerals below are Brodeur's chapter numbering; they can differ from other editions. Baldr/Idunn/Njördr in the translation correspond to catalog IDs baldur/idun/njord.

| Added record IDs | Passage                                                                         | Evidence scope                                                      |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| r19              | [Gylfaginning XX](https://sacred-texts.com/book/the-prose-edda/gylfaginning)    | Odin's wife Frigg.                                                  |
| r20              | Gylfaginning IX, same link                                                      | Odin's son Thor by Earth; no inference that Frigg is Thor's mother. |
| r21              | Gylfaginning XXII, same link                                                    | Baldr as Odin's son.                                                |
| r25, r26         | Gylfaginning XXXIV, same link                                                   | Loki's children Hel and Fenris-Wolf with Angrboda.                  |
| r109, r110       | Gylfaginning XXIV, same link                                                    | Njördr's daughter Freyja and son Freyr.                             |
| r230             | Gylfaginning XXVI, same link                                                    | Idunn as Bragi's wife.                                              |
| r22              | [Skáldskaparmál V](https://sacred-texts.com/book/the-prose-edda/skaldskaparmal) | Baldr as son of Odin and Frigg.                                     |
| r23              | Skáldskaparmál IV, same link                                                    | Thor explicitly called Sif's husband.                               |

Ambiguity retained: Freyr/Freyja's current `r24` description says twins; the examined passages establish siblinghood without explicitly establishing twin birth, so no evidence was attached to that whole record. The unsupported-detail question remains open. Zeus–Hephaestus `r13` remains disputed and uncited by this addition; Hesiod's Hera-only passage does not prove Zeus paternity. Thor–Fenrir `r28` was not supported by the inspected passages and remains outside this evidence set. These omissions do not prove those traditions false. No quoted translation text was added.

Verification after the addition: Node 22.23.1; 70 focused tests passed across relationship evidence, relationship records, and referential integrity. A structural comparison with the previous committed catalog confirms exactly 24 newly added evidence fields, identical record membership, identical non-evidence metadata, and unchanged pre-existing evidence. This is local regression verification, not independent scholarly review.

## Additional Egyptian and Japanese relationship passages

A further 17 existing records now have passage evidence: nine Egyptian and eight Japanese. Coverage is **74/362 (20.4%)**, leaving 288 records without structured passage evidence. No relationship types, directions, descriptions, confidence levels, dispute flags, record membership, or earlier evidence changed. This is passage verification of these edges in particular translations, not verification of all biographies or traditions.

Egyptian source: [Plutarch, _On Isis and Osiris_, sections 1–19](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html), Frank Cole Babbitt, _Moralia_ V (1936), Loeb; [edition metadata](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/home.html). [Section 41, 367D](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/C.html) explicitly identifies Typhon as Seth (Set). Sibling edges follow the shared maternal birth sequence, with alternative fathers explicitly reported by Plutarch; no Geb paternity was inferred.

| Records       | Passage               | Supports                            |
| ------------- | --------------------- | ----------------------------------- |
| r32, r33, r34 | Section 12, 355D–356A | Osiris's sibling relationships.     |
| r35           | Section 12, 355D–356A | Nephthys as Typhon's wife.          |
| r36           | Section 14, 356E–F    | Isis and Nephthys as sisters.       |
| r39, r40      | Section 14, 356E–F    | Anubis's parents; Isis raises him.  |
| r38           | Section 18, 357F–358A | Horus as Isis's son.                |
| r42           | Section 13, 356B–D    | Typhon's fatal plot against Osiris. |

Japanese source: Basil Hall Chamberlain, _A Translation of the Ko-ji-ki_ (1882; reprinted May 1919), Internet Sacred Text Archive. The [opened title page](https://sacred-texts.com/book/the-kojiki-2/start-reading) identifies the translation and reprint. Its translated divine names differ from the catalog's Japanese names; Section X's notes identify Amaterasu, Tsukuyomi, and Susanoo, and Section VI note 26 identifies Kagutsuchi. Siblinghood follows their shared origin in Izanagi; Section XI additionally calls the three his children.

| Records          | Opened passage                                                                                                                                                                                                                                                                    | Supports                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| r55              | [Section IV, Courtship](https://sacred-texts.com/book/the-kojiki-2/section-iv-courtship-of-the-deities-the-male-who-invites-and-the-female-who-invites); [Section V, Birth of the Eight Islands](https://sacred-texts.com/book/the-kojiki-2/section-v-birth-of-the-eight-islands) | Izanagi/Izanami's union and island creation.                    |
| r56, r57         | [Section X, Purification](https://sacred-texts.com/book/the-kojiki-2/section-x-the-purification-of-the-august-person)                                                                                                                                                             | Shared origin of the sibling deities.                           |
| r112, r113, r114 | Section X, same link                                                                                                                                                                                                                                                              | Left eye, right eye, and nose respectively.                     |
| r115             | [Section VI, note 26](https://sacred-texts.com/book/the-kojiki-2/section-vi-birth-of-the-various-deities); [Section VII](https://sacred-texts.com/book/the-kojiki-2/section-vii-retirement-of-her-augustness-the-princess-who-invites)                                            | Fire child's identity, birth, and Izanami's death.              |
| r116             | [Section XVI, Heavenly Rock-Dwelling](https://sacred-texts.com/book/the-kojiki-2/section-xvi-the-door-of-the-heavenly-rock-dwelling)                                                                                                                                              | Uzume's part in bringing Amaterasu out; several gods cooperate. |

Boundaries: the inspected Plutarch passage does not establish the existing r41 description's eighty-year duration, so that record remains without evidence. No Greek-name-to-Egyptian-name paternity inference was added. Avesta requests failed (gateway/timeout); Persian claims remain unverified in this addition. Finnish text was opened during scoping, but no Finnish evidence was added. No translation quotations were copied into the catalog.

Verification: the project requires Node `>=22.22.2 <23`; shell Node and the explicit mise runtime were 22.23.1. The relationship-evidence, relationship-record, and referential-integrity suites passed **87/87 tests**. Focused ESLint passed. A comparison against the pre-addition working-copy snapshot confirmed all 362 records, all non-evidence fields, and every previous evidence array were unchanged; exactly 17 previously uncited records gained evidence. No build, deployment, dependencies, or runtime configuration changes were part of this batch.
