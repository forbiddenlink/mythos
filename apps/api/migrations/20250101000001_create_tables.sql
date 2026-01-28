-- Pantheons (Greek, Norse, Egyptian, etc.)
CREATE TABLE pantheons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  culture VARCHAR(255) NOT NULL,
  region VARCHAR(255),
  time_period_start INTEGER,
  time_period_end INTEGER,
  description TEXT,
  citation_sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pantheons_culture ON pantheons(culture);
CREATE INDEX idx_pantheons_region ON pantheons(region);
CREATE UNIQUE INDEX idx_pantheons_slug ON pantheons(slug);

-- Deities
CREATE TABLE deities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pantheon_id UUID REFERENCES pantheons(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  alternate_names TEXT[],
  alternate_names_text TEXT,  -- Will be updated by trigger
  gender VARCHAR(50),
  domain TEXT[],
  symbols TEXT[],
  description TEXT,
  origin_story TEXT,
  importance_rank INTEGER,
  image_url VARCHAR(500),
  citation_sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_slug_per_pantheon UNIQUE (pantheon_id, slug)
);

CREATE INDEX idx_deities_pantheon ON deities(pantheon_id);
CREATE INDEX idx_deities_domain ON deities USING GIN(domain);
CREATE INDEX idx_deities_name ON deities(name);
CREATE INDEX idx_deities_alternate ON deities USING GIN(alternate_names);
CREATE INDEX idx_deities_slug ON deities(slug);

-- Deity Relationships (Canonical Direction)
CREATE TABLE deity_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_deity_id UUID REFERENCES deities(id) ON DELETE CASCADE,
  to_deity_id UUID REFERENCES deities(id) ON DELETE CASCADE,
  relationship_type relationship_type NOT NULL,
  description TEXT,
  story_context TEXT,
  confidence_level confidence_level DEFAULT 'high',
  is_disputed BOOLEAN DEFAULT false,
  variant_group_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_deities CHECK (from_deity_id != to_deity_id),
  CONSTRAINT symmetric_order CHECK (
    relationship_type NOT IN ('spouse_of', 'sibling_of', 'enemy_of', 'ally_of')
    OR from_deity_id < to_deity_id
  ),
  CONSTRAINT unique_relationship UNIQUE (from_deity_id, to_deity_id, relationship_type)
);

CREATE INDEX idx_relationships_from ON deity_relationships(from_deity_id);
CREATE INDEX idx_relationships_to ON deity_relationships(to_deity_id);
CREATE INDEX idx_relationships_type ON deity_relationships(relationship_type);

-- Stories/Myths
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pantheon_id UUID REFERENCES pantheons(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  summary TEXT,
  key_excerpts TEXT,
  external_links JSONB,
  primary_source VARCHAR(255),
  citation_sources JSONB,
  category story_category,
  themes TEXT[],
  image_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_story_slug UNIQUE (pantheon_id, slug)
);

CREATE INDEX idx_stories_pantheon ON stories(pantheon_id);
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_themes ON stories USING GIN(themes);
CREATE INDEX idx_stories_search ON stories USING GIN(to_tsvector('english', title || ' ' || COALESCE(summary, '')));

-- Story Participants (deities in stories)
CREATE TABLE story_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  deity_id UUID REFERENCES deities(id) ON DELETE CASCADE,
  role VARCHAR(100),
  importance INTEGER,
  CONSTRAINT unique_story_deity UNIQUE (story_id, deity_id)
);

CREATE INDEX idx_participants_story ON story_participants(story_id);
CREATE INDEX idx_participants_deity ON story_participants(deity_id);

-- Timeline Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_type event_type,
  sequence_order INTEGER,
  mythological_era VARCHAR(100),
  citation_sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_story ON events(story_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_sequence ON events(story_id, sequence_order);

-- Geographic Locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location_type location_type,
  pantheon_id UUID REFERENCES pantheons(id),
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  -- geog column commented out - will add in Phase 4 when PostGIS is available
  -- geog GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
  --   CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
  --   THEN ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography 
  --   END
  -- ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_pantheon ON locations(pantheon_id);
CREATE INDEX idx_locations_type ON locations(location_type);
-- PostGIS index commented out - will add in Phase 4
-- CREATE INDEX idx_locations_geog ON locations USING GIST(geog);

-- Deity-Location Associations
CREATE TABLE deity_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deity_id UUID REFERENCES deities(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  association_type association_type,
  description TEXT,
  CONSTRAINT unique_deity_location UNIQUE (deity_id, location_id, association_type)
);

CREATE INDEX idx_deity_locations_deity ON deity_locations(deity_id);
CREATE INDEX idx_deity_locations_location ON deity_locations(location_id);
