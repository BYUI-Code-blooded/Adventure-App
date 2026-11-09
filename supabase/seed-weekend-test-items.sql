-- Run in the Supabase SQL Editor to add five clearly labeled sample listings.
-- Safe to run more than once: existing rows with these names are left alone.
-- The addresses and coordinates are sample Rexburg locations, not event details.

with test_items (name, description, address, lat, lon) as (
  values
    (
      'TEST: Nature Park Walk',
      'TEST LISTING — Sample content only. Replace with a real weekend event before launch.',
      'Rexburg, ID (sample location)', 43.8231::double precision, -111.7924::double precision
    ),
    (
      'TEST: Board Game Meetup',
      'TEST LISTING — Sample content only. Replace with a real weekend event before launch.',
      'Rexburg, ID (sample location)', 43.8241::double precision, -111.7914::double precision
    ),
    (
      'TEST: Downtown Photo Walk',
      'TEST LISTING — Sample content only. Replace with a real weekend event before launch.',
      'Rexburg, ID (sample location)', 43.8251::double precision, -111.7904::double precision
    ),
    (
      'TEST: Campus Scavenger Hunt',
      'TEST LISTING — Sample content only. Replace with a real weekend event before launch.',
      'Rexburg, ID (sample location)', 43.8261::double precision, -111.7894::double precision
    ),
    (
      'TEST: Stargazing Meetup',
      'TEST LISTING — Sample content only. Replace with a real weekend event before launch.',
      'Rexburg, ID (sample location)', 43.8271::double precision, -111.7884::double precision
    )
)
insert into public.activities (name, description, address, lat, lon, category, is_featured)
select item.name, item.description, item.address, item.lat, item.lon, 'weekend', false
from test_items as item
where not exists (
  select 1
  from public.activities as existing
  where existing.category = 'weekend'
    and existing.name = item.name
);

select name, description, address
from public.activities
where category = 'weekend'
  and name like 'TEST:%'
order by name;
