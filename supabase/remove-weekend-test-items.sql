-- Removes the five sample "TEST: ..." weekend listings added by seed-weekend-test-items.sql.
-- Run MANUALLY in the Supabase SQL Editor. Nothing else runs this file.
--
-- WARNING: events.activity_id is ON DELETE CASCADE, so deleting an activity also deletes every
-- event created for it (and that event's joins/comments). Run STEP 1 first and look at
-- "events_that_will_be_deleted" before running STEP 2.
--
-- Only rows with category = 'weekend' AND name starting with 'TEST:' are matched.
-- Real listings (for example 'Roller Skating') do not match and are not touched.

-- STEP 1: Preview. Which rows would be deleted, and how many events reference each one.
select
  a.id,
  a.name,
  a.status,
  count(e.id) as events_that_will_be_deleted
from public.activities as a
left join public.events as e on e.activity_id = a.id
where a.category = 'weekend'
  and a.name like 'TEST:%'
group by a.id, a.name, a.status
order by a.name;

-- STEP 2: Delete. Run this only after checking the numbers above.
-- Uses the same restriction as STEP 1, so it deletes exactly the rows previewed.
delete from public.activities
where category = 'weekend'
  and name like 'TEST:%';

-- STEP 3 (optional): Confirm. Should return zero rows.
select id, name
from public.activities
where category = 'weekend'
  and name like 'TEST:%';
