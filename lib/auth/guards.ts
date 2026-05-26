import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MembershipContext = {
  organization_id: string;
  role: "admin" | "member" | "analyst";
  status: "active" | "disabled" | "pending_password";
};

export type AppContext = {
  mode: "demo" | "live";
  user: {
    authId: string;
    id: string;
    email: string;
    displayName: string;
    initials: string;
    phone: string | null;
    createdAt: string;
  };
  organization: {
    id: string;
    name: string;
  };
  membership: MembershipContext;
  subscription: {
    status: string;
    plan: "month" | "year";
    currentPeriodEnd?: string | null;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
  };
};

function deriveDisplayName(email: string, metadata?: Record<string, unknown>) {
  const candidates = [metadata?.display_name, metadata?.name, metadata?.full_name];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const localPart = email.split("@")[0] ?? "用户";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sanitizeUserId(value: string) {
  const normalized = value.replace(/[^A-Za-z0-9_-]+/g, "-").replace(/-{2,}/g, "-").replace(/^[-_]+|[-_]+$/g, "");
  return normalized || "user";
}

function deriveUserId(email: string, metadata?: Record<string, unknown>) {
  const candidate = metadata?.user_id;
  if (typeof candidate === "string" && candidate.trim()) {
    return candidate.trim();
  }

  const localPart = email.split("@")[0] ?? "user";
  return sanitizeUserId(localPart);
}

function getInitials(displayName: string, email: string) {
  const source = displayName.trim() || email.split("@")[0] || "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

const demoContext: AppContext = {
  mode: "demo",
  user: {
    authId: "demo-auth-user",
    id: "demo_user",
    email: "demo@coolha.local",
    displayName: "Demo User",
    initials: "DU",
    phone: null,
    createdAt: new Date().toISOString(),
  },
  organization: {
    id: "demo-org",
    name: "Coolha Demo Org",
  },
  membership: {
    organization_id: "demo-org",
    role: "admin",
    status: "active",
  },
  subscription: {
    status: "active",
    plan: "year",
    currentPeriodEnd: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
  },
};

export async function requireAppContext() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoContext;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/login");
  }

  if (membership.status === "pending_password") {
    redirect("/set-password");
  }

  if (membership.status === "disabled") {
    redirect("/login?reason=disabled");
  }

  const displayName = deriveDisplayName(user.email ?? "", user.user_metadata);
  const userId = deriveUserId(user.email ?? "", user.user_metadata);
  const [organizationResult, subscriptionResult] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name")
      .eq("id", membership.organization_id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("status, plan, current_period_end, stripe_customer_id, stripe_subscription_id")
      .eq("organization_id", membership.organization_id)
      .maybeSingle(),
  ]);

  const organization = organizationResult.data;
  const subscription = subscriptionResult.data;

  if (!subscription || !["active", "trialing"].includes(subscription.status)) {
    redirect("/billing/subscribe");
  }

  return {
    mode: "live" as const,
    user: {
      authId: user.id,
      id: userId,
      email: user.email ?? "",
      displayName,
      initials: getInitials(displayName, user.email ?? ""),
      phone: user.phone ?? null,
      createdAt: user.created_at,
    },
    organization: {
      id: membership.organization_id,
      name: organization?.name ?? "未命名组织",
    },
    membership: {
      organization_id: membership.organization_id,
      role: membership.role,
      status: membership.status,
    },
    subscription: {
      status: subscription.status,
      plan: subscription.plan,
      currentPeriodEnd: subscription.current_period_end,
      stripeCustomerId: subscription.stripe_customer_id,
      stripeSubscriptionId: subscription.stripe_subscription_id,
    },
  };
}

export async function requireAdminContext() {
  const context = await requireAppContext();

  if (context.membership.role !== "admin") {
    redirect("/dashboard");
  }

  return context;
}
