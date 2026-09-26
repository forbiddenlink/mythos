#!/usr/bin/env python3
"""
generate_deity_plates.py
Generates archival classical portrait plates for deities in Mythos Atlas that have no\nillustration (43 in the first pass, 15 more in 2026-09),
adhering to the dark-academia classical atlas style in .impeccable.md.
"""

import os
import math
import argparse

from _plate_emblems import draw_emblem
from _plate_art import pantheon_of, render_plate, write_plate
from _repo_paths import WEB_PUBLIC

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
    # 2026-09 additions: deeper Haudenosaunee, Tlingit & Haida, and Akan coverage
    {
        "id": "asase-yaa",
        "name": "ASASE YAA",
        "tag": "AKAN",
        "domain": "THE EARTH · THURSDAY-BORN · LIBATION",
        "accent": (150, 120, 70),
        "bg": (20, 16, 12),
        "motif": "earth_vines"
    },
    {
        "id": "tano",
        "name": "TANO",
        "tag": "AKAN OBOSOM",
        "domain": "THE TANO RIVER · FOREMOST OF THE ABOSOM",
        "accent": (80, 150, 170),
        "bg": (12, 18, 22),
        "motif": "fog_river"
    },
    {
        "id": "bia",
        "name": "BIA",
        "tag": "AKAN OBOSOM",
        "domain": "THE BIA RIVER · BROTHER OF TANO",
        "accent": (90, 160, 130),
        "bg": (12, 20, 18),
        "motif": "fog_river"
    },
    {
        "id": "hinon",
        "name": "HINON",
        "tag": "HAUDENOSAUNEE",
        "domain": "THE THUNDERER · MAKER OF RAINS",
        "accent": (120, 150, 220),
        "bg": (12, 16, 26),
        "motif": "thunder_axe"
    },
    {
        "id": "earth-holder",
        "name": "EARTH HOLDER",
        "tag": "HAUDENOSAUNEE",
        "domain": "CHIEF OF THE SKY WORLD · THE CELESTIAL TREE",
        "accent": (150, 180, 230),
        "bg": (12, 16, 26),
        "motif": "starry_vault"
    },
    {
        "id": "sky-womans-daughter",
        "name": "SKY WOMAN'S DAUGHTER",
        "tag": "HAUDENOSAUNEE",
        "domain": "MOTHER OF THE TWINS · GIVER OF THE FOOD PLANTS",
        "accent": (140, 190, 110),
        "bg": (14, 20, 14),
        "motif": "corn_shoot"
    },
    {
        "id": "gaha",
        "name": "GA'HA'",
        "tag": "HAUDENOSAUNEE",
        "domain": "THE GENTLE WIND · RIPENER OF FRUITS",
        "accent": (150, 190, 210),
        "bg": (14, 18, 24),
        "motif": "wind_gale"
    },
    {
        "id": "three-sisters",
        "name": "THE THREE SISTERS",
        "tag": "HAUDENOSAUNEE",
        "domain": "CORN · BEANS · SQUASH",
        "accent": (200, 170, 70),
        "bg": (20, 18, 12),
        "motif": "corn_shoot"
    },
    {
        "id": "dew-eagle",
        "name": "DEW EAGLE",
        "tag": "HAUDENOSAUNEE",
        "domain": "GUARDIAN OF THE UPPER AIR",
        "accent": (180, 200, 230),
        "bg": (14, 16, 24),
        "motif": "winged_canine"
    },
    {
        "id": "petrel",
        "name": "PETREL",
        "tag": "TLINGIT & HAIDA",
        "domain": "GANOOK · KEEPER OF THE EVERLASTING SPRING",
        "accent": (110, 170, 200),
        "bg": (12, 18, 24),
        "motif": "salmon_mist"
    },
    {
        "id": "old-woman-underneath",
        "name": "OLD-WOMAN-UNDERNEATH",
        "tag": "TLINGIT & HAIDA",
        "domain": "KEEPER OF THE EARTH-POST · THE TIDES",
        "accent": (170, 130, 90),
        "bg": (20, 16, 14),
        "motif": "flint_chert"
    },
    {
        "id": "djilaqons",
        "name": "DJILAQONS",
        "tag": "TLINGIT & HAIDA",
        "domain": "ANCESTRESS OF THE EAGLE CLANS",
        "accent": (210, 90, 70),
        "bg": (22, 14, 14),
        "motif": "black_raven"
    },
    {
        "id": "master-carpenter",
        "name": "MASTER CARPENTER",
        "tag": "TLINGIT & HAIDA",
        "domain": "SUPERNATURAL CRAFTSMAN · CANOE-MAKER",
        "accent": (190, 120, 70),
        "bg": (22, 16, 12),
        "motif": "three_boxes"
    },

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

    # PERSIAN / IRANIAN (2026-09)
    {"id": "ahura-mazda", "name": "AHURA MAZDA", "tag": "ZOROASTRIAN CREATOR", "domain": "THE WISE LORD · TRUTH · LIGHT", "accent": (215, 175, 70), "bg": (14, 16, 26), "motif": "emblem_winged_disc"},
    {"id": "angra-mainyu", "name": "ANGRA MAINYU", "tag": "ZOROASTRIAN ADVERSARY", "domain": "THE HOSTILE SPIRIT · THE LIE", "accent": (130, 80, 110), "bg": (12, 10, 14), "motif": "emblem_serpent"},
    {"id": "mithra", "name": "MITHRA", "tag": "IRANIAN YAZATA", "domain": "THE COVENANT · DAWN · JUDGMENT", "accent": (230, 165, 70), "bg": (22, 14, 12), "motif": "emblem_sun"},
    {"id": "anahita", "name": "ANAHITA", "tag": "IRANIAN YAZATA", "domain": "THE HEAVENLY RIVER · BIRTH · PURITY", "accent": (100, 170, 205), "bg": (10, 16, 26), "motif": "emblem_water_flower"},
    {"id": "tishtrya", "name": "TISHTRYA", "tag": "IRANIAN YAZATA", "domain": "THE STAR SIRIUS · BRINGER OF RAIN", "accent": (180, 200, 235), "bg": (10, 14, 26), "motif": "emblem_horse"},
    {"id": "verethragna", "name": "VERETHRAGNA", "tag": "IRANIAN YAZATA", "domain": "VICTORY · THE TEN INCARNATIONS", "accent": (205, 130, 70), "bg": (22, 14, 12), "motif": "emblem_beast"},
    {"id": "atar", "name": "ATAR", "tag": "IRANIAN YAZATA", "domain": "SACRED FIRE · SON OF AHURA MAZDA", "accent": (230, 110, 50), "bg": (24, 12, 10), "motif": "emblem_fire"},
    {"id": "spenta-armaiti", "name": "SPENTA ARMAITI", "tag": "AMESHA SPENTA", "domain": "DEVOTION · GUARDIAN OF THE EARTH", "accent": (150, 175, 95), "bg": (16, 18, 12), "motif": "emblem_earth"},
    {"id": "sraosha", "name": "SRAOSHA", "tag": "IRANIAN YAZATA", "domain": "OBEDIENCE · GUARDIAN OF SOULS", "accent": (190, 180, 150), "bg": (14, 14, 20), "motif": "emblem_bird"},
    {"id": "zurvan", "name": "ZURVAN", "tag": "ZURVANITE PRINCIPLE", "domain": "INFINITE TIME · FATHER OF TWINS", "accent": (160, 150, 200), "bg": (12, 12, 20), "motif": "emblem_stars"},
    {"id": "yima", "name": "YIMA", "tag": "PRIMORDIAL KING", "domain": "THE GOLDEN AGE · THE VAR · JAMSHID", "accent": (90, 130, 210), "bg": (12, 14, 24), "motif": "emblem_cup"},

    # FINNISH / KALEVALA (2026-09)
    {"id": "ukko", "name": "UKKO", "tag": "FINNISH GOD", "domain": "SKY · THUNDER · RAIN", "accent": (150, 175, 225), "bg": (12, 14, 24), "motif": "emblem_lightning"},
    {"id": "ilmatar", "name": "ILMATAR", "tag": "FINNISH PRIMORDIAL", "domain": "DAUGHTER OF THE AIR · THE WORLD EGG", "accent": (190, 205, 230), "bg": (12, 16, 24), "motif": "emblem_egg"},
    {"id": "vainamoinen", "name": "VÄINÄMÖINEN", "tag": "FINNISH SAGE", "domain": "THE ETERNAL SINGER · THE KANTELE", "accent": (215, 175, 90), "bg": (18, 16, 12), "motif": "emblem_kantele"},
    {"id": "ilmarinen", "name": "ILMARINEN", "tag": "FINNISH SMITH", "domain": "FORGER OF THE SKY & THE SAMPO", "accent": (225, 130, 60), "bg": (22, 14, 10), "motif": "emblem_mill"},
    {"id": "lemminkainen", "name": "LEMMINKÄINEN", "tag": "FINNISH HERO", "domain": "ADVENTURE · DEATH & RETURN", "accent": (205, 120, 110), "bg": (20, 12, 14), "motif": "emblem_underworld_river"},
    {"id": "louhi", "name": "LOUHI", "tag": "MISTRESS OF POHJOLA", "domain": "THE DARK NORTH · SORCERY", "accent": (150, 140, 200), "bg": (12, 12, 20), "motif": "emblem_great_bird"},
    {"id": "tuoni", "name": "TUONI", "tag": "FINNISH GOD", "domain": "DEATH · LORD OF TUONELA", "accent": (120, 130, 150), "bg": (10, 10, 14), "motif": "emblem_gate_below"},
    {"id": "tapio", "name": "TAPIO", "tag": "FINNISH GOD", "domain": "KING OF THE FOREST · GAME", "accent": (110, 160, 100), "bg": (12, 18, 12), "motif": "emblem_elk"},
    {"id": "mielikki", "name": "MIELIKKI", "tag": "FINNISH GODDESS", "domain": "MISTRESS OF THE FOREST", "accent": (150, 185, 110), "bg": (14, 18, 12), "motif": "emblem_flower"},
    {"id": "ahti", "name": "AHTI", "tag": "FINNISH GOD", "domain": "KING OF THE WAVES · FISH", "accent": (90, 160, 190), "bg": (10, 16, 22), "motif": "emblem_fish"},
    {"id": "vellamo", "name": "VELLAMO", "tag": "FINNISH GODDESS", "domain": "MISTRESS OF THE WATERS", "accent": (110, 175, 200), "bg": (10, 16, 24), "motif": "emblem_water_flower"},

    # KOREAN (2026-09)
    {"id": "hwanin", "name": "HWANIN", "tag": "KOREAN GOD", "domain": "LORD OF HEAVEN", "accent": (200, 210, 230), "bg": (12, 14, 22), "motif": "emblem_sun"},
    {"id": "hwanung", "name": "HWANUNG", "tag": "KOREAN GOD", "domain": "DESCENT TO THE SINDANSU", "accent": (215, 180, 90), "bg": (16, 16, 12), "motif": "emblem_tree_altar"},
    {"id": "ungnyeo", "name": "UNGNYEO", "tag": "KOREAN ANCESTRESS", "domain": "THE BEAR WOMAN", "accent": (170, 130, 95), "bg": (16, 12, 10), "motif": "emblem_bear_cave"},
    {"id": "dangun", "name": "DANGUN WANGGEOM", "tag": "KOREAN FOUNDER", "domain": "FOUNDER OF GOJOSEON", "accent": (130, 185, 165), "bg": (10, 16, 14), "motif": "emblem_mountain"},
    {"id": "haemosu", "name": "HAEMOSU", "tag": "KOREAN GOD", "domain": "SON OF HEAVEN · FIVE DRAGONS", "accent": (225, 190, 90), "bg": (18, 14, 10), "motif": "emblem_crow_sun"},
    {"id": "yuhwa", "name": "YUHWA", "tag": "KOREAN GODDESS", "domain": "WILLOW FLOWER · MOTHER OF JUMONG", "accent": (150, 200, 170), "bg": (10, 16, 14), "motif": "emblem_water_flower"},
    {"id": "habaek", "name": "HABAEK", "tag": "KOREAN GOD", "domain": "LORD OF THE RIVER", "accent": (90, 160, 190), "bg": (10, 14, 20), "motif": "emblem_waves"},
    {"id": "jumong", "name": "JUMONG", "tag": "KOREAN FOUNDER", "domain": "FOUNDER OF GOGURYEO · ARCHER", "accent": (205, 120, 90), "bg": (18, 12, 10), "motif": "emblem_egg"},
    {"id": "bak-hyeokgeose", "name": "BAK HYEOKGEOSE", "tag": "KOREAN FOUNDER", "domain": "FOUNDER OF SILLA · BORN OF AN EGG", "accent": (215, 180, 100), "bg": (16, 14, 10), "motif": "emblem_well"},
    {"id": "bari-gongju", "name": "BARI GONGJU", "tag": "KOREAN GODDESS", "domain": "GUIDE OF THE DEAD", "accent": (200, 170, 210), "bg": (14, 12, 18), "motif": "emblem_flower"},
    {"id": "mireuk", "name": "MIREUK", "tag": "KOREAN CREATOR", "domain": "SEPARATOR OF HEAVEN & EARTH", "accent": (190, 205, 230), "bg": (12, 14, 20), "motif": "emblem_sun_face"},
    {"id": "seokga", "name": "SEOKGA", "tag": "KOREAN GOD", "domain": "USURPER OF THE HUMAN AGE", "accent": (200, 150, 110), "bg": (16, 12, 10), "motif": "emblem_moon"},
    # 2026-09 additions: figures behind the Percy Jackson and Hades II guides
    {"id": "atlas", "name": "ATLAS", "tag": "GREEK TITAN", "domain": "BEARER OF THE SKY · SON OF IAPETUS", "accent": (205, 160, 80), "bg": (22, 18, 14), "motif": "starry_vault"},
    {"id": "nyx", "name": "NYX", "tag": "GREEK PRIMORDIAL", "domain": "NIGHT · MOTHER OF SLEEP & DEATH", "accent": (120, 110, 190), "bg": (12, 12, 24), "motif": "starry_vault"},
    {"id": "nemesis", "name": "NEMESIS", "tag": "GREEK GODDESS", "domain": "RETRIBUTION · DUE MEASURE · RHAMNOUS", "accent": (190, 150, 90), "bg": (20, 16, 14), "motif": "sickle_hourglass"},
    {"id": "thanatos", "name": "THANATOS", "tag": "GREEK GOD", "domain": "DEATH · SON OF NIGHT · TWIN OF SLEEP", "accent": (150, 150, 170), "bg": (14, 14, 18), "motif": "black_raven"},
    {"id": "melinoe", "name": "MELINOË", "tag": "GREEK GODDESS", "domain": "GHOSTS · NIGHT TERRORS · ORPHIC HYMN 71", "accent": (215, 170, 70), "bg": (18, 14, 20), "motif": "triple_torch"}
]

def draw_deity_motif(draw, cx, cy, radius, motif, accent, gold):
    pale = (min(255, gold[0] + 50), min(255, gold[1] + 50), min(255, gold[2] + 50))

    # The medallion rings are drawn by _plate_art.render_plate.

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
    accent = d["accent"]
    gold = (212, 175, 55)
    img = render_plate(
        kind="deity",
        key=d["id"],
        size=(W, H),
        accent=accent,
        bg=d["bg"],
        pantheon=pantheon_of("deity", d["id"]),
        hint=d["domain"],
        emblem=lambda draw, cx, cy: draw_deity_motif(draw, cx, cy, 175, d["motif"], accent, gold),
    )
    path = write_plate(img, DEITIES_DIR, d["id"])
    print(f"  ✓ Deity: {d['id']} -> {os.path.basename(path)}")

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
