import { AppShell } from "@/components/app-shell";
import { requireAppContext } from "@/lib/auth/guards";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const context = await requireAppContext();

  return (
    <AppShell
      organizationName={context.organization.name}
      userEmail={context.user.email}
      userInitials={context.user.initials}
      userName={context.user.displayName}
      userRole={context.membership.role}
    >
      {children}
    </AppShell>
  );
}
