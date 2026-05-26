import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PagePlaceholder } from "@/components/page-placeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, getOrganizationMembers, getOrganizationProfile } from "@/lib/app/organization-data";
import { requireAppContext } from "@/lib/auth/guards";

function formatRole(role: string) {
  if (role === "admin") return "管理员";
  if (role === "analyst") return "分析员";
  return "成员";
}

function formatStatus(status: string) {
  if (status === "pending_password") return "待设置密码";
  if (status === "disabled") return "已禁用";
  return "正常";
}

export default async function MembersPage() {
  const context = await requireAppContext();
  const [organization, rows] = await Promise.all([
    getOrganizationProfile(context.membership.organization_id),
    getOrganizationMembers(context.membership.organization_id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organization"
        title="组织管理"
        description="这里统一展示组织资料和成员管理信息，方便查看当前组织状态与协作成员。"
        actions={
          <Button className="rounded-2xl">
            <Plus className="size-4" />
            邀请成员
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/10 bg-white/[0.02] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">组织名称</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base font-medium text-white">{organization?.name ?? context.organization.name}</div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.02] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">组织 ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="truncate text-sm text-white">{organization?.id ?? context.organization.id}</div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.02] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">创建时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white">{organization?.created_at ? formatDateTime(organization.created_at) : "暂无记录"}</div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.02] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">当前订阅</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant="secondary" className="border border-white/10 bg-white/[0.03] text-zinc-200">
              {context.subscription.plan === "year" ? "年付套餐" : "月付套餐"}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Stripe Customer：{context.subscription.stripeCustomerId ?? organization?.stripe_customer_id ?? "未绑定"}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-white/8 bg-card/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base text-white">成员管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-white/8">
            <Table>
              <TableHeader>
                <TableRow className="border-white/8 hover:bg-transparent">
                  <TableHead>成员</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((row) => (
                    <TableRow key={row.id} className="border-white/8">
                      <TableCell className="font-medium text-white">{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{formatRole(row.role)}</TableCell>
                      <TableCell>{formatStatus(row.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-white/8">
                    <TableCell className="text-muted-foreground" colSpan={4}>
                      当前组织还没有成员记录。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PagePlaceholder
        title="组织协作状态"
        description="组织资料和成员列表已整合到同一页面，后续继续补邀请链接发送、禁用与强制重置等写操作。"
        stats={[
          { label: "成员总数", value: String(rows.length) },
          { label: "管理员", value: String(rows.filter((row) => row.role === "admin").length) },
          { label: "待激活", value: String(rows.filter((row) => row.status === "pending_password").length) },
        ]}
        records={rows.slice(0, 3).map((row) => ({
          title: `${row.name} · ${formatRole(row.role)}`,
          meta: `${row.email} · ${formatStatus(row.status)}`,
        }))}
      />
    </div>
  );
}
