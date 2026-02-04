-- Japanese Shinto Mythology Comprehensive Dataset
-- This seed provides major kami (deities) and stories from Shinto tradition

-- Insert Japanese Pantheon (skip if already exists)
INSERT INTO pantheons (name, slug, culture, region, time_period_start, time_period_end, description, citation_sources) VALUES
(
  'Japanese Pantheon',
  'japanese',
  'Shinto/Japanese',
  'Japanese Archipelago',
  -660,
  NULL,
  'Shinto (Way of the Kami) is the indigenous spirituality of Japan, featuring countless kami (divine spirits or gods) associated with natural phenomena, ancestors, and sacred places. Creation myths explain the formation of the Japanese islands and establish the divine ancestry of the Imperial family.',
  '{"sources": [{"title": "Kojiki", "author": "O no Yasumaro", "date": "712 CE", "type": "primary"}, {"title": "Nihon Shoki", "date": "720 CE", "type": "primary"}, {"title": "Fudoki", "date": "~713-733 CE", "type": "primary"}]}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Store pantheon ID and deity IDs for references
DO $$
DECLARE
  japanese_pantheon_id UUID;
  izanagi_id UUID;
  izanami_id UUID;
  amaterasu_id UUID;
  tsukuyomi_id UUID;
  susanoo_id UUID;
  inari_id UUID;
  hachiman_id UUID;
  raijin_id UUID;
  fujin_id UUID;
  benzaiten_id UUID;
  
  -- Stories
  creation_japan_id UUID;
  amaterasu_cave_id UUID;
  yamata_no_orochi_id UUID;
BEGIN
  -- Get pantheon ID
  SELECT id INTO japanese_pantheon_id FROM pantheons WHERE slug = 'japanese';

  -- ==================== PRIMORDIAL DEITIES ====================
  
  -- IZANAGI - Male Creator
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'Izanagi', 'izanagi', ARRAY['Izanagi-no-Mikoto'], 'male', ARRAY['creation', 'life', 'sky'], ARRAY['spear', 'jeweled spear'], 'Male primordial deity who, with Izanami, created the Japanese islands and many kami. After Izanami''s death, he performed the first purification ritual, giving birth to major deities including Amaterasu, Tsukuyomi, and Susanoo.', 'Izanagi and Izanami were commanded to solidify and create land. Standing on the Floating Bridge of Heaven, Izanagi thrust his jeweled spear into the chaos below. When he lifted it, drops fell and formed the first island. Together they descended and created the islands of Japan and many kami.', 1, '{"sources": [{"title": "Kojiki", "section": "Age of the Gods", "type": "primary"}, {"title": "Nihon Shoki", "book": "1", "type": "primary"}]}'::jsonb)
  RETURNING id INTO izanagi_id;

  -- IZANAMI - Female Creator
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'Izanami', 'izanami', ARRAY['Izanami-no-Mikoto'], 'female', ARRAY['creation', 'death', 'underworld'], ARRAY['fire', 'death'], 'Female primordial deity who created the Japanese islands and kami with Izanagi. After dying in childbirth, she became goddess of death and ruler of Yomi (underworld), creating the cycle of life and death.', 'Izanami died giving birth to the fire god Kagutsuchi. Grief-stricken, Izanagi followed her to Yomi. She had eaten the food of the underworld and could not return. When Izanagi saw her decaying form, he fled. Izanami, shamed and angry, pursued him but he sealed Yomi with a boulder.', 1, '{"sources": [{"title": "Kojiki", "section": "Age of the Gods", "type": "primary"}, {"title": "Nihon Shoki", "book": "1", "type": "primary"}]}'::jsonb)
  RETURNING id INTO izanami_id;

  -- ==================== THREE NOBLE CHILDREN ====================
  
  -- AMATERASU - Sun Goddess
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'Amaterasu', 'amaterasu', ARRAY['Amaterasu-omikami', 'Amaterasu-o-mi-kami'], 'female', ARRAY['sun', 'light', 'universe', 'agriculture', 'imperial authority'], ARRAY['mirror', 'jewel', 'sun'], 'Supreme goddess of the sun and universe. Ruler of the High Celestial Plain (Takamagahara). Divine ancestor of the Japanese Imperial family. Most important deity in Shinto, enshrined at Ise Grand Shrine. Represents order, light, and life.', 'Born from Izanagi''s left eye during his purification ritual after escaping Yomi. She emerged as a radiant goddess and was assigned to rule the heavens. Her grandson Ninigi descended to Earth, becoming ancestor of Japan''s emperors, establishing divine imperial lineage.', 1, '{"sources": [{"title": "Kojiki", "type": "primary"}, {"title": "Nihon Shoki", "book": "1", "type": "primary"}]}'::jsonb)
  RETURNING id INTO amaterasu_id;

  -- TSUKUYOMI - Moon God
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'Tsukuyomi', 'tsukuyomi', ARRAY['Tsukuyomi-no-Mikoto'], 'male', ARRAY['moon', 'night', 'time'], ARRAY['moon', 'darkness'], 'God of the moon and night. Brother of Amaterasu and Susanoo. Represents night, time, and the lunar cycle. Less prominent than his siblings but essential to cosmic balance. Ruler of the night realm.', 'Born from Izanagi''s right eye during purification. Assigned to rule the night. His relationship with Amaterasu soured when he killed the food goddess Ukemochi, causing Amaterasu to separate day and night forever, explaining why sun and moon never meet.', 2, '{"sources": [{"title": "Kojiki", "type": "primary"}, {"title": "Nihon Shoki", "book": "1", "type": "primary"}]}'::jsonb)
  RETURNING id INTO tsukuyomi_id;

  -- SUSANOO - Storm God
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'Susanoo', 'susanoo', ARRAY['Susanoo-no-Mikoto', 'Susa-no-O'], 'male', ARRAY['storms', 'sea', 'chaos', 'heroism'], ARRAY['sword', 'storm', 'dragon'], 'God of storms, sea, and chaos. Brother of Amaterasu and Tsukuyomi. Initially wild and destructive but later heroic. Famous for slaying the eight-headed dragon Yamata no Orochi. Represents raw power and transformation from chaos to order.', 'Born from Izanagi''s nose during purification. Susanoo was violent and unpredictable, devastating the land and frightening Amaterasu into hiding in a cave. Exiled from heaven, he descended to Izumo where he became a hero, slaying the dragon Yamata no Orochi and finding the sacred sword Kusanagi.', 2, '{"sources": [{"title": "Kojiki", "type": "primary"}, {"title": "Nihon Shoki", "book": "1", "type": "primary"}]}'::jsonb)
  RETURNING id INTO susanoo_id;

  -- ==================== MAJOR KAMI ====================
  
  -- INARI - God of Rice and Prosperity
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'Inari', 'inari', ARRAY['Inari Okami'], 'androgynous', ARRAY['rice', 'fertility', 'prosperity', 'foxes', 'agriculture', 'industry'], ARRAY['fox', 'rice', 'jewel', 'sword'], 'Kami of rice, fertility, agriculture, industry, and prosperity. One of the most popular kami in Japan with thousands of shrines. Androgynous or portrayed as male or female. Associated with foxes (kitsune) as messengers. Patron of merchants and farmers.', 2, '{"sources": [{"title": "Fudoki", "type": "primary"}, {"title": "Yamashiro Fudoki", "type": "primary"}]}'::jsonb)
  RETURNING id INTO inari_id;

  -- HACHIMAN - God of War
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'Hachiman', 'hachiman', ARRAY['Hachiman-jin', 'Yawata'], 'male', ARRAY['war', 'archery', 'protection', 'samurai'], ARRAY['bow', 'dove', 'torii gate'], 'Syncretic god of war, archery, and protector of Japan and warriors. Also protects farmers and fishermen. Originally Emperor Ojin deified. Patron of the Minamoto samurai clan. Represents warrior virtues and national defense.', 'Originally Emperor Ojin (reigned ~270-310 CE), deified as Hachiman. Over time, syncretized with Buddhist and Shinto elements. Became protector of Buddhism in Japan and guardian deity of warriors, especially samurai. His cult grew tremendously during medieval period.', 3, '{"sources": [{"title": "Shoku Nihongi", "type": "primary"}, {"title": "Hachiman Gudokun", "type": "primary"}]}'::jsonb)
  RETURNING id INTO hachiman_id;

  -- RAIJIN - Thunder God
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'Raijin', 'raijin', ARRAY['Raiden', 'Kaminari-sama'], 'male', ARRAY['thunder', 'lightning', 'storms'], ARRAY['drums', 'lightning', 'tomoe'], 'God of thunder, lightning, and storms. Depicted as a demon beating drums to create thunder. Works with Fujin (wind god). Feared for causing destructive storms but also respected for bringing life-giving rain. Can be protective or destructive.', 3, '{"sources": [{"title": "Kojiki", "type": "primary"}, {"title": "Nihon Shoki", "type": "primary"}]}'::jsonb)
  RETURNING id INTO raijin_id;

  -- FUJIN - Wind God
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'Fujin', 'fujin', ARRAY['Futen'], 'male', ARRAY['wind', 'air', 'storms'], ARRAY['wind bag', 'leopard skin'], 'God of wind and air. Depicted as a demon carrying a large bag of winds. Twin to Raijin. Present at the creation of the world - his winds cleared morning mists so the sun could shine. Controls gentle breezes and destructive typhoons. Protected Japan from Mongol invasions with divine winds (kamikaze).', 3, '{"sources": [{"title": "Kojiki", "type": "primary"}, {"title": "Nihon Shoki", "type": "primary"}]}'::jsonb)
  RETURNING id INTO fujin_id;

  -- BENZAITEN - Goddess of Everything That Flows
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'Benzaiten', 'benzaiten', ARRAY['Benten', 'Benzaitennyo'], 'female', ARRAY['water', 'music', 'eloquence', 'wisdom', 'arts'], ARRAY['biwa lute', 'snake', 'torii gate'], 'Goddess of everything that flows: water, time, words, speech, eloquence, music, and knowledge. One of the Seven Lucky Gods. Originated from Hindu goddess Saraswati but adapted to Japanese beliefs. Patron of artists and musicians. Associated with dragons and snakes.', 'Originally the Hindu goddess Saraswati, introduced to Japan via Buddhism. Syncretized with native water and sea kami. Became goddess of flowing things - rivers, time, music, and eloquence. Her shrines are often on islands or near water.', 4, '{"sources": [{"title": "Buddhist sutras", "type": "primary"}, {"title": "Shinto-Buddhist syncretism texts", "type": "secondary"}]}'::jsonb)
  RETURNING id INTO benzaiten_id;

  -- ==================== RELATIONSHIPS ====================
  
  -- Izanagi and Izanami
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (izanagi_id, izanami_id, 'spouse', 'Divine couple who created Japan'),
  (izanami_id, izanagi_id, 'spouse', 'Divine couple who created Japan');

  -- Three Noble Children - born from Izanagi
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (amaterasu_id, izanagi_id, 'parent', 'Amaterasu born from Izanagi''s eye'),
  (izanagi_id, amaterasu_id, 'child', 'Izanagi birthed Amaterasu'),
  (tsukuyomi_id, izanagi_id, 'parent', 'Tsukuyomi born from Izanagi''s eye'),
  (izanagi_id, tsukuyomi_id, 'child', 'Izanagi birthed Tsukuyomi'),
  (susanoo_id, izanagi_id, 'parent', 'Susanoo born from Izanagi''s nose'),
  (izanagi_id, susanoo_id, 'child', 'Izanagi birthed Susanoo');

  -- Siblings
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (amaterasu_id, tsukuyomi_id, 'sibling', 'Sun and moon siblings'),
  (tsukuyomi_id, amaterasu_id, 'sibling', 'Moon and sun siblings'),
  (amaterasu_id, susanoo_id, 'sibling', 'Sun and storm siblings'),
  (susanoo_id, amaterasu_id, 'sibling', 'Storm and sun siblings'),
  (tsukuyomi_id, susanoo_id, 'sibling', 'Moon and storm siblings'),
  (susanoo_id, tsukuyomi_id, 'sibling', 'Storm and moon siblings');

  -- Storm gods
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (raijin_id, fujin_id, 'sibling', 'Thunder and wind twin gods'),
  (fujin_id, raijin_id, 'sibling', 'Wind and thunder twin gods');

  -- ==================== STORIES ====================
  
  -- Creation of Japan
  INSERT INTO stories (id, pantheon_id, title, slug, summary, key_passages, themes, cultural_significance, story_type, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'The Creation of Japan', 'creation-japan', 'The primordial gods Izanagi and Izanami create the Japanese islands and countless kami, establishing the divine origins of Japan and its imperial line. The story includes creation, love, death, and the establishment of the cycle of life.', 'In the beginning was chaos. Izanagi and Izanami stood on the Floating Bridge of Heaven and stirred the chaos with a jeweled spear. Drops formed the first island. They descended, married, and created the islands of Japan and many kami. Izanami died giving birth to the fire god. Izanagi followed her to Yomi but fled when he saw her decay. During purification, he gave birth to Amaterasu, Tsukuyomi, and Susanoo. Amaterasu became ruler of heaven and ancestor of the imperial line.', ARRAY['creation', 'divine ancestry', 'death and rebirth', 'purification', 'cosmic order'], 'Foundation myth of Japan explaining the divine origin of the islands and imperial family. Establishes key Shinto concepts of purity, the cycle of life and death, and connection between kami and natural world. Central to Japanese national identity.', 'creation', '{"sources": [{"title": "Kojiki", "section": "Age of the Gods", "type": "primary"}, {"title": "Nihon Shoki", "book": "1-2", "type": "primary"}]}'::jsonb)
  RETURNING id INTO creation_japan_id;

  -- Amaterasu's Cave
  INSERT INTO stories (id, pantheon_id, title, slug, summary, key_passages, themes, cultural_significance, story_type, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'Amaterasu and the Heavenly Cave', 'amaterasu-cave', 'When Susanoo''s violence drives Amaterasu into hiding in a cave, the world falls into darkness. The gods devise a plan to lure her out, restoring light to the world. Explains the importance of ritual and cooperation.', 'Susanoo rampaged through heaven, destroying Amaterasu''s rice fields and defiling her halls. Horrified, Amaterasu hid in the Heavenly Rock Cave, plunging the world into darkness. Evil spirits emerged. The gods gathered and devised a plan: they placed a mirror and jewels outside, then the goddess Ame-no-Uzume performed a wild dance that made all the gods laugh. Curious about the commotion, Amaterasu peeked out. Seeing her reflection, she emerged. The gods sealed the cave so she could never hide again. Light returned to the world.', ARRAY['light and darkness', 'divine duty', 'cooperation', 'celebration', 'order restored'], 'Explains the origin of some imperial regalia (mirror and jewels). Establishes importance of Shinto rituals and sacred dance. Demonstrates that even supreme deities can be persuaded through joy and celebration. Shows interdependence of kami.', 'myth', '{"sources": [{"title": "Kojiki", "type": "primary"}, {"title": "Nihon Shoki", "book": "1", "type": "primary"}]}'::jsonb)
  RETURNING id INTO amaterasu_cave_id;

  -- Yamata no Orochi
  INSERT INTO stories (id, pantheon_id, title, slug, summary, key_passages, themes, cultural_significance, story_type, citation_sources) VALUES
  (gen_random_uuid(), japanese_pantheon_id, 'Susanoo and Yamata no Orochi', 'yamata-no-orochi', 'Exiled storm god Susanoo encounters an eight-headed, eight-tailed dragon terrorizing a family. He slays the beast and discovers the sacred sword Kusanagi in its tail, transforming from chaos-bringer to hero.', 'Exiled from heaven, Susanoo descended to Izumo and found an elderly couple weeping. They had eight daughters, but the dragon Yamata no Orochi had devoured seven, and would soon come for the last, Kushinada. Susanoo promised to save her if he could marry her. He transformed Kushinada into a comb and prepared eight vats of strong sake. When the dragon came and drank from each vat, it became drunk. Susanoo attacked, cutting the dragon to pieces. In its tail he found the sword Kusanagi, which he presented to Amaterasu. He married Kushinada and built a palace in Izumo.', ARRAY['heroism', 'transformation', 'sacrifice', 'divine weapons', 'chaos to order'], 'Explains origin of the sacred sword Kusanagi, part of imperial regalia. Shows Susanoo''s transformation from destructive force to protective hero. Establishes Izumo region''s importance. The sword symbolizes sovereign authority.', 'myth', '{"sources": [{"title": "Kojiki", "type": "primary"}, {"title": "Nihon Shoki", "book": "1", "type": "primary"}]}'::jsonb)
  RETURNING id INTO yamata_no_orochi_id;

  -- Story-Deity associations
  INSERT INTO story_deities (story_id, deity_id, role) VALUES
  (creation_japan_id, izanagi_id, 'protagonist'),
  (creation_japan_id, izanami_id, 'protagonist'),
  (creation_japan_id, amaterasu_id, 'created_deity'),
  (creation_japan_id, tsukuyomi_id, 'created_deity'),
  (creation_japan_id, susanoo_id, 'created_deity'),
  (amaterasu_cave_id, amaterasu_id, 'protagonist'),
  (amaterasu_cave_id, susanoo_id, 'antagonist'),
  (yamata_no_orochi_id, susanoo_id, 'protagonist'),
  (yamata_no_orochi_id, amaterasu_id, 'recipient_of_sword');

END $$;
