import os
import math
import argparse
from PIL import Image, ImageDraw, ImageFilter

from _repo_paths import WEB_PUBLIC, serif_font, write_webp

OUTPUT_DIR = os.path.join(WEB_PUBLIC, "heroes")

HEROES = [
    {
        "id": "achilles",
        "name": "ACHILLES",
        "epithet": "BEST OF THE ACHAEANS · THE ILIAD",
        "pantheon": "GREEK",
        "accent": (212, 175, 55),      # Classic Gold
        "bg_tone": (18, 16, 24),
        "motif": "helmet_shield"
    },
    {
        "id": "odysseus",
        "name": "ODYSSEUS",
        "epithet": "MAN OF MANY WAYS · THE ODYSSEY",
        "pantheon": "GREEK",
        "accent": (74, 144, 226),     # Aegean Blue / Gold
        "bg_tone": (12, 20, 32),
        "motif": "bow_ship"
    },
    {
        "id": "hector",
        "name": "HECTOR",
        "epithet": "BREAKER OF HORSES · SHIELD OF TROY",
        "pantheon": "GREEK",
        "accent": (198, 125, 60),     # Bronze / Troy
        "bg_tone": (24, 16, 14),
        "motif": "trojan_crest"
    },
    {
        "id": "heracles",
        "name": "HERACLES",
        "epithet": "SLAYER OF MONSTERS · TWELVE LABORS",
        "pantheon": "GREEK",
        "accent": (220, 160, 40),     # Lion Gold
        "bg_tone": (22, 18, 12),
        "motif": "lion_club"
    },
    {
        "id": "jason",
        "name": "JASON",
        "epithet": "CAPTAIN OF THE ARGO · GOLDEN FLEECE",
        "pantheon": "GREEK",
        "accent": (225, 185, 75),     # Golden Fleece
        "bg_tone": (16, 20, 26),
        "motif": "argo_fleece"
    },
    {
        "id": "theseus",
        "name": "THESEUS",
        "epithet": "SLAYER OF THE MINOTAUR · ATHENS",
        "pantheon": "GREEK",
        "accent": (180, 150, 90),     # Labyrinth Stone
        "bg_tone": (18, 18, 22),
        "motif": "labyrinth"
    },
    {
        "id": "oedipus",
        "name": "OEDIPUS",
        "epithet": "RIDDLE OF THE SPHINX · KING OF THEBES",
        "pantheon": "GREEK",
        "accent": (160, 120, 180),    # Tragedy Purple
        "bg_tone": (20, 14, 24),
        "motif": "sphinx_staff"
    },
    {
        "id": "penelope",
        "name": "PENELOPE",
        "epithet": "QUEEN OF ITHACA · THE UNWOVEN SHROUD",
        "pantheon": "GREEK",
        "accent": (210, 180, 140),    # Linen / Gold
        "bg_tone": (16, 18, 22),
        "motif": "loom"
    },
    {
        "id": "helen",
        "name": "HELEN",
        "epithet": "OF SPARTA & TROY · THE SWAN-BORN",
        "pantheon": "GREEK",
        "accent": (240, 210, 170),    # Radiant Pearl
        "bg_tone": (24, 18, 22),
        "motif": "swan_crown"
    },
    {
        "id": "agamemnon",
        "name": "AGAMEMNON",
        "epithet": "KING OF MYCENAE · LORD OF MEN",
        "pantheon": "GREEK",
        "accent": (218, 165, 32),     # Mycenaean Gold
        "bg_tone": (22, 16, 12),
        "motif": "mask_scepter"
    },
    {
        "id": "patroclus",
        "name": "PATROCLUS",
        "epithet": "COMPANION OF ACHILLES · PHOCIS",
        "pantheon": "GREEK",
        "accent": (195, 145, 80),     # Bronze
        "bg_tone": (20, 16, 18),
        "motif": "greaves_shield"
    },
    {
        "id": "ajax",
        "name": "AJAX",
        "epithet": "BULWARK OF THE ACHAEANS · SALAMIS",
        "pantheon": "GREEK",
        "accent": (150, 130, 120),    # Iron / Oxhide
        "bg_tone": (18, 18, 20),
        "motif": "tower_shield"
    },
    {
        "id": "atalanta",
        "name": "ATALANTA",
        "epithet": "SWIFT-FOOTED HUNTRESS · CALYDON",
        "pantheon": "GREEK",
        "accent": (140, 190, 120),    # Forest / Hunt
        "bg_tone": (14, 22, 16),
        "motif": "bow_apple"
    },
    {
        "id": "bellerophon",
        "name": "BELLEROPHON",
        "epithet": "RIDER OF PEGASUS · CHIMERA SLAYER",
        "pantheon": "GREEK",
        "accent": (130, 180, 220),    # Celestial Wing
        "bg_tone": (14, 18, 26),
        "motif": "pegasus_wing"
    },
    {
        "id": "orpheus",
        "name": "ORPHEUS",
        "epithet": "MASTER OF THE LYRE · THRACIAN BARD",
        "pantheon": "GREEK",
        "accent": (215, 170, 90),     # Golden Lyre
        "bg_tone": (20, 16, 26),
        "motif": "lyre"
    },
    {
        "id": "aeneas",
        "name": "AENEAS",
        "epithet": "FOUNDER OF THE ROMAN RACE · THE AENEID",
        "pantheon": "ROMAN",
        "accent": (190, 50, 60),      # Imperial Crimson
        "bg_tone": (26, 12, 16),
        "motif": "roman_eagle"
    },
    {
        "id": "sigurd",
        "name": "SIGURD",
        "epithet": "FAFNER'S BANE · THE VOLSUNGA SAGA",
        "pantheon": "NORSE",
        "accent": (90, 150, 200),     # Nordic Frost & Steel
        "bg_tone": (12, 18, 26),
        "motif": "dragon_sword"
    },
    {
        "id": "cu-chulainn",
        "name": "CÚ CHULAINN",
        "epithet": "HOUND OF ULSTER · TÁIN BÓ CÚAILNGE",
        "pantheon": "CELTIC",
        "accent": (60, 160, 110),     # Celtic Emerald & Torc
        "bg_tone": (10, 22, 16),
        "motif": "celtic_spear"
    },
    {
        "id": "fionn-mac-cumhaill",
        "name": "FIONN MAC CUMHAILL",
        "epithet": "LEADER OF THE FIANNA · SALMON OF WISDOM",
        "pantheon": "CELTIC",
        "accent": (185, 140, 70),     # Hazel Gold & Torc
        "bg_tone": (16, 20, 14),
        "motif": "salmon_spear"
    },
    {
        "id": "arjuna",
        "name": "ARJUNA",
        "epithet": "WIELDER OF GANDIVA · THE MAHABHARATA",
        "pantheon": "HINDU",
        "accent": (230, 130, 40),     # Saffron Sun & Fire
        "bg_tone": (26, 16, 10),
        "motif": "gandiva_bow"
    },
]

W, H = 768, 1024

def draw_ornament_corners(draw, x0, y0, x1, y1, color):
    s = 24
    # Corner brackets with classical meander notches
    for cx, cy, dx, dy in [(x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)]:
        draw.line([(cx, cy), (cx + dx * s, cy)], fill=color, width=2)
        draw.line([(cx, cy), (cx, cy + dy * s)], fill=color, width=2)
        draw.ellipse([cx + dx * 8 - 3, cy + dy * 8 - 3, cx + dx * 8 + 3, cy + dy * 8 + 3], fill=color)

def draw_greek_key_border(draw, x0, y0, x1, y1, color):
    draw.rectangle([x0, y0, x1, y1], outline=color, width=1)
    draw.rectangle([x0 + 8, y0 + 8, x1 - 8, y1 - 8], outline=(color[0]//2, color[1]//2, color[2]//2), width=1)
    draw.rectangle([x0 + 14, y0 + 14, x1 - 14, y1 - 14], outline=color, width=2)

def draw_heroic_motif(draw, cx, cy, radius, motif, accent):
    gold = accent
    pale_gold = (min(255, gold[0] + 50), min(255, gold[1] + 50), min(255, gold[2] + 50))
    dark_gold = (gold[0] // 2, gold[1] // 2, gold[2] // 2)

    # Medallion outer rings
    for r, w in [(radius, 3), (radius - 12, 1), (radius - 20, 2)]:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=gold, width=w)

    # 12 decorative sun / star rays
    for i in range(24):
        angle = i * (2 * math.pi / 24)
        r1 = radius - 8
        r2 = radius - 3 if i % 2 == 0 else radius - 5
        draw.line([
            (cx + r1 * math.cos(angle), cy + r1 * math.sin(angle)),
            (cx + r2 * math.cos(angle), cy + r2 * math.sin(angle))
        ], fill=dark_gold, width=1)

    # Center motif
    if motif == "helmet_shield":
        # Hoplite Crested Helmet
        # Crest arc
        draw.arc([cx - 80, cy - 110, cx + 80, cy + 20], start=180, end=360, fill=pale_gold, width=8)
        # Helmet dome
        draw.arc([cx - 65, cy - 80, cx + 65, cy + 30], start=190, end=350, fill=gold, width=4)
        # Face guard and nose bridge
        draw.line([(cx, cy - 50), (cx, cy + 15)], fill=gold, width=6)
        draw.line([(cx - 45, cy - 10), (cx + 45, cy - 10)], fill=gold, width=4)
        draw.polygon([(cx - 35, cy + 15), (cx - 10, cy + 40), (cx - 10, cy + 15)], outline=gold, fill=dark_gold)
        draw.polygon([(cx + 35, cy + 15), (cx + 10, cy + 40), (cx + 10, cy + 15)], outline=gold, fill=dark_gold)
        # Flanking spear
        draw.line([(cx - 95, cy + 100), (cx + 95, cy - 100)], fill=gold, width=3)
        draw.polygon([(cx + 95, cy - 100), (cx + 115, cy - 120), (cx + 85, cy - 110)], fill=pale_gold)

    elif motif == "bow_ship":
        # Composite curved bow & ship prow
        draw.arc([cx - 90, cy - 90, cx + 90, cy + 90], start=210, end=330, fill=gold, width=5)
        draw.line([(cx - 78, cy - 45), (cx + 78, cy - 45)], fill=dark_gold, width=2)
        # Arrow on the string
        draw.line([(cx, cy + 60), (cx, cy - 80)], fill=pale_gold, width=3)
        draw.polygon([(cx, cy - 95), (cx - 10, cy - 75), (cx + 10, cy - 75)], fill=pale_gold)
        # Ship keel curve below
        draw.arc([cx - 70, cy + 20, cx + 70, cy + 80], start=20, end=160, fill=gold, width=4)
        # Wave scroll
        for ox in [-40, 0, 40]:
            draw.arc([cx + ox - 18, cy + 70, cx + ox + 18, cy + 95], start=0, end=180, fill=dark_gold, width=2)

    elif motif == "trojan_crest":
        # Trojan Tower & Crested Horse
        draw.line([(cx - 40, cy + 60), (cx - 30, cy - 40)], fill=gold, width=4)
        draw.line([(cx + 40, cy + 60), (cx + 30, cy - 40)], fill=gold, width=4)
        # Battlements
        for bx in [-35, -15, 5, 25]:
            draw.rectangle([cx + bx, cy - 48, cx + bx + 10, cy - 38], fill=pale_gold)
        # Horse mane crest
        draw.arc([cx - 50, cy - 90, cx + 50, cy - 10], start=180, end=340, fill=gold, width=6)
        # Spear points crossed
        draw.line([(cx - 70, cy + 70), (cx + 70, cy - 70)], fill=gold, width=2)
        draw.line([(cx + 70, cy + 70), (cx - 70, cy - 70)], fill=gold, width=2)

    elif motif == "lion_club":
        # Knotted olive club & lion pelt silhouette
        draw.line([(cx - 40, cy + 70), (cx + 40, cy - 70)], fill=gold, width=12)
        # Knots on club
        for t in [-0.4, -0.1, 0.2, 0.4]:
            kx = int(cx + t * 70)
            ky = int(cy - t * 70)
            draw.ellipse([kx - 8, ky - 8, kx + 8, ky + 8], fill=pale_gold)
        # Lion paw / claws
        draw.arc([cx - 60, cy - 60, cx + 60, cy + 60], start=45, end=135, fill=pale_gold, width=6)
        draw.arc([cx - 60, cy - 60, cx + 60, cy + 60], start=225, end=315, fill=pale_gold, width=6)

    elif motif == "argo_fleece":
        # Ram horns & Golden Fleece medallion
        draw.arc([cx - 60, cy - 60, cx, cy], start=130, end=360, fill=pale_gold, width=6)
        draw.arc([cx, cy - 60, cx + 60, cy], start=180, end=410, fill=pale_gold, width=6)
        # Star constellation of the Argo
        for sx, sy in [(-30, 40), (0, 30), (30, 45), (15, 60), (-15, 55)]:
            draw.ellipse([cx + sx - 4, cy + sy - 4, cx + sx + 4, cy + sy + 4], fill=pale_gold)
        draw.line([(cx - 30, cy + 40), (cx, cy + 30), (cx + 30, cy + 45)], fill=dark_gold, width=1)

    elif motif == "labyrinth":
        # Cretan Concentric Labyrinth Rings & Clew Thread
        for lr in [25, 45, 65, 85]:
            draw.arc([cx - lr, cy - lr, cx + lr, cy + lr], start=30, end=330, fill=gold, width=2)
        # Clew of thread
        draw.arc([cx - 15, cy - 15, cx + 15, cy + 15], start=0, end=360, fill=pale_gold, width=4)
        draw.line([(cx + 15, cy), (cx + 90, cy + 40)], fill=pale_gold, width=2)

    elif motif == "sphinx_staff":
        # Staff and Winged Mystery
        draw.line([(cx, cy - 85), (cx, cy + 85)], fill=gold, width=5)
        draw.ellipse([cx - 12, cy - 95, cx + 12, cy - 71], fill=pale_gold)
        # Sphinx wings
        draw.arc([cx - 85, cy - 50, cx + 5, cy + 40], start=190, end=340, fill=gold, width=4)
        draw.arc([cx - 5, cy - 50, cx + 85, cy + 40], start=200, end=350, fill=gold, width=4)

    elif motif == "loom":
        # Warp-weighted loom frame & weaving threads
        draw.line([(cx - 45, cy - 70), (cx - 45, cy + 65)], fill=gold, width=5)
        draw.line([(cx + 45, cy - 70), (cx + 45, cy + 65)], fill=gold, width=5)
        draw.line([(cx - 55, cy - 65), (cx + 55, cy - 65)], fill=pale_gold, width=6)
        # Vertical warp threads
        for tx in range(-35, 40, 10):
            draw.line([(cx + tx, cy - 65), (cx + tx, cy + 45)], fill=dark_gold, width=1)
            draw.ellipse([cx + tx - 3, cy + 45, cx + tx + 3, cy + 55], fill=pale_gold) # Loom weights

    elif motif == "swan_crown":
        # Swan Wings and Spartan Diadem
        draw.arc([cx - 80, cy - 30, cx + 10, cy + 60], start=180, end=350, fill=pale_gold, width=4)
        draw.arc([cx - 10, cy - 30, cx + 80, cy + 60], start=190, end=360, fill=pale_gold, width=4)
        # Diadem crown above
        draw.polygon([(cx - 35, cy - 50), (cx - 20, cy - 75), (cx, cy - 60), (cx + 20, cy - 75), (cx + 35, cy - 50)], outline=gold, fill=dark_gold)

    elif motif == "mask_scepter":
        # Funerary golden mask motif & Mycenaean spiral
        draw.ellipse([cx - 45, cy - 55, cx + 45, cy + 45], outline=gold, width=3)
        draw.arc([cx - 30, cy - 25, cx - 10, cy - 15], start=0, end=180, fill=gold, width=3)
        draw.arc([cx + 10, cy - 25, cx + 30, cy - 15], start=0, end=180, fill=gold, width=3)
        draw.line([(cx, cy - 20), (cx, cy + 5)], fill=gold, width=3)
        draw.arc([cx - 20, cy + 10, cx + 20, cy + 25], start=0, end=180, fill=pale_gold, width=3)
        # Scepter
        draw.line([(cx - 65, cy + 65), (cx + 65, cy - 65)], fill=pale_gold, width=3)

    elif motif == "greaves_shield":
        # Bronze armor & companion's shield
        draw.ellipse([cx - 50, cy - 50, cx + 50, cy + 50], outline=gold, width=4)
        draw.ellipse([cx - 25, cy - 25, cx + 25, cy + 25], outline=dark_gold, width=2)
        # Crossed hoplite spear & sword
        draw.line([(cx - 70, cy + 70), (cx + 70, cy - 70)], fill=pale_gold, width=3)
        draw.line([(cx + 60, cy + 60), (cx - 60, cy - 60)], fill=gold, width=3)

    elif motif == "tower_shield":
        # Giant 7-layered oxhide tower shield
        draw.rectangle([cx - 45, cy - 75, cx + 45, cy + 65], outline=gold, width=4)
        draw.arc([cx - 45, cy - 85, cx + 45, cy - 55], start=180, end=360, fill=gold, width=4)
        # Central bronze boss
        draw.ellipse([cx - 18, cy - 10, cx + 18, cy + 26], fill=pale_gold)
        # Reinforcement bands
        draw.line([(cx - 45, cy - 20), (cx + 45, cy - 20)], fill=dark_gold, width=2)
        draw.line([(cx - 45, cy + 30), (cx + 45, cy + 30)], fill=dark_gold, width=2)

    elif motif == "bow_apple":
        # Huntress bow and Golden Apple
        draw.arc([cx - 75, cy - 75, cx + 75, cy + 75], start=210, end=330, fill=gold, width=4)
        draw.line([(cx - 65, cy - 35), (cx + 65, cy - 35)], fill=dark_gold, width=2)
        # Golden apple in center
        draw.ellipse([cx - 20, cy + 10, cx + 20, cy + 50], fill=pale_gold)
        draw.arc([cx - 5, cy - 2, cx + 15, cy + 15], start=180, end=300, fill=gold, width=2)

    elif motif == "pegasus_wing":
        # Great Feathered Pegasus Wing & Golden Bridle
        for offset, w in [(0, 4), (12, 3), (24, 2)]:
            draw.arc([cx - 80 + offset, cy - 80, cx + 60, cy + 60], start=160, end=310, fill=pale_gold, width=w)
        # Golden bridle bit
        draw.ellipse([cx - 15, cy + 25, cx + 15, cy + 55], outline=gold, width=3)
        draw.line([(cx - 35, cy + 40), (cx + 35, cy + 40)], fill=pale_gold, width=3)

    elif motif == "lyre":
        # Classical 7-stringed golden lyre
        draw.arc([cx - 50, cy - 60, cx - 20, cy + 50], start=90, end=270, fill=gold, width=5)
        draw.arc([cx + 20, cy - 60, cx + 50, cy + 50], start=270, end=450, fill=gold, width=5)
        draw.line([(cx - 50, cy - 60), (cx + 50, cy - 60)], fill=pale_gold, width=6)
        draw.ellipse([cx - 30, cy + 20, cx + 30, cy + 65], fill=gold)
        # 7 Strings
        for sx in range(-18, 22, 6):
            draw.line([(cx + sx, cy - 58), (cx + sx, cy + 30)], fill=pale_gold, width=1)

    elif motif == "roman_eagle":
        # Roman Aquila Eagle & Gladius
        draw.line([(cx, cy - 80), (cx, cy + 70)], fill=gold, width=5)
        # Crossguard
        draw.line([(cx - 25, cy - 40), (cx + 25, cy - 40)], fill=pale_gold, width=6)
        draw.polygon([(cx, cy + 90), (cx - 10, cy + 65), (cx + 10, cy + 65)], fill=gold)
        # Outspread eagle wings
        draw.arc([cx - 85, cy - 80, cx, cy + 20], start=170, end=330, fill=gold, width=4)
        draw.arc([cx, cy - 80, cx + 85, cy + 20], start=210, end=370, fill=gold, width=4)

    elif motif == "dragon_sword":
        # Norse dragon Fafnir & Reforged Gram
        draw.line([(cx, cy - 85), (cx, cy + 75)], fill=pale_gold, width=5)
        draw.polygon([(cx, cy - 98), (cx - 8, cy - 80), (cx + 8, cy - 80)], fill=pale_gold)
        draw.line([(cx - 30, cy + 40), (cx + 30, cy + 40)], fill=gold, width=6)
        # Dragon coiled around blade
        draw.arc([cx - 60, cy - 40, cx + 60, cy + 40], start=40, end=220, fill=gold, width=4)
        draw.arc([cx - 50, cy - 10, cx + 50, cy + 70], start=220, end=400, fill=gold, width=4)

    elif motif == "celtic_spear":
        # Gáe Bulg Barbed Spear & Celtic Knot Ring
        draw.line([(cx, cy - 90), (cx, cy + 80)], fill=gold, width=4)
        draw.polygon([(cx, cy - 105), (cx - 12, cy - 75), (cx + 12, cy - 75)], fill=pale_gold)
        # Barbs
        for by in [-60, -45, -30]:
            draw.line([(cx - 15, cy + by + 8), (cx, cy + by)], fill=pale_gold, width=3)
            draw.line([(cx + 15, cy + by + 8), (cx, cy + by)], fill=pale_gold, width=3)
        # Celtic concentric torc
        draw.arc([cx - 45, cy - 10, cx + 45, cy + 80], start=30, end=330, fill=gold, width=4)

    elif motif == "salmon_spear":
        # Salmon of Wisdom & Hazelnut Branch
        draw.arc([cx - 65, cy - 45, cx + 65, cy + 45], start=20, end=190, fill=pale_gold, width=5)
        draw.arc([cx - 65, cy - 30, cx + 65, cy + 60], start=200, end=370, fill=gold, width=4)
        # Tail fin
        draw.polygon([(cx + 55, cy + 20), (cx + 80, cy), (cx + 75, cy + 40)], fill=pale_gold)
        # Central spear
        draw.line([(cx, cy - 80), (cx, cy + 80)], fill=gold, width=3)

    elif motif == "gandiva_bow":
        # Great Gandiva Bow with celestial jewels
        draw.arc([cx - 85, cy - 95, cx + 85, cy + 95], start=220, end=320, fill=gold, width=6)
        draw.line([(cx - 75, cy - 40), (cx + 75, cy - 40)], fill=pale_gold, width=2)
        # Sudarshana Chakra wheel below
        for cr in [20, 35]:
            draw.ellipse([cx - cr, cy + 25 - cr, cx + cr, cy + 25 + cr], outline=gold, width=2)
        for sp in range(8):
            sang = sp * (2 * math.pi / 8)
            draw.line([
                (cx + 15 * math.cos(sang), cy + 25 + 15 * math.sin(sang)),
                (cx + 35 * math.cos(sang), cy + 25 + 35 * math.sin(sang))
            ], fill=pale_gold, width=2)


def generate_hero_plate(hero):
    img = Image.new("RGBA", (W, H), hero["bg_tone"] + (255,))
    draw = ImageDraw.Draw(img)

    accent = hero["accent"]
    gold = (212, 175, 55)

    # 1. Subtle radial gradient atmosphere
    rad_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rad_draw = ImageDraw.Draw(rad_overlay)
    cx, cy = W // 2, 440
    for r in range(350, 50, -10):
        alpha = int(45 * (1.0 - r / 350.0))
        rad_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=accent + (alpha,))
    img = Image.alpha_composite(img, rad_overlay)
    draw = ImageDraw.Draw(img)

    # 2. Classical borders
    draw_greek_key_border(draw, 32, 32, W - 32, H - 32, gold)
    draw_ornament_corners(draw, 32, 32, W - 32, H - 32, gold)

    # 3. Archival Header Plate
    draw.line([(64, 90), (W - 64, 90)], fill=gold, width=1)
    draw.line([(64, 94), (W - 64, 94)], fill=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)

    # Tradition tag top
    tag_text = f"MYTHOS ATLAS · {hero['pantheon']} HEROIC TRADITION"
    font_sm = serif_font("regular", 16)
    font_lg = serif_font("bold", 46)
    font_sub = serif_font("italic", 18)

    draw.text((W // 2, 65), tag_text, font=font_sm, fill=(200, 180, 140), anchor="mm")

    # 4. Center Heroic Medallion
    draw_heroic_motif(draw, cx, cy, 175, hero["motif"], accent)

    # 5. Bottom Archival Nameplate
    draw.line([(80, 750), (W - 80, 750)], fill=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)
    draw.line([(80, 754), (W - 80, 754)], fill=gold, width=2)
    draw.line([(80, 758), (W - 80, 758)], fill=(gold[0]//2, gold[1]//2, gold[2]//2), width=1)

    draw.text((W // 2, 810), hero["name"], font=font_lg, fill=(245, 235, 220), anchor="mm")
    draw.text((W // 2, 860), hero["epithet"], font=font_sub, fill=(212, 175, 55), anchor="mm")

    # Footer Latin / Greek archival stamp
    draw.text((W // 2, 940), "CODEX HEROUM · FOLIO ANNUUM", font=font_sm, fill=(130, 120, 100), anchor="mm")
    draw.line([(W // 2 - 60, 965), (W // 2 + 60, 965)], fill=gold, width=1)

    # Save PNG
    png_path = os.path.join(OUTPUT_DIR, f"{hero['id']}.png")
    img.convert("RGB").save(png_path, "PNG")

    # Save WebP using cwebp
    webp_path = os.path.join(OUTPUT_DIR, f"{hero['id']}.webp")
    write_webp(png_path, webp_path)
    print(f"Generated: {hero['id']} -> {png_path} & {webp_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate archival hero plates.")
    parser.add_argument(
        "--only",
        help="Comma-separated hero ids to (re)generate; default is every plate.",
    )
    args = parser.parse_args()
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    wanted = set(args.only.split(",")) if args.only else None
    selected = [h for h in HEROES if wanted is None or h["id"] in wanted]
    for h in selected:
        generate_hero_plate(h)

    print(f"{len(selected)} hero plates generated in {OUTPUT_DIR}")
