-- Allow real organizers to edit their own upcoming events.
-- Run this once after the existing event migrations.

begin;

drop policy if exists "events_update_own_or_staff" on public.events;
drop policy if exists "events_update_own" on public.events;

create policy "events_update_own_or_staff" on public.events
  for update to authenticated
  using (
    (
      creator_id = (select auth.uid())
      and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    )
    or (select public.is_staff())
  )
  with check (
    (
      creator_id = (select auth.uid())
      and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
      and start_time > now()
      and start_time <= now() + interval '1 year'
      and end_time > start_time
      and end_time <= start_time + interval '24 hours'
      and (lat is null or public.within_rexburg_area(lat, lon))
    )
    or (select public.is_staff())
  );

grant update (
  name,
  description,
  start_time,
  end_time,
  address,
  lat,
  lon,
  max_participants
)
on public.events to authenticated;

commit;
