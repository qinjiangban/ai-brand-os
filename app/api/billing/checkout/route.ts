import { NextResponse } from "next/server";

import { FIRST_TRIAL_DAYS } from "@/lib/billing";
import { env, hasStripeEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasStripeEnv()) {
    return NextResponse.redirect(new URL("/billing?mode=demo", request.url), 303);
  }

  const stripe = getStripeClient();
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  if (!stripe || !supabase || !admin) {
    return NextResponse.json({ error: "Stripe 或 Supabase 配置缺失" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const formData = await request.formData();
  const plan = formData.get("plan") === "year" ? "year" : "month";
  const priceId = plan === "year" ? env.STRIPE_PRICE_ID_YEAR : env.STRIPE_PRICE_ID_MONTH;

  if (!priceId) {
    return NextResponse.json({ error: "Stripe Price ID 未配置" }, { status: 503 });
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || membership.role !== "admin") {
    return NextResponse.json({ error: "仅管理员可开通订阅" }, { status: 403 });
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name, stripe_customer_id")
    .eq("id", membership.organization_id)
    .maybeSingle();

  if (!organization) {
    return NextResponse.json({ error: "未找到组织" }, { status: 404 });
  }

  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("organization_id", organization.id)
    .maybeSingle();

  const isFirstSubscription = !existingSubscription;

  let customerId = organization.stripe_customer_id as string | null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: organization.name,
      metadata: {
        organization_id: organization.id,
      },
    });

    customerId = customer.id;

    const updateResult = await admin
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", organization.id);

    if (updateResult.error) {
      return NextResponse.json({ error: updateResult.error.message }, { status: 500 });
    }
  }

  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    payment_method_collection: "always",
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/billing/subscribe`,
    metadata: {
      organization_id: organization.id,
      plan,
    },
    ...(isFirstSubscription
      ? {
          subscription_data: {
            trial_period_days: FIRST_TRIAL_DAYS,
          },
        }
      : {}),
  });

  if (!session.url) {
    return NextResponse.json({ error: "未生成结账链接" }, { status: 500 });
  }

  return NextResponse.redirect(session.url, 303);
}
