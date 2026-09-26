#!/usr/bin/env python3
"""
generate_creatures_locations_stories.py
Generates illustrations for the 7 missing creatures, 6 missing locations,
and 11 missing stories in Mythos Atlas, adhering to the dark-academia classical atlas style.
"""

import os
import math
from PIL import Image, ImageDraw

from _repo_paths import WEB_PUBLIC, serif_font, write_webp

CREATURES_DIR = os.path.join(WEB_PUBLIC, "creatures")
LOCATIONS_DIR = os.path.join(WEB_PUBLIC, "locations")
STORIES_DIR = os.path.join(WEB_PUBLIC, "stories")
ARTIFACTS_DIR = os.path.join(WEB_PUBLIC, "artifacts")

os.makedirs(CREATURES_DIR, exist_ok=True)
os.makedirs(LOCATIONS_DIR, exist_ok=True)
os.makedirs(STORIES_DIR, exist_ok=True)
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

SIZE = 768

def draw_plate_borders(draw, w, h, gold, accent):
    # Outer double border
    draw.rectangle([24, 24, w - 24, h - 24], outline=gold, width=2)
    draw.rectangle([32, 32, w - 32, h - 32], outline=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)
    
    # Ornamental corner brackets
    s = 20
    for cx, cy, dx, dy in [(24, 24, 1, 1), (w - 24, 24, -1, 1), (24, h - 24, 1, -1), (w - 24, h - 24, -1, -1)]:
        draw.line([(cx, cy), (cx + dx * s, cy)], fill=gold, width=2)
        draw.line([(cx, cy), (cx, cy + dy * s)], fill=gold, width=2)
        draw.ellipse([cx + dx * 8 - 2, cy + dy * 8 - 2, cx + dx * 8 + 2, cy + dy * 8 + 2], fill=gold)

def draw_radial_wash(img, cx, cy, radius, accent):
    rad = Image.new("RGBA", img.size, (0, 0, 0, 0))
    rdraw = ImageDraw.Draw(rad)
    for r in range(radius, 40, -10):
        alpha = int(40 * (1.0 - r / float(radius)))
        rdraw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=accent + (alpha,))
    return Image.alpha_composite(img, rad)

# ---------------------------------------------------------------------------
# 1. Creatures
# ---------------------------------------------------------------------------
CREATURES = [
    {
        "id": "leshy",
        "name": "LESHY",
        "subtitle": "FOREST GUARDIAN SPIRIT",
        "accent": (120, 175, 90),
        "bg": (14, 20, 14),
        "motif": "leshy_antlers"
    },
    {
        "id": "rusalka",
        "name": "RUSALKA",
        "subtitle": "RESTLESS WATER NYMPH",
        "accent": (110, 185, 195),
        "bg": (12, 18, 24),
        "motif": "rusalka_water"
    },
    {
        "id": "domovoi",
        "name": "DOMOVOI",
        "subtitle": "SPIRIT OF THE HEARTH",
        "accent": (215, 145, 60),
        "bg": (22, 16, 12),
        "motif": "domovoi_hearth"
    },
    {
        "id": "vodyanoy",
        "name": "VODYANOY",
        "subtitle": "MASTER OF THE DEEP WATERS",
        "accent": (70, 150, 140),
        "bg": (10, 20, 20),
        "motif": "vodyanoy_swirl"
    },
    {
        "id": "zmey-gorynych",
        "name": "ZMEY GORYNYCH",
        "subtitle": "THREE-HEADED MOUNTAIN DRAGON",
        "accent": (215, 80, 50),
        "bg": (24, 12, 14),
        "motif": "zmey_dragon"
    },
    {
        "id": "koschei",
        "name": "KOSCHEI THE DEATHLESS",
        "subtitle": "SORCERER OF THE HIDDEN DEATH",
        "accent": (160, 130, 200),
        "bg": (18, 14, 24),
        "motif": "koschei_needle"
    },
    {
        "id": "baba-yaga",
        "name": "BABA YAGA",
        "subtitle": "THE FOREST WITCH",
        "accent": (195, 150, 75),
        "bg": (20, 16, 12),
        "motif": "baba_yaga_hut"
    },
    {
        "id": "mmoatia",
        "name": "MMOATIA",
        "subtitle": "LITTLE FOLK OF THE ASANTE FOREST",
        "accent": (140, 180, 100),
        "bg": (14, 20, 14),
        "motif": "leshy_antlers"
    },
    {
        "id": "stone-giants",
        "name": "STONE GIANTS",
        "subtitle": "GENONSGWA · COATS OF FLINT",
        "accent": (170, 150, 120),
        "bg": (18, 16, 14),
        "motif": "koschei_needle"
    },
    {
        "id": "horned-serpent",
        "name": "HORNED SERPENT",
        "subtitle": "SERPENT OF THE DEEP WATERS",
        "accent": (90, 160, 150),
        "bg": (10, 20, 20),
        "motif": "zmey_dragon"
    },
    {
        "id": "djogeon",
        "name": "DJOGEON",
        "subtitle": "THE LITTLE PEOPLE OF THE GULCHES",
        "accent": (160, 170, 110),
        "bg": (16, 18, 12),
        "motif": "domovoi_hearth"
    },
    {
        "id": "niagwahe",
        "name": "NIA'GWAHE",
        "subtitle": "THE MONSTER BEAR",
        "accent": (170, 110, 80),
        "bg": (20, 14, 12),
        "motif": "leshy_antlers"
    },
    {
        "id": "dagwanoenyent",
        "name": "DAGWANOENYENT",
        "subtitle": "THE STORM WIND · FLYING HEAD",
        "accent": (140, 160, 200),
        "bg": (14, 16, 24),
        "motif": "vodyanoy_swirl"
    },
    {
        "id": "kooshdaa-kaa",
        "name": "KOOSHDAA KAA",
        "subtitle": "THE LAND OTTER PEOPLE",
        "accent": (130, 150, 120),
        "bg": (14, 18, 16),
        "motif": "rusalka_water"
    },
    {
        "id": "gonakadet",
        "name": "GONAKADET",
        "subtitle": "BRINGER OF WEALTH FROM THE SEA",
        "accent": (200, 90, 70),
        "bg": (22, 14, 14),
        "motif": "vodyanoy_swirl"
    },
    {
        "id": "cihuateteo",
        "name": "CIHUATETEO",
        "subtitle": "WOMEN WHO ESCORT THE SETTING SUN",
        "accent": (210, 130, 80),
        "bg": (24, 14, 12),
        "motif": "koschei_needle"
    },
    {
        "id": "maquizcoatl",
        "name": "MAQUIZCOATL",
        "subtitle": "THE TWO-HEADED SERPENT",
        "accent": (100, 170, 140),
        "bg": (12, 20, 18),
        "motif": "zmey_dragon"
    },
    # 2026-09 additions for the Percy Jackson guide
    {
        "id": "nemean-lion",
        "name": "NEMEAN LION",
        "subtitle": "THE HIDE NO WEAPON COULD PIERCE",
        "accent": (210, 165, 75),
        "bg": (22, 18, 12),
        "motif": "leshy_antlers"
    },
    {
        "id": "ladon",
        "name": "LADON",
        "subtitle": "SERPENT OF THE GOLDEN APPLES",
        "accent": (150, 180, 90),
        "bg": (14, 20, 14),
        "motif": "zmey_dragon"
    }
]

def draw_creature_motif(draw, cx, cy, r, motif, accent, gold):
    pale = (min(255, gold[0]+40), min(255, gold[1]+40), min(255, gold[2]+40))
    # Outer ring
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=gold, width=3)
    draw.ellipse([cx - r + 10, cy - r + 10, cx + r - 10, cy + r - 10], outline=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)

    if motif == "leshy_antlers":
        # Stag antlers & ancient oak foliage
        draw.line([(cx, cy - 20), (cx, cy + 70)], fill=gold, width=6)
        # Antler branches
        draw.arc([cx - 80, cy - 90, cx, cy + 10], start=180, end=350, fill=pale, width=5)
        draw.arc([cx, cy - 90, cx + 80, cy + 10], start=190, end=360, fill=pale, width=5)
        for t in [-50, -30, 30, 50]:
            draw.line([(cx + t, cy - 50), (cx + int(t*1.4), cy - 85)], fill=gold, width=3)
        # Glowing pine cone / forest seeds
        draw.ellipse([cx - 20, cy + 10, cx + 20, cy + 50], fill=accent)

    elif motif == "rusalka_water":
        # Braided reeds, water lilies & lunar crescent
        draw.arc([cx - 50, cy - 70, cx + 50, cy + 30], start=45, end=270, fill=pale, width=4)
        for ry in [0, 25, 50, 75]:
            draw.arc([cx - 70, cy + ry - 15, cx + 70, cy + ry + 15], start=10, end=170, fill=gold, width=3)
        # Water lily flower
        draw.polygon([(cx, cy - 10), (cx - 20, cy + 15), (cx + 20, cy + 15)], fill=pale)
        draw.polygon([(cx, cy - 15), (cx - 10, cy + 10), (cx + 10, cy + 10)], fill=gold)

    elif motif == "domovoi_hearth":
        # Hearth fire arch & horseshoe
        draw.arc([cx - 65, cy - 50, cx + 65, cy + 70], start=180, end=360, fill=gold, width=6)
        # Horseshoe
        draw.arc([cx - 45, cy - 70, cx + 45, cy + 10], start=0, end=180, fill=pale, width=5)
        # Eternal ember flame
        draw.polygon([(cx, cy - 30), (cx + 25, cy + 25), (cx - 25, cy + 25)], fill=accent)
        draw.ellipse([cx - 12, cy + 5, cx + 12, cy + 35], fill=pale)

    elif motif == "vodyanoy_swirl":
        # Millwheel spokes & water dragon swirls
        for cr in [30, 60]:
            draw.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], outline=gold, width=2)
        for sp in range(6):
            ang = sp * (math.pi / 3)
            draw.line([
                (cx + 20 * math.cos(ang), cy + 20 * math.sin(ang)),
                (cx + 60 * math.cos(ang), cy + 60 * math.sin(ang))
            ], fill=pale, width=3)
        # Surrounding whirlpool spirals
        draw.arc([cx - 85, cy - 85, cx + 85, cy + 85], start=30, end=310, fill=gold, width=4)

    elif motif == "zmey_dragon":
        # Three dragon heads with fiery crowns
        draw.arc([cx - 80, cy - 60, cx - 15, cy + 30], start=160, end=340, fill=gold, width=5)
        draw.arc([cx - 35, cy - 85, cx + 35, cy + 10], start=170, end=350, fill=pale, width=5)
        draw.arc([cx + 15, cy - 60, cx + 80, cy + 30], start=200, end=380, fill=gold, width=5)
        # Fire breath tongues below
        draw.polygon([(cx - 45, cy - 30), (cx - 65, cy + 10), (cx - 35, cy + 5)], fill=accent)
        draw.polygon([(cx, cy - 50), (cx - 15, cy - 10), (cx + 15, cy - 10)], fill=accent)
        draw.polygon([(cx + 45, cy - 30), (cx + 65, cy + 10), (cx + 35, cy + 5)], fill=accent)
        # Dragon wings arc
        draw.arc([cx - 95, cy - 15, cx + 95, cy + 85], start=180, end=360, fill=gold, width=3)

    elif motif == "koschei_needle":
        # The Needle inside the Egg inside the Duck
        draw.ellipse([cx - 45, cy - 55, cx + 45, cy + 55], outline=gold, width=4) # Egg
        # The fatal needle running through the center
        draw.line([(cx, cy - 85), (cx, cy + 75)], fill=pale, width=4)
        draw.polygon([(cx, cy - 95), (cx - 6, cy - 75), (cx + 6, cy - 75)], fill=pale)
        # Eye of the needle
        draw.ellipse([cx - 2, cy + 50, cx + 2, cy + 65], fill=(20, 14, 24))
        # Iron padlock ring
        draw.arc([cx - 35, cy + 10, cx + 35, cy + 70], start=0, end=180, fill=gold, width=4)

    elif motif == "baba_yaga_hut":
        # Hut on chicken legs & mortar pestle
        # Triangular roof
        draw.polygon([(cx, cy - 80), (cx - 50, cy - 25), (cx + 50, cy - 25)], outline=gold, fill=(gold[0]//3, gold[1]//3, gold[2]//3), width=3)
        # Log cabin walls
        draw.rectangle([cx - 40, cy - 25, cx + 40, cy + 30], outline=gold, width=3)
        # Twin chicken legs below
        draw.line([(cx - 25, cy + 30), (cx - 25, cy + 75)], fill=pale, width=4)
        draw.line([(cx + 25, cy + 30), (cx + 25, cy + 75)], fill=pale, width=4)
        # Claws
        draw.line([(cx - 25, cy + 75), (cx - 40, cy + 85)], fill=pale, width=3)
        draw.line([(cx - 25, cy + 75), (cx - 10, cy + 85)], fill=pale, width=3)
        draw.line([(cx + 25, cy + 75), (cx + 10, cy + 85)], fill=pale, width=3)
        draw.line([(cx + 25, cy + 75), (cx + 40, cy + 85)], fill=pale, width=3)

# ---------------------------------------------------------------------------
# 2. Locations
# ---------------------------------------------------------------------------
LOCATIONS = [
    {
        "id": "arkona",
        "name": "CAPE ARKONA",
        "subtitle": "LAST TEMPLE OF SVANTEVIT · RÜGEN",
        "accent": (140, 160, 210),
        "bg": (14, 16, 26),
        "motif": "arkona_cliffs"
    },
    {
        "id": "starokyivska-hill",
        "name": "STAROKYIVSKA HILL",
        "subtitle": "PANTHEON OF PRINCE VLADIMIR · KIEV",
        "accent": (215, 175, 60),
        "bg": (22, 18, 14),
        "motif": "kiev_hill"
    },
    {
        "id": "szczecin-triglav-temple",
        "name": "SZCZECIN TRIGLAV TEMPLE",
        "subtitle": "SANCTUARY OF THE THREE-HEADED GOD",
        "accent": (175, 130, 80),
        "bg": (20, 16, 14),
        "motif": "szczecin_temple"
    },
    {
        "id": "peryn",
        "name": "PERYN SANCTUARY",
        "subtitle": "EIGHT-LOBED THUNDER RING · NOVGOROD",
        "accent": (210, 120, 50),
        "bg": (22, 14, 12),
        "motif": "peryn_ring"
    },
    {
        "id": "onondaga-lake",
        "name": "ONONDAGA LAKE",
        "subtitle": "SHORES OF THE TREE OF PEACE",
        "accent": (70, 130, 180),
        "bg": (12, 18, 24),
        "motif": "onondaga_pine"
    },
    {
        "id": "haida-gwaii",
        "name": "HAIDA GWAII",
        "subtitle": "MISTY ARCHIPELAGO OF THE RAVEN",
        "accent": (195, 75, 65),
        "bg": (20, 14, 16),
        "motif": "haida_totem"
    },
    {
        "id": "sky-world",
        "name": "THE SKY WORLD",
        "subtitle": "WHERE THE CELESTIAL TREE STOOD",
        "accent": (120, 160, 220),
        "bg": (12, 16, 26),
        "motif": "onondaga_pine"
    },
    {
        "id": "cohoes-falls",
        "name": "COHOES FALLS",
        "subtitle": "THE PEACEMAKER'S TEST · MOHAWK RIVER",
        "accent": (90, 150, 190),
        "bg": (12, 18, 24),
        "motif": "peryn_ring"
    },
    {
        "id": "nass-river",
        "name": "NASS RIVER",
        "subtitle": "WHERE THE DAYLIGHT WAS KEPT",
        "accent": (200, 90, 70),
        "bg": (20, 14, 16),
        "motif": "haida_totem"
    },
    {
        "id": "templo-mayor",
        "name": "TEMPLO MAYOR",
        "subtitle": "COATEPEC MADE IN STONE · TENOCHTITLAN",
        "accent": (200, 110, 70),
        "bg": (24, 14, 12),
        "motif": "szczecin_temple"
    },
    {
        "id": "omeyocan",
        "name": "OMEYOCAN",
        "subtitle": "THE PLACE OF DUALITY",
        "accent": (90, 170, 170),
        "bg": (12, 20, 22),
        "motif": "peryn_ring"
    },
    {
        "id": "temple-of-vesta",
        "name": "TEMPLE OF VESTA",
        "subtitle": "THE HEARTH OF ROME",
        "accent": (210, 120, 70),
        "bg": (24, 14, 12),
        "motif": "szczecin_temple"
    },
    {
        "id": "lake-nemi",
        "name": "LAKE NEMI",
        "subtitle": "DIANA'S MIRROR · THE GROVE OF ARICIA",
        "accent": (110, 160, 190),
        "bg": (12, 18, 24),
        "motif": "arkona_cliffs"
    },
    {
        "id": "lake-avernus",
        "name": "LAKE AVERNUS",
        "subtitle": "THE DOOR TO THE UNDERWORLD",
        "accent": (120, 120, 160),
        "bg": (14, 14, 22),
        "motif": "arkona_cliffs"
    },
    {
        "id": "palatine-hill",
        "name": "PALATINE HILL",
        "subtitle": "ROMULUS'S CITY · THE LUPERCAL",
        "accent": (200, 150, 80),
        "bg": (22, 18, 12),
        "motif": "kiev_hill"
    },
    {
        "id": "emain-macha",
        "name": "EMAIN MACHA",
        "subtitle": "ROYAL SEAT OF ULSTER",
        "accent": (110, 170, 120),
        "bg": (12, 20, 16),
        "motif": "peryn_ring"
    },
    {
        "id": "rathcroghan",
        "name": "RATHCROGHAN",
        "subtitle": "CRUACHAN · COURT OF MEDB",
        "accent": (160, 150, 90),
        "bg": (18, 18, 12),
        "motif": "kiev_hill"
    },
    {
        "id": "aquae-sulis",
        "name": "AQUAE SULIS",
        "subtitle": "SPRING OF SULIS MINERVA · BATH",
        "accent": (190, 160, 100),
        "bg": (20, 18, 14),
        "motif": "szczecin_temple"
    },
    {
        "id": "moytirra",
        "name": "MAG TUIRED",
        "subtitle": "THE PLAIN OF THE SECOND BATTLE",
        "accent": (160, 130, 110),
        "bg": (18, 16, 14),
        "motif": "arkona_cliffs"
    },
    {
        "id": "mount-othrys",
        "name": "MOUNT OTHRYS",
        "subtitle": "THE TITANS' SIDE OF THE WAR",
        "accent": (180, 150, 110),
        "bg": (18, 16, 14),
        "motif": "arkona_cliffs"
    }
]

def draw_location_motif(draw, cx, cy, r, motif, accent, gold):
    pale = (min(255, gold[0]+40), min(255, gold[1]+40), min(255, gold[2]+40))
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=gold, width=3)
    draw.ellipse([cx - r + 10, cy - r + 10, cx + r - 10, cy + r - 10], outline=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)

    if motif == "arkona_cliffs":
        # Cape Rügen sea cliff and four-headed wooden shrine
        draw.polygon([(cx - 85, cy + 60), (cx - 20, cy - 20), (cx + 85, cy - 20), (cx + 85, cy + 60)], fill=(gold[0]//3, gold[1]//3, gold[2]//3), outline=gold)
        # Sea waves below
        for wy in [45, 65, 80]:
            draw.arc([cx - 80, cy + wy - 15, cx + 80, cy + wy + 15], start=0, end=180, fill=pale, width=2)
        # Four-faced pillar atop cliff
        draw.line([(cx + 20, cy - 20), (cx + 20, cy - 80)], fill=pale, width=6)
        draw.line([(cx + 10, cy - 50), (cx + 30, cy - 50)], fill=gold, width=3)

    elif motif == "kiev_hill":
        # Starokyivska Hill & River Dnieper & Six Idols
        draw.arc([cx - 85, cy - 10, cx + 85, cy + 110], start=180, end=360, fill=gold, width=5)
        # Six idols on the crest
        for ix, iy, h in [(-50, 45, 35), (-30, 48, 45), (-10, 50, 55), (10, 50, 45), (30, 48, 40), (50, 45, 30)]:
            draw.line([(cx + ix, cy - iy), (cx + ix, cy - iy - h)], fill=pale, width=4)
        # River Dnieper ribbon
        for ry in [55, 75]:
            draw.arc([cx - 80, cy + ry - 15, cx + 80, cy + ry + 15], start=10, end=170, fill=pale, width=2)

    elif motif == "szczecin_temple":
        # Triple-peaked temple roof of Triglav
        for tx, ty, sc in [(-40, -10, 0.8), (0, -35, 1.0), (40, -10, 0.8)]:
            draw.polygon([(cx + tx, cy + ty - 35), (cx + tx - int(30*sc), cy + ty + 20), (cx + tx + int(30*sc), cy + ty + 20)], outline=gold, fill=(gold[0]//3, gold[1]//3, gold[2]//3), width=2)
        # Sacred black stallion silhouette arch
        draw.arc([cx - 30, cy + 10, cx + 30, cy + 60], start=0, end=180, fill=pale, width=4)

    elif motif == "peryn_ring":
        # Eight-lobed circular sanctuary ring & central fire
        for i in range(8):
            ang = i * (2 * math.pi / 8)
            lx = cx + 55 * math.cos(ang)
            ly = cy + 55 * math.sin(ang)
            draw.ellipse([lx - 18, ly - 18, lx + 18, ly + 18], outline=gold, width=2)
        # Central fire hearth
        draw.ellipse([cx - 25, cy - 25, cx + 25, cy + 25], outline=pale, width=3)
        draw.polygon([(cx, cy - 18), (cx + 14, cy + 14), (cx - 14, cy + 14)], fill=accent)

    elif motif == "onondaga_pine":
        # Eastern White Pine by Onondaga Lake
        draw.line([(cx, cy + 70), (cx, cy - 80)], fill=gold, width=6)
        for py, pw in [(10, 55), (-15, 45), (-40, 35), (-65, 20)]:
            draw.polygon([(cx, cy + py - 25), (cx - pw, cy + py), (cx + pw, cy + py)], fill=(gold[0]//3, gold[1]//3, gold[2]//3), outline=pale)
        # Lake ripples at the base
        draw.line([(cx - 75, cy + 65), (cx + 75, cy + 65)], fill=pale, width=3)
        draw.line([(cx - 55, cy + 75), (cx + 55, cy + 75)], fill=gold, width=2)

    elif motif == "haida_totem":
        # Pacific Northwest Totem Pole & Cedar Forest
        draw.rectangle([cx - 20, cy - 80, cx + 20, cy + 75], outline=gold, width=3)
        # Totem eyes & beaks
        draw.ellipse([cx - 14, cy - 65, cx + 14, cy - 45], outline=pale, width=2)
        draw.arc([cx - 15, cy - 40, cx + 15, cy - 20], start=0, end=180, fill=pale, width=3)
        draw.ellipse([cx - 14, cy - 15, cx + 14, cy + 5], outline=pale, width=2)
        draw.arc([cx - 15, cy + 10, cx + 15, cy + 30], start=0, end=180, fill=pale, width=3)
        # Outspread wings at the top
        draw.line([(cx - 80, cy - 75), (cx + 80, cy - 75)], fill=pale, width=4)

# ---------------------------------------------------------------------------
# 3. Stories
# ---------------------------------------------------------------------------
STORIES = [
    {
        "id": "first-twins-ibeji",
        "name": "IBEJI AND THE CARE OF TWINS",
        "subtitle": "SACRED REMEMBRANCE · YORUBA",
        "accent": (230, 160, 50),
        "bg": (22, 16, 12),
        "motif": "story_ibeji"
    },
    {
        "id": "vladimirs-pantheon-980",
        "name": "VLADIMIR'S PANTHEON OF 980",
        "subtitle": "THE SIX IDOLS OF KIEV",
        "accent": (218, 165, 32),
        "bg": (22, 18, 14),
        "motif": "story_vladimir"
    },
    {
        "id": "perun-and-veles",
        "name": "THE THUNDER-GOD AND THE SERPENT",
        "subtitle": "STORM DUEL OF SLAVIC MYTH",
        "accent": (210, 130, 45),
        "bg": (20, 14, 12),
        "motif": "story_perun_veles"
    },
    {
        "id": "svantevits-oracle-horse",
        "name": "SVANTEVIT'S ORACLE HORSE",
        "subtitle": "WHITE STALLION OF ARKONA",
        "accent": (160, 180, 220),
        "bg": (14, 16, 26),
        "motif": "story_horse"
    },
    {
        "id": "vasilisa-the-beautiful",
        "name": "VASILISA THE BEAUTIFUL",
        "subtitle": "THE GLOWING SKULL LANTERN",
        "accent": (225, 140, 60),
        "bg": (22, 14, 18),
        "motif": "story_vasilisa"
    },
    {
        "id": "sky-woman-and-turtle-island",
        "name": "SKY WOMAN & TURTLE ISLAND",
        "subtitle": "THE EARTH-DIVER COSMOLOGY",
        "accent": (65, 140, 195),
        "bg": (12, 16, 24),
        "motif": "story_sky_woman"
    },
    {
        "id": "the-twins-sapling-and-flint",
        "name": "THE TWINS: SAPLING & FLINT",
        "subtitle": "THE SHAPING OF TURTLE ISLAND",
        "accent": (180, 130, 80),
        "bg": (18, 16, 14),
        "motif": "story_twins"
    },
    {
        "id": "peacemaker-great-law-of-peace",
        "name": "THE GREAT LAW OF PEACE",
        "subtitle": "FOUNDING OF THE HAUDENOSAUNEE",
        "accent": (75, 135, 190),
        "bg": (14, 18, 26),
        "motif": "story_peacemaker"
    },
    {
        "id": "raven-steals-the-light",
        "name": "RAVEN STEALS THE LIGHT",
        "subtitle": "DAYLIGHT FROM THE NESTED BOXES",
        "accent": (225, 165, 50),
        "bg": (18, 14, 14),
        "motif": "story_raven_sun"
    },
    {
        "id": "raven-and-the-first-men",
        "name": "RAVEN & THE FIRST MEN",
        "subtitle": "EMERGENCE FROM THE CLAMSHELL",
        "accent": (200, 80, 70),
        "bg": (20, 12, 14),
        "motif": "story_clamshell"
    },
    {
        "id": "abduction-of-persephone",
        "name": "THE ABDUCTION OF PERSEPHONE",
        "subtitle": "THE DESCENT TO THE UNDERWORLD",
        "accent": (175, 120, 190),
        "bg": (20, 14, 22),
        "motif": "story_persephone"
    },
    {
        "id": "tano-and-bia-divide-the-land",
        "name": "TANO AND BIA",
        "subtitle": "NYAME DIVIDES THE LAND",
        "accent": (190, 160, 70),
        "bg": (20, 18, 12),
        "motif": "story_twins"
    },
    {
        "id": "hinon-and-the-horned-serpent",
        "name": "THE THUNDERER AND THE SERPENT",
        "subtitle": "HI'NON'S ARROW",
        "accent": (120, 150, 220),
        "bg": (12, 16, 26),
        "motif": "story_perun_veles"
    },
    {
        "id": "hiawatha-and-the-condolence",
        "name": "THE WORDS OF CONDOLENCE",
        "subtitle": "HIAWATHA AND THE PEACEMAKER",
        "accent": (190, 190, 170),
        "bg": (16, 18, 20),
        "motif": "story_peacemaker"
    },
    {
        "id": "origin-of-the-three-sisters",
        "name": "THE THREE SISTERS",
        "subtitle": "CORN, BEANS AND SQUASH",
        "accent": (200, 170, 70),
        "bg": (20, 18, 12),
        "motif": "story_sky_woman"
    },
    {
        "id": "raven-and-petrel",
        "name": "RAVEN STEALS THE WATER",
        "subtitle": "PETREL'S EVERLASTING SPRING",
        "accent": (110, 170, 200),
        "bg": (12, 18, 24),
        "motif": "story_raven_sun"
    },
    {
        "id": "kats-and-the-bear-wife",
        "name": "KAATS' AND THE BEAR WIFE",
        "subtitle": "A KAAGWAANTAAN STORY",
        "accent": (170, 120, 80),
        "bg": (20, 16, 12),
        "motif": "story_horse"
    },
    {
        "id": "natsilane-and-the-killer-whales",
        "name": "THE FIRST KILLER WHALES",
        "subtitle": "CARVED FROM YELLOW CEDAR",
        "accent": (90, 150, 190),
        "bg": (12, 18, 24),
        "motif": "story_clamshell"
    }
]

def draw_story_motif(draw, cx, cy, r, motif, accent, gold):
    pale = (min(255, gold[0]+40), min(255, gold[1]+40), min(255, gold[2]+40))
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=gold, width=3)
    draw.ellipse([cx - r + 10, cy - r + 10, cx + r - 10, cy + r - 10], outline=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)

    if motif == "story_ibeji":
        # Twin carved figures
        for ox in [-30, 30]:
            draw.line([(cx + ox, cy - 60), (cx + ox, cy + 60)], fill=gold, width=8)
            draw.ellipse([cx + ox - 14, cy - 75, cx + ox + 14, cy - 50], fill=pale)
            draw.rectangle([cx + ox - 10, cy - 30, cx + ox + 10, cy + 40], outline=gold, width=2)
        draw.arc([cx - 50, cy + 50, cx + 50, cy + 85], start=0, end=180, fill=pale, width=3)

    elif motif == "story_vladimir":
        # Hill with golden sun ray and six idol pillars
        draw.arc([cx - 85, cy + 10, cx + 85, cy + 110], start=180, end=360, fill=gold, width=4)
        for i in range(-2, 4):
            draw.line([(cx + i*22, cy + 20), (cx + i*22, cy - 45)], fill=pale, width=5)
        # Gilded halo above central idol
        draw.ellipse([cx - 20, cy - 75, cx + 20, cy - 35], outline=gold, width=3)

    elif motif == "story_perun_veles":
        # Oak branches above, coiled serpent below, lightning between
        draw.arc([cx - 80, cy - 90, cx + 80, cy - 10], start=0, end=180, fill=gold, width=5)
        # Jagged lightning bolt
        pts = [(cx, cy - 55), (cx - 15, cy - 15), (cx + 5, cy - 10), (cx - 20, cy + 35)]
        draw.line(pts, fill=pale, width=4)
        # Serpent coils
        draw.arc([cx - 70, cy + 15, cx + 70, cy + 75], start=30, end=330, fill=gold, width=5)

    elif motif == "story_horse":
        # White horse & crossed iron spears
        draw.line([(cx - 65, cy + 65), (cx + 65, cy - 65)], fill=pale, width=4)
        draw.line([(cx + 65, cy + 65), (cx - 65, cy - 65)], fill=pale, width=4)
        draw.ellipse([cx - 40, cy - 50, cx + 40, cy + 30], outline=gold, width=4)
        draw.arc([cx - 25, cy - 70, cx + 25, cy - 30], start=180, end=360, fill=pale, width=5)

    elif motif == "story_vasilisa":
        # Glowing skull lantern with radiant beams
        draw.ellipse([cx - 45, cy - 45, cx + 45, cy + 35], outline=gold, fill=(gold[0]//3, gold[1]//3, gold[2]//3), width=3)
        # Glowing eye sockets
        draw.ellipse([cx - 25, cy - 20, cx - 10, cy - 5], fill=pale)
        draw.ellipse([cx + 10, cy - 20, cx + 25, cy - 5], fill=pale)
        # Pole lantern stick
        draw.line([(cx, cy + 35), (cx, cy + 85)], fill=gold, width=5)

    elif motif == "story_sky_woman":
        # Waterfowl wings carrying descending figure to turtle shell
        draw.arc([cx - 85, cy - 75, cx, cy], start=170, end=340, fill=pale, width=4)
        draw.arc([cx, cy - 75, cx + 85, cy], start=200, end=370, fill=pale, width=4)
        # Great turtle shell below
        draw.arc([cx - 75, cy + 10, cx + 75, cy + 85], start=0, end=180, fill=gold, width=5)
        draw.ellipse([cx - 15, cy - 20, cx + 15, cy + 10], fill=pale)

    elif motif == "story_twins":
        # Dual balance: corn stalk on left, flint knife on right
        draw.line([(cx, cy - 80), (cx, cy + 80)], fill=(gold[0]//2, gold[1]//2, gold[2]//2), width=2)
        # Sapling's fertile shoot
        draw.arc([cx - 60, cy - 40, cx, cy + 40], start=180, end=360, fill=pale, width=4)
        # Flint blade
        draw.polygon([(cx + 35, cy - 65), (cx + 55, cy + 10), (cx + 15, cy + 10)], outline=gold, fill=accent)

    elif motif == "story_peacemaker":
        # White Pine & Hiawatha Wampum Belt motif (5 interconnected squares)
        draw.line([(cx, cy - 80), (cx, cy + 20)], fill=gold, width=5)
        # 5 nation squares
        for ox in [-60, -30, 0, 30, 60]:
            draw.rectangle([cx + ox - 10, cy + 45, cx + ox + 10, cy + 65], outline=pale, width=2)
        draw.line([(cx - 70, cy + 55), (cx + 70, cy + 55)], fill=gold, width=2)

    elif motif == "story_raven_sun":
        # Raven beak holding the radiant daylight sun
        draw.arc([cx - 80, cy - 40, cx + 10, cy + 30], start=180, end=350, fill=gold, width=5)
        draw.ellipse([cx - 85, cy - 35, cx - 40, cy + 10], fill=pale) # The Sun
        # Nested cedar boxes
        for sz in [25, 45, 65]:
            draw.rectangle([cx - sz + 20, cy - sz + 20, cx + sz + 20, cy + sz + 20], outline=gold, width=1)

    elif motif == "story_clamshell":
        # Clamshell halves parting & human silhouettes emerging
        draw.arc([cx - 80, cy - 60, cx + 80, cy + 40], start=180, end=360, fill=gold, width=5)
        draw.arc([cx - 80, cy - 20, cx + 80, cy + 75], start=0, end=180, fill=gold, width=5)
        # Human figures inside
        for ox in [-25, 0, 25]:
            draw.ellipse([cx + ox - 6, cy - 10, cx + ox + 6, cy + 5], fill=pale)

    elif motif == "story_persephone":
        # Chariot wheels & narcissus flower
        draw.ellipse([cx - 50, cy + 10, cx + 10, cy + 70], outline=gold, width=3) # Wheel
        draw.ellipse([cx + 10, cy + 10, cx + 70, cy + 70], outline=gold, width=3) # Wheel
        # Golden Narcissus flower
        draw.line([(cx, cy - 10), (cx, cy - 70)], fill=pale, width=3)
        for sp in range(6):
            ang = sp * (math.pi / 3)
            draw.ellipse([cx + 15*math.cos(ang) - 6, cy - 70 + 15*math.sin(ang) - 6, cx + 15*math.cos(ang) + 6, cy - 70 + 15*math.sin(ang) + 6], fill=gold)

# ---------------------------------------------------------------------------
# 4. Artifacts (drawn with the story emblems)
# ---------------------------------------------------------------------------
ARTIFACTS = [
    {
        "id": "svantevits-horn",
        "name": "SVANTEVIT'S HORN",
        "subtitle": "THE HARVEST ORACLE OF ARKONA",
        "accent": (200, 160, 90),
        "bg": (22, 18, 14),
        "motif": "story_horse"
    },
    {
        "id": "idol-of-perun-kyiv",
        "name": "IDOL OF PERUN",
        "subtitle": "SILVER HEAD · GOLDEN MOUSTACHE · KYIV",
        "accent": (220, 170, 60),
        "bg": (22, 18, 12),
        "motif": "story_vladimir"
    },
    {
        "id": "triglav-idol-szczecin",
        "name": "IDOL OF TRIGLAV",
        "subtitle": "THREE HEADS · SZCZECIN",
        "accent": (170, 140, 110),
        "bg": (18, 16, 18),
        "motif": "story_twins"
    },
    {
        "id": "zbruch-idol",
        "name": "ZBRUCH IDOL",
        "subtitle": "FOUR FACES UNDER ONE CAP",
        "accent": (170, 160, 140),
        "bg": (18, 18, 16),
        "motif": "story_vladimir"
    },
    {
        "id": "jawbone-of-muri-ranga-whenua",
        "name": "THE ENCHANTED JAWBONE",
        "subtitle": "MURI-RANGA-WHENUA'S GIFT TO MAUI",
        "accent": (200, 190, 150),
        "bg": (12, 18, 22),
        "motif": "story_clamshell"
    },
    {
        "id": "nga-kete-o-te-wananga",
        "name": "NGA KETE O TE WANANGA",
        "subtitle": "THE THREE BASKETS OF KNOWLEDGE",
        "accent": (190, 150, 80),
        "bg": (14, 20, 20),
        "motif": "story_ibeji"
    },
    {
        "id": "matahourua",
        "name": "MATAHOURUA",
        "subtitle": "KUPE'S VOYAGING CANOE",
        "accent": (90, 160, 180),
        "bg": (10, 18, 22),
        "motif": "story_raven_sun"
    }
]

def generate_square_plate(item, out_dir, category_tag, motif_fn):
    img = Image.new("RGBA", (SIZE, SIZE), item["bg"] + (255,))
    accent = item["accent"]
    gold = (212, 175, 55)

    img = draw_radial_wash(img, SIZE // 2, SIZE // 2 - 30, 320, accent)
    draw = ImageDraw.Draw(img)

    draw_plate_borders(draw, SIZE, SIZE, gold, accent)

    # Top category label
    font_sm = serif_font("regular", 15)
    font_lg = serif_font("bold", 36)
    font_sub = serif_font("italic", 17)

    draw.text((SIZE // 2, 55), f"MYTHOS ATLAS · {category_tag}", font=font_sm, fill=(200, 180, 140), anchor="mm")
    draw.line([(50, 75), (SIZE - 50, 75)], fill=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)

    # Center motif
    motif_fn(draw, SIZE // 2, SIZE // 2 - 25, 145, item["motif"], accent, gold)

    # Bottom labels
    draw.line([(60, SIZE - 125), (SIZE - 60, SIZE - 125)], fill=gold, width=2)
    draw.text((SIZE // 2, SIZE - 90), item["name"], font=font_lg, fill=(245, 235, 220), anchor="mm")
    draw.text((SIZE // 2, SIZE - 55), item["subtitle"], font=font_sub, fill=gold, anchor="mm")

    # Export PNG
    png_path = os.path.join(out_dir, f"{item['id']}.png")
    img.convert("RGB").save(png_path, "PNG")

    # Export WebP
    webp_path = os.path.join(out_dir, f"{item['id']}.webp")
    write_webp(png_path, webp_path)
    print(f"  ✓ {item['id']} -> PNG & WebP")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate creature, location, story, and artifact plates.")
    parser.add_argument(
        "--only",
        help="Comma-separated ids to (re)generate; default is every plate.",
    )
    args = parser.parse_args()
    wanted = set(args.only.split(",")) if args.only else None

    def pick(items):
        return [i for i in items if wanted is None or i["id"] in wanted]

    groups = [
        (CREATURES, CREATURES_DIR, "BESTIARY ARCHIVE", draw_creature_motif),
        (LOCATIONS, LOCATIONS_DIR, "SACRED GEOGRAPHY", draw_location_motif),
        (STORIES, STORIES_DIR, "MYTHIC TRADITION", draw_story_motif),
        (ARTIFACTS, ARTIFACTS_DIR, "RELIQUARY", draw_story_motif),
    ]
    known = {i["id"] for items, *_ in groups for i in items}
    if wanted and not wanted <= known:
        raise SystemExit(f"Unknown ids: {', '.join(sorted(wanted - known))}")
    for items, out_dir, tag, motif_fn in groups:
        for item in pick(items):
            generate_square_plate(item, out_dir, tag, motif_fn)
