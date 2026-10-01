"""Guards on the AI image generation entry points.

Run with: python3 -m pytest scripts/tests
"""

from __future__ import annotations

import io
import json
from pathlib import Path

import pytest
from PIL import Image

import _dng_guard
import generate_backlog_images as gbi
import generate_missing as gm

ETYPES = ["heroes", "deities", "creatures", "pantheons", "stories", "locations", "artifacts"]

BACKLOG = """# Backlog

| #   | Priority | Type | Name | Slug | Tradition | Prompt |
| --- | -------- | ---- | ---- | ---- | --------- | ------ |
| 1 | P0 | Hero | Hector | hector | Greek | Regenerate. |
| 2 | P0 | Hero | Sacred One | sacred-one | Haudenosaunee Tradition | DO NOT GENERATE (living tradition) |
| 3 | P0 | Hero | Achilles | achilles | Greek | Regenerate. |
"""


def png_bytes(color=(10, 20, 30)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (400, 500), color).save(buf, "PNG")
    return buf.getvalue()


@pytest.fixture
def repo(tmp_path, monkeypatch):
    """A tiny repo: backlog, catalogs, public/, a stage folder and a log."""
    data = tmp_path / "data"
    public = tmp_path / "public"
    stage = tmp_path / "stage"
    for d in (data, public / "heroes", stage):
        d.mkdir(parents=True)
    for name in ETYPES:
        (data / f"{name}.json").write_text("[]")
    heroes = [
        {"id": "hector", "slug": "hector", "name": "Hector", "imageUrl": "/heroes/hector.webp"},
        {"id": "sacred-one", "slug": "sacred-one", "name": "Sacred One", "imageUrl": "/heroes/sacred-one.webp"},
        {"id": "achilles", "slug": "achilles", "name": "Achilles", "imageUrl": "/heroes/achilles.webp"},
    ]
    (data / "heroes.json").write_text(json.dumps(heroes))
    backlog = tmp_path / "backlog.md"
    backlog.write_text(BACKLOG)
    log = data / "image-generations.json"
    for slug in ("hector", "sacred-one", "achilles"):
        (public / "heroes" / f"{slug}.webp").write_bytes(b"ORIGINAL")
    for mod in (gbi, _dng_guard):
        monkeypatch.setattr(mod, "BACKLOG", backlog)
        monkeypatch.setattr(mod, "DATA_DIR", data)
    monkeypatch.setattr(gbi, "WEB_PUBLIC", public)
    monkeypatch.setattr(gbi, "STAGE", stage)
    monkeypatch.setattr(gbi, "LOG", log)
    monkeypatch.setenv("MAGICA_KEY", "test")
    calls: list[str] = []
    monkeypatch.setattr(gbi, "rebuild_provenance", lambda tx: calls.append("provenance"))
    return type("Repo", (), {"data": data, "public": public, "stage": stage, "log": log, "calls": calls})


def stage_image(repo, slug: str) -> None:
    (repo.stage / f"hero__{slug}.webp").write_bytes(b"STAGED-" + slug.encode())
    (repo.stage / f"hero__{slug}.prompt.txt").write_text(f"prompt for {slug}")


class Args:
    def __init__(self, **kw):
        self.__dict__.update({"ids": None, "count": 25, "force": False, "notes": None, **kw})


# --- shared DNG guard -------------------------------------------------------


def test_guard_refuses_dng_and_allows_others(repo):
    assert _dng_guard.is_dng("hero", "sacred-one")
    with pytest.raises(_dng_guard.DoNotGenerate):
        _dng_guard.assert_generatable("hero", "sacred-one")
    _dng_guard.assert_generatable("hero", "hector")


def test_real_backlog_marks_130_rows():
    assert len(_dng_guard.dng_keys(_dng_guard.REPO_ROOT / "docs/design/image-backlog.md", _dng_guard.DATA_DIR)) >= 130


def test_backlog_generator_gen_refuses_dng(repo, monkeypatch):
    monkeypatch.setattr(gbi, "generate", lambda *a: pytest.fail("generate() called for a DNG row"))
    gbi.cmd_gen(Args(ids="hero:sacred-one"))
    assert not list(repo.stage.glob("hero__sacred-one*"))


def test_backlog_generator_apply_refuses_dng(repo):
    stage_image(repo, "sacred-one")
    with pytest.raises(SystemExit, match="DO NOT GENERATE"):
        gbi.cmd_apply(Args(ids="hero:sacred-one"))


def test_generate_missing_skips_dng_in_queue(repo, monkeypatch):
    monkeypatch.setattr(gm, "data_dir", str(repo.data))
    monkeypatch.setattr(gm, "public_dir", str(repo.public))
    monkeypatch.setattr(gm, "files_to_check", ["creatures.json"])
    (repo.data / "creatures.json").write_text(
        json.dumps([{"id": "sacred-one", "name": "X", "imageUrl": "/missing.png"}])
    )
    # The guard maps creature ids through the backlog; add a creature DNG row.
    text = (repo.data.parent / "backlog.md").read_text()
    (repo.data.parent / "backlog.md").write_text(
        text + "| 4 | P1 | Creature | X | sacred-one | Inuit Tradition | DO NOT GENERATE (living tradition) |\n"
    )
    assert gm.build_queue() == []


def test_generate_missing_generate_refuses_dng(repo, monkeypatch):
    monkeypatch.setattr(
        gm, "build_queue", lambda: [{"type": "heroes", "id": "sacred-one", "url": "/x.png", "prompt": "p"}]
    )
    monkeypatch.setattr(gm, "generate_image", lambda *a, **k: pytest.fail("generate_image called for a DNG id"))
    with pytest.raises(_dng_guard.DoNotGenerate):
        gm.main(["generate_missing.py", "--generate"])


# --- apply is all or nothing ------------------------------------------------


def test_apply_prevalidates_whole_batch_before_writing(repo):
    stage_image(repo, "hector")
    stage_image(repo, "sacred-one")
    with pytest.raises(SystemExit):
        gbi.cmd_apply(Args(ids="hero:hector,hero:sacred-one"))
    assert (repo.public / "heroes/hector.webp").read_bytes() == b"ORIGINAL"
    assert not repo.log.exists()
    assert repo.calls == []


def test_apply_requires_staged_file(repo):
    with pytest.raises(SystemExit, match="nothing staged"):
        gbi.cmd_apply(Args(ids="hero:hector"))


def test_apply_publishes_logs_and_rebuilds_provenance(repo):
    stage_image(repo, "hector")
    gbi.cmd_apply(Args(ids="hero:hector"))
    assert (repo.public / "heroes/hector.webp").read_bytes() == b"STAGED-hector"
    assert json.loads(repo.log.read_text())["hero"]["hector"]["prompt"] == "prompt for hector"
    assert repo.calls == ["provenance"]


def test_apply_rolls_back_when_provenance_fails(repo, monkeypatch):
    stage_image(repo, "hector")

    def boom(tx):
        raise RuntimeError("provenance failed")

    monkeypatch.setattr(gbi, "rebuild_provenance", boom)
    with pytest.raises(RuntimeError):
        gbi.cmd_apply(Args(ids="hero:hector"))
    assert (repo.public / "heroes/hector.webp").read_bytes() == b"ORIGINAL"
    assert not repo.log.exists()


# --- gen does not re-buy staged images --------------------------------------


def test_gen_skips_staged_unless_forced(repo, monkeypatch):
    calls: list[str] = []
    monkeypatch.setattr(gbi, "generate", lambda prompt, size: calls.append(size) or png_bytes())
    gbi.cmd_gen(Args(ids="hero:hector"))
    assert len(calls) == 1
    gbi.cmd_gen(Args(ids="hero:hector"))
    assert len(calls) == 1, "second run must not pay again"
    gbi.cmd_gen(Args(ids="hero:hector", force=True))
    assert len(calls) == 2


def test_status_reports_three_buckets(repo, capsys):
    stage_image(repo, "achilles")
    gbi.cmd_status(Args())
    out = capsys.readouterr().out
    assert "applied 0" in out and "staged (awaiting apply) 1" in out and "ungenerated 1" in out
