import { PageHeader } from "@/components/page-header";
import { PagePlaceholder } from "@/components/page-placeholder";
import { formatDateTime, getWorkspaceSummary } from "@/lib/app/organization-data";
import { requireAppContext } from "@/lib/auth/guards";

export default async function Page() {
  const context = await requireAppContext();
  const summary = await getWorkspaceSummary(context.membership.organization_id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Publish"
        title="发布任务"
        description="创建发布任务、管理状态并完成回填闭环。"
      />
      <PagePlaceholder
        title="发布任务"
        description="这里展示当前组织真实的发布任务与回填数据状态。"
        stats={[
          { label: "发布任务", value: String(summary.counts.publishJobs), helper: "publish_jobs" },
          { label: "已回填", value: String(summary.counts.publishBackfills), helper: "publish_backfills" },
          { label: "内容资产", value: String(summary.counts.contentAssets), helper: "可用于创建发布任务" },
        ]}
        records={[
          { title: "最近发布任务变更", meta: formatDateTime(summary.latestPublishJobAt) },
          { title: "回填建议", meta: summary.counts.publishJobs ? "优先补齐 URL、曝光和 ROI。" : "请先创建内容资产和发布任务。" },
        ]}
      />
    </div>
  );
}
