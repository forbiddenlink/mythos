#!/usr/bin/env python3
"""
generate_deity_plates.py
Generates archival classical portrait plates for deities in Mythos Atlas that have no\nillustration (43 in the first pass, 15 more in 2026-09),
adhering to the dark-academia classical atlas style in .impeccable.md.
"""

import os
import math
import argparse
from PIL import Image, ImageDraw

from _plate_emblems import draw_emblem
from _repo_paths import WEB_PUBLIC, serif_font, write_webp

DEITIES_DIR = os.path.join(WEB_PUBLIC, "deities")

W, H = 768, 1024

DEITIES = [
    # GREEK TITANS & PRIMORDIALS
    {"id": "cronus", "name": "CRONUS", "tag": "GREEK TITAN", "domain": "HARVEST · GOLDEN AGE · KING OF TITANS", "accent": (212, 175, 55), "bg": (22, 18, 14), "motif": "sickle_hourglass"},
    {"id": "gaia", "name": "GAIA", "tag": "GREEK PRIMORDIAL", "domain": "MOTHER EARTH · CREATION OF TITANS", "accent": (140, 185, 90), "bg": (16, 22, 14), "motif": "earth_vines"},
    {"id": "uranus", "name": "URANUS", "tag": "GREEK PRIMORDIAL", "domain": "THE STARRY SKY · VAULT OF HEAVEN", "accent": (80, 140, 220), "bg": (12, 16, 28), "motif": "starry_vault"},
    {"id": "hecate", "name": "HECATE", "tag": "GREEK GODDESS", "domain": "CROSSROADS · NIGHT · SACRED TORCHES", "accent": (170, 120, 200), "bg": (20, 14, 24), "motif": "triple_torch"},
    
    # NORSE
    {"id": "ymir", "name": "YMIR", "tag": "NORSE PRIMORDIAL", "domain": "FROST GIANTS · MATERIAL OF CREATION", "accent": (110, 170, 220), "bg": (12, 18, 26), "motif": "frost_chasm"},
    {"id": "hodr", "name": "HÖÐR", "tag": "NORSE GOD", "domain": "DARKNESS · WINTER · THE SHADOWED GOD", "accent": (130, 140, 170), "bg": (16, 16, 22), "motif": "blind_bow"},
    {"id": "idun", "name": "IÐUNN", "tag": "NORSE GODDESS", "domain": "YOUTH · RENEWAL · GOLDEN APPLES", "accent": (235, 180, 60), "bg": (20, 18, 12), "motif": "golden_apples"},
    {"id": "bragi", "name": "BRAGI", "tag": "NORSE GOD", "domain": "POETRY · SKALDIC ELOQUENCE · THE HARP", "accent": (210, 155, 75), "bg": (22, 16, 14), "motif": "skald_harp"},

    # HINDU
    {"id": "sita", "name": "SITA", "tag": "HINDU GODDESS", "domain": "DEVOTION · STEADFASTNESS · DAUGHTER OF EARTH", "accent": (235, 140, 50), "bg": (26, 16, 10), "motif": "sacred_lotus"},
    {"id": "ravana", "name": "RAVANA", "tag": "HINDU KING", "domain": "RAKSHASA KING · SCHOLAR · THE TEN HEADS", "accent": (220, 70, 50), "bg": (26, 12, 14), "motif": "ten_crowns"},
    {"id": "yama", "name": "YAMA", "tag": "HINDU GOD", "domain": "DHARMA · LORD OF DEATH · JUDGMENT", "accent": (195, 110, 50), "bg": (24, 14, 12), "motif": "dharma_buffalo"},

    # EGYPTIAN
    {"id": "ptah", "name": "PTAH", "tag": "EGYPTIAN GOD", "domain": "CREATION THROUGH SPEECH · MASTER ARCHITECT", "accent": (65, 165, 165), "bg": (10, 20, 22), "motif": "ptah_staff"},
    {"id": "amun", "name": "AMUN", "tag": "EGYPTIAN GOD", "domain": "HIDDEN POWER · KING OF GODS · THE OGDOAD", "accent": (225, 175, 45), "bg": (24, 18, 12), "motif": "amun_plumes"},
    {"id": "bes", "name": "BES", "tag": "EGYPTIAN GOD", "domain": "PROTECTOR OF HEARTH & CHILD · WARD OF EVIL", "accent": (200, 130, 60), "bg": (22, 16, 14), "motif": "bes_mask"},
    {"id": "shu", "name": "SHU", "tag": "EGYPTIAN GOD", "domain": "AIR · SUNLIGHT · SEPARATOR OF SKY & EARTH", "accent": (230, 190, 90), "bg": (22, 20, 14), "motif": "shu_feather"},
    {"id": "nut", "name": "NUT", "tag": "EGYPTIAN GODDESS", "domain": "THE STARRY SKY · SOLAR REBIRTH · THE VAULT", "accent": (90, 145, 230), "bg": (12, 16, 28), "motif": "nut_stars"},
    {"id": "geb", "name": "GEB", "tag": "EGYPTIAN GOD", "domain": "THE FERTILE EARTH · THE DIVINE GOOSE", "accent": (145, 165, 80), "bg": (16, 20, 14), "motif": "geb_goose"},

    # CELTIC & CHINESE & MESOPOTAMIAN & AZTEC
    {"id": "medb", "name": "MEDB", "tag": "CELTIC QUEEN & GODDESS", "domain": "SOVEREIGNTY · AUTONOMY · SACRED MEAD", "accent": (185, 135, 65), "bg": (22, 18, 14), "motif": "celtic_mead"},
    {"id": "fuxi", "name": "FUXI", "tag": "CHINESE PRIMORDIAL", "domain": "EIGHT TRIGRAMS · CULTURE FOUNDER · ORDER", "accent": (210, 85, 65), "bg": (24, 14, 16), "motif": "bagua_trigrams"},
    {"id": "dumuzi", "name": "DUMUZI", "tag": "MESOPOTAMIAN GOD", "domain": "THE SHEPHERD · AGRICULTURAL CYCLE · TAMMUZ", "accent": (195, 145, 75), "bg": (22, 18, 14), "motif": "shepherd_palm"},
    {"id": "utnapishtim", "name": "UTNAPISHTIM", "tag": "MESOPOTAMIAN SAGE", "domain": "THE GREAT FLOOD · SOLE IMMORTAL MAN", "accent": (120, 160, 205), "bg": (14, 18, 26), "motif": "flood_ark"},
    {"id": "mictecacihuatl", "name": "MICTECACIHUATL", "tag": "AZTEC GODDESS", "domain": "QUEEN OF MICTLAN · BONES OF THE ANCESTORS", "accent": (220, 120, 60), "bg": (24, 14, 16), "motif": "marigold_skull"},
    {"id": "ometeotl", "name": "OMETEOTL", "tag": "AZTEC PRIMORDIAL", "domain": "DUALITY · DUAL LORD & LADY · OMEYOCAN", "accent": (85, 175, 170), "bg": (14, 22, 22), "motif": "dual_serpents"},

    # SLAVIC DEITIES
    {"id": "perun", "name": "PERUN", "tag": "SLAVIC GOD", "domain": "THUNDER · LIGHTNING AXE · WAR · THE SACRED OAK", "accent": (225, 155, 45), "bg": (24, 16, 12), "motif": "thunder_axe"},
    {"id": "veles", "name": "VELES", "tag": "SLAVIC GOD", "domain": "THE UNDERWORLD · CATTLE · WEALTH · MAGIC", "accent": (155, 115, 70), "bg": (20, 16, 12), "motif": "horned_cattle"},
    {"id": "mokosh", "name": "MOKOSH", "tag": "SLAVIC GODDESS", "domain": "MOTHER OF MOIST EARTH · WEAVING · FERTILITY", "accent": (175, 120, 160), "bg": (22, 14, 20), "motif": "spindle_distaff"},
    {"id": "svarog", "name": "SVAROG", "tag": "SLAVIC GOD", "domain": "THE CELESTIAL FORGE · HEAVENLY FIRE · SMITHING", "accent": (215, 110, 45), "bg": (26, 14, 10), "motif": "celestial_anvil"},
    {"id": "dazhbog", "name": "DAZHBOG", "tag": "SLAVIC GOD", "domain": "THE RADIANT SUN · GIVING OF FORTUNE", "accent": (235, 180, 50), "bg": (26, 20, 12), "motif": "sun_disc"},
    {"id": "stribog", "name": "STRIBOG", "tag": "SLAVIC GOD", "domain": "GRANDFATHER OF WINDS · WHIRLWINDS · STORMS", "accent": (130, 165, 205), "bg": (14, 18, 24), "motif": "wind_gale"},
    {"id": "khors", "name": "KHORS", "tag": "SLAVIC GOD", "domain": "THE SOLAR WHEEL · THE GLOWING CELESTIAL ORB", "accent": (210, 170, 90), "bg": (22, 18, 14), "motif": "solar_wheel"},
    {"id": "simargl", "name": "SIMARGL", "tag": "SLAVIC GUARDIAN", "domain": "WINGED PROTECTOR OF SEEDS & CROPS", "accent": (185, 135, 70), "bg": (20, 16, 14), "motif": "winged_canine"},
    {"id": "svarozhich", "name": "SVAROZHICH", "tag": "SLAVIC GOD", "domain": "THE EARTHLY HEARTH FIRE · WARRIOR DIVINATION", "accent": (225, 95, 45), "bg": (26, 14, 12), "motif": "hearth_spear"},
    {"id": "svantevit", "name": "SVANTEVIT", "tag": "SLAVIC GOD", "domain": "FOUR-HEADED GOD OF ARKONA · DIVINATION HORSE", "accent": (195, 165, 95), "bg": (22, 18, 16), "motif": "four_faces"},
    {"id": "triglav", "name": "TRIGLAV", "tag": "SLAVIC GOD", "domain": "THREE HEADS: SKY, EARTH & UNDERWORLD", "accent": (160, 140, 110), "bg": (18, 16, 18), "motif": "triple_head"},
    {"id": "chernobog", "name": "CHERNOBOG", "tag": "SLAVIC ENTITY", "domain": "THE BLACK GOD · SHADOW & MISFORTUNE", "accent": (140, 100, 110), "bg": (16, 12, 16), "motif": "black_raven"},

    # HAUDENOSAUNEE & TLINGIT-HAIDA
    {"id": "sky-woman", "name": "SKY WOMAN", "tag": "HAUDENOSAUNEE", "domain": "MOTHER OF HUMANITY · FALL FROM SKY WORLD", "accent": (85, 155, 220), "bg": (12, 18, 28), "motif": "sky_fall"},
    {"id": "sapling", "name": "SAPLING", "tag": "HAUDENOSAUNEE", "domain": "THE GOOD MIND · MAKER OF CORN & SWEET WATERS", "accent": (115, 185, 95), "bg": (14, 22, 14), "motif": "corn_shoot"},
    {"id": "flint", "name": "FLINT", "tag": "HAUDENOSAUNEE", "domain": "THE HARD MIND · MAKER OF ROCK, WINTER & CRAGS", "accent": (175, 130, 80), "bg": (22, 16, 14), "motif": "flint_chert"},
    {"id": "turtle", "name": "GREAT TURTLE", "tag": "HAUDENOSAUNEE", "domain": "THE ENDURING SHELL THAT BEARS THE WORLD", "accent": (100, 160, 150), "bg": (12, 20, 20), "motif": "turtle_shell"},
    {"id": "raven", "name": "RAVEN", "tag": "TLINGIT & HAIDA", "domain": "YÉIL · THE TRANSFORMER · BRINGER OF LIGHT", "accent": (210, 75, 65), "bg": (20, 12, 14), "motif": "raven_light"},
    {"id": "fog-woman", "name": "FOG WOMAN", "tag": "TLINGIT & HAIDA", "domain": "RIVER MISTS · SALMON RUNS · SPRINGTIME", "accent": (120, 185, 185), "bg": (14, 20, 24), "motif": "salmon_mist"},
    {"id": "chief-fog-over-the-salmon", "name": "CHIEF FOG", "tag": "TLINGIT & HAIDA", "domain": "RIVER MOUTH CANOPIES · MISTS OF HARVEST", "accent": (150, 165, 175), "bg": (16, 18, 22), "motif": "fog_river"},
    {"id": "naas-shaak-aankawu", "name": "NAAS SHAAK", "tag": "TLINGIT & HAIDA", "domain": "KEEPER OF DAYLIGHT · THREE BOXES OF STARS", "accent": (225, 160, 50), "bg": (22, 16, 14), "motif": "three_boxes"},

    # 2026-09 additions: targets of cross-pantheon parallels that had no entry
    {"id": "helios", "name": "HELIOS", "tag": "GREEK TITAN-BORN GOD", "domain": "THE SUN · ALL-SEEING WITNESS", "accent": (235, 175, 55), "bg": (26, 18, 10), "motif": "sun_disc"},
    {"id": "selene", "name": "SELENE", "tag": "GREEK TITAN-BORN GODDESS", "domain": "THE MOON · THE MONTHS · ENDYMION", "accent": (170, 185, 220), "bg": (14, 16, 26), "motif": "starry_vault"},
    {"id": "eos", "name": "EOS", "tag": "GREEK TITAN-BORN GODDESS", "domain": "ROSY-FINGERED DAWN · TITHONUS", "accent": (230, 130, 110), "bg": (24, 14, 16), "motif": "solar_wheel"},
    {"id": "tethys", "name": "TETHYS", "tag": "GREEK TITANESS", "domain": "MOTHER OF RIVERS · WIFE OF OCEANUS", "accent": (80, 160, 175), "bg": (10, 20, 24), "motif": "salmon_mist"},
    {"id": "asclepius", "name": "ASCLEPIUS", "tag": "GREEK GOD", "domain": "HEALING · THE SERPENT STAFF", "accent": (120, 175, 120), "bg": (14, 22, 16), "motif": "dual_serpents"},
    {"id": "plutus", "name": "PLUTUS", "tag": "GREEK GOD", "domain": "WEALTH OF THE HARVEST · SON OF DEMETER", "accent": (215, 170, 70), "bg": (22, 18, 12), "motif": "golden_apples"},
    {"id": "dioscuri", "name": "THE DIOSCURI", "tag": "GREEK DIVINE TWINS", "domain": "CASTOR & POLYDEUCES · SAVIORS AT SEA", "accent": (150, 170, 215), "bg": (14, 16, 24), "motif": "starry_vault"},
    {"id": "kartikeya", "name": "KARTIKEYA", "tag": "HINDU GOD", "domain": "WAR · GENERAL OF THE GODS · THE SPEAR", "accent": (220, 95, 60), "bg": (26, 14, 12), "motif": "thunder_axe"},
    {"id": "usha", "name": "USHA", "tag": "VEDIC GODDESS", "domain": "THE DAWN · AWAKENER OF ALL", "accent": (240, 150, 90), "bg": (26, 16, 12), "motif": "sun_disc"},
    {"id": "ganga", "name": "GANGA", "tag": "HINDU GODDESS", "domain": "THE SACRED RIVER · PURIFICATION", "accent": (95, 175, 200), "bg": (10, 18, 24), "motif": "salmon_mist"},
    {"id": "ashvins", "name": "THE ASHVINS", "tag": "VEDIC DIVINE TWINS", "domain": "HORSEMEN OF DAWN · PHYSICIANS", "accent": (210, 175, 90), "bg": (22, 18, 12), "motif": "solar_wheel"},
    {"id": "purusha", "name": "PURUSHA", "tag": "VEDIC COSMIC BEING", "domain": "THE THOUSAND-HEADED PERSON · SACRIFICE", "accent": (200, 140, 70), "bg": (22, 16, 12), "motif": "four_faces"},
    {"id": "skadi", "name": "SKAÐI", "tag": "NORSE GODDESS", "domain": "MOUNTAINS · WINTER · THE HUNT", "accent": (160, 195, 225), "bg": (12, 18, 26), "motif": "frost_chasm"},
    {"id": "longwang", "name": "LONGWANG", "tag": "CHINESE DRAGON KINGS", "domain": "SEAS · RIVERS · BRINGERS OF RAIN", "accent": (80, 170, 140), "bg": (10, 20, 18), "motif": "fog_river"},
    {"id": "ninhursag", "name": "NINHURSAG", "tag": "MESOPOTAMIAN GODDESS", "domain": "LADY OF THE MOUNTAIN · MOTHER OF BIRTH", "accent": (175, 150, 95), "bg": (20, 18, 14), "motif": "earth_vines"},

    # INCA & ANDEAN (2026-09)
    {"id": "viracocha", "name": "VIRACOCHA", "tag": "INCA CREATOR", "domain": "MAKER OF SUN, MOON & THE NATIONS", "accent": (215, 165, 70), "bg": (22, 16, 12), "motif": "emblem_lake_island"},
    {"id": "inti", "name": "INTI", "tag": "INCA GOD", "domain": "THE SUN · ANCESTOR OF THE INCA KINGS", "accent": (225, 170, 50), "bg": (24, 16, 10), "motif": "emblem_sun_face"},
    {"id": "mama-killa", "name": "MAMA KILLA", "tag": "INCA GODDESS", "domain": "MOTHER MOON · THE MONTHS · THE QUEEN", "accent": (185, 195, 215), "bg": (14, 16, 24), "motif": "emblem_moon"},
    {"id": "pachamama", "name": "PACHAMAMA", "tag": "ANDEAN GODDESS", "domain": "EARTH MOTHER · FIELDS · OFFERINGS", "accent": (150, 170, 80), "bg": (18, 18, 12), "motif": "emblem_earth"},
    {"id": "mama-qucha", "name": "MAMA QUCHA", "tag": "ANDEAN GODDESS", "domain": "MOTHER SEA · LAKES & WATERS", "accent": (80, 160, 180), "bg": (10, 18, 24), "motif": "emblem_waves"},
    {"id": "illapa", "name": "ILLAPA", "tag": "INCA GOD", "domain": "THUNDER · LIGHTNING · RAIN & HAIL", "accent": (140, 165, 215), "bg": (14, 16, 26), "motif": "emblem_lightning"},
    {"id": "pachacamac", "name": "PACHACAMAC", "tag": "ANDEAN ORACLE GOD", "domain": "ANIMATOR OF THE WORLD · THE COAST", "accent": (200, 140, 80), "bg": (22, 16, 12), "motif": "emblem_pyramid"},
    {"id": "pariacaca", "name": "PARIACACA", "tag": "HUAROCHIRÍ HUACA", "domain": "SNOW MOUNTAIN · STORM · IRRIGATION", "accent": (170, 200, 225), "bg": (12, 16, 24), "motif": "emblem_eggs"},
    {"id": "cuniraya-viracocha", "name": "CUNIRAYA", "tag": "HUAROCHIRÍ HUACA", "domain": "TRICKSTER CREATOR · TERRACES & CANALS", "accent": (195, 150, 90), "bg": (20, 16, 12), "motif": "emblem_bird"},
    {"id": "huallallo-carhuincho", "name": "HUALLALLO", "tag": "HUAROCHIRÍ HUACA", "domain": "FIRE · LORD OF THE OLD HOT WORLD", "accent": (215, 95, 55), "bg": (24, 12, 10), "motif": "emblem_flame"},
    {"id": "manco-capac", "name": "MANCO CÁPAC", "tag": "INCA ANCESTOR", "domain": "FIRST INCA · FOUNDER OF CUSCO", "accent": (220, 175, 60), "bg": (22, 16, 12), "motif": "emblem_rod"},
    {"id": "mama-ocllo", "name": "MAMA OCLLO", "tag": "INCA ANCESTRESS", "domain": "FOUNDING MOTHER · SPINNING & WEAVING", "accent": (190, 120, 150), "bg": (22, 14, 18), "motif": "emblem_flower"},
]

def draw_deity_motif(draw, cx, cy, radius, motif, accent, gold):
    pale = (min(255, gold[0] + 50), min(255, gold[1] + 50), min(255, gold[2] + 50))
    dark = (gold[0] // 2, gold[1] // 2, gold[2] // 2)

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
        ], fill=dark, width=1)

    if draw_emblem(draw, cx, cy, motif, accent, gold):
        return

    # Motifs tailored to each of the 43 deities
    if motif in ("sickle_hourglass", "harvest_scythe"):
        # Cronus Scythe & Hourglass
        draw.arc([cx - 85, cy - 90, cx + 55, cy + 50], start=160, end=340, fill=pale, width=6)
        draw.line([(cx + 35, cy - 40), (cx - 45, cy + 75)], fill=gold, width=5)
        # Hourglass below
        draw.polygon([(cx + 15, cy + 20), (cx + 55, cy + 20), (cx + 35, cy + 50)], outline=pale, fill=accent)
        draw.polygon([(cx + 35, cy + 50), (cx + 15, cy + 80), (cx + 55, cy + 80)], outline=pale, fill=accent)

    elif motif in ("earth_vines", "sacred_lotus", "corn_shoot"):
        # Earth Mother Lotus & Blooming Sprout
        draw.arc([cx - 60, cy - 40, cx + 60, cy + 60], start=0, end=180, fill=gold, width=5)
        # Central blossoming bud
        draw.ellipse([cx - 20, cy - 35, cx + 20, cy + 25], outline=pale, fill=accent, width=2)
        draw.arc([cx - 45, cy - 60, cx, cy + 10], start=180, end=360, fill=pale, width=3)
        draw.arc([cx, cy - 60, cx + 45, cy + 10], start=180, end=360, fill=pale, width=3)
        # Roots / base
        draw.line([(cx, cy + 25), (cx, cy + 75)], fill=gold, width=4)

    elif motif in ("starry_vault", "nut_stars"):
        # Arched vault of heaven studded with radiant stars
        draw.arc([cx - 85, cy - 85, cx + 85, cy + 85], start=180, end=360, fill=pale, width=5)
        draw.arc([cx - 65, cy - 65, cx + 65, cy + 65], start=180, end=360, fill=gold, width=2)
        # Celestial stars
        for ang in [-70, -45, -20, 0, 20, 45, 70]:
            rad = math.radians(ang - 90)
            sx = cx + 75 * math.cos(rad)
            sy = cy + 75 * math.sin(rad)
            draw.ellipse([sx - 4, sy - 4, sx + 4, sy + 4], fill=pale)
        draw.ellipse([cx - 20, cy + 10, cx + 20, cy + 50], outline=gold, width=2)

    elif motif == "triple_torch":
        # Hecate triple torches & crossroads key
        draw.line([(cx, cy - 85), (cx, cy + 75)], fill=gold, width=5)
        draw.line([(cx - 45, cy - 65), (cx + 25, cy + 65)], fill=pale, width=4)
        draw.line([(cx + 45, cy - 65), (cx - 25, cy + 65)], fill=pale, width=4)
        # Torch flames
        for tx, ty in [(cx, cy - 90), (cx - 48, cy - 70), (cx + 48, cy - 70)]:
            draw.polygon([(tx, ty - 18), (tx - 10, ty + 5), (tx + 10, ty + 5)], fill=pale)
        # Crossroads key
        draw.ellipse([cx - 15, cy + 30, cx + 15, cy + 60], outline=gold, width=3)

    elif motif in ("thunder_axe", "celestial_anvil", "hearth_spear"):
        # Slavic Perun / Svarog Thunder Axe & Anvil
        draw.line([(cx - 30, cy + 75), (cx + 30, cy - 65)], fill=gold, width=8)
        # Double-headed battle axe
        draw.arc([cx + 10, cy - 85, cx + 85, cy - 10], start=210, end=380, fill=pale, width=6)
        draw.polygon([(cx + 30, cy - 65), (cx + 75, cy - 35), (cx + 45, cy - 15)], fill=accent, outline=gold)
        # Lightning sparks
        for sx, sy in [(-35, -20), (45, 30), (-20, 45)]:
            draw.line([(cx + sx - 8, cy + sy - 8), (cx + sx + 8, cy + sy + 8)], fill=pale, width=2)

    elif motif in ("horned_cattle", "dharma_buffalo"):
        # Horned bull/ram skull of Veles / Yama
        draw.arc([cx - 75, cy - 70, cx - 10, cy + 20], start=150, end=350, fill=pale, width=5)
        draw.arc([cx + 10, cy - 70, cx + 75, cy + 20], start=190, end=390, fill=pale, width=5)
        draw.polygon([(cx, cy + 45), (cx - 35, cy - 20), (cx + 35, cy - 20)], outline=gold, fill=accent, width=3)
        draw.ellipse([cx - 15, cy - 10, cx - 5, cy], fill=pale)
        draw.ellipse([cx + 5, cy - 10, cx + 15, cy], fill=pale)

    elif motif in ("four_faces", "triple_head", "ten_crowns", "bes_mask"):
        # Multi-headed idol / crown crest (Svantevit, Triglav, Ravana)
        draw.line([(cx, cy - 80), (cx, cy + 75)], fill=gold, width=5)
        for ox, h in [(-50, 40), (-25, 60), (0, 75), (25, 60), (50, 40)]:
            draw.polygon([(cx + ox, cy - h - 15), (cx + ox - 10, cy - h + 10), (cx + ox + 10, cy - h + 10)], outline=pale, fill=accent)
        draw.arc([cx - 65, cy + 10, cx + 65, cy + 75], start=0, end=180, fill=gold, width=4)

    elif motif in ("amun_plumes", "ptah_staff", "shu_feather", "geb_goose"):
        # Egyptian Sacred Plumes / Djed Staff / Ostrich Feather
        draw.line([(cx, cy - 80), (cx, cy + 80)], fill=gold, width=5)
        # Twin tall plumes of Amun
        draw.rectangle([cx - 20, cy - 90, cx - 4, cy + 10], outline=pale, fill=accent, width=2)
        draw.rectangle([cx + 4, cy - 90, cx + 20, cy + 10], outline=pale, fill=accent, width=2)
        # Ankh of life at center
        draw.ellipse([cx - 15, cy + 15, cx + 15, cy + 45], outline=pale, width=3)
        draw.line([(cx - 25, cy + 45), (cx + 25, cy + 45)], fill=pale, width=3)

    elif motif in ("raven_light", "sky_fall", "three_boxes", "salmon_mist", "fog_river"):
        # Indigenous Raven & Solar Box / Salmon Stream
        draw.arc([cx - 80, cy - 45, cx + 15, cy + 35], start=180, end=350, fill=pale, width=5)
        draw.ellipse([cx - 80, cy - 35, cx - 40, cy + 5], fill=pale) # Radiant Sun
        # Cascading river waves
        for wy in [15, 40, 65]:
            draw.arc([cx - 65, cy + wy - 15, cx + 65, cy + wy + 15], start=10, end=170, fill=gold, width=3)

    elif motif in ("sun_disc", "solar_wheel"):
        # Gilded radiant sun wheel
        for r_step in [30, 55]:
            draw.ellipse([cx - r_step, cy - r_step, cx + r_step, cy + r_step], outline=gold, width=2)
        for sp in range(8):
            ang = sp * (math.pi / 4)
            draw.line([
                (cx + 25 * math.cos(ang), cy + 25 * math.sin(ang)),
                (cx + 65 * math.cos(ang), cy + 65 * math.sin(ang))
            ], fill=pale, width=3)

    elif motif in ("golden_apples", "skald_harp", "spindle_distaff", "celtic_mead", "bagua_trigrams", "shepherd_palm", "flood_ark", "marigold_skull", "dual_serpents", "frost_chasm", "blind_bow", "winged_canine", "black_raven", "flint_chert", "turtle_shell"):
        # Golden Apples / Lyre / Bagua Trigrams / Shell
        draw.arc([cx - 70, cy - 65, cx + 70, cy + 65], start=30, end=330, fill=pale, width=4)
        draw.line([(cx, cy - 75), (cx, cy + 75)], fill=gold, width=4)
        draw.line([(cx - 50, cy), (cx + 50, cy)], fill=gold, width=3)
        draw.ellipse([cx - 25, cy - 25, cx + 25, cy + 25], outline=pale, fill=accent, width=2)
        draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=pale)

    else:
        # Classical default sacred geometry
        draw.ellipse([cx - 50, cy - 50, cx + 50, cy + 50], outline=pale, fill=accent, width=3)
        draw.line([(cx - 70, cy), (cx + 70, cy)], fill=gold, width=3)
        draw.line([(cx, cy - 70), (cx, cy + 70)], fill=gold, width=3)

def generate_deity_plate(d):
    os.makedirs(DEITIES_DIR, exist_ok=True)
    img = Image.new("RGBA", (W, H), d["bg"] + (255,))
    accent = d["accent"]
    gold = (212, 175, 55)

    # Ambient radial wash
    rad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rdraw = ImageDraw.Draw(rad)
    cx, cy = W // 2, 440
    for r in range(350, 50, -10):
        alpha = int(45 * (1.0 - r / 350.0))
        rdraw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=accent + (alpha,))
    img = Image.alpha_composite(img, rad)
    draw = ImageDraw.Draw(img)

    # Classical Greek key / antique borders
    draw.rectangle([32, 32, W - 32, H - 32], outline=gold, width=1)
    draw.rectangle([40, 40, W - 40, H - 40], outline=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)
    draw.rectangle([46, 46, W - 46, H - 46], outline=gold, width=2)

    # Corner brackets
    s = 24
    for bx, by, dx, dy in [(32, 32, 1, 1), (W - 32, 32, -1, 1), (32, H - 32, 1, -1), (W - 32, H - 32, -1, -1)]:
        draw.line([(bx, by), (bx + dx * s, by)], fill=gold, width=2)
        draw.line([(bx, by), (bx, by + dy * s)], fill=gold, width=2)
        draw.ellipse([bx + dx * 8 - 3, by + dy * 8 - 3, bx + dx * 8 + 3, by + dy * 8 + 3], fill=gold)

    # Header plate rule
    draw.line([(64, 90), (W - 64, 90)], fill=gold, width=1)
    draw.line([(64, 94), (W - 64, 94)], fill=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)

    tag_text = f"MYTHOS ATLAS · {d['tag']}"
    font_sm = serif_font("regular", 16)
    font_lg = serif_font("bold", 46)
    font_sub = serif_font("italic", 17)

    draw.text((W // 2, 65), tag_text, font=font_sm, fill=(200, 180, 140), anchor="mm")

    # Center Medallion
    draw_deity_motif(draw, cx, cy, 175, d["motif"], accent, gold)

    # Nameplate bottom
    draw.line([(80, 750), (W - 80, 750)], fill=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)
    draw.line([(80, 754), (W - 80, 754)], fill=gold, width=2)
    draw.line([(80, 758), (W - 80, 758)], fill=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)

    draw.text((W // 2, 810), d["name"], font=font_lg, fill=(245, 235, 220), anchor="mm")
    draw.text((W // 2, 860), d["domain"], font=font_sub, fill=gold, anchor="mm")

    # Footer Archival stamp
    draw.text((W // 2, 940), "CODEX THEOLOGICUS · FOLIO SACRUM", font=font_sm, fill=(130, 120, 100), anchor="mm")
    draw.line([(W // 2 - 60, 965), (W // 2 + 60, 965)], fill=gold, width=1)

    # Export PNG
    png_path = os.path.join(DEITIES_DIR, f"{d['id']}.png")
    img.convert("RGB").save(png_path, "PNG")

    # Export WebP
    webp_path = os.path.join(DEITIES_DIR, f"{d['id']}.webp")
    write_webp(png_path, webp_path)
    print(f"  ✓ Deity: {d['id']} -> PNG & WebP")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--only",
        help="Comma-separated deity ids to (re)generate; default is every plate.",
    )
    args = parser.parse_args()
    wanted = set(args.only.split(",")) if args.only else None
    selected = [d for d in DEITIES if wanted is None or d["id"] in wanted]
    if wanted and len(selected) != len(wanted):
        missing = wanted - {d["id"] for d in selected}
        raise SystemExit(f"Unknown deity ids: {', '.join(sorted(missing))}")
    print(f"Generating {len(selected)} Deity Portrait Plates...")
    for d in selected:
        generate_deity_plate(d)
    print(f"{len(selected)} deity plates generated in {DEITIES_DIR}")
