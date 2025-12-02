-- ============================================================================
-- PICC KNOWLEDGE BASE SCHEMA
-- A comprehensive system for storing, versioning, and retrieving all PICC data
-- Supports multi-modal content, research tracking, and temporal queries
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS btree_gin; -- For faster JSON indexing

-- ============================================================================
-- 1. KNOWLEDGE ENTRIES - The core knowledge items
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  slug TEXT UNIQUE NOT NULL,  -- URL-friendly identifier
  title TEXT NOT NULL,
  subtitle TEXT,

  -- Content (supports markdown)
  content TEXT NOT NULL,
  summary TEXT,  -- AI-generated or manual summary

  -- Classification
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'fact',           -- Verified facts
    'history',        -- Historical information
    'person',         -- Person profile
    'place',          -- Location information
    'organization',   -- Organization details
    'service',        -- Service description
    'program',        -- Program details
    'event',          -- Event description
    'statistic',      -- Statistical data
    'policy',         -- Policy/procedure
    'quote',          -- Notable quote
    'story',          -- Community story
    'media',          -- Media item description
    'research',       -- Research finding
    'news',           -- News item
    'document'        -- Document reference
  )),

  category TEXT,  -- Primary category (health, family, justice, etc.)
  subcategory TEXT,

  -- Temporal context
  date_from DATE,           -- When this information is relevant from
  date_to DATE,             -- When this information is relevant to (NULL = ongoing)
  date_precision TEXT CHECK (date_precision IN ('exact', 'month', 'year', 'decade', 'approximate')),
  fiscal_year TEXT,         -- e.g., '2023-2024'

  -- Geographic context
  location_name TEXT,
  location_type TEXT CHECK (location_type IN ('palm_island', 'townsville', 'queensland', 'australia', 'other')),
  coordinates JSONB,        -- {lat, lng}

  -- Importance and visibility
  importance INTEGER DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,

  -- Structured data (flexible JSON for type-specific data)
  structured_data JSONB DEFAULT '{}',

  -- AI/Search optimization
  -- embedding VECTOR(1536),   -- For semantic search (uncomment if pgvector is enabled)
  search_vector TSVECTOR,   -- For full-text search
  keywords TEXT[],

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  -- Version tracking
  current_version INTEGER DEFAULT 1,

  -- Organization context
  organization_id UUID REFERENCES organizations(id)
);

-- Indexes for knowledge_entries
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_type ON knowledge_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_category ON knowledge_entries(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_date_from ON knowledge_entries(date_from);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_fiscal_year ON knowledge_entries(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_location ON knowledge_entries(location_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_search ON knowledge_entries USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_keywords ON knowledge_entries USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_structured ON knowledge_entries USING GIN(structured_data);

-- Full-text search trigger
CREATE OR REPLACE FUNCTION knowledge_entries_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.subtitle, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.keywords, ' '), '')), 'A');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS knowledge_entries_search_update ON knowledge_entries;
CREATE TRIGGER knowledge_entries_search_update
  BEFORE INSERT OR UPDATE ON knowledge_entries
  FOR EACH ROW EXECUTE FUNCTION knowledge_entries_search_trigger();

-- ============================================================================
-- 2. RESEARCH SOURCES - Track where all information comes from
-- (Must be created before knowledge_versions which references it)
-- ============================================================================
CREATE TABLE IF NOT EXISTS research_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source identification
  source_type TEXT NOT NULL CHECK (source_type IN (
    'pdf_document',
    'web_page',
    'news_article',
    'government_report',
    'academic_paper',
    'interview',
    'oral_history',
    'photograph',
    'video',
    'audio',
    'social_media',
    'internal_document',
    'email',
    'meeting_notes',
    'survey',
    'observation',
    'other'
  )),

  -- Source details
  title TEXT NOT NULL,
  description TEXT,
  author TEXT,
  publisher TEXT,
  publication_date DATE,

  -- Access information
  url TEXT,
  file_path TEXT,
  storage_url TEXT,  -- Supabase storage URL

  -- Citation
  citation_text TEXT,  -- Formatted citation
  doi TEXT,
  isbn TEXT,

  -- Reliability
  reliability_score INTEGER CHECK (reliability_score BETWEEN 1 AND 100),
  is_primary_source BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),

  -- Access tracking
  accessed_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ,
  is_available BOOLEAN DEFAULT true,

  -- Content extraction
  extracted_text TEXT,  -- OCR or scraped text
  extracted_data JSONB, -- Structured data extracted

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Organization
  organization_id UUID REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_research_sources_type ON research_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_research_sources_date ON research_sources(publication_date);

-- ============================================================================
-- 3. KNOWLEDGE VERSIONS - Full version history
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,

  -- Snapshot of the entry at this version
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  structured_data JSONB,

  -- Change tracking
  change_summary TEXT,  -- What changed in this version
  change_type TEXT CHECK (change_type IN ('created', 'updated', 'corrected', 'expanded', 'merged')),

  -- Who and when
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Source of change
  source_id UUID REFERENCES research_sources(id),

  UNIQUE(entry_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_versions_entry ON knowledge_versions(entry_id);

-- ============================================================================
-- 4. KNOWLEDGE SOURCE LINKS - Connect entries to their sources
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_source_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES research_sources(id) ON DELETE CASCADE,

  -- Specificity
  page_numbers TEXT,      -- e.g., "12-15" or "12, 45, 67"
  section_reference TEXT, -- e.g., "Chapter 3, Section 2"
  timestamp_start TEXT,   -- For video/audio "01:23:45"
  timestamp_end TEXT,
  quote TEXT,            -- Direct quote from source

  -- Relationship type
  relationship TEXT CHECK (relationship IN (
    'primary_source',    -- Main source for this info
    'supporting',        -- Supports the information
    'contradicts',       -- Contradicts (for tracking disputes)
    'expands',          -- Provides additional context
    'referenced'        -- Simply referenced
  )),

  -- Metadata
  added_by UUID REFERENCES profiles(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,

  UNIQUE(entry_id, source_id)
);

-- ============================================================================
-- 5. FINANCIAL RECORDS - Structured financial data
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Period
  fiscal_year TEXT NOT NULL,  -- e.g., '2023-2024'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT CHECK (period_type IN ('annual', 'quarterly', 'monthly')),

  -- Record type
  record_type TEXT NOT NULL CHECK (record_type IN (
    'income',
    'expenditure',
    'asset',
    'liability',
    'equity',
    'budget',
    'forecast',
    'grant',
    'funding'
  )),

  -- Classification
  category TEXT NOT NULL,     -- e.g., 'labour_costs', 'admin_expenses'
  subcategory TEXT,
  cost_centre TEXT,

  -- Amounts
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'AUD',

  -- Comparison
  previous_amount DECIMAL(15,2),
  variance DECIMAL(15,2),
  variance_percentage DECIMAL(5,2),

  -- Context
  description TEXT,
  notes TEXT,

  -- Source and verification
  source_id UUID REFERENCES research_sources(id),
  is_audited BOOLEAN DEFAULT false,
  auditor TEXT,

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  organization_id UUID REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_financial_records_year ON financial_records(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_financial_records_type ON financial_records(record_type);
CREATE INDEX IF NOT EXISTS idx_financial_records_category ON financial_records(category);

-- ============================================================================
-- 6. TIMELINE EVENTS - Historical timeline
-- ============================================================================
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event identification
  title TEXT NOT NULL,
  description TEXT,

  -- Temporal data
  event_date DATE,
  event_date_end DATE,  -- For events spanning multiple days
  date_precision TEXT CHECK (date_precision IN ('exact', 'month', 'year', 'decade', 'approximate')),

  -- Classification
  event_type TEXT CHECK (event_type IN (
    'founding',
    'milestone',
    'policy_change',
    'leadership_change',
    'service_launch',
    'award',
    'disaster',
    'cultural',
    'community',
    'political',
    'legal',
    'other'
  )),

  -- Geographic context
  location_name TEXT,
  location_type TEXT,

  -- Importance
  significance INTEGER CHECK (significance BETWEEN 1 AND 10),
  is_featured BOOLEAN DEFAULT false,

  -- Related content
  related_entry_id UUID REFERENCES knowledge_entries(id),
  related_people TEXT[],  -- Names of people involved

  -- Media
  image_url TEXT,

  -- Source
  source_id UUID REFERENCES research_sources(id),

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  organization_id UUID REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_timeline_events_date ON timeline_events(event_date);
CREATE INDEX IF NOT EXISTS idx_timeline_events_type ON timeline_events(event_type);

-- ============================================================================
-- 7. KNOWLEDGE MEDIA - Multi-modal attachments
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to knowledge entry (optional - can be standalone)
  entry_id UUID REFERENCES knowledge_entries(id) ON DELETE SET NULL,

  -- Media identification
  title TEXT NOT NULL,
  description TEXT,
  alt_text TEXT,  -- For accessibility

  -- Media type
  media_type TEXT NOT NULL CHECK (media_type IN (
    'image',
    'video',
    'audio',
    'document',
    'pdf',
    'spreadsheet',
    '3d_model',
    'map',
    'infographic',
    'chart',
    'other'
  )),

  -- File details
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  storage_path TEXT,     -- Supabase storage path
  storage_url TEXT,      -- Public URL
  thumbnail_url TEXT,

  -- Media-specific metadata
  duration_seconds INTEGER,  -- For video/audio
  width INTEGER,             -- For images/video
  height INTEGER,

  -- Content extraction
  transcript TEXT,           -- For audio/video
  ocr_text TEXT,            -- For images with text
  extracted_data JSONB,     -- Structured data from media

  -- Context
  capture_date DATE,
  capture_location TEXT,
  photographer TEXT,

  -- People and tags
  people_tagged TEXT[],
  tags TEXT[],

  -- Rights
  copyright TEXT,
  license TEXT,
  usage_restrictions TEXT,

  -- Source
  source_id UUID REFERENCES research_sources(id),

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  organization_id UUID REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_media_entry ON knowledge_media(entry_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_media_type ON knowledge_media(media_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_media_tags ON knowledge_media USING GIN(tags);

-- ============================================================================
-- 8. KNOWLEDGE TAGS - Flexible tagging system
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Hierarchy
  parent_id UUID REFERENCES knowledge_tags(id),

  -- Classification
  tag_type TEXT CHECK (tag_type IN (
    'topic',
    'person',
    'place',
    'time_period',
    'service',
    'program',
    'theme',
    'custom'
  )),

  -- Display
  color TEXT,
  icon TEXT,

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_entry_tags (
  entry_id UUID NOT NULL REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES knowledge_tags(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (entry_id, tag_id)
);

-- ============================================================================
-- 9. KNOWLEDGE RELATIONSHIPS - Connect related entries
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  from_entry_id UUID NOT NULL REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  to_entry_id UUID NOT NULL REFERENCES knowledge_entries(id) ON DELETE CASCADE,

  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'related_to',
    'part_of',
    'preceded_by',
    'followed_by',
    'caused_by',
    'resulted_in',
    'contradicts',
    'supports',
    'expands_on',
    'replaces',
    'see_also'
  )),

  description TEXT,
  strength INTEGER CHECK (strength BETWEEN 1 AND 5),  -- How strong is the relationship

  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(from_entry_id, to_entry_id, relationship_type)
);

-- ============================================================================
-- 10. SEARCH HISTORY - Track what people search for
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  query TEXT NOT NULL,
  filters JSONB,
  results_count INTEGER,

  user_id UUID REFERENCES profiles(id),
  searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. HELPER VIEWS
-- ============================================================================

-- View for searching knowledge entries with source info
CREATE OR REPLACE VIEW knowledge_search_view AS
SELECT
  ke.id,
  ke.slug,
  ke.title,
  ke.subtitle,
  ke.summary,
  ke.entry_type,
  ke.category,
  ke.date_from,
  ke.date_to,
  ke.fiscal_year,
  ke.location_name,
  ke.location_type,
  ke.importance,
  ke.is_verified,
  ke.keywords,
  ke.created_at,
  ke.updated_at,
  array_agg(DISTINCT kt.name) FILTER (WHERE kt.name IS NOT NULL) as tags,
  COUNT(DISTINCT ksl.source_id) as source_count,
  COUNT(DISTINCT km.id) as media_count
FROM knowledge_entries ke
LEFT JOIN knowledge_entry_tags ket ON ke.id = ket.entry_id
LEFT JOIN knowledge_tags kt ON ket.tag_id = kt.id
LEFT JOIN knowledge_source_links ksl ON ke.id = ksl.entry_id
LEFT JOIN knowledge_media km ON ke.id = km.entry_id
GROUP BY ke.id;

-- View for financial summary by year
CREATE OR REPLACE VIEW financial_summary_view AS
SELECT
  fiscal_year,
  record_type,
  category,
  SUM(amount) as total_amount,
  COUNT(*) as record_count
FROM financial_records
GROUP BY fiscal_year, record_type, category
ORDER BY fiscal_year DESC, record_type, category;

-- View for timeline with related entries
CREATE OR REPLACE VIEW timeline_view AS
SELECT
  te.*,
  ke.title as related_entry_title,
  ke.entry_type as related_entry_type
FROM timeline_events te
LEFT JOIN knowledge_entries ke ON te.related_entry_id = ke.id
ORDER BY te.event_date DESC NULLS LAST;

-- ============================================================================
-- 12. HELPER FUNCTIONS
-- ============================================================================

-- Function to search knowledge base
CREATE OR REPLACE FUNCTION search_knowledge(
  search_query TEXT,
  entry_types TEXT[] DEFAULT NULL,
  categories TEXT[] DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  summary TEXT,
  entry_type TEXT,
  category TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ke.id,
    ke.slug,
    ke.title,
    ke.summary,
    ke.entry_type,
    ke.category,
    ts_rank(ke.search_vector, plainto_tsquery('english', search_query)) as relevance
  FROM knowledge_entries ke
  WHERE
    ke.search_vector @@ plainto_tsquery('english', search_query)
    AND (entry_types IS NULL OR ke.entry_type = ANY(entry_types))
    AND (categories IS NULL OR ke.category = ANY(categories))
    AND (date_from IS NULL OR ke.date_from >= date_from)
    AND (date_to IS NULL OR ke.date_to <= date_to)
  ORDER BY relevance DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get entry with all related data
CREATE OR REPLACE FUNCTION get_knowledge_entry_full(entry_slug TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'entry', row_to_json(ke.*),
    'tags', (
      SELECT jsonb_agg(kt.*)
      FROM knowledge_entry_tags ket
      JOIN knowledge_tags kt ON ket.tag_id = kt.id
      WHERE ket.entry_id = ke.id
    ),
    'sources', (
      SELECT jsonb_agg(jsonb_build_object(
        'source', rs.*,
        'link', ksl.*
      ))
      FROM knowledge_source_links ksl
      JOIN research_sources rs ON ksl.source_id = rs.id
      WHERE ksl.entry_id = ke.id
    ),
    'media', (
      SELECT jsonb_agg(km.*)
      FROM knowledge_media km
      WHERE km.entry_id = ke.id
    ),
    'related', (
      SELECT jsonb_agg(jsonb_build_object(
        'relationship', kr.relationship_type,
        'entry', row_to_json(ke2.*)
      ))
      FROM knowledge_relationships kr
      JOIN knowledge_entries ke2 ON kr.to_entry_id = ke2.id
      WHERE kr.from_entry_id = ke.id
    ),
    'versions', (
      SELECT jsonb_agg(kv.* ORDER BY kv.version_number DESC)
      FROM knowledge_versions kv
      WHERE kv.entry_id = ke.id
    )
  ) INTO result
  FROM knowledge_entries ke
  WHERE ke.slug = entry_slug;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 13. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_source_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_entry_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_relationships ENABLE ROW LEVEL SECURITY;

-- Public read access for published entries
CREATE POLICY "Public can view public knowledge entries"
  ON knowledge_entries FOR SELECT
  USING (is_public = true);

CREATE POLICY "Public can view knowledge tags"
  ON knowledge_tags FOR SELECT
  USING (true);

CREATE POLICY "Public can view timeline events"
  ON timeline_events FOR SELECT
  USING (true);

-- Service role has full access
CREATE POLICY "Service role has full access to knowledge_entries"
  ON knowledge_entries FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to financial_records"
  ON financial_records FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to research_sources"
  ON research_sources FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to knowledge_media"
  ON knowledge_media FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- COMPLETE
-- ============================================================================
