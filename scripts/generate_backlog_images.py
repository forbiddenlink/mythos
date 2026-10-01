#!/usr/bin/env python3
"""
generate_backlog_images.py
Replaces procedural stand-in plates with AI illustrations, driven by
docs/design/image-backlog.md (worst first). Never touches a row marked
DO NOT GENERATE.

Two stages, so every image is looked at before it ships:

    python3 scripts/generate_backlog_images.py gen --count 25     # next 25 pending rows
    python3 scripts/generate_backlog_images.py gen --ids hero:aeneas,pantheon:slavic
    python3 scripts/generate_backlog_images.py gen --force --ids deity:viracocha  # redo a rejected one
    python3 scripts/generate_backlog_images.py apply --ids hero:aeneas,...   # approved only
    python3 scripts/generate_backlog_images.py status

`gen` writes review images to a staging folder (STAGE, outside the repo and
off the internal SSD) and records nothing. It skips ids already staged (so a
rerun does not pay twice) unless --force. `apply` validates every id first
(DO NOT GENERATE, staged file present, target inside public/), then copies the
approved images to the path the data JSON already uses (converted to webp),
patches imageUrl when the extension changes, appends the prompt, model and
date to apps/web/src/data/image-generations.json and rebuilds
image-provenance.json, all as one transaction that rolls back on any error.
`status` counts applied, staged and ungenerated rows separately.

Requires MAGICA_KEY in the environment (never printed). Figures are 4:5
portraits, places/stories/artifacts/pantheons 3:2 landscapes, matching how
EntityCard crops them.
"""

from __future__ import annotations

import argparse
import concurrent.futures as cf
import datetime
import io
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path

from PIL import Image

from _dng_guard import DoNotGenerate, assert_generatable
from _repo_paths import DATA_DIR, REPO_ROOT, WEB_PUBLIC

BACKLOG = REPO_ROOT / "docs/design/image-backlog.md"
LOG = DATA_DIR / "image-generations.json"
STAGE = Path("/Volumes/LizsDisk/_wt/mythos-image-gen")
MODEL = "flux_2_max"
MAGICA = "https://api.magica.com/api/v1"
EST_COST = 0.10  # USD per image, upper estimate (0.0701/MP, ~1.3 MP)

CATALOG = {
    "Hero": ("hero", "heroes.json", "name"),
    "Deity": ("deity", "deities.json", "name"),
    "Creature": ("creature", "creatures.json", "name"),
    "Pantheon": ("pantheon", "pantheons.json", "name"),
    "Story": ("story", "stories.json", "title"),
    "Location": ("location", "locations.json", "name"),
    "Artifact": ("artifact", "artifacts.json", "name"),
}
PORTRAIT = {"hero", "deity", "creature"}
# Native sizes the model accepts; cropped to 4:5 or 3:2 afterwards.
API_SIZE = {True: "3:4", False: "4:3"}
OUT_SIZE = {True: (768, 960), False: (960, 640)}

STYLE = (
    "Classical oil painting in the manner of 19th-century academic and Romantic history "
    "painting: rich chiaroscuro, deep midnight-blue and umber shadows, warm gold highlights, "
    "dramatic directional light, visible painterly brushwork, museum quality. "
)
RULES = (
    " Absolutely no text, lettering, inscriptions, captions, signature or watermark anywhere. "
    "No frame or border. Correct human anatomy with natural hands. One clear focal subject "
    "with breathing room at the edges. Dress, architecture, weapons and iconography must be "
    "historically and culturally grounded in {culture}, not generic fantasy and not borrowed "
    "from another culture, and true to the ancient or mythic era of the source (no later-era "
    "religious buildings or dress, such as mosques, churches or Joseon-period styles for ancient myth), "
    "and no Christian saint iconography (no halo or Byzantine pose) for pre-Christian figures. Invented figures only, never a portrait of a real living person, "
    "and no logos or brands."
)
FRAMING = {
    "hero": "Three-quarter-length heroic portrait of {name}.",
    "deity": "Majestic three-quarter-length portrait of the deity {name}.",
    "creature": "Dramatic atmospheric portrait of the mythological creature {name}.",
    "location": "Atmospheric wide landscape or architectural view of {name}, with no prominent figures.",
    "story": "Narrative scene illustrating the myth '{name}'.",
    "artifact": "Reverent still life of the sacred artifact {name}, lit like a museum relic.",
    "pantheon": "Panoramic scene evoking the {name}: its sacred landscape and architecture, with distant symbolic figures.",
}


def rows() -> list[dict]:
    out = []
    for line in BACKLOG.read_text(encoding="utf-8").splitlines():
        if not re.match(r"\| \d+ ", line):
            continue
        c = [x.strip() for x in line.strip().strip("|").split("|")]
        out.append(
            {
                "n": int(c[0]),
                "priority": c[1],
                "type": c[2],
                "name": c[3],
                "slug": c[4],
                "tradition": c[5],
                "prompt": c[6],
                "dng": c[6].startswith("DO NOT GENERATE"),
            }
        )
    return out


def load_log() -> dict:
    return json.loads(LOG.read_text(encoding="utf-8")) if LOG.exists() else {}


def catalogs() -> dict:
    cache: dict = {}
    for _, (etype, fname, _k) in CATALOG.items():
        cache[etype] = json.loads((DATA_DIR / fname).read_text(encoding="utf-8"))
    return cache


def find_record(cat: dict, etype: str, slug: str) -> dict | None:
    for r in cat[etype]:
        if r.get("slug") == slug or r["id"] == slug or r["id"] == f"{slug}-pantheon":
            return r
    return None


def build_prompt(row: dict, rec: dict, cat: dict) -> tuple[str, str]:
    etype, _, key = CATALOG[row["type"]]
    name = rec[key] if etype != "pantheon" else rec["name"]
    pid = rec["id"] if etype == "pantheon" else rec.get("pantheonId")
    pantheon = next((p for p in cat["pantheon"] if p["id"] == pid), None)
    culture = pantheon["name"] if pantheon else row["tradition"].split(" (")[0]
    culture = re.sub(r"\s+(Pantheon|Traditions?)\b", "", culture)
    # Subject text: the backlog prompt's description sentence(s).
    m = re.match(r".*? illustration of the mythological [\w ]+? " + re.escape(row["name"]) + r"\. (.*?) Epic scene", row["prompt"], re.S)
    desc = (m.group(1) if m else "").strip()
    text = (
        STYLE
        + FRAMING[etype].format(name=name)
        + (f" {desc}" if desc else "")
        + RULES.format(culture=culture)
    )
    return text, culture


def target_path(rec: dict, etype: str) -> tuple[str, str]:
    """(new imageUrl, old imageUrl). Always webp; folder stays the entity folder."""
    old = rec.get("imageUrl") or f"/{etype}s/{rec['id']}.webp"
    new = str(Path(old).with_suffix(".webp"))
    return new, old


def http(path: str, payload=None):
    req = urllib.request.Request(
        f"{MAGICA}{path}",
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Authorization": f"Bearer {os.environ['MAGICA_KEY']}", "Content-Type": "application/json"},
        method="POST" if payload is not None else "GET",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def generate(prompt: str, size: str) -> bytes | None:
    run_id = http(f"/nodes/{MODEL}/run", {"input": {"prompt": prompt, "image_size": size, "output_format": "PNG"}})["runId"]
    for _ in range(60):
        run = http(f"/nodes/runs/{run_id}")
        status = run.get("status")
        if status not in ("RUNNING", "PENDING", "QUEUED"):
            if status != "COMPLETED":
                print(f"  ! run {run_id} ended {status}: {run.get('error')}")
                return None
            url = (run.get("output") or {}).get("result", [None])[0]
            if not url:
                return None
            with urllib.request.urlopen(url, timeout=60) as r:
                return r.read()
        time.sleep(4)
    return None


def fit(png: bytes, portrait: bool) -> Image.Image:
    im = Image.open(io.BytesIO(png)).convert("RGB")
    tw, th = OUT_SIZE[portrait]
    # centre-crop to the target ratio, then resize
    r = tw / th
    w, h = im.size
    if w / h > r:
        nw = int(h * r)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / r)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    return im.resize((tw, th), Image.Resampling.LANCZOS)


def pending(rs: list[dict], cat: dict, log: dict, force: bool = False) -> list[dict]:
    """Backlog rows still to generate. `force` keeps rows already in the log,
    for regenerating an image that review rejected."""
    todo = []
    for r in rs:
        if r["dng"]:
            continue
        etype = CATALOG[r["type"]][0]
        rec = find_record(cat, etype, r["slug"])
        if not rec or (rec["id"] in log.get(etype, {}) and not force):
            continue
        todo.append({**r, "etype": etype, "rec": rec})
    return todo


def key_of(r: dict) -> str:
    return f"{r['etype']}:{r['slug']}"


def staged_path(etype: str, slug: str) -> Path:
    return STAGE / f"{etype}__{slug}.webp"


def cmd_gen(args) -> int:
    if not os.environ.get("MAGICA_KEY"):
        sys.exit("MAGICA_KEY not set")
    cat, log = catalogs(), load_log()
    force = bool(args.force and args.ids)
    todo = pending(rows(), cat, log, force=force)
    if args.ids:
        want = set(args.ids.split(","))
        todo = [r for r in todo if key_of(r) in want]
    else:
        todo = todo[: args.count]
    for r in todo:
        assert_generatable(r["etype"], r["rec"]["id"])
    if not force:
        # A staged candidate is already paid for and waiting for review.
        kept = [r for r in todo if staged_path(r["etype"], r["slug"]).exists()]
        for r in kept:
            print(f"SKIP {key_of(r)} already staged (use --force --ids to regenerate)")
        todo = [r for r in todo if r not in kept]
    STAGE.mkdir(parents=True, exist_ok=True)
    notes = json.loads(args.notes) if args.notes else {}

    def work(r):
        prompt, _ = build_prompt(r, r["rec"], cat)
        note = notes.get(key_of(r), "")
        if note.startswith("!"):
            # Replace the catalog description (used when it trips a content filter).
            culture = build_prompt(r, r["rec"], cat)[1]
            etype = r["etype"]
            nm = r["rec"]["title"] if etype == "story" else r["rec"]["name"]
            prompt = STYLE + FRAMING[etype].format(name=nm) + " " + note[1:] + RULES.format(culture=culture)
        elif note:
            prompt += " " + note
        portrait = r["etype"] in PORTRAIT
        png = None
        for attempt in range(3):  # 403/429 show up under parallel load; back off and retry
            try:
                png = generate(prompt, API_SIZE[portrait])
                break
            except Exception as e:  # one bad run must not sink the batch
                print(f"  ! {key_of(r)} try {attempt + 1}: {type(e).__name__} {e}")
                time.sleep(20 * (attempt + 1))
        if not png:
            return key_of(r), None, prompt
        out = staged_path(r["etype"], r["slug"])
        fit(png, portrait).save(out, "WEBP", quality=82, method=6)
        (STAGE / f"{r['etype']}__{r['slug']}.prompt.txt").write_text(prompt, encoding="utf-8")
        return key_of(r), out, prompt

    ok = 0
    with cf.ThreadPoolExecutor(max_workers=5) as ex:
        for k, out, _ in ex.map(work, todo):
            print(("OK  " if out else "FAIL"), k, out or "")
            ok += bool(out)
    print(f"generated {ok}/{len(todo)}; estimated spend <= ${ok * EST_COST:.2f}")
    return 0


class Transaction:
    """Atomic file writes with rollback. Every write goes to a temp file next
    to its target and is renamed into place; `rollback` restores the bytes each
    target had before this transaction touched it."""

    def __init__(self) -> None:
        self._backup: dict[Path, bytes | None] = {}

    def write(self, dest: Path, data: bytes) -> None:
        if dest not in self._backup:
            self._backup[dest] = dest.read_bytes() if dest.exists() else None
        dest.parent.mkdir(parents=True, exist_ok=True)
        tmp = dest.with_name(f".{dest.name}.tmp")
        tmp.write_bytes(data)
        os.replace(tmp, dest)

    def rollback(self) -> None:
        for dest, old in self._backup.items():
            if old is None:
                dest.unlink(missing_ok=True)
            else:
                dest.write_bytes(old)


def rebuild_provenance(tx: Transaction) -> None:
    """Regenerate image-provenance.json from the catalog and generation log,
    which must already be written. Skipped when the log has no AI images."""
    import build_image_provenance as bip

    text = json.dumps(bip.build(), indent=2, ensure_ascii=False) + "\n"
    tx.write(bip.OUTPUT, text.encode("utf-8"))


def plan_apply(ids: list[str], cat: dict, by_key: dict) -> list[dict]:
    """Validate every id before anything is written. Raises SystemExit naming
    the first problem, so a bad id late in the list cannot leave earlier
    images half-applied."""
    plan = []
    for k in ids:
        if ":" not in k:
            sys.exit(f"{k}: expected type:slug")
        etype, slug = k.split(":", 1)
        row = by_key.get(k)
        if row is None:
            sys.exit(f"{k}: no backlog row")
        rec = find_record(cat, etype, slug)
        if rec is None:
            sys.exit(f"{k}: no catalog record")
        try:
            assert_generatable(etype, rec["id"])
        except DoNotGenerate as e:
            sys.exit(str(e))
        if row["dng"]:
            sys.exit(f"{k} is DO NOT GENERATE")
        src = staged_path(etype, slug)
        prompt_file = STAGE / f"{etype}__{slug}.prompt.txt"
        if not src.exists() or not prompt_file.exists():
            sys.exit(f"{k}: nothing staged (run gen first)")
        new, old = target_path(rec, etype)
        dest = (WEB_PUBLIC / new.lstrip("/")).resolve()
        if not dest.is_relative_to(WEB_PUBLIC.resolve()):
            sys.exit(f"{k}: target {new} escapes the public folder")
        plan.append({"k": k, "etype": etype, "rec": rec, "src": src, "prompt_file": prompt_file, "dest": dest, "new": new, "old": old})
    return plan


def cmd_apply(args) -> int:
    cat, log = catalogs(), load_log()
    today = datetime.date.today().isoformat()
    by_key = {key_of({"etype": CATALOG[r["type"]][0], "slug": r["slug"]}): r for r in rows()}
    plan = plan_apply(args.ids.split(","), cat, by_key)
    tx = Transaction()
    try:
        changed: dict[str, dict[str, str]] = {}
        for item in plan:
            etype, rec = item["etype"], item["rec"]
            tx.write(item["dest"], item["src"].read_bytes())
            if item["new"] != item["old"]:
                changed.setdefault(etype, {})[rec["id"]] = item["new"]
            log.setdefault(etype, {})[rec["id"]] = {
                "path": item["new"],
                "model": MODEL,
                "date": today,
                "aspect": "4:5" if etype in PORTRAIT else "3:2",
                "prompt": item["prompt_file"].read_text(encoding="utf-8"),
            }
        for etype, m in changed.items():
            fname = next(f for _, (t, f, _k) in CATALOG.items() if t == etype)
            data = json.loads((DATA_DIR / fname).read_text(encoding="utf-8"))
            for r in data:
                if r["id"] in m:
                    r["imageUrl"] = m[r["id"]]
            tx.write(DATA_DIR / fname, (json.dumps(data, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))
        ordered = {t: dict(sorted(v.items())) for t, v in sorted(log.items())}
        tx.write(LOG, (json.dumps(ordered, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))
        rebuild_provenance(tx)
    except BaseException:
        tx.rollback()
        raise
    print(f"applied {len(plan)}; imageUrl changed for {sum(len(v) for v in changed.values())}; provenance rebuilt")
    return 0


def cmd_status(_args) -> int:
    cat, log = catalogs(), load_log()
    rs = rows()
    applied = staged = ungenerated = 0
    for r in pending(rs, cat, log, force=True):
        etype = r["etype"]
        if r["rec"]["id"] in log.get(etype, {}):
            applied += 1
        elif staged_path(etype, r["slug"]).exists():
            staged += 1
        else:
            ungenerated += 1
    print(
        f"backlog rows {len(rs)}; DO NOT GENERATE {sum(r['dng'] for r in rs)}; "
        f"applied {applied}; staged (awaiting apply) {staged}; ungenerated {ungenerated}"
    )
    return 0


def main() -> int:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("gen")
    g.add_argument("--count", type=int, default=25)
    g.add_argument("--ids")
    g.add_argument("--force", action="store_true", help="with --ids: regenerate rows already in the log")
    g.add_argument("--notes", help='JSON {"type:slug": "extra prompt text"}')
    a = sub.add_parser("apply")
    a.add_argument("--ids", required=True)
    sub.add_parser("status")
    args = p.parse_args()
    return {"gen": cmd_gen, "apply": cmd_apply, "status": cmd_status}[args.cmd](args)


if __name__ == "__main__":
    sys.exit(main())
