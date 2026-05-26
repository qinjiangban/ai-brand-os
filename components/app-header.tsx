"use client";

import Link from "next/link";
import { Bell, Ellipsis } from "lucide-react";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  userRole?: string;
};

function formatUserRole(role?: string) {
  if (!role) return "成员";
  if (role === "admin") return "管理员";
  if (role === "analyst") return "分析员";
  return "成员";
}

export function AppHeader({
  userName,
  userEmail,
  userInitials,
  userRole,
}: AppHeaderProps) {
  const pathname = usePathname();
  const current = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/92 backdrop-blur">
      <div className="flex min-h-12 items-center justify-between gap-3 px-5 py-2 ">
        <div className="w-10 shrink-0" />

        <div className="hidden min-w-0 flex-1 px-4 text-center text-sm font-medium text-white lg:block">
          {current?.label ?? "Overview"}
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="border-white/10 bg-transparent hover:bg-white/[0.04]">
            <Bell className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-white/10 bg-transparent hover:bg-white/[0.04]">
            <Ellipsis className="size-4" />
          </Button>
          <Link
            className={cn(
              "hidden max-w-[172px] items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04] md:flex",
            )}
            href="/settings/profile"
          >

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[13px] font-semibold leading-none text-white">{userName ?? "未命名用户"}</span>
                <Badge variant="secondary" className="h-4 border border-white/10 bg-white/[0.03] px-1.5 text-[9px] text-zinc-300">
                  {formatUserRole(userRole)}
                </Badge>
              </div>
              <div className="mt-0.5 truncate text-[10px] leading-none text-muted-foreground">{userEmail ?? "未登录邮箱"}</div>
            </div>

            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-black">
              {userInitials ?? "U"}
            </div>

          </Link>
        </div>
      </div>
    </header>
  );
}
