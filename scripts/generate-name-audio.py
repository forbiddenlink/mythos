#!/usr/bin/env python3
"""Generate a short spoken clip for every deity name.

    MAGICA_KEY=... python3 scripts/generate-name-audio.py [--only slug ...] [--text-source name|phonetic] [--force]

Model: Magica elevenlabs_v3_tts ($0.10 per 1,000 characters). A 10-character
name costs about $0.001. gemini_pro_tts has a $0.0052 per-call minimum, which
is 4x to 10x more for names this short, so ElevenLabs is the cheaper choice.

Output: apps/web/public/audio/names/<deity-slug>.mp3 (48 kbps mono, about -16 LUFS) and
apps/web/src/data/name-audio.json (sorted list of slugs that exist, imported by
the Pronunciation component so it never requests a missing file).

Living-tradition exclusion: deities of Aboriginal Australian, Dine,
Haudenosaunee, Inuit, Tlingit and Haida, Yoruba, Akan and Polynesian traditions
are skipped. A synthetic voice mispronouncing a sacred name is the same harm
docs/design/image-backlog.md guards against for imagery. They keep the browser
speechSynthesis fallback. Pass --include-restricted to override.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _magica import run_node  # noqa: E402
from _repo_paths import DATA_DIR, WEB_PUBLIC  # noqa: E402

MODEL = "elevenlabs_v3_tts"
RATE_PER_CHAR_USD = 0.0001
VOICE_ID = "FxZjRiAEBESrb7srpme7"  # "Tim": clear, neutral British narrator
OUT_DIR = WEB_PUBLIC / "audio" / "names"
MANIFEST = DATA_DIR / "audio-provenance.json"
INDEX = DATA_DIR / "name-audio.json"

RESTRICTED_PANTHEONS = {
    "aboriginal-australian-pantheon", "akan-pantheon", "dine-pantheon",
    "haudenosaunee-pantheon", "inuit-pantheon", "tlingit-haida-pantheon",
    "yoruba-pantheon", "polynesian-pantheon",
}


# Per-slug exceptions where the respelling is understood better than the name.
# Found in the QA listening pass: the plain Quechua name came back as a
# different sentence from Whisper, the respelling as a close transcription.
PHONETIC_OVERRIDES = {"huallallo-carhuincho"}


def speak_text(deity: dict, source: str) -> str:
    if deity["slug"] in PHONETIC_OVERRIDES:
        source = "phonetic"
    if source == "phonetic" and deity.get("pronunciation"):
        return deity["pronunciation"]["phonetic"].replace("-", " ").lower()
    return deity["name"]


TARGET_LEVEL_DB = -16.0  # mean level; for isolated words this tracks -16 LUFS within ~1 LU


def mean_volume(path: Path) -> float:
    err = subprocess.run(["ffmpeg", "-nostats", "-i", str(path), "-af", "volumedetect",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"mean_volume: (-?[\d.]+) dB", err)[0])


def encode(src: Path, dst: Path) -> None:
    """Trim silence, set a consistent level, write 48 kbps mono mp3.

    loudnorm cannot measure clips shorter than 0.4 s and undershoots on
    one-second clips (measured: 72 of 278 clips more than 1.5 LU off), so the
    gain comes from the clip's own mean level instead, with a peak limiter.
    """
    dst.parent.mkdir(parents=True, exist_ok=True)
    trim = ("silenceremove=start_periods=1:start_threshold=-50dB,"
            "areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse")
    with tempfile.TemporaryDirectory() as td:
        trimmed = Path(td) / "trimmed.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", trim,
                        "-ar", "44100", "-ac", "1", str(trimmed)], check=True)
        gain = TARGET_LEVEL_DB - mean_volume(trimmed)
        out = Path(td) / "out.mp3"
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(trimmed), "-af",
             f"volume={gain:.2f}dB,alimiter=limit=0.85:level=false",
             "-map_metadata", "-1", "-c:a", "libmp3lame", "-b:a", "48k", str(out)],
            check=True)
        shutil.move(str(out), str(dst))


def write_index() -> None:
    slugs = sorted(p.stem for p in OUT_DIR.glob("*.mp3"))
    INDEX.write_text(json.dumps(slugs) + "\n")


def one(deity: dict, source: str, out_dir: Path) -> tuple[str, bool, float]:
    text = speak_text(deity, source)
    with tempfile.TemporaryDirectory() as td:
        raw = Path(td) / "raw.mp3"
        ok = run_node(MODEL, {"text": text, "voice_id": VOICE_ID, "language_code": "en"},
                      str(raw), wait=2)
        if ok:
            encode(raw, out_dir / f"{deity['slug']}.mp3")
    return deity["slug"], ok, len(text) * RATE_PER_CHAR_USD


def split_on_silence(src: Path, n: int) -> list[tuple[float, float]] | None:
    """Speech segments of a batch clip, or None when the count is not n."""
    out = subprocess.run(
        ["ffmpeg", "-nostats", "-i", str(src), "-af", "silencedetect=noise=-38dB:d=0.3",
         "-f", "null", "-"], capture_output=True, text=True).stderr
    total = float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)],
        text=True).strip())
    starts = [float(m) for m in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(m) for m in re.findall(r"silence_end: ([\d.]+)", out)]
    segs, cursor = [], 0.0
    for st, en in zip(starts, ends):
        if st - cursor > 0.08:
            segs.append((cursor, st))
        cursor = en
    if total - cursor > 0.08:
        segs.append((cursor, total))
    return segs if len(segs) == n else None


def batch(group: list[dict], source: str, out_dir: Path) -> tuple[list[str], list[str], float]:
    """One TTS call for several names, split on the pauses between them.

    Names are short, so one call per name wastes the API's ~20 requests per
    minute budget. When the split does not yield exactly one segment per name,
    the group falls back to one call per name.
    """
    texts = [speak_text(d, source) for d in group]
    cost = sum(len(t) for t in texts) * RATE_PER_CHAR_USD
    with tempfile.TemporaryDirectory() as td:
        raw = Path(td) / "raw.mp3"
        ok = run_node(MODEL, {"text": "\n\n".join(f"{t}." for t in texts),
                              "voice_id": VOICE_ID, "language_code": "en"}, str(raw), wait=3)
        segs = split_on_silence(raw, len(group)) if ok else None
        if segs:
            for d, (a, b) in zip(group, segs):
                part = Path(td) / f"{d['slug']}.mp3"
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-ss",
                                f"{max(a - 0.05, 0):.3f}", "-to", f"{b + 0.08:.3f}", str(part)],
                               check=True)
                encode(part, out_dir / f"{d['slug']}.mp3")
            return [d["slug"] for d in group], [], cost
    print(f"  batch split failed for {[d['slug'] for d in group]}; falling back to singles")
    done, failed, extra = [], [], 0.0
    for d in group:
        slug, ok, c = one(d, source, out_dir)
        (done if ok else failed).append(slug)
        extra += c
    return done, failed, cost + extra


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*", default=None)
    ap.add_argument("--text-source", choices=["name", "phonetic"], default="name")
    ap.add_argument("--out-dir", default=str(OUT_DIR))
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--renormalize", action="store_true",
                    help="re-level the existing clips in place without calling the API")
    ap.add_argument("--include-restricted", action="store_true")
    ap.add_argument("--workers", type=int, default=2)
    ap.add_argument("--batch", type=int, default=8, help="names per TTS call (1 = one call per name)")
    args = ap.parse_args()
    out_dir = Path(args.out_dir)

    if args.renormalize:
        for clip in sorted(out_dir.glob("*.mp3")):
            with tempfile.TemporaryDirectory() as td:
                tmp = Path(td) / clip.name
                shutil.copy(clip, tmp)
                encode(tmp, clip)
        print(f"re-levelled {len(list(out_dir.glob('*.mp3')))} clips")
        return 0

    deities = json.loads((DATA_DIR / "deities.json").read_text())
    todo = []
    for d in deities:
        if args.only and d["slug"] not in args.only:
            continue
        if d["pantheonId"] in RESTRICTED_PANTHEONS and not args.include_restricted:
            continue
        if (out_dir / f"{d['slug']}.mp3").exists() and not args.force:
            continue
        todo.append(d)
    print(f"{len(todo)} clips to generate")

    spent, done, failed = 0.0, 0, []
    groups = [todo[i:i + args.batch] for i in range(0, len(todo), args.batch)]
    with ThreadPoolExecutor(args.workers) as ex:
        for ok_slugs, bad_slugs, cost in ex.map(
                lambda g: batch(g, args.text_source, out_dir), groups):
            spent += cost
            done += len(ok_slugs)
            failed += bad_slugs
    print(f"done {done}, failed {len(failed)} {failed}, est. spend ${spent:.3f}")

    if out_dir == OUT_DIR:
        write_index()
        manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {
            "ambience": {}, "names": {}, "narration": {}}
        manifest["names"] = {
            "model": "elevenlabs-v3-tts", "voiceId": VOICE_ID, "textSource": args.text_source,
            "encoding": "mp3 48kbps mono", "count": len(list(OUT_DIR.glob("*.mp3"))),
            "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "excludedPantheons": sorted(RESTRICTED_PANTHEONS),
            "note": "Text sent to the model is the deity name (speak_text in scripts/generate-name-audio.py).",
        }
        MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
