#!/usr/bin/env python3
"""
generate_tradition_plates.py

Procedural archive plates for pantheons added after the original plate
scripts (generate_deity_plates.py, generate_creatures_locations_stories.py,
generate_hero_plates.py). Unlike those scripts, entity names and captions are
read from the JSON catalogs in apps/web/src/data, so a plate always matches
its record.

Usage:
    python3 scripts/generate_tradition_plates.py --pantheon hittite-pantheon
    python3 scripts/generate_tradition_plates.py --only tarhunna,kumarbi
    python3 scripts/generate_tradition_plates.py --pantheon dine-pantheon --kinds deities,stories
    python3 scripts/generate_tradition_plates.py --all

Two plate styles exist, both rendered by _plate_art.py:

* "medallion" - the site's engraved gold medallion (tradition border band,
  embossed emblem, atmospheric ground). Plates carry no text; the site
  prints names in HTML.
* "abstract" - a plain landscape: sky, horizon, land, and at most one
  unornamented element (a sun or moon disc, a ridge, a river, or a night
  sky). It is used for Aboriginal Australian and Diné entries so the site
  does not imitate culturally owned visual forms: no dot fields, no
  concentric-circle or U-shape iconography, no cross-hatching (rarrk), no
  sandpainting figures, no four-colour directional schemes, no medallion or
  border ornament. These plates are placeholders, not depictions;
  community-made or licensed artwork should replace them.

Requires Pillow and numpy (pip install Pillow numpy).
"""

from __future__ import annotations

import argparse
import json
import math

from _plate_art import render_abstract_plate, render_plate, write_plate

from _repo_paths import DATA_DIR as DATA, REPO_ROOT, WEB_PUBLIC as PUBLIC

GOLD = (212, 175, 55)
PARCHMENT = (245, 235, 220)
MUTED = (200, 180, 140)

ABSTRACT_PANTHEONS = {"aboriginal-australian-pantheon", "dine-pantheon"}  # see _plate_art

# Per-pantheon background and accent (dark ground, pigment accent).
PALETTES = {
    "hittite-pantheon": ((24, 17, 13), (190, 120, 70)),
    "canaanite-pantheon": ((22, 13, 20), (160, 80, 140)),
    "inuit-pantheon": ((12, 18, 26), (120, 170, 210)),
    "aboriginal-australian-pantheon": ((22, 16, 13), (170, 110, 80)),
    "dine-pantheon": ((13, 19, 21), (90, 160, 160)),
}
DEFAULT_PALETTE = ((18, 16, 14), (200, 160, 90))

# Emblem per entity id. Anything not listed falls back to KIND_DEFAULTS.
MOTIFS = {
    # Hittite
    "tarhunna": "storm", "sun-goddess-of-arinna": "sun", "kumarbi": "stone",
    "telipinu": "tree", "hannahanna": "bee", "inara": "vessels",
    "kamrusepa": "flame", "shaushka": "star", "sun-goddess-of-the-earth": "under",
    "alalu": "cup", "song-of-kumarbi": "stone", "song-of-ullikummi": "pillar",
    "storm-god-and-illuyanka": "serpent", "disappearance-of-telipinu": "bee",
    "illuyanka": "serpent", "ullikummi": "pillar", "hedammu": "sea",
    "ancient-copper-cutter": "blade", "kursa-hunting-bag": "tree",
    "hattusa": "gate", "yazilikaya": "mountain", "nerik": "storm", "urkesh": "gate",
    # Canaanite
    "baal": "storm", "anat": "spear", "el": "horns", "athirat": "tree",
    "yam": "sea", "mot": "under", "kothar-wa-khasis": "anvil", "shapash": "sun",
    "athtar": "star", "dagan": "grain", "baal-and-yam": "clubs",
    "palace-of-baal": "gate", "baal-and-mot": "under", "legend-of-aqhat": "bow",
    "legend-of-kirta": "crown", "lotan": "serpent", "tunnanu": "sea",
    "yagrush-and-ayyamur": "clubs", "bow-of-aqhat": "bow", "ugarit": "gate",
    "mount-zaphon": "mountain", "aqhat": "bow", "kirta": "crown",
    # Inuit
    "sedna": "sea", "anguta": "under", "anningan": "moon", "malina": "sun",
    "sila": "wind", "pinga": "star", "tornarsuk": "wind", "tulunigraq": "bird",
    "the-sea-woman": "sea", "sun-sister-and-moon-brother": "moon",
    "kiviuq-and-the-journeys": "kayak", "raven-harpoons-the-whale-land": "bird",
    "qalupalik": "sea", "tupilaq": "stone", "adlet": "wind", "kiviuq": "kayak",
    "cumberland-sound": "sea", "igloolik": "moon", "tikigaq-point-hope": "bird",
    "torngat-mountains": "mountain",
    # Aboriginal Australian (abstract vocabulary only)
    "bunjil": "stars", "pallian": "river", "baiame": "disc", "rainbow-serpent": "river",
    "wagyl": "river", "seven-sisters": "stars", "wati-nyiru": "stars",
    "kuniya": "ridge", "liru": "ridge",
    "bunjil-and-the-kulin-country": "stars", "the-seven-sisters-songline": "stars",
    "baiames-ngunnhu": "river", "wagyl-and-derbarl-yerrigan": "river",
    "kuniya-and-liru": "ridge", "bunyip": "river", "mimih": "ridge",
    "brewarrina-fish-traps": "river", "bunjils-shelter": "ridge",
    "derbarl-yerrigan": "river", "uluru": "ridge",
    # Diné (abstract vocabulary only)
    "changing-woman": "disc", "white-shell-woman": "disc", "monster-slayer": "ridge",
    "born-for-water": "river", "first-man": "stars", "first-woman": "stars",
    "spider-woman": "ridge", "coyote": "stars", "johonaaei": "disc",
    "talking-god": "ridge",
}

KIND_DEFAULTS = {
    "deities": "star", "heroes": "crown", "stories": "star", "creatures": "serpent",
    "artifacts": "blade", "locations": "mountain", "pantheons": "star",
}
ABSTRACT_DEFAULT = "disc"

KINDS = {
    # kind: (json file, output dir, size, unused)
    "deities": ("deities.json", "deities", (768, 1024), True),
    "heroes": ("heroes.json", "heroes", (768, 1024), True),
    "stories": ("stories.json", "stories", (768, 768), False),
    "creatures": ("creatures.json", "creatures", (768, 768), False),
    "artifacts": ("artifacts.json", "artifacts", (768, 768), False),
    "locations": ("locations.json", "locations", (768, 768), False),
}


def dim(c, k=0.5):
    return tuple(int(v * k) for v in c)


def light(c, d=50):
    return tuple(min(255, v + d) for v in c)


# ---------------------------------------------------------------------------
# Emblems for the medallion style
# ---------------------------------------------------------------------------

def emblem(draw, motif, cx, cy, s, accent):
    pale = light(GOLD)
    if motif == "storm":
        # cloud bank, forked bolt and slanting rain
        for dx, dy, r in ((-0.32, -0.42, 0.24), (0.0, -0.55, 0.3), (0.34, -0.42, 0.22)):
            draw.ellipse([cx + (dx - r) * s, cy + (dy - r) * s, cx + (dx + r) * s, cy + (dy + r) * s], fill=dim(accent, 0.7), outline=pale, width=3)
        draw.rectangle([cx - 0.52 * s, cy - 0.42 * s, cx + 0.52 * s, cy - 0.24 * s], fill=dim(accent, 0.7))
        draw.line([(cx - 0.56 * s, cy - 0.24 * s), (cx + 0.56 * s, cy - 0.24 * s)], fill=pale, width=3)
        bolt = [(cx + 0.02 * s, cy - 0.22 * s), (cx - 0.16 * s, cy + 0.14 * s), (cx + 0.02 * s, cy + 0.12 * s),
                (cx - 0.12 * s, cy + 0.72 * s), (cx + 0.22 * s, cy + 0.02 * s), (cx + 0.04 * s, cy + 0.04 * s), (cx + 0.18 * s, cy - 0.22 * s)]
        draw.polygon(bolt, fill=pale, outline=GOLD)
        for i in range(6):
            x = cx - 0.55 * s + i * 0.2 * s + (0.25 * s if i >= 3 else 0)
            draw.line([(x, cy - 0.1 * s), (x - 0.1 * s, cy + 0.25 * s)], fill=GOLD, width=2)
    elif motif == "sun":
        r = 0.32 * s
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=accent, outline=pale, width=3)
        for i in range(12):
            a = i * math.pi / 6
            draw.line([(cx + 0.45 * s * math.cos(a), cy + 0.45 * s * math.sin(a)), (cx + 0.7 * s * math.cos(a), cy + 0.7 * s * math.sin(a))], fill=GOLD, width=3)
    elif motif == "moon":
        r = 0.5 * s
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=pale)
        draw.ellipse([cx - r + 0.3 * s, cy - r - 0.05 * s, cx + r + 0.3 * s, cy + r - 0.05 * s], fill=(18, 20, 28))
    elif motif == "stone":
        draw.polygon([(cx - 0.45 * s, cy + 0.5 * s), (cx - 0.3 * s, cy - 0.4 * s), (cx + 0.1 * s, cy - 0.55 * s), (cx + 0.45 * s, cy - 0.1 * s), (cx + 0.4 * s, cy + 0.5 * s)], fill=accent, outline=pale)
        draw.line([(cx - 0.6 * s, cy + 0.5 * s), (cx + 0.6 * s, cy + 0.5 * s)], fill=GOLD, width=3)
    elif motif == "tree":
        draw.line([(cx, cy - 0.7 * s), (cx, cy + 0.6 * s)], fill=GOLD, width=5)
        for i, w in enumerate([0.25, 0.4, 0.55]):
            y = cy - 0.6 * s + i * 0.35 * s
            draw.polygon([(cx, y - 0.1 * s), (cx - w * s, y + 0.3 * s), (cx + w * s, y + 0.3 * s)], outline=pale, fill=dim(accent, 0.8))
    elif motif == "bee":
        draw.ellipse([cx - 0.18 * s, cy - 0.35 * s, cx + 0.18 * s, cy + 0.35 * s], fill=accent, outline=pale, width=2)
        for dy in (-0.1, 0.05, 0.2):
            draw.line([(cx - 0.17 * s, cy + dy * s), (cx + 0.17 * s, cy + dy * s)], fill=pale, width=2)
        draw.ellipse([cx - 0.55 * s, cy - 0.45 * s, cx - 0.12 * s, cy - 0.05 * s], outline=pale, width=2)
        draw.ellipse([cx + 0.12 * s, cy - 0.45 * s, cx + 0.55 * s, cy - 0.05 * s], outline=pale, width=2)
    elif motif == "vessels":
        for dx in (-0.4, 0, 0.4):
            x = cx + dx * s
            draw.ellipse([x - 0.15 * s, cy - 0.1 * s, x + 0.15 * s, cy + 0.35 * s], fill=accent, outline=pale, width=2)
            draw.rectangle([x - 0.06 * s, cy - 0.25 * s, x + 0.06 * s, cy - 0.1 * s], outline=pale, width=2)
    elif motif == "flame":
        draw.polygon([(cx, cy - 0.6 * s), (cx - 0.3 * s, cy + 0.2 * s), (cx, cy + 0.45 * s), (cx + 0.3 * s, cy + 0.2 * s)], fill=accent, outline=pale)
        draw.line([(cx - 0.5 * s, cy + 0.55 * s), (cx + 0.5 * s, cy + 0.55 * s)], fill=GOLD, width=3)
    elif motif in ("star", "stars"):
        for (dx, dy, r) in [(0, 0, 0.3), (-0.45, -0.35, 0.12), (0.45, -0.3, 0.1), (0.35, 0.4, 0.12), (-0.4, 0.4, 0.09)]:
            x, y, rr = cx + dx * s, cy + dy * s, r * s
            draw.polygon([(x, y - rr), (x + rr * 0.25, y - rr * 0.25), (x + rr, y), (x + rr * 0.25, y + rr * 0.25), (x, y + rr), (x - rr * 0.25, y + rr * 0.25), (x - rr, y), (x - rr * 0.25, y - rr * 0.25)], fill=pale)
    elif motif == "under":
        draw.arc([cx - 0.6 * s, cy - 0.2 * s, cx + 0.6 * s, cy + 0.9 * s], 180, 360, fill=pale, width=4)
        for i in range(7):
            x = cx - 0.45 * s + i * 0.15 * s
            draw.line([(x, cy + 0.1 * s), (x, cy + 0.5 * s)], fill=GOLD, width=2)
        draw.line([(cx - 0.7 * s, cy + 0.5 * s), (cx + 0.7 * s, cy + 0.5 * s)], fill=GOLD, width=3)
    elif motif == "cup":
        draw.polygon([(cx - 0.35 * s, cy - 0.3 * s), (cx + 0.35 * s, cy - 0.3 * s), (cx + 0.15 * s, cy + 0.15 * s), (cx - 0.15 * s, cy + 0.15 * s)], fill=accent, outline=pale)
        draw.line([(cx, cy + 0.15 * s), (cx, cy + 0.45 * s)], fill=pale, width=4)
        draw.line([(cx - 0.25 * s, cy + 0.5 * s), (cx + 0.25 * s, cy + 0.5 * s)], fill=pale, width=4)
    elif motif == "pillar":
        draw.rectangle([cx - 0.15 * s, cy - 0.7 * s, cx + 0.15 * s, cy + 0.4 * s], fill=accent, outline=pale, width=2)
        for wy in (0.5, 0.65):
            draw.arc([cx - 0.7 * s, cy + (wy - 0.1) * s, cx + 0.7 * s, cy + (wy + 0.1) * s], 10, 170, fill=GOLD, width=3)
    elif motif == "serpent":
        pts = [(cx - 0.6 * s + i * 0.04 * s, cy + 0.3 * s * math.sin(i / 4.0)) for i in range(31)]
        draw.line(pts, fill=pale, width=7, joint="curve")
        hx, hy = pts[-1]
        draw.ellipse([hx - 0.08 * s, hy - 0.08 * s, hx + 0.08 * s, hy + 0.08 * s], fill=accent, outline=pale)
    elif motif == "sea":
        # rolling swell: a curling crest over rows of scalloped waves
        draw.arc([cx - 0.62 * s, cy - 0.72 * s, cx + 0.18 * s, cy + 0.08 * s], 150, 390, fill=pale, width=6)
        draw.arc([cx - 0.36 * s, cy - 0.5 * s, cx - 0.02 * s, cy - 0.16 * s], 150, 400, fill=GOLD, width=4)
        draw.ellipse([cx - 0.24 * s, cy - 0.38 * s, cx - 0.14 * s, cy - 0.28 * s], fill=accent)
        for row, wy in enumerate((0.12, 0.3, 0.48)):
            n = 5 - (row % 2)
            for i in range(n):
                x0 = cx - 0.7 * s + (i + (0.5 if row % 2 else 0)) * 0.28 * s
                draw.arc([x0, cy + (wy - 0.1) * s, x0 + 0.28 * s, cy + (wy + 0.1) * s], 180, 360, fill=pale if row == 1 else GOLD, width=4)
    elif motif == "blade":
        draw.polygon([(cx - 0.55 * s, cy + 0.35 * s), (cx + 0.5 * s, cy - 0.45 * s), (cx + 0.2 * s, cy + 0.1 * s)], fill=accent, outline=pale)
        draw.line([(cx - 0.55 * s, cy + 0.35 * s), (cx - 0.7 * s, cy + 0.5 * s)], fill=GOLD, width=6)
    elif motif == "gate":
        draw.rectangle([cx - 0.5 * s, cy - 0.3 * s, cx + 0.5 * s, cy + 0.5 * s], outline=pale, width=3)
        draw.arc([cx - 0.25 * s, cy - 0.15 * s, cx + 0.25 * s, cy + 0.35 * s], 180, 360, fill=GOLD, width=4)
        draw.line([(cx - 0.25 * s, cy + 0.1 * s), (cx - 0.25 * s, cy + 0.5 * s)], fill=GOLD, width=4)
        draw.line([(cx + 0.25 * s, cy + 0.1 * s), (cx + 0.25 * s, cy + 0.5 * s)], fill=GOLD, width=4)
        for i in range(5):
            x = cx - 0.45 * s + i * 0.225 * s
            draw.rectangle([x - 0.05 * s, cy - 0.42 * s, x + 0.05 * s, cy - 0.3 * s], fill=GOLD)
    elif motif == "mountain":
        draw.polygon([(cx - 0.65 * s, cy + 0.45 * s), (cx - 0.1 * s, cy - 0.5 * s), (cx + 0.2 * s, cy - 0.05 * s), (cx + 0.35 * s, cy - 0.25 * s), (cx + 0.65 * s, cy + 0.45 * s)], fill=dim(accent, 0.8), outline=pale)
    elif motif == "spear":
        draw.line([(cx - 0.5 * s, cy + 0.6 * s), (cx + 0.4 * s, cy - 0.5 * s)], fill=GOLD, width=6)
        draw.polygon([(cx + 0.4 * s, cy - 0.5 * s), (cx + 0.55 * s, cy - 0.75 * s), (cx + 0.25 * s, cy - 0.6 * s)], fill=pale)
    elif motif == "horns":
        draw.arc([cx - 0.6 * s, cy - 0.6 * s, cx, cy + 0.2 * s], 150, 330, fill=pale, width=6)
        draw.arc([cx, cy - 0.6 * s, cx + 0.6 * s, cy + 0.2 * s], 210, 30, fill=pale, width=6)
        draw.ellipse([cx - 0.2 * s, cy - 0.05 * s, cx + 0.2 * s, cy + 0.35 * s], fill=accent, outline=GOLD)
    elif motif == "anvil":
        draw.polygon([(cx - 0.55 * s, cy - 0.1 * s), (cx + 0.55 * s, cy - 0.1 * s), (cx + 0.3 * s, cy + 0.1 * s), (cx + 0.2 * s, cy + 0.45 * s), (cx - 0.2 * s, cy + 0.45 * s), (cx - 0.3 * s, cy + 0.1 * s)], fill=accent, outline=pale)
        draw.line([(cx + 0.1 * s, cy - 0.7 * s), (cx + 0.4 * s, cy - 0.3 * s)], fill=GOLD, width=6)
    elif motif == "grain":
        draw.line([(cx, cy - 0.7 * s), (cx, cy + 0.6 * s)], fill=GOLD, width=4)
        for i in range(5):
            y = cy - 0.55 * s + i * 0.2 * s
            draw.ellipse([cx - 0.22 * s, y - 0.07 * s, cx - 0.02 * s, y + 0.07 * s], fill=pale)
            draw.ellipse([cx + 0.02 * s, y - 0.07 * s, cx + 0.22 * s, y + 0.07 * s], fill=pale)
    elif motif == "clubs":
        for dx in (-0.2, 0.2):
            draw.line([(cx + dx * s, cy + 0.6 * s), (cx + dx * s * 2.2, cy - 0.5 * s)], fill=GOLD, width=6)
            draw.ellipse([cx + dx * s * 2.2 - 0.12 * s, cy - 0.65 * s, cx + dx * s * 2.2 + 0.12 * s, cy - 0.4 * s], fill=pale)
    elif motif == "bow":
        draw.arc([cx - 0.35 * s, cy - 0.7 * s, cx + 0.35 * s, cy + 0.7 * s], 270, 90, fill=pale, width=6)
        draw.line([(cx, cy - 0.7 * s), (cx, cy + 0.7 * s)], fill=GOLD, width=2)
        draw.line([(cx - 0.5 * s, cy), (cx + 0.45 * s, cy)], fill=GOLD, width=3)
    elif motif == "crown":
        draw.polygon([(cx - 0.5 * s, cy + 0.3 * s), (cx - 0.5 * s, cy - 0.3 * s), (cx - 0.25 * s, cy), (cx, cy - 0.45 * s), (cx + 0.25 * s, cy), (cx + 0.5 * s, cy - 0.3 * s), (cx + 0.5 * s, cy + 0.3 * s)], fill=accent, outline=pale)
    elif motif == "wind":
        # three gusts, each ending in a curl
        for i, wy in enumerate((-0.35, 0.0, 0.35)):
            x0 = cx - 0.7 * s + i * 0.08 * s
            x1 = cx + 0.25 * s + i * 0.1 * s
            y = cy + wy * s
            draw.line([(x0, y), (x1, y)], fill=pale if i == 1 else GOLD, width=5)
            r = (0.16 - i * 0.02) * s
            draw.arc([x1 - r, y - 2 * r, x1 + r, y], 90, 400, fill=pale if i == 1 else GOLD, width=5)
            draw.ellipse([x1 - r * 0.35, y - r * 1.35, x1 + r * 0.35, y - r * 0.65], fill=accent)
    elif motif == "bird":
        draw.line([(cx - 0.6 * s, cy - 0.1 * s), (cx, cy + 0.2 * s), (cx + 0.6 * s, cy - 0.1 * s)], fill=pale, width=7, joint="curve")
        draw.arc([cx - 0.7 * s, cy + 0.35 * s, cx + 0.7 * s, cy + 0.65 * s], 10, 170, fill=GOLD, width=3)
    elif motif == "kayak":
        draw.polygon([(cx - 0.7 * s, cy + 0.1 * s), (cx + 0.7 * s, cy + 0.1 * s), (cx + 0.45 * s, cy + 0.25 * s), (cx - 0.45 * s, cy + 0.25 * s)], fill=accent, outline=pale)
        draw.line([(cx - 0.45 * s, cy - 0.3 * s), (cx + 0.45 * s, cy + 0.5 * s)], fill=GOLD, width=4)
        draw.arc([cx - 0.7 * s, cy + 0.35 * s, cx + 0.7 * s, cy + 0.6 * s], 10, 170, fill=GOLD, width=3)
    else:
        r = 0.4 * s
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=pale, fill=accent, width=3)


# ---------------------------------------------------------------------------
# Rendering
# ---------------------------------------------------------------------------

KIND_TYPES = {"deities": "deity", "heroes": "hero", "stories": "story", "creatures": "creature",
              "artifacts": "artifact", "locations": "location"}


def hint_for(kind, rec):
    """Words the renderer reads to choose the plate's atmosphere."""
    parts = []
    for key in ("domain", "keyDeeds", "abilities", "powers"):
        val = rec.get(key)
        if isinstance(val, list):
            parts.extend(str(v) for v in val[:4])
    for key in ("traditionRole", "category", "type", "locationType", "description"):
        if isinstance(rec.get(key), str):
            parts.append(rec[key][:160])
    return " ".join(parts)


def render(kind, rec, pantheon_id):
    _json_name, out_dir, size, _webp = KINDS[kind]
    if pantheon_id in ABSTRACT_PANTHEONS:
        motif = MOTIFS.get(rec["id"], ABSTRACT_DEFAULT)
        img = render_abstract_plate(key=rec["id"], size=size, motif=motif, pantheon=pantheon_id)
    else:
        bg, accent = PALETTES.get(pantheon_id, DEFAULT_PALETTE)
        motif = MOTIFS.get(rec["id"], KIND_DEFAULTS.get(kind, "star"))
        img = render_plate(
            kind=KIND_TYPES[kind], key=rec["id"], size=size, accent=accent, bg=bg,
            pantheon=pantheon_id, hint=hint_for(kind, rec),
            emblem=lambda draw, cx, cy: emblem(draw, motif, cx, cy, 130, accent),
        )
    return write_plate(img, PUBLIC / out_dir, rec["id"])


def render_pantheon(rec):
    pid = rec["id"]
    size = (1024, 768)
    if pid in ABSTRACT_PANTHEONS:
        motif = "ridge" if pid == "aboriginal-australian-pantheon" else "disc"
        img = render_abstract_plate(key=pid, size=size, motif=motif, pantheon=pid)
    else:
        bg, accent = PALETTES.get(pid, DEFAULT_PALETTE)
        motif = {"hittite-pantheon": "storm", "canaanite-pantheon": "mountain", "inuit-pantheon": "sea"}.get(pid, "star")
        img = render_plate(
            kind="pantheon", key=pid, size=size, accent=accent, bg=bg, pantheon=pid,
            hint=rec.get("region", ""),
            emblem=lambda draw, cx, cy: emblem(draw, motif, cx, cy, 130, accent),
        )
    return write_plate(img, PUBLIC / "pantheons", rec["slug"])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pantheon", action="append", default=[], help="pantheon id (repeatable)")
    ap.add_argument("--only", default="", help="comma-separated entity ids")
    ap.add_argument("--kinds", default=",".join(list(KINDS) + ["pantheons"]))
    ap.add_argument("--all", action="store_true", help="every pantheon in PALETTES")
    args = ap.parse_args()
    if args.all:
        args.pantheon = sorted(set(args.pantheon) | set(PALETTES))
    only = {x.strip() for x in args.only.split(",") if x.strip()}
    kinds = [k.strip() for k in args.kinds.split(",") if k.strip()]
    if not args.pantheon and not only:
        ap.error("pass --pantheon and/or --only")

    written = []
    if "pantheons" in kinds:
        for rec in json.loads((DATA / "pantheons.json").read_text()):
            if rec["id"] in args.pantheon or rec["id"] in only:
                written.append(render_pantheon(rec))
    for kind in kinds:
        if kind not in KINDS:
            continue
        for rec in json.loads((DATA / KINDS[kind][0]).read_text()):
            pid = rec.get("pantheonId")
            if (only and rec["id"] in only) or (not only and pid in args.pantheon):
                written.append(render(kind, rec, pid))
    for p in written:
        print(f"  wrote {p.relative_to(REPO_ROOT)}")
    print(f"{len(written)} plates")


if __name__ == "__main__":
    main()
