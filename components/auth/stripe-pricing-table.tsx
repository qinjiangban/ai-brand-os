"use client";

import { createElement } from "react";
import Script from "next/script";

const STRIPE_PRICING_TABLE_ID = "prctbl_1TbSbRECYi3HizFvFcSuNZnl";
const STRIPE_PUBLISHABLE_KEY = "pk_test_51QW7RTECYi3HizFvhaFMuLQnIUGrLtUdYOngXjEk7AMotGTVIZy0BReny4nVLgr5GM84oSGlxk9ka3GLl2gVRw2W00PgyCh2RU";

export function StripePricingTable() {
  return (
    <>
      <Script src="https://js.stripe.com/v3/pricing-table.js" strategy="afterInteractive" />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-2">
        {createElement("stripe-pricing-table", {
          "pricing-table-id": STRIPE_PRICING_TABLE_ID,
          "publishable-key": STRIPE_PUBLISHABLE_KEY,
        })}
      </div>
    </>
  );
}
