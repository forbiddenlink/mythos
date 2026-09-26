"""Shared renderer for the procedural catalog plates.

Every generate_*_plates.py script keeps its own list of entities and its own
emblem drawings (the motif vocabulary). This module turns an emblem into a
finished plate:

* a full-bleed, layered ground (value-noise atmosphere, tone-dependent
  engraving hatch, guilloche or sunburst behind the medallion, star fields,
  distant ridges, parchment fibres, vignette and grain), chosen per entity
  kind so bestiary, geography, story and reliquary plates do not look alike;
* a medallion with a tradition-specific border band (meander, braid, lotus,
  wave scallops, stepped fret, rays, or bead-and-reel), drawn at 3x and
  downsampled for clean edges;
* the emblem itself, redrawn through a scaling proxy at 3x, then finished as
  embossed gold with enamel accents, a soft drop shadow and a glow.

Plates carry no text: the site prints names in HTML, and a caption baked into
the art would be cropped differently by every card. The composition keeps the
medallion inside the centre square so 1:1, 4:5, 3:4, 16:10 and 16:9 crops all
hold the emblem.

Aboriginal Australian and Diné entries use ``render_abstract_plate``: a plain
landscape (sky, horizon, ridge, river, sun or moon, a few stars) with no
medallion, no border ornament and none of the culturally owned visual forms
listed in generate_tradition_plates.py.

Deterministic: every random field is seeded from the entity id. Requires
Pillow and numpy.
"""

from __future__ import annotations

import json
import math
import zlib
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from _repo_paths import DATA_DIR

SS = 3  # supersampling factor for vector layers
WEBP_QUALITY = 80

GOLD = (212, 175, 55)
GOLD_PALE = (246, 226, 160)
BRONZE = (150, 100, 50)
PATINA = (86, 140, 124)
PARCHMENT = (240, 228, 204)
MIDNIGHT = (12, 14, 24)

# Metallic ramp: luminance of the drawn emblem -> gold leaf tone.
_GOLD_RAMP = [
    (0.00, (34, 22, 10)),
    (0.22, (92, 60, 24)),
    (0.45, (168, 122, 46)),
    (0.65, (214, 172, 72)),
    (0.82, (240, 212, 130)),
    (1.00, (255, 246, 214)),
]

# Border band per tradition. Keys are pantheon ids.
BANDS = {
    "greek-pantheon": "meander", "roman-pantheon": "meander",
    "norse-pantheon": "braid", "celtic-pantheon": "braid",
    "slavic-pantheon": "braid", "finnish-pantheon": "braid",
    "egyptian-pantheon": "lotus", "hindu-pantheon": "lotus",
    "mesopotamian-pantheon": "lotus", "persian-pantheon": "lotus",
    "canaanite-pantheon": "lotus", "hittite-pantheon": "rays",
    "japanese-pantheon": "wave", "chinese-pantheon": "wave",
    "korean-pantheon": "wave", "polynesian-pantheon": "wave",
    "inuit-pantheon": "wave",
    "aztec-pantheon": "step", "mesoamerican-pantheon": "step",
    "inca-pantheon": "step",
}
DEFAULT_BAND = "beads"

ABSTRACT_PANTHEONS = {"aboriginal-australian-pantheon", "dine-pantheon"}

CATALOG_FILES = {
    "deity": "deities.json", "hero": "heroes.json", "creature": "creatures.json",
    "artifact": "artifacts.json", "location": "locations.json",
    "story": "stories.json",
}


@lru_cache(maxsize=None)
def _catalog_pantheons(kind: str) -> dict:
    name = CATALOG_FILES.get(kind)
    if not name:
        return {}
    records = json.loads((DATA_DIR / name).read_text(encoding="utf-8"))
    return {r["id"]: r.get("pantheonId") for r in records}


def pantheon_of(kind: str, entity_id: str) -> str | None:
    """Pantheon id for a catalog entity, or None when it is not catalogued."""
    return _catalog_pantheons(kind).get(entity_id)


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------

def _seed(key: str) -> int:
    return zlib.crc32(key.encode("utf-8"))


def _c(rgb) -> np.ndarray:
    return np.array(rgb, dtype=np.float32) / 255.0


def _mix(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def _smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def _box(a: np.ndarray, r: int, axis: int) -> np.ndarray:
    if r < 1:
        return a
    pad = [(0, 0), (0, 0)]
    pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(a, pad, mode="edge"), axis=axis, dtype=np.float64)
    n = a.shape[axis]
    hi = np.take(c, np.arange(2 * r + 1, 2 * r + 1 + n), axis=axis)
    lo = np.take(c, np.arange(0, n), axis=axis)
    return ((hi - lo) / (2 * r + 1)).astype(np.float32)


def _blur(arr: np.ndarray, sigma: float) -> np.ndarray:
    """Approximate Gaussian blur (three box passes) of a float array."""
    r = max(1, int(round((math.sqrt(12 * sigma * sigma / 3 + 1) - 1) / 2)))
    out = arr.astype(np.float32)
    for _ in range(3):
        out = _box(_box(out, r, 0), r, 1)
    return out


def _fbm(h, w, rng, base=6, octaves=4, persistence=0.55):
    """Fractal value noise in [0,1], shape (h, w)."""
    out = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        cells = base * (2 ** o)
        gh = max(2, int(cells * h / max(w, h)) + 2)
        gw = max(2, int(cells * w / max(w, h)) + 2)
        grid = rng.random((gh, gw)).astype(np.float32)
        layer = Image.fromarray(grid, mode="F").resize((w, h), Image.Resampling.BICUBIC)
        out += amp * np.asarray(layer, np.float32)
        total += amp
        amp *= persistence
    out /= total
    lo, hi = out.min(), out.max()
    return (out - lo) / (hi - lo + 1e-6)


def _ramp(x: np.ndarray, stops) -> np.ndarray:
    xs = np.array([s[0] for s in stops], np.float32)
    cols = np.array([s[1] for s in stops], np.float32) / 255.0
    out = np.empty(x.shape + (3,), np.float32)
    for ch in range(3):
        out[..., ch] = np.interp(x, xs, cols[:, ch])
    return out


def _screen(base, top, alpha):
    a = alpha[..., None]
    return base + (1 - (1 - base) * (1 - top) - base) * a


def _over(base, top, alpha):
    a = alpha[..., None]
    return base * (1 - a) + top * a


# ---------------------------------------------------------------------------
# Supersampled vector drawing
# ---------------------------------------------------------------------------

def _flat(xy):
    out = []
    for p in xy:
        if isinstance(p, (tuple, list)):
            out.extend(p)
        else:
            out.append(p)
    return out


class ScaledDraw:
    """ImageDraw proxy: maps emblem coordinates onto a supersampled layer.

    Emblem code is written for a ~768px plate with the emblem centred on
    (cx, cy). The proxy scales every coordinate and stroke width about that
    centre by ``k`` and places it at (ox, oy) on the target layer.
    """

    def __init__(self, draw, cx, cy, ox, oy, k, stroke=1.0):
        self._d, self.cx, self.cy, self.ox, self.oy, self.k = draw, cx, cy, ox, oy, k
        self.stroke = stroke  # extra weight so thin line motifs read at thumbnail size

    def _pts(self, xy):
        f = _flat(xy)
        return [((f[i] - self.cx) * self.k + self.ox, (f[i + 1] - self.cy) * self.k + self.oy)
                for i in range(0, len(f), 2)]

    def _box(self, xy):
        (x0, y0), (x1, y1) = self._pts(xy)[:2]
        return [min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1)]

    def _w(self, width):
        return max(1, int(round((width or 1) * self.k * self.stroke)))

    def line(self, xy, fill=None, width=1, joint=None):
        self._d.line(self._pts(xy), fill=fill, width=self._w(width), joint=joint)

    def polygon(self, xy, fill=None, outline=None, width=1):
        self._d.polygon(self._pts(xy), fill=fill, outline=outline, width=self._w(width))

    def ellipse(self, xy, fill=None, outline=None, width=1):
        self._d.ellipse(self._box(xy), fill=fill, outline=outline, width=self._w(width))

    def rectangle(self, xy, fill=None, outline=None, width=1):
        self._d.rectangle(self._box(xy), fill=fill, outline=outline, width=self._w(width))

    def rounded_rectangle(self, xy, radius=0, fill=None, outline=None, width=1):
        self._d.rounded_rectangle(self._box(xy), radius=radius * self.k, fill=fill, outline=outline, width=self._w(width))

    def arc(self, xy, start, end, fill=None, width=1):
        self._d.arc(self._box(xy), start, end, fill=fill, width=self._w(width))

    def pieslice(self, xy, start, end, fill=None, outline=None, width=1):
        self._d.pieslice(self._box(xy), start, end, fill=fill, outline=outline, width=self._w(width))

    def chord(self, xy, start, end, fill=None, outline=None, width=1):
        self._d.chord(self._box(xy), start, end, fill=fill, outline=outline, width=self._w(width))

    def point(self, xy, fill=None):
        for x, y in self._pts(xy):
            self._d.ellipse([x - self.k / 2, y - self.k / 2, x + self.k / 2, y + self.k / 2], fill=fill)

    def text(self, *args, **kwargs):  # emblems never carry text on the new plates
        return None


def _layer(w, h):
    img = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def _down(img, w, h) -> np.ndarray:
    small = img.resize((w, h), Image.Resampling.LANCZOS)
    return np.asarray(small, np.float32) / 255.0


# ---------------------------------------------------------------------------
# Border bands wrapped around the medallion
# ---------------------------------------------------------------------------

def _superellipse(th, a, b, p):
    c, s_ = np.abs(np.cos(th)) / a, np.abs(np.sin(th)) / b
    return (c ** p + s_ ** p) ** (-1.0 / p)


def shape_factor(shape: str, th):
    """Radius of a medallion outline at angle ``th``, relative to a circle.

    Works on floats and numpy arrays. Angles follow image axes (y down).
    """
    th = np.asarray(th, dtype=np.float64)
    if shape == "quatrefoil":  # four lobes on the axes, soft cusps on the diagonals
        out = 0.8 + 0.2 * np.abs(np.cos(2 * th)) ** 0.45
    elif shape == "arch":  # round head, straighter jambs and sill
        lower = _superellipse(th, 1.0, 1.16, 5.0)
        out = np.where(np.sin(th) < 0, 1.0, lower)
    elif shape == "squircle":
        out = 0.9 * _superellipse(th, 1.0, 1.0, 4.0)
    elif shape == "lozenge":
        out = 1.1 * _superellipse(th, 1.0, 1.0, 1.35)
    else:
        out = np.ones_like(th)
    return out if out.ndim else float(out)


SHAPES = {"deity": "circle", "hero": "circle", "pantheon": "circle", "cover": "circle",
          "creature": "quatrefoil", "location": "arch", "story": "squircle", "artifact": "lozenge"}


@lru_cache(maxsize=None)
def _arc_table(shape: str):
    th = np.linspace(-math.pi / 2, 3 * math.pi / 2, 4097)
    r = shape_factor(shape, th)
    x, y = r * np.cos(th), r * np.sin(th)
    seg = np.hypot(np.diff(x), np.diff(y))
    s_ = np.concatenate([[0.0], np.cumsum(seg)])
    return th, s_ / s_[-1], float(s_[-1])


def _polar(cx, cy, r0, r1, n, shape="circle"):
    """Return f(i, u, v): band cell i, along u, across v -> layer pixels.

    Cells are spaced evenly by arc length around the shape's outline.
    """
    th_tab, s_tab, _ = _arc_table(shape)

    def f(i, u, v):
        a = float(np.interp(((i + u) / n) % 1.0, s_tab, th_tab))
        r = (r0 + v * (r1 - r0)) * shape_factor(shape, a)
        return (cx + r * math.cos(a), cy + r * math.sin(a))
    return f


def _perimeter(shape, r):
    return _arc_table(shape)[2] * r


def _densify(pts, steps=6):
    out = []
    for (u0, v0), (u1, v1) in zip(pts, pts[1:]):
        for s in range(steps):
            t = s / steps
            out.append((u0 + (u1 - u0) * t, v0 + (v1 - v0) * t))
    out.append(pts[-1])
    return out


def _band(d, kind, cx, cy, r0, r1, col, dark, width, shape="circle"):
    """Draw one tradition band between radii r0 < r1 on a supersampled layer."""
    circ = _perimeter(shape, (r0 + r1) / 2)
    depth = r1 - r0
    if kind == "meander":
        n = int(circ / (depth * 1.25))
        f = _polar(cx, cy, r0, r1, n, shape)
        hook = [(0.0, 0.0), (0.0, 0.86), (0.72, 0.86), (0.72, 0.26), (0.3, 0.26), (0.3, 0.56), (0.5, 0.56)]
        for i in range(n):
            d.line([f(i, u, v) for u, v in _densify(hook)], fill=col, width=width, joint="curve")
            d.line([f(i, u, 0.0) for u in np.linspace(0, 1, 12)], fill=col, width=width)
    elif kind == "braid":
        n = int(circ / (depth * 1.6))
        f = _polar(cx, cy, r0, r1, n, shape)
        for i in range(n):
            for half in (0, 1):
                us = np.linspace(half * 0.5, half * 0.5 + 0.5, 16)
                a = [f(i, u, 0.5 + 0.36 * math.sin(2 * math.pi * u)) for u in us]
                b = [f(i, u, 0.5 - 0.36 * math.sin(2 * math.pi * u)) for u in us]
                under, over = (a, b) if (i + half) % 2 else (b, a)
                d.line(under, fill=col, width=width, joint="curve")
                d.line(over, fill=dark, width=width * 3, joint="curve")
                d.line(over, fill=col, width=width, joint="curve")
            # eyes of the braid
            for u in (0.25, 0.75):
                x, y = f(i, u, 0.5)
                e = depth * 0.07
                d.ellipse([x - e, y - e, x + e, y + e], fill=col)
    elif kind == "lotus":
        n = int(circ / (depth * 0.95))
        f = _polar(cx, cy, r0, r1, n, shape)
        for i in range(n):
            outer = [(0.5 + 0.42 * math.cos(t) * (1 - math.sin(t) * 0.25), 0.05 + 0.9 * math.sin(t) ** 1.4)
                     for t in np.linspace(0, math.pi, 24)]
            d.line([f(i, u, v) for u, v in outer], fill=col, width=width, joint="curve")
            inner = [(0.5 + 0.2 * math.cos(t), 0.05 + 0.55 * math.sin(t) ** 1.2) for t in np.linspace(0, math.pi, 18)]
            d.line([f(i, u, v) for u, v in inner], fill=col, width=max(1, width - 1), joint="curve")
            x, y = f(i, 1.0, 0.72)
            e = depth * 0.08
            d.ellipse([x - e, y - e, x + e, y + e], fill=col)
        d.line([f(0, u, 0.02) for u in np.linspace(0, n, n * 12)], fill=col, width=width)
    elif kind == "wave":
        n = int(circ / (depth * 1.1))
        f = _polar(cx, cy, r0, r1, n, shape)
        for i in range(n):
            for rr in (0.48, 0.33, 0.18):
                arc = [(0.5 + rr * math.cos(t), 0.04 + 1.9 * rr * math.sin(t)) for t in np.linspace(0, math.pi, 22)]
                d.line([f(i, u, v) for u, v in arc], fill=col, width=width if rr > 0.3 else max(1, width - 1), joint="curve")
    elif kind == "step":
        n = int(circ / (depth * 1.5))
        f = _polar(cx, cy, r0, r1, n, shape)
        prof = [(0, 0.08), (0.14, 0.08), (0.14, 0.36), (0.28, 0.36), (0.28, 0.64), (0.42, 0.64), (0.42, 0.92),
                (0.58, 0.92), (0.58, 0.64), (0.72, 0.64), (0.72, 0.36), (0.86, 0.36), (0.86, 0.08), (1, 0.08)]
        for i in range(n):
            d.line([f(i, u, v) for u, v in _densify(prof, 4)], fill=col, width=width, joint="curve")
            sq = [(0.44, 0.3), (0.56, 0.3), (0.56, 0.5), (0.44, 0.5)]
            d.polygon([f(i, u, v) for u, v in sq], fill=col)
    elif kind == "rays":
        n = int(circ / (depth * 0.32))
        f = _polar(cx, cy, r0, r1, n, shape)
        for i in range(n):
            top = 0.95 if i % 2 == 0 else 0.6
            d.line([f(i, 0.5, 0.05), f(i, 0.5, top)], fill=col, width=width)
            if i % 4 == 0:
                x, y = f(i, 0.5, 0.95)
                e = depth * 0.09
                d.ellipse([x - e, y - e, x + e, y + e], fill=col)
    else:  # bead-and-reel
        n = int(circ / (depth * 0.9))
        f = _polar(cx, cy, r0, r1, n, shape)
        for i in range(n):
            bead = [f(i, 0.34 + 0.26 * math.cos(t), 0.5 + 0.3 * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 28)]
            d.polygon(bead, fill=col)
            for u in (0.76, 0.9):
                x, y = f(i, u, 0.5)
                e = depth * 0.1
                d.ellipse([x - e, y - e, x + e, y + e], fill=col)


def _ring(d, cx, cy, r, col, width, shape="circle"):
    if shape == "circle":
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=width)
        return
    th = np.linspace(0, 2 * math.pi, 721)
    rr = r * shape_factor(shape, th)
    pts = list(zip(cx + rr * np.cos(th), cy + rr * np.sin(th)))
    d.line(pts + pts[1:3], fill=col, width=width, joint="curve")


def _laurel(d, cx, cy, r, col, dark, s):
    """Two laurel branches meeting under the medallion (hero plates)."""
    for side in (-1, 1):
        for j in range(15):
            a = math.pi / 2 + side * (math.radians(12) + j * math.radians(9.5))
            px, py = cx + r * math.cos(a), cy + r * math.sin(a)
            # leaf orientation: along the tangent, tilted outward
            tang = a + side * math.pi / 2
            for off in (-1, 1):
                la = tang + off * 0.6 - side * 0.15
                L = s * (1.05 - j * 0.03)
                lw = L * 0.42
                pts = []
                for q in list(np.linspace(0, math.pi, 12)) + list(np.linspace(math.pi, 2 * math.pi, 12)):
                    along = L * (1 - math.cos(q)) / 2 if q <= math.pi else L * (1 + math.cos(q - math.pi)) / 2
                    across = lw / 2 * math.sin(q) ** 0.8 if q <= math.pi else -lw / 2 * abs(math.sin(q)) ** 0.8
                    pts.append((px + along * math.cos(la) - across * math.sin(la),
                                py + along * math.sin(la) + across * math.cos(la)))
                d.polygon(pts, fill=col, outline=dark)
                d.line([pts[0], (px + L * 0.8 * math.cos(la), py + L * 0.8 * math.sin(la))], fill=dark, width=max(1, int(s * 0.04)))
        stem = [(cx + r * math.cos(math.pi / 2 + side * (math.radians(12) + q * math.radians(9.5))),
                 cy + r * math.sin(math.pi / 2 + side * (math.radians(12) + q * math.radians(9.5)))) for q in np.linspace(0, 14.5, 40)]
        d.line(stem, fill=col, width=max(2, int(s * 0.12)), joint="curve")
    # ribbon knot
    e = s * 0.35
    d.ellipse([cx - e, cy + r - e, cx + e, cy + r + e], fill=col, outline=dark)


def _edge(d, style, cx, cy, R, U, pale, col, dark, shape="circle"):
    """Outer rim of the medallion: studs, scallops, star points or beads."""
    per = _perimeter(shape, R) / (2 * math.pi * R)  # outline length vs a circle
    if style == "scallop":
        n = int(32 * per)
        f = _polar(cx, cy, R, R + U * 0.02, n, shape)
        for i in range(n):
            pts = [f(i, u, 0.2 + 0.8 * math.sin(math.pi * u)) for u in np.linspace(0, 1, 14)]
            d.line(pts, fill=col, width=max(2, int(U * 0.004)), joint="curve")
    elif style == "points":
        n = int(24 * per) // 3 * 3
        for i in range(n):
            L = U * (0.05 if i % 3 == 0 else 0.028)
            wa = 0.2 if i % 3 == 0 else 0.13
            f = _polar(cx, cy, R, R + L, n, shape)
            pts = [f(i, 0.5 - wa, 0), f(i, 0.5, 1), f(i, 0.5 + wa, 0)]
            d.polygon(pts, fill=col if i % 3 else pale, outline=dark)
    elif style == "beaded":
        n = int(48 * per) // 4 * 4
        f = _polar(cx, cy, R + U * 0.016, R + U * 0.016, n, shape)
        for i in range(n):
            x, y = f(i, 0.5, 0)
            r = U * (0.007 if i % 4 else 0.011)
            d.ellipse([x - r, y - r, x + r, y + r], fill=col if i % 4 else pale, outline=dark)
    n = 4 if style != "studs" else 8
    for k in range(n):  # cardinal studs
        a = -math.pi / 2 + k * 2 * math.pi / n
        big = style == "studs" and k % 2 == 1
        rr = R * shape_factor(shape, a)
        x, y = cx + rr * math.cos(a), cy + rr * math.sin(a)
        e = U * (0.012 if big else 0.018)
        # a lozenge pointing along the radius
        ca, sa = math.cos(a), math.sin(a)
        pts = [(x + ca * e * 1.5, y + sa * e * 1.5), (x - sa * e, y + ca * e),
               (x - ca * e * 1.5, y - sa * e * 1.5), (x + sa * e, y - ca * e)]
        d.polygon(pts, fill=pale, outline=dark)


def _colophon(d, x, y, U, col, dark):
    """Printer's ornament under the medallion on portrait plates."""
    e = U * 0.016
    d.polygon([(x, y - e * 1.6), (x + e, y), (x, y + e * 1.6), (x - e, y)], fill=col, outline=dark)
    for side in (-1, 1):
        x0 = x + side * e * 2.2
        x1 = x + side * U * 0.26
        steps = 24
        for i in range(steps):  # rule tapering away from the centre
            t0, t1 = i / steps, (i + 1) / steps
            wd = max(1, int(U * 0.0045 * (1 - t0) ** 1.5))
            d.line([(x0 + (x1 - x0) * t0, y), (x0 + (x1 - x0) * t1, y)], fill=col, width=wd)
        for k, rr in ((0.1, 0.006), (0.2, 0.004)):
            cx = x + side * U * k
            r = U * rr
            d.ellipse([cx - r, y - U * 0.02 - r, cx + r, y - U * 0.02 + r], fill=col)
            d.ellipse([cx - r, y + U * 0.02 - r, cx + r, y + U * 0.02 + r], fill=col)


# ---------------------------------------------------------------------------
# Finishing: metal, enamel, emboss, shadow, glow
# ---------------------------------------------------------------------------

def _dilate(a: np.ndarray, r: int) -> np.ndarray:
    img = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "L")
    return np.asarray(img.filter(ImageFilter.MaxFilter(2 * r + 1)), np.float32) / 255.0


def _erode(a: np.ndarray, r: int) -> np.ndarray:
    img = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "L")
    return np.asarray(img.filter(ImageFilter.MinFilter(2 * r + 1)), np.float32) / 255.0


def _metalize(layer: np.ndarray, cx, cy, radius, accent, enamel=True, groove=0):
    """Turn a drawn RGBA layer into embossed gold with enamel accents."""
    rgb, a = layer[..., :3], layer[..., 3]
    safe = np.maximum(a, 1e-4)[..., None]
    rgb = np.clip(rgb / safe, 0, 1)  # un-premultiply the Lanczos edge
    h, w = a.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    lum = rgb @ np.array([0.3, 0.59, 0.11], np.float32)
    sheen = -0.16 * ((xx - cx) + (yy - cy)) / (radius * 1.4)
    # repousse relief: broad shapes swell towards their middle and catch the
    # light on their upper-left flank
    dome = _blur(a, max(2.0, radius * 0.03))
    dgy, dgx = np.gradient(dome)
    relief = -(dgx * 0.6 + dgy * 0.8) * radius * 0.09
    metal = _ramp(np.clip(lum * 1.05 + 0.08 + sheen + 0.22 * (dome - 0.6) + relief, 0, 1), _GOLD_RAMP)
    out = metal
    if groove:
        # engraver's hatching on the shadowed side of broad shapes
        inner = _erode(a, groove * 2)
        phase = (xx - yy) / max(3.0, radius * 0.022)
        lines = _smooth(0.4, 0.9, 0.5 + 0.5 * np.cos(2 * math.pi * phase))
        hatch = inner * lines * np.clip(-relief * 3.0 - 0.05, 0, 1)
        out = out * (1 - 0.35 * hatch[..., None])
    if enamel:
        acc = _c(accent)
        gold = _c(GOLD)
        if np.abs(acc - gold).sum() > 0.25:
            dist = np.abs(rgb - acc).sum(-1)
            m = np.clip(1 - dist / 0.35, 0, 1)
            enamel_col = np.clip(acc * (0.72 + 0.55 * (0.5 + sheen))[..., None], 0, 1)
            out = _over(out, enamel_col, m * 0.9)
    # engraved inline: a thin groove inset from the edge of every broad stroke
    if groove:
        inner = _erode(a, groove)
        line = np.clip(inner - _erode(inner, 1), 0, 1)
        out = out * (1 - 0.55 * _blur(line, 0.5)[..., None])
    # emboss: light from upper left
    ab = _blur(a, 1.6)
    gy, gx = np.gradient(ab)
    shade = (gx * 0.6 + gy * 0.8) * 2.6
    out = np.clip(out + shade[..., None] * np.array([1.0, 0.92, 0.75], np.float32), 0, 1)
    return out, a




def _composite_emblem(base, layer, cx, cy, radius, accent, glow_col, *, shadow=0.7, glow=0.5,
                      enamel=True, keyline=0, keyline_col=(20, 14, 8), groove=0):
    col, a = _metalize(layer, cx, cy, radius, accent, enamel, groove)
    if keyline:
        # a dark cloisonne keyline so thin strokes read as inlaid metal
        k = np.clip(_blur(_dilate(a, keyline), 0.8), 0, 1)
        base = _over(base, np.broadcast_to(_c(keyline_col), base.shape), k * 0.85)
        a_sh = k
    else:
        a_sh = a
    s = np.roll(_blur(a_sh, 5), (6, 3), axis=(0, 1)) * shadow
    base = base * (1 - s[..., None] * 0.85)
    if glow > 0:
        g = _blur(a, 18) * glow
        base = _screen(base, np.broadcast_to(_c(glow_col), base.shape), np.clip(g * 1.6, 0, 1))
    return _over(base, col, a)


# ---------------------------------------------------------------------------
# Grounds
# ---------------------------------------------------------------------------

def _coords(w, h, cx, cy):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx, dy = xx - cx, yy - cy
    return xx, yy, np.sqrt(dx * dx + dy * dy), np.arctan2(dy, dx)


ATMOSPHERES = ("radiant", "nocturne", "tidal", "verdant", "forge")
_ATMOS_WORDS = [
    ("nocturne", ("night", "moon", "star", "death", "dead", "underworld", "dark", "dream", "shadow", "grave",
                  "ghost", "spirit", "twilight", "winter", "frost", "ice", "cold", "sleep", "fate", "magic", "witch")),
    ("tidal", ("sea", "ocean", "water", "river", "rain", "lake", "flood", "storm", "wave", "fish", "tide",
               "spring", "well", "whale", "boat", "voyage", "navigat")),
    ("forge", ("war", "fire", "forge", "smith", "craft", "weapon", "battle", "blade", "sword", "spear", "hammer",
               "volcano", "flame", "thunder", "lightning", "mace", "bow", "champion", "warrior")),
    ("verdant", ("earth", "harvest", "grain", "forest", "tree", "fertility", "agricult", "hunt", "animal",
                 "field", "flower", "vine", "wine", "healing", "medicine", "bee", "love", "beauty", "garden",
                 "mother", "birth", "maize", "corn", "rice", "herd")),
    ("radiant", ("sun", "sky", "light", "day", "dawn", "king", "creation", "heaven", "order", "wisdom", "law",
                 "gold", "justice", "truth", "sovereign", "ruler", "creator")),
]


def choose_atmosphere(hint: str, key: str) -> str:
    """Pick a ground from the entity's domains/epithet; fall back to the id hash."""
    text = (hint or "").lower()
    best, pos = None, len(text) + 1
    for name, words in _ATMOS_WORDS:
        for word in words:
            i = text.find(word)
            if 0 <= i < pos:
                best, pos = name, i
    return best or ATMOSPHERES[_seed(key) % len(ATMOSPHERES)]


def _ground(kind, w, h, cx, cy, U, bg, accent, rng, atmos="radiant"):
    xx, yy, r, th = _coords(w, h, cx, cy)
    bgc, acc = _c(bg), _c(accent)
    rn = r / (U * 0.72)
    clouds = _fbm(h, w, rng, base=3, octaves=5)
    fine = _fbm(h, w, rng, base=24, octaves=3)

    if kind == "story":
        # Illuminated vellum: warm parchment with fibres, foxing and a burnished edge.
        paper = _c((222, 204, 168))
        edge = _c((120, 84, 46))
        base = paper[None, None, :] * (0.9 + 0.12 * clouds[..., None])
        fibres = np.asarray(Image.fromarray((rng.random((h // 2 + 1, max(2, w // 24))) * 255).astype(np.uint8))
                            .resize((w, h), Image.Resampling.BICUBIC), np.float32) / 255.0
        base = base * (0.96 + 0.06 * fibres[..., None])
        tint = _mix(PARCHMENT, accent, 0.18)
        base = _over(base, np.broadcast_to(_c(tint), base.shape), 0.25 * np.exp(-rn * rn * 2.2))
        stains = _smooth(0.62, 0.9, _fbm(h, w, rng, base=5, octaves=3))
        base = base * (1 - 0.12 * stains[..., None])
        ex = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy)) / (U * 0.5)
        burn = 1 - _smooth(0.0, 0.55, ex + (clouds - 0.5) * 0.18)
        base = _over(base, np.broadcast_to(edge, base.shape), burn * 0.75)
        return base

    center_col = np.clip(bgc * 1.6 + acc * 0.30, 0, 1)
    edge_col = bgc * 0.55
    t = _smooth(0.0, 1.25, rn + (clouds - 0.5) * 0.35)
    base = center_col * (1 - t[..., None]) + edge_col * t[..., None]
    # painterly cloud tint: bronze in the lights, patina in the shadows
    base = _over(base, np.broadcast_to(_c(BRONZE) * 0.35, base.shape), _smooth(0.55, 0.95, clouds) * 0.35)
    base = _over(base, np.broadcast_to(_c(PATINA) * 0.22, base.shape), _smooth(0.55, 0.05, clouds) * 0.25)
    base = base * (0.94 + 0.1 * fine[..., None])

    if atmos == "nocturne":
        # cooler, deeper sky with a faint band of stars
        base = _over(base, np.broadcast_to(_c(MIDNIGHT), base.shape), _smooth(0.2, 1.1, rn) * 0.45)
        base = _stars(base, rng, w, h, density=0.0012, tint=acc)
    elif atmos == "radiant":
        n = 36 if kind != "pantheon" else 48
        rays = 0.5 + 0.5 * np.cos(n * th)
        rays = _smooth(0.55, 1.0, rays) * np.exp(-rn * 1.6) * _smooth(0.28, 0.45, rn)
        base = _screen(base, np.broadcast_to(_c(GOLD_PALE), base.shape), rays * 0.16)
    elif atmos == "tidal":
        # engraved swell: long horizontal wave lines, strongest low on the plate
        wave = np.cos(2 * math.pi * (yy + U * 0.012 * np.sin(xx / (U * 0.06) + yy / (U * 0.11))) / (U * 0.016))
        lines = _smooth(0.75, 1.0, wave) * _smooth(0.2, 1.0, yy / h) * _smooth(0.35, 0.6, rn)
        tone = np.clip(_c(accent) * 0.6 + _c(GOLD_PALE) * 0.4, 0, 1)
        base = _screen(base, np.broadcast_to(tone, base.shape), lines * 0.22)
    elif atmos == "verdant":
        motes = np.zeros((h, w), np.float32)
        n = 70
        ys, xs = rng.integers(0, h, n), rng.integers(0, w, n)
        motes[ys, xs] = rng.random(n) * 3
        motes = np.clip(_blur(motes, U * 0.006) * 40, 0, 1)
        leaf = _smooth(0.45, 0.8, _fbm(h, w, rng, base=8, octaves=4))
        base = _over(base, np.broadcast_to(np.clip(_c(accent) * 0.35 + _c(bg) * 0.4, 0, 1), base.shape), leaf * 0.35 * _smooth(0.3, 0.8, rn))
        base = _screen(base, np.broadcast_to(np.clip(_c(accent) * 0.6 + 0.3, 0, 1), base.shape), motes * 0.5)
    elif atmos == "forge":
        heat = np.exp(-((yy - h) / (U * 0.5)) ** 2)
        base = _screen(base, np.broadcast_to(_c((255, 120, 40)), base.shape), heat * 0.25)
        sparks = np.zeros((h, w), np.float32)
        for _ in range(90):
            x0, y0 = rng.uniform(0, w), rng.uniform(h * 0.3, h)
            L = rng.uniform(4, 16)
            ang = -math.pi / 2 + rng.uniform(-0.5, 0.5)
            for t in np.linspace(0, 1, 10):
                xi, yi = int(x0 + L * t * math.cos(ang)), int(y0 + L * t * math.sin(ang))
                if 0 <= xi < w and 0 <= yi < h:
                    sparks[yi, xi] = max(sparks[yi, xi], t * rng.uniform(0.5, 1))
        sparks = np.clip(sparks + _blur(sparks, 1.5) * 3, 0, 1)
        base = _screen(base, np.broadcast_to(_c((255, 190, 90)), base.shape), sparks * 0.8)
    if kind in ("creature", "pantheon", "cover") and atmos != "nocturne":
        base = _stars(base, rng, w, h, density=0.0007, tint=acc)
    if kind == "location":
        base = _ridges(base, rng, w, h, U, bg, accent)
    if kind == "artifact":
        # spotlight from above
        spot = np.exp(-(((xx - cx) / (U * 0.42)) ** 2)) * _smooth(-0.1, 0.9, 1 - yy / h)
        base = _screen(base, np.broadcast_to(_c(GOLD_PALE) * 0.5, base.shape), spot * 0.35)
        floor = _smooth(cy + U * 0.3, cy + U * 0.46, yy)
        base = base * (1 - 0.35 * floor[..., None])
    return base


def _stars(base, rng, w, h, density, tint):
    n = int(w * h * density)
    layer = np.zeros((h, w), np.float32)
    ys, xs = rng.integers(0, h, n), rng.integers(0, w, n)
    mag = rng.random(n) ** 3
    layer[ys, xs] = 0.25 + 0.75 * mag
    halo = _blur(layer, 1.2) * 3 + layer
    big = mag > 0.93
    for x, y, m in zip(xs[big], ys[big], mag[big]):
        L = 5 + 9 * m
        yy0, yy1 = max(0, y - int(L)), min(h, y + int(L) + 1)
        xx0, xx1 = max(0, x - int(L)), min(w, x + int(L) + 1)
        for k in range(xx0, xx1):
            halo[y, k] += 0.45 * (1 - abs(k - x) / L)
        for k in range(yy0, yy1):
            halo[k, x] += 0.45 * (1 - abs(k - y) / L)
    col = np.clip(_c(GOLD_PALE) * 0.8 + tint * 0.2, 0, 1)
    return _screen(base, np.broadcast_to(col, base.shape), np.clip(halo, 0, 1))


def _ridge_line(rng, w, y0, amp, rough):
    xs = np.arange(w, dtype=np.float32)
    y = np.full(w, y0, np.float32)
    for o in range(4):
        f = (o + 1) ** 1.5 / w * rough
        y += amp / (o + 1) ** 1.6 * np.sin(2 * math.pi * f * xs + rng.random() * 6.28)
    return y


def _ridges(base, rng, w, h, U, bg, accent):
    """Three ranges of distant mountains with mist between them."""
    yy = np.mgrid[0:h, 0:w][0].astype(np.float32)
    far = np.clip(_c(bg) * 1.4 + _c(accent) * 0.35, 0, 1)
    near = _c(bg) * 0.45
    for k, (y0, amp, rough) in enumerate([(0.64, 0.06, 1.6), (0.74, 0.05, 2.2), (0.85, 0.04, 2.8)]):
        top = _ridge_line(rng, w, h * y0, U * amp, rough)
        mask = _smooth(-1.0, 1.0, yy - top[None, :])
        col = far * (1 - k / 2.4) + near * (k / 2.4)
        base = _over(base, np.broadcast_to(col, base.shape), mask)
        mist = np.exp(-np.clip(yy - top[None, :], 0, None) / (U * 0.05)) * mask
        base = _screen(base, np.broadcast_to(far * 0.6, base.shape), mist * 0.25)
    return base


def _guilloche(w, h, cx, cy, U, rng, r_in, r_out, shape="circle"):
    _, _, r, th = _coords(w, h, cx, cy)
    r = r / shape_factor(shape, th).astype(np.float32)
    ph = rng.random() * 6.28
    p1 = np.cos(2 * math.pi * r / (U * 0.018) + 3.2 * np.sin(12 * th + ph))
    p2 = np.cos(2 * math.pi * r / (U * 0.018) - 3.2 * np.sin(12 * th + ph))
    lines = np.maximum(_smooth(0.82, 1.0, p1), _smooth(0.82, 1.0, p2))
    fade = _smooth(r_in, r_in + U * 0.01, r) * (1 - _smooth(r_in + (r_out - r_in) * 0.35, r_out, r))
    return lines * fade


def _hatch(base, w, h, strength, angle_deg=35.0, period=4.2):
    """Tone-dependent engraving: fine parallel lines that deepen the shadows."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    a = math.radians(angle_deg)
    phase = (xx * math.cos(a) + yy * math.sin(a)) / period
    lines = _smooth(0.55, 0.95, 0.5 + 0.5 * np.cos(2 * math.pi * phase))
    tone = base.mean(-1)
    dark = 1 - _smooth(0.05, 0.45, tone)
    return base * (1 - (lines * dark * strength)[..., None])


def _vignette(base, w, h, cx, cy, U, strength=0.55):
    _, _, r, _ = _coords(w, h, cx, cy)
    v = _smooth(U * 0.45, U * 1.05, r)
    return base * (1 - strength * v[..., None])


def _grain(base, rng, amount=0.009):
    n = rng.normal(0, amount, base.shape[:2]).astype(np.float32)
    return np.clip(base + n[..., None], 0, 1)


def _to_image(arr) -> Image.Image:
    return Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8), "RGB")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def _fit_emblem(emblem, ex, ey, k0, target, w, h):
    """Scale and offset that centre the drawn emblem and fit it to ``target``.

    The emblem is drawn once at low resolution to measure it; the scale stays
    within 0.7x-1.6x of the nominal one so tiny or sprawling motifs are
    evened out without distorting stroke weight too far.
    """
    probe = Image.new("L", (w, h), 0)
    emblem(ScaledDraw(_Mono(ImageDraw.Draw(probe)), ex, ey, w / 2, h / 2, k0, stroke=1.45), ex, ey)
    a = np.asarray(probe, np.float32)
    ys, xs = np.nonzero(a > 40)
    if len(xs) == 0:
        return k0, (0.0, 0.0)
    bx, by = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    reach = float(np.max(np.hypot(xs - bx, ys - by))) + 1
    k = float(np.clip(k0 * target / reach, k0 * 0.7, k0 * 1.6))
    return k, ((bx - w / 2) * k / k0, (by - h / 2) * k / k0)


class _Mono:
    """ImageDraw wrapper that paints every call white, for measuring."""

    def __init__(self, draw):
        self._d = draw

    def __getattr__(self, name):
        fn = getattr(self._d, name)

        def call(*args, **kwargs):
            for key in ("fill", "outline"):
                if kwargs.get(key) is not None:
                    kwargs[key] = 255
            if name in ("arc", "line") and "fill" not in kwargs:
                kwargs["fill"] = 255
            return fn(*args, **kwargs)
        return call


def render_plate(*, kind: str, key: str, size: tuple[int, int], accent, bg,
                 pantheon: str | None, emblem, emblem_extent: float = 95.0,
                 emblem_center: tuple[float, float] = (384.0, 440.0), hint: str = "",
                 atmosphere: str | None = None) -> Image.Image:
    """Render a finished medallion plate.

    ``emblem(draw, cx, cy)`` draws the motif with any ImageDraw calls, centred
    on (cx, cy) in the generator's own coordinates; ``emblem_extent`` is its
    approximate half-size there, used to scale it into the medallion.
    """
    w, h = size
    U = min(w, h)
    rng = np.random.default_rng(_seed(f"{kind}:{key}"))
    cx = w / 2
    cy = h * 0.43 if h > w else (h * 0.47 if kind != "location" else h * 0.42)
    band = BANDS.get(pantheon or "", DEFAULT_BAND)
    light = kind == "story"

    atmos = atmosphere or choose_atmosphere(hint, key)
    edge = ("studs", "scallop", "points", "beaded")[(_seed(key) >> 3) % 4]
    base = _ground(kind, w, h, cx, cy, U, bg, accent, rng, atmos)

    shape = SHAPES.get(kind, "circle")
    R_out = U * 0.32
    R_band_in = U * 0.262
    R_field = U * 0.248

    # engraved guilloche collar around the medallion and hatch in the shadows
    g = _guilloche(w, h, cx, cy, U, rng, R_out + U * 0.012, R_out + U * 0.11, shape)
    ink = _c((90, 58, 28)) if light else _c(GOLD_PALE)
    base = _over(base, np.broadcast_to(ink, base.shape), g * (0.16 if light else 0.08))
    if not light:
        base = _hatch(base, w, h, 0.22 if kind in ("hero", "deity") else 0.14)

    # medallion field: sunk enamel disc
    _, _, r, th = _coords(w, h, cx, cy)
    r = r / shape_factor(shape, th).astype(np.float32)
    field_mask = 1 - _smooth(R_field - 1.2, R_field + 1.2, r)
    if light:
        fcol_in = np.clip(_c(bg) * 1.0 + _c(accent) * 0.25, 0, 1)
        fcol_out = _c(bg) * 0.5
    else:
        fcol_in = np.clip(_c(bg) * 1.3 + _c(accent) * 0.42, 0, 1)
        fcol_out = _c(bg) * 0.5
    tt = _smooth(0, R_field, r)[..., None]
    field = fcol_in * (1 - tt) + fcol_out * tt
    field = field * (0.92 + 0.14 * _fbm(h, w, rng, base=10, octaves=3)[..., None])
    fg = _guilloche(w, h, cx, cy, U * 0.7, rng, U * 0.02, R_field * 1.25, shape)
    field = _screen(field, np.broadcast_to(_c(accent), field.shape), fg * 0.12)
    base = _over(base, field, field_mask)
    # inner shadow of the sunk field
    inner = _smooth(R_field * 0.78, R_field, r) * field_mask
    base = base * (1 - 0.45 * inner[..., None])

    # medallion frame (rings + tradition band) at 3x
    lay, d = _layer(w, h)
    S = SS
    gc, gd = GOLD, (70, 48, 20)
    _ring(d, cx * S, cy * S, R_out * S, gc, int(U * 0.009 * S), shape)
    _ring(d, cx * S, cy * S, (R_out - U * 0.016) * S, gc, int(U * 0.0025 * S), shape)
    _ring(d, cx * S, cy * S, (R_band_in) * S, gc, int(U * 0.0035 * S), shape)
    _ring(d, cx * S, cy * S, (R_field + U * 0.002) * S, gc, int(U * 0.006 * S), shape)
    _band(d, band, cx * S, cy * S, (R_band_in + U * 0.008) * S, (R_out - U * 0.024) * S,
          (226, 190, 96), gd, max(2, int(U * 0.0032 * S)), shape)
    _edge(d, edge, cx * S, cy * S, R_out * S, U * S, GOLD_PALE, gc, gd, shape)
    if kind == "hero":
        _laurel(d, cx * S, cy * S, (R_out + U * 0.055) * S, (200, 160, 70), gd, U * 0.05 * S)
    if kind == "pantheon":
        for side in (-1, 1):  # horizontal rules extending the seal across a landscape plate
            x0 = (cx + side * (R_out + U * 0.04)) * S
            x1 = (cx + side * (w * 0.47)) * S
            for dy, wd in ((-U * 0.012, 0.004), (0, 0.0022), (U * 0.012, 0.004)):
                d.line([(x0, (cy + dy) * S), (x1, (cy + dy) * S)], fill=gc, width=max(2, int(U * wd * S)))
            xm = (cx + side * (R_out + U * 0.1)) * S
            e = U * 0.022 * S
            d.polygon([(xm, cy * S - e), (xm + e, cy * S), (xm, cy * S + e), (xm - e, cy * S)], fill=GOLD_PALE, outline=gd)
    if h > w * 1.1:
        _colophon(d, cx * S, h * 0.86 * S, U * S, gc, gd)
    frame = _down(lay, w, h)
    glow = _mix(GOLD, accent, 0.4)
    base = _composite_emblem(base, frame, cx, cy, R_out, accent, glow, shadow=0.8, glow=0.25, enamel=False)

    # the emblem
    lay, d = _layer(w, h)
    ex, ey = emblem_center
    k0 = (R_field * 0.84) / emblem_extent
    inscribed = R_field * float(np.min(shape_factor(shape, np.linspace(0, 2 * math.pi, 360))))
    k, (ox, oy) = _fit_emblem(emblem, ex, ey, k0, inscribed * 0.84, w, h)
    emblem(ScaledDraw(d, ex, ey, (cx - ox) * S, (cy - oy) * S, k * S, stroke=1.45 * k0 / k), ex, ey)
    em = _down(lay, w, h)
    base = _composite_emblem(base, em, cx, cy, R_field, accent, glow, shadow=0.9, glow=0.55,
                             keyline=max(2, int(U * 0.004)), keyline_col=_mix(bg, (0, 0, 0), 0.6),
                             groove=max(2, int(U * 0.0045)))

    base = _vignette(base, w, h, cx, cy, U, 0.28 if light else 0.5)
    base = _grain(base, rng)
    return _to_image(base)


def render_abstract_plate(*, key: str, size: tuple[int, int], motif: str, pantheon: str) -> Image.Image:
    """Plain landscape plate for Aboriginal Australian and Diné entries.

    Only sky, horizon, land and light: no medallion, border ornament, dot
    fields, concentric circles, cross-hatching or figures.
    """
    w, h = size
    U = min(w, h)
    rng = np.random.default_rng(_seed(f"abstract:{key}"))
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    if pantheon == "aboriginal-australian-pantheon":
        sky = [(0.0, (14, 14, 30)), (0.45, (46, 30, 44)), (0.8, (150, 72, 40)), (1.0, (222, 142, 70))]
        land_col, land_far = (40, 20, 14), (96, 46, 28)
        disc_col = (246, 190, 110)
    else:
        sky = [(0.0, (10, 16, 30)), (0.5, (30, 52, 70)), (0.82, (110, 150, 150)), (1.0, (226, 196, 170))]
        land_col, land_far = (22, 26, 30), (64, 76, 84)
        disc_col = (238, 232, 214)
    night = motif == "stars"
    # per-entry variation: horizon height, where the light sits, how late the hour
    horizon = h * ((0.6 if h > w else 0.62) + rng.uniform(-0.05, 0.05))
    hour = rng.uniform(0.0, 1.0)  # 0 = deep dusk, 1 = bright glow
    t = np.clip(yy / horizon, 0, 1)
    if night:
        t = t * 0.72
    else:
        t = np.clip(t * (0.92 + 0.12 * hour), 0, 1)
    base = _ramp(t, sky)
    clouds = _fbm(h, w, rng, base=2, octaves=4)
    base = base * (0.93 + 0.12 * clouds[..., None])
    if not night and rng.random() < 0.7:
        # a few long, low cloud bands catching the light
        for _ in range(int(rng.integers(1, 4))):
            cy_ = horizon * rng.uniform(0.35, 0.85)
            thick = U * rng.uniform(0.008, 0.025)
            wob = _fbm(1, w, rng, base=3, octaves=3)[0] * U * 0.03
            streak = np.exp(-((yy - cy_ - wob[None, :]) / thick) ** 2) * _smooth(0.3, 0.7, _fbm(h, w, rng, base=4, octaves=3))
            base = _screen(base, np.broadcast_to(_c(disc_col) * 0.8, base.shape), streak * rng.uniform(0.18, 0.35))

    cx = w * rng.uniform(0.3, 0.7)
    if night:
        n = int(w * h * 0.0007)
        layer = np.zeros((h, w), np.float32)
        ys, xs = rng.integers(0, int(horizon), n), rng.integers(0, w, n)
        layer[ys, xs] = 0.15 + 0.85 * rng.random(n) ** 4 * (1 - ys / horizon * 0.7)
        # a soft band of the Milky Way
        band = np.exp(-(((yy - (0.9 * xx - w * 0.1) * 0.55) / (U * 0.12)) ** 2)) * _fbm(h, w, rng, base=6, octaves=4)
        base = _screen(base, np.broadcast_to(_c((200, 200, 220)), base.shape), band * 0.22 * (yy < horizon))
        if "seven" in key or "sisters" in key or "nyiru" in key:
            for sx, sy in [(0.0, 0.0), (0.05, -0.03), (0.09, 0.01), (0.03, 0.05), (-0.04, 0.03), (0.07, 0.07), (0.12, -0.02)]:
                x, y = int(cx + (sx - 0.04) * U * 1.2), int(h * 0.26 + sy * U * 1.2)
                layer[y - 1:y + 2, x - 1:x + 2] = 1.0
        halo = np.clip(layer + _blur(layer, 1.4) * 5 + _blur(layer, 6) * 10, 0, 1)
        base = _screen(base, np.broadcast_to(_c((250, 244, 226)), base.shape), halo)
    elif motif == "disc":
        rad = U * rng.uniform(0.07, 0.12)
        dy = horizon - rad - U * rng.uniform(0.0, 0.2)
        rr = np.sqrt((xx - cx) ** 2 + (yy - dy) ** 2)
        disc = 1 - _smooth(rad - 1, rad + 1, rr)
        glow = np.exp(-rr / (U * 0.22))
        base = _screen(base, np.broadcast_to(_c(disc_col), base.shape), np.clip(glow * 0.55, 0, 1))
        base = _over(base, np.broadcast_to(_c(disc_col), base.shape), disc)
    else:
        rr = np.sqrt((xx - cx) ** 2 + (yy - horizon) ** 2)
        base = _screen(base, np.broadcast_to(_c(disc_col), base.shape), np.exp(-rr / (U * 0.35)) * 0.4)

    # land: a far range, then the plain
    far = _ridge_line(rng, w, horizon, U * 0.012, 2)
    if motif == "ridge":
        prof = np.exp(-((np.arange(w) - w * rng.uniform(0.35, 0.65)) / (w * rng.uniform(0.14, 0.24))) ** 6) * U * rng.uniform(0.1, 0.17)
        far = far - prof.astype(np.float32)
    mask_far = _smooth(-1.0, 1.0, yy - far[None, :])
    base = _over(base, np.broadcast_to(_c(land_far), base.shape), mask_far)
    if motif == "ridge":
        rim = mask_far * np.exp(-np.clip(yy - far[None, :], 0, None) / 3.0)
        base = _screen(base, np.broadcast_to(_c(disc_col), base.shape), rim * 0.5)
    ground_t = np.clip((yy - horizon) / (h - horizon), 0, 1)
    ground = _c(land_far) * (1 - ground_t[..., None]) * 0.8 + _c(land_col) * ground_t[..., None]
    near = _ridge_line(rng, w, horizon + U * 0.03, U * 0.006, 3)
    base = _over(base, ground, _smooth(-1.0, 1.0, yy - near[None, :]))

    if motif == "river":
        # a lit river winding from the horizon into the foreground
        v = np.clip((yy - horizon) / (h - horizon), 0, 1)
        phase, bend = rng.uniform(0, 6.28), rng.choice([-1.0, 1.0]) * rng.uniform(0.12, 0.24)
        centre = cx + np.sin(v * 4.2 + phase) * U * bend * v
        half = U * (0.004 + 0.08 * v ** 1.6)
        river = (1 - _smooth(half - 1, half + 1, np.abs(xx - centre))) * (yy > horizon + 2)
        # water holds the sky: pale at the horizon, deepening towards the viewer
        sky_lit = _c(sky[-2][1]) * 0.55 + _c(disc_col) * 0.45
        water = np.clip(sky_lit * (1 - 0.35 * v[..., None]) + base * 0.15, 0, 1)
        base = _over(base, water, river * 0.8)
        edge_glint = river * (1 - _smooth(half * 0.4, half, np.abs(xx - centre))) * (1 - v)
        base = _screen(base, np.broadcast_to(_c(disc_col), base.shape), edge_glint * 0.35)

    base = base * (0.96 + 0.06 * _fbm(h, w, rng, base=30, octaves=2)[..., None])
    base = _vignette(base, w, h, w / 2, h / 2, U, 0.35)
    base = _grain(base, rng, 0.008)
    return _to_image(base)


def save_plate(img: Image.Image, path: str | Path) -> Path:
    """Write ``img`` as WebP (the only format the catalog references)."""
    path = Path(path).with_suffix(".webp")
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=WEBP_QUALITY, method=6)
    return path


def write_plate(img: Image.Image, out_dir: str | Path, entity_id: str) -> Path:
    """Save a plate as ``<out_dir>/<id>.webp`` and drop the retired PNG/JPEG copies."""
    out_dir = Path(out_dir)
    path = save_plate(img, out_dir / f"{entity_id}.webp")
    for ext in (".png", ".jpg"):
        stale = out_dir / f"{entity_id}{ext}"
        if stale.exists():
            stale.unlink()
    return path
