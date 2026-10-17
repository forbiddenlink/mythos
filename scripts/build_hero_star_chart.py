#!/usr/bin/env python3
"""
build_hero_star_chart.py
Turns Hevelius' engraved Draco plate (Firmamentum Sobiescianum, Gdansk 1690,
public domain, scan from Polona via Wikimedia Commons) into the line mask
behind the home page title.

The output is a greyscale WebP: the engraving's ink becomes white, the paper
black. The page uses it as a luminance CSS mask, so the tint stays a design
token and the file carries no colour of its own. Only the polar circle with
the dragon is kept, at the size the hero shows it, to keep the file small.

    uv run --no-project --with pillow --with numpy \
        python scripts/build_hero_star_chart.py path/to/draco-full.jpg

Source file (4400x3474):
https://commons.wikimedia.org/wiki/File:Draco_Hevelius_-_Prodromus_astronomiae_1690_(5590223).jpg
"""

from __future__ import annotations

import sys

import numpy as np
from PIL import Image, ImageFilter

from _repo_paths import WEB_PUBLIC

OUTPUT = WEB_PUBLIC / "hero-star-chart.webp"
# Dark scanner margins measured on the 4400x3474 scan.
CROP = 90
# The part of the sheet the hero shows: the polar circle with the dragon,
# as fractions of the cropped sheet (left, top, right, bottom).
REGION = (0.14, 0.0, 0.86, 0.86)
WIDTH = 1100


def main(src: str) -> None:
    im = Image.open(src).convert("L")
    w, h = im.size
    im = im.crop((CROP, CROP, w - CROP, h - CROP))
    l, t, r, b = REGION
    w, h = im.size
    im = im.crop((round(l * w), round(t * h), round(r * w), round(b * h)))
    im = im.resize((WIDTH, round(WIDTH * im.height / im.width)), Image.LANCZOS)

    lum = np.asarray(im, dtype=np.float32) / 255
    # Paper tone varies across the scan; estimate it locally so faint
    # hatching survives on the darker half of the sheet.
    paper = np.asarray(im.filter(ImageFilter.GaussianBlur(40)), dtype=np.float32) / 255
    paper = np.maximum(paper, np.percentile(lum, 60))
    ink = np.clip((paper - lum) / 0.45, 0, 1)
    ink = np.where(ink < 0.06, 0, ink) ** 0.8

    # Feather the sheet edges so no crop line shows on the page.
    hgt, wid = ink.shape
    y, x = np.mgrid[0:hgt, 0:wid]
    d = np.hypot((x - wid / 2) / (wid / 2), (y - hgt / 2) / (hgt / 2))
    t = np.clip((1.0 - d) / 0.35, 0, 1)
    ink *= t * t * (3 - 2 * t)

    out = Image.fromarray((ink * 255).astype(np.uint8), "L")
    out.save(OUTPUT, "WEBP", quality=38, method=6)
    print(f"wrote {OUTPUT} {out.size}")


if __name__ == "__main__":
    main(sys.argv[1])
