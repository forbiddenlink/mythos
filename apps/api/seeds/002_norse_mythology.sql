-- Norse Mythology Comprehensive Dataset
-- This seed provides the Norse pantheon with major deities, relationships, and key stories

-- Insert Norse Pantheon (skip if already exists)
INSERT INTO pantheons (name, slug, culture, region, time_period_start, time_period_end, description, citation_sources) VALUES
(
  'Norse Pantheon',
  'norse',
  'Norse/Germanic',
  'Scandinavia',
  -1200,
  1100,
  'The Norse pantheon includes the Æsir and Vanir gods of Scandinavian mythology, centered in Asgard and featuring stories of creation, heroism, and the prophesied end of the world known as Ragnarök.',
  '{"sources": [{"title": "Poetic Edda", "author": "Anonymous", "date": "~1270 CE", "type": "primary"}, {"title": "Prose Edda", "author": "Snorri Sturluson", "date": "~1220 CE", "type": "primary"}, {"title": "Heimskringla", "author": "Snorri Sturluson", "date": "~1230 CE", "type": "primary"}]}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Store pantheon ID and deity IDs for references
DO $$
DECLARE
  norse_pantheon_id UUID;
  odin_id UUID;
  frigg_id UUID;
  thor_id UUID;
  sif_id UUID;
  loki_id UUID;
  freya_id UUID;
  freyr_id UUID;
  baldur_id UUID;
  tyr_id UUID;
  heimdall_id UUID;
  hel_id UUID;
  fenrir_id UUID;
  jormungandr_id UUID;
  sleipnir_id UUID;
  
  -- Stories
  ragnarok_id UUID;
  yggdrasil_id UUID;
  creation_id UUID;
  baldur_death_id UUID;
  binding_fenrir_id UUID;
BEGIN
  -- Get pantheon ID
  SELECT id INTO norse_pantheon_id FROM pantheons WHERE slug = 'norse';

  -- ==================== MAJOR DEITIES ====================
  
  -- ODIN - Allfather
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Odin', 'odin', ARRAY['Allfather', 'Wōden', 'Wotan', 'The Wanderer', 'One-Eyed'], 'male', 
   ARRAY['wisdom', 'war', 'death', 'poetry', 'magic', 'knowledge'], 
   ARRAY['spear Gungnir', 'ravens Huginn and Muninn', 'eight-legged horse Sleipnir', 'wolves Geri and Freki', 'one eye'], 
   'King of the Æsir and god of wisdom, war, and death. Odin sacrificed his eye at Mimir''s well for wisdom and hung himself on Yggdrasil for nine days to learn the runes. He rules from his hall Valhalla in Asgard.',
   'Odin is the son of the primordial beings Borr and Bestla. Along with his brothers Vili and Vé, he slew the giant Ymir and created the world from his body. He discovered the runes after hanging himself on Yggdrasil for nine days and nights, pierced by his own spear.',
   1,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "3-9"}, {"title": "Poetic Edda - Völuspá", "lines": "1-66"}, {"title": "Poetic Edda - Hávamál", "lines": "138-145"}]}'::jsonb)
  RETURNING id INTO odin_id;

  -- FRIGG - Queen of Æsir
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Frigg', 'frigg', ARRAY['Frigga', 'Fricka'], 'female',
   ARRAY['marriage', 'motherhood', 'domestic arts', 'prophecy', 'fate'],
   ARRAY['spinning wheel', 'keys', 'falcon feather cloak'],
   'Queen of the Æsir and wife of Odin. Goddess of marriage, motherhood, and the home. She possesses the power of prophecy but chooses not to reveal what she knows. Mother of Baldur.',
   'Frigg is the daughter of Fjorgynn (Earth) and became Odin''s wife. She dwells in the marshland mansion of Fensalir, where she sits and spins the clouds.',
   2,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "20, 35"}, {"title": "Poetic Edda - Lokasenna", "lines": "26-30"}]}'::jsonb)
  RETURNING id INTO frigg_id;

  -- THOR - God of Thunder
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Thor', 'thor', ARRAY['Þórr', 'Donar', 'Thunder God'], 'male',
   ARRAY['thunder', 'lightning', 'strength', 'protection', 'storms', 'oak trees'],
   ARRAY['hammer Mjölnir', 'belt Megingjörð', 'iron gloves Járngreipr', 'goats Tanngrisnir and Tanngnjóstr', 'red beard'],
   'Son of Odin and the earth goddess Jörð. God of thunder, lightning, and storms. Protector of mankind and the gods, wielding the mighty hammer Mjölnir. Most popular god among common people.',
   'Thor was born to Odin and the personification of Earth (Jörð). He is destined to fight the Midgard Serpent (Jörmungandr) at Ragnarök, killing it but dying from its poison.',
   3,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "21, 44-48"}, {"title": "Poetic Edda - Þrymskviða"}, {"title": "Poetic Edda - Hymiskviða"}]}'::jsonb)
  RETURNING id INTO thor_id;

  -- SIF - Thor's wife
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Sif', 'sif', ARRAY['Golden-Haired'], 'female',
   ARRAY['harvest', 'fertility', 'family'],
   ARRAY['golden hair', 'wheat'],
   'Wife of Thor and goddess associated with earth and harvest. Famous for her beautiful golden hair, which was once cut by Loki as a prank, leading to the creation of several magical treasures.',
   4,
   '{"sources": [{"title": "Prose Edda - Skáldskaparmál", "author": "Snorri Sturluson", "chapter": "35"}]}'::jsonb)
  RETURNING id INTO sif_id;

  -- LOKI - Trickster
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Loki', 'loki', ARRAY['Lopt', 'Hveðrungr', 'Trickster', 'Shape-Shifter'], 'male',
   ARRAY['mischief', 'trickery', 'chaos', 'fire', 'transformation'],
   ARRAY['flames', 'serpent', 'salmon', 'fly'],
   'A complex figure, blood brother to Odin but frequently causing trouble for the gods. A shape-shifter and trickster who fathers monstrous children including Fenrir, Jörmungandr, and Hel. His actions lead to the death of Baldur and ultimately Ragnarök.',
   'Son of the giant Fárbauti and Laufey. Though a giant, he became blood brother to Odin and lived among the Æsir. Father of Hel, Fenrir, and Jörmungandr with the giantess Angrboða.',
   5,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "33-34, 49-51"}, {"title": "Poetic Edda - Lokasenna"}, {"title": "Poetic Edda - Þrymskviða"}]}'::jsonb)
  RETURNING id INTO loki_id;

  -- FREYJA - Goddess of Love
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Freyja', 'freyja', ARRAY['Freya', 'Lady', 'Vanadís'], 'female',
   ARRAY['love', 'beauty', 'fertility', 'war', 'death', 'magic', 'seiðr'],
   ARRAY['necklace Brísingamen', 'falcon feather cloak', 'chariot pulled by cats', 'boar Hildisvíni'],
   'Most renowned of the Vanir, goddess of love, beauty, and fertility, but also associated with war and death. She receives half of those who die in battle in her hall Fólkvangr. Practitioner of seiðr magic.',
   'Daughter of Njörðr and twin sister of Freyr. She came to the Æsir as a hostage after the Æsir-Vanir War but was embraced by them. She searches constantly for her missing husband Óðr.',
   6,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "24, 35"}, {"title": "Poetic Edda - Völuspá", "lines": "22"}, {"title": "Heimskringla - Ynglinga Saga", "chapter": "4"}]}'::jsonb)
  RETURNING id INTO freya_id;

  -- FREYR - God of Prosperity
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Freyr', 'freyr', ARRAY['Yngvi', 'Lord'], 'male',
   ARRAY['prosperity', 'sunshine', 'rain', 'fertility', 'peace', 'good harvest'],
   ARRAY['boar Gullinbursti', 'ship Skíðblaðnir', 'sword', 'antler'],
   'One of the Vanir, god of fertility, prosperity, and fair weather. Owner of the magical ship Skíðblaðnir and the golden boar Gullinbursti. Associated with kingship and sacred kingship in Sweden.',
   'Son of Njörðr and twin brother of Freyja. He gave up his magical sword to win the hand of the giantess Gerðr, leaving him weaponless for Ragnarök.',
   7,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "24, 37"}, {"title": "Poetic Edda - Skírnismál"}, {"title": "Heimskringla - Ynglinga Saga"}]}'::jsonb)
  RETURNING id INTO freyr_id;

  -- BALDUR - The Beautiful
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Baldur', 'baldur', ARRAY['Baldr', 'Balder', 'The Beautiful', 'The Shining One'], 'male',
   ARRAY['light', 'purity', 'beauty', 'love', 'innocence'],
   ARRAY['mistletoe', 'white', 'ship Hringhorni'],
   'The most beloved of all gods, son of Odin and Frigg. God of light, purity, and beauty. His death, orchestrated by Loki using mistletoe, is one of the great tragedies leading to Ragnarök.',
   'Baldur had dreams of his own death, prompting Frigg to extract oaths from all things not to harm him—except mistletoe, which she deemed too young. Loki discovered this and fashioned a dart from mistletoe, giving it to the blind god Höðr who unknowingly killed Baldur.',
   8,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "22, 49"}, {"title": "Poetic Edda - Baldrs draumar"}]}'::jsonb)
  RETURNING id INTO baldur_id;

  -- TYR - God of War and Justice
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Tyr', 'tyr', ARRAY['Týr', 'Tíw', 'Ziu'], 'male',
   ARRAY['war', 'justice', 'law', 'courage', 'oaths'],
   ARRAY['sword', 'one hand', 'rune Tīwaz'],
   'God of war, justice, and law. Bravest of the gods. Sacrificed his right hand to bind the wolf Fenrir, demonstrating his courage and willingness to uphold cosmic order even at personal cost.',
   'When the gods sought to bind Fenrir, Tyr volunteered to place his hand in the wolf''s mouth as a pledge of good faith. When Fenrir realized he had been tricked, he bit off Tyr''s hand.',
   9,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "25, 34"}, {"title": "Poetic Edda - Hymiskviða"}]}'::jsonb)
  RETURNING id INTO tyr_id;

  -- HEIMDALL - The Watchman
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Heimdall', 'heimdall', ARRAY['Heimdallr', 'The White God', 'Rig'], 'male',
   ARRAY['vigilance', 'light', 'foreknowledge', 'class structure'],
   ARRAY['horn Gjallarhorn', 'sword Höfuð', 'Bifröst bridge', 'gold teeth'],
   'Watchman of the gods who guards the rainbow bridge Bifröst connecting Asgard and Midgard. Possesses incredible hearing and eyesight, and will blow his horn Gjallarhorn to signal the onset of Ragnarök.',
   'Son of nine mothers (possibly waves), born at the edge of the world. He requires less sleep than a bird and can hear grass growing. At Ragnarök, he and Loki will kill each other.',
   10,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "27, 51"}, {"title": "Poetic Edda - Völuspá", "lines": "46"}, {"title": "Poetic Edda - Rígsþula"}]}'::jsonb)
  RETURNING id INTO heimdall_id;

  -- HEL - Goddess of the Dead
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Hel', 'hel', ARRAY['Hela'], 'female',
   ARRAY['death', 'underworld', 'disease'],
   ARRAY['half living/half dead appearance', 'realm Niflheim'],
   'Goddess and ruler of the underworld realm of the dead (also called Hel or Helheim). Daughter of Loki. Her realm receives those who die of sickness or old age.',
   'Daughter of Loki and the giantess Angrboða. Odin cast her into Niflheim and gave her authority over nine worlds, to distribute those who died of illness or old age.',
   11,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "34, 49"}]}'::jsonb)
  RETURNING id INTO hel_id;

  -- FENRIR - The Great Wolf
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Fenrir', 'fenrir', ARRAY['Fenrisúlfr', 'Fenris Wolf', 'Vánargandr'], 'male',
   ARRAY['destruction', 'chaos', 'fate'],
   ARRAY['chain Gleipnir', 'massive wolf', 'jaws'],
   'Monstrous wolf, son of Loki. Bound by the gods but prophesied to break free at Ragnarök and devour Odin. Represents the inevitable forces of chaos and destruction.',
   12,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "34, 51"}]}'::jsonb)
  RETURNING id INTO fenrir_id;

  -- JÖRMUNGANDR - The World Serpent
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Jörmungandr', 'jormungandr', ARRAY['Midgard Serpent', 'World Serpent', 'Miðgarðsormr'], 'male',
   ARRAY['chaos', 'the sea', 'fate'],
   ARRAY['serpent', 'ocean', 'tail in mouth'],
   'Enormous serpent and child of Loki. Cast into the ocean by Odin, where it grew so large it encircles Midgard and grasps its own tail. At Ragnarök, it will rise from the ocean and fight Thor.',
   13,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "34, 48, 51"}]}'::jsonb)
  RETURNING id INTO jormungandr_id;

  -- SLEIPNIR - Odin's Horse
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 'Sleipnir', 'sleipnir', ARRAY['The Sliding One'], 'male',
   ARRAY['travel', 'speed', 'shamanic journeys'],
   ARRAY['eight legs', 'gray coat', 'fastest horse'],
   'Odin''s eight-legged horse, the best and fastest of all horses. Can travel between the nine worlds. Son of Loki.',
   14,
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "author": "Snorri Sturluson", "chapters": "15, 42"}]}'::jsonb)
  RETURNING id INTO sleipnir_id;

  -- ==================== RELATIONSHIPS ====================

  -- Family relationships
  INSERT INTO deity_relationships (from_deity_id, to_deity_id, relationship_type, confidence_level, description) VALUES
  -- Odin's family
  (LEAST(odin_id, frigg_id), GREATEST(odin_id, frigg_id), 'spouse_of', 'high', 'Odin and Frigg are husband and wife, ruling the Æsir together'),
  (odin_id, thor_id, 'parent_of', 'high', 'Odin is Thor''s father'),
  (odin_id, baldur_id, 'parent_of', 'high', 'Odin is Baldur''s father'),
  (frigg_id, baldur_id, 'parent_of', 'high', 'Frigg is Baldur''s mother'),
  
  -- Thor's family  
  (LEAST(thor_id, sif_id), GREATEST(thor_id, sif_id), 'spouse_of', 'high', 'Thor is married to Sif'),
  
  -- Freyr and Freyja
  (LEAST(freyr_id, freya_id), GREATEST(freyr_id, freya_id), 'sibling_of', 'high', 'Freyr and Freyja are twin siblings'),
  
  -- Loki's children
  (loki_id, hel_id, 'parent_of', 'high', 'Loki is father of Hel'),
  (loki_id, fenrir_id, 'parent_of', 'high', 'Loki is father of the wolf Fenrir'),
  (loki_id, jormungandr_id, 'parent_of', 'high', 'Loki is father of the Midgard Serpent'),
  (loki_id, sleipnir_id, 'parent_of', 'high', 'Loki gave birth to Sleipnir after shape-shifting into a mare'),
  
  -- Enmities and alliances
  (LEAST(loki_id, heimdall_id), GREATEST(loki_id, heimdall_id), 'enemy_of', 'high', 'Loki and Heimdall are fated to kill each other at Ragnarök'),
  (LEAST(thor_id, jormungandr_id), GREATEST(thor_id, jormungandr_id), 'enemy_of', 'high', 'Thor and Jörmungandr are fated to battle at Ragnarök'),
  (LEAST(odin_id, fenrir_id), GREATEST(odin_id, fenrir_id), 'enemy_of', 'high', 'Fenrir is prophesied to devour Odin at Ragnarök'),
  (LEAST(odin_id, loki_id), GREATEST(odin_id, loki_id), 'ally_of', 'high', 'Odin and Loki are blood brothers despite Loki''s trickery');

  -- ==================== STORIES ====================

  -- Ragnarök
  INSERT INTO stories (id, pantheon_id, title, slug, summary, category, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id, 
   'Ragnarök - The Twilight of the Gods',
   'ragnarok',
   'The prophesied end of the world in Norse mythology. After a great winter called Fimbulvetr, the bound wolf Fenrir will break free, the Midgard Serpent will rise from the ocean, and the giants will sail to battle the gods. Odin will be devoured by Fenrir, Thor will kill Jörmungandr but die from its poison, and Heimdall and Loki will slay each other. The world will be consumed by fire and sink into the sea, but eventually rise again renewed.',
   'tragedy',
   '{"sources": [{"title": "Poetic Edda - Völuspá", "lines": "40-66"}, {"title": "Prose Edda - Gylfaginning", "chapters": "51-53"}]}'::jsonb)
  RETURNING id INTO ragnarok_id;

  -- Yggdrasil
  INSERT INTO stories (id, pantheon_id, title, slug, summary, category, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id,
   'Yggdrasil - The World Tree',
   'yggdrasil',
   'The immense ash tree that stands at the center of the cosmos and connects the Nine Worlds. Its roots extend into multiple realms, and its branches stretch over all existence. At its base sit the Norns (Fates), and various creatures live within it, including the eagle at its crown, the dragon Níðhöggr gnawing at its roots, and the squirrel Ratatoskr running up and down carrying messages.',
   'cosmogony',
   '{"sources": [{"title": "Poetic Edda - Völuspá", "lines": "19-20"}, {"title": "Prose Edda - Gylfaginning", "chapters": "15-16"}, {"title": "Poetic Edda - Grímnismál", "lines": "29-35"}]}'::jsonb)
  RETURNING id INTO yggdrasil_id;

  -- Creation Myth
  INSERT INTO stories (id, pantheon_id, title, slug, summary, category, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id,
   'The Creation of the World',
   'creation-myth',
   'In the beginning was the void Ginnungagap, with Muspelheim (fire) to the south and Niflheim (ice) to the north. When fire and ice met, they created the giant Ymir. While Ymir slept, the sons of Borr (Odin, Vili, and Vé) killed him and created the world from his body: his flesh became earth, his blood the seas, his bones the mountains, his hair the trees, his skull the sky, and his brains the clouds. From two trees they created the first humans, Ask and Embla.',
   'creation',
   '{"sources": [{"title": "Poetic Edda - Völuspá", "lines": "3-18"}, {"title": "Prose Edda - Gylfaginning", "chapters": "4-9"}]}'::jsonb)
  RETURNING id INTO creation_id;

  -- Death of Baldur
  INSERT INTO stories (id, pantheon_id, title, slug, summary, category, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id,
   'The Death of Baldur',
   'death-of-baldur',
   'Baldur, the most beloved god, was troubled by dreams of his death. His mother Frigg extracted oaths from all things not to harm him, making him invulnerable—except she overlooked mistletoe. Loki, disguised, discovered this weakness and fashioned a dart from mistletoe. He gave it to the blind god Höðr, who unknowingly threw it, killing Baldur. The gods attempted to ransom him from Hel, but Loki (disguised as a giantess) refused to weep for him, condemning Baldur to remain in the underworld until after Ragnarök.',
   'tragedy',
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "chapters": "49-50"}, {"title": "Poetic Edda - Baldrs draumar"}]}'::jsonb)
  RETURNING id INTO baldur_death_id;

  -- Binding of Fenrir
  INSERT INTO stories (id, pantheon_id, title, slug, summary, category, citation_sources) VALUES
  (gen_random_uuid(), norse_pantheon_id,
   'The Binding of Fenrir',
   'binding-of-fenrir',
   'The gods raised the wolf Fenrir in Asgard, but as he grew enormous and dangerous, they decided he must be bound. They challenged him to test his strength against magical fetters. Fenrir broke the first two easily. The dwarves then crafted Gleipnir, a ribbon made from impossible things: the sound of a cat''s footfall, the beard of a woman, the roots of a mountain, the sinews of a bear, the breath of a fish, and the spittle of a bird. Fenrir, suspecting trickery, agreed to be bound only if a god placed a hand in his mouth. Tyr volunteered, and when Fenrir could not break free, he bit off Tyr''s hand. Fenrir remains bound until Ragnarök.',
   'trickster',
   '{"sources": [{"title": "Prose Edda - Gylfaginning", "chapter": "34"}]}'::jsonb)
  RETURNING id INTO binding_fenrir_id;

  -- ==================== EVENTS (For Timeline) ====================
  
  -- Creation events
  INSERT INTO events (story_id, title, description, event_type, sequence_order, mythological_era) VALUES
  (creation_id, 'The Primordial Void', 'Ginnungagap exists as the void between fire and ice', 'origin', 1, 'Primordial'),
  (creation_id, 'Birth of Ymir', 'The first being, the giant Ymir, is formed from the meeting of fire and ice', 'birth', 2, 'Primordial'),
  (creation_id, 'Slaying of Ymir', 'Odin, Vili, and Vé kill Ymir to create the world', 'conflict', 3, 'Creation'),
  (creation_id, 'Formation of Midgard', 'The world is created from Ymir''s body', 'transformation', 4, 'Creation'),
  (creation_id, 'Creation of Humans', 'Ask and Embla, the first humans, are created from two trees', 'origin', 5, 'Creation');

  -- Baldur's death events
  INSERT INTO events (story_id, title, description, event_type, sequence_order, mythological_era) VALUES
  (baldur_death_id, 'Baldur''s Nightmares', 'Baldur is plagued by dreams foretelling his death', 'omen', 1, 'Age of the Æsir'),
  (baldur_death_id, 'Frigg''s Quest', 'Frigg extracts oaths from all things not to harm Baldur', 'quest', 2, 'Age of the Æsir'),
  (baldur_death_id, 'Loki''s Discovery', 'Loki discovers that mistletoe was overlooked', 'revelation', 3, 'Age of the Æsir'),
  (baldur_death_id, 'The Fatal Throw', 'Höðr, guided by Loki, kills Baldur with mistletoe', 'tragedy', 4, 'Age of the Æsir'),
  (baldur_death_id, 'Journey to Hel', 'Hermóðr rides to Hel to negotiate Baldur''s return', 'quest', 5, 'Age of the Æsir'),
  (baldur_death_id, 'The Refusal', 'Loki in disguise refuses to weep, condemning Baldur to remain dead', 'tragedy', 6, 'Age of the Æsir');

  -- Ragnarök events
  INSERT INTO events (story_id, title, description, event_type, sequence_order, mythological_era) VALUES
  (ragnarok_id, 'Fimbulvetr Begins', 'Three winters arrive with no summer between them', 'omen', 1, 'End Times'),
  (ragnarok_id, 'Breaking of Bonds', 'Fenrir breaks free from Gleipnir, Loki escapes his chains', 'liberation', 2, 'End Times'),
  (ragnarok_id, 'Heimdall''s Warning', 'Heimdall blows Gjallarhorn to warn of the coming battle', 'omen', 3, 'End Times'),
  (ragnarok_id, 'The Final Battle', 'Gods and giants clash on the plain of Vígríðr', 'conflict', 4, 'End Times'),
  (ragnarok_id, 'Fall of Odin', 'Fenrir devours Odin', 'tragedy', 5, 'End Times'),
  (ragnarok_id, 'Thor and the Serpent', 'Thor slays Jörmungandr but succumbs to its poison', 'tragedy', 6, 'End Times'),
  (ragnarok_id, 'Mutual Destruction', 'Heimdall and Loki kill each other', 'tragedy', 7, 'End Times'),
  (ragnarok_id, 'The Burning', 'Surtr sets the world ablaze', 'destruction', 8, 'End Times'),
  (ragnarok_id, 'World Submerged', 'The world sinks into the sea', 'destruction', 9, 'End Times'),
  (ragnarok_id, 'Rebirth', 'The world rises again, renewed and fertile', 'renewal', 10, 'Post-Ragnarök');

  -- ==================== LOCATIONS ====================
  
  INSERT INTO locations (name, location_type, pantheon_id, description, latitude, longitude) VALUES
  ('Asgard', 'mythical_realm', norse_pantheon_id, 'Home of the Æsir gods, connected to Midgard by the rainbow bridge Bifröst', NULL, NULL),
  ('Valhalla', 'temple', norse_pantheon_id, 'Odin''s great hall in Asgard where half of those slain in battle reside', NULL, NULL),
  ('Midgard', 'mythical_realm', norse_pantheon_id, 'The world of humans, encircled by Jörmungandr', NULL, NULL),
  ('Niflheim', 'underworld', norse_pantheon_id, 'The realm of cold, ice, and the dead ruled by Hel', NULL, NULL),
  ('Muspelheim', 'mythical_realm', norse_pantheon_id, 'The realm of fire, home to the fire giants led by Surtr', NULL, NULL),
  ('Bifröst', 'sacred_site', norse_pantheon_id, 'The burning rainbow bridge connecting Asgard and Midgard, guarded by Heimdall', NULL, NULL),
  ('Uppsala', 'temple', norse_pantheon_id, 'Major Norse temple site in Sweden, center of worship', 59.8586, 17.6389),
  ('Gamla Uppsala', 'sacred_site', norse_pantheon_id, 'Ancient religious, political and economic center with burial mounds of legendary kings', 59.8991, 17.6364),
  ('Þingvellir', 'sacred_site', norse_pantheon_id, 'Site of the Icelandic parliament and place of ritual significance', 64.2559, -21.1296);

END $$;
