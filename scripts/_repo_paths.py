"""Shared, repo-relative paths and helpers for the scripts in this folder.

Every script used to hard-code an absolute path on one developer's machine
(``/Volumes/LizsDisk/mythos``). Import from here instead so the scripts run from
any checkout:

    from _repo_paths import REPO_ROOT, WEB_PUBLIC, DATA_DIR

``MYTHOS_REPO_ROOT`` overrides the detected root when a script is run from a
copy outside the repository.
"""

from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

REPO_ROOT = Path(
    os.environ.get("MYTHOS_REPO_ROOT") or Path(__file__).resolve().parents[1]
)
WEB_ROOT = REPO_ROOT / "apps" / "web"
WEB_PUBLIC = WEB_ROOT / "public"
DATA_DIR = WEB_ROOT / "src" / "data"

# Serif faces the plate generators ask for, most preferred first. The first
# path that exists wins, so macOS and Linux checkouts render the same layout
# with the closest available face.
_FONT_CANDIDATES = {
    "regular": [
        "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSerif.ttf",
    ],
    "bold": [
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf",
    ],
    "italic": [
        "/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf",
    ],
}


def serif_font(style: str, size: int):
    """Return a PIL font for ``style`` (regular, bold, italic) at ``size``."""
    from PIL import ImageFont

    for candidate in _FONT_CANDIDATES[style]:
        if os.path.exists(candidate):
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def write_webp(png_path: str | os.PathLike, webp_path: str | os.PathLike) -> None:
    """Write a WebP companion for ``png_path``.

    Uses ``cwebp`` when it is on PATH (matching the original pipeline's
    ``-q 85``), otherwise Pillow's WebP encoder at the same quality.
    """
    cwebp = shutil.which("cwebp")
    if cwebp:
        subprocess.run(
            [cwebp, "-q", "85", str(png_path), "-o", str(webp_path)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return
    from PIL import Image

    with Image.open(png_path) as img:
        img.save(webp_path, "WEBP", quality=85)
