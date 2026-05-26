import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  if (!stripe || !supabase || !admin) {
    return NextResponse.json({ error: "Stripe 或 Supabase 配置缺失" }, { status: 503 });
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
    return NextResponse.json({ error: "仅管理员可管理订阅" }, { status: 403 });
  }

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .select("stripe_customer_id")
    .eq("id", membership.organization_id)
    .maybeSingle();

  if (organizationError || !organization?.stripe_customer_id) {
    return NextResponse.json({ error: organizationError?.message ?? "当前组织尚未绑定 Stripe Customer" }, { status: 404 });
  }

  try {
    const origin = new URL(request.url).origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripe_customer_id,
      return_url: `${origin}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "暂时无法打开订阅管理入口" },
      { status: 500 },
    );
  }
}
