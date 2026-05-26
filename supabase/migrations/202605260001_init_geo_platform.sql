create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null unique,
  stripe_customer_id text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  user_id uuid not null unique,
  role text not null check (role in ('admin', 'member', 'analyst')),
  status text not null check (status in ('active', 'disabled', 'pending_password')),
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null,
  plan text not null check (plan in ('month', 'year')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  user_id uuid not null,
  action text not null,
  meta_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_provider_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  provider text not null,
  key_ciphertext text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.module_model_defaults (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  module text not null,
  default_model text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, module)
);

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  user_id uuid not null,
  module text not null,
  task_id uuid,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer not null default 0,
  cost numeric(12, 6) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  name text not null,
  industry text,
  created_at timestamptz not null default now()
);

create table if not exists public.keywords (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  brand_id uuid not null,
  keyword text not null,
  intent text,
  priority integer default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  brand_id uuid not null,
  type text not null check (type in ('article', 'script')),
  title text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  asset_id uuid not null,
  version integer not null,
  content_json jsonb,
  content_text text,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sensitive_terms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  term text not null,
  level text not null default 'medium',
  enabled boolean not null default true
);

create table if not exists public.review_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  asset_id uuid not null,
  revision_id uuid not null,
  hits_json jsonb not null default '[]'::jsonb,
  ai_suggestion_json jsonb,
  confirmed_by uuid,
  confirmed_at timestamptz
);

create table if not exists public.publish_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  brand_id uuid not null,
  asset_id uuid not null,
  channel_type text not null,
  owner_user_id uuid not null,
  scheduled_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.publish_backfills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  publish_job_id uuid not null,
  url text,
  published_at timestamptz,
  metrics_json jsonb not null default '{}'::jsonb,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.metric_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  brand_id uuid not null,
  source text not null,
  metric_type text not null,
  metric_value numeric not null default 0,
  platform text,
  occurred_at timestamptz not null,
  meta_json jsonb not null default '{}'::jsonb
);

create table if not exists public.mentions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  brand_id uuid not null,
  platform text not null,
  keyword text,
  content text,
  url text,
  occurred_at timestamptz not null,
  meta_json jsonb not null default '{}'::jsonb
);

create table if not exists public.competitor_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  brand_id uuid not null,
  competitor_name text not null,
  platform text,
  keyword text,
  notes text,
  metrics_json jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null
);

create table if not exists public.member_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  email text not null,
  role text not null check (role in ('admin', 'member', 'analyst')),
  token_hash text,
  expires_at timestamptz,
  used_at timestamptz,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

create index if not exists idx_memberships_user_id on public.memberships(user_id);
create index if not exists idx_memberships_org_id on public.memberships(organization_id);
create index if not exists idx_subscriptions_org_id on public.subscriptions(organization_id);
create index if not exists idx_ai_runs_org_created_at on public.ai_runs(organization_id, created_at desc);
create index if not exists idx_metric_events_org_occurred_at on public.metric_events(organization_id, occurred_at desc);
create index if not exists idx_mentions_org_occurred_at on public.mentions(organization_id, occurred_at desc);
create index if not exists idx_publish_jobs_org_status on public.publish_jobs(organization_id, status);

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;
grant usage on schema private to authenticated;

create or replace function private.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public, private
as $$
  select m.organization_id
  from public.memberships as m
  where m.user_id = auth.uid()
  limit 1;
$$;

create or replace function private.is_org_admin()
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.memberships as m
    where m.user_id = auth.uid()
      and m.role = 'admin'
      and m.status = 'active'
  );
$$;

revoke all on function private.current_org_id() from public;
revoke all on function private.is_org_admin() from public;
grant execute on function private.current_org_id() to authenticated;
grant execute on function private.is_org_admin() to authenticated;

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.ai_provider_keys enable row level security;
alter table public.module_model_defaults enable row level security;
alter table public.ai_runs enable row level security;
alter table public.brands enable row level security;
alter table public.keywords enable row level security;
alter table public.content_assets enable row level security;
alter table public.content_revisions enable row level security;
alter table public.sensitive_terms enable row level security;
alter table public.review_items enable row level security;
alter table public.publish_jobs enable row level security;
alter table public.publish_backfills enable row level security;
alter table public.metric_events enable row level security;
alter table public.mentions enable row level security;
alter table public.competitor_entries enable row level security;
alter table public.member_invites enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.organizations to authenticated;
grant select, insert, update on public.memberships to authenticated;
grant select on public.subscriptions to authenticated;
grant select, insert, update, delete on public.audit_logs to authenticated;
grant select, insert, update, delete on public.ai_provider_keys to authenticated;
grant select, insert, update, delete on public.module_model_defaults to authenticated;
grant select, insert, update, delete on public.ai_runs to authenticated;
grant select, insert, update, delete on public.brands to authenticated;
grant select, insert, update, delete on public.keywords to authenticated;
grant select, insert, update, delete on public.content_assets to authenticated;
grant select, insert, update, delete on public.content_revisions to authenticated;
grant select, insert, update, delete on public.sensitive_terms to authenticated;
grant select, insert, update, delete on public.review_items to authenticated;
grant select, insert, update, delete on public.publish_jobs to authenticated;
grant select, insert, update, delete on public.publish_backfills to authenticated;
grant select, insert, update, delete on public.metric_events to authenticated;
grant select, insert, update, delete on public.mentions to authenticated;
grant select, insert, update, delete on public.competitor_entries to authenticated;
grant select, insert, update, delete on public.member_invites to authenticated;

drop policy if exists organizations_select on public.organizations;
drop policy if exists organizations_insert on public.organizations;
drop policy if exists organizations_update on public.organizations;
drop policy if exists memberships_select on public.memberships;
drop policy if exists memberships_insert on public.memberships;
drop policy if exists memberships_update on public.memberships;
drop policy if exists subscriptions_select on public.subscriptions;
drop policy if exists subscriptions_modify on public.subscriptions;
drop policy if exists subscriptions_insert on public.subscriptions;
drop policy if exists subscriptions_update on public.subscriptions;
drop policy if exists org_scoped_all_audit_logs on public.audit_logs;
drop policy if exists org_scoped_all_ai_provider_keys on public.ai_provider_keys;
drop policy if exists org_scoped_all_module_model_defaults on public.module_model_defaults;
drop policy if exists org_scoped_all_ai_runs on public.ai_runs;
drop policy if exists org_scoped_all_brands on public.brands;
drop policy if exists org_scoped_all_keywords on public.keywords;
drop policy if exists org_scoped_all_content_assets on public.content_assets;
drop policy if exists org_scoped_all_content_revisions on public.content_revisions;
drop policy if exists org_scoped_all_sensitive_terms on public.sensitive_terms;
drop policy if exists org_scoped_all_review_items on public.review_items;
drop policy if exists org_scoped_all_publish_jobs on public.publish_jobs;
drop policy if exists org_scoped_all_publish_backfills on public.publish_backfills;
drop policy if exists org_scoped_all_metric_events on public.metric_events;
drop policy if exists org_scoped_all_mentions on public.mentions;
drop policy if exists org_scoped_all_competitor_entries on public.competitor_entries;
drop policy if exists org_scoped_all_member_invites on public.member_invites;

create policy organizations_select on public.organizations
  for select using (id = private.current_org_id() or owner_user_id = auth.uid());

create policy organizations_insert on public.organizations
  for insert with check (owner_user_id = auth.uid());

create policy organizations_update on public.organizations
  for update using (owner_user_id = auth.uid() or private.is_org_admin())
  with check (owner_user_id = auth.uid() or private.is_org_admin());

create policy memberships_select on public.memberships
  for select using (user_id = auth.uid() or organization_id = private.current_org_id());

create policy memberships_insert on public.memberships
  for insert with check (user_id = auth.uid() or private.is_org_admin());

create policy memberships_update on public.memberships
  for update using (private.is_org_admin()) with check (private.is_org_admin());

create policy subscriptions_select on public.subscriptions
  for select using (organization_id = private.current_org_id());

create policy subscriptions_insert on public.subscriptions
  for insert with check (private.is_org_admin());

create policy subscriptions_update on public.subscriptions
  for update using (private.is_org_admin()) with check (private.is_org_admin());

create policy org_scoped_all_audit_logs on public.audit_logs
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_ai_provider_keys on public.ai_provider_keys
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_module_model_defaults on public.module_model_defaults
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_ai_runs on public.ai_runs
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_brands on public.brands
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_keywords on public.keywords
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_content_assets on public.content_assets
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_content_revisions on public.content_revisions
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_sensitive_terms on public.sensitive_terms
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_review_items on public.review_items
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_publish_jobs on public.publish_jobs
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_publish_backfills on public.publish_backfills
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_metric_events on public.metric_events
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_mentions on public.mentions
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_competitor_entries on public.competitor_entries
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());

create policy org_scoped_all_member_invites on public.member_invites
  for all using (organization_id = private.current_org_id()) with check (organization_id = private.current_org_id());
