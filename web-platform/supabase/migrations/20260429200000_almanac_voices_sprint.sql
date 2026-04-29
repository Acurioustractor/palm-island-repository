-- Voice-capture sprint tracker for the 2024-25 almanac.
-- The almanac targets 20 *new* captures (named voices, with attribution
-- + consent, tied to a service or theme). This table is the working
-- list — editors add as they capture, mark validated/published once done.

create table if not exists almanac_voices (
  id              uuid primary key default gen_random_uuid(),
  speaker_name    text not null,
  speaker_role    text,
  service_slug    text,                -- optional link to a PICC service
  theme           text,                -- e.g. 'safety', 'family', 'culture', 'health'
  quote           text not null,
  context         text,                -- the longer quote / situation around it
  consent_status  text not null default 'pending'
                  check (consent_status in ('pending', 'verbal', 'signed', 'declined')),
  captured_by     text,
  captured_at     date,
  source          text,                -- 'interview' | 'workshop' | 'phone' | 'other'
  el_storyteller_id text,             -- optional link into EL v2
  photo_url       text,
  status          text not null default 'draft'
                  check (status in ('draft', 'review', 'approved', 'published', 'declined')),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_almanac_voices_status on almanac_voices (status);
create index if not exists idx_almanac_voices_service on almanac_voices (service_slug);
create index if not exists idx_almanac_voices_consent on almanac_voices (consent_status);

create or replace function touch_almanac_voices_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_almanac_voices_touch on almanac_voices;
create trigger trg_almanac_voices_touch
  before update on almanac_voices
  for each row execute function touch_almanac_voices_at();
