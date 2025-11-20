-- Story Builder Schema
-- Allows creating immersive scrollytelling stories through a visual editor

-- Main stories table
CREATE TABLE IF NOT EXISTS immersive_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT UNIQUE NOT NULL,
  hero_media_url TEXT,
  hero_media_type TEXT DEFAULT 'image', -- 'image' or 'video'
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story sections (components)
CREATE TABLE IF NOT EXISTS story_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES immersive_stories(id) ON DELETE CASCADE,
  section_order INTEGER NOT NULL,
  section_type TEXT NOT NULL, -- 'text', 'quote', 'sidebyside', 'video', 'image', 'gallery', 'timeline', 'parallax'

  -- Common fields
  title TEXT,
  content TEXT,
  background_color TEXT DEFAULT 'bg-white',

  -- Media fields
  media_url TEXT,
  media_type TEXT, -- 'image', 'video'
  media_position TEXT, -- 'left', 'right' for side-by-side
  media_caption TEXT,
  media_alt TEXT,

  -- Quote fields
  quote_author TEXT,
  quote_role TEXT,

  -- Settings
  settings JSONB DEFAULT '{}', -- Flexible settings per section type

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT section_order_unique UNIQUE (story_id, section_order)
);

-- Story timeline events
CREATE TABLE IF NOT EXISTS story_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES story_sections(id) ON DELETE CASCADE,
  event_order INTEGER NOT NULL,
  event_date TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT NOT NULL,
  is_complete BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story gallery images
CREATE TABLE IF NOT EXISTS story_gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES story_sections(id) ON DELETE CASCADE,
  image_order INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  image_caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_story_sections_story_id ON story_sections(story_id);
CREATE INDEX IF NOT EXISTS idx_story_sections_order ON story_sections(story_id, section_order);
CREATE INDEX IF NOT EXISTS idx_timeline_events_section ON story_timeline_events(section_id, event_order);
CREATE INDEX IF NOT EXISTS idx_gallery_images_section ON story_gallery_images(section_id, image_order);

-- Enable Row Level Security
ALTER TABLE immersive_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_gallery_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Everyone can read published stories, authenticated users can manage)
CREATE POLICY "Anyone can view published stories"
  ON immersive_stories FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Authenticated users can manage stories"
  ON immersive_stories FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view sections of published stories"
  ON story_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM immersive_stories
      WHERE immersive_stories.id = story_sections.story_id
      AND immersive_stories.is_published = TRUE
    )
  );

CREATE POLICY "Authenticated users can manage sections"
  ON story_sections FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view timeline events of published stories"
  ON story_timeline_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM story_sections
      JOIN immersive_stories ON immersive_stories.id = story_sections.story_id
      WHERE story_sections.id = story_timeline_events.section_id
      AND immersive_stories.is_published = TRUE
    )
  );

CREATE POLICY "Authenticated users can manage timeline events"
  ON story_timeline_events FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view gallery images of published stories"
  ON story_gallery_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM story_sections
      JOIN immersive_stories ON immersive_stories.id = story_sections.story_id
      WHERE story_sections.id = story_gallery_images.section_id
      AND immersive_stories.is_published = TRUE
    )
  );

CREATE POLICY "Authenticated users can manage gallery images"
  ON story_gallery_images FOR ALL
  USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_immersive_stories_updated_at BEFORE UPDATE ON immersive_stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_sections_updated_at BEFORE UPDATE ON story_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
