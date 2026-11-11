-- Run in the Supabase SQL Editor to add five real weekend activities.
-- Safe to run more than once: new rows are inserted, and rows with the same name get their
-- description refreshed (so line breaks and wording fixes apply to existing rows too).
-- The activities table has no columns for start time, repeat schedule, capacity
-- or one-time dates, so those live in the last line of each description.
-- UNVERIFIED: every lat/lon below is an estimate from the street address.
-- Check each one on the map before launch.

with weekend_items (name, description, address, website_url, lat, lon) as (
  values
    (
      'Late Night MTG Commander',
      'Come to Miniature Manager Hobbies and Games for some fun, late night games of Magic: The Gathering in the gamemode of Commander! The store closes at 1am and groups continue to play all the way to closing.'
        || E'\n' || 'When: Fridays at 9pm (repeats weekly)' || E'\n' || 'Capacity: 24',
      '76 East 1st North, Rexburg, ID, 83440',
      'https://theminiaturemanager.github.io/miniature-website/',
      43.8268::double precision, -111.7885::double precision
    ),
    (
      'Holidae F&G: Competitive Commander',
      'Saturdays are for Competitive Commander! Bring your favorite deck and enjoy some fast-paced, Bracket 5 Commander gameplay.'
        || E'\n' || 'When: Saturdays at 1pm (repeats weekly)' || E'\n' || 'Location: Holidae Fun & Games - Rexburg',
      '435 W 2nd S, Rexburg, ID, 83440',
      'https://holidaegames.com/',
      43.8222::double precision, -111.7967::double precision
    ),
    (
      'Roller Skating',
      'Come have some fun roller skating with friends, someone special, or just come to meet someone new! $3.00 per person with Student ID, $4.00 without.'
        || E'\n' || 'When: Saturdays at 6pm (repeats weekly)' || E'\n' || 'Location: Manwaring Center Grand Ballrooms (BTH203 Ballroom)',
      '101 E Viking St, Rexburg, ID 83460',
      'https://www.byui.edu/student-activities/weekly',
      43.8205::double precision, -111.7843::double precision
    ),
    (
      'Stadium Singing: English',
      'Come to Stadium Singing to experience the Spirit and peace that is felt through singing hymns!'
        || E'\n' || 'When: Sundays at 8:45pm (repeats weekly)' || E'\n' || 'Location: BYU-I Stadium OR 231A Crossroads; follow @stadsing.byui on Instagram to find the location for the evening.',
      '239 S 1st W, Rexburg, ID 83460',
      'https://www.instagram.com/stadsing.byui',
      43.8225::double precision, -111.7915::double precision
    ),
    (
      'Devotional: Elder Gary E. Stevenson',
      'Elder Gary E. Stevenson from the Quorum of the Twelve Apostles will be at BYU-Idaho to deliver remarks to the community of Rexburg, ID.'
        || E'\n' || 'When: November 15, 2026 at 5pm (one time)' || E'\n' || 'Location: BYU-Idaho Center, or watch live on BYU-Idaho Devotionals, the BYU-Idaho Speeches YouTube channel (https://www.youtube.com/@BYU-IdahoSpeeches), and BYU-Idaho Radio (https://www.byui.edu/radio/stream-915).',
      '50 W Viking Dr, Rexburg, ID 83460',
      'https://www.byui.edu/speeches/devotionals',
      43.8204::double precision, -111.7868::double precision
    )
),
updated as (
  update public.activities as a
  set description = w.description
  from weekend_items as w
  where a.category = 'weekend'
    and a.name = w.name
    and a.description is distinct from w.description
  returning a.id
)
insert into public.activities (name, description, address, website_url, lat, lon, category, is_featured, status)
select item.name, item.description, item.address, item.website_url, item.lat, item.lon, 'weekend', false, 'approved'
from weekend_items as item
where not exists (
  select 1
  from public.activities as existing
  where existing.category = 'weekend'
    and existing.name = item.name
);

select name, address, website_url, lat, lon, status
from public.activities
where category = 'weekend'
  and name in (
    'Late Night MTG Commander',
    'Holidae F&G: Competitive Commander',
    'Roller Skating',
    'Stadium Singing: English',
    'Devotional: Elder Gary E. Stevenson'
  )
order by name;
