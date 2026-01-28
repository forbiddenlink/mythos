-- Greek Mythology Starter Dataset
-- This seed provides a foundational dataset of Greek deities, relationships, and stories

-- Insert Greek Pantheon
INSERT INTO pantheons (name, slug, culture, region, time_period_start, time_period_end, description, citation_sources) VALUES
(
  'Greek Pantheon',
  'greek',
  'Ancient Greek',
  'Mediterranean',
  -800,
  400,
  'The Greek pantheon encompasses the gods and goddesses of ancient Greek mythology, centered on Mount Olympus and featuring the twelve Olympians who ruled after the Titanomachy.',
  '{"sources": [{"title": "Theogony", "author": "Hesiod", "date": "~700 BCE", "type": "primary"}, {"title": "The Library", "author": "Apollodorus", "date": "1st or 2nd century CE", "type": "primary"}]}'::jsonb
);

-- Store pantheon ID for references
DO $$
DECLARE
  greek_pantheon_id UUID;
  zeus_id UUID;
  hera_id UUID;
  poseidon_id UUID;
  hades_id UUID;
  demeter_id UUID;
  hestia_id UUID;
  athena_id UUID;
  apollo_id UUID;
  artemis_id UUID;
  ares_id UUID;
  aphrodite_id UUID;
  hephaestus_id UUID;
  hermes_id UUID;
  dionysus_id UUID;
  titanomachy_id UUID;
BEGIN
  -- Get pantheon ID
  SELECT id INTO greek_pantheon_id FROM pantheons WHERE slug = 'greek';

  -- Insert Deities
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Zeus', 'zeus', ARRAY['Jupiter', 'Jove'], 'male', ARRAY['sky', 'thunder', 'lightning', 'law', 'order'], ARRAY['thunderbolt', 'eagle', 'oak tree', 'bull'], 'King of the gods and ruler of Mount Olympus. God of the sky, thunder, and justice. Zeus overthrew his father Cronus to become the supreme deity of the Greek pantheon.', 'Zeus was the youngest son of the Titans Cronus and Rhea. Cronus, fearing a prophecy that he would be overthrown by his children, swallowed each child at birth. Rhea hid Zeus and gave Cronus a stone wrapped in swaddling clothes instead. Zeus was raised in secret and later forced Cronus to regurgitate his siblings, leading the rebellion against the Titans.', 1, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "453-506"}, {"title": "Library", "author": "Apollodorus", "book": "1.1.5-1.2.1"}]}'::jsonb)
  RETURNING id INTO zeus_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Hera', 'hera', ARRAY['Juno'], 'female', ARRAY['marriage', 'women', 'family', 'childbirth'], ARRAY['peacock', 'cow', 'pomegranate', 'diadem'], 'Queen of the gods and goddess of marriage and family. Wife and sister of Zeus, known for her jealousy toward Zeus''s lovers and illegitimate children.', 'Hera was the eldest daughter of Cronus and Rhea, swallowed by Cronus at birth and later freed by Zeus. She became Zeus''s wife after he courted her in the form of a cuckoo bird.', 2, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "453-457, 921-923"}]}'::jsonb)
  RETURNING id INTO hera_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Poseidon', 'poseidon', ARRAY['Neptune'], 'male', ARRAY['sea', 'earthquakes', 'horses', 'storms'], ARRAY['trident', 'horse', 'dolphin', 'bull'], 'God of the sea, earthquakes, and horses. Brother of Zeus and Hades, ruler of the oceans and all waters.', 3, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "453-457"}]}'::jsonb)
  RETURNING id INTO poseidon_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Hades', 'hades', ARRAY['Pluto', 'Plouton'], 'male', ARRAY['underworld', 'death', 'wealth'], ARRAY['helm of darkness', 'bident', 'Cerberus', 'cornucopia'], 'God of the underworld and the dead. Ruler of the realm of Hades, rarely leaving his kingdom.', 4, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "453-457"}]}'::jsonb)
  RETURNING id INTO hades_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Demeter', 'demeter', ARRAY['Ceres'], 'female', ARRAY['agriculture', 'harvest', 'fertility', 'sacred law'], ARRAY['wheat', 'torch', 'cornucopia', 'poppies'], 'Goddess of agriculture, harvest, and fertility. Mother of Persephone, whose abduction by Hades explains the seasons.', 5, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "453-457, 912-914"}]}'::jsonb)
  RETURNING id INTO demeter_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Hestia', 'hestia', ARRAY['Vesta'], 'female', ARRAY['hearth', 'home', 'domesticity', 'family'], ARRAY['hearth', 'fire', 'kettle'], 'Goddess of the hearth, home, and family. The firstborn of Cronus and Rhea, she maintained eternal virginity and tended the sacred fire of Olympus.', 6, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "453-457"}]}'::jsonb)
  RETURNING id INTO hestia_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Athena', 'athena', ARRAY['Minerva', 'Pallas Athena'], 'female', ARRAY['wisdom', 'warfare', 'crafts', 'strategy'], ARRAY['owl', 'olive tree', 'aegis', 'spear'], 'Goddess of wisdom, warfare, and crafts. Born fully armed from Zeus''s forehead after he swallowed her mother Metis.', 7, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "886-900, 924-926"}]}'::jsonb)
  RETURNING id INTO athena_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Apollo', 'apollo', ARRAY['Phoebus', 'Phoebus Apollo'], 'male', ARRAY['sun', 'music', 'poetry', 'prophecy', 'healing', 'archery'], ARRAY['lyre', 'bow and arrow', 'laurel wreath', 'sun', 'raven'], 'God of sun, music, poetry, prophecy, and healing. Twin brother of Artemis, patron of the Muses and leader of the nine sisters.', 8, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "918-920"}]}'::jsonb)
  RETURNING id INTO apollo_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Artemis', 'artemis', ARRAY['Diana'], 'female', ARRAY['hunt', 'wilderness', 'moon', 'childbirth', 'virginity'], ARRAY['bow and arrow', 'deer', 'moon', 'cypress'], 'Goddess of the hunt, wilderness, and the moon. Twin sister of Apollo, protector of young women and animals.', 9, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "918-920"}]}'::jsonb)
  RETURNING id INTO artemis_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Ares', 'ares', ARRAY['Mars'], 'male', ARRAY['war', 'violence', 'bloodshed'], ARRAY['sword', 'spear', 'shield', 'helmet', 'vulture'], 'God of war, violence, and bloodshed. Son of Zeus and Hera, representing the brutal and chaotic aspects of warfare.', 10, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "921-923"}]}'::jsonb)
  RETURNING id INTO ares_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Aphrodite', 'aphrodite', ARRAY['Venus', 'Kypris'], 'female', ARRAY['love', 'beauty', 'desire', 'sexuality'], ARRAY['dove', 'swan', 'rose', 'myrtle', 'sparrow'], 'Goddess of love, beauty, and desire. Born from the sea foam after Cronus castrated Uranus and threw his genitals into the sea.', 11, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "188-206"}]}'::jsonb)
  RETURNING id INTO aphrodite_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Hephaestus', 'hephaestus', ARRAY['Vulcan', 'Hephaistos'], 'male', ARRAY['fire', 'metalworking', 'crafts', 'sculpture'], ARRAY['hammer', 'anvil', 'tongs', 'forge'], 'God of fire, metalworking, and crafts. Son of Hera (and possibly Zeus), cast from Olympus due to his lameness but later readmitted.', 12, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "927-929"}]}'::jsonb)
  RETURNING id INTO hephaestus_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Hermes', 'hermes', ARRAY['Mercury'], 'male', ARRAY['messengers', 'commerce', 'thieves', 'travelers', 'boundaries'], ARRAY['caduceus', 'winged sandals', 'petasos', 'tortoise', 'rooster'], 'God of messengers, commerce, thieves, and travelers. Son of Zeus and the nymph Maia, known for his cunning and speed.', 13, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "938-939"}]}'::jsonb)
  RETURNING id INTO hermes_id;

  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), greek_pantheon_id, 'Dionysus', 'dionysus', ARRAY['Bacchus', 'Liber'], 'male', ARRAY['wine', 'festivity', 'theater', 'madness', 'ecstasy'], ARRAY['thyrsus', 'grapevine', 'ivy', 'leopard', 'panther'], 'God of wine, festivity, and theater. Son of Zeus and the mortal Semele, the only Olympian born to a mortal parent.', 14, '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "940-942"}]}'::jsonb)
  RETURNING id INTO dionysus_id;

  -- Insert Deity Relationships
  -- For symmetric relationships (sibling_of, spouse_of), always put smaller UUID first
  INSERT INTO deity_relationships (from_deity_id, to_deity_id, relationship_type, confidence_level) VALUES
  -- Zeus's siblings (ensure smaller UUID is from_deity_id)
  (LEAST(zeus_id, hera_id), GREATEST(zeus_id, hera_id), 'sibling_of', 'high'),
  (LEAST(zeus_id, poseidon_id), GREATEST(zeus_id, poseidon_id), 'sibling_of', 'high'),
  (LEAST(zeus_id, hades_id), GREATEST(zeus_id, hades_id), 'sibling_of', 'high'),
  (LEAST(zeus_id, demeter_id), GREATEST(zeus_id, demeter_id), 'sibling_of', 'high'),
  (LEAST(zeus_id, hestia_id), GREATEST(zeus_id, hestia_id), 'sibling_of', 'high'),
  
  -- Zeus as spouse (symmetric)
  (LEAST(zeus_id, hera_id), GREATEST(zeus_id, hera_id), 'spouse_of', 'high'),
  
  -- Zeus as parent (directional - parent → child)
  (zeus_id, ares_id, 'parent_of', 'high'),
  (zeus_id, hephaestus_id, 'parent_of', 'medium'),
  (zeus_id, athena_id, 'parent_of', 'high'),
  (zeus_id, apollo_id, 'parent_of', 'high'),
  (zeus_id, artemis_id, 'parent_of', 'high'),
  (zeus_id, hermes_id, 'parent_of', 'high'),
  (zeus_id, dionysus_id, 'parent_of', 'high'),
  
  -- Hera as parent (directional - parent → child)
  (hera_id, ares_id, 'parent_of', 'high'),
  (hera_id, hephaestus_id, 'parent_of', 'high'),
  
  -- Twin relationships (symmetric)
  (LEAST(apollo_id, artemis_id), GREATEST(apollo_id, artemis_id), 'sibling_of', 'high'),
  
  -- Aphrodite relationships
  (LEAST(aphrodite_id, ares_id), GREATEST(aphrodite_id, ares_id), 'ally_of', 'high'),
  (LEAST(aphrodite_id, hephaestus_id), GREATEST(aphrodite_id, hephaestus_id), 'spouse_of', 'high');

  -- Insert Titanomachy Story
  INSERT INTO stories (id, pantheon_id, title, slug, summary, key_excerpts, category, themes, citation_sources) VALUES
  (
    gen_random_uuid(),
    greek_pantheon_id,
    'The Titanomachy',
    'titanomachy',
    'The ten-year war between the Olympian gods led by Zeus and the Titans led by Cronus, resulting in the establishment of the Olympian order.',
    'The Titanomachy was a series of battles fought between the younger generation of gods (the Olympians) and the older generation (the Titans). After Zeus freed his siblings from Cronus''s belly, they waged war against the Titans for ten years. Zeus freed the Cyclopes and Hecatoncheires from Tartarus, who provided the gods with powerful weapons. With these weapons and allies, the Olympians defeated the Titans, establishing the rule of Zeus and the new cosmic order.',
    'war',
    ARRAY['generational conflict', 'divine succession', 'cosmic order', 'justice', 'power'],
    '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "617-735", "type": "primary"}, {"title": "Library", "author": "Apollodorus", "book": "1.2.1", "type": "primary"}]}'::jsonb
  )
  RETURNING id INTO titanomachy_id;

  -- Insert story participants (main characters in Titanomachy)
  INSERT INTO story_participants (story_id, deity_id) VALUES
  (titanomachy_id, zeus_id),
  (titanomachy_id, poseidon_id),
  (titanomachy_id, hades_id),
  (titanomachy_id, hera_id),
  (titanomachy_id, demeter_id),
  (titanomachy_id, hestia_id);

  -- Insert timeline events for Titanomachy
  INSERT INTO events (story_id, title, description, event_type, sequence_order, mythological_era, citation_sources) VALUES
  (titanomachy_id, 'Zeus Frees His Siblings', 'Zeus forces Cronus to regurgitate his swallowed siblings: Hestia, Demeter, Hera, Hades, and Poseidon.', 'birth', 1, 'Age of the Titans', '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "493-506"}]}'::jsonb),
  (titanomachy_id, 'Declaration of War', 'The Olympians declare war on the Titans from Mount Olympus.', 'battle', 2, 'Age of the Titans', '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "617-643"}]}'::jsonb),
  (titanomachy_id, 'Release of the Cyclopes', 'Zeus frees the Cyclopes from Tartarus; they forge the thunderbolt, trident, and helm of darkness.', 'creation', 3, 'Age of the Titans', '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "501-506, 139-141"}]}'::jsonb),
  (titanomachy_id, 'The Ten-Year War', 'The Olympians and Titans wage war for ten years with neither side gaining advantage.', 'battle', 4, 'Age of the Titans', '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "617-643"}]}'::jsonb),
  (titanomachy_id, 'Zeus Unleashes the Thunderbolt', 'Zeus uses his thunderbolt to devastating effect, shaking the earth and heavens.', 'battle', 5, 'Age of the Titans', '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "687-712"}]}'::jsonb),
  (titanomachy_id, 'Victory of the Olympians', 'The Olympians defeat the Titans and cast them into Tartarus.', 'battle', 6, 'Transition to Age of Heroes', '{"sources": [{"title": "Theogony", "author": "Hesiod", "lines": "713-735"}]}'::jsonb),
  (titanomachy_id, 'Establishment of Olympian Rule', 'Zeus and his siblings divide the cosmos: Zeus rules the sky, Poseidon the sea, and Hades the underworld.', 'ascension', 7, 'Age of Heroes', '{"sources": [{"title": "Library", "author": "Apollodorus", "book": "1.2.1"}]}'::jsonb);

  RAISE NOTICE 'Seed completed successfully! Inserted Greek pantheon with % deities, % relationships, 1 story, and % events.', 
    (SELECT COUNT(*) FROM deities WHERE pantheon_id = greek_pantheon_id),
    (SELECT COUNT(*) FROM deity_relationships),
    (SELECT COUNT(*) FROM events WHERE story_id = titanomachy_id);
END $$;
