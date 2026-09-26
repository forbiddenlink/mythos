#!/usr/bin/env python3
"""
backfill_source_ids.py
Links free-text citations in the catalogs to works in sources.json.

Citations were written as strings ("Homer, Odyssey 9", "Prose Edda,
Gylfaginning (trans. Brodeur)"). This script adds an optional ``sourceId``
(and, for primary sources, a ``locator``) wherever the string clearly names
one catalogued work. The human-readable label is left untouched.

"Clearly" is deliberately strict: a citation is split on " / " and "; ";
every part must match the same single work, otherwise it is left alone (so
"Leyenda de los Soles / Florentine Codex Book 7" gets no id). Existing
sourceIds are never overwritten.

    python3 scripts/backfill_source_ids.py           # apply
    python3 scripts/backfill_source_ids.py --dry-run # report only
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter

from _repo_paths import DATA_DIR, write_data_json

# (sourceId, pattern that names the work, words to strip when deriving a
# locator: author names and connective phrases that are not locators).
WORKS: list[tuple[str, str, list[str]]] = [
    ("homeric-hymns", r"Homeric Hymn", []),
    ("iliad", r"\bIliad\b", ["Homer"]),
    ("odyssey", r"\bOdyssey\b", ["Homer", "The"]),
    ("theogony", r"\bTheogony\b", ["Hesiod"]),
    ("works-and-days", r"Works and Days", ["Hesiod"]),
    ("poetic-edda", r"Poetic Edda|V[oö]lusp[aá]|H[aá]vam[aá]l|Lokasenna|Gr[ií]mnism[aá]l|F[aá]fnism[aá]l|Þrymskviða|Baldrs draumar", []),
    ("prose-edda", r"Prose Edda|Gylfaginning|Sk[aá]ldskaparm[aá]l", ["Snorri Sturluson"]),
    ("mahabharata", r"Mahabharata|Bhagavad Gita", ["Vyasa"]),
    ("ramayana", r"Ramayana", ["of Valmiki", "Valmiki"]),
    ("rigveda", r"Rig ?[Vv]eda", []),
    ("kojiki", r"\bKojiki\b", []),
    ("nihon-shoki", r"Nihon Shoki|(?<!Shoku )\bNihongi\b", []),
    ("book-of-the-dead", r"Book of the Dead|Papyrus of Ani", ["The"]),
    ("pyramid-texts", r"Pyramid Texts", []),
    ("popol-vuh", r"Popol Vuh", []),
    ("enuma-elish", r"Enuma Elish", []),
    ("epic-of-gilgamesh", r"Epic of Gilgamesh|^Gilgamesh, Tablet", []),
    ("aeneid", r"\bAeneid\b", ["Virgil"]),
    ("metamorphoses", r"(?<!Apuleius, )\bMetamorphoses\b(?! \(The Golden Ass\))", ["Ovid"]),
    ("library-apollodorus", r"Apollodorus|Bibliotheca", []),
    ("tain-bo-cuailnge", r"T[aá]in B[oó] C[uú]ailnge", []),
    ("florentine-codex", r"Florentine Codex", ["Bernardino de Sahagún", "Sahagún", "Sahagun"]),
    ("cath-maige-tuired", r"Cath Maige Tuired", []),
    ("plutarch-isis-osiris", r"Isis and Osiris|De Iside et Osiride", ["Plutarch"]),
    ("russian-primary-chronicle", r"Russian Primary Chronicle|Povest' vremennykh let", []),
    ("journey-to-the-west", r"Journey to the West|Xiyouji", ["Wu Cheng'en"]),
    ("argonautica", r"Argonautica", ["Apollonius Rhodius", "Apollonius of Rhodes"]),
    ("huainanzi", r"Huainanzi", []),
    ("vishnu-purana", r"Vishnu Purana", []),
    ("fasti", r"\bFasti\b", ["Ovid"]),
    ("gods-and-fighting-men", r"Gods and Fighting Men", ["Lady Gregory"]),
    ("myths-mexico-peru", r"Myths of Mexico and Peru", ["Lewis Spence", "The"]),
    ("iroquoian-cosmology", r"Iroquoian Cosmology", ["J.N.B. Hewitt"]),
    ("seneca-myths-folk-tales", r"Seneca Myths and Folk Tales", ["Arthur C. Parker"]),
    ("leyenda-de-los-soles", r"Leyenda de los Soles", []),
    ("afanasyev-russian-fairy-tales", r"Narodnye russkie skazki", ["Alexander Afanasyev"]),
    ("lebor-gabala-erenn", r"Lebor Gab[aá]la [ÉE]renn", []),
]

# When deriving a locator, strip only the collection's own title so that a
# sub-work ("Gylfaginning", "Lokasenna st. 53", "Bhagavad Gita, Ch. X")
# survives as the locator. Defaults to the match pattern.
LOCATOR_TITLE = {
    "poetic-edda": r"Poetic Edda",
    "prose-edda": r"Prose Edda",
    "mahabharata": r"Mahabharata",
    "library-apollodorus": r"Apollodorus|Library|Bibliotheca",
}

# A locator is a book, chapter, line or section reference, never prose.
LOCATOR_RE = re.compile(
    r"^(?:Books?|Tablets?|Canto|Chapter|Ch\.|ch\.|Sect\.|Section|Spell|Utterance|Hymn|s\.a\.|Epitome"
    r"|Gylfaginning|Sk[aá]ldskaparm[aá]l|V[oö]lusp[aá]|H[aá]vam[aá]l|Lokasenna|Gr[ií]mnism[aá]l"
    r"|F[aá]fnism[aá]l|Þrymskviða|Baldrs draumar|Bhagavad Gita|Upper Volume|Lanming xun"
    r"|\w+ Kanda|\w+ Parva|[\dIVXLC]+(?=[\s.,:\-–]|$))"
)
YEAR_RE = re.compile(r"^\d{4}\b")


def match_work(text: str) -> str | None:
    parts = [p for p in re.split(r"\s+/\s+|;\s+", text) if p.strip()]
    found: set[str] = set()
    for part in parts:
        ids = {sid for sid, pattern, _ in WORKS if re.search(pattern, part)}
        if len(ids) != 1:
            return None
        found |= ids
    return found.pop() if len(found) == 1 else None


def derive_locator(text: str, source_id: str) -> str | None:
    if re.search(r"\s/\s|;", text):
        return None
    _, pattern, strip = next(w for w in WORKS if w[0] == source_id)
    rest = re.sub(r"\([^)]*\)", "", text)
    rest = re.sub(r"\s[—–-]\s.*$", "", rest)  # trailing editorial glosses
    rest = re.sub(LOCATOR_TITLE.get(source_id, pattern), "", rest)
    for word in strip:
        rest = rest.replace(word, "")
    rest = re.sub(r"^[\s,.:\-–]+|[\s,:\-–]+$", "", rest)
    rest = re.sub(r"\s{2,}", " ", rest).strip(" ,")
    rest = re.sub(r"\s+,", ",", rest)
    if (
        not rest
        or len(rest) > 60
        or "(" in rest
        or YEAR_RE.match(rest)
        or not LOCATOR_RE.match(rest)
    ):
        return None
    numeral = re.match(r"^[\dIVXLC][\dIVXLC.\-–]*(?=[\s,]|$)", rest)
    if numeral:
        if source_id == "homeric-hymns":
            return f"Hymn {rest}"
        rest = numeral.group(0)  # drop trailing prose such as ", the Yama-Yami dialogue"
        if source_id in BOOK_DIVIDED and re.fullmatch(r"[\dIVXLC]+", rest):
            return f"Book {rest}"
    return rest


# Works whose bare numbers ("Homer, Iliad 6") are book numbers.
BOOK_DIVIDED = {"iliad", "odyssey", "aeneid", "fasti", "argonautica", "metamorphoses"}


def with_fields(entry: dict, after: str, fields: dict) -> dict:
    """Return ``entry`` with ``fields`` inserted after key ``after``."""
    out = {}
    for key, value in entry.items():
        out[key] = value
        if key == after:
            out.update(fields)
    for key, value in fields.items():
        out.setdefault(key, value)
    return out


def backfill_list(entries: list, label_key: str, stats: Counter, locators: bool, author_key: str | None = None) -> list:
    result = []
    for entry in entries:
        if not isinstance(entry, dict) or entry.get("sourceId") or not entry.get(label_key):
            result.append(entry)
            continue
        label = entry[label_key]
        probe = label
        if author_key and entry.get(author_key) and label in ("Library", "The Library"):
            probe = f"{entry[author_key]}, {label}"
        source_id = match_work(probe)
        if not source_id:
            stats["unmatched"] += 1
            result.append(entry)
            continue
        fields = {"sourceId": source_id}
        if locators and not entry.get("locator"):
            locator = derive_locator(label, source_id)
            if locator:
                fields["locator"] = locator
        stats[source_id] += 1
        result.append(with_fields(entry, label_key, fields))
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Backfill sourceId on citations.")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    known = {s["id"] for s in json.loads((DATA_DIR / "sources.json").read_text(encoding="utf-8"))}
    missing = sorted({sid for sid, *_ in WORKS} - known)
    if missing:
        raise SystemExit(f"sources.json lacks: {', '.join(missing)}")

    stats: Counter = Counter()
    for filename in ["deities", "heroes", "creatures", "artifacts", "locations", "stories", "pantheons", "journeys"]:
        path = DATA_DIR / f"{filename}.json"
        records = json.loads(path.read_text(encoding="utf-8"))
        updated = []
        for record in records:
            if "primarySources" in record:
                record["primarySources"] = backfill_list(record["primarySources"], "source", stats, True)
            if "citationSources" in record:
                record["citationSources"] = backfill_list(
                    record["citationSources"], "title", stats, False, author_key="author"
                )
            if "variants" in record:
                record["variants"] = backfill_list(record["variants"], "source", stats, False)
            if filename == "journeys" and not record.get("sourceId"):
                source_id = match_work(record.get("source", ""))
                if source_id:
                    stats[source_id] += 1
                    record = with_fields(record, "source", {"sourceId": source_id})
            updated.append(record)
        if not args.dry_run:
            write_data_json(path, updated)

    unmatched = stats.pop("unmatched", 0)
    for source_id, count in stats.most_common():
        print(f"{count:4}  {source_id}")
    print(f"{sum(stats.values())} citations linked, {unmatched} left as free text")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
