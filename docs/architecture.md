# Architecture

## 1. Overview
The browser loads static pages (Next.js static export) and a client-side map. The browser talks directly to Supabase for data. There is no custom backend.

## 2. Diagram
```
                 +-----------------------------+
                 |   Vercel (static files)     |
            +--->|   HTML / JS / CSS / JSON    |
            |    +-----------------------------+
            |
+-----------+      +-----------------------------+
|  Browser  |----->|  Supabase                   |
|  (Next.js |      |  Auth (anonymous) +         |
|  + Leaflet)|     |  Postgres with RLS          |
+-----------+      +-----------------------------+
            |
            |    +-----------------------------+
            +--->|  OpenStreetMap tiles        |
                 +-----------------------------+
```

## 3. Static content
Pages read JSON from `content/*.json` at build time (for example `content/outdoor.json`).

## 4. App page flow
1. Load events (public read).
2. Click the map to create an event (lazy anonymous sign-in on the first write).
3. Join an event (insert into `event_attendees`).
4. Attendee count = number of rows in `event_attendees` for that event.
5. Filter events by day.

## 5. Data model (summary)
The source of truth is `supabase/schema.sql`.
- `profiles`: one private row per auth user (`name`, `phone`, `role`: `user`, `developer` or `admin`). The email lives in `auth.users`. Other users only see `id` and `name` through the `public_profiles` view.
- `activities`: places or things to do (`name`, `description`, `address`, `lat`, `lng`, `photo_url`, `category`, `is_featured`, `created_by`). Only staff (admin or developer) can set `is_featured`.
- `events`: an activity scheduled at a time (`activity_id`, `creator_id`, `start_time`, `end_time`, `max_participants`).
- `event_attendees`: who joined which event (composite primary key `event_id` + `user_id`). The count is the number of rows; joins are rejected once the event is full.

Use `start_time timestamptz`; group by day in `America/Denver`.

## 6. Security model
- The publishable key is public by design; security comes from RLS.
- One policy per operation, using `(select auth.uid())`.
- Select policy is `to anon, authenticated`.
- Column-level grants stop users from changing roles, ownership and ids.
- Check constraints on text lengths.
- The secret/service_role key is never used.

## 7. Sprint 0 validation (walking skeleton)
All of these must pass before building features:
- a. Static export builds and deploys on Vercel.
- b. The map renders on the deployed site (not only locally).
- c. Default marker icons show correctly.
- d. Create an event from the browser and see it persist in Supabase.
- e. Join an event and the count updates.
- f. A commit from a different teammate deploys on Vercel.

Security tests:
1. A user cannot edit or delete another user's event.
2. A user cannot join the same event twice.
3. Unauthenticated users can read but not write.
4. Over-long text is rejected by the check constraints.

## 8. Deferred
`docs/data-model.md`, skills, subagents and hooks. Not needed yet.
