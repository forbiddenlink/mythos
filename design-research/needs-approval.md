# Needs approval (not done)

Written against: 7e7c63b9 (2026-10-01).

- Per-entry plate numbers and cross-reference chips ("Pl. 214"): needs a stable numbering field in the catalog data model (schema change).
- A "next step" call to action on entity pages (read the story, see the family tree) driven by curated links: needs a content-model field or editorial decision; no routes were changed.
- Family tree data (needs a content decision): Tethys and Cronus each appear under two parents in the Greek tree (Gaia and Uranus both list them as parent). The tree draws one node per parent line, so they render twice. That is the data, not a render bug; the spouse/child double-listing of Gaia and Uranus WAS a render bug and is fixed with a test. The canvas and mobile outline were redone in the follow-up round.
- Subsetting Source Sans 3 (170 KB variable font with Cyrillic and Vietnamese) to cut critical bytes: changes a bundled asset and drops scripts some readers may rely on.
- Reducing first-load JavaScript (388 KB across 37 chunks) to lower the simulated mobile LCP: framework-level work, see report.md.
- Image generation: none done, budget unused. Any new image would go through scripts/generate_backlog_images.py and must keep the living-Indigenous-tradition guard.
