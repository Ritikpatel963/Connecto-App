-- Run this file once in the Supabase SQL Editor after adding auth_user_id to admins.

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where auth_user_id = auth.uid()
      and is_active = true
  );
$$;

revoke all on function public.is_active_admin() from public;
grant execute on function public.is_active_admin() to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'admins', 'roles', 'permissions', 'role_permissions',
    'users', 'user_languages', 'user_interests', 'favourites', 'ratings',
    'id_verifications', 'voice_verifications', 'calls', 'conversations', 'messages',
    'wallets', 'wallet_transactions', 'referrals', 'referral_tiers', 'referral_redemptions'
  ]
  loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('drop policy if exists "Active admins can manage data" on public.%I', table_name);
      execute format(
        'create policy "Active admins can manage data" on public.%I for all to authenticated using ((select public.is_active_admin())) with check ((select public.is_active_admin()))',
        table_name
      );
      execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    end if;
  end loop;
end
$$;

grant usage, select on all sequences in schema public to authenticated;
