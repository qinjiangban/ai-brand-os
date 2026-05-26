"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { navGroups, navItems } from "@/lib/navigation";

type SideNavProps = {
  organizationName?: string;
};

export function SideNav({ organizationName = "未命名组织" }: SideNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex h-dvh flex-col overflow-hidden">
      <div className="shrink-0 border-b border-white/10 px-4 py-3">
        <button className="inline-flex w-full items-center justify-between gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/[0.04]">
          <span className="truncate font-medium">{organizationName}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>



        <div className="relative mt-3">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 rounded-md border-white/10 bg-white/[0.02] pl-9 text-sm shadow-none"
            placeholder="Find..."
          />
        </div>
      </div>

      <div className="app-scrollbar flex-1 overflow-y-auto overscroll-contain px-2 py-3">
        {navGroups.map((group) => {
          const items = navItems.filter((item) => item.group === group);

          if (!items.length) {
            return null;
          }

          return (
            <div key={group} className="mb-3.5 space-y-1">
              <div className="flex items-center justify-between px-2 pb-0.5">
                <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">{group}</span>
                {group === "内容" ? (
                  <Badge variant="secondary" className="h-4 border border-white/10 bg-white/[0.03] px-1.5 text-[9px] text-zinc-300">
                    Core
                  </Badge>
                ) : null}
              </div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white",
                        active && "bg-white/[0.08] text-white",
                      )}
                    >
                      <span className={cn("flex size-4 items-center justify-center text-zinc-500", active && "text-white")}>
                        <Icon className="size-4" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
