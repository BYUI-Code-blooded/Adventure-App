-- Activity suggestions: users propose activities, staff (admin/developer) approve or reject them.
-- Paste this whole file in the Supabase SQL Editor ONCE. supabase/schema.sql already contains the same final state.
-- Existing activities become 'approved'. New rows from regular users must be 'pending'.

begin;

-- ---------- columns ----------
alter table public.activities
  add column status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  add column rejection_reason text check (rejection_reason is null or char_length(rejection_reason) <= 300),
  add column reviewed_by uuid references auth.users (id) on delete set null,
  add column reviewed_at timestamptz;

create index activities_status_idx on public.activities (status);

-- ---------- helper: is a point within 300 km of Rexburg? (haversine, in km) ----------
create function public.within_rexburg_area(p_lat double precision, p_lon double precision)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select 2 * 6371 * asin(sqrt(
    power(sin(radians(p_lat - 43.826) / 2), 2)
    + cos(radians(43.826)) * cos(radians(p_lat)) * power(sin(radians(p_lon + 111.7897) / 2), 2)
  )) <= 300;
$$;

-- ---------- policies ----------
drop policy "activities_select_all" on public.activities;
drop policy "activities_insert_own" on public.activities;
drop policy "activities_update_own_or_staff" on public.activities;
drop policy "activities_delete_own_or_staff" on public.activities;

-- Visitors only see approved activities. Signed-in users also see their own; staff see everything.
create policy "activities_select_approved" on public.activities
  for select to anon
  using (status = 'approved');

create policy "activities_select_visible" on public.activities
  for select to authenticated
  using (
    status = 'approved'
    or created_by = (select auth.uid())
    or (select public.is_staff())
  );

-- Staff can publish directly. Everyone else can only submit a pending, non-featured idea near Rexburg.
create policy "activities_insert_own" on public.activities
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (
      (select public.is_staff())
      or (
        status = 'pending'
        and is_featured = false
        and reviewed_by is null
        and reviewed_at is null
        and rejection_reason is null
        and public.within_rexburg_area(lat, lon)
      )
    )
  );

-- Only staff edit or review activities (users cannot edit a suggestion after sending it).
create policy "activities_update_staff" on public.activities
  for update to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

-- Users can withdraw their own pending suggestions; staff can delete anything.
create policy "activities_delete_own_pending_or_staff" on public.activities
  for delete to authenticated
  using (
    (created_by = (select auth.uid()) and status = 'pending')
    or (select public.is_staff())
  );

revoke update on public.activities from anon, authenticated;
grant update (name, description, address, lat, lon, photo_url, website_url, category, is_featured, status, rejection_reason)
  on public.activities to authenticated;
grant update (weekly_hours, delivery_available, google_rating, google_maps_url, google_rating_checked_at, walkable_from_campus)
  on public.activities to authenticated;

-- ---------- triggers ----------
-- Regular users can have at most 5 pending suggestions at a time.
create function public.enforce_pending_suggestion_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'pending' and not public.is_staff() then
    perform pg_advisory_xact_lock(hashtext(new.created_by::text));
    if (select count(*) from public.activities a
        where a.created_by = new.created_by and a.status = 'pending') >= 5 then
      raise exception 'You already have 5 pending suggestions. Wait for a review or delete one.'
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_pending_suggestion_limit() from public, anon, authenticated;

create trigger activities_pending_limit
  before insert on public.activities
  for each row execute function public.enforce_pending_suggestion_limit();

-- Stamp who reviewed an activity and when, whenever its status changes.
create function public.stamp_activity_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.reviewed_by := auth.uid();
    new.reviewed_at := now();
    if new.status <> 'rejected' then
      new.rejection_reason := null;
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.stamp_activity_review() from public, anon, authenticated;

create trigger activities_stamp_review
  before update on public.activities
  for each row execute function public.stamp_activity_review();

-- ---------- events can only be created for approved activities ----------
drop policy "events_insert_own" on public.events;

create policy "events_insert_own" on public.events
  for insert to authenticated
  with check (
    creator_id = (select auth.uid())
    and start_time >= now() - interval '5 minutes'
    and start_time <= now() + interval '1 year'
    and exists (
      select 1 from public.activities a
      where a.id = activity_id and a.status = 'approved'
    )
  );

commit;
