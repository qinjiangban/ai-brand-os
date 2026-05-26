"use client";

import { createElement } from "react";
import Script from "next/script";

import { Button } from "@/components/ui/button";
import { env, hasStripePricingTableEnv } from "@/lib/env";

export function StripePricingTable() {
  if (!hasStripePricingTableEnv()) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <Button className="h-11 w-full rounded-lg" disabled>
          订阅暂不可用
        </Button>
      </div>
    );
  }

  return (
    <>
      <Script src="https://js.stripe.com/v3/pricing-table.js" strategy="afterInteractive" />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-2">
        {createElement("stripe-pricing-table", {
          "pricing-table-id": env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID,
          "publishable-key": env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        })}
      </div>
    </>
  );
}
