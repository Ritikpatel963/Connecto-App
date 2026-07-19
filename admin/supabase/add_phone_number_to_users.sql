-- Run this migration before the updated demo-user seed.
-- Phone numbers use E.164 format so they match Supabase phone authentication.

alter table public.users
  add column if not exists phone_number text;

-- Backfill the six demo profiles if they already exist.
update public.users
set phone_number = case name
  when 'Aarav Sharma' then '+919100000001'
  when 'Kabir Mehta' then '+919100000002'
  when 'Arjun Verma' then '+919100000003'
  when 'Ananya Iyer' then '+919100000004'
  when 'Meera Kapoor' then '+919100000005'
  when 'Riya Patel' then '+919100000006'
end
where phone_number is null
  and name in (
    'Aarav Sharma',
    'Kabir Mehta',
    'Arjun Verma',
    'Ananya Iyer',
    'Meera Kapoor',
    'Riya Patel'
  );

-- Enforce phone numbers for all new and updated rows without breaking any
-- unrelated legacy rows that still need to be backfilled.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.users'::regclass
      and conname = 'users_phone_number_required'
  ) then
    alter table public.users
      add constraint users_phone_number_required
      check (phone_number is not null) not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.users'::regclass
      and conname = 'users_phone_number_e164_check'
  ) then
    alter table public.users
      add constraint users_phone_number_e164_check
      check (phone_number ~ '^\+[1-9][0-9]{7,14}$');
  end if;
end
$$;

create unique index if not exists users_phone_number_unique
  on public.users (phone_number);

-- Once every legacy row has a real phone number, these commands can make the
-- physical column NOT NULL as well:
-- alter table public.users validate constraint users_phone_number_required;
-- alter table public.users alter column phone_number set not null;
