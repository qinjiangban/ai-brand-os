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
        eyebrow="Settings"
        title="系统设置"
        description="组织信息、敏感词词库和系统参数会在此页统一管理。"
      />
      <PagePlaceholder
        title="系统设置"
        description="这里展示组织级真实配置概况，后续将继续扩展成完整的可编辑设置中心。"
        stats={[
          { label: "组织名称", value: context.organization.name, helper: `ID ${context.organization.id.slice(0, 8)}` },
          { label: "敏感词数", value: String(summary.counts.sensitiveTerms), helper: "sensitive_terms" },
          { label: "成员数量", value: String(summary.counts.members), helper: "memberships" },
        ]}
        records={[
          { title: "账号资料", meta: `${context.user.displayName} · ${context.user.email}` },
          { title: "维护入口", meta: "可从左上角“编辑资料”进入真实资料编辑页。" },
        ]}
        ctaHref="/settings/profile"
        ctaLabel="前往编辑资料"
      />
    </div>
  );
}
