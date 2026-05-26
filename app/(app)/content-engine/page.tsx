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
        eyebrow="Content Engine"
        title="内容生成"
        description="任务级模型覆盖、内容资产沉淀和版本比较将在此处展开。"
      />
      <PagePlaceholder
        title="内容生成"
        description="这里显示真实内容资产、版本和 AI 调用情况，帮助你判断当前生成链路是否已跑通。"
        stats={[
          { label: "内容资产", value: String(summary.counts.contentAssets), helper: "content_assets" },
          { label: "内容版本", value: String(summary.counts.contentRevisions), helper: "content_revisions" },
          { label: "AI 调用", value: String(summary.counts.aiRuns), helper: "ai_runs" },
        ]}
        records={[
          { title: "最近 AI 运行时间", meta: formatDateTime(summary.latestAiRunAt) },
          { title: "配置建议", meta: summary.counts.aiProviderKeys ? `已配置 ${summary.counts.aiProviderKeys} 个 AI Key，可继续接通真实生成表单。` : "请先在 AI 平台页配置可用 Key。" },
        ]}
        ctaHref="/ai-platforms"
        ctaLabel="前往 AI 平台"
      />
    </div>
  );
}
