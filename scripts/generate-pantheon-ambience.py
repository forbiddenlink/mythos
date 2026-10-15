#!/usr/bin/env python3
"""Generate bespoke instrumental ambience beds for pantheons that lack a track.

    MAGICA_KEY=... python3 scripts/generate-pantheon-ambience.py [--only slavic ...] [--force]

Model: Magica lyria_3_5 (music, $0.08 flat per run, ~90 s stereo output).
Each pantheon gets a prompt naming instruments attested for that region and
period, instrumental only, no vocals, no ceremonial recordings. Prompts are
written to apps/web/src/data/audio-provenance.json (section "ambience") so
every track can be traced and regenerated. Output is encoded to ~96 kbps mp3
at apps/web/public/audio/ambient/<pantheon>-ambiance.mp3.

Living-tradition exclusion. docs/design/image-backlog.md bars AI imagery for
Aboriginal Australian, Dine, Haudenosaunee, Inuit, Tlingit and Haida, Yoruba,
Akan and Polynesian/Maori material. The same reasoning applies to AI-made
imitations of their sacred instruments, so those pantheons (and the pan-African
umbrella, which contains Yoruba and Akan) keep the neutral default track.
They are listed in RESTRICTED below and refused unless --include-restricted.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _magica import run_node, write_audio_atomically  # noqa: E402
from _repo_paths import DATA_DIR, WEB_PUBLIC  # noqa: E402

MODEL = "lyria_3_5"
COST_PER_RUN_USD = 0.08
OUT_DIR = WEB_PUBLIC / "audio" / "ambient"
MANIFEST = DATA_DIR / "audio-provenance.json"

RESTRICTED = {
    "aboriginal-australian", "akan", "dine", "haudenosaunee", "inuit",
    "tlingit-haida", "yoruba", "polynesian", "african",
}

COMMON = (
    "Instrumental only, no vocals, no spoken word, no chanting. Slow, spacious, "
    "meditative ambient bed that sits quietly under reading. Steady dynamics, no "
    "drops, no big climax, gentle fade structure so it can loop seamlessly. "
    "Approximately 90 seconds. Respectful, documentary tone; avoid cinematic "
    "cliches and pastiche."
)

PROMPTS: dict[str, str] = {
    "mesopotamian": (
        "Ancient Mesopotamia, third millennium BCE. Plucked bull-headed lyre in the "
        "style of the Lyres of Ur, a soft frame drum, a low reed pipe, and a quiet "
        "sustained drone suggesting river reeds and clay-walled temples."
    ),
    "hittite": (
        "Bronze Age Anatolia (Hittite). A long-necked lute plucked sparsely, a "
        "frame drum, small bronze cymbals touched lightly, and a double reed pipe "
        "over a low sustained drone, with wind across a high plateau."
    ),
    "canaanite": (
        "Late Bronze Age Ugarit on the Levantine coast. A lyre plucked in simple "
        "modal phrases, a hand frame drum, soft double pipes, and distant sea wind. "
        "Evoke the Hurrian-era musical world without quoting any melody."
    ),
    "slavic": (
        "Early Slavic forest country. A gusli (psaltery) with sparse plucked "
        "notes, a low wooden flute or svirel, a soft frame drum, and a deep drone, "
        "over birch and pine forest air with distant river sounds."
    ),
    "inca": (
        "Andean highlands before the Spanish conquest. A quena (end-blown notched "
        "flute), soft siku panpipes in slow interlocking phrases, a low tinya "
        "drum, and thin high-altitude wind. Pre-Columbian instruments only: no "
        "charango, no guitar, no cliched condor-pass melody."
    ),
    "persian": (
        "Ancient and classical Iranian plateau. A santur with slow dulcimer "
        "arpeggios, a ney (end-blown reed flute) breathing long tones, a soft daf "
        "frame drum, and a low sustained drone, like firelight in a stone hall."
    ),
    "finnish": (
        "Kalevala country, Finland and Karelia. A five-string kantele with slow "
        "repeating plucked patterns, a bowed jouhikko drone, a faint birch-bark "
        "whistle, and still northern forest and lake air. No singing; the runo-"
        "singing tradition is left out on purpose."
    ),
    "korean": (
        "Korean court and mountain-temple atmosphere. A gayageum with slow "
        "plucked, bending notes, a daegeum (large bamboo transverse flute) with "
        "long breathy tones, a haegeum bowed lightly, and a soft janggu hourglass "
        "drum touched sparingly. Quiet, with space between phrases."
    ),
}


LOOP_XFADE_S = 4


def encode(src: Path, dst: Path) -> None:
    """Loudness-normalise to -23 LUFS and make the file loop without a seam.

    The first LOOP_XFADE_S seconds are cut off and equal-power crossfaded onto
    the end of the remainder, so the last sample flows into the first sample
    of the result instead of fading out and restarting.
    """
    with tempfile.TemporaryDirectory() as td:
        norm = Path(td) / "norm.wav"
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af",
             "loudnorm=I=-23:TP=-2:LRA=11", "-ar", "44100", str(norm)], check=True)
        t = LOOP_XFADE_S
        def build(tmp: Path) -> None:
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(norm), "-i", str(norm),
                 "-filter_complex",
                 f"[0:a]atrim=start={t},asetpts=PTS-STARTPTS[body];"
                 f"[1:a]atrim=end={t},asetpts=PTS-STARTPTS[head];"
                 f"[body][head]acrossfade=d={t}:c1=qsin:c2=qsin[out]",
                 "-map", "[out]", "-map_metadata", "-1", "-f", "mp3", "-c:a", "libmp3lame",
                 "-b:a", "96k", str(tmp)], check=True)

        write_audio_atomically(dst, build)


def load_manifest() -> dict:
    if MANIFEST.exists():
        return json.loads(MANIFEST.read_text())
    return {
        "$comment": "Written by scripts/generate-pantheon-ambience.py, scripts/generate-name-audio.py and scripts/generate-story-narration.py. Prompts and models for every AI-generated audio file.",
        "ambience": {}, "names": {}, "narration": {},
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*", default=None)
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--include-restricted", action="store_true")
    args = ap.parse_args()

    manifest = load_manifest()
    todo = args.only or list(PROMPTS)
    spent = 0.0
    failed: list[str] = []
    for pid in todo:
        if pid in RESTRICTED and not args.include_restricted:
            print(f"SKIP {pid}: living-tradition exclusion (see docstring)")
            continue
        if pid not in PROMPTS:
            print(f"SKIP {pid}: no prompt")
            continue
        out = OUT_DIR / f"{pid}-ambiance.mp3"
        if out.exists() and not args.force:
            print(f"have {out.name}")
            continue
        prompt = f"{PROMPTS[pid]} {COMMON}"
        print(f"generating {pid}")
        with tempfile.TemporaryDirectory() as td:
            raw = Path(td) / "raw.mp3"
            ok = run_node(MODEL, {"prompt": prompt}, str(raw))
            spent += COST_PER_RUN_USD
            if ok:
                try:
                    encode(raw, out)
                except (RuntimeError, subprocess.CalledProcessError) as exc:
                    print(f"  ! encode failed for {pid}: {exc}")
                    ok = False
            if not ok:
                failed.append(pid)
                continue
        manifest["ambience"][pid] = {
            "file": f"/audio/ambient/{pid}-ambiance.mp3",
            "model": "lyria-3.5", "prompt": prompt,
            "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "bytes": out.stat().st_size,
        }
        MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(f"est. spend ${spent:.2f}")
    if failed:
        print(f"FAILED: {failed}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
