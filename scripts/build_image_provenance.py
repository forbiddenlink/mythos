#!/usr/bin/env python3
"""
build_image_provenance.py
Writes apps/web/src/data/image-provenance.json: how every catalog image was made.

No image in the catalog is historical artwork. Two pipelines produced them:

* Procedural "archival plates" drawn with Pillow by the generate_*_plates.py
  scripts (and generate_creatures_locations_stories.py /
  generate_heroes_and_pantheons.py). Each of those scripts lists the ids it
  draws; an entity whose image file is the one that list would write is
  recorded as procedural.
* Everything else was produced with text-to-image models, either through
  generate_missing.py (Magica flux_2_max) or imported from an external image
  tool's render folder by move_and_update.py. The pipelines did not record
  which model made which file, so these share one "ai-illustration" record.

The script is deterministic and read-only apart from the output file; rerun
it after adding entities or regenerating images:

    python3 scripts/build_image_provenance.py          # write
    python3 scripts/build_image_provenance.py --check  # fail if stale
"""

from __future__ import annotations

import argparse
import ast
import json
import sys
from pathlib import Path

from _repo_paths import DATA_DIR, REPO_ROOT, WEB_PUBLIC

OUTPUT = DATA_DIR / "image-provenance.json"

# Catalog file -> public image folder. Keys are the entity types used by
# getImageProvenance() in apps/web/src/lib/image-provenance.ts.
CATALOGS = {
    "deity": ("deities.json", "deities"),
    "hero": ("heroes.json", "heroes"),
    "creature": ("creatures.json", "creatures"),
    "artifact": ("artifacts.json", "artifacts"),
    "location": ("locations.json", "locations"),
    "story": ("stories.json", "stories"),
    "pantheon": ("pantheons.json", "pantheons"),
    "journey": ("journeys.json", "journeys"),
}

# Procedural scripts: (script, list variable, public folder, id key).
PROCEDURAL_SOURCES = [
    ("scripts/generate_deity_plates.py", "DEITIES", "deities", "id"),
    ("scripts/generate_hero_plates.py", "HEROES", "heroes", "id"),
    ("scripts/generate_heroes_and_pantheons.py", "NEW_HEROES", "heroes", "id"),
    ("scripts/generate_heroes_and_pantheons.py", "NEW_PANTHEONS", "pantheons", "slug"),
    ("scripts/generate_creatures_locations_stories.py", "CREATURES", "creatures", "id"),
    ("scripts/generate_creatures_locations_stories.py", "LOCATIONS", "locations", "id"),
    ("scripts/generate_creatures_locations_stories.py", "STORIES", "stories", "id"),
    ("scripts/generate_creatures_locations_stories.py", "ARTIFACTS", "artifacts", "id"),
    ("scripts/generate_creatures_locations_stories.py", "EMBLEM_ARTIFACTS", "artifacts", "id"),
]

# Plates drawn per tradition straight from the catalog (no id list): every
# entity whose pantheon is in the script's PALETTES map was drawn by it.
TRADITION_SCRIPT = "scripts/generate_tradition_plates.py"


def tradition_pantheons() -> set[str]:
    tree = ast.parse((REPO_ROOT / TRADITION_SCRIPT).read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and any(
            isinstance(t, ast.Name) and t.id == "PALETTES" for t in node.targets
        ):
            return set(ast.literal_eval(node.value))
    return set()


# Images whose origin could not be established from the repository. Keyed by
# (entity type, id); these must be credited or replaced before they are
# described as anything more specific.
UNVERIFIED: set[tuple[str, str]] = set()

# Sourced photographs, hotlinked from their host as the host's API terms ask.
SOURCED = {
    ("pantheon", "greek-pantheon"): "unsplash-acropolis-gontzou",
}

GENERATORS = {
    "procedural-plate": {
        "kind": "illustration-procedural",
        "label": "Procedural archival plate",
        "description": "Ornamental plate drawn programmatically with Pillow: border, emblem, and name. Decorative, not a depiction from any source.",
        "license": "Project artwork, same license as the repository",
        "scripts": sorted(
            {script for script, *_ in PROCEDURAL_SOURCES} | {TRADITION_SCRIPT}
        ),
    },
    "ai-illustration": {
        "kind": "illustration-ai",
        "label": "AI-generated illustration",
        "description": "Generated with a text-to-image model (scripts/generate_missing.py via Magica flux_2_max, or renders imported by scripts/move_and_update.py). Illustrative only; not historical artwork and not evidence of how the tradition depicted the subject. Inferred per image: the pipelines did not record the model or prompt for each file.",
        "scripts": ["scripts/generate_missing.py", "scripts/move_and_update.py"],
    },
    "unsplash-acropolis-gontzou": {
        "kind": "licensed",
        "label": "Photograph by Stavrialena Gontzou on Unsplash",
        "description": "The Acropolis of Athens at sunset. Used under the Unsplash License and hotlinked from Unsplash.",
        "license": "Unsplash License (https://unsplash.com/license)",
        "source": "https://unsplash.com/photos/G8OyUvtAxUQ",
    },
    "unverified": {
        "kind": "unverified",
        "label": "Image source not verified",
        "description": "Origin and license were not recorded when the image was added. It needs a credit or a replacement.",
    },
}


def procedural_images() -> dict[str, str]:
    """Map 'folder/basename' -> generating script for every scripted plate."""
    found: dict[str, str] = {}
    for script, variable, folder, key in PROCEDURAL_SOURCES:
        tree = ast.parse((REPO_ROOT / script).read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if not isinstance(node, ast.Assign):
                continue
            if not any(isinstance(t, ast.Name) and t.id == variable for t in node.targets):
                continue
            for item in ast.literal_eval(node.value):
                found[f"{folder}/{item[key]}"] = script
    return found


def build() -> dict:
    plates = procedural_images()
    traditions = tradition_pantheons()
    entities: dict[str, dict[str, str]] = {}
    for entity_type, (filename, folder) in CATALOGS.items():
        records = json.loads((DATA_DIR / filename).read_text(encoding="utf-8"))
        rows: dict[str, str] = {}
        for record in records:
            sourced = SOURCED.get((entity_type, record["id"]))
            if sourced:
                rows[record["id"]] = sourced
                continue
            url = record.get("imageUrl")
            if not url or not url.startswith("/"):
                continue
            path = Path(url.lstrip("/"))
            if not (WEB_PUBLIC / path).exists():
                raise SystemExit(f"{entity_type}:{record['id']} image missing: {url}")
            stem_key = f"{path.parent.as_posix()}/{path.stem}"
            script = plates.get(stem_key) if path.parent.as_posix() == folder else None
            pantheon = record["id"] if entity_type == "pantheon" else record.get("pantheonId")
            if pantheon in traditions:
                script = TRADITION_SCRIPT
            if (entity_type, record["id"]) in UNVERIFIED:
                rows[record["id"]] = "unverified"
                continue
            rows[record["id"]] = "procedural-plate" if script else "ai-illustration"
        entities[entity_type] = dict(sorted(rows.items()))
    return {
        "$comment": "Generated by scripts/build_image_provenance.py; do not edit by hand.",
        "generators": GENERATORS,
        "entities": entities,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument("--check", action="store_true", help="exit 1 if the file is stale")
    args = parser.parse_args()
    text = json.dumps(build(), indent=2, ensure_ascii=False) + "\n"
    if args.check:
        current = OUTPUT.read_text(encoding="utf-8") if OUTPUT.exists() else ""
        if json.loads(current or "null") != json.loads(text):
            print(f"{OUTPUT.relative_to(REPO_ROOT)} is stale; rerun this script.")
            return 1
        return 0
    OUTPUT.write_text(text, encoding="utf-8")
    data = json.loads(text)
    for entity_type, rows in data["entities"].items():
        procedural = sum(1 for r in rows.values() if r == "procedural-plate")
        print(f"{entity_type:9} {len(rows):4} images, {procedural:3} procedural")
    return 0


if __name__ == "__main__":
    sys.exit(main())
