"""Single do-not-generate check shared by every image generation entry point.

Sacred figures, places, stories and objects from living Indigenous traditions
keep their procedural plates permanently (see docs/design/image-backlog.md,
"Do-not-generate policy"). The backlog table is the source of truth: a row
whose prompt column starts with ``DO NOT GENERATE`` is refused here, by entity
type and by slug or catalog id.

    from _dng_guard import assert_generatable, DoNotGenerate
    assert_generatable("deity", "some-id")   # raises DoNotGenerate
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from _repo_paths import DATA_DIR, REPO_ROOT

BACKLOG = REPO_ROOT / "docs/design/image-backlog.md"

# Backlog "Type" column -> (entity type, catalog file).
TYPES = {
    "Hero": ("hero", "heroes.json"),
    "Deity": ("deity", "deities.json"),
    "Creature": ("creature", "creatures.json"),
    "Pantheon": ("pantheon", "pantheons.json"),
    "Story": ("story", "stories.json"),
    "Location": ("location", "locations.json"),
    "Artifact": ("artifact", "artifacts.json"),
}
# Catalog file stem -> entity type, for callers that iterate catalog files.
FILE_TO_ETYPE = {fname.removesuffix(".json"): etype for etype, fname in TYPES.values()}


class DoNotGenerate(Exception):
    """Raised when an id belongs to a do-not-generate backlog row."""


def _norm(etype: str, ident: str) -> str:
    return ident.removesuffix("-pantheon") if etype == "pantheon" else ident


def dng_keys(backlog: Path | None = None, data_dir: Path | None = None) -> set[tuple[str, str]]:
    """(entity type, slug-or-id) pairs that must never be generated."""
    backlog = backlog or BACKLOG
    data_dir = data_dir or DATA_DIR
    keys: set[tuple[str, str]] = set()
    for line in backlog.read_text(encoding="utf-8").splitlines():
        if not re.match(r"\| \d+ ", line):
            continue
        cols = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cols) < 7 or not cols[6].startswith("DO NOT GENERATE") or cols[2] not in TYPES:
            continue
        etype, fname = TYPES[cols[2]]
        slug = _norm(etype, cols[4])
        keys.add((etype, slug))
        catalog = data_dir / fname
        if catalog.exists():
            for rec in json.loads(catalog.read_text(encoding="utf-8")):
                if _norm(etype, rec.get("slug") or "") == slug or _norm(etype, rec["id"]) == slug:
                    keys.add((etype, _norm(etype, rec["id"])))
    return keys


def is_dng(etype: str, ident: str, **kw) -> bool:
    return (etype, _norm(etype, ident)) in dng_keys(**kw)


def assert_generatable(etype: str, ident: str, **kw) -> None:
    if is_dng(etype, ident, **kw):
        raise DoNotGenerate(
            f"{etype}:{ident} is a DO NOT GENERATE row (living Indigenous tradition); "
            "it keeps its procedural plate"
        )
