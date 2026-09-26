#!/usr/bin/env python3
"""
generate_creatures_locations_stories.py
Generates illustrations for creatures, locations, stories, and artifacts in
Mythos Atlas that have no other image, adhering to the dark-academia classical
atlas style. Pass --only with comma-separated ids to redraw just those plates.
"""

import argparse
import os
import math

from _plate_emblems import draw_emblem
from _plate_art import pantheon_of, render_plate, write_plate
from _repo_paths import WEB_PUBLIC

CREATURES_DIR = os.path.join(WEB_PUBLIC, "creatures")
LOCATIONS_DIR = os.path.join(WEB_PUBLIC, "locations")
STORIES_DIR = os.path.join(WEB_PUBLIC, "stories")
ARTIFACTS_DIR = os.path.join(WEB_PUBLIC, "artifacts")

os.makedirs(CREATURES_DIR, exist_ok=True)
os.makedirs(LOCATIONS_DIR, exist_ok=True)
os.makedirs(STORIES_DIR, exist_ok=True)
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

SIZE = 768

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

    # INCA & ANDEAN (2026-09)
    {"id": "amaru", "name": "AMARU", "subtitle": "SERPENT OF THE DEPTHS", "accent": (120, 170, 110), "bg": (12, 18, 14), "motif": "emblem_serpent2"},
    {"id": "yacana", "name": "YACANA", "subtitle": "LLAMA OF THE MILKY WAY", "accent": (120, 130, 190), "bg": (10, 12, 22), "motif": "emblem_llama"},
    {"id": "urcuchillay", "name": "URCUCHILLAY", "subtitle": "MANY-COLORED STAR LLAMA", "accent": (200, 140, 180), "bg": (14, 12, 22), "motif": "emblem_llama"},

    # PERSIAN / IRANIAN (2026-09)
    {"id": "simurgh", "name": "SIMURGH", "subtitle": "THE WISE BIRD OF ALBORZ", "accent": (120, 175, 170), "bg": (10, 18, 20), "motif": "emblem_great_bird"},
    {"id": "azhi-dahaka", "name": "AZHI DAHAKA", "subtitle": "THREE-HEADED DRAGON", "accent": (150, 90, 110), "bg": (16, 10, 14), "motif": "emblem_dragon"},
    {"id": "div-e-sepid", "name": "DIV-E SEPID", "subtitle": "THE WHITE DIV OF MAZANDARAN", "accent": (200, 200, 205), "bg": (14, 14, 18), "motif": "emblem_beast"},
    {"id": "apaosha", "name": "APAOSHA", "subtitle": "THE DAEVA OF DROUGHT", "accent": (130, 110, 90), "bg": (16, 12, 10), "motif": "emblem_horse"},

    # FINNISH / KALEVALA (2026-09)
    {"id": "iku-turso", "name": "IKU-TURSO", "subtitle": "MONSTER OF THE DEEP", "accent": (90, 150, 160), "bg": (10, 14, 18), "motif": "emblem_sea_monster"},
    {"id": "elk-of-hiisi", "name": "ELK OF HIISI", "subtitle": "THE FIRST TASK OF LEMMINKÄINEN", "accent": (150, 130, 95), "bg": (14, 16, 12), "motif": "emblem_elk"},
    {"id": "swan-of-tuonela", "name": "SWAN OF TUONELA", "subtitle": "ON THE RIVER OF THE DEAD", "accent": (200, 205, 215), "bg": (8, 10, 14), "motif": "emblem_swan"},
    {"id": "great-pike", "name": "THE GREAT PIKE", "subtitle": "BONES OF THE FIRST KANTELE", "accent": (130, 170, 130), "bg": (10, 16, 16), "motif": "emblem_fish"},

    # KOREAN (2026-09)
    {"id": "samjok-o", "name": "SAMJOK-O", "subtitle": "THE THREE-LEGGED CROW", "accent": (225, 160, 70), "bg": (18, 12, 10), "motif": "emblem_crow_sun"},
    {"id": "haetae", "name": "HAETAE", "subtitle": "GUARDIAN BEAST OF JUSTICE", "accent": (180, 170, 140), "bg": (14, 14, 12), "motif": "emblem_beast"},
    {"id": "munmu-sea-dragon", "name": "THE SEA DRAGON", "subtitle": "KING MUNMU'S GUARDIANSHIP", "accent": (90, 170, 170), "bg": (10, 14, 18), "motif": "emblem_dragon"},
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


    if draw_emblem(draw, cx, cy, motif, accent, gold):
        return

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

    # INCA & ANDEAN (2026-09)
    {"id": "isla-del-sol", "name": "ISLAND OF THE SUN", "subtitle": "WHERE THE SUN ROSE · TITICACA", "accent": (225, 170, 60), "bg": (12, 16, 24), "motif": "emblem_lake_island"},
    {"id": "tiwanaku", "name": "TIWANAKU", "subtitle": "CITY OF THE CREATION", "accent": (175, 150, 110), "bg": (18, 16, 14), "motif": "emblem_gateway"},
    {"id": "coricancha", "name": "CORICANCHA", "subtitle": "GOLDEN ENCLOSURE OF THE SUN", "accent": (225, 175, 55), "bg": (22, 16, 10), "motif": "emblem_temple_walls"},
    {"id": "pachacamac-sanctuary", "name": "PACHACAMAC", "subtitle": "ORACLE SANCTUARY OF THE COAST", "accent": (200, 140, 80), "bg": (20, 16, 12), "motif": "emblem_pyramid"},
    {"id": "huanacauri", "name": "HUANACAURI", "subtitle": "FOUNDING HILL ABOVE CUSCO", "accent": (190, 150, 80), "bg": (20, 16, 12), "motif": "emblem_rod"},
    {"id": "nevado-pariacaca", "name": "PARIACACA", "subtitle": "THE SNOW MOUNTAIN GOD", "accent": (170, 200, 225), "bg": (12, 16, 24), "motif": "emblem_mountain"},

    # PERSIAN / IRANIAN (2026-09)
    {"id": "persepolis", "name": "PERSEPOLIS", "subtitle": "TAKHT-E JAMSHID · FARS", "accent": (205, 165, 100), "bg": (20, 16, 12), "motif": "emblem_columns"},
    {"id": "behistun", "name": "BEHISTUN", "subtitle": "BY THE FAVOR OF AHURAMAZDA", "accent": (185, 160, 120), "bg": (18, 16, 14), "motif": "emblem_cliff_relief"},
    {"id": "naqsh-e-rostam", "name": "NAQSH-E ROSTAM", "subtitle": "TOMBS OF THE KINGS", "accent": (190, 150, 110), "bg": (18, 14, 12), "motif": "emblem_cliff_relief"},
    {"id": "takht-e-soleyman", "name": "TAKHT-E SOLEYMAN", "subtitle": "FIRE OF THE WARRIOR KINGS", "accent": (225, 120, 60), "bg": (20, 14, 12), "motif": "emblem_fire"},
    {"id": "mount-damavand", "name": "MOUNT DAMAVAND", "subtitle": "PRISON OF ZAHHAK", "accent": (200, 210, 225), "bg": (12, 14, 22), "motif": "emblem_mountain"},
    {"id": "chinvat-bridge", "name": "CHINVAT BRIDGE", "subtitle": "THE BRIDGE OF THE SEPARATOR", "accent": (170, 160, 210), "bg": (12, 12, 20), "motif": "emblem_bridge"},

    # FINNISH / KALEVALA (2026-09)
    {"id": "tuonela", "name": "TUONELA", "subtitle": "LAND OF THE DEAD", "accent": (120, 130, 150), "bg": (8, 10, 14), "motif": "emblem_underworld_river"},
    {"id": "pohjola", "name": "POHJOLA", "subtitle": "THE DARK NORTH", "accent": (130, 190, 170), "bg": (8, 12, 18), "motif": "emblem_northern_lights"},
    {"id": "vainola", "name": "KALEVALA", "subtitle": "LAND OF THE HEROES", "accent": (150, 185, 110), "bg": (12, 16, 12), "motif": "emblem_village_lake"},
    {"id": "vuokkiniemi", "name": "VUOKKINIEMI", "subtitle": "VILLAGE OF THE RUNO-SINGERS", "accent": (180, 170, 130), "bg": (12, 14, 16), "motif": "emblem_village_lake"},
    {"id": "kalevala-town", "name": "KALEVALA (UHTUA)", "subtitle": "VIENA KARELIA", "accent": (170, 180, 150), "bg": (12, 14, 16), "motif": "emblem_village_lake"},

    # KOREAN (2026-09)
    {"id": "mount-myohyang", "name": "MYOHYANGSAN", "subtitle": "MOUNT TAEBAEK OF THE SAMGUK YUSA", "accent": (130, 185, 165), "bg": (10, 14, 12), "motif": "emblem_mountain"},
    {"id": "chamseongdan", "name": "CHAMSEONGDAN", "subtitle": "ALTAR ON MANISAN, GANGHWA", "accent": (180, 170, 140), "bg": (12, 14, 14), "motif": "emblem_tree_altar"},
    {"id": "wunu-mountain", "name": "WUNÜ MOUNTAIN", "subtitle": "HOLGEN, FIRST GOGURYEO CAPITAL", "accent": (170, 150, 120), "bg": (14, 12, 10), "motif": "emblem_mountain"},
    {"id": "najeong", "name": "NAJEONG", "subtitle": "THE WELL OF THE WHITE HORSE", "accent": (215, 180, 100), "bg": (14, 14, 10), "motif": "emblem_well"},
    {"id": "daewangam", "name": "DAEWANGAM", "subtitle": "THE UNDERWATER TOMB OF KING MUNMU", "accent": (90, 160, 190), "bg": (10, 14, 20), "motif": "emblem_sea_rock"},
    {"id": "jeoseung", "name": "JEOSEUNG", "subtitle": "THE OTHER WORLD", "accent": (160, 150, 190), "bg": (10, 10, 16), "motif": "emblem_gate_below"},
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

    if draw_emblem(draw, cx, cy, motif, accent, gold):
        return

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
    },

    # INCA & ANDEAN (2026-09)
    {"id": "viracocha-creation-at-titicaca", "name": "VIRACOCHA MAKES THE WORLD", "subtitle": "CREATION AT TITICACA", "accent": (215, 165, 70), "bg": (12, 16, 24), "motif": "emblem_lake_island"},
    {"id": "children-of-the-sun", "name": "CHILDREN OF THE SUN", "subtitle": "MANCO CÁPAC & MAMA OCLLO", "accent": (225, 170, 50), "bg": (22, 16, 10), "motif": "emblem_rod"},
    {"id": "cuniraya-and-cavillaca", "name": "CUNIRAYA & CAVILLACA", "subtitle": "THE TRICKSTER AND THE SEA", "accent": (190, 140, 90), "bg": (14, 16, 22), "motif": "emblem_sea_rock"},
    {"id": "the-llama-and-the-flood", "name": "THE LLAMA & THE FLOOD", "subtitle": "REFUGE ON VILLCACOTO", "accent": (120, 160, 200), "bg": (12, 16, 22), "motif": "emblem_llama"},
    {"id": "huatyacuri-and-the-false-god", "name": "HUATYACURI", "subtitle": "THE RICH MAN WHO CALLED HIMSELF GOD", "accent": (180, 150, 90), "bg": (18, 16, 12), "motif": "emblem_serpent"},
    {"id": "pariacaca-and-huallallo-carhuincho", "name": "PARIACACA & HUALLALLO", "subtitle": "WATER AGAINST FIRE", "accent": (190, 120, 90), "bg": (16, 14, 20), "motif": "emblem_eggs"},

    # PERSIAN / IRANIAN (2026-09)
    {"id": "ohrmazd-and-ahriman", "name": "OHRMAZD & AHRIMAN", "subtitle": "THE TWO SPIRITS", "accent": (215, 175, 70), "bg": (12, 10, 16), "motif": "emblem_winged_disc"},
    {"id": "tishtrya-and-apaosha", "name": "TISHTRYA & APAOSHA", "subtitle": "THE STAR AGAINST DROUGHT", "accent": (180, 200, 235), "bg": (10, 14, 26), "motif": "emblem_horse"},
    {"id": "yima-and-the-var", "name": "YIMA & THE VAR", "subtitle": "REFUGE FROM THE WINTERS", "accent": (90, 130, 210), "bg": (12, 14, 24), "motif": "emblem_seals"},
    {"id": "zahhak-and-kaveh", "name": "ZAHHAK & KAVEH", "subtitle": "THE SERPENT KING OVERTHROWN", "accent": (200, 90, 70), "bg": (20, 12, 12), "motif": "emblem_banner"},
    {"id": "zal-and-the-simurgh", "name": "ZAL & THE SIMURGH", "subtitle": "THE NEST ON ALBORZ", "accent": (120, 175, 170), "bg": (10, 18, 20), "motif": "emblem_great_bird"},
    {"id": "rostam-and-sohrab", "name": "ROSTAM & SOHRAB", "subtitle": "FATHER AND SON", "accent": (200, 140, 70), "bg": (20, 14, 12), "motif": "emblem_mace"},

    # FINNISH / KALEVALA (2026-09)
    {"id": "ilmatar-and-the-world-egg", "name": "ILMATAR & THE WORLD EGG", "subtitle": "THE CREATION", "accent": (190, 205, 230), "bg": (10, 14, 22), "motif": "emblem_egg"},
    {"id": "aino", "name": "AINO", "subtitle": "THE MAIDEN WHO BECAME A FISH", "accent": (130, 180, 200), "bg": (10, 14, 20), "motif": "emblem_fish"},
    {"id": "forging-of-the-sampo", "name": "FORGING THE SAMPO", "subtitle": "ILMARINEN IN POHJOLA", "accent": (225, 130, 60), "bg": (22, 14, 10), "motif": "emblem_mill"},
    {"id": "lemminkainens-mother", "name": "LEMMINKÄINEN'S MOTHER", "subtitle": "THE RAKE AND THE RIVER", "accent": (205, 120, 110), "bg": (14, 10, 12), "motif": "emblem_underworld_river"},
    {"id": "theft-of-the-sampo", "name": "THEFT OF THE SAMPO", "subtitle": "THE EAGLE OVER THE SEA", "accent": (150, 140, 200), "bg": (10, 12, 20), "motif": "emblem_great_bird"},
    {"id": "kullervo", "name": "KULLERVO", "subtitle": "THE DOOMED SLAVE", "accent": (170, 110, 100), "bg": (16, 10, 10), "motif": "emblem_flame"},

    # KOREAN (2026-09)
    {"id": "dangun-and-the-bear-woman", "name": "DANGUN & THE BEAR WOMAN", "subtitle": "THE FOUNDING OF GOJOSEON", "accent": (170, 130, 95), "bg": (14, 12, 10), "motif": "emblem_bear_cave"},
    {"id": "jumong-son-of-heaven", "name": "JUMONG", "subtitle": "SON OF HEAVEN, GRANDSON OF THE RIVER", "accent": (205, 120, 90), "bg": (16, 12, 10), "motif": "emblem_egg"},
    {"id": "bak-hyeokgeose-and-the-egg", "name": "BAK HYEOKGEOSE", "subtitle": "THE EGG BY THE WELL", "accent": (215, 180, 100), "bg": (14, 14, 10), "motif": "emblem_well"},
    {"id": "princess-bari", "name": "PRINCESS BARI", "subtitle": "THE ABANDONED DAUGHTER", "accent": (200, 170, 210), "bg": (12, 10, 16), "motif": "emblem_flower"},
    {"id": "mireuk-and-seokga", "name": "MIREUK & SEOKGA", "subtitle": "THE CONTEST FOR THE WORLD", "accent": (190, 205, 230), "bg": (10, 12, 18), "motif": "emblem_water_flower"},
    {"id": "manpasikjeok", "name": "MANPASIKJEOK", "subtitle": "THE DRAGON'S BAMBOO", "accent": (90, 170, 170), "bg": (10, 14, 18), "motif": "emblem_flute"},
]

def draw_story_motif(draw, cx, cy, r, motif, accent, gold):
    pale = (min(255, gold[0]+40), min(255, gold[1]+40), min(255, gold[2]+40))

    if draw_emblem(draw, cx, cy, motif, accent, gold):
        return

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

def generate_square_plate(item, out_dir, kind, motif_fn):
    accent = item["accent"]
    gold = (212, 175, 55)
    img = render_plate(
        kind=kind,
        key=item["id"],
        size=(SIZE, SIZE),
        accent=accent,
        bg=item["bg"],
        pantheon=item.get("pantheon") or pantheon_of(kind, item["id"]),
        hint=item.get("subtitle", ""),
        emblem=lambda draw, cx, cy: motif_fn(draw, cx, cy, 145, item["motif"], accent, gold),
        emblem_center=(SIZE // 2, SIZE // 2 - 25),
    )
    path = write_plate(img, out_dir, item["id"])
    print(f"  ✓ {item['id']} -> {os.path.basename(path)}")


# ---------------------------------------------------------------------------
# Covers for interactive (branching) stories without an illustration. They
# live beside the story plates; branching-stories.json points at them.
# ---------------------------------------------------------------------------
BRANCHING_COVERS = [
    {"id": "thor-jotunheim", "name": "THOR IN JOTUNHEIM", "subtitle": "THUNDER AMONG THE GIANTS · FROST AND STORM",
     "accent": (120, 165, 220), "bg": (12, 16, 26), "motif": "emblem_hammer", "pantheon": "norse-pantheon"},
    {"id": "orpheus-underworld", "name": "ORPHEUS IN THE UNDERWORLD", "subtitle": "THE LYRE THAT MOVED THE DEAD · NIGHT",
     "accent": (170, 130, 200), "bg": (16, 12, 22), "motif": "emblem_lyre", "pantheon": "greek-pantheon"},
]


# ---------------------------------------------------------------------------
# 5. Artifacts drawn with the tradition emblems (_plate_emblems.py)
# ---------------------------------------------------------------------------
EMBLEM_ARTIFACTS = [

    # INCA & ANDEAN (2026-09)
    {"id": "golden-rod-of-manco-capac", "name": "THE GOLDEN ROD", "subtitle": "TEST OF THE GROUND AT HUANACAURI", "accent": (225, 175, 55), "bg": (22, 16, 12), "motif": "emblem_rod"},
    {"id": "punchao", "name": "PUNCHAO", "subtitle": "GOLDEN IMAGE OF THE DAY", "accent": (225, 170, 50), "bg": (24, 16, 10), "motif": "emblem_sun_face"},
    {"id": "sling-of-illapa", "name": "SLING OF ILLAPA", "subtitle": "THE CRACK OF THUNDER", "accent": (140, 165, 215), "bg": (14, 16, 26), "motif": "emblem_sling"},

    # PERSIAN / IRANIAN (2026-09)
    {"id": "derafsh-kaviani", "name": "DERAFSH-E KAVIANI", "subtitle": "THE BANNER OF KAVEH", "accent": (200, 90, 70), "bg": (20, 12, 12), "motif": "emblem_banner"},
    {"id": "jam-e-jam", "name": "JAM-E JAM", "subtitle": "THE WORLD-REVEALING CUP", "accent": (90, 130, 210), "bg": (12, 14, 24), "motif": "emblem_cup"},
    {"id": "ox-headed-mace", "name": "OX-HEADED MACE", "subtitle": "WEAPON OF FEREYDUN", "accent": (205, 150, 70), "bg": (20, 14, 12), "motif": "emblem_mace"},

    # FINNISH / KALEVALA (2026-09)
    {"id": "sampo", "name": "SAMPO", "subtitle": "THE MILL OF PLENTY", "accent": (220, 170, 70), "bg": (18, 14, 12), "motif": "emblem_mill"},
    {"id": "vainamoinens-kantele", "name": "THE FIRST KANTELE", "subtitle": "HARP OF PIKE-BONE", "accent": (215, 175, 90), "bg": (18, 16, 12), "motif": "emblem_kantele"},
    {"id": "golden-maiden", "name": "THE GOLDEN MAIDEN", "subtitle": "BRIDE FROM THE FORGE", "accent": (225, 185, 80), "bg": (18, 14, 10), "motif": "emblem_flame"},

    # KOREAN (2026-09)
    {"id": "cheonbuin", "name": "CHEONBUIN", "subtitle": "THE THREE HEAVENLY SEALS", "accent": (215, 180, 90), "bg": (16, 14, 10), "motif": "emblem_seals"},
    {"id": "manpasikjeok-flute", "name": "MANPASIKJEOK", "subtitle": "THE FLUTE THAT CALMS TEN THOUSAND WAVES", "accent": (150, 190, 130), "bg": (10, 16, 14), "motif": "emblem_flute"},
    {"id": "water-of-life", "name": "WATER OF LIFE", "subtitle": "BROUGHT BACK BY PRINCESS BARI", "accent": (140, 190, 210), "bg": (10, 14, 18), "motif": "emblem_well"},
]

def draw_artifact_motif(draw, cx, cy, r, motif, accent, gold):
    draw_emblem(draw, cx, cy, motif, accent, gold)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--only",
        help="Comma-separated ids to (re)generate; default is every plate.",
    )
    args = parser.parse_args()
    wanted = set(args.only.split(",")) if args.only else None

    groups = [
        ("Creature", CREATURES, CREATURES_DIR, "creature", draw_creature_motif),
        ("Location", LOCATIONS, LOCATIONS_DIR, "location", draw_location_motif),
        ("Story", STORIES, STORIES_DIR, "story", draw_story_motif),
        ("Interactive story cover", BRANCHING_COVERS, STORIES_DIR, "cover", draw_story_motif),
        ("Artifact", ARTIFACTS, ARTIFACTS_DIR, "artifact", draw_story_motif),
        ("Artifact", EMBLEM_ARTIFACTS, ARTIFACTS_DIR, "artifact", draw_artifact_motif),
    ]
    if wanted:
        known = {item["id"] for _, items, *_ in groups for item in items}
        missing = wanted - known
        if missing:
            raise SystemExit(f"Unknown ids: {', '.join(sorted(missing))}")
    for label, items, out_dir, kind, motif_fn in groups:
        selected = [i for i in items if wanted is None or i["id"] in wanted]
        if not selected:
            continue
        print(f"Generating {len(selected)} {label} Plates...")
        for item in selected:
            generate_square_plate(item, out_dir, kind, motif_fn)
    print("Creatures, Locations, Stories, and Artifacts completed!")
