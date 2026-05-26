import { NextResponse } from "next/server";
import Stripe from "stripe";

import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const stripe = getStripeClient();
  const admin = createSupabaseAdminClient();

  if (!signature || !stripe || !admin || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook 配置缺失" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook 签名校验失败" },
      { status: 400 },
    );
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

    const { data: organization } = await admin
      .from("organizations")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (organization) {
      const primaryItem = subscription.items.data[0];
      const interval = primaryItem?.price?.recurring?.interval;
      const plan = interval === "year" ? "year" : "month";

      const upsertResult = await admin.from("subscriptions").upsert(
        {
          organization_id: organization.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          plan,
          current_period_start: primaryItem ? new Date(primaryItem.current_period_start * 1000).toISOString() : null,
          current_period_end: primaryItem ? new Date(primaryItem.current_period_end * 1000).toISOString() : null,
        },
        { onConflict: "organization_id" },
      );

      if (upsertResult.error) {
        return NextResponse.json({ error: upsertResult.error.message }, { status: 500 });
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

    const { data: organization } = await admin
      .from("organizations")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (organization) {
      const updateResult = await admin
        .from("subscriptions")
        .update({ status: subscription.status })
        .eq("organization_id", organization.id);

      if (updateResult.error) {
        return NextResponse.json({ error: updateResult.error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
