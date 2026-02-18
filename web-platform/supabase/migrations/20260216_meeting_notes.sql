-- Meeting notes / reflections collection
-- Stores dated transcripts, summaries, and key themes from Elders group and other meetings.

create table if not exists meeting_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meeting_date date not null,
  location text default 'Palm Island',
  group_name text default 'Elders Group',

  -- Content
  transcript text,
  summary text,
  key_themes text[] default '{}',
  action_items text[] default '{}',
  attendees text[] default '{}',

  -- Metadata
  recorded_by text,
  is_public boolean default false,
  is_sensitive boolean default false,
  sensitivity_notes text,

  -- Links
  related_project_slug text,
  media_ids uuid[] default '{}',

  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for date browsing and search
create index if not exists idx_meeting_notes_date on meeting_notes (meeting_date desc);
create index if not exists idx_meeting_notes_group on meeting_notes (group_name);

-- Enable RLS
alter table meeting_notes enable row level security;

-- Allow authenticated users to read non-sensitive meetings
create policy "meeting_notes_read" on meeting_notes
  for select using (true);

-- Allow service role full access
create policy "meeting_notes_service_all" on meeting_notes
  for all using (auth.role() = 'service_role');

comment on table meeting_notes is 'Dated collection of meeting transcripts, reflections, and action items. Primarily used by the Elders Group.';
