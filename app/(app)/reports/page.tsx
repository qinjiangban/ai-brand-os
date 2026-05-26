import { PageHeader } from "@/components/page-header";
import { PagePlaceholder } from "@/components/page-placeholder";
import { getWorkspaceSummary } from "@/lib/app/organization-data";
import { requireAppContext } from "@/lib/auth/guards";

export default async function Page() {
  const context = await requireAppContext();
  const summary = await getWorkspaceSummary(context.membership.organization_id);
  const reportableRows = summary.counts.metricEvents + summary.counts.mentions + summary.counts.publishBackfills;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="明细报表"
        description="按品牌、渠道、平台、负责人和时间多维导出数据。"
      />
      <PagePlaceholder
        title="明细报表"
        description="根据真实可导出数据量展示报表基础规模。"
        stats={[
          { label: "可导出总行数", value: String(reportableRows), helper: "提及 + 指标 + 回填" },
          { label: "指标事件", value: String(summary.counts.metricEvents), helper: "metric_events" },
          { label: "发布回填", value: String(summary.counts.publishBackfills), helper: "publish_backfills" },
        ]}
        records={[
          { title: "报表准备度", meta: reportableRows ? "当前已有真实数据可用于后续 CSV 导出。" : "请先导入或回填业务数据。" },
        ]}
      />
    </div>
  );
}
