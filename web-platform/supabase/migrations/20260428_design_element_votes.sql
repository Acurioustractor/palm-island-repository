-- Design system voting table.
-- One row per element slug from lib/design-system/elements-registry.ts.
-- Single voter (the team), so no vote history — overwrite latest.

create table if not exists design_element_votes (
  slug          text primary key,
  status        text not null default 'concept'
                check (status in ('concept', 'approved', 'priority', 'retire')),
  vote          text check (vote in ('fire', 'up', 'meh', 'down')),
  score         int  not null default 0,
  intended_use  text,
  notes         text,
  updated_at    timestamptz not null default now()
);

create index if not exists idx_design_element_votes_status on design_element_votes (status);
create index if not exists idx_design_element_votes_score  on design_element_votes (score desc);

-- Touch updated_at on update
create or replace function touch_design_element_votes_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_design_element_votes_touch on design_element_votes;
create trigger trg_design_element_votes_touch
  before update on design_element_votes
  for each row execute function touch_design_element_votes_updated_at();
