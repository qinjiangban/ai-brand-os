import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getOrganizationName(user: { user_metadata?: Record<string, unknown> }) {
  const value = user.user_metadata?.organization_name;
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
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

  const { data: membership, error: membershipError } = await admin
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  if (membership) {
    return NextResponse.json({ ok: true, bootstrapped: false });
  }

  let organizationId: string | null = null;
  let requestedOrganizationName = "";

  try {
    const payload = (await request.json()) as { organizationName?: string };
    requestedOrganizationName =
      typeof payload?.organizationName === "string" ? payload.organizationName.trim() : "";
  } catch {
    requestedOrganizationName = "";
  }

  const { data: existingOrganization, error: organizationLookupError } = await admin
    .from("organizations")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (organizationLookupError) {
    return NextResponse.json({ error: organizationLookupError.message }, { status: 500 });
  }

  if (existingOrganization) {
    organizationId = existingOrganization.id;
  } else {
    const organizationName = requestedOrganizationName || getOrganizationName(user);

    if (!organizationName) {
      return NextResponse.json(
        {
          error: "未找到组织名称，请补充组织名称后继续。",
          code: "organization_name_required",
        },
        { status: 409 },
      );
    }

    const { data: organization, error: organizationError } = await admin
      .from("organizations")
      .insert({
        name: organizationName,
        owner_user_id: user.id,
      })
      .select("id")
      .single();

    if (organizationError || !organization) {
      return NextResponse.json({ error: organizationError?.message ?? "创建组织失败" }, { status: 500 });
    }

    organizationId = organization.id;

    const updatedMetadata = {
      ...(user.user_metadata ?? {}),
      organization_name: organizationName,
    };

    const { error: updateUserError } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: updatedMetadata,
    });

    if (updateUserError) {
      return NextResponse.json({ error: updateUserError.message }, { status: 500 });
    }
  }

  const { error: upsertMembershipError } = await admin.from("memberships").upsert(
    {
      organization_id: organizationId,
      user_id: user.id,
      role: "admin",
      status: "active",
    },
    { onConflict: "user_id" },
  );

  if (upsertMembershipError) {
    return NextResponse.json({ error: upsertMembershipError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, bootstrapped: true });
}
