-- ============================================================================
-- Document System Migration
-- ============================================================================
-- This migration creates tables and functions for the document management system
-- Run this via Supabase Dashboard > SQL Editor

-- ============================================================================
-- 1. Documents Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,

  -- File Information
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'image', 'doc', 'video', etc.
  file_size INTEGER, -- in bytes
  mime_type TEXT,
  supabase_bucket TEXT DEFAULT 'community-documents',

  -- Organization
  category TEXT NOT NULL DEFAULT 'other', -- 'report', 'photo', 'historical', 'meeting_minutes', 'news', 'other'
  tags TEXT[], -- Array of tags
  document_date DATE, -- The date the document relates to (not upload date)

  -- Metadata
  author TEXT,
  source TEXT, -- Where the document came from
  related_storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  related_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,

  -- Access control
  access_level TEXT DEFAULT 'public' CHECK (access_level IN ('public', 'members', 'admin')),
  is_featured BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  -- Audit fields
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add full-text search capability
ALTER TABLE documents
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  to_tsvector('english',
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(author, '') || ' ' ||
    coalesce(source, '')
  )
) STORED;

-- ============================================================================
-- 2. Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(document_date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_search ON documents USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_documents_storyteller ON documents(related_storyteller_id);
CREATE INDEX IF NOT EXISTS idx_documents_story ON documents(related_story_id);
CREATE INDEX IF NOT EXISTS idx_documents_access ON documents(access_level);
CREATE INDEX IF NOT EXISTS idx_documents_featured ON documents(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_archived ON documents(is_archived);

-- ============================================================================
-- 3. Document Thumbnails
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_thumbnails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  thumbnail_path TEXT NOT NULL,
  page_number INTEGER DEFAULT 1, -- For multi-page PDFs
  width INTEGER,
  height INTEGER,
  supabase_bucket TEXT DEFAULT 'document-thumbnails',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_thumbnails_document ON document_thumbnails(document_id);

-- ============================================================================
-- 4. Document Collections (for grouping related documents)
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE, -- URL-friendly name
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_collections_slug ON document_collections(slug);
CREATE INDEX IF NOT EXISTS idx_document_collections_public ON document_collections(is_public);

-- ============================================================================
-- 5. Document Collection Items (many-to-many relationship)
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES document_collections(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_collection_document UNIQUE(collection_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON document_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_document ON document_collection_items(document_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_order ON document_collection_items(collection_id, display_order);

-- ============================================================================
-- 6. Document Views Tracking (analytics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous views
  viewed_at TIMESTAMP DEFAULT NOW(),
  view_duration_seconds INTEGER
);

CREATE INDEX IF NOT EXISTS idx_document_views_document ON document_views(document_id);
CREATE INDEX IF NOT EXISTS idx_document_views_date ON document_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_views_viewer ON document_views(viewer_id);

-- ============================================================================
-- 7. Triggers and Functions
-- ============================================================================

-- Update timestamp trigger for documents
CREATE OR REPLACE FUNCTION update_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_timestamp
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_document_timestamp();

-- Update timestamp trigger for collections
CREATE TRIGGER update_collections_timestamp
BEFORE UPDATE ON document_collections
FOR EACH ROW
EXECUTE FUNCTION update_document_timestamp();

-- Function to get document statistics
CREATE OR REPLACE FUNCTION get_document_stats(p_document_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_views', COALESCE(COUNT(*), 0),
    'unique_viewers', COALESCE(COUNT(DISTINCT viewer_id), 0),
    'avg_duration_seconds', COALESCE(AVG(view_duration_seconds), 0),
    'last_viewed', MAX(viewed_at)
  )
  INTO result
  FROM document_views
  WHERE document_id = p_document_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to record a document view
CREATE OR REPLACE FUNCTION record_document_view(
  p_document_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_duration_seconds INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO document_views (document_id, viewer_id, view_duration_seconds)
  VALUES (p_document_id, p_viewer_id, p_duration_seconds);
END;
$$ LANGUAGE plpgsql;

-- Function to search documents
CREATE OR REPLACE FUNCTION search_documents(
  search_query TEXT,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  document_date DATE,
  file_type TEXT,
  created_at TIMESTAMP,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.description,
    d.category,
    d.document_date,
    d.file_type,
    d.created_at,
    ts_rank(d.search_vector, websearch_to_tsquery('english', search_query)) AS rank
  FROM documents d
  WHERE
    d.is_archived = false
    AND (p_category IS NULL OR d.category = p_category)
    AND d.search_vector @@ websearch_to_tsquery('english', search_query)
  ORDER BY rank DESC, d.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular documents
CREATE OR REPLACE FUNCTION get_popular_documents(
  days_back INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  view_count BIGINT,
  unique_viewers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.category,
    COUNT(dv.id) AS view_count,
    COUNT(DISTINCT dv.viewer_id) AS unique_viewers
  FROM documents d
  LEFT JOIN document_views dv ON d.id = dv.document_id
    AND dv.viewed_at >= NOW() - (days_back || ' days')::INTERVAL
  WHERE d.is_archived = false
  GROUP BY d.id, d.title, d.category
  ORDER BY view_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Public documents are visible to everyone
CREATE POLICY "Public documents are visible to everyone"
ON documents FOR SELECT
USING (access_level = 'public' AND is_archived = false);

-- Members can see member-level documents
CREATE POLICY "Members can see member documents"
ON documents FOR SELECT
USING (
  access_level IN ('public', 'members')
  AND is_archived = false
  AND auth.role() = 'authenticated'
);

-- Admin can see all documents
CREATE POLICY "Admin can see all documents"
ON documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admin can insert documents
CREATE POLICY "Admin can insert documents"
ON documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admin can update documents
CREATE POLICY "Admin can update documents"
ON documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admin can delete documents
CREATE POLICY "Admin can delete documents"
ON documents FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Enable RLS on document_views
ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;

-- Anyone can record a view
CREATE POLICY "Anyone can record document views"
ON document_views FOR INSERT
WITH CHECK (true);

-- Users can see their own views
CREATE POLICY "Users can see their own views"
ON document_views FOR SELECT
USING (viewer_id = auth.uid() OR viewer_id IS NULL);

-- Admin can see all views
CREATE POLICY "Admin can see all views"
ON document_views FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- 9. Sample Data (Optional - for testing)
-- ============================================================================

-- Insert sample categories as a reference comment
-- Categories: 'report', 'photo', 'historical', 'meeting_minutes', 'news', 'policy', 'other'

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Next steps:
-- 1. Create Supabase storage bucket: 'community-documents'
-- 2. Create Supabase storage bucket: 'document-thumbnails'
-- 3. Set up storage policies for these buckets
-- 4. Deploy the document management UI components
