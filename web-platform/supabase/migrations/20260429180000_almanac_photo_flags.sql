-- Editor flags on almanac photo slots.
-- One row per slot_id. Editors flag a slot as wrong / needs review /
-- still placeholder / approved. Comment + author + timestamps.

create table if not exists almanac_photo_flags (
  slot_id      text primary key,
  flag_type    text not null default 'wrong'
               check (flag_type in ('wrong', 'review', 'placeholder', 'approved')),
  comment      text,
  flagged_by   text,
  flagged_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

create index if not exists idx_almanac_photo_flags_type on almanac_photo_flags (flag_type);
create index if not exists idx_almanac_photo_flags_unresolved on almanac_photo_flags (resolved_at) where resolved_at is null;

create or replace function touch_almanac_photo_flags_at()
returns trigger language plpgsql as $$
begin
  new.flagged_at := now();
  return new;
end;
$$;

drop trigger if exists trg_almanac_photo_flags_touch on almanac_photo_flags;
create trigger trg_almanac_photo_flags_touch
  before update on almanac_photo_flags
  for each row execute function touch_almanac_photo_flags_at();
