#!/usr/bin/env python3
"""Generate narration for a small, explicit set of stories.

    MAGICA_KEY=... python3 scripts/generate-story-narration.py [--only slug ...] [--force]

Model: Magica gemini_pro_tts ($0.0052 per 1,000 characters, $0.0052 minimum per
call), voice "Charon". Text is the story's fullNarrative with markdown removed.
Output: apps/web/public/audio/stories/<slug>.mp3 (48 kbps mono) plus
apps/web/src/data/story-audio.json (slug -> bytes and seconds) that the story
page reads to decide whether to render the "Listen" player.

Selection. stories.json has no importance field, so STORIES is picked by the
number of inbound references from other catalog files (deities, heroes,
locations and so on mention the story by slug or id). Top five outside the
living-tradition exclusion list (see generate-name-audio.py): aeneid (19),
mahabharata (17), ramayana (15), epic-of-gilgamesh (14), cath-maige-tuired (13).
Deliberately not bulk: the full catalog is projected in the PR description.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _magica import run_node, write_audio_atomically  # noqa: E402
from _repo_paths import DATA_DIR, WEB_PUBLIC  # noqa: E402

MODEL = "gemini_pro_tts"
VOICE = "Charon"
STYLE = ("Read as a calm, measured storyteller. Unhurried pace, clear diction, "
         "natural pauses between paragraphs, no theatrics.")
RATE_PER_CHAR_USD = 0.0000052
MIN_CALL_USD = 0.0052
STORIES = ["aeneid", "mahabharata", "ramayana", "epic-of-gilgamesh", "cath-maige-tuired"]
OUT_DIR = WEB_PUBLIC / "audio" / "stories"
INDEX = DATA_DIR / "story-audio.json"
MANIFEST = DATA_DIR / "audio-provenance.json"


def clean(md: str) -> str:
    t = re.sub(r"^#{1,6}\s*(.+)$", r"\1.", md, flags=re.M)
    t = re.sub(r"[*_`>]+", "", t)
    t = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", t)
    return re.sub(r"\n{2,}", "\n\n", t).strip()


CHUNK_CHARS = 1800  # 7.5k and 3.5k-character calls failed with MODEL_EXECUTION_FAILED


def chunks(text: str) -> list[str]:
    """Split at paragraph boundaries into pieces of at most CHUNK_CHARS."""
    out, cur = [], ""
    for para in text.split("\n\n"):
        if cur and len(cur) + len(para) + 2 > CHUNK_CHARS:
            out.append(cur)
            cur = ""
        cur = f"{cur}\n\n{para}" if cur else para
    if cur:
        out.append(cur)
    return out


def encode(srcs: list[Path], dst: Path) -> None:
    """Concatenate the pieces, normalise to -16 LUFS, write 48 kbps mono mp3."""
    inputs = [a for s in srcs for a in ("-i", str(s))]
    joined = "".join(f"[{i}:a]" for i in range(len(srcs)))

    def build(tmp: Path) -> None:
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex",
             f"{joined}concat=n={len(srcs)}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11[out]",
             "-map", "[out]", "-ac", "1", "-ar", "32000", "-map_metadata", "-1",
             "-f", "mp3", "-c:a", "libmp3lame", "-b:a", "48k", str(tmp)], check=True)

    write_audio_atomically(dst, build)


def seconds(p: Path) -> float:
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
        text=True).strip())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*", default=None)
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    stories = {s["slug"]: s for s in json.loads((DATA_DIR / "stories.json").read_text())}
    index = json.loads(INDEX.read_text()) if INDEX.exists() else {}
    spent = 0.0
    failed: list[str] = []
    for slug in args.only or STORIES:
        out = OUT_DIR / f"{slug}.mp3"
        if out.exists() and not args.force and slug in index:
            print(f"have {slug}")
            continue
        text = clean(stories[slug]["fullNarrative"])
        cost = max(len(text) * RATE_PER_CHAR_USD, MIN_CALL_USD)
        print(f"narrating {slug}: {len(text)} chars, est ${cost:.4f}")
        with tempfile.TemporaryDirectory() as td:
            raws, ok = [], True
            for i, piece in enumerate(chunks(text)):
                raw = Path(td) / f"raw{i}.audio"
                # Gemini TTS fails sporadically on a piece; one retry is cheap.
                if not any(run_node(MODEL, {"text": piece, "voice": VOICE, "styleGuide": STYLE},
                                    str(raw), tries=150) for _ in range(2)):
                    ok = False
                    print(f"  ! piece {i} failed twice")
                    break
                raws.append(raw)
            if ok:
                spent += cost
                try:
                    encode(raws, out)
                except (RuntimeError, subprocess.CalledProcessError) as exc:
                    print(f"  ! encode failed for {slug}: {exc}")
                    ok = False
            if not ok:
                failed.append(slug)
                continue
        index[slug] = {"bytes": out.stat().st_size, "seconds": round(seconds(out))}
        INDEX.write_text(json.dumps(index, indent=2) + "\n")
    # Provenance only changes when this run produced something, and it lists
    # only stories that have a file and an index row (never a failed slug).
    succeeded = [s for s in (args.only or STORIES) if s not in failed and s in index]
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {
        "ambience": {}, "names": {}, "narration": {}}
    if succeeded:
        manifest["narration"] = {
            "model": "gemini-pro-tts", "voice": VOICE, "styleGuide": STYLE,
            "encoding": "mp3 48kbps mono 32kHz", "stories": sorted(index),
            "selection": "top 5 by inbound catalog references, outside living-tradition exclusions",
            "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        }
        MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(f"est. spend ${spent:.4f}")
    if failed:
        print(f"FAILED: {failed}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
