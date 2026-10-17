# Usability walkthrough, 2026-10-16

The six tasks from `usability-test-script.md`, run once in Chrome on the live
site (mythosatlas.com, desktop, dark theme) by an AI agent acting as a
first-time visitor. **This is a stand-in, not the test.** The agent knows the
site and is not a mythology reader, so it finds obvious friction but cannot
show what real people misread. Run the five-person test before treating any
task as passed.

| #   | Task                               | Result                   | Friction                                                                                                              |
| --- | ---------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| 1   | Find the Norse god of war          | Passed on the second try | "norse god of war" returned **No results**; "god of war" worked (Tyr third)                                           |
| 2   | Save him and find him again        | Passed                   | The heart fills, but nothing else confirms the save                                                                   |
| 3   | Compare with the Greek god of war  | Passed                   | The tool shows two cards side by side but never says in words how they relate, although `/compare/ares-vs-tyr` exists |
| 4   | Zeus's parents and grandparents    | Passed in two clicks     | Family diagram uses letters in circles, not the figures' pictures; "The Dioscuri (Ca…" truncated                      |
| 5   | Read an underworld myth to the end | Passed                   | In search, stories come after 6 deities and 7 places                                                                  |
| 6   | Find where the story comes from    | Passed                   | Works cited give book and line (Ovid, _Met._ 10.1-85) but the titles are not links to the texts                       |

## Other defects seen on the way

- Search results showed no tradition for figures outside 8 hard-coded
  traditions (Guan Yu, Mictlan, Xibalba, Diyu).
- Search results used a sparkle icon for deities and heroes.
- Tyr's article rendered "(\`thing\`)" with literal backticks in a code font.
- 57 parallel notes read like editor backlinks ("Ares already lists Tyr; ...").
- On all 10 Roman entries the parallel note named the entry itself
  ("Mars is the direct Greek equivalent" on Mars's page).

## Fixed in this pass

- Search matches word by word when the whole phrase misses, including the
  tradition name, so "norse god of war", "greek goddess of wisdom" and
  "egyptian god of the afterlife" find Tyr, Athena and Osiris.
- Tradition labels come from `pantheons.json` for all 27 traditions.
- Search results use the same classical marks as the menu.
- Tyr's sentence explains the _thing_ (the assembly) in italics.
- Editor backlink wording removed from 57 notes; 10 Roman notes now name the
  Greek counterpart. Both are guarded by data tests.
- With two figures selected, the compare tool links to the written
  comparison when one exists.

## Fixed in the follow-up pass

- Saving shows a short "Saved to Bookmarks" note, and the header bookmarks
  link shows the saved count.
- The family diagram shows each figure's illustration, and long names wrap
  to two lines instead of being cut off.
- Search keeps at most 4 results per type, so "underworld" shows stories
  next to gods and places.
- Cited works link to the atlas's own page for the text: 191 of 398
  citations now link (15 before). A different author blocks a title match.

## Fixed on 2026-10-17

- Search matches related words and plain plurals: "egyptian god of the dead"
  finds Anubis and Osiris, "greek gods of the sea" finds Poseidon. "god" and
  "goddess" in a query count toward deities, not toward places that mention a god.
- Citations: translator credits no longer block a link, editions map to their
  work, and 18 often-cited works joined the sources catalog. 269 of 398
  citations link (191 before).

## Still open

- 129 citations name works without a catalog page, mostly oral traditions,
  ethnographies and single tales.
- The five-person usability test has not been run. It needs real participants.
