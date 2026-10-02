#!/usr/bin/env python3
"""Split the Source Sans 3 variable font into unicode-range subsets.

Source: the Google Fonts build of Source Sans 3 (variable, wght 200-900), one
file carrying Latin, Latin-ext, Vietnamese, Cyrillic, Greek and more. Pages that
only use Latin should not pay for the rest, so each subset becomes its own
WOFF2 and src/app/fonts.ts declares it with a matching `unicode-range`; the
browser downloads a subset only when a page contains one of its characters.

The weight axis is also limited to 400-500, the range fonts.ts declares: the
CSS never asks this font for anything else, so nothing renders differently.

Every code point lands in exactly one subset (the first that claims it), and the
printed unicode-range is built from the code points actually in each file, so a
page never downloads a subset for a character the font does not have. Code
points the font has outside the named ranges go into a "misc" subset, so no
glyph is lost by the split. Common Latin combining marks stay in the Latin subset
so a base letter and its mark are shaped from one file.

Usage (needs fonttools + brotli):
  python3 scripts/split-source-sans.py <source-sans-3.woff2> <out-dir>
Writes source-sans-3-subsets.json (name, file, unicode-range) next to the
fonts; paste each range into src/app/fonts.ts. The unit test
(__tests__/lib/font-subsets.test.ts) fails when fonts.ts and the manifest differ.
"""
import json
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

# Ranges follow the Google Fonts CSS API subsets (the standard split).
RANGES = {
    "latin": "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
    "latin-ext": "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
    "vietnamese": "U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB",
    "cyrillic": "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116",
    "cyrillic-ext": "U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F",
    "greek": "U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF",
    "greek-ext": "U+1F00-1FFF",
}


# Combining marks that transliterated Latin text uses (grave, acute, circumflex,
# tilde, macron, breve, dot above, diaeresis, ring, caron, dot/diaeresis below,
# cedilla, ogonek, macron below, ...). Kept in the Latin subset so the base
# letter and its mark come from one file.
LATIN_MARKS = set(range(0x300, 0x305)) | set(range(0x306, 0x309)) | {
    0x30A, 0x30C, 0x323, 0x324, 0x327, 0x328, 0x329, 0x32D, 0x32E, 0x331,
}


def parse(spec: str) -> set[int]:
    out: set[int] = set()
    for part in spec.split(","):
        part = part.removeprefix("U+")
        lo, _, hi = part.partition("-")
        out.update(range(int(lo, 16), int(hi or lo, 16) + 1))
    return out


def to_range(cps: list[int]) -> str:
    cps = sorted(cps)
    runs: list[list[int]] = []
    for cp in cps:
        if runs and cp == runs[-1][1] + 1:
            runs[-1][1] = cp
        else:
            runs.append([cp, cp])
    return ",".join(
        f"U+{a:X}" if a == b else f"U+{a:X}-{b:X}" for a, b in runs
    )


def main(src: str, out_dir: str) -> None:
    font = TTFont(src)
    font = instancer.instantiateVariableFont(
        font, {"wght": (400, 500)}, inplace=False
    )
    have = set(font.getBestCmap())
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)

    claims = {name: parse(spec) for name, spec in RANGES.items()}
    claims["latin"] |= LATIN_MARKS
    wanted: dict[str, set[int]] = {}
    taken: set[int] = set()
    for name, cps in claims.items():
        wanted[name] = (cps & have) - taken
        taken |= wanted[name]
    wanted["misc"] = have - taken
    wanted["misc"].discard(0)

    manifest: dict[str, dict[str, str]] = {}
    tmp = out / "_instanced.ttf"
    font.save(tmp)
    for name, cps in wanted.items():
        if not cps:
            continue
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        opts.notdef_outline = True
        opts.name_IDs = ["*"]
        opts.drop_tables += ["DSIG"]
        f = subset.load_font(str(tmp), opts)
        s = subset.Subsetter(opts)
        s.populate(unicodes=sorted(cps))
        s.subset(f)
        target = out / f"source-sans-3-{name}.woff2"
        subset.save_font(f, str(target), opts)
        rng = to_range(sorted(cps))
        manifest[name] = {"file": target.name, "range": rng}
        print(f"{name}\t{target.stat().st_size}\t{len(cps)} code points")
    tmp.unlink()
    (out / "source-sans-3-subsets.json").write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
