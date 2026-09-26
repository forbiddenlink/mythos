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


def _json_dumps_style(text: str):
    """Return (ensure_ascii, trailing) if ``text`` is plain json.dumps output."""
    import json

    data = json.loads(text)
    for ensure_ascii in (False, True):
        body = json.dumps(data, indent=2, ensure_ascii=ensure_ascii)
        for trailing in ("\n", ""):
            if body + trailing == text:
                return ensure_ascii, trailing
    return None


def write_data_json(path: str | os.PathLike, data) -> None:
    """Rewrite a data file while keeping the formatting it already had.

    Most catalogs are plain ``json.dumps(indent=2)`` output, but several are
    Prettier-formatted (short arrays kept on one line). Files in the second
    group are re-run through the repository's Prettier so a data edit does
    not reformat the whole file.
    """
    import json

    path = Path(path)
    previous = path.read_text(encoding="utf-8") if path.exists() else None
    style = _json_dumps_style(previous) if previous is not None else (False, "\n")
    ensure_ascii, trailing = style or (False, "\n")
    path.write_text(
        json.dumps(data, indent=2, ensure_ascii=ensure_ascii) + trailing,
        encoding="utf-8",
    )
    if style is None:
        prettier = REPO_ROOT / "node_modules" / ".bin" / "prettier"
        if not prettier.exists():
            raise SystemExit(
                f"{path} is Prettier-formatted; run pnpm install so "
                "node_modules/.bin/prettier is available."
            )
        subprocess.run([str(prettier), "--write", str(path)], check=True,
                       stdout=subprocess.DEVNULL)
