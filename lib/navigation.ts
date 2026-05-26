import {
  BarChart3,
  Building2,
  Bot,
  FileSpreadsheet,
  Files,
  LayoutDashboard,
  Radar,
  ShieldCheck,
  Sparkles,
  Upload,
  Waypoints,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  group: "启动" | "数据" | "内容" | "分析" | "管理";
  description: string;
};

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "总览",
    icon: LayoutDashboard,
    group: "启动",
    description: "查看组织状态、KPI 和待办",
  },
  {
    href: "/billing",
    label: "订阅状态",
    icon: ShieldCheck,
    group: "管理",
    description: "查看订阅套餐与周期",
  },
  {
    href: "/imports",
    label: "数据导入",
    icon: Upload,
    group: "数据",
    description: "批量导入监测、竞品与回填数据",
  },
  {
    href: "/brand-monitor",
    label: "品牌监测",
    icon: Radar,
    group: "数据",
    description: "查看品牌提及、来源与趋势",
  },
  {
    href: "/competitors",
    label: "竞品洞察",
    icon: Waypoints,
    group: "数据",
    description: "管理和分析竞品洞察条目",
  },
  {
    href: "/statistics",
    label: "统计中心",
    icon: BarChart3,
    group: "数据",
    description: "查看组织级数据汇总",
  },
  {
    href: "/content-engine",
    label: "内容生成",
    icon: Sparkles,
    group: "内容",
    description: "创建图文与脚本生成任务",
  },
  {
    href: "/review",
    label: "内容审核",
    icon: ShieldCheck,
    group: "内容",
    description: "处理敏感词与 AI 改写建议",
  },
  {
    href: "/publish",
    label: "发布任务",
    icon: Files,
    group: "内容",
    description: "管理发布任务与回填结果",
  },
  {
    href: "/analytics",
    label: "效果分析",
    icon: BarChart3,
    group: "分析",
    description: "查看曝光、收录、线索和 ROI",
  },
  {
    href: "/reports",
    label: "明细报表",
    icon: FileSpreadsheet,
    group: "分析",
    description: "筛选并导出业务明细数据",
  },
  {
    href: "/ai-platforms",
    label: "AI 平台",
    icon: Bot,
    group: "管理",
    description: "配置 Key、模型与模块默认策略",
  },
  {
    href: "/accounts/members",
    label: "组织管理",
    icon: Building2,
    group: "管理",
    description: "查看组织资料、成员与协作状态",
  },
];

export const navGroups: NavItem["group"][] = ["启动", "数据", "内容", "分析", "管理"];
