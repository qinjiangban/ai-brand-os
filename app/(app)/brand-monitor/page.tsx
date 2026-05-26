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
        eyebrow="Brand Monitor"
        title="品牌监测"
        description="基于手工导入的 mentions 数据，查看趋势、来源和异常峰值。"
      />
      <PagePlaceholder
        title="品牌监测"
        description="当前基于真实 mentions 数据展示品牌监测基础盘点，没有数据时也会明确告诉用户缺什么。"
        stats={[
          { label: "品牌数量", value: String(summary.counts.brands), helper: "brands" },
          { label: "提及记录", value: String(summary.counts.mentions), helper: "mentions" },
          { label: "关键词数", value: String(summary.counts.keywords), helper: "keywords" },
        ]}
        records={[
          { title: "最近提及时间", meta: formatDateTime(summary.latestMentionAt) },
          { title: "监测覆盖建议", meta: summary.counts.mentions ? "继续补齐关键词维度，提升品牌监测覆盖率。" : "请先导入品牌提及数据。" },
        ]}
      />
    </div>
  );
}
