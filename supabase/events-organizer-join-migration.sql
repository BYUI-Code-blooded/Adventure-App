-- Organizer details are now looked up from the creator's profile instead of being copied onto each
-- event, so a profile change shows up on every event right away.
-- Run this ONCE in the Supabase SQL Editor, after supabase/events-migration.sql.
-- supabase/schema.sql does NOT contain these changes yet.
--   name:            public_profiles (id, name), joined on events.creator_id. Readable by everyone.
--   email and phone: public.event_organizer_contacts(event_ids), signed-in members only, and only
--                    for events that haven't ended (everyone else's phone stays private).

begin;

-- ---------- remove the copied columns and the triggers that filled and cleared them ----------
drop trigger events_fill_organizer on public.events;
drop trigger events_clear_organizer_contact on public.events;
drop function public.fill_event_organizer();
drop function public.clear_event_organizer_contact();

alter table public.events
  drop column organizer_name,
  drop column organizer_email,
  drop column organizer_phone;

-- Nothing private is left on events, so visitors can read every column again (including select *).
grant select on public.events to anon;

-- ---------- policies ----------
-- Same as before, plus: people need a name on their profile before they can organize.
drop policy "events_insert_own" on public.events;

create policy "events_insert_own" on public.events
  for insert to authenticated
  with check (
    creator_id = (select auth.uid())
    and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.name is not null
    )
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

-- ---------- organizer contact details ----------
-- Takes event ids, not user ids, so it can only ever reveal the organizer of an event, never an
-- arbitrary member. Only events that haven't ended count, so contact details stop being shared
-- once someone's events are over.
-- Runs with its owner's rights so it can read profiles and auth.users, which the browser can't.
-- Returns nothing for anonymous sessions.
create function public.event_organizer_contacts(p_event_ids uuid[])
returns table (event_id uuid, email text, phone text)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, u.email::text, p.phone
  from public.events e
  join public.profiles p on p.id = e.creator_id
  join auth.users u on u.id = e.creator_id
  where e.id = any (p_event_ids)
    and e.end_time > now()
    and (select auth.uid()) is not null
    and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false;
$$;

revoke execute on function public.event_organizer_contacts(uuid[]) from public, anon;
grant execute on function public.event_organizer_contacts(uuid[]) to authenticated;

commit;
