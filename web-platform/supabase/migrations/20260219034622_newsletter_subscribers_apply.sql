-- Newsletter subscribers table (apply)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  interests text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers (status) WHERE status = 'active';
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Expand page_context constraint to include all public pages
DO $$
BEGIN
  ALTER TABLE media_files DROP CONSTRAINT IF EXISTS media_files_page_context_check;
  ALTER TABLE media_files ADD CONSTRAINT media_files_page_context_check CHECK (
    page_context IN (
      'home', 'about', 'impact', 'community', 'stories', 'share-voice',
      'annual-reports', 'annual-report', 'search', 'chat', 'assistant',
      'hero', 'vision', 'timeline', 'leadership', 'services',
      'testimonials', 'future', 'contact',
      'story', 'storyteller', 'project',
      'global', 'other',
      'innovation', 'publications', 'elders', 'explore',
      '20-years', 'road-to-20-years', 'calendar'
    ) OR page_context IS NULL
  );
END $$;
