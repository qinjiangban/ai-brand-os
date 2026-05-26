import { ReactNode } from "react";

import { AppHeader } from "@/components/app-header";
import { SideNav } from "@/components/side-nav";

type AppShellProps = {
  children: ReactNode;
  organizationName?: string;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  userRole?: string;
};

export function AppShell({
  children,
  organizationName,
  userName,
  userEmail,
  userInitials,
  userRole,
}: AppShellProps) {
  return (
    <div className="h-dvh overflow-hidden bg-background text-foreground">
      <div className="grid h-dvh lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden h-dvh overflow-hidden border-r border-white/10 bg-sidebar lg:sticky lg:top-0 lg:block">
          <SideNav organizationName={organizationName} />
        </aside>
        <main className="flex h-dvh min-w-0 flex-col overflow-hidden">
          <AppHeader
            userEmail={userEmail}
            userInitials={userInitials}
            userName={userName}
            userRole={userRole}
          />
          <div className="app-scrollbar flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-5 py-6 md:px-6 xl:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
