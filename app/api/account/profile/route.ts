import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const USER_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 配置缺失" }, { status: 503 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: authError?.message ?? "未登录" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        displayName?: string;
        userId?: string;
        organizationName?: string;
      }
    | null;

  const displayName = typeof payload?.displayName === "string" ? payload.displayName.trim() : "";
  const userId = typeof payload?.userId === "string" ? payload.userId.trim() : "";
  const organizationName = typeof payload?.organizationName === "string" ? payload.organizationName.trim() : "";

  if (!displayName) {
    return NextResponse.json({ error: "请输入用户名称" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "请输入用户 ID" }, { status: 400 });
  }

  if (!USER_ID_PATTERN.test(userId)) {
    return NextResponse.json({ error: "用户 ID 只能使用英文、数字、下划线或横杠" }, { status: 400 });
  }

  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return NextResponse.json({ error: membershipError?.message ?? "未找到成员信息" }, { status: 404 });
  }

  const updatedMetadata = {
    ...(user.user_metadata ?? {}),
    display_name: displayName,
    user_id: userId,
    ...(membership.role === "admin" && organizationName ? { organization_name: organizationName } : {}),
  };

  const { error: updateUserError } = await supabase.auth.updateUser({
    data: updatedMetadata,
  });

  if (updateUserError) {
    return NextResponse.json({ error: updateUserError.message }, { status: 500 });
  }

  if (membership.role === "admin" && organizationName) {
    const { error: organizationError } = await supabase
      .from("organizations")
      .update({ name: organizationName })
      .eq("id", membership.organization_id);

    if (organizationError) {
      return NextResponse.json({ error: organizationError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    user: {
      displayName,
      userId,
      organizationName: membership.role === "admin" && organizationName ? organizationName : null,
    },
  });
}
