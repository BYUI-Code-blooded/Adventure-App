-- User-created events: an event has its own name, description and location, can stand on its own
-- (no activity needed), can be unlimited, and records who is organizing it.
-- Paste this whole file in the Supabase SQL Editor ONCE, before deploying the code that uses it.
-- supabase/schema.sql does NOT contain these changes yet.
-- Assumes public.events is empty (it was when this was written); otherwise it stops without changing anything.

begin;

-- ---------- columns ----------
alter table public.events
  alter column activity_id drop not null,
  alter column max_participants drop not null, -- null means unlimited
  add column name text not null check (char_length(name) between 1 and 100),
  add column description text not null check (char_length(description) between 1 and 1000),
  add column address text check (address is null or char_length(address) between 1 and 200),
  add column lat double precision check (lat between -90 and 90),
  add column lon double precision check (lon between -180 and 180),
  add column organizer_name text not null,
  add column organizer_email text,
  add column organizer_phone text,
  -- Coordinates come as a pair, and an event needs an address, coordinates, or both.
  add constraint events_lat_lon_pair check ((lat is null) = (lon is null)),
  add constraint events_has_location check (address is not null or lat is not null);

-- ---------- privacy ----------
-- Signed-out visitors can read events but not the organizer's email or phone. They must list their
-- columns: "select *" is refused for anon. Signed-in members keep access to every column.
revoke select on public.events from anon;
grant select (
  id, activity_id, creator_id, start_time, end_time, max_participants, created_at,
  name, description, address, lat, lon, organizer_name
) on public.events to anon;

-- ---------- policies ----------
-- The activity is now optional, real accounts only, and pinned events must be near Rexburg.
drop policy "events_insert_own" on public.events;

create policy "events_insert_own" on public.events
  for insert to authenticated
  with check (
    creator_id = (select auth.uid())
    and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    and start_time >= now() - interval '5 minutes'
    and start_time <= now() + interval '1 year'
    and (
      activity_id is null
      or exists (
        select 1 from public.activities a
        where a.id = activity_id and a.status = 'approved'
      )
    )
    and (lat is null or public.within_rexburg_area(lat, lon))
  );

-- ---------- organizer details ----------
-- Always copied from the creator's profile, so nobody can post as someone else. Anything the
-- browser sends for these columns is overwritten.
create function public.fill_event_organizer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select p.name, u.email, p.phone
    into new.organizer_name, new.organizer_email, new.organizer_phone
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = new.creator_id;

  if new.organizer_name is null then
    raise exception 'Add your name to your profile before creating an event.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

revoke execute on function public.fill_event_organizer() from public, anon, authenticated;

create trigger events_fill_organizer
  before insert on public.events
  for each row execute function public.fill_event_organizer();

-- When an account is deleted its events are kept (creator_id becomes null), but the contact details go.
create function public.clear_event_organizer_contact()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.creator_id is null then
    new.organizer_email := null;
    new.organizer_phone := null;
  end if;
  return new;
end;
$$;

revoke execute on function public.clear_event_organizer_contact() from public, anon, authenticated;

create trigger events_clear_organizer_contact
  before update of creator_id on public.events
  for each row execute function public.clear_event_organizer_contact();

commit;
