-- Trigger function to update alternate_names_text from alternate_names array
CREATE OR REPLACE FUNCTION update_alternate_names_text()
RETURNS TRIGGER AS $$
BEGIN
  NEW.alternate_names_text = array_to_string(NEW.alternate_names, ' ');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get bidirectional relationships with explicit inverse mapping
CREATE OR REPLACE FUNCTION get_deity_relationships(deity_uuid UUID)
RETURNS TABLE(
  related_deity_id UUID,
  relationship VARCHAR(100),
  direction VARCHAR(10),
  confidence_level confidence_level,
  is_disputed BOOLEAN
) AS $$
  -- Outbound relationships
  SELECT 
    to_deity_id, 
    relationship_type::text, 
    'outbound',
    confidence_level,
    is_disputed
  FROM deity_relationships 
  WHERE from_deity_id = deity_uuid
  
  UNION ALL
  
  -- Inbound relationships with explicit inverse mapping
  SELECT 
    from_deity_id,
    CASE relationship_type
      WHEN 'parent_of' THEN 'child_of'
      WHEN 'created' THEN 'creator_of'
      WHEN 'killed' THEN 'killed_by'
      WHEN 'transformed' THEN 'transformed_by'
      WHEN 'taught' THEN 'student_of'
      WHEN 'served' THEN 'served_by'
      -- Symmetric relationships return as-is
      WHEN 'spouse_of' THEN 'spouse_of'
      WHEN 'sibling_of' THEN 'sibling_of'
      WHEN 'enemy_of' THEN 'enemy_of'
      WHEN 'ally_of' THEN 'ally_of'
    END,
    'inbound',
    confidence_level,
    is_disputed
  FROM deity_relationships 
  WHERE to_deity_id = deity_uuid;
$$ LANGUAGE SQL;

-- Trigger function for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all mutable tables
CREATE TRIGGER trg_pantheons_updated_at
  BEFORE UPDATE ON pantheons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Apply alternate_names_text trigger before insert or update
CREATE TRIGGER trg_deities_alternate_names_text
  BEFORE INSERT OR UPDATE OF alternate_names ON deities
  FOR EACH ROW EXECUTE FUNCTION update_alternate_names_text();

CREATE TRIGGER trg_deities_updated_at
  BEFORE UPDATE ON deities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_deity_relationships_updated_at
  BEFORE UPDATE ON deity_relationships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
