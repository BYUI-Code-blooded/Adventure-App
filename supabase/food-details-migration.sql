-- Run this once in Supabase SQL Editor to add food details to an existing project.
-- weekly_hours is keyed by lowercase weekday name; closed days are JSON null.
-- Example: {"monday":{"open":"10:00","close":"21:00"},"sunday":null}
-- Times are local to Rexburg (America/Denver), in 24-hour HH:MM format.

alter table public.activities
  add column if not exists weekly_hours jsonb,
  add column if not exists delivery_available boolean,
  add column if not exists google_rating numeric(2, 1),
  add column if not exists google_maps_url text,
  add column if not exists google_rating_checked_at date,
  add column if not exists walkable_from_campus boolean;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'activities_google_rating_range_check'
      and conrelid = 'public.activities'::regclass
  ) then
    alter table public.activities
      add constraint activities_google_rating_range_check
      check (google_rating is null or google_rating between 1 and 5);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'activities_google_maps_url_check'
      and conrelid = 'public.activities'::regclass
  ) then
    alter table public.activities
      add constraint activities_google_maps_url_check
      check (google_maps_url is null or google_maps_url ~ '^https://(www\.)?google\.com/maps');
  end if;
end;
$$;

-- Keep edits governed by the existing activities RLS policies (owners/staff only).
grant update (weekly_hours, delivery_available, google_rating, google_maps_url,
  google_rating_checked_at, walkable_from_campus)
  on public.activities to authenticated;

notify pgrst, 'reload schema';
