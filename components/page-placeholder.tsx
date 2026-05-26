import Link from "next/link";
import { ArrowRight, Construction, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlaceholderStat = {
  label: string;
  value: string;
  helper?: string;
};

type PlaceholderRecord = {
  title: string;
  meta: string;
};

type PagePlaceholderProps = {
  title: string;
  description: string;
  actions?: string[];
  stats?: PlaceholderStat[];
  records?: PlaceholderRecord[];
  ctaHref?: string;
  ctaLabel?: string;
};

export function PagePlaceholder({
  title,
  description,
  actions = [],
  stats = [],
  records = [],
  ctaHref,
  ctaLabel = "前往维护资料",
}: PagePlaceholderProps) {
  return (
    <Card className="border-white/10 bg-white/[0.02] shadow-none">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b border-white/10 pb-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-200">
          <Construction className="size-5" />
        </div>
        <div>
          <CardTitle className="text-base text-white">{title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          {(stats.length
            ? stats.map((item) => ({
                key: item.label,
                title: item.label,
                detail: item.value,
                helper: item.helper,
              }))
            : (actions.length ? actions : ["当前无业务数据", "请先完成基础配置", "随后会展示真实统计"]).map((item) => ({
                key: item,
                title: item,
                detail: "等待数据接入",
                helper: undefined,
              }))).map((item) => (
            <div key={item.key} className="rounded-xl border border-white/10 bg-white/[0.015] p-4">
              <div className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{item.title}</div>
              <div className="mt-2 text-xl font-semibold text-white">{item.detail}</div>
              {item.helper ? <div className="mt-1 text-xs text-muted-foreground">{item.helper}</div> : null}
            </div>
          ))}
        </div>
        <div className="grid gap-3">
          {(records.length
            ? records
            : [
                {
                  title: "当前组织还没有真实记录",
                  meta: "完成导入、生成、审核或发布后，这里会显示最新业务状态。",
                },
              ]).map((item) => (
            <div key={`${item.title}-${item.meta}`} className="rounded-xl border border-white/10 bg-white/[0.015] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Sparkles className="size-4 text-zinc-300" />
                {item.title}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.meta}</p>
            </div>
          ))}
        </div>
        {ctaHref ? (
          <Link className={cn(buttonVariants({ variant: "outline", className: "rounded-lg border-white/10 bg-transparent hover:bg-white/[0.04]" }))} href={ctaHref}>
            {ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <Button variant="outline" className="rounded-lg border-white/10 bg-transparent hover:bg-white/[0.04]">
            保持当前模块骨架
            <ArrowRight className="size-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
