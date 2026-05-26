import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type KpiCardProps = {
  label: string;
  value: string;
  delta: string;
  tone?: "default" | "success" | "warning";
};

const toneMap = {
  default: "bg-white/[0.06] text-zinc-100",
  success: "bg-white/[0.06] text-zinc-100",
  warning: "bg-amber-500/10 text-amber-200",
};

export function KpiCard({ label, value, delta, tone = "default" }: KpiCardProps) {
  return (
    <Card className="border-white/10 bg-white/[0.02] shadow-none">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">{label}</span>
          <Badge className={toneMap[tone]} variant="secondary">
            <ArrowUpRight className="size-3.5" />
            {delta}
          </Badge>
        </div>
        <div className="text-[32px] leading-none font-semibold tracking-tight text-white">{value}</div>
      </CardContent>
    </Card>
  );
}
