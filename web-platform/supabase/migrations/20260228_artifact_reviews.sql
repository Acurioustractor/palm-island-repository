-- Artifact Reviews Table
-- Allows elders and community members to submit corrections, additions,
-- sensitivity flags, and approvals for historical artifacts and chapters.
-- No auth required — name-based submission like chat feedback pattern.

create table if not exists artifact_reviews (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid references historical_artifacts(id),
  story_id uuid references stories(id),
  chapter_ref text,
  reviewer_name text not null,
  review_type text not null, -- 'correction', 'addition', 'sensitivity_flag', 'approval'
  content text,
  status text default 'pending', -- 'pending', 'reviewed', 'applied'
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_artifact_reviews_artifact on artifact_reviews(artifact_id);
create index if not exists idx_artifact_reviews_chapter on artifact_reviews(chapter_ref);
create index if not exists idx_artifact_reviews_status on artifact_reviews(status);
create index if not exists idx_artifact_reviews_type on artifact_reviews(review_type);

-- RLS
alter table artifact_reviews enable row level security;

-- Anyone can insert reviews (no auth required)
create policy "Anyone can submit reviews"
  on artifact_reviews for insert
  with check (true);

-- Only service role can read/update reviews
create policy "Service role full access to reviews"
  on artifact_reviews for all
  using (auth.role() = 'service_role');
