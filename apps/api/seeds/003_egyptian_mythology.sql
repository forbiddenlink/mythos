-- Egyptian Mythology Comprehensive Dataset
-- This seed provides the Egyptian pantheon with major deities, relationships, and key stories

-- Insert Egyptian Pantheon (skip if already exists)
INSERT INTO pantheons (name, slug, culture, region, time_period_start, time_period_end, description, citation_sources) VALUES
(
  'Egyptian Pantheon',
  'egyptian',
  'Ancient Egyptian',
  'Nile River Valley',
  -3100,
  640,
  'The Egyptian pantheon encompasses the gods and goddesses of ancient Egypt, featuring creation deities, solar worship, the afterlife, and the eternal struggle between order (Ma''at) and chaos (Isfet). The pantheon evolved over three millennia with regional variations.',
  '{"sources": [{"title": "Pyramid Texts", "date": "~2400-2300 BCE", "type": "primary"}, {"title": "Coffin Texts", "date": "~2100-1600 BCE", "type": "primary"}, {"title": "Book of the Dead", "date": "~1550 BCE onwards", "type": "primary"}, {"title": "The Contest of Horus and Seth", "date": "~1160 BCE", "type": "primary"}]}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Store pantheon ID and deity IDs for references
DO $$
DECLARE
  egyptian_pantheon_id UUID;
  ra_id UUID;
  osiris_id UUID;
  isis_id UUID;
  horus_id UUID;
  set_id UUID;
  nephthys_id UUID;
  anubis_id UUID;
  thoth_id UUID;
  bastet_id UUID;
  sekhmet_id UUID;
  hathor_id UUID;
  ptah_id UUID;
  maat_id UUID;
  sobek_id UUID;
  
  -- Stories
  creation_heliopolis_id UUID;
  osiris_myth_id UUID;
  ra_journey_id UUID;
  contendings_id UUID;
  weighing_heart_id UUID;
BEGIN
  -- Get pantheon ID
  SELECT id INTO egyptian_pantheon_id FROM pantheons WHERE slug = 'egyptian';

  -- ==================== MAJOR DEITIES ====================
  
  -- RA - The Sun God
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Ra', 'ra', ARRAY['Re', 'Ra-Horakhty', 'Atum-Ra', 'Amun-Ra'], 'male',
   ARRAY['sun', 'creation', 'kingship', 'order', 'light'],
   ARRAY['sun disk', 'falcon', 'solar barque', 'cobra', 'scarab beetle'],
   'The supreme solar deity and creator god. Ra travels across the sky each day in his solar barque and through the underworld each night, battling the serpent Apophis. He is the divine father of pharaohs and the embodiment of cosmic order.',
   'Ra emerged from the primordial waters of Nun at the dawn of creation, creating himself. He then created Shu (air) and Tefnut (moisture), who gave birth to Geb (earth) and Nut (sky), establishing the cosmos. He ruled as the first pharaoh of Egypt.',
   1,
   '{"sources": [{"title": "Pyramid Texts", "spells": "200-219"}, {"title": "Book of the Dead", "spells": "15, 80"}, {"title": "Litany of Ra"}]}'::jsonb)
  RETURNING id INTO ra_id;

  -- OSIRIS - Lord of the Dead
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Osiris', 'osiris', ARRAY['Usir', 'Lord of the Perfect Black', 'He Who is Permanently Benign and Youthful'], 'male',
   ARRAY['afterlife', 'resurrection', 'fertility', 'agriculture', 'judgment'],
   ARRAY['crook and flail', 'atef crown', 'green or black skin', 'mummy wrappings', 'djed pillar'],
   'God of the afterlife, resurrection, and fertility. First pharaoh and lawgiver who taught agriculture to humanity. Murdered by his brother Set and resurrected by Isis, becoming ruler and judge of the dead. Every deceased pharaoh was identified with Osiris.',
   'Osiris was the eldest son of the earth god Geb and sky goddess Nut. He married his sister Isis and ruled Egypt with wisdom and justice. His murder and resurrection by Isis became the central myth of Egyptian religion.',
   2,
   '{"sources": [{"title": "Pyramid Texts", "spells": "366-375"}, {"title": "The Memphite Theology"}, {"title": "Plutarch - De Iside et Osiride"}]}'::jsonb)
  RETURNING id INTO osiris_id;

  -- ISIS - Goddess of Magic
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Isis', 'isis', ARRAY['Aset', 'Throne', 'Lady of Ten Thousand Names'], 'female',
   ARRAY['magic', 'motherhood', 'healing', 'protection', 'wisdom'],
   ARRAY['throne', 'tyet knot', 'wings', 'vulture headdress', 'sistrum'],
   'The most powerful goddess in the Egyptian pantheon, wife of Osiris and mother of Horus. Goddess of magic, healing, and protection. She resurrected Osiris and protected Horus from Set. Her worship spread throughout the Mediterranean world.',
   'Isis learned Ra''s secret name through cunning, gaining immense magical power. When Set murdered Osiris, she searched all of Egypt to recover his body parts. Through her magic, she briefly revived him to conceive Horus, then raised him in secret.',
   3,
   '{"sources": [{"title": "Pyramid Texts", "spells": "366-375"}, {"title": "Coffin Texts"}, {"title": "Book of the Dead", "spell": "156"}]}'::jsonb)
  RETURNING id INTO isis_id;

  -- HORUS - The Avenger
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Horus', 'horus', ARRAY['Heru', 'Horus the Elder', 'Horus the Younger', 'Haroeris', 'Harpocrates'], 'male',
   ARRAY['kingship', 'sky', 'war', 'protection', 'hunting'],
   ARRAY['falcon', 'Eye of Horus (Wedjat)', 'pschent crown', 'winged sun disk'],
   'Sky god whose eyes are the sun and moon. Son of Osiris and Isis, he avenged his father by defeating Set in battle, becoming the rightful king. Every living pharaoh was considered the earthly embodiment of Horus.',
   'Conceived after Osiris''s death, Horus was raised in secret by Isis in the papyrus marshes. When he came of age, he challenged Set for the throne. After an 80-year conflict including many trials and battles, the gods declared Horus the rightful king.',
   4,
   '{"sources": [{"title": "Pyramid Texts", "spells": "300-320"}, {"title": "The Contendings of Horus and Seth"}, {"title": "Book of the Dead", "spell": "112"}]}'::jsonb)
  RETURNING id INTO horus_id;

  -- SET - God of Chaos
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Set', 'set', ARRAY['Seth', 'Sutekh', 'Setesh', 'Lord of the Red Land'], 'male',
   ARRAY['chaos', 'desert', 'storms', 'foreigners', 'violence', 'strength'],
   ARRAY['was scepter', 'Set animal', 'red color'],
   'God of chaos, storms, and the desert. Brother and murderer of Osiris, enemy of Horus. Represents the untamed forces of nature and foreign lands. Despite being a villain in myth, he also protects Ra''s solar barque from Apophis each night.',
   'Son of Geb and Nut, Set was born violently by tearing through Nut''s side. Jealous of his brother Osiris''s power, he murdered him and scattered his body. He fought Horus for the throne but was ultimately defeated, though not destroyed.',
   5,
   '{"sources": [{"title": "Pyramid Texts", "spells": "205-220"}, {"title": "The Contendings of Horus and Seth"}, {"title": "Book of Overthrowing Apophis"}]}'::jsonb)
  RETURNING id INTO set_id;

  -- NEPHTHYS - Lady of the House
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Nephthys', 'nephthys', ARRAY['Nebet-Het', 'Lady of the Temple Enclosure'], 'female',
   ARRAY['mourning', 'death', 'protection', 'night', 'childbirth'],
   ARRAY['house on head', 'wings', 'kite bird'],
   'Goddess of mourning and protector of the dead. Sister-wife of Set but loyal to Isis. She aided Isis in gathering Osiris''s body and mourned him. Associated with the end of life and nighttime.',
   6,
   '{"sources": [{"title": "Pyramid Texts", "spells": "366-375"}, {"title": "Book of the Dead", "spell": "17"}]}'::jsonb)
  RETURNING id INTO nephthys_id;

  -- ANUBIS - Guardian of the Dead
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Anubis', 'anubis', ARRAY['Anpu', 'Inpu', 'Anup'], 'male',
   ARRAY['mummification', 'death', 'cemeteries', 'embalming', 'judgment'],
   ARRAY['jackal', 'black color', 'flail', 'crook', 'embalming tools'],
   'God of mummification and the afterlife. Guardian of tombs and guide of souls to judgment. He oversees the weighing of the heart ceremony. Depicted as a jackal or man with a jackal''s head, his black color represents the fertile Nile silt and rebirth.',
   'Son of Osiris and Nephthys (or Osiris and Isis in some versions). When Osiris was murdered, Anubis embalmed him, creating the first mummy and establishing the practice of mummification.',
   7,
   '{"sources": [{"title": "Pyramid Texts", "spells": "213-219"}, {"title": "Book of the Dead", "spell": "125"}, {"title": "Coffin Texts"}]}'::jsonb)
  RETURNING id INTO anubis_id;

  -- THOTH - The Wise
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Thoth', 'thoth', ARRAY['Djehuty', 'Tehuti', 'Three Times Great', 'Hermes Trismegistus'], 'male',
   ARRAY['wisdom', 'writing', 'magic', 'moon', 'time', 'knowledge', 'judgment'],
   ARRAY['ibis', 'baboon', 'writing palette', 'moon disk', 'papyrus scroll'],
   'God of wisdom, writing, and magic. Inventor of hieroglyphs and scribe of the gods. He records the results of the weighing of hearts ceremony. Associated with the moon, mathematics, and science. Mediator between good and evil.',
   'Self-created god who emerged from the lips of Ra. He helped Isis resurrect Osiris and mediated disputes between Horus and Set. He is credited with creating the 365-day calendar.',
   8,
   '{"sources": [{"title": "Pyramid Texts", "spells": "260-265"}, {"title": "Book of the Dead", "spell": "182"}, {"title": "Hermetic Corpus"}]}'::jsonb)
  RETURNING id INTO thoth_id;

  -- BASTET - Cat Goddess
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Bastet', 'bastet', ARRAY['Bast', 'Ubasti', 'Lady of Dread'], 'female',
   ARRAY['protection', 'cats', 'joy', 'dance', 'music', 'fertility'],
   ARRAY['cat', 'lioness', 'sistrum', 'aegis'],
   'Goddess of home, fertility, and protection. Originally a fierce lioness warrior goddess, she later became gentler as a cat goddess. Protector of the home, women, children, and cats. Her festivals were among the most joyous.',
   9,
   '{"sources": [{"title": "Pyramid Texts", "spells": "378-390"}, {"title": "Festival Calendar of Bubastis"}]}'::jsonb)
  RETURNING id INTO bastet_id;

  -- SEKHMET - The Powerful One
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Sekhmet', 'sekhmet', ARRAY['Sakhmet', 'Lady of Slaughter', 'The Scarlet Lady'], 'female',
   ARRAY['war', 'plague', 'healing', 'vengeance', 'fire'],
   ARRAY['lioness', 'red color', 'sun disk', 'uraeus'],
   'Fierce goddess of war, plagues, and healing. The destructive aspect of the sun. Ra sent her to punish humanity, but she became so bloodthirsty the gods had to trick her with beer dyed red to stop her rampage.',
   10,
   '{"sources": [{"title": "Book of the Heavenly Cow"}, {"title": "Pyramid Texts", "spells": "250-260"}]}'::jsonb)
  RETURNING id INTO sekhmet_id;

  -- HATHOR - The Golden One
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Hathor', 'hathor', ARRAY['Het-Heru', 'Lady of Stars'], 'female',
   ARRAY['love', 'beauty', 'music', 'motherhood', 'joy', 'mining'],
   ARRAY['cow', 'cow horns and sun disk', 'sistrum', 'mirror', 'menat necklace'],
   'Goddess of love, beauty, music, and motherhood. The "Golden One" who embodies the feminine ideal. Protector of women and associated with the sky. Her anger can transform her into Sekhmet.',
   11,
   '{"sources": [{"title": "Pyramid Texts", "spells": "300-320"}, {"title": "Dendera Temple texts"}]}'::jsonb)
  RETURNING id INTO hathor_id;

  -- PTAH - The Creator
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Ptah', 'ptah', ARRAY['Ptah-Sokar-Osiris', 'Ptah-Nun'], 'male',
   ARRAY['creation', 'crafts', 'architecture', 'metalworking', 'artisans'],
   ARRAY['djed pillar', 'was scepter', 'shroud', 'tight cap'],
   'Ancient creator god who thought the world into existence through his heart and tongue. Patron of craftsmen, builders, and artisans. Worshipped primarily in Memphis. Husband of Sekhmet.',
   12,
   '{"sources": [{"title": "Memphite Theology"}, {"title": "Pyramid Texts", "spells": "450-470"}]}'::jsonb)
  RETURNING id INTO ptah_id;

  -- MAAT - Truth and Justice
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Ma''at', 'maat', ARRAY['Mayet'], 'female',
   ARRAY['truth', 'justice', 'harmony', 'order', 'balance'],
   ARRAY['ostrich feather', 'scales', 'ankh', 'was scepter'],
   'Goddess embodying truth, justice, and cosmic order. Her feather is weighed against the hearts of the dead in judgment. She represents the fundamental order of the universe that must be maintained against chaos.',
   13,
   '{"sources": [{"title": "Pyramid Texts", "spells": "140-150"}, {"title": "Book of the Dead", "spell": "125"}]}'::jsonb)
  RETURNING id INTO maat_id;

  -- SOBEK - Crocodile God
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id, 'Sobek', 'sobek', ARRAY['Sebek', 'Suchos'], 'male',
   ARRAY['Nile', 'crocodiles', 'fertility', 'military prowess', 'pharaonic power'],
   ARRAY['crocodile', 'was scepter', 'ankh'],
   'Crocodile god of the Nile and its fertility. Protector against the dangers of the Nile and symbol of pharaonic power and military prowess. Worshipped especially in the Faiyum region.',
   14,
   '{"sources": [{"title": "Pyramid Texts", "spells": "317-320"}, {"title": "Kom Ombo Temple texts"}]}'::jsonb)
  RETURNING id INTO sobek_id;

  -- ==================== RELATIONSHIPS ====================

  -- The Ennead (Family of Ra/Atum)
  INSERT INTO deity_relationships (from_deity_id, to_deity_id, relationship_type, confidence_level, description) VALUES
  -- Siblings (children of Geb and Nut)
  (LEAST(osiris_id, isis_id), GREATEST(osiris_id, isis_id), 'sibling_of', 'high', 'Osiris and Isis are siblings, children of Geb and Nut'),
  (LEAST(osiris_id, set_id), GREATEST(osiris_id, set_id), 'sibling_of', 'high', 'Osiris and Set are brothers'),
  (LEAST(osiris_id, nephthys_id), GREATEST(osiris_id, nephthys_id), 'sibling_of', 'high', 'Osiris and Nephthys are siblings'),
  (LEAST(set_id, nephthys_id), GREATEST(set_id, nephthys_id), 'sibling_of', 'high', 'Set and Nephthys are siblings'),
  (LEAST(isis_id, nephthys_id), GREATEST(isis_id, nephthys_id), 'sibling_of', 'high', 'Isis and Nephthys are sisters'),
  
  -- Marriages
  (LEAST(osiris_id, isis_id), GREATEST(osiris_id, isis_id), 'spouse_of', 'high', 'Osiris and Isis were husband and wife, ruling Egypt together'),
  (LEAST(set_id, nephthys_id), GREATEST(set_id, nephthys_id), 'spouse_of', 'high', 'Set and Nephthys were married'),
  (LEAST(ptah_id, sekhmet_id), GREATEST(ptah_id, sekhmet_id), 'spouse_of', 'high', 'Ptah and Sekhmet are husband and wife'),
  
  -- Parent-child
  (osiris_id, horus_id, 'parent_of', 'high', 'Osiris is the father of Horus'),
  (isis_id, horus_id, 'parent_of', 'high', 'Isis is the mother of Horus'),
  (osiris_id, anubis_id, 'parent_of', 'medium', 'Osiris is father of Anubis (with Nephthys)'),
  (nephthys_id, anubis_id, 'parent_of', 'medium', 'Nephthys is mother of Anubis'),
  
  -- Connections to Ra
  (ra_id, osiris_id, 'created_by', 'high', 'Ra as creator god brought forth the Ennead'),
  (ra_id, hathor_id, 'parent_of', 'medium', 'Hathor is sometimes considered daughter of Ra'),
  (ra_id, sekhmet_id, 'created_by', 'high', 'Sekhmet was created by Ra as an instrument of vengeance'),
  (ra_id, maat_id, 'created_by', 'high', 'Ma''at represents the order established by Ra'),
  
  -- Aspects and connections
  (bastet_id, sekhmet_id, 'aspect_of', 'medium', 'Bastet and Sekhmet represent gentler and fiercer aspects of the same feline goddess'),
  (hathor_id, sekhmet_id, 'aspect_of', 'medium', 'Hathor can transform into Sekhmet when enraged'),
  
  -- Enmities
  (LEAST(horus_id, set_id), GREATEST(horus_id, set_id), 'enemy_of', 'high', 'Horus fought Set for 80 years to claim his father''s throne'),
  (LEAST(osiris_id, set_id), GREATEST(osiris_id, set_id), 'enemy_of', 'high', 'Set murdered his brother Osiris out of jealousy'),
  
  -- Alliances
  (LEAST(isis_id, nephthys_id), GREATEST(isis_id, nephthys_id), 'ally_of', 'high', 'Isis and Nephthys worked together to resurrect and mourn Osiris'),
  (LEAST(isis_id, thoth_id), GREATEST(isis_id, thoth_id), 'ally_of', 'high', 'Thoth aided Isis with his magic and wisdom'),
  (LEAST(horus_id, thoth_id), GREATEST(horus_id, thoth_id), 'ally_of', 'high', 'Thoth healed Horus''s eye after Set damaged it');

  -- ==================== STORIES ====================

  -- Creation Myth (Heliopolitan)
  INSERT INTO stories (id, pantheon_id, title, slug, summary, category, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id,
   'The Heliopolitan Creation Myth',
   'creation-heliopolis',
   'In the beginning was the primordial waters of Nun, dark and chaotic. From these waters arose the primeval mound, and upon it stood Atum (later identified with Ra), the self-created god. Atum created Shu (air) and Tefnut (moisture) through his own essence. Shu and Tefnut gave birth to Geb (earth) and Nut (sky), who were initially embraced. Shu separated them, creating the space for life. Geb and Nut produced four children: Osiris, Isis, Set, and Nephthys, forming the Ennead (nine gods) of Heliopolis.',
   'creation',
   '{"sources": [{"title": "Pyramid Texts", "spells": "600-602"}, {"title": "Coffin Texts", "spell": "80"}, {"title": "Book of the Dead", "spell": "17"}]}'::jsonb)
  RETURNING id INTO creation_heliopolis_id;

  -- The Osiris Myth
  INSERT INTO stories (id, pantheon_id, title, slug, summary, category, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id,
   'The Murder and Resurrection of Osiris',
   'osiris-myth',
   'Osiris ruled Egypt as its first pharaoh, teaching agriculture and civilization. His brother Set, consumed by jealousy, crafted a beautiful chest exactly fitting Osiris''s measurements. At a feast, Set promised the chest to whoever fit inside perfectly. When Osiris lay in it, Set sealed it shut and threw it into the Nile. The chest drifted to Byblos, where it became encased in a tree. Isis searched desperately for her husband, eventually retrieving his body. But Set discovered it, cut Osiris into 14 pieces, and scattered them across Egypt. Isis and Nephthys collected every piece (except the phallus, devoured by fish). Through Isis''s magic and Anubis''s first embalming, Osiris was resurrected enough to conceive Horus before becoming lord of the dead.',
   'tragedy',
   '{"sources": [{"title": "Pyramid Texts", "spells": "366-375"}, {"title": "Plutarch - De Iside et Osiride"}, {"title": "Coffin Texts"}]}'::jsonb)
  RETURNING id INTO osiris_myth_id;

  -- Ra's Daily Journey
  INSERT INTO stories (id, pantheon_id, title, slug, summary, category, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id,
   'The Solar Barque - Ra''s Daily Journey',
   'ra-journey',
   'Each day, Ra travels across the sky in his solar barque (boat), bringing light and warmth to the world. The morning boat is called Mandjet ("Becoming Strong") and the evening boat is called Mesektet ("Becoming Weak"). He is accompanied by other gods including Thoth, Ma''at, and Set. As night falls, Ra enters the underworld (Duat), traveling through twelve hours of darkness. During this perilous journey, he faces his greatest enemy: Apophis (Apep), the chaos serpent who tries to swallow Ra and prevent sunrise. Set, despite his negative role elsewhere, protects Ra by spearing Apophis. Each dawn represents Ra''s victory over chaos and the renewal of creation.',
   'cosmogony',
   '{"sources": [{"title": "Book of the Dead", "spell": "15"}, {"title": "Amduat"}, {"title": "Book of Gates"}, {"title": "Litany of Ra"}]}'::jsonb)
  RETURNING id INTO ra_journey_id;

  -- Contendings of Horus and Set
  INSERT INTO stories (id, pantheon_id, title, slug, summary, category, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id,
   'The Contendings of Horus and Set',
   'contendings',
   'After Osiris''s death, his son Horus challenged Set for the throne of Egypt, leading to an 80-year conflict. The gods convened a tribunal to decide the rightful king. The conflict involved many contests: transforming into hippopotami and submerging for months, racing in stone boats (Horus painted his wooden boat to look like stone), and various trials of strength and wit. Set damaged Horus''s eye, while Horus castrated Set. Eventually, Osiris sent a threatening letter from the underworld, and the gods decided Horus was the rightful king. Set was either exiled to the desert or made god of storms, forever on the solar barque defending Ra. Horus''s damaged eye was healed by Thoth and became the Wedjat, a powerful symbol of protection.',
   'war',
   '{"sources": [{"title": "The Contendings of Horus and Seth (Papyrus Chester Beatty I)", "date": "~1160 BCE"}, {"title": "Pyramid Texts", "spells": "350-360"}]}'::jsonb)
  RETURNING id INTO contendings_id;

  -- Weighing of the Heart
  INSERT INTO stories (id, pantheon_id, title, slug, summary, category, citation_sources) VALUES
  (gen_random_uuid(), egyptian_pantheon_id,
   'The Weighing of the Heart Ceremony',
   'weighing-heart',
   'When a person dies, they journey through the dangerous underworld to the Hall of Two Truths. There, before Osiris and 42 divine judges, their heart is weighed on scales by Anubis against the feather of Ma''at (truth and justice). Thoth records the results. The deceased must also recite the "Negative Confession," declaring they have not committed various sins. If the heart is lighter than or equal to the feather, the soul is deemed worthy and proceeds to Aaru (paradise). If the heart is heavy with sin, it is devoured by Ammit, a demon that is part crocodile, part lion, and part hippopotamus. The devoured soul ceases to exist, a fate called the "second death," worse than any punishment.',
   'underworld',
   '{"sources": [{"title": "Book of the Dead", "spell": "125"}, {"title": "Papyrus of Ani"}, {"title": "Papyrus of Hunefer"}]}'::jsonb)
  RETURNING id INTO weighing_heart_id;

  -- ==================== EVENTS (For Timeline) ====================
  
  -- Creation events
  INSERT INTO events (story_id, title, description, event_type, sequence_order, mythological_era) VALUES
  (creation_heliopolis_id, 'The Primordial Waters', 'The universe begins as Nun, the dark primordial waters', 'origin', 1, 'Before Time'),
  (creation_heliopolis_id, 'Emergence of Atum', 'Atum self-creates and rises from Nun on the primeval mound', 'origin', 2, 'First Time (Zep Tepi)'),
  (creation_heliopolis_id, 'Creation of Shu and Tefnut', 'Atum creates air and moisture through his own essence', 'creation', 3, 'First Time'),
  (creation_heliopolis_id, 'Birth of Geb and Nut', 'The earth and sky are born', 'birth', 4, 'First Time'),
  (creation_heliopolis_id, 'Separation of Heaven and Earth', 'Shu separates Geb and Nut, creating space for life', 'transformation', 5, 'First Time'),
  (creation_heliopolis_id, 'The Ennead Complete', 'Birth of Osiris, Isis, Set, and Nephthys', 'birth', 6, 'First Time');

  -- Osiris Myth events
  INSERT INTO events (story_id, title, description, event_type, sequence_order, mythological_era) VALUES
  (osiris_myth_id, 'Osiris as First Pharaoh', 'Osiris rules Egypt and teaches civilization', 'reign', 1, 'Golden Age'),
  (osiris_myth_id, 'Set''s Jealousy', 'Set plots against his brother', 'conspiracy', 2, 'Golden Age'),
  (osiris_myth_id, 'The Trap', 'Set tricks Osiris into the coffin', 'betrayal', 3, 'Golden Age'),
  (osiris_myth_id, 'Murder of Osiris', 'Set seals the coffin and casts it into the Nile', 'tragedy', 4, 'End of Golden Age'),
  (osiris_myth_id, 'Isis''s Search', 'Isis searches Egypt for Osiris''s body', 'quest', 5, 'Age of Chaos'),
  (osiris_myth_id, 'Recovery of the Body', 'Isis finds Osiris in Byblos', 'discovery', 6, 'Age of Chaos'),
  (osiris_myth_id, 'Dismemberment', 'Set finds and dismembers Osiris''s body', 'tragedy', 7, 'Age of Chaos'),
  (osiris_myth_id, 'Gathering the Pieces', 'Isis and Nephthys collect Osiris''s pieces', 'quest', 8, 'Age of Chaos'),
  (osiris_myth_id, 'First Mummification', 'Anubis embalms Osiris, creating the first mummy', 'ritual', 9, 'Age of Chaos'),
  (osiris_myth_id, 'Resurrection and Conception', 'Isis revives Osiris briefly to conceive Horus', 'miracle', 10, 'Age of Chaos'),
  (osiris_myth_id, 'Osiris as Lord of the Dead', 'Osiris descends to rule the underworld', 'transformation', 11, 'Age of Chaos');

  -- Contendings events
  INSERT INTO events (story_id, title, description, event_type, sequence_order, mythological_era) VALUES
  (contendings_id, 'Birth of Horus', 'Horus is born in secret in the marshes', 'birth', 1, 'Age of Restoration'),
  (contendings_id, 'Horus''s Claim', 'Horus comes of age and claims his father''s throne', 'challenge', 2, 'Age of Restoration'),
  (contendings_id, 'The Divine Tribunal', 'The gods convene to judge between Horus and Set', 'trial', 3, 'Age of Restoration'),
  (contendings_id, 'The Contests Begin', 'Horus and Set compete in various trials', 'conflict', 4, 'Age of Restoration'),
  (contendings_id, 'The Hippopotamus Contest', 'Both transform and submerge in the Nile', 'trial', 5, 'Age of Restoration'),
  (contendings_id, 'Loss of Horus''s Eye', 'Set damages Horus''s eye in battle', 'tragedy', 6, 'Age of Restoration'),
  (contendings_id, 'The Stone Boat Race', 'Horus tricks Set in a boat race', 'triumph', 7, 'Age of Restoration'),
  (contendings_id, 'Osiris''s Intervention', 'Osiris sends a threatening letter from the underworld', 'intervention', 8, 'Age of Restoration'),
  (contendings_id, 'Judgment for Horus', 'The gods declare Horus the rightful king', 'triumph', 9, 'Age of Restoration'),
  (contendings_id, 'Restoration of the Eye', 'Thoth heals Horus''s eye, creating the Wedjat', 'healing', 10, 'Age of Restoration');

  -- ==================== LOCATIONS ====================
  
  INSERT INTO locations (name, location_type, pantheon_id, description, latitude, longitude) VALUES
  ('Heliopolis', 'temple', egyptian_pantheon_id, 'Ancient center of sun worship and creation theology, primary cult center of Ra-Atum', 30.1281, 31.3091),
  ('Abydos', 'sacred_site', egyptian_pantheon_id, 'Most important cult center of Osiris, believed to be his burial place', 26.1841, 31.9192),
  ('Thebes (Karnak)', 'temple', egyptian_pantheon_id, 'Vast temple complex dedicated to Amun-Ra, largest religious building ever constructed', 25.7188, 32.6573),
  ('Memphis', 'city', egyptian_pantheon_id, 'Ancient capital, cult center of Ptah, the creator god', 29.8467, 31.2547),
  ('Bubastis', 'temple', egyptian_pantheon_id, 'Center of Bastet worship, famous for its joyous festivals', 30.5769, 31.5084),
  ('Elephantine Island', 'sacred_site', egyptian_pantheon_id, 'Cult center dedicated to Khnum, believed to be source of Nile floods', 24.0889, 32.8900),
  ('Philae', 'temple', egyptian_pantheon_id, 'Island temple complex dedicated to Isis, last bastion of ancient religion', 24.0233, 32.8844),
  ('Dendera', 'temple', egyptian_pantheon_id, 'Temple complex dedicated to Hathor, known for astronomical ceiling', 26.1417, 32.6703),
  ('Duat', 'underworld', egyptian_pantheon_id, 'The Egyptian underworld, through which Ra travels each night and where the dead are judged', NULL, NULL),
  ('Aaru', 'mythical_realm', egyptian_pantheon_id, 'The Field of Reeds, Egyptian paradise where the blessed dead reside', NULL, NULL),
  ('Giza', 'sacred_site', egyptian_pantheon_id, 'Site of the Great Pyramids and Sphinx, monuments to the pharaohs and their divine connection', 29.9792, 31.1342);

END $$;
