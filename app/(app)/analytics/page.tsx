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
        eyebrow="Analytics"
        title="效果分析"
        description="聚合曝光、收录、互动、线索、ROI 与 Token 成本。"
      />
      <PagePlaceholder
        title="效果分析"
        description="当前展示真实指标事件、提及记录和 AI 调用规模，后续可继续扩展 ROI 图表。"
        stats={[
          { label: "指标事件", value: String(summary.counts.metricEvents), helper: "metric_events" },
          { label: "品牌提及", value: String(summary.counts.mentions), helper: "mentions" },
          { label: "AI 调用", value: String(summary.counts.aiRuns), helper: "ai_runs" },
        ]}
        records={[
          { title: "分析准备度", meta: summary.counts.metricEvents ? "已有真实指标事件，可继续扩展图表与筛选器。" : "请先补齐 metric_events 或回填数据。" },
        ]}
      />
    </div>
  );
}
