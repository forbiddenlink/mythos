-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- For gen_random_uuid()
-- PostGIS commented out - will add in Phase 4 when needed for maps
-- CREATE EXTENSION IF NOT EXISTS postgis;       -- For geospatial queries
CREATE EXTENSION IF NOT EXISTS pg_trgm;       -- For fuzzy search
CREATE EXTENSION IF NOT EXISTS unaccent;      -- For accent-insensitive search

-- Confidence level ENUM for disputed/variant content
CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');

-- Relationship type ENUM for type safety
CREATE TYPE relationship_type AS ENUM (
  'parent_of',      -- inverse: child_of
  'spouse_of',      -- symmetric
  'sibling_of',     -- symmetric
  'enemy_of',       -- symmetric
  'ally_of',        -- symmetric
  'created',        -- inverse: creator_of
  'killed',         -- inverse: killed_by
  'transformed',    -- inverse: transformed_by
  'taught',         -- inverse: student_of
  'served'          -- inverse: served_by
);

-- Story category ENUM
CREATE TYPE story_category AS ENUM (
  'creation', 'hero_journey', 'war', 'love', 'tragedy', 
  'transformation', 'underworld', 'trickster', 'flood', 'cosmogony'
);

-- Event type ENUM
CREATE TYPE event_type AS ENUM (
  'birth', 'death', 'battle', 'creation', 'transformation',
  'marriage', 'prophecy', 'quest', 'betrayal', 'ascension'
);

-- Location type ENUM
CREATE TYPE location_type AS ENUM (
  'sacred_site', 'realm', 'city', 'mountain', 'underworld',
  'temple', 'oracle', 'island', 'river', 'battlefield'
);

-- Association type ENUM
CREATE TYPE association_type AS ENUM (
  'born_at', 'died_at', 'rules_over', 'temple_at', 
  'associated_with', 'worshipped_at', 'imprisoned_at', 'transformed_at'
);
