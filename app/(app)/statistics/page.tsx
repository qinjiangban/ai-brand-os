import { PageHeader } from "@/components/page-header";
import { PagePlaceholder } from "@/components/page-placeholder";
import { getWorkspaceSummary } from "@/lib/app/organization-data";
import { requireAppContext } from "@/lib/auth/guards";

export default async function Page() {
  const context = await requireAppContext();
  const summary = await getWorkspaceSummary(context.membership.organization_id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Statistics"
        title="数据统计中心"
        description="聚合组织级导入、生成、审核、发布与 AI 成本表现。"
      />
      <PagePlaceholder
        title="数据统计中心"
        description="当前基于真实组织数据生成统计摘要，不再展示演示数字。"
        stats={[
          { label: "成员数量", value: String(summary.counts.members), helper: "memberships" },
          { label: "AI 调用数", value: String(summary.counts.aiRuns), helper: "ai_runs" },
          { label: "指标事件", value: String(summary.counts.metricEvents), helper: "metric_events" },
        ]}
        records={[
          { title: "内容资产", meta: `${summary.counts.contentAssets} 个` },
          { title: "发布任务", meta: `${summary.counts.publishJobs} 个` },
          { title: "审核项", meta: `${summary.counts.reviewItems} 个，其中待确认 ${summary.counts.pendingReviewItems} 个` },
        ]}
      />
    </div>
  );
}
