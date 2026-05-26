"use client";

import { useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const USER_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

type JoinedOrganization = {
  id: string;
  name: string;
  role: "admin" | "member" | "analyst";
  status: "active" | "disabled" | "pending_password";
  joinedAt: string;
};

type ProfileSettingsFormProps = {
  userId: string;
  email: string;
  displayName: string;
  phone: string | null;
  createdAt: string;
  organizations: JoinedOrganization[];
};

function formatRole(role: JoinedOrganization["role"]) {
  if (role === "admin") return "管理员";
  if (role === "analyst") return "分析员";
  return "成员";
}

function formatStatus(status: JoinedOrganization["status"]) {
  if (status === "disabled") return "已禁用";
  if (status === "pending_password") return "待设置密码";
  return "正常";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(new Date(value));
}

export function ProfileSettingsForm({ userId, email, displayName, phone, createdAt, organizations }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [editableUserId, setEditableUserId] = useState(userId);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedUserId = editableUserId.trim();

    if (!trimmedName) {
      toast.error("请输入用户名称");
      return;
    }

    if (!trimmedUserId) {
      toast.error("请输入用户 ID");
      return;
    }

    if (!USER_ID_PATTERN.test(trimmedUserId)) {
      toast.error("用户 ID 只能使用英文、数字、下划线或横杠");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: trimmedName,
        userId: trimmedUserId,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setLoading(false);

    if (!response.ok) {
      toast.error(payload?.error ?? "保存失败");
      return;
    }

    toast.success("资料已更新");
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-white/10 bg-white/[0.02] shadow-none">
        <CardHeader>
          <CardTitle className="text-base text-white">编辑用户资料</CardTitle>
          <CardDescription>更新后，左上角账号区域和用户资料页面会同步显示最新的真实用户信息。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="displayName">用户名称</Label>
              <Input id="displayName" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">用户 ID</Label>
              <Input
                id="userId"
                value={editableUserId}
                onChange={(event) => setEditableUserId(event.target.value)}
                pattern="[A-Za-z0-9_-]+"
                required
              />
              <p className="text-xs text-muted-foreground">仅支持英文、数字、下划线和横杠。</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">登录邮箱</Label>
              <Input id="email" value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">电话号码</Label>
              <Input id="phone" value={phone ?? "未绑定电话号码"} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="createdAt">注册年月日</Label>
              <Input id="createdAt" value={formatDate(createdAt)} disabled />
            </div>
            <Button className="rounded-lg" disabled={loading} type="submit">
              {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              保存资料
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.02] shadow-none">
        <CardHeader>
          <CardTitle className="text-base text-white">加入的组织</CardTitle>
          <CardDescription>组织资料已迁移到组织管理页面，这里只保留你当前加入的组织列表。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {organizations.length ? (
            organizations.map((organization) => (
              <div key={organization.id} className="rounded-2xl border border-white/10 bg-white/[0.015] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">{organization.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">组织 ID：{organization.id}</div>
                    <div className="mt-1 text-xs text-muted-foreground">加入时间：{formatDate(organization.joinedAt)}</div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Badge variant="secondary" className="border border-white/10 bg-white/[0.03] text-zinc-200">
                      {formatRole(organization.role)}
                    </Badge>
                    <Badge variant="secondary" className="border border-white/10 bg-white/[0.03] text-zinc-200">
                      {formatStatus(organization.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
              当前还没有可展示的组织记录。
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
