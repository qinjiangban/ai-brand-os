import { Sparkles } from "lucide-react";

import { StripePricingTable } from "@/components/auth/stripe-pricing-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SubscribePlans({
  demo = false,
  trialDays = 30,
  trialEligible = false,
}: {
  demo?: boolean;
  trialDays?: number;
  trialEligible?: boolean;
}) {
  return (
    <div className="space-y-5">
      <Card className="border-white/10 bg-white/[0.02] shadow-none">
        <CardHeader>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300">
            <Sparkles className="size-3.5" />
            Stripe 订阅方案
          </div>
          <CardTitle className="mt-4 text-white">选择订阅方案</CardTitle>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {trialEligible
              ? `首次开通可免费试用 ${trialDays} 天，但仍需先添加支付卡；之后按 Stripe Pricing Table 中配置的价格自动扣费。`
              : "需要先添加支付卡后才能访问仪表板，开通后按 Stripe Pricing Table 中配置的价格正常扣费。"}
          </p>
        </CardHeader>
        <CardContent>
          {demo ? (
            <Button className="h-11 w-full rounded-lg" disabled>
              待配置 Stripe 后启用
            </Button>
          ) : (
            <StripePricingTable />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
