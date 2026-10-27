-- Database schema for the Local Adventures & Activities Guide (Supabase / Postgres).
-- Run once in the Supabase SQL Editor (or `supabase db push`) on a fresh project.
-- RLS is enabled explicitly on every table. Policies use (select auth.uid()).
-- Supabase grants anon/authenticated full DML on new public objects by default, so
-- every table/view below restricts privileges explicitly and RLS does the rest.

-- ============================================================
-- profiles: one private row per auth user (email lives in auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text check (name is null or char_length(name) between 1 and 80),
  phone text check (phone is null or char_length(phone) between 5 and 30),
  role text not null default 'user' check (role in ('user', 'developer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can only read and edit their own profile. Rows are created by the trigger below.
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Nobody can change their own role: only name and phone are updatable from the browser.
revoke update on public.profiles from anon, authenticated;
grant update (name, phone) on public.profiles to authenticated;

-- Public, read-only view: only id and name (no phone, no role).
-- Views run with their owner's rights and are auto-updatable, so remove all
-- default privileges first and grant SELECT only.
create view public.public_profiles as
  select id, name from public.profiles;
revoke all on public.public_profiles from public, anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

-- Emails that get a staff role automatically when they sign up (managed in the
-- Supabase SQL Editor, never from the browser; the rows are NOT stored in git).
create table public.role_assignments (
  email text primary key check (email = lower(email)),
  role text not null check (role in ('developer', 'admin'))
);

alter table public.role_assignments enable row level security;
revoke all on public.role_assignments from public, anon, authenticated;

-- Create the profile automatically when a user signs up (role from role_assignments, else 'user').
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role)
  values (
    new.id,
    coalesce(
      (select ra.role from public.role_assignments ra where ra.email = lower(new.email)),
      'user'
    )
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by policies: is the current user staff (admin or developer)?
create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'developer')
  );
$$;

-- Only signed-in users need it (it is only used by policies that apply to them).
revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

-- ============================================================
-- activities: curated by us (is_featured) or created by users
-- created_by becomes null if the author's account is deleted (content is kept).
-- ============================================================
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  description text check (description is null or char_length(description) <= 1000),
  address text check (address is null or char_length(address) <= 200),
  lat double precision not null check (lat between -90 and 90),
  lon double precision not null check (lon between -180 and 180),
  photo_url text check (photo_url is null or (photo_url ~ '^https://' and char_length(photo_url) <= 500)),
  website_url text,
  category text not null check (category in ('outdoor', 'indoor', 'food', 'weekend')),
  is_featured boolean not null default false,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  weekly_hours jsonb,
  delivery_available boolean,
  google_rating numeric(2, 1) check (google_rating is null or google_rating between 1 and 5),
  google_maps_url text check (google_maps_url is null or google_maps_url ~ '^https://(www\.)?google\.com/maps'),
  google_rating_checked_at date,
  walkable_from_campus boolean
);

create index activities_category_idx on public.activities (category);
create index activities_created_by_idx on public.activities (created_by);

alter table public.activities enable row level security;

create policy "activities_select_all" on public.activities
  for select to anon, authenticated
  using (true);

-- Only staff (admin or developer) can mark an activity as featured.
create policy "activities_insert_own" on public.activities
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (is_featured = false or (select public.is_staff()))
  );

create policy "activities_update_own_or_staff" on public.activities
  for update to authenticated
  using (created_by = (select auth.uid()) or (select public.is_staff()))
  with check (
    (created_by = (select auth.uid()) and is_featured = false)
    or (select public.is_staff())
  );

create policy "activities_delete_own_or_staff" on public.activities
  for delete to authenticated
  using (created_by = (select auth.uid()) or (select public.is_staff()));

-- id, created_by and created_at can never be changed from the browser.
revoke update on public.activities from anon, authenticated;
grant update (name, description, address, lat, lon, photo_url, website_url, category, is_featured)
  on public.activities to authenticated;
grant update (weekly_hours, delivery_available, google_rating, google_maps_url, google_rating_checked_at, walkable_from_campus)
  on public.activities to authenticated;

-- ============================================================
-- events: someone schedules an activity at a time
-- creator_id becomes null if the creator's account is deleted (event is kept).
-- ============================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  creator_id uuid default auth.uid() references auth.users (id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  max_participants integer not null check (max_participants between 1 and 1000),
  created_at timestamptz not null default now(),
  check (end_time > start_time),
  check (end_time <= start_time + interval '24 hours')
);

create index events_activity_id_idx on public.events (activity_id);
create index events_creator_id_idx on public.events (creator_id);
create index events_start_time_idx on public.events (start_time);

alter table public.events enable row level security;

create policy "events_select_all" on public.events
  for select to anon, authenticated
  using (true);

-- Creators can only schedule events from 5 minutes ago up to one year ahead.
create policy "events_insert_own" on public.events
  for insert to authenticated
  with check (
    creator_id = (select auth.uid())
    and start_time >= now() - interval '5 minutes'
    and start_time <= now() + interval '1 year'
  );

create policy "events_update_own_or_staff" on public.events
  for update to authenticated
  using (creator_id = (select auth.uid()) or (select public.is_staff()))
  with check (
    (
      creator_id = (select auth.uid())
      and start_time >= now() - interval '5 minutes'
      and start_time <= now() + interval '1 year'
    )
    or (select public.is_staff())
  );

create policy "events_delete_own_or_staff" on public.events
  for delete to authenticated
  using (creator_id = (select auth.uid()) or (select public.is_staff()));

-- id, activity_id, creator_id and created_at can never be changed from the browser.
revoke update on public.events from anon, authenticated;
grant update (start_time, end_time, max_participants) on public.events to authenticated;

-- Max participants can never go below the number of people already joined.
create function public.enforce_event_max_participants()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.max_participants < (
    select count(*) from public.event_attendees where event_id = new.id
  ) then
    raise exception 'max_participants cannot be lower than the current attendee count';
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_event_max_participants() from public, anon, authenticated;

-- ============================================================
-- event_attendees: who joined which event (count = number of rows)
-- ============================================================
create table public.event_attendees (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index event_attendees_user_id_idx on public.event_attendees (user_id);

alter table public.event_attendees enable row level security;

create policy "event_attendees_select_all" on public.event_attendees
  for select to anon, authenticated
  using (true);

create policy "event_attendees_insert_own" on public.event_attendees
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "event_attendees_delete_own" on public.event_attendees
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- Attendees are never edited: join or leave only.
revoke update on public.event_attendees from anon, authenticated;

-- Reject joins once an event is full. The event row is locked (FOR UPDATE) so two
-- simultaneous joins cannot both take the last spot.
create function public.enforce_event_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  max_allowed integer;
begin
  select max_participants into max_allowed
  from public.events
  where id = new.event_id
  for update;

  if max_allowed is not null
     and (select count(*) from public.event_attendees where event_id = new.event_id) >= max_allowed then
    raise exception 'Event is full';
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_event_capacity() from public, anon, authenticated;

create trigger event_attendees_capacity
  before insert on public.event_attendees
  for each row execute function public.enforce_event_capacity();

create trigger events_max_participants
  before update of max_participants on public.events
  for each row execute function public.enforce_event_max_participants();
