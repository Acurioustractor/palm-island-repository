-- Photo Collections & Smart Folders Migration
-- Creates tables for organizing media files into collections and smart folders

-- ============================================================================
-- PHOTO COLLECTIONS (Manual Folders)
-- ============================================================================

CREATE TABLE IF NOT EXISTS photo_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  item_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

COMMENT ON TABLE photo_collections IS 'Manual photo collections (like traditional folders)';
COMMENT ON COLUMN photo_collections.slug IS 'URL-friendly identifier';
COMMENT ON COLUMN photo_collections.cover_image_id IS 'Featured image for collection';
COMMENT ON COLUMN photo_collections.item_count IS 'Cached count of items (updated by trigger)';

-- ============================================================================
-- COLLECTION ITEMS (Many-to-Many relationship)
-- ============================================================================

CREATE TABLE IF NOT EXISTS collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES photo_collections(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(collection_id, media_id)
);

COMMENT ON TABLE collection_items IS 'Photos/media assigned to collections';
COMMENT ON COLUMN collection_items.sort_order IS 'Manual ordering within collection';

-- ============================================================================
-- SMART FOLDERS (Auto-Generated Dynamic Collections)
-- ============================================================================

CREATE TABLE IF NOT EXISTS smart_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Folder',
  color TEXT DEFAULT 'blue',
  query_rules JSONB NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

COMMENT ON TABLE smart_folders IS 'Dynamic collections that auto-update based on filter rules';
COMMENT ON COLUMN smart_folders.query_rules IS 'JSONB filter criteria (e.g., tags, dates, locations)';
COMMENT ON COLUMN smart_folders.is_system IS 'True for pre-built system folders, false for user-created';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_media ON collection_items(media_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_sort ON collection_items(collection_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_photo_collections_tenant ON photo_collections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_photo_collections_created ON photo_collections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_collections_slug ON photo_collections(slug);

CREATE INDEX IF NOT EXISTS idx_smart_folders_tenant ON smart_folders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_smart_folders_system ON smart_folders(is_system);

-- Media files indexes (for smart folder queries)
CREATE INDEX IF NOT EXISTS idx_media_files_tags ON media_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_files_location ON media_files(location);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update collection item count
CREATE OR REPLACE FUNCTION update_collection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photo_collections
    SET item_count = item_count + 1,
        updated_at = NOW()
    WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photo_collections
    SET item_count = item_count - 1,
        updated_at = NOW()
    WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS collection_count_trigger ON collection_items;
CREATE TRIGGER collection_count_trigger
AFTER INSERT OR DELETE ON collection_items
FOR EACH ROW EXECUTE FUNCTION update_collection_count();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_photo_collections_updated_at ON photo_collections;
CREATE TRIGGER update_photo_collections_updated_at
BEFORE UPDATE ON photo_collections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE photo_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_folders ENABLE ROW LEVEL SECURITY;

-- Photo Collections Policies
DROP POLICY IF EXISTS "Public collections viewable by all" ON photo_collections;
CREATE POLICY "Public collections viewable by all"
ON photo_collections FOR SELECT
USING (is_public = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Service role full access to collections" ON photo_collections;
CREATE POLICY "Service role full access to collections"
ON photo_collections FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can manage their own collections" ON photo_collections;
CREATE POLICY "Users can manage their own collections"
ON photo_collections FOR ALL
USING (auth.uid() = created_by);

-- Collection Items Policies
DROP POLICY IF EXISTS "Collection items viewable" ON collection_items;
CREATE POLICY "Collection items viewable"
ON collection_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Service role full access to collection items" ON collection_items;
CREATE POLICY "Service role full access to collection items"
ON collection_items FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can manage items in their collections" ON collection_items;
CREATE POLICY "Users can manage items in their collections"
ON collection_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM photo_collections
    WHERE photo_collections.id = collection_items.collection_id
    AND photo_collections.created_by = auth.uid()
  )
);

-- Smart Folders Policies
DROP POLICY IF EXISTS "Smart folders viewable by all" ON smart_folders;
CREATE POLICY "Smart folders viewable by all"
ON smart_folders FOR SELECT
USING (is_system = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Service role full access to smart folders" ON smart_folders;
CREATE POLICY "Service role full access to smart folders"
ON smart_folders FOR ALL
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can manage their own smart folders" ON smart_folders;
CREATE POLICY "Users can manage their own smart folders"
ON smart_folders FOR ALL
USING (auth.uid() = created_by AND is_system = false);

-- ============================================================================
-- SEED DATA - Pre-built System Smart Folders
-- ============================================================================

-- Insert system smart folders (will be skipped if they already exist)
INSERT INTO smart_folders (name, slug, description, icon, color, query_rules, is_system)
VALUES
  (
    'Elder Stories',
    'elder-stories',
    'Photos tagged with elder or related to elder storytelling',
    'Users',
    'amber',
    '{"filters": [{"field": "tags", "operator": "contains", "value": "elder"}], "match": "any"}',
    true
  ),
  (
    'This Month',
    'this-month',
    'Photos uploaded this month',
    'Calendar',
    'blue',
    '{"filters": [{"field": "created_at", "operator": ">=", "value": "start_of_month"}], "match": "all"}',
    true
  ),
  (
    'Needs Tagging',
    'needs-tagging',
    'Photos without tags',
    'AlertCircle',
    'red',
    '{"filters": [{"field": "tags", "operator": "empty"}], "match": "all"}',
    true
  ),
  (
    'High Quality',
    'high-quality',
    'Photos with quality score >= 80',
    'Star',
    'purple',
    '{"filters": [{"field": "quality_score", "operator": ">=", "value": 80}], "match": "all"}',
    true
  ),
  (
    'Community Events',
    'community-events',
    'Photos tagged with community or event',
    'Users',
    'green',
    '{"filters": [{"field": "tags", "operator": "contains_any", "value": ["community", "event"]}], "match": "any"}',
    true
  ),
  (
    'Cultural Activities',
    'cultural-activities',
    'Photos tagged with culture or cultural',
    'Heart',
    'pink',
    '{"filters": [{"field": "tags", "operator": "contains_any", "value": ["culture", "cultural", "tradition"]}], "match": "any"}',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get smart folder results (placeholder for now, will implement in app)
CREATE OR REPLACE FUNCTION get_smart_folder_media(folder_slug TEXT)
RETURNS TABLE (
  id UUID,
  filename TEXT,
  public_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- This is a placeholder - actual filtering logic will be in the application
  -- since JSONB query rules need dynamic SQL generation
  RETURN QUERY
  SELECT m.id, m.filename, m.public_url, m.created_at
  FROM media_files m
  WHERE m.deleted_at IS NULL
  ORDER BY m.created_at DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_smart_folder_media IS 'Gets media files matching smart folder rules (placeholder)';

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON photo_collections TO authenticated;
GRANT SELECT ON collection_items TO authenticated;
GRANT SELECT ON smart_folders TO authenticated;

-- Grant full access to service role
GRANT ALL ON photo_collections TO service_role;
GRANT ALL ON collection_items TO service_role;
GRANT ALL ON smart_folders TO service_role;
