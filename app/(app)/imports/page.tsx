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
        eyebrow="Imports"
        title="数据导入中心"
        description="模板下载、批次管理、失败行下载与覆盖策略会在这里汇总。"
      />
      <PagePlaceholder
        title="数据导入中心"
        description="当前展示真实导入结果关联的数据体量，帮助你判断后续要补哪类数据源。"
        stats={[
          { label: "品牌提及", value: String(summary.counts.mentions), helper: "已入库 mentions" },
          { label: "指标事件", value: String(summary.counts.metricEvents), helper: "可参与分析的数据记录" },
          { label: "竞品条目", value: String(summary.counts.competitorEntries), helper: "已导入 competitor_entries" },
        ]}
        records={[
          { title: "最近提及更新时间", meta: formatDateTime(summary.latestMentionAt) },
          { title: "发布回填条数", meta: `${summary.counts.publishBackfills} 条` },
          { title: "接下来建议", meta: "优先补齐 mentions、metric_events 与 publish_backfills 三类基础数据。" },
        ]}
        ctaHref="/settings/profile"
        ctaLabel="维护组织资料"
      />
    </div>
  );
}
