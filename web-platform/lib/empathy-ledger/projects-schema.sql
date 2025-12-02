-- ============================================================================
-- INNOVATION PROJECTS SYSTEM
-- For tracking PICC innovation projects like The Station, Photo Studio, etc.
-- ============================================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Project Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly name (e.g., 'photo-studio')
  tagline TEXT, -- Short description
  description TEXT NOT NULL,

  -- Project Status
  status TEXT NOT NULL DEFAULT 'planning',
  -- planning, in_progress, completed, on_hold, archived

  -- Project Type
  project_type TEXT NOT NULL DEFAULT 'innovation',
  -- innovation, service, infrastructure, cultural, research

  -- Timeline
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,

  -- Impact & Metrics
  impact_areas TEXT[], -- e.g., ['youth', 'elders', 'employment', 'culture']
  target_beneficiaries INTEGER,
  actual_beneficiaries INTEGER,

  -- Budget (optional)
  budget_total DECIMAL(12, 2),
  budget_spent DECIMAL(12, 2),
  funding_sources TEXT[],

  -- Media
  hero_image_url TEXT,
  logo_url TEXT,
  gallery_images TEXT[],

  -- Team
  project_lead UUID REFERENCES profiles(id),
  team_members UUID[],

  -- Visibility
  is_public BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT projects_status_check CHECK (
    status IN ('planning', 'in_progress', 'completed', 'on_hold', 'archived')
  ),
  CONSTRAINT projects_type_check CHECK (
    project_type IN ('innovation', 'service', 'infrastructure', 'cultural', 'research', 'other')
  )
);

-- Project Updates (Blog-style posts)
CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),

  -- Update Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT, -- Short summary

  -- Update Type
  update_type TEXT NOT NULL DEFAULT 'progress',
  -- progress, milestone, announcement, media, blog, event

  -- Media
  featured_image_url TEXT,
  media_urls TEXT[],

  -- Metadata
  published_at TIMESTAMP,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT update_type_check CHECK (
    update_type IN ('progress', 'milestone', 'announcement', 'media', 'blog', 'event', 'other')
  )
);

-- Project Media (Photos, Videos, Documents)
CREATE TABLE IF NOT EXISTS project_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  update_id UUID REFERENCES project_updates(id) ON DELETE SET NULL,

  -- Media Info
  media_type TEXT NOT NULL,
  -- photo, video, document, audio

  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase storage
  file_size BIGINT,
  mime_type TEXT,

  -- Storage
  supabase_bucket TEXT DEFAULT 'project-media',

  -- Metadata
  title TEXT,
  description TEXT,
  caption TEXT,
  alt_text TEXT,

  -- Attribution
  photographer TEXT,
  credit TEXT,
  uploaded_by UUID REFERENCES profiles(id),

  -- Display
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT media_type_check CHECK (
    media_type IN ('photo', 'video', 'document', 'audio', 'other')
  )
);

-- Project Milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Milestone Info
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed_date DATE,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending, in_progress, completed, delayed, cancelled

  -- Display
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT milestone_status_check CHECK (
    status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_project_updates_project ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_published ON project_updates(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_project_media_project ON project_media(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON project_milestones(project_id);

-- RLS Policies (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

-- Public read access for published projects
CREATE POLICY "Public projects are viewable by everyone"
  ON projects FOR SELECT
  USING (is_public = TRUE);

-- Public read access for published updates
CREATE POLICY "Published updates are viewable by everyone"
  ON project_updates FOR SELECT
  USING (is_published = TRUE);

-- Public read access for project media
CREATE POLICY "Project media is viewable by everyone"
  ON project_media FOR SELECT
  USING (TRUE);

-- Public read access for milestones
CREATE POLICY "Project milestones are viewable by everyone"
  ON project_milestones FOR SELECT
  USING (TRUE);

-- Staff can manage all projects (add auth policies as needed)
-- These would be customized based on your auth setup
