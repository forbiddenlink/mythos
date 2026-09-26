"""Reusable medallion emblems for the procedural plate generators.

The generate_*_plates.py scripts each keep their own chain of bespoke motifs.
Emblems here are generic shapes (sun, crescent, peak, serpent, eggs, ...) that
any plate can name as ``"emblem_<shape>"``. Each generator calls
``draw_emblem`` before its own chain; it draws and returns True for an
``emblem_*`` motif and returns False, drawing nothing, for anything else.

Decorative only: an emblem is not a depiction of how a tradition portrayed
its subject.
"""

from __future__ import annotations

import math


def _shades(gold):
    pale = tuple(min(255, c + 45) for c in gold)
    dark = tuple(c // 2 for c in gold)
    deep = tuple(c // 3 for c in gold)
    return pale, dark, deep


def _rays(draw, cx, cy, r1, r2, n, fill, width=3, offset=0.0):
    for i in range(n):
        a = offset + i * 2 * math.pi / n
        draw.line([(cx + r1 * math.cos(a), cy + r1 * math.sin(a)),
                   (cx + r2 * math.cos(a), cy + r2 * math.sin(a))], fill=fill, width=width)


def _waves(draw, cx, cy, half, rows, fill, width=2, step=16):
    for k in range(rows):
        y = cy + k * step
        draw.arc([cx - half, y - 12, cx + half, y + 12], start=10, end=170, fill=fill, width=width)


def _sun(draw, cx, cy, accent, gold, pale, r=34):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=gold, fill=accent, width=3)
    _rays(draw, cx, cy, r + 8, r + 30, 16, pale, 3)


def _crescent(draw, cx, cy, r, fill, bg):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill)
    draw.ellipse([cx - r + r // 2, cy - r - 4, cx + r + r // 2, cy + r - 4], fill=bg)


def _peak(draw, cx, cy, w, h, gold, pale, deep):
    draw.polygon([(cx - w, cy + h // 2), (cx, cy - h // 2), (cx + w, cy + h // 2)], fill=deep, outline=gold)
    draw.polygon([(cx - w // 3, cy - h // 6), (cx, cy - h // 2), (cx + w // 3, cy - h // 6)], fill=pale)


def _serpent(draw, cx, cy, gold, pale, heads=1):
    pts = [(cx - 80 + i * 8, cy + 28 * math.sin(i * 0.55)) for i in range(21)]
    draw.line(pts, fill=gold, width=9, joint="curve")
    draw.line(pts, fill=pale, width=3, joint="curve")
    hx, hy = pts[-1]
    draw.ellipse([hx - 10, hy - 8, hx + 10, hy + 8], fill=gold)
    if heads == 2:
        tx, ty = pts[0]
        draw.ellipse([tx - 10, ty - 8, tx + 10, ty + 8], fill=gold)


def _bird(draw, cx, cy, span, gold, pale):
    draw.arc([cx - span, cy - span // 2, cx, cy + span // 2], start=200, end=340, fill=pale, width=5)
    draw.arc([cx, cy - span // 2, cx + span, cy + span // 2], start=200, end=340, fill=pale, width=5)
    draw.ellipse([cx - 9, cy - 16, cx + 9, cy + 20], fill=gold)


def _flame(draw, cx, cy, h, accent, pale):
    draw.polygon([(cx, cy - h), (cx - h // 2, cy), (cx - h // 4, cy + h // 3), (cx + h // 4, cy + h // 3), (cx + h // 2, cy)], fill=accent, outline=pale)
    draw.polygon([(cx, cy - h // 2), (cx - h // 5, cy + h // 6), (cx + h // 5, cy + h // 6)], fill=pale)


def draw_emblem(draw, cx, cy, motif, accent, gold, bg=(14, 14, 18)):
    """Draw ``motif`` if it is an ``emblem_*`` name; return whether it was."""
    if not isinstance(motif, str) or not motif.startswith("emblem_"):
        return False
    pale, dark, deep = _shades(gold)
    kind = motif[len("emblem_"):]

    if kind == "sun":
        _sun(draw, cx, cy, accent, gold, pale, 40)
    elif kind == "sun_face":
        _sun(draw, cx, cy, accent, gold, pale, 44)
        draw.ellipse([cx - 16, cy - 12, cx - 6, cy - 2], fill=bg)
        draw.ellipse([cx + 6, cy - 12, cx + 16, cy - 2], fill=bg)
        draw.arc([cx - 16, cy - 2, cx + 16, cy + 22], start=20, end=160, fill=bg, width=3)
    elif kind == "moon":
        _crescent(draw, cx - 10, cy, 52, pale, bg)
        for sx, sy in [(40, -50), (58, -10), (46, 34), (70, 18)]:
            draw.ellipse([cx + sx - 4, cy + sy - 4, cx + sx + 4, cy + sy + 4], fill=gold)
    elif kind == "stars":
        draw.arc([cx - 85, cy - 60, cx + 85, cy + 60], start=200, end=340, fill=pale, width=4)
        for i in range(9):
            x = cx - 70 + i * 17
            y = cy - 10 + 18 * math.sin(i)
            draw.ellipse([x - 4, y - 4, x + 4, y + 4], fill=gold)
    elif kind == "mountain":
        _peak(draw, cx, cy + 10, 85, 130, gold, pale, deep)
        draw.ellipse([cx + 36, cy - 76, cx + 60, cy - 52], fill=accent)
    elif kind == "earth":
        draw.arc([cx - 80, cy - 10, cx + 80, cy + 90], start=180, end=360, fill=gold, width=6)
        for ox in (-45, -15, 15, 45):
            draw.line([(cx + ox, cy + 30), (cx + ox, cy - 20)], fill=pale, width=3)
            draw.ellipse([cx + ox - 7, cy - 34, cx + ox + 7, cy - 16], fill=accent)
        _waves(draw, cx, cy + 50, 70, 2, dark)
    elif kind == "waves":
        _waves(draw, cx, cy - 40, 80, 6, pale, 3, 18)
        draw.ellipse([cx - 14, cy - 76, cx + 14, cy - 48], outline=gold, width=3)
    elif kind == "lake_island":
        _waves(draw, cx, cy + 30, 85, 3, pale, 2, 16)
        draw.polygon([(cx - 55, cy + 28), (cx - 20, cy - 10), (cx + 25, cy - 4), (cx + 60, cy + 28)], fill=deep, outline=gold)
        _sun(draw, cx, cy - 52, accent, gold, pale, 20)
    elif kind == "gateway":
        draw.rectangle([cx - 70, cy - 40, cx + 70, cy - 18], fill=deep, outline=gold, width=3)
        draw.rectangle([cx - 62, cy - 18, cx - 34, cy + 70], fill=deep, outline=gold, width=3)
        draw.rectangle([cx + 34, cy - 18, cx + 62, cy + 70], fill=deep, outline=gold, width=3)
        draw.ellipse([cx - 14, cy - 44, cx + 14, cy - 14], outline=pale, width=3)
    elif kind == "temple_walls":
        for k, w in enumerate((80, 62, 44)):
            y = cy + 50 - k * 30
            draw.rectangle([cx - w, y - 24, cx + w, y], outline=gold, fill=deep, width=3)
        draw.polygon([(cx - 12, cy - 16), (cx - 10, cy - 40), (cx + 10, cy - 40), (cx + 12, cy - 16)], fill=accent)
        _sun(draw, cx, cy - 66, accent, gold, pale, 14)
    elif kind == "pyramid":
        for k, w in enumerate((88, 68, 48, 28)):
            y = cy + 60 - k * 26
            draw.rectangle([cx - w, y - 24, cx + w, y], outline=gold, fill=deep, width=2)
        _waves(draw, cx, cy + 74, 80, 1, pale)
    elif kind == "serpent":
        _serpent(draw, cx, cy, gold, pale, 1)
    elif kind == "serpent2":
        _serpent(draw, cx, cy, gold, pale, 2)
    elif kind == "serpent_flame":
        _flame(draw, cx, cy - 22, 58, (214, 118, 48), pale)
        _serpent(draw, cx, cy + 46, gold, pale, 1)
    elif kind == "llama":
        draw.ellipse([cx - 40, cy - 6, cx + 30, cy + 34], fill=deep, outline=gold, width=3)
        draw.line([(cx + 22, cy + 4), (cx + 40, cy - 52)], fill=gold, width=12)
        draw.ellipse([cx + 30, cy - 70, cx + 56, cy - 50], fill=deep, outline=gold, width=3)
        for lx in (-30, -12, 8, 22):
            draw.line([(cx + lx, cy + 30), (cx + lx, cy + 70)], fill=gold, width=5)
        for sx, sy in [(-70, -60), (-55, -30), (60, 10), (-80, 10)]:
            draw.ellipse([cx + sx - 4, cy + sy - 4, cx + sx + 4, cy + sy + 4], fill=pale)
    elif kind == "rod":
        draw.line([(cx - 70, cy + 40), (cx + 70, cy + 40)], fill=gold, width=4)
        draw.arc([cx - 90, cy + 30, cx + 90, cy + 120], start=200, end=340, fill=dark, width=3)
        draw.line([(cx, cy - 80), (cx, cy + 60)], fill=pale, width=9)
        _rays(draw, cx, cy - 86, 12, 30, 12, gold, 2)
    elif kind == "sling":
        draw.line([(cx - 70, cy - 70), (cx - 10, cy + 20)], fill=gold, width=4)
        draw.line([(cx + 70, cy - 70), (cx + 10, cy + 20)], fill=gold, width=4)
        draw.ellipse([cx - 20, cy + 10, cx + 20, cy + 40], outline=pale, fill=accent, width=3)
        draw.line([(cx - 40, cy - 90), (cx - 10, cy - 50), (cx - 30, cy - 50), (cx + 10, cy - 10)], fill=pale, width=4)
    elif kind == "lightning":
        draw.line([(cx + 20, cy - 90), (cx - 20, cy - 10), (cx + 15, cy - 10), (cx - 25, cy + 80)], fill=pale, width=7)
        draw.arc([cx - 90, cy - 100, cx + 90, cy - 20], start=180, end=360, fill=gold, width=4)
    elif kind == "eggs":
        for i, (ox, oy) in enumerate([(-50, 20), (-25, -18), (0, -40), (25, -18), (50, 20)]):
            draw.ellipse([cx + ox - 16, cy + oy - 22, cx + ox + 16, cy + oy + 22], outline=gold, fill=accent if i == 2 else deep, width=3)
        _peak(draw, cx, cy + 62, 80, 40, gold, pale, deep)
    elif kind == "egg":
        draw.ellipse([cx - 38, cy - 52, cx + 38, cy + 44], outline=gold, fill=accent, width=4)
        _rays(draw, cx, cy - 4, 58, 80, 12, pale, 2)
    elif kind == "fire":
        draw.rectangle([cx - 48, cy + 30, cx + 48, cy + 70], outline=gold, fill=deep, width=3)
        draw.rectangle([cx - 30, cy + 14, cx + 30, cy + 30], outline=gold, fill=deep, width=3)
        _flame(draw, cx, cy - 8, 70, accent, pale)
    elif kind == "flame":
        _flame(draw, cx, cy + 10, 90, accent, pale)
    elif kind == "bird":
        _bird(draw, cx, cy, 90, gold, pale)
    elif kind == "great_bird":
        _bird(draw, cx, cy - 10, 95, gold, pale)
        for ox in range(-60, 61, 20):
            draw.line([(cx + ox, cy + 30), (cx + ox * 1.2, cy + 70)], fill=accent, width=4)
    elif kind == "horse":
        draw.arc([cx - 70, cy - 40, cx + 50, cy + 40], start=180, end=360, fill=pale, width=8)
        draw.line([(cx - 60, cy), (cx - 70, cy + 70)], fill=pale, width=6)
        draw.line([(cx + 40, cy), (cx + 50, cy + 70)], fill=pale, width=6)
        draw.line([(cx + 40, cy - 10), (cx + 70, cy - 60)], fill=pale, width=10)
        draw.polygon([(cx + 64, cy - 66), (cx + 92, cy - 52), (cx + 70, cy - 46)], fill=gold)
    elif kind == "banner":
        draw.line([(cx - 50, cy - 90), (cx - 50, cy + 85)], fill=gold, width=6)
        draw.polygon([(cx - 46, cy - 80), (cx + 70, cy - 60), (cx + 50, cy - 10), (cx + 70, cy + 40), (cx - 46, cy + 20)], fill=accent, outline=pale)
        for ang in range(0, 360, 45):
            a = math.radians(ang)
            draw.line([(cx + 10, cy - 20), (cx + 10 + 22 * math.cos(a), cy - 20 + 22 * math.sin(a))], fill=pale, width=3)
    elif kind == "cup":
        draw.arc([cx - 60, cy - 70, cx + 60, cy + 30], start=0, end=180, fill=gold, width=6)
        draw.line([(cx - 60, cy - 20), (cx + 60, cy - 20)], fill=gold, width=4)
        draw.line([(cx, cy + 30), (cx, cy + 60)], fill=gold, width=7)
        draw.line([(cx - 35, cy + 64), (cx + 35, cy + 64)], fill=gold, width=6)
        for sx, sy in [(-30, -46), (0, -56), (30, -46), (-12, -34), (16, -32)]:
            draw.ellipse([cx + sx - 4, cy + sy - 4, cx + sx + 4, cy + sy + 4], fill=pale)
    elif kind == "mace":
        draw.line([(cx - 50, cy + 80), (cx + 30, cy - 30)], fill=gold, width=8)
        draw.ellipse([cx + 10, cy - 70, cx + 70, cy - 20], outline=pale, fill=accent, width=3)
        draw.arc([cx - 5, cy - 100, cx + 40, cy - 45], start=180, end=300, fill=pale, width=5)
        draw.arc([cx + 40, cy - 100, cx + 85, cy - 45], start=240, end=360, fill=pale, width=5)
    elif kind == "bridge":
        draw.arc([cx - 90, cy - 30, cx + 90, cy + 90], start=180, end=360, fill=pale, width=6)
        draw.line([(cx - 90, cy + 30), (cx - 90, cy + 80)], fill=gold, width=5)
        draw.line([(cx + 90, cy + 30), (cx + 90, cy + 80)], fill=gold, width=5)
        _waves(draw, cx, cy + 60, 70, 2, dark)
        _rays(draw, cx, cy - 60, 6, 22, 8, gold, 2)
    elif kind == "columns":
        draw.polygon([(cx - 85, cy - 50), (cx, cy - 85), (cx + 85, cy - 50)], outline=gold, fill=deep)
        for ox in (-60, -30, 0, 30, 60):
            draw.rectangle([cx + ox - 8, cy - 46, cx + ox + 8, cy + 60], outline=gold, fill=deep, width=2)
        draw.line([(cx - 85, cy + 66), (cx + 85, cy + 66)], fill=gold, width=4)
    elif kind == "cliff_relief":
        draw.polygon([(cx - 90, cy + 80), (cx - 70, cy - 80), (cx + 70, cy - 80), (cx + 90, cy + 80)], fill=deep, outline=gold)
        for ox in (-40, 0, 40):
            draw.rectangle([cx + ox - 14, cy - 50, cx + ox + 14, cy + 30], outline=pale, width=2)
        draw.ellipse([cx - 10, cy - 70, cx + 10, cy - 58], fill=accent)
    elif kind == "winged_disc":
        draw.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], outline=gold, fill=accent, width=3)
        for k in range(4):
            draw.line([(cx - 24, cy - 8 + k * 6), (cx - 90 + k * 8, cy - 18 + k * 8)], fill=pale, width=4)
            draw.line([(cx + 24, cy - 8 + k * 6), (cx + 90 - k * 8, cy - 18 + k * 8)], fill=pale, width=4)
        draw.line([(cx, cy + 22), (cx, cy + 64)], fill=gold, width=4)
    elif kind == "kantele":
        draw.polygon([(cx - 80, cy + 40), (cx - 60, cy - 50), (cx + 80, cy - 20), (cx + 70, cy + 50)], outline=gold, fill=deep)
        for k in range(5):
            draw.line([(cx - 60 + k * 4, cy - 38 + k * 16), (cx + 68, cy - 14 + k * 12)], fill=pale, width=2)
    elif kind == "mill":
        draw.ellipse([cx - 70, cy - 70, cx + 70, cy + 70], outline=gold, fill=deep, width=4)
        for k, col in enumerate((accent, pale, gold)):
            a0 = k * 120
            draw.pieslice([cx - 60, cy - 60, cx + 60, cy + 60], start=a0, end=a0 + 110, fill=col)
        draw.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=deep, outline=gold, width=3)
    elif kind == "swan":
        _waves(draw, cx, cy + 50, 80, 2, dark)
        draw.ellipse([cx - 50, cy + 10, cx + 40, cy + 46], fill=pale)
        draw.arc([cx + 10, cy - 70, cx + 60, cy + 30], start=180, end=300, fill=pale, width=9)
        draw.polygon([(cx + 18, cy - 60), (cx - 2, cy - 54), (cx + 18, cy - 50)], fill=gold)
    elif kind == "fish":
        draw.ellipse([cx - 70, cy - 26, cx + 40, cy + 26], outline=gold, fill=deep, width=4)
        draw.polygon([(cx + 36, cy), (cx + 80, cy - 30), (cx + 80, cy + 30)], fill=accent, outline=gold)
        draw.ellipse([cx - 52, cy - 10, cx - 40, cy + 2], fill=pale)
        for ox in range(-30, 30, 14):
            draw.arc([cx + ox, cy - 20, cx + ox + 20, cy + 20], start=270, end=90, fill=dark, width=2)
    elif kind == "sea_monster":
        _waves(draw, cx, cy + 30, 85, 3, dark)
        _serpent(draw, cx, cy - 10, gold, pale, 1)
        draw.polygon([(cx - 30, cy - 50), (cx - 10, cy - 80), (cx + 10, cy - 50)], fill=accent)
    elif kind == "elk":
        draw.ellipse([cx - 50, cy, cx + 40, cy + 44], fill=deep, outline=gold, width=3)
        draw.line([(cx + 32, cy + 10), (cx + 56, cy - 30)], fill=gold, width=12)
        for side in (-1, 1):
            draw.arc([cx + 30 + side * 30 - 30, cy - 90, cx + 30 + side * 30 + 30, cy - 30], start=180, end=360, fill=pale, width=4)
        for lx in (-40, -20, 20, 32):
            draw.line([(cx + lx, cy + 40), (cx + lx, cy + 80)], fill=gold, width=5)
    elif kind == "underworld_river":
        draw.polygon([(cx - 70, cy - 70), (cx + 70, cy - 70), (cx + 40, cy + 20), (cx - 40, cy + 20)], outline=gold, fill=deep)
        _waves(draw, cx, cy + 36, 80, 3, pale, 3, 14)
    elif kind == "northern_lights":
        for k in range(4):
            draw.arc([cx - 90, cy - 80 + k * 12, cx + 90, cy + 20 + k * 12], start=200, end=340, fill=accent if k % 2 else pale, width=4)
        _peak(draw, cx, cy + 50, 80, 50, gold, pale, deep)
    elif kind == "village_lake":
        _waves(draw, cx, cy + 40, 80, 2, pale)
        for ox in (-45, 0, 45):
            draw.polygon([(cx + ox - 20, cy + 20), (cx + ox, cy - 6), (cx + ox + 20, cy + 20)], outline=gold, fill=deep)
            draw.rectangle([cx + ox - 16, cy + 20, cx + ox + 16, cy + 34], outline=gold, fill=deep)
        for tx in (-80, 80):
            draw.polygon([(cx + tx, cy - 50), (cx + tx - 14, cy + 20), (cx + tx + 14, cy + 20)], fill=dark, outline=gold)
    elif kind == "bear_cave":
        draw.arc([cx - 90, cy - 70, cx + 90, cy + 110], start=180, end=360, fill=gold, width=6)
        draw.ellipse([cx - 36, cy - 10, cx + 36, cy + 50], fill=deep, outline=pale, width=3)
        draw.ellipse([cx - 22, cy - 40, cx + 22, cy], fill=deep, outline=pale, width=3)
        draw.ellipse([cx - 24, cy - 48, cx - 12, cy - 36], fill=pale)
        draw.ellipse([cx + 12, cy - 48, cx + 24, cy - 36], fill=pale)
        for sx in (-70, 70):
            draw.line([(cx + sx, cy + 60), (cx + sx, cy + 20)], fill=accent, width=4)
    elif kind == "tree_altar":
        draw.line([(cx, cy + 70), (cx, cy - 20)], fill=gold, width=8)
        draw.ellipse([cx - 70, cy - 90, cx + 70, cy], outline=pale, fill=deep, width=3)
        draw.rectangle([cx - 50, cy + 60, cx + 50, cy + 80], outline=gold, fill=deep, width=3)
    elif kind == "crow_sun":
        _sun(draw, cx, cy, accent, gold, pale, 48)
        draw.ellipse([cx - 22, cy - 18, cx + 18, cy + 12], fill=bg)
        draw.polygon([(cx + 14, cy - 10), (cx + 32, cy - 4), (cx + 14, cy + 2)], fill=bg)
        for lx in (-12, 0, 12):
            draw.line([(cx + lx, cy + 10), (cx + lx, cy + 34)], fill=bg, width=4)
    elif kind == "flute":
        _waves(draw, cx, cy + 40, 80, 2, dark)
        draw.line([(cx - 80, cy + 10), (cx + 80, cy - 30)], fill=pale, width=12)
        for k in range(5):
            x = cx - 50 + k * 22
            y = cy + 2 - k * 5.5
            draw.ellipse([x - 4, y - 4, x + 4, y + 4], fill=bg)
    elif kind == "seals":
        for ox in (-55, 0, 55):
            draw.rectangle([cx + ox - 22, cy - 22, cx + ox + 22, cy + 22], outline=gold, fill=accent, width=3)
            draw.rectangle([cx + ox - 10, cy - 10, cx + ox + 10, cy + 10], outline=pale, width=2)
        draw.arc([cx - 90, cy - 90, cx + 90, cy + 90], start=200, end=340, fill=pale, width=3)
    elif kind == "flower":
        draw.line([(cx, cy + 80), (cx, cy - 10)], fill=gold, width=5)
        for k in range(8):
            a = k * math.pi / 4
            px, py = cx + 30 * math.cos(a), cy - 40 + 30 * math.sin(a)
            draw.ellipse([px - 16, py - 16, px + 16, py + 16], outline=pale, fill=accent, width=2)
        draw.ellipse([cx - 12, cy - 52, cx + 12, cy - 28], fill=pale)
    elif kind == "water_flower":
        _waves(draw, cx, cy + 40, 80, 2, pale)
        draw.ellipse([cx - 60, cy + 4, cx - 20, cy + 40], outline=gold, fill=deep, width=3)
        for k in range(6):
            a = k * math.pi / 3
            px, py = cx + 30 + 22 * math.cos(a), cy - 30 + 22 * math.sin(a)
            draw.ellipse([px - 12, py - 12, px + 12, py + 12], outline=pale, fill=accent, width=2)
    elif kind == "well":
        draw.ellipse([cx - 60, cy + 20, cx + 60, cy + 60], outline=gold, fill=deep, width=4)
        draw.ellipse([cx - 22, cy - 60, cx + 22, cy - 4], outline=pale, fill=accent, width=3)
        _rays(draw, cx, cy - 32, 34, 56, 10, pale, 2)
    elif kind == "sea_rock":
        _waves(draw, cx, cy + 30, 85, 3, pale, 2, 16)
        draw.polygon([(cx - 40, cy + 30), (cx - 20, cy - 20), (cx + 20, cy - 26), (cx + 44, cy + 30)], fill=deep, outline=gold)
        draw.arc([cx - 70, cy - 90, cx + 70, cy - 10], start=200, end=340, fill=accent, width=6)
    elif kind == "dragon":
        _waves(draw, cx, cy + 50, 80, 2, dark)
        _serpent(draw, cx, cy - 6, gold, pale, 1)
        for ox in range(-60, 70, 20):
            draw.polygon([(cx + ox, cy - 20), (cx + ox + 6, cy - 36), (cx + ox + 12, cy - 20)], fill=accent)
    elif kind == "beast":
        draw.ellipse([cx - 60, cy - 10, cx + 50, cy + 50], outline=gold, fill=deep, width=3)
        draw.ellipse([cx + 20, cy - 60, cx + 80, cy], outline=gold, fill=deep, width=3)
        draw.polygon([(cx + 44, cy - 60), (cx + 50, cy - 90), (cx + 58, cy - 60)], fill=pale)
        for lx in (-44, -20, 14, 36):
            draw.line([(cx + lx, cy + 46), (cx + lx, cy + 80)], fill=gold, width=6)
        _flame(draw, cx - 64, cy - 26, 26, accent, pale)
    elif kind == "gate_below":
        draw.arc([cx - 70, cy - 90, cx + 70, cy + 50], start=180, end=360, fill=gold, width=6)
        draw.line([(cx - 70, cy - 20), (cx - 70, cy + 70)], fill=gold, width=6)
        draw.line([(cx + 70, cy - 20), (cx + 70, cy + 70)], fill=gold, width=6)
        for k in range(4):
            y = cy + 10 + k * 16
            draw.line([(cx - 50 + k * 8, y), (cx + 50 - k * 8, y)], fill=pale, width=3)
    elif kind == "tiger":
        draw.ellipse([cx - 60, cy - 10, cx + 50, cy + 50], outline=gold, fill=accent, width=3)
        draw.ellipse([cx + 20, cy - 56, cx + 76, cy], outline=gold, fill=accent, width=3)
        for ox in range(-50, 50, 16):
            draw.line([(cx + ox, cy - 6), (cx + ox + 6, cy + 30)], fill=bg, width=4)
        for lx in (-44, -20, 14, 36):
            draw.line([(cx + lx, cy + 46), (cx + lx, cy + 80)], fill=gold, width=6)
    elif kind == "lyre":
        # tortoise-shell sound box, two curved arms, crossbar and strings
        draw.ellipse([cx - 44, cy + 26, cx + 44, cy + 78], outline=gold, fill=deep, width=4)
        draw.arc([cx - 70, cy - 90, cx + 6, cy + 60], start=110, end=250, fill=pale, width=8)
        draw.arc([cx - 6, cy - 90, cx + 70, cy + 60], start=290, end=70, fill=pale, width=8)
        draw.line([(cx - 52, cy - 62), (cx + 52, cy - 62)], fill=gold, width=7)
        for k in range(5):
            x = cx - 22 + k * 11
            draw.line([(x, cy - 58), (x, cy + 40)], fill=pale, width=2)
        draw.ellipse([cx - 8, cy + 44, cx + 8, cy + 60], fill=accent)
        for sx, sy in [(-62, -84), (62, -84)]:
            draw.ellipse([cx + sx - 7, cy + sy - 7, cx + sx + 7, cy + sy + 7], fill=gold)
    elif kind == "hammer":
        # short-hafted hammer under a thunder arc
        draw.arc([cx - 92, cy - 96, cx + 92, cy + 30], start=200, end=340, fill=accent, width=5)
        draw.polygon([(cx - 70, cy - 46), (cx + 70, cy - 46), (cx + 62, cy + 2), (cx - 62, cy + 2)], fill=deep, outline=gold, width=4)
        draw.line([(cx - 52, cy - 22), (cx + 52, cy - 22)], fill=pale, width=3)
        draw.rectangle([cx - 10, cy + 2, cx + 10, cy + 76], fill=gold, outline=pale, width=2)
        for y in (18, 34, 50):
            draw.line([(cx - 10, cy + y), (cx + 10, cy + y + 8)], fill=dark, width=2)
        draw.ellipse([cx - 14, cy + 72, cx + 14, cy + 94], outline=gold, fill=deep, width=4)
        draw.line([(cx + 38, cy - 92), (cx + 22, cy - 62), (cx + 40, cy - 62), (cx + 24, cy - 50)], fill=pale, width=4)
    else:
        # Unknown emblem name: a plain rosette, so a typo is visible but harmless.
        draw.ellipse([cx - 50, cy - 50, cx + 50, cy + 50], outline=pale, fill=accent, width=3)
        _rays(draw, cx, cy, 56, 76, 12, gold, 2)
    return True
