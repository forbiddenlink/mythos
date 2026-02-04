-- Hindu Mythology Comprehensive Dataset
-- This seed provides major deities and stories from the Hindu tradition

-- Insert Hindu Pantheon (skip if already exists)
INSERT INTO pantheons (name, slug, culture, region, time_period_start, time_period_end, description, citation_sources) VALUES
(
  'Hindu Pantheon',
  'hindu',
  'Hindu/Vedic',
  'Indian Subcontinent',
  -1500,
  NULL,
  'Hindu mythology encompasses thousands of years of religious and philosophical tradition from the Indian subcontinent. Centered on the Trimurti (Brahma the Creator, Vishnu the Preserver, and Shiva the Destroyer) and featuring countless gods, goddesses, and avatars, Hindu mythology explores themes of dharma, karma, and the cyclical nature of existence.',
  '{"sources": [{"title": "Rigveda", "date": "~1500-1200 BCE", "type": "primary"}, {"title": "Mahabharata", "author": "Vyasa", "date": "~400 BCE-400 CE", "type": "primary"}, {"title": "Ramayana", "author": "Valmiki", "date": "~500-100 BCE", "type": "primary"}, {"title": "Bhagavad Gita", "date": "~200 BCE-200 CE", "type": "primary"}, {"title": "Puranas", "date": "~300-1000 CE", "type": "primary"}]}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Store pantheon ID and deity IDs for references
DO $$
DECLARE
  hindu_pantheon_id UUID;
  brahma_id UUID;
  vishnu_id UUID;
  shiva_id UUID;
  lakshmi_id UUID;
  saraswati_id UUID;
  parvati_id UUID;
  durga_id UUID;
  kali_id UUID;
  ganesha_id UUID;
  hanuman_id UUID;
  rama_id UUID;
  krishna_id UUID;
  indra_id UUID;
  agni_id UUID;
  
  -- Stories
  ramayana_id UUID;
  mahabharata_id UUID;
  churning_ocean_id UUID;
  ganesha_birth_id UUID;
BEGIN
  -- Get pantheon ID
  SELECT id INTO hindu_pantheon_id FROM pantheons WHERE slug = 'hindu';

  -- ==================== THE TRIMURTI ====================
  
  -- BRAHMA - The Creator
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Brahma', 'brahma', ARRAY['Pitamaha', 'Svayambhu'], 'male', ARRAY['creation', 'knowledge', 'time', 'universe'], ARRAY['lotus', 'four faces', 'four arms', 'prayer beads', 'water pot'], 'The creator god and first member of the Trimurti. Brahma created the universe and all creatures. Depicted with four heads facing the four directions, representing omniscience. Though central to cosmology, he has few temples dedicated to him.', 'Brahma emerged from a golden egg (Hiranyagarbha) or from a lotus growing from Vishnu''s navel. He created the world and all beings, including the gods and sages. His four heads were created to watch his consort Saraswati as she moved around him.', 1, '{"sources": [{"title": "Brahma Purana", "type": "primary"}, {"title": "Shatapatha Brahmana", "type": "primary"}]}'::jsonb)
  RETURNING id INTO brahma_id;

  -- VISHNU - The Preserver
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Vishnu', 'vishnu', ARRAY['Narayana', 'Hari', 'Vasudeva'], 'male', ARRAY['preservation', 'protection', 'dharma', 'cosmic order'], ARRAY['lotus', 'conch', 'discus', 'mace', 'Garuda'], 'The preserver and protector of the universe, second member of the Trimurti. Vishnu maintains cosmic order (dharma) and appears in various avatars to restore balance when evil threatens. Most famously incarnated as Rama and Krishna.', 'Vishnu reclines on the cosmic serpent Shesha in the ocean of milk. He is eternal and omnipresent. When dharma declines and chaos increases, Vishnu descends to Earth in different incarnations (avatars) to restore order.', 1, '{"sources": [{"title": "Vishnu Purana", "type": "primary"}, {"title": "Bhagavata Purana", "type": "primary"}, {"title": "Rigveda", "book": "1.154", "type": "primary"}]}'::jsonb)
  RETURNING id INTO vishnu_id;

  -- SHIVA - The Destroyer
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Shiva', 'shiva', ARRAY['Mahadeva', 'Rudra', 'Nataraja', 'Maheshvara'], 'male', ARRAY['destruction', 'transformation', 'meditation', 'time', 'dance'], ARRAY['third eye', 'trident', 'crescent moon', 'snake', 'drum'], 'The destroyer and transformer, third member of the Trimurti. Shiva destroys the universe at the end of each cosmic cycle to allow recreation. God of meditation, yoga, and the arts. His cosmic dance (Tandava) represents the cycles of creation and destruction.', 'Shiva is eternal and was never born. He manifested in various forms throughout cosmic time. He lives on Mount Kailash with his consort Parvati and their children Ganesha and Kartikeya. His meditation sustains the universe.', 1, '{"sources": [{"title": "Shiva Purana", "type": "primary"}, {"title": "Linga Purana", "type": "primary"}, {"title": "Rigveda", "type": "primary"}]}'::jsonb)
  RETURNING id INTO shiva_id;

  -- ==================== MAJOR GODDESSES ====================
  
  -- LAKSHMI - Goddess of Wealth
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Lakshmi', 'lakshmi', ARRAY['Sri', 'Mahalakshmi'], 'female', ARRAY['wealth', 'fortune', 'prosperity', 'beauty'], ARRAY['lotus', 'gold coins', 'owl', 'elephant'], 'Goddess of wealth, fortune, prosperity, and beauty. Consort of Vishnu, she incarnates alongside him in his avatars (as Sita with Rama, Rukmini with Krishna). She represents both material and spiritual prosperity.', 'Lakshmi emerged from the churning of the cosmic ocean (Samudra Manthan), standing on a lotus flower. The gods and demons churned the ocean to obtain the nectar of immortality, and Lakshmi arose as one of the treasures, choosing Vishnu as her consort.', 2, '{"sources": [{"title": "Vishnu Purana", "type": "primary"}, {"title": "Bhagavata Purana", "book": "8", "type": "primary"}]}'::jsonb)
  RETURNING id INTO lakshmi_id;

  -- SARASWATI - Goddess of Knowledge
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Saraswati', 'saraswati', ARRAY['Vac', 'Bharati'], 'female', ARRAY['knowledge', 'music', 'arts', 'wisdom', 'learning'], ARRAY['veena', 'books', 'lotus', 'swan'], 'Goddess of knowledge, music, arts, wisdom, and learning. Consort of Brahma. She invented Sanskrit and the Devanagari script. Patron of students, artists, and scholars. Represents the free flow of wisdom and consciousness.', 'Saraswati emerged from Brahma''s mouth or was created by him. She represents the feminine creative power (shakti) of Brahma. Originally also a river goddess, she embodies the flow of knowledge and consciousness.', 2, '{"sources": [{"title": "Rigveda", "book": "6.61", "type": "primary"}, {"title": "Saraswati Purana", "type": "primary"}]}'::jsonb)
  RETURNING id INTO saraswati_id;

  -- PARVATI - Goddess of Power
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Parvati', 'parvati', ARRAY['Uma', 'Gauri', 'Shakti'], 'female', ARRAY['power', 'fertility', 'love', 'devotion', 'divine energy'], ARRAY['lion', 'lotus', 'trident'], 'Goddess of power, fertility, love, and devotion. Consort of Shiva and mother of Ganesha and Kartikeya. Represents Shakti, the divine feminine creative power. Reincarnation of Shiva''s first wife Sati.', 'Parvati is the reincarnation of Sati, who immolated herself when her father insulted Shiva. Born as the daughter of the mountain king Himavan, she performed severe penance to win Shiva''s love and became his consort, tempering his ascetic nature with devotion and fertility.', 2, '{"sources": [{"title": "Shiva Purana", "type": "primary"}, {"title": "Devi Bhagavata Purana", "type": "primary"}]}'::jsonb)
  RETURNING id INTO parvati_id;

  -- DURGA - Warrior Goddess
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Durga', 'durga', ARRAY['Devi', 'Shakti', 'Mahishasuramardini'], 'female', ARRAY['war', 'protection', 'strength', 'victory'], ARRAY['lion', 'tiger', 'weapons', 'trident'], 'Fierce warrior goddess and protector of dharma. Form of Parvati who slayed the buffalo demon Mahishasura. Depicted riding a lion or tiger with multiple arms wielding divine weapons. Celebrated during Navaratri festival.', 'When the buffalo demon Mahishasura threatened the gods, they combined their powers to create Durga. Each god gave her a weapon - Shiva''s trident, Vishnu''s discus, Indra''s thunderbolt. She fought Mahishasura for nine days and nights before defeating him.', 2, '{"sources": [{"title": "Devi Mahatmya", "type": "primary"}, {"title": "Markandeya Purana", "chapters": "81-93", "type": "primary"}]}'::jsonb)
  RETURNING id INTO durga_id;

  -- KALI - Goddess of Time and Change
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Kali', 'kali', ARRAY['Mahakali', 'Bhadrakali', 'Kalika'], 'female', ARRAY['time', 'change', 'death', 'destruction', 'liberation'], ARRAY['sword', 'severed head', 'skull', 'blood'], 'Fierce goddess of time, change, death, and ultimate reality. A form of Parvati/Durga. Despite her terrifying appearance, she destroys evil and liberates devotees from ego and illusion. Represents the inevitable passage of time.', 'Kali emerged from Durga''s forehead during battle with demons. Her rage was so fierce she began destroying everything. Shiva lay beneath her feet to calm her. Kali is black, representing the void from which all is born and to which all returns.', 3, '{"sources": [{"title": "Devi Mahatmya", "type": "primary"}, {"title": "Kalika Purana", "type": "primary"}]}'::jsonb)
  RETURNING id INTO kali_id;

  -- ==================== MAJOR DEITIES ====================
  
  -- GANESHA - Elephant God
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Ganesha', 'ganesha', ARRAY['Ganapati', 'Vinayaka', 'Vighnaharta'], 'male', ARRAY['wisdom', 'beginnings', 'obstacles', 'intellect', 'arts'], ARRAY['elephant head', 'mouse', 'modak', 'axe', 'lotus'], 'Elephant-headed god of wisdom, new beginnings, and remover of obstacles. Son of Shiva and Parvati. Worshipped before any new venture. Patron of arts and sciences, and deity of intellect and wisdom.', 'Parvati created Ganesha from sandalwood paste to guard her while bathing. When Shiva tried to enter and Ganesha blocked him, Shiva beheaded the boy. To console Parvati, Shiva replaced Ganesha''s head with that of the first creature he found - an elephant.', 2, '{"sources": [{"title": "Ganesha Purana", "type": "primary"}, {"title": "Mudgala Purana", "type": "primary"}, {"title": "Shiva Purana", "type": "primary"}]}'::jsonb)
  RETURNING id INTO ganesha_id;

  -- HANUMAN - Monkey God
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Hanuman', 'hanuman', ARRAY['Anjaneya', 'Maruti', 'Bajrangbali'], 'male', ARRAY['strength', 'devotion', 'service', 'courage', 'learning'], ARRAY['mace', 'mountain', 'monkey'], 'Monkey deity symbolizing strength, devotion, and selfless service. Greatest devotee of Rama and central figure in the Ramayana. Son of the wind god Vayu. Represents ideal devotee and servant.', 'Son of Anjana and the wind god Vayu. As a child, he tried to eat the sun thinking it was a fruit. Indra struck him with his thunderbolt, but Vayu withdrew all air from the world until Hanuman was revived and blessed by the gods with immortality and great powers.', 3, '{"sources": [{"title": "Ramayana", "author": "Valmiki", "books": "4-6", "type": "primary"}, {"title": "Hanuman Chalisa", "author": "Tulsidas", "type": "primary"}]}'::jsonb)
  RETURNING id INTO hanuman_id;

  -- RAMA - Avatar of Vishnu
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Rama', 'rama', ARRAY['Ramachandra', 'Maryada Purushottama'], 'male', ARRAY['dharma', 'virtue', 'duty', 'ideal kingship'], ARRAY['bow', 'arrow', 'lotus'], 'Seventh avatar of Vishnu and hero of the Ramayana epic. Ideal man, son, husband, and king. His life demonstrates perfect adherence to dharma (duty). Defeated the demon king Ravana to rescue his wife Sita.', 'Born as prince of Ayodhya to King Dasharatha. Exiled for 14 years, during which his wife Sita was kidnapped by Ravana. With the help of Hanuman and an army of monkeys, he defeated Ravana and returned to rule as ideal king.', 2, '{"sources": [{"title": "Ramayana", "author": "Valmiki", "type": "primary"}, {"title": "Ramcharitmanas", "author": "Tulsidas", "type": "primary"}]}'::jsonb)
  RETURNING id INTO rama_id;

  -- KRISHNA - Avatar of Vishnu
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Krishna', 'krishna', ARRAY['Govinda', 'Gopala', 'Vasudeva'], 'male', ARRAY['love', 'compassion', 'tenderness', 'divine play'], ARRAY['flute', 'peacock feather', 'butter pot', 'cow'], 'Eighth avatar of Vishnu and central deity in many Hindu traditions. As a child, a playful cowherd; as a youth, divine lover of the gopis; as an adult, prince and charioteer who spoke the Bhagavad Gita. Represents divine love and the highest reality.', 'Born to Devaki and Vasudeva but raised by foster parents Yashoda and Nanda to protect him from his evil uncle Kamsa. As a child he performed many miracles. In the Mahabharata war, he served as Arjuna''s charioteer and revealed the Bhagavad Gita.', 1, '{"sources": [{"title": "Bhagavata Purana", "books": "10-11", "type": "primary"}, {"title": "Bhagavad Gita", "type": "primary"}, {"title": "Mahabharata", "type": "primary"}]}'::jsonb)
  RETURNING id INTO krishna_id;

  -- INDRA - King of Gods
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, origin_story, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Indra', 'indra', ARRAY['Shakra', 'Purandara'], 'male', ARRAY['thunder', 'rain', 'storms', 'heaven', 'war'], ARRAY['thunderbolt', 'elephant', 'rainbow'], 'King of the gods (Devas) and lord of heaven (Svarga). God of thunder, rain, and war. Slayer of the dragon Vritra. Rides the white elephant Airavata. Chief deity of the Rigveda, though his importance diminished in later texts.', 'Indra was born to the sky god Dyaus and earth goddess Prithvi. He became king of the gods by defeating the dragon Vritra who had imprisoned the waters. His weapon is the thunderbolt (Vajra) made by the divine craftsman Tvashtr.', 3, '{"sources": [{"title": "Rigveda", "books": "1-10", "type": "primary"}, {"title": "Indra Purana", "type": "primary"}]}'::jsonb)
  RETURNING id INTO indra_id;

  -- AGNI - Fire God
  INSERT INTO deities (id, pantheon_id, name, slug, alternate_names, gender, domain, symbols, description, importance_rank, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Agni', 'agni', ARRAY['Vahni', 'Pavaka'], 'male', ARRAY['fire', 'sacrifice', 'purification', 'messenger'], ARRAY['flame', 'ram', 'seven tongues'], 'God of fire and messenger between gods and humans. Central to Vedic ritual, he carries offerings to the gods. Represents the sacrificial fire, digestive fire, and cosmic fire. Witness to all vows and marriages.', 4, '{"sources": [{"title": "Rigveda", "books": "1-10", "type": "primary"}, {"title": "Agni Purana", "type": "primary"}]}'::jsonb)
  RETURNING id INTO agni_id;

  -- ==================== RELATIONSHIPS ====================
  
  -- Trimurti consorts
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (brahma_id, saraswati_id, 'spouse', 'Divine couple - Creator and Knowledge'),
  (saraswati_id, brahma_id, 'spouse', 'Divine couple - Creator and Knowledge'),
  (vishnu_id, lakshmi_id, 'spouse', 'Divine couple - Preserver and Prosperity'),
  (lakshmi_id, vishnu_id, 'spouse', 'Divine couple - Preserver and Prosperity'),
  (shiva_id, parvati_id, 'spouse', 'Divine couple - Destroyer and Power'),
  (parvati_id, shiva_id, 'spouse', 'Divine couple - Destroyer and Power');

  -- Shiva and Parvati's children
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (ganesha_id, shiva_id, 'parent', 'Ganesha is son of Shiva'),
  (shiva_id, ganesha_id, 'child', 'Shiva is father of Ganesha'),
  (ganesha_id, parvati_id, 'parent', 'Ganesha is son of Parvati'),
  (parvati_id, ganesha_id, 'child', 'Parvati is mother of Ganesha');

  -- Parvati's forms
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (durga_id, parvati_id, 'manifestation', 'Durga is warrior form of Parvati'),
  (kali_id, durga_id, 'manifestation', 'Kali emerged from Durga'),
  (kali_id, parvati_id, 'manifestation', 'Kali is fierce form of Parvati');

  -- Vishnu avatars
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (rama_id, vishnu_id, 'manifestation', 'Rama is seventh avatar of Vishnu'),
  (krishna_id, vishnu_id, 'manifestation', 'Krishna is eighth avatar of Vishnu');

  -- Rama and Hanuman
  INSERT INTO relationships (deity_id_1, deity_id_2, relationship_type, description) VALUES
  (hanuman_id, rama_id, 'devotee', 'Hanuman is greatest devotee of Rama'),
  (rama_id, hanuman_id, 'deity', 'Rama is lord of Hanuman');

  -- ==================== STORIES ====================
  
  -- The Ramayana
  INSERT INTO stories (id, pantheon_id, title, slug, summary, key_passages, themes, cultural_significance, story_type, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'The Ramayana', 'ramayana', 'Epic tale of Prince Rama''s exile, the abduction of his wife Sita by demon king Ravana, and the great war to rescue her. Demonstrates the ideals of dharma, duty, devotion, and righteous conduct.', 'Rama, heir to Ayodhya, is exiled for 14 years. In the forest, Ravana kidnaps Sita. Rama allies with Hanuman and the monkey king Sugriva. Hanuman finds Sita in Lanka. A great war ensues. RAMA kills Ravana with a divine arrow. Sita proves her purity through fire ordeal. Rama returns to Ayodhya and rules as ideal king.', ARRAY['dharma', 'duty', 'devotion', 'righteousness', 'ideal kingship', 'loyalty'], 'One of Hinduism''s greatest epics, the Ramayana establishes ideals of behavior. Rama represents the perfect man, son, husband, and king. Performed annually during Dussehra festival. Influential across South and Southeast Asia.', 'epic', '{"sources": [{"title": "Ramayana", "author": "Valmiki", "date": "~500-100 BCE", "type": "primary"}, {"title": "Ramcharitmanas", "author": "Tulsidas", "date": "1574 CE", "type": "primary"}]}'::jsonb)
  RETURNING id INTO ramayana_id;

  -- The Mahabharata
  INSERT INTO stories (id, pantheon_id, title, slug, summary, key_passages, themes, cultural_significance, story_type, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'The Mahabharata', 'mahabharata', 'Epic saga of the conflict between the Pandavas and Kauravas for the throne of Hastinapura, culminating in the great Kurukshetra war. Contains the Bhagavad Gita, Krishna''s discourse on dharma and yoga to the warrior Arjuna.', 'The five Pandava brothers and hundred Kaurava cousins compete for the throne. After the Kauravas cheat the Pandavas in a dice game, the Pandavas are exiled. War becomes inevitable. Before battle, Krishna reveals the Bhagavad Gita to Arjuna. The war lasts 18 days. The Pandavas win but at tremendous cost - nearly all warriors die. The epic explores dharma in complex moral situations.', ARRAY['dharma', 'duty vs emotion', 'cosmic order', 'fate vs free will', 'righteous war'], 'Longest epic poem ever written (100,000 verses). Contains the Bhagavad Gita, one of Hinduism''s most sacred texts. Explores complex moral questions with no easy answers. Foundation for understanding dharma in difficult situations.', 'epic', '{"sources": [{"title": "Mahabharata", "author": "Vyasa", "date": "~400 BCE-400 CE", "type": "primary"}, {"title": "Bhagavad Gita", "date": "~200 BCE-200 CE", "type": "primary"}]}'::jsonb)
  RETURNING id INTO mahabharata_id;

  -- Churning of the Ocean
  INSERT INTO stories (id, pantheon_id, title, slug, summary, key_passages, themes, cultural_significance, story_type, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'Samudra Manthan - Churning of the Ocean', 'churning-ocean', 'Gods and demons cooperate to churn the cosmic ocean to obtain amrita (nectar of immortality) and other treasures. Various precious things emerge, including Lakshmi, before finally the nectar appears.', 'The gods lost their immortality and power. Vishnu advised them to churn the cosmic ocean. Using Mount Mandara as a churning rod and the serpent Vasuki as rope, gods and demons churned for thousands of years. Shiva drank the poison that emerged, turning his throat blue. Lakshmi arose from the ocean. Finally amrita appeared. Vishnu disguised as Mohini tricked the demons and gave the nectar only to the gods.', ARRAY['cooperation', 'sacrifice', 'perseverance', 'cosmic balance', 'good vs evil'], 'Explains the origin of many important elements in Hindu cosmology. Demonstrates that even enemies must cooperate for greater good. Shiva''s sacrifice saved the universe. Central myth explaining Lakshmi''s emergence.', 'myth', '{"sources": [{"title": "Bhagavata Purana", "book": "8.5-8.12", "type": "primary"}, {"title": "Vishnu Purana", "book": "1.9", "type": "primary"}]}'::jsonb)
  RETURNING id INTO churning_ocean_id;

  -- Birth of Ganesha
  INSERT INTO stories (id, pantheon_id, title, slug, summary, key_passages, themes, cultural_significance, story_type, citation_sources) VALUES
  (gen_random_uuid(), hindu_pantheon_id, 'The Birth of Ganesha', 'ganesha-birth', 'Story of how Ganesha was created by Parvati and received his elephant head from Shiva, becoming the remover of obstacles and god of new beginnings.', 'Parvati wanted a guard while bathing. She created a boy from sandalwood paste and breathed life into him. She instructed him to let no one enter. When Shiva returned and tried to enter, Ganesha blocked him. Enraged, Shiva beheaded the boy. Parvati grieved terribly. To appease her, Shiva promised to replace the head with the first creature found - an elephant. Ganesha was revived with an elephant head and blessed by all gods. Shiva made him lord of obstacles and leader of his ganas (attendants).', ARRAY['family conflict', 'transformation', 'divine blessing', 'new beginnings'], 'Explains Ganesha''s elephant head and his role as remover of obstacles. Demonstrates themes of destruction and recreation. Ganesha is worshipped at start of any new venture. One of Hinduism''s most beloved deities.', 'myth', '{"sources": [{"title": "Shiva Purana", "type": "primary"}, {"title": "Brahma Vaivarta Purana", "type": "primary"}]}'::jsonb)
  RETURNING id INTO ganesha_birth_id;

  -- Story-Deity associations
  INSERT INTO story_deities (story_id, deity_id, role) VALUES
  (ramayana_id, rama_id, 'protagonist'),
  (ramayana_id, vishnu_id, 'manifestation_source'),
  (ramayana_id, hanuman_id, 'ally'),
  (mahabharata_id, krishna_id, 'divine_guide'),
  (mahabharata_id, vishnu_id, 'manifestation_source'),
  (churning_ocean_id, vishnu_id, 'divine_guide'),
  (churning_ocean_id, shiva_id, 'savior'),
  (churning_ocean_id, lakshmi_id, 'emerged_deity'),
  (ganesha_birth_id, ganesha_id, 'protagonist'),
  (ganesha_birth_id, shiva_id, 'parent'),
  (ganesha_birth_id, parvati_id, 'parent');

END $$;
