-- Community Messaging Tables
-- Two-way messaging between PICC and community via GHL (WhatsApp/SMS)

-- Profiles: add messaging columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS messaging_opt_out BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS picc_consent BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS associated_services TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_profiles_ghl_contact_id ON profiles(ghl_contact_id);

-- App config (sorry business flag etc)
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO app_config (key, value) VALUES ('sorry_business_active', 'false') ON CONFLICT (key) DO NOTHING;

-- All inbound/outbound messages
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_contact_id TEXT NOT NULL,
  ghl_conversation_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT NOT NULL DEFAULT 'sms' CHECK (message_type IN ('sms', 'whatsapp', 'email')),
  body TEXT NOT NULL,
  intent_classified TEXT,
  intent_confidence NUMERIC(3,2),
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  routed_to TEXT,
  capture_id UUID,
  feedback_id UUID,
  need_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_messages_contact ON community_messages(ghl_contact_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_conversation ON community_messages(ghl_conversation_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_created ON community_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_intent ON community_messages(intent_classified);

-- Community feedback: add messaging columns to existing table
ALTER TABLE community_feedback ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT;
ALTER TABLE community_feedback ADD COLUMN IF NOT EXISTS related_service_slug TEXT;
ALTER TABLE community_feedback ADD COLUMN IF NOT EXISTS sentiment TEXT;
ALTER TABLE community_feedback ADD COLUMN IF NOT EXISTS response_sent TEXT;
ALTER TABLE community_feedback ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_community_feedback_ghl ON community_feedback(ghl_contact_id);

-- Community needs tracker
CREATE TABLE IF NOT EXISTS community_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_contact_id TEXT NOT NULL,
  need_text TEXT NOT NULL,
  need_category TEXT,
  urgency TEXT DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'logged',
  referred_to_service_slug TEXT,
  resolved_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_needs_contact ON community_needs(ghl_contact_id);
CREATE INDEX IF NOT EXISTS idx_community_needs_status ON community_needs(status);
CREATE INDEX IF NOT EXISTS idx_community_needs_urgency ON community_needs(urgency);

-- Campaign sends tracker
CREATE TABLE IF NOT EXISTS campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'story_prompt',
  sent_to_count INTEGER NOT NULL DEFAULT 0,
  service_slug TEXT,
  tags TEXT[] DEFAULT '{}',
  message_template TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_by TEXT
);

-- Enable RLS
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Service role policies
DROP POLICY IF EXISTS service_role_community_messages ON community_messages;
CREATE POLICY service_role_community_messages ON community_messages FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS service_role_community_needs ON community_needs;
CREATE POLICY service_role_community_needs ON community_needs FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS service_role_campaign_sends ON campaign_sends;
CREATE POLICY service_role_campaign_sends ON campaign_sends FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS service_role_app_config ON app_config;
CREATE POLICY service_role_app_config ON app_config FOR ALL USING (auth.role() = 'service_role');
