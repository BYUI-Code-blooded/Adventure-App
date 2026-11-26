-- Per-event comments.
-- Run after supabase/events-reports-recurrence-migration.sql in the Supabase SQL editor.
-- Needs public.events and public.is_staff() to exist already.

-- One row per comment. Comments are deleted along with their event. If an author deletes their
-- account, author_id becomes null and the comment stays (shown as "a former member"), the same
-- pattern as events.creator_id.
create table if not exists public.event_comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  -- Keep this limit in sync with COMMENT_MAX in lib/comments.ts.
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

-- Comments are always listed per event, oldest or newest first.
create index if not exists event_comments_event_id_created_at_idx
  on public.event_comments (event_id, created_at);

alter table public.event_comments enable row level security;

-- Anyone, signed in or not, can read comments.
create policy "event_comments_select_all" on public.event_comments
  for select to anon, authenticated using (true);

-- Only real (non-anonymous) accounts can comment, and only as themselves.
-- Anonymous Supabase users share the `authenticated` role, so `to authenticated` alone would let
-- them in. The `is_anonymous` claim in the JWT tells them apart. `is not true` also lets tokens
-- without the claim through, so only explicitly anonymous sessions are blocked.
create policy "event_comments_insert_own" on public.event_comments
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and ((select auth.jwt()) ->> 'is_anonymous')::boolean is not true
  );

-- You can delete your own comments. Staff (admin or developer) can delete any comment for moderation.
create policy "event_comments_delete_own_or_staff" on public.event_comments
  for delete to authenticated
  using (author_id = (select auth.uid()) or (select public.is_staff()));

-- There is deliberately no update policy: comments cannot be edited. Revoke the privilege as well,
-- so even a future policy mistake cannot allow edits.
revoke all on public.event_comments from anon, authenticated;
grant select on public.event_comments to anon;
grant select, insert, delete on public.event_comments to authenticated;
revoke update on public.event_comments from anon, authenticated;
