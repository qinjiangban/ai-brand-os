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
        eyebrow="AI Platforms"
        title="AI 平台管理"
        description="后续会接入 Key 加密存储、模型可用性和模块默认模型。"
      />
      <PagePlaceholder
        title="AI 平台管理"
        description="这里展示当前组织真实的 AI Key、默认模型和调用情况。"
        stats={[
          { label: "AI Key", value: String(summary.counts.aiProviderKeys), helper: "ai_provider_keys" },
          { label: "默认模型", value: String(summary.counts.moduleModelDefaults), helper: "module_model_defaults" },
          { label: "AI 调用", value: String(summary.counts.aiRuns), helper: "ai_runs" },
        ]}
        records={[
          { title: "配置建议", meta: summary.counts.aiProviderKeys ? "已具备接通真实生成任务的基础配置。" : "请先录入真实 AI 平台 Key。" },
        ]}
      />
    </div>
  );
}
