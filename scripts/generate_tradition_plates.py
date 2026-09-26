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

Two plate styles exist:

* "medallion" - the dark-academia medallion used across the site, with a
  small geometric emblem inside ringed borders.
* "abstract" - a deliberately plain typographic plate: one thin frame, a
  horizon rule, and at most a single unornamented shape (a disc, a ridge
  line, a river line, or small cross-shaped stars). It is used for
  Aboriginal Australian and Diné entries so the site does not imitate
  culturally owned visual forms: no dot fields, no concentric-circle or
  U-shape iconography, no cross-hatching (rarrk), no sandpainting figures,
  no four-colour directional schemes. These plates are placeholders, not
  depictions; community-made or licensed artwork should replace them.

Requires Pillow (pip install Pillow).
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parents[1]
DATA = REPO_ROOT / "apps" / "web" / "src" / "data"
PUBLIC = REPO_ROOT / "apps" / "web" / "public"

GOLD = (212, 175, 55)
PARCHMENT = (245, 235, 220)
MUTED = (200, 180, 140)

ABSTRACT_PANTHEONS = {"aboriginal-australian-pantheon", "dine-pantheon"}

# Per-pantheon background and accent (dark ground, pigment accent).
PALETTES = {
    "hittite-pantheon": ((24, 17, 13), (190, 120, 70)),
    "canaanite-pantheon": ((22, 13, 20), (160, 80, 140)),
    "inuit-pantheon": ((12, 18, 26), (120, 170, 210)),
    "aboriginal-australian-pantheon": ((22, 16, 13), (170, 110, 80)),
    "dine-pantheon": ((13, 19, 21), (90, 160, 160)),
}
DEFAULT_PALETTE = ((18, 16, 14), (200, 160, 90))

SHORT_NAMES = {
    "hittite-pantheon": "HITTITE",
    "canaanite-pantheon": "CANAANITE · UGARIT",
    "inuit-pantheon": "INUIT",
    "aboriginal-australian-pantheon": "ABORIGINAL AUSTRALIA",
    "dine-pantheon": "DINÉ",
}

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
    # kind: (json file, output dir, size, webp?)
    "deities": ("deities.json", "deities", (768, 1024), True),
    "heroes": ("heroes.json", "heroes", (768, 1024), True),
    "stories": ("stories.json", "stories", (768, 768), False),
    "creatures": ("creatures.json", "creatures", (768, 768), False),
    "artifacts": ("artifacts.json", "artifacts", (768, 768), False),
    "locations": ("locations.json", "locations", (768, 768), False),
}


def font(size: int, style: str = "regular"):
    names = {
        "regular": ["Times New Roman.ttf", "LiberationSerif-Regular.ttf", "DejaVuSerif.ttf"],
        "bold": ["Times New Roman Bold.ttf", "LiberationSerif-Bold.ttf", "DejaVuSerif-Bold.ttf"],
        "italic": ["Times New Roman Italic.ttf", "LiberationSerif-Italic.ttf", "DejaVuSerif-Italic.ttf"],
    }[style]
    dirs = [
        Path("/System/Library/Fonts/Supplemental"),
        Path("/usr/share/fonts/truetype/liberation"),
        Path("/usr/share/fonts/truetype/dejavu"),
    ]
    for d in dirs:
        for n in names:
            p = d / n
            if p.exists():
                return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def fit_text(draw, text, style, start, max_width, min_size=14):
    size = start
    while size > min_size:
        f = font(size, style)
        if draw.textlength(text, font=f) <= max_width:
            return f
        size -= 2
    return font(min_size, style)


def dim(c, k=0.5):
    return tuple(int(v * k) for v in c)


def light(c, d=50):
    return tuple(min(255, v + d) for v in c)


def radial_wash(img, cx, cy, radius, accent, strength=40):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    for r in range(radius, 40, -10):
        alpha = int(strength * (1.0 - r / float(radius)))
        ld.ellipse([cx - r, cy - r, cx + r, cy + r], fill=accent + (alpha,))
    return Image.alpha_composite(img, layer)


# ---------------------------------------------------------------------------
# Emblems for the medallion style
# ---------------------------------------------------------------------------

def emblem(draw, motif, cx, cy, s, accent):
    pale = light(GOLD)
    if motif == "storm":
        pts = [(cx - 0.2 * s, cy - 0.7 * s), (cx + 0.15 * s, cy - 0.1 * s), (cx - 0.1 * s, cy - 0.05 * s), (cx + 0.2 * s, cy + 0.7 * s)]
        draw.line(pts, fill=pale, width=6, joint="curve")
        draw.arc([cx - 0.7 * s, cy - 0.9 * s, cx + 0.7 * s, cy - 0.2 * s], 200, 340, fill=GOLD, width=3)
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
        for i, wy in enumerate((-0.3, 0.0, 0.3)):
            draw.arc([cx - 0.7 * s, cy + (wy - 0.15) * s, cx + 0.7 * s, cy + (wy + 0.15) * s], 10, 170, fill=pale if i == 1 else GOLD, width=4)
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
        for i, wy in enumerate((-0.3, 0, 0.3)):
            draw.arc([cx - 0.6 * s + i * 0.1 * s, cy + (wy - 0.2) * s, cx + 0.4 * s + i * 0.1 * s, cy + (wy + 0.2) * s], 200, 350, fill=pale if i == 1 else GOLD, width=4)
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


def medallion(draw, cx, cy, radius):
    for r, w in [(radius, 3), (radius - 12, 1)]:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GOLD, width=w)


# ---------------------------------------------------------------------------
# Shapes for the abstract style (plain, unornamented)
# ---------------------------------------------------------------------------

def abstract_shape(draw, motif, cx, cy, s, accent):
    line = light(accent, 40)
    if motif == "disc":
        r = 0.22 * s
        draw.ellipse([cx - r, cy - 0.35 * s - r, cx + r, cy - 0.35 * s + r], fill=line)
    elif motif == "ridge":
        pts = [(cx - 0.9 * s, cy + 0.1 * s), (cx - 0.35 * s, cy - 0.2 * s), (cx + 0.05 * s, cy - 0.05 * s), (cx + 0.5 * s, cy - 0.3 * s), (cx + 0.9 * s, cy + 0.1 * s)]
        draw.line(pts, fill=line, width=3, joint="curve")
    elif motif == "river":
        pts = [(cx - 0.9 * s + i * 0.06 * s, cy + 0.25 * s + 0.08 * s * math.sin(i / 3.0)) for i in range(31)]
        draw.line(pts, fill=line, width=3, joint="curve")
    elif motif == "stars":
        for dx, dy in [(-0.5, -0.45), (-0.1, -0.6), (0.3, -0.4), (0.6, -0.55)]:
            x, y, r = cx + dx * s, cy + dy * s, 0.05 * s
            draw.line([(x - r, y), (x + r, y)], fill=line, width=2)
            draw.line([(x, y - r), (x, y + r)], fill=line, width=2)


# ---------------------------------------------------------------------------
# Rendering
# ---------------------------------------------------------------------------

def caption_for(kind, rec):
    if kind in ("deities", "heroes"):
        dom = rec.get("domain") or rec.get("keyDeeds") or []
        if kind == "deities":
            return " · ".join(d.upper() for d in dom[:3])
        return (rec.get("traditionRole") or "LEGENDARY FIGURE").upper()
    if kind == "stories":
        return rec.get("category", "myth").upper()
    if kind == "creatures":
        return "BEING OF STORY"
    if kind == "artifacts":
        return rec.get("type", "object").upper()
    if kind == "locations":
        return rec.get("locationType", "place").replace("_", " ").upper()
    return ""


def title_for(rec):
    name = rec.get("name") or rec.get("title")
    # Drop parenthetical glosses from the plate title; they stay in the record.
    if "(" in name:
        name = name.split("(")[0].strip()
    return name.upper()


def render(kind, rec, pantheon_id):
    json_name, out_dir, (w, h), make_webp = KINDS[kind]
    bg, accent = PALETTES.get(pantheon_id, DEFAULT_PALETTE)
    style = "abstract" if pantheon_id in ABSTRACT_PANTHEONS else "medallion"
    img = Image.new("RGBA", (w, h), bg + (255,))
    cx, cy = w // 2, int(h * (0.43 if h > w else 0.46))
    draw = ImageDraw.Draw(img)
    tag = f"MYTHOS ATLAS · {SHORT_NAMES.get(pantheon_id, 'MYTHIC TRADITION')}"
    title = title_for(rec)
    caption = caption_for(kind, rec)

    if style == "medallion":
        img = radial_wash(img, cx, cy, int(min(w, h) * 0.45), accent)
        draw = ImageDraw.Draw(img)
        draw.rectangle([28, 28, w - 28, h - 28], outline=GOLD, width=2)
        draw.rectangle([36, 36, w - 36, h - 36], outline=dim(GOLD), width=1)
        for bx, by, dx, dy in [(28, 28, 1, 1), (w - 28, 28, -1, 1), (28, h - 28, 1, -1), (w - 28, h - 28, -1, -1)]:
            draw.line([(bx, by), (bx + dx * 22, by)], fill=GOLD, width=2)
            draw.line([(bx, by), (bx, by + dy * 22)], fill=GOLD, width=2)
        draw.line([(56, 80), (w - 56, 80)], fill=dim(GOLD), width=1)
        radius = int(min(w, h) * 0.19)
        medallion(draw, cx, cy, radius)
        motif = MOTIFS.get(rec["id"], KIND_DEFAULTS.get(kind, "star"))
        emblem(draw, motif, cx, cy, radius * 0.62, accent)
        rule_y = int(h * (0.73 if h > w else 0.83))
        draw.line([(64, rule_y), (w - 64, rule_y)], fill=GOLD, width=2)
    else:
        # Plain typographic plate: single thin frame, horizon rule, one shape.
        draw.rectangle([32, 32, w - 32, h - 32], outline=dim(accent, 0.9), width=1)
        horizon = cy + int(min(w, h) * 0.12)
        draw.line([(80, horizon), (w - 80, horizon)], fill=dim(accent, 0.9), width=1)
        motif = MOTIFS.get(rec["id"], ABSTRACT_DEFAULT)
        abstract_shape(draw, motif, cx, horizon - int(min(w, h) * 0.05), min(w, h) * 0.3, accent)
        rule_y = int(h * (0.73 if h > w else 0.83))

    draw.text((w // 2, 58), tag, font=font(15), fill=MUTED, anchor="mm")
    tf = fit_text(draw, title, "bold", 46 if h > w else 40, w - 140)
    draw.text((w // 2, rule_y + (60 if h > w else 42)), title, font=tf, fill=PARCHMENT, anchor="mm")
    if caption:
        cf = fit_text(draw, caption, "italic", 17, w - 150, 11)
        draw.text((w // 2, rule_y + (108 if h > w else 78)), caption, font=cf, fill=GOLD if style == "medallion" else light(accent, 30), anchor="mm")
    if h > w:
        stamp = "CODEX THEOLOGICUS · FOLIO SACRUM" if style == "medallion" else "PLACEHOLDER PLATE · NOT A DEPICTION"
        draw.text((w // 2, h - 70), stamp, font=font(14), fill=(130, 120, 100), anchor="mm")

    out = PUBLIC / out_dir
    out.mkdir(parents=True, exist_ok=True)
    rgb = img.convert("RGB")
    rgb.save(out / f"{rec['id']}.png", "PNG", optimize=True)
    if make_webp:
        rgb.save(out / f"{rec['id']}.webp", "WEBP", quality=85)
    return out / f"{rec['id']}.png"


def render_pantheon(rec):
    pid = rec["id"]
    bg, accent = PALETTES.get(pid, DEFAULT_PALETTE)
    style = "abstract" if pid in ABSTRACT_PANTHEONS else "medallion"
    w, h = 1024, 768
    img = Image.new("RGBA", (w, h), bg + (255,))
    cx, cy = w // 2, 330
    draw = ImageDraw.Draw(img)
    if style == "medallion":
        img = radial_wash(img, cx, cy, 380, accent)
        draw = ImageDraw.Draw(img)
        draw.rectangle([32, 32, w - 32, h - 32], outline=GOLD, width=2)
        draw.rectangle([42, 42, w - 42, h - 42], outline=dim(GOLD), width=1)
        medallion(draw, cx, cy, 170)
        emblem(draw, {"hittite-pantheon": "storm", "canaanite-pantheon": "mountain", "inuit-pantheon": "sea"}.get(pid, "star"), cx, cy, 105, accent)
    else:
        draw.rectangle([36, 36, w - 36, h - 36], outline=dim(accent, 0.9), width=1)
        draw.line([(100, 420), (w - 100, 420)], fill=dim(accent, 0.9), width=1)
        abstract_shape(draw, "ridge" if pid == "aboriginal-australian-pantheon" else "disc", cx, 400, 260, accent)
    name = rec["name"].upper()
    draw.text((w // 2, 600), name, font=fit_text(draw, name, "bold", 52, w - 160), fill=PARCHMENT, anchor="mm")
    sub = rec["region"].upper()
    draw.text((w // 2, 655), sub, font=fit_text(draw, sub, "regular", 20, w - 200, 12), fill=GOLD if style == "medallion" else light(accent, 30), anchor="mm")
    out = PUBLIC / "pantheons"
    slug = rec["slug"]
    rgb = img.convert("RGB")
    rgb.save(out / f"{slug}.jpg", "JPEG", quality=90)
    rgb.save(out / f"{slug}.png", "PNG", optimize=True)
    return out / f"{slug}.jpg"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pantheon", action="append", default=[], help="pantheon id (repeatable)")
    ap.add_argument("--only", default="", help="comma-separated entity ids")
    ap.add_argument("--kinds", default=",".join(list(KINDS) + ["pantheons"]))
    args = ap.parse_args()
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
