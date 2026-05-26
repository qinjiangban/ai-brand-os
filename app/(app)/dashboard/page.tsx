import Link from "next/link";
import { ArrowUpRight, LoaderCircle } from "lucide-react";

import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { StepFlowBoard } from "@/components/step-flow-board";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceSummary, formatDateTime } from "@/lib/app/organization-data";
import { requireAppContext } from "@/lib/auth/guards";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const context = await requireAppContext();
  const summary = await getWorkspaceSummary(context.membership.organization_id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="GEO 全流程工作台"
        description={`当前组织 ${context.organization.name} 已接入真实账号信息与订阅状态，下面展示的是你的实时业务数据概览。`}
        actions={
          <Link className={cn(buttonVariants({ className: "rounded-lg" }))} href="/content-engine">
            新建内容任务
            <ArrowUpRight className="size-4" />
          </Link>
        }
      />

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="text-sm font-medium text-white">Overview</div>
          <div className="h-4 w-px bg-white/10" />
          <div className="text-sm text-muted-foreground">组织 ID：{context.organization.id.slice(0, 8)}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="border border-white/10 bg-white/[0.03] text-zinc-200">
            {context.membership.role === "admin" ? "管理员" : context.membership.role === "analyst" ? "分析员" : "成员"}
          </Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="品牌与关键词" value={`${summary.counts.brands} / ${summary.counts.keywords}`} delta="品牌 / 关键词" />
        <KpiCard label="提及与指标事件" value={`${summary.counts.mentions} / ${summary.counts.metricEvents}`} delta="提及 / 指标事件" tone="success" />
        <KpiCard label="内容与审核" value={`${summary.counts.contentAssets} / ${summary.counts.pendingReviewItems}`} delta="资产 / 待审核" tone="success" />
        <KpiCard label="发布与回填" value={`${summary.counts.publishJobs} / ${summary.counts.publishBackfills}`} delta="任务 / 回填" tone="warning" />
      </section>

      <StepFlowBoard
        counts={{
          mentions: summary.counts.mentions,
          metricEvents: summary.counts.metricEvents,
          contentAssets: summary.counts.contentAssets,
          pendingReviewItems: summary.counts.pendingReviewItems,
          publishJobs: summary.counts.publishJobs,
        }}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/10 bg-white/[0.02] shadow-none">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-base text-white">最近活动</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recentActivities.length ? (
              summary.recentActivities.map((item) => (
                <div key={`${item.title}-${item.createdAt}`} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.015] p-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">{item.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.meta}</div>
                  </div>
                  <Badge variant="secondary" className="border border-white/10 bg-white/[0.03] text-zinc-200">
                    {formatDateTime(item.createdAt)}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
                当前还没有业务活动记录，先去导入真实数据或创建内容任务。
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.02] shadow-none">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-base text-white">系统提醒</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              `最近一次提及更新：${formatDateTime(summary.latestMentionAt)}`,
              `最近一次 AI 调用：${formatDateTime(summary.latestAiRunAt)}`,
              `最近一次发布任务变更：${formatDateTime(summary.latestPublishJobAt)}`,
            ].map((item, index) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/[0.015] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 items-center justify-center rounded-full bg-white/[0.04] text-xs font-semibold text-zinc-100">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-zinc-200">{item}</p>
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 text-white">
                <LoaderCircle className="size-4 text-zinc-100" />
                当前真实数据摘要
              </div>
              <ul className="mt-3 space-y-2">
                <li>成员数量：{summary.counts.members}</li>
                <li>AI 平台配置：{summary.counts.aiProviderKeys} 个 Key，{summary.counts.moduleModelDefaults} 个默认模型</li>
                <li>敏感词库：{summary.counts.sensitiveTerms} 条</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
