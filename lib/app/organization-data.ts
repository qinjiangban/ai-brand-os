import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SummaryCounts = {
  brands: number;
  keywords: number;
  mentions: number;
  competitorEntries: number;
  contentAssets: number;
  contentRevisions: number;
  reviewItems: number;
  pendingReviewItems: number;
  publishJobs: number;
  publishBackfills: number;
  metricEvents: number;
  aiRuns: number;
  aiProviderKeys: number;
  moduleModelDefaults: number;
  sensitiveTerms: number;
  members: number;
};

type RecentItem = {
  title: string;
  meta: string;
  createdAt: string;
};

export type WorkspaceSummary = {
  counts: SummaryCounts;
  recentActivities: RecentItem[];
  latestMentionAt: string | null;
  latestAiRunAt: string | null;
  latestPublishJobAt: string | null;
};

const emptyCounts: SummaryCounts = {
  brands: 0,
  keywords: 0,
  mentions: 0,
  competitorEntries: 0,
  contentAssets: 0,
  contentRevisions: 0,
  reviewItems: 0,
  pendingReviewItems: 0,
  publishJobs: 0,
  publishBackfills: 0,
  metricEvents: 0,
  aiRuns: 0,
  aiProviderKeys: 0,
  moduleModelDefaults: 0,
  sensitiveTerms: 0,
  members: 0,
};

type Filter =
  | { type: "eq"; column: string; value: string }
  | { type: "is"; column: string; value: null };

async function countRows(
  table: string,
  organizationId: string,
  filters: Filter[] = [],
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return 0;

  let query = supabase.from(table).select("id", { count: "exact", head: true }).eq("organization_id", organizationId);
  for (const filter of filters) {
    if (filter.type === "eq") {
      query = query.eq(filter.column, filter.value);
    } else {
      query = query.is(filter.column, filter.value);
    }
  }

  const { count } = await query;
  return count ?? 0;
}

function formatDateTime(value: string | null) {
  if (!value) return "暂无记录";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export async function getWorkspaceSummary(organizationId: string): Promise<WorkspaceSummary> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      counts: emptyCounts,
      recentActivities: [],
      latestMentionAt: null,
      latestAiRunAt: null,
      latestPublishJobAt: null,
    };
  }

  const [
    brands,
    keywords,
    mentions,
    competitorEntries,
    contentAssets,
    contentRevisions,
    reviewItems,
    pendingReviewItems,
    publishJobs,
    publishBackfills,
    metricEvents,
    aiRuns,
    aiProviderKeys,
    moduleModelDefaults,
    sensitiveTerms,
    members,
    latestMentionsResult,
    latestAiRunsResult,
    latestPublishJobsResult,
    latestReviewItemsResult,
  ] = await Promise.all([
    countRows("brands", organizationId),
    countRows("keywords", organizationId),
    countRows("mentions", organizationId),
    countRows("competitor_entries", organizationId),
    countRows("content_assets", organizationId),
    countRows("content_revisions", organizationId),
    countRows("review_items", organizationId),
    countRows("review_items", organizationId, [{ type: "is", column: "confirmed_at", value: null }]),
    countRows("publish_jobs", organizationId),
    countRows("publish_backfills", organizationId),
    countRows("metric_events", organizationId),
    countRows("ai_runs", organizationId),
    countRows("ai_provider_keys", organizationId),
    countRows("module_model_defaults", organizationId),
    countRows("sensitive_terms", organizationId),
    countRows("memberships", organizationId),
    supabase
      .from("mentions")
      .select("platform, keyword, occurred_at")
      .eq("organization_id", organizationId)
      .order("occurred_at", { ascending: false })
      .limit(3),
    supabase
      .from("ai_runs")
      .select("module, model, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("publish_jobs")
      .select("channel_type, status, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("review_items")
      .select("confirmed_at, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const recentActivities: RecentItem[] = [
    ...(latestMentionsResult.data ?? []).map((item) => ({
      title: "品牌提及更新",
      meta: `${item.platform || "未知平台"} · ${item.keyword || "未标记关键词"}`,
      createdAt: item.occurred_at,
    })),
    ...(latestAiRunsResult.data ?? []).map((item) => ({
      title: "AI 调用完成",
      meta: `${item.module} · ${item.model}`,
      createdAt: item.created_at,
    })),
    ...(latestPublishJobsResult.data ?? []).map((item) => ({
      title: "发布任务更新",
      meta: `${item.channel_type} · ${item.status}`,
      createdAt: item.created_at,
    })),
    ...(latestReviewItemsResult.data ?? []).map((item) => ({
      title: item.confirmed_at ? "审核已确认" : "待审核内容",
      meta: item.confirmed_at ? "已生成确认版本" : "等待人工确认",
      createdAt: item.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return {
    counts: {
      brands,
      keywords,
      mentions,
      competitorEntries,
      contentAssets,
      contentRevisions,
      reviewItems,
      pendingReviewItems,
      publishJobs,
      publishBackfills,
      metricEvents,
      aiRuns,
      aiProviderKeys,
      moduleModelDefaults,
      sensitiveTerms,
      members,
    },
    recentActivities,
    latestMentionAt: latestMentionsResult.data?.[0]?.occurred_at ?? null,
    latestAiRunAt: latestAiRunsResult.data?.[0]?.created_at ?? null,
    latestPublishJobAt: latestPublishJobsResult.data?.[0]?.created_at ?? null,
  };
}

export async function getOrganizationMembers(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data: memberships } = await supabase
    .from("memberships")
    .select("user_id, role, status, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (!memberships?.length) {
    return [];
  }

  return Promise.all(
    memberships.map(async (membership) => {
      const userResult = admin ? await admin.auth.admin.getUserById(membership.user_id) : null;
      const user = userResult?.data?.user;
      const rawName = user?.user_metadata?.display_name ?? user?.user_metadata?.name;
      const displayName =
        typeof rawName === "string" && rawName.trim()
          ? rawName.trim()
          : (user?.email?.split("@")[0] ?? `用户 ${membership.user_id.slice(0, 8)}`);

      return {
        id: membership.user_id,
        name: displayName,
        email: user?.email ?? "未知邮箱",
        role: membership.role,
        status: membership.status,
        createdAt: membership.created_at,
      };
    }),
  );
}

export async function getJoinedOrganizations(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data: memberships } = await supabase
    .from("memberships")
    .select("organization_id, role, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!memberships?.length) {
    return [];
  }

  const organizationIds = memberships.map((membership) => membership.organization_id);
  const { data: organizations } = await supabase.from("organizations").select("id, name").in("id", organizationIds);
  const organizationMap = new Map((organizations ?? []).map((organization) => [organization.id, organization]));

  return memberships.map((membership) => ({
    id: membership.organization_id,
    name: organizationMap.get(membership.organization_id)?.name ?? "未命名组织",
    role: membership.role,
    status: membership.status,
    joinedAt: membership.created_at,
  }));
}

export async function getOrganizationProfile(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("organizations")
    .select("id, name, owner_user_id, stripe_customer_id, created_at")
    .eq("id", organizationId)
    .maybeSingle();

  return data;
}

export { formatDateTime };
