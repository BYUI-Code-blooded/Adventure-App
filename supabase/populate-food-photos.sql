-- Populate photo_url on existing food rows in public.activities.
-- Run in the Supabase SQL Editor. Only fills rows that have no photo yet,
-- so photos added through the app are never overwritten.
-- These are hotlinked third-party images and can break; recheck periodically.

with venue_photos (name_pattern, photo_url) as (
  values
    -- Match common spellings such as Chick-fil-A and Chick-flo-a.
    ('%chick%a%', 'https://cdn6.localdatacdn.com/images/5541950/d_chick_fil_a_photo.jpg'),
    ('%pizza pie cafe%', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/e6/63/60/20160708-192430-largejpg.jpg?h=-1&s=1&w=1400'),
    ('%big jud%', 'https://s6.localdatacdn.com/images/3427115/m_big_jud_s_photo.jpg'),
    ('%hickory%', 'https://i.autoreserve.com/thumb/800x800/restaurant_image/image/045/299/450/45299450/f4f8bc52-c7bc-4211-bdcf-6fb5060b6347.jpg?format=webp'),
    ('%mac shack%', 'https://cdn6.localdatacdn.com/images/9438292/d_the_mac_shack_photo.jpg')
)
update public.activities as activity
set photo_url = venue.photo_url
from venue_photos as venue
where activity.category = 'food'
  and activity.name ilike venue.name_pattern
  and activity.photo_url is null;

-- Review which food records have a photo. Rows without one fall back to the website logo.
select name, address, photo_url, website_url
from public.activities
where category = 'food'
order by name;
