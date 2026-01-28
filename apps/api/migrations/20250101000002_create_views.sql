-- Full-text Search Materialized View
CREATE MATERIALIZED VIEW deity_search AS
SELECT 
  d.id,
  d.name,
  d.slug,
  d.alternate_names,
  d.alternate_names_text,
  d.description,
  d.domain,
  p.name as pantheon_name,
  p.culture,
  to_tsvector('english', 
    d.name || ' ' || 
    COALESCE(d.description, '') || ' ' || 
    COALESCE(d.alternate_names_text, '') || ' ' ||
    COALESCE(array_to_string(d.domain, ' '), '')
  ) as search_vector
FROM deities d
JOIN pantheons p ON d.pantheon_id = p.id;

CREATE INDEX idx_deity_search_vector ON deity_search USING GIN(search_vector);
CREATE INDEX idx_deity_search_name_trgm ON deity_search USING GIN(name gin_trgm_ops);
CREATE INDEX idx_deity_search_alt_names_trgm ON deity_search USING GIN(alternate_names_text gin_trgm_ops);

-- Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_deity_search_id_unique ON deity_search(id);
