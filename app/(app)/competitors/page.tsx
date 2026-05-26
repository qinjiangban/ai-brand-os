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
        eyebrow="Competitors"
        title="竞品洞察"
        description="管理竞品条目并进行平台、关键词、时间维度筛选。"
      />
      <PagePlaceholder
        title="竞品洞察"
        description="这里基于真实竞品数据统计展示当前组织的竞品观察覆盖情况。"
        stats={[
          { label: "竞品条目", value: String(summary.counts.competitorEntries), helper: "competitor_entries" },
          { label: "品牌数量", value: String(summary.counts.brands), helper: "brands" },
          { label: "关键词数", value: String(summary.counts.keywords), helper: "keywords" },
        ]}
        records={[
          { title: "当前建议", meta: summary.counts.competitorEntries ? "继续补齐平台、时间和指标字段。" : "请先录入或导入竞品条目。" },
        ]}
      />
    </div>
  );
}
