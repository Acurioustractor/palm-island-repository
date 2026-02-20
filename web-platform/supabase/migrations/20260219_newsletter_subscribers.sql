-- Newsletter subscribers table
-- Stores subscriptions from the public /subscribe form.
-- TODO: Wire to GHL contact sync when GHL_SUBSCRIBE_WEBHOOK_URL is configured.

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

-- Index for lookups by email
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers (email);

-- Index for active subscriber queries
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers (status) WHERE status = 'active';

-- RLS: service role only (no public reads)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
