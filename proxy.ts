import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env, hasSupabaseEnv } from "@/lib/env";

const PUBLIC_PATHS = ["/login", "/register", "/set-password", "/billing/subscribe"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!hasSupabaseEnv()) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isPublicPath(pathname)) {
      return response;
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership && pathname !== "/register") {
    return NextResponse.redirect(new URL("/register", request.url));
  }

  if (membership?.status === "pending_password" && pathname !== "/set-password") {
    return NextResponse.redirect(new URL("/set-password", request.url));
  }

  if (membership?.status === "disabled") {
    return NextResponse.redirect(new URL("/login?reason=disabled", request.url));
  }

  if (!membership || pathname.startsWith("/billing")) {
    return response;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("organization_id", membership.organization_id)
    .maybeSingle();

  if (!subscription || !["active", "trialing"].includes(subscription.status)) {
    return NextResponse.redirect(new URL("/billing/subscribe", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
