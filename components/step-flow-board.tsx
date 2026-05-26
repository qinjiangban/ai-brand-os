import { ArrowRight, CheckCircle2, CircleDashed, Clock3, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StepStatus = "done" | "active" | "pending";

type StepFlowBoardProps = {
  counts: {
    mentions: number;
    metricEvents: number;
    contentAssets: number;
    pendingReviewItems: number;
    publishJobs: number;
  };
};

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") return <CheckCircle2 className="size-5 text-emerald-300" />;
  if (status === "active") return <Sparkles className="size-5 text-primary" />;
  return <CircleDashed className="size-5 text-muted-foreground" />;
}

export function StepFlowBoard({ counts }: StepFlowBoardProps) {
  const steps: { title: string; desc: string; status: StepStatus }[] = [
    {
      title: "导入数据",
      desc:
        counts.mentions + counts.metricEvents > 0
          ? `已累积 ${counts.mentions + counts.metricEvents} 条数据记录`
          : "尚未导入品牌提及或指标事件数据",
      status: counts.mentions + counts.metricEvents > 0 ? "done" : "pending",
    },
    {
      title: "生成内容",
      desc: counts.contentAssets > 0 ? `已沉淀 ${counts.contentAssets} 个内容资产` : "尚未发起真实内容生成任务",
      status: counts.contentAssets > 0 ? "active" : "pending",
    },
    {
      title: "审核确认",
      desc:
        counts.pendingReviewItems > 0
          ? `还有 ${counts.pendingReviewItems} 个待确认审核项`
          : "当前没有待确认的敏感词审核项",
      status: counts.pendingReviewItems > 0 ? "active" : "done",
    },
    {
      title: "发布回填",
      desc: counts.publishJobs > 0 ? `当前存在 ${counts.publishJobs} 个发布任务` : "尚未创建真实发布任务",
      status: counts.publishJobs > 0 ? "active" : "pending",
    },
    {
      title: "分析沉淀",
      desc:
        counts.metricEvents > 0
          ? `当前已有 ${counts.metricEvents} 条可分析指标事件`
          : "等待回填和指标沉淀后展示分析结果",
      status: counts.metricEvents > 0 ? "done" : "pending",
    },
  ];

  return (
    <Card className="border-white/10 bg-white/[0.02] shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-white/10 pb-4">
        <div>
          <CardTitle className="text-base text-white">流程工作台</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">根据当前组织的真实数据状态展示 GEO 执行闭环。</p>
        </div>
        <Badge className="border border-white/10 bg-white/[0.04] text-zinc-200" variant="secondary">
          当前聚焦：{steps.find((step) => step.status === "active")?.title ?? "基础配置"}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-0 xl:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="relative border-b border-white/10 px-4 py-5 last:border-b-0 xl:border-r xl:border-b-0 last:xl:border-r-0"
          >
            {index < steps.length - 1 ? (
              <ArrowRight className="absolute top-6 -right-2 hidden size-4 text-white/25 xl:block" />
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <StepIcon status={step.status} />
              <span className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                STEP {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-5 space-y-2">
              <h3 className="text-sm font-semibold text-white">{step.title}</h3>
              <p className="text-xs leading-5 text-muted-foreground">{step.desc}</p>
            </div>
            <div className="mt-5 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="size-3.5" />
              {step.status === "done" ? "已完成" : step.status === "active" ? "进行中" : "待处理"}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
