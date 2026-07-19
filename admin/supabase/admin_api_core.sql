-- Admin API backend contract: subscriptions, reports, audit log, and indexed filters.

create table if not exists public.subscriptions (
  id bigserial primary key,
  user_id bigint not null references public.users(id),
  plan_id text not null,
  provider text not null default 'manual',
  provider_subscription_id text unique,
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired', 'refunded')),
  amount numeric(12, 2) not null default 0,
  currency text not null default 'INR',
  current_period_start timestamptz,
  current_period_end timestamptz not null,
  trial_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.reports (
  id bigserial primary key,
  reporter_user_id bigint references public.users(id),
  reported_user_id bigint references public.users(id),
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  resolution_note text,
  resolved_by_admin_id bigint references public.admins(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_log (
  id bigserial primary key,
  admin_id bigint references public.admins(id),
  action text not null,
  resource text not null,
  resource_id text,
  before_value jsonb,
  after_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_status_created on public.subscriptions (status, created_at desc);
create index if not exists idx_subscriptions_plan_created on public.subscriptions (plan_id, created_at desc);
create index if not exists idx_subscriptions_user_active on public.subscriptions (user_id, current_period_end) where status in ('trialing', 'active');
create index if not exists idx_reports_status_created on public.reports (status, created_at desc);
create index if not exists idx_reports_reported_user on public.reports (reported_user_id);
create index if not exists idx_admin_audit_log_admin_created on public.admin_audit_log (admin_id, created_at desc);
create index if not exists idx_users_active_created on public.users (is_active, created_at desc);
create index if not exists idx_wallet_transactions_status_created on public.wallet_transactions (verification_status, created_at desc);

create materialized view if not exists public.admin_subscription_stats as
select
  current_date as snapshot_date,
  count(*) filter (where status = 'active' and current_period_end > now()) as active_count,
  count(*) filter (where status = 'trialing' and coalesce(trial_ends_at, current_period_end) > now()) as trial_count,
  count(*) filter (where status in ('canceled', 'expired')) as churned_count,
  coalesce(sum(amount) filter (where status in ('active', 'trialing', 'refunded') and created_at >= date_trunc('month', now())), 0) as revenue
from public.subscriptions
where deleted_at is null;

create unique index if not exists admin_subscription_stats_snapshot_date_unique
  on public.admin_subscription_stats (snapshot_date);

-- Refresh from cron/pg_cron or your scheduler after subscription webhooks settle:
-- refresh materialized view concurrently public.admin_subscription_stats;
