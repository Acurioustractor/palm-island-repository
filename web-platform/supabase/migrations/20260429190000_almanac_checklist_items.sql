-- Pre-publish checklist for the 2024-25 almanac.
-- Single pane of every blocker before the almanac can ship: data still missing,
-- sign-offs outstanding, photo flags to clear, content to lock, video to cut.
-- One row per checklist item (slug = stable PK editors can deep-link to).

create table if not exists almanac_checklist_items (
  slug         text primary key,
  category     text not null
               check (category in ('data', 'sign-off', 'photos', 'content', 'video')),
  title        text not null,
  description  text,
  owner        text,
  due_date     date,
  urgency      text not null default 'normal'
               check (urgency in ('urgent', 'normal', 'low')),
  status       text not null default 'open'
               check (status in ('open', 'in-progress', 'done', 'blocked', 'n-a')),
  resolved_at  timestamptz,
  comment      text,
  sort_order   int not null default 100,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_almanac_checklist_status on almanac_checklist_items (status);
create index if not exists idx_almanac_checklist_category on almanac_checklist_items (category);
create index if not exists idx_almanac_checklist_open
  on almanac_checklist_items (urgency, sort_order)
  where status in ('open', 'in-progress', 'blocked');

-- Auto-touch updated_at + auto-set resolved_at when status flips to done/n-a.
create or replace function touch_almanac_checklist_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status in ('done', 'n-a') and (old.status is null or old.status not in ('done', 'n-a')) then
    new.resolved_at := now();
  elsif new.status not in ('done', 'n-a') then
    new.resolved_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_almanac_checklist_touch on almanac_checklist_items;
create trigger trg_almanac_checklist_touch
  before update on almanac_checklist_items
  for each row execute function touch_almanac_checklist_at();

-- Seed the known blockers. ON CONFLICT DO NOTHING so re-running migration
-- doesn't clobber editor changes.
insert into almanac_checklist_items (slug, category, title, description, owner, urgency, sort_order) values
  ('aged-care-numbers', 'data', 'Confirm Aged Care episode + client counts', 'Numbers still placeholder. Need final FY24-25 figures from Aged Care service lead.', 'Narelle', 'urgent', 10),
  ('financial-figures', 'data', 'Lock financial summary figures', 'Revenue + surplus figures need final sign-off from finance before print.', 'Finance', 'urgent', 11),
  ('blue-card-decision', 'data', 'Decide if Blue Card Notices stat goes in', '~20 Blue Card Notices issued — confirm with Narelle whether to surface or omit.', 'Narelle', 'urgent', 12),
  ('enterprises-desc', 'content', 'Write Enterprises service description', 'Aged Care + Enterprises were added late — Enterprises still has no body copy.', 'Narelle', 'urgent', 20),
  ('childrens-lunch-decision', 'content', 'Decide on Children''s Lunch Program inclusion', 'Folded into CFC or its own section? Awaiting Narelle call.', 'Narelle', 'normal', 21),
  ('1000d-status', 'content', '1000 Days program status check', 'Confirm whether 1000 Days is still active + how to describe it.', 'Narelle', 'normal', 22),
  ('forward-commitments-3', 'content', 'Lock 3 forward commitments', 'Three forward commitments for 2025-26 still draft — board needs to sign off.', 'Board', 'normal', 23),
  ('photo-consent-elders', 'photos', 'Verify Elder photo consent', 'Every photo of an Elder needs documented consent on file before print.', 'Cultural', 'urgent', 30),
  ('photo-flags-resolved', 'photos', 'Clear all flagged photos', 'See /picc/almanac/photos — every wrong/review flag must be resolved.', 'Editor', 'normal', 31),
  ('cover-photo-final', 'photos', 'Final cover photo locked', 'Cover treatment + photo selection signed off by Rachel + Narelle.', 'Rachel', 'urgent', 32),
  ('back-cover-quote', 'photos', 'Back cover quote + attribution', 'Pull quote + attribution for back cover — needs Elder approval.', 'Cultural', 'normal', 33),
  ('voices-captures-20', 'content', '20 voice captures for almanac', 'Voices sprint target. See /picc/voices for current count.', 'Capture team', 'normal', 24),
  ('video-overlays-cut', 'video', 'All 5–30s video overlays cut', 'Video overlays for digital almanac — cut + uploaded to EL v2.', 'Editor', 'normal', 40),
  ('ceo-message-final', 'sign-off', 'CEO message — final draft signed off', 'Rachel''s opening message — final version in editor.', 'Rachel', 'urgent', 50),
  ('chair-message-final', 'sign-off', 'Chair message — final draft signed off', 'Chair''s opening message — final version in editor.', 'Chair', 'urgent', 51),
  ('board-approval', 'sign-off', 'Board approval to publish', 'Whole almanac signed off by board before going public.', 'Board', 'urgent', 52),
  ('cultural-protocols', 'sign-off', 'Cultural protocols review', 'Full read-through by cultural advisor — Elder content, sensitivity, attribution.', 'Cultural', 'urgent', 53)
on conflict (slug) do nothing;
