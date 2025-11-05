-- Empathy Ledger Integration for Palm Island Community Repository
-- Storyteller Profiles and Impact Measurement System

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- STORYTELLER PROFILES (Empathy Ledger Core)
-- ============================================================================

-- Main storyteller profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  community_role TEXT,
  
  -- Contact
  email TEXT,
  phone TEXT,
  
  -- Demographics (optional, for impact tracking)
  age_range TEXT,
  gender TEXT,
  indigenous_status TEXT DEFAULT 'Aboriginal or Torres Strait Islander',
  
  -- Location
  location TEXT DEFAULT 'Palm Island',
  traditional_country TEXT,
  language_group TEXT,
  
  -- Storyteller Status
  storyteller_type TEXT NOT NULL DEFAULT 'community_member',
  -- community_member, elder, youth, service_provider, cultural_advisor
  
  is_elder BOOLEAN DEFAULT FALSE,
  is_cultural_advisor BOOLEAN DEFAULT FALSE,
  is_service_provider BOOLEAN DEFAULT FALSE,
  
  -- Bio and Background
  bio TEXT,
  expertise_areas TEXT[],
  languages_spoken TEXT[],
  
  -- Engagement Metrics
  stories_contributed INTEGER DEFAULT 0,
  last_story_date TIMESTAMP,
  engagement_score INTEGER DEFAULT 0,
  
  -- Cultural Permissions
  can_share_traditional_knowledge BOOLEAN DEFAULT FALSE,
  face_recognition_consent BOOLEAN DEFAULT FALSE,
  face_recognition_consent_date TIMESTAMP,
  photo_consent_contexts TEXT[], -- Which contexts they consent to photos
  
  -- Privacy Settings
  profile_visibility TEXT DEFAULT 'community', -- public, community, private
  show_in_directory BOOLEAN DEFAULT TRUE,
  allow_messages BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT profiles_storyteller_type_check CHECK (
    storyteller_type IN ('community_member', 'elder', 'youth', 'service_provider', 'cultural_advisor', 'visitor')
  ),
  CONSTRAINT profiles_visibility_check CHECK (
    profile_visibility IN ('public', 'community', 'private')
  )
);

-- ============================================================================
-- STORIES (Empathy Ledger Micro-Stories)
-- ============================================================================

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Authorship
  storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  collected_by UUID REFERENCES profiles(id), -- If story was collected by someone else
  
  -- Story Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_embedding vector(768), -- For semantic search
  
  -- Story Type (Empathy Ledger categories)
  story_type TEXT NOT NULL DEFAULT 'community_story',
  -- community_story, elder_wisdom, service_success, micro_moment, achievement, challenge_overcome
  
  -- Categorization
  category TEXT NOT NULL,
  -- health, youth, culture, family, education, environment, economic_development
  sub_category TEXT,
  
  -- PICC Service Connection (if applicable)
  related_service TEXT,
  -- bwgcolman_healing, family_wellbeing, youth_services, etc.
  
  -- Impact & Outcomes
  impact_type TEXT[],
  -- individual, family, community, service_improvement, cultural_preservation
  outcome_achieved TEXT,
  people_affected INTEGER,
  
  -- Traditional Knowledge
  contains_traditional_knowledge BOOLEAN DEFAULT FALSE,
  cultural_sensitivity_level TEXT DEFAULT 'low',
  -- low, medium, high, restricted
  
  -- Permissions & Access
  access_level TEXT DEFAULT 'public',
  -- public, community, restricted
  sharing_approved_by UUID[] DEFAULT ARRAY[]::UUID[],
  elder_approval_required BOOLEAN DEFAULT FALSE,
  elder_approval_given BOOLEAN DEFAULT FALSE,
  elder_approval_date TIMESTAMP,
  
  -- Attribution
  attribution TEXT,
  acknowledge_others TEXT[],
  
  -- Temporal
  story_date DATE, -- When the story happened
  collection_date DATE DEFAULT CURRENT_DATE, -- When it was recorded
  
  -- Location
  location TEXT,
  location_type TEXT, -- beach, community_center, health_service, etc.
  coordinates POINT,
  
  -- Engagement Metrics
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Quality Indicators
  is_verified BOOLEAN DEFAULT FALSE,
  verification_notes TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Workflow
  status TEXT DEFAULT 'draft',
  -- draft, submitted, under_review, approved, published, archived
  review_status TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP,
  
  -- Search & Discovery
  tags TEXT[],
  keywords TEXT[],
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT stories_access_level_check CHECK (
    access_level IN ('public', 'community', 'restricted')
  ),
  CONSTRAINT stories_status_check CHECK (
    status IN ('draft', 'submitted', 'under_review', 'approved', 'published', 'archived')
  )
);

-- ============================================================================
-- IMPACT MEASUREMENTS (Empathy Ledger Core)
-- ============================================================================

CREATE TABLE impact_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Connection
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id),
  service_area TEXT, -- Which PICC service this relates to
  
  -- Impact Type
  indicator_type TEXT NOT NULL,
  -- health_outcome, cultural_strengthening, service_access, 
  -- community_connection, economic_benefit, wellbeing_improvement
  
  indicator_name TEXT NOT NULL,
  indicator_description TEXT,
  
  -- Measurement
  measurement_type TEXT NOT NULL,
  -- quantitative, qualitative, narrative, observed, self_reported
  
  value_numeric DECIMAL,
  value_text TEXT,
  value_category TEXT,
  
  -- Context
  baseline_value TEXT,
  target_value TEXT,
  change_observed TEXT,
  significance TEXT, -- How meaningful is this change?
  
  -- Temporal
  measurement_date DATE DEFAULT CURRENT_DATE,
  measurement_period_start DATE,
  measurement_period_end DATE,
  
  -- Attribution
  contributed_by UUID REFERENCES profiles(id),
  verified_by UUID REFERENCES profiles(id),
  
  -- Pattern Recognition
  pattern_category TEXT,
  related_indicators UUID[],
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- ENGAGEMENT TRACKING (Empathy Ledger)
-- ============================================================================

CREATE TABLE engagement_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Who & What
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  -- story_created, story_viewed, story_shared, comment_added, 
  -- search_performed, profile_updated, service_interaction
  
  -- Target
  target_type TEXT,
  -- story, profile, service, search, etc.
  target_id UUID,
  
  -- Details
  activity_details JSONB DEFAULT '{}'::jsonb,
  
  -- Impact
  engagement_score INTEGER DEFAULT 1,
  
  -- Context
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Temporal
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PICC SERVICE INTEGRATION
-- ============================================================================

CREATE TABLE service_story_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Connections
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  -- Maps to PICC services: bwgcolman_healing, family_wellbeing, youth_services, etc.
  
  -- Service Details
  service_interaction_date DATE,
  service_outcome TEXT,
  staff_member UUID REFERENCES profiles(id),
  
  -- Impact on Service
  demonstrates_effectiveness BOOLEAN DEFAULT TRUE,
  improvement_area TEXT,
  replication_potential TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- MEDIA LINKS
-- ============================================================================

CREATE TABLE story_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Connections
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  
  -- Media Details
  media_type TEXT NOT NULL, -- photo, video, audio, document
  file_path TEXT NOT NULL,
  supabase_bucket TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  
  -- Media Analysis
  media_embedding vector(512), -- For image search
  ml_analysis JSONB, -- Face/place/object detection results
  
  -- Permissions
  requires_permission BOOLEAN DEFAULT FALSE,
  people_in_media UUID[], -- References to profiles
  all_permissions_obtained BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  caption TEXT,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- CULTURAL PROTOCOLS & PERMISSIONS
-- ============================================================================

CREATE TABLE cultural_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- What
  permission_type TEXT NOT NULL,
  -- face_recognition, traditional_knowledge_sharing, photo_use, 
  -- story_sharing, name_use
  
  -- Who
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Scope
  permission_scope TEXT NOT NULL,
  -- all_contexts, specific_contexts, family_only, community_only
  allowed_contexts TEXT[],
  
  -- Status
  permission_granted BOOLEAN DEFAULT FALSE,
  granted_date TIMESTAMP,
  expires_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Cultural Advisor Verification
  verified_by UUID REFERENCES profiles(id),
  verification_date TIMESTAMP,
  verification_notes TEXT,
  
  -- Revocation
  can_be_revoked BOOLEAN DEFAULT TRUE,
  revoked_date TIMESTAMP,
  revocation_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- PATTERN RECOGNITION (Empathy Ledger Analytics)
-- ============================================================================

CREATE TABLE story_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Pattern Identification
  pattern_name TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  -- service_effectiveness, cultural_practice_success, 
  -- community_control_impact, family_healing, youth_development
  
  -- Stories in Pattern
  story_ids UUID[] NOT NULL,
  pattern_strength DECIMAL, -- How strong is this pattern (0-1)
  
  -- Insights
  pattern_description TEXT,
  key_elements TEXT[],
  success_factors TEXT[],
  replication_guidance TEXT,
  
  -- Impact
  impact_category TEXT,
  people_affected_estimate INTEGER,
  
  -- Discovery
  discovered_by TEXT DEFAULT 'ML_analysis',
  -- ML_analysis, manual_review, community_identified
  discovery_date DATE DEFAULT CURRENT_DATE,
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verification_date TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles
CREATE INDEX profiles_user_id_idx ON profiles(user_id);
CREATE INDEX profiles_storyteller_type_idx ON profiles(storyteller_type);
CREATE INDEX profiles_location_idx ON profiles(location);

-- Stories
CREATE INDEX stories_storyteller_id_idx ON stories(storyteller_id);
CREATE INDEX stories_category_idx ON stories(category);
CREATE INDEX stories_access_level_idx ON stories(access_level);
CREATE INDEX stories_status_idx ON stories(status);
CREATE INDEX stories_story_date_idx ON stories(story_date);
CREATE INDEX stories_tags_idx ON stories USING gin(tags);
CREATE INDEX stories_embedding_idx ON stories USING ivfflat (content_embedding vector_cosine_ops);

-- Full-text search
CREATE INDEX stories_fts_idx ON stories USING gin(
  to_tsvector('english', title || ' ' || content)
);

-- Impact Indicators
CREATE INDEX impact_indicators_story_id_idx ON impact_indicators(story_id);
CREATE INDEX impact_indicators_profile_id_idx ON impact_indicators(profile_id);
CREATE INDEX impact_indicators_indicator_type_idx ON impact_indicators(indicator_type);

-- Engagement
CREATE INDEX engagement_profile_id_idx ON engagement_activities(profile_id);
CREATE INDEX engagement_activity_type_idx ON engagement_activities(activity_type);
CREATE INDEX engagement_created_at_idx ON engagement_activities(created_at);

-- Media
CREATE INDEX story_media_story_id_idx ON story_media(story_id);
CREATE INDEX story_media_media_type_idx ON story_media(media_type);

-- Permissions
CREATE INDEX cultural_permissions_profile_id_idx ON cultural_permissions(profile_id);
CREATE INDEX cultural_permissions_type_idx ON cultural_permissions(permission_type);
CREATE INDEX cultural_permissions_active_idx ON cultural_permissions(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_story_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_patterns ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view public/community profiles, update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (profile_visibility = 'public');

CREATE POLICY "Community profiles viewable by authenticated users" ON profiles
  FOR SELECT USING (
    profile_visibility IN ('public', 'community') 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Stories: Respect access levels
CREATE POLICY "Public stories viewable by everyone" ON stories
  FOR SELECT USING (access_level = 'public' AND status = 'published');

CREATE POLICY "Community stories viewable by authenticated users" ON stories
  FOR SELECT USING (
    access_level IN ('public', 'community') 
    AND status = 'published'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Restricted stories viewable with permission" ON stories
  FOR SELECT USING (
    (access_level = 'restricted' AND auth.uid() = storyteller_id)
    OR auth.uid() = ANY(sharing_approved_by)
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_cultural_advisor = true
    )
  );

CREATE POLICY "Users can create stories" ON stories
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM profiles WHERE id = storyteller_id)
  );

CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM profiles WHERE id = storyteller_id)
  );

-- Media: Respect story access levels
CREATE POLICY "Media viewable based on story access" ON story_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = story_media.story_id
      AND (
        (stories.access_level = 'public' AND stories.status = 'published')
        OR (stories.access_level = 'community' AND auth.role() = 'authenticated')
        OR (auth.uid() = (SELECT user_id FROM profiles WHERE id = stories.storyteller_id))
      )
    )
  );

-- ============================================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update storyteller engagement metrics
CREATE OR REPLACE FUNCTION update_storyteller_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    stories_contributed = stories_contributed + 1,
    last_story_date = NEW.created_at,
    engagement_score = engagement_score + 10
  WHERE id = NEW.storyteller_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_metrics_on_story_create AFTER INSERT ON stories
  FOR EACH ROW EXECUTE FUNCTION update_storyteller_metrics();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get storyteller statistics
CREATE OR REPLACE FUNCTION get_storyteller_stats(storyteller_uuid UUID)
RETURNS TABLE (
  total_stories INTEGER,
  public_stories INTEGER,
  community_stories INTEGER,
  restricted_stories INTEGER,
  total_views INTEGER,
  total_shares INTEGER,
  engagement_score INTEGER,
  last_story_date TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_stories,
    COUNT(*) FILTER (WHERE access_level = 'public')::INTEGER as public_stories,
    COUNT(*) FILTER (WHERE access_level = 'community')::INTEGER as community_stories,
    COUNT(*) FILTER (WHERE access_level = 'restricted')::INTEGER as restricted_stories,
    COALESCE(SUM(views), 0)::INTEGER as total_views,
    COALESCE(SUM(shares), 0)::INTEGER as total_shares,
    (SELECT engagement_score FROM profiles WHERE id = storyteller_uuid),
    (SELECT last_story_date FROM profiles WHERE id = storyteller_uuid)
  FROM stories
  WHERE storyteller_id = storyteller_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active storytellers view
CREATE VIEW active_storytellers AS
SELECT 
  p.*,
  COUNT(s.id) as total_stories,
  MAX(s.created_at) as most_recent_story
FROM profiles p
LEFT JOIN stories s ON p.id = s.storyteller_id
WHERE p.show_in_directory = true
GROUP BY p.id;

-- Story with storyteller details view
CREATE VIEW stories_with_storyteller AS
SELECT 
  s.*,
  p.full_name as storyteller_name,
  p.preferred_name as storyteller_preferred_name,
  p.community_role as storyteller_role,
  p.is_elder as storyteller_is_elder
FROM stories s
INNER JOIN profiles p ON s.storyteller_id = p.id;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample storyteller profile
INSERT INTO profiles (
  full_name,
  preferred_name,
  community_role,
  storyteller_type,
  location,
  bio,
  expertise_areas,
  profile_visibility
) VALUES (
  'Mary Johnson',
  'Mary',
  'Community Health Worker',
  'service_provider',
  'Palm Island',
  'Community health worker at Bwgcolman Healing Service, passionate about traditional healing integration',
  ARRAY['health', 'traditional_medicine', 'community_wellbeing'],
  'public'
);

-- Comments for documentation
COMMENT ON TABLE profiles IS 'Empathy Ledger storyteller profiles - community members who contribute stories';
COMMENT ON TABLE stories IS 'Empathy Ledger micro-stories capturing community impact and knowledge';
COMMENT ON TABLE impact_indicators IS 'Measurable indicators of community and service impact';
COMMENT ON TABLE story_patterns IS 'ML-identified patterns across multiple stories showing what works';
