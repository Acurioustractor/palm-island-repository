-- Wiki Infrastructure Migration
-- Adds version control, backlinks, categories, and knowledge graph support

-- ============================================================================
-- Version Control
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'story', 'profile', etc.
  content_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  edited_by UUID REFERENCES profiles(id),
  edited_at TIMESTAMP DEFAULT NOW(),
  edit_summary TEXT,
  content_snapshot JSONB,
  diff_from_previous JSONB,
  is_minor_edit BOOLEAN DEFAULT false,
  cultural_advisor_approved BOOLEAN DEFAULT false,
  UNIQUE(content_type, content_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_content_versions ON content_versions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_version_editor ON content_versions(edited_by);

-- ============================================================================
-- Backlinks (automatically maintained)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  link_type TEXT NOT NULL, -- 'mention', 'related', 'category', etc.
  link_text TEXT, -- The text of the link
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backlinks ON content_links(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_forward_links ON content_links(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_link_type ON content_links(link_type);

-- ============================================================================
-- Categories & Taxonomy
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_category_id UUID REFERENCES categories(id),
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  story_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_category_parent ON categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_category_slug ON categories(slug);

CREATE TABLE IF NOT EXISTS content_categories (
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (content_type, content_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_content_categories ON content_categories(category_id);

-- ============================================================================
-- Knowledge Graph Edges
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_type TEXT NOT NULL,
  from_id UUID NOT NULL,
  to_type TEXT NOT NULL,
  to_id UUID NOT NULL,
  edge_type TEXT NOT NULL, -- 'mentions', 'collaborates', 'influences', 'located_at', 'related_to'
  strength FLOAT DEFAULT 1.0, -- 0-1
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(from_type, from_id, to_type, to_id, edge_type)
);

CREATE INDEX IF NOT EXISTS idx_kg_from ON knowledge_graph_edges(from_type, from_id);
CREATE INDEX IF NOT EXISTS idx_kg_to ON knowledge_graph_edges(to_type, to_id);
CREATE INDEX IF NOT EXISTS idx_kg_edge_type ON knowledge_graph_edges(edge_type);

-- ============================================================================
-- Analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'view', 'share', 'edit', 'comment'
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_content ON content_analytics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON content_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_time ON content_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON content_analytics(user_id);

-- ============================================================================
-- Insert default categories
-- ============================================================================

INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('Health & Wellbeing', 'health-wellbeing', 'Stories about health, healing, and wellbeing', '❤️', '#EF4444'),
  ('Culture & Language', 'culture-language', 'Cultural practices, traditions, and language preservation', '🌊', '#8B5CF6'),
  ('Youth & Education', 'youth-education', 'Young people, learning, and education', '🎓', '#F59E0B'),
  ('Elders & Wisdom', 'elders-wisdom', 'Elder knowledge and traditional wisdom', '⭐', '#10B981'),
  ('Community & Connection', 'community-connection', 'Community events and connections', '🤝', '#3B82F6'),
  ('Family & Support', 'family-support', 'Family stories and support services', '👨‍👩‍👧‍👦', '#EC4899'),
  ('Environment & Land', 'environment-land', 'Connection to country and environmental care', '🌿', '#059669'),
  ('Achievement & Pride', 'achievement-pride', 'Community achievements and moments of pride', '🏆', '#F97316')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Functions for maintaining data integrity
-- ============================================================================

-- Function to update category story counts
CREATE OR REPLACE FUNCTION update_category_story_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories
    SET story_count = story_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories
    SET story_count = GREATEST(0, story_count - 1)
    WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_counts
AFTER INSERT OR DELETE ON content_categories
FOR EACH ROW
EXECUTE FUNCTION update_category_story_count();

-- Function to auto-create knowledge graph edges from story data
CREATE OR REPLACE FUNCTION create_story_knowledge_edges()
RETURNS TRIGGER AS $$
BEGIN
  -- Create edge from storyteller to story
  INSERT INTO knowledge_graph_edges (from_type, from_id, to_type, to_id, edge_type, strength)
  VALUES ('person', NEW.storyteller_id, 'story', NEW.id, 'created', 1.0)
  ON CONFLICT (from_type, from_id, to_type, to_id, edge_type) DO NOTHING;

  -- Create edge from story to service if applicable
  IF NEW.service_id IS NOT NULL THEN
    INSERT INTO knowledge_graph_edges (from_type, from_id, to_type, to_id, edge_type, strength)
    VALUES ('story', NEW.id, 'service', NEW.service_id, 'related_to', 0.9)
    ON CONFLICT (from_type, from_id, to_type, to_id, edge_type) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER story_knowledge_graph
AFTER INSERT OR UPDATE ON stories
FOR EACH ROW
EXECUTE FUNCTION create_story_knowledge_edges();

COMMENT ON TABLE content_versions IS 'Tracks version history of all content with full snapshots';
COMMENT ON TABLE content_links IS 'Bi-directional links between content for "what links here" functionality';
COMMENT ON TABLE categories IS 'Hierarchical category system for organizing content';
COMMENT ON TABLE knowledge_graph_edges IS 'Relationship graph connecting all content types';
COMMENT ON TABLE content_analytics IS 'Analytics and engagement tracking for all content';
