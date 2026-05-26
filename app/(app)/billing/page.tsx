import { CreditCard, ShieldCheck } from "lucide-react";

import { FIRST_TRIAL_DAYS } from "@/lib/billing";
import { BillingActions } from "@/components/billing-actions";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth/guards";
import { formatDateTime } from "@/lib/app/organization-data";

export default async function BillingPage() {
  const context = await requireAppContext();
  const canManageBilling = context.membership.role === "admin";
  const canCancel = Boolean(context.subscription.stripeCustomerId && ["active", "trialing"].includes(context.subscription.status));
  const canRefund = Boolean(context.subscription.stripeSubscriptionId && ["active", "trialing"].includes(context.subscription.status));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="订阅与账单"
        description={`新组织首次开通可免费试用 ${FIRST_TRIAL_DAYS} 天，但必须先添加支付卡；试用结束后按所选套餐自动扣费。`}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/8 bg-card/70 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <CreditCard className="size-4 text-primary" />
              当前订阅状态
            </CardTitle>
            <CardDescription>
              {canManageBilling ? "管理员可在这里发起退订或提交退款申请。" : "仅组织管理员可管理退订和退款申请。"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-200">
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
              <span>订阅状态</span>
              <Badge variant="secondary">{context.subscription.status}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
              <span>当前套餐</span>
              <span>
                {context.subscription.plan === "year" ? "年付 $99" : "月付 $10"}
                {context.subscription.status === "trialing" ? " · 试用中" : ""}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
              <span>当前组织</span>
              <span>{context.organization.name}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
              <span>账单周期结束</span>
              <span>{formatDateTime(context.subscription.currentPeriodEnd ?? null)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
              <span>Stripe Customer</span>
              <span className="truncate pl-4 text-right">{context.subscription.stripeCustomerId ?? "未生成"}</span>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-white">订阅操作</div>
                  <div className="text-xs text-muted-foreground">
                    退订会跳转到 Stripe 订阅管理页，退款申请会记录到系统后台等待处理。
                  </div>
                </div>
                <BillingActions canCancel={canCancel} canManage={canManageBilling} canRefund={canRefund} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-card/70 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <ShieldCheck className="size-4 text-primary" />
              核心功能门槛
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-200">
            <p>当前页面展示的是组织 {context.organization.id.slice(0, 8)} 的真实订阅状态，功能页访问由服务端 guard 实时校验。</p>
            <p>首次开通会在 Stripe Checkout 中先保存支付卡，再创建首月免费试用订阅；试用期状态会显示为 `trialing`。</p>
            <p>Stripe Webhook 写入 `subscriptions` 后，这里的状态、套餐和账期会同步更新；只有 `active` 或 `trialing` 才能访问仪表板。</p>
            <p>当前年费文案已按 $99 展示，实际扣费金额以 Stripe Dashboard 中绑定到 `STRIPE_PRICE_ID_YEAR` 的 Price 为准。</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
