-- Historical Artifacts Table
-- Stores newspaper clippings, court records, photographs, maps, book excerpts,
-- government records, and oral histories related to Palm Island history.
-- Supports the history page enrichment pipeline.

create table if not exists historical_artifacts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artifact_type text not null, -- newspaper, court_record, photograph, map, book_excerpt, government_record, oral_history
  source_name text, -- "Trove", "AustLII", "QSA", "SLQ", "Internet Archive"
  source_url text,
  date_original date, -- when the artifact was created
  date_scraped timestamptz default now(),
  content_text text, -- full text if available
  content_summary text, -- AI-generated summary
  image_url text, -- if it's a photo/scan
  file_path text, -- local storage path
  tags text[] default '{}',
  chapter_ref text, -- maps to history.md chapters: 'manbarra', 'reserve', 'hull-river', 'dormitories', 'strike-1957', 'act', 'languages', 'mulrunji', 'picc', 'self-determination', 'next-twenty'
  cultural_sensitivity_level text default 'low', -- low, medium, high, restricted
  elder_approval_required boolean default false,
  is_verified boolean default false, -- human-verified accuracy
  provenance_notes text, -- copyright, access rights, attribution
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_artifacts_chapter on historical_artifacts(chapter_ref);
create index if not exists idx_artifacts_type on historical_artifacts(artifact_type);
create index if not exists idx_artifacts_tags on historical_artifacts using gin(tags);
create index if not exists idx_artifacts_source on historical_artifacts(source_name);
create index if not exists idx_artifacts_date on historical_artifacts(date_original);

-- RLS
alter table historical_artifacts enable row level security;

-- Public read for verified, non-restricted artifacts
create policy "Public can view verified artifacts"
  on historical_artifacts for select
  using (is_verified = true and cultural_sensitivity_level != 'restricted');

-- Service role can do everything
create policy "Service role full access to artifacts"
  on historical_artifacts for all
  using (auth.role() = 'service_role');
