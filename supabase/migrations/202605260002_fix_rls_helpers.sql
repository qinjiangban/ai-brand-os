begin;

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
  for select to authenticated
  using (id = private.current_org_id() or owner_user_id = auth.uid());

create policy organizations_insert on public.organizations
  for insert to authenticated
  with check (owner_user_id = auth.uid());

create policy organizations_update on public.organizations
  for update to authenticated
  using (owner_user_id = auth.uid() or private.is_org_admin())
  with check (owner_user_id = auth.uid() or private.is_org_admin());

create policy memberships_select on public.memberships
  for select to authenticated
  using (user_id = auth.uid() or organization_id = private.current_org_id());

create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (user_id = auth.uid() or private.is_org_admin());

create policy memberships_update on public.memberships
  for update to authenticated
  using (private.is_org_admin())
  with check (private.is_org_admin());

create policy subscriptions_select on public.subscriptions
  for select to authenticated
  using (organization_id = private.current_org_id());

create policy subscriptions_insert on public.subscriptions
  for insert to authenticated
  with check (private.is_org_admin());

create policy subscriptions_update on public.subscriptions
  for update to authenticated
  using (private.is_org_admin())
  with check (private.is_org_admin());

create policy org_scoped_all_audit_logs on public.audit_logs
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_ai_provider_keys on public.ai_provider_keys
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_module_model_defaults on public.module_model_defaults
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_ai_runs on public.ai_runs
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_brands on public.brands
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_keywords on public.keywords
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_content_assets on public.content_assets
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_content_revisions on public.content_revisions
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_sensitive_terms on public.sensitive_terms
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_review_items on public.review_items
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_publish_jobs on public.publish_jobs
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_publish_backfills on public.publish_backfills
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_metric_events on public.metric_events
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_mentions on public.mentions
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_competitor_entries on public.competitor_entries
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

create policy org_scoped_all_member_invites on public.member_invites
  for all to authenticated
  using (organization_id = private.current_org_id())
  with check (organization_id = private.current_org_id());

drop function if exists public.current_org_id();
drop function if exists public.is_org_admin();

commit;
