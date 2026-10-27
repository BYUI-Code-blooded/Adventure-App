-- Populate the food-detail columns on existing public.activities rows.
-- Run in the Supabase SQL Editor after food-details-migration.sql.
-- Google ratings are dated snapshots and should be rechecked periodically.
-- Weekly hours are local Rexburg time (America/Denver), 24-hour HH:MM.

with venue_data (
  name_pattern, address_pattern, weekly_hours, delivery_available,
  google_rating, google_maps_url, walkable_from_campus
) as (
  values
    (
      -- Match common spellings such as Chick-fil-A and Chick-flo-a.
      '%chick%a%', null,
      '{"monday":{"open":"08:30","close":"19:00"},"tuesday":{"open":"08:30","close":"19:00"},"wednesday":{"open":"08:30","close":"19:00"},"thursday":{"open":"08:30","close":"19:00"},"friday":{"open":"08:30","close":"19:00"},"saturday":{"open":"11:00","close":"18:00"},"sunday":null}'::jsonb,
      false, 3.8::numeric, 'https://www.google.com/maps/search/?api=1&query=Chick-fil-A+BYU-Idaho+Rexburg+ID', true
    ),
    (
      '%pizza pie cafe%', null,
      '{"monday":{"open":"11:00","close":"21:00"},"tuesday":{"open":"11:00","close":"21:00"},"wednesday":{"open":"11:00","close":"21:00"},"thursday":{"open":"11:00","close":"21:00"},"friday":{"open":"11:00","close":"22:00"},"saturday":{"open":"11:00","close":"22:00"},"sunday":null}'::jsonb,
      true, 4.3::numeric, 'https://www.google.com/maps/search/?api=1&query=Pizza+Pie+Cafe+Rexburg+ID', true
    ),
    (
      '%big jud%', null,
      '{"monday":{"open":"11:00","close":"21:00"},"tuesday":{"open":"11:00","close":"21:00"},"wednesday":{"open":"11:00","close":"21:00"},"thursday":{"open":"11:00","close":"21:00"},"friday":{"open":"11:00","close":"22:00"},"saturday":{"open":"11:00","close":"22:00"},"sunday":null}'::jsonb,
      false, 4.6::numeric, 'https://www.google.com/maps/search/?api=1&query=Big+Jud%27s+Rexburg+ID', false
    ),
    (
      '%hickory%', null,
      '{"monday":{"open":"11:00","close":"21:00"},"tuesday":{"open":"11:00","close":"21:00"},"wednesday":{"open":"11:00","close":"21:00"},"thursday":{"open":"11:00","close":"21:00"},"friday":{"open":"11:00","close":"22:00"},"saturday":{"open":"11:00","close":"22:00"},"sunday":null}'::jsonb,
      true, 4.0::numeric, 'https://www.google.com/maps/search/?api=1&query=The+Hickory+Rexburg+ID', false
    ),
    (
      '%mac shack%', null,
      '{"monday":{"open":"11:30","close":"20:00"},"tuesday":{"open":"11:30","close":"20:00"},"wednesday":{"open":"11:30","close":"20:00"},"thursday":{"open":"11:30","close":"21:00"},"friday":{"open":"11:30","close":"21:00"},"saturday":{"open":"11:30","close":"21:00"},"sunday":null}'::jsonb,
      true, 4.6::numeric, 'https://www.google.com/maps/search/?api=1&query=The+Mac+Shack+Rexburg+ID', false
    ),
    (
      '%little caesar%', null,
      '{"monday":{"open":"11:00","close":"22:00"},"tuesday":{"open":"11:00","close":"22:00"},"wednesday":{"open":"11:00","close":"22:00"},"thursday":{"open":"11:00","close":"22:00"},"friday":{"open":"11:00","close":"23:00"},"saturday":{"open":"11:00","close":"23:00"},"sunday":null}'::jsonb,
      true, 3.9::numeric, 'https://www.google.com/maps/search/?api=1&query=Little+Caesars+26+W+1st+S+Rexburg+ID', true
    ),
    (
      '%mcdonald%', '%175 valley river%',
      '{"monday":{"open":"05:00","close":"02:00"},"tuesday":{"open":"05:00","close":"02:00"},"wednesday":{"open":"05:00","close":"02:00"},"thursday":{"open":"05:00","close":"02:00"},"friday":{"open":"05:00","close":"02:00"},"saturday":{"open":"05:00","close":"02:00"},"sunday":{"open":"05:00","close":"02:00"}}'::jsonb,
      true, 3.7::numeric, 'https://www.google.com/maps/search/?api=1&query=McDonald%27s+175+Valley+River+Dr+Rexburg+ID', false
    ),
    (
      '%mcdonald%', '%850 university%',
      '{"monday":{"open":"05:00","close":"02:00"},"tuesday":{"open":"05:00","close":"02:00"},"wednesday":{"open":"05:00","close":"02:00"},"thursday":{"open":"05:00","close":"02:00"},"friday":{"open":"05:00","close":"02:00"},"saturday":{"open":"05:00","close":"02:00"},"sunday":{"open":"05:00","close":"02:00"}}'::jsonb,
      true, null::numeric, 'https://www.google.com/maps/search/?api=1&query=McDonald%27s+850+University+Blvd+Rexburg+ID', false
    ),
    (
      '%freddy%', null,
      '{"monday":{"open":"10:30","close":"22:00"},"tuesday":{"open":"10:30","close":"22:00"},"wednesday":{"open":"10:30","close":"22:00"},"thursday":{"open":"10:30","close":"22:00"},"friday":{"open":"10:30","close":"23:00"},"saturday":{"open":"10:30","close":"23:00"},"sunday":{"open":"10:30","close":"22:00"}}'::jsonb,
      true, 4.4::numeric, 'https://www.google.com/maps/search/?api=1&query=Freddy%27s+Rexburg+ID', true
    ),
    (
      '%dairy queen%', null,
      '{"monday":{"open":"10:00","close":"23:00"},"tuesday":{"open":"10:00","close":"23:00"},"wednesday":{"open":"10:00","close":"23:00"},"thursday":{"open":"10:00","close":"23:00"},"friday":{"open":"10:00","close":"00:00"},"saturday":{"open":"10:00","close":"00:00"},"sunday":{"open":"11:00","close":"22:00"}}'::jsonb,
      true, 3.8::numeric, 'https://www.google.com/maps/search/?api=1&query=Dairy+Queen+346+N+2nd+E+Rexburg+ID', true
    )
)
update public.activities as activity
set weekly_hours = venue.weekly_hours,
    delivery_available = venue.delivery_available,
    google_rating = venue.google_rating,
    google_maps_url = venue.google_maps_url,
    google_rating_checked_at = case when venue.google_rating is null then null else date '2026-10-26' end,
    walkable_from_campus = venue.walkable_from_campus
from venue_data as venue
where activity.category = 'food'
  and activity.name ilike venue.name_pattern
  and (venue.address_pattern is null or activity.address ilike venue.address_pattern);

-- Review which food records were populated. Rows not matched above remain unchanged.
select name, address, weekly_hours, delivery_available, google_rating, google_maps_url,
       google_rating_checked_at, walkable_from_campus
from public.activities
where category = 'food'
order by name;
