-- Event moderation and repeating-event support.
-- Run after supabase/schema.sql in the Supabase SQL editor.

alter table public.events
  add column if not exists recurrence_rule text,
  add column if not exists recurrence_end_date date;

alter table public.events
  add constraint events_recurrence_rule_check
  check (recurrence_rule is null or recurrence_rule in ('FREQ=WEEKLY', 'FREQ=MONTHLY'));

alter table public.events
  add constraint events_recurrence_end_date_check
  check (recurrence_rule is null or recurrence_end_date is not null);

grant update (recurrence_rule, recurrence_end_date) on public.events to authenticated;

create table if not exists public.event_reports (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason text not null check (reason in ('inappropriate', 'spam', 'unsafe', 'other')),
  details text check (details is null or char_length(details) <= 500),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  unique (event_id, reporter_id)
);

create index if not exists event_reports_created_at_idx on public.event_reports (created_at desc);
alter table public.event_reports enable row level security;

create policy "event_reports_insert_own" on public.event_reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "event_reports_select_staff" on public.event_reports
  for select to authenticated using ((select public.is_staff()));
create policy "event_reports_update_staff" on public.event_reports
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

revoke update, delete on public.event_reports from anon, authenticated;
grant update (reviewed_at, reviewed_by) on public.event_reports to authenticated;
