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
        eyebrow="Review"
        title="内容审核"
        description="敏感词命中、AI 改写建议与确认采纳流程统一处理。"
      />
      <PagePlaceholder
        title="内容审核"
        description="当前根据真实审核项与敏感词库状态展示审核工作量。"
        stats={[
          { label: "审核项", value: String(summary.counts.reviewItems), helper: "review_items" },
          { label: "待确认", value: String(summary.counts.pendingReviewItems), helper: "confirmed_at is null" },
          { label: "敏感词数", value: String(summary.counts.sensitiveTerms), helper: "sensitive_terms" },
        ]}
        records={[
          {
            title: "审核建议",
            meta: summary.counts.pendingReviewItems
              ? `当前还有 ${summary.counts.pendingReviewItems} 个待确认审核项。`
              : "当前没有待确认审核项。",
          },
        ]}
      />
    </div>
  );
}
