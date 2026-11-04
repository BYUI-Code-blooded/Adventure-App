-- Only @byui.edu emails (plus a short exception list) can create an account.
-- Run once in the Supabase SQL Editor. Keep the exception list in sync with
-- EXTRA_ALLOWED_EMAILS in lib/validation.ts. Existing accounts are not affected.

create or replace function public.enforce_byui_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_anonymous then
    raise exception 'Anonymous sign-ins are not allowed';
  end if;
  if lower(coalesce(new.email, '')) !~ '^[^@[:space:]]+@byui\.edu$'
     and lower(coalesce(new.email, '')) not in ('myemail.kristi@gmail.com') then
    raise exception 'Only @byui.edu email addresses can sign up';
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_byui_email() from public, anon, authenticated;

drop trigger if exists enforce_byui_email_before_insert on auth.users;
create trigger enforce_byui_email_before_insert
  before insert on auth.users
  for each row execute function public.enforce_byui_email();
