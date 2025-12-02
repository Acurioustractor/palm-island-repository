-- Media Repository System for Palm Island Annual Reports
-- Enables storing, organizing, and selecting media for dynamic report generation

-- =====================================================
-- EXTERNAL VIDEO LINKS TABLE
-- For YouTube, Vimeo, and other external video platforms
-- =====================================================
CREATE TABLE IF NOT EXISTS external_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID DEFAULT '3c2011b9-f80d-4289-b300-0cd383cff479'::UUID NOT NULL,

    -- Video metadata
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    platform TEXT DEFAULT 'youtube' CHECK (platform IN ('youtube', 'vimeo', 'facebook', 'tiktok', 'other')),
    video_id TEXT, -- Platform-specific video ID (e.g., YouTube video ID)

    -- Visual assets
    thumbnail_url TEXT,
    custom_thumbnail_path TEXT, -- For uploaded thumbnails in Supabase storage

    -- Categorization
    category TEXT,
    tags TEXT[] DEFAULT '{}',

    -- Context and metadata
    event_name TEXT, -- e.g., "Leaders Trip 2024", "Daycare Opening"
    event_date DATE,
    location TEXT,
    duration_seconds INTEGER,

    -- People featured
    featured_people UUID[] DEFAULT '{}', -- References to profiles

    -- Usage flags
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    is_hero_eligible BOOLEAN DEFAULT false, -- Can be used as hero background

    -- Cultural considerations
    requires_elder_approval BOOLEAN DEFAULT false,
    cultural_sensitivity_notes TEXT,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,

    -- Tracking
    view_count INTEGER DEFAULT 0,
    use_count INTEGER DEFAULT 0, -- How many times used in reports

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),

    CONSTRAINT valid_video_url CHECK (video_url ~ '^https?://')
);

-- =====================================================
-- MEDIA COLLECTIONS TABLE
-- For organizing media into thematic groups
-- =====================================================
CREATE TABLE IF NOT EXISTS media_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID DEFAULT '3c2011b9-f80d-4289-b300-0cd383cff479'::UUID NOT NULL,

    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,

    -- Collection type
    collection_type TEXT DEFAULT 'general' CHECK (collection_type IN (
        'general', 'event', 'project', 'service', 'annual_report',
        'hero_backgrounds', 'portraits', 'community_life', 'achievements'
    )),

    -- Visual
    cover_image_url TEXT,
    color TEXT, -- Brand color for the collection

    -- Metadata
    year INTEGER,
    quarter TEXT CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),

    -- Counts (updated via triggers)
    photo_count INTEGER DEFAULT 0,
    video_count INTEGER DEFAULT 0,

    -- Status
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- =====================================================
-- MEDIA COLLECTION ITEMS
-- Links media files and videos to collections
-- =====================================================
CREATE TABLE IF NOT EXISTS media_collection_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID NOT NULL REFERENCES media_collections(id) ON DELETE CASCADE,

    -- Can link to either media_files or external_videos
    media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
    external_video_id UUID REFERENCES external_videos(id) ON DELETE CASCADE,

    -- Position for ordering
    position INTEGER DEFAULT 0,

    -- Override metadata for this specific collection
    custom_caption TEXT,
    custom_description TEXT,

    -- Timestamps
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES profiles(id),

    CONSTRAINT has_media CHECK (
        (media_file_id IS NOT NULL AND external_video_id IS NULL) OR
        (media_file_id IS NULL AND external_video_id IS NOT NULL)
    )
);

-- =====================================================
-- REPORT MEDIA SELECTIONS
-- Links selected media to specific annual reports
-- =====================================================
CREATE TABLE IF NOT EXISTS report_media_selections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES annual_reports(id) ON DELETE CASCADE,

    -- Media reference (one of these must be set)
    media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
    external_video_id UUID REFERENCES external_videos(id) ON DELETE CASCADE,

    -- Placement in report
    section TEXT NOT NULL, -- e.g., 'hero', 'gallery', 'featured_video_1', 'community_voices'
    position INTEGER DEFAULT 0,

    -- Override data for this report
    custom_caption TEXT,
    custom_description TEXT,

    -- Display settings
    display_size TEXT DEFAULT 'medium' CHECK (display_size IN ('small', 'medium', 'large', 'full')),

    -- Timestamps
    selected_at TIMESTAMPTZ DEFAULT NOW(),
    selected_by UUID REFERENCES profiles(id),

    CONSTRAINT has_media CHECK (
        (media_file_id IS NOT NULL AND external_video_id IS NULL) OR
        (media_file_id IS NULL AND external_video_id IS NOT NULL)
    ),
    UNIQUE(report_id, section, position)
);

-- =====================================================
-- MEDIA CATEGORIES/TAGS TAXONOMY
-- Standardized categories for filtering
-- =====================================================
CREATE TABLE IF NOT EXISTS media_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES media_categories(id),
    color TEXT,
    icon TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO media_categories (name, slug, description, color) VALUES
    ('Community Events', 'community-events', 'Celebrations, gatherings, and community activities', '#e85d04'),
    ('Elder Stories', 'elder-stories', 'Portraits and stories from our Elders', '#8b5a2b'),
    ('Health Services', 'health-services', 'Health team, clinics, and health programs', '#2d6a4f'),
    ('Youth Programs', 'youth-programs', 'Youth activities, education, and achievements', '#1e3a5f'),
    ('Safe Haven', 'safe-haven', 'Children and family support services', '#7c3aed'),
    ('Employment & Training', 'employment-training', 'Jobs, training programs, and staff', '#0891b2'),
    ('Innovation Projects', 'innovation-projects', 'Photo Studio, Digital Centre, and other initiatives', '#f59e0b'),
    ('Storm Recovery', 'storm-recovery', 'Community resilience and recovery efforts', '#6b7280'),
    ('Cultural Programs', 'cultural-programs', 'Cultural activities and traditional practices', '#dc2626'),
    ('Leadership', 'leadership', 'Board, management, and community leaders', '#1e3a5f'),
    ('Facilities', 'facilities', 'Buildings, offices, and community spaces', '#4b5563'),
    ('Awards & Recognition', 'awards-recognition', 'Achievements and celebrations', '#f59e0b')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_external_videos_tenant ON external_videos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_external_videos_category ON external_videos(category);
CREATE INDEX IF NOT EXISTS idx_external_videos_tags ON external_videos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_external_videos_featured ON external_videos(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_external_videos_hero ON external_videos(is_hero_eligible) WHERE is_hero_eligible = true;

CREATE INDEX IF NOT EXISTS idx_media_collections_type ON media_collections(collection_type);
CREATE INDEX IF NOT EXISTS idx_media_collections_year ON media_collections(year);

CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON media_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_media ON media_collection_items(media_file_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_video ON media_collection_items(external_video_id);

CREATE INDEX IF NOT EXISTS idx_report_media_report ON report_media_selections(report_id);
CREATE INDEX IF NOT EXISTS idx_report_media_section ON report_media_selections(section);

-- =====================================================
-- HELPFUL VIEWS
-- =====================================================

-- All media items (both files and external videos) for easy querying
CREATE OR REPLACE VIEW all_media AS
SELECT
    id,
    'file' AS media_type,
    title,
    description,
    public_url AS url,
    file_type AS content_type,
    tags,
    is_featured,
    is_public,
    location,
    caption,
    created_at,
    tenant_id
FROM media_files
WHERE deleted_at IS NULL

UNION ALL

SELECT
    id,
    'video' AS media_type,
    title,
    description,
    video_url AS url,
    platform AS content_type,
    tags,
    is_featured,
    is_public,
    location,
    NULL AS caption,
    created_at,
    tenant_id
FROM external_videos;

-- Media ready for annual reports (approved, public)
CREATE OR REPLACE VIEW report_ready_media AS
SELECT * FROM all_media
WHERE is_public = true
ORDER BY is_featured DESC, created_at DESC;

-- Featured hero backgrounds (videos eligible for hero section)
CREATE OR REPLACE VIEW hero_backgrounds AS
SELECT
    id,
    title,
    video_url,
    thumbnail_url,
    description
FROM external_videos
WHERE is_hero_eligible = true
    AND is_public = true
ORDER BY created_at DESC;

-- =====================================================
-- UPDATE TIMESTAMP TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_media_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER external_videos_updated
    BEFORE UPDATE ON external_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_media_timestamp();

CREATE TRIGGER media_collections_updated
    BEFORE UPDATE ON media_collections
    FOR EACH ROW
    EXECUTE FUNCTION update_media_timestamp();

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE external_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_media_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view public videos" ON external_videos
    FOR SELECT USING (is_public = true);

CREATE POLICY "Public can view public collections" ON media_collections
    FOR SELECT USING (is_public = true);

CREATE POLICY "Public can view categories" ON media_categories
    FOR SELECT TO PUBLIC USING (true);

-- Authenticated users can manage
CREATE POLICY "Authenticated can manage videos" ON external_videos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage collections" ON media_collections
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage collection items" ON media_collection_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage report media" ON report_media_selections
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Sample external videos
INSERT INTO external_videos (title, description, video_url, platform, video_id, category, tags, event_name, is_featured, is_hero_eligible) VALUES
(
    'Leaders Trip 2024: Building Connections',
    'Palm Island leaders visited communities across Queensland to share knowledge and strengthen connections. This trip brought back new ideas for supporting our people.',
    'https://www.youtube.com/watch?v=LEADERS_TRIP_2024',
    'youtube',
    'LEADERS_TRIP_2024',
    'Leadership',
    ARRAY['leadership', 'community', 'learning', '2024'],
    'Leaders Trip 2024',
    true,
    false
),
(
    'Early Learning Centre Grand Opening',
    'A milestone moment for Palm Island families. Our new early learning centre gives our littlest community members the best start in life.',
    'https://www.youtube.com/watch?v=DAYCARE_OPENING_2024',
    'youtube',
    'DAYCARE_OPENING_2024',
    'Community Events',
    ARRAY['daycare', 'children', 'education', 'opening', '2024'],
    'Daycare Centre Opening',
    true,
    false
),
(
    'Palm Island Community Life',
    'A beautiful glimpse into daily life on Palm Island - our people, our culture, our home.',
    'https://www.youtube.com/watch?v=PALM_ISLAND_LIFE',
    'youtube',
    'PALM_ISLAND_LIFE',
    'Community Events',
    ARRAY['community', 'culture', 'daily-life', 'palm-island'],
    NULL,
    false,
    true
)
ON CONFLICT DO NOTHING;

-- Sample collection
INSERT INTO media_collections (name, slug, description, collection_type, year) VALUES
(
    'Annual Report 2024 Gallery',
    'annual-report-2024',
    'Selected photos and videos for the 2023-24 Annual Report',
    'annual_report',
    2024
),
(
    'Hero Background Videos',
    'hero-backgrounds',
    'Videos suitable for website hero sections',
    'hero_backgrounds',
    NULL
),
(
    'Community Portraits',
    'community-portraits',
    'Professional portraits of community members and staff',
    'portraits',
    NULL
)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE external_videos IS 'External video links from YouTube, Vimeo, etc. for use in reports and website';
COMMENT ON TABLE media_collections IS 'Thematic collections of photos and videos for organizing content';
COMMENT ON TABLE media_collection_items IS 'Links between media and collections';
COMMENT ON TABLE report_media_selections IS 'Media selected for specific annual reports';
COMMENT ON TABLE media_categories IS 'Standard categories for organizing and filtering media';
