# Needs approval (not done)

Written against: 7e7c63b9 (2026-10-01).

- Per-entry plate numbers and cross-reference chips ("Pl. 214"): needs a stable numbering field in the catalog data model (schema change).
- A "next step" call to action on entity pages (read the story, see the family tree) driven by curated links: needs a content-model field or editorial decision; no routes were changed.
- Family tree canvas redesign (ReactFlow node size, tall canvas, clipped left node): large change to a data-heavy visualisation; the data also shows duplicate figures (Uranus, Tethys) that need a content decision.
- Subsetting Source Sans 3 (170 KB variable font with Cyrillic and Vietnamese) to cut critical bytes: changes a bundled asset and drops scripts some readers may rely on.
- Reducing first-load JavaScript (388 KB across 37 chunks) to lower the simulated mobile LCP: framework-level work, see report.md.
- Image generation: none done, budget unused. Any new image would go through scripts/generate_backlog_images.py and must keep the living-Indigenous-tradition guard.
