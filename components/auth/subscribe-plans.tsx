import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    plan: "month",
    title: "月付套餐",
    price: "$10",
    features: ["适合试跑 MVP", "开通全部核心功能", "支持组织级 Token 成本统计"],
  },
  {
    plan: "year",
    title: "年付套餐",
    price: "$99",
    features: ["适合稳定团队协作", "优先推荐方案", "保留完整分析与报表闭环"],
  },
];

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
    <div className="grid gap-5 lg:grid-cols-2">
      {plans.map((item) => (
        <Card key={item.plan} className="border-white/10 bg-white/[0.02] shadow-none">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300">
              <Sparkles className="size-3.5" />
              推荐方案
            </div>
            <CardTitle className="mt-4 text-white">
              {item.title} <span className="ml-2 text-3xl font-semibold">{item.price}</span>
            </CardTitle>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              {trialEligible
                ? `首次开通可免费试用 ${trialDays} 天，但仍需先添加支付卡，试用结束后按所选套餐自动扣费。`
                : "需要先添加支付卡后才能访问仪表板，开通后按所选套餐正常扣费。"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {item.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-zinc-200">
                  <span className="flex size-7 items-center justify-center rounded-full bg-white/[0.04] text-zinc-100">
                    <Check className="size-4" />
                  </span>
                  {feature}
                </div>
              ))}
            </div>
            {demo ? (
              <Button className="h-11 w-full rounded-lg" disabled>
                待配置 Stripe 后启用
              </Button>
            ) : (
              <form action="/api/billing/checkout" method="POST">
                <input type="hidden" name="plan" value={item.plan} />
                <Button className="h-11 w-full rounded-lg" type="submit">
                  {trialEligible ? "添加支付卡并开通试用" : "添加支付卡并开通"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
