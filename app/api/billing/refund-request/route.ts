import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json({ error: "Supabase 配置缺失" }, { status: 503 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: authError?.message ?? "未登录" }, { status: 401 });
  }

  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return NextResponse.json({ error: membershipError?.message ?? "未找到成员信息" }, { status: 404 });
  }

  if (membership.role !== "admin") {
    return NextResponse.json({ error: "仅管理员可提交退款申请" }, { status: 403 });
  }

  const { data: subscription, error: subscriptionError } = await admin
    .from("subscriptions")
    .select("status, plan, stripe_customer_id, stripe_subscription_id")
    .eq("organization_id", membership.organization_id)
    .maybeSingle();

  if (subscriptionError || !subscription) {
    return NextResponse.json({ error: subscriptionError?.message ?? "当前组织暂无可申请退款的订阅" }, { status: 404 });
  }

  const insertResult = await admin.from("audit_logs").insert({
    organization_id: membership.organization_id,
    user_id: user.id,
    action: "billing.refund_requested",
    meta_json: {
      email: user.email ?? null,
      requested_at: new Date().toISOString(),
      subscription_status: subscription.status,
      plan: subscription.plan,
      stripe_customer_id: subscription.stripe_customer_id,
      stripe_subscription_id: subscription.stripe_subscription_id,
    },
  });

  if (insertResult.error) {
    return NextResponse.json({ error: insertResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "退款申请已提交，后续可在后台审核或人工处理。",
  });
}
