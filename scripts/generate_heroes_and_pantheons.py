#!/usr/bin/env python3
"""
generate_heroes_and_pantheons.py
Generates the 7 missing hero plates and 3 missing pantheon covers for Mythos Atlas,
matching the established dark-academia classical atlas aesthetic.
"""

import argparse
import os
import math

from _plate_emblems import draw_emblem
from _plate_art import pantheon_of, render_plate, write_plate
from _repo_paths import WEB_PUBLIC

HEROES_DIR = os.path.join(WEB_PUBLIC, "heroes")
PANTHEONS_DIR = os.path.join(WEB_PUBLIC, "pantheons")

os.makedirs(HEROES_DIR, exist_ok=True)
os.makedirs(PANTHEONS_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. New Heroes (7 additions)
# ---------------------------------------------------------------------------
NEW_HEROES = [
    {
        "id": "yamato-takeru",
        "name": "YAMATO TAKERU",
        "epithet": "GRASS-CLEAVING BLADE · PRINCE OF YAMATO",
        "pantheon": "JAPANESE",
        "accent": (230, 80, 70),      # Shinto Vermilion
        "bg_tone": (24, 14, 16),
        "motif": "kusanagi_sword"
    },
    {
        "id": "ilya-muromets",
        "name": "ILYA MUROMETS",
        "epithet": "FIRST BOGATYR OF KIEV · SHIELD OF RUS",
        "pantheon": "SLAVIC",
        "accent": (218, 165, 32),     # Kievan Gold
        "bg_tone": (22, 18, 12),
        "motif": "bogatyr_mace"
    },
    {
        "id": "dobrynya-nikitich",
        "name": "DOBRYNYA NIKITICH",
        "epithet": "SLAYER OF THE DRAGON · DIPLOMAT BOGATYR",
        "pantheon": "SLAVIC",
        "accent": (140, 160, 210),    # River Puchai / Silver Steel
        "bg_tone": (16, 18, 26),
        "motif": "dragon_slayer"
    },
    {
        "id": "hua-mulan",
        "name": "HUA MULAN",
        "epithet": "BALLAD OF THE WARRIOR · DAUGHTER OF WEI",
        "pantheon": "CHINESE",
        "accent": (215, 95, 60),      # Cinnabar & Silk
        "bg_tone": (26, 14, 14),
        "motif": "mulan_bow"
    },
    {
        "id": "kupe",
        "name": "KUPE",
        "epithet": "NAVIGATOR OF THE GREAT OCEAN · AOTEAROA",
        "pantheon": "POLYNESIAN",
        "accent": (45, 175, 165),     # Pacific Pounamu Green
        "bg_tone": (10, 22, 22),
        "motif": "kupe_waka"
    },
    {
        "id": "moremi-ajasoro",
        "name": "MOREMI AJASORO",
        "epithet": "QUEEN OF ILE-IFE · DELIVERER OF THE YORUBA",
        "pantheon": "YORUBA",
        "accent": (235, 165, 45),     # Ancient Ife Bronze
        "bg_tone": (26, 18, 10),
        "motif": "ife_crown_torch"
    },
    {
        "id": "etana",
        "name": "ETANA",
        "epithet": "SHEPHERD WHO ASCENDED TO HEAVEN · KING OF KISH",
        "pantheon": "MESOPOTAMIAN",
        "accent": (205, 150, 75),     # Cuneiform Lapis & Gold
        "bg_tone": (22, 16, 14),
        "motif": "etana_eagle"
    },

    # PERSIAN / IRANIAN (2026-09)
    {"id": "rostam", "name": "ROSTAM", "epithet": "CHAMPION OF IRAN · RIDER OF RAKHSH", "pantheon": "PERSIAN", "accent": (200, 140, 70), "bg_tone": (20, 14, 12), "motif": "emblem_mace"},
]

W_HERO, H_HERO = 768, 1024

def draw_new_hero_motif(draw, cx, cy, radius, motif, accent):
    gold = accent
    pale_gold = (min(255, gold[0] + 50), min(255, gold[1] + 50), min(255, gold[2] + 50))
    dark_gold = (gold[0] // 2, gold[1] // 2, gold[2] // 2)

    # The medallion rings are drawn by _plate_art.render_plate.

    if draw_emblem(draw, cx, cy, motif, accent, gold):
        return

    if motif == "kusanagi_sword":
        # Sacred Bronze Sword of Yamato Takeru & Sun Disk
        draw.line([(cx, cy - 90), (cx, cy + 70)], fill=pale_gold, width=6)
        draw.polygon([(cx, cy - 105), (cx - 10, cy - 85), (cx + 10, cy - 85)], fill=pale_gold)
        draw.line([(cx - 28, cy + 30), (cx + 28, cy + 30)], fill=gold, width=8)
        # Solar mirror crest
        draw.ellipse([cx - 35, cy - 40, cx + 35, cy + 30], outline=gold, width=3)
        # Curved fire tongues (burning plains of Suruga)
        for offset, s_ang in [(-45, 140), (45, 220)]:
            draw.arc([cx + offset - 25, cy + 35, cx + offset + 25, cy + 85], start=180, end=360, fill=gold, width=4)

    elif motif == "bogatyr_mace":
        # Kievan Shestoper Mace and Spiked Iron Shield
        draw.line([(cx - 45, cy + 75), (cx + 45, cy - 65)], fill=gold, width=10)
        # Flanges of the mace
        for off in [-20, 0, 20]:
            draw.ellipse([cx + 35 + off*0.4 - 10, cy - 55 - off*0.4 - 10, cx + 35 + off*0.4 + 10, cy - 55 - off*0.4 + 10], fill=pale_gold)
        # Oak boss shield
        draw.ellipse([cx - 45, cy - 20, cx + 45, cy + 70], outline=gold, width=4)
        draw.ellipse([cx - 15, cy + 10, cx + 15, cy + 40], fill=pale_gold)

    elif motif == "dragon_slayer":
        # Zmey Gorynych 3 dragon heads slain & upright silver broadsword
        draw.line([(cx, cy - 95), (cx, cy + 75)], fill=pale_gold, width=5)
        draw.line([(cx - 35, cy - 40), (cx + 35, cy - 40)], fill=gold, width=6)
        # Three dragon crests
        draw.arc([cx - 70, cy - 80, cx - 10, cy - 10], start=160, end=340, fill=gold, width=4)
        draw.arc([cx - 30, cy - 100, cx + 30, cy - 30], start=170, end=350, fill=gold, width=4)
        draw.arc([cx + 10, cy - 80, cx + 70, cy - 10], start=190, end=370, fill=gold, width=4)
        # Water ripples of River Puchai below
        for ry in [50, 65, 80]:
            draw.arc([cx - 50, cy + ry - 10, cx + 50, cy + ry + 10], start=0, end=180, fill=dark_gold, width=2)

    elif motif == "mulan_bow":
        # Han/Wei Recurve Cavalry Bow and Feathered Arrow
        draw.arc([cx - 85, cy - 90, cx + 85, cy + 90], start=210, end=330, fill=gold, width=5)
        draw.line([(cx - 75, cy - 45), (cx + 75, cy - 45)], fill=dark_gold, width=2)
        # Central Arrow
        draw.line([(cx, cy + 70), (cx, cy - 90)], fill=pale_gold, width=3)
        draw.polygon([(cx, cy - 105), (cx - 10, cy - 85), (cx + 10, cy - 85)], fill=pale_gold)
        # Willow/plum blossom branch
        draw.arc([cx - 50, cy - 10, cx + 50, cy + 70], start=30, end=210, fill=pale_gold, width=3)
        for bx, by in [(-25, 45), (0, 65), (25, 45)]:
            draw.ellipse([cx + bx - 5, cy + by - 5, cx + bx + 5, cy + by + 5], fill=pale_gold)

    elif motif == "kupe_waka":
        # Polynesian Double-Hulled Voyaging Waka & Koru Spirals
        draw.arc([cx - 80, cy + 10, cx + 80, cy + 75], start=10, end=170, fill=gold, width=6)
        # Prow / Tauihu carving upwards
        draw.arc([cx - 80, cy - 40, cx - 30, cy + 30], start=90, end=270, fill=pale_gold, width=4)
        draw.arc([cx + 30, cy - 40, cx + 80, cy + 30], start=270, end=450, fill=pale_gold, width=4)
        # Twin sails (Crab claw / triangular oceanic sails)
        draw.polygon([(cx - 35, cy + 15), (cx - 15, cy - 70), (cx - 5, cy + 15)], fill=pale_gold, outline=gold)
        draw.polygon([(cx + 5, cy + 15), (cx + 25, cy - 70), (cx + 35, cy + 15)], fill=pale_gold, outline=gold)
        # Koru wave spiral below
        draw.arc([cx - 30, cy + 40, cx + 30, cy + 85], start=0, end=300, fill=gold, width=3)

    elif motif == "ife_crown_torch":
        # Sacred Beaded Crown of Ile-Ife & Torch of Deliverance
        # Crown dome and vertical plumes
        draw.arc([cx - 45, cy - 40, cx + 45, cy + 40], start=180, end=360, fill=gold, width=5)
        draw.rectangle([cx - 45, cy - 10, cx + 45, cy + 15], fill=gold)
        # Plumes / finials
        draw.line([(cx, cy - 40), (cx, cy - 85)], fill=pale_gold, width=5)
        draw.line([(cx - 25, cy - 35), (cx - 35, cy - 75)], fill=gold, width=3)
        draw.line([(cx + 25, cy - 35), (cx + 35, cy - 75)], fill=gold, width=3)
        # Torch of firebrands
        draw.line([(cx - 55, cy + 70), (cx + 55, cy - 30)], fill=pale_gold, width=4)
        # Flame
        draw.polygon([(cx + 60, cy - 35), (cx + 80, cy - 65), (cx + 55, cy - 50)], fill=pale_gold)

    elif motif == "etana_eagle":
        # Great Mesopotamian Solar Eagle lifting the King to Anu's Heaven
        # Outspread wings
        draw.arc([cx - 95, cy - 85, cx, cy + 35], start=170, end=340, fill=pale_gold, width=5)
        draw.arc([cx, cy - 85, cx + 95, cy + 35], start=200, end=370, fill=pale_gold, width=5)
        # Eagle body and talons
        draw.line([(cx, cy - 60), (cx, cy + 30)], fill=gold, width=7)
        draw.ellipse([cx - 15, cy - 75, cx + 15, cy - 45], fill=pale_gold)
        # Eight-pointed Star of Shamash above
        for angle_deg in [0, 45, 90, 135]:
            rad = math.radians(angle_deg)
            draw.line([
                (cx - 30 * math.cos(rad), cy - 90 - 30 * math.sin(rad)),
                (cx + 30 * math.cos(rad), cy - 90 + 30 * math.sin(rad))
            ], fill=pale_gold, width=2)
        # Shepherd's crook below
        draw.arc([cx - 30, cy + 30, cx, cy + 60], start=180, end=360, fill=gold, width=4)
        draw.line([(cx, cy + 45), (cx, cy + 85)], fill=gold, width=4)

def generate_hero_plate(hero):
    accent = hero["accent"]
    img = render_plate(
        kind="hero",
        key=hero["id"],
        size=(W_HERO, H_HERO),
        accent=accent,
        bg=hero["bg_tone"],
        pantheon=pantheon_of("hero", hero["id"]),
        hint=hero["epithet"],
        emblem=lambda draw, cx, cy: draw_new_hero_motif(draw, cx, cy, 175, hero["motif"], accent),
    )
    path = write_plate(img, HEROES_DIR, hero["id"])
    print(f"  ✓ Hero: {hero['id']} -> {os.path.basename(path)}")

# ---------------------------------------------------------------------------
# 2. Pantheon Covers (3 additions)
# ---------------------------------------------------------------------------
NEW_PANTHEONS = [
    {
        "slug": "slavic",
        "name": "SLAVIC TRADITION",
        "culture": "PRE-CHRISTIAN SLAVIC",
        "accent": (165, 120, 80),     # Ancient Oak & Rus Amber
        "bg_tone": (14, 12, 20),
        "motif": "slavic_sanctuary"
    },
    {
        "slug": "haudenosaunee",
        "name": "HAUDENOSAUNEE TRADITION",
        "culture": "SIX NATIONS CONFEDERACY",
        "accent": (75, 125, 185),     # Wampum Indigo & Pine
        "bg_tone": (12, 16, 24),
        "motif": "haudenosaunee_turtle"
    },
    {
        "slug": "tlingit-haida",
        "name": "TLINGIT & HAIDA TRADITION",
        "culture": "NORTHWEST COAST PACIFIC",
        "accent": (195, 65, 55),      # Cedar Ochre & Vermilion
        "bg_tone": (18, 12, 14),
        "motif": "tlingit_raven"
    },
    {
        "slug": "yoruba",
        "name": "YORUBA TRADITION",
        "culture": "ILE-IFE AND THE ORISHA",
        "accent": (200, 140, 60),
        "bg_tone": (20, 14, 10),
        "motif": "yoruba_chain"
    },
    {
        "slug": "akan",
        "name": "AKAN TRADITION",
        "culture": "NYAME, ASASE YAA AND ANANSE",
        "accent": (215, 175, 45),
        "bg_tone": (20, 18, 10),
        "motif": "akan_web"
    },

    # INCA & ANDEAN (2026-09)
    {"slug": "inca", "name": "INCA & ANDEAN TRADITION", "culture": "TAWANTINSUYU · THE ANDES", "accent": (215, 165, 55), "bg_tone": (20, 14, 12), "motif": "emblem_sun_face"},

    # PERSIAN / IRANIAN (2026-09)
    {"slug": "persian", "name": "PERSIAN (IRANIAN) TRADITION", "culture": "AVESTA · SHAHNAMEH", "accent": (90, 130, 210), "bg_tone": (12, 14, 24), "motif": "emblem_winged_disc"},

    # FINNISH / KALEVALA (2026-09)
    {"slug": "finnish", "name": "FINNISH TRADITION", "culture": "KALEVALA · KARELIA", "accent": (130, 190, 170), "bg_tone": (10, 12, 20), "motif": "emblem_kantele"},

    # KOREAN (2026-09)
    {"slug": "korean", "name": "KOREAN TRADITION", "culture": "GOJOSEON · GOGURYEO · SILLA", "accent": (130, 185, 165), "bg_tone": (10, 14, 14), "motif": "emblem_tree_altar"},
]

def draw_pantheon_motif(draw, cx, m_cy, p, accent, gold):
    """Emblem for a pantheon cover, centred on (cx, m_cy)."""
    cy = m_cy + 20
    draw_emblem(draw, cx, m_cy, p["motif"], accent, gold, p["bg_tone"])
    if p["motif"] == "slavic_sanctuary":
        # Four-faced Zbruch Idol & Sacred Oak Thunders
        draw.line([(cx - 25, m_cy - 90), (cx - 25, m_cy + 85)], fill=gold, width=4)
        draw.line([(cx + 25, m_cy - 90), (cx + 25, m_cy + 85)], fill=gold, width=4)
        draw.rectangle([cx - 25, m_cy - 100, cx + 25, m_cy - 75], fill=accent)
        # Solar / Gromovik 6-spoke thunder wheel
        for sp in range(6):
            ang = sp * (math.pi / 3)
            draw.line([
                (cx + 35 * math.cos(ang), m_cy - 10 + 35 * math.sin(ang)),
                (cx - 35 * math.cos(ang), m_cy - 10 - 35 * math.sin(ang))
            ], fill=(245, 230, 180), width=3)
        draw.ellipse([cx - 35, m_cy - 45, cx + 35, m_cy + 25], outline=gold, width=3)
        # Horn of abundance held by idol
        draw.arc([cx - 40, m_cy + 15, cx + 10, m_cy + 65], start=0, end=180, fill=gold, width=4)

    elif p["motif"] == "haudenosaunee_turtle":
        # Great Turtle shell carrying the Tree of Peace
        draw.ellipse([cx - 85, m_cy - 10, cx + 85, m_cy + 85], outline=gold, width=5)
        # Turtle scutes
        draw.polygon([(cx, m_cy + 15), (cx + 35, m_cy + 35), (cx + 25, m_cy + 65), (cx - 25, m_cy + 65), (cx - 35, m_cy + 35)], outline=gold, width=2)
        # Eastern White Pine (Tree of Peace) rising
        draw.line([(cx, m_cy + 15), (cx, m_cy - 85)], fill=gold, width=6)
        for py, pw in [(-25, 45), (-50, 35), (-70, 20)]:
            draw.polygon([(cx, m_cy + py - 20), (cx - pw, m_cy + py), (cx + pw, m_cy + py)], fill=(245, 230, 180), outline=gold)
        # Eagle atop the pine
        draw.polygon([(cx, m_cy - 95), (cx - 15, m_cy - 80), (cx + 15, m_cy - 80)], fill=gold)

    elif p["motif"] == "tlingit_raven":
        # Northwest Coast Formline Raven & Sun in the Box
        draw.ellipse([cx - 75, m_cy - 65, cx + 75, m_cy + 65], outline=gold, width=3)
        # Raven's curved beak holding the sun
        draw.arc([cx - 85, m_cy - 45, cx + 25, m_cy + 35], start=180, end=350, fill=(245, 230, 180), width=6)
        draw.line([(cx - 85, m_cy - 5), (cx - 15, m_cy - 5)], fill=gold, width=5)
        # Daylight radiant sphere in the beak
        draw.ellipse([cx - 80, m_cy - 35, cx - 40, m_cy + 5], fill=(245, 230, 180))
        # Formline ovoids
        draw.ellipse([cx + 5, m_cy - 25, cx + 55, m_cy + 25], outline=gold, width=4)
        draw.ellipse([cx + 20, m_cy - 10, cx + 45, cy + 10], fill=accent)

    elif p["motif"] == "yoruba_chain":
        # The chain let down from the sky, the snail shell of earth, and the five-toed hen
        for i in range(7):
            y = m_cy - 110 + i * 22
            draw.ellipse([cx - 9, y, cx + 9, y + 18], outline=gold, width=3)
        draw.arc([cx - 60, m_cy + 30, cx + 60, m_cy + 110], start=180, end=360, fill=(245, 230, 180), width=5)
        draw.ellipse([cx - 22, m_cy + 45, cx + 22, m_cy + 80], outline=gold, width=3)

    elif p["motif"] == "akan_web":
        # Ananse's web
        for k in range(8):
            ang = k * (math.pi / 4)
            draw.line([(cx, m_cy), (cx + 110 * math.cos(ang), m_cy + 110 * math.sin(ang))], fill=gold, width=2)
        for r in (30, 55, 80, 105):
            draw.ellipse([cx - r, m_cy - r, cx + r, m_cy + r], outline=(245, 230, 180), width=2)
        draw.ellipse([cx - 12, m_cy - 12, cx + 12, m_cy + 12], fill=accent)


def generate_pantheon_plate(p):
    accent = p["accent"]
    gold = (212, 175, 55)
    img = render_plate(
        kind="pantheon",
        key=p["slug"],
        size=(1024, 768),
        accent=accent,
        bg=p["bg_tone"],
        pantheon=f"{p['slug']}-pantheon",
        hint=p["culture"],
        emblem=lambda draw, cx, cy: draw_pantheon_motif(draw, cx, cy, p, accent, gold),
        emblem_extent=100,
    )
    path = write_plate(img, PANTHEONS_DIR, p["slug"])
    print(f"  ✓ Pantheon: {p['slug']} -> {os.path.basename(path)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--only",
        help="Comma-separated hero ids or pantheon slugs to (re)generate; default is every plate.",
    )
    args = parser.parse_args()
    wanted = set(args.only.split(",")) if args.only else None

    heroes = [h for h in NEW_HEROES if wanted is None or h["id"] in wanted]
    pantheons = [p for p in NEW_PANTHEONS if wanted is None or p["slug"] in wanted]
    if wanted:
        missing = wanted - {h["id"] for h in heroes} - {p["slug"] for p in pantheons}
        if missing:
            raise SystemExit(f"Unknown ids: {', '.join(sorted(missing))}")

    print(f"Generating {len(heroes)} Hero Plates...")
    for h in heroes:
        generate_hero_plate(h)

    print(f"Generating {len(pantheons)} Pantheon Covers...")
    for p in pantheons:
        generate_pantheon_plate(p)

    print("Hero and pantheon plates generated.")
