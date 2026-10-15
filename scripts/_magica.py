"""Minimal Magica REST client shared by the audio generation scripts.

Build-time only. Reads MAGICA_KEY from the environment and never prints it.
Result URLs are CDN links: download them into the repo, never store them.
"""

from __future__ import annotations

import json
import os
import threading
import time
import urllib.error
import urllib.request

BASE = "https://api.magica.com/api/v1"


# The API allows about 20 requests per minute per key, shared by POST and GET.
# Space every request from this process out so polling cannot starve submits.
_MIN_INTERVAL_S = 3.6
_lock = threading.Lock()
_next_slot = 0.0


def _pace() -> None:
    global _next_slot
    with _lock:
        now = time.monotonic()
        wait = max(0.0, _next_slot - now)
        _next_slot = max(now, _next_slot) + _MIN_INTERVAL_S
    if wait:
        time.sleep(wait)


def _req(path: str, payload: dict | None = None, timeout: int = 60):
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={
            "Authorization": f"Bearer {os.environ['MAGICA_KEY']}",
            "Content-Type": "application/json",
        },
        method="POST" if payload is not None else "GET",
    )
    for attempt in range(8):
        _pace()
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code not in (429, 502, 503, 504) or attempt == 7:
                raise
            reset = e.headers.get("x-ratelimit-reset")
            delay = (int(reset) / 1000 - time.time() + 1) if reset else 0
            time.sleep(float(e.headers.get("Retry-After") or max(delay, min(2 ** attempt * 2, 60))))


def run_node(node: str, inp: dict, out_path: str, tries: int = 90, wait: float = 5) -> bool:
    """Run a node, poll to completion, download result[0] to out_path."""
    run_id = _req(f"/nodes/{node}/run", {"input": inp})["runId"]
    print(f"  run {run_id}")
    for _ in range(tries):
        run = _req(f"/nodes/runs/{run_id}", timeout=30)
        status = run.get("status")
        if status in ("RUNNING", "PENDING", "QUEUED"):
            time.sleep(wait)
            continue
        if status != "COMPLETED":
            print(f"  ! run {run_id} ended {status}: {run.get('error')}")
            return False
        url = (run.get("output") or {}).get("result", [None])[0]
        if not url:
            print(f"  ! no result url for {run_id}")
            return False
        os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
        dl = urllib.request.Request(url, headers={"User-Agent": "mythos-asset-script/1.0"})
        with urllib.request.urlopen(dl, timeout=120) as r, open(out_path, "wb") as f:
            f.write(r.read())
        return True
    print(f"  ! run {run_id} timed out")
    return False


def audio_seconds(path) -> float:
    """Duration in seconds via ffprobe, or 0.0 when the file is unreadable."""
    import subprocess
    try:
        return float(subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", str(path)], text=True).strip())
    except (subprocess.CalledProcessError, ValueError):
        return 0.0


def write_audio_atomically(dst, build) -> None:
    """Call build(tmp_path) to write an mp3, validate it, then replace dst.

    The temp file sits beside dst so os.replace is atomic. A failed or
    interrupted encode leaves dst untouched, so a later run cannot skip a
    truncated asset.
    """
    from pathlib import Path
    dst = Path(dst)
    dst.parent.mkdir(parents=True, exist_ok=True)
    tmp = dst.with_name(f".{dst.name}.tmp.mp3")
    try:
        build(tmp)
        if audio_seconds(tmp) <= 0:
            raise RuntimeError(f"encode produced an unreadable file for {dst.name}")
        os.replace(tmp, dst)
    finally:
        tmp.unlink(missing_ok=True)
