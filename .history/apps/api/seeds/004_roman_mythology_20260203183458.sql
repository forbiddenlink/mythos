-- Roman Mythology Comprehensive Dataset
-- This seed provides the Roman pantheon with major deities, relationships, and key stories

-- Insert Roman Pantheon (skip if already exists)
INSERT INTO pantheons (name, slug, culture, region, time_period_start, time_period_end, description, citation_sources) VALUES
(
  'Roman Pantheon',
  'roman',
  'Ancient Roman',
  'Italian Peninsula and Mediterranean',
  -753,
  476,
  'The Roman pantheon adapted and expanded upon Greek mythology, creating a rich religious tradition that emphasized duty, piety, and the divine favor of the state. The Romans identified their gods with Greek counterparts while maintaining distinct characteristics and rituals.',
  '{"sources": [{"title": "Metamorphoses", "author": "Ovid", "date": "8 CE", "type": "primary"}, {"title": "Aeneid", "author": "Virgil", "date": "~19 BCE", "type": "primary"}, {"title": "Fasti", "author": "Ovid", "date": "~8 CE", "type": "primary"}]}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Store pantheon ID and deity IDs for references
DO $$
DECLARE
  roman_pantheon_id UUID;
  jupiter_id UUID;
  juno_id UUID;
  neptune_id UUID;
  pluto_id UUID;
  mars_id UUID;
  venus_id UUID;
  minerva_id UUID;
  apollo_id UUID;
  diana_id UUID;
  mercury_id UUID;
  bacchus_id UUID;
  vulcan_id UUID;
  ceres_id UUID;
  vesta_id UUID;
  janus_id UUID;
  
  -- Stories
  aeneas_id UUID;
  romulus_id UUID;
  rape_sabines_id UUID;
BEGIN
  -- Get pantheon ID
  SELECT id INTO roman_pantheon_id FROM pantheons WHERE slug = 'roman';

  -- ==================== MAJOR DEITIES ====================
  
  -- JUPITER - King of Gods
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Jupiter', 'jupiter', ARRAY['Jove', 'Iuppiter'], 'male', ARRAY['sky', 'thunder', 'lightning', 'kingship', 'law'], ARRAY['thunderbolt', 'eagle', 'oak tree', 'scepter'], 'King of the gods and god of sky, lightning, and thunder. Supreme deity of the Roman state religion, protector of Rome and source of divine authority for Roman emperors.', 'Jupiter corresponds to the Greek Zeus, born to Saturn (Cronus) and Ops (Rhea). He overthrew his father to become king of the gods, establishing divine order and justice.', 1, '{"sources": [{"title": "Metamorphoses", "author": "Ovid", "book": "1"}, {"title": "Aeneid", "author": "Virgil", "book": "1"}]}'::jsonb)
  RETURNING id INTO jupiter_id;

  -- JUNO - Queen of Gods
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Juno', 'juno', ARRAY['Juno Regina'], 'female', ARRAY['marriage', 'women', 'childbirth', 'family'], ARRAY['peacock', 'pomegranate', 'diadem', 'cow'], 'Queen of the gods and protector of the Roman state. Goddess of marriage, women, and childbirth. Wife and sister of Jupiter, patron of married women and the Roman matrons.', 'Juno is the Roman equivalent of Hera, daughter of Saturn and Ops. She became Jupiter''s consort and queen of heaven, fiercely protective of marriage and legitimate children.', 2, '{"sources": [{"title": "Aeneid", "author": "Virgil", "book": "1, 7"}, {"title": "Fasti", "author": "Ovid", "book": "6"}]}'::jsonb)
  RETURNING id INTO juno_id;

  -- NEPTUNE - God of the Sea
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Neptune', 'neptune', ARRAY['Neptunus'], 'male', ARRAY['sea', 'earthquakes', 'horses', 'freshwater'], ARRAY['trident', 'horse', 'dolphin'], 'God of the sea, earthquakes, and horses. Brother of Jupiter and Pluto, ruler of all waters. Also associated with freshwater springs and patronage of horse racing.', 3, '{"sources": [{"title": "Metamorphoses", "author": "Ovid", "book": "1"}, {"title": "Georgics", "author": "Virgil", "book": "1"}]}'::jsonb)
  RETURNING id INTO neptune_id;

  -- MARS - God of War
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Mars', 'mars', ARRAY['Mars Gradivus', 'Mars Ultor'], 'male', ARRAY['war', 'military', 'agriculture', 'spring'], ARRAY['spear', 'shield', 'wolf', 'woodpecker'], 'God of war and guardian of Rome. More prominent in Roman religion than his Greek counterpart Ares, Mars was also a god of agriculture and fertility. Father of Romulus and Remus, legendary founders of Rome.', 'Mars was the son of Jupiter and Juno (or Juno alone through magical impregnation). He fathered Romulus and Remus with the Vestal Virgin Rhea Silvia, making him the divine ancestor of the Roman people.', 2, '{"sources": [{"title": "Fasti", "author": "Ovid", "book": "3"}, {"title": "Ab Urbe Condita", "author": "Livy", "book": "1"}]}'::jsonb)
  RETURNING id INTO mars_id;

  -- VENUS - Goddess of Love
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Venus', 'venus', ARRAY['Venus Genetrix', 'Venus Victrix'], 'female', ARRAY['love', 'beauty', 'desire', 'fertility', 'victory'], ARRAY['dove', 'rose', 'myrtle', 'swan', 'sparrow'], 'Goddess of love, beauty, desire, sex, and fertility. Mother of the Roman people through her son Aeneas, ancestor of Romulus. Patron goddess of the Julian family, including Julius Caesar and Augustus.', 'Venus corresponds to Greek Aphrodite. In Roman tradition, she was mother of Aeneas by the Trojan prince Anchises. Through Aeneas, she became the divine ancestress of the Roman people and especially the Julian clan.', 2, '{"sources": [{"title": "Aeneid", "author": "Virgil", "book": "1-2"}, {"title": "Metamorphoses", "author": "Ovid", "book": "4, 10"}]}'::jsonb)
  RETURNING id INTO venus_id;

  -- MINERVA - Goddess of Wisdom
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Minerva', 'minerva', ARRAY[], 'female', ARRAY['wisdom', 'warfare', 'crafts', 'strategy', 'arts'], ARRAY['owl', 'olive tree', 'aegis', 'spear'], 'Goddess of wisdom, strategic warfare, and crafts. Part of the Capitoline Triad with Jupiter and Juno. Patron of artisans, teachers, and strategic warfare. Roman equivalent of Athena.', 3, '{"sources": [{"title": "Fasti", "author": "Ovid", "book": "3"}, {"title": "Metamorphoses", "author": "Ovid", "book": "2, 6"}]}'::jsonb)
  RETURNING id INTO minerva_id;

  -- APOLLO - God of Sun and Arts
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Apollo', 'apollo-roman', ARRAY['Phoebus Apollo'], 'male', ARRAY['sun', 'music', 'poetry', 'prophecy', 'healing', 'archery'], ARRAY['lyre', 'laurel wreath', 'bow', 'raven', 'sun'], 'God of the sun, music, poetry, prophecy, healing, and archery. One of the few gods whose name remained unchanged from Greek to Roman. Patron of the Sibylline Books and protector of Augustus.', 4, '{"sources": [{"title": "Metamorphoses", "author": "Ovid", "book": "1"}, {"title": "Aeneid", "author": "Virgil", "book": "3, 6"}]}'::jsonb)
  RETURNING id INTO apollo_id;

  -- DIANA - Goddess of the Hunt
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Diana', 'diana', ARRAY['Diana Nemorensis'], 'female', ARRAY['hunt', 'wilderness', 'moon', 'childbirth', 'virginity'], ARRAY['bow', 'deer', 'crescent moon', 'cypress'], 'Goddess of the hunt, wild animals, wilderness, and the moon. Protector of women in childbirth. Twin sister of Apollo. Roman equivalent of Artemis.', 4, '{"sources": [{"title": "Metamorphoses", "author": "Ovid", "book": "3"}, {"title": "Fasti", "author": "Ovid", "book": "3"}]}'::jsonb)
  RETURNING id INTO diana_id;

  -- MERCURY - Messenger God
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Mercury', 'mercury', ARRAY['Mercurius'], 'male', ARRAY['messengers', 'commerce', 'thieves', 'travelers', 'boundaries', 'eloquence'], ARRAY['caduceus', 'winged sandals', 'winged cap', 'rooster'], 'Messenger of the gods and god of commerce, eloquence, messages, travelers, boundaries, luck, and thieves. Guide of souls to the underworld. Roman equivalent of Hermes.', 5, '{"sources": [{"title": "Metamorphoses", "author": "Ovid", "book": "1, 2"}, {"title": "Fasti", "author": "Ovid", "book": "5"}]}'::jsonb)
  RETURNING id INTO mercury_id;

  -- BACCHUS - God of Wine
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Bacchus', 'bacchus', ARRAY['Liber'], 'male', ARRAY['wine', 'festivity', 'theater', 'fertility', 'madness'], ARRAY['thyrsus', 'grapevine', 'leopard', 'ivy'], 'God of wine, festivity, fertility, and ritual madness. His cult included the Bacchanalia festivals. Roman equivalent of Dionysus, also identified with the Italian god Liber.', 6, '{"sources": [{"title": "Metamorphoses", "author": "Ovid", "book": "3, 4"}, {"title": "Fasti", "author": "Ovid", "book": "3"}]}'::jsonb)
  RETURNING id INTO bacchus_id;

  -- VULCAN - God of Fire
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Vulcan', 'vulcan', ARRAY['Vulcanus'], 'male', ARRAY['fire', 'metalworking', 'forges', 'volcanoes'], ARRAY['anvil', 'hammer', 'tongs', 'volcano'], 'God of fire, metalworking, and the forge. Craftsman of the gods who forged divine weapons and armor. Roman equivalent of Hephaestus. Associated with volcanic activity.', 6, '{"sources": [{"title": "Aeneid", "author": "Virgil", "book": "8"}, {"title": "Metamorphoses", "author": "Ovid", "book": "4"}]}'::jsonb)
  RETURNING id INTO vulcan_id;

  -- CERES - Goddess of Agriculture
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Ceres', 'ceres', ARRAY[], 'female', ARRAY['agriculture', 'grain', 'harvest', 'fertility', 'motherhood'], ARRAY['wheat', 'torch', 'cornucopia', 'poppies'], 'Goddess of agriculture, grain crops, fertility, and motherhood. Her cult was central to Roman plebeian identity. Mother of Proserpina (Persephone). Roman equivalent of Demeter.', 5, '{"sources": [{"title": "Metamorphoses", "author": "Ovid", "book": "5"}, {"title": "Fasti", "author": "Ovid", "book": "4"}]}'::jsonb)
  RETURNING id INTO ceres_id;

  -- VESTA - Goddess of Hearth
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Vesta', 'vesta', ARRAY[], 'female', ARRAY['hearth', 'home', 'family', 'state'], ARRAY['sacred fire', 'donkey', 'kettle'], 'Goddess of the hearth, home, and family. Her sacred fire in the Forum Romanum symbolized Rome''s eternal life. Served by the Vestal Virgins, priestesses who tended her sacred flame.', 'Vesta corresponds to Greek Hestia. Her worship was fundamental to Roman identity - the sacred fire in her temple represented Rome itself and could never be allowed to go out.', 4, '{"sources": [{"title": "Fasti", "author": "Ovid", "book": "6"}, {"title": "Metamorphoses", "author": "Ovid", "book": "14"}]}'::jsonb)
  RETURNING id INTO vesta_id;

  -- JANUS - God of Beginnings
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Janus', 'janus', ARRAY['Ianus'], 'male', ARRAY['beginnings', 'gates', 'transitions', 'time', 'doorways', 'endings'], ARRAY['two faces', 'key', 'staff', 'gate'], 'God of beginnings, gates, transitions, time, duality, doorways, passages, and endings. Uniquely Roman deity with no Greek equivalent. Depicted with two faces looking to past and future. The month January is named after him.', 'Janus is one of the oldest Roman gods, said to have no Greek counterpart. He presided over the beginning and end of conflicts, and hence war and peace. All ceremonies and rituals began with an invocation to Janus.', 3, '{"sources": [{"title": "Fasti", "author": "Ovid", "book": "1"}, {"title": "Aeneid", "author": "Virgil", "book": "7"}]}'::jsonb)
  RETURNING id INTO janus_id;

  -- ==================== RELATIONSHIPS ====================
  
  -- Jupiter and Juno marriage
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (jupiter_id, juno_id, 'spouse', 'Divine marriage of king and queen of gods'),
  (juno_id, jupiter_id, 'spouse', 'Divine marriage of king and queen of gods');

  -- Mars - son of Jupiter and Juno
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (mars_id, jupiter_id, 'parent', 'Mars is son of Jupiter'),
  (jupiter_id, mars_id, 'child', 'Jupiter is father of Mars'),
  (mars_id, juno_id, 'parent', 'Mars is son of Juno'),
  (juno_id, mars_id, 'child', 'Juno is mother of Mars');

  -- Venus and Mars affair
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (venus_id, mars_id, 'lover', 'Famous affair of Venus and Mars'),
  (mars_id, venus_id, 'lover', 'Famous affair of Venus and Mars');

  -- Venus and Vulcan marriage
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (venus_id, vulcan_id, 'spouse', 'Unhappy marriage arranged by Jupiter'),
  (vulcan_id, venus_id, 'spouse', 'Unhappy marriage arranged by Jupiter');

  -- Apollo and Diana twins
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (apollo_id, diana_id, 'sibling', 'Twin siblings, children of Jupiter and Latona'),
  (diana_id, apollo_id, 'sibling', 'Twin siblings, children of Jupiter and Latona');

  -- Jupiter's children
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (apollo_id, jupiter_id, 'parent', 'Apollo is son of Jupiter'),
  (jupiter_id, apollo_id, 'child', 'Jupiter is father of Apollo'),
  (diana_id, jupiter_id, 'parent', 'Diana is daughter of Jupiter'),
  (jupiter_id, diana_id, 'child', 'Jupiter is father of Diana'),
  (minerva_id, jupiter_id, 'parent', 'Minerva born from Jupiter''s head'),
  (jupiter_id, minerva_id, 'child', 'Jupiter is father of Minerva'),
  (mercury_id, jupiter_id, 'parent', 'Mercury is son of Jupiter'),
  (jupiter_id, mercury_id, 'child', 'Jupiter is father of Mercury'),
  (bacchus_id, jupiter_id, 'parent', 'Bacchus is son of Jupiter'),
  (jupiter_id, bacchus_id, 'child', 'Jupiter is father of Bacchus');

  -- Brothers - Jupiter, Neptune, Pluto
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (jupiter_id, neptune_id, 'sibling', 'Brothers who divided the cosmos'),
  (neptune_id, jupiter_id, 'sibling', 'Brothers who divided the cosmos');

  -- ==================== STORIES ====================
  
  -- The Aeneid - Founding of Rome
  INSERT INTO stories (id, pantheon_id, title, slug, summary, key_passages, themes, cultural_significance, story_type, time_period, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'The Aeneid - Journey to Rome', 'aeneid', 'The epic tale of Aeneas, Trojan hero and son of Venus, who escapes the fall of Troy and journeys to Italy to found the Roman race. Guided by fate and divine will, he overcomes trials, wars, and personal loss to establish the foundations of Rome.', 'After Troy''s destruction, Aeneas flees with his father Anchises and son Ascanius. Shipwrecked in Carthage, he falls in love with Queen Dido but must abandon her to fulfill his destiny. In Italy, he fights the Rutulians and their leader Turnus, ultimately winning the right to settle and marry Lavinia, daughter of King Latinus. His descendants will found Rome.', ARRAY['destiny', 'duty', 'piety', 'sacrifice', 'founding myth', 'divine favor'], 'The Aeneid served as Rome''s national epic, legitimizing Roman power through divine ancestry (Venus) and connecting Rome to the glory of Troy. It emphasized Roman values of pietas (duty), virtus (courage), and destiny.', 'epic', 'mythological', '{"sources": [{"title": "Aeneid", "author": "Virgil", "date": "~19 BCE", "type": "primary"}]}'::jsonb)
  RETURNING id INTO aeneas_id;

  -- Romulus and Remus
  INSERT INTO stories (id, pantheon_id, title, slug, summary, key_passages, themes, cultural_significance, story_type, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'Romulus and Remus - Founding of Rome', 'romulus-remus', 'Twin sons of Mars and Rhea Silvia, abandoned as infants and raised by a she-wolf. They founded Rome but quarreled over leadership, resulting in Romulus killing Remus and becoming Rome''s first king.', 'Rhea Silvia, a Vestal Virgin, was impregnated by Mars. Her uncle ordered the twins killed, but they were saved and suckled by a she-wolf. Raised by shepherds, they later decided to found a city. During the foundation ceremony, Remus mocked Romulus by jumping over the city walls. Romulus killed him in anger, declaring "So perish anyone who leaps over my walls!" Rome was named after Romulus.', ARRAY['foundation', 'fratricide', 'divine ancestry', 'destiny', 'kingship'], 'Central to Roman identity - Rome was founded on April 21, 753 BCE according to tradition. The story emphasized Roman martial virtues and divine favor through Mars. The she-wolf became Rome''s symbol.', 'myth', '{"sources": [{"title": "Ab Urbe Condita", "author": "Livy", "book": "1.3-1.7", "type": "primary"}, {"title": "Roman Antiquities", "author": "Dionysius of Halicarnassus", "book": "1", "type": "primary"}]}'::jsonb)
  RETURNING id INTO romulus_id;

  -- Rape of the Sabine Women
  INSERT INTO stories (id, pantheon_id, title, slug, summary, key_passages, themes, cultural_significance, story_type, citation_sources) VALUES
  (gen_random_uuid(), roman_pantheon_id, 'The Rape of the Sabine Women', 'rape-sabine-women', 'In early Rome''s history, Romulus and his men faced a shortage of women. They invited the neighboring Sabines to a festival and abducted their women. The resulting war ended when the Sabine women intervened to reconcile their fathers and husbands.', 'Romulus invited the Sabines to a festival of Neptune. At a signal, Roman men seized and carried off the Sabine women. War ensued, but when battle was joined, the Sabine women threw themselves between the armies, pleading for peace between their fathers and husbands. The two peoples united, with the Sabine king Titus Tatius ruling alongside Romulus.', ARRAY['foundation', 'marriage', 'war', 'reconciliation', 'unification'], 'Explained how Rome grew from a small settlement to include other peoples. Emphasized themes of integration, the role of women as peacemakers, and Rome''s ability to assimilate others.', 'myth', '{"sources": [{"title": "Ab Urbe Condita", "author": "Livy", "book": "1.9-1.13", "type": "primary"}, {"title": "Roman Antiquities", "author": "Dionysius of Halicarnassus", "type": "primary"}]}'::jsonb)
  RETURNING id INTO rape_sabines_id;

  -- Story-Deity associations
  INSERT INTO story_deities (story_id, deity_id, role) VALUES
  (aeneas_id, venus_id, 'protagonist_parent'),
  (aeneas_id, jupiter_id, 'divine_supporter'),
  (aeneas_id, juno_id, 'antagonist'),
  (aeneas_id, neptune_id, 'divine_supporter'),
  (romulus_id, mars_id, 'protagonist_parent'),
  (rape_sabines_id, neptune_id, 'festival_honoree');

END $$;
