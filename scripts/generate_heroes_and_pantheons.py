#!/usr/bin/env python3
"""
generate_heroes_and_pantheons.py
Generates the 7 missing hero plates and 3 missing pantheon covers for Mythos Atlas,
matching the established dark-academia classical atlas aesthetic.
"""

import argparse
import os
import math
from PIL import Image, ImageDraw, ImageFilter

from _plate_emblems import draw_emblem
from _repo_paths import WEB_PUBLIC, serif_font, write_webp

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
    }
]

W_HERO, H_HERO = 768, 1024

def draw_ornament_corners(draw, x0, y0, x1, y1, color):
    s = 24
    for cx, cy, dx, dy in [(x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)]:
        draw.line([(cx, cy), (cx + dx * s, cy)], fill=color, width=2)
        draw.line([(cx, cy), (cx, cy + dy * s)], fill=color, width=2)
        draw.ellipse([cx + dx * 8 - 3, cy + dy * 8 - 3, cx + dx * 8 + 3, cy + dy * 8 + 3], fill=color)

def draw_greek_key_border(draw, x0, y0, x1, y1, color):
    draw.rectangle([x0, y0, x1, y1], outline=color, width=1)
    draw.rectangle([x0 + 8, y0 + 8, x1 - 8, y1 - 8], outline=(color[0]//2, color[1]//2, color[2]//2), width=1)
    draw.rectangle([x0 + 14, y0 + 14, x1 - 14, y1 - 14], outline=color, width=2)

def draw_new_hero_motif(draw, cx, cy, radius, motif, accent):
    gold = accent
    pale_gold = (min(255, gold[0] + 50), min(255, gold[1] + 50), min(255, gold[2] + 50))
    dark_gold = (gold[0] // 2, gold[1] // 2, gold[2] // 2)

    # Medallion outer rings
    for r, w in [(radius, 3), (radius - 12, 1), (radius - 20, 2)]:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=gold, width=w)

    for i in range(24):
        angle = i * (2 * math.pi / 24)
        r1 = radius - 8
        r2 = radius - 3 if i % 2 == 0 else radius - 5
        draw.line([
            (cx + r1 * math.cos(angle), cy + r1 * math.sin(angle)),
            (cx + r2 * math.cos(angle), cy + r2 * math.sin(angle))
        ], fill=dark_gold, width=1)

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
    img = Image.new("RGBA", (W_HERO, H_HERO), hero["bg_tone"] + (255,))
    accent = hero["accent"]
    gold = (212, 175, 55)

    # Radial ambient glow
    rad_overlay = Image.new("RGBA", (W_HERO, H_HERO), (0, 0, 0, 0))
    rad_draw = ImageDraw.Draw(rad_overlay)
    cx, cy = W_HERO // 2, 440
    for r in range(350, 50, -10):
        alpha = int(45 * (1.0 - r / 350.0))
        rad_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=accent + (alpha,))
    img = Image.alpha_composite(img, rad_overlay)
    draw = ImageDraw.Draw(img)

    # Classical borders
    draw_greek_key_border(draw, 32, 32, W_HERO - 32, H_HERO - 32, gold)
    draw_ornament_corners(draw, 32, 32, W_HERO - 32, H_HERO - 32, gold)

    # Header plate rule
    draw.line([(64, 90), (W_HERO - 64, 90)], fill=gold, width=1)
    draw.line([(64, 94), (W_HERO - 64, 94)], fill=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)

    tag_text = f"MYTHOS ATLAS · {hero['pantheon']} HEROIC TRADITION"
    font_sm = serif_font("regular", 16)
    font_lg = serif_font("bold", 44)
    font_sub = serif_font("italic", 18)

    draw.text((W_HERO // 2, 65), tag_text, font=font_sm, fill=(200, 180, 140), anchor="mm")

    # Center Medallion
    draw_new_hero_motif(draw, cx, cy, 175, hero["motif"], accent)

    # Nameplate bottom
    draw.line([(80, 750), (W_HERO - 80, 750)], fill=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)
    draw.line([(80, 754), (W_HERO - 80, 754)], fill=gold, width=2)
    draw.line([(80, 758), (W_HERO - 80, 758)], fill=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)

    draw.text((W_HERO // 2, 810), hero["name"], font=font_lg, fill=(245, 235, 220), anchor="mm")
    draw.text((W_HERO // 2, 860), hero["epithet"], font=font_sub, fill=(212, 175, 55), anchor="mm")

    # Footer Archival stamp
    draw.text((W_HERO // 2, 940), "CODEX HEROUM · FOLIO ANNUUM", font=font_sm, fill=(130, 120, 100), anchor="mm")
    draw.line([(W_HERO // 2 - 60, 965), (W_HERO // 2 + 60, 965)], fill=gold, width=1)

    # Export PNG
    png_path = os.path.join(HEROES_DIR, f"{hero['id']}.png")
    img.convert("RGB").save(png_path, "PNG")

    # Export WebP
    webp_path = os.path.join(HEROES_DIR, f"{hero['id']}.webp")
    write_webp(png_path, webp_path)
    print(f"  ✓ Hero: {hero['id']} -> PNG & WebP")

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

    # INCA & ANDEAN (2026-09)
    {"slug": "inca", "name": "INCA & ANDEAN TRADITION", "culture": "TAWANTINSUYU · THE ANDES", "accent": (215, 165, 55), "bg_tone": (20, 14, 12), "motif": "emblem_sun_face"},
]

def generate_pantheon_plate(p):
    w, h = 1024, 768
    img = Image.new("RGBA", (w, h), p["bg_tone"] + (255,))
    accent = p["accent"]
    gold = (212, 175, 55)

    # Ambient radial washes
    rad = Image.new("RGBA", (w, h), (0,0,0,0))
    rdraw = ImageDraw.Draw(rad)
    cx, cy = w // 2, h // 2
    for r in range(450, 50, -15):
        alpha = int(35 * (1.0 - r / 450.0))
        rdraw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=accent + (alpha,))
    img = Image.alpha_composite(img, rad)
    draw = ImageDraw.Draw(img)

    # Double classical outer borders
    draw.rectangle([32, 32, w - 32, h - 32], outline=gold, width=2)
    draw.rectangle([42, 42, w - 42, h - 42], outline=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)

    # Corner brackets
    draw_ornament_corners(draw, 42, 42, w - 42, h - 42, gold)

    # Center Medallion
    med_r = 180
    draw.ellipse([cx - med_r, cy - med_r - 20, cx + med_r, cy + med_r - 20], outline=gold, width=3)
    draw.ellipse([cx - med_r + 14, cy - med_r - 6, cx + med_r - 14, cy + med_r - 34], outline=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)

    # Medallion motifs
    m_cy = cy - 20
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

    # Typography
    font_lg = serif_font("bold", 46)
    font_sub = serif_font("regular", 20)

    draw.text((cx, h - 120), p["name"], font=font_lg, fill=(245, 235, 220), anchor="mm")
    draw.text((cx, h - 75), f"CODEX MYTHOLOGIAE · {p['culture']}", font=font_sub, fill=gold, anchor="mm")

    # Export JPG
    jpg_path = os.path.join(PANTHEONS_DIR, f"{p['slug']}.jpg")
    img.convert("RGB").save(jpg_path, "JPEG", quality=90)

    # Export 640x640 PNG
    png_path = os.path.join(PANTHEONS_DIR, f"{p['slug']}.png")
    img.resize((640, 640), Image.Resampling.LANCZOS).convert("RGB").save(png_path, "PNG")
    print(f"  ✓ Pantheon: {p['slug']} -> JPG & PNG")

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
